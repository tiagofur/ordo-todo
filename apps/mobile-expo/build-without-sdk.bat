@echo off
echo ==========================================
echo  ALTERNATIVA: APK SIN ANDROID SDK LOCAL
echo ==========================================

echo.
echo Como no tienes el Android SDK completo, te recomiendo:
echo.
echo OPCION 1 - EAS Build (Recomendado):
echo   1. Instala: npm install -g @expo/eas-cli
echo   2. Login: eas login
echo   3. Build: eas build --platform android --profile preview
echo   4. El APK se generara en la nube y podras descargarlo
echo.
echo OPCION 2 - Expo Go (Pruebas rapidas):
echo   1. Ejecuta: npm start
echo   2. Instala Expo Go en tu telefono desde Play Store
echo   3. Escanea el QR codigo con Expo Go
echo.
echo OPCION 3 - Instalar Android SDK Manual:
echo   1. Abre el archivo android-sdk-setup.md para instrucciones
echo   2. O ejecuta: install-android-sdk.bat
echo.

echo Cual opcion prefieres?
echo 1 = EAS Build (nube)
echo 2 = Expo Go (pruebas)
echo 3 = SDK Local (completo)

set /p choice="Elija una opcion (1-3): "

if "%choice%"=="1" goto eas_build
if "%choice%"=="2" goto expo_go
if "%choice%"=="3" goto sdk_local

:eas_build
echo.
echo Instalando EAS CLI...
npm install -g @expo/eas-cli
echo.
echo Cuando termine, ejecuta:
echo   eas login
echo   eas build --platform android --profile preview
goto end

:expo_go
echo.
echo Iniciando servidor Expo...
npm start
goto end

:sdk_local
echo.
echo Abre android-sdk-setup.md para instrucciones detalladas
goto end

:end
pause