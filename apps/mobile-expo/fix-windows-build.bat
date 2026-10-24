@echo off
echo ==========================================
echo  SOLUCION ERROR DE PATH LARGO EN WINDOWS
echo ==========================================

echo.
echo El error: "Filename longer than 260 characters"
echo Ocurre porque Windows tiene un limite de 260 caracteres para nombres de archivo
echo.
echo SOLUCIONES:
echo.
echo OPCION 1 - Mover proyecto a ruta corta (Recomendado):
echo   1. Copia la carpeta apps/mobile a C:\mobile
echo   2. Ejecuta: cd C:\mobile && npx expo run:android --variant release
echo.
echo OPCION 2 - Usar Gradle directo:
echo   1. Ejecuta: cd android && gradlew assembleRelease --console=plain
echo.
echo OPCION 3 - Build con arquitectura x86 solo (más rápido):
echo   1. Edita app.json agrega: "architecture": ["x86"]
echo   2. Ejecuta: npx expo run:android --variant release
echo.
echo OPCION 4 - Build en otra particion con ruta corta:
echo   1. Mueve el proyecto a: D:\mobile
echo   2. Ejecuta desde alli
echo.

echo Cual opcion prefieres?
set /p choice="Elija una opcion (1-4): "

if "%choice%"=="1" goto option1
if "%choice%"=="2" goto option2
if "%choice%"=="3" goto option3
if "%choice%"=="4" goto option4

:option1
echo.
echo Moviendo proyecto a C:\mobile...
mkdir C:\mobile 2>nul
xcopy /E /I /H "C:\Users\Usuario\source\repos\ordo-todo\apps\mobile" "C:\mobile\"
echo.
echo Cambiando a directorio C:\mobile...
cd /d C:\mobile
echo.
echo Ejecutando build...
npx expo run:android --variant release
goto end

:option2
echo.
echo Ejecutando Gradle directamente...
cd android
gradlew assembleRelease --console=plain
goto end

:option3
echo.
echo Editando app.json para arquitectura x86...
echo Agrega al final de app.json: "architecture": ["x86"]
echo Luego ejecuta: npx expo run:android --variant release
goto end

:option4
echo.
echo Por favor, mueve el proyecto manualmente a una ruta corta
echo como: D:\mobile o E:\mobile y ejecuta desde alli.
goto end

:end
pause