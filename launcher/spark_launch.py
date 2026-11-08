#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Spark Chat 自包含启动器：内置 llama.cpp 引擎 + 内置 GGUF 模型。

约束（设计前提）：
- 只使用项目目录内的 runtime/ 与 mood/，不读系统 PATH 里的 Ollama / llama.cpp
- 不写系统目录：CUDA 缓存、子进程 TEMP、全部日志都落在项目内
- 所有路径由 __file__ 推导，整个目录可整体移动 / 封装
- 先拉起内置推理服务并确认就绪，再注入后端配置并启动后端
- 模型进程常驻；退出时按序回收全部子进程

--dry-run 只做探测与打印，不启动任何进程、不写任何文件，
用于系统策略限制 exe 运行时验证逻辑是否正确。
"""
from __future__ import annotations

import argparse
import json
import os
import re
import socket
import ssl
import subprocess
import sys
import time
import urllib.request
import webbrowser
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RUNTIME_DIR = ROOT / "runtime"
MODEL_FILE = ROOT / "mood" / "Spark-X2.6-4B-Q4_K_M.gguf"
APP_DIR = ROOT / "SparkChat"
BACKEND_EXE = APP_DIR / "SparkChat.exe"
FRONTEND_DIR = APP_DIR / "frontend"
CONFIG_FILE = APP_DIR / "data" / "config" / "config.json"
STATUS_FILE = FRONTEND_DIR / "runtime-status.json"
LOG_DIR = APP_DIR / "data" / "logs"
TMP_DIR = RUNTIME_DIR / "_tmp"
CUDA_CACHE = RUNTIME_DIR / "_cuda_cache"

ENGINE_VERSION = "llama.cpp b12128"
DISPLAY_NAME = "Spark-X2.6-4B"
# 现有后端注册表里已存在的 ID；实际请求会被 spark_base_url 指向内置引擎
MODEL_ID = "spark-x2.5-4b"
DEFAULT_ENGINE_PORT = 11435
APP_PORT = 8000
BACKENDS = [("cuda13", "CUDA 13.4"), ("vulkan", "Vulkan"), ("cpu", "CPU")]
LABELS = dict(BACKENDS)


def log(msg: str) -> None:
    print("[%s] %s" % (datetime.now().strftime("%H:%M:%S"), msg), flush=True)


def no_proxy_opener():
    """本机回环请求不能走系统 HTTP 代理（会被代理 502 掉）。"""
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    return urllib.request.build_opener(
        urllib.request.ProxyHandler({}), urllib.request.HTTPSHandler(context=ctx)
    )


def detect_backend(forced: str | None = None) -> str:
    if forced:
        return forced
    try:
        r = subprocess.run(
            ["nvidia-smi", "--query-gpu=name,driver_version", "--format=csv,noheader"],
            capture_output=True, text=True, timeout=8,
        )
        if r.returncode == 0 and r.stdout.strip():
            smi = subprocess.run(["nvidia-smi"], capture_output=True, text=True, timeout=8)
            m = re.search(r"CUDA UMD Version:\s*(\d+)\.(\d+)", smi.stdout)
            if m and int(m.group(1)) >= 13:
                return "cuda13"
    except (OSError, subprocess.TimeoutExpired):
        pass
    if (RUNTIME_DIR / "vulkan" / "llama-server.exe").exists():
        return "vulkan"
    return "cpu"


def free_port(start: int, tries: int = 12) -> int:
    for port in range(start, start + tries):
        with socket.socket() as s:
            try:
                s.bind(("127.0.0.1", port))
                return port
            except OSError:
                continue
    raise RuntimeError("找不到可用端口（%d 起 %d 个）" % (start, tries))


def engine_cmd(backend: str, port: int, profile: str) -> list[str]:
    exe = RUNTIME_DIR / backend / "llama-server.exe"
    args = [
        str(exe), "-m", str(MODEL_FILE),
        "--host", "127.0.0.1", "--port", str(port),
        "--jinja", "--reasoning", "off",
    ]
    if backend == "cpu":
        args += ["-c", "8192"]
        return args
    args += ["-ngl", "all", "-c", "16384" if profile == "fast" else "8192"]
    if profile == "fast":
        args += [
            "-fa", "on", "-b", "2048", "-ub", "512", "-np", "1",
            "-ctk", "q8_0", "-ctv", "q8_0",
        ]
    return args


def child_env() -> dict:
    """把子进程可能用到的临时目录全部钉在项目内。"""
    TMP_DIR.mkdir(parents=True, exist_ok=True)
    CUDA_CACHE.mkdir(parents=True, exist_ok=True)
    env = os.environ.copy()
    env["TMP"] = str(TMP_DIR)
    env["TEMP"] = str(TMP_DIR)
    env["CUDA_CACHE_PATH"] = str(CUDA_CACHE)
    env.pop("OLLAMA_HOST", None)
    return env


def wait_health(url: str, timeout: float, proc: subprocess.Popen | None = None,
                label: str = "服务") -> bool:
    opener = no_proxy_opener()
    start = time.time()
    deadline = start + timeout
    next_report = start + 15
    while time.time() < deadline:
        if proc is not None and proc.poll() is not None:
            return False
        try:
            with opener.open(url, timeout=2) as resp:
                if resp.status == 200:
                    return True
        except Exception:
            pass
        now = time.time()
        if now >= next_report:
            log("%s 加载中…（已等待 %.0f 秒）" % (label, now - start))
            next_report = now + 15
        time.sleep(0.5)
    return False


def write_config(port: int) -> tuple:
    """保留现有配置的所有键，只注入内置推理端点与内部模型 ID。"""
    CONFIG_FILE.parent.mkdir(parents=True, exist_ok=True)
    cfg = {}
    if CONFIG_FILE.exists():
        try:
            cfg = json.loads(CONFIG_FILE.read_text(encoding="utf-8")) or {}
        except Exception:
            cfg = {}
    before = cfg.get("spark_base_url")
    cfg["spark_base_url"] = "http://127.0.0.1:%d/v1" % port
    cfg["model"] = MODEL_ID
    tmp = CONFIG_FILE.with_suffix(".tmp")
    tmp.write_text(json.dumps(cfg, ensure_ascii=False, indent=2), encoding="utf-8")
    tmp.replace(CONFIG_FILE)
    return before, cfg["spark_base_url"]


def write_status(backend: str, port: int, ready: bool, profile: str) -> None:
    FRONTEND_DIR.mkdir(parents=True, exist_ok=True)
    data = {
        "backend": backend,
        "backendLabel": LABELS.get(backend, backend),
        "engine": ENGINE_VERSION,
        "model": MODEL_FILE.name,
        "displayName": DISPLAY_NAME,
        "modelId": MODEL_ID,
        "baseUrl": "http://127.0.0.1:%d/v1" % port,
        "ready": ready,
        "profile": profile,
        "updatedAt": datetime.now().isoformat(timespec="seconds"),
    }
    tmp = STATUS_FILE.with_name("runtime-status.tmp")
    tmp.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    tmp.replace(STATUS_FILE)


SAC_BLOCK_CODES = {3236495362, -1058471934}


def probe_engine(backend: str) -> str | None:
    """快速自检内置 exe 能否被系统放行。

    Smart App Control / WDAC 拦截未签名 exe 时，进程会立即以特征码退出且
    没有任何输出。提前识别，避免白等三轮模型加载超时。
    """
    exe = RUNTIME_DIR / backend / "llama-server.exe"
    try:
        r = subprocess.run(
            [str(exe), "--version"], cwd=str(exe.parent),
            capture_output=True, timeout=12,
        )
    except subprocess.TimeoutExpired:
        log("警告：引擎自检超时，仍继续尝试启动")
        return None
    except OSError as e:
        return "无法执行内置引擎：%s" % e
    if r.returncode == 0:
        return None
    if r.returncode in SAC_BLOCK_CODES or (
        not r.stdout and not r.stderr and r.returncode > 2 ** 31
    ):
        return (
            "系统应用控制策略（Smart App Control / WDAC）阻止了未签名的内置 exe，"
            "退出码 %s。\n  处理：Windows 安全中心 → 应用和浏览器控制 → 智能应用控制，"
            "或为 exe 做正式代码签名。此项属于系统设置，需你本人决定。" % r.returncode
        )
    log("警告：引擎自检退出码 %s，仍继续尝试启动" % r.returncode)
    return None


def preflight() -> None:
    if not MODEL_FILE.exists():
        raise SystemExit("模型文件不存在：%s" % MODEL_FILE)
    if not BACKEND_EXE.exists():
        raise SystemExit("后端程序不存在：%s" % BACKEND_EXE)
    missing = [b for b, _ in BACKENDS if not (RUNTIME_DIR / b / "llama-server.exe").exists()]
    if missing:
        raise SystemExit("内置推理引擎缺失：%s" % ", ".join(missing))


def main() -> int:
    ap = argparse.ArgumentParser(description="Spark Chat 内置模型版启动器")
    ap.add_argument("--dry-run", action="store_true", help="只探测与打印，不启动进程、不写文件")
    ap.add_argument("--backend", choices=[b for b, _ in BACKENDS], help="强制指定硬件后端")
    ap.add_argument("--port", type=int, default=DEFAULT_ENGINE_PORT, help="内置推理服务端口")
    ap.add_argument("--profile", choices=["fast", "safe"], default="fast", help="参数档位")
    ap.add_argument("--no-browser", action="store_true", help="不自动打开浏览器")
    ap.add_argument("--no-app", action="store_true", help="只启动内置引擎，不启动现有后端")
    args = ap.parse_args()

    preflight()
    backend = detect_backend(args.backend)
    port = args.port
    cmd = engine_cmd(backend, port, args.profile)

    if args.dry_run:
        print("=== DRY RUN（不会启动进程、不会写文件）===")
        print("项目根        :", ROOT)
        print("模型          : %s (%.2f GiB)" % (MODEL_FILE, MODEL_FILE.stat().st_size / 1024 ** 3))
        print("检测到后端    : %s / %s" % (backend, LABELS[backend]))
        print("推理端口      : %d (127.0.0.1)" % port)
        print("参数档位      :", args.profile)
        print("引擎命令      :", subprocess.list2cmdline(cmd))
        print("注入配置      : %s -> spark_base_url=http://127.0.0.1:%d/v1, model=%s"
              % (CONFIG_FILE, port, MODEL_ID))
        print("状态文件      :", STATUS_FILE)
        print("后端程序      :", BACKEND_EXE, "" if args.no_app else "(将启动)")
        print("日志目录      :", LOG_DIR)
        print("临时/CUDA缓存 :", TMP_DIR, "/", CUDA_CACHE, "(均在项目内)")
        print("=== DRY RUN OK ===")
        return 0

    blocked = probe_engine(backend)
    if blocked:
        log("预检失败：" + blocked)
        return 1

    LOG_DIR.mkdir(parents=True, exist_ok=True)
    env = child_env()
    engine = None
    engine_log = None
    app_proc = None
    app_log = None
    chosen = backend
    profile = args.profile

    # 降级链：首选后端 fast → 首选后端 safe → CPU safe
    candidates = []
    for b, p in [(backend, args.profile), (backend, "safe")]:
        if (b, p) not in candidates:
            candidates.append((b, p))
    if backend != "cpu":
        candidates.append(("cpu", "safe"))

    try:
        for b, p in candidates:
            log("启动内置引擎：%s / %s，端口 %d" % (LABELS[b], p, port))
            c = engine_cmd(b, port, p)
            engine_log = open(LOG_DIR / "llama-server.log", "a", encoding="utf-8", errors="replace")
            try:
                engine = subprocess.Popen(
                    c, cwd=str(RUNTIME_DIR / b), env=env,
                    stdout=engine_log, stderr=subprocess.STDOUT,
                )
            except OSError as e:
                log("引擎启动失败：%s" % e)
                engine_log.close()
                engine = None
                continue
            if wait_health("http://127.0.0.1:%d/health" % port, 180, engine, "内置引擎"):
                chosen, profile = b, p
                log("引擎就绪：%s / %s" % (LABELS[b], p))
                break
            log("引擎未就绪（进程退出或加载超时），尝试下一档；日志见 %s" % (LOG_DIR / "llama-server.log"))
            if engine.poll() is None:
                engine.terminate()
                try:
                    engine.wait(timeout=8)
                except subprocess.TimeoutExpired:
                    engine.kill()
            engine_log.close()
            engine = None
        else:
            log("全部后端均无法启动，已停止。请查看 %s" % (LOG_DIR / "llama-server.log"))
            return 1

        before, url = write_config(port)
        log("已注入后端配置：spark_base_url %s -> %s" % (before, url))
        write_status(chosen, port, True, profile)

        if not args.no_app:
            app_log = open(LOG_DIR / "sparkchat-backend.log", "a", encoding="utf-8", errors="replace")
            try:
                app_proc = subprocess.Popen(
                    [str(BACKEND_EXE)], cwd=str(APP_DIR), env=env,
                    stdout=app_log, stderr=subprocess.STDOUT,
                )
            except OSError as e:
                log("后端启动失败：%s（可能是系统应用控制策略阻止了未签名 exe）" % e)
                app_proc = None
                app_log.close()
            if app_proc and wait_health("http://127.0.0.1:%d/health" % APP_PORT, 60, app_proc, "后端服务"):
                log("后端就绪：http://localhost:%d" % APP_PORT)
            else:
                log("后端未就绪，内置推理引擎仍在运行；请查看 %s"
                    % (LOG_DIR / "sparkchat-backend.log"))

        if not args.no_browser:
            webbrowser.open("http://localhost:%d" % APP_PORT)
        log("就绪。模型进程常驻，按 Ctrl+C 退出并回收全部子进程。")

        while True:
            time.sleep(1)
            if engine.poll() is not None:
                log("内置引擎意外退出，停止服务。日志见 %s" % (LOG_DIR / "llama-server.log"))
                break
    except KeyboardInterrupt:
        log("正在退出…")
    finally:
        try:
            write_status(chosen, port, False, profile)
        except Exception:
            pass
        for p in (app_proc, engine):
            if p is not None and p.poll() is None:
                p.terminate()
                try:
                    p.wait(timeout=8)
                except subprocess.TimeoutExpired:
                    p.kill()
        for fh in (engine_log, app_log):
            if fh and not fh.closed:
                fh.close()
        log("全部子进程已回收。")
    return 0


if __name__ == "__main__":
    sys.exit(main())
