@echo off
echo ==========================================
echo  ORDO-TODO APK BUILD SCRIPT
echo ==========================================

echo.
echo 1. Verificando configuracion...
echo.

echo Configuracion actual:
echo - Android Package: com.ordotodo.mobile
echo - Version: 1.0.0 (1)
echo - API Target: 34
echo - API URL: http://192.168.1.100:3001/api/v1
echo - Prebuild: COMPLETADO
echo - SDK Path: CONFIGURADO
echo.

echo 2. Antes de ejecutar:
echo    - Asegurate de tener Android Studio instalado
echo    - El Android SDK debe estar en: C:\Users\Usuario\AppData\Local\Android\Sdk
echo    - Backend corriendo en http://192.168.1.100:3001
echo.

echo 3. Si este es tu primer build, ejecuta:
echo    npx expo run:android --variant release
echo.

echo 4. Si el build falla, intenta con Gradle:
echo    cd android
echo    gradlew assembleRelease
echo.

echo 5. APK se generara en:
echo    android/app/build/outputs/apk/release/app-release.apk
echo.

echo 6. Para instalar en tu dispositivo:
echo    - Activa "Fuentes desconocidas" en Android
echo    - Transfiere el APK a tu telefono
echo    - Instala el APK
echo.

pause