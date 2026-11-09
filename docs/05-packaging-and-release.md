# 打包与发布

## 当前形态

当前项目是**文件夹便携版**，不是单文件 EXE。

当前推荐启动方式：

```bat
启动 Spark Chat（内置模型版）.bat
```

它的优点是：

- 不依赖打包后的 EXE
- 不容易被 Smart App Control / SmartScreen 误拦
- 便于调试
- 便于升级
- 便于保留用户数据

## 仓库与分发边界

Git 仓库里不放以下内容：

```text
runtime/
mood/
SparkChat/data/
*.gguf
*.dll
*.zip
```

原因：

- `runtime/` 约 900 MB
- `mood/` 约 3.4 GB
- GitHub 普通仓库单文件限制是 100 MB
- 模型和运行时属于分发资产，不是源码

## 推荐发布结构

一个完整产品包可以按如下结构组织：

```text
SparkChat/
├── backend/
├── SparkChat/
│   ├── frontend/
│   └── web-frontend-lite/
├── launcher/
├── runtime/
├── mood/
├── docs/
├── README.md
└── 启动 Spark Chat（内置模型版）.bat
```

其中：

| 目录 | 是否必须 | 说明 |
| --- | --- | --- |
| `backend/` | 必须 | 后端源码 |
| `SparkChat/frontend/` | 必须 | 前端产物 |
| `runtime/` | 必须 | llama.cpp 运行时 |
| `mood/` | 必须 | GGUF 模型权重 |
| `docs/` | 建议 | 文档 |
| `launcher/` | 可选 | 早期启动器 |
| `SparkChat/data/` | 不要预置 | 用户运行数据 |

## 构建前端

```powershell
python SparkChat\web-frontend-lite\build.py
```

产物：

```text
SparkChat/frontend/index.html
```

## 前端自测

```powershell
node SparkChat\web-frontend-lite\selftest.js
```

后端冒烟测试：

```powershell
py -3 backend\_probe.py
```

## 便携 ZIP 包

最简单的发布方式是打包 ZIP：

```text
SparkChat-3.2.0-windows-x64.zip
```

内部结构：

```text
SparkChat/
├── backend/
├── SparkChat/
├── runtime/
├── mood/
├── docs/
├── README.md
└── 启动 Spark Chat（内置模型版）.bat
```

用户解压后双击 bat 即可。

优点：

- 制作简单
- 不触发签名问题
- 不需要用户安装 Python
- 可以保留用户 data 目录

缺点：

- 包体大
- 没有正式安装体验
- 没有快捷方式注册

## 安装包方向

后续可以做：

### 方案 A：完整离线安装包

包含：

- 后端
- 前端
- runtime
- 模型
- 文档
- 启动器

体积预计 4 GB 左右。

适合：

- 离线分发
- U 盘分发
- 对网络不敏感的用户

### 方案 B：小安装器 + 首次下载模型

安装器只包含：

- 后端
- 前端
- runtime
- 文档

首次启动时下载模型。

优点：

- 安装包小
- 模型可独立升级

缺点：

- 首次启动依赖网络
- 需要可靠下载源

### 方案 C：GitHub Release 分卷

如果模型必须放 GitHub Release，可以分卷：

```text
SparkChat-model.7z.001
SparkChat-model.7z.002
SparkChat-model.7z.003
```

注意 GitHub Release 单文件上限约为 2 GB。

## 内嵌 Python

正式产品不应该要求用户安装 Python。

可选方案：

1. Python embeddable package
2. PyInstaller 打包后端
3. conda / venv 随包分发

当前推荐：

```text
runtime/python/
```

也就是把 Python 解释器放进产品包。

## 签名问题

未签名安装包可能遇到：

- SmartScreen 警告
- Smart App Control 拦截
- 杀毒软件误报
- 用户不信任

正式发布建议：

- 购买代码签名证书
- 对安装器和 EXE 签名
- 提供文件哈希
- 提供 Release Notes

## Release 命名建议

```text
SparkChat-3.2.0-windows-x64-portable.zip
SparkChat-3.2.0-windows-x64-installer.exe
SparkChat-model-3.2.0.7z.001
SparkChat-runtime-3.2.0.7z.001
```

## 版本发布建议

每个 Release 至少包含：

1. 便携 ZIP 或安装包
2. Release Notes
3. 已知问题
4. 最低硬件要求
5. SHA-256 校验值
6. 文档入口

## 后续可做

- 自动构建脚本
- GitHub Actions 打包
- 自动生成 SHA-256
- 自动上传 Release
- 自动版本号
- 安装器模板
- 升级器
- 崩溃日志收集
