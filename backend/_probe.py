"""冒烟测试：验证 ctypes 绑定能否用内置 CUDA DLL 加载模型并生成文字。"""
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from llama_engine import Engine

t0 = time.time()
print("[probe] 加载模型中（n_ctx=2048, n_gpu_layers=-1）...", flush=True)
e = Engine(n_ctx=2048)
print("[probe] 加载完成 %.1fs | vocab=%d | chat_template=%s"
      % (time.time() - t0, e.n_vocab, bool(e.template)), flush=True)
t1 = time.time()
text = e.generate([{"role": "user", "content": "用一句话介绍你自己"}], max_tokens=24)
print("[probe] 生成耗时 %.1fs" % (time.time() - t1), flush=True)
print("[probe] OUTPUT >>>", text, flush=True)
e.close()
print("[probe] OK", flush=True)
