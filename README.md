# Spark Chat · 端侧大模型工作台

Spark Chat 是一个本地优先的端侧大模型对话工作台。
模型、会话与界面运行都在本机完成，不依赖云端 API Key。

![version](https://img.shields.io/badge/version-3.2.0--folder-blue)
![engine](https://img.shields.io/badge/engine-llama.cpp%20b12128-purple)
![model](https://img.shields.io/badge/model-Spark--X2.6--4B--Q4__K__M-6d5ae0)

## 特性

- 本地优先：模型权重和会话数据都在本机
- 内置推理：llama.cpp 进程内推理，不走外部 HTTP 推理服务
- 流式输出：SSE 逐字输出，可中断
- 多会话：支持新建、切换、重命名、删除
- 现代界面：工作台、对话、设置、浅色 / 深色主题
- 图标统一：前端图标来自 Morphicons 兼容的 Lucide 图标集
- 单文件前端：构建产物是自包含的 `frontend/index.html`
- 数据本地化：会话保存在 `SparkChat/data/chats/`

## 快速开始

### 1. 启动

双击：

```bat
启动 Spark Chat（内置模型版）.bat
```

或命令行启动：

```powershell
py -3 backend\server.py
```

### 2. 打开页面

浏览器访问：

```text
http://localhost:8000
```

### 3. 开始对话

在输入框输入：

```text
你好
```

按 `Enter` 发送即可。

## 当前配置

| 项 | 值 |
| --- | --- |
| 后端形态 | 文件夹便携版 |
| 模型 | Spark-X2.6-4B Q4_K_M |
| 推理引擎 | llama.cpp b12128 |
| 当前后端 | Vulkan |
| 上下文窗口 | 32768 tokens |
| 服务端口 | 8000 |
| 数据目录 | `SparkChat/data/` |

## 目录结构

```text
.
├── backend/                    本地推理后端
│   ├── server.py               HTTP / SSE 服务
│   ├── llama_engine.py         llama.cpp 绑定
│   └── _probe.py               冒烟测试
├── SparkChat/
│   ├── frontend/               构建后的单文件前端
│   ├── web-frontend-lite/      前端源码
│   └── data/                   会话、配置、日志
├── launcher/                   早期启动器
├── docs/                       产品文档
├── runtime/                    llama.cpp 运行时（不入库）
├── mood/                       GGUF 模型权重（不入库）
└── 启动 Spark Chat（内置模型版）.bat
```

## 文档

完整文档在 [`docs/`](./docs/README.md)：

- [快速开始](./docs/01-quick-start.md)
- [产品结构](./docs/02-product-structure.md)
- [推理与模型](./docs/03-inference-and-model.md)
- [API 说明](./docs/04-api-reference.md)
- [打包与发布](./docs/05-packaging-and-release.md)
- [常见问题](./docs/06-troubleshooting.md)

## 前端构建

修改前端源码后重新构建：

```powershell
python SparkChat\web-frontend-lite\build.py
```

前端自测：

```powershell
node SparkChat\web-frontend-lite\selftest.js
```

## 后端测试

```powershell
py -3 backend\_probe.py
```

## 仓库分发说明

以下内容不进入 Git 主仓库：

```text
runtime/
mood/
SparkChat/data/
*.gguf
*.dll
*.zip
```

其中：

- `runtime/` 是 llama.cpp 推理运行时
- `mood/` 是 GGUF 模型权重
- `SparkChat/data/` 是本地用户数据

它们应通过 Release 附件、模型托管平台或安装包分发。

## 许可

- llama.cpp：MIT
- Spark-X2.6 模型：Apache-2.0

分发产品包时应保留对应 LICENSE / NOTICE。
