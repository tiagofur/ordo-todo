# 📖 Ordo-Todo Desktop - Guía del Usuario

**Versión**: 1.0.0  
**Plataformas**: Windows, macOS, Linux

---

## 🚀 Introducción

**Ordo-Todo** es una aplicación de productividad moderna que combina gestión de tareas con la técnica Pomodoro para maximizar tu enfoque y eficiencia.

### Características Principales

- ✅ **Gestión de Tareas**: Crea, organiza y completa tareas con facilidad
- ⏱️ **Timer Pomodoro**: Intervalos de trabajo/descanso para máxima productividad
- 📊 **Analytics**: Visualiza tu progreso y patrones de trabajo
- 🏷️ **Etiquetas y Proyectos**: Organiza tu trabajo de forma intuitiva
- 🔄 **Modo Offline**: Trabaja sin conexión, sincroniza cuando reconectes
- 🌐 **Multi-idioma**: Disponible en Español e Inglés

---

## 📥 Instalación

### Windows
1. Descarga el instalador `.exe` desde [releases](https://github.com/tiagofur/ordo-todo/releases)
2. Ejecuta el instalador y sigue las instrucciones
3. Ordo-Todo se instalará y creará accesos directos

**Portable**: También disponible versión portable `.exe` que no requiere instalación.

### macOS
1. Descarga el archivo `.dmg` desde releases
2. Abre el archivo y arrastra Ordo-Todo a Aplicaciones
3. La primera vez, haz clic derecho > Abrir para autorizar

### Linux
- **AppImage**: Descarga, dale permisos de ejecución (`chmod +x`) y ejecuta
- **DEB**: `sudo dpkg -i ordo-todo_1.0.0_amd64.deb`
- **RPM**: `sudo rpm -i ordo-todo-1.0.0.x86_64.rpm`

---

## 🎯 Primeros Pasos

### 1. Crear una Cuenta
Al abrir la aplicación por primera vez:
1. Haz clic en "Registrarse"
2. Ingresa tu email, contraseña y nombre
3. ¡Listo! Ya puedes empezar a usar Ordo-Todo

### 2. Tu Primera Tarea
1. Ve al **Dashboard** o **Tareas**
2. Haz clic en el botón **+** (FAB) o usa `Ctrl+N`
3. Ingresa el título y descripción de tu tarea
4. Selecciona prioridad, proyecto y etiquetas
5. Haz clic en "Crear"

### 3. Iniciar un Pomodoro
1. Ve a la página **Timer** o usa el widget del Dashboard
2. Selecciona una tarea (opcional)
3. Haz clic en **Iniciar** o usa `Ctrl+Shift+P`
4. Trabaja enfocado durante 25 minutos
5. Toma un descanso cuando el timer termine

---

## ⌨️ Atajos de Teclado

| Acción | Windows/Linux | macOS |
|--------|---------------|-------|
| Nueva tarea | `Ctrl+N` | `⌘+N` |
| Buscar | `Ctrl+K` | `⌘+K` |
| Iniciar/Pausar timer | `Ctrl+Shift+P` | `⌘+Shift+P` |
| Mostrar/Ocultar app | `Ctrl+Shift+O` | `⌘+Shift+O` |
| Configuración | `Ctrl+,` | `⌘+,` |
| Modo oscuro | Automático | Automático |

---

## 🖥️ Funciones de Escritorio

### System Tray (Bandeja del Sistema)
- El ícono en la bandeja muestra el estado del timer
- Haz clic derecho para acciones rápidas:
  - Iniciar/Pausar timer
  - Nueva tarea
  - Mostrar/Ocultar ventana
  - Salir

### Timer Flotante
- Actívalo en **Configuración > Escritorio > Timer Flotante**
- Ventana siempre visible con controles del timer
- Arrástrala a cualquier posición
- Perfecta para tener el timer visible mientras trabajas

### Iniciar con el Sistema
- Ve a **Configuración > Escritorio**
- Activa "Iniciar con el sistema"
- Opcionalmente, marca "Iniciar minimizado"

### Deep Links
Abre tareas o proyectos directamente con URLs:
- `ordo://task/abc123` - Abre una tarea específica
- `ordo://project/xyz789` - Abre un proyecto
- `ordo://timer/start` - Inicia el timer

---

## 📊 Analytics

La página de **Analytics** te muestra:

### Gráfico Semanal
- Pomodoros completados por día de la semana
- Compara con semanas anteriores

### Horas Pico
- Mapa de calor mostrando tus horas más productivas
- Identifica cuándo trabajas mejor

### Focus Score
- Puntuación de enfoque del 0 al 100
- Basado en interrupciones y pomodoros completados

### Insights
- Sugerencias personalizadas para mejorar tu productividad
- Basadas en tus patrones de trabajo

---

## 🔄 Modo Offline

Ordo-Todo funciona sin conexión a internet:

1. **Creación de tareas**: Crea y edita tareas normalmente
2. **Timer**: El timer funciona completamente offline
3. **Sincronización**: Al reconectar, los cambios se sincronizan automáticamente
4. **Conflictos**: Si hay cambios en conflicto, la versión más reciente tiene prioridad

### Indicador de Estado
- 🟢 **Conectado**: Sincronización activa
- 🟡 **Sincronizando**: Cambios siendo enviados
- 🔴 **Offline**: Sin conexión, cambios guardados localmente

---

## ⚙️ Configuración

### Apariencia
- **Tema**: Claro, Oscuro o Automático (del sistema)
- **Idioma**: Español o English

### Timer
- **Duración de enfoque**: 15-60 minutos (default: 25)
- **Descanso corto**: 1-15 minutos (default: 5)
- **Descanso largo**: 5-30 minutos (default: 15)
- **Auto-iniciar descansos**: Inicia descanso automáticamente
- **Auto-iniciar pomodoros**: Inicia siguiente pomodoro automáticamente

### Notificaciones
- **Notificaciones de escritorio**: Alertas cuando termina el timer
- **Sonidos**: Reproducir sonido al completar
- **Recordatorios de tareas**: Notificar tareas próximas a vencer

### Escritorio
- **Iniciar con el sistema**: Abrir al iniciar el ordenador
- **Iniciar minimizado**: Ocultar ventana al iniciar
- **Timer flotante**: Mostrar mini timer siempre visible
- **Actualizaciones**: Buscar actualizaciones automáticamente

---

## 🔄 Actualizaciones

Ordo-Todo busca actualizaciones automáticamente.

### Actualización Manual
1. Ve a **Configuración > Escritorio**
2. Haz clic en "Buscar" actualizaciones
3. Si hay una disponible, haz clic en "Descargar"
4. Cuando termine, haz clic en "Reiniciar" para aplicar

### Notas de Versión
Las notas de cada versión están disponibles en:
- [GitHub Releases](https://github.com/tiagofur/ordo-todo/releases)

---

## ❓ Solución de Problemas

### La aplicación no inicia
1. Verifica que tienes los requisitos mínimos del sistema
2. Intenta reinstalar la aplicación
3. Revisa los logs en:
   - Windows: `%APPDATA%\Ordo-Todo\logs`
   - macOS: `~/Library/Logs/Ordo-Todo`
   - Linux: `~/.config/Ordo-Todo/logs`

### No recibo notificaciones
1. Verifica que las notificaciones están activadas en Configuración
2. Revisa los permisos del sistema operativo
3. En Windows: Configuración > Sistema > Notificaciones

### El timer no funciona en segundo plano
- Verifica que no has cerrado la aplicación
- El ícono en la bandeja debe estar visible
- Desactiva "Cerrar al minimizar" si está activado

### Problemas de sincronización
1. Verifica tu conexión a internet
2. Cierra sesión e inicia sesión nuevamente
3. Si persiste, contacta soporte

---

## 📞 Soporte

- **GitHub Issues**: [Reportar un bug](https://github.com/tiagofur/ordo-todo/issues)
- **Documentación**: [Wiki del proyecto](https://github.com/tiagofur/ordo-todo/wiki)

---

## 📋 Requisitos del Sistema

### Windows
- Windows 10 o superior
- 4GB RAM mínimo
- 200MB espacio en disco

### macOS
- macOS 10.15 (Catalina) o superior
- 4GB RAM mínimo
- 200MB espacio en disco

### Linux
- Ubuntu 20.04+ / Fedora 34+ / Debian 11+
- 4GB RAM mínimo
- 200MB espacio en disco

---

**¡Gracias por usar Ordo-Todo!** 🎉

*Hecho con ❤️ por el equipo de Ordo-Todo*
