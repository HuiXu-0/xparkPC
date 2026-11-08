@echo off
title Spark Chat - 文件夹版（内置 Spark-X2.6-4B）
cd /d "%~dp0"
echo ==========================================
echo   Spark Chat / 内置 Spark-X2.6-4B / 文件夹版
echo ==========================================
echo.
if not exist "backend\server.py" (
    echo [错误] 未找到 backend\server.py
    pause
    exit /b 1
)
set "PYCMD="
py -3 --version >nul 2>&1 && goto USE_PY
python --version >nul 2>&1 && goto USE_PYTHON
python3 --version >nul 2>&1 && goto USE_PYTHON3
echo [错误] 未找到 Python 3.10+ 解释器，请安装 Python 或联系维护者。
pause
exit /b 1
:USE_PY
set "PYCMD=py -3"
goto RUN
:USE_PYTHON
set "PYCMD=python"
goto RUN
:USE_PYTHON3
set "PYCMD=python3"
goto RUN
:RUN
echo 使用解释器: %PYCMD%
echo 首次加载模型约需 30 秒；就绪后浏览器访问 http://localhost:8000
echo 按 Ctrl+C 停止服务。
echo.
%PYCMD% "backend\server.py" %*
set "RC=%ERRORLEVEL%"
echo.
if not "%RC%"=="0" echo [退出码 %RC%] 服务异常，请查看 SparkChat\data\logs\server.log
pause
