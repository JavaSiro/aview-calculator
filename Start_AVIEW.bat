@echo off
TITLE AVIEW Hardware Calculator
COLOR 0A

echo ==================================================
echo      AVIEW Hardware Calculator - Offline Loader
echo ==================================================
echo.
echo [1/3] Checking for Docker...
docker --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo CRITICAL ERROR: Docker Desktop is not installed or running!
    echo Please open Docker Desktop and try again.
    PAUSE
    EXIT /B
)

echo [2/3] Loading the App from USB (This may take 30s)...
:: Looks for the tar file in the same folder as this script
docker load -i aview_calculator.tar

echo [3/3] Launching Calculator...
:: Stop any old version running
docker stop aview-calc >nul 2>&1
docker rm aview-calc >nul 2>&1

:: Run the new version
docker run -d -p 8080:80 --name aview-calc aview-calculator

echo.
echo SUCCESS! Opening Calculator in your browser...
timeout /t 3 >nul
start http://localhost:8080

echo.
echo You can close this window now.
PAUSE