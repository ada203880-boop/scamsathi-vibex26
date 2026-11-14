@echo off
setlocal
cd /d "%~dp0"
if not exist build mkdir build
echo Compiling ScamSathi...
javac --add-modules jdk.httpserver -encoding UTF-8 -d build src\ScamSathiServer.java
if errorlevel 1 (
  echo Compilation failed. Install Java 17 or later and confirm javac is on PATH.
  pause
  exit /b 1
)
echo Starting ScamSathi at http://127.0.0.1:18878
if /i not "%~1"=="--no-browser" start "ScamSathi" http://127.0.0.1:18878
java --add-modules jdk.httpserver -cp build ScamSathiServer 18878
pause
