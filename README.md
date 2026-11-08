# Spark Chat · 端侧大模型工作台

这是一个本地优先的端侧大模型对话工作台，包含：

- `backend/`：纯 Python 本地推理与 HTTP/SSE 服务
- `SparkChat/`：单文件前端、构建源码与旧便携版入口
- `launcher/`：早期的独立启动器脚本
- `启动 Spark Chat（内置模型版）.bat`：当前推荐的双击启动入口

> 大体积推理 runtime 与 GGUF 模型权重不进入 Git，需要随产品包单独分发。

## 本地启动

双击：

```bat
启动 Spark Chat（内置模型版）.bat
```

服务启动后访问：

```text
http://localhost:8000
```

## 仓库结构

```text
backend/                         本地推理服务与 HTTP/SSE 服务
SparkChat/frontend/              构建后的单文件前端
SparkChat/web-frontend-lite/     前端可维护源码
launcher/                        早期启动器源码
runtime/                         本地推理引擎（不入库）
mood/                            本地模型权重（不入库）
```
