@echo off
title Calenvee Desktop Store Manager (DO NOT CLOSE)
color 0A
cls
echo =====================================================================
echo           CALENVEE.PK -- DESKTOP STORE ^& CONTENT MANAGER
echo =====================================================================
echo.
echo  *******************************************************************
echo  * [IMPORTANT] DO NOT CLOSE THIS BLACK WINDOW!                    *
echo  * This window powers your Store Manager and Live Preview.         *
echo  * If you close this window, servers will stop!                    *
echo  * Simply MINIMIZE this window while using the Store Manager.      *
echo  *******************************************************************
echo.
echo  Starting Store Manager ^& Live Preview on http://localhost:4200 ...
echo  Opening Store Manager in your default browser...
echo.
timeout /t 2 /nobreak >nul
start http://localhost:4200
node scripts/admin-server.cjs
pause
