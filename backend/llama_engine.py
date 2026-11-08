#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""纯 Python 推理引擎：ctypes 直调项目内置的 CUDA 版 llama.cpp (b12128)。

全程在同一个 Python 进程内完成，不创建任何新的 exe 进程。
- 所有二进制来自 runtime/cuda13/，模型来自 mood/
- 结构体采用「官方默认值 + 精确偏移改写」，避免手写完整布局带来的版本风险
- CUDA 缓存、日志均落在项目目录内
"""
from __future__ import annotations

import array
import ctypes
import os
from ctypes import (CDLL, POINTER, Structure, byref, c_bool, c_char_p,
                    c_float, c_int32, c_size_t, c_ubyte, c_uint32, c_void_p,
                    create_string_buffer, memmove)
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
# CUDA 13.4 包在本机初始化后端时抛 C++ 异常（0xe06d7363），扫描器会跳过它并
# 静默回退到 CPU。Vulkan 后端可正常注册 RTX 5070 Ti，权重会真正进入显存。
DLL_DIR = ROOT / "runtime" / "vulkan"
MODEL_PATH = ROOT / "mood" / "Spark-X2.6-4B-Q4_K_M.gguf"


class _Params(Structure):
    """不透明缓冲，用于承接按值传递/返回的 llama_*_params 结构。"""
    _fields_ = [("raw", c_ubyte * 512)]


class _Batch(Structure):
    """不透明缓冲，用于 llama_batch_get_one / llama_decode。"""
    _fields_ = [("raw", c_ubyte * 256)]


class ChatMessage(Structure):
    _fields_ = [("role", c_char_p), ("content", c_char_p)]


class Engine:
    def __init__(self, n_ctx: int = 8192, n_gpu_layers: int = -1,
                 dll_dir: Path = DLL_DIR, model_path: Path = MODEL_PATH):
        dll_dir = Path(dll_dir)
        model_path = Path(model_path)
        if not model_path.exists():
            raise FileNotFoundError("模型不存在：%s" % model_path)
        os.add_dll_directory(str(dll_dir))
        cache = ROOT / "runtime" / "_cuda_cache"
        cache.mkdir(parents=True, exist_ok=True)
        os.environ.setdefault("CUDA_CACHE_PATH", str(cache))

        self.L = CDLL(str(dll_dir / "llama.dll"))
        self._bind()
        # b12128 起必须先注册后端 DLL（含 ggml-cuda.dll），
        # 否则模型加载会报 "no backends are loaded"
        self.G = CDLL(str(dll_dir / "ggml.dll"))
        self.G.ggml_backend_load_all_from_path.argtypes = [c_char_p]
        self.G.ggml_backend_load_all_from_path.restype = None
        self.G.ggml_backend_load_all_from_path(str(dll_dir).encode("utf-8"))
        self.L.llama_backend_init()

        mp = self.L.llama_model_default_params()
        # struct llama_model_params: devices(0), tensor_buft_overrides(8), n_gpu_layers(16)
        memmove(byref(mp, 16), byref(c_int32(n_gpu_layers)), 4)
        self.model = self.L.llama_model_load_from_file(
            str(model_path).encode("utf-8"), mp)
        if not self.model:
            raise RuntimeError("llama_model_load_from_file 返回空指针")

        cp = self.L.llama_context_default_params()
        # struct llama_context_params: n_ctx(0), n_batch(4), n_ubatch(8)
        memmove(byref(cp, 0), byref(c_uint32(n_ctx)), 4)
        memmove(byref(cp, 4), byref(c_uint32(2048)), 4)
        memmove(byref(cp, 8), byref(c_uint32(512)), 4)
        self.ctx = self.L.llama_init_from_model(self.model, cp)
        if not self.ctx:
            raise RuntimeError("llama_init_from_model 返回空指针")

        self.vocab = self.L.llama_model_get_vocab(self.model)
        self.n_vocab = int(self.L.llama_vocab_n_tokens(self.vocab))
        tmpl = self.L.llama_model_chat_template(self.model, None)
        self.template = tmpl.decode("utf-8", "replace") if tmpl else None
        self.n_ctx = n_ctx

    def _bind(self) -> None:
        L, P, B = self.L, _Params, _Batch
        L.llama_backend_init.argtypes = []
        L.llama_backend_init.restype = None
        L.llama_backend_free.argtypes = []
        L.llama_backend_free.restype = None

        L.llama_model_default_params.argtypes = []
        L.llama_model_default_params.restype = P
        L.llama_context_default_params.argtypes = []
        L.llama_context_default_params.restype = P
        L.llama_model_load_from_file.argtypes = [c_char_p, P]
        L.llama_model_load_from_file.restype = c_void_p
        L.llama_init_from_model.argtypes = [c_void_p, P]
        L.llama_init_from_model.restype = c_void_p
        L.llama_model_get_vocab.argtypes = [c_void_p]
        L.llama_model_get_vocab.restype = c_void_p
        L.llama_vocab_n_tokens.argtypes = [c_void_p]
        L.llama_vocab_n_tokens.restype = c_int32
        L.llama_model_chat_template.argtypes = [c_void_p, c_char_p]
        L.llama_model_chat_template.restype = c_char_p
        L.llama_chat_apply_template.argtypes = [
            c_char_p, POINTER(ChatMessage), c_size_t, c_bool, c_char_p, c_int32]
        L.llama_chat_apply_template.restype = c_int32

        L.llama_tokenize.argtypes = [
            c_void_p, c_char_p, c_int32, POINTER(c_int32), c_int32, c_bool, c_bool]
        L.llama_tokenize.restype = c_int32
        L.llama_batch_get_one.argtypes = [POINTER(c_int32), c_int32]
        L.llama_batch_get_one.restype = B
        L.llama_decode.argtypes = [c_void_p, B]
        L.llama_decode.restype = c_int32
        L.llama_get_memory.argtypes = [c_void_p]
        L.llama_get_memory.restype = c_void_p
        L.llama_memory_clear.argtypes = [c_void_p, c_bool]
        L.llama_memory_clear.restype = None
        L.llama_get_logits.argtypes = [c_void_p]
        L.llama_get_logits.restype = POINTER(c_float)
        L.llama_token_to_piece.argtypes = [
            c_void_p, c_int32, c_char_p, c_int32, c_int32, c_bool]
        L.llama_token_to_piece.restype = c_int32
        L.llama_token_is_eog.argtypes = [c_void_p, c_int32]
        L.llama_token_is_eog.restype = c_bool
        L.llama_free.argtypes = [c_void_p]
        L.llama_free.restype = None
        L.llama_free_model.argtypes = [c_void_p]
        L.llama_free_model.restype = None

    def _spark_template(self, messages: list[dict]) -> bytes:
        """Spark-X2.6 官方模板的最小可靠渲染（非思考模式）。"""
        has_system = any((m.get("role") or "user") == "system" for m in messages)
        parts = []
        if not has_system:
            parts.append("<｜start▁of▁sentence｜><|System|>\n你是 Spark Chat，一个有帮助的本地智能助手。请使用简体中文自然、简洁、准确地回答用户的问题。<｜end▁of▁sentence｜>")
        for m in messages:
            role = m.get("role") or "user"
            content = m.get("content") or ""
            if role == "system":
                parts.append("<｜start▁of▁sentence｜><|System|>\n" + content + "<｜end▁of▁sentence｜>")
            elif role == "assistant":
                parts.append("<｜start▁of▁sentence｜><|Bot|></think>" + content + "<｜end▁of▁sentence｜>")
            else:
                parts.append("<｜start▁of▁sentence｜><|User|>" + content + "<｜end▁of▁sentence｜>")
        parts.append("<｜start▁of▁sentence｜><|Bot|></think>")
        return "".join(parts).encode("utf-8")

    def apply_template(self, messages: list[dict]) -> bytes:
        # Spark-X2.6 的官方模板带 <|System|>/<|User|>/<|Bot|>，
        # llama.cpp 的通用 apply_template 处理不了，必须手工渲染。
        if self.template and "<|Bot|>" in self.template:
            return self._spark_template(messages)
        # 其他模型：优先用模型自带的 Jinja 模板
        if self.template:
            arr = (ChatMessage * len(messages))()
            for i, m in enumerate(messages):
                arr[i].role = (m.get("role") or "user").encode("utf-8")
                arr[i].content = (m.get("content") or "").encode("utf-8")
            buf = create_string_buffer(65536)
            n = self.L.llama_chat_apply_template(
                self.template.encode("utf-8"), arr, len(messages), True, buf, len(buf))
            if 0 < n <= len(buf):
                return buf.raw[:n]
        # 兜底：Qwen3 系通用的 ChatML 格式
        parts = []
        for m in messages:
            parts.append("<|im_start|>%s\n%s<|im_end|>\n"
                         % (m.get("role") or "user", m.get("content") or ""))
        parts.append("<|im_start|>assistant\n")
        return "".join(parts).encode("utf-8")

    def _piece(self, token: int) -> str:
        buf = create_string_buffer(64)
        n = self.L.llama_token_to_piece(self.vocab, c_int32(token), buf, len(buf), 0, False)
        if n <= 0:
            return ""
        return buf.raw[:n].decode("utf-8", "replace")

    def generate(self, messages: list[dict], max_tokens: int = 128,
                 on_token=None, stop=None) -> str:
        """贪心采样生成；on_token(piece) 流式输出；stop(full_text) 为提前停止判定。"""
        L = self.L
        # llama.cpp 的 KV cache 会跨调用保留。这里每次重新解码整个 prompt，
        # 必须先清空，否则多轮/多会话累积会撑满 n_ctx，导致 prompt decode 失败。
        mem = L.llama_get_memory(self.ctx)
        if mem:
            L.llama_memory_clear(mem, True)
        raw = self.apply_template(messages)
        cap = len(raw) * 2 + 128
        tokens = (c_int32 * cap)()
        n = L.llama_tokenize(self.vocab, raw, len(raw), tokens, cap, True, True)
        if n <= 0:
            raise RuntimeError("tokenize 失败（返回 %s）" % n)
        if L.llama_decode(self.ctx, L.llama_batch_get_one(tokens, n)) != 0:
            raise RuntimeError("prompt decode 失败")

        out = []
        full = ""
        for _ in range(max_tokens):
            ptr = L.llama_get_logits(self.ctx)
            if not ptr:
                raise RuntimeError("get_logits 返回空")
            logits = array.array("f")
            logits.frombytes(bytes((c_float * self.n_vocab).from_address(
                ctypes.addressof(ptr.contents))))
            token = logits.index(max(logits))
            if L.llama_token_is_eog(self.vocab, c_int32(token)):
                break
            piece = self._piece(token)
            # 兜底模板下模型可能先吐一个 <|im_end|> 再开始正文：
            # 开头就遇到特殊 token 时跳过它继续生成，已有正文后才收尾
            if "<|" in piece:
                if not out:
                    nxt = (c_int32 * 1)(token)
                    if L.llama_decode(self.ctx, L.llama_batch_get_one(nxt, 1)) != 0:
                        break
                    continue
                break
            out.append(piece)
            full += piece
            if on_token:
                on_token(piece)
            # 模型开始续写下一轮 user/assistant 时立即收尾，避免把角色标签写进回复
            if stop and stop(full):
                break
            nxt = (c_int32 * 1)(token)
            if L.llama_decode(self.ctx, L.llama_batch_get_one(nxt, 1)) != 0:
                break
        return "".join(out)

    def close(self) -> None:
        if getattr(self, "ctx", None):
            self.L.llama_free(self.ctx)
            self.ctx = None
        if getattr(self, "model", None):
            self.L.llama_free_model(self.model)
            self.model = None
        self.L.llama_backend_free()
