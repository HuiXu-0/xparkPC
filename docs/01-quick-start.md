# 快速开始

## 1. 环境要求

推荐环境：

- Windows 10 / 11 x64
- Python 3.10 或更高版本
- 支持 Vulkan 的 NVIDIA / AMD / Intel GPU
- 建议显存 12 GB 以上
- 磁盘空间建议 6 GB 以上

当前项目已经在本机实测通过：

- NVIDIA GeForce RTX 5070 Ti Laptop GPU
- Vulkan 后端
- 12 GB 显存
- Spark-X2.6-4B Q4_K_M
- 32768 tokens 上下文

> 如果只是开发前端或后端代码，可以先不放置模型；但完整对话体验需要模型和推理 runtime。

## 2. 启动方式

### 方式一：双击启动脚本

在项目根目录双击：

```bat
启动 Spark Chat（内置模型版）.bat
```

脚本会：

1. 自动切换到项目根目录
2. 检测 `py -3` / `python` / `python3`
3. 启动 `backend/server.py`
4. 在本机 `8000` 端口提供服务

### 方式二：命令行启动

```powershell
cd E:\XparkChat\SparkChat-v3.1-便携版
py -3 backend\server.py
```

或者：

```powershell
python backend\server.py
```

## 3. 打开界面

服务启动后，浏览器访问：

```text
http://localhost:8000
```

如果浏览器没有自动打开，手动访问上面地址即可。

## 4. 开始对话

1. 进入「工作台」或「对话」页面
2. 在输入框输入问题，例如：

```text
你好
```

3. 按 `Enter` 发送
4. AI 会通过 SSE 流式输出回答
5. `Shift + Enter` 可以换行

## 5. 会话管理

- 左侧栏可以查看最近会话
- 点击「新建对话」可以创建新会话
- 会话标题可以在「对话」页面里重命名
- 每条历史会话可以单独删除
- 会话数据保存在本地：

```text
SparkChat/data/chats/
```

## 6. 停止服务

在命令行窗口按：

```text
Ctrl + C
```

如果是双击启动的 bat，关闭窗口也可以停止服务。

## 7. 检查服务是否正常

可以直接访问健康检查接口：

```text
http://localhost:8000/health
```

正常时会返回类似：

```json
{
  "status": "ok",
  "version": "3.2.0-folder",
  "gateway_running": true
}
```

也可以查看运行状态：

```text
http://localhost:8000/runtime-status.json
```

## 8. 数据存放位置

```text
SparkChat/data/chats/      会话记录
SparkChat/data/config/     配置文件
SparkChat/data/logs/       运行日志
```

其中日志文件是：

```text
SparkChat/data/logs/server.log
```

## 9. 前端开发

如果需要修改前端，源码在：

```text
SparkChat/web-frontend-lite/
```

修改后重新构建：

```powershell
python SparkChat\web-frontend-lite\build.py
```

构建产物会生成到：

```text
SparkChat/frontend/index.html
```

## 10. 后端冒烟测试

可以直接运行：

```powershell
py -3 backend\_probe.py
```

它会加载模型并生成一次简单回复，用于确认推理链路可用。
