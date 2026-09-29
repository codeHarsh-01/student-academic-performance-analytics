@echo off
setlocal enabledelayedexpansion

echo ==========================================================================
echo   NIET GREATER NOIDA - Automated Unit Test Suite
echo   Student Academic Performance Analytics System
echo ==========================================================================

set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

set "JAVA_CMD=java"
set "JAVAC_CMD=javac"

if exist "%SCRIPT_DIR%..\jdk-17\bin\javac.exe" (
    set "JAVA_CMD=%SCRIPT_DIR%..\jdk-17\bin\java.exe"
    set "JAVAC_CMD=%SCRIPT_DIR%..\jdk-17\bin\javac.exe"
) else if exist "C:\Users\HP\.gemini\antigravity-ide\scratch\jdk-17\bin\javac.exe" (
    set "JAVA_CMD=C:\Users\HP\.gemini\antigravity-ide\scratch\jdk-17\bin\java.exe"
    set "JAVAC_CMD=C:\Users\HP\.gemini\antigravity-ide\scratch\jdk-17\bin\javac.exe"
)

if not exist "bin" mkdir "bin"

echo Compiling application and test classes...
dir /s /b src\main\java\*.java src\test\java\*.java > test_sources.txt
"%JAVAC_CMD%" -d bin -encoding UTF-8 @test_sources.txt
del test_sources.txt

if errorlevel 1 (
    echo [ERROR] Test compilation failed!
    pause
    exit /b 1
)

echo.
echo Running tests with assertions enabled (-ea)...
"%JAVA_CMD%" -ea -cp bin com.niet.analytics.RiskScoringAlgorithmTest

pause
