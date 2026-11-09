# Spark Chat 文档索引

这里是 Spark Chat 当前版本的说明文档入口。

## 文档目录

| 文档 | 内容 |
| --- | --- |
| [01-快速开始](./01-quick-start.md) | 下载、启动、首次对话 |
| [02-产品结构](./02-product-structure.md) | 目录结构、模块职责、数据存放位置 |
| [03-推理与模型](./03-inference-and-model.md) | 内置模型、推理引擎、上下文、模板与限制 |
| [04-API 说明](./04-api-reference.md) | 后端 HTTP / SSE 接口 |
| [05-打包与发布](./05-packaging-and-release.md) | 制作便携包、安装包、Release 发布思路 |
| [06-常见问题](./06-troubleshooting.md) | 启动失败、GPU、上下文、界面问题排查 |

## 当前版本要点

- 当前代码形态：**文件夹便携版**
- 内置模型：**Spark-X2.6-4B Q4_K_M**
- 推理引擎：**llama.cpp b12128**
- 当前实测后端：**Vulkan / NVIDIA RTX 5070 Ti Laptop GPU**
- 当前上下文窗口：**32768 tokens**
- 服务地址：`http://localhost:8000`

## 重要说明

`runtime/` 和 `mood/` 不进入 Git 主仓库：

- `runtime/` 是 llama.cpp 推理运行时，约 900 MB
- `mood/` 是 GGUF 模型权重，约 3.4 GB

它们应该通过 Release 附件、模型托管平台或安装包分发。
