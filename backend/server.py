#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Spark Chat 文件夹版服务端。

纯 Python 标准库 HTTP 服务 + 进程内 llama.cpp 推理，不创建任何新 exe。
前端由本服务同源托管，接口形状保持与原后端一致（{success,data} / SSE）。
"""
from __future__ import annotations

import json
import re
import sys
import threading
import time
import uuid
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

sys.path.insert(0, str(Path(__file__).resolve().parent))
from llama_engine import Engine

ROOT = Path(__file__).resolve().parent.parent
FRONTEND = ROOT / "SparkChat" / "frontend"
DATA = ROOT / "SparkChat" / "data"
CHATS = DATA / "chats"
CONFIG_FILE = DATA / "config" / "config.json"
LOG_DIR = DATA / "logs"
MODEL_ID = "spark-x2.6-4b"
DISPLAY = "Spark-X2.6-4B"
ENGINE_VERSION = "llama.cpp b12128 (Vulkan / RTX 5070 Ti, in-process)"
PORT = 8000

for d in (CHATS, CONFIG_FILE.parent, LOG_DIR):
    d.mkdir(parents=True, exist_ok=True)

engine: Engine | None = None
engine_lock = threading.Lock()
STARTED = time.time()


def log(msg: str) -> None:
    line = "[%s] %s\n" % (time.strftime("%H:%M:%S"), msg)
    with open(LOG_DIR / "server.log", "a", encoding="utf-8") as f:
        f.write(line)
    print(line.rstrip(), flush=True)


def jb(obj) -> bytes:
    return json.dumps(obj, ensure_ascii=False).encode("utf-8")


def ok(data):
    return {"success": True, "data": data}


def load_conv(cid: str):
    p = CHATS / (cid + ".json")
    if not p.exists():
        return None
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except Exception:
        return None


def save_conv(conv) -> None:
    conv["updated_at"] = time.time()
    (CHATS / (conv["id"] + ".json")).write_text(
        json.dumps(conv, ensure_ascii=False, indent=2), encoding="utf-8")


def list_conv():
    out = []
    for p in CHATS.glob("*.json"):
        try:
            c = json.loads(p.read_text(encoding="utf-8"))
            out.append({
                "id": c["id"], "title": c.get("title", "新对话"), "model": MODEL_ID,
                "created_at": c.get("created_at", 0), "updated_at": c.get("updated_at", 0),
                "message_count": len(c.get("messages", [])),
            })
        except Exception:
            pass
    return sorted(out, key=lambda x: x["updated_at"], reverse=True)


def read_config():
    cfg = {}
    if CONFIG_FILE.exists():
        try:
            cfg = json.loads(CONFIG_FILE.read_text(encoding="utf-8")) or {}
        except Exception:
            cfg = {}
    cfg.setdefault("model", MODEL_ID)
    cfg.setdefault("host", "127.0.0.1")
    cfg.setdefault("port", PORT)
    cfg.setdefault("theme", "light")
    cfg.setdefault("language", "zh-CN")
    cfg.setdefault("max_tokens", 512)
    cfg.setdefault("timeout", 120)
    cfg.setdefault("spark_base_url", "in-process (no HTTP hop)")
    return cfg


class Handler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def log_message(self, fmt, *args):
        pass

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")

    def _reply(self, body, status=200, ctype="application/json; charset=utf-8"):
        data = jb(body) if isinstance(body, (dict, list)) else body
        self.send_response(status)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self._cors()
        self.end_headers()
        try:
            self.wfile.write(data)
        except (BrokenPipeError, ConnectionResetError):
            pass

    def do_OPTIONS(self):
        """预览面板运行在别的端口时，浏览器会先发 CORS 预检。"""
        self.send_response(204)
        self.send_header("Content-Length", "0")
        self._cors()
        self.end_headers()

    def _body(self):
        n = int(self.headers.get("Content-Length") or 0)
        if not n:
            return {}
        try:
            return json.loads(self.rfile.read(n).decode("utf-8"))
        except Exception:
            return {}

    def do_GET(self):
        self._route("GET")

    def do_POST(self):
        self._route("POST")

    def do_PATCH(self):
        self._route("PATCH")

    def do_DELETE(self):
        self._route("DELETE")

    def _route(self, method):
        path = urlparse(self.path).path
        try:
            # 同源静态页面
            if path in ("/", "/index.html"):
                p = FRONTEND / "index.html"
                return self._reply(p.read_bytes() if p.exists() else b"no frontend",
                                   200, "text/html; charset=utf-8")
            if path.startswith("/assets/"):
                p = FRONTEND / path.lstrip("/")
                if p.is_file():
                    ctype = "application/javascript" if p.suffix == ".js" else "text/css"
                    return self._reply(p.read_bytes(), 200, ctype + "; charset=utf-8")
                return self._reply({"error": "not found"}, 404)

            if path == "/health":
                return self._reply({"status": "ok", "version": "3.2.0-folder",
                                    "gateway_running": True, "api_key_configured": False,
                                    "timestamp": time.time()})
            if path == "/status":
                return self._reply(ok({"models": 1, "timestamp": time.time()}))
            if path == "/runtime-status.json":
                return self._reply({
                    "backend": "vulkan", "backendLabel": "Vulkan · RTX 5070 Ti",
                    "engine": ENGINE_VERSION, "model": "Spark-X2.6-4B-Q4_K_M.gguf",
                    "displayName": DISPLAY, "modelId": MODEL_ID,
                    "baseUrl": "in-process", "ready": engine is not None,
                    "profile": "fast", "startedAt": STARTED,
                })

            if path == "/api/models":
                return self._reply(ok([{
                    "id": MODEL_ID, "name": DISPLAY, "provider": "spark",
                    "capability": "balanced",
                }]))
            if path == "/api/config":
                if method == "POST":
                    cfg = read_config()
                    cfg.update({k: v for k, v in self._body().items() if k != "access_token"})
                    CONFIG_FILE.write_text(json.dumps(cfg, ensure_ascii=False, indent=2),
                                           encoding="utf-8")
                    return self._reply(ok(cfg))
                return self._reply(ok(read_config()))
            if path == "/api/config/test":
                return self._reply(ok({"ok": True, "message": "内置引擎已就绪（进程内推理）"}))

            if path == "/api/conversations":
                if method == "POST":
                    cid = uuid.uuid4().hex[:12]
                    c = {"id": cid, "title": "新对话", "messages": [],
                         "created_at": time.time(), "updated_at": time.time()}
                    save_conv(c)
                    return self._reply(ok(c))
                return self._reply(ok(list_conv()))

            if path.startswith("/api/conversations/"):
                cid = path.rsplit("/", 1)[-1]
                c = load_conv(cid)
                if not c:
                    return self._reply({"success": False, "error": "会话不存在"}, 404)
                if method == "DELETE":
                    (CHATS / (cid + ".json")).unlink(missing_ok=True)
                    return self._reply({"success": True, "message": "会话已删除"})
                if method == "PATCH":
                    body = self._body()
                    if body.get("title"):
                        c["title"] = str(body["title"])[:50]
                    save_conv(c)
                return self._reply(ok(c))

            if path == "/api/chat/stream" and method == "POST":
                return self._chat_stream(self._body())
            if path == "/api/chat" and method == "POST":
                return self._chat_once(self._body())

            # 其余面板返回空数据，保证前端不报错
            empty = {
                "/api/kb": [], "/api/tasks": [], "/api/plugins": [], "/api/backup": [],
                "/api/tools": {"tools": [], "deps": {}},
                "/api/kb/status": {"mode": "bm25", "docs": 0, "chunks": 0},
                "/api/kb/search": [],
                "/api/cleanup": {"space": {"total": 0}, "disk_free_ratio": 0.9},
                "/api/logs": {"logs": [], "total": 0, "page": 1, "page_size": 60},
                "/api/agents": [{"id": "general", "name": "通用助手", "emoji": "💬",
                                 "desc": "日常问答、信息整理、泛用写作。"}],
            }
            if path.split("?")[0] in empty:
                return self._reply(ok(empty[path.split("?")[0]]))
            return self._reply({"success": False, "error": "API not found"}, 404)
        except Exception as e:
            log("请求异常 %s %s: %s" % (method, path, e))
            return self._reply({"success": False, "error": str(e)}, 500)

    def _prepare(self, body):
        msg = (body.get("message") or "").strip()
        cid = body.get("conversation_id") or uuid.uuid4().hex[:12]
        c = load_conv(cid) or {"id": cid, "title": (msg[:24] or "新对话"),
                               "messages": [], "created_at": time.time()}
        # 清洗历史：剪掉模型曾续写出来的角色/模板片段，避免一次污染继续滚雪球
        cut_markers = (
            "\nuser\n", "\nassistant\n",
            "<|User|>", "<|Bot|>", "<|System|>",
            "<｜start▁of▁sentence｜>", "<｜end▁of▁sentence｜>",
        )
        special_tokens = ("<|im_end|>", "<|im_start|>", "<|endoftext|>")
        clean = []
        for m in c.get("messages", []):
            t = (m.get("content") or "").strip()
            for bad in special_tokens:
                t = t.replace(bad, "")
            cuts = [t.find(marker) for marker in cut_markers if t.find(marker) >= 0]
            if cuts:
                t = t[:min(cuts)]
            t = re.sub(r"(?m)^\s*(user|assistant)\s*$", "", t).strip()
            if t:
                clean.append({"role": m.get("role") or "user", "content": t})
        clean.append({"role": "user", "content": msg})
        c["messages"] = clean
        return c, int(body.get("max_tokens") or 512)

    def _chat_stream(self, body):
        c, max_tokens = self._prepare(body)
        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream; charset=utf-8")
        self.send_header("Cache-Control", "no-cache")
        self.send_header("Connection", "close")
        self._cors()
        self.end_headers()

        def emit(ev):
            self.wfile.write(b"data: " + jb(ev) + b"\n\n")
            self.wfile.flush()

        emit({"type": "meta", "conversation_id": c["id"], "title": c["title"],
              "model": MODEL_ID})
        chunks = []
        specials = (
            "<｜start▁of▁sentence｜>", "<｜end▁of▁sentence｜>",
            "<|System|>", "<|User|>", "<|Bot|>",
            "<|im_start|>user", "<|im_start|>assistant",
            "<|im_end|>", "<|im_start|>", "<|endoftext|>",
            "\nuser\n", "\nassistant\n",
        )
        held = ""

        def on_token(s):
            nonlocal held
            held += s
            for sp in specials:
                held = held.replace(sp, "")
            # 尾部可能是特殊 token 的前缀，先攒着不发送
            hold = 0
            for sp in specials:
                for k in range(1, len(sp)):
                    if held.endswith(sp[:k]):
                        hold = max(hold, k)
            part = held[:-hold] if hold else held
            held = held[-hold:] if hold else ""
            if part:
                chunks.append(part)
                emit({"type": "delta", "delta": part})

        def should_stop(s):
            # 模板正确后正常不会出现这些标记；一旦出现说明模型开始续写下一轮，
            # 立即停止，避免把角色标签写进回复
            return any(marker in s for marker in (
                "\nuser\n", "\nassistant\n",
                "<|User|>", "<|Bot|>", "<|System|>",
                "<｜start▁of▁sentence｜>", "<｜end▁of▁sentence｜>",
            ))

        try:
            with engine_lock:
                text = engine.generate(c["messages"], max_tokens=max_tokens,
                                       on_token=on_token, stop=should_stop)
        except Exception as e:
            log("生成失败: %s" % e)
            try:
                emit({"type": "error", "code": "SEND_ERROR", "message": str(e)})
            except Exception:
                pass
            return
        answer = "".join(chunks)
        if not answer:
            for sp in specials:
                text = text.replace(sp, "")
            answer = text
        c["messages"].append({"role": "assistant", "content": answer})
        save_conv(c)
        try:
            emit({"type": "done", "conversation_id": c["id"], "title": c["title"]})
        except (BrokenPipeError, ConnectionResetError):
            pass

    def _chat_once(self, body):
        c, max_tokens = self._prepare(body)
        with engine_lock:
            text = engine.generate(c["messages"], max_tokens=max_tokens)
        c["messages"].append({"role": "assistant", "content": text})
        save_conv(c)
        return self._reply(ok({"conversation_id": c["id"], "title": c["title"],
                               "model": MODEL_ID, "response": text}))


def main():
    global engine
    log("加载内置模型中…")
    t = time.time()
    engine = Engine(n_ctx=32768)
    log("模型就绪 %.1fs | vocab=%d | %s" % (time.time() - t, engine.n_vocab, ENGINE_VERSION))
    srv = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    srv.daemon_threads = True
    log("Spark Chat 文件夹版已启动：http://localhost:%d" % PORT)
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        srv.server_close()
        engine.close()
        log("已退出。")


if __name__ == "__main__":
    main()
