# Android SDK Setup Guide

## Problem: SDK location not found

## Solution:

### Option 1: Install Android SDK via Chocolatey (Recommended)
```powershell
# Install Chocolatey (if not installed)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install Android SDK
choco install android-sdk

# Install required components
choco install android-sdk-platform-tools
choco install android-sdk-build-tools
```

### Option 2: Manual Download
1. Download from: https://developer.android.com/studio#command-tools
2. Download: "Command line tools only for Windows"
3. Extract to: `C:\Users\Usuario\AppData\Local\Android\Sdk\cmdline-tools\latest`
4. Set environment variable: `ANDROID_HOME=C:\Users\Usuario\AppData\Local\Android\Sdk`

### Option 3: Use Android Studio SDK Manager
1. Open Android Studio
2. Tools > SDK Manager
3. Install:
   - Android 14 (API level 34)
   - Android SDK Build-Tools 34.0.0
   - Android SDK Platform-Tools

### After Installation:
```bash
# Update local.properties with correct path
sdk.dir=C\:/Users/Usuario/AppData/Local/Android/Sdk

# Then retry build
npx expo run:android --variant release
```

### Required Components:
- Platform-tools (contains adb)
- Build-tools (contains aapt, dx)
- Android API 34+ (android.jar)