# Spark Chat 便携版 v3.1 — Spark-X2.5 端侧大模型网页版

> 这是旧版便携分发的说明文档，保留用于历史参考。
> 当前版本的主文档请看仓库根目录的 [`README.md`](../README.md) 和 [`docs/README.md`](../docs/README.md)。

**Spark Chat** 是 **Spark-X2.5-4B** 与 **Spark-X2.5-1.7B** 两款实用、高效、使用便捷的端侧通用语言模型的**网页使用版**：U 盘即插即用、无需安装的一体化工作台。**把整个项目放进 U 盘，插到任何 Windows 电脑都能用**，数据留在 U 盘上。

- 🟦 **Spark-X2.5-4B**：通用均衡（默认模型），日常问答、写作、分析的主力
- ⚡ **Spark-X2.5-1.7B**：轻量快速，低配设备与简单任务首选
- 🔌 端侧模型走本机 **OpenAI 兼容推理服务**（Ollama / vLLM / LM Studio 等），**免 API Key**；也保留云端多厂商接入（OpenAI / Anthropic / DeepSeek / 硅基流动 / MiMo / 自定义端点）供 Auto 升级与自定义接入

> 架构改进参考 [deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) 的 **Everything is a Plugin** 设计：功能模块经 `PluginContext` 注册路由与工具、可整组卸载，支持项目根 `plugins/*.py` 免安装热插拔。

## 功能特性

- 🏠 **工作台首页**：「今天想让 AI 帮你完成什么?」——输入目标即可直达对话或发起智能任务
- 🟦 **端侧 Spark 模型开箱即用**：默认模型即 Spark-X2.5-4B，未配置任何 Key 也能直接对话（本机推理服务可达即可）
- 🧠 **智能任务 Agent**：描述目标 + 可选附件 → 自动拆解计划 → 逐步执行（勾选进度）+ 操作记录 + 最终报告；SSE 实时推送
- 👤 **人格 / Agent**：内置 通用 / 研究 / 编程 / 数据分析 / 文档 五类助手，对话与任务共用一套人格选择
- ⚡ **Auto 智能选模型**：按任务难易 / 类型在厂商族内自动选择；端侧模型始终可用，已配云端 Key 时深度需求可跨厂升级
- 📚 **本地知识库（RAG）**：上传 PDF / Word / Excel / 文本 → 自动切块，BM25 离线检索兜底；配置向量端点后升级语义混合检索
- 🛠 **工具中心**：可开关的智能体能力——文件解析、数据分析快照、知识库检索、文档生成；插件可经 `PluginContext.register_tool` 追加工具
- 💬 **流式对话**：逐字 SSE 输出、可停止、多轮上下文自动裁剪、会话持久化
- 🔐 **安全**：历史 API Key 仍以 Fernet 加密落盘（界面已不再提供 Key 输入）；监听局域网时自动强制访问令牌
- 🧹 **数据维护**：一键清理 / 配置导入导出 / 含会话的完整备份与恢复 / 自动备份调度 / 日志检索
- 🖥️ **工作台界面**：左侧导航 + 视图切换，浅色/深色主题，中文/English 全量对齐

## 快速开始

### 方式一：预构建版（推荐）

1. 把项目（含 `SparkChat.exe`、`frontend/`、`data/`）放进 U 盘
2. 双击 **`启动 Spark Chat.bat`**
3. 浏览器打开 http://localhost:8000
4. （可选）右上角设置 → 端侧端点确认为你的推理服务地址（默认 `http://127.0.0.1:11434/v1`）→ 直接开始对话，无需任何 Key

### 方式二：源码开发

后端（需要 Python 3.10+）：

```bash
cd backend
python -m venv .venv
.venv\Scripts\pip install -r requirements.txt
.venv\Scripts\python main.py        # 默认 http://127.0.0.1:8000
```

前端（需要 Node.js 18+，改动 UI 时使用）：

```bash
cd web-frontend
npm install
npm run dev       # 开发: http://localhost:3000, 自动代理 /api 到 8000
npm run build     # 产物在 web-frontend/dist
```

> 后端从 `frontend/` 目录提供静态页面；修改前端后需 `npm run build` 并把产物同步到 `frontend/`（`打包 Spark Chat.bat` 会自动完成）。

## 打包为 .exe（供 U 盘使用）

1. 双击 **`打包 Spark Chat.bat`**（自动：构建前端 → 同步 `frontend/` → 装依赖 → PyInstaller 打包）
2. 得到 `backend/dist/SparkChat.exe`，自动复制到项目根目录
3. 把整个目录拷到 U 盘即可

> 打包备注：`build.spec` 已把 `agents/docparse/tools/kb/tasks/code_exec/plugin_api/plugins` 及 `pypdf/docx/openpyxl` 纳入 hiddenimports；文件解析依赖需随包打包，体积会有所增加。

## 配置说明（设置面板）

| 项 | 说明 |
| --- | --- |
| 默认模型 | 对话 / 任务默认使用；出厂默认 `Spark-X2.5-4B`，每条消息旁也可临时切换 |
| 端侧 Spark 推理端点 | `spark_base_url`，默认 `http://127.0.0.1:11434/v1`（Ollama）；vLLM / LM Studio 等 OpenAI 兼容服务均可，**免 API Key** |
| Auto 选模 | 模型下拉选 `⚡ Auto`：按难度/类型选；深度需求且已配云端 Key 时升级，否则留在端侧默认 |
| 自定义端点 | `Base URL` + `模型 ID` 同时填写即启用（追加一项 `custom`） |
| Embedding | 可选：`Embedding Base URL` + `Embedding 模型`；留空则知识库为 BM25 |
| 监听地址 | `127.0.0.1` 仅本机；`0.0.0.0` 可局域网访问，重启生效 |
| 访问令牌 | 局域网模式必填，请求头 `Authorization: Bearer <token>`；未设置时服务启动自动生成并在日志打印 |
| 插件 | 设置面板底部展示已装载插件（内置 + 外置）及装载状态 |

## 插件体系（借鉴 deepseek-harness）

```
backend/
├── plugin_api.py        # PluginContext:register_route / register_tool / service,卸载即回滚
└── plugins/
    └── __init__.py      # 装载器:内置静态注册表 + 项目根 plugins/*.py 免安装热插拔
```

- 插件模块约定：`DESCRIPTION` / `VERSION` 可选，`register(ctx)` 必须
- `ctx.service("state"|"err"|"st")` 取宿主共享服务；`ctx.register_route(method, path, endpoint)` 注册路由
- **外置插件**：把 `*.py` 复制到项目根（打包后为 exe 同级）`plugins/` 目录，重启生效
- 单个插件装载失败只记日志，不影响宿主与其它插件；`GET /api/plugins` 返回装载清单

## API 一览

| 方法 & 路径 | 说明 |
| --- | --- |
| `GET /health`、`GET /status` | 健康 / 状态 |
| `POST /api/chat`、`POST /api/chat/stream` | 非流式 / **SSE 流式对话**（`meta/delta/done/error`） |
| `GET/POST /api/conversations`、`GET/PATCH/DELETE /api/conversations/{id}` | 会话 CRUD（支持 `agent` 人格） |
| `GET /api/models` | 模型列表（Spark-X2.5 两款置顶，含 `capability` 分档） |
| `GET/POST /api/agents`、`GET/PATCH/DELETE /api/agents/{id}` | 人格 / 智能体 CRUD |
| `GET /api/tools`、`POST /api/tools` | 工具注册表 + 开关（支持插件追加） |
| `GET /api/plugins` | 已装载插件清单（名称 / 版本 / 状态 / 错误） |
| `GET/POST /api/kb`、`GET /api/kb/status`、`POST /api/kb/upload`、`DELETE /api/kb/{id}` | 知识库列表 / 状态 / 上传 / 删除 |
| `GET /api/kb/search?q=&top=&mode=`、`POST /api/kb/reindex` | 检索（BM25/混合）/ 重建向量索引 |
| `GET/POST /api/tasks`、`GET/PATCH/DELETE /api/tasks/{id}`、`POST /api/tasks/{id}/run/stream` | 智能任务 CRUD + **SSE 运行** |
| `GET/POST /api/config`、`POST /api/config/test` | 读/写配置；连通性测试（**不产生计费对话**） |
| `POST /api/config/export`、`POST /api/config/import` | 配置导出 / 导入（不含 API Key） |
| `GET/DELETE /api/logs`、`GET /api/logs/export` | 日志查询 / 清空 / 导出 |
| `GET/POST /api/cleanup` | 空间信息 / 执行清理 |
| `GET/POST /api/backup`、`POST /api/backup/restore`、`DELETE /api/backup/{id}` | 备份管理 |

> 除 `GET/POST /api/config`、`/health`、`/status` 外，配置了访问令牌时所有接口都需要令牌。

## 项目结构

```
项目根目录/
├── SparkChat.exe             # 打包产物（运行时按 exe 所在目录定位数据）
├── 启动 Spark Chat.bat / 停止 Spark Chat.bat / 打包 Spark Chat.bat / 启动开发.bat
├── backend/
│   ├── main.py               # FastAPI 入口 + 路由装配 + 插件装载
│   ├── plugin_api.py         # 插件上下文(路由/工具注册与回滚)
│   ├── plugins/              # 插件装载器;外置插件放项目根 plugins/
│   ├── agents.py             # 人格/智能体（内置 5 + 自定义）
│   ├── tasks.py              # 智能任务存储 + SSE 运行器
│   ├── kb.py                 # 知识库：BM25 + 可选语义混合检索
│   ├── tools.py              # 工具注册表 + 开关持久化 + 插件注册口
│   ├── docparse.py           # 文件解析（txt/csv/pdf/docx/xlsx）
│   ├── code_exec.py          # 实验性 Python 执行（默认关）
│   ├── providers.py          # OpenAI/Anthropic 客户端 + system 前置
│   ├── models.py             # 模型注册表(Spark-X2.5 置顶) + Auto 选模
│   ├── conversations.py      # 会话持久化 + 历史裁剪
│   ├── config_manager.py     # 配置（白名单写入，含 spark_base_url）
│   ├── data_manager.py       # 空间 / 清理 / 备份
│   ├── encryption.py         # Fernet 加解密
│   ├── build.spec            # PyInstaller 配置（SparkChat.exe）
│   └── tests/                # pytest 单元测试
├── frontend/                 # 构建后的静态前端（后端直接服务）
├── web-frontend/             # Vue 3 + Element Plus 源码
│   └── src/                  # components / store / api / locales / styles.css
└── data/                     # 运行数据：config、chats、agents、tools.json、tasks、kb、uploads、logs、cache、backups、temp
```

## 运行测试

```bash
cd backend
.venv\Scripts\pip install pytest
.venv\Scripts\python -m pytest tests -q
```

覆盖：会话 CRUD 与历史裁剪、配置白名单与校验、模型注册表 + Auto 启发式、**Spark-X2.5 端侧模型（免 Key / 端点覆盖）**、**插件装载与卸载**、人格存储、知识库切块/BM25、文件解析与缺依赖降级、任务规划 JSON 抽取与状态往返、providers system 消息保留。

## 注意事项

- 同盘存放密钥与密文只能防「明文误读」，无法抵御「物理拿到 U 盘」；请妥善保管 U 盘
- 端侧推理需先启动本机 OpenAI 兼容服务（如 `ollama serve`），并在设置中确认端点地址
- Python 代码执行工具为**实验性**且默认关闭：运行在独立临时目录 + 超时，但**不是沙箱**，请勿放入敏感数据
- U 盘读写速度影响体验，建议 USB 3.0+
- 打包升级时仅覆盖 `SparkChat.exe` 与 `frontend/`，保留 `data/` 即保留全部配置、会话、任务与知识库

## 版本

- **v3.1.0**：品牌更名 **Spark Chat**；产品定位为 Spark-X2.5-4B / Spark-X2.5-1.7B 端侧大模型网页版（默认模型、免 Key、可配端侧端点）；引入 deepseek-harness 式插件体系（`PluginContext` + 装载器 + `GET /api/plugins`）；移除竞技场与全部 API Key 输入界面
- **v3.0.0**：重定位为嵌入式 AI Agent 工作台——智能任务 Agent、人格、Auto 选模、本地知识库 RAG、工具中心、简易竞技场、工作台导航与首页
- **v2.1.0**：会话持久化 + 多轮 + SSE 流式 · 界面重构 · 访问令牌与局域网安全 · 数据维护（备份/恢复/清理）

## 本仓库内容（便携分发版）

本仓库存放的是 **Windows U 盘便携分发版**，不是完整源码工程；上文的目录结构图描述的是完整开发工程，仅供参考。

| 路径 | 说明 |
| --- | --- |
| `SparkChat.exe` | PyInstaller 单文件后端（FastAPI + uvicorn / Python 3.12） |
| `frontend/index.html` | 工作台前端，单文件、CSS/JS 全内联，由后端直接托管 |
| `web-frontend-lite/` | 该前端的可读源码；改动后运行 `python web-frontend-lite/build.py` 重新生成 `frontend/index.html` |
| `frontend_vue_backup/` | 改造前的 Vue 前端产物备份，整目录覆盖 `frontend/` 即可回退 |
| `frontend/assets/` | 改造前 Vue 前端的静态资源（当前页面不再引用） |

启动：双击 `启动 Spark Chat.bat`，浏览器打开 http://localhost:8000。运行数据写入同目录 `data/`，已加入 `.gitignore`，请勿提交。

前端按后端真实 `/api/*` 接口对接（对话与任务使用 SSE 流式），接口契约从 exe 字节码静态还原；如遇字段不一致请提交 Issue。
