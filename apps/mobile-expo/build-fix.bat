@echo off
echo ===========================================
echo   ORDO-TODO MOBILE BUILDER (PATH FIX)
echo ===========================================

echo Cleaning previous virtual drive...
subst Z: /d >nul 2>&1

echo Mounting Z: -> c:\src\dev\ordo-todo
subst Z: "c:\src\dev\ordo-todo"
if errorlevel 1 (
    echo Failed to create Z: drive.
    pause
    exit /b 1
)

echo.
echo Building APK (this may take a few minutes)...
cd /d Z:\apps\mobile\android
call gradlew.bat assembleRelease

if errorlevel 1 goto error

echo.
echo Copying APK...
copy "app\build\outputs\apk\release\app-release.apk" "c:\src\dev\ordo-todo\apps\mobile\app-release.apk"

echo.
echo SUCCESS! APK location: c:\src\dev\ordo-todo\apps\mobile\app-release.apk
goto cleanup

:error
echo.
echo BUILD FAILED!
goto cleanup

:cleanup
cd /d c:\
subst Z: /d
echo Done.
pause
