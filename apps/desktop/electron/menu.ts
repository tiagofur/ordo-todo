import { Menu, app, BrowserWindow, shell } from 'electron'

export function createApplicationMenu(mainWindow: BrowserWindow): Menu {
  const isMac = process.platform === 'darwin'

  const template: Electron.MenuItemConstructorOptions[] = [
    // App menu (macOS only)
    ...(isMac
      ? [
        {
          label: app.name,
          submenu: [
            { role: 'about' as const, label: 'Acerca de Ordo-Todo' },
            { type: 'separator' as const },
            {
              label: 'Preferencias...',
              accelerator: 'CmdOrCtrl+,',
              click: () => {
                mainWindow.webContents.send('menu-action', 'navigate:settings')
              },
            },
            { type: 'separator' as const },
            { role: 'services' as const },
            { type: 'separator' as const },
            { role: 'hide' as const, label: 'Ocultar Ordo-Todo' },
            { role: 'hideOthers' as const },
            { role: 'unhide' as const },
            { type: 'separator' as const },
            { role: 'quit' as const, label: 'Salir de Ordo-Todo' },
          ],
        } as Electron.MenuItemConstructorOptions,
      ]
      : []),

    // File menu
    {
      label: 'Archivo',
      submenu: [
        {
          label: 'Nueva Tarea',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('menu-action', 'task:create')
          },
        },
        {
          label: 'Nuevo Proyecto',
          accelerator: 'CmdOrCtrl+Shift+P',
          click: () => {
            mainWindow.webContents.send('menu-action', 'project:create')
          },
        },
        { type: 'separator' },
        {
          label: 'Importar...',
          click: () => {
            mainWindow.webContents.send('menu-action', 'file:import')
          },
        },
        {
          label: 'Exportar...',
          click: () => {
            mainWindow.webContents.send('menu-action', 'file:export')
          },
        },
        { type: 'separator' },
        isMac
          ? { role: 'close' as const, label: 'Cerrar Ventana' }
          : { role: 'quit' as const, label: 'Salir' },
      ],
    },

    // Edit menu
    {
      label: 'Editar',
      submenu: [
        { role: 'undo' as const, label: 'Deshacer' },
        { role: 'redo' as const, label: 'Rehacer' },
        { type: 'separator' },
        { role: 'cut' as const, label: 'Cortar' },
        { role: 'copy' as const, label: 'Copiar' },
        { role: 'paste' as const, label: 'Pegar' },
        ...(isMac
          ? [
            { role: 'pasteAndMatchStyle' as const, label: 'Pegar y Ajustar Estilo' },
            { role: 'delete' as const, label: 'Eliminar' },
            { role: 'selectAll' as const, label: 'Seleccionar Todo' },
          ]
          : [
            { role: 'delete' as const, label: 'Eliminar' },
            { type: 'separator' as const },
            { role: 'selectAll' as const, label: 'Seleccionar Todo' },
          ]),
      ],
    },

    // View menu
    {
      label: 'Ver',
      submenu: [
        { role: 'reload' as const, label: 'Recargar' },
        { role: 'forceReload' as const, label: 'Forzar Recarga' },
        { role: 'toggleDevTools' as const, label: 'Herramientas de Desarrollo' },
        { type: 'separator' },
        { role: 'resetZoom' as const, label: 'Zoom Normal' },
        { role: 'zoomIn' as const, label: 'Acercar' },
        { role: 'zoomOut' as const, label: 'Alejar' },
        { type: 'separator' },
        { role: 'togglefullscreen' as const, label: 'Pantalla Completa' },
        { type: 'separator' },
        {
          label: 'Siempre Visible',
          type: 'checkbox',
          checked: mainWindow.isAlwaysOnTop(),
          click: (menuItem) => {
            mainWindow.setAlwaysOnTop(menuItem.checked)
            mainWindow.webContents.send('menu-action', 'window:alwaysOnTop', menuItem.checked)
          },
        },
      ],
    },

    // Timer menu
    {
      label: 'Timer',
      submenu: [
        {
          label: 'Iniciar/Pausar',
          accelerator: 'CmdOrCtrl+Space',
          click: () => {
            mainWindow.webContents.send('menu-action', 'timer:toggle')
          },
        },
        {
          label: 'Saltar',
          accelerator: 'CmdOrCtrl+Shift+K',
          click: () => {
            mainWindow.webContents.send('menu-action', 'timer:skip')
          },
        },
        {
          label: 'Detener',
          click: () => {
            mainWindow.webContents.send('menu-action', 'timer:stop')
          },
        },
        { type: 'separator' },
        {
          label: 'Modo Trabajo',
          click: () => {
            mainWindow.webContents.send('menu-action', 'timer:mode:work')
          },
        },
        {
          label: 'Descanso Corto',
          click: () => {
            mainWindow.webContents.send('menu-action', 'timer:mode:shortBreak')
          },
        },
        {
          label: 'Descanso Largo',
          click: () => {
            mainWindow.webContents.send('menu-action', 'timer:mode:longBreak')
          },
        },
      ],
    },

    // Navigate menu
    {
      label: 'Navegar',
      submenu: [
        {
          label: 'Dashboard',
          accelerator: 'CmdOrCtrl+1',
          click: () => {
            mainWindow.webContents.send('menu-action', 'navigate:dashboard')
          },
        },
        {
          label: 'Tareas',
          accelerator: 'CmdOrCtrl+2',
          click: () => {
            mainWindow.webContents.send('menu-action', 'navigate:tasks')
          },
        },
        {
          label: 'Proyectos',
          accelerator: 'CmdOrCtrl+3',
          click: () => {
            mainWindow.webContents.send('menu-action', 'navigate:projects')
          },
        },
        {
          label: 'Timer',
          accelerator: 'CmdOrCtrl+4',
          click: () => {
            mainWindow.webContents.send('menu-action', 'navigate:timer')
          },
        },
        {
          label: 'Workspaces',
          accelerator: 'CmdOrCtrl+6',
          click: () => {
            mainWindow.webContents.send('menu-action', 'navigate:workspaces')
          },
        },
        {
          label: 'Analytics',
          accelerator: 'CmdOrCtrl+5',
          click: () => {
            mainWindow.webContents.send('menu-action', 'navigate:analytics')
          },
        },
        { type: 'separator' },
        {
          label: 'Configuración',
          accelerator: isMac ? 'CmdOrCtrl+,' : 'CmdOrCtrl+Shift+,',
          click: () => {
            mainWindow.webContents.send('menu-action', 'navigate:settings')
          },
        },
      ],
    },

    // Window menu
    {
      label: 'Ventana',
      submenu: [
        { role: 'minimize' as const, label: 'Minimizar' },
        { role: 'zoom' as const, label: 'Zoom' },
        ...(isMac
          ? [
            { type: 'separator' as const },
            { role: 'front' as const, label: 'Traer Todo al Frente' },
            { type: 'separator' as const },
            { role: 'window' as const },
          ]
          : [{ role: 'close' as const, label: 'Cerrar' }]),
      ],
    },

    // Help menu
    {
      label: 'Ayuda',
      role: 'help',
      submenu: [
        {
          label: 'Documentación',
          click: async () => {
            await shell.openExternal('https://ordo-todo.com/docs')
          },
        },
        {
          label: 'Atajos de Teclado',
          accelerator: 'CmdOrCtrl+/',
          click: () => {
            mainWindow.webContents.send('menu-action', 'help:shortcuts')
          },
        },
        { type: 'separator' },
        {
          label: 'Reportar un Problema',
          click: async () => {
            await shell.openExternal('https://github.com/tiagofur/ordo-todo/issues/new')
          },
        },
        {
          label: 'Solicitar Función',
          click: async () => {
            await shell.openExternal('https://github.com/tiagofur/ordo-todo/discussions/new?category=ideas')
          },
        },
        { type: 'separator' },
        ...(!isMac
          ? [
            {
              label: 'Acerca de Ordo-Todo',
              click: () => {
                mainWindow.webContents.send('menu-action', 'help:about')
              },
            },
          ]
          : []),
      ],
    },
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  return menu
}

export function updateMenuState(mainWindow: BrowserWindow): void {
  // Re-create menu to update states (like always-on-top checkbox)
  createApplicationMenu(mainWindow)
}
