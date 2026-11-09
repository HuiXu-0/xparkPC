# 常见问题

## 1. 双击 bat 后窗口一闪而过

可能原因：

- 没有找到 Python
- 路径里有异常字符
- 后端启动失败
- 端口被占用

排查方法：

1. 打开命令行，手动执行：

```powershell
cd E:\XparkChat\SparkChat-v3.1-便携版
py -3 backend\server.py
```

2. 查看是否有报错
3. 查看日志：

```text
SparkChat/data/logs/server.log
```

## 2. 找不到 Python

脚本会依次尝试：

```text
py -3
python
python3
```

如果都没有，需要安装 Python 3.10+。

安装时建议勾选：

- Add Python to PATH

## 3. 页面打不开

先确认服务是否启动：

```text
http://localhost:8000/health
```

如果失败：

- 检查 bat 是否真的启动了 `backend/server.py`
- 检查端口 `8000` 是否被占用
- 检查防火墙
- 检查日志

查看端口占用：

```powershell
netstat -ano | findstr :8000
```

## 4. 页面是旧版本

浏览器可能缓存了旧 HTML。

强制刷新：

```text
Ctrl + F5
```

如果还不行，重新构建前端：

```powershell
python SparkChat\web-frontend-lite\build.py
```

## 5. 模型加载慢

第一次加载模型会慢一些，需要把 GGUF 权重从磁盘读入显存。

之后通常会快很多。

可以查看日志：

```text
SparkChat/data/logs/server.log
```

## 6. 显存不足

当前上下文是 32768 tokens，在 12 GB 显存下占用较高。

如果显存不足，可以：

- 关闭其他占用显存的程序
- 降低上下文窗口
- 使用更小的模型
- 后续实现 KV cache 量化

查看显存：

```powershell
nvidia-smi
```

## 7. `prompt decode 失败`

这通常是上下文超限。

当前已经修复了跨调用 KV cache 累积的问题。
如果仍然出现，说明单次 prompt 真的太长。

处理方式：

- 新建会话
- 删除很长的旧会话
- 后续实现自动裁剪历史

## 8. 模型回复出现 `user` / `assistant` 角色标签

这通常是旧版历史污染或模板错误导致。

当前后端已经：

- 使用 Spark-X2.6 官方模板
- 清洗历史中的角色标签
- 遇到模板标记时提前停止

如果旧会话已经污染，建议新建会话。

## 9. 回复为空

可能原因：

- 生成被提前停止
- SSE 连接中断
- 模型输出全是特殊 token
- 生成失败但界面未正确展示

可以查看日志：

```text
SparkChat/data/logs/server.log
```

## 10. 回复有事实错误

本地模型仍可能幻觉。

建议：

- 对重要信息交叉验证
- 让模型明确说“不确定”
- 后续接入知识库后再回答私有资料
- 不要把本地模型当成实时信息源

## 11. GPU 没有被使用

可以查看：

```powershell
nvidia-smi
```

也可以访问：

```text
http://localhost:8000/runtime-status.json
```

当前应看到类似：

```json
{
  "backend": "vulkan",
  "backendLabel": "Vulkan · RTX 5070 Ti",
  "ready": true
}
```

如果显示 CPU，需要检查 `runtime/vulkan/` 是否完整。

## 12. 端口被占用

查找占用进程：

```powershell
netstat -ano | findstr :8000
```

然后根据 PID 查看进程：

```powershell
tasklist /fi "pid eq 1234"
```

必要时结束进程或修改服务端口。

## 13. 前端预览端口导致 API 失败

如果通过编辑器预览端口打开页面，可能会请求到错误端口。

请尽量直接访问：

```text
http://localhost:8000
```

当前前端会在非 8000 端口时尝试回连 `127.0.0.1:8000`。

## 14. 会话删除后仍显示

刷新页面即可。

前端会在删除后重新拉取会话列表。

## 15. 想完全重置数据

备份后删除：

```text
SparkChat/data/
```

这会删除：

- 会话
- 配置
- 日志
- 缓存

不会删除模型和 runtime。
