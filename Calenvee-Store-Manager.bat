@echo off
title Calenvee Desktop Store Manager
color 0F
cls
echo =====================================================================
echo           CALENVEE.PK -- DESKTOP STORE ^& CONTENT MANAGER
echo =====================================================================
echo.
echo  Starting local management server on http://localhost:4200 ...
echo  Opening in your default browser...
echo.
echo  [Features]
echo  - Manage Products, Prices, Stock, Colors ^& Badges
echo  - Update JazzCash, EasyPaisa, Bank accounts
echo  - Add Promo Codes ^& Sale Banners
echo  - Click "Publish to Live Store" to push directly to Vercel!
echo.
echo =====================================================================
echo.
start http://localhost:4200
node scripts/admin-server.cjs
pause
