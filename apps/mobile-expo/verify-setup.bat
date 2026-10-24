@echo off
echo ==========================================
echo  VERIFICANDO CONFIGURACION ANDROID
echo ==========================================

echo.
echo 1. Verificando Java...
java -version
if %errorlevel% neq 0 (
    echo ❌ Java no encontrado. Instala Java JDK 17+
    pause
    exit /b 1
)

echo.
echo 2. Verificando ANDROID_HOME...
echo %ANDROID_HOME%
if "%ANDROID_HOME%"=="" (
    echo ❌ ANDROID_HOME no configurado
    echo Configura: C:\Users\Usuario\AppData\Local\Android\Sdk
    pause
    exit /b 1
)

echo.
echo 3. Verificando directorio del SDK...
if exist "%ANDROID_HOME%" (
    echo ✅ SDK encontrado en: %ANDROID_HOME%
) else (
    echo ❌ Directorio del SDK no encontrado
    echo Instala Android Studio primero
    pause
    exit /b 1
)

echo.
echo 4. Verificando Android tools...
if exist "%ANDROID_HOME%\platform-tools\adb.exe" (
    echo ✅ Platform-tools encontrado
) else (
    echo ❌ Platform-tools no encontrado
)

echo.
echo 5. Verificando Build Tools...
dir "%ANDROID_HOME%\build-tools" /b >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Build Tools encontrados
) else (
    echo ❌ Build Tools no encontrados
)

echo.
echo ==========================================
echo  Configuracion completada. Listo para build APK.
echo ==========================================
pause