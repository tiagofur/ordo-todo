# Ordo móvil (Tauri 2 + Android)

La app móvil renderiza el mismo frontend que `apps/desktop` (ODD 020 P4):
`@/*` apunta a la fuente de desktop y este proyecto solo aporta la
configuración Tauri móvil y los adaptadores de plataforma (`src/`).

## Backend al que se conecta

La URL de la API se hornea en `vite build` desde `VITE_API_URL`:

- `tauri android build` / `vite build` (mode production) leen
  `.env.production` → `https://api.ordotodo.app/api/v1`.
- Exportar `VITE_API_URL` al compilar tiene prioridad sobre el fichero
  (útil para emulador o LAN, ver abajo).
- Sin variable ni fichero, el fallback es `http://localhost:3101/api/v1`,
  que dentro de un WebView Android no resuelve al Mac.

Comprobar la URL horneada tras `npm run build`:

```bash
grep -rho "https\?://[^\"' ]*/api/v1" dist/assets/*.js | sort -u
```

## Compilar el APK

Requisitos: Android SDK + NDK, Java (JBR de Android Studio) y los targets
Rust `*-linux-android`. El `cargo` de Homebrew no tiene std de Android:
hay que poner el toolchain de rustup primero en el `PATH`:

```bash
cd apps/mobile
export ANDROID_HOME="$HOME/Library/Android/sdk"
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export PATH="$HOME/.rustup/toolchains/stable-aarch64-apple-darwin/bin:$PATH"
```

APK debug para un **dispositivo físico** (contra producción, desde
`.env.production`; `--target aarch64` cubre prácticamente todos los
móviles actuales y deja un APK de una sola ABI):

```bash
npm run tauri android build --debug --target aarch64
# Salida: src-tauri/gen/android/app/build/outputs/apk/universal/debug/app-universal-debug.apk
```

Sin `--target` compila universal (todas las ABI, más lento y más pesado).

Variantes contra otros backends (el export manda sobre `.env.production`):

```bash
# Emulador contra backend local del Mac
VITE_API_URL=http://10.0.2.2:3101/api/v1 npm run tauri android build --debug --target aarch64
# Dispositivo físico contra backend local (IP LAN del Mac)
VITE_API_URL=http://192.168.1.X:3101/api/v1 npm run tauri android build --debug --target aarch64
```

Instalar en un dispositivo conectado por USB (`adb` en
`$ANDROID_HOME/platform-tools`):

```bash
adb install -r src-tauri/gen/android/app/build/outputs/apk/universal/debug/app-universal-debug.apk
```

O copiar el APK al móvil y abrirlo (permite "instalar apps
desconocidas" cuando Android lo pida).

## Notas

- El APK debug va firmado con la clave debug: sirve para probar, no para
  publicar. El release firmado con keystore es trabajo de ODD 020 P5.
- Producción está en `REGISTRATION_MODE=invite-only`: el registro pide
  código de invitación (formato `ORDO-XXXX-XXXX`, se crean en /admin).
- OAuth social no está configurado en el servidor de producción: el
  login es email/contraseña. Los botones Google/GitHub abren el flujo
  pero el proveedor lo rechazará hasta que se configuren las
  credenciales OAuth en el backend.
- El WebView móvil usa Bearer del JSON de login/register/refresh, no
  cookies (las `Set-Cookie` de la API son third-party para
  `https://tauri.localhost` y no se persisten).
