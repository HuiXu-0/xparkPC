@echo off
title Spark Chat 停止服务

echo ========================================
echo   Spark Chat 停止服务
echo ========================================
echo.

echo 正在停止 Spark Chat 服务...

REM 查找并停止 Spark Chat 进程
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000" ^| findstr "LISTENING"') do (
    echo 停止进程 %%a
    taskkill /f /pid %%a >nul 2>&1
)

echo.
echo [成功] 服务已停止
echo.
pause
