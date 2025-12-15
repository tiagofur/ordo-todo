@echo off
echo ==========================================
echo  INSTALACION AUTOMATICA ANDROID SDK
echo ==========================================

echo.
echo Creando directorio para Android SDK...
mkdir "C:\Users\Usuario\AppData\Local\Android\Sdk" 2>nul

echo.
echo Descargando Android Command Line Tools...
echo Descarga manualmente desde:
echo https://developer.android.com/studio#command-tools
echo.
echo Busca: "Command line tools only for Windows"
echo Descarga el archivo ZIP llamado: "commandlinetools-win-11076708_latest.zip"
echo.
echo Descomprime en: C:\Users\Usuario\AppData\Local\Android\Sdk\cmdline-tools
echo.
echo Luego ejecuta este script nuevamente para continuar...
pause