# 产品结构

## 顶层目录

```text
SparkChat-v3.1-便携版/
├── backend/                    当前本地推理后端
├── SparkChat/                  前端与历史便携版资源
├── launcher/                   早期独立启动器
├── runtime/                    本地推理运行时（不入库）
├── mood/                       本地模型权重（不入库）
├── docs/                       产品文档
├── README.md                   产品入口说明
└── 启动 Spark Chat（内置模型版）.bat
```

## backend/

当前后端使用 Python 标准库实现，不依赖 FastAPI / uvicorn。

```text
backend/
├── server.py             HTTP 服务、路由、SSE、会话管理
├── llama_engine.py       llama.cpp 绑定与文本生成
└── _probe.py             后端冒烟测试
```

### server.py

负责：

- 托管 `SparkChat/frontend/index.html`
- 提供 `/health`、`/status`、`/runtime-status.json`
- 提供模型、配置、会话、对话接口
- 处理 SSE 流式输出
- 清洗历史消息中的角色标签与特殊 token
- 在每次生成前清空 KV cache，避免上下文累积

### llama_engine.py

负责：

- 加载 llama.cpp 的 DLL
- 注册 GGML 后端
- 加载 GGUF 模型
- 渲染 Spark-X2.6 官方聊天模板
- 执行贪心采样生成
- 通过回调逐 token 输出

### _probe.py

用于快速验证：

- 模型能否加载
- 推理能否输出
- 聊天模板是否正常

## SparkChat/

```text
SparkChat/
├── frontend/                 构建后的单文件前端
├── web-frontend-lite/        前端可维护源码
├── frontend_vue_backup/      旧 Vue 前端备份
├── data/                     运行数据，不入库
└── README.md                 旧便携版说明
```

### frontend/

构建后的前端是单文件：

```text
SparkChat/frontend/index.html
```

后端会直接托管这个文件。

### web-frontend-lite/

这是当前前端的可维护源码：

```text
SparkChat/web-frontend-lite/
├── base.css
├── extra.css
├── shell.html
├── app.js
├── build.py
└── selftest.js
```

修改前端后执行：

```powershell
python SparkChat\web-frontend-lite\build.py
```

## data/

运行数据不入库，路径为：

```text
SparkChat/data/
├── chats/
├── config/
└── logs/
```

具体文件：

| 路径 | 说明 |
| --- | --- |
| `SparkChat/data/chats/*.json` | 会话记录 |
| `SparkChat/data/config/config.json` | 配置 |
| `SparkChat/data/logs/server.log` | 服务日志 |

## runtime/

本地推理运行时，不入库。

当前使用的是：

```text
runtime/vulkan/
```

包含 llama.cpp 相关 DLL 与 GGML 后端。

## mood/

本地模型权重，不入库。

当前模型：

```text
mood/Spark-X2.6-4B-Q4_K_M.gguf
```

## launcher/

早期启动器脚本，当前主启动方式是根目录的 bat 文件。
`launcher/spark_launch.py` 保留用于参考和后续产品化启动器改造。
