# API 说明

当前后端地址：

```text
http://localhost:8000
```

除静态页面外，接口主要返回：

```json
{
  "success": true,
  "data": {}
}
```

错误时可能返回：

```json
{
  "success": false,
  "error": "错误信息"
}
```

## 健康检查

### `GET /health`

```bash
curl http://localhost:8000/health
```

返回：

```json
{
  "status": "ok",
  "version": "3.2.0-folder",
  "gateway_running": true,
  "api_key_configured": false,
  "timestamp": 1770000000.0
}
```

## 运行状态

### `GET /status`

返回简要状态。

### `GET /runtime-status.json`

返回内置推理状态。

示例：

```json
{
  "backend": "vulkan",
  "backendLabel": "Vulkan · RTX 5070 Ti",
  "engine": "llama.cpp b12128 (Vulkan / RTX 5070 Ti, in-process)",
  "model": "Spark-X2.6-4B-Q4_K_M.gguf",
  "displayName": "Spark-X2.6-4B",
  "modelId": "spark-x2.6-4b",
  "baseUrl": "in-process",
  "ready": true,
  "profile": "fast"
}
```

## 模型

### `GET /api/models`

```bash
curl http://localhost:8000/api/models
```

返回：

```json
{
  "success": true,
  "data": [
    {
      "id": "spark-x2.6-4b",
      "name": "Spark-X2.6-4B",
      "provider": "spark",
      "capability": "balanced"
    }
  ]
}
```

## 配置

### `GET /api/config`

读取配置。

### `POST /api/config`

写入配置。

示例：

```bash
curl -X POST http://localhost:8000/api/config ^
  -H "Content-Type: application/json" ^
  -d "{\"max_tokens\": 512}"
```

### `POST /api/config/test`

测试内置引擎是否就绪。

```bash
curl -X POST http://localhost:8000/api/config/test ^
  -H "Content-Type: application/json" ^
  -d "{}"
```

## 会话

### `GET /api/conversations`

获取会话列表。

```bash
curl http://localhost:8000/api/conversations
```

### `POST /api/conversations`

创建新会话。

```bash
curl -X POST http://localhost:8000/api/conversations
```

### `GET /api/conversations/{id}`

获取单个会话详情。

### `PATCH /api/conversations/{id}`

修改会话标题。

请求体：

```json
{
  "title": "新的会话标题"
}
```

### `DELETE /api/conversations/{id}`

删除会话。

```bash
curl -X DELETE http://localhost:8000/api/conversations/abcdef123456
```

## 非流式对话

### `POST /api/chat`

请求体：

```json
{
  "message": "你好",
  "conversation_id": "可选",
  "max_tokens": 512
}
```

示例：

```bash
curl -X POST http://localhost:8000/api/chat ^
  -H "Content-Type: application/json" ^
  -d "{\"message\":\"你好\"}"
```

## 流式对话

### `POST /api/chat/stream`

推荐前端使用这个接口。

请求体：

```json
{
  "message": "你好",
  "conversation_id": "可选",
  "max_tokens": 512
}
```

示例：

```bash
curl -N -X POST http://localhost:8000/api/chat/stream ^
  -H "Content-Type: application/json" ^
  -d "{\"message\":\"你好\"}"
```

SSE 事件类型：

| 事件 | 说明 |
| --- | --- |
| `meta` | 会话信息 |
| `delta` | 增量文本 |
| `done` | 生成完成 |
| `error` | 生成失败 |

示例：

```text
data: {"type":"meta","conversation_id":"abc123"}

data: {"type":"delta","delta":"你好"}

data: {"type":"delta","delta":"！"}

data: {"type":"done","conversation_id":"abc123"}
```

## 静态页面

### `GET /`

返回 `SparkChat/frontend/index.html`。

### `GET /assets/...`

返回前端静态资源，当前单文件前端基本不依赖这个目录。

## 预留接口

前端里还有知识库、任务、工具中心、数据维护、插件等页面。

但当前后端为了保持界面可用，会对这些接口返回空数据：

```text
/api/kb
/api/tasks
/api/tools
/api/plugins
/api/backup
/api/cleanup
/api/logs
/api/agents
```

这些能力还没有真正实现。
