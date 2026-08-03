@echo off
echo ==============================================
echo       Khoi dong Remielle Desktop Assistant    
echo ==============================================
echo.
echo Dang chay Electron app...
echo Log duoc ghi tai file app.log

cd /d "%~dp0"

:: Ghi log cả Standard Output và Standard Error vào app.log
npm start > app.log 2>&1

echo.
echo [Hoan tat] Ung dung da dong hoac xay ra loi.
echo Vui long kiem tra file app.log de biet chi tiet.
pause
