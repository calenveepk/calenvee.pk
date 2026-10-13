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
echo  * This window powers your Store Manager in the background.        *
echo  * If you close this window, changes cannot be saved!              *
echo  * Simply MINIMIZE this window while using the Store Manager.      *
echo  *******************************************************************
echo.
echo  Starting local server at http://localhost:4200 ...
echo  Opening Store Manager in your default browser...
echo.
timeout /t 2 /nobreak >nul
start http://localhost:4200
node scripts/admin-server.cjs
pause
