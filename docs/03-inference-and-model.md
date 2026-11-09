# 推理与模型

## 当前模型

| 项 | 值 |
| --- | --- |
| 显示名 | Spark-X2.6-4B |
| 模型文件 | `mood/Spark-X2.6-4B-Q4_K_M.gguf` |
| 量化格式 | Q4_K_M |
| 架构 | spark2_5 |
| 官方最大上下文 | 1,048,576 tokens |
| 当前实际上下文 | 32,768 tokens |
| 模型体积 | 约 3.4 GB |
| 许可 | Apache-2.0 |

模型元数据中标注的最大上下文是 1,048,576 tokens，但当前受显存限制，实际设置的是 32768 tokens。

## 推理引擎

| 项 | 值 |
| --- | --- |
| 引擎 | llama.cpp b12128 |
| 调用方式 | Python ctypes 进程内调用 |
| 当前后端 | Vulkan |
| 权重精度 | Q4_K_M |
| 服务形态 | 无 HTTP 推理中转，直接进程内推理 |

相关代码：

```text
backend/llama_engine.py
```

## 运行时目录

当前使用：

```text
runtime/vulkan/
```

llama.cpp 会从这里加载 GGML 后端。

CUDA 版本在部分机器上可能初始化失败，因此当前默认走 Vulkan。

## 上下文窗口

当前配置：

```text
n_ctx = 32768
```

这个值是在 12 GB 显存下比较稳的档位。

实测：

- 显存总占用约 10.2 GB
- 剩余约 1.7 GB
- 对话正常
- 连续多轮正常

如果继续增大上下文，需要考虑：

- KV cache 量化
- 显存卸载
- 降低 batch / context
- 更激进的上下文裁剪

## 聊天模板

Spark-X2.6 的官方模板使用的是：

```text
<|System|>
<|User|>
<|Bot|>
```

而不是通用的 ChatML：

```text
<|im_start|>
<|im_end|>
```

因此 `llama_engine.py` 里会优先对 Spark 模型手工渲染官方模板。

当前非思考模式会在 assistant 侧使用：

```text
</think>
```

这样可以让模型直接输出正文，不进入长思考链。

## 系统提示

当前默认系统提示是：

```text
你是 Spark Chat，一个有帮助的本地智能助手。请使用简体中文自然、简洁、准确地回答用户的问题。
```

如果用户消息里已经带了 `system`，则不会重复注入默认系统提示。

## 生成方式

当前使用贪心采样：

- `temperature` 未参与动态采样
- `top_p` 未参与动态采样
- 没有做复杂采样参数暴露

优点是稳定。
缺点是创造性较弱，后续可以开放温度、top-p、repeat penalty 等参数。

## 历史清洗

为了避免模型把角色标签当正文继续输出，后端会清洗历史中的这些内容：

```text
<|User|>
<|Bot|>
<|System|>
<|im_start|>
<|im_end|>
<|endoftext|>
user
assistant
```

同时，如果历史 assistant 回复里出现了角色标签或模板片段，会在对应位置截断。

## KV cache

每次生成前会清空 KV cache：

```text
llama_get_memory() + llama_memory_clear()
```

这解决了之前跨调用上下文累积导致 `prompt decode 失败` 的问题。

## 当前限制

- 知识库、任务、工具中心等页面还只是预留界面
- 不支持多模型并发
- 不支持真正的思考链输出
- 不支持多模态输入
- 没有做长上下文自动裁剪
- 没有实现用户级权限
- 没有签名安装包

## 许可说明

- llama.cpp：MIT
- Spark-X2.6 模型：Apache-2.0

分发产品包时应保留对应 LICENSE / NOTICE。
