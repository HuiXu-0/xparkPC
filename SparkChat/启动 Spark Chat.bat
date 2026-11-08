@echo off
title Spark Chat 便携版

echo ========================================
echo   Spark Chat 便携版
echo   Spark-X2.5 端侧大模型网页版
echo ========================================
echo.

REM 获取脚本所在目录(U 盘根目录)
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

REM 检查 SparkChat.exe 是否存在
if not exist "SparkChat.exe" (
    echo [错误] 未找到 SparkChat.exe
    echo 请先运行"打包 Spark Chat.bat"进行打包
    pause
    exit /b 1
)

REM 创建数据目录
echo 初始化数据目录...
if not exist "data" mkdir data
if not exist "data\config" mkdir data\config
if not exist "data\logs" mkdir data\logs
if not exist "data\chats" mkdir data\chats
if not exist "data\cache" mkdir data\cache
if not exist "data\backups" mkdir data\backups
if not exist "data\temp" mkdir data\temp

REM 检查前端是否已构建
if not exist "frontend\index.html" (
    echo [警告] 未找到前端文件
    echo 请先构建前端或下载预构建版本
)

echo.
echo 启动服务...
echo.
echo 请在浏览器中访问: http://localhost:8000
echo.
echo 按 Ctrl+C 停止服务
echo.

REM 启动 Spark Chat
SparkChat.exe

pause
