@echo off
setlocal enabledelayedexpansion

echo ==========================================================================
echo   NIET GREATER NOIDA - B.Tech CSE-R
echo   Student Academic Performance Analytics System (Group G-2)
echo   Course: CCSEH0355 (Object Oriented Techniques using Java)
echo ==========================================================================

set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

rem 1. Determine Java / Javac path
set "JAVA_CMD=java"
set "JAVAC_CMD=javac"

if exist "%SCRIPT_DIR%..\jdk-17\bin\javac.exe" (
    set "JAVA_CMD=%SCRIPT_DIR%..\jdk-17\bin\java.exe"
    set "JAVAC_CMD=%SCRIPT_DIR%..\jdk-17\bin\javac.exe"
) else if exist "C:\Users\HP\.gemini\antigravity-ide\scratch\jdk-17\bin\javac.exe" (
    set "JAVA_CMD=C:\Users\HP\.gemini\antigravity-ide\scratch\jdk-17\bin\java.exe"
    set "JAVAC_CMD=C:\Users\HP\.gemini\antigravity-ide\scratch\jdk-17\bin\javac.exe"
) else if defined JAVA_HOME (
    if exist "%JAVA_HOME%\bin\javac.exe" (
        set "JAVA_CMD=%JAVA_HOME%\bin\java.exe"
        set "JAVAC_CMD=%JAVA_HOME%\bin\javac.exe"
    )
)

echo [1/3] Using Java Compiler: "%JAVAC_CMD%"
"%JAVAC_CMD%" -version
if errorlevel 1 (
    echo [ERROR] JDK 17 is required. Please check that Java is installed.
    pause
    exit /b 1
)

rem 2. Compile Java sources into bin directory
echo [2/3] Compiling Java source files...
if not exist "bin" mkdir "bin"
if not exist "data" mkdir "data"

rem Gather all java files
dir /s /b src\main\java\*.java > sources.txt
"%JAVAC_CMD%" -d bin -encoding UTF-8 @sources.txt
del sources.txt

if errorlevel 1 (
    echo [ERROR] Compilation failed!
    pause
    exit /b 1
)
echo [OK] Compilation successful!

rem 3. Run application
echo [3/3] Launching Student Academic Performance Analytics System...
"%JAVA_CMD%" -cp bin com.niet.analytics.app.Main

pause
