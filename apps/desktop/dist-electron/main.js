import zt, { nativeImage as Su, Tray as Tu, app as Ne, Menu as Io, globalShortcut as zi, shell as ca, Notification as bu, ipcMain as de, screen as bh, BrowserWindow as Lo, dialog as Em } from "electron";
import * as st from "path";
import $e from "path";
import yn from "util";
import * as Ru from "fs";
import Tt from "fs";
import Nr from "crypto";
import Fo from "assert";
import Uo from "events";
import _n from "os";
import vm from "better-sqlite3";
import wm from "constants";
import En from "stream";
import Wi from "child_process";
import Rh from "tty";
import Pr from "url";
import Sm from "string_decoder";
import Ah from "zlib";
import Tm from "http";
let wt = null;
const Oh = {
  timerActive: !1,
  isPaused: !1,
  timeRemaining: "25:00",
  currentTask: null,
  mode: "IDLE"
};
let Nh = { ...Oh };
function bm() {
  const e = process.platform === "win32" ? "icon.ico" : "icon.png";
  return Ne.isPackaged ? st.join(process.resourcesPath, "build", e) : st.join(__dirname, "..", "build", e);
}
function Rm(e) {
  switch (e) {
    case "WORK":
      return "🍅";
    case "SHORT_BREAK":
      return "☕";
    case "LONG_BREAK":
      return "🌿";
    default:
      return "⏱️";
  }
}
function Am(e) {
  switch (e) {
    case "WORK":
      return "Trabajo";
    case "SHORT_BREAK":
      return "Descanso Corto";
    case "LONG_BREAK":
      return "Descanso Largo";
    default:
      return "Inactivo";
  }
}
function Om(e) {
  const t = bm();
  try {
    const i = Su.createFromPath(t);
    wt = new Tu(i.resize({ width: 16, height: 16 }));
  } catch {
    console.warn("Tray icon not found, using default"), wt = new Tu(Su.createEmpty());
  }
  return wt.setToolTip("Ordo-Todo"), qo(e, Oh), wt.on("click", () => {
    e.isVisible() ? e.hide() : (e.show(), e.focus());
  }), wt;
}
function qo(e, t) {
  if (!wt) return;
  Nh = t;
  const i = Rm(t.mode), r = Am(t.mode), u = t.timerActive ? `Ordo-Todo - ${r} ${t.timeRemaining}` : "Ordo-Todo";
  wt.setToolTip(u);
  const n = Io.buildFromTemplate([
    // Current task info
    {
      label: t.currentTask || "Sin tarea seleccionada",
      enabled: !1,
      icon: void 0
    },
    { type: "separator" },
    // Timer status
    {
      label: `${i} ${r}`,
      enabled: !1
    },
    {
      label: `⏱️ ${t.timeRemaining}`,
      enabled: !1
    },
    { type: "separator" },
    // Timer controls
    {
      label: t.timerActive && !t.isPaused ? "⏸️ Pausar" : "▶️ Iniciar",
      accelerator: "CmdOrCtrl+Shift+S",
      click: () => {
        e.webContents.send("tray-action", "timer:toggle");
      }
    },
    {
      label: "⏭️ Saltar",
      enabled: t.timerActive,
      click: () => {
        e.webContents.send("tray-action", "timer:skip");
      }
    },
    {
      label: "⏹️ Detener",
      enabled: t.timerActive,
      click: () => {
        e.webContents.send("tray-action", "timer:stop");
      }
    },
    { type: "separator" },
    // Quick actions
    {
      label: "➕ Nueva Tarea",
      accelerator: "CmdOrCtrl+Shift+N",
      click: () => {
        e.show(), e.focus(), e.webContents.send("tray-action", "task:create");
      }
    },
    {
      label: "📊 Dashboard",
      click: () => {
        e.show(), e.focus(), e.webContents.send("tray-action", "navigate:dashboard");
      }
    },
    { type: "separator" },
    // Window controls
    {
      label: e.isVisible() ? "🔽 Ocultar Ventana" : "🔼 Mostrar Ventana",
      click: () => {
        e.isVisible() ? e.hide() : (e.show(), e.focus());
      }
    },
    { type: "separator" },
    // App controls
    {
      label: "⚙️ Configuración",
      click: () => {
        e.show(), e.focus(), e.webContents.send("tray-action", "navigate:settings");
      }
    },
    { type: "separator" },
    {
      label: "❌ Salir",
      click: () => {
        Ne.quit();
      }
    }
  ]);
  wt.setContextMenu(n);
}
function Au(e, t) {
  const i = { ...Nh, ...t };
  qo(e, i);
}
function Nm() {
  wt && (wt.destroy(), wt = null);
}
const Tr = [
  {
    id: "timer-toggle",
    accelerator: "CmdOrCtrl+Shift+S",
    action: "timer:toggle",
    description: "Iniciar/Pausar Timer",
    enabled: !0
  },
  {
    id: "timer-skip",
    accelerator: "CmdOrCtrl+Shift+K",
    action: "timer:skip",
    description: "Saltar al siguiente",
    enabled: !0
  },
  {
    id: "task-create",
    accelerator: "CmdOrCtrl+Shift+N",
    action: "task:create",
    description: "Nueva Tarea Rápida",
    enabled: !0
  },
  {
    id: "window-toggle",
    accelerator: "CmdOrCtrl+Shift+O",
    action: "window:toggle",
    description: "Mostrar/Ocultar Ventana",
    enabled: !0
  },
  {
    id: "window-focus",
    accelerator: "CmdOrCtrl+Shift+F",
    action: "window:focus",
    description: "Enfocar Ventana",
    enabled: !0
  }
], br = /* @__PURE__ */ new Map();
function Ph(e, t = Tr) {
  xo(), t.forEach((i) => {
    if (i.enabled)
      try {
        zi.register(i.accelerator, () => {
          Ch(e, i.action);
        }) ? (br.set(i.id, i), console.log(`Shortcut registered: ${i.accelerator} -> ${i.action}`)) : console.warn(`Failed to register shortcut: ${i.accelerator}`);
      } catch (r) {
        console.error(`Error registering shortcut ${i.accelerator}:`, r);
      }
  });
}
function Ch(e, t) {
  switch (t) {
    case "window:toggle":
      e.isVisible() ? e.hide() : (e.show(), e.focus());
      break;
    case "window:focus":
      e.show(), e.focus();
      break;
    default:
      e.webContents.send("global-shortcut", t), t === "task:create" && (e.show(), e.focus());
      break;
  }
}
function xo() {
  zi.unregisterAll(), br.clear(), console.log("All global shortcuts unregistered");
}
function Pm() {
  return Array.from(br.values());
}
function Cm(e, t, i) {
  const r = br.get(t);
  if (!r) return !1;
  zi.unregister(r.accelerator);
  const u = { ...r, ...i };
  return u.enabled && zi.register(u.accelerator, () => {
    Ch(e, u.action);
  }) ? (br.set(t, u), !0) : (br.delete(t), !1);
}
function Im(e) {
  const t = process.platform === "darwin", i = [
    // App menu (macOS only)
    ...t ? [
      {
        label: Ne.name,
        submenu: [
          { role: "about", label: "Acerca de Ordo-Todo" },
          { type: "separator" },
          {
            label: "Preferencias...",
            accelerator: "CmdOrCtrl+,",
            click: () => {
              e.webContents.send("menu-action", "navigate:settings");
            }
          },
          { type: "separator" },
          { role: "services" },
          { type: "separator" },
          { role: "hide", label: "Ocultar Ordo-Todo" },
          { role: "hideOthers" },
          { role: "unhide" },
          { type: "separator" },
          { role: "quit", label: "Salir de Ordo-Todo" }
        ]
      }
    ] : [],
    // File menu
    {
      label: "Archivo",
      submenu: [
        {
          label: "Nueva Tarea",
          accelerator: "CmdOrCtrl+N",
          click: () => {
            e.webContents.send("menu-action", "task:create");
          }
        },
        {
          label: "Nuevo Proyecto",
          accelerator: "CmdOrCtrl+Shift+P",
          click: () => {
            e.webContents.send("menu-action", "project:create");
          }
        },
        { type: "separator" },
        {
          label: "Importar...",
          click: () => {
            e.webContents.send("menu-action", "file:import");
          }
        },
        {
          label: "Exportar...",
          click: () => {
            e.webContents.send("menu-action", "file:export");
          }
        },
        { type: "separator" },
        t ? { role: "close", label: "Cerrar Ventana" } : { role: "quit", label: "Salir" }
      ]
    },
    // Edit menu
    {
      label: "Editar",
      submenu: [
        { role: "undo", label: "Deshacer" },
        { role: "redo", label: "Rehacer" },
        { type: "separator" },
        { role: "cut", label: "Cortar" },
        { role: "copy", label: "Copiar" },
        { role: "paste", label: "Pegar" },
        ...t ? [
          { role: "pasteAndMatchStyle", label: "Pegar y Ajustar Estilo" },
          { role: "delete", label: "Eliminar" },
          { role: "selectAll", label: "Seleccionar Todo" }
        ] : [
          { role: "delete", label: "Eliminar" },
          { type: "separator" },
          { role: "selectAll", label: "Seleccionar Todo" }
        ]
      ]
    },
    // View menu
    {
      label: "Ver",
      submenu: [
        { role: "reload", label: "Recargar" },
        { role: "forceReload", label: "Forzar Recarga" },
        { role: "toggleDevTools", label: "Herramientas de Desarrollo" },
        { type: "separator" },
        { role: "resetZoom", label: "Zoom Normal" },
        { role: "zoomIn", label: "Acercar" },
        { role: "zoomOut", label: "Alejar" },
        { type: "separator" },
        { role: "togglefullscreen", label: "Pantalla Completa" },
        { type: "separator" },
        {
          label: "Siempre Visible",
          type: "checkbox",
          checked: e.isAlwaysOnTop(),
          click: (u) => {
            e.setAlwaysOnTop(u.checked), e.webContents.send("menu-action", "window:alwaysOnTop", u.checked);
          }
        }
      ]
    },
    // Timer menu
    {
      label: "Timer",
      submenu: [
        {
          label: "Iniciar/Pausar",
          accelerator: "CmdOrCtrl+Space",
          click: () => {
            e.webContents.send("menu-action", "timer:toggle");
          }
        },
        {
          label: "Saltar",
          accelerator: "CmdOrCtrl+Shift+K",
          click: () => {
            e.webContents.send("menu-action", "timer:skip");
          }
        },
        {
          label: "Detener",
          click: () => {
            e.webContents.send("menu-action", "timer:stop");
          }
        },
        { type: "separator" },
        {
          label: "Modo Trabajo",
          click: () => {
            e.webContents.send("menu-action", "timer:mode:work");
          }
        },
        {
          label: "Descanso Corto",
          click: () => {
            e.webContents.send("menu-action", "timer:mode:shortBreak");
          }
        },
        {
          label: "Descanso Largo",
          click: () => {
            e.webContents.send("menu-action", "timer:mode:longBreak");
          }
        }
      ]
    },
    // Navigate menu
    {
      label: "Navegar",
      submenu: [
        {
          label: "Dashboard",
          accelerator: "CmdOrCtrl+1",
          click: () => {
            e.webContents.send("menu-action", "navigate:dashboard");
          }
        },
        {
          label: "Tareas",
          accelerator: "CmdOrCtrl+2",
          click: () => {
            e.webContents.send("menu-action", "navigate:tasks");
          }
        },
        {
          label: "Proyectos",
          accelerator: "CmdOrCtrl+3",
          click: () => {
            e.webContents.send("menu-action", "navigate:projects");
          }
        },
        {
          label: "Timer",
          accelerator: "CmdOrCtrl+4",
          click: () => {
            e.webContents.send("menu-action", "navigate:timer");
          }
        },
        {
          label: "Workspaces",
          accelerator: "CmdOrCtrl+6",
          click: () => {
            e.webContents.send("menu-action", "navigate:workspaces");
          }
        },
        {
          label: "Analytics",
          accelerator: "CmdOrCtrl+5",
          click: () => {
            e.webContents.send("menu-action", "navigate:analytics");
          }
        },
        { type: "separator" },
        {
          label: "Configuración",
          accelerator: t ? "CmdOrCtrl+," : "CmdOrCtrl+Shift+,",
          click: () => {
            e.webContents.send("menu-action", "navigate:settings");
          }
        }
      ]
    },
    // Window menu
    {
      label: "Ventana",
      submenu: [
        { role: "minimize", label: "Minimizar" },
        { role: "zoom", label: "Zoom" },
        ...t ? [
          { type: "separator" },
          { role: "front", label: "Traer Todo al Frente" },
          { type: "separator" },
          { role: "window" }
        ] : [{ role: "close", label: "Cerrar" }]
      ]
    },
    // Help menu
    {
      label: "Ayuda",
      role: "help",
      submenu: [
        {
          label: "Documentación",
          click: async () => {
            await ca.openExternal("https://ordo-todo.com/docs");
          }
        },
        {
          label: "Atajos de Teclado",
          accelerator: "CmdOrCtrl+/",
          click: () => {
            e.webContents.send("menu-action", "help:shortcuts");
          }
        },
        { type: "separator" },
        {
          label: "Reportar un Problema",
          click: async () => {
            await ca.openExternal("https://github.com/tiagofur/ordo-todo/issues/new");
          }
        },
        {
          label: "Solicitar Función",
          click: async () => {
            await ca.openExternal("https://github.com/tiagofur/ordo-todo/discussions/new?category=ideas");
          }
        },
        { type: "separator" },
        ...t ? [] : [
          {
            label: "Acerca de Ordo-Todo",
            click: () => {
              e.webContents.send("menu-action", "help:about");
            }
          }
        ]
      ]
    }
  ], r = Io.buildFromTemplate(i);
  return Io.setApplicationMenu(r), r;
}
var St = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function Dm(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var fn = { exports: {} }, da, Ou;
function $m() {
  return Ou || (Ou = 1, da = (e) => {
    const t = typeof e;
    return e !== null && (t === "object" || t === "function");
  }), da;
}
var fa, Nu;
function km() {
  if (Nu) return fa;
  Nu = 1;
  const e = $m(), t = /* @__PURE__ */ new Set([
    "__proto__",
    "prototype",
    "constructor"
  ]), i = (u) => !u.some((n) => t.has(n));
  function r(u) {
    const n = u.split("."), s = [];
    for (let d = 0; d < n.length; d++) {
      let a = n[d];
      for (; a[a.length - 1] === "\\" && n[d + 1] !== void 0; )
        a = a.slice(0, -1) + ".", a += n[++d];
      s.push(a);
    }
    return i(s) ? s : [];
  }
  return fa = {
    get(u, n, s) {
      if (!e(u) || typeof n != "string")
        return s === void 0 ? u : s;
      const d = r(n);
      if (d.length !== 0) {
        for (let a = 0; a < d.length; a++)
          if (u = u[d[a]], u == null) {
            if (a !== d.length - 1)
              return s;
            break;
          }
        return u === void 0 ? s : u;
      }
    },
    set(u, n, s) {
      if (!e(u) || typeof n != "string")
        return u;
      const d = u, a = r(n);
      for (let l = 0; l < a.length; l++) {
        const o = a[l];
        e(u[o]) || (u[o] = {}), l === a.length - 1 && (u[o] = s), u = u[o];
      }
      return d;
    },
    delete(u, n) {
      if (!e(u) || typeof n != "string")
        return !1;
      const s = r(n);
      for (let d = 0; d < s.length; d++) {
        const a = s[d];
        if (d === s.length - 1)
          return delete u[a], !0;
        if (u = u[a], !e(u))
          return !1;
      }
    },
    has(u, n) {
      if (!e(u) || typeof n != "string")
        return !1;
      const s = r(n);
      if (s.length === 0)
        return !1;
      for (let d = 0; d < s.length; d++)
        if (e(u)) {
          if (!(s[d] in u))
            return !1;
          u = u[s[d]];
        } else
          return !1;
      return !0;
    }
  }, fa;
}
var Cn = { exports: {} }, In = { exports: {} }, Dn = { exports: {} }, $n = { exports: {} }, Pu;
function Lm() {
  if (Pu) return $n.exports;
  Pu = 1;
  const e = Tt;
  return $n.exports = (t) => new Promise((i) => {
    e.access(t, (r) => {
      i(!r);
    });
  }), $n.exports.sync = (t) => {
    try {
      return e.accessSync(t), !0;
    } catch {
      return !1;
    }
  }, $n.exports;
}
var kn = { exports: {} }, Ln = { exports: {} }, Cu;
function Fm() {
  if (Cu) return Ln.exports;
  Cu = 1;
  const e = (t, ...i) => new Promise((r) => {
    r(t(...i));
  });
  return Ln.exports = e, Ln.exports.default = e, Ln.exports;
}
var Iu;
function Um() {
  if (Iu) return kn.exports;
  Iu = 1;
  const e = Fm(), t = (i) => {
    if (!((Number.isInteger(i) || i === 1 / 0) && i > 0))
      return Promise.reject(new TypeError("Expected `concurrency` to be a number from 1 and up"));
    const r = [];
    let u = 0;
    const n = () => {
      u--, r.length > 0 && r.shift()();
    }, s = (l, o, ...f) => {
      u++;
      const c = e(l, ...f);
      o(c), c.then(n, n);
    }, d = (l, o, ...f) => {
      u < i ? s(l, o, ...f) : r.push(s.bind(null, l, o, ...f));
    }, a = (l, ...o) => new Promise((f) => d(l, f, ...o));
    return Object.defineProperties(a, {
      activeCount: {
        get: () => u
      },
      pendingCount: {
        get: () => r.length
      },
      clearQueue: {
        value: () => {
          r.length = 0;
        }
      }
    }), a;
  };
  return kn.exports = t, kn.exports.default = t, kn.exports;
}
var ha, Du;
function qm() {
  if (Du) return ha;
  Du = 1;
  const e = Um();
  class t extends Error {
    constructor(n) {
      super(), this.value = n;
    }
  }
  const i = (u, n) => Promise.resolve(u).then(n), r = (u) => Promise.all(u).then((n) => n[1] === !0 && Promise.reject(new t(n[0])));
  return ha = (u, n, s) => {
    s = Object.assign({
      concurrency: 1 / 0,
      preserveOrder: !0
    }, s);
    const d = e(s.concurrency), a = [...u].map((o) => [o, d(i, o, n)]), l = e(s.preserveOrder ? 1 : 1 / 0);
    return Promise.all(a.map((o) => l(r, o))).then(() => {
    }).catch((o) => o instanceof t ? o.value : Promise.reject(o));
  }, ha;
}
var $u;
function xm() {
  if ($u) return Dn.exports;
  $u = 1;
  const e = $e, t = Lm(), i = qm();
  return Dn.exports = (r, u) => (u = Object.assign({
    cwd: process.cwd()
  }, u), i(r, (n) => t(e.resolve(u.cwd, n)), u)), Dn.exports.sync = (r, u) => {
    u = Object.assign({
      cwd: process.cwd()
    }, u);
    for (const n of r)
      if (t.sync(e.resolve(u.cwd, n)))
        return n;
  }, Dn.exports;
}
var ku;
function Mm() {
  if (ku) return In.exports;
  ku = 1;
  const e = $e, t = xm();
  return In.exports = (i, r = {}) => {
    const u = e.resolve(r.cwd || ""), { root: n } = e.parse(u), s = [].concat(i);
    return new Promise((d) => {
      (function a(l) {
        t(s, { cwd: l }).then((o) => {
          o ? d(e.join(l, o)) : l === n ? d(null) : a(e.dirname(l));
        });
      })(u);
    });
  }, In.exports.sync = (i, r = {}) => {
    let u = e.resolve(r.cwd || "");
    const { root: n } = e.parse(u), s = [].concat(i);
    for (; ; ) {
      const d = t.sync(s, { cwd: u });
      if (d)
        return e.join(u, d);
      if (u === n)
        return null;
      u = e.dirname(u);
    }
  }, In.exports;
}
var Lu;
function jm() {
  if (Lu) return Cn.exports;
  Lu = 1;
  const e = Mm();
  return Cn.exports = async ({ cwd: t } = {}) => e("package.json", { cwd: t }), Cn.exports.sync = ({ cwd: t } = {}) => e.sync("package.json", { cwd: t }), Cn.exports;
}
var Fn = { exports: {} }, Fu;
function Bm() {
  if (Fu) return Fn.exports;
  Fu = 1;
  const e = $e, t = _n, i = t.homedir(), r = t.tmpdir(), { env: u } = process, n = (l) => {
    const o = e.join(i, "Library");
    return {
      data: e.join(o, "Application Support", l),
      config: e.join(o, "Preferences", l),
      cache: e.join(o, "Caches", l),
      log: e.join(o, "Logs", l),
      temp: e.join(r, l)
    };
  }, s = (l) => {
    const o = u.APPDATA || e.join(i, "AppData", "Roaming"), f = u.LOCALAPPDATA || e.join(i, "AppData", "Local");
    return {
      // Data/config/cache/log are invented by me as Windows isn't opinionated about this
      data: e.join(f, l, "Data"),
      config: e.join(o, l, "Config"),
      cache: e.join(f, l, "Cache"),
      log: e.join(f, l, "Log"),
      temp: e.join(r, l)
    };
  }, d = (l) => {
    const o = e.basename(i);
    return {
      data: e.join(u.XDG_DATA_HOME || e.join(i, ".local", "share"), l),
      config: e.join(u.XDG_CONFIG_HOME || e.join(i, ".config"), l),
      cache: e.join(u.XDG_CACHE_HOME || e.join(i, ".cache"), l),
      // https://wiki.debian.org/XDGBaseDirectorySpecification#state
      log: e.join(u.XDG_STATE_HOME || e.join(i, ".local", "state"), l),
      temp: e.join(r, o, l)
    };
  }, a = (l, o) => {
    if (typeof l != "string")
      throw new TypeError(`Expected string, got ${typeof l}`);
    return o = Object.assign({ suffix: "nodejs" }, o), o.suffix && (l += `-${o.suffix}`), process.platform === "darwin" ? n(l) : process.platform === "win32" ? s(l) : d(l);
  };
  return Fn.exports = a, Fn.exports.default = a, Fn.exports;
}
var _t = {}, Ue = {}, Uu;
function vn() {
  if (Uu) return Ue;
  Uu = 1, Object.defineProperty(Ue, "__esModule", { value: !0 }), Ue.NOOP = Ue.LIMIT_FILES_DESCRIPTORS = Ue.LIMIT_BASENAME_LENGTH = Ue.IS_USER_ROOT = Ue.IS_POSIX = Ue.DEFAULT_TIMEOUT_SYNC = Ue.DEFAULT_TIMEOUT_ASYNC = Ue.DEFAULT_WRITE_OPTIONS = Ue.DEFAULT_READ_OPTIONS = Ue.DEFAULT_FOLDER_MODE = Ue.DEFAULT_FILE_MODE = Ue.DEFAULT_ENCODING = void 0;
  const e = "utf8";
  Ue.DEFAULT_ENCODING = e;
  const t = 438;
  Ue.DEFAULT_FILE_MODE = t;
  const i = 511;
  Ue.DEFAULT_FOLDER_MODE = i;
  const r = {};
  Ue.DEFAULT_READ_OPTIONS = r;
  const u = {};
  Ue.DEFAULT_WRITE_OPTIONS = u;
  const n = 5e3;
  Ue.DEFAULT_TIMEOUT_ASYNC = n;
  const s = 100;
  Ue.DEFAULT_TIMEOUT_SYNC = s;
  const d = !!process.getuid;
  Ue.IS_POSIX = d;
  const a = process.getuid ? !process.getuid() : !1;
  Ue.IS_USER_ROOT = a;
  const l = 128;
  Ue.LIMIT_BASENAME_LENGTH = l;
  const o = 1e4;
  Ue.LIMIT_FILES_DESCRIPTORS = o;
  const f = () => {
  };
  return Ue.NOOP = f, Ue;
}
var Un = {}, tr = {}, qu;
function Hm() {
  if (qu) return tr;
  qu = 1, Object.defineProperty(tr, "__esModule", { value: !0 }), tr.attemptifySync = tr.attemptifyAsync = void 0;
  const e = vn(), t = (r, u = e.NOOP) => function() {
    return r.apply(void 0, arguments).catch(u);
  };
  tr.attemptifyAsync = t;
  const i = (r, u = e.NOOP) => function() {
    try {
      return r.apply(void 0, arguments);
    } catch (n) {
      return u(n);
    }
  };
  return tr.attemptifySync = i, tr;
}
var qn = {}, xu;
function Gm() {
  if (xu) return qn;
  xu = 1, Object.defineProperty(qn, "__esModule", { value: !0 });
  const e = vn(), t = {
    isChangeErrorOk: (i) => {
      const { code: r } = i;
      return r === "ENOSYS" || !e.IS_USER_ROOT && (r === "EINVAL" || r === "EPERM");
    },
    isRetriableError: (i) => {
      const { code: r } = i;
      return r === "EMFILE" || r === "ENFILE" || r === "EAGAIN" || r === "EBUSY" || r === "EACCESS" || r === "EACCS" || r === "EPERM";
    },
    onChangeError: (i) => {
      if (!t.isChangeErrorOk(i))
        throw i;
    }
  };
  return qn.default = t, qn;
}
var rr = {}, xn = {}, Mu;
function Vm() {
  if (Mu) return xn;
  Mu = 1, Object.defineProperty(xn, "__esModule", { value: !0 });
  const t = {
    interval: 25,
    intervalId: void 0,
    limit: vn().LIMIT_FILES_DESCRIPTORS,
    queueActive: /* @__PURE__ */ new Set(),
    queueWaiting: /* @__PURE__ */ new Set(),
    init: () => {
      t.intervalId || (t.intervalId = setInterval(t.tick, t.interval));
    },
    reset: () => {
      t.intervalId && (clearInterval(t.intervalId), delete t.intervalId);
    },
    add: (i) => {
      t.queueWaiting.add(i), t.queueActive.size < t.limit / 2 ? t.tick() : t.init();
    },
    remove: (i) => {
      t.queueWaiting.delete(i), t.queueActive.delete(i);
    },
    schedule: () => new Promise((i) => {
      const r = () => t.remove(u), u = () => i(r);
      t.add(u);
    }),
    tick: () => {
      if (!(t.queueActive.size >= t.limit)) {
        if (!t.queueWaiting.size)
          return t.reset();
        for (const i of t.queueWaiting) {
          if (t.queueActive.size >= t.limit)
            break;
          t.queueWaiting.delete(i), t.queueActive.add(i), i();
        }
      }
    }
  };
  return xn.default = t, xn;
}
var ju;
function zm() {
  if (ju) return rr;
  ju = 1, Object.defineProperty(rr, "__esModule", { value: !0 }), rr.retryifySync = rr.retryifyAsync = void 0;
  const e = Vm(), t = (r, u) => function(n) {
    return function s() {
      return e.default.schedule().then((d) => r.apply(void 0, arguments).then((a) => (d(), a), (a) => {
        if (d(), Date.now() >= n)
          throw a;
        if (u(a)) {
          const l = Math.round(100 + 400 * Math.random());
          return new Promise((f) => setTimeout(f, l)).then(() => s.apply(void 0, arguments));
        }
        throw a;
      }));
    };
  };
  rr.retryifyAsync = t;
  const i = (r, u) => function(n) {
    return function s() {
      try {
        return r.apply(void 0, arguments);
      } catch (d) {
        if (Date.now() > n)
          throw d;
        if (u(d))
          return s.apply(void 0, arguments);
        throw d;
      }
    };
  };
  return rr.retryifySync = i, rr;
}
var Bu;
function Ih() {
  if (Bu) return Un;
  Bu = 1, Object.defineProperty(Un, "__esModule", { value: !0 });
  const e = Tt, t = yn, i = Hm(), r = Gm(), u = zm(), n = {
    chmodAttempt: i.attemptifyAsync(t.promisify(e.chmod), r.default.onChangeError),
    chownAttempt: i.attemptifyAsync(t.promisify(e.chown), r.default.onChangeError),
    closeAttempt: i.attemptifyAsync(t.promisify(e.close)),
    fsyncAttempt: i.attemptifyAsync(t.promisify(e.fsync)),
    mkdirAttempt: i.attemptifyAsync(t.promisify(e.mkdir)),
    realpathAttempt: i.attemptifyAsync(t.promisify(e.realpath)),
    statAttempt: i.attemptifyAsync(t.promisify(e.stat)),
    unlinkAttempt: i.attemptifyAsync(t.promisify(e.unlink)),
    closeRetry: u.retryifyAsync(t.promisify(e.close), r.default.isRetriableError),
    fsyncRetry: u.retryifyAsync(t.promisify(e.fsync), r.default.isRetriableError),
    openRetry: u.retryifyAsync(t.promisify(e.open), r.default.isRetriableError),
    readFileRetry: u.retryifyAsync(t.promisify(e.readFile), r.default.isRetriableError),
    renameRetry: u.retryifyAsync(t.promisify(e.rename), r.default.isRetriableError),
    statRetry: u.retryifyAsync(t.promisify(e.stat), r.default.isRetriableError),
    writeRetry: u.retryifyAsync(t.promisify(e.write), r.default.isRetriableError),
    chmodSyncAttempt: i.attemptifySync(e.chmodSync, r.default.onChangeError),
    chownSyncAttempt: i.attemptifySync(e.chownSync, r.default.onChangeError),
    closeSyncAttempt: i.attemptifySync(e.closeSync),
    mkdirSyncAttempt: i.attemptifySync(e.mkdirSync),
    realpathSyncAttempt: i.attemptifySync(e.realpathSync),
    statSyncAttempt: i.attemptifySync(e.statSync),
    unlinkSyncAttempt: i.attemptifySync(e.unlinkSync),
    closeSyncRetry: u.retryifySync(e.closeSync, r.default.isRetriableError),
    fsyncSyncRetry: u.retryifySync(e.fsyncSync, r.default.isRetriableError),
    openSyncRetry: u.retryifySync(e.openSync, r.default.isRetriableError),
    readFileSyncRetry: u.retryifySync(e.readFileSync, r.default.isRetriableError),
    renameSyncRetry: u.retryifySync(e.renameSync, r.default.isRetriableError),
    statSyncRetry: u.retryifySync(e.statSync, r.default.isRetriableError),
    writeSyncRetry: u.retryifySync(e.writeSync, r.default.isRetriableError)
  };
  return Un.default = n, Un;
}
var Mn = {}, Hu;
function Ym() {
  if (Hu) return Mn;
  Hu = 1, Object.defineProperty(Mn, "__esModule", { value: !0 });
  const e = {
    isFunction: (t) => typeof t == "function",
    isString: (t) => typeof t == "string",
    isUndefined: (t) => typeof t > "u"
  };
  return Mn.default = e, Mn;
}
var jn = {}, Gu;
function Xm() {
  if (Gu) return jn;
  Gu = 1, Object.defineProperty(jn, "__esModule", { value: !0 });
  const e = {}, t = {
    next: (i) => {
      const r = e[i];
      if (!r)
        return;
      r.shift();
      const u = r[0];
      u ? u(() => t.next(i)) : delete e[i];
    },
    schedule: (i) => new Promise((r) => {
      let u = e[i];
      u || (u = e[i] = []), u.push(r), !(u.length > 1) && r(() => t.next(i));
    })
  };
  return jn.default = t, jn;
}
var Bn = {}, Vu;
function Wm() {
  if (Vu) return Bn;
  Vu = 1, Object.defineProperty(Bn, "__esModule", { value: !0 });
  const e = $e, t = vn(), i = Ih(), r = {
    store: {},
    create: (u) => {
      const n = `000000${Math.floor(Math.random() * 16777215).toString(16)}`.slice(-6), s = Date.now().toString().slice(-10), d = "tmp-", a = `.${d}${s}${n}`;
      return `${u}${a}`;
    },
    get: (u, n, s = !0) => {
      const d = r.truncate(n(u));
      return d in r.store ? r.get(u, n, s) : (r.store[d] = s, [d, () => delete r.store[d]]);
    },
    purge: (u) => {
      r.store[u] && (delete r.store[u], i.default.unlinkAttempt(u));
    },
    purgeSync: (u) => {
      r.store[u] && (delete r.store[u], i.default.unlinkSyncAttempt(u));
    },
    purgeSyncAll: () => {
      for (const u in r.store)
        r.purgeSync(u);
    },
    truncate: (u) => {
      const n = e.basename(u);
      if (n.length <= t.LIMIT_BASENAME_LENGTH)
        return u;
      const s = /^(\.?)(.*?)((?:\.[^.]+)?(?:\.tmp-\d{10}[a-f0-9]{6})?)$/.exec(n);
      if (!s)
        return u;
      const d = n.length - t.LIMIT_BASENAME_LENGTH;
      return `${u.slice(0, -n.length)}${s[1]}${s[2].slice(0, -d)}${s[3]}`;
    }
  };
  return process.on("exit", r.purgeSyncAll), Bn.default = r, Bn;
}
var zu;
function Km() {
  if (zu) return _t;
  zu = 1, Object.defineProperty(_t, "__esModule", { value: !0 }), _t.writeFileSync = _t.writeFile = _t.readFileSync = _t.readFile = void 0;
  const e = $e, t = vn(), i = Ih(), r = Ym(), u = Xm(), n = Wm();
  function s(f, c = t.DEFAULT_READ_OPTIONS) {
    var p;
    if (r.default.isString(c))
      return s(f, { encoding: c });
    const y = Date.now() + ((p = c.timeout) !== null && p !== void 0 ? p : t.DEFAULT_TIMEOUT_ASYNC);
    return i.default.readFileRetry(y)(f, c);
  }
  _t.readFile = s;
  function d(f, c = t.DEFAULT_READ_OPTIONS) {
    var p;
    if (r.default.isString(c))
      return d(f, { encoding: c });
    const y = Date.now() + ((p = c.timeout) !== null && p !== void 0 ? p : t.DEFAULT_TIMEOUT_SYNC);
    return i.default.readFileSyncRetry(y)(f, c);
  }
  _t.readFileSync = d;
  const a = (f, c, p, y) => {
    if (r.default.isFunction(p))
      return a(f, c, t.DEFAULT_WRITE_OPTIONS, p);
    const E = l(f, c, p);
    return y && E.then(y, y), E;
  };
  _t.writeFile = a;
  const l = async (f, c, p = t.DEFAULT_WRITE_OPTIONS) => {
    var y;
    if (r.default.isString(p))
      return l(f, c, { encoding: p });
    const E = Date.now() + ((y = p.timeout) !== null && y !== void 0 ? y : t.DEFAULT_TIMEOUT_ASYNC);
    let h = null, _ = null, g = null, w = null, b = null;
    try {
      p.schedule && (h = await p.schedule(f)), _ = await u.default.schedule(f), f = await i.default.realpathAttempt(f) || f, [w, g] = n.default.get(f, p.tmpCreate || n.default.create, p.tmpPurge !== !1);
      const R = t.IS_POSIX && r.default.isUndefined(p.chown), v = r.default.isUndefined(p.mode);
      if (R || v) {
        const O = await i.default.statAttempt(f);
        O && (p = { ...p }, R && (p.chown = { uid: O.uid, gid: O.gid }), v && (p.mode = O.mode));
      }
      const S = e.dirname(f);
      await i.default.mkdirAttempt(S, {
        mode: t.DEFAULT_FOLDER_MODE,
        recursive: !0
      }), b = await i.default.openRetry(E)(w, "w", p.mode || t.DEFAULT_FILE_MODE), p.tmpCreated && p.tmpCreated(w), r.default.isString(c) ? await i.default.writeRetry(E)(b, c, 0, p.encoding || t.DEFAULT_ENCODING) : r.default.isUndefined(c) || await i.default.writeRetry(E)(b, c, 0, c.length, 0), p.fsync !== !1 && (p.fsyncWait !== !1 ? await i.default.fsyncRetry(E)(b) : i.default.fsyncAttempt(b)), await i.default.closeRetry(E)(b), b = null, p.chown && await i.default.chownAttempt(w, p.chown.uid, p.chown.gid), p.mode && await i.default.chmodAttempt(w, p.mode);
      try {
        await i.default.renameRetry(E)(w, f);
      } catch (O) {
        if (O.code !== "ENAMETOOLONG")
          throw O;
        await i.default.renameRetry(E)(w, n.default.truncate(f));
      }
      g(), w = null;
    } finally {
      b && await i.default.closeAttempt(b), w && n.default.purge(w), h && h(), _ && _();
    }
  }, o = (f, c, p = t.DEFAULT_WRITE_OPTIONS) => {
    var y;
    if (r.default.isString(p))
      return o(f, c, { encoding: p });
    const E = Date.now() + ((y = p.timeout) !== null && y !== void 0 ? y : t.DEFAULT_TIMEOUT_SYNC);
    let h = null, _ = null, g = null;
    try {
      f = i.default.realpathSyncAttempt(f) || f, [_, h] = n.default.get(f, p.tmpCreate || n.default.create, p.tmpPurge !== !1);
      const w = t.IS_POSIX && r.default.isUndefined(p.chown), b = r.default.isUndefined(p.mode);
      if (w || b) {
        const v = i.default.statSyncAttempt(f);
        v && (p = { ...p }, w && (p.chown = { uid: v.uid, gid: v.gid }), b && (p.mode = v.mode));
      }
      const R = e.dirname(f);
      i.default.mkdirSyncAttempt(R, {
        mode: t.DEFAULT_FOLDER_MODE,
        recursive: !0
      }), g = i.default.openSyncRetry(E)(_, "w", p.mode || t.DEFAULT_FILE_MODE), p.tmpCreated && p.tmpCreated(_), r.default.isString(c) ? i.default.writeSyncRetry(E)(g, c, 0, p.encoding || t.DEFAULT_ENCODING) : r.default.isUndefined(c) || i.default.writeSyncRetry(E)(g, c, 0, c.length, 0), p.fsync !== !1 && (p.fsyncWait !== !1 ? i.default.fsyncSyncRetry(E)(g) : i.default.fsyncAttempt(g)), i.default.closeSyncRetry(E)(g), g = null, p.chown && i.default.chownSyncAttempt(_, p.chown.uid, p.chown.gid), p.mode && i.default.chmodSyncAttempt(_, p.mode);
      try {
        i.default.renameSyncRetry(E)(_, f);
      } catch (v) {
        if (v.code !== "ENAMETOOLONG")
          throw v;
        i.default.renameSyncRetry(E)(_, n.default.truncate(f));
      }
      h(), _ = null;
    } finally {
      g && i.default.closeSyncAttempt(g), _ && n.default.purge(_);
    }
  };
  return _t.writeFileSync = o, _t;
}
var Hn = { exports: {} }, pa = {}, It = {}, nr = {}, ma = {}, ga = {}, ya = {}, Yu;
function Yi() {
  return Yu || (Yu = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.regexpCode = e.getEsmExportName = e.getProperty = e.safeStringify = e.stringify = e.strConcat = e.addCodeArg = e.str = e._ = e.nil = e._Code = e.Name = e.IDENTIFIER = e._CodeOrName = void 0;
    class t {
    }
    e._CodeOrName = t, e.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
    class i extends t {
      constructor(g) {
        if (super(), !e.IDENTIFIER.test(g))
          throw new Error("CodeGen: name must be a valid identifier");
        this.str = g;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        return !1;
      }
      get names() {
        return { [this.str]: 1 };
      }
    }
    e.Name = i;
    class r extends t {
      constructor(g) {
        super(), this._items = typeof g == "string" ? [g] : g;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        if (this._items.length > 1)
          return !1;
        const g = this._items[0];
        return g === "" || g === '""';
      }
      get str() {
        var g;
        return (g = this._str) !== null && g !== void 0 ? g : this._str = this._items.reduce((w, b) => `${w}${b}`, "");
      }
      get names() {
        var g;
        return (g = this._names) !== null && g !== void 0 ? g : this._names = this._items.reduce((w, b) => (b instanceof i && (w[b.str] = (w[b.str] || 0) + 1), w), {});
      }
    }
    e._Code = r, e.nil = new r("");
    function u(_, ...g) {
      const w = [_[0]];
      let b = 0;
      for (; b < g.length; )
        d(w, g[b]), w.push(_[++b]);
      return new r(w);
    }
    e._ = u;
    const n = new r("+");
    function s(_, ...g) {
      const w = [p(_[0])];
      let b = 0;
      for (; b < g.length; )
        w.push(n), d(w, g[b]), w.push(n, p(_[++b]));
      return a(w), new r(w);
    }
    e.str = s;
    function d(_, g) {
      g instanceof r ? _.push(...g._items) : g instanceof i ? _.push(g) : _.push(f(g));
    }
    e.addCodeArg = d;
    function a(_) {
      let g = 1;
      for (; g < _.length - 1; ) {
        if (_[g] === n) {
          const w = l(_[g - 1], _[g + 1]);
          if (w !== void 0) {
            _.splice(g - 1, 3, w);
            continue;
          }
          _[g++] = "+";
        }
        g++;
      }
    }
    function l(_, g) {
      if (g === '""')
        return _;
      if (_ === '""')
        return g;
      if (typeof _ == "string")
        return g instanceof i || _[_.length - 1] !== '"' ? void 0 : typeof g != "string" ? `${_.slice(0, -1)}${g}"` : g[0] === '"' ? _.slice(0, -1) + g.slice(1) : void 0;
      if (typeof g == "string" && g[0] === '"' && !(_ instanceof i))
        return `"${_}${g.slice(1)}`;
    }
    function o(_, g) {
      return g.emptyStr() ? _ : _.emptyStr() ? g : s`${_}${g}`;
    }
    e.strConcat = o;
    function f(_) {
      return typeof _ == "number" || typeof _ == "boolean" || _ === null ? _ : p(Array.isArray(_) ? _.join(",") : _);
    }
    function c(_) {
      return new r(p(_));
    }
    e.stringify = c;
    function p(_) {
      return JSON.stringify(_).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
    }
    e.safeStringify = p;
    function y(_) {
      return typeof _ == "string" && e.IDENTIFIER.test(_) ? new r(`.${_}`) : u`[${_}]`;
    }
    e.getProperty = y;
    function E(_) {
      if (typeof _ == "string" && e.IDENTIFIER.test(_))
        return new r(`${_}`);
      throw new Error(`CodeGen: invalid export name: ${_}, use explicit $id name mapping`);
    }
    e.getEsmExportName = E;
    function h(_) {
      return new r(_.toString());
    }
    e.regexpCode = h;
  })(ya)), ya;
}
var _a = {}, Xu;
function Wu() {
  return Xu || (Xu = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.ValueScope = e.ValueScopeName = e.Scope = e.varKinds = e.UsedValueState = void 0;
    const t = Yi();
    class i extends Error {
      constructor(l) {
        super(`CodeGen: "code" for ${l} not defined`), this.value = l.value;
      }
    }
    var r;
    (function(a) {
      a[a.Started = 0] = "Started", a[a.Completed = 1] = "Completed";
    })(r || (e.UsedValueState = r = {})), e.varKinds = {
      const: new t.Name("const"),
      let: new t.Name("let"),
      var: new t.Name("var")
    };
    class u {
      constructor({ prefixes: l, parent: o } = {}) {
        this._names = {}, this._prefixes = l, this._parent = o;
      }
      toName(l) {
        return l instanceof t.Name ? l : this.name(l);
      }
      name(l) {
        return new t.Name(this._newName(l));
      }
      _newName(l) {
        const o = this._names[l] || this._nameGroup(l);
        return `${l}${o.index++}`;
      }
      _nameGroup(l) {
        var o, f;
        if (!((f = (o = this._parent) === null || o === void 0 ? void 0 : o._prefixes) === null || f === void 0) && f.has(l) || this._prefixes && !this._prefixes.has(l))
          throw new Error(`CodeGen: prefix "${l}" is not allowed in this scope`);
        return this._names[l] = { prefix: l, index: 0 };
      }
    }
    e.Scope = u;
    class n extends t.Name {
      constructor(l, o) {
        super(o), this.prefix = l;
      }
      setValue(l, { property: o, itemIndex: f }) {
        this.value = l, this.scopePath = (0, t._)`.${new t.Name(o)}[${f}]`;
      }
    }
    e.ValueScopeName = n;
    const s = (0, t._)`\n`;
    class d extends u {
      constructor(l) {
        super(l), this._values = {}, this._scope = l.scope, this.opts = { ...l, _n: l.lines ? s : t.nil };
      }
      get() {
        return this._scope;
      }
      name(l) {
        return new n(l, this._newName(l));
      }
      value(l, o) {
        var f;
        if (o.ref === void 0)
          throw new Error("CodeGen: ref must be passed in value");
        const c = this.toName(l), { prefix: p } = c, y = (f = o.key) !== null && f !== void 0 ? f : o.ref;
        let E = this._values[p];
        if (E) {
          const g = E.get(y);
          if (g)
            return g;
        } else
          E = this._values[p] = /* @__PURE__ */ new Map();
        E.set(y, c);
        const h = this._scope[p] || (this._scope[p] = []), _ = h.length;
        return h[_] = o.ref, c.setValue(o, { property: p, itemIndex: _ }), c;
      }
      getValue(l, o) {
        const f = this._values[l];
        if (f)
          return f.get(o);
      }
      scopeRefs(l, o = this._values) {
        return this._reduceValues(o, (f) => {
          if (f.scopePath === void 0)
            throw new Error(`CodeGen: name "${f}" has no value`);
          return (0, t._)`${l}${f.scopePath}`;
        });
      }
      scopeCode(l = this._values, o, f) {
        return this._reduceValues(l, (c) => {
          if (c.value === void 0)
            throw new Error(`CodeGen: name "${c}" has no value`);
          return c.value.code;
        }, o, f);
      }
      _reduceValues(l, o, f = {}, c) {
        let p = t.nil;
        for (const y in l) {
          const E = l[y];
          if (!E)
            continue;
          const h = f[y] = f[y] || /* @__PURE__ */ new Map();
          E.forEach((_) => {
            if (h.has(_))
              return;
            h.set(_, r.Started);
            let g = o(_);
            if (g) {
              const w = this.opts.es5 ? e.varKinds.var : e.varKinds.const;
              p = (0, t._)`${p}${w} ${_} = ${g};${this.opts._n}`;
            } else if (g = c?.(_))
              p = (0, t._)`${p}${g}${this.opts._n}`;
            else
              throw new i(_);
            h.set(_, r.Completed);
          });
        }
        return p;
      }
    }
    e.ValueScope = d;
  })(_a)), _a;
}
var Ku;
function Oe() {
  return Ku || (Ku = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.or = e.and = e.not = e.CodeGen = e.operators = e.varKinds = e.ValueScopeName = e.ValueScope = e.Scope = e.Name = e.regexpCode = e.stringify = e.getProperty = e.nil = e.strConcat = e.str = e._ = void 0;
    const t = Yi(), i = Wu();
    var r = Yi();
    Object.defineProperty(e, "_", { enumerable: !0, get: function() {
      return r._;
    } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
      return r.str;
    } }), Object.defineProperty(e, "strConcat", { enumerable: !0, get: function() {
      return r.strConcat;
    } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
      return r.nil;
    } }), Object.defineProperty(e, "getProperty", { enumerable: !0, get: function() {
      return r.getProperty;
    } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
      return r.stringify;
    } }), Object.defineProperty(e, "regexpCode", { enumerable: !0, get: function() {
      return r.regexpCode;
    } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
      return r.Name;
    } });
    var u = Wu();
    Object.defineProperty(e, "Scope", { enumerable: !0, get: function() {
      return u.Scope;
    } }), Object.defineProperty(e, "ValueScope", { enumerable: !0, get: function() {
      return u.ValueScope;
    } }), Object.defineProperty(e, "ValueScopeName", { enumerable: !0, get: function() {
      return u.ValueScopeName;
    } }), Object.defineProperty(e, "varKinds", { enumerable: !0, get: function() {
      return u.varKinds;
    } }), e.operators = {
      GT: new t._Code(">"),
      GTE: new t._Code(">="),
      LT: new t._Code("<"),
      LTE: new t._Code("<="),
      EQ: new t._Code("==="),
      NEQ: new t._Code("!=="),
      NOT: new t._Code("!"),
      OR: new t._Code("||"),
      AND: new t._Code("&&"),
      ADD: new t._Code("+")
    };
    class n {
      optimizeNodes() {
        return this;
      }
      optimizeNames(P, C) {
        return this;
      }
    }
    class s extends n {
      constructor(P, C, K) {
        super(), this.varKind = P, this.name = C, this.rhs = K;
      }
      render({ es5: P, _n: C }) {
        const K = P ? i.varKinds.var : this.varKind, N = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
        return `${K} ${this.name}${N};` + C;
      }
      optimizeNames(P, C) {
        if (P[this.name.str])
          return this.rhs && (this.rhs = L(this.rhs, P, C)), this;
      }
      get names() {
        return this.rhs instanceof t._CodeOrName ? this.rhs.names : {};
      }
    }
    class d extends n {
      constructor(P, C, K) {
        super(), this.lhs = P, this.rhs = C, this.sideEffects = K;
      }
      render({ _n: P }) {
        return `${this.lhs} = ${this.rhs};` + P;
      }
      optimizeNames(P, C) {
        if (!(this.lhs instanceof t.Name && !P[this.lhs.str] && !this.sideEffects))
          return this.rhs = L(this.rhs, P, C), this;
      }
      get names() {
        const P = this.lhs instanceof t.Name ? {} : { ...this.lhs.names };
        return V(P, this.rhs);
      }
    }
    class a extends d {
      constructor(P, C, K, N) {
        super(P, K, N), this.op = C;
      }
      render({ _n: P }) {
        return `${this.lhs} ${this.op}= ${this.rhs};` + P;
      }
    }
    class l extends n {
      constructor(P) {
        super(), this.label = P, this.names = {};
      }
      render({ _n: P }) {
        return `${this.label}:` + P;
      }
    }
    class o extends n {
      constructor(P) {
        super(), this.label = P, this.names = {};
      }
      render({ _n: P }) {
        return `break${this.label ? ` ${this.label}` : ""};` + P;
      }
    }
    class f extends n {
      constructor(P) {
        super(), this.error = P;
      }
      render({ _n: P }) {
        return `throw ${this.error};` + P;
      }
      get names() {
        return this.error.names;
      }
    }
    class c extends n {
      constructor(P) {
        super(), this.code = P;
      }
      render({ _n: P }) {
        return `${this.code};` + P;
      }
      optimizeNodes() {
        return `${this.code}` ? this : void 0;
      }
      optimizeNames(P, C) {
        return this.code = L(this.code, P, C), this;
      }
      get names() {
        return this.code instanceof t._CodeOrName ? this.code.names : {};
      }
    }
    class p extends n {
      constructor(P = []) {
        super(), this.nodes = P;
      }
      render(P) {
        return this.nodes.reduce((C, K) => C + K.render(P), "");
      }
      optimizeNodes() {
        const { nodes: P } = this;
        let C = P.length;
        for (; C--; ) {
          const K = P[C].optimizeNodes();
          Array.isArray(K) ? P.splice(C, 1, ...K) : K ? P[C] = K : P.splice(C, 1);
        }
        return P.length > 0 ? this : void 0;
      }
      optimizeNames(P, C) {
        const { nodes: K } = this;
        let N = K.length;
        for (; N--; ) {
          const A = K[N];
          A.optimizeNames(P, C) || (B(P, A.names), K.splice(N, 1));
        }
        return K.length > 0 ? this : void 0;
      }
      get names() {
        return this.nodes.reduce((P, C) => U(P, C.names), {});
      }
    }
    class y extends p {
      render(P) {
        return "{" + P._n + super.render(P) + "}" + P._n;
      }
    }
    class E extends p {
    }
    class h extends y {
    }
    h.kind = "else";
    class _ extends y {
      constructor(P, C) {
        super(C), this.condition = P;
      }
      render(P) {
        let C = `if(${this.condition})` + super.render(P);
        return this.else && (C += "else " + this.else.render(P)), C;
      }
      optimizeNodes() {
        super.optimizeNodes();
        const P = this.condition;
        if (P === !0)
          return this.nodes;
        let C = this.else;
        if (C) {
          const K = C.optimizeNodes();
          C = this.else = Array.isArray(K) ? new h(K) : K;
        }
        if (C)
          return P === !1 ? C instanceof _ ? C : C.nodes : this.nodes.length ? this : new _(te(P), C instanceof _ ? [C] : C.nodes);
        if (!(P === !1 || !this.nodes.length))
          return this;
      }
      optimizeNames(P, C) {
        var K;
        if (this.else = (K = this.else) === null || K === void 0 ? void 0 : K.optimizeNames(P, C), !!(super.optimizeNames(P, C) || this.else))
          return this.condition = L(this.condition, P, C), this;
      }
      get names() {
        const P = super.names;
        return V(P, this.condition), this.else && U(P, this.else.names), P;
      }
    }
    _.kind = "if";
    class g extends y {
    }
    g.kind = "for";
    class w extends g {
      constructor(P) {
        super(), this.iteration = P;
      }
      render(P) {
        return `for(${this.iteration})` + super.render(P);
      }
      optimizeNames(P, C) {
        if (super.optimizeNames(P, C))
          return this.iteration = L(this.iteration, P, C), this;
      }
      get names() {
        return U(super.names, this.iteration.names);
      }
    }
    class b extends g {
      constructor(P, C, K, N) {
        super(), this.varKind = P, this.name = C, this.from = K, this.to = N;
      }
      render(P) {
        const C = P.es5 ? i.varKinds.var : this.varKind, { name: K, from: N, to: A } = this;
        return `for(${C} ${K}=${N}; ${K}<${A}; ${K}++)` + super.render(P);
      }
      get names() {
        const P = V(super.names, this.from);
        return V(P, this.to);
      }
    }
    class R extends g {
      constructor(P, C, K, N) {
        super(), this.loop = P, this.varKind = C, this.name = K, this.iterable = N;
      }
      render(P) {
        return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(P);
      }
      optimizeNames(P, C) {
        if (super.optimizeNames(P, C))
          return this.iterable = L(this.iterable, P, C), this;
      }
      get names() {
        return U(super.names, this.iterable.names);
      }
    }
    class v extends y {
      constructor(P, C, K) {
        super(), this.name = P, this.args = C, this.async = K;
      }
      render(P) {
        return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(P);
      }
    }
    v.kind = "func";
    class S extends p {
      render(P) {
        return "return " + super.render(P);
      }
    }
    S.kind = "return";
    class O extends y {
      render(P) {
        let C = "try" + super.render(P);
        return this.catch && (C += this.catch.render(P)), this.finally && (C += this.finally.render(P)), C;
      }
      optimizeNodes() {
        var P, C;
        return super.optimizeNodes(), (P = this.catch) === null || P === void 0 || P.optimizeNodes(), (C = this.finally) === null || C === void 0 || C.optimizeNodes(), this;
      }
      optimizeNames(P, C) {
        var K, N;
        return super.optimizeNames(P, C), (K = this.catch) === null || K === void 0 || K.optimizeNames(P, C), (N = this.finally) === null || N === void 0 || N.optimizeNames(P, C), this;
      }
      get names() {
        const P = super.names;
        return this.catch && U(P, this.catch.names), this.finally && U(P, this.finally.names), P;
      }
    }
    class T extends y {
      constructor(P) {
        super(), this.error = P;
      }
      render(P) {
        return `catch(${this.error})` + super.render(P);
      }
    }
    T.kind = "catch";
    class $ extends y {
      render(P) {
        return "finally" + super.render(P);
      }
    }
    $.kind = "finally";
    class k {
      constructor(P, C = {}) {
        this._values = {}, this._blockStarts = [], this._constants = {}, this.opts = { ...C, _n: C.lines ? `
` : "" }, this._extScope = P, this._scope = new i.Scope({ parent: P }), this._nodes = [new E()];
      }
      toString() {
        return this._root.render(this.opts);
      }
      // returns unique name in the internal scope
      name(P) {
        return this._scope.name(P);
      }
      // reserves unique name in the external scope
      scopeName(P) {
        return this._extScope.name(P);
      }
      // reserves unique name in the external scope and assigns value to it
      scopeValue(P, C) {
        const K = this._extScope.value(P, C);
        return (this._values[K.prefix] || (this._values[K.prefix] = /* @__PURE__ */ new Set())).add(K), K;
      }
      getScopeValue(P, C) {
        return this._extScope.getValue(P, C);
      }
      // return code that assigns values in the external scope to the names that are used internally
      // (same names that were returned by gen.scopeName or gen.scopeValue)
      scopeRefs(P) {
        return this._extScope.scopeRefs(P, this._values);
      }
      scopeCode() {
        return this._extScope.scopeCode(this._values);
      }
      _def(P, C, K, N) {
        const A = this._scope.toName(C);
        return K !== void 0 && N && (this._constants[A.str] = K), this._leafNode(new s(P, A, K)), A;
      }
      // `const` declaration (`var` in es5 mode)
      const(P, C, K) {
        return this._def(i.varKinds.const, P, C, K);
      }
      // `let` declaration with optional assignment (`var` in es5 mode)
      let(P, C, K) {
        return this._def(i.varKinds.let, P, C, K);
      }
      // `var` declaration with optional assignment
      var(P, C, K) {
        return this._def(i.varKinds.var, P, C, K);
      }
      // assignment code
      assign(P, C, K) {
        return this._leafNode(new d(P, C, K));
      }
      // `+=` code
      add(P, C) {
        return this._leafNode(new a(P, e.operators.ADD, C));
      }
      // appends passed SafeExpr to code or executes Block
      code(P) {
        return typeof P == "function" ? P() : P !== t.nil && this._leafNode(new c(P)), this;
      }
      // returns code for object literal for the passed argument list of key-value pairs
      object(...P) {
        const C = ["{"];
        for (const [K, N] of P)
          C.length > 1 && C.push(","), C.push(K), (K !== N || this.opts.es5) && (C.push(":"), (0, t.addCodeArg)(C, N));
        return C.push("}"), new t._Code(C);
      }
      // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
      if(P, C, K) {
        if (this._blockNode(new _(P)), C && K)
          this.code(C).else().code(K).endIf();
        else if (C)
          this.code(C).endIf();
        else if (K)
          throw new Error('CodeGen: "else" body without "then" body');
        return this;
      }
      // `else if` clause - invalid without `if` or after `else` clauses
      elseIf(P) {
        return this._elseNode(new _(P));
      }
      // `else` clause - only valid after `if` or `else if` clauses
      else() {
        return this._elseNode(new h());
      }
      // end `if` statement (needed if gen.if was used only with condition)
      endIf() {
        return this._endBlockNode(_, h);
      }
      _for(P, C) {
        return this._blockNode(P), C && this.code(C).endFor(), this;
      }
      // a generic `for` clause (or statement if `forBody` is passed)
      for(P, C) {
        return this._for(new w(P), C);
      }
      // `for` statement for a range of values
      forRange(P, C, K, N, A = this.opts.es5 ? i.varKinds.var : i.varKinds.let) {
        const J = this._scope.toName(P);
        return this._for(new b(A, J, C, K), () => N(J));
      }
      // `for-of` statement (in es5 mode replace with a normal for loop)
      forOf(P, C, K, N = i.varKinds.const) {
        const A = this._scope.toName(P);
        if (this.opts.es5) {
          const J = C instanceof t.Name ? C : this.var("_arr", C);
          return this.forRange("_i", 0, (0, t._)`${J}.length`, (M) => {
            this.var(A, (0, t._)`${J}[${M}]`), K(A);
          });
        }
        return this._for(new R("of", N, A, C), () => K(A));
      }
      // `for-in` statement.
      // With option `ownProperties` replaced with a `for-of` loop for object keys
      forIn(P, C, K, N = this.opts.es5 ? i.varKinds.var : i.varKinds.const) {
        if (this.opts.ownProperties)
          return this.forOf(P, (0, t._)`Object.keys(${C})`, K);
        const A = this._scope.toName(P);
        return this._for(new R("in", N, A, C), () => K(A));
      }
      // end `for` loop
      endFor() {
        return this._endBlockNode(g);
      }
      // `label` statement
      label(P) {
        return this._leafNode(new l(P));
      }
      // `break` statement
      break(P) {
        return this._leafNode(new o(P));
      }
      // `return` statement
      return(P) {
        const C = new S();
        if (this._blockNode(C), this.code(P), C.nodes.length !== 1)
          throw new Error('CodeGen: "return" should have one node');
        return this._endBlockNode(S);
      }
      // `try` statement
      try(P, C, K) {
        if (!C && !K)
          throw new Error('CodeGen: "try" without "catch" and "finally"');
        const N = new O();
        if (this._blockNode(N), this.code(P), C) {
          const A = this.name("e");
          this._currNode = N.catch = new T(A), C(A);
        }
        return K && (this._currNode = N.finally = new $(), this.code(K)), this._endBlockNode(T, $);
      }
      // `throw` statement
      throw(P) {
        return this._leafNode(new f(P));
      }
      // start self-balancing block
      block(P, C) {
        return this._blockStarts.push(this._nodes.length), P && this.code(P).endBlock(C), this;
      }
      // end the current self-balancing block
      endBlock(P) {
        const C = this._blockStarts.pop();
        if (C === void 0)
          throw new Error("CodeGen: not in self-balancing block");
        const K = this._nodes.length - C;
        if (K < 0 || P !== void 0 && K !== P)
          throw new Error(`CodeGen: wrong number of nodes: ${K} vs ${P} expected`);
        return this._nodes.length = C, this;
      }
      // `function` heading (or definition if funcBody is passed)
      func(P, C = t.nil, K, N) {
        return this._blockNode(new v(P, C, K)), N && this.code(N).endFunc(), this;
      }
      // end function definition
      endFunc() {
        return this._endBlockNode(v);
      }
      optimize(P = 1) {
        for (; P-- > 0; )
          this._root.optimizeNodes(), this._root.optimizeNames(this._root.names, this._constants);
      }
      _leafNode(P) {
        return this._currNode.nodes.push(P), this;
      }
      _blockNode(P) {
        this._currNode.nodes.push(P), this._nodes.push(P);
      }
      _endBlockNode(P, C) {
        const K = this._currNode;
        if (K instanceof P || C && K instanceof C)
          return this._nodes.pop(), this;
        throw new Error(`CodeGen: not in block "${C ? `${P.kind}/${C.kind}` : P.kind}"`);
      }
      _elseNode(P) {
        const C = this._currNode;
        if (!(C instanceof _))
          throw new Error('CodeGen: "else" without "if"');
        return this._currNode = C.else = P, this;
      }
      get _root() {
        return this._nodes[0];
      }
      get _currNode() {
        const P = this._nodes;
        return P[P.length - 1];
      }
      set _currNode(P) {
        const C = this._nodes;
        C[C.length - 1] = P;
      }
    }
    e.CodeGen = k;
    function U(G, P) {
      for (const C in P)
        G[C] = (G[C] || 0) + (P[C] || 0);
      return G;
    }
    function V(G, P) {
      return P instanceof t._CodeOrName ? U(G, P.names) : G;
    }
    function L(G, P, C) {
      if (G instanceof t.Name)
        return K(G);
      if (!N(G))
        return G;
      return new t._Code(G._items.reduce((A, J) => (J instanceof t.Name && (J = K(J)), J instanceof t._Code ? A.push(...J._items) : A.push(J), A), []));
      function K(A) {
        const J = C[A.str];
        return J === void 0 || P[A.str] !== 1 ? A : (delete P[A.str], J);
      }
      function N(A) {
        return A instanceof t._Code && A._items.some((J) => J instanceof t.Name && P[J.str] === 1 && C[J.str] !== void 0);
      }
    }
    function B(G, P) {
      for (const C in P)
        G[C] = (G[C] || 0) - (P[C] || 0);
    }
    function te(G) {
      return typeof G == "boolean" || typeof G == "number" || G === null ? !G : (0, t._)`!${X(G)}`;
    }
    e.not = te;
    const j = x(e.operators.AND);
    function H(...G) {
      return G.reduce(j);
    }
    e.and = H;
    const Y = x(e.operators.OR);
    function F(...G) {
      return G.reduce(Y);
    }
    e.or = F;
    function x(G) {
      return (P, C) => P === t.nil ? C : C === t.nil ? P : (0, t._)`${X(P)} ${G} ${X(C)}`;
    }
    function X(G) {
      return G instanceof t.Name ? G : (0, t._)`(${G})`;
    }
  })(ga)), ga;
}
var Ae = {}, Ju;
function Ie() {
  if (Ju) return Ae;
  Ju = 1, Object.defineProperty(Ae, "__esModule", { value: !0 }), Ae.checkStrictMode = Ae.getErrorPath = Ae.Type = Ae.useFunc = Ae.setEvaluated = Ae.evaluatedPropsToName = Ae.mergeEvaluated = Ae.eachItem = Ae.unescapeJsonPointer = Ae.escapeJsonPointer = Ae.escapeFragment = Ae.unescapeFragment = Ae.schemaRefOrVal = Ae.schemaHasRulesButRef = Ae.schemaHasRules = Ae.checkUnknownRules = Ae.alwaysValidSchema = Ae.toHash = void 0;
  const e = Oe(), t = Yi();
  function i(R) {
    const v = {};
    for (const S of R)
      v[S] = !0;
    return v;
  }
  Ae.toHash = i;
  function r(R, v) {
    return typeof v == "boolean" ? v : Object.keys(v).length === 0 ? !0 : (u(R, v), !n(v, R.self.RULES.all));
  }
  Ae.alwaysValidSchema = r;
  function u(R, v = R.schema) {
    const { opts: S, self: O } = R;
    if (!S.strictSchema || typeof v == "boolean")
      return;
    const T = O.RULES.keywords;
    for (const $ in v)
      T[$] || b(R, `unknown keyword: "${$}"`);
  }
  Ae.checkUnknownRules = u;
  function n(R, v) {
    if (typeof R == "boolean")
      return !R;
    for (const S in R)
      if (v[S])
        return !0;
    return !1;
  }
  Ae.schemaHasRules = n;
  function s(R, v) {
    if (typeof R == "boolean")
      return !R;
    for (const S in R)
      if (S !== "$ref" && v.all[S])
        return !0;
    return !1;
  }
  Ae.schemaHasRulesButRef = s;
  function d({ topSchemaRef: R, schemaPath: v }, S, O, T) {
    if (!T) {
      if (typeof S == "number" || typeof S == "boolean")
        return S;
      if (typeof S == "string")
        return (0, e._)`${S}`;
    }
    return (0, e._)`${R}${v}${(0, e.getProperty)(O)}`;
  }
  Ae.schemaRefOrVal = d;
  function a(R) {
    return f(decodeURIComponent(R));
  }
  Ae.unescapeFragment = a;
  function l(R) {
    return encodeURIComponent(o(R));
  }
  Ae.escapeFragment = l;
  function o(R) {
    return typeof R == "number" ? `${R}` : R.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  Ae.escapeJsonPointer = o;
  function f(R) {
    return R.replace(/~1/g, "/").replace(/~0/g, "~");
  }
  Ae.unescapeJsonPointer = f;
  function c(R, v) {
    if (Array.isArray(R))
      for (const S of R)
        v(S);
    else
      v(R);
  }
  Ae.eachItem = c;
  function p({ mergeNames: R, mergeToName: v, mergeValues: S, resultToName: O }) {
    return (T, $, k, U) => {
      const V = k === void 0 ? $ : k instanceof e.Name ? ($ instanceof e.Name ? R(T, $, k) : v(T, $, k), k) : $ instanceof e.Name ? (v(T, k, $), $) : S($, k);
      return U === e.Name && !(V instanceof e.Name) ? O(T, V) : V;
    };
  }
  Ae.mergeEvaluated = {
    props: p({
      mergeNames: (R, v, S) => R.if((0, e._)`${S} !== true && ${v} !== undefined`, () => {
        R.if((0, e._)`${v} === true`, () => R.assign(S, !0), () => R.assign(S, (0, e._)`${S} || {}`).code((0, e._)`Object.assign(${S}, ${v})`));
      }),
      mergeToName: (R, v, S) => R.if((0, e._)`${S} !== true`, () => {
        v === !0 ? R.assign(S, !0) : (R.assign(S, (0, e._)`${S} || {}`), E(R, S, v));
      }),
      mergeValues: (R, v) => R === !0 ? !0 : { ...R, ...v },
      resultToName: y
    }),
    items: p({
      mergeNames: (R, v, S) => R.if((0, e._)`${S} !== true && ${v} !== undefined`, () => R.assign(S, (0, e._)`${v} === true ? true : ${S} > ${v} ? ${S} : ${v}`)),
      mergeToName: (R, v, S) => R.if((0, e._)`${S} !== true`, () => R.assign(S, v === !0 ? !0 : (0, e._)`${S} > ${v} ? ${S} : ${v}`)),
      mergeValues: (R, v) => R === !0 ? !0 : Math.max(R, v),
      resultToName: (R, v) => R.var("items", v)
    })
  };
  function y(R, v) {
    if (v === !0)
      return R.var("props", !0);
    const S = R.var("props", (0, e._)`{}`);
    return v !== void 0 && E(R, S, v), S;
  }
  Ae.evaluatedPropsToName = y;
  function E(R, v, S) {
    Object.keys(S).forEach((O) => R.assign((0, e._)`${v}${(0, e.getProperty)(O)}`, !0));
  }
  Ae.setEvaluated = E;
  const h = {};
  function _(R, v) {
    return R.scopeValue("func", {
      ref: v,
      code: h[v.code] || (h[v.code] = new t._Code(v.code))
    });
  }
  Ae.useFunc = _;
  var g;
  (function(R) {
    R[R.Num = 0] = "Num", R[R.Str = 1] = "Str";
  })(g || (Ae.Type = g = {}));
  function w(R, v, S) {
    if (R instanceof e.Name) {
      const O = v === g.Num;
      return S ? O ? (0, e._)`"[" + ${R} + "]"` : (0, e._)`"['" + ${R} + "']"` : O ? (0, e._)`"/" + ${R}` : (0, e._)`"/" + ${R}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
    }
    return S ? (0, e.getProperty)(R).toString() : "/" + o(R);
  }
  Ae.getErrorPath = w;
  function b(R, v, S = R.opts.strictSchema) {
    if (S) {
      if (v = `strict mode: ${v}`, S === !0)
        throw new Error(v);
      R.self.logger.warn(v);
    }
  }
  return Ae.checkStrictMode = b, Ae;
}
var Gn = {}, Qu;
function Xt() {
  if (Qu) return Gn;
  Qu = 1, Object.defineProperty(Gn, "__esModule", { value: !0 });
  const e = Oe(), t = {
    // validation function arguments
    data: new e.Name("data"),
    // data passed to validation function
    // args passed from referencing schema
    valCxt: new e.Name("valCxt"),
    // validation/data context - should not be used directly, it is destructured to the names below
    instancePath: new e.Name("instancePath"),
    parentData: new e.Name("parentData"),
    parentDataProperty: new e.Name("parentDataProperty"),
    rootData: new e.Name("rootData"),
    // root data - same as the data passed to the first/top validation function
    dynamicAnchors: new e.Name("dynamicAnchors"),
    // used to support recursiveRef and dynamicRef
    // function scoped variables
    vErrors: new e.Name("vErrors"),
    // null or array of validation errors
    errors: new e.Name("errors"),
    // counter of validation errors
    this: new e.Name("this"),
    // "globals"
    self: new e.Name("self"),
    scope: new e.Name("scope"),
    // JTD serialize/parse name for JSON string and position
    json: new e.Name("json"),
    jsonPos: new e.Name("jsonPos"),
    jsonLen: new e.Name("jsonLen"),
    jsonPart: new e.Name("jsonPart")
  };
  return Gn.default = t, Gn;
}
var Zu;
function Ki() {
  return Zu || (Zu = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
    const t = Oe(), i = Ie(), r = Xt();
    e.keywordError = {
      message: ({ keyword: h }) => (0, t.str)`must pass "${h}" keyword validation`
    }, e.keyword$DataError = {
      message: ({ keyword: h, schemaType: _ }) => _ ? (0, t.str)`"${h}" keyword must be ${_} ($data)` : (0, t.str)`"${h}" keyword is invalid ($data)`
    };
    function u(h, _ = e.keywordError, g, w) {
      const { it: b } = h, { gen: R, compositeRule: v, allErrors: S } = b, O = f(h, _, g);
      w ?? (v || S) ? a(R, O) : l(b, (0, t._)`[${O}]`);
    }
    e.reportError = u;
    function n(h, _ = e.keywordError, g) {
      const { it: w } = h, { gen: b, compositeRule: R, allErrors: v } = w, S = f(h, _, g);
      a(b, S), R || v || l(w, r.default.vErrors);
    }
    e.reportExtraError = n;
    function s(h, _) {
      h.assign(r.default.errors, _), h.if((0, t._)`${r.default.vErrors} !== null`, () => h.if(_, () => h.assign((0, t._)`${r.default.vErrors}.length`, _), () => h.assign(r.default.vErrors, null)));
    }
    e.resetErrorsCount = s;
    function d({ gen: h, keyword: _, schemaValue: g, data: w, errsCount: b, it: R }) {
      if (b === void 0)
        throw new Error("ajv implementation error");
      const v = h.name("err");
      h.forRange("i", b, r.default.errors, (S) => {
        h.const(v, (0, t._)`${r.default.vErrors}[${S}]`), h.if((0, t._)`${v}.instancePath === undefined`, () => h.assign((0, t._)`${v}.instancePath`, (0, t.strConcat)(r.default.instancePath, R.errorPath))), h.assign((0, t._)`${v}.schemaPath`, (0, t.str)`${R.errSchemaPath}/${_}`), R.opts.verbose && (h.assign((0, t._)`${v}.schema`, g), h.assign((0, t._)`${v}.data`, w));
      });
    }
    e.extendErrors = d;
    function a(h, _) {
      const g = h.const("err", _);
      h.if((0, t._)`${r.default.vErrors} === null`, () => h.assign(r.default.vErrors, (0, t._)`[${g}]`), (0, t._)`${r.default.vErrors}.push(${g})`), h.code((0, t._)`${r.default.errors}++`);
    }
    function l(h, _) {
      const { gen: g, validateName: w, schemaEnv: b } = h;
      b.$async ? g.throw((0, t._)`new ${h.ValidationError}(${_})`) : (g.assign((0, t._)`${w}.errors`, _), g.return(!1));
    }
    const o = {
      keyword: new t.Name("keyword"),
      schemaPath: new t.Name("schemaPath"),
      // also used in JTD errors
      params: new t.Name("params"),
      propertyName: new t.Name("propertyName"),
      message: new t.Name("message"),
      schema: new t.Name("schema"),
      parentSchema: new t.Name("parentSchema")
    };
    function f(h, _, g) {
      const { createErrors: w } = h.it;
      return w === !1 ? (0, t._)`{}` : c(h, _, g);
    }
    function c(h, _, g = {}) {
      const { gen: w, it: b } = h, R = [
        p(b, g),
        y(h, g)
      ];
      return E(h, _, R), w.object(...R);
    }
    function p({ errorPath: h }, { instancePath: _ }) {
      const g = _ ? (0, t.str)`${h}${(0, i.getErrorPath)(_, i.Type.Str)}` : h;
      return [r.default.instancePath, (0, t.strConcat)(r.default.instancePath, g)];
    }
    function y({ keyword: h, it: { errSchemaPath: _ } }, { schemaPath: g, parentSchema: w }) {
      let b = w ? _ : (0, t.str)`${_}/${h}`;
      return g && (b = (0, t.str)`${b}${(0, i.getErrorPath)(g, i.Type.Str)}`), [o.schemaPath, b];
    }
    function E(h, { params: _, message: g }, w) {
      const { keyword: b, data: R, schemaValue: v, it: S } = h, { opts: O, propertyName: T, topSchemaRef: $, schemaPath: k } = S;
      w.push([o.keyword, b], [o.params, typeof _ == "function" ? _(h) : _ || (0, t._)`{}`]), O.messages && w.push([o.message, typeof g == "function" ? g(h) : g]), O.verbose && w.push([o.schema, v], [o.parentSchema, (0, t._)`${$}${k}`], [r.default.data, R]), T && w.push([o.propertyName, T]);
    }
  })(ma)), ma;
}
var el;
function Jm() {
  if (el) return nr;
  el = 1, Object.defineProperty(nr, "__esModule", { value: !0 }), nr.boolOrEmptySchema = nr.topBoolOrEmptySchema = void 0;
  const e = Ki(), t = Oe(), i = Xt(), r = {
    message: "boolean schema is false"
  };
  function u(d) {
    const { gen: a, schema: l, validateName: o } = d;
    l === !1 ? s(d, !1) : typeof l == "object" && l.$async === !0 ? a.return(i.default.data) : (a.assign((0, t._)`${o}.errors`, null), a.return(!0));
  }
  nr.topBoolOrEmptySchema = u;
  function n(d, a) {
    const { gen: l, schema: o } = d;
    o === !1 ? (l.var(a, !1), s(d)) : l.var(a, !0);
  }
  nr.boolOrEmptySchema = n;
  function s(d, a) {
    const { gen: l, data: o } = d, f = {
      gen: l,
      keyword: "false schema",
      data: o,
      schema: !1,
      schemaCode: !1,
      schemaValue: !1,
      params: {},
      it: d
    };
    (0, e.reportError)(f, r, void 0, a);
  }
  return nr;
}
var Je = {}, ir = {}, tl;
function Dh() {
  if (tl) return ir;
  tl = 1, Object.defineProperty(ir, "__esModule", { value: !0 }), ir.getRules = ir.isJSONType = void 0;
  const e = ["string", "number", "integer", "boolean", "null", "object", "array"], t = new Set(e);
  function i(u) {
    return typeof u == "string" && t.has(u);
  }
  ir.isJSONType = i;
  function r() {
    const u = {
      number: { type: "number", rules: [] },
      string: { type: "string", rules: [] },
      array: { type: "array", rules: [] },
      object: { type: "object", rules: [] }
    };
    return {
      types: { ...u, integer: !0, boolean: !0, null: !0 },
      rules: [{ rules: [] }, u.number, u.string, u.array, u.object],
      post: { rules: [] },
      all: {},
      keywords: {}
    };
  }
  return ir.getRules = r, ir;
}
var Dt = {}, rl;
function $h() {
  if (rl) return Dt;
  rl = 1, Object.defineProperty(Dt, "__esModule", { value: !0 }), Dt.shouldUseRule = Dt.shouldUseGroup = Dt.schemaHasRulesForType = void 0;
  function e({ schema: r, self: u }, n) {
    const s = u.RULES.types[n];
    return s && s !== !0 && t(r, s);
  }
  Dt.schemaHasRulesForType = e;
  function t(r, u) {
    return u.rules.some((n) => i(r, n));
  }
  Dt.shouldUseGroup = t;
  function i(r, u) {
    var n;
    return r[u.keyword] !== void 0 || ((n = u.definition.implements) === null || n === void 0 ? void 0 : n.some((s) => r[s] !== void 0));
  }
  return Dt.shouldUseRule = i, Dt;
}
var nl;
function Xi() {
  if (nl) return Je;
  nl = 1, Object.defineProperty(Je, "__esModule", { value: !0 }), Je.reportTypeError = Je.checkDataTypes = Je.checkDataType = Je.coerceAndCheckDataType = Je.getJSONTypes = Je.getSchemaTypes = Je.DataType = void 0;
  const e = Dh(), t = $h(), i = Ki(), r = Oe(), u = Ie();
  var n;
  (function(g) {
    g[g.Correct = 0] = "Correct", g[g.Wrong = 1] = "Wrong";
  })(n || (Je.DataType = n = {}));
  function s(g) {
    const w = d(g.type);
    if (w.includes("null")) {
      if (g.nullable === !1)
        throw new Error("type: null contradicts nullable: false");
    } else {
      if (!w.length && g.nullable !== void 0)
        throw new Error('"nullable" cannot be used without "type"');
      g.nullable === !0 && w.push("null");
    }
    return w;
  }
  Je.getSchemaTypes = s;
  function d(g) {
    const w = Array.isArray(g) ? g : g ? [g] : [];
    if (w.every(e.isJSONType))
      return w;
    throw new Error("type must be JSONType or JSONType[]: " + w.join(","));
  }
  Je.getJSONTypes = d;
  function a(g, w) {
    const { gen: b, data: R, opts: v } = g, S = o(w, v.coerceTypes), O = w.length > 0 && !(S.length === 0 && w.length === 1 && (0, t.schemaHasRulesForType)(g, w[0]));
    if (O) {
      const T = y(w, R, v.strictNumbers, n.Wrong);
      b.if(T, () => {
        S.length ? f(g, w, S) : h(g);
      });
    }
    return O;
  }
  Je.coerceAndCheckDataType = a;
  const l = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
  function o(g, w) {
    return w ? g.filter((b) => l.has(b) || w === "array" && b === "array") : [];
  }
  function f(g, w, b) {
    const { gen: R, data: v, opts: S } = g, O = R.let("dataType", (0, r._)`typeof ${v}`), T = R.let("coerced", (0, r._)`undefined`);
    S.coerceTypes === "array" && R.if((0, r._)`${O} == 'object' && Array.isArray(${v}) && ${v}.length == 1`, () => R.assign(v, (0, r._)`${v}[0]`).assign(O, (0, r._)`typeof ${v}`).if(y(w, v, S.strictNumbers), () => R.assign(T, v))), R.if((0, r._)`${T} !== undefined`);
    for (const k of b)
      (l.has(k) || k === "array" && S.coerceTypes === "array") && $(k);
    R.else(), h(g), R.endIf(), R.if((0, r._)`${T} !== undefined`, () => {
      R.assign(v, T), c(g, T);
    });
    function $(k) {
      switch (k) {
        case "string":
          R.elseIf((0, r._)`${O} == "number" || ${O} == "boolean"`).assign(T, (0, r._)`"" + ${v}`).elseIf((0, r._)`${v} === null`).assign(T, (0, r._)`""`);
          return;
        case "number":
          R.elseIf((0, r._)`${O} == "boolean" || ${v} === null
              || (${O} == "string" && ${v} && ${v} == +${v})`).assign(T, (0, r._)`+${v}`);
          return;
        case "integer":
          R.elseIf((0, r._)`${O} === "boolean" || ${v} === null
              || (${O} === "string" && ${v} && ${v} == +${v} && !(${v} % 1))`).assign(T, (0, r._)`+${v}`);
          return;
        case "boolean":
          R.elseIf((0, r._)`${v} === "false" || ${v} === 0 || ${v} === null`).assign(T, !1).elseIf((0, r._)`${v} === "true" || ${v} === 1`).assign(T, !0);
          return;
        case "null":
          R.elseIf((0, r._)`${v} === "" || ${v} === 0 || ${v} === false`), R.assign(T, null);
          return;
        case "array":
          R.elseIf((0, r._)`${O} === "string" || ${O} === "number"
              || ${O} === "boolean" || ${v} === null`).assign(T, (0, r._)`[${v}]`);
      }
    }
  }
  function c({ gen: g, parentData: w, parentDataProperty: b }, R) {
    g.if((0, r._)`${w} !== undefined`, () => g.assign((0, r._)`${w}[${b}]`, R));
  }
  function p(g, w, b, R = n.Correct) {
    const v = R === n.Correct ? r.operators.EQ : r.operators.NEQ;
    let S;
    switch (g) {
      case "null":
        return (0, r._)`${w} ${v} null`;
      case "array":
        S = (0, r._)`Array.isArray(${w})`;
        break;
      case "object":
        S = (0, r._)`${w} && typeof ${w} == "object" && !Array.isArray(${w})`;
        break;
      case "integer":
        S = O((0, r._)`!(${w} % 1) && !isNaN(${w})`);
        break;
      case "number":
        S = O();
        break;
      default:
        return (0, r._)`typeof ${w} ${v} ${g}`;
    }
    return R === n.Correct ? S : (0, r.not)(S);
    function O(T = r.nil) {
      return (0, r.and)((0, r._)`typeof ${w} == "number"`, T, b ? (0, r._)`isFinite(${w})` : r.nil);
    }
  }
  Je.checkDataType = p;
  function y(g, w, b, R) {
    if (g.length === 1)
      return p(g[0], w, b, R);
    let v;
    const S = (0, u.toHash)(g);
    if (S.array && S.object) {
      const O = (0, r._)`typeof ${w} != "object"`;
      v = S.null ? O : (0, r._)`!${w} || ${O}`, delete S.null, delete S.array, delete S.object;
    } else
      v = r.nil;
    S.number && delete S.integer;
    for (const O in S)
      v = (0, r.and)(v, p(O, w, b, R));
    return v;
  }
  Je.checkDataTypes = y;
  const E = {
    message: ({ schema: g }) => `must be ${g}`,
    params: ({ schema: g, schemaValue: w }) => typeof g == "string" ? (0, r._)`{type: ${g}}` : (0, r._)`{type: ${w}}`
  };
  function h(g) {
    const w = _(g);
    (0, i.reportError)(w, E);
  }
  Je.reportTypeError = h;
  function _(g) {
    const { gen: w, data: b, schema: R } = g, v = (0, u.schemaRefOrVal)(g, R, "type");
    return {
      gen: w,
      keyword: "type",
      data: b,
      schema: R.type,
      schemaCode: v,
      schemaValue: v,
      parentSchema: R,
      params: {},
      it: g
    };
  }
  return Je;
}
var Ur = {}, il;
function Qm() {
  if (il) return Ur;
  il = 1, Object.defineProperty(Ur, "__esModule", { value: !0 }), Ur.assignDefaults = void 0;
  const e = Oe(), t = Ie();
  function i(u, n) {
    const { properties: s, items: d } = u.schema;
    if (n === "object" && s)
      for (const a in s)
        r(u, a, s[a].default);
    else n === "array" && Array.isArray(d) && d.forEach((a, l) => r(u, l, a.default));
  }
  Ur.assignDefaults = i;
  function r(u, n, s) {
    const { gen: d, compositeRule: a, data: l, opts: o } = u;
    if (s === void 0)
      return;
    const f = (0, e._)`${l}${(0, e.getProperty)(n)}`;
    if (a) {
      (0, t.checkStrictMode)(u, `default is ignored for: ${f}`);
      return;
    }
    let c = (0, e._)`${f} === undefined`;
    o.useDefaults === "empty" && (c = (0, e._)`${c} || ${f} === null || ${f} === ""`), d.if(c, (0, e._)`${f} = ${(0, e.stringify)(s)}`);
  }
  return Ur;
}
var Et = {}, ke = {}, al;
function bt() {
  if (al) return ke;
  al = 1, Object.defineProperty(ke, "__esModule", { value: !0 }), ke.validateUnion = ke.validateArray = ke.usePattern = ke.callValidateCode = ke.schemaProperties = ke.allSchemaProperties = ke.noPropertyInData = ke.propertyInData = ke.isOwnProperty = ke.hasPropFunc = ke.reportMissingProp = ke.checkMissingProp = ke.checkReportMissingProp = void 0;
  const e = Oe(), t = Ie(), i = Xt(), r = Ie();
  function u(g, w) {
    const { gen: b, data: R, it: v } = g;
    b.if(o(b, R, w, v.opts.ownProperties), () => {
      g.setParams({ missingProperty: (0, e._)`${w}` }, !0), g.error();
    });
  }
  ke.checkReportMissingProp = u;
  function n({ gen: g, data: w, it: { opts: b } }, R, v) {
    return (0, e.or)(...R.map((S) => (0, e.and)(o(g, w, S, b.ownProperties), (0, e._)`${v} = ${S}`)));
  }
  ke.checkMissingProp = n;
  function s(g, w) {
    g.setParams({ missingProperty: w }, !0), g.error();
  }
  ke.reportMissingProp = s;
  function d(g) {
    return g.scopeValue("func", {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      ref: Object.prototype.hasOwnProperty,
      code: (0, e._)`Object.prototype.hasOwnProperty`
    });
  }
  ke.hasPropFunc = d;
  function a(g, w, b) {
    return (0, e._)`${d(g)}.call(${w}, ${b})`;
  }
  ke.isOwnProperty = a;
  function l(g, w, b, R) {
    const v = (0, e._)`${w}${(0, e.getProperty)(b)} !== undefined`;
    return R ? (0, e._)`${v} && ${a(g, w, b)}` : v;
  }
  ke.propertyInData = l;
  function o(g, w, b, R) {
    const v = (0, e._)`${w}${(0, e.getProperty)(b)} === undefined`;
    return R ? (0, e.or)(v, (0, e.not)(a(g, w, b))) : v;
  }
  ke.noPropertyInData = o;
  function f(g) {
    return g ? Object.keys(g).filter((w) => w !== "__proto__") : [];
  }
  ke.allSchemaProperties = f;
  function c(g, w) {
    return f(w).filter((b) => !(0, t.alwaysValidSchema)(g, w[b]));
  }
  ke.schemaProperties = c;
  function p({ schemaCode: g, data: w, it: { gen: b, topSchemaRef: R, schemaPath: v, errorPath: S }, it: O }, T, $, k) {
    const U = k ? (0, e._)`${g}, ${w}, ${R}${v}` : w, V = [
      [i.default.instancePath, (0, e.strConcat)(i.default.instancePath, S)],
      [i.default.parentData, O.parentData],
      [i.default.parentDataProperty, O.parentDataProperty],
      [i.default.rootData, i.default.rootData]
    ];
    O.opts.dynamicRef && V.push([i.default.dynamicAnchors, i.default.dynamicAnchors]);
    const L = (0, e._)`${U}, ${b.object(...V)}`;
    return $ !== e.nil ? (0, e._)`${T}.call(${$}, ${L})` : (0, e._)`${T}(${L})`;
  }
  ke.callValidateCode = p;
  const y = (0, e._)`new RegExp`;
  function E({ gen: g, it: { opts: w } }, b) {
    const R = w.unicodeRegExp ? "u" : "", { regExp: v } = w.code, S = v(b, R);
    return g.scopeValue("pattern", {
      key: S.toString(),
      ref: S,
      code: (0, e._)`${v.code === "new RegExp" ? y : (0, r.useFunc)(g, v)}(${b}, ${R})`
    });
  }
  ke.usePattern = E;
  function h(g) {
    const { gen: w, data: b, keyword: R, it: v } = g, S = w.name("valid");
    if (v.allErrors) {
      const T = w.let("valid", !0);
      return O(() => w.assign(T, !1)), T;
    }
    return w.var(S, !0), O(() => w.break()), S;
    function O(T) {
      const $ = w.const("len", (0, e._)`${b}.length`);
      w.forRange("i", 0, $, (k) => {
        g.subschema({
          keyword: R,
          dataProp: k,
          dataPropType: t.Type.Num
        }, S), w.if((0, e.not)(S), T);
      });
    }
  }
  ke.validateArray = h;
  function _(g) {
    const { gen: w, schema: b, keyword: R, it: v } = g;
    if (!Array.isArray(b))
      throw new Error("ajv implementation error");
    if (b.some(($) => (0, t.alwaysValidSchema)(v, $)) && !v.opts.unevaluated)
      return;
    const O = w.let("valid", !1), T = w.name("_valid");
    w.block(() => b.forEach(($, k) => {
      const U = g.subschema({
        keyword: R,
        schemaProp: k,
        compositeRule: !0
      }, T);
      w.assign(O, (0, e._)`${O} || ${T}`), g.mergeValidEvaluated(U, T) || w.if((0, e.not)(O));
    })), g.result(O, () => g.reset(), () => g.error(!0));
  }
  return ke.validateUnion = _, ke;
}
var sl;
function Zm() {
  if (sl) return Et;
  sl = 1, Object.defineProperty(Et, "__esModule", { value: !0 }), Et.validateKeywordUsage = Et.validSchemaType = Et.funcKeywordCode = Et.macroKeywordCode = void 0;
  const e = Oe(), t = Xt(), i = bt(), r = Ki();
  function u(c, p) {
    const { gen: y, keyword: E, schema: h, parentSchema: _, it: g } = c, w = p.macro.call(g.self, h, _, g), b = l(y, E, w);
    g.opts.validateSchema !== !1 && g.self.validateSchema(w, !0);
    const R = y.name("valid");
    c.subschema({
      schema: w,
      schemaPath: e.nil,
      errSchemaPath: `${g.errSchemaPath}/${E}`,
      topSchemaRef: b,
      compositeRule: !0
    }, R), c.pass(R, () => c.error(!0));
  }
  Et.macroKeywordCode = u;
  function n(c, p) {
    var y;
    const { gen: E, keyword: h, schema: _, parentSchema: g, $data: w, it: b } = c;
    a(b, p);
    const R = !w && p.compile ? p.compile.call(b.self, _, g, b) : p.validate, v = l(E, h, R), S = E.let("valid");
    c.block$data(S, O), c.ok((y = p.valid) !== null && y !== void 0 ? y : S);
    function O() {
      if (p.errors === !1)
        k(), p.modifying && s(c), U(() => c.error());
      else {
        const V = p.async ? T() : $();
        p.modifying && s(c), U(() => d(c, V));
      }
    }
    function T() {
      const V = E.let("ruleErrs", null);
      return E.try(() => k((0, e._)`await `), (L) => E.assign(S, !1).if((0, e._)`${L} instanceof ${b.ValidationError}`, () => E.assign(V, (0, e._)`${L}.errors`), () => E.throw(L))), V;
    }
    function $() {
      const V = (0, e._)`${v}.errors`;
      return E.assign(V, null), k(e.nil), V;
    }
    function k(V = p.async ? (0, e._)`await ` : e.nil) {
      const L = b.opts.passContext ? t.default.this : t.default.self, B = !("compile" in p && !w || p.schema === !1);
      E.assign(S, (0, e._)`${V}${(0, i.callValidateCode)(c, v, L, B)}`, p.modifying);
    }
    function U(V) {
      var L;
      E.if((0, e.not)((L = p.valid) !== null && L !== void 0 ? L : S), V);
    }
  }
  Et.funcKeywordCode = n;
  function s(c) {
    const { gen: p, data: y, it: E } = c;
    p.if(E.parentData, () => p.assign(y, (0, e._)`${E.parentData}[${E.parentDataProperty}]`));
  }
  function d(c, p) {
    const { gen: y } = c;
    y.if((0, e._)`Array.isArray(${p})`, () => {
      y.assign(t.default.vErrors, (0, e._)`${t.default.vErrors} === null ? ${p} : ${t.default.vErrors}.concat(${p})`).assign(t.default.errors, (0, e._)`${t.default.vErrors}.length`), (0, r.extendErrors)(c);
    }, () => c.error());
  }
  function a({ schemaEnv: c }, p) {
    if (p.async && !c.$async)
      throw new Error("async keyword in sync schema");
  }
  function l(c, p, y) {
    if (y === void 0)
      throw new Error(`keyword "${p}" failed to compile`);
    return c.scopeValue("keyword", typeof y == "function" ? { ref: y } : { ref: y, code: (0, e.stringify)(y) });
  }
  function o(c, p, y = !1) {
    return !p.length || p.some((E) => E === "array" ? Array.isArray(c) : E === "object" ? c && typeof c == "object" && !Array.isArray(c) : typeof c == E || y && typeof c > "u");
  }
  Et.validSchemaType = o;
  function f({ schema: c, opts: p, self: y, errSchemaPath: E }, h, _) {
    if (Array.isArray(h.keyword) ? !h.keyword.includes(_) : h.keyword !== _)
      throw new Error("ajv implementation error");
    const g = h.dependencies;
    if (g?.some((w) => !Object.prototype.hasOwnProperty.call(c, w)))
      throw new Error(`parent schema must have dependencies of ${_}: ${g.join(",")}`);
    if (h.validateSchema && !h.validateSchema(c[_])) {
      const b = `keyword "${_}" value is invalid at path "${E}": ` + y.errorsText(h.validateSchema.errors);
      if (p.validateSchema === "log")
        y.logger.error(b);
      else
        throw new Error(b);
    }
  }
  return Et.validateKeywordUsage = f, Et;
}
var $t = {}, ol;
function eg() {
  if (ol) return $t;
  ol = 1, Object.defineProperty($t, "__esModule", { value: !0 }), $t.extendSubschemaMode = $t.extendSubschemaData = $t.getSubschema = void 0;
  const e = Oe(), t = Ie();
  function i(n, { keyword: s, schemaProp: d, schema: a, schemaPath: l, errSchemaPath: o, topSchemaRef: f }) {
    if (s !== void 0 && a !== void 0)
      throw new Error('both "keyword" and "schema" passed, only one allowed');
    if (s !== void 0) {
      const c = n.schema[s];
      return d === void 0 ? {
        schema: c,
        schemaPath: (0, e._)`${n.schemaPath}${(0, e.getProperty)(s)}`,
        errSchemaPath: `${n.errSchemaPath}/${s}`
      } : {
        schema: c[d],
        schemaPath: (0, e._)`${n.schemaPath}${(0, e.getProperty)(s)}${(0, e.getProperty)(d)}`,
        errSchemaPath: `${n.errSchemaPath}/${s}/${(0, t.escapeFragment)(d)}`
      };
    }
    if (a !== void 0) {
      if (l === void 0 || o === void 0 || f === void 0)
        throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
      return {
        schema: a,
        schemaPath: l,
        topSchemaRef: f,
        errSchemaPath: o
      };
    }
    throw new Error('either "keyword" or "schema" must be passed');
  }
  $t.getSubschema = i;
  function r(n, s, { dataProp: d, dataPropType: a, data: l, dataTypes: o, propertyName: f }) {
    if (l !== void 0 && d !== void 0)
      throw new Error('both "data" and "dataProp" passed, only one allowed');
    const { gen: c } = s;
    if (d !== void 0) {
      const { errorPath: y, dataPathArr: E, opts: h } = s, _ = c.let("data", (0, e._)`${s.data}${(0, e.getProperty)(d)}`, !0);
      p(_), n.errorPath = (0, e.str)`${y}${(0, t.getErrorPath)(d, a, h.jsPropertySyntax)}`, n.parentDataProperty = (0, e._)`${d}`, n.dataPathArr = [...E, n.parentDataProperty];
    }
    if (l !== void 0) {
      const y = l instanceof e.Name ? l : c.let("data", l, !0);
      p(y), f !== void 0 && (n.propertyName = f);
    }
    o && (n.dataTypes = o);
    function p(y) {
      n.data = y, n.dataLevel = s.dataLevel + 1, n.dataTypes = [], s.definedProperties = /* @__PURE__ */ new Set(), n.parentData = s.data, n.dataNames = [...s.dataNames, y];
    }
  }
  $t.extendSubschemaData = r;
  function u(n, { jtdDiscriminator: s, jtdMetadata: d, compositeRule: a, createErrors: l, allErrors: o }) {
    a !== void 0 && (n.compositeRule = a), l !== void 0 && (n.createErrors = l), o !== void 0 && (n.allErrors = o), n.jtdDiscriminator = s, n.jtdMetadata = d;
  }
  return $t.extendSubschemaMode = u, $t;
}
var rt = {}, Ea, ul;
function kh() {
  return ul || (ul = 1, Ea = function e(t, i) {
    if (t === i) return !0;
    if (t && i && typeof t == "object" && typeof i == "object") {
      if (t.constructor !== i.constructor) return !1;
      var r, u, n;
      if (Array.isArray(t)) {
        if (r = t.length, r != i.length) return !1;
        for (u = r; u-- !== 0; )
          if (!e(t[u], i[u])) return !1;
        return !0;
      }
      if (t.constructor === RegExp) return t.source === i.source && t.flags === i.flags;
      if (t.valueOf !== Object.prototype.valueOf) return t.valueOf() === i.valueOf();
      if (t.toString !== Object.prototype.toString) return t.toString() === i.toString();
      if (n = Object.keys(t), r = n.length, r !== Object.keys(i).length) return !1;
      for (u = r; u-- !== 0; )
        if (!Object.prototype.hasOwnProperty.call(i, n[u])) return !1;
      for (u = r; u-- !== 0; ) {
        var s = n[u];
        if (!e(t[s], i[s])) return !1;
      }
      return !0;
    }
    return t !== t && i !== i;
  }), Ea;
}
var va = { exports: {} }, ll;
function tg() {
  if (ll) return va.exports;
  ll = 1;
  var e = va.exports = function(r, u, n) {
    typeof u == "function" && (n = u, u = {}), n = u.cb || n;
    var s = typeof n == "function" ? n : n.pre || function() {
    }, d = n.post || function() {
    };
    t(u, s, d, r, "", r);
  };
  e.keywords = {
    additionalItems: !0,
    items: !0,
    contains: !0,
    additionalProperties: !0,
    propertyNames: !0,
    not: !0,
    if: !0,
    then: !0,
    else: !0
  }, e.arrayKeywords = {
    items: !0,
    allOf: !0,
    anyOf: !0,
    oneOf: !0
  }, e.propsKeywords = {
    $defs: !0,
    definitions: !0,
    properties: !0,
    patternProperties: !0,
    dependencies: !0
  }, e.skipKeywords = {
    default: !0,
    enum: !0,
    const: !0,
    required: !0,
    maximum: !0,
    minimum: !0,
    exclusiveMaximum: !0,
    exclusiveMinimum: !0,
    multipleOf: !0,
    maxLength: !0,
    minLength: !0,
    pattern: !0,
    format: !0,
    maxItems: !0,
    minItems: !0,
    uniqueItems: !0,
    maxProperties: !0,
    minProperties: !0
  };
  function t(r, u, n, s, d, a, l, o, f, c) {
    if (s && typeof s == "object" && !Array.isArray(s)) {
      u(s, d, a, l, o, f, c);
      for (var p in s) {
        var y = s[p];
        if (Array.isArray(y)) {
          if (p in e.arrayKeywords)
            for (var E = 0; E < y.length; E++)
              t(r, u, n, y[E], d + "/" + p + "/" + E, a, d, p, s, E);
        } else if (p in e.propsKeywords) {
          if (y && typeof y == "object")
            for (var h in y)
              t(r, u, n, y[h], d + "/" + p + "/" + i(h), a, d, p, s, h);
        } else (p in e.keywords || r.allKeys && !(p in e.skipKeywords)) && t(r, u, n, y, d + "/" + p, a, d, p, s);
      }
      n(s, d, a, l, o, f, c);
    }
  }
  function i(r) {
    return r.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  return va.exports;
}
var cl;
function Ji() {
  if (cl) return rt;
  cl = 1, Object.defineProperty(rt, "__esModule", { value: !0 }), rt.getSchemaRefs = rt.resolveUrl = rt.normalizeId = rt._getFullPath = rt.getFullPath = rt.inlineRef = void 0;
  const e = Ie(), t = kh(), i = tg(), r = /* @__PURE__ */ new Set([
    "type",
    "format",
    "pattern",
    "maxLength",
    "minLength",
    "maxProperties",
    "minProperties",
    "maxItems",
    "minItems",
    "maximum",
    "minimum",
    "uniqueItems",
    "multipleOf",
    "required",
    "enum",
    "const"
  ]);
  function u(E, h = !0) {
    return typeof E == "boolean" ? !0 : h === !0 ? !s(E) : h ? d(E) <= h : !1;
  }
  rt.inlineRef = u;
  const n = /* @__PURE__ */ new Set([
    "$ref",
    "$recursiveRef",
    "$recursiveAnchor",
    "$dynamicRef",
    "$dynamicAnchor"
  ]);
  function s(E) {
    for (const h in E) {
      if (n.has(h))
        return !0;
      const _ = E[h];
      if (Array.isArray(_) && _.some(s) || typeof _ == "object" && s(_))
        return !0;
    }
    return !1;
  }
  function d(E) {
    let h = 0;
    for (const _ in E) {
      if (_ === "$ref")
        return 1 / 0;
      if (h++, !r.has(_) && (typeof E[_] == "object" && (0, e.eachItem)(E[_], (g) => h += d(g)), h === 1 / 0))
        return 1 / 0;
    }
    return h;
  }
  function a(E, h = "", _) {
    _ !== !1 && (h = f(h));
    const g = E.parse(h);
    return l(E, g);
  }
  rt.getFullPath = a;
  function l(E, h) {
    return E.serialize(h).split("#")[0] + "#";
  }
  rt._getFullPath = l;
  const o = /#\/?$/;
  function f(E) {
    return E ? E.replace(o, "") : "";
  }
  rt.normalizeId = f;
  function c(E, h, _) {
    return _ = f(_), E.resolve(h, _);
  }
  rt.resolveUrl = c;
  const p = /^[a-z_][-a-z0-9._]*$/i;
  function y(E, h) {
    if (typeof E == "boolean")
      return {};
    const { schemaId: _, uriResolver: g } = this.opts, w = f(E[_] || h), b = { "": w }, R = a(g, w, !1), v = {}, S = /* @__PURE__ */ new Set();
    return i(E, { allKeys: !0 }, ($, k, U, V) => {
      if (V === void 0)
        return;
      const L = R + k;
      let B = b[V];
      typeof $[_] == "string" && (B = te.call(this, $[_])), j.call(this, $.$anchor), j.call(this, $.$dynamicAnchor), b[k] = B;
      function te(H) {
        const Y = this.opts.uriResolver.resolve;
        if (H = f(B ? Y(B, H) : H), S.has(H))
          throw T(H);
        S.add(H);
        let F = this.refs[H];
        return typeof F == "string" && (F = this.refs[F]), typeof F == "object" ? O($, F.schema, H) : H !== f(L) && (H[0] === "#" ? (O($, v[H], H), v[H] = $) : this.refs[H] = L), H;
      }
      function j(H) {
        if (typeof H == "string") {
          if (!p.test(H))
            throw new Error(`invalid anchor "${H}"`);
          te.call(this, `#${H}`);
        }
      }
    }), v;
    function O($, k, U) {
      if (k !== void 0 && !t($, k))
        throw T(U);
    }
    function T($) {
      return new Error(`reference "${$}" resolves to more than one schema`);
    }
  }
  return rt.getSchemaRefs = y, rt;
}
var dl;
function Qi() {
  if (dl) return It;
  dl = 1, Object.defineProperty(It, "__esModule", { value: !0 }), It.getData = It.KeywordCxt = It.validateFunctionCode = void 0;
  const e = Jm(), t = Xi(), i = $h(), r = Xi(), u = Qm(), n = Zm(), s = eg(), d = Oe(), a = Xt(), l = Ji(), o = Ie(), f = Ki();
  function c(q) {
    if (R(q) && (S(q), b(q))) {
      h(q);
      return;
    }
    p(q, () => (0, e.topBoolOrEmptySchema)(q));
  }
  It.validateFunctionCode = c;
  function p({ gen: q, validateName: z, schema: Q, schemaEnv: re, opts: le }, Se) {
    le.code.es5 ? q.func(z, (0, d._)`${a.default.data}, ${a.default.valCxt}`, re.$async, () => {
      q.code((0, d._)`"use strict"; ${g(Q, le)}`), E(q, le), q.code(Se);
    }) : q.func(z, (0, d._)`${a.default.data}, ${y(le)}`, re.$async, () => q.code(g(Q, le)).code(Se));
  }
  function y(q) {
    return (0, d._)`{${a.default.instancePath}="", ${a.default.parentData}, ${a.default.parentDataProperty}, ${a.default.rootData}=${a.default.data}${q.dynamicRef ? (0, d._)`, ${a.default.dynamicAnchors}={}` : d.nil}}={}`;
  }
  function E(q, z) {
    q.if(a.default.valCxt, () => {
      q.var(a.default.instancePath, (0, d._)`${a.default.valCxt}.${a.default.instancePath}`), q.var(a.default.parentData, (0, d._)`${a.default.valCxt}.${a.default.parentData}`), q.var(a.default.parentDataProperty, (0, d._)`${a.default.valCxt}.${a.default.parentDataProperty}`), q.var(a.default.rootData, (0, d._)`${a.default.valCxt}.${a.default.rootData}`), z.dynamicRef && q.var(a.default.dynamicAnchors, (0, d._)`${a.default.valCxt}.${a.default.dynamicAnchors}`);
    }, () => {
      q.var(a.default.instancePath, (0, d._)`""`), q.var(a.default.parentData, (0, d._)`undefined`), q.var(a.default.parentDataProperty, (0, d._)`undefined`), q.var(a.default.rootData, a.default.data), z.dynamicRef && q.var(a.default.dynamicAnchors, (0, d._)`{}`);
    });
  }
  function h(q) {
    const { schema: z, opts: Q, gen: re } = q;
    p(q, () => {
      Q.$comment && z.$comment && V(q), $(q), re.let(a.default.vErrors, null), re.let(a.default.errors, 0), Q.unevaluated && _(q), O(q), L(q);
    });
  }
  function _(q) {
    const { gen: z, validateName: Q } = q;
    q.evaluated = z.const("evaluated", (0, d._)`${Q}.evaluated`), z.if((0, d._)`${q.evaluated}.dynamicProps`, () => z.assign((0, d._)`${q.evaluated}.props`, (0, d._)`undefined`)), z.if((0, d._)`${q.evaluated}.dynamicItems`, () => z.assign((0, d._)`${q.evaluated}.items`, (0, d._)`undefined`));
  }
  function g(q, z) {
    const Q = typeof q == "object" && q[z.schemaId];
    return Q && (z.code.source || z.code.process) ? (0, d._)`/*# sourceURL=${Q} */` : d.nil;
  }
  function w(q, z) {
    if (R(q) && (S(q), b(q))) {
      v(q, z);
      return;
    }
    (0, e.boolOrEmptySchema)(q, z);
  }
  function b({ schema: q, self: z }) {
    if (typeof q == "boolean")
      return !q;
    for (const Q in q)
      if (z.RULES.all[Q])
        return !0;
    return !1;
  }
  function R(q) {
    return typeof q.schema != "boolean";
  }
  function v(q, z) {
    const { schema: Q, gen: re, opts: le } = q;
    le.$comment && Q.$comment && V(q), k(q), U(q);
    const Se = re.const("_errs", a.default.errors);
    O(q, Se), re.var(z, (0, d._)`${Se} === ${a.default.errors}`);
  }
  function S(q) {
    (0, o.checkUnknownRules)(q), T(q);
  }
  function O(q, z) {
    if (q.opts.jtd)
      return te(q, [], !1, z);
    const Q = (0, t.getSchemaTypes)(q.schema), re = (0, t.coerceAndCheckDataType)(q, Q);
    te(q, Q, !re, z);
  }
  function T(q) {
    const { schema: z, errSchemaPath: Q, opts: re, self: le } = q;
    z.$ref && re.ignoreKeywordsWithRef && (0, o.schemaHasRulesButRef)(z, le.RULES) && le.logger.warn(`$ref: keywords ignored in schema at path "${Q}"`);
  }
  function $(q) {
    const { schema: z, opts: Q } = q;
    z.default !== void 0 && Q.useDefaults && Q.strictSchema && (0, o.checkStrictMode)(q, "default is ignored in the schema root");
  }
  function k(q) {
    const z = q.schema[q.opts.schemaId];
    z && (q.baseId = (0, l.resolveUrl)(q.opts.uriResolver, q.baseId, z));
  }
  function U(q) {
    if (q.schema.$async && !q.schemaEnv.$async)
      throw new Error("async schema in sync schema");
  }
  function V({ gen: q, schemaEnv: z, schema: Q, errSchemaPath: re, opts: le }) {
    const Se = Q.$comment;
    if (le.$comment === !0)
      q.code((0, d._)`${a.default.self}.logger.log(${Se})`);
    else if (typeof le.$comment == "function") {
      const Te = (0, d.str)`${re}/$comment`, Fe = q.scopeValue("root", { ref: z.root });
      q.code((0, d._)`${a.default.self}.opts.$comment(${Se}, ${Te}, ${Fe}.schema)`);
    }
  }
  function L(q) {
    const { gen: z, schemaEnv: Q, validateName: re, ValidationError: le, opts: Se } = q;
    Q.$async ? z.if((0, d._)`${a.default.errors} === 0`, () => z.return(a.default.data), () => z.throw((0, d._)`new ${le}(${a.default.vErrors})`)) : (z.assign((0, d._)`${re}.errors`, a.default.vErrors), Se.unevaluated && B(q), z.return((0, d._)`${a.default.errors} === 0`));
  }
  function B({ gen: q, evaluated: z, props: Q, items: re }) {
    Q instanceof d.Name && q.assign((0, d._)`${z}.props`, Q), re instanceof d.Name && q.assign((0, d._)`${z}.items`, re);
  }
  function te(q, z, Q, re) {
    const { gen: le, schema: Se, data: Te, allErrors: Fe, opts: He, self: Be } = q, { RULES: Le } = Be;
    if (Se.$ref && (He.ignoreKeywordsWithRef || !(0, o.schemaHasRulesButRef)(Se, Le))) {
      le.block(() => N(q, "$ref", Le.all.$ref.definition));
      return;
    }
    He.jtd || H(q, z), le.block(() => {
      for (const Z of Le.rules)
        m(Z);
      m(Le.post);
    });
    function m(Z) {
      (0, i.shouldUseGroup)(Se, Z) && (Z.type ? (le.if((0, r.checkDataType)(Z.type, Te, He.strictNumbers)), j(q, Z), z.length === 1 && z[0] === Z.type && Q && (le.else(), (0, r.reportTypeError)(q)), le.endIf()) : j(q, Z), Fe || le.if((0, d._)`${a.default.errors} === ${re || 0}`));
    }
  }
  function j(q, z) {
    const { gen: Q, schema: re, opts: { useDefaults: le } } = q;
    le && (0, u.assignDefaults)(q, z.type), Q.block(() => {
      for (const Se of z.rules)
        (0, i.shouldUseRule)(re, Se) && N(q, Se.keyword, Se.definition, z.type);
    });
  }
  function H(q, z) {
    q.schemaEnv.meta || !q.opts.strictTypes || (Y(q, z), q.opts.allowUnionTypes || F(q, z), x(q, q.dataTypes));
  }
  function Y(q, z) {
    if (z.length) {
      if (!q.dataTypes.length) {
        q.dataTypes = z;
        return;
      }
      z.forEach((Q) => {
        G(q.dataTypes, Q) || C(q, `type "${Q}" not allowed by context "${q.dataTypes.join(",")}"`);
      }), P(q, z);
    }
  }
  function F(q, z) {
    z.length > 1 && !(z.length === 2 && z.includes("null")) && C(q, "use allowUnionTypes to allow union type keyword");
  }
  function x(q, z) {
    const Q = q.self.RULES.all;
    for (const re in Q) {
      const le = Q[re];
      if (typeof le == "object" && (0, i.shouldUseRule)(q.schema, le)) {
        const { type: Se } = le.definition;
        Se.length && !Se.some((Te) => X(z, Te)) && C(q, `missing type "${Se.join(",")}" for keyword "${re}"`);
      }
    }
  }
  function X(q, z) {
    return q.includes(z) || z === "number" && q.includes("integer");
  }
  function G(q, z) {
    return q.includes(z) || z === "integer" && q.includes("number");
  }
  function P(q, z) {
    const Q = [];
    for (const re of q.dataTypes)
      G(z, re) ? Q.push(re) : z.includes("integer") && re === "number" && Q.push("integer");
    q.dataTypes = Q;
  }
  function C(q, z) {
    const Q = q.schemaEnv.baseId + q.errSchemaPath;
    z += ` at "${Q}" (strictTypes)`, (0, o.checkStrictMode)(q, z, q.opts.strictTypes);
  }
  class K {
    constructor(z, Q, re) {
      if ((0, n.validateKeywordUsage)(z, Q, re), this.gen = z.gen, this.allErrors = z.allErrors, this.keyword = re, this.data = z.data, this.schema = z.schema[re], this.$data = Q.$data && z.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, o.schemaRefOrVal)(z, this.schema, re, this.$data), this.schemaType = Q.schemaType, this.parentSchema = z.schema, this.params = {}, this.it = z, this.def = Q, this.$data)
        this.schemaCode = z.gen.const("vSchema", M(this.$data, z));
      else if (this.schemaCode = this.schemaValue, !(0, n.validSchemaType)(this.schema, Q.schemaType, Q.allowUndefined))
        throw new Error(`${re} value must be ${JSON.stringify(Q.schemaType)}`);
      ("code" in Q ? Q.trackErrors : Q.errors !== !1) && (this.errsCount = z.gen.const("_errs", a.default.errors));
    }
    result(z, Q, re) {
      this.failResult((0, d.not)(z), Q, re);
    }
    failResult(z, Q, re) {
      this.gen.if(z), re ? re() : this.error(), Q ? (this.gen.else(), Q(), this.allErrors && this.gen.endIf()) : this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    pass(z, Q) {
      this.failResult((0, d.not)(z), void 0, Q);
    }
    fail(z) {
      if (z === void 0) {
        this.error(), this.allErrors || this.gen.if(!1);
        return;
      }
      this.gen.if(z), this.error(), this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    fail$data(z) {
      if (!this.$data)
        return this.fail(z);
      const { schemaCode: Q } = this;
      this.fail((0, d._)`${Q} !== undefined && (${(0, d.or)(this.invalid$data(), z)})`);
    }
    error(z, Q, re) {
      if (Q) {
        this.setParams(Q), this._error(z, re), this.setParams({});
        return;
      }
      this._error(z, re);
    }
    _error(z, Q) {
      (z ? f.reportExtraError : f.reportError)(this, this.def.error, Q);
    }
    $dataError() {
      (0, f.reportError)(this, this.def.$dataError || f.keyword$DataError);
    }
    reset() {
      if (this.errsCount === void 0)
        throw new Error('add "trackErrors" to keyword definition');
      (0, f.resetErrorsCount)(this.gen, this.errsCount);
    }
    ok(z) {
      this.allErrors || this.gen.if(z);
    }
    setParams(z, Q) {
      Q ? Object.assign(this.params, z) : this.params = z;
    }
    block$data(z, Q, re = d.nil) {
      this.gen.block(() => {
        this.check$data(z, re), Q();
      });
    }
    check$data(z = d.nil, Q = d.nil) {
      if (!this.$data)
        return;
      const { gen: re, schemaCode: le, schemaType: Se, def: Te } = this;
      re.if((0, d.or)((0, d._)`${le} === undefined`, Q)), z !== d.nil && re.assign(z, !0), (Se.length || Te.validateSchema) && (re.elseIf(this.invalid$data()), this.$dataError(), z !== d.nil && re.assign(z, !1)), re.else();
    }
    invalid$data() {
      const { gen: z, schemaCode: Q, schemaType: re, def: le, it: Se } = this;
      return (0, d.or)(Te(), Fe());
      function Te() {
        if (re.length) {
          if (!(Q instanceof d.Name))
            throw new Error("ajv implementation error");
          const He = Array.isArray(re) ? re : [re];
          return (0, d._)`${(0, r.checkDataTypes)(He, Q, Se.opts.strictNumbers, r.DataType.Wrong)}`;
        }
        return d.nil;
      }
      function Fe() {
        if (le.validateSchema) {
          const He = z.scopeValue("validate$data", { ref: le.validateSchema });
          return (0, d._)`!${He}(${Q})`;
        }
        return d.nil;
      }
    }
    subschema(z, Q) {
      const re = (0, s.getSubschema)(this.it, z);
      (0, s.extendSubschemaData)(re, this.it, z), (0, s.extendSubschemaMode)(re, z);
      const le = { ...this.it, ...re, items: void 0, props: void 0 };
      return w(le, Q), le;
    }
    mergeEvaluated(z, Q) {
      const { it: re, gen: le } = this;
      re.opts.unevaluated && (re.props !== !0 && z.props !== void 0 && (re.props = o.mergeEvaluated.props(le, z.props, re.props, Q)), re.items !== !0 && z.items !== void 0 && (re.items = o.mergeEvaluated.items(le, z.items, re.items, Q)));
    }
    mergeValidEvaluated(z, Q) {
      const { it: re, gen: le } = this;
      if (re.opts.unevaluated && (re.props !== !0 || re.items !== !0))
        return le.if(Q, () => this.mergeEvaluated(z, d.Name)), !0;
    }
  }
  It.KeywordCxt = K;
  function N(q, z, Q, re) {
    const le = new K(q, Q, z);
    "code" in Q ? Q.code(le, re) : le.$data && Q.validate ? (0, n.funcKeywordCode)(le, Q) : "macro" in Q ? (0, n.macroKeywordCode)(le, Q) : (Q.compile || Q.validate) && (0, n.funcKeywordCode)(le, Q);
  }
  const A = /^\/(?:[^~]|~0|~1)*$/, J = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
  function M(q, { dataLevel: z, dataNames: Q, dataPathArr: re }) {
    let le, Se;
    if (q === "")
      return a.default.rootData;
    if (q[0] === "/") {
      if (!A.test(q))
        throw new Error(`Invalid JSON-pointer: ${q}`);
      le = q, Se = a.default.rootData;
    } else {
      const Be = J.exec(q);
      if (!Be)
        throw new Error(`Invalid JSON-pointer: ${q}`);
      const Le = +Be[1];
      if (le = Be[2], le === "#") {
        if (Le >= z)
          throw new Error(He("property/index", Le));
        return re[z - Le];
      }
      if (Le > z)
        throw new Error(He("data", Le));
      if (Se = Q[z - Le], !le)
        return Se;
    }
    let Te = Se;
    const Fe = le.split("/");
    for (const Be of Fe)
      Be && (Se = (0, d._)`${Se}${(0, d.getProperty)((0, o.unescapeJsonPointer)(Be))}`, Te = (0, d._)`${Te} && ${Se}`);
    return Te;
    function He(Be, Le) {
      return `Cannot access ${Be} ${Le} levels up, current level is ${z}`;
    }
  }
  return It.getData = M, It;
}
var Vn = {}, fl;
function Mo() {
  if (fl) return Vn;
  fl = 1, Object.defineProperty(Vn, "__esModule", { value: !0 });
  class e extends Error {
    constructor(i) {
      super("validation failed"), this.errors = i, this.ajv = this.validation = !0;
    }
  }
  return Vn.default = e, Vn;
}
var zn = {}, hl;
function Zi() {
  if (hl) return zn;
  hl = 1, Object.defineProperty(zn, "__esModule", { value: !0 });
  const e = Ji();
  class t extends Error {
    constructor(r, u, n, s) {
      super(s || `can't resolve reference ${n} from id ${u}`), this.missingRef = (0, e.resolveUrl)(r, u, n), this.missingSchema = (0, e.normalizeId)((0, e.getFullPath)(r, this.missingRef));
    }
  }
  return zn.default = t, zn;
}
var lt = {}, pl;
function jo() {
  if (pl) return lt;
  pl = 1, Object.defineProperty(lt, "__esModule", { value: !0 }), lt.resolveSchema = lt.getCompilingSchema = lt.resolveRef = lt.compileSchema = lt.SchemaEnv = void 0;
  const e = Oe(), t = Mo(), i = Xt(), r = Ji(), u = Ie(), n = Qi();
  class s {
    constructor(_) {
      var g;
      this.refs = {}, this.dynamicAnchors = {};
      let w;
      typeof _.schema == "object" && (w = _.schema), this.schema = _.schema, this.schemaId = _.schemaId, this.root = _.root || this, this.baseId = (g = _.baseId) !== null && g !== void 0 ? g : (0, r.normalizeId)(w?.[_.schemaId || "$id"]), this.schemaPath = _.schemaPath, this.localRefs = _.localRefs, this.meta = _.meta, this.$async = w?.$async, this.refs = {};
    }
  }
  lt.SchemaEnv = s;
  function d(h) {
    const _ = o.call(this, h);
    if (_)
      return _;
    const g = (0, r.getFullPath)(this.opts.uriResolver, h.root.baseId), { es5: w, lines: b } = this.opts.code, { ownProperties: R } = this.opts, v = new e.CodeGen(this.scope, { es5: w, lines: b, ownProperties: R });
    let S;
    h.$async && (S = v.scopeValue("Error", {
      ref: t.default,
      code: (0, e._)`require("ajv/dist/runtime/validation_error").default`
    }));
    const O = v.scopeName("validate");
    h.validateName = O;
    const T = {
      gen: v,
      allErrors: this.opts.allErrors,
      data: i.default.data,
      parentData: i.default.parentData,
      parentDataProperty: i.default.parentDataProperty,
      dataNames: [i.default.data],
      dataPathArr: [e.nil],
      // TODO can its length be used as dataLevel if nil is removed?
      dataLevel: 0,
      dataTypes: [],
      definedProperties: /* @__PURE__ */ new Set(),
      topSchemaRef: v.scopeValue("schema", this.opts.code.source === !0 ? { ref: h.schema, code: (0, e.stringify)(h.schema) } : { ref: h.schema }),
      validateName: O,
      ValidationError: S,
      schema: h.schema,
      schemaEnv: h,
      rootId: g,
      baseId: h.baseId || g,
      schemaPath: e.nil,
      errSchemaPath: h.schemaPath || (this.opts.jtd ? "" : "#"),
      errorPath: (0, e._)`""`,
      opts: this.opts,
      self: this
    };
    let $;
    try {
      this._compilations.add(h), (0, n.validateFunctionCode)(T), v.optimize(this.opts.code.optimize);
      const k = v.toString();
      $ = `${v.scopeRefs(i.default.scope)}return ${k}`, this.opts.code.process && ($ = this.opts.code.process($, h));
      const V = new Function(`${i.default.self}`, `${i.default.scope}`, $)(this, this.scope.get());
      if (this.scope.value(O, { ref: V }), V.errors = null, V.schema = h.schema, V.schemaEnv = h, h.$async && (V.$async = !0), this.opts.code.source === !0 && (V.source = { validateName: O, validateCode: k, scopeValues: v._values }), this.opts.unevaluated) {
        const { props: L, items: B } = T;
        V.evaluated = {
          props: L instanceof e.Name ? void 0 : L,
          items: B instanceof e.Name ? void 0 : B,
          dynamicProps: L instanceof e.Name,
          dynamicItems: B instanceof e.Name
        }, V.source && (V.source.evaluated = (0, e.stringify)(V.evaluated));
      }
      return h.validate = V, h;
    } catch (k) {
      throw delete h.validate, delete h.validateName, $ && this.logger.error("Error compiling schema, function code:", $), k;
    } finally {
      this._compilations.delete(h);
    }
  }
  lt.compileSchema = d;
  function a(h, _, g) {
    var w;
    g = (0, r.resolveUrl)(this.opts.uriResolver, _, g);
    const b = h.refs[g];
    if (b)
      return b;
    let R = c.call(this, h, g);
    if (R === void 0) {
      const v = (w = h.localRefs) === null || w === void 0 ? void 0 : w[g], { schemaId: S } = this.opts;
      v && (R = new s({ schema: v, schemaId: S, root: h, baseId: _ }));
    }
    if (R !== void 0)
      return h.refs[g] = l.call(this, R);
  }
  lt.resolveRef = a;
  function l(h) {
    return (0, r.inlineRef)(h.schema, this.opts.inlineRefs) ? h.schema : h.validate ? h : d.call(this, h);
  }
  function o(h) {
    for (const _ of this._compilations)
      if (f(_, h))
        return _;
  }
  lt.getCompilingSchema = o;
  function f(h, _) {
    return h.schema === _.schema && h.root === _.root && h.baseId === _.baseId;
  }
  function c(h, _) {
    let g;
    for (; typeof (g = this.refs[_]) == "string"; )
      _ = g;
    return g || this.schemas[_] || p.call(this, h, _);
  }
  function p(h, _) {
    const g = this.opts.uriResolver.parse(_), w = (0, r._getFullPath)(this.opts.uriResolver, g);
    let b = (0, r.getFullPath)(this.opts.uriResolver, h.baseId, void 0);
    if (Object.keys(h.schema).length > 0 && w === b)
      return E.call(this, g, h);
    const R = (0, r.normalizeId)(w), v = this.refs[R] || this.schemas[R];
    if (typeof v == "string") {
      const S = p.call(this, h, v);
      return typeof S?.schema != "object" ? void 0 : E.call(this, g, S);
    }
    if (typeof v?.schema == "object") {
      if (v.validate || d.call(this, v), R === (0, r.normalizeId)(_)) {
        const { schema: S } = v, { schemaId: O } = this.opts, T = S[O];
        return T && (b = (0, r.resolveUrl)(this.opts.uriResolver, b, T)), new s({ schema: S, schemaId: O, root: h, baseId: b });
      }
      return E.call(this, g, v);
    }
  }
  lt.resolveSchema = p;
  const y = /* @__PURE__ */ new Set([
    "properties",
    "patternProperties",
    "enum",
    "dependencies",
    "definitions"
  ]);
  function E(h, { baseId: _, schema: g, root: w }) {
    var b;
    if (((b = h.fragment) === null || b === void 0 ? void 0 : b[0]) !== "/")
      return;
    for (const S of h.fragment.slice(1).split("/")) {
      if (typeof g == "boolean")
        return;
      const O = g[(0, u.unescapeFragment)(S)];
      if (O === void 0)
        return;
      g = O;
      const T = typeof g == "object" && g[this.opts.schemaId];
      !y.has(S) && T && (_ = (0, r.resolveUrl)(this.opts.uriResolver, _, T));
    }
    let R;
    if (typeof g != "boolean" && g.$ref && !(0, u.schemaHasRulesButRef)(g, this.RULES)) {
      const S = (0, r.resolveUrl)(this.opts.uriResolver, _, g.$ref);
      R = p.call(this, w, S);
    }
    const { schemaId: v } = this.opts;
    if (R = R || new s({ schema: g, schemaId: v, root: w, baseId: _ }), R.schema !== R.root.schema)
      return R;
  }
  return lt;
}
const rg = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", ng = "Meta-schema for $data reference (JSON AnySchema extension proposal)", ig = "object", ag = ["$data"], sg = { $data: { type: "string", anyOf: [{ format: "relative-json-pointer" }, { format: "json-pointer" }] } }, og = !1, ug = {
  $id: rg,
  description: ng,
  type: ig,
  required: ag,
  properties: sg,
  additionalProperties: og
};
var Yn = {}, qr = { exports: {} }, wa, ml;
function Lh() {
  if (ml) return wa;
  ml = 1;
  const e = RegExp.prototype.test.bind(/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu), t = RegExp.prototype.test.bind(/^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/u);
  function i(c) {
    let p = "", y = 0, E = 0;
    for (E = 0; E < c.length; E++)
      if (y = c[E].charCodeAt(0), y !== 48) {
        if (!(y >= 48 && y <= 57 || y >= 65 && y <= 70 || y >= 97 && y <= 102))
          return "";
        p += c[E];
        break;
      }
    for (E += 1; E < c.length; E++) {
      if (y = c[E].charCodeAt(0), !(y >= 48 && y <= 57 || y >= 65 && y <= 70 || y >= 97 && y <= 102))
        return "";
      p += c[E];
    }
    return p;
  }
  const r = RegExp.prototype.test.bind(/[^!"$&'()*+,\-.;=_`a-z{}~]/u);
  function u(c) {
    return c.length = 0, !0;
  }
  function n(c, p, y) {
    if (c.length) {
      const E = i(c);
      if (E !== "")
        p.push(E);
      else
        return y.error = !0, !1;
      c.length = 0;
    }
    return !0;
  }
  function s(c) {
    let p = 0;
    const y = { error: !1, address: "", zone: "" }, E = [], h = [];
    let _ = !1, g = !1, w = n;
    for (let b = 0; b < c.length; b++) {
      const R = c[b];
      if (!(R === "[" || R === "]"))
        if (R === ":") {
          if (_ === !0 && (g = !0), !w(h, E, y))
            break;
          if (++p > 7) {
            y.error = !0;
            break;
          }
          b > 0 && c[b - 1] === ":" && (_ = !0), E.push(":");
          continue;
        } else if (R === "%") {
          if (!w(h, E, y))
            break;
          w = u;
        } else {
          h.push(R);
          continue;
        }
    }
    return h.length && (w === u ? y.zone = h.join("") : g ? E.push(h.join("")) : E.push(i(h))), y.address = E.join(""), y;
  }
  function d(c) {
    if (a(c, ":") < 2)
      return { host: c, isIPV6: !1 };
    const p = s(c);
    if (p.error)
      return { host: c, isIPV6: !1 };
    {
      let y = p.address, E = p.address;
      return p.zone && (y += "%" + p.zone, E += "%25" + p.zone), { host: y, isIPV6: !0, escapedHost: E };
    }
  }
  function a(c, p) {
    let y = 0;
    for (let E = 0; E < c.length; E++)
      c[E] === p && y++;
    return y;
  }
  function l(c) {
    let p = c;
    const y = [];
    let E = -1, h = 0;
    for (; h = p.length; ) {
      if (h === 1) {
        if (p === ".")
          break;
        if (p === "/") {
          y.push("/");
          break;
        } else {
          y.push(p);
          break;
        }
      } else if (h === 2) {
        if (p[0] === ".") {
          if (p[1] === ".")
            break;
          if (p[1] === "/") {
            p = p.slice(2);
            continue;
          }
        } else if (p[0] === "/" && (p[1] === "." || p[1] === "/")) {
          y.push("/");
          break;
        }
      } else if (h === 3 && p === "/..") {
        y.length !== 0 && y.pop(), y.push("/");
        break;
      }
      if (p[0] === ".") {
        if (p[1] === ".") {
          if (p[2] === "/") {
            p = p.slice(3);
            continue;
          }
        } else if (p[1] === "/") {
          p = p.slice(2);
          continue;
        }
      } else if (p[0] === "/" && p[1] === ".") {
        if (p[2] === "/") {
          p = p.slice(2);
          continue;
        } else if (p[2] === "." && p[3] === "/") {
          p = p.slice(3), y.length !== 0 && y.pop();
          continue;
        }
      }
      if ((E = p.indexOf("/", 1)) === -1) {
        y.push(p);
        break;
      } else
        y.push(p.slice(0, E)), p = p.slice(E);
    }
    return y.join("");
  }
  function o(c, p) {
    const y = p !== !0 ? escape : unescape;
    return c.scheme !== void 0 && (c.scheme = y(c.scheme)), c.userinfo !== void 0 && (c.userinfo = y(c.userinfo)), c.host !== void 0 && (c.host = y(c.host)), c.path !== void 0 && (c.path = y(c.path)), c.query !== void 0 && (c.query = y(c.query)), c.fragment !== void 0 && (c.fragment = y(c.fragment)), c;
  }
  function f(c) {
    const p = [];
    if (c.userinfo !== void 0 && (p.push(c.userinfo), p.push("@")), c.host !== void 0) {
      let y = unescape(c.host);
      if (!t(y)) {
        const E = d(y);
        E.isIPV6 === !0 ? y = `[${E.escapedHost}]` : y = c.host;
      }
      p.push(y);
    }
    return (typeof c.port == "number" || typeof c.port == "string") && (p.push(":"), p.push(String(c.port))), p.length ? p.join("") : void 0;
  }
  return wa = {
    nonSimpleDomain: r,
    recomposeAuthority: f,
    normalizeComponentEncoding: o,
    removeDotSegments: l,
    isIPv4: t,
    isUUID: e,
    normalizeIPv6: d,
    stringArrayToHexStripped: i
  }, wa;
}
var Sa, gl;
function lg() {
  if (gl) return Sa;
  gl = 1;
  const { isUUID: e } = Lh(), t = /([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-.:;=@]|%[\da-f]{2})+)/iu, i = (
    /** @type {const} */
    [
      "http",
      "https",
      "ws",
      "wss",
      "urn",
      "urn:uuid"
    ]
  );
  function r(R) {
    return i.indexOf(
      /** @type {*} */
      R
    ) !== -1;
  }
  function u(R) {
    return R.secure === !0 ? !0 : R.secure === !1 ? !1 : R.scheme ? R.scheme.length === 3 && (R.scheme[0] === "w" || R.scheme[0] === "W") && (R.scheme[1] === "s" || R.scheme[1] === "S") && (R.scheme[2] === "s" || R.scheme[2] === "S") : !1;
  }
  function n(R) {
    return R.host || (R.error = R.error || "HTTP URIs must have a host."), R;
  }
  function s(R) {
    const v = String(R.scheme).toLowerCase() === "https";
    return (R.port === (v ? 443 : 80) || R.port === "") && (R.port = void 0), R.path || (R.path = "/"), R;
  }
  function d(R) {
    return R.secure = u(R), R.resourceName = (R.path || "/") + (R.query ? "?" + R.query : ""), R.path = void 0, R.query = void 0, R;
  }
  function a(R) {
    if ((R.port === (u(R) ? 443 : 80) || R.port === "") && (R.port = void 0), typeof R.secure == "boolean" && (R.scheme = R.secure ? "wss" : "ws", R.secure = void 0), R.resourceName) {
      const [v, S] = R.resourceName.split("?");
      R.path = v && v !== "/" ? v : void 0, R.query = S, R.resourceName = void 0;
    }
    return R.fragment = void 0, R;
  }
  function l(R, v) {
    if (!R.path)
      return R.error = "URN can not be parsed", R;
    const S = R.path.match(t);
    if (S) {
      const O = v.scheme || R.scheme || "urn";
      R.nid = S[1].toLowerCase(), R.nss = S[2];
      const T = `${O}:${v.nid || R.nid}`, $ = b(T);
      R.path = void 0, $ && (R = $.parse(R, v));
    } else
      R.error = R.error || "URN can not be parsed.";
    return R;
  }
  function o(R, v) {
    if (R.nid === void 0)
      throw new Error("URN without nid cannot be serialized");
    const S = v.scheme || R.scheme || "urn", O = R.nid.toLowerCase(), T = `${S}:${v.nid || O}`, $ = b(T);
    $ && (R = $.serialize(R, v));
    const k = R, U = R.nss;
    return k.path = `${O || v.nid}:${U}`, v.skipEscape = !0, k;
  }
  function f(R, v) {
    const S = R;
    return S.uuid = S.nss, S.nss = void 0, !v.tolerant && (!S.uuid || !e(S.uuid)) && (S.error = S.error || "UUID is not valid."), S;
  }
  function c(R) {
    const v = R;
    return v.nss = (R.uuid || "").toLowerCase(), v;
  }
  const p = (
    /** @type {SchemeHandler} */
    {
      scheme: "http",
      domainHost: !0,
      parse: n,
      serialize: s
    }
  ), y = (
    /** @type {SchemeHandler} */
    {
      scheme: "https",
      domainHost: p.domainHost,
      parse: n,
      serialize: s
    }
  ), E = (
    /** @type {SchemeHandler} */
    {
      scheme: "ws",
      domainHost: !0,
      parse: d,
      serialize: a
    }
  ), h = (
    /** @type {SchemeHandler} */
    {
      scheme: "wss",
      domainHost: E.domainHost,
      parse: E.parse,
      serialize: E.serialize
    }
  ), w = (
    /** @type {Record<SchemeName, SchemeHandler>} */
    {
      http: p,
      https: y,
      ws: E,
      wss: h,
      urn: (
        /** @type {SchemeHandler} */
        {
          scheme: "urn",
          parse: l,
          serialize: o,
          skipNormalize: !0
        }
      ),
      "urn:uuid": (
        /** @type {SchemeHandler} */
        {
          scheme: "urn:uuid",
          parse: f,
          serialize: c,
          skipNormalize: !0
        }
      )
    }
  );
  Object.setPrototypeOf(w, null);
  function b(R) {
    return R && (w[
      /** @type {SchemeName} */
      R
    ] || w[
      /** @type {SchemeName} */
      R.toLowerCase()
    ]) || void 0;
  }
  return Sa = {
    wsIsSecure: u,
    SCHEMES: w,
    isValidSchemeName: r,
    getSchemeHandler: b
  }, Sa;
}
var yl;
function cg() {
  if (yl) return qr.exports;
  yl = 1;
  const { normalizeIPv6: e, removeDotSegments: t, recomposeAuthority: i, normalizeComponentEncoding: r, isIPv4: u, nonSimpleDomain: n } = Lh(), { SCHEMES: s, getSchemeHandler: d } = lg();
  function a(h, _) {
    return typeof h == "string" ? h = /** @type {T} */
    c(y(h, _), _) : typeof h == "object" && (h = /** @type {T} */
    y(c(h, _), _)), h;
  }
  function l(h, _, g) {
    const w = g ? Object.assign({ scheme: "null" }, g) : { scheme: "null" }, b = o(y(h, w), y(_, w), w, !0);
    return w.skipEscape = !0, c(b, w);
  }
  function o(h, _, g, w) {
    const b = {};
    return w || (h = y(c(h, g), g), _ = y(c(_, g), g)), g = g || {}, !g.tolerant && _.scheme ? (b.scheme = _.scheme, b.userinfo = _.userinfo, b.host = _.host, b.port = _.port, b.path = t(_.path || ""), b.query = _.query) : (_.userinfo !== void 0 || _.host !== void 0 || _.port !== void 0 ? (b.userinfo = _.userinfo, b.host = _.host, b.port = _.port, b.path = t(_.path || ""), b.query = _.query) : (_.path ? (_.path[0] === "/" ? b.path = t(_.path) : ((h.userinfo !== void 0 || h.host !== void 0 || h.port !== void 0) && !h.path ? b.path = "/" + _.path : h.path ? b.path = h.path.slice(0, h.path.lastIndexOf("/") + 1) + _.path : b.path = _.path, b.path = t(b.path)), b.query = _.query) : (b.path = h.path, _.query !== void 0 ? b.query = _.query : b.query = h.query), b.userinfo = h.userinfo, b.host = h.host, b.port = h.port), b.scheme = h.scheme), b.fragment = _.fragment, b;
  }
  function f(h, _, g) {
    return typeof h == "string" ? (h = unescape(h), h = c(r(y(h, g), !0), { ...g, skipEscape: !0 })) : typeof h == "object" && (h = c(r(h, !0), { ...g, skipEscape: !0 })), typeof _ == "string" ? (_ = unescape(_), _ = c(r(y(_, g), !0), { ...g, skipEscape: !0 })) : typeof _ == "object" && (_ = c(r(_, !0), { ...g, skipEscape: !0 })), h.toLowerCase() === _.toLowerCase();
  }
  function c(h, _) {
    const g = {
      host: h.host,
      scheme: h.scheme,
      userinfo: h.userinfo,
      port: h.port,
      path: h.path,
      query: h.query,
      nid: h.nid,
      nss: h.nss,
      uuid: h.uuid,
      fragment: h.fragment,
      reference: h.reference,
      resourceName: h.resourceName,
      secure: h.secure,
      error: ""
    }, w = Object.assign({}, _), b = [], R = d(w.scheme || g.scheme);
    R && R.serialize && R.serialize(g, w), g.path !== void 0 && (w.skipEscape ? g.path = unescape(g.path) : (g.path = escape(g.path), g.scheme !== void 0 && (g.path = g.path.split("%3A").join(":")))), w.reference !== "suffix" && g.scheme && b.push(g.scheme, ":");
    const v = i(g);
    if (v !== void 0 && (w.reference !== "suffix" && b.push("//"), b.push(v), g.path && g.path[0] !== "/" && b.push("/")), g.path !== void 0) {
      let S = g.path;
      !w.absolutePath && (!R || !R.absolutePath) && (S = t(S)), v === void 0 && S[0] === "/" && S[1] === "/" && (S = "/%2F" + S.slice(2)), b.push(S);
    }
    return g.query !== void 0 && b.push("?", g.query), g.fragment !== void 0 && b.push("#", g.fragment), b.join("");
  }
  const p = /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u;
  function y(h, _) {
    const g = Object.assign({}, _), w = {
      scheme: void 0,
      userinfo: void 0,
      host: "",
      port: void 0,
      path: "",
      query: void 0,
      fragment: void 0
    };
    let b = !1;
    g.reference === "suffix" && (g.scheme ? h = g.scheme + ":" + h : h = "//" + h);
    const R = h.match(p);
    if (R) {
      if (w.scheme = R[1], w.userinfo = R[3], w.host = R[4], w.port = parseInt(R[5], 10), w.path = R[6] || "", w.query = R[7], w.fragment = R[8], isNaN(w.port) && (w.port = R[5]), w.host)
        if (u(w.host) === !1) {
          const O = e(w.host);
          w.host = O.host.toLowerCase(), b = O.isIPV6;
        } else
          b = !0;
      w.scheme === void 0 && w.userinfo === void 0 && w.host === void 0 && w.port === void 0 && w.query === void 0 && !w.path ? w.reference = "same-document" : w.scheme === void 0 ? w.reference = "relative" : w.fragment === void 0 ? w.reference = "absolute" : w.reference = "uri", g.reference && g.reference !== "suffix" && g.reference !== w.reference && (w.error = w.error || "URI is not a " + g.reference + " reference.");
      const v = d(g.scheme || w.scheme);
      if (!g.unicodeSupport && (!v || !v.unicodeSupport) && w.host && (g.domainHost || v && v.domainHost) && b === !1 && n(w.host))
        try {
          w.host = URL.domainToASCII(w.host.toLowerCase());
        } catch (S) {
          w.error = w.error || "Host's domain name can not be converted to ASCII: " + S;
        }
      (!v || v && !v.skipNormalize) && (h.indexOf("%") !== -1 && (w.scheme !== void 0 && (w.scheme = unescape(w.scheme)), w.host !== void 0 && (w.host = unescape(w.host))), w.path && (w.path = escape(unescape(w.path))), w.fragment && (w.fragment = encodeURI(decodeURIComponent(w.fragment)))), v && v.parse && v.parse(w, g);
    } else
      w.error = w.error || "URI can not be parsed.";
    return w;
  }
  const E = {
    SCHEMES: s,
    normalize: a,
    resolve: l,
    resolveComponent: o,
    equal: f,
    serialize: c,
    parse: y
  };
  return qr.exports = E, qr.exports.default = E, qr.exports.fastUri = E, qr.exports;
}
var _l;
function dg() {
  if (_l) return Yn;
  _l = 1, Object.defineProperty(Yn, "__esModule", { value: !0 });
  const e = cg();
  return e.code = 'require("ajv/dist/runtime/uri").default', Yn.default = e, Yn;
}
var El;
function fg() {
  return El || (El = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
    var t = Qi();
    Object.defineProperty(e, "KeywordCxt", { enumerable: !0, get: function() {
      return t.KeywordCxt;
    } });
    var i = Oe();
    Object.defineProperty(e, "_", { enumerable: !0, get: function() {
      return i._;
    } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
      return i.str;
    } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
      return i.stringify;
    } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
      return i.nil;
    } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
      return i.Name;
    } }), Object.defineProperty(e, "CodeGen", { enumerable: !0, get: function() {
      return i.CodeGen;
    } });
    const r = Mo(), u = Zi(), n = Dh(), s = jo(), d = Oe(), a = Ji(), l = Xi(), o = Ie(), f = ug, c = dg(), p = (F, x) => new RegExp(F, x);
    p.code = "new RegExp";
    const y = ["removeAdditional", "useDefaults", "coerceTypes"], E = /* @__PURE__ */ new Set([
      "validate",
      "serialize",
      "parse",
      "wrapper",
      "root",
      "schema",
      "keyword",
      "pattern",
      "formats",
      "validate$data",
      "func",
      "obj",
      "Error"
    ]), h = {
      errorDataPath: "",
      format: "`validateFormats: false` can be used instead.",
      nullable: '"nullable" keyword is supported by default.',
      jsonPointers: "Deprecated jsPropertySyntax can be used instead.",
      extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.",
      missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.",
      processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`",
      sourceCode: "Use option `code: {source: true}`",
      strictDefaults: "It is default now, see option `strict`.",
      strictKeywords: "It is default now, see option `strict`.",
      uniqueItems: '"uniqueItems" keyword is always validated.',
      unknownFormats: "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",
      cache: "Map is used as cache, schema object as key.",
      serialize: "Map is used as cache, schema object as key.",
      ajvErrors: "It is default now."
    }, _ = {
      ignoreKeywordsWithRef: "",
      jsPropertySyntax: "",
      unicode: '"minLength"/"maxLength" account for unicode characters by default.'
    }, g = 200;
    function w(F) {
      var x, X, G, P, C, K, N, A, J, M, q, z, Q, re, le, Se, Te, Fe, He, Be, Le, m, Z, ne, pe;
      const ie = F.strict, he = (x = F.code) === null || x === void 0 ? void 0 : x.optimize, ce = he === !0 || he === void 0 ? 1 : he || 0, me = (G = (X = F.code) === null || X === void 0 ? void 0 : X.regExp) !== null && G !== void 0 ? G : p, ye = (P = F.uriResolver) !== null && P !== void 0 ? P : c.default;
      return {
        strictSchema: (K = (C = F.strictSchema) !== null && C !== void 0 ? C : ie) !== null && K !== void 0 ? K : !0,
        strictNumbers: (A = (N = F.strictNumbers) !== null && N !== void 0 ? N : ie) !== null && A !== void 0 ? A : !0,
        strictTypes: (M = (J = F.strictTypes) !== null && J !== void 0 ? J : ie) !== null && M !== void 0 ? M : "log",
        strictTuples: (z = (q = F.strictTuples) !== null && q !== void 0 ? q : ie) !== null && z !== void 0 ? z : "log",
        strictRequired: (re = (Q = F.strictRequired) !== null && Q !== void 0 ? Q : ie) !== null && re !== void 0 ? re : !1,
        code: F.code ? { ...F.code, optimize: ce, regExp: me } : { optimize: ce, regExp: me },
        loopRequired: (le = F.loopRequired) !== null && le !== void 0 ? le : g,
        loopEnum: (Se = F.loopEnum) !== null && Se !== void 0 ? Se : g,
        meta: (Te = F.meta) !== null && Te !== void 0 ? Te : !0,
        messages: (Fe = F.messages) !== null && Fe !== void 0 ? Fe : !0,
        inlineRefs: (He = F.inlineRefs) !== null && He !== void 0 ? He : !0,
        schemaId: (Be = F.schemaId) !== null && Be !== void 0 ? Be : "$id",
        addUsedSchema: (Le = F.addUsedSchema) !== null && Le !== void 0 ? Le : !0,
        validateSchema: (m = F.validateSchema) !== null && m !== void 0 ? m : !0,
        validateFormats: (Z = F.validateFormats) !== null && Z !== void 0 ? Z : !0,
        unicodeRegExp: (ne = F.unicodeRegExp) !== null && ne !== void 0 ? ne : !0,
        int32range: (pe = F.int32range) !== null && pe !== void 0 ? pe : !0,
        uriResolver: ye
      };
    }
    class b {
      constructor(x = {}) {
        this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), x = this.opts = { ...x, ...w(x) };
        const { es5: X, lines: G } = this.opts.code;
        this.scope = new d.ValueScope({ scope: {}, prefixes: E, es5: X, lines: G }), this.logger = U(x.logger);
        const P = x.validateFormats;
        x.validateFormats = !1, this.RULES = (0, n.getRules)(), R.call(this, h, x, "NOT SUPPORTED"), R.call(this, _, x, "DEPRECATED", "warn"), this._metaOpts = $.call(this), x.formats && O.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), x.keywords && T.call(this, x.keywords), typeof x.meta == "object" && this.addMetaSchema(x.meta), S.call(this), x.validateFormats = P;
      }
      _addVocabularies() {
        this.addKeyword("$async");
      }
      _addDefaultMetaSchema() {
        const { $data: x, meta: X, schemaId: G } = this.opts;
        let P = f;
        G === "id" && (P = { ...f }, P.id = P.$id, delete P.$id), X && x && this.addMetaSchema(P, P[G], !1);
      }
      defaultMeta() {
        const { meta: x, schemaId: X } = this.opts;
        return this.opts.defaultMeta = typeof x == "object" ? x[X] || x : void 0;
      }
      validate(x, X) {
        let G;
        if (typeof x == "string") {
          if (G = this.getSchema(x), !G)
            throw new Error(`no schema with key or ref "${x}"`);
        } else
          G = this.compile(x);
        const P = G(X);
        return "$async" in G || (this.errors = G.errors), P;
      }
      compile(x, X) {
        const G = this._addSchema(x, X);
        return G.validate || this._compileSchemaEnv(G);
      }
      compileAsync(x, X) {
        if (typeof this.opts.loadSchema != "function")
          throw new Error("options.loadSchema should be a function");
        const { loadSchema: G } = this.opts;
        return P.call(this, x, X);
        async function P(M, q) {
          await C.call(this, M.$schema);
          const z = this._addSchema(M, q);
          return z.validate || K.call(this, z);
        }
        async function C(M) {
          M && !this.getSchema(M) && await P.call(this, { $ref: M }, !0);
        }
        async function K(M) {
          try {
            return this._compileSchemaEnv(M);
          } catch (q) {
            if (!(q instanceof u.default))
              throw q;
            return N.call(this, q), await A.call(this, q.missingSchema), K.call(this, M);
          }
        }
        function N({ missingSchema: M, missingRef: q }) {
          if (this.refs[M])
            throw new Error(`AnySchema ${M} is loaded but ${q} cannot be resolved`);
        }
        async function A(M) {
          const q = await J.call(this, M);
          this.refs[M] || await C.call(this, q.$schema), this.refs[M] || this.addSchema(q, M, X);
        }
        async function J(M) {
          const q = this._loading[M];
          if (q)
            return q;
          try {
            return await (this._loading[M] = G(M));
          } finally {
            delete this._loading[M];
          }
        }
      }
      // Adds schema to the instance
      addSchema(x, X, G, P = this.opts.validateSchema) {
        if (Array.isArray(x)) {
          for (const K of x)
            this.addSchema(K, void 0, G, P);
          return this;
        }
        let C;
        if (typeof x == "object") {
          const { schemaId: K } = this.opts;
          if (C = x[K], C !== void 0 && typeof C != "string")
            throw new Error(`schema ${K} must be string`);
        }
        return X = (0, a.normalizeId)(X || C), this._checkUnique(X), this.schemas[X] = this._addSchema(x, G, X, P, !0), this;
      }
      // Add schema that will be used to validate other schemas
      // options in META_IGNORE_OPTIONS are alway set to false
      addMetaSchema(x, X, G = this.opts.validateSchema) {
        return this.addSchema(x, X, !0, G), this;
      }
      //  Validate schema against its meta-schema
      validateSchema(x, X) {
        if (typeof x == "boolean")
          return !0;
        let G;
        if (G = x.$schema, G !== void 0 && typeof G != "string")
          throw new Error("$schema must be a string");
        if (G = G || this.opts.defaultMeta || this.defaultMeta(), !G)
          return this.logger.warn("meta-schema not available"), this.errors = null, !0;
        const P = this.validate(G, x);
        if (!P && X) {
          const C = "schema is invalid: " + this.errorsText();
          if (this.opts.validateSchema === "log")
            this.logger.error(C);
          else
            throw new Error(C);
        }
        return P;
      }
      // Get compiled schema by `key` or `ref`.
      // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
      getSchema(x) {
        let X;
        for (; typeof (X = v.call(this, x)) == "string"; )
          x = X;
        if (X === void 0) {
          const { schemaId: G } = this.opts, P = new s.SchemaEnv({ schema: {}, schemaId: G });
          if (X = s.resolveSchema.call(this, P, x), !X)
            return;
          this.refs[x] = X;
        }
        return X.validate || this._compileSchemaEnv(X);
      }
      // Remove cached schema(s).
      // If no parameter is passed all schemas but meta-schemas are removed.
      // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
      // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
      removeSchema(x) {
        if (x instanceof RegExp)
          return this._removeAllSchemas(this.schemas, x), this._removeAllSchemas(this.refs, x), this;
        switch (typeof x) {
          case "undefined":
            return this._removeAllSchemas(this.schemas), this._removeAllSchemas(this.refs), this._cache.clear(), this;
          case "string": {
            const X = v.call(this, x);
            return typeof X == "object" && this._cache.delete(X.schema), delete this.schemas[x], delete this.refs[x], this;
          }
          case "object": {
            const X = x;
            this._cache.delete(X);
            let G = x[this.opts.schemaId];
            return G && (G = (0, a.normalizeId)(G), delete this.schemas[G], delete this.refs[G]), this;
          }
          default:
            throw new Error("ajv.removeSchema: invalid parameter");
        }
      }
      // add "vocabulary" - a collection of keywords
      addVocabulary(x) {
        for (const X of x)
          this.addKeyword(X);
        return this;
      }
      addKeyword(x, X) {
        let G;
        if (typeof x == "string")
          G = x, typeof X == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), X.keyword = G);
        else if (typeof x == "object" && X === void 0) {
          if (X = x, G = X.keyword, Array.isArray(G) && !G.length)
            throw new Error("addKeywords: keyword must be string or non-empty array");
        } else
          throw new Error("invalid addKeywords parameters");
        if (L.call(this, G, X), !X)
          return (0, o.eachItem)(G, (C) => B.call(this, C)), this;
        j.call(this, X);
        const P = {
          ...X,
          type: (0, l.getJSONTypes)(X.type),
          schemaType: (0, l.getJSONTypes)(X.schemaType)
        };
        return (0, o.eachItem)(G, P.type.length === 0 ? (C) => B.call(this, C, P) : (C) => P.type.forEach((K) => B.call(this, C, P, K))), this;
      }
      getKeyword(x) {
        const X = this.RULES.all[x];
        return typeof X == "object" ? X.definition : !!X;
      }
      // Remove keyword
      removeKeyword(x) {
        const { RULES: X } = this;
        delete X.keywords[x], delete X.all[x];
        for (const G of X.rules) {
          const P = G.rules.findIndex((C) => C.keyword === x);
          P >= 0 && G.rules.splice(P, 1);
        }
        return this;
      }
      // Add format
      addFormat(x, X) {
        return typeof X == "string" && (X = new RegExp(X)), this.formats[x] = X, this;
      }
      errorsText(x = this.errors, { separator: X = ", ", dataVar: G = "data" } = {}) {
        return !x || x.length === 0 ? "No errors" : x.map((P) => `${G}${P.instancePath} ${P.message}`).reduce((P, C) => P + X + C);
      }
      $dataMetaSchema(x, X) {
        const G = this.RULES.all;
        x = JSON.parse(JSON.stringify(x));
        for (const P of X) {
          const C = P.split("/").slice(1);
          let K = x;
          for (const N of C)
            K = K[N];
          for (const N in G) {
            const A = G[N];
            if (typeof A != "object")
              continue;
            const { $data: J } = A.definition, M = K[N];
            J && M && (K[N] = Y(M));
          }
        }
        return x;
      }
      _removeAllSchemas(x, X) {
        for (const G in x) {
          const P = x[G];
          (!X || X.test(G)) && (typeof P == "string" ? delete x[G] : P && !P.meta && (this._cache.delete(P.schema), delete x[G]));
        }
      }
      _addSchema(x, X, G, P = this.opts.validateSchema, C = this.opts.addUsedSchema) {
        let K;
        const { schemaId: N } = this.opts;
        if (typeof x == "object")
          K = x[N];
        else {
          if (this.opts.jtd)
            throw new Error("schema must be object");
          if (typeof x != "boolean")
            throw new Error("schema must be object or boolean");
        }
        let A = this._cache.get(x);
        if (A !== void 0)
          return A;
        G = (0, a.normalizeId)(K || G);
        const J = a.getSchemaRefs.call(this, x, G);
        return A = new s.SchemaEnv({ schema: x, schemaId: N, meta: X, baseId: G, localRefs: J }), this._cache.set(A.schema, A), C && !G.startsWith("#") && (G && this._checkUnique(G), this.refs[G] = A), P && this.validateSchema(x, !0), A;
      }
      _checkUnique(x) {
        if (this.schemas[x] || this.refs[x])
          throw new Error(`schema with key or id "${x}" already exists`);
      }
      _compileSchemaEnv(x) {
        if (x.meta ? this._compileMetaSchema(x) : s.compileSchema.call(this, x), !x.validate)
          throw new Error("ajv implementation error");
        return x.validate;
      }
      _compileMetaSchema(x) {
        const X = this.opts;
        this.opts = this._metaOpts;
        try {
          s.compileSchema.call(this, x);
        } finally {
          this.opts = X;
        }
      }
    }
    b.ValidationError = r.default, b.MissingRefError = u.default, e.default = b;
    function R(F, x, X, G = "error") {
      for (const P in F) {
        const C = P;
        C in x && this.logger[G](`${X}: option ${P}. ${F[C]}`);
      }
    }
    function v(F) {
      return F = (0, a.normalizeId)(F), this.schemas[F] || this.refs[F];
    }
    function S() {
      const F = this.opts.schemas;
      if (F)
        if (Array.isArray(F))
          this.addSchema(F);
        else
          for (const x in F)
            this.addSchema(F[x], x);
    }
    function O() {
      for (const F in this.opts.formats) {
        const x = this.opts.formats[F];
        x && this.addFormat(F, x);
      }
    }
    function T(F) {
      if (Array.isArray(F)) {
        this.addVocabulary(F);
        return;
      }
      this.logger.warn("keywords option as map is deprecated, pass array");
      for (const x in F) {
        const X = F[x];
        X.keyword || (X.keyword = x), this.addKeyword(X);
      }
    }
    function $() {
      const F = { ...this.opts };
      for (const x of y)
        delete F[x];
      return F;
    }
    const k = { log() {
    }, warn() {
    }, error() {
    } };
    function U(F) {
      if (F === !1)
        return k;
      if (F === void 0)
        return console;
      if (F.log && F.warn && F.error)
        return F;
      throw new Error("logger must implement log, warn and error methods");
    }
    const V = /^[a-z_$][a-z0-9_$:-]*$/i;
    function L(F, x) {
      const { RULES: X } = this;
      if ((0, o.eachItem)(F, (G) => {
        if (X.keywords[G])
          throw new Error(`Keyword ${G} is already defined`);
        if (!V.test(G))
          throw new Error(`Keyword ${G} has invalid name`);
      }), !!x && x.$data && !("code" in x || "validate" in x))
        throw new Error('$data keyword must have "code" or "validate" function');
    }
    function B(F, x, X) {
      var G;
      const P = x?.post;
      if (X && P)
        throw new Error('keyword with "post" flag cannot have "type"');
      const { RULES: C } = this;
      let K = P ? C.post : C.rules.find(({ type: A }) => A === X);
      if (K || (K = { type: X, rules: [] }, C.rules.push(K)), C.keywords[F] = !0, !x)
        return;
      const N = {
        keyword: F,
        definition: {
          ...x,
          type: (0, l.getJSONTypes)(x.type),
          schemaType: (0, l.getJSONTypes)(x.schemaType)
        }
      };
      x.before ? te.call(this, K, N, x.before) : K.rules.push(N), C.all[F] = N, (G = x.implements) === null || G === void 0 || G.forEach((A) => this.addKeyword(A));
    }
    function te(F, x, X) {
      const G = F.rules.findIndex((P) => P.keyword === X);
      G >= 0 ? F.rules.splice(G, 0, x) : (F.rules.push(x), this.logger.warn(`rule ${X} is not defined`));
    }
    function j(F) {
      let { metaSchema: x } = F;
      x !== void 0 && (F.$data && this.opts.$data && (x = Y(x)), F.validateSchema = this.compile(x, !0));
    }
    const H = {
      $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
    };
    function Y(F) {
      return { anyOf: [F, H] };
    }
  })(pa)), pa;
}
var Xn = {}, Wn = {}, Kn = {}, vl;
function hg() {
  if (vl) return Kn;
  vl = 1, Object.defineProperty(Kn, "__esModule", { value: !0 });
  const e = {
    keyword: "id",
    code() {
      throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
    }
  };
  return Kn.default = e, Kn;
}
var Mt = {}, wl;
function pg() {
  if (wl) return Mt;
  wl = 1, Object.defineProperty(Mt, "__esModule", { value: !0 }), Mt.callRef = Mt.getValidate = void 0;
  const e = Zi(), t = bt(), i = Oe(), r = Xt(), u = jo(), n = Ie(), s = {
    keyword: "$ref",
    schemaType: "string",
    code(l) {
      const { gen: o, schema: f, it: c } = l, { baseId: p, schemaEnv: y, validateName: E, opts: h, self: _ } = c, { root: g } = y;
      if ((f === "#" || f === "#/") && p === g.baseId)
        return b();
      const w = u.resolveRef.call(_, g, p, f);
      if (w === void 0)
        throw new e.default(c.opts.uriResolver, p, f);
      if (w instanceof u.SchemaEnv)
        return R(w);
      return v(w);
      function b() {
        if (y === g)
          return a(l, E, y, y.$async);
        const S = o.scopeValue("root", { ref: g });
        return a(l, (0, i._)`${S}.validate`, g, g.$async);
      }
      function R(S) {
        const O = d(l, S);
        a(l, O, S, S.$async);
      }
      function v(S) {
        const O = o.scopeValue("schema", h.code.source === !0 ? { ref: S, code: (0, i.stringify)(S) } : { ref: S }), T = o.name("valid"), $ = l.subschema({
          schema: S,
          dataTypes: [],
          schemaPath: i.nil,
          topSchemaRef: O,
          errSchemaPath: f
        }, T);
        l.mergeEvaluated($), l.ok(T);
      }
    }
  };
  function d(l, o) {
    const { gen: f } = l;
    return o.validate ? f.scopeValue("validate", { ref: o.validate }) : (0, i._)`${f.scopeValue("wrapper", { ref: o })}.validate`;
  }
  Mt.getValidate = d;
  function a(l, o, f, c) {
    const { gen: p, it: y } = l, { allErrors: E, schemaEnv: h, opts: _ } = y, g = _.passContext ? r.default.this : i.nil;
    c ? w() : b();
    function w() {
      if (!h.$async)
        throw new Error("async schema referenced by sync schema");
      const S = p.let("valid");
      p.try(() => {
        p.code((0, i._)`await ${(0, t.callValidateCode)(l, o, g)}`), v(o), E || p.assign(S, !0);
      }, (O) => {
        p.if((0, i._)`!(${O} instanceof ${y.ValidationError})`, () => p.throw(O)), R(O), E || p.assign(S, !1);
      }), l.ok(S);
    }
    function b() {
      l.result((0, t.callValidateCode)(l, o, g), () => v(o), () => R(o));
    }
    function R(S) {
      const O = (0, i._)`${S}.errors`;
      p.assign(r.default.vErrors, (0, i._)`${r.default.vErrors} === null ? ${O} : ${r.default.vErrors}.concat(${O})`), p.assign(r.default.errors, (0, i._)`${r.default.vErrors}.length`);
    }
    function v(S) {
      var O;
      if (!y.opts.unevaluated)
        return;
      const T = (O = f?.validate) === null || O === void 0 ? void 0 : O.evaluated;
      if (y.props !== !0)
        if (T && !T.dynamicProps)
          T.props !== void 0 && (y.props = n.mergeEvaluated.props(p, T.props, y.props));
        else {
          const $ = p.var("props", (0, i._)`${S}.evaluated.props`);
          y.props = n.mergeEvaluated.props(p, $, y.props, i.Name);
        }
      if (y.items !== !0)
        if (T && !T.dynamicItems)
          T.items !== void 0 && (y.items = n.mergeEvaluated.items(p, T.items, y.items));
        else {
          const $ = p.var("items", (0, i._)`${S}.evaluated.items`);
          y.items = n.mergeEvaluated.items(p, $, y.items, i.Name);
        }
    }
  }
  return Mt.callRef = a, Mt.default = s, Mt;
}
var Sl;
function mg() {
  if (Sl) return Wn;
  Sl = 1, Object.defineProperty(Wn, "__esModule", { value: !0 });
  const e = hg(), t = pg(), i = [
    "$schema",
    "$id",
    "$defs",
    "$vocabulary",
    { keyword: "$comment" },
    "definitions",
    e.default,
    t.default
  ];
  return Wn.default = i, Wn;
}
var Jn = {}, Qn = {}, Tl;
function gg() {
  if (Tl) return Qn;
  Tl = 1, Object.defineProperty(Qn, "__esModule", { value: !0 });
  const e = Oe(), t = e.operators, i = {
    maximum: { okStr: "<=", ok: t.LTE, fail: t.GT },
    minimum: { okStr: ">=", ok: t.GTE, fail: t.LT },
    exclusiveMaximum: { okStr: "<", ok: t.LT, fail: t.GTE },
    exclusiveMinimum: { okStr: ">", ok: t.GT, fail: t.LTE }
  }, r = {
    message: ({ keyword: n, schemaCode: s }) => (0, e.str)`must be ${i[n].okStr} ${s}`,
    params: ({ keyword: n, schemaCode: s }) => (0, e._)`{comparison: ${i[n].okStr}, limit: ${s}}`
  }, u = {
    keyword: Object.keys(i),
    type: "number",
    schemaType: "number",
    $data: !0,
    error: r,
    code(n) {
      const { keyword: s, data: d, schemaCode: a } = n;
      n.fail$data((0, e._)`${d} ${i[s].fail} ${a} || isNaN(${d})`);
    }
  };
  return Qn.default = u, Qn;
}
var Zn = {}, bl;
function yg() {
  if (bl) return Zn;
  bl = 1, Object.defineProperty(Zn, "__esModule", { value: !0 });
  const e = Oe(), i = {
    keyword: "multipleOf",
    type: "number",
    schemaType: "number",
    $data: !0,
    error: {
      message: ({ schemaCode: r }) => (0, e.str)`must be multiple of ${r}`,
      params: ({ schemaCode: r }) => (0, e._)`{multipleOf: ${r}}`
    },
    code(r) {
      const { gen: u, data: n, schemaCode: s, it: d } = r, a = d.opts.multipleOfPrecision, l = u.let("res"), o = a ? (0, e._)`Math.abs(Math.round(${l}) - ${l}) > 1e-${a}` : (0, e._)`${l} !== parseInt(${l})`;
      r.fail$data((0, e._)`(${s} === 0 || (${l} = ${n}/${s}, ${o}))`);
    }
  };
  return Zn.default = i, Zn;
}
var ei = {}, ti = {}, Rl;
function _g() {
  if (Rl) return ti;
  Rl = 1, Object.defineProperty(ti, "__esModule", { value: !0 });
  function e(t) {
    const i = t.length;
    let r = 0, u = 0, n;
    for (; u < i; )
      r++, n = t.charCodeAt(u++), n >= 55296 && n <= 56319 && u < i && (n = t.charCodeAt(u), (n & 64512) === 56320 && u++);
    return r;
  }
  return ti.default = e, e.code = 'require("ajv/dist/runtime/ucs2length").default', ti;
}
var Al;
function Eg() {
  if (Al) return ei;
  Al = 1, Object.defineProperty(ei, "__esModule", { value: !0 });
  const e = Oe(), t = Ie(), i = _g(), u = {
    keyword: ["maxLength", "minLength"],
    type: "string",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: n, schemaCode: s }) {
        const d = n === "maxLength" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${d} than ${s} characters`;
      },
      params: ({ schemaCode: n }) => (0, e._)`{limit: ${n}}`
    },
    code(n) {
      const { keyword: s, data: d, schemaCode: a, it: l } = n, o = s === "maxLength" ? e.operators.GT : e.operators.LT, f = l.opts.unicode === !1 ? (0, e._)`${d}.length` : (0, e._)`${(0, t.useFunc)(n.gen, i.default)}(${d})`;
      n.fail$data((0, e._)`${f} ${o} ${a}`);
    }
  };
  return ei.default = u, ei;
}
var ri = {}, Ol;
function vg() {
  if (Ol) return ri;
  Ol = 1, Object.defineProperty(ri, "__esModule", { value: !0 });
  const e = bt(), t = Oe(), r = {
    keyword: "pattern",
    type: "string",
    schemaType: "string",
    $data: !0,
    error: {
      message: ({ schemaCode: u }) => (0, t.str)`must match pattern "${u}"`,
      params: ({ schemaCode: u }) => (0, t._)`{pattern: ${u}}`
    },
    code(u) {
      const { data: n, $data: s, schema: d, schemaCode: a, it: l } = u, o = l.opts.unicodeRegExp ? "u" : "", f = s ? (0, t._)`(new RegExp(${a}, ${o}))` : (0, e.usePattern)(u, d);
      u.fail$data((0, t._)`!${f}.test(${n})`);
    }
  };
  return ri.default = r, ri;
}
var ni = {}, Nl;
function wg() {
  if (Nl) return ni;
  Nl = 1, Object.defineProperty(ni, "__esModule", { value: !0 });
  const e = Oe(), i = {
    keyword: ["maxProperties", "minProperties"],
    type: "object",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: r, schemaCode: u }) {
        const n = r === "maxProperties" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${n} than ${u} properties`;
      },
      params: ({ schemaCode: r }) => (0, e._)`{limit: ${r}}`
    },
    code(r) {
      const { keyword: u, data: n, schemaCode: s } = r, d = u === "maxProperties" ? e.operators.GT : e.operators.LT;
      r.fail$data((0, e._)`Object.keys(${n}).length ${d} ${s}`);
    }
  };
  return ni.default = i, ni;
}
var ii = {}, Pl;
function Sg() {
  if (Pl) return ii;
  Pl = 1, Object.defineProperty(ii, "__esModule", { value: !0 });
  const e = bt(), t = Oe(), i = Ie(), u = {
    keyword: "required",
    type: "object",
    schemaType: "array",
    $data: !0,
    error: {
      message: ({ params: { missingProperty: n } }) => (0, t.str)`must have required property '${n}'`,
      params: ({ params: { missingProperty: n } }) => (0, t._)`{missingProperty: ${n}}`
    },
    code(n) {
      const { gen: s, schema: d, schemaCode: a, data: l, $data: o, it: f } = n, { opts: c } = f;
      if (!o && d.length === 0)
        return;
      const p = d.length >= c.loopRequired;
      if (f.allErrors ? y() : E(), c.strictRequired) {
        const g = n.parentSchema.properties, { definedProperties: w } = n.it;
        for (const b of d)
          if (g?.[b] === void 0 && !w.has(b)) {
            const R = f.schemaEnv.baseId + f.errSchemaPath, v = `required property "${b}" is not defined at "${R}" (strictRequired)`;
            (0, i.checkStrictMode)(f, v, f.opts.strictRequired);
          }
      }
      function y() {
        if (p || o)
          n.block$data(t.nil, h);
        else
          for (const g of d)
            (0, e.checkReportMissingProp)(n, g);
      }
      function E() {
        const g = s.let("missing");
        if (p || o) {
          const w = s.let("valid", !0);
          n.block$data(w, () => _(g, w)), n.ok(w);
        } else
          s.if((0, e.checkMissingProp)(n, d, g)), (0, e.reportMissingProp)(n, g), s.else();
      }
      function h() {
        s.forOf("prop", a, (g) => {
          n.setParams({ missingProperty: g }), s.if((0, e.noPropertyInData)(s, l, g, c.ownProperties), () => n.error());
        });
      }
      function _(g, w) {
        n.setParams({ missingProperty: g }), s.forOf(g, a, () => {
          s.assign(w, (0, e.propertyInData)(s, l, g, c.ownProperties)), s.if((0, t.not)(w), () => {
            n.error(), s.break();
          });
        }, t.nil);
      }
    }
  };
  return ii.default = u, ii;
}
var ai = {}, Cl;
function Tg() {
  if (Cl) return ai;
  Cl = 1, Object.defineProperty(ai, "__esModule", { value: !0 });
  const e = Oe(), i = {
    keyword: ["maxItems", "minItems"],
    type: "array",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: r, schemaCode: u }) {
        const n = r === "maxItems" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${n} than ${u} items`;
      },
      params: ({ schemaCode: r }) => (0, e._)`{limit: ${r}}`
    },
    code(r) {
      const { keyword: u, data: n, schemaCode: s } = r, d = u === "maxItems" ? e.operators.GT : e.operators.LT;
      r.fail$data((0, e._)`${n}.length ${d} ${s}`);
    }
  };
  return ai.default = i, ai;
}
var si = {}, oi = {}, Il;
function Bo() {
  if (Il) return oi;
  Il = 1, Object.defineProperty(oi, "__esModule", { value: !0 });
  const e = kh();
  return e.code = 'require("ajv/dist/runtime/equal").default', oi.default = e, oi;
}
var Dl;
function bg() {
  if (Dl) return si;
  Dl = 1, Object.defineProperty(si, "__esModule", { value: !0 });
  const e = Xi(), t = Oe(), i = Ie(), r = Bo(), n = {
    keyword: "uniqueItems",
    type: "array",
    schemaType: "boolean",
    $data: !0,
    error: {
      message: ({ params: { i: s, j: d } }) => (0, t.str)`must NOT have duplicate items (items ## ${d} and ${s} are identical)`,
      params: ({ params: { i: s, j: d } }) => (0, t._)`{i: ${s}, j: ${d}}`
    },
    code(s) {
      const { gen: d, data: a, $data: l, schema: o, parentSchema: f, schemaCode: c, it: p } = s;
      if (!l && !o)
        return;
      const y = d.let("valid"), E = f.items ? (0, e.getSchemaTypes)(f.items) : [];
      s.block$data(y, h, (0, t._)`${c} === false`), s.ok(y);
      function h() {
        const b = d.let("i", (0, t._)`${a}.length`), R = d.let("j");
        s.setParams({ i: b, j: R }), d.assign(y, !0), d.if((0, t._)`${b} > 1`, () => (_() ? g : w)(b, R));
      }
      function _() {
        return E.length > 0 && !E.some((b) => b === "object" || b === "array");
      }
      function g(b, R) {
        const v = d.name("item"), S = (0, e.checkDataTypes)(E, v, p.opts.strictNumbers, e.DataType.Wrong), O = d.const("indices", (0, t._)`{}`);
        d.for((0, t._)`;${b}--;`, () => {
          d.let(v, (0, t._)`${a}[${b}]`), d.if(S, (0, t._)`continue`), E.length > 1 && d.if((0, t._)`typeof ${v} == "string"`, (0, t._)`${v} += "_"`), d.if((0, t._)`typeof ${O}[${v}] == "number"`, () => {
            d.assign(R, (0, t._)`${O}[${v}]`), s.error(), d.assign(y, !1).break();
          }).code((0, t._)`${O}[${v}] = ${b}`);
        });
      }
      function w(b, R) {
        const v = (0, i.useFunc)(d, r.default), S = d.name("outer");
        d.label(S).for((0, t._)`;${b}--;`, () => d.for((0, t._)`${R} = ${b}; ${R}--;`, () => d.if((0, t._)`${v}(${a}[${b}], ${a}[${R}])`, () => {
          s.error(), d.assign(y, !1).break(S);
        })));
      }
    }
  };
  return si.default = n, si;
}
var ui = {}, $l;
function Rg() {
  if ($l) return ui;
  $l = 1, Object.defineProperty(ui, "__esModule", { value: !0 });
  const e = Oe(), t = Ie(), i = Bo(), u = {
    keyword: "const",
    $data: !0,
    error: {
      message: "must be equal to constant",
      params: ({ schemaCode: n }) => (0, e._)`{allowedValue: ${n}}`
    },
    code(n) {
      const { gen: s, data: d, $data: a, schemaCode: l, schema: o } = n;
      a || o && typeof o == "object" ? n.fail$data((0, e._)`!${(0, t.useFunc)(s, i.default)}(${d}, ${l})`) : n.fail((0, e._)`${o} !== ${d}`);
    }
  };
  return ui.default = u, ui;
}
var li = {}, kl;
function Ag() {
  if (kl) return li;
  kl = 1, Object.defineProperty(li, "__esModule", { value: !0 });
  const e = Oe(), t = Ie(), i = Bo(), u = {
    keyword: "enum",
    schemaType: "array",
    $data: !0,
    error: {
      message: "must be equal to one of the allowed values",
      params: ({ schemaCode: n }) => (0, e._)`{allowedValues: ${n}}`
    },
    code(n) {
      const { gen: s, data: d, $data: a, schema: l, schemaCode: o, it: f } = n;
      if (!a && l.length === 0)
        throw new Error("enum must have non-empty array");
      const c = l.length >= f.opts.loopEnum;
      let p;
      const y = () => p ?? (p = (0, t.useFunc)(s, i.default));
      let E;
      if (c || a)
        E = s.let("valid"), n.block$data(E, h);
      else {
        if (!Array.isArray(l))
          throw new Error("ajv implementation error");
        const g = s.const("vSchema", o);
        E = (0, e.or)(...l.map((w, b) => _(g, b)));
      }
      n.pass(E);
      function h() {
        s.assign(E, !1), s.forOf("v", o, (g) => s.if((0, e._)`${y()}(${d}, ${g})`, () => s.assign(E, !0).break()));
      }
      function _(g, w) {
        const b = l[w];
        return typeof b == "object" && b !== null ? (0, e._)`${y()}(${d}, ${g}[${w}])` : (0, e._)`${d} === ${b}`;
      }
    }
  };
  return li.default = u, li;
}
var Ll;
function Og() {
  if (Ll) return Jn;
  Ll = 1, Object.defineProperty(Jn, "__esModule", { value: !0 });
  const e = gg(), t = yg(), i = Eg(), r = vg(), u = wg(), n = Sg(), s = Tg(), d = bg(), a = Rg(), l = Ag(), o = [
    // number
    e.default,
    t.default,
    // string
    i.default,
    r.default,
    // object
    u.default,
    n.default,
    // array
    s.default,
    d.default,
    // any
    { keyword: "type", schemaType: ["string", "array"] },
    { keyword: "nullable", schemaType: "boolean" },
    a.default,
    l.default
  ];
  return Jn.default = o, Jn;
}
var ci = {}, yr = {}, Fl;
function Fh() {
  if (Fl) return yr;
  Fl = 1, Object.defineProperty(yr, "__esModule", { value: !0 }), yr.validateAdditionalItems = void 0;
  const e = Oe(), t = Ie(), r = {
    keyword: "additionalItems",
    type: "array",
    schemaType: ["boolean", "object"],
    before: "uniqueItems",
    error: {
      message: ({ params: { len: n } }) => (0, e.str)`must NOT have more than ${n} items`,
      params: ({ params: { len: n } }) => (0, e._)`{limit: ${n}}`
    },
    code(n) {
      const { parentSchema: s, it: d } = n, { items: a } = s;
      if (!Array.isArray(a)) {
        (0, t.checkStrictMode)(d, '"additionalItems" is ignored when "items" is not an array of schemas');
        return;
      }
      u(n, a);
    }
  };
  function u(n, s) {
    const { gen: d, schema: a, data: l, keyword: o, it: f } = n;
    f.items = !0;
    const c = d.const("len", (0, e._)`${l}.length`);
    if (a === !1)
      n.setParams({ len: s.length }), n.pass((0, e._)`${c} <= ${s.length}`);
    else if (typeof a == "object" && !(0, t.alwaysValidSchema)(f, a)) {
      const y = d.var("valid", (0, e._)`${c} <= ${s.length}`);
      d.if((0, e.not)(y), () => p(y)), n.ok(y);
    }
    function p(y) {
      d.forRange("i", s.length, c, (E) => {
        n.subschema({ keyword: o, dataProp: E, dataPropType: t.Type.Num }, y), f.allErrors || d.if((0, e.not)(y), () => d.break());
      });
    }
  }
  return yr.validateAdditionalItems = u, yr.default = r, yr;
}
var di = {}, _r = {}, Ul;
function Uh() {
  if (Ul) return _r;
  Ul = 1, Object.defineProperty(_r, "__esModule", { value: !0 }), _r.validateTuple = void 0;
  const e = Oe(), t = Ie(), i = bt(), r = {
    keyword: "items",
    type: "array",
    schemaType: ["object", "array", "boolean"],
    before: "uniqueItems",
    code(n) {
      const { schema: s, it: d } = n;
      if (Array.isArray(s))
        return u(n, "additionalItems", s);
      d.items = !0, !(0, t.alwaysValidSchema)(d, s) && n.ok((0, i.validateArray)(n));
    }
  };
  function u(n, s, d = n.schema) {
    const { gen: a, parentSchema: l, data: o, keyword: f, it: c } = n;
    E(l), c.opts.unevaluated && d.length && c.items !== !0 && (c.items = t.mergeEvaluated.items(a, d.length, c.items));
    const p = a.name("valid"), y = a.const("len", (0, e._)`${o}.length`);
    d.forEach((h, _) => {
      (0, t.alwaysValidSchema)(c, h) || (a.if((0, e._)`${y} > ${_}`, () => n.subschema({
        keyword: f,
        schemaProp: _,
        dataProp: _
      }, p)), n.ok(p));
    });
    function E(h) {
      const { opts: _, errSchemaPath: g } = c, w = d.length, b = w === h.minItems && (w === h.maxItems || h[s] === !1);
      if (_.strictTuples && !b) {
        const R = `"${f}" is ${w}-tuple, but minItems or maxItems/${s} are not specified or different at path "${g}"`;
        (0, t.checkStrictMode)(c, R, _.strictTuples);
      }
    }
  }
  return _r.validateTuple = u, _r.default = r, _r;
}
var ql;
function Ng() {
  if (ql) return di;
  ql = 1, Object.defineProperty(di, "__esModule", { value: !0 });
  const e = Uh(), t = {
    keyword: "prefixItems",
    type: "array",
    schemaType: ["array"],
    before: "uniqueItems",
    code: (i) => (0, e.validateTuple)(i, "items")
  };
  return di.default = t, di;
}
var fi = {}, xl;
function Pg() {
  if (xl) return fi;
  xl = 1, Object.defineProperty(fi, "__esModule", { value: !0 });
  const e = Oe(), t = Ie(), i = bt(), r = Fh(), n = {
    keyword: "items",
    type: "array",
    schemaType: ["object", "boolean"],
    before: "uniqueItems",
    error: {
      message: ({ params: { len: s } }) => (0, e.str)`must NOT have more than ${s} items`,
      params: ({ params: { len: s } }) => (0, e._)`{limit: ${s}}`
    },
    code(s) {
      const { schema: d, parentSchema: a, it: l } = s, { prefixItems: o } = a;
      l.items = !0, !(0, t.alwaysValidSchema)(l, d) && (o ? (0, r.validateAdditionalItems)(s, o) : s.ok((0, i.validateArray)(s)));
    }
  };
  return fi.default = n, fi;
}
var hi = {}, Ml;
function Cg() {
  if (Ml) return hi;
  Ml = 1, Object.defineProperty(hi, "__esModule", { value: !0 });
  const e = Oe(), t = Ie(), r = {
    keyword: "contains",
    type: "array",
    schemaType: ["object", "boolean"],
    before: "uniqueItems",
    trackErrors: !0,
    error: {
      message: ({ params: { min: u, max: n } }) => n === void 0 ? (0, e.str)`must contain at least ${u} valid item(s)` : (0, e.str)`must contain at least ${u} and no more than ${n} valid item(s)`,
      params: ({ params: { min: u, max: n } }) => n === void 0 ? (0, e._)`{minContains: ${u}}` : (0, e._)`{minContains: ${u}, maxContains: ${n}}`
    },
    code(u) {
      const { gen: n, schema: s, parentSchema: d, data: a, it: l } = u;
      let o, f;
      const { minContains: c, maxContains: p } = d;
      l.opts.next ? (o = c === void 0 ? 1 : c, f = p) : o = 1;
      const y = n.const("len", (0, e._)`${a}.length`);
      if (u.setParams({ min: o, max: f }), f === void 0 && o === 0) {
        (0, t.checkStrictMode)(l, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
        return;
      }
      if (f !== void 0 && o > f) {
        (0, t.checkStrictMode)(l, '"minContains" > "maxContains" is always invalid'), u.fail();
        return;
      }
      if ((0, t.alwaysValidSchema)(l, s)) {
        let w = (0, e._)`${y} >= ${o}`;
        f !== void 0 && (w = (0, e._)`${w} && ${y} <= ${f}`), u.pass(w);
        return;
      }
      l.items = !0;
      const E = n.name("valid");
      f === void 0 && o === 1 ? _(E, () => n.if(E, () => n.break())) : o === 0 ? (n.let(E, !0), f !== void 0 && n.if((0, e._)`${a}.length > 0`, h)) : (n.let(E, !1), h()), u.result(E, () => u.reset());
      function h() {
        const w = n.name("_valid"), b = n.let("count", 0);
        _(w, () => n.if(w, () => g(b)));
      }
      function _(w, b) {
        n.forRange("i", 0, y, (R) => {
          u.subschema({
            keyword: "contains",
            dataProp: R,
            dataPropType: t.Type.Num,
            compositeRule: !0
          }, w), b();
        });
      }
      function g(w) {
        n.code((0, e._)`${w}++`), f === void 0 ? n.if((0, e._)`${w} >= ${o}`, () => n.assign(E, !0).break()) : (n.if((0, e._)`${w} > ${f}`, () => n.assign(E, !1).break()), o === 1 ? n.assign(E, !0) : n.if((0, e._)`${w} >= ${o}`, () => n.assign(E, !0)));
      }
    }
  };
  return hi.default = r, hi;
}
var Ta = {}, jl;
function Ig() {
  return jl || (jl = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.validateSchemaDeps = e.validatePropertyDeps = e.error = void 0;
    const t = Oe(), i = Ie(), r = bt();
    e.error = {
      message: ({ params: { property: a, depsCount: l, deps: o } }) => {
        const f = l === 1 ? "property" : "properties";
        return (0, t.str)`must have ${f} ${o} when property ${a} is present`;
      },
      params: ({ params: { property: a, depsCount: l, deps: o, missingProperty: f } }) => (0, t._)`{property: ${a},
    missingProperty: ${f},
    depsCount: ${l},
    deps: ${o}}`
      // TODO change to reference
    };
    const u = {
      keyword: "dependencies",
      type: "object",
      schemaType: "object",
      error: e.error,
      code(a) {
        const [l, o] = n(a);
        s(a, l), d(a, o);
      }
    };
    function n({ schema: a }) {
      const l = {}, o = {};
      for (const f in a) {
        if (f === "__proto__")
          continue;
        const c = Array.isArray(a[f]) ? l : o;
        c[f] = a[f];
      }
      return [l, o];
    }
    function s(a, l = a.schema) {
      const { gen: o, data: f, it: c } = a;
      if (Object.keys(l).length === 0)
        return;
      const p = o.let("missing");
      for (const y in l) {
        const E = l[y];
        if (E.length === 0)
          continue;
        const h = (0, r.propertyInData)(o, f, y, c.opts.ownProperties);
        a.setParams({
          property: y,
          depsCount: E.length,
          deps: E.join(", ")
        }), c.allErrors ? o.if(h, () => {
          for (const _ of E)
            (0, r.checkReportMissingProp)(a, _);
        }) : (o.if((0, t._)`${h} && (${(0, r.checkMissingProp)(a, E, p)})`), (0, r.reportMissingProp)(a, p), o.else());
      }
    }
    e.validatePropertyDeps = s;
    function d(a, l = a.schema) {
      const { gen: o, data: f, keyword: c, it: p } = a, y = o.name("valid");
      for (const E in l)
        (0, i.alwaysValidSchema)(p, l[E]) || (o.if(
          (0, r.propertyInData)(o, f, E, p.opts.ownProperties),
          () => {
            const h = a.subschema({ keyword: c, schemaProp: E }, y);
            a.mergeValidEvaluated(h, y);
          },
          () => o.var(y, !0)
          // TODO var
        ), a.ok(y));
    }
    e.validateSchemaDeps = d, e.default = u;
  })(Ta)), Ta;
}
var pi = {}, Bl;
function Dg() {
  if (Bl) return pi;
  Bl = 1, Object.defineProperty(pi, "__esModule", { value: !0 });
  const e = Oe(), t = Ie(), r = {
    keyword: "propertyNames",
    type: "object",
    schemaType: ["object", "boolean"],
    error: {
      message: "property name must be valid",
      params: ({ params: u }) => (0, e._)`{propertyName: ${u.propertyName}}`
    },
    code(u) {
      const { gen: n, schema: s, data: d, it: a } = u;
      if ((0, t.alwaysValidSchema)(a, s))
        return;
      const l = n.name("valid");
      n.forIn("key", d, (o) => {
        u.setParams({ propertyName: o }), u.subschema({
          keyword: "propertyNames",
          data: o,
          dataTypes: ["string"],
          propertyName: o,
          compositeRule: !0
        }, l), n.if((0, e.not)(l), () => {
          u.error(!0), a.allErrors || n.break();
        });
      }), u.ok(l);
    }
  };
  return pi.default = r, pi;
}
var mi = {}, Hl;
function qh() {
  if (Hl) return mi;
  Hl = 1, Object.defineProperty(mi, "__esModule", { value: !0 });
  const e = bt(), t = Oe(), i = Xt(), r = Ie(), n = {
    keyword: "additionalProperties",
    type: ["object"],
    schemaType: ["boolean", "object"],
    allowUndefined: !0,
    trackErrors: !0,
    error: {
      message: "must NOT have additional properties",
      params: ({ params: s }) => (0, t._)`{additionalProperty: ${s.additionalProperty}}`
    },
    code(s) {
      const { gen: d, schema: a, parentSchema: l, data: o, errsCount: f, it: c } = s;
      if (!f)
        throw new Error("ajv implementation error");
      const { allErrors: p, opts: y } = c;
      if (c.props = !0, y.removeAdditional !== "all" && (0, r.alwaysValidSchema)(c, a))
        return;
      const E = (0, e.allSchemaProperties)(l.properties), h = (0, e.allSchemaProperties)(l.patternProperties);
      _(), s.ok((0, t._)`${f} === ${i.default.errors}`);
      function _() {
        d.forIn("key", o, (v) => {
          !E.length && !h.length ? b(v) : d.if(g(v), () => b(v));
        });
      }
      function g(v) {
        let S;
        if (E.length > 8) {
          const O = (0, r.schemaRefOrVal)(c, l.properties, "properties");
          S = (0, e.isOwnProperty)(d, O, v);
        } else E.length ? S = (0, t.or)(...E.map((O) => (0, t._)`${v} === ${O}`)) : S = t.nil;
        return h.length && (S = (0, t.or)(S, ...h.map((O) => (0, t._)`${(0, e.usePattern)(s, O)}.test(${v})`))), (0, t.not)(S);
      }
      function w(v) {
        d.code((0, t._)`delete ${o}[${v}]`);
      }
      function b(v) {
        if (y.removeAdditional === "all" || y.removeAdditional && a === !1) {
          w(v);
          return;
        }
        if (a === !1) {
          s.setParams({ additionalProperty: v }), s.error(), p || d.break();
          return;
        }
        if (typeof a == "object" && !(0, r.alwaysValidSchema)(c, a)) {
          const S = d.name("valid");
          y.removeAdditional === "failing" ? (R(v, S, !1), d.if((0, t.not)(S), () => {
            s.reset(), w(v);
          })) : (R(v, S), p || d.if((0, t.not)(S), () => d.break()));
        }
      }
      function R(v, S, O) {
        const T = {
          keyword: "additionalProperties",
          dataProp: v,
          dataPropType: r.Type.Str
        };
        O === !1 && Object.assign(T, {
          compositeRule: !0,
          createErrors: !1,
          allErrors: !1
        }), s.subschema(T, S);
      }
    }
  };
  return mi.default = n, mi;
}
var gi = {}, Gl;
function $g() {
  if (Gl) return gi;
  Gl = 1, Object.defineProperty(gi, "__esModule", { value: !0 });
  const e = Qi(), t = bt(), i = Ie(), r = qh(), u = {
    keyword: "properties",
    type: "object",
    schemaType: "object",
    code(n) {
      const { gen: s, schema: d, parentSchema: a, data: l, it: o } = n;
      o.opts.removeAdditional === "all" && a.additionalProperties === void 0 && r.default.code(new e.KeywordCxt(o, r.default, "additionalProperties"));
      const f = (0, t.allSchemaProperties)(d);
      for (const h of f)
        o.definedProperties.add(h);
      o.opts.unevaluated && f.length && o.props !== !0 && (o.props = i.mergeEvaluated.props(s, (0, i.toHash)(f), o.props));
      const c = f.filter((h) => !(0, i.alwaysValidSchema)(o, d[h]));
      if (c.length === 0)
        return;
      const p = s.name("valid");
      for (const h of c)
        y(h) ? E(h) : (s.if((0, t.propertyInData)(s, l, h, o.opts.ownProperties)), E(h), o.allErrors || s.else().var(p, !0), s.endIf()), n.it.definedProperties.add(h), n.ok(p);
      function y(h) {
        return o.opts.useDefaults && !o.compositeRule && d[h].default !== void 0;
      }
      function E(h) {
        n.subschema({
          keyword: "properties",
          schemaProp: h,
          dataProp: h
        }, p);
      }
    }
  };
  return gi.default = u, gi;
}
var yi = {}, Vl;
function kg() {
  if (Vl) return yi;
  Vl = 1, Object.defineProperty(yi, "__esModule", { value: !0 });
  const e = bt(), t = Oe(), i = Ie(), r = Ie(), u = {
    keyword: "patternProperties",
    type: "object",
    schemaType: "object",
    code(n) {
      const { gen: s, schema: d, data: a, parentSchema: l, it: o } = n, { opts: f } = o, c = (0, e.allSchemaProperties)(d), p = c.filter((b) => (0, i.alwaysValidSchema)(o, d[b]));
      if (c.length === 0 || p.length === c.length && (!o.opts.unevaluated || o.props === !0))
        return;
      const y = f.strictSchema && !f.allowMatchingProperties && l.properties, E = s.name("valid");
      o.props !== !0 && !(o.props instanceof t.Name) && (o.props = (0, r.evaluatedPropsToName)(s, o.props));
      const { props: h } = o;
      _();
      function _() {
        for (const b of c)
          y && g(b), o.allErrors ? w(b) : (s.var(E, !0), w(b), s.if(E));
      }
      function g(b) {
        for (const R in y)
          new RegExp(b).test(R) && (0, i.checkStrictMode)(o, `property ${R} matches pattern ${b} (use allowMatchingProperties)`);
      }
      function w(b) {
        s.forIn("key", a, (R) => {
          s.if((0, t._)`${(0, e.usePattern)(n, b)}.test(${R})`, () => {
            const v = p.includes(b);
            v || n.subschema({
              keyword: "patternProperties",
              schemaProp: b,
              dataProp: R,
              dataPropType: r.Type.Str
            }, E), o.opts.unevaluated && h !== !0 ? s.assign((0, t._)`${h}[${R}]`, !0) : !v && !o.allErrors && s.if((0, t.not)(E), () => s.break());
          });
        });
      }
    }
  };
  return yi.default = u, yi;
}
var _i = {}, zl;
function Lg() {
  if (zl) return _i;
  zl = 1, Object.defineProperty(_i, "__esModule", { value: !0 });
  const e = Ie(), t = {
    keyword: "not",
    schemaType: ["object", "boolean"],
    trackErrors: !0,
    code(i) {
      const { gen: r, schema: u, it: n } = i;
      if ((0, e.alwaysValidSchema)(n, u)) {
        i.fail();
        return;
      }
      const s = r.name("valid");
      i.subschema({
        keyword: "not",
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }, s), i.failResult(s, () => i.reset(), () => i.error());
    },
    error: { message: "must NOT be valid" }
  };
  return _i.default = t, _i;
}
var Ei = {}, Yl;
function Fg() {
  if (Yl) return Ei;
  Yl = 1, Object.defineProperty(Ei, "__esModule", { value: !0 });
  const t = {
    keyword: "anyOf",
    schemaType: "array",
    trackErrors: !0,
    code: bt().validateUnion,
    error: { message: "must match a schema in anyOf" }
  };
  return Ei.default = t, Ei;
}
var vi = {}, Xl;
function Ug() {
  if (Xl) return vi;
  Xl = 1, Object.defineProperty(vi, "__esModule", { value: !0 });
  const e = Oe(), t = Ie(), r = {
    keyword: "oneOf",
    schemaType: "array",
    trackErrors: !0,
    error: {
      message: "must match exactly one schema in oneOf",
      params: ({ params: u }) => (0, e._)`{passingSchemas: ${u.passing}}`
    },
    code(u) {
      const { gen: n, schema: s, parentSchema: d, it: a } = u;
      if (!Array.isArray(s))
        throw new Error("ajv implementation error");
      if (a.opts.discriminator && d.discriminator)
        return;
      const l = s, o = n.let("valid", !1), f = n.let("passing", null), c = n.name("_valid");
      u.setParams({ passing: f }), n.block(p), u.result(o, () => u.reset(), () => u.error(!0));
      function p() {
        l.forEach((y, E) => {
          let h;
          (0, t.alwaysValidSchema)(a, y) ? n.var(c, !0) : h = u.subschema({
            keyword: "oneOf",
            schemaProp: E,
            compositeRule: !0
          }, c), E > 0 && n.if((0, e._)`${c} && ${o}`).assign(o, !1).assign(f, (0, e._)`[${f}, ${E}]`).else(), n.if(c, () => {
            n.assign(o, !0), n.assign(f, E), h && u.mergeEvaluated(h, e.Name);
          });
        });
      }
    }
  };
  return vi.default = r, vi;
}
var wi = {}, Wl;
function qg() {
  if (Wl) return wi;
  Wl = 1, Object.defineProperty(wi, "__esModule", { value: !0 });
  const e = Ie(), t = {
    keyword: "allOf",
    schemaType: "array",
    code(i) {
      const { gen: r, schema: u, it: n } = i;
      if (!Array.isArray(u))
        throw new Error("ajv implementation error");
      const s = r.name("valid");
      u.forEach((d, a) => {
        if ((0, e.alwaysValidSchema)(n, d))
          return;
        const l = i.subschema({ keyword: "allOf", schemaProp: a }, s);
        i.ok(s), i.mergeEvaluated(l);
      });
    }
  };
  return wi.default = t, wi;
}
var Si = {}, Kl;
function xg() {
  if (Kl) return Si;
  Kl = 1, Object.defineProperty(Si, "__esModule", { value: !0 });
  const e = Oe(), t = Ie(), r = {
    keyword: "if",
    schemaType: ["object", "boolean"],
    trackErrors: !0,
    error: {
      message: ({ params: n }) => (0, e.str)`must match "${n.ifClause}" schema`,
      params: ({ params: n }) => (0, e._)`{failingKeyword: ${n.ifClause}}`
    },
    code(n) {
      const { gen: s, parentSchema: d, it: a } = n;
      d.then === void 0 && d.else === void 0 && (0, t.checkStrictMode)(a, '"if" without "then" and "else" is ignored');
      const l = u(a, "then"), o = u(a, "else");
      if (!l && !o)
        return;
      const f = s.let("valid", !0), c = s.name("_valid");
      if (p(), n.reset(), l && o) {
        const E = s.let("ifClause");
        n.setParams({ ifClause: E }), s.if(c, y("then", E), y("else", E));
      } else l ? s.if(c, y("then")) : s.if((0, e.not)(c), y("else"));
      n.pass(f, () => n.error(!0));
      function p() {
        const E = n.subschema({
          keyword: "if",
          compositeRule: !0,
          createErrors: !1,
          allErrors: !1
        }, c);
        n.mergeEvaluated(E);
      }
      function y(E, h) {
        return () => {
          const _ = n.subschema({ keyword: E }, c);
          s.assign(f, c), n.mergeValidEvaluated(_, f), h ? s.assign(h, (0, e._)`${E}`) : n.setParams({ ifClause: E });
        };
      }
    }
  };
  function u(n, s) {
    const d = n.schema[s];
    return d !== void 0 && !(0, t.alwaysValidSchema)(n, d);
  }
  return Si.default = r, Si;
}
var Ti = {}, Jl;
function Mg() {
  if (Jl) return Ti;
  Jl = 1, Object.defineProperty(Ti, "__esModule", { value: !0 });
  const e = Ie(), t = {
    keyword: ["then", "else"],
    schemaType: ["object", "boolean"],
    code({ keyword: i, parentSchema: r, it: u }) {
      r.if === void 0 && (0, e.checkStrictMode)(u, `"${i}" without "if" is ignored`);
    }
  };
  return Ti.default = t, Ti;
}
var Ql;
function jg() {
  if (Ql) return ci;
  Ql = 1, Object.defineProperty(ci, "__esModule", { value: !0 });
  const e = Fh(), t = Ng(), i = Uh(), r = Pg(), u = Cg(), n = Ig(), s = Dg(), d = qh(), a = $g(), l = kg(), o = Lg(), f = Fg(), c = Ug(), p = qg(), y = xg(), E = Mg();
  function h(_ = !1) {
    const g = [
      // any
      o.default,
      f.default,
      c.default,
      p.default,
      y.default,
      E.default,
      // object
      s.default,
      d.default,
      n.default,
      a.default,
      l.default
    ];
    return _ ? g.push(t.default, r.default) : g.push(e.default, i.default), g.push(u.default), g;
  }
  return ci.default = h, ci;
}
var bi = {}, Ri = {}, Zl;
function Bg() {
  if (Zl) return Ri;
  Zl = 1, Object.defineProperty(Ri, "__esModule", { value: !0 });
  const e = Oe(), i = {
    keyword: "format",
    type: ["number", "string"],
    schemaType: "string",
    $data: !0,
    error: {
      message: ({ schemaCode: r }) => (0, e.str)`must match format "${r}"`,
      params: ({ schemaCode: r }) => (0, e._)`{format: ${r}}`
    },
    code(r, u) {
      const { gen: n, data: s, $data: d, schema: a, schemaCode: l, it: o } = r, { opts: f, errSchemaPath: c, schemaEnv: p, self: y } = o;
      if (!f.validateFormats)
        return;
      d ? E() : h();
      function E() {
        const _ = n.scopeValue("formats", {
          ref: y.formats,
          code: f.code.formats
        }), g = n.const("fDef", (0, e._)`${_}[${l}]`), w = n.let("fType"), b = n.let("format");
        n.if((0, e._)`typeof ${g} == "object" && !(${g} instanceof RegExp)`, () => n.assign(w, (0, e._)`${g}.type || "string"`).assign(b, (0, e._)`${g}.validate`), () => n.assign(w, (0, e._)`"string"`).assign(b, g)), r.fail$data((0, e.or)(R(), v()));
        function R() {
          return f.strictSchema === !1 ? e.nil : (0, e._)`${l} && !${b}`;
        }
        function v() {
          const S = p.$async ? (0, e._)`(${g}.async ? await ${b}(${s}) : ${b}(${s}))` : (0, e._)`${b}(${s})`, O = (0, e._)`(typeof ${b} == "function" ? ${S} : ${b}.test(${s}))`;
          return (0, e._)`${b} && ${b} !== true && ${w} === ${u} && !${O}`;
        }
      }
      function h() {
        const _ = y.formats[a];
        if (!_) {
          R();
          return;
        }
        if (_ === !0)
          return;
        const [g, w, b] = v(_);
        g === u && r.pass(S());
        function R() {
          if (f.strictSchema === !1) {
            y.logger.warn(O());
            return;
          }
          throw new Error(O());
          function O() {
            return `unknown format "${a}" ignored in schema at path "${c}"`;
          }
        }
        function v(O) {
          const T = O instanceof RegExp ? (0, e.regexpCode)(O) : f.code.formats ? (0, e._)`${f.code.formats}${(0, e.getProperty)(a)}` : void 0, $ = n.scopeValue("formats", { key: a, ref: O, code: T });
          return typeof O == "object" && !(O instanceof RegExp) ? [O.type || "string", O.validate, (0, e._)`${$}.validate`] : ["string", O, $];
        }
        function S() {
          if (typeof _ == "object" && !(_ instanceof RegExp) && _.async) {
            if (!p.$async)
              throw new Error("async format in sync schema");
            return (0, e._)`await ${b}(${s})`;
          }
          return typeof w == "function" ? (0, e._)`${b}(${s})` : (0, e._)`${b}.test(${s})`;
        }
      }
    }
  };
  return Ri.default = i, Ri;
}
var ec;
function Hg() {
  if (ec) return bi;
  ec = 1, Object.defineProperty(bi, "__esModule", { value: !0 });
  const t = [Bg().default];
  return bi.default = t, bi;
}
var ar = {}, tc;
function Gg() {
  return tc || (tc = 1, Object.defineProperty(ar, "__esModule", { value: !0 }), ar.contentVocabulary = ar.metadataVocabulary = void 0, ar.metadataVocabulary = [
    "title",
    "description",
    "default",
    "deprecated",
    "readOnly",
    "writeOnly",
    "examples"
  ], ar.contentVocabulary = [
    "contentMediaType",
    "contentEncoding",
    "contentSchema"
  ]), ar;
}
var rc;
function Vg() {
  if (rc) return Xn;
  rc = 1, Object.defineProperty(Xn, "__esModule", { value: !0 });
  const e = mg(), t = Og(), i = jg(), r = Hg(), u = Gg(), n = [
    e.default,
    t.default,
    (0, i.default)(),
    r.default,
    u.metadataVocabulary,
    u.contentVocabulary
  ];
  return Xn.default = n, Xn;
}
var Ai = {}, xr = {}, nc;
function zg() {
  if (nc) return xr;
  nc = 1, Object.defineProperty(xr, "__esModule", { value: !0 }), xr.DiscrError = void 0;
  var e;
  return (function(t) {
    t.Tag = "tag", t.Mapping = "mapping";
  })(e || (xr.DiscrError = e = {})), xr;
}
var ic;
function Yg() {
  if (ic) return Ai;
  ic = 1, Object.defineProperty(Ai, "__esModule", { value: !0 });
  const e = Oe(), t = zg(), i = jo(), r = Zi(), u = Ie(), s = {
    keyword: "discriminator",
    type: "object",
    schemaType: "object",
    error: {
      message: ({ params: { discrError: d, tagName: a } }) => d === t.DiscrError.Tag ? `tag "${a}" must be string` : `value of tag "${a}" must be in oneOf`,
      params: ({ params: { discrError: d, tag: a, tagName: l } }) => (0, e._)`{error: ${d}, tag: ${l}, tagValue: ${a}}`
    },
    code(d) {
      const { gen: a, data: l, schema: o, parentSchema: f, it: c } = d, { oneOf: p } = f;
      if (!c.opts.discriminator)
        throw new Error("discriminator: requires discriminator option");
      const y = o.propertyName;
      if (typeof y != "string")
        throw new Error("discriminator: requires propertyName");
      if (o.mapping)
        throw new Error("discriminator: mapping is not supported");
      if (!p)
        throw new Error("discriminator: requires oneOf keyword");
      const E = a.let("valid", !1), h = a.const("tag", (0, e._)`${l}${(0, e.getProperty)(y)}`);
      a.if((0, e._)`typeof ${h} == "string"`, () => _(), () => d.error(!1, { discrError: t.DiscrError.Tag, tag: h, tagName: y })), d.ok(E);
      function _() {
        const b = w();
        a.if(!1);
        for (const R in b)
          a.elseIf((0, e._)`${h} === ${R}`), a.assign(E, g(b[R]));
        a.else(), d.error(!1, { discrError: t.DiscrError.Mapping, tag: h, tagName: y }), a.endIf();
      }
      function g(b) {
        const R = a.name("valid"), v = d.subschema({ keyword: "oneOf", schemaProp: b }, R);
        return d.mergeEvaluated(v, e.Name), R;
      }
      function w() {
        var b;
        const R = {}, v = O(f);
        let S = !0;
        for (let k = 0; k < p.length; k++) {
          let U = p[k];
          if (U?.$ref && !(0, u.schemaHasRulesButRef)(U, c.self.RULES)) {
            const L = U.$ref;
            if (U = i.resolveRef.call(c.self, c.schemaEnv.root, c.baseId, L), U instanceof i.SchemaEnv && (U = U.schema), U === void 0)
              throw new r.default(c.opts.uriResolver, c.baseId, L);
          }
          const V = (b = U?.properties) === null || b === void 0 ? void 0 : b[y];
          if (typeof V != "object")
            throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${y}"`);
          S = S && (v || O(U)), T(V, k);
        }
        if (!S)
          throw new Error(`discriminator: "${y}" must be required`);
        return R;
        function O({ required: k }) {
          return Array.isArray(k) && k.includes(y);
        }
        function T(k, U) {
          if (k.const)
            $(k.const, U);
          else if (k.enum)
            for (const V of k.enum)
              $(V, U);
          else
            throw new Error(`discriminator: "properties/${y}" must have "const" or "enum"`);
        }
        function $(k, U) {
          if (typeof k != "string" || k in R)
            throw new Error(`discriminator: "${y}" values must be unique strings`);
          R[k] = U;
        }
      }
    }
  };
  return Ai.default = s, Ai;
}
const Xg = "http://json-schema.org/draft-07/schema#", Wg = "http://json-schema.org/draft-07/schema#", Kg = "Core schema meta-schema", Jg = { schemaArray: { type: "array", minItems: 1, items: { $ref: "#" } }, nonNegativeInteger: { type: "integer", minimum: 0 }, nonNegativeIntegerDefault0: { allOf: [{ $ref: "#/definitions/nonNegativeInteger" }, { default: 0 }] }, simpleTypes: { enum: ["array", "boolean", "integer", "null", "number", "object", "string"] }, stringArray: { type: "array", items: { type: "string" }, uniqueItems: !0, default: [] } }, Qg = ["object", "boolean"], Zg = { $id: { type: "string", format: "uri-reference" }, $schema: { type: "string", format: "uri" }, $ref: { type: "string", format: "uri-reference" }, $comment: { type: "string" }, title: { type: "string" }, description: { type: "string" }, default: !0, readOnly: { type: "boolean", default: !1 }, examples: { type: "array", items: !0 }, multipleOf: { type: "number", exclusiveMinimum: 0 }, maximum: { type: "number" }, exclusiveMaximum: { type: "number" }, minimum: { type: "number" }, exclusiveMinimum: { type: "number" }, maxLength: { $ref: "#/definitions/nonNegativeInteger" }, minLength: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, pattern: { type: "string", format: "regex" }, additionalItems: { $ref: "#" }, items: { anyOf: [{ $ref: "#" }, { $ref: "#/definitions/schemaArray" }], default: !0 }, maxItems: { $ref: "#/definitions/nonNegativeInteger" }, minItems: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, uniqueItems: { type: "boolean", default: !1 }, contains: { $ref: "#" }, maxProperties: { $ref: "#/definitions/nonNegativeInteger" }, minProperties: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, required: { $ref: "#/definitions/stringArray" }, additionalProperties: { $ref: "#" }, definitions: { type: "object", additionalProperties: { $ref: "#" }, default: {} }, properties: { type: "object", additionalProperties: { $ref: "#" }, default: {} }, patternProperties: { type: "object", additionalProperties: { $ref: "#" }, propertyNames: { format: "regex" }, default: {} }, dependencies: { type: "object", additionalProperties: { anyOf: [{ $ref: "#" }, { $ref: "#/definitions/stringArray" }] } }, propertyNames: { $ref: "#" }, const: !0, enum: { type: "array", items: !0, minItems: 1, uniqueItems: !0 }, type: { anyOf: [{ $ref: "#/definitions/simpleTypes" }, { type: "array", items: { $ref: "#/definitions/simpleTypes" }, minItems: 1, uniqueItems: !0 }] }, format: { type: "string" }, contentMediaType: { type: "string" }, contentEncoding: { type: "string" }, if: { $ref: "#" }, then: { $ref: "#" }, else: { $ref: "#" }, allOf: { $ref: "#/definitions/schemaArray" }, anyOf: { $ref: "#/definitions/schemaArray" }, oneOf: { $ref: "#/definitions/schemaArray" }, not: { $ref: "#" } }, ey = {
  $schema: Xg,
  $id: Wg,
  title: Kg,
  definitions: Jg,
  type: Qg,
  properties: Zg,
  default: !0
};
var ac;
function xh() {
  return ac || (ac = 1, (function(e, t) {
    Object.defineProperty(t, "__esModule", { value: !0 }), t.MissingRefError = t.ValidationError = t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = t.Ajv = void 0;
    const i = fg(), r = Vg(), u = Yg(), n = ey, s = ["/properties"], d = "http://json-schema.org/draft-07/schema";
    class a extends i.default {
      _addVocabularies() {
        super._addVocabularies(), r.default.forEach((y) => this.addVocabulary(y)), this.opts.discriminator && this.addKeyword(u.default);
      }
      _addDefaultMetaSchema() {
        if (super._addDefaultMetaSchema(), !this.opts.meta)
          return;
        const y = this.opts.$data ? this.$dataMetaSchema(n, s) : n;
        this.addMetaSchema(y, d, !1), this.refs["http://json-schema.org/schema"] = d;
      }
      defaultMeta() {
        return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(d) ? d : void 0);
      }
    }
    t.Ajv = a, e.exports = t = a, e.exports.Ajv = a, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = a;
    var l = Qi();
    Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
      return l.KeywordCxt;
    } });
    var o = Oe();
    Object.defineProperty(t, "_", { enumerable: !0, get: function() {
      return o._;
    } }), Object.defineProperty(t, "str", { enumerable: !0, get: function() {
      return o.str;
    } }), Object.defineProperty(t, "stringify", { enumerable: !0, get: function() {
      return o.stringify;
    } }), Object.defineProperty(t, "nil", { enumerable: !0, get: function() {
      return o.nil;
    } }), Object.defineProperty(t, "Name", { enumerable: !0, get: function() {
      return o.Name;
    } }), Object.defineProperty(t, "CodeGen", { enumerable: !0, get: function() {
      return o.CodeGen;
    } });
    var f = Mo();
    Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
      return f.default;
    } });
    var c = Zi();
    Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
      return c.default;
    } });
  })(Hn, Hn.exports)), Hn.exports;
}
var Oi = { exports: {} }, ba = {}, sc;
function ty() {
  return sc || (sc = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.formatNames = e.fastFormats = e.fullFormats = void 0;
    function t(T, $) {
      return { validate: T, compare: $ };
    }
    e.fullFormats = {
      // date: http://tools.ietf.org/html/rfc3339#section-5.6
      date: t(n, s),
      // date-time: http://tools.ietf.org/html/rfc3339#section-5.6
      time: t(a, l),
      "date-time": t(f, c),
      // duration: https://tools.ietf.org/html/rfc3339#appendix-A
      duration: /^P(?!$)((\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+S)?)?|(\d+W)?)$/,
      uri: E,
      "uri-reference": /^(?:[a-z][a-z0-9+\-.]*:)?(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'"()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?(?:\?(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i,
      // uri-template: https://tools.ietf.org/html/rfc6570
      "uri-template": /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[0-9a-f]{2})|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?)*\})*$/i,
      // For the source: https://gist.github.com/dperini/729294
      // For test cases: https://mathiasbynens.be/demo/url-regex
      url: /^(?:https?|ftp):\/\/(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)(?:\.(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)*(?:\.(?:[a-z\u{00a1}-\u{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/iu,
      email: /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
      hostname: /^(?=.{1,253}\.?$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*\.?$/i,
      // optimized https://www.safaribooksonline.com/library/view/regular-expressions-cookbook/9780596802837/ch07s16.html
      ipv4: /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
      ipv6: /^((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))$/i,
      regex: O,
      // uuid: http://tools.ietf.org/html/rfc4122
      uuid: /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i,
      // JSON-pointer: https://tools.ietf.org/html/rfc6901
      // uri fragment: https://tools.ietf.org/html/rfc3986#appendix-A
      "json-pointer": /^(?:\/(?:[^~/]|~0|~1)*)*$/,
      "json-pointer-uri-fragment": /^#(?:\/(?:[a-z0-9_\-.!$&'()*+,;:=@]|%[0-9a-f]{2}|~0|~1)*)*$/i,
      // relative JSON-pointer: http://tools.ietf.org/html/draft-luff-relative-json-pointer-00
      "relative-json-pointer": /^(?:0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~0|~1)*)*)$/,
      // the following formats are used by the openapi specification: https://spec.openapis.org/oas/v3.0.0#data-types
      // byte: https://github.com/miguelmota/is-base64
      byte: _,
      // signed 32 bit integer
      int32: { type: "number", validate: b },
      // signed 64 bit integer
      int64: { type: "number", validate: R },
      // C-type float
      float: { type: "number", validate: v },
      // C-type double
      double: { type: "number", validate: v },
      // hint to the UI to hide input strings
      password: !0,
      // unchecked string payload
      binary: !0
    }, e.fastFormats = {
      ...e.fullFormats,
      date: t(/^\d\d\d\d-[0-1]\d-[0-3]\d$/, s),
      time: t(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, l),
      "date-time": t(/^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, c),
      // uri: https://github.com/mafintosh/is-my-json-valid/blob/master/formats.js
      uri: /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/)?[^\s]*$/i,
      "uri-reference": /^(?:(?:[a-z][a-z0-9+\-.]*:)?\/?\/)?(?:[^\\\s#][^\s#]*)?(?:#[^\\\s]*)?$/i,
      // email (sources from jsen validator):
      // http://stackoverflow.com/questions/201323/using-a-regular-expression-to-validate-an-email-address#answer-8829363
      // http://www.w3.org/TR/html5/forms.html#valid-e-mail-address (search for 'wilful violation')
      email: /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i
    }, e.formatNames = Object.keys(e.fullFormats);
    function i(T) {
      return T % 4 === 0 && (T % 100 !== 0 || T % 400 === 0);
    }
    const r = /^(\d\d\d\d)-(\d\d)-(\d\d)$/, u = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    function n(T) {
      const $ = r.exec(T);
      if (!$)
        return !1;
      const k = +$[1], U = +$[2], V = +$[3];
      return U >= 1 && U <= 12 && V >= 1 && V <= (U === 2 && i(k) ? 29 : u[U]);
    }
    function s(T, $) {
      if (T && $)
        return T > $ ? 1 : T < $ ? -1 : 0;
    }
    const d = /^(\d\d):(\d\d):(\d\d)(\.\d+)?(z|[+-]\d\d(?::?\d\d)?)?$/i;
    function a(T, $) {
      const k = d.exec(T);
      if (!k)
        return !1;
      const U = +k[1], V = +k[2], L = +k[3], B = k[5];
      return (U <= 23 && V <= 59 && L <= 59 || U === 23 && V === 59 && L === 60) && (!$ || B !== "");
    }
    function l(T, $) {
      if (!(T && $))
        return;
      const k = d.exec(T), U = d.exec($);
      if (k && U)
        return T = k[1] + k[2] + k[3] + (k[4] || ""), $ = U[1] + U[2] + U[3] + (U[4] || ""), T > $ ? 1 : T < $ ? -1 : 0;
    }
    const o = /t|\s/i;
    function f(T) {
      const $ = T.split(o);
      return $.length === 2 && n($[0]) && a($[1], !0);
    }
    function c(T, $) {
      if (!(T && $))
        return;
      const [k, U] = T.split(o), [V, L] = $.split(o), B = s(k, V);
      if (B !== void 0)
        return B || l(U, L);
    }
    const p = /\/|:/, y = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
    function E(T) {
      return p.test(T) && y.test(T);
    }
    const h = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/gm;
    function _(T) {
      return h.lastIndex = 0, h.test(T);
    }
    const g = -2147483648, w = 2 ** 31 - 1;
    function b(T) {
      return Number.isInteger(T) && T <= w && T >= g;
    }
    function R(T) {
      return Number.isInteger(T);
    }
    function v() {
      return !0;
    }
    const S = /[^\\]\\Z/;
    function O(T) {
      if (S.test(T))
        return !1;
      try {
        return new RegExp(T), !0;
      } catch {
        return !1;
      }
    }
  })(ba)), ba;
}
var Ra = {}, oc;
function ry() {
  return oc || (oc = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.formatLimitDefinition = void 0;
    const t = xh(), i = Oe(), r = i.operators, u = {
      formatMaximum: { okStr: "<=", ok: r.LTE, fail: r.GT },
      formatMinimum: { okStr: ">=", ok: r.GTE, fail: r.LT },
      formatExclusiveMaximum: { okStr: "<", ok: r.LT, fail: r.GTE },
      formatExclusiveMinimum: { okStr: ">", ok: r.GT, fail: r.LTE }
    }, n = {
      message: ({ keyword: d, schemaCode: a }) => i.str`should be ${u[d].okStr} ${a}`,
      params: ({ keyword: d, schemaCode: a }) => i._`{comparison: ${u[d].okStr}, limit: ${a}}`
    };
    e.formatLimitDefinition = {
      keyword: Object.keys(u),
      type: "string",
      schemaType: "string",
      $data: !0,
      error: n,
      code(d) {
        const { gen: a, data: l, schemaCode: o, keyword: f, it: c } = d, { opts: p, self: y } = c;
        if (!p.validateFormats)
          return;
        const E = new t.KeywordCxt(c, y.RULES.all.format.definition, "format");
        E.$data ? h() : _();
        function h() {
          const w = a.scopeValue("formats", {
            ref: y.formats,
            code: p.code.formats
          }), b = a.const("fmt", i._`${w}[${E.schemaCode}]`);
          d.fail$data(i.or(i._`typeof ${b} != "object"`, i._`${b} instanceof RegExp`, i._`typeof ${b}.compare != "function"`, g(b)));
        }
        function _() {
          const w = E.schema, b = y.formats[w];
          if (!b || b === !0)
            return;
          if (typeof b != "object" || b instanceof RegExp || typeof b.compare != "function")
            throw new Error(`"${f}": format "${w}" does not define "compare" function`);
          const R = a.scopeValue("formats", {
            key: w,
            ref: b,
            code: p.code.formats ? i._`${p.code.formats}${i.getProperty(w)}` : void 0
          });
          d.fail$data(g(R));
        }
        function g(w) {
          return i._`${w}.compare(${l}, ${o}) ${u[f].fail} 0`;
        }
      },
      dependencies: ["format"]
    };
    const s = (d) => (d.addKeyword(e.formatLimitDefinition), d);
    e.default = s;
  })(Ra)), Ra;
}
var uc;
function ny() {
  return uc || (uc = 1, (function(e, t) {
    Object.defineProperty(t, "__esModule", { value: !0 });
    const i = ty(), r = ry(), u = Oe(), n = new u.Name("fullFormats"), s = new u.Name("fastFormats"), d = (l, o = { keywords: !0 }) => {
      if (Array.isArray(o))
        return a(l, o, i.fullFormats, n), l;
      const [f, c] = o.mode === "fast" ? [i.fastFormats, s] : [i.fullFormats, n], p = o.formats || i.formatNames;
      return a(l, p, f, c), o.keywords && r.default(l), l;
    };
    d.get = (l, o = "full") => {
      const c = (o === "fast" ? i.fastFormats : i.fullFormats)[l];
      if (!c)
        throw new Error(`Unknown format "${l}"`);
      return c;
    };
    function a(l, o, f, c) {
      var p, y;
      (p = (y = l.opts.code).formats) !== null && p !== void 0 || (y.formats = u._`require("ajv-formats/dist/formats").${c}`);
      for (const E of o)
        l.addFormat(E, f[E]);
    }
    e.exports = t = d, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = d;
  })(Oi, Oi.exports)), Oi.exports;
}
var Aa, lc;
function iy() {
  if (lc) return Aa;
  lc = 1;
  const e = (a, l, o, f) => {
    if (o === "length" || o === "prototype" || o === "arguments" || o === "caller")
      return;
    const c = Object.getOwnPropertyDescriptor(a, o), p = Object.getOwnPropertyDescriptor(l, o);
    !t(c, p) && f || Object.defineProperty(a, o, p);
  }, t = function(a, l) {
    return a === void 0 || a.configurable || a.writable === l.writable && a.enumerable === l.enumerable && a.configurable === l.configurable && (a.writable || a.value === l.value);
  }, i = (a, l) => {
    const o = Object.getPrototypeOf(l);
    o !== Object.getPrototypeOf(a) && Object.setPrototypeOf(a, o);
  }, r = (a, l) => `/* Wrapped ${a}*/
${l}`, u = Object.getOwnPropertyDescriptor(Function.prototype, "toString"), n = Object.getOwnPropertyDescriptor(Function.prototype.toString, "name"), s = (a, l, o) => {
    const f = o === "" ? "" : `with ${o.trim()}() `, c = r.bind(null, f, l.toString());
    Object.defineProperty(c, "name", n), Object.defineProperty(a, "toString", { ...u, value: c });
  };
  return Aa = (a, l, { ignoreNonConfigurable: o = !1 } = {}) => {
    const { name: f } = a;
    for (const c of Reflect.ownKeys(l))
      e(a, l, c, o);
    return i(a, l), s(a, l, f), a;
  }, Aa;
}
var Oa, cc;
function ay() {
  if (cc) return Oa;
  cc = 1;
  const e = iy();
  return Oa = (t, i = {}) => {
    if (typeof t != "function")
      throw new TypeError(`Expected the first argument to be a function, got \`${typeof t}\``);
    const {
      wait: r = 0,
      before: u = !1,
      after: n = !0
    } = i;
    if (!u && !n)
      throw new Error("Both `before` and `after` are false, function wouldn't be called.");
    let s, d;
    const a = function(...l) {
      const o = this, f = () => {
        s = void 0, n && (d = t.apply(o, l));
      }, c = u && !s;
      return clearTimeout(s), s = setTimeout(f, r), c && (d = t.apply(o, l)), d;
    };
    return e(a, t), a.cancel = () => {
      s && (clearTimeout(s), s = void 0);
    }, a;
  }, Oa;
}
var Ni = { exports: {} }, Na, dc;
function ea() {
  if (dc) return Na;
  dc = 1;
  const e = "2.0.0", t = 256, i = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
  9007199254740991, r = 16, u = t - 6;
  return Na = {
    MAX_LENGTH: t,
    MAX_SAFE_COMPONENT_LENGTH: r,
    MAX_SAFE_BUILD_LENGTH: u,
    MAX_SAFE_INTEGER: i,
    RELEASE_TYPES: [
      "major",
      "premajor",
      "minor",
      "preminor",
      "patch",
      "prepatch",
      "prerelease"
    ],
    SEMVER_SPEC_VERSION: e,
    FLAG_INCLUDE_PRERELEASE: 1,
    FLAG_LOOSE: 2
  }, Na;
}
var Pa, fc;
function ta() {
  return fc || (fc = 1, Pa = typeof process == "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...t) => console.error("SEMVER", ...t) : () => {
  }), Pa;
}
var hc;
function wn() {
  return hc || (hc = 1, (function(e, t) {
    const {
      MAX_SAFE_COMPONENT_LENGTH: i,
      MAX_SAFE_BUILD_LENGTH: r,
      MAX_LENGTH: u
    } = ea(), n = ta();
    t = e.exports = {};
    const s = t.re = [], d = t.safeRe = [], a = t.src = [], l = t.safeSrc = [], o = t.t = {};
    let f = 0;
    const c = "[a-zA-Z0-9-]", p = [
      ["\\s", 1],
      ["\\d", u],
      [c, r]
    ], y = (h) => {
      for (const [_, g] of p)
        h = h.split(`${_}*`).join(`${_}{0,${g}}`).split(`${_}+`).join(`${_}{1,${g}}`);
      return h;
    }, E = (h, _, g) => {
      const w = y(_), b = f++;
      n(h, b, _), o[h] = b, a[b] = _, l[b] = w, s[b] = new RegExp(_, g ? "g" : void 0), d[b] = new RegExp(w, g ? "g" : void 0);
    };
    E("NUMERICIDENTIFIER", "0|[1-9]\\d*"), E("NUMERICIDENTIFIERLOOSE", "\\d+"), E("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${c}*`), E("MAINVERSION", `(${a[o.NUMERICIDENTIFIER]})\\.(${a[o.NUMERICIDENTIFIER]})\\.(${a[o.NUMERICIDENTIFIER]})`), E("MAINVERSIONLOOSE", `(${a[o.NUMERICIDENTIFIERLOOSE]})\\.(${a[o.NUMERICIDENTIFIERLOOSE]})\\.(${a[o.NUMERICIDENTIFIERLOOSE]})`), E("PRERELEASEIDENTIFIER", `(?:${a[o.NONNUMERICIDENTIFIER]}|${a[o.NUMERICIDENTIFIER]})`), E("PRERELEASEIDENTIFIERLOOSE", `(?:${a[o.NONNUMERICIDENTIFIER]}|${a[o.NUMERICIDENTIFIERLOOSE]})`), E("PRERELEASE", `(?:-(${a[o.PRERELEASEIDENTIFIER]}(?:\\.${a[o.PRERELEASEIDENTIFIER]})*))`), E("PRERELEASELOOSE", `(?:-?(${a[o.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${a[o.PRERELEASEIDENTIFIERLOOSE]})*))`), E("BUILDIDENTIFIER", `${c}+`), E("BUILD", `(?:\\+(${a[o.BUILDIDENTIFIER]}(?:\\.${a[o.BUILDIDENTIFIER]})*))`), E("FULLPLAIN", `v?${a[o.MAINVERSION]}${a[o.PRERELEASE]}?${a[o.BUILD]}?`), E("FULL", `^${a[o.FULLPLAIN]}$`), E("LOOSEPLAIN", `[v=\\s]*${a[o.MAINVERSIONLOOSE]}${a[o.PRERELEASELOOSE]}?${a[o.BUILD]}?`), E("LOOSE", `^${a[o.LOOSEPLAIN]}$`), E("GTLT", "((?:<|>)?=?)"), E("XRANGEIDENTIFIERLOOSE", `${a[o.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`), E("XRANGEIDENTIFIER", `${a[o.NUMERICIDENTIFIER]}|x|X|\\*`), E("XRANGEPLAIN", `[v=\\s]*(${a[o.XRANGEIDENTIFIER]})(?:\\.(${a[o.XRANGEIDENTIFIER]})(?:\\.(${a[o.XRANGEIDENTIFIER]})(?:${a[o.PRERELEASE]})?${a[o.BUILD]}?)?)?`), E("XRANGEPLAINLOOSE", `[v=\\s]*(${a[o.XRANGEIDENTIFIERLOOSE]})(?:\\.(${a[o.XRANGEIDENTIFIERLOOSE]})(?:\\.(${a[o.XRANGEIDENTIFIERLOOSE]})(?:${a[o.PRERELEASELOOSE]})?${a[o.BUILD]}?)?)?`), E("XRANGE", `^${a[o.GTLT]}\\s*${a[o.XRANGEPLAIN]}$`), E("XRANGELOOSE", `^${a[o.GTLT]}\\s*${a[o.XRANGEPLAINLOOSE]}$`), E("COERCEPLAIN", `(^|[^\\d])(\\d{1,${i}})(?:\\.(\\d{1,${i}}))?(?:\\.(\\d{1,${i}}))?`), E("COERCE", `${a[o.COERCEPLAIN]}(?:$|[^\\d])`), E("COERCEFULL", a[o.COERCEPLAIN] + `(?:${a[o.PRERELEASE]})?(?:${a[o.BUILD]})?(?:$|[^\\d])`), E("COERCERTL", a[o.COERCE], !0), E("COERCERTLFULL", a[o.COERCEFULL], !0), E("LONETILDE", "(?:~>?)"), E("TILDETRIM", `(\\s*)${a[o.LONETILDE]}\\s+`, !0), t.tildeTrimReplace = "$1~", E("TILDE", `^${a[o.LONETILDE]}${a[o.XRANGEPLAIN]}$`), E("TILDELOOSE", `^${a[o.LONETILDE]}${a[o.XRANGEPLAINLOOSE]}$`), E("LONECARET", "(?:\\^)"), E("CARETTRIM", `(\\s*)${a[o.LONECARET]}\\s+`, !0), t.caretTrimReplace = "$1^", E("CARET", `^${a[o.LONECARET]}${a[o.XRANGEPLAIN]}$`), E("CARETLOOSE", `^${a[o.LONECARET]}${a[o.XRANGEPLAINLOOSE]}$`), E("COMPARATORLOOSE", `^${a[o.GTLT]}\\s*(${a[o.LOOSEPLAIN]})$|^$`), E("COMPARATOR", `^${a[o.GTLT]}\\s*(${a[o.FULLPLAIN]})$|^$`), E("COMPARATORTRIM", `(\\s*)${a[o.GTLT]}\\s*(${a[o.LOOSEPLAIN]}|${a[o.XRANGEPLAIN]})`, !0), t.comparatorTrimReplace = "$1$2$3", E("HYPHENRANGE", `^\\s*(${a[o.XRANGEPLAIN]})\\s+-\\s+(${a[o.XRANGEPLAIN]})\\s*$`), E("HYPHENRANGELOOSE", `^\\s*(${a[o.XRANGEPLAINLOOSE]})\\s+-\\s+(${a[o.XRANGEPLAINLOOSE]})\\s*$`), E("STAR", "(<|>)?=?\\s*\\*"), E("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"), E("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
  })(Ni, Ni.exports)), Ni.exports;
}
var Ca, pc;
function Ho() {
  if (pc) return Ca;
  pc = 1;
  const e = Object.freeze({ loose: !0 }), t = Object.freeze({});
  return Ca = (r) => r ? typeof r != "object" ? e : r : t, Ca;
}
var Ia, mc;
function Mh() {
  if (mc) return Ia;
  mc = 1;
  const e = /^[0-9]+$/, t = (r, u) => {
    if (typeof r == "number" && typeof u == "number")
      return r === u ? 0 : r < u ? -1 : 1;
    const n = e.test(r), s = e.test(u);
    return n && s && (r = +r, u = +u), r === u ? 0 : n && !s ? -1 : s && !n ? 1 : r < u ? -1 : 1;
  };
  return Ia = {
    compareIdentifiers: t,
    rcompareIdentifiers: (r, u) => t(u, r)
  }, Ia;
}
var Da, gc;
function nt() {
  if (gc) return Da;
  gc = 1;
  const e = ta(), { MAX_LENGTH: t, MAX_SAFE_INTEGER: i } = ea(), { safeRe: r, t: u } = wn(), n = Ho(), { compareIdentifiers: s } = Mh();
  class d {
    constructor(l, o) {
      if (o = n(o), l instanceof d) {
        if (l.loose === !!o.loose && l.includePrerelease === !!o.includePrerelease)
          return l;
        l = l.version;
      } else if (typeof l != "string")
        throw new TypeError(`Invalid version. Must be a string. Got type "${typeof l}".`);
      if (l.length > t)
        throw new TypeError(
          `version is longer than ${t} characters`
        );
      e("SemVer", l, o), this.options = o, this.loose = !!o.loose, this.includePrerelease = !!o.includePrerelease;
      const f = l.trim().match(o.loose ? r[u.LOOSE] : r[u.FULL]);
      if (!f)
        throw new TypeError(`Invalid Version: ${l}`);
      if (this.raw = l, this.major = +f[1], this.minor = +f[2], this.patch = +f[3], this.major > i || this.major < 0)
        throw new TypeError("Invalid major version");
      if (this.minor > i || this.minor < 0)
        throw new TypeError("Invalid minor version");
      if (this.patch > i || this.patch < 0)
        throw new TypeError("Invalid patch version");
      f[4] ? this.prerelease = f[4].split(".").map((c) => {
        if (/^[0-9]+$/.test(c)) {
          const p = +c;
          if (p >= 0 && p < i)
            return p;
        }
        return c;
      }) : this.prerelease = [], this.build = f[5] ? f[5].split(".") : [], this.format();
    }
    format() {
      return this.version = `${this.major}.${this.minor}.${this.patch}`, this.prerelease.length && (this.version += `-${this.prerelease.join(".")}`), this.version;
    }
    toString() {
      return this.version;
    }
    compare(l) {
      if (e("SemVer.compare", this.version, this.options, l), !(l instanceof d)) {
        if (typeof l == "string" && l === this.version)
          return 0;
        l = new d(l, this.options);
      }
      return l.version === this.version ? 0 : this.compareMain(l) || this.comparePre(l);
    }
    compareMain(l) {
      return l instanceof d || (l = new d(l, this.options)), this.major < l.major ? -1 : this.major > l.major ? 1 : this.minor < l.minor ? -1 : this.minor > l.minor ? 1 : this.patch < l.patch ? -1 : this.patch > l.patch ? 1 : 0;
    }
    comparePre(l) {
      if (l instanceof d || (l = new d(l, this.options)), this.prerelease.length && !l.prerelease.length)
        return -1;
      if (!this.prerelease.length && l.prerelease.length)
        return 1;
      if (!this.prerelease.length && !l.prerelease.length)
        return 0;
      let o = 0;
      do {
        const f = this.prerelease[o], c = l.prerelease[o];
        if (e("prerelease compare", o, f, c), f === void 0 && c === void 0)
          return 0;
        if (c === void 0)
          return 1;
        if (f === void 0)
          return -1;
        if (f === c)
          continue;
        return s(f, c);
      } while (++o);
    }
    compareBuild(l) {
      l instanceof d || (l = new d(l, this.options));
      let o = 0;
      do {
        const f = this.build[o], c = l.build[o];
        if (e("build compare", o, f, c), f === void 0 && c === void 0)
          return 0;
        if (c === void 0)
          return 1;
        if (f === void 0)
          return -1;
        if (f === c)
          continue;
        return s(f, c);
      } while (++o);
    }
    // preminor will bump the version up to the next minor release, and immediately
    // down to pre-release. premajor and prepatch work the same way.
    inc(l, o, f) {
      if (l.startsWith("pre")) {
        if (!o && f === !1)
          throw new Error("invalid increment argument: identifier is empty");
        if (o) {
          const c = `-${o}`.match(this.options.loose ? r[u.PRERELEASELOOSE] : r[u.PRERELEASE]);
          if (!c || c[1] !== o)
            throw new Error(`invalid identifier: ${o}`);
        }
      }
      switch (l) {
        case "premajor":
          this.prerelease.length = 0, this.patch = 0, this.minor = 0, this.major++, this.inc("pre", o, f);
          break;
        case "preminor":
          this.prerelease.length = 0, this.patch = 0, this.minor++, this.inc("pre", o, f);
          break;
        case "prepatch":
          this.prerelease.length = 0, this.inc("patch", o, f), this.inc("pre", o, f);
          break;
        // If the input is a non-prerelease version, this acts the same as
        // prepatch.
        case "prerelease":
          this.prerelease.length === 0 && this.inc("patch", o, f), this.inc("pre", o, f);
          break;
        case "release":
          if (this.prerelease.length === 0)
            throw new Error(`version ${this.raw} is not a prerelease`);
          this.prerelease.length = 0;
          break;
        case "major":
          (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) && this.major++, this.minor = 0, this.patch = 0, this.prerelease = [];
          break;
        case "minor":
          (this.patch !== 0 || this.prerelease.length === 0) && this.minor++, this.patch = 0, this.prerelease = [];
          break;
        case "patch":
          this.prerelease.length === 0 && this.patch++, this.prerelease = [];
          break;
        // This probably shouldn't be used publicly.
        // 1.0.0 'pre' would become 1.0.0-0 which is the wrong direction.
        case "pre": {
          const c = Number(f) ? 1 : 0;
          if (this.prerelease.length === 0)
            this.prerelease = [c];
          else {
            let p = this.prerelease.length;
            for (; --p >= 0; )
              typeof this.prerelease[p] == "number" && (this.prerelease[p]++, p = -2);
            if (p === -1) {
              if (o === this.prerelease.join(".") && f === !1)
                throw new Error("invalid increment argument: identifier already exists");
              this.prerelease.push(c);
            }
          }
          if (o) {
            let p = [o, c];
            f === !1 && (p = [o]), s(this.prerelease[0], o) === 0 ? isNaN(this.prerelease[1]) && (this.prerelease = p) : this.prerelease = p;
          }
          break;
        }
        default:
          throw new Error(`invalid increment argument: ${l}`);
      }
      return this.raw = this.format(), this.build.length && (this.raw += `+${this.build.join(".")}`), this;
    }
  }
  return Da = d, Da;
}
var $a, yc;
function Cr() {
  if (yc) return $a;
  yc = 1;
  const e = nt();
  return $a = (i, r, u = !1) => {
    if (i instanceof e)
      return i;
    try {
      return new e(i, r);
    } catch (n) {
      if (!u)
        return null;
      throw n;
    }
  }, $a;
}
var ka, _c;
function sy() {
  if (_c) return ka;
  _c = 1;
  const e = Cr();
  return ka = (i, r) => {
    const u = e(i, r);
    return u ? u.version : null;
  }, ka;
}
var La, Ec;
function oy() {
  if (Ec) return La;
  Ec = 1;
  const e = Cr();
  return La = (i, r) => {
    const u = e(i.trim().replace(/^[=v]+/, ""), r);
    return u ? u.version : null;
  }, La;
}
var Fa, vc;
function uy() {
  if (vc) return Fa;
  vc = 1;
  const e = nt();
  return Fa = (i, r, u, n, s) => {
    typeof u == "string" && (s = n, n = u, u = void 0);
    try {
      return new e(
        i instanceof e ? i.version : i,
        u
      ).inc(r, n, s).version;
    } catch {
      return null;
    }
  }, Fa;
}
var Ua, wc;
function ly() {
  if (wc) return Ua;
  wc = 1;
  const e = Cr();
  return Ua = (i, r) => {
    const u = e(i, null, !0), n = e(r, null, !0), s = u.compare(n);
    if (s === 0)
      return null;
    const d = s > 0, a = d ? u : n, l = d ? n : u, o = !!a.prerelease.length;
    if (!!l.prerelease.length && !o) {
      if (!l.patch && !l.minor)
        return "major";
      if (l.compareMain(a) === 0)
        return l.minor && !l.patch ? "minor" : "patch";
    }
    const c = o ? "pre" : "";
    return u.major !== n.major ? c + "major" : u.minor !== n.minor ? c + "minor" : u.patch !== n.patch ? c + "patch" : "prerelease";
  }, Ua;
}
var qa, Sc;
function cy() {
  if (Sc) return qa;
  Sc = 1;
  const e = nt();
  return qa = (i, r) => new e(i, r).major, qa;
}
var xa, Tc;
function dy() {
  if (Tc) return xa;
  Tc = 1;
  const e = nt();
  return xa = (i, r) => new e(i, r).minor, xa;
}
var Ma, bc;
function fy() {
  if (bc) return Ma;
  bc = 1;
  const e = nt();
  return Ma = (i, r) => new e(i, r).patch, Ma;
}
var ja, Rc;
function hy() {
  if (Rc) return ja;
  Rc = 1;
  const e = Cr();
  return ja = (i, r) => {
    const u = e(i, r);
    return u && u.prerelease.length ? u.prerelease : null;
  }, ja;
}
var Ba, Ac;
function Rt() {
  if (Ac) return Ba;
  Ac = 1;
  const e = nt();
  return Ba = (i, r, u) => new e(i, u).compare(new e(r, u)), Ba;
}
var Ha, Oc;
function py() {
  if (Oc) return Ha;
  Oc = 1;
  const e = Rt();
  return Ha = (i, r, u) => e(r, i, u), Ha;
}
var Ga, Nc;
function my() {
  if (Nc) return Ga;
  Nc = 1;
  const e = Rt();
  return Ga = (i, r) => e(i, r, !0), Ga;
}
var Va, Pc;
function Go() {
  if (Pc) return Va;
  Pc = 1;
  const e = nt();
  return Va = (i, r, u) => {
    const n = new e(i, u), s = new e(r, u);
    return n.compare(s) || n.compareBuild(s);
  }, Va;
}
var za, Cc;
function gy() {
  if (Cc) return za;
  Cc = 1;
  const e = Go();
  return za = (i, r) => i.sort((u, n) => e(u, n, r)), za;
}
var Ya, Ic;
function yy() {
  if (Ic) return Ya;
  Ic = 1;
  const e = Go();
  return Ya = (i, r) => i.sort((u, n) => e(n, u, r)), Ya;
}
var Xa, Dc;
function ra() {
  if (Dc) return Xa;
  Dc = 1;
  const e = Rt();
  return Xa = (i, r, u) => e(i, r, u) > 0, Xa;
}
var Wa, $c;
function Vo() {
  if ($c) return Wa;
  $c = 1;
  const e = Rt();
  return Wa = (i, r, u) => e(i, r, u) < 0, Wa;
}
var Ka, kc;
function jh() {
  if (kc) return Ka;
  kc = 1;
  const e = Rt();
  return Ka = (i, r, u) => e(i, r, u) === 0, Ka;
}
var Ja, Lc;
function Bh() {
  if (Lc) return Ja;
  Lc = 1;
  const e = Rt();
  return Ja = (i, r, u) => e(i, r, u) !== 0, Ja;
}
var Qa, Fc;
function zo() {
  if (Fc) return Qa;
  Fc = 1;
  const e = Rt();
  return Qa = (i, r, u) => e(i, r, u) >= 0, Qa;
}
var Za, Uc;
function Yo() {
  if (Uc) return Za;
  Uc = 1;
  const e = Rt();
  return Za = (i, r, u) => e(i, r, u) <= 0, Za;
}
var es, qc;
function Hh() {
  if (qc) return es;
  qc = 1;
  const e = jh(), t = Bh(), i = ra(), r = zo(), u = Vo(), n = Yo();
  return es = (d, a, l, o) => {
    switch (a) {
      case "===":
        return typeof d == "object" && (d = d.version), typeof l == "object" && (l = l.version), d === l;
      case "!==":
        return typeof d == "object" && (d = d.version), typeof l == "object" && (l = l.version), d !== l;
      case "":
      case "=":
      case "==":
        return e(d, l, o);
      case "!=":
        return t(d, l, o);
      case ">":
        return i(d, l, o);
      case ">=":
        return r(d, l, o);
      case "<":
        return u(d, l, o);
      case "<=":
        return n(d, l, o);
      default:
        throw new TypeError(`Invalid operator: ${a}`);
    }
  }, es;
}
var ts, xc;
function _y() {
  if (xc) return ts;
  xc = 1;
  const e = nt(), t = Cr(), { safeRe: i, t: r } = wn();
  return ts = (n, s) => {
    if (n instanceof e)
      return n;
    if (typeof n == "number" && (n = String(n)), typeof n != "string")
      return null;
    s = s || {};
    let d = null;
    if (!s.rtl)
      d = n.match(s.includePrerelease ? i[r.COERCEFULL] : i[r.COERCE]);
    else {
      const p = s.includePrerelease ? i[r.COERCERTLFULL] : i[r.COERCERTL];
      let y;
      for (; (y = p.exec(n)) && (!d || d.index + d[0].length !== n.length); )
        (!d || y.index + y[0].length !== d.index + d[0].length) && (d = y), p.lastIndex = y.index + y[1].length + y[2].length;
      p.lastIndex = -1;
    }
    if (d === null)
      return null;
    const a = d[2], l = d[3] || "0", o = d[4] || "0", f = s.includePrerelease && d[5] ? `-${d[5]}` : "", c = s.includePrerelease && d[6] ? `+${d[6]}` : "";
    return t(`${a}.${l}.${o}${f}${c}`, s);
  }, ts;
}
var rs, Mc;
function Ey() {
  if (Mc) return rs;
  Mc = 1;
  class e {
    constructor() {
      this.max = 1e3, this.map = /* @__PURE__ */ new Map();
    }
    get(i) {
      const r = this.map.get(i);
      if (r !== void 0)
        return this.map.delete(i), this.map.set(i, r), r;
    }
    delete(i) {
      return this.map.delete(i);
    }
    set(i, r) {
      if (!this.delete(i) && r !== void 0) {
        if (this.map.size >= this.max) {
          const n = this.map.keys().next().value;
          this.delete(n);
        }
        this.map.set(i, r);
      }
      return this;
    }
  }
  return rs = e, rs;
}
var ns, jc;
function At() {
  if (jc) return ns;
  jc = 1;
  const e = /\s+/g;
  class t {
    constructor(B, te) {
      if (te = u(te), B instanceof t)
        return B.loose === !!te.loose && B.includePrerelease === !!te.includePrerelease ? B : new t(B.raw, te);
      if (B instanceof n)
        return this.raw = B.value, this.set = [[B]], this.formatted = void 0, this;
      if (this.options = te, this.loose = !!te.loose, this.includePrerelease = !!te.includePrerelease, this.raw = B.trim().replace(e, " "), this.set = this.raw.split("||").map((j) => this.parseRange(j.trim())).filter((j) => j.length), !this.set.length)
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      if (this.set.length > 1) {
        const j = this.set[0];
        if (this.set = this.set.filter((H) => !E(H[0])), this.set.length === 0)
          this.set = [j];
        else if (this.set.length > 1) {
          for (const H of this.set)
            if (H.length === 1 && h(H[0])) {
              this.set = [H];
              break;
            }
        }
      }
      this.formatted = void 0;
    }
    get range() {
      if (this.formatted === void 0) {
        this.formatted = "";
        for (let B = 0; B < this.set.length; B++) {
          B > 0 && (this.formatted += "||");
          const te = this.set[B];
          for (let j = 0; j < te.length; j++)
            j > 0 && (this.formatted += " "), this.formatted += te[j].toString().trim();
        }
      }
      return this.formatted;
    }
    format() {
      return this.range;
    }
    toString() {
      return this.range;
    }
    parseRange(B) {
      const j = ((this.options.includePrerelease && p) | (this.options.loose && y)) + ":" + B, H = r.get(j);
      if (H)
        return H;
      const Y = this.options.loose, F = Y ? a[l.HYPHENRANGELOOSE] : a[l.HYPHENRANGE];
      B = B.replace(F, U(this.options.includePrerelease)), s("hyphen replace", B), B = B.replace(a[l.COMPARATORTRIM], o), s("comparator trim", B), B = B.replace(a[l.TILDETRIM], f), s("tilde trim", B), B = B.replace(a[l.CARETTRIM], c), s("caret trim", B);
      let x = B.split(" ").map((C) => g(C, this.options)).join(" ").split(/\s+/).map((C) => k(C, this.options));
      Y && (x = x.filter((C) => (s("loose invalid filter", C, this.options), !!C.match(a[l.COMPARATORLOOSE])))), s("range list", x);
      const X = /* @__PURE__ */ new Map(), G = x.map((C) => new n(C, this.options));
      for (const C of G) {
        if (E(C))
          return [C];
        X.set(C.value, C);
      }
      X.size > 1 && X.has("") && X.delete("");
      const P = [...X.values()];
      return r.set(j, P), P;
    }
    intersects(B, te) {
      if (!(B instanceof t))
        throw new TypeError("a Range is required");
      return this.set.some((j) => _(j, te) && B.set.some((H) => _(H, te) && j.every((Y) => H.every((F) => Y.intersects(F, te)))));
    }
    // if ANY of the sets match ALL of its comparators, then pass
    test(B) {
      if (!B)
        return !1;
      if (typeof B == "string")
        try {
          B = new d(B, this.options);
        } catch {
          return !1;
        }
      for (let te = 0; te < this.set.length; te++)
        if (V(this.set[te], B, this.options))
          return !0;
      return !1;
    }
  }
  ns = t;
  const i = Ey(), r = new i(), u = Ho(), n = na(), s = ta(), d = nt(), {
    safeRe: a,
    t: l,
    comparatorTrimReplace: o,
    tildeTrimReplace: f,
    caretTrimReplace: c
  } = wn(), { FLAG_INCLUDE_PRERELEASE: p, FLAG_LOOSE: y } = ea(), E = (L) => L.value === "<0.0.0-0", h = (L) => L.value === "", _ = (L, B) => {
    let te = !0;
    const j = L.slice();
    let H = j.pop();
    for (; te && j.length; )
      te = j.every((Y) => H.intersects(Y, B)), H = j.pop();
    return te;
  }, g = (L, B) => (L = L.replace(a[l.BUILD], ""), s("comp", L, B), L = v(L, B), s("caret", L), L = b(L, B), s("tildes", L), L = O(L, B), s("xrange", L), L = $(L, B), s("stars", L), L), w = (L) => !L || L.toLowerCase() === "x" || L === "*", b = (L, B) => L.trim().split(/\s+/).map((te) => R(te, B)).join(" "), R = (L, B) => {
    const te = B.loose ? a[l.TILDELOOSE] : a[l.TILDE];
    return L.replace(te, (j, H, Y, F, x) => {
      s("tilde", L, j, H, Y, F, x);
      let X;
      return w(H) ? X = "" : w(Y) ? X = `>=${H}.0.0 <${+H + 1}.0.0-0` : w(F) ? X = `>=${H}.${Y}.0 <${H}.${+Y + 1}.0-0` : x ? (s("replaceTilde pr", x), X = `>=${H}.${Y}.${F}-${x} <${H}.${+Y + 1}.0-0`) : X = `>=${H}.${Y}.${F} <${H}.${+Y + 1}.0-0`, s("tilde return", X), X;
    });
  }, v = (L, B) => L.trim().split(/\s+/).map((te) => S(te, B)).join(" "), S = (L, B) => {
    s("caret", L, B);
    const te = B.loose ? a[l.CARETLOOSE] : a[l.CARET], j = B.includePrerelease ? "-0" : "";
    return L.replace(te, (H, Y, F, x, X) => {
      s("caret", L, H, Y, F, x, X);
      let G;
      return w(Y) ? G = "" : w(F) ? G = `>=${Y}.0.0${j} <${+Y + 1}.0.0-0` : w(x) ? Y === "0" ? G = `>=${Y}.${F}.0${j} <${Y}.${+F + 1}.0-0` : G = `>=${Y}.${F}.0${j} <${+Y + 1}.0.0-0` : X ? (s("replaceCaret pr", X), Y === "0" ? F === "0" ? G = `>=${Y}.${F}.${x}-${X} <${Y}.${F}.${+x + 1}-0` : G = `>=${Y}.${F}.${x}-${X} <${Y}.${+F + 1}.0-0` : G = `>=${Y}.${F}.${x}-${X} <${+Y + 1}.0.0-0`) : (s("no pr"), Y === "0" ? F === "0" ? G = `>=${Y}.${F}.${x}${j} <${Y}.${F}.${+x + 1}-0` : G = `>=${Y}.${F}.${x}${j} <${Y}.${+F + 1}.0-0` : G = `>=${Y}.${F}.${x} <${+Y + 1}.0.0-0`), s("caret return", G), G;
    });
  }, O = (L, B) => (s("replaceXRanges", L, B), L.split(/\s+/).map((te) => T(te, B)).join(" ")), T = (L, B) => {
    L = L.trim();
    const te = B.loose ? a[l.XRANGELOOSE] : a[l.XRANGE];
    return L.replace(te, (j, H, Y, F, x, X) => {
      s("xRange", L, j, H, Y, F, x, X);
      const G = w(Y), P = G || w(F), C = P || w(x), K = C;
      return H === "=" && K && (H = ""), X = B.includePrerelease ? "-0" : "", G ? H === ">" || H === "<" ? j = "<0.0.0-0" : j = "*" : H && K ? (P && (F = 0), x = 0, H === ">" ? (H = ">=", P ? (Y = +Y + 1, F = 0, x = 0) : (F = +F + 1, x = 0)) : H === "<=" && (H = "<", P ? Y = +Y + 1 : F = +F + 1), H === "<" && (X = "-0"), j = `${H + Y}.${F}.${x}${X}`) : P ? j = `>=${Y}.0.0${X} <${+Y + 1}.0.0-0` : C && (j = `>=${Y}.${F}.0${X} <${Y}.${+F + 1}.0-0`), s("xRange return", j), j;
    });
  }, $ = (L, B) => (s("replaceStars", L, B), L.trim().replace(a[l.STAR], "")), k = (L, B) => (s("replaceGTE0", L, B), L.trim().replace(a[B.includePrerelease ? l.GTE0PRE : l.GTE0], "")), U = (L) => (B, te, j, H, Y, F, x, X, G, P, C, K) => (w(j) ? te = "" : w(H) ? te = `>=${j}.0.0${L ? "-0" : ""}` : w(Y) ? te = `>=${j}.${H}.0${L ? "-0" : ""}` : F ? te = `>=${te}` : te = `>=${te}${L ? "-0" : ""}`, w(G) ? X = "" : w(P) ? X = `<${+G + 1}.0.0-0` : w(C) ? X = `<${G}.${+P + 1}.0-0` : K ? X = `<=${G}.${P}.${C}-${K}` : L ? X = `<${G}.${P}.${+C + 1}-0` : X = `<=${X}`, `${te} ${X}`.trim()), V = (L, B, te) => {
    for (let j = 0; j < L.length; j++)
      if (!L[j].test(B))
        return !1;
    if (B.prerelease.length && !te.includePrerelease) {
      for (let j = 0; j < L.length; j++)
        if (s(L[j].semver), L[j].semver !== n.ANY && L[j].semver.prerelease.length > 0) {
          const H = L[j].semver;
          if (H.major === B.major && H.minor === B.minor && H.patch === B.patch)
            return !0;
        }
      return !1;
    }
    return !0;
  };
  return ns;
}
var is, Bc;
function na() {
  if (Bc) return is;
  Bc = 1;
  const e = Symbol("SemVer ANY");
  class t {
    static get ANY() {
      return e;
    }
    constructor(o, f) {
      if (f = i(f), o instanceof t) {
        if (o.loose === !!f.loose)
          return o;
        o = o.value;
      }
      o = o.trim().split(/\s+/).join(" "), s("comparator", o, f), this.options = f, this.loose = !!f.loose, this.parse(o), this.semver === e ? this.value = "" : this.value = this.operator + this.semver.version, s("comp", this);
    }
    parse(o) {
      const f = this.options.loose ? r[u.COMPARATORLOOSE] : r[u.COMPARATOR], c = o.match(f);
      if (!c)
        throw new TypeError(`Invalid comparator: ${o}`);
      this.operator = c[1] !== void 0 ? c[1] : "", this.operator === "=" && (this.operator = ""), c[2] ? this.semver = new d(c[2], this.options.loose) : this.semver = e;
    }
    toString() {
      return this.value;
    }
    test(o) {
      if (s("Comparator.test", o, this.options.loose), this.semver === e || o === e)
        return !0;
      if (typeof o == "string")
        try {
          o = new d(o, this.options);
        } catch {
          return !1;
        }
      return n(o, this.operator, this.semver, this.options);
    }
    intersects(o, f) {
      if (!(o instanceof t))
        throw new TypeError("a Comparator is required");
      return this.operator === "" ? this.value === "" ? !0 : new a(o.value, f).test(this.value) : o.operator === "" ? o.value === "" ? !0 : new a(this.value, f).test(o.semver) : (f = i(f), f.includePrerelease && (this.value === "<0.0.0-0" || o.value === "<0.0.0-0") || !f.includePrerelease && (this.value.startsWith("<0.0.0") || o.value.startsWith("<0.0.0")) ? !1 : !!(this.operator.startsWith(">") && o.operator.startsWith(">") || this.operator.startsWith("<") && o.operator.startsWith("<") || this.semver.version === o.semver.version && this.operator.includes("=") && o.operator.includes("=") || n(this.semver, "<", o.semver, f) && this.operator.startsWith(">") && o.operator.startsWith("<") || n(this.semver, ">", o.semver, f) && this.operator.startsWith("<") && o.operator.startsWith(">")));
    }
  }
  is = t;
  const i = Ho(), { safeRe: r, t: u } = wn(), n = Hh(), s = ta(), d = nt(), a = At();
  return is;
}
var as, Hc;
function ia() {
  if (Hc) return as;
  Hc = 1;
  const e = At();
  return as = (i, r, u) => {
    try {
      r = new e(r, u);
    } catch {
      return !1;
    }
    return r.test(i);
  }, as;
}
var ss, Gc;
function vy() {
  if (Gc) return ss;
  Gc = 1;
  const e = At();
  return ss = (i, r) => new e(i, r).set.map((u) => u.map((n) => n.value).join(" ").trim().split(" ")), ss;
}
var os, Vc;
function wy() {
  if (Vc) return os;
  Vc = 1;
  const e = nt(), t = At();
  return os = (r, u, n) => {
    let s = null, d = null, a = null;
    try {
      a = new t(u, n);
    } catch {
      return null;
    }
    return r.forEach((l) => {
      a.test(l) && (!s || d.compare(l) === -1) && (s = l, d = new e(s, n));
    }), s;
  }, os;
}
var us, zc;
function Sy() {
  if (zc) return us;
  zc = 1;
  const e = nt(), t = At();
  return us = (r, u, n) => {
    let s = null, d = null, a = null;
    try {
      a = new t(u, n);
    } catch {
      return null;
    }
    return r.forEach((l) => {
      a.test(l) && (!s || d.compare(l) === 1) && (s = l, d = new e(s, n));
    }), s;
  }, us;
}
var ls, Yc;
function Ty() {
  if (Yc) return ls;
  Yc = 1;
  const e = nt(), t = At(), i = ra();
  return ls = (u, n) => {
    u = new t(u, n);
    let s = new e("0.0.0");
    if (u.test(s) || (s = new e("0.0.0-0"), u.test(s)))
      return s;
    s = null;
    for (let d = 0; d < u.set.length; ++d) {
      const a = u.set[d];
      let l = null;
      a.forEach((o) => {
        const f = new e(o.semver.version);
        switch (o.operator) {
          case ">":
            f.prerelease.length === 0 ? f.patch++ : f.prerelease.push(0), f.raw = f.format();
          /* fallthrough */
          case "":
          case ">=":
            (!l || i(f, l)) && (l = f);
            break;
          case "<":
          case "<=":
            break;
          /* istanbul ignore next */
          default:
            throw new Error(`Unexpected operation: ${o.operator}`);
        }
      }), l && (!s || i(s, l)) && (s = l);
    }
    return s && u.test(s) ? s : null;
  }, ls;
}
var cs, Xc;
function by() {
  if (Xc) return cs;
  Xc = 1;
  const e = At();
  return cs = (i, r) => {
    try {
      return new e(i, r).range || "*";
    } catch {
      return null;
    }
  }, cs;
}
var ds, Wc;
function Xo() {
  if (Wc) return ds;
  Wc = 1;
  const e = nt(), t = na(), { ANY: i } = t, r = At(), u = ia(), n = ra(), s = Vo(), d = Yo(), a = zo();
  return ds = (o, f, c, p) => {
    o = new e(o, p), f = new r(f, p);
    let y, E, h, _, g;
    switch (c) {
      case ">":
        y = n, E = d, h = s, _ = ">", g = ">=";
        break;
      case "<":
        y = s, E = a, h = n, _ = "<", g = "<=";
        break;
      default:
        throw new TypeError('Must provide a hilo val of "<" or ">"');
    }
    if (u(o, f, p))
      return !1;
    for (let w = 0; w < f.set.length; ++w) {
      const b = f.set[w];
      let R = null, v = null;
      if (b.forEach((S) => {
        S.semver === i && (S = new t(">=0.0.0")), R = R || S, v = v || S, y(S.semver, R.semver, p) ? R = S : h(S.semver, v.semver, p) && (v = S);
      }), R.operator === _ || R.operator === g || (!v.operator || v.operator === _) && E(o, v.semver))
        return !1;
      if (v.operator === g && h(o, v.semver))
        return !1;
    }
    return !0;
  }, ds;
}
var fs, Kc;
function Ry() {
  if (Kc) return fs;
  Kc = 1;
  const e = Xo();
  return fs = (i, r, u) => e(i, r, ">", u), fs;
}
var hs, Jc;
function Ay() {
  if (Jc) return hs;
  Jc = 1;
  const e = Xo();
  return hs = (i, r, u) => e(i, r, "<", u), hs;
}
var ps, Qc;
function Oy() {
  if (Qc) return ps;
  Qc = 1;
  const e = At();
  return ps = (i, r, u) => (i = new e(i, u), r = new e(r, u), i.intersects(r, u)), ps;
}
var ms, Zc;
function Ny() {
  if (Zc) return ms;
  Zc = 1;
  const e = ia(), t = Rt();
  return ms = (i, r, u) => {
    const n = [];
    let s = null, d = null;
    const a = i.sort((c, p) => t(c, p, u));
    for (const c of a)
      e(c, r, u) ? (d = c, s || (s = c)) : (d && n.push([s, d]), d = null, s = null);
    s && n.push([s, null]);
    const l = [];
    for (const [c, p] of n)
      c === p ? l.push(c) : !p && c === a[0] ? l.push("*") : p ? c === a[0] ? l.push(`<=${p}`) : l.push(`${c} - ${p}`) : l.push(`>=${c}`);
    const o = l.join(" || "), f = typeof r.raw == "string" ? r.raw : String(r);
    return o.length < f.length ? o : r;
  }, ms;
}
var gs, ed;
function Py() {
  if (ed) return gs;
  ed = 1;
  const e = At(), t = na(), { ANY: i } = t, r = ia(), u = Rt(), n = (f, c, p = {}) => {
    if (f === c)
      return !0;
    f = new e(f, p), c = new e(c, p);
    let y = !1;
    e: for (const E of f.set) {
      for (const h of c.set) {
        const _ = a(E, h, p);
        if (y = y || _ !== null, _)
          continue e;
      }
      if (y)
        return !1;
    }
    return !0;
  }, s = [new t(">=0.0.0-0")], d = [new t(">=0.0.0")], a = (f, c, p) => {
    if (f === c)
      return !0;
    if (f.length === 1 && f[0].semver === i) {
      if (c.length === 1 && c[0].semver === i)
        return !0;
      p.includePrerelease ? f = s : f = d;
    }
    if (c.length === 1 && c[0].semver === i) {
      if (p.includePrerelease)
        return !0;
      c = d;
    }
    const y = /* @__PURE__ */ new Set();
    let E, h;
    for (const O of f)
      O.operator === ">" || O.operator === ">=" ? E = l(E, O, p) : O.operator === "<" || O.operator === "<=" ? h = o(h, O, p) : y.add(O.semver);
    if (y.size > 1)
      return null;
    let _;
    if (E && h) {
      if (_ = u(E.semver, h.semver, p), _ > 0)
        return null;
      if (_ === 0 && (E.operator !== ">=" || h.operator !== "<="))
        return null;
    }
    for (const O of y) {
      if (E && !r(O, String(E), p) || h && !r(O, String(h), p))
        return null;
      for (const T of c)
        if (!r(O, String(T), p))
          return !1;
      return !0;
    }
    let g, w, b, R, v = h && !p.includePrerelease && h.semver.prerelease.length ? h.semver : !1, S = E && !p.includePrerelease && E.semver.prerelease.length ? E.semver : !1;
    v && v.prerelease.length === 1 && h.operator === "<" && v.prerelease[0] === 0 && (v = !1);
    for (const O of c) {
      if (R = R || O.operator === ">" || O.operator === ">=", b = b || O.operator === "<" || O.operator === "<=", E) {
        if (S && O.semver.prerelease && O.semver.prerelease.length && O.semver.major === S.major && O.semver.minor === S.minor && O.semver.patch === S.patch && (S = !1), O.operator === ">" || O.operator === ">=") {
          if (g = l(E, O, p), g === O && g !== E)
            return !1;
        } else if (E.operator === ">=" && !r(E.semver, String(O), p))
          return !1;
      }
      if (h) {
        if (v && O.semver.prerelease && O.semver.prerelease.length && O.semver.major === v.major && O.semver.minor === v.minor && O.semver.patch === v.patch && (v = !1), O.operator === "<" || O.operator === "<=") {
          if (w = o(h, O, p), w === O && w !== h)
            return !1;
        } else if (h.operator === "<=" && !r(h.semver, String(O), p))
          return !1;
      }
      if (!O.operator && (h || E) && _ !== 0)
        return !1;
    }
    return !(E && b && !h && _ !== 0 || h && R && !E && _ !== 0 || S || v);
  }, l = (f, c, p) => {
    if (!f)
      return c;
    const y = u(f.semver, c.semver, p);
    return y > 0 ? f : y < 0 || c.operator === ">" && f.operator === ">=" ? c : f;
  }, o = (f, c, p) => {
    if (!f)
      return c;
    const y = u(f.semver, c.semver, p);
    return y < 0 ? f : y > 0 || c.operator === "<" && f.operator === "<=" ? c : f;
  };
  return gs = n, gs;
}
var ys, td;
function Wo() {
  if (td) return ys;
  td = 1;
  const e = wn(), t = ea(), i = nt(), r = Mh(), u = Cr(), n = sy(), s = oy(), d = uy(), a = ly(), l = cy(), o = dy(), f = fy(), c = hy(), p = Rt(), y = py(), E = my(), h = Go(), _ = gy(), g = yy(), w = ra(), b = Vo(), R = jh(), v = Bh(), S = zo(), O = Yo(), T = Hh(), $ = _y(), k = na(), U = At(), V = ia(), L = vy(), B = wy(), te = Sy(), j = Ty(), H = by(), Y = Xo(), F = Ry(), x = Ay(), X = Oy(), G = Ny(), P = Py();
  return ys = {
    parse: u,
    valid: n,
    clean: s,
    inc: d,
    diff: a,
    major: l,
    minor: o,
    patch: f,
    prerelease: c,
    compare: p,
    rcompare: y,
    compareLoose: E,
    compareBuild: h,
    sort: _,
    rsort: g,
    gt: w,
    lt: b,
    eq: R,
    neq: v,
    gte: S,
    lte: O,
    cmp: T,
    coerce: $,
    Comparator: k,
    Range: U,
    satisfies: V,
    toComparators: L,
    maxSatisfying: B,
    minSatisfying: te,
    minVersion: j,
    validRange: H,
    outside: Y,
    gtr: F,
    ltr: x,
    intersects: X,
    simplifyRange: G,
    subset: P,
    SemVer: i,
    re: e.re,
    src: e.src,
    tokens: e.t,
    SEMVER_SPEC_VERSION: t.SEMVER_SPEC_VERSION,
    RELEASE_TYPES: t.RELEASE_TYPES,
    compareIdentifiers: r.compareIdentifiers,
    rcompareIdentifiers: r.rcompareIdentifiers
  }, ys;
}
var Mr = { exports: {} }, Pi = { exports: {} }, rd;
function Cy() {
  if (rd) return Pi.exports;
  rd = 1;
  const e = (t, i) => {
    for (const r of Reflect.ownKeys(i))
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(i, r));
    return t;
  };
  return Pi.exports = e, Pi.exports.default = e, Pi.exports;
}
var nd;
function Iy() {
  if (nd) return Mr.exports;
  nd = 1;
  const e = Cy(), t = /* @__PURE__ */ new WeakMap(), i = (r, u = {}) => {
    if (typeof r != "function")
      throw new TypeError("Expected a function");
    let n, s = 0;
    const d = r.displayName || r.name || "<anonymous>", a = function(...l) {
      if (t.set(a, ++s), s === 1)
        n = r.apply(this, l), r = null;
      else if (u.throw === !0)
        throw new Error(`Function \`${d}\` can only be called once`);
      return n;
    };
    return e(a, r), t.set(a, s), a;
  };
  return Mr.exports = i, Mr.exports.default = i, Mr.exports.callCount = (r) => {
    if (!t.has(r))
      throw new Error(`The given function \`${r.name}\` is not wrapped by the \`onetime\` package`);
    return t.get(r);
  }, Mr.exports;
}
var Ci = fn.exports, id;
function Dy() {
  return id || (id = 1, (function(e, t) {
    var i = Ci && Ci.__classPrivateFieldSet || function(j, H, Y, F, x) {
      if (F === "m") throw new TypeError("Private method is not writable");
      if (F === "a" && !x) throw new TypeError("Private accessor was defined without a setter");
      if (typeof H == "function" ? j !== H || !x : !H.has(j)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
      return F === "a" ? x.call(j, Y) : x ? x.value = Y : H.set(j, Y), Y;
    }, r = Ci && Ci.__classPrivateFieldGet || function(j, H, Y, F) {
      if (Y === "a" && !F) throw new TypeError("Private accessor was defined without a getter");
      if (typeof H == "function" ? j !== H || !F : !H.has(j)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
      return Y === "m" ? F : Y === "a" ? F.call(j) : F ? F.value : H.get(j);
    }, u, n, s, d, a, l;
    Object.defineProperty(t, "__esModule", { value: !0 });
    const o = yn, f = Tt, c = $e, p = Nr, y = Fo, E = Uo, h = km(), _ = jm(), g = Bm(), w = Km(), b = xh(), R = ny(), v = ay(), S = Wo(), O = Iy(), T = "aes-256-cbc", $ = () => /* @__PURE__ */ Object.create(null), k = (j) => j != null;
    let U = "";
    try {
      delete require.cache[__filename], U = c.dirname((n = (u = e.parent) === null || u === void 0 ? void 0 : u.filename) !== null && n !== void 0 ? n : ".");
    } catch {
    }
    const V = (j, H) => {
      const Y = /* @__PURE__ */ new Set([
        "undefined",
        "symbol",
        "function"
      ]), F = typeof H;
      if (Y.has(F))
        throw new TypeError(`Setting a value of type \`${F}\` for key \`${j}\` is not allowed as it's not supported by JSON`);
    }, L = "__internal__", B = `${L}.migrations.version`;
    class te {
      constructor(H = {}) {
        var Y;
        s.set(this, void 0), d.set(this, void 0), a.set(this, void 0), l.set(this, {}), this._deserialize = (C) => JSON.parse(C), this._serialize = (C) => JSON.stringify(C, void 0, "	");
        const F = {
          configName: "config",
          fileExtension: "json",
          projectSuffix: "nodejs",
          clearInvalidConfig: !1,
          accessPropertiesByDotNotation: !0,
          configFileMode: 438,
          ...H
        }, x = O(() => {
          const C = _.sync({ cwd: U }), K = C && JSON.parse(f.readFileSync(C, "utf8"));
          return K ?? {};
        });
        if (!F.cwd) {
          if (F.projectName || (F.projectName = x().name), !F.projectName)
            throw new Error("Project name could not be inferred. Please specify the `projectName` option.");
          F.cwd = g(F.projectName, { suffix: F.projectSuffix }).config;
        }
        if (i(this, a, F, "f"), F.schema) {
          if (typeof F.schema != "object")
            throw new TypeError("The `schema` option must be an object.");
          const C = new b.default({
            allErrors: !0,
            useDefaults: !0
          });
          (0, R.default)(C);
          const K = {
            type: "object",
            properties: F.schema
          };
          i(this, s, C.compile(K), "f");
          for (const [N, A] of Object.entries(F.schema))
            A?.default && (r(this, l, "f")[N] = A.default);
        }
        F.defaults && i(this, l, {
          ...r(this, l, "f"),
          ...F.defaults
        }, "f"), F.serialize && (this._serialize = F.serialize), F.deserialize && (this._deserialize = F.deserialize), this.events = new E.EventEmitter(), i(this, d, F.encryptionKey, "f");
        const X = F.fileExtension ? `.${F.fileExtension}` : "";
        this.path = c.resolve(F.cwd, `${(Y = F.configName) !== null && Y !== void 0 ? Y : "config"}${X}`);
        const G = this.store, P = Object.assign($(), F.defaults, G);
        this._validate(P);
        try {
          y.deepEqual(G, P);
        } catch {
          this.store = P;
        }
        if (F.watch && this._watch(), F.migrations) {
          if (F.projectVersion || (F.projectVersion = x().version), !F.projectVersion)
            throw new Error("Project version could not be inferred. Please specify the `projectVersion` option.");
          this._migrate(F.migrations, F.projectVersion, F.beforeEachMigration);
        }
      }
      get(H, Y) {
        if (r(this, a, "f").accessPropertiesByDotNotation)
          return this._get(H, Y);
        const { store: F } = this;
        return H in F ? F[H] : Y;
      }
      set(H, Y) {
        if (typeof H != "string" && typeof H != "object")
          throw new TypeError(`Expected \`key\` to be of type \`string\` or \`object\`, got ${typeof H}`);
        if (typeof H != "object" && Y === void 0)
          throw new TypeError("Use `delete()` to clear values");
        if (this._containsReservedKey(H))
          throw new TypeError(`Please don't use the ${L} key, as it's used to manage this module internal operations.`);
        const { store: F } = this, x = (X, G) => {
          V(X, G), r(this, a, "f").accessPropertiesByDotNotation ? h.set(F, X, G) : F[X] = G;
        };
        if (typeof H == "object") {
          const X = H;
          for (const [G, P] of Object.entries(X))
            x(G, P);
        } else
          x(H, Y);
        this.store = F;
      }
      /**
          Check if an item exists.
      
          @param key - The key of the item to check.
          */
      has(H) {
        return r(this, a, "f").accessPropertiesByDotNotation ? h.has(this.store, H) : H in this.store;
      }
      /**
          Reset items to their default values, as defined by the `defaults` or `schema` option.
      
          @see `clear()` to reset all items.
      
          @param keys - The keys of the items to reset.
          */
      reset(...H) {
        for (const Y of H)
          k(r(this, l, "f")[Y]) && this.set(Y, r(this, l, "f")[Y]);
      }
      /**
          Delete an item.
      
          @param key - The key of the item to delete.
          */
      delete(H) {
        const { store: Y } = this;
        r(this, a, "f").accessPropertiesByDotNotation ? h.delete(Y, H) : delete Y[H], this.store = Y;
      }
      /**
          Delete all items.
      
          This resets known items to their default values, if defined by the `defaults` or `schema` option.
          */
      clear() {
        this.store = $();
        for (const H of Object.keys(r(this, l, "f")))
          this.reset(H);
      }
      /**
          Watches the given `key`, calling `callback` on any changes.
      
          @param key - The key wo watch.
          @param callback - A callback function that is called on any changes. When a `key` is first set `oldValue` will be `undefined`, and when a key is deleted `newValue` will be `undefined`.
          @returns A function, that when called, will unsubscribe.
          */
      onDidChange(H, Y) {
        if (typeof H != "string")
          throw new TypeError(`Expected \`key\` to be of type \`string\`, got ${typeof H}`);
        if (typeof Y != "function")
          throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof Y}`);
        return this._handleChange(() => this.get(H), Y);
      }
      /**
          Watches the whole config object, calling `callback` on any changes.
      
          @param callback - A callback function that is called on any changes. When a `key` is first set `oldValue` will be `undefined`, and when a key is deleted `newValue` will be `undefined`.
          @returns A function, that when called, will unsubscribe.
          */
      onDidAnyChange(H) {
        if (typeof H != "function")
          throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof H}`);
        return this._handleChange(() => this.store, H);
      }
      get size() {
        return Object.keys(this.store).length;
      }
      get store() {
        try {
          const H = f.readFileSync(this.path, r(this, d, "f") ? null : "utf8"), Y = this._encryptData(H), F = this._deserialize(Y);
          return this._validate(F), Object.assign($(), F);
        } catch (H) {
          if (H?.code === "ENOENT")
            return this._ensureDirectory(), $();
          if (r(this, a, "f").clearInvalidConfig && H.name === "SyntaxError")
            return $();
          throw H;
        }
      }
      set store(H) {
        this._ensureDirectory(), this._validate(H), this._write(H), this.events.emit("change");
      }
      *[(s = /* @__PURE__ */ new WeakMap(), d = /* @__PURE__ */ new WeakMap(), a = /* @__PURE__ */ new WeakMap(), l = /* @__PURE__ */ new WeakMap(), Symbol.iterator)]() {
        for (const [H, Y] of Object.entries(this.store))
          yield [H, Y];
      }
      _encryptData(H) {
        if (!r(this, d, "f"))
          return H.toString();
        try {
          if (r(this, d, "f"))
            try {
              if (H.slice(16, 17).toString() === ":") {
                const Y = H.slice(0, 16), F = p.pbkdf2Sync(r(this, d, "f"), Y.toString(), 1e4, 32, "sha512"), x = p.createDecipheriv(T, F, Y);
                H = Buffer.concat([x.update(Buffer.from(H.slice(17))), x.final()]).toString("utf8");
              } else {
                const Y = p.createDecipher(T, r(this, d, "f"));
                H = Buffer.concat([Y.update(Buffer.from(H)), Y.final()]).toString("utf8");
              }
            } catch {
            }
        } catch {
        }
        return H.toString();
      }
      _handleChange(H, Y) {
        let F = H();
        const x = () => {
          const X = F, G = H();
          (0, o.isDeepStrictEqual)(G, X) || (F = G, Y.call(this, G, X));
        };
        return this.events.on("change", x), () => this.events.removeListener("change", x);
      }
      _validate(H) {
        if (!r(this, s, "f") || r(this, s, "f").call(this, H) || !r(this, s, "f").errors)
          return;
        const F = r(this, s, "f").errors.map(({ instancePath: x, message: X = "" }) => `\`${x.slice(1)}\` ${X}`);
        throw new Error("Config schema violation: " + F.join("; "));
      }
      _ensureDirectory() {
        f.mkdirSync(c.dirname(this.path), { recursive: !0 });
      }
      _write(H) {
        let Y = this._serialize(H);
        if (r(this, d, "f")) {
          const F = p.randomBytes(16), x = p.pbkdf2Sync(r(this, d, "f"), F.toString(), 1e4, 32, "sha512"), X = p.createCipheriv(T, x, F);
          Y = Buffer.concat([F, Buffer.from(":"), X.update(Buffer.from(Y)), X.final()]);
        }
        if (process.env.SNAP)
          f.writeFileSync(this.path, Y, { mode: r(this, a, "f").configFileMode });
        else
          try {
            w.writeFileSync(this.path, Y, { mode: r(this, a, "f").configFileMode });
          } catch (F) {
            if (F?.code === "EXDEV") {
              f.writeFileSync(this.path, Y, { mode: r(this, a, "f").configFileMode });
              return;
            }
            throw F;
          }
      }
      _watch() {
        this._ensureDirectory(), f.existsSync(this.path) || this._write($()), process.platform === "win32" ? f.watch(this.path, { persistent: !1 }, v(() => {
          this.events.emit("change");
        }, { wait: 100 })) : f.watchFile(this.path, { persistent: !1 }, v(() => {
          this.events.emit("change");
        }, { wait: 5e3 }));
      }
      _migrate(H, Y, F) {
        let x = this._get(B, "0.0.0");
        const X = Object.keys(H).filter((P) => this._shouldPerformMigration(P, x, Y));
        let G = { ...this.store };
        for (const P of X)
          try {
            F && F(this, {
              fromVersion: x,
              toVersion: P,
              finalVersion: Y,
              versions: X
            });
            const C = H[P];
            C(this), this._set(B, P), x = P, G = { ...this.store };
          } catch (C) {
            throw this.store = G, new Error(`Something went wrong during the migration! Changes applied to the store until this failed migration will be restored. ${C}`);
          }
        (this._isVersionInRangeFormat(x) || !S.eq(x, Y)) && this._set(B, Y);
      }
      _containsReservedKey(H) {
        return typeof H == "object" && Object.keys(H)[0] === L ? !0 : typeof H != "string" ? !1 : r(this, a, "f").accessPropertiesByDotNotation ? !!H.startsWith(`${L}.`) : !1;
      }
      _isVersionInRangeFormat(H) {
        return S.clean(H) === null;
      }
      _shouldPerformMigration(H, Y, F) {
        return this._isVersionInRangeFormat(H) ? Y !== "0.0.0" && S.satisfies(Y, H) ? !1 : S.satisfies(F, H) : !(S.lte(H, Y) || S.gt(H, F));
      }
      _get(H, Y) {
        return h.get(this.store, H, Y);
      }
      _set(H, Y) {
        const { store: F } = this;
        h.set(F, H, Y), this.store = F;
      }
    }
    t.default = te, e.exports = te, e.exports.default = te;
  })(fn, fn.exports)), fn.exports;
}
var _s, ad;
function $y() {
  if (ad) return _s;
  ad = 1;
  const e = $e, { app: t, ipcMain: i, ipcRenderer: r, shell: u } = zt, n = Dy();
  let s = !1;
  const d = () => {
    if (!i || !t)
      throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
    const l = {
      defaultCwd: t.getPath("userData"),
      appVersion: t.getVersion()
    };
    return s || (i.on("electron-store-get-data", (o) => {
      o.returnValue = l;
    }), s = !0), l;
  };
  class a extends n {
    constructor(o) {
      let f, c;
      if (r) {
        const p = r.sendSync("electron-store-get-data");
        if (!p)
          throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
        ({ defaultCwd: f, appVersion: c } = p);
      } else i && t && ({ defaultCwd: f, appVersion: c } = d());
      o = {
        name: "config",
        ...o
      }, o.projectVersion || (o.projectVersion = c), o.cwd ? o.cwd = e.isAbsolute(o.cwd) ? o.cwd : e.join(f, o.cwd) : o.cwd = f, o.configName = o.name, delete o.name, super(o);
    }
    static initRenderer() {
      d();
    }
    async openInEditor() {
      const o = await u.openPath(this.path);
      if (o)
        throw new Error(o);
    }
  }
  return _s = a, _s;
}
var ky = /* @__PURE__ */ $y();
const Ko = /* @__PURE__ */ Dm(ky);
function Ly() {
  const { app: e } = require("electron");
  return e.isPackaged ? st.join(process.resourcesPath, "build", "icon.png") : st.join(__dirname, "..", "build", "icon.png");
}
function vt(e) {
  if (!bu.isSupported())
    return console.warn("Notifications are not supported on this system"), null;
  const t = new bu({
    title: e.title,
    body: e.body,
    silent: e.silent ?? !1,
    icon: Ly(),
    urgency: e.urgency ?? "normal",
    timeoutType: e.timeoutType ?? "default",
    actions: e.actions
  });
  return t.on("click", () => {
    e.onClick?.();
  }), t.on("action", (i, r) => {
    e.onAction?.(r);
  }), t.show(), t;
}
const jr = {
  pomodoroComplete: (e) => vt({
    title: "🍅 ¡Pomodoro Completado!",
    body: "¡Excelente trabajo! Es hora de tomar un descanso.",
    urgency: "normal",
    onClick: () => {
      e.show(), e.focus();
    }
  }),
  shortBreakComplete: (e) => vt({
    title: "☕ Descanso Terminado",
    body: "Es hora de volver al trabajo. ¡Tú puedes!",
    urgency: "normal",
    onClick: () => {
      e.show(), e.focus();
    }
  }),
  longBreakComplete: (e) => vt({
    title: "🌿 Descanso Largo Terminado",
    body: "¡Recargado! Es hora de empezar una nueva sesión.",
    urgency: "normal",
    onClick: () => {
      e.show(), e.focus();
    }
  }),
  taskDue: (e, t) => vt({
    title: "⏰ Tarea Vencida",
    body: `La tarea "${t}" ha vencido.`,
    urgency: "critical",
    onClick: () => {
      e.show(), e.focus(), e.webContents.send("notification-action", "task:view-overdue");
    }
  }),
  taskReminder: (e, t, i) => vt({
    title: "📋 Recordatorio de Tarea",
    body: `"${t}" vence ${i}.`,
    urgency: "normal",
    onClick: () => {
      e.show(), e.focus();
    }
  }),
  syncComplete: () => vt({
    title: "✅ Sincronización Completada",
    body: "Todos los cambios han sido sincronizados.",
    urgency: "low",
    silent: !0
  }),
  syncError: (e) => vt({
    title: "❌ Error de Sincronización",
    body: "No se pudieron sincronizar los cambios. Reintentar.",
    urgency: "critical",
    onClick: () => {
      e.show(), e.focus();
    }
  }),
  achievementUnlocked: (e) => vt({
    title: "🏆 ¡Logro Desbloqueado!",
    body: e,
    urgency: "normal"
  }),
  streakMilestone: (e) => vt({
    title: "🔥 ¡Racha de Productividad!",
    body: `¡Has mantenido tu racha por ${e} días consecutivos!`,
    urgency: "normal"
  }),
  custom: (e, t, i) => vt({
    title: e,
    body: t,
    ...i
  })
}, Es = 1, Fy = `
-- Sync metadata table
CREATE TABLE IF NOT EXISTS sync_metadata (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
);

-- Workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  icon TEXT,
  owner_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  -- Sync fields
  is_synced INTEGER DEFAULT 0,
  sync_status TEXT DEFAULT 'pending', -- pending, synced, conflict, deleted
  local_updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
  server_updated_at INTEGER,
  is_deleted INTEGER DEFAULT 0
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  status TEXT DEFAULT 'active',
  start_date INTEGER,
  end_date INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  -- Sync fields
  is_synced INTEGER DEFAULT 0,
  sync_status TEXT DEFAULT 'pending',
  local_updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
  server_updated_at INTEGER,
  is_deleted INTEGER DEFAULT 0,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  project_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending', -- pending, in_progress, completed
  priority TEXT DEFAULT 'medium', -- low, medium, high, urgent
  due_date INTEGER,
  estimated_pomodoros INTEGER DEFAULT 1,
  completed_pomodoros INTEGER DEFAULT 0,
  position INTEGER DEFAULT 0,
  parent_task_id TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  completed_at INTEGER,
  -- Sync fields
  is_synced INTEGER DEFAULT 0,
  sync_status TEXT DEFAULT 'pending',
  local_updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
  server_updated_at INTEGER,
  is_deleted INTEGER DEFAULT 0,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
  FOREIGN KEY (parent_task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- Task Tags (many-to-many)
CREATE TABLE IF NOT EXISTS task_tags (
  task_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
  PRIMARY KEY (task_id, tag_id),
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  name TEXT NOT NULL,
  color TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  -- Sync fields
  is_synced INTEGER DEFAULT 0,
  sync_status TEXT DEFAULT 'pending',
  local_updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
  server_updated_at INTEGER,
  is_deleted INTEGER DEFAULT 0,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
);

-- Subtasks table
CREATE TABLE IF NOT EXISTS subtasks (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  title TEXT NOT NULL,
  is_completed INTEGER DEFAULT 0,
  position INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  -- Sync fields
  is_synced INTEGER DEFAULT 0,
  sync_status TEXT DEFAULT 'pending',
  local_updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
  server_updated_at INTEGER,
  is_deleted INTEGER DEFAULT 0,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  -- Sync fields
  is_synced INTEGER DEFAULT 0,
  sync_status TEXT DEFAULT 'pending',
  local_updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
  server_updated_at INTEGER,
  is_deleted INTEGER DEFAULT 0,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- Pomodoro Sessions table
CREATE TABLE IF NOT EXISTS pomodoro_sessions (
  id TEXT PRIMARY KEY,
  task_id TEXT,
  workspace_id TEXT NOT NULL,
  type TEXT NOT NULL, -- focus, short_break, long_break
  duration INTEGER NOT NULL, -- in seconds
  started_at INTEGER NOT NULL,
  completed_at INTEGER,
  was_interrupted INTEGER DEFAULT 0,
  notes TEXT,
  created_at INTEGER NOT NULL,
  -- Sync fields
  is_synced INTEGER DEFAULT 0,
  sync_status TEXT DEFAULT 'pending',
  local_updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
  server_updated_at INTEGER,
  is_deleted INTEGER DEFAULT 0,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
);

-- Sync Queue for pending operations
CREATE TABLE IF NOT EXISTS sync_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT NOT NULL, -- workspace, project, task, tag, etc.
  entity_id TEXT NOT NULL,
  operation TEXT NOT NULL, -- create, update, delete
  payload TEXT, -- JSON payload for the operation
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
  attempts INTEGER DEFAULT 0,
  last_attempt_at INTEGER,
  error TEXT,
  status TEXT DEFAULT 'pending' -- pending, processing, failed, completed
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_workspace ON tasks(workspace_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_sync_status ON tasks(sync_status);
CREATE INDEX IF NOT EXISTS idx_tasks_is_deleted ON tasks(is_deleted);
CREATE INDEX IF NOT EXISTS idx_projects_workspace ON projects(workspace_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_task ON subtasks(task_id);
CREATE INDEX IF NOT EXISTS idx_comments_task ON comments(task_id);
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_task ON pomodoro_sessions(task_id);
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_workspace ON pomodoro_sessions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(status);
CREATE INDEX IF NOT EXISTS idx_sync_queue_entity ON sync_queue(entity_type, entity_id);
`;
let ct = null;
function Uy() {
  const e = Ne.getPath("userData");
  return st.join(e, "ordo-todo.db");
}
function Gh() {
  if (ct) return ct;
  const e = Uy();
  console.log("[Database] Initializing database at:", e);
  const t = st.dirname(e);
  return Ru.existsSync(t) || Ru.mkdirSync(t, { recursive: !0 }), ct = new vm(e, {
    // Enable WAL mode for better concurrent read performance
    // verbose: console.log // Uncomment for debugging
  }), ct.pragma("journal_mode = WAL"), ct.pragma("foreign_keys = ON"), ct.pragma("synchronous = NORMAL"), qy(ct), console.log("[Database] Database initialized successfully"), ct;
}
function qy(e) {
  e.exec(Fy);
  const t = e.prepare(`
    SELECT value FROM sync_metadata WHERE key = 'schema_version'
  `).get(), i = t ? parseInt(t.value, 10) : 0;
  i < Es && (console.log(`[Database] Migrating from version ${i} to ${Es}`), e.prepare(`
      INSERT OR REPLACE INTO sync_metadata (key, value, updated_at)
      VALUES ('schema_version', ?, ?)
    `).run(Es.toString(), Date.now()), console.log("[Database] Migration completed"));
}
function xe() {
  return ct || Gh();
}
function xy() {
  ct && (ct.close(), ct = null, console.log("[Database] Database connection closed"));
}
function aa() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (e) => {
    const t = Math.random() * 16 | 0;
    return (e === "x" ? t : t & 3 | 8).toString(16);
  });
}
function Ot() {
  return Date.now();
}
function My(e) {
  const t = xe(), i = Ot(), r = aa(), u = {
    ...e,
    id: r,
    created_at: i,
    updated_at: i,
    local_updated_at: i,
    is_synced: 0,
    sync_status: "pending",
    is_deleted: 0
  };
  return t.prepare(`
    INSERT INTO tasks (
      id, workspace_id, project_id, title, description, status, priority,
      due_date, estimated_pomodoros, completed_pomodoros, position,
      parent_task_id, created_at, updated_at, completed_at,
      is_synced, sync_status, local_updated_at, server_updated_at, is_deleted
    ) VALUES (
      @id, @workspace_id, @project_id, @title, @description, @status, @priority,
      @due_date, @estimated_pomodoros, @completed_pomodoros, @position,
      @parent_task_id, @created_at, @updated_at, @completed_at,
      @is_synced, @sync_status, @local_updated_at, @server_updated_at, @is_deleted
    )
  `).run(u), Ir("task", r, "create", u), u;
}
function jy(e, t) {
  const i = xe(), r = Ot(), u = Object.keys(t).filter((s) => !["id", "created_at"].includes(s)).map((s) => `${s} = @${s}`).join(", ");
  if (!u) return Do(e);
  i.prepare(`
    UPDATE tasks 
    SET ${u}, updated_at = @updated_at, local_updated_at = @local_updated_at, 
        is_synced = 0, sync_status = 'pending'
    WHERE id = @id AND is_deleted = 0
  `).run({
    ...t,
    id: e,
    updated_at: r,
    local_updated_at: r
  });
  const n = Do(e);
  return n && Ir("task", e, "update", n), n;
}
function By(e, t = !0) {
  const i = xe(), r = Ot();
  return t ? i.prepare(`
      UPDATE tasks 
      SET is_deleted = 1, sync_status = 'deleted', local_updated_at = ?, is_synced = 0
      WHERE id = ?
    `).run(r, e) : i.prepare("DELETE FROM tasks WHERE id = ?").run(e), Ir("task", e, "delete", { id: e }), !0;
}
function Do(e) {
  return xe().prepare(`
    SELECT * FROM tasks WHERE id = ? AND is_deleted = 0
  `).get(e);
}
function Hy(e) {
  return xe().prepare(`
    SELECT * FROM tasks 
    WHERE workspace_id = ? AND is_deleted = 0
    ORDER BY position ASC, created_at DESC
  `).all(e);
}
function Gy(e) {
  return xe().prepare(`
    SELECT * FROM tasks 
    WHERE project_id = ? AND is_deleted = 0
    ORDER BY position ASC, created_at DESC
  `).all(e);
}
function Vy(e) {
  return xe().prepare(`
    SELECT * FROM tasks 
    WHERE workspace_id = ? AND status = 'pending' AND is_deleted = 0
    ORDER BY priority DESC, due_date ASC, position ASC
  `).all(e);
}
function zy() {
  return xe().prepare(`
    SELECT * FROM tasks WHERE is_synced = 0
  `).all();
}
function Yy(e) {
  const t = xe(), i = Ot(), r = aa(), u = {
    ...e,
    id: r,
    created_at: i,
    updated_at: i,
    local_updated_at: i,
    is_synced: 0,
    sync_status: "pending",
    is_deleted: 0
  };
  return t.prepare(`
    INSERT INTO workspaces (
      id, name, description, color, icon, owner_id,
      created_at, updated_at, is_synced, sync_status, local_updated_at, server_updated_at, is_deleted
    ) VALUES (
      @id, @name, @description, @color, @icon, @owner_id,
      @created_at, @updated_at, @is_synced, @sync_status, @local_updated_at, @server_updated_at, @is_deleted
    )
  `).run(u), Ir("workspace", r, "create", u), u;
}
function Xy() {
  return xe().prepare(`
    SELECT * FROM workspaces WHERE is_deleted = 0 ORDER BY name ASC
  `).all();
}
function Wy(e) {
  return xe().prepare(`
    SELECT * FROM workspaces WHERE id = ? AND is_deleted = 0
  `).get(e);
}
function Ky(e) {
  const t = xe(), i = Ot(), r = aa(), u = {
    ...e,
    id: r,
    created_at: i,
    updated_at: i,
    local_updated_at: i,
    is_synced: 0,
    sync_status: "pending",
    is_deleted: 0
  };
  return t.prepare(`
    INSERT INTO projects (
      id, workspace_id, name, description, color, status, start_date, end_date,
      created_at, updated_at, is_synced, sync_status, local_updated_at, server_updated_at, is_deleted
    ) VALUES (
      @id, @workspace_id, @name, @description, @color, @status, @start_date, @end_date,
      @created_at, @updated_at, @is_synced, @sync_status, @local_updated_at, @server_updated_at, @is_deleted
    )
  `).run(u), Ir("project", r, "create", u), u;
}
function Jy(e) {
  return xe().prepare(`
    SELECT * FROM projects 
    WHERE workspace_id = ? AND is_deleted = 0
    ORDER BY name ASC
  `).all(e);
}
function Qy(e) {
  const t = xe(), i = Ot(), r = aa(), u = {
    ...e,
    id: r,
    created_at: i,
    local_updated_at: i,
    is_synced: 0,
    sync_status: "pending",
    is_deleted: 0
  };
  return t.prepare(`
    INSERT INTO pomodoro_sessions (
      id, task_id, workspace_id, type, duration, started_at, completed_at,
      was_interrupted, notes, created_at, is_synced, sync_status, local_updated_at, 
      server_updated_at, is_deleted
    ) VALUES (
      @id, @task_id, @workspace_id, @type, @duration, @started_at, @completed_at,
      @was_interrupted, @notes, @created_at, @is_synced, @sync_status, @local_updated_at,
      @server_updated_at, @is_deleted
    )
  `).run(u), Ir("pomodoro_session", r, "create", u), u;
}
function Zy(e, t, i) {
  const r = xe();
  let u = "SELECT * FROM pomodoro_sessions WHERE workspace_id = ? AND is_deleted = 0";
  const n = [e];
  return t && (u += " AND started_at >= ?", n.push(t)), i && (u += " AND started_at <= ?", n.push(i)), u += " ORDER BY started_at DESC", r.prepare(u).all(...n);
}
function Ir(e, t, i, r) {
  const u = xe(), n = u.prepare(`
    SELECT id, operation FROM sync_queue 
    WHERE entity_type = ? AND entity_id = ? AND status = 'pending'
    ORDER BY created_at DESC LIMIT 1
  `).get(e, t);
  if (n) {
    if (n.operation === "create" && i === "update") {
      u.prepare(`
        UPDATE sync_queue SET payload = ? WHERE id = ?
      `).run(JSON.stringify(r), n.id);
      return;
    }
    if (n.operation === "create" && i === "delete") {
      u.prepare("DELETE FROM sync_queue WHERE id = ?").run(n.id);
      return;
    }
    if (n.operation === "update" && i === "delete") {
      u.prepare(`
        UPDATE sync_queue SET operation = 'delete', payload = ? WHERE id = ?
      `).run(JSON.stringify(r), n.id);
      return;
    }
    if (n.operation === "update" && i === "update") {
      u.prepare(`
        UPDATE sync_queue SET payload = ? WHERE id = ?
      `).run(JSON.stringify(r), n.id);
      return;
    }
  }
  u.prepare(`
    INSERT INTO sync_queue (entity_type, entity_id, operation, payload, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(e, t, i, JSON.stringify(r), Ot());
}
function e0(e = 50) {
  return xe().prepare(`
    SELECT * FROM sync_queue 
    WHERE status = 'pending' 
    ORDER BY created_at ASC
    LIMIT ?
  `).all(e);
}
function t0(e) {
  xe().prepare(`
    UPDATE sync_queue SET status = 'processing', last_attempt_at = ? WHERE id = ?
  `).run(Ot(), e);
}
function r0(e) {
  xe().prepare("DELETE FROM sync_queue WHERE id = ?").run(e);
}
function n0(e, t) {
  xe().prepare(`
    UPDATE sync_queue 
    SET status = CASE WHEN attempts >= 5 THEN 'failed' ELSE 'pending' END,
        attempts = attempts + 1, 
        error = ?,
        last_attempt_at = ?
    WHERE id = ?
  `).run(t, Ot(), e);
}
function Vh() {
  return xe().prepare(`
    SELECT 
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
      COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
      COUNT(*) as total
    FROM sync_queue
  `).get();
}
function i0(e) {
  return xe().prepare(`
    SELECT value FROM sync_metadata WHERE key = ?
  `).get(e)?.value ?? null;
}
function a0(e, t) {
  xe().prepare(`
    INSERT OR REPLACE INTO sync_metadata (key, value, updated_at)
    VALUES (?, ?, ?)
  `).run(e, t, Ot());
}
function s0() {
  const e = i0("last_sync_time");
  return e ? parseInt(e, 10) : null;
}
function o0(e) {
  a0("last_sync_time", e.toString());
}
function u0(e, t) {
  const i = xe(), r = Jo(e);
  r && i.prepare(`
    UPDATE ${r} SET sync_status = 'conflict' WHERE id = ?
  `).run(t);
}
function Jo(e) {
  return {
    workspace: "workspaces",
    project: "projects",
    task: "tasks",
    tag: "tags",
    subtask: "subtasks",
    comment: "comments",
    pomodoro_session: "pomodoro_sessions"
  }[e] ?? null;
}
function l0(e, t) {
  const i = xe(), r = Jo(e);
  if (!r || t.length === 0) return;
  i.transaction(() => {
    for (const n of t) {
      const s = i.prepare(`SELECT id, local_updated_at FROM ${r} WHERE id = ?`).get(n.id);
      if (s)
        if (s.local_updated_at > n.updated_at)
          u0(e, n.id);
        else {
          const d = Object.keys(n).filter((a) => a !== "id").map((a) => `${a} = @${a}`).join(", ");
          i.prepare(`
            UPDATE ${r} 
            SET ${d}, is_synced = 1, sync_status = 'synced', server_updated_at = @updated_at
            WHERE id = @id
          `).run(n);
        }
      else {
        const d = Object.keys(n).join(", "), a = Object.keys(n).map((l) => `@${l}`).join(", ");
        i.prepare(`
          INSERT INTO ${r} (${d}, is_synced, sync_status, local_updated_at, server_updated_at)
          VALUES (${a}, 1, 'synced', @updated_at, @updated_at)
        `).run(n);
      }
    }
  })();
}
function c0(e, t, i) {
  const r = xe(), u = Jo(e);
  u && r.prepare(`
    UPDATE ${u} 
    SET is_synced = 1, sync_status = 'synced', server_updated_at = ?
    WHERE id = ?
  `).run(i, t);
}
const Xe = {
  status: "idle",
  lastSyncTime: null,
  pendingChanges: 0,
  failedChanges: 0,
  isOnline: !0
};
let Rr = null, pn = null, mn = "http://localhost:3001/api/v1", dr = null;
function d0(e, t) {
  pn = e, mn = t, Xe.lastSyncTime = s0(), Yh(), console.log("[SyncEngine] Initialized");
}
function f0(e) {
  dr = e, console.log("[SyncEngine] Auth token updated");
}
function h0(e = 3e4) {
  Rr && clearInterval(Rr), Rr = setInterval(() => {
    Xe.isOnline && dr && Qo();
  }, e), console.log(`[SyncEngine] Auto-sync started with interval ${e}ms`);
}
function zh() {
  Rr && (clearInterval(Rr), Rr = null), console.log("[SyncEngine] Auto-sync stopped");
}
function Yh() {
  const e = Vh();
  Xe.pendingChanges = e.pending, Xe.failedChanges = e.failed, Or();
}
function Or() {
  pn && !pn.isDestroyed() && pn.webContents.send("sync-state-changed", Xe);
}
function p0(e) {
  const t = !Xe.isOnline;
  Xe.isOnline = e, Xe.status = e ? "idle" : "offline", t && e && dr && Qo(), Or(), console.log(`[SyncEngine] Online status: ${e}`);
}
function sd() {
  return { ...Xe };
}
async function Qo() {
  if (Xe.status === "syncing") {
    console.log("[SyncEngine] Sync already in progress");
    return;
  }
  if (!dr) {
    console.log("[SyncEngine] No auth token, skipping sync");
    return;
  }
  if (!Xe.isOnline) {
    console.log("[SyncEngine] Offline, skipping sync");
    return;
  }
  try {
    Xe.status = "syncing", Xe.error = void 0, Or(), console.log("[SyncEngine] Starting sync..."), await m0(), await y0();
    const e = Date.now();
    o0(e), Xe.lastSyncTime = e, Xe.status = "idle", Yh(), console.log("[SyncEngine] Sync completed successfully");
  } catch (e) {
    console.error("[SyncEngine] Sync failed:", e), Xe.status = "error", Xe.error = e instanceof Error ? e.message : "Unknown error", Or();
  }
}
async function m0() {
  const e = e0(50);
  if (e.length === 0) {
    console.log("[SyncEngine] No pending changes to push");
    return;
  }
  console.log(`[SyncEngine] Pushing ${e.length} changes...`);
  for (const t of e)
    try {
      t0(t.id), Xe.currentOperation = `Syncing ${t.entity_type} ${t.operation}`, Or(), await g0(t) && r0(t.id);
    } catch (i) {
      const r = i instanceof Error ? i.message : "Unknown error";
      console.error(`[SyncEngine] Failed to push ${t.entity_type}:${t.entity_id}:`, r), n0(t.id, r);
    }
  Xe.currentOperation = void 0;
}
async function g0(e) {
  const t = Xh(e.entity_type);
  if (!t)
    return console.warn(`[SyncEngine] Unknown entity type: ${e.entity_type}`), !1;
  const i = e.payload ? JSON.parse(e.payload) : null;
  let r;
  switch (e.operation) {
    case "create":
      r = await fetch(`${mn}${t}`, {
        method: "POST",
        headers: Gi(),
        body: JSON.stringify(od(e.entity_type, i))
      });
      break;
    case "update":
      r = await fetch(`${mn}${t}/${e.entity_id}`, {
        method: "PATCH",
        headers: Gi(),
        body: JSON.stringify(od(e.entity_type, i))
      });
      break;
    case "delete":
      r = await fetch(`${mn}${t}/${e.entity_id}`, {
        method: "DELETE",
        headers: Gi()
      });
      break;
    default:
      return console.warn(`[SyncEngine] Unknown operation: ${e.operation}`), !1;
  }
  if (!r.ok) {
    const u = await r.text();
    throw new Error(`API error ${r.status}: ${u}`);
  }
  if (e.operation === "create" || e.operation === "update") {
    const u = await r.json();
    c0(e.entity_type, e.entity_id, u.updatedAt ? new Date(u.updatedAt).getTime() : Date.now());
  }
  return !0;
}
async function y0() {
  console.log("[SyncEngine] Pulling server changes...");
  const e = Xe.lastSyncTime, t = e ? new Date(e).toISOString() : void 0;
  await Ii("workspace", t), await Ii("project", t), await Ii("task", t), await Ii("pomodoro_session", t);
}
async function Ii(e, t) {
  const i = Xh(e);
  if (i)
    try {
      Xe.currentOperation = `Fetching ${e}s`, Or();
      let r = `${mn}${i}`;
      t && (r += `?updatedSince=${t}`);
      const u = await fetch(r, {
        method: "GET",
        headers: Gi()
      });
      if (!u.ok)
        throw new Error(`Failed to fetch ${e}s: ${u.status}`);
      const n = await u.json(), s = Array.isArray(n) ? n : n.data || n.items || [];
      if (s.length > 0) {
        console.log(`[SyncEngine] Received ${s.length} ${e}s from server`);
        const d = s.map((a) => _0(e, a));
        l0(e, d);
      }
    } catch (r) {
      console.error(`[SyncEngine] Failed to pull ${e}s:`, r);
    }
}
function Xh(e) {
  return {
    workspace: "/workspaces",
    project: "/projects",
    task: "/tasks",
    tag: "/tags",
    pomodoro_session: "/pomodoro-sessions"
  }[e] ?? null;
}
function Gi() {
  const e = {
    "Content-Type": "application/json"
  };
  return dr && (e.Authorization = `Bearer ${dr}`), e;
}
function od(e, t) {
  const { is_synced: i, sync_status: r, local_updated_at: u, server_updated_at: n, is_deleted: s, ...d } = t, a = {};
  for (const [l, o] of Object.entries(d))
    l.endsWith("_at") || l.endsWith("_date") ? a[ud(l)] = o ? new Date(o).toISOString() : null : l.includes("_") ? a[ud(l)] = o : a[l] = o;
  return a;
}
function _0(e, t) {
  const i = {};
  for (const [r, u] of Object.entries(t)) {
    const n = E0(r);
    n.endsWith("_at") || n.endsWith("_date") ? i[n] = u ? new Date(u).getTime() : null : i[n] = u;
  }
  return i;
}
function ud(e) {
  return e.replace(/_([a-z])/g, (t, i) => i.toUpperCase());
}
function E0(e) {
  return e.replace(/[A-Z]/g, (t) => `_${t.toLowerCase()}`);
}
function v0() {
  return Qo();
}
function w0() {
  zh(), pn = null, dr = null, console.log("[SyncEngine] Cleaned up");
}
const Ht = new Ko({
  defaults: {
    windowState: {
      width: 1200,
      height: 800,
      x: void 0,
      y: void 0,
      isMaximized: !1
    },
    settings: {
      minimizeToTray: !0,
      startMinimized: !1,
      alwaysOnTop: !1,
      shortcuts: Tr
    },
    theme: "system",
    locale: "es"
  }
});
function S0(e) {
  try {
    Gh(), d0(e, process.env.VITE_API_URL || "http://localhost:3001/api/v1"), console.log("[IPC] Database and Sync Engine initialized");
  } catch (t) {
    console.error("[IPC] Failed to initialize database:", t);
  }
  de.handle("minimize-window", () => {
    e.minimize();
  }), de.handle("maximize-window", () => {
    e.isMaximized() ? e.unmaximize() : e.maximize();
  }), de.handle("close-window", () => {
    Ht.get("settings.minimizeToTray", !0) ? e.hide() : e.close();
  }), de.handle("is-maximized", () => e.isMaximized()), de.handle("window:setAlwaysOnTop", (t, i) => (e.setAlwaysOnTop(i), Ht.set("settings.alwaysOnTop", i), i)), de.handle("window:isAlwaysOnTop", () => e.isAlwaysOnTop()), de.handle("window:show", () => {
    e.show(), e.focus();
  }), de.handle("window:hide", () => {
    e.hide();
  }), de.handle("tray:update", (t, i) => {
    Au(e, i);
  }), de.handle("notification:show", (t, i) => vt(i) !== null), de.handle("notification:pomodoroComplete", () => {
    jr.pomodoroComplete(e);
  }), de.handle("notification:shortBreakComplete", () => {
    jr.shortBreakComplete(e);
  }), de.handle("notification:longBreakComplete", () => {
    jr.longBreakComplete(e);
  }), de.handle("notification:taskDue", (t, i) => {
    jr.taskDue(e, i);
  }), de.handle("notification:taskReminder", (t, i, r) => {
    jr.taskReminder(e, i, r);
  }), de.handle("shortcuts:getAll", () => Pm()), de.handle("shortcuts:getDefaults", () => Tr), de.handle("shortcuts:update", (t, i, r) => Cm(e, i, r)), de.handle("shortcuts:reset", () => (Ph(e, Tr), Ht.set("settings.shortcuts", Tr), Tr)), de.handle("store:get", (t, i) => Ht.get(i)), de.handle("store:set", (t, i, r) => (Ht.set(i, r), !0)), de.handle("store:delete", (t, i) => (Ht.delete(i), !0)), de.handle("store:clear", () => (Ht.clear(), !0)), de.handle("app:getVersion", () => Ne.getVersion()), de.handle("app:getName", () => Ne.getName()), de.handle("app:getPath", (t, i) => Ne.getPath(i)), de.handle("app:isPackaged", () => Ne.isPackaged), de.on("timer:stateUpdate", (t, i) => {
    Au(e, i);
  }), de.handle("db:task:create", (t, i) => My(i)), de.handle("db:task:update", (t, i, r) => jy(i, r)), de.handle("db:task:delete", (t, i, r) => By(i, r !== !1)), de.handle("db:task:getById", (t, i) => Do(i)), de.handle("db:task:getByWorkspace", (t, i) => Hy(i)), de.handle("db:task:getByProject", (t, i) => Gy(i)), de.handle("db:task:getPending", (t, i) => Vy(i)), de.handle("db:task:getUnsynced", () => zy()), de.handle("db:workspace:create", (t, i) => Yy(i)), de.handle("db:workspace:getAll", () => Xy()), de.handle("db:workspace:getById", (t, i) => Wy(i)), de.handle("db:project:create", (t, i) => Ky(i)), de.handle("db:project:getByWorkspace", (t, i) => Jy(i)), de.handle("db:session:create", (t, i) => Qy(i)), de.handle("db:session:getByWorkspace", (t, i, r, u) => Zy(i, r, u)), de.handle("sync:setAuthToken", (t, i) => (f0(i), !0)), de.handle("sync:startAuto", (t, i) => (h0(i), !0)), de.handle("sync:stopAuto", () => (zh(), !0)), de.handle("sync:setOnlineStatus", (t, i) => (p0(i), !0)), de.handle("sync:getState", () => sd()), de.handle("sync:force", async () => (await v0(), sd())), de.handle("sync:getQueueStats", () => Vh());
}
function ld() {
  return Ht;
}
function T0() {
  de.removeAllListeners(), xo(), w0(), xy();
}
const Vi = new Ko({
  defaults: {
    windowState: {
      width: 1200,
      height: 800,
      isMaximized: !1
    }
  }
});
function b0() {
  const e = Vi.get("windowState");
  return e.x !== void 0 && e.y !== void 0 && !bh.getAllDisplays().some((r) => {
    const u = r.bounds;
    return e.x >= u.x && e.x < u.x + u.width && e.y >= u.y && e.y < u.y + u.height;
  }) ? {
    width: e.width,
    height: e.height,
    isMaximized: e.isMaximized
  } : e;
}
function Br(e) {
  if (!e) return;
  if (e.isMaximized()) {
    const i = Vi.get("windowState");
    Vi.set("windowState", {
      ...i,
      isMaximized: !0
    });
  } else {
    const i = e.getBounds();
    Vi.set("windowState", {
      x: i.x,
      y: i.y,
      width: i.width,
      height: i.height,
      isMaximized: !1
    });
  }
}
function R0(e) {
  let t = null;
  e.on("resize", () => {
    t && clearTimeout(t), t = setTimeout(() => {
      Br(e);
    }, 500);
  });
  let i = null;
  e.on("move", () => {
    i && clearTimeout(i), i = setTimeout(() => {
      Br(e);
    }, 500);
  }), e.on("maximize", () => {
    Br(e);
  }), e.on("unmaximize", () => {
    Br(e);
  }), e.on("close", () => {
    Br(e);
  });
}
let je = null, Gt = null;
const Wh = 280, A0 = 120;
function O0() {
  const e = bh.getPrimaryDisplay(), { width: t, height: i } = e.workAreaSize;
  return {
    x: t - Wh - 20,
    y: 20
  };
}
function N0(e) {
  Gt = e;
  const { x: t, y: i } = O0();
  je = new Lo({
    width: Wh,
    height: A0,
    x: t,
    y: i,
    frame: !1,
    transparent: !0,
    alwaysOnTop: !0,
    skipTaskbar: !0,
    resizable: !1,
    movable: !0,
    focusable: !0,
    show: !1,
    hasShadow: !0,
    vibrancy: process.platform === "darwin" ? "popover" : void 0,
    visualEffectState: "active",
    titleBarStyle: "hidden",
    webPreferences: {
      preload: st.join(__dirname, "preload.js"),
      nodeIntegration: !1,
      contextIsolation: !0
    }
  });
  const r = process.env.VITE_DEV_SERVER_URL;
  return r ? je.loadURL(`${r}#/timer-floating`) : je.loadFile(st.join(process.env.DIST, "index.html"), {
    hash: "/timer-floating"
  }), je.on("close", (u) => {
    Ne.isQuitting || (u.preventDefault(), je?.hide());
  }), je;
}
function P0() {
  je && je.show();
}
function cd() {
  je && je.hide();
}
function C0() {
  je && (je.isVisible() ? je.hide() : je.show());
}
function dd() {
  return je?.isVisible() ?? !1;
}
function I0() {
  je && (je.destroy(), je = null);
}
function D0(e) {
  je && !je.isDestroyed() && je.webContents.send("timer-window:state-update", e);
}
function $0(e, t) {
  je && je.setPosition(e, t);
}
function k0() {
  if (je) {
    const [e, t] = je.getPosition();
    return { x: e, y: t };
  }
  return null;
}
function L0() {
  de.handle("timer-window:show", () => {
    P0();
  }), de.handle("timer-window:hide", () => {
    cd();
  }), de.handle("timer-window:toggle", () => (C0(), dd())), de.handle("timer-window:isVisible", () => dd()), de.handle("timer-window:setPosition", (e, t, i) => {
    $0(t, i);
  }), de.handle("timer-window:getPosition", () => k0()), de.handle("timer-window:action", (e, t) => {
    Gt && !Gt.isDestroyed() && Gt.webContents.send("timer-window:action", t);
  }), de.handle("timer-window:expand", () => {
    Gt && !Gt.isDestroyed() && (Gt.show(), Gt.focus()), cd();
  }), de.on("timer:stateUpdate", (e, t) => {
    D0(t);
  });
}
function F0() {
  de.removeHandler("timer-window:show"), de.removeHandler("timer-window:hide"), de.removeHandler("timer-window:toggle"), de.removeHandler("timer-window:isVisible"), de.removeHandler("timer-window:setPosition"), de.removeHandler("timer-window:getPosition"), de.removeHandler("timer-window:action"), de.removeHandler("timer-window:expand");
}
const Ft = "ordo";
let pt = null, gn = null;
function U0(e) {
  try {
    const i = e.replace(`${Ft}://`, "").split("/"), [r, u, n] = i, s = {};
    if (u?.includes("?")) {
      const [d, a] = u.split("?");
      return new URLSearchParams(a).forEach((o, f) => {
        s[f] = o;
      }), {
        type: fd(r),
        id: d,
        action: n,
        params: Object.keys(s).length > 0 ? s : void 0
      };
    }
    return {
      type: fd(r),
      id: u || void 0,
      action: n || void 0,
      params: Object.keys(s).length > 0 ? s : void 0
    };
  } catch (t) {
    return console.error("[DeepLinks] Failed to parse URL:", e, t), { type: "unknown" };
  }
}
function fd(e) {
  return ["task", "project", "workspace", "timer", "settings"].includes(e) ? e : "unknown";
}
function $o(e) {
  if (console.log("[DeepLinks] Handling URL:", e), !pt || pt.isDestroyed()) {
    gn = e;
    return;
  }
  const t = U0(e);
  console.log("[DeepLinks] Parsed data:", t), pt.isMinimized() && pt.restore(), pt.show(), pt.focus(), pt.webContents.send("deep-link", t);
}
function q0() {
  gn && ($o(gn), gn = null);
}
function x0(e) {
  if (pt = e, process.defaultApp ? process.argv.length >= 2 && Ne.setAsDefaultProtocolClient(Ft, process.execPath, [process.argv[1]]) : Ne.setAsDefaultProtocolClient(Ft), !Ne.requestSingleInstanceLock()) {
    Ne.quit();
    return;
  }
  Ne.on("second-instance", (r, u) => {
    pt && (pt.isMinimized() && pt.restore(), pt.focus());
    const n = u.find((s) => s.startsWith(`${Ft}://`));
    n && $o(n);
  }), Ne.on("open-url", (r, u) => {
    r.preventDefault(), $o(u);
  });
  const i = process.argv.find((r) => r.startsWith(`${Ft}://`));
  i && (gn = i), console.log(`[DeepLinks] Protocol "${Ft}://" registered`);
}
function M0() {
  process.defaultApp ? process.argv.length >= 2 && Ne.removeAsDefaultProtocolClient(Ft, process.execPath, [process.argv[1]]) : Ne.removeAsDefaultProtocolClient(Ft), console.log(`[DeepLinks] Protocol "${Ft}://" unregistered`);
}
var sr = {}, vs = {}, Di = {}, hd;
function dt() {
  return hd || (hd = 1, Di.fromCallback = function(e) {
    return Object.defineProperty(function(...t) {
      if (typeof t[t.length - 1] == "function") e.apply(this, t);
      else
        return new Promise((i, r) => {
          t.push((u, n) => u != null ? r(u) : i(n)), e.apply(this, t);
        });
    }, "name", { value: e.name });
  }, Di.fromPromise = function(e) {
    return Object.defineProperty(function(...t) {
      const i = t[t.length - 1];
      if (typeof i != "function") return e.apply(this, t);
      t.pop(), e.apply(this, t).then((r) => i(null, r), i);
    }, "name", { value: e.name });
  }), Di;
}
var ws, pd;
function j0() {
  if (pd) return ws;
  pd = 1;
  var e = wm, t = process.cwd, i = null, r = process.env.GRACEFUL_FS_PLATFORM || process.platform;
  process.cwd = function() {
    return i || (i = t.call(process)), i;
  };
  try {
    process.cwd();
  } catch {
  }
  if (typeof process.chdir == "function") {
    var u = process.chdir;
    process.chdir = function(s) {
      i = null, u.call(process, s);
    }, Object.setPrototypeOf && Object.setPrototypeOf(process.chdir, u);
  }
  ws = n;
  function n(s) {
    e.hasOwnProperty("O_SYMLINK") && process.version.match(/^v0\.6\.[0-2]|^v0\.5\./) && d(s), s.lutimes || a(s), s.chown = f(s.chown), s.fchown = f(s.fchown), s.lchown = f(s.lchown), s.chmod = l(s.chmod), s.fchmod = l(s.fchmod), s.lchmod = l(s.lchmod), s.chownSync = c(s.chownSync), s.fchownSync = c(s.fchownSync), s.lchownSync = c(s.lchownSync), s.chmodSync = o(s.chmodSync), s.fchmodSync = o(s.fchmodSync), s.lchmodSync = o(s.lchmodSync), s.stat = p(s.stat), s.fstat = p(s.fstat), s.lstat = p(s.lstat), s.statSync = y(s.statSync), s.fstatSync = y(s.fstatSync), s.lstatSync = y(s.lstatSync), s.chmod && !s.lchmod && (s.lchmod = function(h, _, g) {
      g && process.nextTick(g);
    }, s.lchmodSync = function() {
    }), s.chown && !s.lchown && (s.lchown = function(h, _, g, w) {
      w && process.nextTick(w);
    }, s.lchownSync = function() {
    }), r === "win32" && (s.rename = typeof s.rename != "function" ? s.rename : (function(h) {
      function _(g, w, b) {
        var R = Date.now(), v = 0;
        h(g, w, function S(O) {
          if (O && (O.code === "EACCES" || O.code === "EPERM" || O.code === "EBUSY") && Date.now() - R < 6e4) {
            setTimeout(function() {
              s.stat(w, function(T, $) {
                T && T.code === "ENOENT" ? h(g, w, S) : b(O);
              });
            }, v), v < 100 && (v += 10);
            return;
          }
          b && b(O);
        });
      }
      return Object.setPrototypeOf && Object.setPrototypeOf(_, h), _;
    })(s.rename)), s.read = typeof s.read != "function" ? s.read : (function(h) {
      function _(g, w, b, R, v, S) {
        var O;
        if (S && typeof S == "function") {
          var T = 0;
          O = function($, k, U) {
            if ($ && $.code === "EAGAIN" && T < 10)
              return T++, h.call(s, g, w, b, R, v, O);
            S.apply(this, arguments);
          };
        }
        return h.call(s, g, w, b, R, v, O);
      }
      return Object.setPrototypeOf && Object.setPrototypeOf(_, h), _;
    })(s.read), s.readSync = typeof s.readSync != "function" ? s.readSync : /* @__PURE__ */ (function(h) {
      return function(_, g, w, b, R) {
        for (var v = 0; ; )
          try {
            return h.call(s, _, g, w, b, R);
          } catch (S) {
            if (S.code === "EAGAIN" && v < 10) {
              v++;
              continue;
            }
            throw S;
          }
      };
    })(s.readSync);
    function d(h) {
      h.lchmod = function(_, g, w) {
        h.open(
          _,
          e.O_WRONLY | e.O_SYMLINK,
          g,
          function(b, R) {
            if (b) {
              w && w(b);
              return;
            }
            h.fchmod(R, g, function(v) {
              h.close(R, function(S) {
                w && w(v || S);
              });
            });
          }
        );
      }, h.lchmodSync = function(_, g) {
        var w = h.openSync(_, e.O_WRONLY | e.O_SYMLINK, g), b = !0, R;
        try {
          R = h.fchmodSync(w, g), b = !1;
        } finally {
          if (b)
            try {
              h.closeSync(w);
            } catch {
            }
          else
            h.closeSync(w);
        }
        return R;
      };
    }
    function a(h) {
      e.hasOwnProperty("O_SYMLINK") && h.futimes ? (h.lutimes = function(_, g, w, b) {
        h.open(_, e.O_SYMLINK, function(R, v) {
          if (R) {
            b && b(R);
            return;
          }
          h.futimes(v, g, w, function(S) {
            h.close(v, function(O) {
              b && b(S || O);
            });
          });
        });
      }, h.lutimesSync = function(_, g, w) {
        var b = h.openSync(_, e.O_SYMLINK), R, v = !0;
        try {
          R = h.futimesSync(b, g, w), v = !1;
        } finally {
          if (v)
            try {
              h.closeSync(b);
            } catch {
            }
          else
            h.closeSync(b);
        }
        return R;
      }) : h.futimes && (h.lutimes = function(_, g, w, b) {
        b && process.nextTick(b);
      }, h.lutimesSync = function() {
      });
    }
    function l(h) {
      return h && function(_, g, w) {
        return h.call(s, _, g, function(b) {
          E(b) && (b = null), w && w.apply(this, arguments);
        });
      };
    }
    function o(h) {
      return h && function(_, g) {
        try {
          return h.call(s, _, g);
        } catch (w) {
          if (!E(w)) throw w;
        }
      };
    }
    function f(h) {
      return h && function(_, g, w, b) {
        return h.call(s, _, g, w, function(R) {
          E(R) && (R = null), b && b.apply(this, arguments);
        });
      };
    }
    function c(h) {
      return h && function(_, g, w) {
        try {
          return h.call(s, _, g, w);
        } catch (b) {
          if (!E(b)) throw b;
        }
      };
    }
    function p(h) {
      return h && function(_, g, w) {
        typeof g == "function" && (w = g, g = null);
        function b(R, v) {
          v && (v.uid < 0 && (v.uid += 4294967296), v.gid < 0 && (v.gid += 4294967296)), w && w.apply(this, arguments);
        }
        return g ? h.call(s, _, g, b) : h.call(s, _, b);
      };
    }
    function y(h) {
      return h && function(_, g) {
        var w = g ? h.call(s, _, g) : h.call(s, _);
        return w && (w.uid < 0 && (w.uid += 4294967296), w.gid < 0 && (w.gid += 4294967296)), w;
      };
    }
    function E(h) {
      if (!h || h.code === "ENOSYS")
        return !0;
      var _ = !process.getuid || process.getuid() !== 0;
      return !!(_ && (h.code === "EINVAL" || h.code === "EPERM"));
    }
  }
  return ws;
}
var Ss, md;
function B0() {
  if (md) return Ss;
  md = 1;
  var e = En.Stream;
  Ss = t;
  function t(i) {
    return {
      ReadStream: r,
      WriteStream: u
    };
    function r(n, s) {
      if (!(this instanceof r)) return new r(n, s);
      e.call(this);
      var d = this;
      this.path = n, this.fd = null, this.readable = !0, this.paused = !1, this.flags = "r", this.mode = 438, this.bufferSize = 64 * 1024, s = s || {};
      for (var a = Object.keys(s), l = 0, o = a.length; l < o; l++) {
        var f = a[l];
        this[f] = s[f];
      }
      if (this.encoding && this.setEncoding(this.encoding), this.start !== void 0) {
        if (typeof this.start != "number")
          throw TypeError("start must be a Number");
        if (this.end === void 0)
          this.end = 1 / 0;
        else if (typeof this.end != "number")
          throw TypeError("end must be a Number");
        if (this.start > this.end)
          throw new Error("start must be <= end");
        this.pos = this.start;
      }
      if (this.fd !== null) {
        process.nextTick(function() {
          d._read();
        });
        return;
      }
      i.open(this.path, this.flags, this.mode, function(c, p) {
        if (c) {
          d.emit("error", c), d.readable = !1;
          return;
        }
        d.fd = p, d.emit("open", p), d._read();
      });
    }
    function u(n, s) {
      if (!(this instanceof u)) return new u(n, s);
      e.call(this), this.path = n, this.fd = null, this.writable = !0, this.flags = "w", this.encoding = "binary", this.mode = 438, this.bytesWritten = 0, s = s || {};
      for (var d = Object.keys(s), a = 0, l = d.length; a < l; a++) {
        var o = d[a];
        this[o] = s[o];
      }
      if (this.start !== void 0) {
        if (typeof this.start != "number")
          throw TypeError("start must be a Number");
        if (this.start < 0)
          throw new Error("start must be >= zero");
        this.pos = this.start;
      }
      this.busy = !1, this._queue = [], this.fd === null && (this._open = i.open, this._queue.push([this._open, this.path, this.flags, this.mode, void 0]), this.flush());
    }
  }
  return Ss;
}
var Ts, gd;
function H0() {
  if (gd) return Ts;
  gd = 1, Ts = t;
  var e = Object.getPrototypeOf || function(i) {
    return i.__proto__;
  };
  function t(i) {
    if (i === null || typeof i != "object")
      return i;
    if (i instanceof Object)
      var r = { __proto__: e(i) };
    else
      var r = /* @__PURE__ */ Object.create(null);
    return Object.getOwnPropertyNames(i).forEach(function(u) {
      Object.defineProperty(r, u, Object.getOwnPropertyDescriptor(i, u));
    }), r;
  }
  return Ts;
}
var $i, yd;
function ot() {
  if (yd) return $i;
  yd = 1;
  var e = Tt, t = j0(), i = B0(), r = H0(), u = yn, n, s;
  typeof Symbol == "function" && typeof Symbol.for == "function" ? (n = Symbol.for("graceful-fs.queue"), s = Symbol.for("graceful-fs.previous")) : (n = "___graceful-fs.queue", s = "___graceful-fs.previous");
  function d() {
  }
  function a(h, _) {
    Object.defineProperty(h, n, {
      get: function() {
        return _;
      }
    });
  }
  var l = d;
  if (u.debuglog ? l = u.debuglog("gfs4") : /\bgfs4\b/i.test(process.env.NODE_DEBUG || "") && (l = function() {
    var h = u.format.apply(u, arguments);
    h = "GFS4: " + h.split(/\n/).join(`
GFS4: `), console.error(h);
  }), !e[n]) {
    var o = St[n] || [];
    a(e, o), e.close = (function(h) {
      function _(g, w) {
        return h.call(e, g, function(b) {
          b || y(), typeof w == "function" && w.apply(this, arguments);
        });
      }
      return Object.defineProperty(_, s, {
        value: h
      }), _;
    })(e.close), e.closeSync = (function(h) {
      function _(g) {
        h.apply(e, arguments), y();
      }
      return Object.defineProperty(_, s, {
        value: h
      }), _;
    })(e.closeSync), /\bgfs4\b/i.test(process.env.NODE_DEBUG || "") && process.on("exit", function() {
      l(e[n]), Fo.equal(e[n].length, 0);
    });
  }
  St[n] || a(St, e[n]), $i = f(r(e)), process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !e.__patched && ($i = f(e), e.__patched = !0);
  function f(h) {
    t(h), h.gracefulify = f, h.createReadStream = x, h.createWriteStream = X;
    var _ = h.readFile;
    h.readFile = g;
    function g(C, K, N) {
      return typeof K == "function" && (N = K, K = null), A(C, K, N);
      function A(J, M, q, z) {
        return _(J, M, function(Q) {
          Q && (Q.code === "EMFILE" || Q.code === "ENFILE") ? c([A, [J, M, q], Q, z || Date.now(), Date.now()]) : typeof q == "function" && q.apply(this, arguments);
        });
      }
    }
    var w = h.writeFile;
    h.writeFile = b;
    function b(C, K, N, A) {
      return typeof N == "function" && (A = N, N = null), J(C, K, N, A);
      function J(M, q, z, Q, re) {
        return w(M, q, z, function(le) {
          le && (le.code === "EMFILE" || le.code === "ENFILE") ? c([J, [M, q, z, Q], le, re || Date.now(), Date.now()]) : typeof Q == "function" && Q.apply(this, arguments);
        });
      }
    }
    var R = h.appendFile;
    R && (h.appendFile = v);
    function v(C, K, N, A) {
      return typeof N == "function" && (A = N, N = null), J(C, K, N, A);
      function J(M, q, z, Q, re) {
        return R(M, q, z, function(le) {
          le && (le.code === "EMFILE" || le.code === "ENFILE") ? c([J, [M, q, z, Q], le, re || Date.now(), Date.now()]) : typeof Q == "function" && Q.apply(this, arguments);
        });
      }
    }
    var S = h.copyFile;
    S && (h.copyFile = O);
    function O(C, K, N, A) {
      return typeof N == "function" && (A = N, N = 0), J(C, K, N, A);
      function J(M, q, z, Q, re) {
        return S(M, q, z, function(le) {
          le && (le.code === "EMFILE" || le.code === "ENFILE") ? c([J, [M, q, z, Q], le, re || Date.now(), Date.now()]) : typeof Q == "function" && Q.apply(this, arguments);
        });
      }
    }
    var T = h.readdir;
    h.readdir = k;
    var $ = /^v[0-5]\./;
    function k(C, K, N) {
      typeof K == "function" && (N = K, K = null);
      var A = $.test(process.version) ? function(q, z, Q, re) {
        return T(q, J(
          q,
          z,
          Q,
          re
        ));
      } : function(q, z, Q, re) {
        return T(q, z, J(
          q,
          z,
          Q,
          re
        ));
      };
      return A(C, K, N);
      function J(M, q, z, Q) {
        return function(re, le) {
          re && (re.code === "EMFILE" || re.code === "ENFILE") ? c([
            A,
            [M, q, z],
            re,
            Q || Date.now(),
            Date.now()
          ]) : (le && le.sort && le.sort(), typeof z == "function" && z.call(this, re, le));
        };
      }
    }
    if (process.version.substr(0, 4) === "v0.8") {
      var U = i(h);
      j = U.ReadStream, Y = U.WriteStream;
    }
    var V = h.ReadStream;
    V && (j.prototype = Object.create(V.prototype), j.prototype.open = H);
    var L = h.WriteStream;
    L && (Y.prototype = Object.create(L.prototype), Y.prototype.open = F), Object.defineProperty(h, "ReadStream", {
      get: function() {
        return j;
      },
      set: function(C) {
        j = C;
      },
      enumerable: !0,
      configurable: !0
    }), Object.defineProperty(h, "WriteStream", {
      get: function() {
        return Y;
      },
      set: function(C) {
        Y = C;
      },
      enumerable: !0,
      configurable: !0
    });
    var B = j;
    Object.defineProperty(h, "FileReadStream", {
      get: function() {
        return B;
      },
      set: function(C) {
        B = C;
      },
      enumerable: !0,
      configurable: !0
    });
    var te = Y;
    Object.defineProperty(h, "FileWriteStream", {
      get: function() {
        return te;
      },
      set: function(C) {
        te = C;
      },
      enumerable: !0,
      configurable: !0
    });
    function j(C, K) {
      return this instanceof j ? (V.apply(this, arguments), this) : j.apply(Object.create(j.prototype), arguments);
    }
    function H() {
      var C = this;
      P(C.path, C.flags, C.mode, function(K, N) {
        K ? (C.autoClose && C.destroy(), C.emit("error", K)) : (C.fd = N, C.emit("open", N), C.read());
      });
    }
    function Y(C, K) {
      return this instanceof Y ? (L.apply(this, arguments), this) : Y.apply(Object.create(Y.prototype), arguments);
    }
    function F() {
      var C = this;
      P(C.path, C.flags, C.mode, function(K, N) {
        K ? (C.destroy(), C.emit("error", K)) : (C.fd = N, C.emit("open", N));
      });
    }
    function x(C, K) {
      return new h.ReadStream(C, K);
    }
    function X(C, K) {
      return new h.WriteStream(C, K);
    }
    var G = h.open;
    h.open = P;
    function P(C, K, N, A) {
      return typeof N == "function" && (A = N, N = null), J(C, K, N, A);
      function J(M, q, z, Q, re) {
        return G(M, q, z, function(le, Se) {
          le && (le.code === "EMFILE" || le.code === "ENFILE") ? c([J, [M, q, z, Q], le, re || Date.now(), Date.now()]) : typeof Q == "function" && Q.apply(this, arguments);
        });
      }
    }
    return h;
  }
  function c(h) {
    l("ENQUEUE", h[0].name, h[1]), e[n].push(h), E();
  }
  var p;
  function y() {
    for (var h = Date.now(), _ = 0; _ < e[n].length; ++_)
      e[n][_].length > 2 && (e[n][_][3] = h, e[n][_][4] = h);
    E();
  }
  function E() {
    if (clearTimeout(p), p = void 0, e[n].length !== 0) {
      var h = e[n].shift(), _ = h[0], g = h[1], w = h[2], b = h[3], R = h[4];
      if (b === void 0)
        l("RETRY", _.name, g), _.apply(null, g);
      else if (Date.now() - b >= 6e4) {
        l("TIMEOUT", _.name, g);
        var v = g.pop();
        typeof v == "function" && v.call(null, w);
      } else {
        var S = Date.now() - R, O = Math.max(R - b, 1), T = Math.min(O * 1.2, 100);
        S >= T ? (l("RETRY", _.name, g), _.apply(null, g.concat([b]))) : e[n].push(h);
      }
      p === void 0 && (p = setTimeout(E, 0));
    }
  }
  return $i;
}
var _d;
function Dr() {
  return _d || (_d = 1, (function(e) {
    const t = dt().fromCallback, i = ot(), r = [
      "access",
      "appendFile",
      "chmod",
      "chown",
      "close",
      "copyFile",
      "fchmod",
      "fchown",
      "fdatasync",
      "fstat",
      "fsync",
      "ftruncate",
      "futimes",
      "lchmod",
      "lchown",
      "link",
      "lstat",
      "mkdir",
      "mkdtemp",
      "open",
      "opendir",
      "readdir",
      "readFile",
      "readlink",
      "realpath",
      "rename",
      "rm",
      "rmdir",
      "stat",
      "symlink",
      "truncate",
      "unlink",
      "utimes",
      "writeFile"
    ].filter((u) => typeof i[u] == "function");
    Object.assign(e, i), r.forEach((u) => {
      e[u] = t(i[u]);
    }), e.exists = function(u, n) {
      return typeof n == "function" ? i.exists(u, n) : new Promise((s) => i.exists(u, s));
    }, e.read = function(u, n, s, d, a, l) {
      return typeof l == "function" ? i.read(u, n, s, d, a, l) : new Promise((o, f) => {
        i.read(u, n, s, d, a, (c, p, y) => {
          if (c) return f(c);
          o({ bytesRead: p, buffer: y });
        });
      });
    }, e.write = function(u, n, ...s) {
      return typeof s[s.length - 1] == "function" ? i.write(u, n, ...s) : new Promise((d, a) => {
        i.write(u, n, ...s, (l, o, f) => {
          if (l) return a(l);
          d({ bytesWritten: o, buffer: f });
        });
      });
    }, typeof i.writev == "function" && (e.writev = function(u, n, ...s) {
      return typeof s[s.length - 1] == "function" ? i.writev(u, n, ...s) : new Promise((d, a) => {
        i.writev(u, n, ...s, (l, o, f) => {
          if (l) return a(l);
          d({ bytesWritten: o, buffers: f });
        });
      });
    }), typeof i.realpath.native == "function" ? e.realpath.native = t(i.realpath.native) : process.emitWarning(
      "fs.realpath.native is not a function. Is fs being monkey-patched?",
      "Warning",
      "fs-extra-WARN0003"
    );
  })(vs)), vs;
}
var ki = {}, bs = {}, Ed;
function G0() {
  if (Ed) return bs;
  Ed = 1;
  const e = $e;
  return bs.checkPath = function(i) {
    if (process.platform === "win32" && /[<>:"|?*]/.test(i.replace(e.parse(i).root, ""))) {
      const u = new Error(`Path contains invalid characters: ${i}`);
      throw u.code = "EINVAL", u;
    }
  }, bs;
}
var vd;
function V0() {
  if (vd) return ki;
  vd = 1;
  const e = /* @__PURE__ */ Dr(), { checkPath: t } = /* @__PURE__ */ G0(), i = (r) => {
    const u = { mode: 511 };
    return typeof r == "number" ? r : { ...u, ...r }.mode;
  };
  return ki.makeDir = async (r, u) => (t(r), e.mkdir(r, {
    mode: i(u),
    recursive: !0
  })), ki.makeDirSync = (r, u) => (t(r), e.mkdirSync(r, {
    mode: i(u),
    recursive: !0
  })), ki;
}
var Rs, wd;
function Nt() {
  if (wd) return Rs;
  wd = 1;
  const e = dt().fromPromise, { makeDir: t, makeDirSync: i } = /* @__PURE__ */ V0(), r = e(t);
  return Rs = {
    mkdirs: r,
    mkdirsSync: i,
    // alias
    mkdirp: r,
    mkdirpSync: i,
    ensureDir: r,
    ensureDirSync: i
  }, Rs;
}
var As, Sd;
function fr() {
  if (Sd) return As;
  Sd = 1;
  const e = dt().fromPromise, t = /* @__PURE__ */ Dr();
  function i(r) {
    return t.access(r).then(() => !0).catch(() => !1);
  }
  return As = {
    pathExists: e(i),
    pathExistsSync: t.existsSync
  }, As;
}
var Os, Td;
function Kh() {
  if (Td) return Os;
  Td = 1;
  const e = ot();
  function t(r, u, n, s) {
    e.open(r, "r+", (d, a) => {
      if (d) return s(d);
      e.futimes(a, u, n, (l) => {
        e.close(a, (o) => {
          s && s(l || o);
        });
      });
    });
  }
  function i(r, u, n) {
    const s = e.openSync(r, "r+");
    return e.futimesSync(s, u, n), e.closeSync(s);
  }
  return Os = {
    utimesMillis: t,
    utimesMillisSync: i
  }, Os;
}
var Ns, bd;
function $r() {
  if (bd) return Ns;
  bd = 1;
  const e = /* @__PURE__ */ Dr(), t = $e, i = yn;
  function r(c, p, y) {
    const E = y.dereference ? (h) => e.stat(h, { bigint: !0 }) : (h) => e.lstat(h, { bigint: !0 });
    return Promise.all([
      E(c),
      E(p).catch((h) => {
        if (h.code === "ENOENT") return null;
        throw h;
      })
    ]).then(([h, _]) => ({ srcStat: h, destStat: _ }));
  }
  function u(c, p, y) {
    let E;
    const h = y.dereference ? (g) => e.statSync(g, { bigint: !0 }) : (g) => e.lstatSync(g, { bigint: !0 }), _ = h(c);
    try {
      E = h(p);
    } catch (g) {
      if (g.code === "ENOENT") return { srcStat: _, destStat: null };
      throw g;
    }
    return { srcStat: _, destStat: E };
  }
  function n(c, p, y, E, h) {
    i.callbackify(r)(c, p, E, (_, g) => {
      if (_) return h(_);
      const { srcStat: w, destStat: b } = g;
      if (b) {
        if (l(w, b)) {
          const R = t.basename(c), v = t.basename(p);
          return y === "move" && R !== v && R.toLowerCase() === v.toLowerCase() ? h(null, { srcStat: w, destStat: b, isChangingCase: !0 }) : h(new Error("Source and destination must not be the same."));
        }
        if (w.isDirectory() && !b.isDirectory())
          return h(new Error(`Cannot overwrite non-directory '${p}' with directory '${c}'.`));
        if (!w.isDirectory() && b.isDirectory())
          return h(new Error(`Cannot overwrite directory '${p}' with non-directory '${c}'.`));
      }
      return w.isDirectory() && o(c, p) ? h(new Error(f(c, p, y))) : h(null, { srcStat: w, destStat: b });
    });
  }
  function s(c, p, y, E) {
    const { srcStat: h, destStat: _ } = u(c, p, E);
    if (_) {
      if (l(h, _)) {
        const g = t.basename(c), w = t.basename(p);
        if (y === "move" && g !== w && g.toLowerCase() === w.toLowerCase())
          return { srcStat: h, destStat: _, isChangingCase: !0 };
        throw new Error("Source and destination must not be the same.");
      }
      if (h.isDirectory() && !_.isDirectory())
        throw new Error(`Cannot overwrite non-directory '${p}' with directory '${c}'.`);
      if (!h.isDirectory() && _.isDirectory())
        throw new Error(`Cannot overwrite directory '${p}' with non-directory '${c}'.`);
    }
    if (h.isDirectory() && o(c, p))
      throw new Error(f(c, p, y));
    return { srcStat: h, destStat: _ };
  }
  function d(c, p, y, E, h) {
    const _ = t.resolve(t.dirname(c)), g = t.resolve(t.dirname(y));
    if (g === _ || g === t.parse(g).root) return h();
    e.stat(g, { bigint: !0 }, (w, b) => w ? w.code === "ENOENT" ? h() : h(w) : l(p, b) ? h(new Error(f(c, y, E))) : d(c, p, g, E, h));
  }
  function a(c, p, y, E) {
    const h = t.resolve(t.dirname(c)), _ = t.resolve(t.dirname(y));
    if (_ === h || _ === t.parse(_).root) return;
    let g;
    try {
      g = e.statSync(_, { bigint: !0 });
    } catch (w) {
      if (w.code === "ENOENT") return;
      throw w;
    }
    if (l(p, g))
      throw new Error(f(c, y, E));
    return a(c, p, _, E);
  }
  function l(c, p) {
    return p.ino && p.dev && p.ino === c.ino && p.dev === c.dev;
  }
  function o(c, p) {
    const y = t.resolve(c).split(t.sep).filter((h) => h), E = t.resolve(p).split(t.sep).filter((h) => h);
    return y.reduce((h, _, g) => h && E[g] === _, !0);
  }
  function f(c, p, y) {
    return `Cannot ${y} '${c}' to a subdirectory of itself, '${p}'.`;
  }
  return Ns = {
    checkPaths: n,
    checkPathsSync: s,
    checkParentPaths: d,
    checkParentPathsSync: a,
    isSrcSubdir: o,
    areIdentical: l
  }, Ns;
}
var Ps, Rd;
function z0() {
  if (Rd) return Ps;
  Rd = 1;
  const e = ot(), t = $e, i = Nt().mkdirs, r = fr().pathExists, u = Kh().utimesMillis, n = /* @__PURE__ */ $r();
  function s(k, U, V, L) {
    typeof V == "function" && !L ? (L = V, V = {}) : typeof V == "function" && (V = { filter: V }), L = L || function() {
    }, V = V || {}, V.clobber = "clobber" in V ? !!V.clobber : !0, V.overwrite = "overwrite" in V ? !!V.overwrite : V.clobber, V.preserveTimestamps && process.arch === "ia32" && process.emitWarning(
      `Using the preserveTimestamps option in 32-bit node is not recommended;

	see https://github.com/jprichardson/node-fs-extra/issues/269`,
      "Warning",
      "fs-extra-WARN0001"
    ), n.checkPaths(k, U, "copy", V, (B, te) => {
      if (B) return L(B);
      const { srcStat: j, destStat: H } = te;
      n.checkParentPaths(k, j, U, "copy", (Y) => Y ? L(Y) : V.filter ? a(d, H, k, U, V, L) : d(H, k, U, V, L));
    });
  }
  function d(k, U, V, L, B) {
    const te = t.dirname(V);
    r(te, (j, H) => {
      if (j) return B(j);
      if (H) return o(k, U, V, L, B);
      i(te, (Y) => Y ? B(Y) : o(k, U, V, L, B));
    });
  }
  function a(k, U, V, L, B, te) {
    Promise.resolve(B.filter(V, L)).then((j) => j ? k(U, V, L, B, te) : te(), (j) => te(j));
  }
  function l(k, U, V, L, B) {
    return L.filter ? a(o, k, U, V, L, B) : o(k, U, V, L, B);
  }
  function o(k, U, V, L, B) {
    (L.dereference ? e.stat : e.lstat)(U, (j, H) => j ? B(j) : H.isDirectory() ? b(H, k, U, V, L, B) : H.isFile() || H.isCharacterDevice() || H.isBlockDevice() ? f(H, k, U, V, L, B) : H.isSymbolicLink() ? T(k, U, V, L, B) : H.isSocket() ? B(new Error(`Cannot copy a socket file: ${U}`)) : H.isFIFO() ? B(new Error(`Cannot copy a FIFO pipe: ${U}`)) : B(new Error(`Unknown file: ${U}`)));
  }
  function f(k, U, V, L, B, te) {
    return U ? c(k, V, L, B, te) : p(k, V, L, B, te);
  }
  function c(k, U, V, L, B) {
    if (L.overwrite)
      e.unlink(V, (te) => te ? B(te) : p(k, U, V, L, B));
    else return L.errorOnExist ? B(new Error(`'${V}' already exists`)) : B();
  }
  function p(k, U, V, L, B) {
    e.copyFile(U, V, (te) => te ? B(te) : L.preserveTimestamps ? y(k.mode, U, V, B) : g(V, k.mode, B));
  }
  function y(k, U, V, L) {
    return E(k) ? h(V, k, (B) => B ? L(B) : _(k, U, V, L)) : _(k, U, V, L);
  }
  function E(k) {
    return (k & 128) === 0;
  }
  function h(k, U, V) {
    return g(k, U | 128, V);
  }
  function _(k, U, V, L) {
    w(U, V, (B) => B ? L(B) : g(V, k, L));
  }
  function g(k, U, V) {
    return e.chmod(k, U, V);
  }
  function w(k, U, V) {
    e.stat(k, (L, B) => L ? V(L) : u(U, B.atime, B.mtime, V));
  }
  function b(k, U, V, L, B, te) {
    return U ? v(V, L, B, te) : R(k.mode, V, L, B, te);
  }
  function R(k, U, V, L, B) {
    e.mkdir(V, (te) => {
      if (te) return B(te);
      v(U, V, L, (j) => j ? B(j) : g(V, k, B));
    });
  }
  function v(k, U, V, L) {
    e.readdir(k, (B, te) => B ? L(B) : S(te, k, U, V, L));
  }
  function S(k, U, V, L, B) {
    const te = k.pop();
    return te ? O(k, te, U, V, L, B) : B();
  }
  function O(k, U, V, L, B, te) {
    const j = t.join(V, U), H = t.join(L, U);
    n.checkPaths(j, H, "copy", B, (Y, F) => {
      if (Y) return te(Y);
      const { destStat: x } = F;
      l(x, j, H, B, (X) => X ? te(X) : S(k, V, L, B, te));
    });
  }
  function T(k, U, V, L, B) {
    e.readlink(U, (te, j) => {
      if (te) return B(te);
      if (L.dereference && (j = t.resolve(process.cwd(), j)), k)
        e.readlink(V, (H, Y) => H ? H.code === "EINVAL" || H.code === "UNKNOWN" ? e.symlink(j, V, B) : B(H) : (L.dereference && (Y = t.resolve(process.cwd(), Y)), n.isSrcSubdir(j, Y) ? B(new Error(`Cannot copy '${j}' to a subdirectory of itself, '${Y}'.`)) : k.isDirectory() && n.isSrcSubdir(Y, j) ? B(new Error(`Cannot overwrite '${Y}' with '${j}'.`)) : $(j, V, B)));
      else
        return e.symlink(j, V, B);
    });
  }
  function $(k, U, V) {
    e.unlink(U, (L) => L ? V(L) : e.symlink(k, U, V));
  }
  return Ps = s, Ps;
}
var Cs, Ad;
function Y0() {
  if (Ad) return Cs;
  Ad = 1;
  const e = ot(), t = $e, i = Nt().mkdirsSync, r = Kh().utimesMillisSync, u = /* @__PURE__ */ $r();
  function n(S, O, T) {
    typeof T == "function" && (T = { filter: T }), T = T || {}, T.clobber = "clobber" in T ? !!T.clobber : !0, T.overwrite = "overwrite" in T ? !!T.overwrite : T.clobber, T.preserveTimestamps && process.arch === "ia32" && process.emitWarning(
      `Using the preserveTimestamps option in 32-bit node is not recommended;

	see https://github.com/jprichardson/node-fs-extra/issues/269`,
      "Warning",
      "fs-extra-WARN0002"
    );
    const { srcStat: $, destStat: k } = u.checkPathsSync(S, O, "copy", T);
    return u.checkParentPathsSync(S, $, O, "copy"), s(k, S, O, T);
  }
  function s(S, O, T, $) {
    if ($.filter && !$.filter(O, T)) return;
    const k = t.dirname(T);
    return e.existsSync(k) || i(k), a(S, O, T, $);
  }
  function d(S, O, T, $) {
    if (!($.filter && !$.filter(O, T)))
      return a(S, O, T, $);
  }
  function a(S, O, T, $) {
    const U = ($.dereference ? e.statSync : e.lstatSync)(O);
    if (U.isDirectory()) return _(U, S, O, T, $);
    if (U.isFile() || U.isCharacterDevice() || U.isBlockDevice()) return l(U, S, O, T, $);
    if (U.isSymbolicLink()) return R(S, O, T, $);
    throw U.isSocket() ? new Error(`Cannot copy a socket file: ${O}`) : U.isFIFO() ? new Error(`Cannot copy a FIFO pipe: ${O}`) : new Error(`Unknown file: ${O}`);
  }
  function l(S, O, T, $, k) {
    return O ? o(S, T, $, k) : f(S, T, $, k);
  }
  function o(S, O, T, $) {
    if ($.overwrite)
      return e.unlinkSync(T), f(S, O, T, $);
    if ($.errorOnExist)
      throw new Error(`'${T}' already exists`);
  }
  function f(S, O, T, $) {
    return e.copyFileSync(O, T), $.preserveTimestamps && c(S.mode, O, T), E(T, S.mode);
  }
  function c(S, O, T) {
    return p(S) && y(T, S), h(O, T);
  }
  function p(S) {
    return (S & 128) === 0;
  }
  function y(S, O) {
    return E(S, O | 128);
  }
  function E(S, O) {
    return e.chmodSync(S, O);
  }
  function h(S, O) {
    const T = e.statSync(S);
    return r(O, T.atime, T.mtime);
  }
  function _(S, O, T, $, k) {
    return O ? w(T, $, k) : g(S.mode, T, $, k);
  }
  function g(S, O, T, $) {
    return e.mkdirSync(T), w(O, T, $), E(T, S);
  }
  function w(S, O, T) {
    e.readdirSync(S).forEach(($) => b($, S, O, T));
  }
  function b(S, O, T, $) {
    const k = t.join(O, S), U = t.join(T, S), { destStat: V } = u.checkPathsSync(k, U, "copy", $);
    return d(V, k, U, $);
  }
  function R(S, O, T, $) {
    let k = e.readlinkSync(O);
    if ($.dereference && (k = t.resolve(process.cwd(), k)), S) {
      let U;
      try {
        U = e.readlinkSync(T);
      } catch (V) {
        if (V.code === "EINVAL" || V.code === "UNKNOWN") return e.symlinkSync(k, T);
        throw V;
      }
      if ($.dereference && (U = t.resolve(process.cwd(), U)), u.isSrcSubdir(k, U))
        throw new Error(`Cannot copy '${k}' to a subdirectory of itself, '${U}'.`);
      if (e.statSync(T).isDirectory() && u.isSrcSubdir(U, k))
        throw new Error(`Cannot overwrite '${U}' with '${k}'.`);
      return v(k, T);
    } else
      return e.symlinkSync(k, T);
  }
  function v(S, O) {
    return e.unlinkSync(O), e.symlinkSync(S, O);
  }
  return Cs = n, Cs;
}
var Is, Od;
function Zo() {
  if (Od) return Is;
  Od = 1;
  const e = dt().fromCallback;
  return Is = {
    copy: e(/* @__PURE__ */ z0()),
    copySync: /* @__PURE__ */ Y0()
  }, Is;
}
var Ds, Nd;
function X0() {
  if (Nd) return Ds;
  Nd = 1;
  const e = ot(), t = $e, i = Fo, r = process.platform === "win32";
  function u(y) {
    [
      "unlink",
      "chmod",
      "stat",
      "lstat",
      "rmdir",
      "readdir"
    ].forEach((h) => {
      y[h] = y[h] || e[h], h = h + "Sync", y[h] = y[h] || e[h];
    }), y.maxBusyTries = y.maxBusyTries || 3;
  }
  function n(y, E, h) {
    let _ = 0;
    typeof E == "function" && (h = E, E = {}), i(y, "rimraf: missing path"), i.strictEqual(typeof y, "string", "rimraf: path should be a string"), i.strictEqual(typeof h, "function", "rimraf: callback function required"), i(E, "rimraf: invalid options argument provided"), i.strictEqual(typeof E, "object", "rimraf: options should be object"), u(E), s(y, E, function g(w) {
      if (w) {
        if ((w.code === "EBUSY" || w.code === "ENOTEMPTY" || w.code === "EPERM") && _ < E.maxBusyTries) {
          _++;
          const b = _ * 100;
          return setTimeout(() => s(y, E, g), b);
        }
        w.code === "ENOENT" && (w = null);
      }
      h(w);
    });
  }
  function s(y, E, h) {
    i(y), i(E), i(typeof h == "function"), E.lstat(y, (_, g) => {
      if (_ && _.code === "ENOENT")
        return h(null);
      if (_ && _.code === "EPERM" && r)
        return d(y, E, _, h);
      if (g && g.isDirectory())
        return l(y, E, _, h);
      E.unlink(y, (w) => {
        if (w) {
          if (w.code === "ENOENT")
            return h(null);
          if (w.code === "EPERM")
            return r ? d(y, E, w, h) : l(y, E, w, h);
          if (w.code === "EISDIR")
            return l(y, E, w, h);
        }
        return h(w);
      });
    });
  }
  function d(y, E, h, _) {
    i(y), i(E), i(typeof _ == "function"), E.chmod(y, 438, (g) => {
      g ? _(g.code === "ENOENT" ? null : h) : E.stat(y, (w, b) => {
        w ? _(w.code === "ENOENT" ? null : h) : b.isDirectory() ? l(y, E, h, _) : E.unlink(y, _);
      });
    });
  }
  function a(y, E, h) {
    let _;
    i(y), i(E);
    try {
      E.chmodSync(y, 438);
    } catch (g) {
      if (g.code === "ENOENT")
        return;
      throw h;
    }
    try {
      _ = E.statSync(y);
    } catch (g) {
      if (g.code === "ENOENT")
        return;
      throw h;
    }
    _.isDirectory() ? c(y, E, h) : E.unlinkSync(y);
  }
  function l(y, E, h, _) {
    i(y), i(E), i(typeof _ == "function"), E.rmdir(y, (g) => {
      g && (g.code === "ENOTEMPTY" || g.code === "EEXIST" || g.code === "EPERM") ? o(y, E, _) : g && g.code === "ENOTDIR" ? _(h) : _(g);
    });
  }
  function o(y, E, h) {
    i(y), i(E), i(typeof h == "function"), E.readdir(y, (_, g) => {
      if (_) return h(_);
      let w = g.length, b;
      if (w === 0) return E.rmdir(y, h);
      g.forEach((R) => {
        n(t.join(y, R), E, (v) => {
          if (!b) {
            if (v) return h(b = v);
            --w === 0 && E.rmdir(y, h);
          }
        });
      });
    });
  }
  function f(y, E) {
    let h;
    E = E || {}, u(E), i(y, "rimraf: missing path"), i.strictEqual(typeof y, "string", "rimraf: path should be a string"), i(E, "rimraf: missing options"), i.strictEqual(typeof E, "object", "rimraf: options should be object");
    try {
      h = E.lstatSync(y);
    } catch (_) {
      if (_.code === "ENOENT")
        return;
      _.code === "EPERM" && r && a(y, E, _);
    }
    try {
      h && h.isDirectory() ? c(y, E, null) : E.unlinkSync(y);
    } catch (_) {
      if (_.code === "ENOENT")
        return;
      if (_.code === "EPERM")
        return r ? a(y, E, _) : c(y, E, _);
      if (_.code !== "EISDIR")
        throw _;
      c(y, E, _);
    }
  }
  function c(y, E, h) {
    i(y), i(E);
    try {
      E.rmdirSync(y);
    } catch (_) {
      if (_.code === "ENOTDIR")
        throw h;
      if (_.code === "ENOTEMPTY" || _.code === "EEXIST" || _.code === "EPERM")
        p(y, E);
      else if (_.code !== "ENOENT")
        throw _;
    }
  }
  function p(y, E) {
    if (i(y), i(E), E.readdirSync(y).forEach((h) => f(t.join(y, h), E)), r) {
      const h = Date.now();
      do
        try {
          return E.rmdirSync(y, E);
        } catch {
        }
      while (Date.now() - h < 500);
    } else
      return E.rmdirSync(y, E);
  }
  return Ds = n, n.sync = f, Ds;
}
var $s, Pd;
function sa() {
  if (Pd) return $s;
  Pd = 1;
  const e = ot(), t = dt().fromCallback, i = /* @__PURE__ */ X0();
  function r(n, s) {
    if (e.rm) return e.rm(n, { recursive: !0, force: !0 }, s);
    i(n, s);
  }
  function u(n) {
    if (e.rmSync) return e.rmSync(n, { recursive: !0, force: !0 });
    i.sync(n);
  }
  return $s = {
    remove: t(r),
    removeSync: u
  }, $s;
}
var ks, Cd;
function W0() {
  if (Cd) return ks;
  Cd = 1;
  const e = dt().fromPromise, t = /* @__PURE__ */ Dr(), i = $e, r = /* @__PURE__ */ Nt(), u = /* @__PURE__ */ sa(), n = e(async function(a) {
    let l;
    try {
      l = await t.readdir(a);
    } catch {
      return r.mkdirs(a);
    }
    return Promise.all(l.map((o) => u.remove(i.join(a, o))));
  });
  function s(d) {
    let a;
    try {
      a = t.readdirSync(d);
    } catch {
      return r.mkdirsSync(d);
    }
    a.forEach((l) => {
      l = i.join(d, l), u.removeSync(l);
    });
  }
  return ks = {
    emptyDirSync: s,
    emptydirSync: s,
    emptyDir: n,
    emptydir: n
  }, ks;
}
var Ls, Id;
function K0() {
  if (Id) return Ls;
  Id = 1;
  const e = dt().fromCallback, t = $e, i = ot(), r = /* @__PURE__ */ Nt();
  function u(s, d) {
    function a() {
      i.writeFile(s, "", (l) => {
        if (l) return d(l);
        d();
      });
    }
    i.stat(s, (l, o) => {
      if (!l && o.isFile()) return d();
      const f = t.dirname(s);
      i.stat(f, (c, p) => {
        if (c)
          return c.code === "ENOENT" ? r.mkdirs(f, (y) => {
            if (y) return d(y);
            a();
          }) : d(c);
        p.isDirectory() ? a() : i.readdir(f, (y) => {
          if (y) return d(y);
        });
      });
    });
  }
  function n(s) {
    let d;
    try {
      d = i.statSync(s);
    } catch {
    }
    if (d && d.isFile()) return;
    const a = t.dirname(s);
    try {
      i.statSync(a).isDirectory() || i.readdirSync(a);
    } catch (l) {
      if (l && l.code === "ENOENT") r.mkdirsSync(a);
      else throw l;
    }
    i.writeFileSync(s, "");
  }
  return Ls = {
    createFile: e(u),
    createFileSync: n
  }, Ls;
}
var Fs, Dd;
function J0() {
  if (Dd) return Fs;
  Dd = 1;
  const e = dt().fromCallback, t = $e, i = ot(), r = /* @__PURE__ */ Nt(), u = fr().pathExists, { areIdentical: n } = /* @__PURE__ */ $r();
  function s(a, l, o) {
    function f(c, p) {
      i.link(c, p, (y) => {
        if (y) return o(y);
        o(null);
      });
    }
    i.lstat(l, (c, p) => {
      i.lstat(a, (y, E) => {
        if (y)
          return y.message = y.message.replace("lstat", "ensureLink"), o(y);
        if (p && n(E, p)) return o(null);
        const h = t.dirname(l);
        u(h, (_, g) => {
          if (_) return o(_);
          if (g) return f(a, l);
          r.mkdirs(h, (w) => {
            if (w) return o(w);
            f(a, l);
          });
        });
      });
    });
  }
  function d(a, l) {
    let o;
    try {
      o = i.lstatSync(l);
    } catch {
    }
    try {
      const p = i.lstatSync(a);
      if (o && n(p, o)) return;
    } catch (p) {
      throw p.message = p.message.replace("lstat", "ensureLink"), p;
    }
    const f = t.dirname(l);
    return i.existsSync(f) || r.mkdirsSync(f), i.linkSync(a, l);
  }
  return Fs = {
    createLink: e(s),
    createLinkSync: d
  }, Fs;
}
var Us, $d;
function Q0() {
  if ($d) return Us;
  $d = 1;
  const e = $e, t = ot(), i = fr().pathExists;
  function r(n, s, d) {
    if (e.isAbsolute(n))
      return t.lstat(n, (a) => a ? (a.message = a.message.replace("lstat", "ensureSymlink"), d(a)) : d(null, {
        toCwd: n,
        toDst: n
      }));
    {
      const a = e.dirname(s), l = e.join(a, n);
      return i(l, (o, f) => o ? d(o) : f ? d(null, {
        toCwd: l,
        toDst: n
      }) : t.lstat(n, (c) => c ? (c.message = c.message.replace("lstat", "ensureSymlink"), d(c)) : d(null, {
        toCwd: n,
        toDst: e.relative(a, n)
      })));
    }
  }
  function u(n, s) {
    let d;
    if (e.isAbsolute(n)) {
      if (d = t.existsSync(n), !d) throw new Error("absolute srcpath does not exist");
      return {
        toCwd: n,
        toDst: n
      };
    } else {
      const a = e.dirname(s), l = e.join(a, n);
      if (d = t.existsSync(l), d)
        return {
          toCwd: l,
          toDst: n
        };
      if (d = t.existsSync(n), !d) throw new Error("relative srcpath does not exist");
      return {
        toCwd: n,
        toDst: e.relative(a, n)
      };
    }
  }
  return Us = {
    symlinkPaths: r,
    symlinkPathsSync: u
  }, Us;
}
var qs, kd;
function Z0() {
  if (kd) return qs;
  kd = 1;
  const e = ot();
  function t(r, u, n) {
    if (n = typeof u == "function" ? u : n, u = typeof u == "function" ? !1 : u, u) return n(null, u);
    e.lstat(r, (s, d) => {
      if (s) return n(null, "file");
      u = d && d.isDirectory() ? "dir" : "file", n(null, u);
    });
  }
  function i(r, u) {
    let n;
    if (u) return u;
    try {
      n = e.lstatSync(r);
    } catch {
      return "file";
    }
    return n && n.isDirectory() ? "dir" : "file";
  }
  return qs = {
    symlinkType: t,
    symlinkTypeSync: i
  }, qs;
}
var xs, Ld;
function e_() {
  if (Ld) return xs;
  Ld = 1;
  const e = dt().fromCallback, t = $e, i = /* @__PURE__ */ Dr(), r = /* @__PURE__ */ Nt(), u = r.mkdirs, n = r.mkdirsSync, s = /* @__PURE__ */ Q0(), d = s.symlinkPaths, a = s.symlinkPathsSync, l = /* @__PURE__ */ Z0(), o = l.symlinkType, f = l.symlinkTypeSync, c = fr().pathExists, { areIdentical: p } = /* @__PURE__ */ $r();
  function y(_, g, w, b) {
    b = typeof w == "function" ? w : b, w = typeof w == "function" ? !1 : w, i.lstat(g, (R, v) => {
      !R && v.isSymbolicLink() ? Promise.all([
        i.stat(_),
        i.stat(g)
      ]).then(([S, O]) => {
        if (p(S, O)) return b(null);
        E(_, g, w, b);
      }) : E(_, g, w, b);
    });
  }
  function E(_, g, w, b) {
    d(_, g, (R, v) => {
      if (R) return b(R);
      _ = v.toDst, o(v.toCwd, w, (S, O) => {
        if (S) return b(S);
        const T = t.dirname(g);
        c(T, ($, k) => {
          if ($) return b($);
          if (k) return i.symlink(_, g, O, b);
          u(T, (U) => {
            if (U) return b(U);
            i.symlink(_, g, O, b);
          });
        });
      });
    });
  }
  function h(_, g, w) {
    let b;
    try {
      b = i.lstatSync(g);
    } catch {
    }
    if (b && b.isSymbolicLink()) {
      const O = i.statSync(_), T = i.statSync(g);
      if (p(O, T)) return;
    }
    const R = a(_, g);
    _ = R.toDst, w = f(R.toCwd, w);
    const v = t.dirname(g);
    return i.existsSync(v) || n(v), i.symlinkSync(_, g, w);
  }
  return xs = {
    createSymlink: e(y),
    createSymlinkSync: h
  }, xs;
}
var Ms, Fd;
function t_() {
  if (Fd) return Ms;
  Fd = 1;
  const { createFile: e, createFileSync: t } = /* @__PURE__ */ K0(), { createLink: i, createLinkSync: r } = /* @__PURE__ */ J0(), { createSymlink: u, createSymlinkSync: n } = /* @__PURE__ */ e_();
  return Ms = {
    // file
    createFile: e,
    createFileSync: t,
    ensureFile: e,
    ensureFileSync: t,
    // link
    createLink: i,
    createLinkSync: r,
    ensureLink: i,
    ensureLinkSync: r,
    // symlink
    createSymlink: u,
    createSymlinkSync: n,
    ensureSymlink: u,
    ensureSymlinkSync: n
  }, Ms;
}
var js, Ud;
function eu() {
  if (Ud) return js;
  Ud = 1;
  function e(i, { EOL: r = `
`, finalEOL: u = !0, replacer: n = null, spaces: s } = {}) {
    const d = u ? r : "";
    return JSON.stringify(i, n, s).replace(/\n/g, r) + d;
  }
  function t(i) {
    return Buffer.isBuffer(i) && (i = i.toString("utf8")), i.replace(/^\uFEFF/, "");
  }
  return js = { stringify: e, stripBom: t }, js;
}
var Bs, qd;
function r_() {
  if (qd) return Bs;
  qd = 1;
  let e;
  try {
    e = ot();
  } catch {
    e = Tt;
  }
  const t = dt(), { stringify: i, stripBom: r } = eu();
  async function u(o, f = {}) {
    typeof f == "string" && (f = { encoding: f });
    const c = f.fs || e, p = "throws" in f ? f.throws : !0;
    let y = await t.fromCallback(c.readFile)(o, f);
    y = r(y);
    let E;
    try {
      E = JSON.parse(y, f ? f.reviver : null);
    } catch (h) {
      if (p)
        throw h.message = `${o}: ${h.message}`, h;
      return null;
    }
    return E;
  }
  const n = t.fromPromise(u);
  function s(o, f = {}) {
    typeof f == "string" && (f = { encoding: f });
    const c = f.fs || e, p = "throws" in f ? f.throws : !0;
    try {
      let y = c.readFileSync(o, f);
      return y = r(y), JSON.parse(y, f.reviver);
    } catch (y) {
      if (p)
        throw y.message = `${o}: ${y.message}`, y;
      return null;
    }
  }
  async function d(o, f, c = {}) {
    const p = c.fs || e, y = i(f, c);
    await t.fromCallback(p.writeFile)(o, y, c);
  }
  const a = t.fromPromise(d);
  function l(o, f, c = {}) {
    const p = c.fs || e, y = i(f, c);
    return p.writeFileSync(o, y, c);
  }
  return Bs = {
    readFile: n,
    readFileSync: s,
    writeFile: a,
    writeFileSync: l
  }, Bs;
}
var Hs, xd;
function n_() {
  if (xd) return Hs;
  xd = 1;
  const e = r_();
  return Hs = {
    // jsonfile exports
    readJson: e.readFile,
    readJsonSync: e.readFileSync,
    writeJson: e.writeFile,
    writeJsonSync: e.writeFileSync
  }, Hs;
}
var Gs, Md;
function tu() {
  if (Md) return Gs;
  Md = 1;
  const e = dt().fromCallback, t = ot(), i = $e, r = /* @__PURE__ */ Nt(), u = fr().pathExists;
  function n(d, a, l, o) {
    typeof l == "function" && (o = l, l = "utf8");
    const f = i.dirname(d);
    u(f, (c, p) => {
      if (c) return o(c);
      if (p) return t.writeFile(d, a, l, o);
      r.mkdirs(f, (y) => {
        if (y) return o(y);
        t.writeFile(d, a, l, o);
      });
    });
  }
  function s(d, ...a) {
    const l = i.dirname(d);
    if (t.existsSync(l))
      return t.writeFileSync(d, ...a);
    r.mkdirsSync(l), t.writeFileSync(d, ...a);
  }
  return Gs = {
    outputFile: e(n),
    outputFileSync: s
  }, Gs;
}
var Vs, jd;
function i_() {
  if (jd) return Vs;
  jd = 1;
  const { stringify: e } = eu(), { outputFile: t } = /* @__PURE__ */ tu();
  async function i(r, u, n = {}) {
    const s = e(u, n);
    await t(r, s, n);
  }
  return Vs = i, Vs;
}
var zs, Bd;
function a_() {
  if (Bd) return zs;
  Bd = 1;
  const { stringify: e } = eu(), { outputFileSync: t } = /* @__PURE__ */ tu();
  function i(r, u, n) {
    const s = e(u, n);
    t(r, s, n);
  }
  return zs = i, zs;
}
var Ys, Hd;
function s_() {
  if (Hd) return Ys;
  Hd = 1;
  const e = dt().fromPromise, t = /* @__PURE__ */ n_();
  return t.outputJson = e(/* @__PURE__ */ i_()), t.outputJsonSync = /* @__PURE__ */ a_(), t.outputJSON = t.outputJson, t.outputJSONSync = t.outputJsonSync, t.writeJSON = t.writeJson, t.writeJSONSync = t.writeJsonSync, t.readJSON = t.readJson, t.readJSONSync = t.readJsonSync, Ys = t, Ys;
}
var Xs, Gd;
function o_() {
  if (Gd) return Xs;
  Gd = 1;
  const e = ot(), t = $e, i = Zo().copy, r = sa().remove, u = Nt().mkdirp, n = fr().pathExists, s = /* @__PURE__ */ $r();
  function d(c, p, y, E) {
    typeof y == "function" && (E = y, y = {}), y = y || {};
    const h = y.overwrite || y.clobber || !1;
    s.checkPaths(c, p, "move", y, (_, g) => {
      if (_) return E(_);
      const { srcStat: w, isChangingCase: b = !1 } = g;
      s.checkParentPaths(c, w, p, "move", (R) => {
        if (R) return E(R);
        if (a(p)) return l(c, p, h, b, E);
        u(t.dirname(p), (v) => v ? E(v) : l(c, p, h, b, E));
      });
    });
  }
  function a(c) {
    const p = t.dirname(c);
    return t.parse(p).root === p;
  }
  function l(c, p, y, E, h) {
    if (E) return o(c, p, y, h);
    if (y)
      return r(p, (_) => _ ? h(_) : o(c, p, y, h));
    n(p, (_, g) => _ ? h(_) : g ? h(new Error("dest already exists.")) : o(c, p, y, h));
  }
  function o(c, p, y, E) {
    e.rename(c, p, (h) => h ? h.code !== "EXDEV" ? E(h) : f(c, p, y, E) : E());
  }
  function f(c, p, y, E) {
    i(c, p, {
      overwrite: y,
      errorOnExist: !0
    }, (_) => _ ? E(_) : r(c, E));
  }
  return Xs = d, Xs;
}
var Ws, Vd;
function u_() {
  if (Vd) return Ws;
  Vd = 1;
  const e = ot(), t = $e, i = Zo().copySync, r = sa().removeSync, u = Nt().mkdirpSync, n = /* @__PURE__ */ $r();
  function s(f, c, p) {
    p = p || {};
    const y = p.overwrite || p.clobber || !1, { srcStat: E, isChangingCase: h = !1 } = n.checkPathsSync(f, c, "move", p);
    return n.checkParentPathsSync(f, E, c, "move"), d(c) || u(t.dirname(c)), a(f, c, y, h);
  }
  function d(f) {
    const c = t.dirname(f);
    return t.parse(c).root === c;
  }
  function a(f, c, p, y) {
    if (y) return l(f, c, p);
    if (p)
      return r(c), l(f, c, p);
    if (e.existsSync(c)) throw new Error("dest already exists.");
    return l(f, c, p);
  }
  function l(f, c, p) {
    try {
      e.renameSync(f, c);
    } catch (y) {
      if (y.code !== "EXDEV") throw y;
      return o(f, c, p);
    }
  }
  function o(f, c, p) {
    return i(f, c, {
      overwrite: p,
      errorOnExist: !0
    }), r(f);
  }
  return Ws = s, Ws;
}
var Ks, zd;
function l_() {
  if (zd) return Ks;
  zd = 1;
  const e = dt().fromCallback;
  return Ks = {
    move: e(/* @__PURE__ */ o_()),
    moveSync: /* @__PURE__ */ u_()
  }, Ks;
}
var Js, Yd;
function Wt() {
  return Yd || (Yd = 1, Js = {
    // Export promiseified graceful-fs:
    .../* @__PURE__ */ Dr(),
    // Export extra methods:
    .../* @__PURE__ */ Zo(),
    .../* @__PURE__ */ W0(),
    .../* @__PURE__ */ t_(),
    .../* @__PURE__ */ s_(),
    .../* @__PURE__ */ Nt(),
    .../* @__PURE__ */ l_(),
    .../* @__PURE__ */ tu(),
    .../* @__PURE__ */ fr(),
    .../* @__PURE__ */ sa()
  }), Js;
}
var Hr = {}, or = {}, Qs = {}, ur = {}, Xd;
function ru() {
  if (Xd) return ur;
  Xd = 1, Object.defineProperty(ur, "__esModule", { value: !0 }), ur.CancellationError = ur.CancellationToken = void 0;
  const e = Uo;
  let t = class extends e.EventEmitter {
    get cancelled() {
      return this._cancelled || this._parent != null && this._parent.cancelled;
    }
    set parent(u) {
      this.removeParentCancelHandler(), this._parent = u, this.parentCancelHandler = () => this.cancel(), this._parent.onCancel(this.parentCancelHandler);
    }
    // babel cannot compile ... correctly for super calls
    constructor(u) {
      super(), this.parentCancelHandler = null, this._parent = null, this._cancelled = !1, u != null && (this.parent = u);
    }
    cancel() {
      this._cancelled = !0, this.emit("cancel");
    }
    onCancel(u) {
      this.cancelled ? u() : this.once("cancel", u);
    }
    createPromise(u) {
      if (this.cancelled)
        return Promise.reject(new i());
      const n = () => {
        if (s != null)
          try {
            this.removeListener("cancel", s), s = null;
          } catch {
          }
      };
      let s = null;
      return new Promise((d, a) => {
        let l = null;
        if (s = () => {
          try {
            l != null && (l(), l = null);
          } finally {
            a(new i());
          }
        }, this.cancelled) {
          s();
          return;
        }
        this.onCancel(s), u(d, a, (o) => {
          l = o;
        });
      }).then((d) => (n(), d)).catch((d) => {
        throw n(), d;
      });
    }
    removeParentCancelHandler() {
      const u = this._parent;
      u != null && this.parentCancelHandler != null && (u.removeListener("cancel", this.parentCancelHandler), this.parentCancelHandler = null);
    }
    dispose() {
      try {
        this.removeParentCancelHandler();
      } finally {
        this.removeAllListeners(), this._parent = null;
      }
    }
  };
  ur.CancellationToken = t;
  class i extends Error {
    constructor() {
      super("cancelled");
    }
  }
  return ur.CancellationError = i, ur;
}
var Li = {}, Wd;
function oa() {
  if (Wd) return Li;
  Wd = 1, Object.defineProperty(Li, "__esModule", { value: !0 }), Li.newError = e;
  function e(t, i) {
    const r = new Error(t);
    return r.code = i, r;
  }
  return Li;
}
var et = {}, Fi = { exports: {} }, Ui = { exports: {} }, Zs, Kd;
function c_() {
  if (Kd) return Zs;
  Kd = 1;
  var e = 1e3, t = e * 60, i = t * 60, r = i * 24, u = r * 7, n = r * 365.25;
  Zs = function(o, f) {
    f = f || {};
    var c = typeof o;
    if (c === "string" && o.length > 0)
      return s(o);
    if (c === "number" && isFinite(o))
      return f.long ? a(o) : d(o);
    throw new Error(
      "val is not a non-empty string or a valid number. val=" + JSON.stringify(o)
    );
  };
  function s(o) {
    if (o = String(o), !(o.length > 100)) {
      var f = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        o
      );
      if (f) {
        var c = parseFloat(f[1]), p = (f[2] || "ms").toLowerCase();
        switch (p) {
          case "years":
          case "year":
          case "yrs":
          case "yr":
          case "y":
            return c * n;
          case "weeks":
          case "week":
          case "w":
            return c * u;
          case "days":
          case "day":
          case "d":
            return c * r;
          case "hours":
          case "hour":
          case "hrs":
          case "hr":
          case "h":
            return c * i;
          case "minutes":
          case "minute":
          case "mins":
          case "min":
          case "m":
            return c * t;
          case "seconds":
          case "second":
          case "secs":
          case "sec":
          case "s":
            return c * e;
          case "milliseconds":
          case "millisecond":
          case "msecs":
          case "msec":
          case "ms":
            return c;
          default:
            return;
        }
      }
    }
  }
  function d(o) {
    var f = Math.abs(o);
    return f >= r ? Math.round(o / r) + "d" : f >= i ? Math.round(o / i) + "h" : f >= t ? Math.round(o / t) + "m" : f >= e ? Math.round(o / e) + "s" : o + "ms";
  }
  function a(o) {
    var f = Math.abs(o);
    return f >= r ? l(o, f, r, "day") : f >= i ? l(o, f, i, "hour") : f >= t ? l(o, f, t, "minute") : f >= e ? l(o, f, e, "second") : o + " ms";
  }
  function l(o, f, c, p) {
    var y = f >= c * 1.5;
    return Math.round(o / c) + " " + p + (y ? "s" : "");
  }
  return Zs;
}
var eo, Jd;
function Jh() {
  if (Jd) return eo;
  Jd = 1;
  function e(t) {
    r.debug = r, r.default = r, r.coerce = l, r.disable = d, r.enable = n, r.enabled = a, r.humanize = c_(), r.destroy = o, Object.keys(t).forEach((f) => {
      r[f] = t[f];
    }), r.names = [], r.skips = [], r.formatters = {};
    function i(f) {
      let c = 0;
      for (let p = 0; p < f.length; p++)
        c = (c << 5) - c + f.charCodeAt(p), c |= 0;
      return r.colors[Math.abs(c) % r.colors.length];
    }
    r.selectColor = i;
    function r(f) {
      let c, p = null, y, E;
      function h(..._) {
        if (!h.enabled)
          return;
        const g = h, w = Number(/* @__PURE__ */ new Date()), b = w - (c || w);
        g.diff = b, g.prev = c, g.curr = w, c = w, _[0] = r.coerce(_[0]), typeof _[0] != "string" && _.unshift("%O");
        let R = 0;
        _[0] = _[0].replace(/%([a-zA-Z%])/g, (S, O) => {
          if (S === "%%")
            return "%";
          R++;
          const T = r.formatters[O];
          if (typeof T == "function") {
            const $ = _[R];
            S = T.call(g, $), _.splice(R, 1), R--;
          }
          return S;
        }), r.formatArgs.call(g, _), (g.log || r.log).apply(g, _);
      }
      return h.namespace = f, h.useColors = r.useColors(), h.color = r.selectColor(f), h.extend = u, h.destroy = r.destroy, Object.defineProperty(h, "enabled", {
        enumerable: !0,
        configurable: !1,
        get: () => p !== null ? p : (y !== r.namespaces && (y = r.namespaces, E = r.enabled(f)), E),
        set: (_) => {
          p = _;
        }
      }), typeof r.init == "function" && r.init(h), h;
    }
    function u(f, c) {
      const p = r(this.namespace + (typeof c > "u" ? ":" : c) + f);
      return p.log = this.log, p;
    }
    function n(f) {
      r.save(f), r.namespaces = f, r.names = [], r.skips = [];
      const c = (typeof f == "string" ? f : "").trim().replace(/\s+/g, ",").split(",").filter(Boolean);
      for (const p of c)
        p[0] === "-" ? r.skips.push(p.slice(1)) : r.names.push(p);
    }
    function s(f, c) {
      let p = 0, y = 0, E = -1, h = 0;
      for (; p < f.length; )
        if (y < c.length && (c[y] === f[p] || c[y] === "*"))
          c[y] === "*" ? (E = y, h = p, y++) : (p++, y++);
        else if (E !== -1)
          y = E + 1, h++, p = h;
        else
          return !1;
      for (; y < c.length && c[y] === "*"; )
        y++;
      return y === c.length;
    }
    function d() {
      const f = [
        ...r.names,
        ...r.skips.map((c) => "-" + c)
      ].join(",");
      return r.enable(""), f;
    }
    function a(f) {
      for (const c of r.skips)
        if (s(f, c))
          return !1;
      for (const c of r.names)
        if (s(f, c))
          return !0;
      return !1;
    }
    function l(f) {
      return f instanceof Error ? f.stack || f.message : f;
    }
    function o() {
      console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
    }
    return r.enable(r.load()), r;
  }
  return eo = e, eo;
}
var Qd;
function d_() {
  return Qd || (Qd = 1, (function(e, t) {
    t.formatArgs = r, t.save = u, t.load = n, t.useColors = i, t.storage = s(), t.destroy = /* @__PURE__ */ (() => {
      let a = !1;
      return () => {
        a || (a = !0, console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."));
      };
    })(), t.colors = [
      "#0000CC",
      "#0000FF",
      "#0033CC",
      "#0033FF",
      "#0066CC",
      "#0066FF",
      "#0099CC",
      "#0099FF",
      "#00CC00",
      "#00CC33",
      "#00CC66",
      "#00CC99",
      "#00CCCC",
      "#00CCFF",
      "#3300CC",
      "#3300FF",
      "#3333CC",
      "#3333FF",
      "#3366CC",
      "#3366FF",
      "#3399CC",
      "#3399FF",
      "#33CC00",
      "#33CC33",
      "#33CC66",
      "#33CC99",
      "#33CCCC",
      "#33CCFF",
      "#6600CC",
      "#6600FF",
      "#6633CC",
      "#6633FF",
      "#66CC00",
      "#66CC33",
      "#9900CC",
      "#9900FF",
      "#9933CC",
      "#9933FF",
      "#99CC00",
      "#99CC33",
      "#CC0000",
      "#CC0033",
      "#CC0066",
      "#CC0099",
      "#CC00CC",
      "#CC00FF",
      "#CC3300",
      "#CC3333",
      "#CC3366",
      "#CC3399",
      "#CC33CC",
      "#CC33FF",
      "#CC6600",
      "#CC6633",
      "#CC9900",
      "#CC9933",
      "#CCCC00",
      "#CCCC33",
      "#FF0000",
      "#FF0033",
      "#FF0066",
      "#FF0099",
      "#FF00CC",
      "#FF00FF",
      "#FF3300",
      "#FF3333",
      "#FF3366",
      "#FF3399",
      "#FF33CC",
      "#FF33FF",
      "#FF6600",
      "#FF6633",
      "#FF9900",
      "#FF9933",
      "#FFCC00",
      "#FFCC33"
    ];
    function i() {
      if (typeof window < "u" && window.process && (window.process.type === "renderer" || window.process.__nwjs))
        return !0;
      if (typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/))
        return !1;
      let a;
      return typeof document < "u" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window < "u" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator < "u" && navigator.userAgent && (a = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(a[1], 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function r(a) {
      if (a[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + a[0] + (this.useColors ? "%c " : " ") + "+" + e.exports.humanize(this.diff), !this.useColors)
        return;
      const l = "color: " + this.color;
      a.splice(1, 0, l, "color: inherit");
      let o = 0, f = 0;
      a[0].replace(/%[a-zA-Z%]/g, (c) => {
        c !== "%%" && (o++, c === "%c" && (f = o));
      }), a.splice(f, 0, l);
    }
    t.log = console.debug || console.log || (() => {
    });
    function u(a) {
      try {
        a ? t.storage.setItem("debug", a) : t.storage.removeItem("debug");
      } catch {
      }
    }
    function n() {
      let a;
      try {
        a = t.storage.getItem("debug") || t.storage.getItem("DEBUG");
      } catch {
      }
      return !a && typeof process < "u" && "env" in process && (a = process.env.DEBUG), a;
    }
    function s() {
      try {
        return localStorage;
      } catch {
      }
    }
    e.exports = Jh()(t);
    const { formatters: d } = e.exports;
    d.j = function(a) {
      try {
        return JSON.stringify(a);
      } catch (l) {
        return "[UnexpectedJSONParseError]: " + l.message;
      }
    };
  })(Ui, Ui.exports)), Ui.exports;
}
var qi = { exports: {} }, to, Zd;
function f_() {
  return Zd || (Zd = 1, to = (e, t = process.argv) => {
    const i = e.startsWith("-") ? "" : e.length === 1 ? "-" : "--", r = t.indexOf(i + e), u = t.indexOf("--");
    return r !== -1 && (u === -1 || r < u);
  }), to;
}
var ro, ef;
function h_() {
  if (ef) return ro;
  ef = 1;
  const e = _n, t = Rh, i = f_(), { env: r } = process;
  let u;
  i("no-color") || i("no-colors") || i("color=false") || i("color=never") ? u = 0 : (i("color") || i("colors") || i("color=true") || i("color=always")) && (u = 1), "FORCE_COLOR" in r && (r.FORCE_COLOR === "true" ? u = 1 : r.FORCE_COLOR === "false" ? u = 0 : u = r.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(r.FORCE_COLOR, 10), 3));
  function n(a) {
    return a === 0 ? !1 : {
      level: a,
      hasBasic: !0,
      has256: a >= 2,
      has16m: a >= 3
    };
  }
  function s(a, l) {
    if (u === 0)
      return 0;
    if (i("color=16m") || i("color=full") || i("color=truecolor"))
      return 3;
    if (i("color=256"))
      return 2;
    if (a && !l && u === void 0)
      return 0;
    const o = u || 0;
    if (r.TERM === "dumb")
      return o;
    if (process.platform === "win32") {
      const f = e.release().split(".");
      return Number(f[0]) >= 10 && Number(f[2]) >= 10586 ? Number(f[2]) >= 14931 ? 3 : 2 : 1;
    }
    if ("CI" in r)
      return ["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI", "GITHUB_ACTIONS", "BUILDKITE"].some((f) => f in r) || r.CI_NAME === "codeship" ? 1 : o;
    if ("TEAMCITY_VERSION" in r)
      return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(r.TEAMCITY_VERSION) ? 1 : 0;
    if (r.COLORTERM === "truecolor")
      return 3;
    if ("TERM_PROGRAM" in r) {
      const f = parseInt((r.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
      switch (r.TERM_PROGRAM) {
        case "iTerm.app":
          return f >= 3 ? 3 : 2;
        case "Apple_Terminal":
          return 2;
      }
    }
    return /-256(color)?$/i.test(r.TERM) ? 2 : /^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(r.TERM) || "COLORTERM" in r ? 1 : o;
  }
  function d(a) {
    const l = s(a, a && a.isTTY);
    return n(l);
  }
  return ro = {
    supportsColor: d,
    stdout: n(s(!0, t.isatty(1))),
    stderr: n(s(!0, t.isatty(2)))
  }, ro;
}
var tf;
function p_() {
  return tf || (tf = 1, (function(e, t) {
    const i = Rh, r = yn;
    t.init = o, t.log = d, t.formatArgs = n, t.save = a, t.load = l, t.useColors = u, t.destroy = r.deprecate(
      () => {
      },
      "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."
    ), t.colors = [6, 2, 3, 4, 5, 1];
    try {
      const c = h_();
      c && (c.stderr || c).level >= 2 && (t.colors = [
        20,
        21,
        26,
        27,
        32,
        33,
        38,
        39,
        40,
        41,
        42,
        43,
        44,
        45,
        56,
        57,
        62,
        63,
        68,
        69,
        74,
        75,
        76,
        77,
        78,
        79,
        80,
        81,
        92,
        93,
        98,
        99,
        112,
        113,
        128,
        129,
        134,
        135,
        148,
        149,
        160,
        161,
        162,
        163,
        164,
        165,
        166,
        167,
        168,
        169,
        170,
        171,
        172,
        173,
        178,
        179,
        184,
        185,
        196,
        197,
        198,
        199,
        200,
        201,
        202,
        203,
        204,
        205,
        206,
        207,
        208,
        209,
        214,
        215,
        220,
        221
      ]);
    } catch {
    }
    t.inspectOpts = Object.keys(process.env).filter((c) => /^debug_/i.test(c)).reduce((c, p) => {
      const y = p.substring(6).toLowerCase().replace(/_([a-z])/g, (h, _) => _.toUpperCase());
      let E = process.env[p];
      return /^(yes|on|true|enabled)$/i.test(E) ? E = !0 : /^(no|off|false|disabled)$/i.test(E) ? E = !1 : E === "null" ? E = null : E = Number(E), c[y] = E, c;
    }, {});
    function u() {
      return "colors" in t.inspectOpts ? !!t.inspectOpts.colors : i.isatty(process.stderr.fd);
    }
    function n(c) {
      const { namespace: p, useColors: y } = this;
      if (y) {
        const E = this.color, h = "\x1B[3" + (E < 8 ? E : "8;5;" + E), _ = `  ${h};1m${p} \x1B[0m`;
        c[0] = _ + c[0].split(`
`).join(`
` + _), c.push(h + "m+" + e.exports.humanize(this.diff) + "\x1B[0m");
      } else
        c[0] = s() + p + " " + c[0];
    }
    function s() {
      return t.inspectOpts.hideDate ? "" : (/* @__PURE__ */ new Date()).toISOString() + " ";
    }
    function d(...c) {
      return process.stderr.write(r.formatWithOptions(t.inspectOpts, ...c) + `
`);
    }
    function a(c) {
      c ? process.env.DEBUG = c : delete process.env.DEBUG;
    }
    function l() {
      return process.env.DEBUG;
    }
    function o(c) {
      c.inspectOpts = {};
      const p = Object.keys(t.inspectOpts);
      for (let y = 0; y < p.length; y++)
        c.inspectOpts[p[y]] = t.inspectOpts[p[y]];
    }
    e.exports = Jh()(t);
    const { formatters: f } = e.exports;
    f.o = function(c) {
      return this.inspectOpts.colors = this.useColors, r.inspect(c, this.inspectOpts).split(`
`).map((p) => p.trim()).join(" ");
    }, f.O = function(c) {
      return this.inspectOpts.colors = this.useColors, r.inspect(c, this.inspectOpts);
    };
  })(qi, qi.exports)), qi.exports;
}
var rf;
function m_() {
  return rf || (rf = 1, typeof process > "u" || process.type === "renderer" || process.browser === !0 || process.__nwjs ? Fi.exports = d_() : Fi.exports = p_()), Fi.exports;
}
var Gr = {}, nf;
function Qh() {
  if (nf) return Gr;
  nf = 1, Object.defineProperty(Gr, "__esModule", { value: !0 }), Gr.ProgressCallbackTransform = void 0;
  const e = En;
  let t = class extends e.Transform {
    constructor(r, u, n) {
      super(), this.total = r, this.cancellationToken = u, this.onProgress = n, this.start = Date.now(), this.transferred = 0, this.delta = 0, this.nextUpdate = this.start + 1e3;
    }
    _transform(r, u, n) {
      if (this.cancellationToken.cancelled) {
        n(new Error("cancelled"), null);
        return;
      }
      this.transferred += r.length, this.delta += r.length;
      const s = Date.now();
      s >= this.nextUpdate && this.transferred !== this.total && (this.nextUpdate = s + 1e3, this.onProgress({
        total: this.total,
        delta: this.delta,
        transferred: this.transferred,
        percent: this.transferred / this.total * 100,
        bytesPerSecond: Math.round(this.transferred / ((s - this.start) / 1e3))
      }), this.delta = 0), n(null, r);
    }
    _flush(r) {
      if (this.cancellationToken.cancelled) {
        r(new Error("cancelled"));
        return;
      }
      this.onProgress({
        total: this.total,
        delta: this.delta,
        transferred: this.total,
        percent: 100,
        bytesPerSecond: Math.round(this.transferred / ((Date.now() - this.start) / 1e3))
      }), this.delta = 0, r(null);
    }
  };
  return Gr.ProgressCallbackTransform = t, Gr;
}
var af;
function g_() {
  if (af) return et;
  af = 1, Object.defineProperty(et, "__esModule", { value: !0 }), et.DigestTransform = et.HttpExecutor = et.HttpError = void 0, et.createHttpError = l, et.parseJson = c, et.configureRequestOptionsFromUrl = y, et.configureRequestUrl = E, et.safeGetHeader = g, et.configureRequestOptions = b, et.safeStringifyJson = R;
  const e = Nr, t = m_(), i = Tt, r = En, u = Pr, n = ru(), s = oa(), d = Qh(), a = (0, t.default)("electron-builder");
  function l(v, S = null) {
    return new f(v.statusCode || -1, `${v.statusCode} ${v.statusMessage}` + (S == null ? "" : `
` + JSON.stringify(S, null, "  ")) + `
Headers: ` + R(v.headers), S);
  }
  const o = /* @__PURE__ */ new Map([
    [429, "Too many requests"],
    [400, "Bad request"],
    [403, "Forbidden"],
    [404, "Not found"],
    [405, "Method not allowed"],
    [406, "Not acceptable"],
    [408, "Request timeout"],
    [413, "Request entity too large"],
    [500, "Internal server error"],
    [502, "Bad gateway"],
    [503, "Service unavailable"],
    [504, "Gateway timeout"],
    [505, "HTTP version not supported"]
  ]);
  class f extends Error {
    constructor(S, O = `HTTP error: ${o.get(S) || S}`, T = null) {
      super(O), this.statusCode = S, this.description = T, this.name = "HttpError", this.code = `HTTP_ERROR_${S}`;
    }
    isServerError() {
      return this.statusCode >= 500 && this.statusCode <= 599;
    }
  }
  et.HttpError = f;
  function c(v) {
    return v.then((S) => S == null || S.length === 0 ? null : JSON.parse(S));
  }
  class p {
    constructor() {
      this.maxRedirects = 10;
    }
    request(S, O = new n.CancellationToken(), T) {
      b(S);
      const $ = T == null ? void 0 : JSON.stringify(T), k = $ ? Buffer.from($) : void 0;
      if (k != null) {
        a($);
        const { headers: U, ...V } = S;
        S = {
          method: "post",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": k.length,
            ...U
          },
          ...V
        };
      }
      return this.doApiRequest(S, O, (U) => U.end(k));
    }
    doApiRequest(S, O, T, $ = 0) {
      return a.enabled && a(`Request: ${R(S)}`), O.createPromise((k, U, V) => {
        const L = this.createRequest(S, (B) => {
          try {
            this.handleResponse(B, S, O, k, U, $, T);
          } catch (te) {
            U(te);
          }
        });
        this.addErrorAndTimeoutHandlers(L, U, S.timeout), this.addRedirectHandlers(L, S, U, $, (B) => {
          this.doApiRequest(B, O, T, $).then(k).catch(U);
        }), T(L, U), V(() => L.abort());
      });
    }
    // noinspection JSUnusedLocalSymbols
    // eslint-disable-next-line
    addRedirectHandlers(S, O, T, $, k) {
    }
    addErrorAndTimeoutHandlers(S, O, T = 60 * 1e3) {
      this.addTimeOutHandler(S, O, T), S.on("error", O), S.on("aborted", () => {
        O(new Error("Request has been aborted by the server"));
      });
    }
    handleResponse(S, O, T, $, k, U, V) {
      var L;
      if (a.enabled && a(`Response: ${S.statusCode} ${S.statusMessage}, request options: ${R(O)}`), S.statusCode === 404) {
        k(l(S, `method: ${O.method || "GET"} url: ${O.protocol || "https:"}//${O.hostname}${O.port ? `:${O.port}` : ""}${O.path}

Please double check that your authentication token is correct. Due to security reasons, actual status maybe not reported, but 404.
`));
        return;
      } else if (S.statusCode === 204) {
        $();
        return;
      }
      const B = (L = S.statusCode) !== null && L !== void 0 ? L : 0, te = B >= 300 && B < 400, j = g(S, "location");
      if (te && j != null) {
        if (U > this.maxRedirects) {
          k(this.createMaxRedirectError());
          return;
        }
        this.doApiRequest(p.prepareRedirectUrlOptions(j, O), T, V, U).then($).catch(k);
        return;
      }
      S.setEncoding("utf8");
      let H = "";
      S.on("error", k), S.on("data", (Y) => H += Y), S.on("end", () => {
        try {
          if (S.statusCode != null && S.statusCode >= 400) {
            const Y = g(S, "content-type"), F = Y != null && (Array.isArray(Y) ? Y.find((x) => x.includes("json")) != null : Y.includes("json"));
            k(l(S, `method: ${O.method || "GET"} url: ${O.protocol || "https:"}//${O.hostname}${O.port ? `:${O.port}` : ""}${O.path}

          Data:
          ${F ? JSON.stringify(JSON.parse(H)) : H}
          `));
          } else
            $(H.length === 0 ? null : H);
        } catch (Y) {
          k(Y);
        }
      });
    }
    async downloadToBuffer(S, O) {
      return await O.cancellationToken.createPromise((T, $, k) => {
        const U = [], V = {
          headers: O.headers || void 0,
          // because PrivateGitHubProvider requires HttpExecutor.prepareRedirectUrlOptions logic, so, we need to redirect manually
          redirect: "manual"
        };
        E(S, V), b(V), this.doDownload(V, {
          destination: null,
          options: O,
          onCancel: k,
          callback: (L) => {
            L == null ? T(Buffer.concat(U)) : $(L);
          },
          responseHandler: (L, B) => {
            let te = 0;
            L.on("data", (j) => {
              if (te += j.length, te > 524288e3) {
                B(new Error("Maximum allowed size is 500 MB"));
                return;
              }
              U.push(j);
            }), L.on("end", () => {
              B(null);
            });
          }
        }, 0);
      });
    }
    doDownload(S, O, T) {
      const $ = this.createRequest(S, (k) => {
        if (k.statusCode >= 400) {
          O.callback(new Error(`Cannot download "${S.protocol || "https:"}//${S.hostname}${S.path}", status ${k.statusCode}: ${k.statusMessage}`));
          return;
        }
        k.on("error", O.callback);
        const U = g(k, "location");
        if (U != null) {
          T < this.maxRedirects ? this.doDownload(p.prepareRedirectUrlOptions(U, S), O, T++) : O.callback(this.createMaxRedirectError());
          return;
        }
        O.responseHandler == null ? w(O, k) : O.responseHandler(k, O.callback);
      });
      this.addErrorAndTimeoutHandlers($, O.callback, S.timeout), this.addRedirectHandlers($, S, O.callback, T, (k) => {
        this.doDownload(k, O, T++);
      }), $.end();
    }
    createMaxRedirectError() {
      return new Error(`Too many redirects (> ${this.maxRedirects})`);
    }
    addTimeOutHandler(S, O, T) {
      S.on("socket", ($) => {
        $.setTimeout(T, () => {
          S.abort(), O(new Error("Request timed out"));
        });
      });
    }
    static prepareRedirectUrlOptions(S, O) {
      const T = y(S, { ...O }), $ = T.headers;
      if ($?.authorization) {
        const k = new u.URL(S);
        (k.hostname.endsWith(".amazonaws.com") || k.searchParams.has("X-Amz-Credential")) && delete $.authorization;
      }
      return T;
    }
    static retryOnServerError(S, O = 3) {
      for (let T = 0; ; T++)
        try {
          return S();
        } catch ($) {
          if (T < O && ($ instanceof f && $.isServerError() || $.code === "EPIPE"))
            continue;
          throw $;
        }
    }
  }
  et.HttpExecutor = p;
  function y(v, S) {
    const O = b(S);
    return E(new u.URL(v), O), O;
  }
  function E(v, S) {
    S.protocol = v.protocol, S.hostname = v.hostname, v.port ? S.port = v.port : S.port && delete S.port, S.path = v.pathname + v.search;
  }
  class h extends r.Transform {
    // noinspection JSUnusedGlobalSymbols
    get actual() {
      return this._actual;
    }
    constructor(S, O = "sha512", T = "base64") {
      super(), this.expected = S, this.algorithm = O, this.encoding = T, this._actual = null, this.isValidateOnEnd = !0, this.digester = (0, e.createHash)(O);
    }
    // noinspection JSUnusedGlobalSymbols
    _transform(S, O, T) {
      this.digester.update(S), T(null, S);
    }
    // noinspection JSUnusedGlobalSymbols
    _flush(S) {
      if (this._actual = this.digester.digest(this.encoding), this.isValidateOnEnd)
        try {
          this.validate();
        } catch (O) {
          S(O);
          return;
        }
      S(null);
    }
    validate() {
      if (this._actual == null)
        throw (0, s.newError)("Not finished yet", "ERR_STREAM_NOT_FINISHED");
      if (this._actual !== this.expected)
        throw (0, s.newError)(`${this.algorithm} checksum mismatch, expected ${this.expected}, got ${this._actual}`, "ERR_CHECKSUM_MISMATCH");
      return null;
    }
  }
  et.DigestTransform = h;
  function _(v, S, O) {
    return v != null && S != null && v !== S ? (O(new Error(`checksum mismatch: expected ${S} but got ${v} (X-Checksum-Sha2 header)`)), !1) : !0;
  }
  function g(v, S) {
    const O = v.headers[S];
    return O == null ? null : Array.isArray(O) ? O.length === 0 ? null : O[O.length - 1] : O;
  }
  function w(v, S) {
    if (!_(g(S, "X-Checksum-Sha2"), v.options.sha2, v.callback))
      return;
    const O = [];
    if (v.options.onProgress != null) {
      const U = g(S, "content-length");
      U != null && O.push(new d.ProgressCallbackTransform(parseInt(U, 10), v.options.cancellationToken, v.options.onProgress));
    }
    const T = v.options.sha512;
    T != null ? O.push(new h(T, "sha512", T.length === 128 && !T.includes("+") && !T.includes("Z") && !T.includes("=") ? "hex" : "base64")) : v.options.sha2 != null && O.push(new h(v.options.sha2, "sha256", "hex"));
    const $ = (0, i.createWriteStream)(v.destination);
    O.push($);
    let k = S;
    for (const U of O)
      U.on("error", (V) => {
        $.close(), v.options.cancellationToken.cancelled || v.callback(V);
      }), k = k.pipe(U);
    $.on("finish", () => {
      $.close(v.callback);
    });
  }
  function b(v, S, O) {
    O != null && (v.method = O), v.headers = { ...v.headers };
    const T = v.headers;
    return S != null && (T.authorization = S.startsWith("Basic") || S.startsWith("Bearer") ? S : `token ${S}`), T["User-Agent"] == null && (T["User-Agent"] = "electron-builder"), (O == null || O === "GET" || T["Cache-Control"] == null) && (T["Cache-Control"] = "no-cache"), v.protocol == null && process.versions.electron != null && (v.protocol = "https:"), v;
  }
  function R(v, S) {
    return JSON.stringify(v, (O, T) => O.endsWith("Authorization") || O.endsWith("authorization") || O.endsWith("Password") || O.endsWith("PASSWORD") || O.endsWith("Token") || O.includes("password") || O.includes("token") || S != null && S.has(O) ? "<stripped sensitive data>" : T, 2);
  }
  return et;
}
var Vr = {}, sf;
function y_() {
  if (sf) return Vr;
  sf = 1, Object.defineProperty(Vr, "__esModule", { value: !0 }), Vr.MemoLazy = void 0;
  let e = class {
    constructor(r, u) {
      this.selector = r, this.creator = u, this.selected = void 0, this._value = void 0;
    }
    get hasValue() {
      return this._value !== void 0;
    }
    get value() {
      const r = this.selector();
      if (this._value !== void 0 && t(this.selected, r))
        return this._value;
      this.selected = r;
      const u = this.creator(r);
      return this.value = u, u;
    }
    set value(r) {
      this._value = r;
    }
  };
  Vr.MemoLazy = e;
  function t(i, r) {
    if (typeof i == "object" && i !== null && (typeof r == "object" && r !== null)) {
      const s = Object.keys(i), d = Object.keys(r);
      return s.length === d.length && s.every((a) => t(i[a], r[a]));
    }
    return i === r;
  }
  return Vr;
}
var zr = {}, of;
function __() {
  if (of) return zr;
  of = 1, Object.defineProperty(zr, "__esModule", { value: !0 }), zr.githubUrl = e, zr.getS3LikeProviderBaseUrl = t;
  function e(n, s = "github.com") {
    return `${n.protocol || "https"}://${n.host || s}`;
  }
  function t(n) {
    const s = n.provider;
    if (s === "s3")
      return i(n);
    if (s === "spaces")
      return u(n);
    throw new Error(`Not supported provider: ${s}`);
  }
  function i(n) {
    let s;
    if (n.accelerate == !0)
      s = `https://${n.bucket}.s3-accelerate.amazonaws.com`;
    else if (n.endpoint != null)
      s = `${n.endpoint}/${n.bucket}`;
    else if (n.bucket.includes(".")) {
      if (n.region == null)
        throw new Error(`Bucket name "${n.bucket}" includes a dot, but S3 region is missing`);
      n.region === "us-east-1" ? s = `https://s3.amazonaws.com/${n.bucket}` : s = `https://s3-${n.region}.amazonaws.com/${n.bucket}`;
    } else n.region === "cn-north-1" ? s = `https://${n.bucket}.s3.${n.region}.amazonaws.com.cn` : s = `https://${n.bucket}.s3.amazonaws.com`;
    return r(s, n.path);
  }
  function r(n, s) {
    return s != null && s.length > 0 && (s.startsWith("/") || (n += "/"), n += s), n;
  }
  function u(n) {
    if (n.name == null)
      throw new Error("name is missing");
    if (n.region == null)
      throw new Error("region is missing");
    return r(`https://${n.name}.${n.region}.digitaloceanspaces.com`, n.path);
  }
  return zr;
}
var xi = {}, uf;
function E_() {
  if (uf) return xi;
  uf = 1, Object.defineProperty(xi, "__esModule", { value: !0 }), xi.retry = t;
  const e = ru();
  async function t(i, r, u, n = 0, s = 0, d) {
    var a;
    const l = new e.CancellationToken();
    try {
      return await i();
    } catch (o) {
      if ((!((a = d?.(o)) !== null && a !== void 0) || a) && r > 0 && !l.cancelled)
        return await new Promise((f) => setTimeout(f, u + n * s)), await t(i, r - 1, u, n, s + 1, d);
      throw o;
    }
  }
  return xi;
}
var Mi = {}, lf;
function v_() {
  if (lf) return Mi;
  lf = 1, Object.defineProperty(Mi, "__esModule", { value: !0 }), Mi.parseDn = e;
  function e(t) {
    let i = !1, r = null, u = "", n = 0;
    t = t.trim();
    const s = /* @__PURE__ */ new Map();
    for (let d = 0; d <= t.length; d++) {
      if (d === t.length) {
        r !== null && s.set(r, u);
        break;
      }
      const a = t[d];
      if (i) {
        if (a === '"') {
          i = !1;
          continue;
        }
      } else {
        if (a === '"') {
          i = !0;
          continue;
        }
        if (a === "\\") {
          d++;
          const l = parseInt(t.slice(d, d + 2), 16);
          Number.isNaN(l) ? u += t[d] : (d++, u += String.fromCharCode(l));
          continue;
        }
        if (r === null && a === "=") {
          r = u, u = "";
          continue;
        }
        if (a === "," || a === ";" || a === "+") {
          r !== null && s.set(r, u), r = null, u = "";
          continue;
        }
      }
      if (a === " " && !i) {
        if (u.length === 0)
          continue;
        if (d > n) {
          let l = d;
          for (; t[l] === " "; )
            l++;
          n = l;
        }
        if (n >= t.length || t[n] === "," || t[n] === ";" || r === null && t[n] === "=" || r !== null && t[n] === "+") {
          d = n - 1;
          continue;
        }
      }
      u += a;
    }
    return s;
  }
  return Mi;
}
var lr = {}, cf;
function w_() {
  if (cf) return lr;
  cf = 1, Object.defineProperty(lr, "__esModule", { value: !0 }), lr.nil = lr.UUID = void 0;
  const e = Nr, t = oa(), i = "options.name must be either a string or a Buffer", r = (0, e.randomBytes)(16);
  r[0] = r[0] | 1;
  const u = {}, n = [];
  for (let f = 0; f < 256; f++) {
    const c = (f + 256).toString(16).substr(1);
    u[c] = f, n[f] = c;
  }
  class s {
    constructor(c) {
      this.ascii = null, this.binary = null;
      const p = s.check(c);
      if (!p)
        throw new Error("not a UUID");
      this.version = p.version, p.format === "ascii" ? this.ascii = c : this.binary = c;
    }
    static v5(c, p) {
      return l(c, "sha1", 80, p);
    }
    toString() {
      return this.ascii == null && (this.ascii = o(this.binary)), this.ascii;
    }
    inspect() {
      return `UUID v${this.version} ${this.toString()}`;
    }
    static check(c, p = 0) {
      if (typeof c == "string")
        return c = c.toLowerCase(), /^[a-f0-9]{8}(-[a-f0-9]{4}){3}-([a-f0-9]{12})$/.test(c) ? c === "00000000-0000-0000-0000-000000000000" ? { version: void 0, variant: "nil", format: "ascii" } : {
          version: (u[c[14] + c[15]] & 240) >> 4,
          variant: d((u[c[19] + c[20]] & 224) >> 5),
          format: "ascii"
        } : !1;
      if (Buffer.isBuffer(c)) {
        if (c.length < p + 16)
          return !1;
        let y = 0;
        for (; y < 16 && c[p + y] === 0; y++)
          ;
        return y === 16 ? { version: void 0, variant: "nil", format: "binary" } : {
          version: (c[p + 6] & 240) >> 4,
          variant: d((c[p + 8] & 224) >> 5),
          format: "binary"
        };
      }
      throw (0, t.newError)("Unknown type of uuid", "ERR_UNKNOWN_UUID_TYPE");
    }
    // read stringified uuid into a Buffer
    static parse(c) {
      const p = Buffer.allocUnsafe(16);
      let y = 0;
      for (let E = 0; E < 16; E++)
        p[E] = u[c[y++] + c[y++]], (E === 3 || E === 5 || E === 7 || E === 9) && (y += 1);
      return p;
    }
  }
  lr.UUID = s, s.OID = s.parse("6ba7b812-9dad-11d1-80b4-00c04fd430c8");
  function d(f) {
    switch (f) {
      case 0:
      case 1:
      case 3:
        return "ncs";
      case 4:
      case 5:
        return "rfc4122";
      case 6:
        return "microsoft";
      default:
        return "future";
    }
  }
  var a;
  (function(f) {
    f[f.ASCII = 0] = "ASCII", f[f.BINARY = 1] = "BINARY", f[f.OBJECT = 2] = "OBJECT";
  })(a || (a = {}));
  function l(f, c, p, y, E = a.ASCII) {
    const h = (0, e.createHash)(c);
    if (typeof f != "string" && !Buffer.isBuffer(f))
      throw (0, t.newError)(i, "ERR_INVALID_UUID_NAME");
    h.update(y), h.update(f);
    const g = h.digest();
    let w;
    switch (E) {
      case a.BINARY:
        g[6] = g[6] & 15 | p, g[8] = g[8] & 63 | 128, w = g;
        break;
      case a.OBJECT:
        g[6] = g[6] & 15 | p, g[8] = g[8] & 63 | 128, w = new s(g);
        break;
      default:
        w = n[g[0]] + n[g[1]] + n[g[2]] + n[g[3]] + "-" + n[g[4]] + n[g[5]] + "-" + n[g[6] & 15 | p] + n[g[7]] + "-" + n[g[8] & 63 | 128] + n[g[9]] + "-" + n[g[10]] + n[g[11]] + n[g[12]] + n[g[13]] + n[g[14]] + n[g[15]];
        break;
    }
    return w;
  }
  function o(f) {
    return n[f[0]] + n[f[1]] + n[f[2]] + n[f[3]] + "-" + n[f[4]] + n[f[5]] + "-" + n[f[6]] + n[f[7]] + "-" + n[f[8]] + n[f[9]] + "-" + n[f[10]] + n[f[11]] + n[f[12]] + n[f[13]] + n[f[14]] + n[f[15]];
  }
  return lr.nil = new s("00000000-0000-0000-0000-000000000000"), lr;
}
var Er = {}, no = {}, df;
function S_() {
  return df || (df = 1, (function(e) {
    (function(t) {
      t.parser = function(N, A) {
        return new r(N, A);
      }, t.SAXParser = r, t.SAXStream = o, t.createStream = l, t.MAX_BUFFER_LENGTH = 64 * 1024;
      var i = [
        "comment",
        "sgmlDecl",
        "textNode",
        "tagName",
        "doctype",
        "procInstName",
        "procInstBody",
        "entity",
        "attribName",
        "attribValue",
        "cdata",
        "script"
      ];
      t.EVENTS = [
        "text",
        "processinginstruction",
        "sgmldeclaration",
        "doctype",
        "comment",
        "opentagstart",
        "attribute",
        "opentag",
        "closetag",
        "opencdata",
        "cdata",
        "closecdata",
        "error",
        "end",
        "ready",
        "script",
        "opennamespace",
        "closenamespace"
      ];
      function r(N, A) {
        if (!(this instanceof r))
          return new r(N, A);
        var J = this;
        n(J), J.q = J.c = "", J.bufferCheckPosition = t.MAX_BUFFER_LENGTH, J.opt = A || {}, J.opt.lowercase = J.opt.lowercase || J.opt.lowercasetags, J.looseCase = J.opt.lowercase ? "toLowerCase" : "toUpperCase", J.tags = [], J.closed = J.closedRoot = J.sawRoot = !1, J.tag = J.error = null, J.strict = !!N, J.noscript = !!(N || J.opt.noscript), J.state = T.BEGIN, J.strictEntities = J.opt.strictEntities, J.ENTITIES = J.strictEntities ? Object.create(t.XML_ENTITIES) : Object.create(t.ENTITIES), J.attribList = [], J.opt.xmlns && (J.ns = Object.create(E)), J.opt.unquotedAttributeValues === void 0 && (J.opt.unquotedAttributeValues = !N), J.trackPosition = J.opt.position !== !1, J.trackPosition && (J.position = J.line = J.column = 0), k(J, "onready");
      }
      Object.create || (Object.create = function(N) {
        function A() {
        }
        A.prototype = N;
        var J = new A();
        return J;
      }), Object.keys || (Object.keys = function(N) {
        var A = [];
        for (var J in N) N.hasOwnProperty(J) && A.push(J);
        return A;
      });
      function u(N) {
        for (var A = Math.max(t.MAX_BUFFER_LENGTH, 10), J = 0, M = 0, q = i.length; M < q; M++) {
          var z = N[i[M]].length;
          if (z > A)
            switch (i[M]) {
              case "textNode":
                V(N);
                break;
              case "cdata":
                U(N, "oncdata", N.cdata), N.cdata = "";
                break;
              case "script":
                U(N, "onscript", N.script), N.script = "";
                break;
              default:
                B(N, "Max buffer length exceeded: " + i[M]);
            }
          J = Math.max(J, z);
        }
        var Q = t.MAX_BUFFER_LENGTH - J;
        N.bufferCheckPosition = Q + N.position;
      }
      function n(N) {
        for (var A = 0, J = i.length; A < J; A++)
          N[i[A]] = "";
      }
      function s(N) {
        V(N), N.cdata !== "" && (U(N, "oncdata", N.cdata), N.cdata = ""), N.script !== "" && (U(N, "onscript", N.script), N.script = "");
      }
      r.prototype = {
        end: function() {
          te(this);
        },
        write: K,
        resume: function() {
          return this.error = null, this;
        },
        close: function() {
          return this.write(null);
        },
        flush: function() {
          s(this);
        }
      };
      var d;
      try {
        d = require("stream").Stream;
      } catch {
        d = function() {
        };
      }
      d || (d = function() {
      });
      var a = t.EVENTS.filter(function(N) {
        return N !== "error" && N !== "end";
      });
      function l(N, A) {
        return new o(N, A);
      }
      function o(N, A) {
        if (!(this instanceof o))
          return new o(N, A);
        d.apply(this), this._parser = new r(N, A), this.writable = !0, this.readable = !0;
        var J = this;
        this._parser.onend = function() {
          J.emit("end");
        }, this._parser.onerror = function(M) {
          J.emit("error", M), J._parser.error = null;
        }, this._decoder = null, a.forEach(function(M) {
          Object.defineProperty(J, "on" + M, {
            get: function() {
              return J._parser["on" + M];
            },
            set: function(q) {
              if (!q)
                return J.removeAllListeners(M), J._parser["on" + M] = q, q;
              J.on(M, q);
            },
            enumerable: !0,
            configurable: !1
          });
        });
      }
      o.prototype = Object.create(d.prototype, {
        constructor: {
          value: o
        }
      }), o.prototype.write = function(N) {
        if (typeof Buffer == "function" && typeof Buffer.isBuffer == "function" && Buffer.isBuffer(N)) {
          if (!this._decoder) {
            var A = Sm.StringDecoder;
            this._decoder = new A("utf8");
          }
          N = this._decoder.write(N);
        }
        return this._parser.write(N.toString()), this.emit("data", N), !0;
      }, o.prototype.end = function(N) {
        return N && N.length && this.write(N), this._parser.end(), !0;
      }, o.prototype.on = function(N, A) {
        var J = this;
        return !J._parser["on" + N] && a.indexOf(N) !== -1 && (J._parser["on" + N] = function() {
          var M = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);
          M.splice(0, 0, N), J.emit.apply(J, M);
        }), d.prototype.on.call(J, N, A);
      };
      var f = "[CDATA[", c = "DOCTYPE", p = "http://www.w3.org/XML/1998/namespace", y = "http://www.w3.org/2000/xmlns/", E = { xml: p, xmlns: y }, h = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, _ = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/, g = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, w = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
      function b(N) {
        return N === " " || N === `
` || N === "\r" || N === "	";
      }
      function R(N) {
        return N === '"' || N === "'";
      }
      function v(N) {
        return N === ">" || b(N);
      }
      function S(N, A) {
        return N.test(A);
      }
      function O(N, A) {
        return !S(N, A);
      }
      var T = 0;
      t.STATE = {
        BEGIN: T++,
        // leading byte order mark or whitespace
        BEGIN_WHITESPACE: T++,
        // leading whitespace
        TEXT: T++,
        // general stuff
        TEXT_ENTITY: T++,
        // &amp and such.
        OPEN_WAKA: T++,
        // <
        SGML_DECL: T++,
        // <!BLARG
        SGML_DECL_QUOTED: T++,
        // <!BLARG foo "bar
        DOCTYPE: T++,
        // <!DOCTYPE
        DOCTYPE_QUOTED: T++,
        // <!DOCTYPE "//blah
        DOCTYPE_DTD: T++,
        // <!DOCTYPE "//blah" [ ...
        DOCTYPE_DTD_QUOTED: T++,
        // <!DOCTYPE "//blah" [ "foo
        COMMENT_STARTING: T++,
        // <!-
        COMMENT: T++,
        // <!--
        COMMENT_ENDING: T++,
        // <!-- blah -
        COMMENT_ENDED: T++,
        // <!-- blah --
        CDATA: T++,
        // <![CDATA[ something
        CDATA_ENDING: T++,
        // ]
        CDATA_ENDING_2: T++,
        // ]]
        PROC_INST: T++,
        // <?hi
        PROC_INST_BODY: T++,
        // <?hi there
        PROC_INST_ENDING: T++,
        // <?hi "there" ?
        OPEN_TAG: T++,
        // <strong
        OPEN_TAG_SLASH: T++,
        // <strong /
        ATTRIB: T++,
        // <a
        ATTRIB_NAME: T++,
        // <a foo
        ATTRIB_NAME_SAW_WHITE: T++,
        // <a foo _
        ATTRIB_VALUE: T++,
        // <a foo=
        ATTRIB_VALUE_QUOTED: T++,
        // <a foo="bar
        ATTRIB_VALUE_CLOSED: T++,
        // <a foo="bar"
        ATTRIB_VALUE_UNQUOTED: T++,
        // <a foo=bar
        ATTRIB_VALUE_ENTITY_Q: T++,
        // <foo bar="&quot;"
        ATTRIB_VALUE_ENTITY_U: T++,
        // <foo bar=&quot
        CLOSE_TAG: T++,
        // </a
        CLOSE_TAG_SAW_WHITE: T++,
        // </a   >
        SCRIPT: T++,
        // <script> ...
        SCRIPT_ENDING: T++
        // <script> ... <
      }, t.XML_ENTITIES = {
        amp: "&",
        gt: ">",
        lt: "<",
        quot: '"',
        apos: "'"
      }, t.ENTITIES = {
        amp: "&",
        gt: ">",
        lt: "<",
        quot: '"',
        apos: "'",
        AElig: 198,
        Aacute: 193,
        Acirc: 194,
        Agrave: 192,
        Aring: 197,
        Atilde: 195,
        Auml: 196,
        Ccedil: 199,
        ETH: 208,
        Eacute: 201,
        Ecirc: 202,
        Egrave: 200,
        Euml: 203,
        Iacute: 205,
        Icirc: 206,
        Igrave: 204,
        Iuml: 207,
        Ntilde: 209,
        Oacute: 211,
        Ocirc: 212,
        Ograve: 210,
        Oslash: 216,
        Otilde: 213,
        Ouml: 214,
        THORN: 222,
        Uacute: 218,
        Ucirc: 219,
        Ugrave: 217,
        Uuml: 220,
        Yacute: 221,
        aacute: 225,
        acirc: 226,
        aelig: 230,
        agrave: 224,
        aring: 229,
        atilde: 227,
        auml: 228,
        ccedil: 231,
        eacute: 233,
        ecirc: 234,
        egrave: 232,
        eth: 240,
        euml: 235,
        iacute: 237,
        icirc: 238,
        igrave: 236,
        iuml: 239,
        ntilde: 241,
        oacute: 243,
        ocirc: 244,
        ograve: 242,
        oslash: 248,
        otilde: 245,
        ouml: 246,
        szlig: 223,
        thorn: 254,
        uacute: 250,
        ucirc: 251,
        ugrave: 249,
        uuml: 252,
        yacute: 253,
        yuml: 255,
        copy: 169,
        reg: 174,
        nbsp: 160,
        iexcl: 161,
        cent: 162,
        pound: 163,
        curren: 164,
        yen: 165,
        brvbar: 166,
        sect: 167,
        uml: 168,
        ordf: 170,
        laquo: 171,
        not: 172,
        shy: 173,
        macr: 175,
        deg: 176,
        plusmn: 177,
        sup1: 185,
        sup2: 178,
        sup3: 179,
        acute: 180,
        micro: 181,
        para: 182,
        middot: 183,
        cedil: 184,
        ordm: 186,
        raquo: 187,
        frac14: 188,
        frac12: 189,
        frac34: 190,
        iquest: 191,
        times: 215,
        divide: 247,
        OElig: 338,
        oelig: 339,
        Scaron: 352,
        scaron: 353,
        Yuml: 376,
        fnof: 402,
        circ: 710,
        tilde: 732,
        Alpha: 913,
        Beta: 914,
        Gamma: 915,
        Delta: 916,
        Epsilon: 917,
        Zeta: 918,
        Eta: 919,
        Theta: 920,
        Iota: 921,
        Kappa: 922,
        Lambda: 923,
        Mu: 924,
        Nu: 925,
        Xi: 926,
        Omicron: 927,
        Pi: 928,
        Rho: 929,
        Sigma: 931,
        Tau: 932,
        Upsilon: 933,
        Phi: 934,
        Chi: 935,
        Psi: 936,
        Omega: 937,
        alpha: 945,
        beta: 946,
        gamma: 947,
        delta: 948,
        epsilon: 949,
        zeta: 950,
        eta: 951,
        theta: 952,
        iota: 953,
        kappa: 954,
        lambda: 955,
        mu: 956,
        nu: 957,
        xi: 958,
        omicron: 959,
        pi: 960,
        rho: 961,
        sigmaf: 962,
        sigma: 963,
        tau: 964,
        upsilon: 965,
        phi: 966,
        chi: 967,
        psi: 968,
        omega: 969,
        thetasym: 977,
        upsih: 978,
        piv: 982,
        ensp: 8194,
        emsp: 8195,
        thinsp: 8201,
        zwnj: 8204,
        zwj: 8205,
        lrm: 8206,
        rlm: 8207,
        ndash: 8211,
        mdash: 8212,
        lsquo: 8216,
        rsquo: 8217,
        sbquo: 8218,
        ldquo: 8220,
        rdquo: 8221,
        bdquo: 8222,
        dagger: 8224,
        Dagger: 8225,
        bull: 8226,
        hellip: 8230,
        permil: 8240,
        prime: 8242,
        Prime: 8243,
        lsaquo: 8249,
        rsaquo: 8250,
        oline: 8254,
        frasl: 8260,
        euro: 8364,
        image: 8465,
        weierp: 8472,
        real: 8476,
        trade: 8482,
        alefsym: 8501,
        larr: 8592,
        uarr: 8593,
        rarr: 8594,
        darr: 8595,
        harr: 8596,
        crarr: 8629,
        lArr: 8656,
        uArr: 8657,
        rArr: 8658,
        dArr: 8659,
        hArr: 8660,
        forall: 8704,
        part: 8706,
        exist: 8707,
        empty: 8709,
        nabla: 8711,
        isin: 8712,
        notin: 8713,
        ni: 8715,
        prod: 8719,
        sum: 8721,
        minus: 8722,
        lowast: 8727,
        radic: 8730,
        prop: 8733,
        infin: 8734,
        ang: 8736,
        and: 8743,
        or: 8744,
        cap: 8745,
        cup: 8746,
        int: 8747,
        there4: 8756,
        sim: 8764,
        cong: 8773,
        asymp: 8776,
        ne: 8800,
        equiv: 8801,
        le: 8804,
        ge: 8805,
        sub: 8834,
        sup: 8835,
        nsub: 8836,
        sube: 8838,
        supe: 8839,
        oplus: 8853,
        otimes: 8855,
        perp: 8869,
        sdot: 8901,
        lceil: 8968,
        rceil: 8969,
        lfloor: 8970,
        rfloor: 8971,
        lang: 9001,
        rang: 9002,
        loz: 9674,
        spades: 9824,
        clubs: 9827,
        hearts: 9829,
        diams: 9830
      }, Object.keys(t.ENTITIES).forEach(function(N) {
        var A = t.ENTITIES[N], J = typeof A == "number" ? String.fromCharCode(A) : A;
        t.ENTITIES[N] = J;
      });
      for (var $ in t.STATE)
        t.STATE[t.STATE[$]] = $;
      T = t.STATE;
      function k(N, A, J) {
        N[A] && N[A](J);
      }
      function U(N, A, J) {
        N.textNode && V(N), k(N, A, J);
      }
      function V(N) {
        N.textNode = L(N.opt, N.textNode), N.textNode && k(N, "ontext", N.textNode), N.textNode = "";
      }
      function L(N, A) {
        return N.trim && (A = A.trim()), N.normalize && (A = A.replace(/\s+/g, " ")), A;
      }
      function B(N, A) {
        return V(N), N.trackPosition && (A += `
Line: ` + N.line + `
Column: ` + N.column + `
Char: ` + N.c), A = new Error(A), N.error = A, k(N, "onerror", A), N;
      }
      function te(N) {
        return N.sawRoot && !N.closedRoot && j(N, "Unclosed root tag"), N.state !== T.BEGIN && N.state !== T.BEGIN_WHITESPACE && N.state !== T.TEXT && B(N, "Unexpected end"), V(N), N.c = "", N.closed = !0, k(N, "onend"), r.call(N, N.strict, N.opt), N;
      }
      function j(N, A) {
        if (typeof N != "object" || !(N instanceof r))
          throw new Error("bad call to strictFail");
        N.strict && B(N, A);
      }
      function H(N) {
        N.strict || (N.tagName = N.tagName[N.looseCase]());
        var A = N.tags[N.tags.length - 1] || N, J = N.tag = { name: N.tagName, attributes: {} };
        N.opt.xmlns && (J.ns = A.ns), N.attribList.length = 0, U(N, "onopentagstart", J);
      }
      function Y(N, A) {
        var J = N.indexOf(":"), M = J < 0 ? ["", N] : N.split(":"), q = M[0], z = M[1];
        return A && N === "xmlns" && (q = "xmlns", z = ""), { prefix: q, local: z };
      }
      function F(N) {
        if (N.strict || (N.attribName = N.attribName[N.looseCase]()), N.attribList.indexOf(N.attribName) !== -1 || N.tag.attributes.hasOwnProperty(N.attribName)) {
          N.attribName = N.attribValue = "";
          return;
        }
        if (N.opt.xmlns) {
          var A = Y(N.attribName, !0), J = A.prefix, M = A.local;
          if (J === "xmlns")
            if (M === "xml" && N.attribValue !== p)
              j(
                N,
                "xml: prefix must be bound to " + p + `
Actual: ` + N.attribValue
              );
            else if (M === "xmlns" && N.attribValue !== y)
              j(
                N,
                "xmlns: prefix must be bound to " + y + `
Actual: ` + N.attribValue
              );
            else {
              var q = N.tag, z = N.tags[N.tags.length - 1] || N;
              q.ns === z.ns && (q.ns = Object.create(z.ns)), q.ns[M] = N.attribValue;
            }
          N.attribList.push([N.attribName, N.attribValue]);
        } else
          N.tag.attributes[N.attribName] = N.attribValue, U(N, "onattribute", {
            name: N.attribName,
            value: N.attribValue
          });
        N.attribName = N.attribValue = "";
      }
      function x(N, A) {
        if (N.opt.xmlns) {
          var J = N.tag, M = Y(N.tagName);
          J.prefix = M.prefix, J.local = M.local, J.uri = J.ns[M.prefix] || "", J.prefix && !J.uri && (j(
            N,
            "Unbound namespace prefix: " + JSON.stringify(N.tagName)
          ), J.uri = M.prefix);
          var q = N.tags[N.tags.length - 1] || N;
          J.ns && q.ns !== J.ns && Object.keys(J.ns).forEach(function(m) {
            U(N, "onopennamespace", {
              prefix: m,
              uri: J.ns[m]
            });
          });
          for (var z = 0, Q = N.attribList.length; z < Q; z++) {
            var re = N.attribList[z], le = re[0], Se = re[1], Te = Y(le, !0), Fe = Te.prefix, He = Te.local, Be = Fe === "" ? "" : J.ns[Fe] || "", Le = {
              name: le,
              value: Se,
              prefix: Fe,
              local: He,
              uri: Be
            };
            Fe && Fe !== "xmlns" && !Be && (j(
              N,
              "Unbound namespace prefix: " + JSON.stringify(Fe)
            ), Le.uri = Fe), N.tag.attributes[le] = Le, U(N, "onattribute", Le);
          }
          N.attribList.length = 0;
        }
        N.tag.isSelfClosing = !!A, N.sawRoot = !0, N.tags.push(N.tag), U(N, "onopentag", N.tag), A || (!N.noscript && N.tagName.toLowerCase() === "script" ? N.state = T.SCRIPT : N.state = T.TEXT, N.tag = null, N.tagName = ""), N.attribName = N.attribValue = "", N.attribList.length = 0;
      }
      function X(N) {
        if (!N.tagName) {
          j(N, "Weird empty close tag."), N.textNode += "</>", N.state = T.TEXT;
          return;
        }
        if (N.script) {
          if (N.tagName !== "script") {
            N.script += "</" + N.tagName + ">", N.tagName = "", N.state = T.SCRIPT;
            return;
          }
          U(N, "onscript", N.script), N.script = "";
        }
        var A = N.tags.length, J = N.tagName;
        N.strict || (J = J[N.looseCase]());
        for (var M = J; A--; ) {
          var q = N.tags[A];
          if (q.name !== M)
            j(N, "Unexpected close tag");
          else
            break;
        }
        if (A < 0) {
          j(N, "Unmatched closing tag: " + N.tagName), N.textNode += "</" + N.tagName + ">", N.state = T.TEXT;
          return;
        }
        N.tagName = J;
        for (var z = N.tags.length; z-- > A; ) {
          var Q = N.tag = N.tags.pop();
          N.tagName = N.tag.name, U(N, "onclosetag", N.tagName);
          var re = {};
          for (var le in Q.ns)
            re[le] = Q.ns[le];
          var Se = N.tags[N.tags.length - 1] || N;
          N.opt.xmlns && Q.ns !== Se.ns && Object.keys(Q.ns).forEach(function(Te) {
            var Fe = Q.ns[Te];
            U(N, "onclosenamespace", { prefix: Te, uri: Fe });
          });
        }
        A === 0 && (N.closedRoot = !0), N.tagName = N.attribValue = N.attribName = "", N.attribList.length = 0, N.state = T.TEXT;
      }
      function G(N) {
        var A = N.entity, J = A.toLowerCase(), M, q = "";
        return N.ENTITIES[A] ? N.ENTITIES[A] : N.ENTITIES[J] ? N.ENTITIES[J] : (A = J, A.charAt(0) === "#" && (A.charAt(1) === "x" ? (A = A.slice(2), M = parseInt(A, 16), q = M.toString(16)) : (A = A.slice(1), M = parseInt(A, 10), q = M.toString(10))), A = A.replace(/^0+/, ""), isNaN(M) || q.toLowerCase() !== A || M < 0 || M > 1114111 ? (j(N, "Invalid character entity"), "&" + N.entity + ";") : String.fromCodePoint(M));
      }
      function P(N, A) {
        A === "<" ? (N.state = T.OPEN_WAKA, N.startTagPosition = N.position) : b(A) || (j(N, "Non-whitespace before first tag."), N.textNode = A, N.state = T.TEXT);
      }
      function C(N, A) {
        var J = "";
        return A < N.length && (J = N.charAt(A)), J;
      }
      function K(N) {
        var A = this;
        if (this.error)
          throw this.error;
        if (A.closed)
          return B(
            A,
            "Cannot write after close. Assign an onready handler."
          );
        if (N === null)
          return te(A);
        typeof N == "object" && (N = N.toString());
        for (var J = 0, M = ""; M = C(N, J++), A.c = M, !!M; )
          switch (A.trackPosition && (A.position++, M === `
` ? (A.line++, A.column = 0) : A.column++), A.state) {
            case T.BEGIN:
              if (A.state = T.BEGIN_WHITESPACE, M === "\uFEFF")
                continue;
              P(A, M);
              continue;
            case T.BEGIN_WHITESPACE:
              P(A, M);
              continue;
            case T.TEXT:
              if (A.sawRoot && !A.closedRoot) {
                for (var z = J - 1; M && M !== "<" && M !== "&"; )
                  M = C(N, J++), M && A.trackPosition && (A.position++, M === `
` ? (A.line++, A.column = 0) : A.column++);
                A.textNode += N.substring(z, J - 1);
              }
              M === "<" && !(A.sawRoot && A.closedRoot && !A.strict) ? (A.state = T.OPEN_WAKA, A.startTagPosition = A.position) : (!b(M) && (!A.sawRoot || A.closedRoot) && j(A, "Text data outside of root node."), M === "&" ? A.state = T.TEXT_ENTITY : A.textNode += M);
              continue;
            case T.SCRIPT:
              M === "<" ? A.state = T.SCRIPT_ENDING : A.script += M;
              continue;
            case T.SCRIPT_ENDING:
              M === "/" ? A.state = T.CLOSE_TAG : (A.script += "<" + M, A.state = T.SCRIPT);
              continue;
            case T.OPEN_WAKA:
              if (M === "!")
                A.state = T.SGML_DECL, A.sgmlDecl = "";
              else if (!b(M)) if (S(h, M))
                A.state = T.OPEN_TAG, A.tagName = M;
              else if (M === "/")
                A.state = T.CLOSE_TAG, A.tagName = "";
              else if (M === "?")
                A.state = T.PROC_INST, A.procInstName = A.procInstBody = "";
              else {
                if (j(A, "Unencoded <"), A.startTagPosition + 1 < A.position) {
                  var q = A.position - A.startTagPosition;
                  M = new Array(q).join(" ") + M;
                }
                A.textNode += "<" + M, A.state = T.TEXT;
              }
              continue;
            case T.SGML_DECL:
              if (A.sgmlDecl + M === "--") {
                A.state = T.COMMENT, A.comment = "", A.sgmlDecl = "";
                continue;
              }
              A.doctype && A.doctype !== !0 && A.sgmlDecl ? (A.state = T.DOCTYPE_DTD, A.doctype += "<!" + A.sgmlDecl + M, A.sgmlDecl = "") : (A.sgmlDecl + M).toUpperCase() === f ? (U(A, "onopencdata"), A.state = T.CDATA, A.sgmlDecl = "", A.cdata = "") : (A.sgmlDecl + M).toUpperCase() === c ? (A.state = T.DOCTYPE, (A.doctype || A.sawRoot) && j(
                A,
                "Inappropriately located doctype declaration"
              ), A.doctype = "", A.sgmlDecl = "") : M === ">" ? (U(A, "onsgmldeclaration", A.sgmlDecl), A.sgmlDecl = "", A.state = T.TEXT) : (R(M) && (A.state = T.SGML_DECL_QUOTED), A.sgmlDecl += M);
              continue;
            case T.SGML_DECL_QUOTED:
              M === A.q && (A.state = T.SGML_DECL, A.q = ""), A.sgmlDecl += M;
              continue;
            case T.DOCTYPE:
              M === ">" ? (A.state = T.TEXT, U(A, "ondoctype", A.doctype), A.doctype = !0) : (A.doctype += M, M === "[" ? A.state = T.DOCTYPE_DTD : R(M) && (A.state = T.DOCTYPE_QUOTED, A.q = M));
              continue;
            case T.DOCTYPE_QUOTED:
              A.doctype += M, M === A.q && (A.q = "", A.state = T.DOCTYPE);
              continue;
            case T.DOCTYPE_DTD:
              M === "]" ? (A.doctype += M, A.state = T.DOCTYPE) : M === "<" ? (A.state = T.OPEN_WAKA, A.startTagPosition = A.position) : R(M) ? (A.doctype += M, A.state = T.DOCTYPE_DTD_QUOTED, A.q = M) : A.doctype += M;
              continue;
            case T.DOCTYPE_DTD_QUOTED:
              A.doctype += M, M === A.q && (A.state = T.DOCTYPE_DTD, A.q = "");
              continue;
            case T.COMMENT:
              M === "-" ? A.state = T.COMMENT_ENDING : A.comment += M;
              continue;
            case T.COMMENT_ENDING:
              M === "-" ? (A.state = T.COMMENT_ENDED, A.comment = L(A.opt, A.comment), A.comment && U(A, "oncomment", A.comment), A.comment = "") : (A.comment += "-" + M, A.state = T.COMMENT);
              continue;
            case T.COMMENT_ENDED:
              M !== ">" ? (j(A, "Malformed comment"), A.comment += "--" + M, A.state = T.COMMENT) : A.doctype && A.doctype !== !0 ? A.state = T.DOCTYPE_DTD : A.state = T.TEXT;
              continue;
            case T.CDATA:
              for (var z = J - 1; M && M !== "]"; )
                M = C(N, J++), M && A.trackPosition && (A.position++, M === `
` ? (A.line++, A.column = 0) : A.column++);
              A.cdata += N.substring(z, J - 1), M === "]" && (A.state = T.CDATA_ENDING);
              continue;
            case T.CDATA_ENDING:
              M === "]" ? A.state = T.CDATA_ENDING_2 : (A.cdata += "]" + M, A.state = T.CDATA);
              continue;
            case T.CDATA_ENDING_2:
              M === ">" ? (A.cdata && U(A, "oncdata", A.cdata), U(A, "onclosecdata"), A.cdata = "", A.state = T.TEXT) : M === "]" ? A.cdata += "]" : (A.cdata += "]]" + M, A.state = T.CDATA);
              continue;
            case T.PROC_INST:
              M === "?" ? A.state = T.PROC_INST_ENDING : b(M) ? A.state = T.PROC_INST_BODY : A.procInstName += M;
              continue;
            case T.PROC_INST_BODY:
              if (!A.procInstBody && b(M))
                continue;
              M === "?" ? A.state = T.PROC_INST_ENDING : A.procInstBody += M;
              continue;
            case T.PROC_INST_ENDING:
              M === ">" ? (U(A, "onprocessinginstruction", {
                name: A.procInstName,
                body: A.procInstBody
              }), A.procInstName = A.procInstBody = "", A.state = T.TEXT) : (A.procInstBody += "?" + M, A.state = T.PROC_INST_BODY);
              continue;
            case T.OPEN_TAG:
              S(_, M) ? A.tagName += M : (H(A), M === ">" ? x(A) : M === "/" ? A.state = T.OPEN_TAG_SLASH : (b(M) || j(A, "Invalid character in tag name"), A.state = T.ATTRIB));
              continue;
            case T.OPEN_TAG_SLASH:
              M === ">" ? (x(A, !0), X(A)) : (j(
                A,
                "Forward-slash in opening tag not followed by >"
              ), A.state = T.ATTRIB);
              continue;
            case T.ATTRIB:
              if (b(M))
                continue;
              M === ">" ? x(A) : M === "/" ? A.state = T.OPEN_TAG_SLASH : S(h, M) ? (A.attribName = M, A.attribValue = "", A.state = T.ATTRIB_NAME) : j(A, "Invalid attribute name");
              continue;
            case T.ATTRIB_NAME:
              M === "=" ? A.state = T.ATTRIB_VALUE : M === ">" ? (j(A, "Attribute without value"), A.attribValue = A.attribName, F(A), x(A)) : b(M) ? A.state = T.ATTRIB_NAME_SAW_WHITE : S(_, M) ? A.attribName += M : j(A, "Invalid attribute name");
              continue;
            case T.ATTRIB_NAME_SAW_WHITE:
              if (M === "=")
                A.state = T.ATTRIB_VALUE;
              else {
                if (b(M))
                  continue;
                j(A, "Attribute without value"), A.tag.attributes[A.attribName] = "", A.attribValue = "", U(A, "onattribute", {
                  name: A.attribName,
                  value: ""
                }), A.attribName = "", M === ">" ? x(A) : S(h, M) ? (A.attribName = M, A.state = T.ATTRIB_NAME) : (j(A, "Invalid attribute name"), A.state = T.ATTRIB);
              }
              continue;
            case T.ATTRIB_VALUE:
              if (b(M))
                continue;
              R(M) ? (A.q = M, A.state = T.ATTRIB_VALUE_QUOTED) : (A.opt.unquotedAttributeValues || B(A, "Unquoted attribute value"), A.state = T.ATTRIB_VALUE_UNQUOTED, A.attribValue = M);
              continue;
            case T.ATTRIB_VALUE_QUOTED:
              if (M !== A.q) {
                M === "&" ? A.state = T.ATTRIB_VALUE_ENTITY_Q : A.attribValue += M;
                continue;
              }
              F(A), A.q = "", A.state = T.ATTRIB_VALUE_CLOSED;
              continue;
            case T.ATTRIB_VALUE_CLOSED:
              b(M) ? A.state = T.ATTRIB : M === ">" ? x(A) : M === "/" ? A.state = T.OPEN_TAG_SLASH : S(h, M) ? (j(A, "No whitespace between attributes"), A.attribName = M, A.attribValue = "", A.state = T.ATTRIB_NAME) : j(A, "Invalid attribute name");
              continue;
            case T.ATTRIB_VALUE_UNQUOTED:
              if (!v(M)) {
                M === "&" ? A.state = T.ATTRIB_VALUE_ENTITY_U : A.attribValue += M;
                continue;
              }
              F(A), M === ">" ? x(A) : A.state = T.ATTRIB;
              continue;
            case T.CLOSE_TAG:
              if (A.tagName)
                M === ">" ? X(A) : S(_, M) ? A.tagName += M : A.script ? (A.script += "</" + A.tagName, A.tagName = "", A.state = T.SCRIPT) : (b(M) || j(A, "Invalid tagname in closing tag"), A.state = T.CLOSE_TAG_SAW_WHITE);
              else {
                if (b(M))
                  continue;
                O(h, M) ? A.script ? (A.script += "</" + M, A.state = T.SCRIPT) : j(A, "Invalid tagname in closing tag.") : A.tagName = M;
              }
              continue;
            case T.CLOSE_TAG_SAW_WHITE:
              if (b(M))
                continue;
              M === ">" ? X(A) : j(A, "Invalid characters in closing tag");
              continue;
            case T.TEXT_ENTITY:
            case T.ATTRIB_VALUE_ENTITY_Q:
            case T.ATTRIB_VALUE_ENTITY_U:
              var Q, re;
              switch (A.state) {
                case T.TEXT_ENTITY:
                  Q = T.TEXT, re = "textNode";
                  break;
                case T.ATTRIB_VALUE_ENTITY_Q:
                  Q = T.ATTRIB_VALUE_QUOTED, re = "attribValue";
                  break;
                case T.ATTRIB_VALUE_ENTITY_U:
                  Q = T.ATTRIB_VALUE_UNQUOTED, re = "attribValue";
                  break;
              }
              if (M === ";") {
                var le = G(A);
                A.opt.unparsedEntities && !Object.values(t.XML_ENTITIES).includes(le) ? (A.entity = "", A.state = Q, A.write(le)) : (A[re] += le, A.entity = "", A.state = Q);
              } else S(A.entity.length ? w : g, M) ? A.entity += M : (j(A, "Invalid character in entity name"), A[re] += "&" + A.entity + M, A.entity = "", A.state = Q);
              continue;
            default:
              throw new Error(A, "Unknown state: " + A.state);
          }
        return A.position >= A.bufferCheckPosition && u(A), A;
      }
      String.fromCodePoint || (function() {
        var N = String.fromCharCode, A = Math.floor, J = function() {
          var M = 16384, q = [], z, Q, re = -1, le = arguments.length;
          if (!le)
            return "";
          for (var Se = ""; ++re < le; ) {
            var Te = Number(arguments[re]);
            if (!isFinite(Te) || // `NaN`, `+Infinity`, or `-Infinity`
            Te < 0 || // not a valid Unicode code point
            Te > 1114111 || // not a valid Unicode code point
            A(Te) !== Te)
              throw RangeError("Invalid code point: " + Te);
            Te <= 65535 ? q.push(Te) : (Te -= 65536, z = (Te >> 10) + 55296, Q = Te % 1024 + 56320, q.push(z, Q)), (re + 1 === le || q.length > M) && (Se += N.apply(null, q), q.length = 0);
          }
          return Se;
        };
        Object.defineProperty ? Object.defineProperty(String, "fromCodePoint", {
          value: J,
          configurable: !0,
          writable: !0
        }) : String.fromCodePoint = J;
      })();
    })(e);
  })(no)), no;
}
var ff;
function T_() {
  if (ff) return Er;
  ff = 1, Object.defineProperty(Er, "__esModule", { value: !0 }), Er.XElement = void 0, Er.parseXml = s;
  const e = S_(), t = oa();
  class i {
    constructor(a) {
      if (this.name = a, this.value = "", this.attributes = null, this.isCData = !1, this.elements = null, !a)
        throw (0, t.newError)("Element name cannot be empty", "ERR_XML_ELEMENT_NAME_EMPTY");
      if (!u(a))
        throw (0, t.newError)(`Invalid element name: ${a}`, "ERR_XML_ELEMENT_INVALID_NAME");
    }
    attribute(a) {
      const l = this.attributes === null ? null : this.attributes[a];
      if (l == null)
        throw (0, t.newError)(`No attribute "${a}"`, "ERR_XML_MISSED_ATTRIBUTE");
      return l;
    }
    removeAttribute(a) {
      this.attributes !== null && delete this.attributes[a];
    }
    element(a, l = !1, o = null) {
      const f = this.elementOrNull(a, l);
      if (f === null)
        throw (0, t.newError)(o || `No element "${a}"`, "ERR_XML_MISSED_ELEMENT");
      return f;
    }
    elementOrNull(a, l = !1) {
      if (this.elements === null)
        return null;
      for (const o of this.elements)
        if (n(o, a, l))
          return o;
      return null;
    }
    getElements(a, l = !1) {
      return this.elements === null ? [] : this.elements.filter((o) => n(o, a, l));
    }
    elementValueOrEmpty(a, l = !1) {
      const o = this.elementOrNull(a, l);
      return o === null ? "" : o.value;
    }
  }
  Er.XElement = i;
  const r = new RegExp(/^[A-Za-z_][:A-Za-z0-9_-]*$/i);
  function u(d) {
    return r.test(d);
  }
  function n(d, a, l) {
    const o = d.name;
    return o === a || l === !0 && o.length === a.length && o.toLowerCase() === a.toLowerCase();
  }
  function s(d) {
    let a = null;
    const l = e.parser(!0, {}), o = [];
    return l.onopentag = (f) => {
      const c = new i(f.name);
      if (c.attributes = f.attributes, a === null)
        a = c;
      else {
        const p = o[o.length - 1];
        p.elements == null && (p.elements = []), p.elements.push(c);
      }
      o.push(c);
    }, l.onclosetag = () => {
      o.pop();
    }, l.ontext = (f) => {
      o.length > 0 && (o[o.length - 1].value = f);
    }, l.oncdata = (f) => {
      const c = o[o.length - 1];
      c.value = f, c.isCData = !0;
    }, l.onerror = (f) => {
      throw f;
    }, l.write(d), a;
  }
  return Er;
}
var hf;
function Qe() {
  return hf || (hf = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.CURRENT_APP_PACKAGE_FILE_NAME = e.CURRENT_APP_INSTALLER_FILE_NAME = e.XElement = e.parseXml = e.UUID = e.parseDn = e.retry = e.githubUrl = e.getS3LikeProviderBaseUrl = e.ProgressCallbackTransform = e.MemoLazy = e.safeStringifyJson = e.safeGetHeader = e.parseJson = e.HttpExecutor = e.HttpError = e.DigestTransform = e.createHttpError = e.configureRequestUrl = e.configureRequestOptionsFromUrl = e.configureRequestOptions = e.newError = e.CancellationToken = e.CancellationError = void 0, e.asArray = f;
    var t = ru();
    Object.defineProperty(e, "CancellationError", { enumerable: !0, get: function() {
      return t.CancellationError;
    } }), Object.defineProperty(e, "CancellationToken", { enumerable: !0, get: function() {
      return t.CancellationToken;
    } });
    var i = oa();
    Object.defineProperty(e, "newError", { enumerable: !0, get: function() {
      return i.newError;
    } });
    var r = g_();
    Object.defineProperty(e, "configureRequestOptions", { enumerable: !0, get: function() {
      return r.configureRequestOptions;
    } }), Object.defineProperty(e, "configureRequestOptionsFromUrl", { enumerable: !0, get: function() {
      return r.configureRequestOptionsFromUrl;
    } }), Object.defineProperty(e, "configureRequestUrl", { enumerable: !0, get: function() {
      return r.configureRequestUrl;
    } }), Object.defineProperty(e, "createHttpError", { enumerable: !0, get: function() {
      return r.createHttpError;
    } }), Object.defineProperty(e, "DigestTransform", { enumerable: !0, get: function() {
      return r.DigestTransform;
    } }), Object.defineProperty(e, "HttpError", { enumerable: !0, get: function() {
      return r.HttpError;
    } }), Object.defineProperty(e, "HttpExecutor", { enumerable: !0, get: function() {
      return r.HttpExecutor;
    } }), Object.defineProperty(e, "parseJson", { enumerable: !0, get: function() {
      return r.parseJson;
    } }), Object.defineProperty(e, "safeGetHeader", { enumerable: !0, get: function() {
      return r.safeGetHeader;
    } }), Object.defineProperty(e, "safeStringifyJson", { enumerable: !0, get: function() {
      return r.safeStringifyJson;
    } });
    var u = y_();
    Object.defineProperty(e, "MemoLazy", { enumerable: !0, get: function() {
      return u.MemoLazy;
    } });
    var n = Qh();
    Object.defineProperty(e, "ProgressCallbackTransform", { enumerable: !0, get: function() {
      return n.ProgressCallbackTransform;
    } });
    var s = __();
    Object.defineProperty(e, "getS3LikeProviderBaseUrl", { enumerable: !0, get: function() {
      return s.getS3LikeProviderBaseUrl;
    } }), Object.defineProperty(e, "githubUrl", { enumerable: !0, get: function() {
      return s.githubUrl;
    } });
    var d = E_();
    Object.defineProperty(e, "retry", { enumerable: !0, get: function() {
      return d.retry;
    } });
    var a = v_();
    Object.defineProperty(e, "parseDn", { enumerable: !0, get: function() {
      return a.parseDn;
    } });
    var l = w_();
    Object.defineProperty(e, "UUID", { enumerable: !0, get: function() {
      return l.UUID;
    } });
    var o = T_();
    Object.defineProperty(e, "parseXml", { enumerable: !0, get: function() {
      return o.parseXml;
    } }), Object.defineProperty(e, "XElement", { enumerable: !0, get: function() {
      return o.XElement;
    } }), e.CURRENT_APP_INSTALLER_FILE_NAME = "installer.exe", e.CURRENT_APP_PACKAGE_FILE_NAME = "package.7z";
    function f(c) {
      return c == null ? [] : Array.isArray(c) ? c : [c];
    }
  })(Qs)), Qs;
}
var tt = {}, ji = {}, jt = {}, pf;
function Sn() {
  if (pf) return jt;
  pf = 1;
  function e(s) {
    return typeof s > "u" || s === null;
  }
  function t(s) {
    return typeof s == "object" && s !== null;
  }
  function i(s) {
    return Array.isArray(s) ? s : e(s) ? [] : [s];
  }
  function r(s, d) {
    var a, l, o, f;
    if (d)
      for (f = Object.keys(d), a = 0, l = f.length; a < l; a += 1)
        o = f[a], s[o] = d[o];
    return s;
  }
  function u(s, d) {
    var a = "", l;
    for (l = 0; l < d; l += 1)
      a += s;
    return a;
  }
  function n(s) {
    return s === 0 && Number.NEGATIVE_INFINITY === 1 / s;
  }
  return jt.isNothing = e, jt.isObject = t, jt.toArray = i, jt.repeat = u, jt.isNegativeZero = n, jt.extend = r, jt;
}
var io, mf;
function Tn() {
  if (mf) return io;
  mf = 1;
  function e(i, r) {
    var u = "", n = i.reason || "(unknown reason)";
    return i.mark ? (i.mark.name && (u += 'in "' + i.mark.name + '" '), u += "(" + (i.mark.line + 1) + ":" + (i.mark.column + 1) + ")", !r && i.mark.snippet && (u += `

` + i.mark.snippet), n + " " + u) : n;
  }
  function t(i, r) {
    Error.call(this), this.name = "YAMLException", this.reason = i, this.mark = r, this.message = e(this, !1), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error().stack || "";
  }
  return t.prototype = Object.create(Error.prototype), t.prototype.constructor = t, t.prototype.toString = function(r) {
    return this.name + ": " + e(this, r);
  }, io = t, io;
}
var ao, gf;
function b_() {
  if (gf) return ao;
  gf = 1;
  var e = Sn();
  function t(u, n, s, d, a) {
    var l = "", o = "", f = Math.floor(a / 2) - 1;
    return d - n > f && (l = " ... ", n = d - f + l.length), s - d > f && (o = " ...", s = d + f - o.length), {
      str: l + u.slice(n, s).replace(/\t/g, "→") + o,
      pos: d - n + l.length
      // relative position
    };
  }
  function i(u, n) {
    return e.repeat(" ", n - u.length) + u;
  }
  function r(u, n) {
    if (n = Object.create(n || null), !u.buffer) return null;
    n.maxLength || (n.maxLength = 79), typeof n.indent != "number" && (n.indent = 1), typeof n.linesBefore != "number" && (n.linesBefore = 3), typeof n.linesAfter != "number" && (n.linesAfter = 2);
    for (var s = /\r?\n|\r|\0/g, d = [0], a = [], l, o = -1; l = s.exec(u.buffer); )
      a.push(l.index), d.push(l.index + l[0].length), u.position <= l.index && o < 0 && (o = d.length - 2);
    o < 0 && (o = d.length - 1);
    var f = "", c, p, y = Math.min(u.line + n.linesAfter, a.length).toString().length, E = n.maxLength - (n.indent + y + 3);
    for (c = 1; c <= n.linesBefore && !(o - c < 0); c++)
      p = t(
        u.buffer,
        d[o - c],
        a[o - c],
        u.position - (d[o] - d[o - c]),
        E
      ), f = e.repeat(" ", n.indent) + i((u.line - c + 1).toString(), y) + " | " + p.str + `
` + f;
    for (p = t(u.buffer, d[o], a[o], u.position, E), f += e.repeat(" ", n.indent) + i((u.line + 1).toString(), y) + " | " + p.str + `
`, f += e.repeat("-", n.indent + y + 3 + p.pos) + `^
`, c = 1; c <= n.linesAfter && !(o + c >= a.length); c++)
      p = t(
        u.buffer,
        d[o + c],
        a[o + c],
        u.position - (d[o] - d[o + c]),
        E
      ), f += e.repeat(" ", n.indent) + i((u.line + c + 1).toString(), y) + " | " + p.str + `
`;
    return f.replace(/\n$/, "");
  }
  return ao = r, ao;
}
var so, yf;
function it() {
  if (yf) return so;
  yf = 1;
  var e = Tn(), t = [
    "kind",
    "multi",
    "resolve",
    "construct",
    "instanceOf",
    "predicate",
    "represent",
    "representName",
    "defaultStyle",
    "styleAliases"
  ], i = [
    "scalar",
    "sequence",
    "mapping"
  ];
  function r(n) {
    var s = {};
    return n !== null && Object.keys(n).forEach(function(d) {
      n[d].forEach(function(a) {
        s[String(a)] = d;
      });
    }), s;
  }
  function u(n, s) {
    if (s = s || {}, Object.keys(s).forEach(function(d) {
      if (t.indexOf(d) === -1)
        throw new e('Unknown option "' + d + '" is met in definition of "' + n + '" YAML type.');
    }), this.options = s, this.tag = n, this.kind = s.kind || null, this.resolve = s.resolve || function() {
      return !0;
    }, this.construct = s.construct || function(d) {
      return d;
    }, this.instanceOf = s.instanceOf || null, this.predicate = s.predicate || null, this.represent = s.represent || null, this.representName = s.representName || null, this.defaultStyle = s.defaultStyle || null, this.multi = s.multi || !1, this.styleAliases = r(s.styleAliases || null), i.indexOf(this.kind) === -1)
      throw new e('Unknown kind "' + this.kind + '" is specified for "' + n + '" YAML type.');
  }
  return so = u, so;
}
var oo, _f;
function Zh() {
  if (_f) return oo;
  _f = 1;
  var e = Tn(), t = it();
  function i(n, s) {
    var d = [];
    return n[s].forEach(function(a) {
      var l = d.length;
      d.forEach(function(o, f) {
        o.tag === a.tag && o.kind === a.kind && o.multi === a.multi && (l = f);
      }), d[l] = a;
    }), d;
  }
  function r() {
    var n = {
      scalar: {},
      sequence: {},
      mapping: {},
      fallback: {},
      multi: {
        scalar: [],
        sequence: [],
        mapping: [],
        fallback: []
      }
    }, s, d;
    function a(l) {
      l.multi ? (n.multi[l.kind].push(l), n.multi.fallback.push(l)) : n[l.kind][l.tag] = n.fallback[l.tag] = l;
    }
    for (s = 0, d = arguments.length; s < d; s += 1)
      arguments[s].forEach(a);
    return n;
  }
  function u(n) {
    return this.extend(n);
  }
  return u.prototype.extend = function(s) {
    var d = [], a = [];
    if (s instanceof t)
      a.push(s);
    else if (Array.isArray(s))
      a = a.concat(s);
    else if (s && (Array.isArray(s.implicit) || Array.isArray(s.explicit)))
      s.implicit && (d = d.concat(s.implicit)), s.explicit && (a = a.concat(s.explicit));
    else
      throw new e("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");
    d.forEach(function(o) {
      if (!(o instanceof t))
        throw new e("Specified list of YAML types (or a single Type object) contains a non-Type object.");
      if (o.loadKind && o.loadKind !== "scalar")
        throw new e("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
      if (o.multi)
        throw new e("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.");
    }), a.forEach(function(o) {
      if (!(o instanceof t))
        throw new e("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    });
    var l = Object.create(u.prototype);
    return l.implicit = (this.implicit || []).concat(d), l.explicit = (this.explicit || []).concat(a), l.compiledImplicit = i(l, "implicit"), l.compiledExplicit = i(l, "explicit"), l.compiledTypeMap = r(l.compiledImplicit, l.compiledExplicit), l;
  }, oo = u, oo;
}
var uo, Ef;
function ep() {
  if (Ef) return uo;
  Ef = 1;
  var e = it();
  return uo = new e("tag:yaml.org,2002:str", {
    kind: "scalar",
    construct: function(t) {
      return t !== null ? t : "";
    }
  }), uo;
}
var lo, vf;
function tp() {
  if (vf) return lo;
  vf = 1;
  var e = it();
  return lo = new e("tag:yaml.org,2002:seq", {
    kind: "sequence",
    construct: function(t) {
      return t !== null ? t : [];
    }
  }), lo;
}
var co, wf;
function rp() {
  if (wf) return co;
  wf = 1;
  var e = it();
  return co = new e("tag:yaml.org,2002:map", {
    kind: "mapping",
    construct: function(t) {
      return t !== null ? t : {};
    }
  }), co;
}
var fo, Sf;
function np() {
  if (Sf) return fo;
  Sf = 1;
  var e = Zh();
  return fo = new e({
    explicit: [
      ep(),
      tp(),
      rp()
    ]
  }), fo;
}
var ho, Tf;
function ip() {
  if (Tf) return ho;
  Tf = 1;
  var e = it();
  function t(u) {
    if (u === null) return !0;
    var n = u.length;
    return n === 1 && u === "~" || n === 4 && (u === "null" || u === "Null" || u === "NULL");
  }
  function i() {
    return null;
  }
  function r(u) {
    return u === null;
  }
  return ho = new e("tag:yaml.org,2002:null", {
    kind: "scalar",
    resolve: t,
    construct: i,
    predicate: r,
    represent: {
      canonical: function() {
        return "~";
      },
      lowercase: function() {
        return "null";
      },
      uppercase: function() {
        return "NULL";
      },
      camelcase: function() {
        return "Null";
      },
      empty: function() {
        return "";
      }
    },
    defaultStyle: "lowercase"
  }), ho;
}
var po, bf;
function ap() {
  if (bf) return po;
  bf = 1;
  var e = it();
  function t(u) {
    if (u === null) return !1;
    var n = u.length;
    return n === 4 && (u === "true" || u === "True" || u === "TRUE") || n === 5 && (u === "false" || u === "False" || u === "FALSE");
  }
  function i(u) {
    return u === "true" || u === "True" || u === "TRUE";
  }
  function r(u) {
    return Object.prototype.toString.call(u) === "[object Boolean]";
  }
  return po = new e("tag:yaml.org,2002:bool", {
    kind: "scalar",
    resolve: t,
    construct: i,
    predicate: r,
    represent: {
      lowercase: function(u) {
        return u ? "true" : "false";
      },
      uppercase: function(u) {
        return u ? "TRUE" : "FALSE";
      },
      camelcase: function(u) {
        return u ? "True" : "False";
      }
    },
    defaultStyle: "lowercase"
  }), po;
}
var mo, Rf;
function sp() {
  if (Rf) return mo;
  Rf = 1;
  var e = Sn(), t = it();
  function i(a) {
    return 48 <= a && a <= 57 || 65 <= a && a <= 70 || 97 <= a && a <= 102;
  }
  function r(a) {
    return 48 <= a && a <= 55;
  }
  function u(a) {
    return 48 <= a && a <= 57;
  }
  function n(a) {
    if (a === null) return !1;
    var l = a.length, o = 0, f = !1, c;
    if (!l) return !1;
    if (c = a[o], (c === "-" || c === "+") && (c = a[++o]), c === "0") {
      if (o + 1 === l) return !0;
      if (c = a[++o], c === "b") {
        for (o++; o < l; o++)
          if (c = a[o], c !== "_") {
            if (c !== "0" && c !== "1") return !1;
            f = !0;
          }
        return f && c !== "_";
      }
      if (c === "x") {
        for (o++; o < l; o++)
          if (c = a[o], c !== "_") {
            if (!i(a.charCodeAt(o))) return !1;
            f = !0;
          }
        return f && c !== "_";
      }
      if (c === "o") {
        for (o++; o < l; o++)
          if (c = a[o], c !== "_") {
            if (!r(a.charCodeAt(o))) return !1;
            f = !0;
          }
        return f && c !== "_";
      }
    }
    if (c === "_") return !1;
    for (; o < l; o++)
      if (c = a[o], c !== "_") {
        if (!u(a.charCodeAt(o)))
          return !1;
        f = !0;
      }
    return !(!f || c === "_");
  }
  function s(a) {
    var l = a, o = 1, f;
    if (l.indexOf("_") !== -1 && (l = l.replace(/_/g, "")), f = l[0], (f === "-" || f === "+") && (f === "-" && (o = -1), l = l.slice(1), f = l[0]), l === "0") return 0;
    if (f === "0") {
      if (l[1] === "b") return o * parseInt(l.slice(2), 2);
      if (l[1] === "x") return o * parseInt(l.slice(2), 16);
      if (l[1] === "o") return o * parseInt(l.slice(2), 8);
    }
    return o * parseInt(l, 10);
  }
  function d(a) {
    return Object.prototype.toString.call(a) === "[object Number]" && a % 1 === 0 && !e.isNegativeZero(a);
  }
  return mo = new t("tag:yaml.org,2002:int", {
    kind: "scalar",
    resolve: n,
    construct: s,
    predicate: d,
    represent: {
      binary: function(a) {
        return a >= 0 ? "0b" + a.toString(2) : "-0b" + a.toString(2).slice(1);
      },
      octal: function(a) {
        return a >= 0 ? "0o" + a.toString(8) : "-0o" + a.toString(8).slice(1);
      },
      decimal: function(a) {
        return a.toString(10);
      },
      /* eslint-disable max-len */
      hexadecimal: function(a) {
        return a >= 0 ? "0x" + a.toString(16).toUpperCase() : "-0x" + a.toString(16).toUpperCase().slice(1);
      }
    },
    defaultStyle: "decimal",
    styleAliases: {
      binary: [2, "bin"],
      octal: [8, "oct"],
      decimal: [10, "dec"],
      hexadecimal: [16, "hex"]
    }
  }), mo;
}
var go, Af;
function op() {
  if (Af) return go;
  Af = 1;
  var e = Sn(), t = it(), i = new RegExp(
    // 2.5e4, 2.5 and integers
    "^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$"
  );
  function r(a) {
    return !(a === null || !i.test(a) || // Quick hack to not allow integers end with `_`
    // Probably should update regexp & check speed
    a[a.length - 1] === "_");
  }
  function u(a) {
    var l, o;
    return l = a.replace(/_/g, "").toLowerCase(), o = l[0] === "-" ? -1 : 1, "+-".indexOf(l[0]) >= 0 && (l = l.slice(1)), l === ".inf" ? o === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY : l === ".nan" ? NaN : o * parseFloat(l, 10);
  }
  var n = /^[-+]?[0-9]+e/;
  function s(a, l) {
    var o;
    if (isNaN(a))
      switch (l) {
        case "lowercase":
          return ".nan";
        case "uppercase":
          return ".NAN";
        case "camelcase":
          return ".NaN";
      }
    else if (Number.POSITIVE_INFINITY === a)
      switch (l) {
        case "lowercase":
          return ".inf";
        case "uppercase":
          return ".INF";
        case "camelcase":
          return ".Inf";
      }
    else if (Number.NEGATIVE_INFINITY === a)
      switch (l) {
        case "lowercase":
          return "-.inf";
        case "uppercase":
          return "-.INF";
        case "camelcase":
          return "-.Inf";
      }
    else if (e.isNegativeZero(a))
      return "-0.0";
    return o = a.toString(10), n.test(o) ? o.replace("e", ".e") : o;
  }
  function d(a) {
    return Object.prototype.toString.call(a) === "[object Number]" && (a % 1 !== 0 || e.isNegativeZero(a));
  }
  return go = new t("tag:yaml.org,2002:float", {
    kind: "scalar",
    resolve: r,
    construct: u,
    predicate: d,
    represent: s,
    defaultStyle: "lowercase"
  }), go;
}
var yo, Of;
function up() {
  return Of || (Of = 1, yo = np().extend({
    implicit: [
      ip(),
      ap(),
      sp(),
      op()
    ]
  })), yo;
}
var _o, Nf;
function lp() {
  return Nf || (Nf = 1, _o = up()), _o;
}
var Eo, Pf;
function cp() {
  if (Pf) return Eo;
  Pf = 1;
  var e = it(), t = new RegExp(
    "^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"
  ), i = new RegExp(
    "^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$"
  );
  function r(s) {
    return s === null ? !1 : t.exec(s) !== null || i.exec(s) !== null;
  }
  function u(s) {
    var d, a, l, o, f, c, p, y = 0, E = null, h, _, g;
    if (d = t.exec(s), d === null && (d = i.exec(s)), d === null) throw new Error("Date resolve error");
    if (a = +d[1], l = +d[2] - 1, o = +d[3], !d[4])
      return new Date(Date.UTC(a, l, o));
    if (f = +d[4], c = +d[5], p = +d[6], d[7]) {
      for (y = d[7].slice(0, 3); y.length < 3; )
        y += "0";
      y = +y;
    }
    return d[9] && (h = +d[10], _ = +(d[11] || 0), E = (h * 60 + _) * 6e4, d[9] === "-" && (E = -E)), g = new Date(Date.UTC(a, l, o, f, c, p, y)), E && g.setTime(g.getTime() - E), g;
  }
  function n(s) {
    return s.toISOString();
  }
  return Eo = new e("tag:yaml.org,2002:timestamp", {
    kind: "scalar",
    resolve: r,
    construct: u,
    instanceOf: Date,
    represent: n
  }), Eo;
}
var vo, Cf;
function dp() {
  if (Cf) return vo;
  Cf = 1;
  var e = it();
  function t(i) {
    return i === "<<" || i === null;
  }
  return vo = new e("tag:yaml.org,2002:merge", {
    kind: "scalar",
    resolve: t
  }), vo;
}
var wo, If;
function fp() {
  if (If) return wo;
  If = 1;
  var e = it(), t = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;
  function i(s) {
    if (s === null) return !1;
    var d, a, l = 0, o = s.length, f = t;
    for (a = 0; a < o; a++)
      if (d = f.indexOf(s.charAt(a)), !(d > 64)) {
        if (d < 0) return !1;
        l += 6;
      }
    return l % 8 === 0;
  }
  function r(s) {
    var d, a, l = s.replace(/[\r\n=]/g, ""), o = l.length, f = t, c = 0, p = [];
    for (d = 0; d < o; d++)
      d % 4 === 0 && d && (p.push(c >> 16 & 255), p.push(c >> 8 & 255), p.push(c & 255)), c = c << 6 | f.indexOf(l.charAt(d));
    return a = o % 4 * 6, a === 0 ? (p.push(c >> 16 & 255), p.push(c >> 8 & 255), p.push(c & 255)) : a === 18 ? (p.push(c >> 10 & 255), p.push(c >> 2 & 255)) : a === 12 && p.push(c >> 4 & 255), new Uint8Array(p);
  }
  function u(s) {
    var d = "", a = 0, l, o, f = s.length, c = t;
    for (l = 0; l < f; l++)
      l % 3 === 0 && l && (d += c[a >> 18 & 63], d += c[a >> 12 & 63], d += c[a >> 6 & 63], d += c[a & 63]), a = (a << 8) + s[l];
    return o = f % 3, o === 0 ? (d += c[a >> 18 & 63], d += c[a >> 12 & 63], d += c[a >> 6 & 63], d += c[a & 63]) : o === 2 ? (d += c[a >> 10 & 63], d += c[a >> 4 & 63], d += c[a << 2 & 63], d += c[64]) : o === 1 && (d += c[a >> 2 & 63], d += c[a << 4 & 63], d += c[64], d += c[64]), d;
  }
  function n(s) {
    return Object.prototype.toString.call(s) === "[object Uint8Array]";
  }
  return wo = new e("tag:yaml.org,2002:binary", {
    kind: "scalar",
    resolve: i,
    construct: r,
    predicate: n,
    represent: u
  }), wo;
}
var So, Df;
function hp() {
  if (Df) return So;
  Df = 1;
  var e = it(), t = Object.prototype.hasOwnProperty, i = Object.prototype.toString;
  function r(n) {
    if (n === null) return !0;
    var s = [], d, a, l, o, f, c = n;
    for (d = 0, a = c.length; d < a; d += 1) {
      if (l = c[d], f = !1, i.call(l) !== "[object Object]") return !1;
      for (o in l)
        if (t.call(l, o))
          if (!f) f = !0;
          else return !1;
      if (!f) return !1;
      if (s.indexOf(o) === -1) s.push(o);
      else return !1;
    }
    return !0;
  }
  function u(n) {
    return n !== null ? n : [];
  }
  return So = new e("tag:yaml.org,2002:omap", {
    kind: "sequence",
    resolve: r,
    construct: u
  }), So;
}
var To, $f;
function pp() {
  if ($f) return To;
  $f = 1;
  var e = it(), t = Object.prototype.toString;
  function i(u) {
    if (u === null) return !0;
    var n, s, d, a, l, o = u;
    for (l = new Array(o.length), n = 0, s = o.length; n < s; n += 1) {
      if (d = o[n], t.call(d) !== "[object Object]" || (a = Object.keys(d), a.length !== 1)) return !1;
      l[n] = [a[0], d[a[0]]];
    }
    return !0;
  }
  function r(u) {
    if (u === null) return [];
    var n, s, d, a, l, o = u;
    for (l = new Array(o.length), n = 0, s = o.length; n < s; n += 1)
      d = o[n], a = Object.keys(d), l[n] = [a[0], d[a[0]]];
    return l;
  }
  return To = new e("tag:yaml.org,2002:pairs", {
    kind: "sequence",
    resolve: i,
    construct: r
  }), To;
}
var bo, kf;
function mp() {
  if (kf) return bo;
  kf = 1;
  var e = it(), t = Object.prototype.hasOwnProperty;
  function i(u) {
    if (u === null) return !0;
    var n, s = u;
    for (n in s)
      if (t.call(s, n) && s[n] !== null)
        return !1;
    return !0;
  }
  function r(u) {
    return u !== null ? u : {};
  }
  return bo = new e("tag:yaml.org,2002:set", {
    kind: "mapping",
    resolve: i,
    construct: r
  }), bo;
}
var Ro, Lf;
function nu() {
  return Lf || (Lf = 1, Ro = lp().extend({
    implicit: [
      cp(),
      dp()
    ],
    explicit: [
      fp(),
      hp(),
      pp(),
      mp()
    ]
  })), Ro;
}
var Ff;
function R_() {
  if (Ff) return ji;
  Ff = 1;
  var e = Sn(), t = Tn(), i = b_(), r = nu(), u = Object.prototype.hasOwnProperty, n = 1, s = 2, d = 3, a = 4, l = 1, o = 2, f = 3, c = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/, p = /[\x85\u2028\u2029]/, y = /[,\[\]\{\}]/, E = /^(?:!|!!|![a-z\-]+!)$/i, h = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
  function _(m) {
    return Object.prototype.toString.call(m);
  }
  function g(m) {
    return m === 10 || m === 13;
  }
  function w(m) {
    return m === 9 || m === 32;
  }
  function b(m) {
    return m === 9 || m === 32 || m === 10 || m === 13;
  }
  function R(m) {
    return m === 44 || m === 91 || m === 93 || m === 123 || m === 125;
  }
  function v(m) {
    var Z;
    return 48 <= m && m <= 57 ? m - 48 : (Z = m | 32, 97 <= Z && Z <= 102 ? Z - 97 + 10 : -1);
  }
  function S(m) {
    return m === 120 ? 2 : m === 117 ? 4 : m === 85 ? 8 : 0;
  }
  function O(m) {
    return 48 <= m && m <= 57 ? m - 48 : -1;
  }
  function T(m) {
    return m === 48 ? "\0" : m === 97 ? "\x07" : m === 98 ? "\b" : m === 116 || m === 9 ? "	" : m === 110 ? `
` : m === 118 ? "\v" : m === 102 ? "\f" : m === 114 ? "\r" : m === 101 ? "\x1B" : m === 32 ? " " : m === 34 ? '"' : m === 47 ? "/" : m === 92 ? "\\" : m === 78 ? "" : m === 95 ? " " : m === 76 ? "\u2028" : m === 80 ? "\u2029" : "";
  }
  function $(m) {
    return m <= 65535 ? String.fromCharCode(m) : String.fromCharCode(
      (m - 65536 >> 10) + 55296,
      (m - 65536 & 1023) + 56320
    );
  }
  function k(m, Z, ne) {
    Z === "__proto__" ? Object.defineProperty(m, Z, {
      configurable: !0,
      enumerable: !0,
      writable: !0,
      value: ne
    }) : m[Z] = ne;
  }
  for (var U = new Array(256), V = new Array(256), L = 0; L < 256; L++)
    U[L] = T(L) ? 1 : 0, V[L] = T(L);
  function B(m, Z) {
    this.input = m, this.filename = Z.filename || null, this.schema = Z.schema || r, this.onWarning = Z.onWarning || null, this.legacy = Z.legacy || !1, this.json = Z.json || !1, this.listener = Z.listener || null, this.implicitTypes = this.schema.compiledImplicit, this.typeMap = this.schema.compiledTypeMap, this.length = m.length, this.position = 0, this.line = 0, this.lineStart = 0, this.lineIndent = 0, this.firstTabInLine = -1, this.documents = [];
  }
  function te(m, Z) {
    var ne = {
      name: m.filename,
      buffer: m.input.slice(0, -1),
      // omit trailing \0
      position: m.position,
      line: m.line,
      column: m.position - m.lineStart
    };
    return ne.snippet = i(ne), new t(Z, ne);
  }
  function j(m, Z) {
    throw te(m, Z);
  }
  function H(m, Z) {
    m.onWarning && m.onWarning.call(null, te(m, Z));
  }
  var Y = {
    YAML: function(Z, ne, pe) {
      var ie, he, ce;
      Z.version !== null && j(Z, "duplication of %YAML directive"), pe.length !== 1 && j(Z, "YAML directive accepts exactly one argument"), ie = /^([0-9]+)\.([0-9]+)$/.exec(pe[0]), ie === null && j(Z, "ill-formed argument of the YAML directive"), he = parseInt(ie[1], 10), ce = parseInt(ie[2], 10), he !== 1 && j(Z, "unacceptable YAML version of the document"), Z.version = pe[0], Z.checkLineBreaks = ce < 2, ce !== 1 && ce !== 2 && H(Z, "unsupported YAML version of the document");
    },
    TAG: function(Z, ne, pe) {
      var ie, he;
      pe.length !== 2 && j(Z, "TAG directive accepts exactly two arguments"), ie = pe[0], he = pe[1], E.test(ie) || j(Z, "ill-formed tag handle (first argument) of the TAG directive"), u.call(Z.tagMap, ie) && j(Z, 'there is a previously declared suffix for "' + ie + '" tag handle'), h.test(he) || j(Z, "ill-formed tag prefix (second argument) of the TAG directive");
      try {
        he = decodeURIComponent(he);
      } catch {
        j(Z, "tag prefix is malformed: " + he);
      }
      Z.tagMap[ie] = he;
    }
  };
  function F(m, Z, ne, pe) {
    var ie, he, ce, me;
    if (Z < ne) {
      if (me = m.input.slice(Z, ne), pe)
        for (ie = 0, he = me.length; ie < he; ie += 1)
          ce = me.charCodeAt(ie), ce === 9 || 32 <= ce && ce <= 1114111 || j(m, "expected valid JSON character");
      else c.test(me) && j(m, "the stream contains non-printable characters");
      m.result += me;
    }
  }
  function x(m, Z, ne, pe) {
    var ie, he, ce, me;
    for (e.isObject(ne) || j(m, "cannot merge mappings; the provided source object is unacceptable"), ie = Object.keys(ne), ce = 0, me = ie.length; ce < me; ce += 1)
      he = ie[ce], u.call(Z, he) || (k(Z, he, ne[he]), pe[he] = !0);
  }
  function X(m, Z, ne, pe, ie, he, ce, me, ye) {
    var Pe, Ce;
    if (Array.isArray(ie))
      for (ie = Array.prototype.slice.call(ie), Pe = 0, Ce = ie.length; Pe < Ce; Pe += 1)
        Array.isArray(ie[Pe]) && j(m, "nested arrays are not supported inside keys"), typeof ie == "object" && _(ie[Pe]) === "[object Object]" && (ie[Pe] = "[object Object]");
    if (typeof ie == "object" && _(ie) === "[object Object]" && (ie = "[object Object]"), ie = String(ie), Z === null && (Z = {}), pe === "tag:yaml.org,2002:merge")
      if (Array.isArray(he))
        for (Pe = 0, Ce = he.length; Pe < Ce; Pe += 1)
          x(m, Z, he[Pe], ne);
      else
        x(m, Z, he, ne);
    else
      !m.json && !u.call(ne, ie) && u.call(Z, ie) && (m.line = ce || m.line, m.lineStart = me || m.lineStart, m.position = ye || m.position, j(m, "duplicated mapping key")), k(Z, ie, he), delete ne[ie];
    return Z;
  }
  function G(m) {
    var Z;
    Z = m.input.charCodeAt(m.position), Z === 10 ? m.position++ : Z === 13 ? (m.position++, m.input.charCodeAt(m.position) === 10 && m.position++) : j(m, "a line break is expected"), m.line += 1, m.lineStart = m.position, m.firstTabInLine = -1;
  }
  function P(m, Z, ne) {
    for (var pe = 0, ie = m.input.charCodeAt(m.position); ie !== 0; ) {
      for (; w(ie); )
        ie === 9 && m.firstTabInLine === -1 && (m.firstTabInLine = m.position), ie = m.input.charCodeAt(++m.position);
      if (Z && ie === 35)
        do
          ie = m.input.charCodeAt(++m.position);
        while (ie !== 10 && ie !== 13 && ie !== 0);
      if (g(ie))
        for (G(m), ie = m.input.charCodeAt(m.position), pe++, m.lineIndent = 0; ie === 32; )
          m.lineIndent++, ie = m.input.charCodeAt(++m.position);
      else
        break;
    }
    return ne !== -1 && pe !== 0 && m.lineIndent < ne && H(m, "deficient indentation"), pe;
  }
  function C(m) {
    var Z = m.position, ne;
    return ne = m.input.charCodeAt(Z), !!((ne === 45 || ne === 46) && ne === m.input.charCodeAt(Z + 1) && ne === m.input.charCodeAt(Z + 2) && (Z += 3, ne = m.input.charCodeAt(Z), ne === 0 || b(ne)));
  }
  function K(m, Z) {
    Z === 1 ? m.result += " " : Z > 1 && (m.result += e.repeat(`
`, Z - 1));
  }
  function N(m, Z, ne) {
    var pe, ie, he, ce, me, ye, Pe, Ce, we = m.kind, I = m.result, ee;
    if (ee = m.input.charCodeAt(m.position), b(ee) || R(ee) || ee === 35 || ee === 38 || ee === 42 || ee === 33 || ee === 124 || ee === 62 || ee === 39 || ee === 34 || ee === 37 || ee === 64 || ee === 96 || (ee === 63 || ee === 45) && (ie = m.input.charCodeAt(m.position + 1), b(ie) || ne && R(ie)))
      return !1;
    for (m.kind = "scalar", m.result = "", he = ce = m.position, me = !1; ee !== 0; ) {
      if (ee === 58) {
        if (ie = m.input.charCodeAt(m.position + 1), b(ie) || ne && R(ie))
          break;
      } else if (ee === 35) {
        if (pe = m.input.charCodeAt(m.position - 1), b(pe))
          break;
      } else {
        if (m.position === m.lineStart && C(m) || ne && R(ee))
          break;
        if (g(ee))
          if (ye = m.line, Pe = m.lineStart, Ce = m.lineIndent, P(m, !1, -1), m.lineIndent >= Z) {
            me = !0, ee = m.input.charCodeAt(m.position);
            continue;
          } else {
            m.position = ce, m.line = ye, m.lineStart = Pe, m.lineIndent = Ce;
            break;
          }
      }
      me && (F(m, he, ce, !1), K(m, m.line - ye), he = ce = m.position, me = !1), w(ee) || (ce = m.position + 1), ee = m.input.charCodeAt(++m.position);
    }
    return F(m, he, ce, !1), m.result ? !0 : (m.kind = we, m.result = I, !1);
  }
  function A(m, Z) {
    var ne, pe, ie;
    if (ne = m.input.charCodeAt(m.position), ne !== 39)
      return !1;
    for (m.kind = "scalar", m.result = "", m.position++, pe = ie = m.position; (ne = m.input.charCodeAt(m.position)) !== 0; )
      if (ne === 39)
        if (F(m, pe, m.position, !0), ne = m.input.charCodeAt(++m.position), ne === 39)
          pe = m.position, m.position++, ie = m.position;
        else
          return !0;
      else g(ne) ? (F(m, pe, ie, !0), K(m, P(m, !1, Z)), pe = ie = m.position) : m.position === m.lineStart && C(m) ? j(m, "unexpected end of the document within a single quoted scalar") : (m.position++, ie = m.position);
    j(m, "unexpected end of the stream within a single quoted scalar");
  }
  function J(m, Z) {
    var ne, pe, ie, he, ce, me;
    if (me = m.input.charCodeAt(m.position), me !== 34)
      return !1;
    for (m.kind = "scalar", m.result = "", m.position++, ne = pe = m.position; (me = m.input.charCodeAt(m.position)) !== 0; ) {
      if (me === 34)
        return F(m, ne, m.position, !0), m.position++, !0;
      if (me === 92) {
        if (F(m, ne, m.position, !0), me = m.input.charCodeAt(++m.position), g(me))
          P(m, !1, Z);
        else if (me < 256 && U[me])
          m.result += V[me], m.position++;
        else if ((ce = S(me)) > 0) {
          for (ie = ce, he = 0; ie > 0; ie--)
            me = m.input.charCodeAt(++m.position), (ce = v(me)) >= 0 ? he = (he << 4) + ce : j(m, "expected hexadecimal character");
          m.result += $(he), m.position++;
        } else
          j(m, "unknown escape sequence");
        ne = pe = m.position;
      } else g(me) ? (F(m, ne, pe, !0), K(m, P(m, !1, Z)), ne = pe = m.position) : m.position === m.lineStart && C(m) ? j(m, "unexpected end of the document within a double quoted scalar") : (m.position++, pe = m.position);
    }
    j(m, "unexpected end of the stream within a double quoted scalar");
  }
  function M(m, Z) {
    var ne = !0, pe, ie, he, ce = m.tag, me, ye = m.anchor, Pe, Ce, we, I, ee, ae = /* @__PURE__ */ Object.create(null), se, oe, ge, fe;
    if (fe = m.input.charCodeAt(m.position), fe === 91)
      Ce = 93, ee = !1, me = [];
    else if (fe === 123)
      Ce = 125, ee = !0, me = {};
    else
      return !1;
    for (m.anchor !== null && (m.anchorMap[m.anchor] = me), fe = m.input.charCodeAt(++m.position); fe !== 0; ) {
      if (P(m, !0, Z), fe = m.input.charCodeAt(m.position), fe === Ce)
        return m.position++, m.tag = ce, m.anchor = ye, m.kind = ee ? "mapping" : "sequence", m.result = me, !0;
      ne ? fe === 44 && j(m, "expected the node content, but found ','") : j(m, "missed comma between flow collection entries"), oe = se = ge = null, we = I = !1, fe === 63 && (Pe = m.input.charCodeAt(m.position + 1), b(Pe) && (we = I = !0, m.position++, P(m, !0, Z))), pe = m.line, ie = m.lineStart, he = m.position, Te(m, Z, n, !1, !0), oe = m.tag, se = m.result, P(m, !0, Z), fe = m.input.charCodeAt(m.position), (I || m.line === pe) && fe === 58 && (we = !0, fe = m.input.charCodeAt(++m.position), P(m, !0, Z), Te(m, Z, n, !1, !0), ge = m.result), ee ? X(m, me, ae, oe, se, ge, pe, ie, he) : we ? me.push(X(m, null, ae, oe, se, ge, pe, ie, he)) : me.push(se), P(m, !0, Z), fe = m.input.charCodeAt(m.position), fe === 44 ? (ne = !0, fe = m.input.charCodeAt(++m.position)) : ne = !1;
    }
    j(m, "unexpected end of the stream within a flow collection");
  }
  function q(m, Z) {
    var ne, pe, ie = l, he = !1, ce = !1, me = Z, ye = 0, Pe = !1, Ce, we;
    if (we = m.input.charCodeAt(m.position), we === 124)
      pe = !1;
    else if (we === 62)
      pe = !0;
    else
      return !1;
    for (m.kind = "scalar", m.result = ""; we !== 0; )
      if (we = m.input.charCodeAt(++m.position), we === 43 || we === 45)
        l === ie ? ie = we === 43 ? f : o : j(m, "repeat of a chomping mode identifier");
      else if ((Ce = O(we)) >= 0)
        Ce === 0 ? j(m, "bad explicit indentation width of a block scalar; it cannot be less than one") : ce ? j(m, "repeat of an indentation width identifier") : (me = Z + Ce - 1, ce = !0);
      else
        break;
    if (w(we)) {
      do
        we = m.input.charCodeAt(++m.position);
      while (w(we));
      if (we === 35)
        do
          we = m.input.charCodeAt(++m.position);
        while (!g(we) && we !== 0);
    }
    for (; we !== 0; ) {
      for (G(m), m.lineIndent = 0, we = m.input.charCodeAt(m.position); (!ce || m.lineIndent < me) && we === 32; )
        m.lineIndent++, we = m.input.charCodeAt(++m.position);
      if (!ce && m.lineIndent > me && (me = m.lineIndent), g(we)) {
        ye++;
        continue;
      }
      if (m.lineIndent < me) {
        ie === f ? m.result += e.repeat(`
`, he ? 1 + ye : ye) : ie === l && he && (m.result += `
`);
        break;
      }
      for (pe ? w(we) ? (Pe = !0, m.result += e.repeat(`
`, he ? 1 + ye : ye)) : Pe ? (Pe = !1, m.result += e.repeat(`
`, ye + 1)) : ye === 0 ? he && (m.result += " ") : m.result += e.repeat(`
`, ye) : m.result += e.repeat(`
`, he ? 1 + ye : ye), he = !0, ce = !0, ye = 0, ne = m.position; !g(we) && we !== 0; )
        we = m.input.charCodeAt(++m.position);
      F(m, ne, m.position, !1);
    }
    return !0;
  }
  function z(m, Z) {
    var ne, pe = m.tag, ie = m.anchor, he = [], ce, me = !1, ye;
    if (m.firstTabInLine !== -1) return !1;
    for (m.anchor !== null && (m.anchorMap[m.anchor] = he), ye = m.input.charCodeAt(m.position); ye !== 0 && (m.firstTabInLine !== -1 && (m.position = m.firstTabInLine, j(m, "tab characters must not be used in indentation")), !(ye !== 45 || (ce = m.input.charCodeAt(m.position + 1), !b(ce)))); ) {
      if (me = !0, m.position++, P(m, !0, -1) && m.lineIndent <= Z) {
        he.push(null), ye = m.input.charCodeAt(m.position);
        continue;
      }
      if (ne = m.line, Te(m, Z, d, !1, !0), he.push(m.result), P(m, !0, -1), ye = m.input.charCodeAt(m.position), (m.line === ne || m.lineIndent > Z) && ye !== 0)
        j(m, "bad indentation of a sequence entry");
      else if (m.lineIndent < Z)
        break;
    }
    return me ? (m.tag = pe, m.anchor = ie, m.kind = "sequence", m.result = he, !0) : !1;
  }
  function Q(m, Z, ne) {
    var pe, ie, he, ce, me, ye, Pe = m.tag, Ce = m.anchor, we = {}, I = /* @__PURE__ */ Object.create(null), ee = null, ae = null, se = null, oe = !1, ge = !1, fe;
    if (m.firstTabInLine !== -1) return !1;
    for (m.anchor !== null && (m.anchorMap[m.anchor] = we), fe = m.input.charCodeAt(m.position); fe !== 0; ) {
      if (!oe && m.firstTabInLine !== -1 && (m.position = m.firstTabInLine, j(m, "tab characters must not be used in indentation")), pe = m.input.charCodeAt(m.position + 1), he = m.line, (fe === 63 || fe === 58) && b(pe))
        fe === 63 ? (oe && (X(m, we, I, ee, ae, null, ce, me, ye), ee = ae = se = null), ge = !0, oe = !0, ie = !0) : oe ? (oe = !1, ie = !0) : j(m, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"), m.position += 1, fe = pe;
      else {
        if (ce = m.line, me = m.lineStart, ye = m.position, !Te(m, ne, s, !1, !0))
          break;
        if (m.line === he) {
          for (fe = m.input.charCodeAt(m.position); w(fe); )
            fe = m.input.charCodeAt(++m.position);
          if (fe === 58)
            fe = m.input.charCodeAt(++m.position), b(fe) || j(m, "a whitespace character is expected after the key-value separator within a block mapping"), oe && (X(m, we, I, ee, ae, null, ce, me, ye), ee = ae = se = null), ge = !0, oe = !1, ie = !1, ee = m.tag, ae = m.result;
          else if (ge)
            j(m, "can not read an implicit mapping pair; a colon is missed");
          else
            return m.tag = Pe, m.anchor = Ce, !0;
        } else if (ge)
          j(m, "can not read a block mapping entry; a multiline key may not be an implicit key");
        else
          return m.tag = Pe, m.anchor = Ce, !0;
      }
      if ((m.line === he || m.lineIndent > Z) && (oe && (ce = m.line, me = m.lineStart, ye = m.position), Te(m, Z, a, !0, ie) && (oe ? ae = m.result : se = m.result), oe || (X(m, we, I, ee, ae, se, ce, me, ye), ee = ae = se = null), P(m, !0, -1), fe = m.input.charCodeAt(m.position)), (m.line === he || m.lineIndent > Z) && fe !== 0)
        j(m, "bad indentation of a mapping entry");
      else if (m.lineIndent < Z)
        break;
    }
    return oe && X(m, we, I, ee, ae, null, ce, me, ye), ge && (m.tag = Pe, m.anchor = Ce, m.kind = "mapping", m.result = we), ge;
  }
  function re(m) {
    var Z, ne = !1, pe = !1, ie, he, ce;
    if (ce = m.input.charCodeAt(m.position), ce !== 33) return !1;
    if (m.tag !== null && j(m, "duplication of a tag property"), ce = m.input.charCodeAt(++m.position), ce === 60 ? (ne = !0, ce = m.input.charCodeAt(++m.position)) : ce === 33 ? (pe = !0, ie = "!!", ce = m.input.charCodeAt(++m.position)) : ie = "!", Z = m.position, ne) {
      do
        ce = m.input.charCodeAt(++m.position);
      while (ce !== 0 && ce !== 62);
      m.position < m.length ? (he = m.input.slice(Z, m.position), ce = m.input.charCodeAt(++m.position)) : j(m, "unexpected end of the stream within a verbatim tag");
    } else {
      for (; ce !== 0 && !b(ce); )
        ce === 33 && (pe ? j(m, "tag suffix cannot contain exclamation marks") : (ie = m.input.slice(Z - 1, m.position + 1), E.test(ie) || j(m, "named tag handle cannot contain such characters"), pe = !0, Z = m.position + 1)), ce = m.input.charCodeAt(++m.position);
      he = m.input.slice(Z, m.position), y.test(he) && j(m, "tag suffix cannot contain flow indicator characters");
    }
    he && !h.test(he) && j(m, "tag name cannot contain such characters: " + he);
    try {
      he = decodeURIComponent(he);
    } catch {
      j(m, "tag name is malformed: " + he);
    }
    return ne ? m.tag = he : u.call(m.tagMap, ie) ? m.tag = m.tagMap[ie] + he : ie === "!" ? m.tag = "!" + he : ie === "!!" ? m.tag = "tag:yaml.org,2002:" + he : j(m, 'undeclared tag handle "' + ie + '"'), !0;
  }
  function le(m) {
    var Z, ne;
    if (ne = m.input.charCodeAt(m.position), ne !== 38) return !1;
    for (m.anchor !== null && j(m, "duplication of an anchor property"), ne = m.input.charCodeAt(++m.position), Z = m.position; ne !== 0 && !b(ne) && !R(ne); )
      ne = m.input.charCodeAt(++m.position);
    return m.position === Z && j(m, "name of an anchor node must contain at least one character"), m.anchor = m.input.slice(Z, m.position), !0;
  }
  function Se(m) {
    var Z, ne, pe;
    if (pe = m.input.charCodeAt(m.position), pe !== 42) return !1;
    for (pe = m.input.charCodeAt(++m.position), Z = m.position; pe !== 0 && !b(pe) && !R(pe); )
      pe = m.input.charCodeAt(++m.position);
    return m.position === Z && j(m, "name of an alias node must contain at least one character"), ne = m.input.slice(Z, m.position), u.call(m.anchorMap, ne) || j(m, 'unidentified alias "' + ne + '"'), m.result = m.anchorMap[ne], P(m, !0, -1), !0;
  }
  function Te(m, Z, ne, pe, ie) {
    var he, ce, me, ye = 1, Pe = !1, Ce = !1, we, I, ee, ae, se, oe;
    if (m.listener !== null && m.listener("open", m), m.tag = null, m.anchor = null, m.kind = null, m.result = null, he = ce = me = a === ne || d === ne, pe && P(m, !0, -1) && (Pe = !0, m.lineIndent > Z ? ye = 1 : m.lineIndent === Z ? ye = 0 : m.lineIndent < Z && (ye = -1)), ye === 1)
      for (; re(m) || le(m); )
        P(m, !0, -1) ? (Pe = !0, me = he, m.lineIndent > Z ? ye = 1 : m.lineIndent === Z ? ye = 0 : m.lineIndent < Z && (ye = -1)) : me = !1;
    if (me && (me = Pe || ie), (ye === 1 || a === ne) && (n === ne || s === ne ? se = Z : se = Z + 1, oe = m.position - m.lineStart, ye === 1 ? me && (z(m, oe) || Q(m, oe, se)) || M(m, se) ? Ce = !0 : (ce && q(m, se) || A(m, se) || J(m, se) ? Ce = !0 : Se(m) ? (Ce = !0, (m.tag !== null || m.anchor !== null) && j(m, "alias node should not have any properties")) : N(m, se, n === ne) && (Ce = !0, m.tag === null && (m.tag = "?")), m.anchor !== null && (m.anchorMap[m.anchor] = m.result)) : ye === 0 && (Ce = me && z(m, oe))), m.tag === null)
      m.anchor !== null && (m.anchorMap[m.anchor] = m.result);
    else if (m.tag === "?") {
      for (m.result !== null && m.kind !== "scalar" && j(m, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + m.kind + '"'), we = 0, I = m.implicitTypes.length; we < I; we += 1)
        if (ae = m.implicitTypes[we], ae.resolve(m.result)) {
          m.result = ae.construct(m.result), m.tag = ae.tag, m.anchor !== null && (m.anchorMap[m.anchor] = m.result);
          break;
        }
    } else if (m.tag !== "!") {
      if (u.call(m.typeMap[m.kind || "fallback"], m.tag))
        ae = m.typeMap[m.kind || "fallback"][m.tag];
      else
        for (ae = null, ee = m.typeMap.multi[m.kind || "fallback"], we = 0, I = ee.length; we < I; we += 1)
          if (m.tag.slice(0, ee[we].tag.length) === ee[we].tag) {
            ae = ee[we];
            break;
          }
      ae || j(m, "unknown tag !<" + m.tag + ">"), m.result !== null && ae.kind !== m.kind && j(m, "unacceptable node kind for !<" + m.tag + '> tag; it should be "' + ae.kind + '", not "' + m.kind + '"'), ae.resolve(m.result, m.tag) ? (m.result = ae.construct(m.result, m.tag), m.anchor !== null && (m.anchorMap[m.anchor] = m.result)) : j(m, "cannot resolve a node with !<" + m.tag + "> explicit tag");
    }
    return m.listener !== null && m.listener("close", m), m.tag !== null || m.anchor !== null || Ce;
  }
  function Fe(m) {
    var Z = m.position, ne, pe, ie, he = !1, ce;
    for (m.version = null, m.checkLineBreaks = m.legacy, m.tagMap = /* @__PURE__ */ Object.create(null), m.anchorMap = /* @__PURE__ */ Object.create(null); (ce = m.input.charCodeAt(m.position)) !== 0 && (P(m, !0, -1), ce = m.input.charCodeAt(m.position), !(m.lineIndent > 0 || ce !== 37)); ) {
      for (he = !0, ce = m.input.charCodeAt(++m.position), ne = m.position; ce !== 0 && !b(ce); )
        ce = m.input.charCodeAt(++m.position);
      for (pe = m.input.slice(ne, m.position), ie = [], pe.length < 1 && j(m, "directive name must not be less than one character in length"); ce !== 0; ) {
        for (; w(ce); )
          ce = m.input.charCodeAt(++m.position);
        if (ce === 35) {
          do
            ce = m.input.charCodeAt(++m.position);
          while (ce !== 0 && !g(ce));
          break;
        }
        if (g(ce)) break;
        for (ne = m.position; ce !== 0 && !b(ce); )
          ce = m.input.charCodeAt(++m.position);
        ie.push(m.input.slice(ne, m.position));
      }
      ce !== 0 && G(m), u.call(Y, pe) ? Y[pe](m, pe, ie) : H(m, 'unknown document directive "' + pe + '"');
    }
    if (P(m, !0, -1), m.lineIndent === 0 && m.input.charCodeAt(m.position) === 45 && m.input.charCodeAt(m.position + 1) === 45 && m.input.charCodeAt(m.position + 2) === 45 ? (m.position += 3, P(m, !0, -1)) : he && j(m, "directives end mark is expected"), Te(m, m.lineIndent - 1, a, !1, !0), P(m, !0, -1), m.checkLineBreaks && p.test(m.input.slice(Z, m.position)) && H(m, "non-ASCII line breaks are interpreted as content"), m.documents.push(m.result), m.position === m.lineStart && C(m)) {
      m.input.charCodeAt(m.position) === 46 && (m.position += 3, P(m, !0, -1));
      return;
    }
    if (m.position < m.length - 1)
      j(m, "end of the stream or a document separator is expected");
    else
      return;
  }
  function He(m, Z) {
    m = String(m), Z = Z || {}, m.length !== 0 && (m.charCodeAt(m.length - 1) !== 10 && m.charCodeAt(m.length - 1) !== 13 && (m += `
`), m.charCodeAt(0) === 65279 && (m = m.slice(1)));
    var ne = new B(m, Z), pe = m.indexOf("\0");
    for (pe !== -1 && (ne.position = pe, j(ne, "null byte is not allowed in input")), ne.input += "\0"; ne.input.charCodeAt(ne.position) === 32; )
      ne.lineIndent += 1, ne.position += 1;
    for (; ne.position < ne.length - 1; )
      Fe(ne);
    return ne.documents;
  }
  function Be(m, Z, ne) {
    Z !== null && typeof Z == "object" && typeof ne > "u" && (ne = Z, Z = null);
    var pe = He(m, ne);
    if (typeof Z != "function")
      return pe;
    for (var ie = 0, he = pe.length; ie < he; ie += 1)
      Z(pe[ie]);
  }
  function Le(m, Z) {
    var ne = He(m, Z);
    if (ne.length !== 0) {
      if (ne.length === 1)
        return ne[0];
      throw new t("expected a single document in the stream, but found more");
    }
  }
  return ji.loadAll = Be, ji.load = Le, ji;
}
var Ao = {}, Uf;
function A_() {
  if (Uf) return Ao;
  Uf = 1;
  var e = Sn(), t = Tn(), i = nu(), r = Object.prototype.toString, u = Object.prototype.hasOwnProperty, n = 65279, s = 9, d = 10, a = 13, l = 32, o = 33, f = 34, c = 35, p = 37, y = 38, E = 39, h = 42, _ = 44, g = 45, w = 58, b = 61, R = 62, v = 63, S = 64, O = 91, T = 93, $ = 96, k = 123, U = 124, V = 125, L = {};
  L[0] = "\\0", L[7] = "\\a", L[8] = "\\b", L[9] = "\\t", L[10] = "\\n", L[11] = "\\v", L[12] = "\\f", L[13] = "\\r", L[27] = "\\e", L[34] = '\\"', L[92] = "\\\\", L[133] = "\\N", L[160] = "\\_", L[8232] = "\\L", L[8233] = "\\P";
  var B = [
    "y",
    "Y",
    "yes",
    "Yes",
    "YES",
    "on",
    "On",
    "ON",
    "n",
    "N",
    "no",
    "No",
    "NO",
    "off",
    "Off",
    "OFF"
  ], te = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;
  function j(I, ee) {
    var ae, se, oe, ge, fe, _e, ve;
    if (ee === null) return {};
    for (ae = {}, se = Object.keys(ee), oe = 0, ge = se.length; oe < ge; oe += 1)
      fe = se[oe], _e = String(ee[fe]), fe.slice(0, 2) === "!!" && (fe = "tag:yaml.org,2002:" + fe.slice(2)), ve = I.compiledTypeMap.fallback[fe], ve && u.call(ve.styleAliases, _e) && (_e = ve.styleAliases[_e]), ae[fe] = _e;
    return ae;
  }
  function H(I) {
    var ee, ae, se;
    if (ee = I.toString(16).toUpperCase(), I <= 255)
      ae = "x", se = 2;
    else if (I <= 65535)
      ae = "u", se = 4;
    else if (I <= 4294967295)
      ae = "U", se = 8;
    else
      throw new t("code point within a string may not be greater than 0xFFFFFFFF");
    return "\\" + ae + e.repeat("0", se - ee.length) + ee;
  }
  var Y = 1, F = 2;
  function x(I) {
    this.schema = I.schema || i, this.indent = Math.max(1, I.indent || 2), this.noArrayIndent = I.noArrayIndent || !1, this.skipInvalid = I.skipInvalid || !1, this.flowLevel = e.isNothing(I.flowLevel) ? -1 : I.flowLevel, this.styleMap = j(this.schema, I.styles || null), this.sortKeys = I.sortKeys || !1, this.lineWidth = I.lineWidth || 80, this.noRefs = I.noRefs || !1, this.noCompatMode = I.noCompatMode || !1, this.condenseFlow = I.condenseFlow || !1, this.quotingType = I.quotingType === '"' ? F : Y, this.forceQuotes = I.forceQuotes || !1, this.replacer = typeof I.replacer == "function" ? I.replacer : null, this.implicitTypes = this.schema.compiledImplicit, this.explicitTypes = this.schema.compiledExplicit, this.tag = null, this.result = "", this.duplicates = [], this.usedDuplicates = null;
  }
  function X(I, ee) {
    for (var ae = e.repeat(" ", ee), se = 0, oe = -1, ge = "", fe, _e = I.length; se < _e; )
      oe = I.indexOf(`
`, se), oe === -1 ? (fe = I.slice(se), se = _e) : (fe = I.slice(se, oe + 1), se = oe + 1), fe.length && fe !== `
` && (ge += ae), ge += fe;
    return ge;
  }
  function G(I, ee) {
    return `
` + e.repeat(" ", I.indent * ee);
  }
  function P(I, ee) {
    var ae, se, oe;
    for (ae = 0, se = I.implicitTypes.length; ae < se; ae += 1)
      if (oe = I.implicitTypes[ae], oe.resolve(ee))
        return !0;
    return !1;
  }
  function C(I) {
    return I === l || I === s;
  }
  function K(I) {
    return 32 <= I && I <= 126 || 161 <= I && I <= 55295 && I !== 8232 && I !== 8233 || 57344 <= I && I <= 65533 && I !== n || 65536 <= I && I <= 1114111;
  }
  function N(I) {
    return K(I) && I !== n && I !== a && I !== d;
  }
  function A(I, ee, ae) {
    var se = N(I), oe = se && !C(I);
    return (
      // ns-plain-safe
      (ae ? (
        // c = flow-in
        se
      ) : se && I !== _ && I !== O && I !== T && I !== k && I !== V) && I !== c && !(ee === w && !oe) || N(ee) && !C(ee) && I === c || ee === w && oe
    );
  }
  function J(I) {
    return K(I) && I !== n && !C(I) && I !== g && I !== v && I !== w && I !== _ && I !== O && I !== T && I !== k && I !== V && I !== c && I !== y && I !== h && I !== o && I !== U && I !== b && I !== R && I !== E && I !== f && I !== p && I !== S && I !== $;
  }
  function M(I) {
    return !C(I) && I !== w;
  }
  function q(I, ee) {
    var ae = I.charCodeAt(ee), se;
    return ae >= 55296 && ae <= 56319 && ee + 1 < I.length && (se = I.charCodeAt(ee + 1), se >= 56320 && se <= 57343) ? (ae - 55296) * 1024 + se - 56320 + 65536 : ae;
  }
  function z(I) {
    var ee = /^\n* /;
    return ee.test(I);
  }
  var Q = 1, re = 2, le = 3, Se = 4, Te = 5;
  function Fe(I, ee, ae, se, oe, ge, fe, _e) {
    var ve, be = 0, qe = null, Ve = !1, De = !1, mr = se !== -1, gt = -1, Kt = J(q(I, 0)) && M(q(I, I.length - 1));
    if (ee || fe)
      for (ve = 0; ve < I.length; be >= 65536 ? ve += 2 : ve++) {
        if (be = q(I, ve), !K(be))
          return Te;
        Kt = Kt && A(be, qe, _e), qe = be;
      }
    else {
      for (ve = 0; ve < I.length; be >= 65536 ? ve += 2 : ve++) {
        if (be = q(I, ve), be === d)
          Ve = !0, mr && (De = De || // Foldable line = too long, and not more-indented.
          ve - gt - 1 > se && I[gt + 1] !== " ", gt = ve);
        else if (!K(be))
          return Te;
        Kt = Kt && A(be, qe, _e), qe = be;
      }
      De = De || mr && ve - gt - 1 > se && I[gt + 1] !== " ";
    }
    return !Ve && !De ? Kt && !fe && !oe(I) ? Q : ge === F ? Te : re : ae > 9 && z(I) ? Te : fe ? ge === F ? Te : re : De ? Se : le;
  }
  function He(I, ee, ae, se, oe) {
    I.dump = (function() {
      if (ee.length === 0)
        return I.quotingType === F ? '""' : "''";
      if (!I.noCompatMode && (B.indexOf(ee) !== -1 || te.test(ee)))
        return I.quotingType === F ? '"' + ee + '"' : "'" + ee + "'";
      var ge = I.indent * Math.max(1, ae), fe = I.lineWidth === -1 ? -1 : Math.max(Math.min(I.lineWidth, 40), I.lineWidth - ge), _e = se || I.flowLevel > -1 && ae >= I.flowLevel;
      function ve(be) {
        return P(I, be);
      }
      switch (Fe(
        ee,
        _e,
        I.indent,
        fe,
        ve,
        I.quotingType,
        I.forceQuotes && !se,
        oe
      )) {
        case Q:
          return ee;
        case re:
          return "'" + ee.replace(/'/g, "''") + "'";
        case le:
          return "|" + Be(ee, I.indent) + Le(X(ee, ge));
        case Se:
          return ">" + Be(ee, I.indent) + Le(X(m(ee, fe), ge));
        case Te:
          return '"' + ne(ee) + '"';
        default:
          throw new t("impossible error: invalid scalar style");
      }
    })();
  }
  function Be(I, ee) {
    var ae = z(I) ? String(ee) : "", se = I[I.length - 1] === `
`, oe = se && (I[I.length - 2] === `
` || I === `
`), ge = oe ? "+" : se ? "" : "-";
    return ae + ge + `
`;
  }
  function Le(I) {
    return I[I.length - 1] === `
` ? I.slice(0, -1) : I;
  }
  function m(I, ee) {
    for (var ae = /(\n+)([^\n]*)/g, se = (function() {
      var be = I.indexOf(`
`);
      return be = be !== -1 ? be : I.length, ae.lastIndex = be, Z(I.slice(0, be), ee);
    })(), oe = I[0] === `
` || I[0] === " ", ge, fe; fe = ae.exec(I); ) {
      var _e = fe[1], ve = fe[2];
      ge = ve[0] === " ", se += _e + (!oe && !ge && ve !== "" ? `
` : "") + Z(ve, ee), oe = ge;
    }
    return se;
  }
  function Z(I, ee) {
    if (I === "" || I[0] === " ") return I;
    for (var ae = / [^ ]/g, se, oe = 0, ge, fe = 0, _e = 0, ve = ""; se = ae.exec(I); )
      _e = se.index, _e - oe > ee && (ge = fe > oe ? fe : _e, ve += `
` + I.slice(oe, ge), oe = ge + 1), fe = _e;
    return ve += `
`, I.length - oe > ee && fe > oe ? ve += I.slice(oe, fe) + `
` + I.slice(fe + 1) : ve += I.slice(oe), ve.slice(1);
  }
  function ne(I) {
    for (var ee = "", ae = 0, se, oe = 0; oe < I.length; ae >= 65536 ? oe += 2 : oe++)
      ae = q(I, oe), se = L[ae], !se && K(ae) ? (ee += I[oe], ae >= 65536 && (ee += I[oe + 1])) : ee += se || H(ae);
    return ee;
  }
  function pe(I, ee, ae) {
    var se = "", oe = I.tag, ge, fe, _e;
    for (ge = 0, fe = ae.length; ge < fe; ge += 1)
      _e = ae[ge], I.replacer && (_e = I.replacer.call(ae, String(ge), _e)), (ye(I, ee, _e, !1, !1) || typeof _e > "u" && ye(I, ee, null, !1, !1)) && (se !== "" && (se += "," + (I.condenseFlow ? "" : " ")), se += I.dump);
    I.tag = oe, I.dump = "[" + se + "]";
  }
  function ie(I, ee, ae, se) {
    var oe = "", ge = I.tag, fe, _e, ve;
    for (fe = 0, _e = ae.length; fe < _e; fe += 1)
      ve = ae[fe], I.replacer && (ve = I.replacer.call(ae, String(fe), ve)), (ye(I, ee + 1, ve, !0, !0, !1, !0) || typeof ve > "u" && ye(I, ee + 1, null, !0, !0, !1, !0)) && ((!se || oe !== "") && (oe += G(I, ee)), I.dump && d === I.dump.charCodeAt(0) ? oe += "-" : oe += "- ", oe += I.dump);
    I.tag = ge, I.dump = oe || "[]";
  }
  function he(I, ee, ae) {
    var se = "", oe = I.tag, ge = Object.keys(ae), fe, _e, ve, be, qe;
    for (fe = 0, _e = ge.length; fe < _e; fe += 1)
      qe = "", se !== "" && (qe += ", "), I.condenseFlow && (qe += '"'), ve = ge[fe], be = ae[ve], I.replacer && (be = I.replacer.call(ae, ve, be)), ye(I, ee, ve, !1, !1) && (I.dump.length > 1024 && (qe += "? "), qe += I.dump + (I.condenseFlow ? '"' : "") + ":" + (I.condenseFlow ? "" : " "), ye(I, ee, be, !1, !1) && (qe += I.dump, se += qe));
    I.tag = oe, I.dump = "{" + se + "}";
  }
  function ce(I, ee, ae, se) {
    var oe = "", ge = I.tag, fe = Object.keys(ae), _e, ve, be, qe, Ve, De;
    if (I.sortKeys === !0)
      fe.sort();
    else if (typeof I.sortKeys == "function")
      fe.sort(I.sortKeys);
    else if (I.sortKeys)
      throw new t("sortKeys must be a boolean or a function");
    for (_e = 0, ve = fe.length; _e < ve; _e += 1)
      De = "", (!se || oe !== "") && (De += G(I, ee)), be = fe[_e], qe = ae[be], I.replacer && (qe = I.replacer.call(ae, be, qe)), ye(I, ee + 1, be, !0, !0, !0) && (Ve = I.tag !== null && I.tag !== "?" || I.dump && I.dump.length > 1024, Ve && (I.dump && d === I.dump.charCodeAt(0) ? De += "?" : De += "? "), De += I.dump, Ve && (De += G(I, ee)), ye(I, ee + 1, qe, !0, Ve) && (I.dump && d === I.dump.charCodeAt(0) ? De += ":" : De += ": ", De += I.dump, oe += De));
    I.tag = ge, I.dump = oe || "{}";
  }
  function me(I, ee, ae) {
    var se, oe, ge, fe, _e, ve;
    for (oe = ae ? I.explicitTypes : I.implicitTypes, ge = 0, fe = oe.length; ge < fe; ge += 1)
      if (_e = oe[ge], (_e.instanceOf || _e.predicate) && (!_e.instanceOf || typeof ee == "object" && ee instanceof _e.instanceOf) && (!_e.predicate || _e.predicate(ee))) {
        if (ae ? _e.multi && _e.representName ? I.tag = _e.representName(ee) : I.tag = _e.tag : I.tag = "?", _e.represent) {
          if (ve = I.styleMap[_e.tag] || _e.defaultStyle, r.call(_e.represent) === "[object Function]")
            se = _e.represent(ee, ve);
          else if (u.call(_e.represent, ve))
            se = _e.represent[ve](ee, ve);
          else
            throw new t("!<" + _e.tag + '> tag resolver accepts not "' + ve + '" style');
          I.dump = se;
        }
        return !0;
      }
    return !1;
  }
  function ye(I, ee, ae, se, oe, ge, fe) {
    I.tag = null, I.dump = ae, me(I, ae, !1) || me(I, ae, !0);
    var _e = r.call(I.dump), ve = se, be;
    se && (se = I.flowLevel < 0 || I.flowLevel > ee);
    var qe = _e === "[object Object]" || _e === "[object Array]", Ve, De;
    if (qe && (Ve = I.duplicates.indexOf(ae), De = Ve !== -1), (I.tag !== null && I.tag !== "?" || De || I.indent !== 2 && ee > 0) && (oe = !1), De && I.usedDuplicates[Ve])
      I.dump = "*ref_" + Ve;
    else {
      if (qe && De && !I.usedDuplicates[Ve] && (I.usedDuplicates[Ve] = !0), _e === "[object Object]")
        se && Object.keys(I.dump).length !== 0 ? (ce(I, ee, I.dump, oe), De && (I.dump = "&ref_" + Ve + I.dump)) : (he(I, ee, I.dump), De && (I.dump = "&ref_" + Ve + " " + I.dump));
      else if (_e === "[object Array]")
        se && I.dump.length !== 0 ? (I.noArrayIndent && !fe && ee > 0 ? ie(I, ee - 1, I.dump, oe) : ie(I, ee, I.dump, oe), De && (I.dump = "&ref_" + Ve + I.dump)) : (pe(I, ee, I.dump), De && (I.dump = "&ref_" + Ve + " " + I.dump));
      else if (_e === "[object String]")
        I.tag !== "?" && He(I, I.dump, ee, ge, ve);
      else {
        if (_e === "[object Undefined]")
          return !1;
        if (I.skipInvalid) return !1;
        throw new t("unacceptable kind of an object to dump " + _e);
      }
      I.tag !== null && I.tag !== "?" && (be = encodeURI(
        I.tag[0] === "!" ? I.tag.slice(1) : I.tag
      ).replace(/!/g, "%21"), I.tag[0] === "!" ? be = "!" + be : be.slice(0, 18) === "tag:yaml.org,2002:" ? be = "!!" + be.slice(18) : be = "!<" + be + ">", I.dump = be + " " + I.dump);
    }
    return !0;
  }
  function Pe(I, ee) {
    var ae = [], se = [], oe, ge;
    for (Ce(I, ae, se), oe = 0, ge = se.length; oe < ge; oe += 1)
      ee.duplicates.push(ae[se[oe]]);
    ee.usedDuplicates = new Array(ge);
  }
  function Ce(I, ee, ae) {
    var se, oe, ge;
    if (I !== null && typeof I == "object")
      if (oe = ee.indexOf(I), oe !== -1)
        ae.indexOf(oe) === -1 && ae.push(oe);
      else if (ee.push(I), Array.isArray(I))
        for (oe = 0, ge = I.length; oe < ge; oe += 1)
          Ce(I[oe], ee, ae);
      else
        for (se = Object.keys(I), oe = 0, ge = se.length; oe < ge; oe += 1)
          Ce(I[se[oe]], ee, ae);
  }
  function we(I, ee) {
    ee = ee || {};
    var ae = new x(ee);
    ae.noRefs || Pe(I, ae);
    var se = I;
    return ae.replacer && (se = ae.replacer.call({ "": se }, "", se)), ye(ae, 0, se, !0, !0) ? ae.dump + `
` : "";
  }
  return Ao.dump = we, Ao;
}
var qf;
function iu() {
  if (qf) return tt;
  qf = 1;
  var e = R_(), t = A_();
  function i(r, u) {
    return function() {
      throw new Error("Function yaml." + r + " is removed in js-yaml 4. Use yaml." + u + " instead, which is now safe by default.");
    };
  }
  return tt.Type = it(), tt.Schema = Zh(), tt.FAILSAFE_SCHEMA = np(), tt.JSON_SCHEMA = up(), tt.CORE_SCHEMA = lp(), tt.DEFAULT_SCHEMA = nu(), tt.load = e.load, tt.loadAll = e.loadAll, tt.dump = t.dump, tt.YAMLException = Tn(), tt.types = {
    binary: fp(),
    float: op(),
    map: rp(),
    null: ip(),
    pairs: pp(),
    set: mp(),
    timestamp: cp(),
    bool: ap(),
    int: sp(),
    merge: dp(),
    omap: hp(),
    seq: tp(),
    str: ep()
  }, tt.safeLoad = i("safeLoad", "load"), tt.safeLoadAll = i("safeLoadAll", "loadAll"), tt.safeDump = i("safeDump", "dump"), tt;
}
var Yr = {}, xf;
function O_() {
  if (xf) return Yr;
  xf = 1, Object.defineProperty(Yr, "__esModule", { value: !0 }), Yr.Lazy = void 0;
  class e {
    constructor(i) {
      this._value = null, this.creator = i;
    }
    get hasValue() {
      return this.creator == null;
    }
    get value() {
      if (this.creator == null)
        return this._value;
      const i = this.creator();
      return this.value = i, i;
    }
    set value(i) {
      this._value = i, this.creator = null;
    }
  }
  return Yr.Lazy = e, Yr;
}
var vr = {}, hn = { exports: {} };
hn.exports;
var Mf;
function N_() {
  return Mf || (Mf = 1, (function(e, t) {
    var i = 200, r = "__lodash_hash_undefined__", u = 1, n = 2, s = 9007199254740991, d = "[object Arguments]", a = "[object Array]", l = "[object AsyncFunction]", o = "[object Boolean]", f = "[object Date]", c = "[object Error]", p = "[object Function]", y = "[object GeneratorFunction]", E = "[object Map]", h = "[object Number]", _ = "[object Null]", g = "[object Object]", w = "[object Promise]", b = "[object Proxy]", R = "[object RegExp]", v = "[object Set]", S = "[object String]", O = "[object Symbol]", T = "[object Undefined]", $ = "[object WeakMap]", k = "[object ArrayBuffer]", U = "[object DataView]", V = "[object Float32Array]", L = "[object Float64Array]", B = "[object Int8Array]", te = "[object Int16Array]", j = "[object Int32Array]", H = "[object Uint8Array]", Y = "[object Uint8ClampedArray]", F = "[object Uint16Array]", x = "[object Uint32Array]", X = /[\\^$.*+?()[\]{}|]/g, G = /^\[object .+?Constructor\]$/, P = /^(?:0|[1-9]\d*)$/, C = {};
    C[V] = C[L] = C[B] = C[te] = C[j] = C[H] = C[Y] = C[F] = C[x] = !0, C[d] = C[a] = C[k] = C[o] = C[U] = C[f] = C[c] = C[p] = C[E] = C[h] = C[g] = C[R] = C[v] = C[S] = C[$] = !1;
    var K = typeof St == "object" && St && St.Object === Object && St, N = typeof self == "object" && self && self.Object === Object && self, A = K || N || Function("return this")(), J = t && !t.nodeType && t, M = J && !0 && e && !e.nodeType && e, q = M && M.exports === J, z = q && K.process, Q = (function() {
      try {
        return z && z.binding && z.binding("util");
      } catch {
      }
    })(), re = Q && Q.isTypedArray;
    function le(D, W) {
      for (var ue = -1, Ee = D == null ? 0 : D.length, Me = 0, Re = []; ++ue < Ee; ) {
        var ze = D[ue];
        W(ze, ue, D) && (Re[Me++] = ze);
      }
      return Re;
    }
    function Se(D, W) {
      for (var ue = -1, Ee = W.length, Me = D.length; ++ue < Ee; )
        D[Me + ue] = W[ue];
      return D;
    }
    function Te(D, W) {
      for (var ue = -1, Ee = D == null ? 0 : D.length; ++ue < Ee; )
        if (W(D[ue], ue, D))
          return !0;
      return !1;
    }
    function Fe(D, W) {
      for (var ue = -1, Ee = Array(D); ++ue < D; )
        Ee[ue] = W(ue);
      return Ee;
    }
    function He(D) {
      return function(W) {
        return D(W);
      };
    }
    function Be(D, W) {
      return D.has(W);
    }
    function Le(D, W) {
      return D?.[W];
    }
    function m(D) {
      var W = -1, ue = Array(D.size);
      return D.forEach(function(Ee, Me) {
        ue[++W] = [Me, Ee];
      }), ue;
    }
    function Z(D, W) {
      return function(ue) {
        return D(W(ue));
      };
    }
    function ne(D) {
      var W = -1, ue = Array(D.size);
      return D.forEach(function(Ee) {
        ue[++W] = Ee;
      }), ue;
    }
    var pe = Array.prototype, ie = Function.prototype, he = Object.prototype, ce = A["__core-js_shared__"], me = ie.toString, ye = he.hasOwnProperty, Pe = (function() {
      var D = /[^.]+$/.exec(ce && ce.keys && ce.keys.IE_PROTO || "");
      return D ? "Symbol(src)_1." + D : "";
    })(), Ce = he.toString, we = RegExp(
      "^" + me.call(ye).replace(X, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
    ), I = q ? A.Buffer : void 0, ee = A.Symbol, ae = A.Uint8Array, se = he.propertyIsEnumerable, oe = pe.splice, ge = ee ? ee.toStringTag : void 0, fe = Object.getOwnPropertySymbols, _e = I ? I.isBuffer : void 0, ve = Z(Object.keys, Object), be = gr(A, "DataView"), qe = gr(A, "Map"), Ve = gr(A, "Promise"), De = gr(A, "Set"), mr = gr(A, "WeakMap"), gt = gr(Object, "create"), Kt = Zt(be), Ap = Zt(qe), Op = Zt(Ve), Np = Zt(De), Pp = Zt(mr), du = ee ? ee.prototype : void 0, ua = du ? du.valueOf : void 0;
    function Jt(D) {
      var W = -1, ue = D == null ? 0 : D.length;
      for (this.clear(); ++W < ue; ) {
        var Ee = D[W];
        this.set(Ee[0], Ee[1]);
      }
    }
    function Cp() {
      this.__data__ = gt ? gt(null) : {}, this.size = 0;
    }
    function Ip(D) {
      var W = this.has(D) && delete this.__data__[D];
      return this.size -= W ? 1 : 0, W;
    }
    function Dp(D) {
      var W = this.__data__;
      if (gt) {
        var ue = W[D];
        return ue === r ? void 0 : ue;
      }
      return ye.call(W, D) ? W[D] : void 0;
    }
    function $p(D) {
      var W = this.__data__;
      return gt ? W[D] !== void 0 : ye.call(W, D);
    }
    function kp(D, W) {
      var ue = this.__data__;
      return this.size += this.has(D) ? 0 : 1, ue[D] = gt && W === void 0 ? r : W, this;
    }
    Jt.prototype.clear = Cp, Jt.prototype.delete = Ip, Jt.prototype.get = Dp, Jt.prototype.has = $p, Jt.prototype.set = kp;
    function Pt(D) {
      var W = -1, ue = D == null ? 0 : D.length;
      for (this.clear(); ++W < ue; ) {
        var Ee = D[W];
        this.set(Ee[0], Ee[1]);
      }
    }
    function Lp() {
      this.__data__ = [], this.size = 0;
    }
    function Fp(D) {
      var W = this.__data__, ue = Rn(W, D);
      if (ue < 0)
        return !1;
      var Ee = W.length - 1;
      return ue == Ee ? W.pop() : oe.call(W, ue, 1), --this.size, !0;
    }
    function Up(D) {
      var W = this.__data__, ue = Rn(W, D);
      return ue < 0 ? void 0 : W[ue][1];
    }
    function qp(D) {
      return Rn(this.__data__, D) > -1;
    }
    function xp(D, W) {
      var ue = this.__data__, Ee = Rn(ue, D);
      return Ee < 0 ? (++this.size, ue.push([D, W])) : ue[Ee][1] = W, this;
    }
    Pt.prototype.clear = Lp, Pt.prototype.delete = Fp, Pt.prototype.get = Up, Pt.prototype.has = qp, Pt.prototype.set = xp;
    function Qt(D) {
      var W = -1, ue = D == null ? 0 : D.length;
      for (this.clear(); ++W < ue; ) {
        var Ee = D[W];
        this.set(Ee[0], Ee[1]);
      }
    }
    function Mp() {
      this.size = 0, this.__data__ = {
        hash: new Jt(),
        map: new (qe || Pt)(),
        string: new Jt()
      };
    }
    function jp(D) {
      var W = An(this, D).delete(D);
      return this.size -= W ? 1 : 0, W;
    }
    function Bp(D) {
      return An(this, D).get(D);
    }
    function Hp(D) {
      return An(this, D).has(D);
    }
    function Gp(D, W) {
      var ue = An(this, D), Ee = ue.size;
      return ue.set(D, W), this.size += ue.size == Ee ? 0 : 1, this;
    }
    Qt.prototype.clear = Mp, Qt.prototype.delete = jp, Qt.prototype.get = Bp, Qt.prototype.has = Hp, Qt.prototype.set = Gp;
    function bn(D) {
      var W = -1, ue = D == null ? 0 : D.length;
      for (this.__data__ = new Qt(); ++W < ue; )
        this.add(D[W]);
    }
    function Vp(D) {
      return this.__data__.set(D, r), this;
    }
    function zp(D) {
      return this.__data__.has(D);
    }
    bn.prototype.add = bn.prototype.push = Vp, bn.prototype.has = zp;
    function Ut(D) {
      var W = this.__data__ = new Pt(D);
      this.size = W.size;
    }
    function Yp() {
      this.__data__ = new Pt(), this.size = 0;
    }
    function Xp(D) {
      var W = this.__data__, ue = W.delete(D);
      return this.size = W.size, ue;
    }
    function Wp(D) {
      return this.__data__.get(D);
    }
    function Kp(D) {
      return this.__data__.has(D);
    }
    function Jp(D, W) {
      var ue = this.__data__;
      if (ue instanceof Pt) {
        var Ee = ue.__data__;
        if (!qe || Ee.length < i - 1)
          return Ee.push([D, W]), this.size = ++ue.size, this;
        ue = this.__data__ = new Qt(Ee);
      }
      return ue.set(D, W), this.size = ue.size, this;
    }
    Ut.prototype.clear = Yp, Ut.prototype.delete = Xp, Ut.prototype.get = Wp, Ut.prototype.has = Kp, Ut.prototype.set = Jp;
    function Qp(D, W) {
      var ue = On(D), Ee = !ue && hm(D), Me = !ue && !Ee && la(D), Re = !ue && !Ee && !Me && vu(D), ze = ue || Ee || Me || Re, We = ze ? Fe(D.length, String) : [], Ke = We.length;
      for (var Ge in D)
        ye.call(D, Ge) && !(ze && // Safari 9 has enumerable `arguments.length` in strict mode.
        (Ge == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
        Me && (Ge == "offset" || Ge == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
        Re && (Ge == "buffer" || Ge == "byteLength" || Ge == "byteOffset") || // Skip index properties.
        um(Ge, Ke))) && We.push(Ge);
      return We;
    }
    function Rn(D, W) {
      for (var ue = D.length; ue--; )
        if (gu(D[ue][0], W))
          return ue;
      return -1;
    }
    function Zp(D, W, ue) {
      var Ee = W(D);
      return On(D) ? Ee : Se(Ee, ue(D));
    }
    function Lr(D) {
      return D == null ? D === void 0 ? T : _ : ge && ge in Object(D) ? sm(D) : fm(D);
    }
    function fu(D) {
      return Fr(D) && Lr(D) == d;
    }
    function hu(D, W, ue, Ee, Me) {
      return D === W ? !0 : D == null || W == null || !Fr(D) && !Fr(W) ? D !== D && W !== W : em(D, W, ue, Ee, hu, Me);
    }
    function em(D, W, ue, Ee, Me, Re) {
      var ze = On(D), We = On(W), Ke = ze ? a : qt(D), Ge = We ? a : qt(W);
      Ke = Ke == d ? g : Ke, Ge = Ge == d ? g : Ge;
      var ut = Ke == g, yt = Ge == g, Ze = Ke == Ge;
      if (Ze && la(D)) {
        if (!la(W))
          return !1;
        ze = !0, ut = !1;
      }
      if (Ze && !ut)
        return Re || (Re = new Ut()), ze || vu(D) ? pu(D, W, ue, Ee, Me, Re) : im(D, W, Ke, ue, Ee, Me, Re);
      if (!(ue & u)) {
        var ft = ut && ye.call(D, "__wrapped__"), ht = yt && ye.call(W, "__wrapped__");
        if (ft || ht) {
          var xt = ft ? D.value() : D, Ct = ht ? W.value() : W;
          return Re || (Re = new Ut()), Me(xt, Ct, ue, Ee, Re);
        }
      }
      return Ze ? (Re || (Re = new Ut()), am(D, W, ue, Ee, Me, Re)) : !1;
    }
    function tm(D) {
      if (!Eu(D) || cm(D))
        return !1;
      var W = yu(D) ? we : G;
      return W.test(Zt(D));
    }
    function rm(D) {
      return Fr(D) && _u(D.length) && !!C[Lr(D)];
    }
    function nm(D) {
      if (!dm(D))
        return ve(D);
      var W = [];
      for (var ue in Object(D))
        ye.call(D, ue) && ue != "constructor" && W.push(ue);
      return W;
    }
    function pu(D, W, ue, Ee, Me, Re) {
      var ze = ue & u, We = D.length, Ke = W.length;
      if (We != Ke && !(ze && Ke > We))
        return !1;
      var Ge = Re.get(D);
      if (Ge && Re.get(W))
        return Ge == W;
      var ut = -1, yt = !0, Ze = ue & n ? new bn() : void 0;
      for (Re.set(D, W), Re.set(W, D); ++ut < We; ) {
        var ft = D[ut], ht = W[ut];
        if (Ee)
          var xt = ze ? Ee(ht, ft, ut, W, D, Re) : Ee(ft, ht, ut, D, W, Re);
        if (xt !== void 0) {
          if (xt)
            continue;
          yt = !1;
          break;
        }
        if (Ze) {
          if (!Te(W, function(Ct, er) {
            if (!Be(Ze, er) && (ft === Ct || Me(ft, Ct, ue, Ee, Re)))
              return Ze.push(er);
          })) {
            yt = !1;
            break;
          }
        } else if (!(ft === ht || Me(ft, ht, ue, Ee, Re))) {
          yt = !1;
          break;
        }
      }
      return Re.delete(D), Re.delete(W), yt;
    }
    function im(D, W, ue, Ee, Me, Re, ze) {
      switch (ue) {
        case U:
          if (D.byteLength != W.byteLength || D.byteOffset != W.byteOffset)
            return !1;
          D = D.buffer, W = W.buffer;
        case k:
          return !(D.byteLength != W.byteLength || !Re(new ae(D), new ae(W)));
        case o:
        case f:
        case h:
          return gu(+D, +W);
        case c:
          return D.name == W.name && D.message == W.message;
        case R:
        case S:
          return D == W + "";
        case E:
          var We = m;
        case v:
          var Ke = Ee & u;
          if (We || (We = ne), D.size != W.size && !Ke)
            return !1;
          var Ge = ze.get(D);
          if (Ge)
            return Ge == W;
          Ee |= n, ze.set(D, W);
          var ut = pu(We(D), We(W), Ee, Me, Re, ze);
          return ze.delete(D), ut;
        case O:
          if (ua)
            return ua.call(D) == ua.call(W);
      }
      return !1;
    }
    function am(D, W, ue, Ee, Me, Re) {
      var ze = ue & u, We = mu(D), Ke = We.length, Ge = mu(W), ut = Ge.length;
      if (Ke != ut && !ze)
        return !1;
      for (var yt = Ke; yt--; ) {
        var Ze = We[yt];
        if (!(ze ? Ze in W : ye.call(W, Ze)))
          return !1;
      }
      var ft = Re.get(D);
      if (ft && Re.get(W))
        return ft == W;
      var ht = !0;
      Re.set(D, W), Re.set(W, D);
      for (var xt = ze; ++yt < Ke; ) {
        Ze = We[yt];
        var Ct = D[Ze], er = W[Ze];
        if (Ee)
          var wu = ze ? Ee(er, Ct, Ze, W, D, Re) : Ee(Ct, er, Ze, D, W, Re);
        if (!(wu === void 0 ? Ct === er || Me(Ct, er, ue, Ee, Re) : wu)) {
          ht = !1;
          break;
        }
        xt || (xt = Ze == "constructor");
      }
      if (ht && !xt) {
        var Nn = D.constructor, Pn = W.constructor;
        Nn != Pn && "constructor" in D && "constructor" in W && !(typeof Nn == "function" && Nn instanceof Nn && typeof Pn == "function" && Pn instanceof Pn) && (ht = !1);
      }
      return Re.delete(D), Re.delete(W), ht;
    }
    function mu(D) {
      return Zp(D, gm, om);
    }
    function An(D, W) {
      var ue = D.__data__;
      return lm(W) ? ue[typeof W == "string" ? "string" : "hash"] : ue.map;
    }
    function gr(D, W) {
      var ue = Le(D, W);
      return tm(ue) ? ue : void 0;
    }
    function sm(D) {
      var W = ye.call(D, ge), ue = D[ge];
      try {
        D[ge] = void 0;
        var Ee = !0;
      } catch {
      }
      var Me = Ce.call(D);
      return Ee && (W ? D[ge] = ue : delete D[ge]), Me;
    }
    var om = fe ? function(D) {
      return D == null ? [] : (D = Object(D), le(fe(D), function(W) {
        return se.call(D, W);
      }));
    } : ym, qt = Lr;
    (be && qt(new be(new ArrayBuffer(1))) != U || qe && qt(new qe()) != E || Ve && qt(Ve.resolve()) != w || De && qt(new De()) != v || mr && qt(new mr()) != $) && (qt = function(D) {
      var W = Lr(D), ue = W == g ? D.constructor : void 0, Ee = ue ? Zt(ue) : "";
      if (Ee)
        switch (Ee) {
          case Kt:
            return U;
          case Ap:
            return E;
          case Op:
            return w;
          case Np:
            return v;
          case Pp:
            return $;
        }
      return W;
    });
    function um(D, W) {
      return W = W ?? s, !!W && (typeof D == "number" || P.test(D)) && D > -1 && D % 1 == 0 && D < W;
    }
    function lm(D) {
      var W = typeof D;
      return W == "string" || W == "number" || W == "symbol" || W == "boolean" ? D !== "__proto__" : D === null;
    }
    function cm(D) {
      return !!Pe && Pe in D;
    }
    function dm(D) {
      var W = D && D.constructor, ue = typeof W == "function" && W.prototype || he;
      return D === ue;
    }
    function fm(D) {
      return Ce.call(D);
    }
    function Zt(D) {
      if (D != null) {
        try {
          return me.call(D);
        } catch {
        }
        try {
          return D + "";
        } catch {
        }
      }
      return "";
    }
    function gu(D, W) {
      return D === W || D !== D && W !== W;
    }
    var hm = fu(/* @__PURE__ */ (function() {
      return arguments;
    })()) ? fu : function(D) {
      return Fr(D) && ye.call(D, "callee") && !se.call(D, "callee");
    }, On = Array.isArray;
    function pm(D) {
      return D != null && _u(D.length) && !yu(D);
    }
    var la = _e || _m;
    function mm(D, W) {
      return hu(D, W);
    }
    function yu(D) {
      if (!Eu(D))
        return !1;
      var W = Lr(D);
      return W == p || W == y || W == l || W == b;
    }
    function _u(D) {
      return typeof D == "number" && D > -1 && D % 1 == 0 && D <= s;
    }
    function Eu(D) {
      var W = typeof D;
      return D != null && (W == "object" || W == "function");
    }
    function Fr(D) {
      return D != null && typeof D == "object";
    }
    var vu = re ? He(re) : rm;
    function gm(D) {
      return pm(D) ? Qp(D) : nm(D);
    }
    function ym() {
      return [];
    }
    function _m() {
      return !1;
    }
    e.exports = mm;
  })(hn, hn.exports)), hn.exports;
}
var jf;
function P_() {
  if (jf) return vr;
  jf = 1, Object.defineProperty(vr, "__esModule", { value: !0 }), vr.DownloadedUpdateHelper = void 0, vr.createTempUpdateFile = d;
  const e = Nr, t = Tt, i = N_(), r = /* @__PURE__ */ Wt(), u = $e;
  let n = class {
    constructor(l) {
      this.cacheDir = l, this._file = null, this._packageFile = null, this.versionInfo = null, this.fileInfo = null, this._downloadedFileInfo = null;
    }
    get downloadedFileInfo() {
      return this._downloadedFileInfo;
    }
    get file() {
      return this._file;
    }
    get packageFile() {
      return this._packageFile;
    }
    get cacheDirForPendingUpdate() {
      return u.join(this.cacheDir, "pending");
    }
    async validateDownloadedPath(l, o, f, c) {
      if (this.versionInfo != null && this.file === l && this.fileInfo != null)
        return i(this.versionInfo, o) && i(this.fileInfo.info, f.info) && await (0, r.pathExists)(l) ? l : null;
      const p = await this.getValidCachedUpdateFile(f, c);
      return p === null ? null : (c.info(`Update has already been downloaded to ${l}).`), this._file = p, p);
    }
    async setDownloadedFile(l, o, f, c, p, y) {
      this._file = l, this._packageFile = o, this.versionInfo = f, this.fileInfo = c, this._downloadedFileInfo = {
        fileName: p,
        sha512: c.info.sha512,
        isAdminRightsRequired: c.info.isAdminRightsRequired === !0
      }, y && await (0, r.outputJson)(this.getUpdateInfoFile(), this._downloadedFileInfo);
    }
    async clear() {
      this._file = null, this._packageFile = null, this.versionInfo = null, this.fileInfo = null, await this.cleanCacheDirForPendingUpdate();
    }
    async cleanCacheDirForPendingUpdate() {
      try {
        await (0, r.emptyDir)(this.cacheDirForPendingUpdate);
      } catch {
      }
    }
    /**
     * Returns "update-info.json" which is created in the update cache directory's "pending" subfolder after the first update is downloaded.  If the update file does not exist then the cache is cleared and recreated.  If the update file exists then its properties are validated.
     * @param fileInfo
     * @param logger
     */
    async getValidCachedUpdateFile(l, o) {
      const f = this.getUpdateInfoFile();
      if (!await (0, r.pathExists)(f))
        return null;
      let p;
      try {
        p = await (0, r.readJson)(f);
      } catch (_) {
        let g = "No cached update info available";
        return _.code !== "ENOENT" && (await this.cleanCacheDirForPendingUpdate(), g += ` (error on read: ${_.message})`), o.info(g), null;
      }
      if (!(p?.fileName !== null))
        return o.warn("Cached update info is corrupted: no fileName, directory for cached update will be cleaned"), await this.cleanCacheDirForPendingUpdate(), null;
      if (l.info.sha512 !== p.sha512)
        return o.info(`Cached update sha512 checksum doesn't match the latest available update. New update must be downloaded. Cached: ${p.sha512}, expected: ${l.info.sha512}. Directory for cached update will be cleaned`), await this.cleanCacheDirForPendingUpdate(), null;
      const E = u.join(this.cacheDirForPendingUpdate, p.fileName);
      if (!await (0, r.pathExists)(E))
        return o.info("Cached update file doesn't exist"), null;
      const h = await s(E);
      return l.info.sha512 !== h ? (o.warn(`Sha512 checksum doesn't match the latest available update. New update must be downloaded. Cached: ${h}, expected: ${l.info.sha512}`), await this.cleanCacheDirForPendingUpdate(), null) : (this._downloadedFileInfo = p, E);
    }
    getUpdateInfoFile() {
      return u.join(this.cacheDirForPendingUpdate, "update-info.json");
    }
  };
  vr.DownloadedUpdateHelper = n;
  function s(a, l = "sha512", o = "base64", f) {
    return new Promise((c, p) => {
      const y = (0, e.createHash)(l);
      y.on("error", p).setEncoding(o), (0, t.createReadStream)(a, {
        ...f,
        highWaterMark: 1024 * 1024
        /* better to use more memory but hash faster */
      }).on("error", p).on("end", () => {
        y.end(), c(y.read());
      }).pipe(y, { end: !1 });
    });
  }
  async function d(a, l, o) {
    let f = 0, c = u.join(l, a);
    for (let p = 0; p < 3; p++)
      try {
        return await (0, r.unlink)(c), c;
      } catch (y) {
        if (y.code === "ENOENT")
          return c;
        o.warn(`Error on remove temp update file: ${y}`), c = u.join(l, `${f++}-${a}`);
      }
    return c;
  }
  return vr;
}
var Xr = {}, Bi = {}, Bf;
function C_() {
  if (Bf) return Bi;
  Bf = 1, Object.defineProperty(Bi, "__esModule", { value: !0 }), Bi.getAppCacheDir = i;
  const e = $e, t = _n;
  function i() {
    const r = (0, t.homedir)();
    let u;
    return process.platform === "win32" ? u = process.env.LOCALAPPDATA || e.join(r, "AppData", "Local") : process.platform === "darwin" ? u = e.join(r, "Library", "Caches") : u = process.env.XDG_CACHE_HOME || e.join(r, ".cache"), u;
  }
  return Bi;
}
var Hf;
function I_() {
  if (Hf) return Xr;
  Hf = 1, Object.defineProperty(Xr, "__esModule", { value: !0 }), Xr.ElectronAppAdapter = void 0;
  const e = $e, t = C_();
  let i = class {
    constructor(u = zt.app) {
      this.app = u;
    }
    whenReady() {
      return this.app.whenReady();
    }
    get version() {
      return this.app.getVersion();
    }
    get name() {
      return this.app.getName();
    }
    get isPackaged() {
      return this.app.isPackaged === !0;
    }
    get appUpdateConfigPath() {
      return this.isPackaged ? e.join(process.resourcesPath, "app-update.yml") : e.join(this.app.getAppPath(), "dev-app-update.yml");
    }
    get userDataPath() {
      return this.app.getPath("userData");
    }
    get baseCachePath() {
      return (0, t.getAppCacheDir)();
    }
    quit() {
      this.app.quit();
    }
    relaunch() {
      this.app.relaunch();
    }
    onQuit(u) {
      this.app.once("quit", (n, s) => u(s));
    }
  };
  return Xr.ElectronAppAdapter = i, Xr;
}
var Oo = {}, Gf;
function D_() {
  return Gf || (Gf = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.ElectronHttpExecutor = e.NET_SESSION_NAME = void 0, e.getNetSession = i;
    const t = Qe();
    e.NET_SESSION_NAME = "electron-updater";
    function i() {
      return zt.session.fromPartition(e.NET_SESSION_NAME, {
        cache: !1
      });
    }
    class r extends t.HttpExecutor {
      constructor(n) {
        super(), this.proxyLoginCallback = n, this.cachedSession = null;
      }
      async download(n, s, d) {
        return await d.cancellationToken.createPromise((a, l, o) => {
          const f = {
            headers: d.headers || void 0,
            redirect: "manual"
          };
          (0, t.configureRequestUrl)(n, f), (0, t.configureRequestOptions)(f), this.doDownload(f, {
            destination: s,
            options: d,
            onCancel: o,
            callback: (c) => {
              c == null ? a(s) : l(c);
            },
            responseHandler: null
          }, 0);
        });
      }
      createRequest(n, s) {
        n.headers && n.headers.Host && (n.host = n.headers.Host, delete n.headers.Host), this.cachedSession == null && (this.cachedSession = i());
        const d = zt.net.request({
          ...n,
          session: this.cachedSession
        });
        return d.on("response", s), this.proxyLoginCallback != null && d.on("login", this.proxyLoginCallback), d;
      }
      addRedirectHandlers(n, s, d, a, l) {
        n.on("redirect", (o, f, c) => {
          n.abort(), a > this.maxRedirects ? d(this.createMaxRedirectError()) : l(t.HttpExecutor.prepareRedirectUrlOptions(c, s));
        });
      }
    }
    e.ElectronHttpExecutor = r;
  })(Oo)), Oo;
}
var Wr = {}, cr = {}, No, Vf;
function $_() {
  if (Vf) return No;
  Vf = 1;
  var e = "[object Symbol]", t = /[\\^$.*+?()[\]{}|]/g, i = RegExp(t.source), r = typeof St == "object" && St && St.Object === Object && St, u = typeof self == "object" && self && self.Object === Object && self, n = r || u || Function("return this")(), s = Object.prototype, d = s.toString, a = n.Symbol, l = a ? a.prototype : void 0, o = l ? l.toString : void 0;
  function f(h) {
    if (typeof h == "string")
      return h;
    if (p(h))
      return o ? o.call(h) : "";
    var _ = h + "";
    return _ == "0" && 1 / h == -1 / 0 ? "-0" : _;
  }
  function c(h) {
    return !!h && typeof h == "object";
  }
  function p(h) {
    return typeof h == "symbol" || c(h) && d.call(h) == e;
  }
  function y(h) {
    return h == null ? "" : f(h);
  }
  function E(h) {
    return h = y(h), h && i.test(h) ? h.replace(t, "\\$&") : h;
  }
  return No = E, No;
}
var zf;
function hr() {
  if (zf) return cr;
  zf = 1, Object.defineProperty(cr, "__esModule", { value: !0 }), cr.newBaseUrl = i, cr.newUrlFromBase = r, cr.getChannelFilename = u, cr.blockmapFiles = n;
  const e = Pr, t = $_();
  function i(s) {
    const d = new e.URL(s);
    return d.pathname.endsWith("/") || (d.pathname += "/"), d;
  }
  function r(s, d, a = !1) {
    const l = new e.URL(s, d), o = d.search;
    return o != null && o.length !== 0 ? l.search = o : a && (l.search = `noCache=${Date.now().toString(32)}`), l;
  }
  function u(s) {
    return `${s}.yml`;
  }
  function n(s, d, a) {
    const l = r(`${s.pathname}.blockmap`, s);
    return [r(`${s.pathname.replace(new RegExp(t(a), "g"), d)}.blockmap`, s), l];
  }
  return cr;
}
var kt = {}, Yf;
function mt() {
  if (Yf) return kt;
  Yf = 1, Object.defineProperty(kt, "__esModule", { value: !0 }), kt.Provider = void 0, kt.findFile = u, kt.parseUpdateInfo = n, kt.getFileList = s, kt.resolveFiles = d;
  const e = Qe(), t = iu(), i = hr();
  let r = class {
    constructor(l) {
      this.runtimeOptions = l, this.requestHeaders = null, this.executor = l.executor;
    }
    get isUseMultipleRangeRequest() {
      return this.runtimeOptions.isUseMultipleRangeRequest !== !1;
    }
    getChannelFilePrefix() {
      if (this.runtimeOptions.platform === "linux") {
        const l = process.env.TEST_UPDATER_ARCH || process.arch;
        return "-linux" + (l === "x64" ? "" : `-${l}`);
      } else
        return this.runtimeOptions.platform === "darwin" ? "-mac" : "";
    }
    // due to historical reasons for windows we use channel name without platform specifier
    getDefaultChannelName() {
      return this.getCustomChannelName("latest");
    }
    getCustomChannelName(l) {
      return `${l}${this.getChannelFilePrefix()}`;
    }
    get fileExtraDownloadHeaders() {
      return null;
    }
    setRequestHeaders(l) {
      this.requestHeaders = l;
    }
    /**
     * Method to perform API request only to resolve update info, but not to download update.
     */
    httpRequest(l, o, f) {
      return this.executor.request(this.createRequestOptions(l, o), f);
    }
    createRequestOptions(l, o) {
      const f = {};
      return this.requestHeaders == null ? o != null && (f.headers = o) : f.headers = o == null ? this.requestHeaders : { ...this.requestHeaders, ...o }, (0, e.configureRequestUrl)(l, f), f;
    }
  };
  kt.Provider = r;
  function u(a, l, o) {
    if (a.length === 0)
      throw (0, e.newError)("No files provided", "ERR_UPDATER_NO_FILES_PROVIDED");
    const f = a.find((c) => c.url.pathname.toLowerCase().endsWith(`.${l}`));
    return f ?? (o == null ? a[0] : a.find((c) => !o.some((p) => c.url.pathname.toLowerCase().endsWith(`.${p}`))));
  }
  function n(a, l, o) {
    if (a == null)
      throw (0, e.newError)(`Cannot parse update info from ${l} in the latest release artifacts (${o}): rawData: null`, "ERR_UPDATER_INVALID_UPDATE_INFO");
    let f;
    try {
      f = (0, t.load)(a);
    } catch (c) {
      throw (0, e.newError)(`Cannot parse update info from ${l} in the latest release artifacts (${o}): ${c.stack || c.message}, rawData: ${a}`, "ERR_UPDATER_INVALID_UPDATE_INFO");
    }
    return f;
  }
  function s(a) {
    const l = a.files;
    if (l != null && l.length > 0)
      return l;
    if (a.path != null)
      return [
        {
          url: a.path,
          sha2: a.sha2,
          sha512: a.sha512
        }
      ];
    throw (0, e.newError)(`No files provided: ${(0, e.safeStringifyJson)(a)}`, "ERR_UPDATER_NO_FILES_PROVIDED");
  }
  function d(a, l, o = (f) => f) {
    const c = s(a).map((E) => {
      if (E.sha2 == null && E.sha512 == null)
        throw (0, e.newError)(`Update info doesn't contain nor sha256 neither sha512 checksum: ${(0, e.safeStringifyJson)(E)}`, "ERR_UPDATER_NO_CHECKSUM");
      return {
        url: (0, i.newUrlFromBase)(o(E.url), l),
        info: E
      };
    }), p = a.packages, y = p == null ? null : p[process.arch] || p.ia32;
    return y != null && (c[0].packageInfo = {
      ...y,
      path: (0, i.newUrlFromBase)(o(y.path), l).href
    }), c;
  }
  return kt;
}
var Xf;
function gp() {
  if (Xf) return Wr;
  Xf = 1, Object.defineProperty(Wr, "__esModule", { value: !0 }), Wr.GenericProvider = void 0;
  const e = Qe(), t = hr(), i = mt();
  let r = class extends i.Provider {
    constructor(n, s, d) {
      super(d), this.configuration = n, this.updater = s, this.baseUrl = (0, t.newBaseUrl)(this.configuration.url);
    }
    get channel() {
      const n = this.updater.channel || this.configuration.channel;
      return n == null ? this.getDefaultChannelName() : this.getCustomChannelName(n);
    }
    async getLatestVersion() {
      const n = (0, t.getChannelFilename)(this.channel), s = (0, t.newUrlFromBase)(n, this.baseUrl, this.updater.isAddNoCacheQuery);
      for (let d = 0; ; d++)
        try {
          return (0, i.parseUpdateInfo)(await this.httpRequest(s), n, s);
        } catch (a) {
          if (a instanceof e.HttpError && a.statusCode === 404)
            throw (0, e.newError)(`Cannot find channel "${n}" update info: ${a.stack || a.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
          if (a.code === "ECONNREFUSED" && d < 3) {
            await new Promise((l, o) => {
              try {
                setTimeout(l, 1e3 * d);
              } catch (f) {
                o(f);
              }
            });
            continue;
          }
          throw a;
        }
    }
    resolveFiles(n) {
      return (0, i.resolveFiles)(n, this.baseUrl);
    }
  };
  return Wr.GenericProvider = r, Wr;
}
var Kr = {}, Jr = {}, Wf;
function k_() {
  if (Wf) return Jr;
  Wf = 1, Object.defineProperty(Jr, "__esModule", { value: !0 }), Jr.BitbucketProvider = void 0;
  const e = Qe(), t = hr(), i = mt();
  let r = class extends i.Provider {
    constructor(n, s, d) {
      super({
        ...d,
        isUseMultipleRangeRequest: !1
      }), this.configuration = n, this.updater = s;
      const { owner: a, slug: l } = n;
      this.baseUrl = (0, t.newBaseUrl)(`https://api.bitbucket.org/2.0/repositories/${a}/${l}/downloads`);
    }
    get channel() {
      return this.updater.channel || this.configuration.channel || "latest";
    }
    async getLatestVersion() {
      const n = new e.CancellationToken(), s = (0, t.getChannelFilename)(this.getCustomChannelName(this.channel)), d = (0, t.newUrlFromBase)(s, this.baseUrl, this.updater.isAddNoCacheQuery);
      try {
        const a = await this.httpRequest(d, void 0, n);
        return (0, i.parseUpdateInfo)(a, s, d);
      } catch (a) {
        throw (0, e.newError)(`Unable to find latest version on ${this.toString()}, please ensure release exists: ${a.stack || a.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
      }
    }
    resolveFiles(n) {
      return (0, i.resolveFiles)(n, this.baseUrl);
    }
    toString() {
      const { owner: n, slug: s } = this.configuration;
      return `Bitbucket (owner: ${n}, slug: ${s}, channel: ${this.channel})`;
    }
  };
  return Jr.BitbucketProvider = r, Jr;
}
var Bt = {}, Kf;
function yp() {
  if (Kf) return Bt;
  Kf = 1, Object.defineProperty(Bt, "__esModule", { value: !0 }), Bt.GitHubProvider = Bt.BaseGitHubProvider = void 0, Bt.computeReleaseNotes = l;
  const e = Qe(), t = Wo(), i = Pr, r = hr(), u = mt(), n = /\/tag\/([^/]+)$/;
  class s extends u.Provider {
    constructor(f, c, p) {
      super({
        ...p,
        /* because GitHib uses S3 */
        isUseMultipleRangeRequest: !1
      }), this.options = f, this.baseUrl = (0, r.newBaseUrl)((0, e.githubUrl)(f, c));
      const y = c === "github.com" ? "api.github.com" : c;
      this.baseApiUrl = (0, r.newBaseUrl)((0, e.githubUrl)(f, y));
    }
    computeGithubBasePath(f) {
      const c = this.options.host;
      return c && !["github.com", "api.github.com"].includes(c) ? `/api/v3${f}` : f;
    }
  }
  Bt.BaseGitHubProvider = s;
  let d = class extends s {
    constructor(f, c, p) {
      super(f, "github.com", p), this.options = f, this.updater = c;
    }
    get channel() {
      const f = this.updater.channel || this.options.channel;
      return f == null ? this.getDefaultChannelName() : this.getCustomChannelName(f);
    }
    async getLatestVersion() {
      var f, c, p, y, E;
      const h = new e.CancellationToken(), _ = await this.httpRequest((0, r.newUrlFromBase)(`${this.basePath}.atom`, this.baseUrl), {
        accept: "application/xml, application/atom+xml, text/xml, */*"
      }, h), g = (0, e.parseXml)(_);
      let w = g.element("entry", !1, "No published versions on GitHub"), b = null;
      try {
        if (this.updater.allowPrerelease) {
          const $ = ((f = this.updater) === null || f === void 0 ? void 0 : f.channel) || ((c = t.prerelease(this.updater.currentVersion)) === null || c === void 0 ? void 0 : c[0]) || null;
          if ($ === null)
            b = n.exec(w.element("link").attribute("href"))[1];
          else
            for (const k of g.getElements("entry")) {
              const U = n.exec(k.element("link").attribute("href"));
              if (U === null)
                continue;
              const V = U[1], L = ((p = t.prerelease(V)) === null || p === void 0 ? void 0 : p[0]) || null, B = !$ || ["alpha", "beta"].includes($), te = L !== null && !["alpha", "beta"].includes(String(L));
              if (B && !te && !($ === "beta" && L === "alpha")) {
                b = V;
                break;
              }
              if (L && L === $) {
                b = V;
                break;
              }
            }
        } else {
          b = await this.getLatestTagName(h);
          for (const $ of g.getElements("entry"))
            if (n.exec($.element("link").attribute("href"))[1] === b) {
              w = $;
              break;
            }
        }
      } catch ($) {
        throw (0, e.newError)(`Cannot parse releases feed: ${$.stack || $.message},
XML:
${_}`, "ERR_UPDATER_INVALID_RELEASE_FEED");
      }
      if (b == null)
        throw (0, e.newError)("No published versions on GitHub", "ERR_UPDATER_NO_PUBLISHED_VERSIONS");
      let R, v = "", S = "";
      const O = async ($) => {
        v = (0, r.getChannelFilename)($), S = (0, r.newUrlFromBase)(this.getBaseDownloadPath(String(b), v), this.baseUrl);
        const k = this.createRequestOptions(S);
        try {
          return await this.executor.request(k, h);
        } catch (U) {
          throw U instanceof e.HttpError && U.statusCode === 404 ? (0, e.newError)(`Cannot find ${v} in the latest release artifacts (${S}): ${U.stack || U.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND") : U;
        }
      };
      try {
        let $ = this.channel;
        this.updater.allowPrerelease && (!((y = t.prerelease(b)) === null || y === void 0) && y[0]) && ($ = this.getCustomChannelName(String((E = t.prerelease(b)) === null || E === void 0 ? void 0 : E[0]))), R = await O($);
      } catch ($) {
        if (this.updater.allowPrerelease)
          R = await O(this.getDefaultChannelName());
        else
          throw $;
      }
      const T = (0, u.parseUpdateInfo)(R, v, S);
      return T.releaseName == null && (T.releaseName = w.elementValueOrEmpty("title")), T.releaseNotes == null && (T.releaseNotes = l(this.updater.currentVersion, this.updater.fullChangelog, g, w)), {
        tag: b,
        ...T
      };
    }
    async getLatestTagName(f) {
      const c = this.options, p = c.host == null || c.host === "github.com" ? (0, r.newUrlFromBase)(`${this.basePath}/latest`, this.baseUrl) : new i.URL(`${this.computeGithubBasePath(`/repos/${c.owner}/${c.repo}/releases`)}/latest`, this.baseApiUrl);
      try {
        const y = await this.httpRequest(p, { Accept: "application/json" }, f);
        return y == null ? null : JSON.parse(y).tag_name;
      } catch (y) {
        throw (0, e.newError)(`Unable to find latest version on GitHub (${p}), please ensure a production release exists: ${y.stack || y.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
      }
    }
    get basePath() {
      return `/${this.options.owner}/${this.options.repo}/releases`;
    }
    resolveFiles(f) {
      return (0, u.resolveFiles)(f, this.baseUrl, (c) => this.getBaseDownloadPath(f.tag, c.replace(/ /g, "-")));
    }
    getBaseDownloadPath(f, c) {
      return `${this.basePath}/download/${f}/${c}`;
    }
  };
  Bt.GitHubProvider = d;
  function a(o) {
    const f = o.elementValueOrEmpty("content");
    return f === "No content." ? "" : f;
  }
  function l(o, f, c, p) {
    if (!f)
      return a(p);
    const y = [];
    for (const E of c.getElements("entry")) {
      const h = /\/tag\/v?([^/]+)$/.exec(E.element("link").attribute("href"))[1];
      t.lt(o, h) && y.push({
        version: h,
        note: a(E)
      });
    }
    return y.sort((E, h) => t.rcompare(E.version, h.version));
  }
  return Bt;
}
var Qr = {}, Jf;
function L_() {
  if (Jf) return Qr;
  Jf = 1, Object.defineProperty(Qr, "__esModule", { value: !0 }), Qr.KeygenProvider = void 0;
  const e = Qe(), t = hr(), i = mt();
  let r = class extends i.Provider {
    constructor(n, s, d) {
      super({
        ...d,
        isUseMultipleRangeRequest: !1
      }), this.configuration = n, this.updater = s, this.defaultHostname = "api.keygen.sh";
      const a = this.configuration.host || this.defaultHostname;
      this.baseUrl = (0, t.newBaseUrl)(`https://${a}/v1/accounts/${this.configuration.account}/artifacts?product=${this.configuration.product}`);
    }
    get channel() {
      return this.updater.channel || this.configuration.channel || "stable";
    }
    async getLatestVersion() {
      const n = new e.CancellationToken(), s = (0, t.getChannelFilename)(this.getCustomChannelName(this.channel)), d = (0, t.newUrlFromBase)(s, this.baseUrl, this.updater.isAddNoCacheQuery);
      try {
        const a = await this.httpRequest(d, {
          Accept: "application/vnd.api+json",
          "Keygen-Version": "1.1"
        }, n);
        return (0, i.parseUpdateInfo)(a, s, d);
      } catch (a) {
        throw (0, e.newError)(`Unable to find latest version on ${this.toString()}, please ensure release exists: ${a.stack || a.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
      }
    }
    resolveFiles(n) {
      return (0, i.resolveFiles)(n, this.baseUrl);
    }
    toString() {
      const { account: n, product: s, platform: d } = this.configuration;
      return `Keygen (account: ${n}, product: ${s}, platform: ${d}, channel: ${this.channel})`;
    }
  };
  return Qr.KeygenProvider = r, Qr;
}
var Zr = {}, Qf;
function F_() {
  if (Qf) return Zr;
  Qf = 1, Object.defineProperty(Zr, "__esModule", { value: !0 }), Zr.PrivateGitHubProvider = void 0;
  const e = Qe(), t = iu(), i = $e, r = Pr, u = hr(), n = yp(), s = mt();
  let d = class extends n.BaseGitHubProvider {
    constructor(l, o, f, c) {
      super(l, "api.github.com", c), this.updater = o, this.token = f;
    }
    createRequestOptions(l, o) {
      const f = super.createRequestOptions(l, o);
      return f.redirect = "manual", f;
    }
    async getLatestVersion() {
      const l = new e.CancellationToken(), o = (0, u.getChannelFilename)(this.getDefaultChannelName()), f = await this.getLatestVersionInfo(l), c = f.assets.find((E) => E.name === o);
      if (c == null)
        throw (0, e.newError)(`Cannot find ${o} in the release ${f.html_url || f.name}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
      const p = new r.URL(c.url);
      let y;
      try {
        y = (0, t.load)(await this.httpRequest(p, this.configureHeaders("application/octet-stream"), l));
      } catch (E) {
        throw E instanceof e.HttpError && E.statusCode === 404 ? (0, e.newError)(`Cannot find ${o} in the latest release artifacts (${p}): ${E.stack || E.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND") : E;
      }
      return y.assets = f.assets, y;
    }
    get fileExtraDownloadHeaders() {
      return this.configureHeaders("application/octet-stream");
    }
    configureHeaders(l) {
      return {
        accept: l,
        authorization: `token ${this.token}`
      };
    }
    async getLatestVersionInfo(l) {
      const o = this.updater.allowPrerelease;
      let f = this.basePath;
      o || (f = `${f}/latest`);
      const c = (0, u.newUrlFromBase)(f, this.baseUrl);
      try {
        const p = JSON.parse(await this.httpRequest(c, this.configureHeaders("application/vnd.github.v3+json"), l));
        return o ? p.find((y) => y.prerelease) || p[0] : p;
      } catch (p) {
        throw (0, e.newError)(`Unable to find latest version on GitHub (${c}), please ensure a production release exists: ${p.stack || p.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
      }
    }
    get basePath() {
      return this.computeGithubBasePath(`/repos/${this.options.owner}/${this.options.repo}/releases`);
    }
    resolveFiles(l) {
      return (0, s.getFileList)(l).map((o) => {
        const f = i.posix.basename(o.url).replace(/ /g, "-"), c = l.assets.find((p) => p != null && p.name === f);
        if (c == null)
          throw (0, e.newError)(`Cannot find asset "${f}" in: ${JSON.stringify(l.assets, null, 2)}`, "ERR_UPDATER_ASSET_NOT_FOUND");
        return {
          url: new r.URL(c.url),
          info: o
        };
      });
    }
  };
  return Zr.PrivateGitHubProvider = d, Zr;
}
var Zf;
function U_() {
  if (Zf) return Kr;
  Zf = 1, Object.defineProperty(Kr, "__esModule", { value: !0 }), Kr.isUrlProbablySupportMultiRangeRequests = s, Kr.createClient = d;
  const e = Qe(), t = k_(), i = gp(), r = yp(), u = L_(), n = F_();
  function s(a) {
    return !a.includes("s3.amazonaws.com");
  }
  function d(a, l, o) {
    if (typeof a == "string")
      throw (0, e.newError)("Please pass PublishConfiguration object", "ERR_UPDATER_INVALID_PROVIDER_CONFIGURATION");
    const f = a.provider;
    switch (f) {
      case "github": {
        const c = a, p = (c.private ? process.env.GH_TOKEN || process.env.GITHUB_TOKEN : null) || c.token;
        return p == null ? new r.GitHubProvider(c, l, o) : new n.PrivateGitHubProvider(c, l, p, o);
      }
      case "bitbucket":
        return new t.BitbucketProvider(a, l, o);
      case "keygen":
        return new u.KeygenProvider(a, l, o);
      case "s3":
      case "spaces":
        return new i.GenericProvider({
          provider: "generic",
          url: (0, e.getS3LikeProviderBaseUrl)(a),
          channel: a.channel || null
        }, l, {
          ...o,
          // https://github.com/minio/minio/issues/5285#issuecomment-350428955
          isUseMultipleRangeRequest: !1
        });
      case "generic": {
        const c = a;
        return new i.GenericProvider(c, l, {
          ...o,
          isUseMultipleRangeRequest: c.useMultipleRangeRequest !== !1 && s(c.url)
        });
      }
      case "custom": {
        const c = a, p = c.updateProvider;
        if (!p)
          throw (0, e.newError)("Custom provider not specified", "ERR_UPDATER_INVALID_PROVIDER_CONFIGURATION");
        return new p(c, l, o);
      }
      default:
        throw (0, e.newError)(`Unsupported provider: ${f}`, "ERR_UPDATER_UNSUPPORTED_PROVIDER");
    }
  }
  return Kr;
}
var en = {}, tn = {}, wr = {}, Sr = {}, eh;
function au() {
  if (eh) return Sr;
  eh = 1, Object.defineProperty(Sr, "__esModule", { value: !0 }), Sr.OperationKind = void 0, Sr.computeOperations = t;
  var e;
  (function(s) {
    s[s.COPY = 0] = "COPY", s[s.DOWNLOAD = 1] = "DOWNLOAD";
  })(e || (Sr.OperationKind = e = {}));
  function t(s, d, a) {
    const l = n(s.files), o = n(d.files);
    let f = null;
    const c = d.files[0], p = [], y = c.name, E = l.get(y);
    if (E == null)
      throw new Error(`no file ${y} in old blockmap`);
    const h = o.get(y);
    let _ = 0;
    const { checksumToOffset: g, checksumToOldSize: w } = u(l.get(y), E.offset, a);
    let b = c.offset;
    for (let R = 0; R < h.checksums.length; b += h.sizes[R], R++) {
      const v = h.sizes[R], S = h.checksums[R];
      let O = g.get(S);
      O != null && w.get(S) !== v && (a.warn(`Checksum ("${S}") matches, but size differs (old: ${w.get(S)}, new: ${v})`), O = void 0), O === void 0 ? (_++, f != null && f.kind === e.DOWNLOAD && f.end === b ? f.end += v : (f = {
        kind: e.DOWNLOAD,
        start: b,
        end: b + v
        // oldBlocks: null,
      }, r(f, p, S, R))) : f != null && f.kind === e.COPY && f.end === O ? f.end += v : (f = {
        kind: e.COPY,
        start: O,
        end: O + v
        // oldBlocks: [checksum]
      }, r(f, p, S, R));
    }
    return _ > 0 && a.info(`File${c.name === "file" ? "" : " " + c.name} has ${_} changed blocks`), p;
  }
  const i = process.env.DIFFERENTIAL_DOWNLOAD_PLAN_BUILDER_VALIDATE_RANGES === "true";
  function r(s, d, a, l) {
    if (i && d.length !== 0) {
      const o = d[d.length - 1];
      if (o.kind === s.kind && s.start < o.end && s.start > o.start) {
        const f = [o.start, o.end, s.start, s.end].reduce((c, p) => c < p ? c : p);
        throw new Error(`operation (block index: ${l}, checksum: ${a}, kind: ${e[s.kind]}) overlaps previous operation (checksum: ${a}):
abs: ${o.start} until ${o.end} and ${s.start} until ${s.end}
rel: ${o.start - f} until ${o.end - f} and ${s.start - f} until ${s.end - f}`);
      }
    }
    d.push(s);
  }
  function u(s, d, a) {
    const l = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map();
    let f = d;
    for (let c = 0; c < s.checksums.length; c++) {
      const p = s.checksums[c], y = s.sizes[c], E = o.get(p);
      if (E === void 0)
        l.set(p, f), o.set(p, y);
      else if (a.debug != null) {
        const h = E === y ? "(same size)" : `(size: ${E}, this size: ${y})`;
        a.debug(`${p} duplicated in blockmap ${h}, it doesn't lead to broken differential downloader, just corresponding block will be skipped)`);
      }
      f += y;
    }
    return { checksumToOffset: l, checksumToOldSize: o };
  }
  function n(s) {
    const d = /* @__PURE__ */ new Map();
    for (const a of s)
      d.set(a.name, a);
    return d;
  }
  return Sr;
}
var th;
function _p() {
  if (th) return wr;
  th = 1, Object.defineProperty(wr, "__esModule", { value: !0 }), wr.DataSplitter = void 0, wr.copyData = s;
  const e = Qe(), t = Tt, i = En, r = au(), u = Buffer.from(`\r
\r
`);
  var n;
  (function(a) {
    a[a.INIT = 0] = "INIT", a[a.HEADER = 1] = "HEADER", a[a.BODY = 2] = "BODY";
  })(n || (n = {}));
  function s(a, l, o, f, c) {
    const p = (0, t.createReadStream)("", {
      fd: o,
      autoClose: !1,
      start: a.start,
      // end is inclusive
      end: a.end - 1
    });
    p.on("error", f), p.once("end", c), p.pipe(l, {
      end: !1
    });
  }
  let d = class extends i.Writable {
    constructor(l, o, f, c, p, y) {
      super(), this.out = l, this.options = o, this.partIndexToTaskIndex = f, this.partIndexToLength = p, this.finishHandler = y, this.partIndex = -1, this.headerListBuffer = null, this.readState = n.INIT, this.ignoreByteCount = 0, this.remainingPartDataCount = 0, this.actualPartLength = 0, this.boundaryLength = c.length + 4, this.ignoreByteCount = this.boundaryLength - 2;
    }
    get isFinished() {
      return this.partIndex === this.partIndexToLength.length;
    }
    // noinspection JSUnusedGlobalSymbols
    _write(l, o, f) {
      if (this.isFinished) {
        console.error(`Trailing ignored data: ${l.length} bytes`);
        return;
      }
      this.handleData(l).then(f).catch(f);
    }
    async handleData(l) {
      let o = 0;
      if (this.ignoreByteCount !== 0 && this.remainingPartDataCount !== 0)
        throw (0, e.newError)("Internal error", "ERR_DATA_SPLITTER_BYTE_COUNT_MISMATCH");
      if (this.ignoreByteCount > 0) {
        const f = Math.min(this.ignoreByteCount, l.length);
        this.ignoreByteCount -= f, o = f;
      } else if (this.remainingPartDataCount > 0) {
        const f = Math.min(this.remainingPartDataCount, l.length);
        this.remainingPartDataCount -= f, await this.processPartData(l, 0, f), o = f;
      }
      if (o !== l.length) {
        if (this.readState === n.HEADER) {
          const f = this.searchHeaderListEnd(l, o);
          if (f === -1)
            return;
          o = f, this.readState = n.BODY, this.headerListBuffer = null;
        }
        for (; ; ) {
          if (this.readState === n.BODY)
            this.readState = n.INIT;
          else {
            this.partIndex++;
            let y = this.partIndexToTaskIndex.get(this.partIndex);
            if (y == null)
              if (this.isFinished)
                y = this.options.end;
              else
                throw (0, e.newError)("taskIndex is null", "ERR_DATA_SPLITTER_TASK_INDEX_IS_NULL");
            const E = this.partIndex === 0 ? this.options.start : this.partIndexToTaskIndex.get(this.partIndex - 1) + 1;
            if (E < y)
              await this.copyExistingData(E, y);
            else if (E > y)
              throw (0, e.newError)("prevTaskIndex must be < taskIndex", "ERR_DATA_SPLITTER_TASK_INDEX_ASSERT_FAILED");
            if (this.isFinished) {
              this.onPartEnd(), this.finishHandler();
              return;
            }
            if (o = this.searchHeaderListEnd(l, o), o === -1) {
              this.readState = n.HEADER;
              return;
            }
          }
          const f = this.partIndexToLength[this.partIndex], c = o + f, p = Math.min(c, l.length);
          if (await this.processPartStarted(l, o, p), this.remainingPartDataCount = f - (p - o), this.remainingPartDataCount > 0)
            return;
          if (o = c + this.boundaryLength, o >= l.length) {
            this.ignoreByteCount = this.boundaryLength - (l.length - c);
            return;
          }
        }
      }
    }
    copyExistingData(l, o) {
      return new Promise((f, c) => {
        const p = () => {
          if (l === o) {
            f();
            return;
          }
          const y = this.options.tasks[l];
          if (y.kind !== r.OperationKind.COPY) {
            c(new Error("Task kind must be COPY"));
            return;
          }
          s(y, this.out, this.options.oldFileFd, c, () => {
            l++, p();
          });
        };
        p();
      });
    }
    searchHeaderListEnd(l, o) {
      const f = l.indexOf(u, o);
      if (f !== -1)
        return f + u.length;
      const c = o === 0 ? l : l.slice(o);
      return this.headerListBuffer == null ? this.headerListBuffer = c : this.headerListBuffer = Buffer.concat([this.headerListBuffer, c]), -1;
    }
    onPartEnd() {
      const l = this.partIndexToLength[this.partIndex - 1];
      if (this.actualPartLength !== l)
        throw (0, e.newError)(`Expected length: ${l} differs from actual: ${this.actualPartLength}`, "ERR_DATA_SPLITTER_LENGTH_MISMATCH");
      this.actualPartLength = 0;
    }
    processPartStarted(l, o, f) {
      return this.partIndex !== 0 && this.onPartEnd(), this.processPartData(l, o, f);
    }
    processPartData(l, o, f) {
      this.actualPartLength += f - o;
      const c = this.out;
      return c.write(o === 0 && l.length === f ? l : l.slice(o, f)) ? Promise.resolve() : new Promise((p, y) => {
        c.on("error", y), c.once("drain", () => {
          c.removeListener("error", y), p();
        });
      });
    }
  };
  return wr.DataSplitter = d, wr;
}
var rn = {}, rh;
function q_() {
  if (rh) return rn;
  rh = 1, Object.defineProperty(rn, "__esModule", { value: !0 }), rn.executeTasksUsingMultipleRangeRequests = r, rn.checkIsRangesSupported = n;
  const e = Qe(), t = _p(), i = au();
  function r(s, d, a, l, o) {
    const f = (c) => {
      if (c >= d.length) {
        s.fileMetadataBuffer != null && a.write(s.fileMetadataBuffer), a.end();
        return;
      }
      const p = c + 1e3;
      u(s, {
        tasks: d,
        start: c,
        end: Math.min(d.length, p),
        oldFileFd: l
      }, a, () => f(p), o);
    };
    return f;
  }
  function u(s, d, a, l, o) {
    let f = "bytes=", c = 0;
    const p = /* @__PURE__ */ new Map(), y = [];
    for (let _ = d.start; _ < d.end; _++) {
      const g = d.tasks[_];
      g.kind === i.OperationKind.DOWNLOAD && (f += `${g.start}-${g.end - 1}, `, p.set(c, _), c++, y.push(g.end - g.start));
    }
    if (c <= 1) {
      const _ = (g) => {
        if (g >= d.end) {
          l();
          return;
        }
        const w = d.tasks[g++];
        if (w.kind === i.OperationKind.COPY)
          (0, t.copyData)(w, a, d.oldFileFd, o, () => _(g));
        else {
          const b = s.createRequestOptions();
          b.headers.Range = `bytes=${w.start}-${w.end - 1}`;
          const R = s.httpExecutor.createRequest(b, (v) => {
            n(v, o) && (v.pipe(a, {
              end: !1
            }), v.once("end", () => _(g)));
          });
          s.httpExecutor.addErrorAndTimeoutHandlers(R, o), R.end();
        }
      };
      _(d.start);
      return;
    }
    const E = s.createRequestOptions();
    E.headers.Range = f.substring(0, f.length - 2);
    const h = s.httpExecutor.createRequest(E, (_) => {
      if (!n(_, o))
        return;
      const g = (0, e.safeGetHeader)(_, "content-type"), w = /^multipart\/.+?(?:; boundary=(?:(?:"(.+)")|(?:([^\s]+))))$/i.exec(g);
      if (w == null) {
        o(new Error(`Content-Type "multipart/byteranges" is expected, but got "${g}"`));
        return;
      }
      const b = new t.DataSplitter(a, d, p, w[1] || w[2], y, l);
      b.on("error", o), _.pipe(b), _.on("end", () => {
        setTimeout(() => {
          h.abort(), o(new Error("Response ends without calling any handlers"));
        }, 1e4);
      });
    });
    s.httpExecutor.addErrorAndTimeoutHandlers(h, o), h.end();
  }
  function n(s, d) {
    if (s.statusCode >= 400)
      return d((0, e.createHttpError)(s)), !1;
    if (s.statusCode !== 206) {
      const a = (0, e.safeGetHeader)(s, "accept-ranges");
      if (a == null || a === "none")
        return d(new Error(`Server doesn't support Accept-Ranges (response code ${s.statusCode})`)), !1;
    }
    return !0;
  }
  return rn;
}
var nn = {}, nh;
function x_() {
  if (nh) return nn;
  nh = 1, Object.defineProperty(nn, "__esModule", { value: !0 }), nn.ProgressDifferentialDownloadCallbackTransform = void 0;
  const e = En;
  var t;
  (function(r) {
    r[r.COPY = 0] = "COPY", r[r.DOWNLOAD = 1] = "DOWNLOAD";
  })(t || (t = {}));
  let i = class extends e.Transform {
    constructor(u, n, s) {
      super(), this.progressDifferentialDownloadInfo = u, this.cancellationToken = n, this.onProgress = s, this.start = Date.now(), this.transferred = 0, this.delta = 0, this.expectedBytes = 0, this.index = 0, this.operationType = t.COPY, this.nextUpdate = this.start + 1e3;
    }
    _transform(u, n, s) {
      if (this.cancellationToken.cancelled) {
        s(new Error("cancelled"), null);
        return;
      }
      if (this.operationType == t.COPY) {
        s(null, u);
        return;
      }
      this.transferred += u.length, this.delta += u.length;
      const d = Date.now();
      d >= this.nextUpdate && this.transferred !== this.expectedBytes && this.transferred !== this.progressDifferentialDownloadInfo.grandTotal && (this.nextUpdate = d + 1e3, this.onProgress({
        total: this.progressDifferentialDownloadInfo.grandTotal,
        delta: this.delta,
        transferred: this.transferred,
        percent: this.transferred / this.progressDifferentialDownloadInfo.grandTotal * 100,
        bytesPerSecond: Math.round(this.transferred / ((d - this.start) / 1e3))
      }), this.delta = 0), s(null, u);
    }
    beginFileCopy() {
      this.operationType = t.COPY;
    }
    beginRangeDownload() {
      this.operationType = t.DOWNLOAD, this.expectedBytes += this.progressDifferentialDownloadInfo.expectedByteCounts[this.index++];
    }
    endRangeDownload() {
      this.transferred !== this.progressDifferentialDownloadInfo.grandTotal && this.onProgress({
        total: this.progressDifferentialDownloadInfo.grandTotal,
        delta: this.delta,
        transferred: this.transferred,
        percent: this.transferred / this.progressDifferentialDownloadInfo.grandTotal * 100,
        bytesPerSecond: Math.round(this.transferred / ((Date.now() - this.start) / 1e3))
      });
    }
    // Called when we are 100% done with the connection/download
    _flush(u) {
      if (this.cancellationToken.cancelled) {
        u(new Error("cancelled"));
        return;
      }
      this.onProgress({
        total: this.progressDifferentialDownloadInfo.grandTotal,
        delta: this.delta,
        transferred: this.transferred,
        percent: 100,
        bytesPerSecond: Math.round(this.transferred / ((Date.now() - this.start) / 1e3))
      }), this.delta = 0, this.transferred = 0, u(null);
    }
  };
  return nn.ProgressDifferentialDownloadCallbackTransform = i, nn;
}
var ih;
function Ep() {
  if (ih) return tn;
  ih = 1, Object.defineProperty(tn, "__esModule", { value: !0 }), tn.DifferentialDownloader = void 0;
  const e = Qe(), t = /* @__PURE__ */ Wt(), i = Tt, r = _p(), u = Pr, n = au(), s = q_(), d = x_();
  let a = class {
    // noinspection TypeScriptAbstractClassConstructorCanBeMadeProtected
    constructor(c, p, y) {
      this.blockAwareFileInfo = c, this.httpExecutor = p, this.options = y, this.fileMetadataBuffer = null, this.logger = y.logger;
    }
    createRequestOptions() {
      const c = {
        headers: {
          ...this.options.requestHeaders,
          accept: "*/*"
        }
      };
      return (0, e.configureRequestUrl)(this.options.newUrl, c), (0, e.configureRequestOptions)(c), c;
    }
    doDownload(c, p) {
      if (c.version !== p.version)
        throw new Error(`version is different (${c.version} - ${p.version}), full download is required`);
      const y = this.logger, E = (0, n.computeOperations)(c, p, y);
      y.debug != null && y.debug(JSON.stringify(E, null, 2));
      let h = 0, _ = 0;
      for (const w of E) {
        const b = w.end - w.start;
        w.kind === n.OperationKind.DOWNLOAD ? h += b : _ += b;
      }
      const g = this.blockAwareFileInfo.size;
      if (h + _ + (this.fileMetadataBuffer == null ? 0 : this.fileMetadataBuffer.length) !== g)
        throw new Error(`Internal error, size mismatch: downloadSize: ${h}, copySize: ${_}, newSize: ${g}`);
      return y.info(`Full: ${l(g)}, To download: ${l(h)} (${Math.round(h / (g / 100))}%)`), this.downloadFile(E);
    }
    downloadFile(c) {
      const p = [], y = () => Promise.all(p.map((E) => (0, t.close)(E.descriptor).catch((h) => {
        this.logger.error(`cannot close file "${E.path}": ${h}`);
      })));
      return this.doDownloadFile(c, p).then(y).catch((E) => y().catch((h) => {
        try {
          this.logger.error(`cannot close files: ${h}`);
        } catch (_) {
          try {
            console.error(_);
          } catch {
          }
        }
        throw E;
      }).then(() => {
        throw E;
      }));
    }
    async doDownloadFile(c, p) {
      const y = await (0, t.open)(this.options.oldFile, "r");
      p.push({ descriptor: y, path: this.options.oldFile });
      const E = await (0, t.open)(this.options.newFile, "w");
      p.push({ descriptor: E, path: this.options.newFile });
      const h = (0, i.createWriteStream)(this.options.newFile, { fd: E });
      await new Promise((_, g) => {
        const w = [];
        let b;
        if (!this.options.isUseMultipleRangeRequest && this.options.onProgress) {
          const U = [];
          let V = 0;
          for (const B of c)
            B.kind === n.OperationKind.DOWNLOAD && (U.push(B.end - B.start), V += B.end - B.start);
          const L = {
            expectedByteCounts: U,
            grandTotal: V
          };
          b = new d.ProgressDifferentialDownloadCallbackTransform(L, this.options.cancellationToken, this.options.onProgress), w.push(b);
        }
        const R = new e.DigestTransform(this.blockAwareFileInfo.sha512);
        R.isValidateOnEnd = !1, w.push(R), h.on("finish", () => {
          h.close(() => {
            p.splice(1, 1);
            try {
              R.validate();
            } catch (U) {
              g(U);
              return;
            }
            _(void 0);
          });
        }), w.push(h);
        let v = null;
        for (const U of w)
          U.on("error", g), v == null ? v = U : v = v.pipe(U);
        const S = w[0];
        let O;
        if (this.options.isUseMultipleRangeRequest) {
          O = (0, s.executeTasksUsingMultipleRangeRequests)(this, c, S, y, g), O(0);
          return;
        }
        let T = 0, $ = null;
        this.logger.info(`Differential download: ${this.options.newUrl}`);
        const k = this.createRequestOptions();
        k.redirect = "manual", O = (U) => {
          var V, L;
          if (U >= c.length) {
            this.fileMetadataBuffer != null && S.write(this.fileMetadataBuffer), S.end();
            return;
          }
          const B = c[U++];
          if (B.kind === n.OperationKind.COPY) {
            b && b.beginFileCopy(), (0, r.copyData)(B, S, y, g, () => O(U));
            return;
          }
          const te = `bytes=${B.start}-${B.end - 1}`;
          k.headers.range = te, (L = (V = this.logger) === null || V === void 0 ? void 0 : V.debug) === null || L === void 0 || L.call(V, `download range: ${te}`), b && b.beginRangeDownload();
          const j = this.httpExecutor.createRequest(k, (H) => {
            H.on("error", g), H.on("aborted", () => {
              g(new Error("response has been aborted by the server"));
            }), H.statusCode >= 400 && g((0, e.createHttpError)(H)), H.pipe(S, {
              end: !1
            }), H.once("end", () => {
              b && b.endRangeDownload(), ++T === 100 ? (T = 0, setTimeout(() => O(U), 1e3)) : O(U);
            });
          });
          j.on("redirect", (H, Y, F) => {
            this.logger.info(`Redirect to ${o(F)}`), $ = F, (0, e.configureRequestUrl)(new u.URL($), k), j.followRedirect();
          }), this.httpExecutor.addErrorAndTimeoutHandlers(j, g), j.end();
        }, O(0);
      });
    }
    async readRemoteBytes(c, p) {
      const y = Buffer.allocUnsafe(p + 1 - c), E = this.createRequestOptions();
      E.headers.range = `bytes=${c}-${p}`;
      let h = 0;
      if (await this.request(E, (_) => {
        _.copy(y, h), h += _.length;
      }), h !== y.length)
        throw new Error(`Received data length ${h} is not equal to expected ${y.length}`);
      return y;
    }
    request(c, p) {
      return new Promise((y, E) => {
        const h = this.httpExecutor.createRequest(c, (_) => {
          (0, s.checkIsRangesSupported)(_, E) && (_.on("error", E), _.on("aborted", () => {
            E(new Error("response has been aborted by the server"));
          }), _.on("data", p), _.on("end", () => y()));
        });
        this.httpExecutor.addErrorAndTimeoutHandlers(h, E), h.end();
      });
    }
  };
  tn.DifferentialDownloader = a;
  function l(f, c = " KB") {
    return new Intl.NumberFormat("en").format((f / 1024).toFixed(2)) + c;
  }
  function o(f) {
    const c = f.indexOf("?");
    return c < 0 ? f : f.substring(0, c);
  }
  return tn;
}
var ah;
function M_() {
  if (ah) return en;
  ah = 1, Object.defineProperty(en, "__esModule", { value: !0 }), en.GenericDifferentialDownloader = void 0;
  const e = Ep();
  let t = class extends e.DifferentialDownloader {
    download(r, u) {
      return this.doDownload(r, u);
    }
  };
  return en.GenericDifferentialDownloader = t, en;
}
var Po = {}, sh;
function pr() {
  return sh || (sh = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.UpdaterSignal = e.UPDATE_DOWNLOADED = e.DOWNLOAD_PROGRESS = e.CancellationToken = void 0, e.addHandler = r;
    const t = Qe();
    Object.defineProperty(e, "CancellationToken", { enumerable: !0, get: function() {
      return t.CancellationToken;
    } }), e.DOWNLOAD_PROGRESS = "download-progress", e.UPDATE_DOWNLOADED = "update-downloaded";
    class i {
      constructor(n) {
        this.emitter = n;
      }
      /**
       * Emitted when an authenticating proxy is [asking for user credentials](https://github.com/electron/electron/blob/master/docs/api/client-request.md#event-login).
       */
      login(n) {
        r(this.emitter, "login", n);
      }
      progress(n) {
        r(this.emitter, e.DOWNLOAD_PROGRESS, n);
      }
      updateDownloaded(n) {
        r(this.emitter, e.UPDATE_DOWNLOADED, n);
      }
      updateCancelled(n) {
        r(this.emitter, "update-cancelled", n);
      }
    }
    e.UpdaterSignal = i;
    function r(u, n, s) {
      u.on(n, s);
    }
  })(Po)), Po;
}
var oh;
function su() {
  if (oh) return or;
  oh = 1, Object.defineProperty(or, "__esModule", { value: !0 }), or.NoOpLogger = or.AppUpdater = void 0;
  const e = Qe(), t = Nr, i = _n, r = Uo, u = /* @__PURE__ */ Wt(), n = iu(), s = O_(), d = $e, a = Wo(), l = P_(), o = I_(), f = D_(), c = gp(), p = U_(), y = Ah, E = hr(), h = M_(), _ = pr();
  let g = class vp extends r.EventEmitter {
    /**
     * Get the update channel. Doesn't return `channel` from the update configuration, only if was previously set.
     */
    get channel() {
      return this._channel;
    }
    /**
     * Set the update channel. Overrides `channel` in the update configuration.
     *
     * `allowDowngrade` will be automatically set to `true`. If this behavior is not suitable for you, simple set `allowDowngrade` explicitly after.
     */
    set channel(v) {
      if (this._channel != null) {
        if (typeof v != "string")
          throw (0, e.newError)(`Channel must be a string, but got: ${v}`, "ERR_UPDATER_INVALID_CHANNEL");
        if (v.length === 0)
          throw (0, e.newError)("Channel must be not an empty string", "ERR_UPDATER_INVALID_CHANNEL");
      }
      this._channel = v, this.allowDowngrade = !0;
    }
    /**
     *  Shortcut for explicitly adding auth tokens to request headers
     */
    addAuthHeader(v) {
      this.requestHeaders = Object.assign({}, this.requestHeaders, {
        authorization: v
      });
    }
    // noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
    get netSession() {
      return (0, f.getNetSession)();
    }
    /**
     * The logger. You can pass [electron-log](https://github.com/megahertz/electron-log), [winston](https://github.com/winstonjs/winston) or another logger with the following interface: `{ info(), warn(), error() }`.
     * Set it to `null` if you would like to disable a logging feature.
     */
    get logger() {
      return this._logger;
    }
    set logger(v) {
      this._logger = v ?? new b();
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * test only
     * @private
     */
    set updateConfigPath(v) {
      this.clientPromise = null, this._appUpdateConfigPath = v, this.configOnDisk = new s.Lazy(() => this.loadUpdateConfig());
    }
    /**
     * Allows developer to override default logic for determining if an update is supported.
     * The default logic compares the `UpdateInfo` minimum system version against the `os.release()` with `semver` package
     */
    get isUpdateSupported() {
      return this._isUpdateSupported;
    }
    set isUpdateSupported(v) {
      v && (this._isUpdateSupported = v);
    }
    constructor(v, S) {
      super(), this.autoDownload = !0, this.autoInstallOnAppQuit = !0, this.autoRunAppAfterInstall = !0, this.allowPrerelease = !1, this.fullChangelog = !1, this.allowDowngrade = !1, this.disableWebInstaller = !1, this.disableDifferentialDownload = !1, this.forceDevUpdateConfig = !1, this._channel = null, this.downloadedUpdateHelper = null, this.requestHeaders = null, this._logger = console, this.signals = new _.UpdaterSignal(this), this._appUpdateConfigPath = null, this._isUpdateSupported = ($) => this.checkIfUpdateSupported($), this.clientPromise = null, this.stagingUserIdPromise = new s.Lazy(() => this.getOrCreateStagingUserId()), this.configOnDisk = new s.Lazy(() => this.loadUpdateConfig()), this.checkForUpdatesPromise = null, this.downloadPromise = null, this.updateInfoAndProvider = null, this._testOnlyOptions = null, this.on("error", ($) => {
        this._logger.error(`Error: ${$.stack || $.message}`);
      }), S == null ? (this.app = new o.ElectronAppAdapter(), this.httpExecutor = new f.ElectronHttpExecutor(($, k) => this.emit("login", $, k))) : (this.app = S, this.httpExecutor = null);
      const O = this.app.version, T = (0, a.parse)(O);
      if (T == null)
        throw (0, e.newError)(`App version is not a valid semver version: "${O}"`, "ERR_UPDATER_INVALID_VERSION");
      this.currentVersion = T, this.allowPrerelease = w(T), v != null && (this.setFeedURL(v), typeof v != "string" && v.requestHeaders && (this.requestHeaders = v.requestHeaders));
    }
    //noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
    getFeedURL() {
      return "Deprecated. Do not use it.";
    }
    /**
     * Configure update provider. If value is `string`, [GenericServerOptions](./publish.md#genericserveroptions) will be set with value as `url`.
     * @param options If you want to override configuration in the `app-update.yml`.
     */
    setFeedURL(v) {
      const S = this.createProviderRuntimeOptions();
      let O;
      typeof v == "string" ? O = new c.GenericProvider({ provider: "generic", url: v }, this, {
        ...S,
        isUseMultipleRangeRequest: (0, p.isUrlProbablySupportMultiRangeRequests)(v)
      }) : O = (0, p.createClient)(v, this, S), this.clientPromise = Promise.resolve(O);
    }
    /**
     * Asks the server whether there is an update.
     * @returns null if the updater is disabled, otherwise info about the latest version
     */
    checkForUpdates() {
      if (!this.isUpdaterActive())
        return Promise.resolve(null);
      let v = this.checkForUpdatesPromise;
      if (v != null)
        return this._logger.info("Checking for update (already in progress)"), v;
      const S = () => this.checkForUpdatesPromise = null;
      return this._logger.info("Checking for update"), v = this.doCheckForUpdates().then((O) => (S(), O)).catch((O) => {
        throw S(), this.emit("error", O, `Cannot check for updates: ${(O.stack || O).toString()}`), O;
      }), this.checkForUpdatesPromise = v, v;
    }
    isUpdaterActive() {
      return this.app.isPackaged || this.forceDevUpdateConfig ? !0 : (this._logger.info("Skip checkForUpdates because application is not packed and dev update config is not forced"), !1);
    }
    // noinspection JSUnusedGlobalSymbols
    checkForUpdatesAndNotify(v) {
      return this.checkForUpdates().then((S) => S?.downloadPromise ? (S.downloadPromise.then(() => {
        const O = vp.formatDownloadNotification(S.updateInfo.version, this.app.name, v);
        new zt.Notification(O).show();
      }), S) : (this._logger.debug != null && this._logger.debug("checkForUpdatesAndNotify called, downloadPromise is null"), S));
    }
    static formatDownloadNotification(v, S, O) {
      return O == null && (O = {
        title: "A new update is ready to install",
        body: "{appName} version {version} has been downloaded and will be automatically installed on exit"
      }), O = {
        title: O.title.replace("{appName}", S).replace("{version}", v),
        body: O.body.replace("{appName}", S).replace("{version}", v)
      }, O;
    }
    async isStagingMatch(v) {
      const S = v.stagingPercentage;
      let O = S;
      if (O == null)
        return !0;
      if (O = parseInt(O, 10), isNaN(O))
        return this._logger.warn(`Staging percentage is NaN: ${S}`), !0;
      O = O / 100;
      const T = await this.stagingUserIdPromise.value, k = e.UUID.parse(T).readUInt32BE(12) / 4294967295;
      return this._logger.info(`Staging percentage: ${O}, percentage: ${k}, user id: ${T}`), k < O;
    }
    computeFinalHeaders(v) {
      return this.requestHeaders != null && Object.assign(v, this.requestHeaders), v;
    }
    async isUpdateAvailable(v) {
      const S = (0, a.parse)(v.version);
      if (S == null)
        throw (0, e.newError)(`This file could not be downloaded, or the latest version (from update server) does not have a valid semver version: "${v.version}"`, "ERR_UPDATER_INVALID_VERSION");
      const O = this.currentVersion;
      if ((0, a.eq)(S, O) || !await Promise.resolve(this.isUpdateSupported(v)) || !await this.isStagingMatch(v))
        return !1;
      const $ = (0, a.gt)(S, O), k = (0, a.lt)(S, O);
      return $ ? !0 : this.allowDowngrade && k;
    }
    checkIfUpdateSupported(v) {
      const S = v?.minimumSystemVersion, O = (0, i.release)();
      if (S)
        try {
          if ((0, a.lt)(O, S))
            return this._logger.info(`Current OS version ${O} is less than the minimum OS version required ${S} for version ${O}`), !1;
        } catch (T) {
          this._logger.warn(`Failed to compare current OS version(${O}) with minimum OS version(${S}): ${(T.message || T).toString()}`);
        }
      return !0;
    }
    async getUpdateInfoAndProvider() {
      await this.app.whenReady(), this.clientPromise == null && (this.clientPromise = this.configOnDisk.value.then((O) => (0, p.createClient)(O, this, this.createProviderRuntimeOptions())));
      const v = await this.clientPromise, S = await this.stagingUserIdPromise.value;
      return v.setRequestHeaders(this.computeFinalHeaders({ "x-user-staging-id": S })), {
        info: await v.getLatestVersion(),
        provider: v
      };
    }
    createProviderRuntimeOptions() {
      return {
        isUseMultipleRangeRequest: !0,
        platform: this._testOnlyOptions == null ? process.platform : this._testOnlyOptions.platform,
        executor: this.httpExecutor
      };
    }
    async doCheckForUpdates() {
      this.emit("checking-for-update");
      const v = await this.getUpdateInfoAndProvider(), S = v.info;
      if (!await this.isUpdateAvailable(S))
        return this._logger.info(`Update for version ${this.currentVersion.format()} is not available (latest version: ${S.version}, downgrade is ${this.allowDowngrade ? "allowed" : "disallowed"}).`), this.emit("update-not-available", S), {
          isUpdateAvailable: !1,
          versionInfo: S,
          updateInfo: S
        };
      this.updateInfoAndProvider = v, this.onUpdateAvailable(S);
      const O = new e.CancellationToken();
      return {
        isUpdateAvailable: !0,
        versionInfo: S,
        updateInfo: S,
        cancellationToken: O,
        downloadPromise: this.autoDownload ? this.downloadUpdate(O) : null
      };
    }
    onUpdateAvailable(v) {
      this._logger.info(`Found version ${v.version} (url: ${(0, e.asArray)(v.files).map((S) => S.url).join(", ")})`), this.emit("update-available", v);
    }
    /**
     * Start downloading update manually. You can use this method if `autoDownload` option is set to `false`.
     * @returns {Promise<Array<string>>} Paths to downloaded files.
     */
    downloadUpdate(v = new e.CancellationToken()) {
      const S = this.updateInfoAndProvider;
      if (S == null) {
        const T = new Error("Please check update first");
        return this.dispatchError(T), Promise.reject(T);
      }
      if (this.downloadPromise != null)
        return this._logger.info("Downloading update (already in progress)"), this.downloadPromise;
      this._logger.info(`Downloading update from ${(0, e.asArray)(S.info.files).map((T) => T.url).join(", ")}`);
      const O = (T) => {
        if (!(T instanceof e.CancellationError))
          try {
            this.dispatchError(T);
          } catch ($) {
            this._logger.warn(`Cannot dispatch error event: ${$.stack || $}`);
          }
        return T;
      };
      return this.downloadPromise = this.doDownloadUpdate({
        updateInfoAndProvider: S,
        requestHeaders: this.computeRequestHeaders(S.provider),
        cancellationToken: v,
        disableWebInstaller: this.disableWebInstaller,
        disableDifferentialDownload: this.disableDifferentialDownload
      }).catch((T) => {
        throw O(T);
      }).finally(() => {
        this.downloadPromise = null;
      }), this.downloadPromise;
    }
    dispatchError(v) {
      this.emit("error", v, (v.stack || v).toString());
    }
    dispatchUpdateDownloaded(v) {
      this.emit(_.UPDATE_DOWNLOADED, v);
    }
    async loadUpdateConfig() {
      return this._appUpdateConfigPath == null && (this._appUpdateConfigPath = this.app.appUpdateConfigPath), (0, n.load)(await (0, u.readFile)(this._appUpdateConfigPath, "utf-8"));
    }
    computeRequestHeaders(v) {
      const S = v.fileExtraDownloadHeaders;
      if (S != null) {
        const O = this.requestHeaders;
        return O == null ? S : {
          ...S,
          ...O
        };
      }
      return this.computeFinalHeaders({ accept: "*/*" });
    }
    async getOrCreateStagingUserId() {
      const v = d.join(this.app.userDataPath, ".updaterId");
      try {
        const O = await (0, u.readFile)(v, "utf-8");
        if (e.UUID.check(O))
          return O;
        this._logger.warn(`Staging user id file exists, but content was invalid: ${O}`);
      } catch (O) {
        O.code !== "ENOENT" && this._logger.warn(`Couldn't read staging user ID, creating a blank one: ${O}`);
      }
      const S = e.UUID.v5((0, t.randomBytes)(4096), e.UUID.OID);
      this._logger.info(`Generated new staging user ID: ${S}`);
      try {
        await (0, u.outputFile)(v, S);
      } catch (O) {
        this._logger.warn(`Couldn't write out staging user ID: ${O}`);
      }
      return S;
    }
    /** @internal */
    get isAddNoCacheQuery() {
      const v = this.requestHeaders;
      if (v == null)
        return !0;
      for (const S of Object.keys(v)) {
        const O = S.toLowerCase();
        if (O === "authorization" || O === "private-token")
          return !1;
      }
      return !0;
    }
    async getOrCreateDownloadHelper() {
      let v = this.downloadedUpdateHelper;
      if (v == null) {
        const S = (await this.configOnDisk.value).updaterCacheDirName, O = this._logger;
        S == null && O.error("updaterCacheDirName is not specified in app-update.yml Was app build using at least electron-builder 20.34.0?");
        const T = d.join(this.app.baseCachePath, S || this.app.name);
        O.debug != null && O.debug(`updater cache dir: ${T}`), v = new l.DownloadedUpdateHelper(T), this.downloadedUpdateHelper = v;
      }
      return v;
    }
    async executeDownload(v) {
      const S = v.fileInfo, O = {
        headers: v.downloadUpdateOptions.requestHeaders,
        cancellationToken: v.downloadUpdateOptions.cancellationToken,
        sha2: S.info.sha2,
        sha512: S.info.sha512
      };
      this.listenerCount(_.DOWNLOAD_PROGRESS) > 0 && (O.onProgress = (G) => this.emit(_.DOWNLOAD_PROGRESS, G));
      const T = v.downloadUpdateOptions.updateInfoAndProvider.info, $ = T.version, k = S.packageInfo;
      function U() {
        const G = decodeURIComponent(v.fileInfo.url.pathname);
        return G.endsWith(`.${v.fileExtension}`) ? d.basename(G) : v.fileInfo.info.url;
      }
      const V = await this.getOrCreateDownloadHelper(), L = V.cacheDirForPendingUpdate;
      await (0, u.mkdir)(L, { recursive: !0 });
      const B = U();
      let te = d.join(L, B);
      const j = k == null ? null : d.join(L, `package-${$}${d.extname(k.path) || ".7z"}`), H = async (G) => (await V.setDownloadedFile(te, j, T, S, B, G), await v.done({
        ...T,
        downloadedFile: te
      }), j == null ? [te] : [te, j]), Y = this._logger, F = await V.validateDownloadedPath(te, T, S, Y);
      if (F != null)
        return te = F, await H(!1);
      const x = async () => (await V.clear().catch(() => {
      }), await (0, u.unlink)(te).catch(() => {
      })), X = await (0, l.createTempUpdateFile)(`temp-${B}`, L, Y);
      try {
        await v.task(X, O, j, x), await (0, e.retry)(() => (0, u.rename)(X, te), 60, 500, 0, 0, (G) => G instanceof Error && /^EBUSY:/.test(G.message));
      } catch (G) {
        throw await x(), G instanceof e.CancellationError && (Y.info("cancelled"), this.emit("update-cancelled", T)), G;
      }
      return Y.info(`New version ${$} has been downloaded to ${te}`), await H(!0);
    }
    async differentialDownloadInstaller(v, S, O, T, $) {
      try {
        if (this._testOnlyOptions != null && !this._testOnlyOptions.isUseDifferentialDownload)
          return !0;
        const k = (0, E.blockmapFiles)(v.url, this.app.version, S.updateInfoAndProvider.info.version);
        this._logger.info(`Download block maps (old: "${k[0]}", new: ${k[1]})`);
        const U = async (B) => {
          const te = await this.httpExecutor.downloadToBuffer(B, {
            headers: S.requestHeaders,
            cancellationToken: S.cancellationToken
          });
          if (te == null || te.length === 0)
            throw new Error(`Blockmap "${B.href}" is empty`);
          try {
            return JSON.parse((0, y.gunzipSync)(te).toString());
          } catch (j) {
            throw new Error(`Cannot parse blockmap "${B.href}", error: ${j}`);
          }
        }, V = {
          newUrl: v.url,
          oldFile: d.join(this.downloadedUpdateHelper.cacheDir, $),
          logger: this._logger,
          newFile: O,
          isUseMultipleRangeRequest: T.isUseMultipleRangeRequest,
          requestHeaders: S.requestHeaders,
          cancellationToken: S.cancellationToken
        };
        this.listenerCount(_.DOWNLOAD_PROGRESS) > 0 && (V.onProgress = (B) => this.emit(_.DOWNLOAD_PROGRESS, B));
        const L = await Promise.all(k.map((B) => U(B)));
        return await new h.GenericDifferentialDownloader(v.info, this.httpExecutor, V).download(L[0], L[1]), !1;
      } catch (k) {
        if (this._logger.error(`Cannot download differentially, fallback to full download: ${k.stack || k}`), this._testOnlyOptions != null)
          throw k;
        return !0;
      }
    }
  };
  or.AppUpdater = g;
  function w(R) {
    const v = (0, a.prerelease)(R);
    return v != null && v.length > 0;
  }
  class b {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    info(v) {
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    warn(v) {
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    error(v) {
    }
  }
  return or.NoOpLogger = b, or;
}
var uh;
function kr() {
  if (uh) return Hr;
  uh = 1, Object.defineProperty(Hr, "__esModule", { value: !0 }), Hr.BaseUpdater = void 0;
  const e = Wi, t = su();
  let i = class extends t.AppUpdater {
    constructor(u, n) {
      super(u, n), this.quitAndInstallCalled = !1, this.quitHandlerAdded = !1;
    }
    quitAndInstall(u = !1, n = !1) {
      this._logger.info("Install on explicit quitAndInstall"), this.install(u, u ? n : this.autoRunAppAfterInstall) ? setImmediate(() => {
        zt.autoUpdater.emit("before-quit-for-update"), this.app.quit();
      }) : this.quitAndInstallCalled = !1;
    }
    executeDownload(u) {
      return super.executeDownload({
        ...u,
        done: (n) => (this.dispatchUpdateDownloaded(n), this.addQuitHandler(), Promise.resolve())
      });
    }
    get installerPath() {
      return this.downloadedUpdateHelper == null ? null : this.downloadedUpdateHelper.file;
    }
    // must be sync (because quit even handler is not async)
    install(u = !1, n = !1) {
      if (this.quitAndInstallCalled)
        return this._logger.warn("install call ignored: quitAndInstallCalled is set to true"), !1;
      const s = this.downloadedUpdateHelper, d = this.installerPath, a = s == null ? null : s.downloadedFileInfo;
      if (d == null || a == null)
        return this.dispatchError(new Error("No valid update available, can't quit and install")), !1;
      this.quitAndInstallCalled = !0;
      try {
        return this._logger.info(`Install: isSilent: ${u}, isForceRunAfter: ${n}`), this.doInstall({
          isSilent: u,
          isForceRunAfter: n,
          isAdminRightsRequired: a.isAdminRightsRequired
        });
      } catch (l) {
        return this.dispatchError(l), !1;
      }
    }
    addQuitHandler() {
      this.quitHandlerAdded || !this.autoInstallOnAppQuit || (this.quitHandlerAdded = !0, this.app.onQuit((u) => {
        if (this.quitAndInstallCalled) {
          this._logger.info("Update installer has already been triggered. Quitting application.");
          return;
        }
        if (!this.autoInstallOnAppQuit) {
          this._logger.info("Update will not be installed on quit because autoInstallOnAppQuit is set to false.");
          return;
        }
        if (u !== 0) {
          this._logger.info(`Update will be not installed on quit because application is quitting with exit code ${u}`);
          return;
        }
        this._logger.info("Auto install update on quit"), this.install(!0, !1);
      }));
    }
    wrapSudo() {
      const { name: u } = this.app, n = `"${u} would like to update"`, s = this.spawnSyncLog("which gksudo || which kdesudo || which pkexec || which beesu"), d = [s];
      return /kdesudo/i.test(s) ? (d.push("--comment", n), d.push("-c")) : /gksudo/i.test(s) ? d.push("--message", n) : /pkexec/i.test(s) && d.push("--disable-internal-agent"), d.join(" ");
    }
    spawnSyncLog(u, n = [], s = {}) {
      this._logger.info(`Executing: ${u} with args: ${n}`);
      const d = (0, e.spawnSync)(u, n, {
        env: { ...process.env, ...s },
        encoding: "utf-8",
        shell: !0
      }), { error: a, status: l, stdout: o, stderr: f } = d;
      if (a != null)
        throw this._logger.error(f), a;
      if (l != null && l !== 0)
        throw this._logger.error(f), new Error(`Command ${u} exited with code ${l}`);
      return o.trim();
    }
    /**
     * This handles both node 8 and node 10 way of emitting error when spawning a process
     *   - node 8: Throws the error
     *   - node 10: Emit the error(Need to listen with on)
     */
    // https://github.com/electron-userland/electron-builder/issues/1129
    // Node 8 sends errors: https://nodejs.org/dist/latest-v8.x/docs/api/errors.html#errors_common_system_errors
    async spawnLog(u, n = [], s = void 0, d = "ignore") {
      return this._logger.info(`Executing: ${u} with args: ${n}`), new Promise((a, l) => {
        try {
          const o = { stdio: d, env: s, detached: !0 }, f = (0, e.spawn)(u, n, o);
          f.on("error", (c) => {
            l(c);
          }), f.unref(), f.pid !== void 0 && a(!0);
        } catch (o) {
          l(o);
        }
      });
    }
  };
  return Hr.BaseUpdater = i, Hr;
}
var an = {}, sn = {}, lh;
function wp() {
  if (lh) return sn;
  lh = 1, Object.defineProperty(sn, "__esModule", { value: !0 }), sn.FileWithEmbeddedBlockMapDifferentialDownloader = void 0;
  const e = /* @__PURE__ */ Wt(), t = Ep(), i = Ah;
  let r = class extends t.DifferentialDownloader {
    async download() {
      const d = this.blockAwareFileInfo, a = d.size, l = a - (d.blockMapSize + 4);
      this.fileMetadataBuffer = await this.readRemoteBytes(l, a - 1);
      const o = u(this.fileMetadataBuffer.slice(0, this.fileMetadataBuffer.length - 4));
      await this.doDownload(await n(this.options.oldFile), o);
    }
  };
  sn.FileWithEmbeddedBlockMapDifferentialDownloader = r;
  function u(s) {
    return JSON.parse((0, i.inflateRawSync)(s).toString());
  }
  async function n(s) {
    const d = await (0, e.open)(s, "r");
    try {
      const a = (await (0, e.fstat)(d)).size, l = Buffer.allocUnsafe(4);
      await (0, e.read)(d, l, 0, l.length, a - l.length);
      const o = Buffer.allocUnsafe(l.readUInt32BE(0));
      return await (0, e.read)(d, o, 0, o.length, a - l.length - o.length), await (0, e.close)(d), u(o);
    } catch (a) {
      throw await (0, e.close)(d), a;
    }
  }
  return sn;
}
var ch;
function dh() {
  if (ch) return an;
  ch = 1, Object.defineProperty(an, "__esModule", { value: !0 }), an.AppImageUpdater = void 0;
  const e = Qe(), t = Wi, i = /* @__PURE__ */ Wt(), r = Tt, u = $e, n = kr(), s = wp(), d = mt(), a = pr();
  let l = class extends n.BaseUpdater {
    constructor(f, c) {
      super(f, c);
    }
    isUpdaterActive() {
      return process.env.APPIMAGE == null ? (process.env.SNAP == null ? this._logger.warn("APPIMAGE env is not defined, current application is not an AppImage") : this._logger.info("SNAP env is defined, updater is disabled"), !1) : super.isUpdaterActive();
    }
    /*** @private */
    doDownloadUpdate(f) {
      const c = f.updateInfoAndProvider.provider, p = (0, d.findFile)(c.resolveFiles(f.updateInfoAndProvider.info), "AppImage", ["rpm", "deb", "pacman"]);
      return this.executeDownload({
        fileExtension: "AppImage",
        fileInfo: p,
        downloadUpdateOptions: f,
        task: async (y, E) => {
          const h = process.env.APPIMAGE;
          if (h == null)
            throw (0, e.newError)("APPIMAGE env is not defined", "ERR_UPDATER_OLD_FILE_NOT_FOUND");
          (f.disableDifferentialDownload || await this.downloadDifferential(p, h, y, c, f)) && await this.httpExecutor.download(p.url, y, E), await (0, i.chmod)(y, 493);
        }
      });
    }
    async downloadDifferential(f, c, p, y, E) {
      try {
        const h = {
          newUrl: f.url,
          oldFile: c,
          logger: this._logger,
          newFile: p,
          isUseMultipleRangeRequest: y.isUseMultipleRangeRequest,
          requestHeaders: E.requestHeaders,
          cancellationToken: E.cancellationToken
        };
        return this.listenerCount(a.DOWNLOAD_PROGRESS) > 0 && (h.onProgress = (_) => this.emit(a.DOWNLOAD_PROGRESS, _)), await new s.FileWithEmbeddedBlockMapDifferentialDownloader(f.info, this.httpExecutor, h).download(), !1;
      } catch (h) {
        return this._logger.error(`Cannot download differentially, fallback to full download: ${h.stack || h}`), process.platform === "linux";
      }
    }
    doInstall(f) {
      const c = process.env.APPIMAGE;
      if (c == null)
        throw (0, e.newError)("APPIMAGE env is not defined", "ERR_UPDATER_OLD_FILE_NOT_FOUND");
      (0, r.unlinkSync)(c);
      let p;
      const y = u.basename(c), E = this.installerPath;
      if (E == null)
        return this.dispatchError(new Error("No valid update available, can't quit and install")), !1;
      u.basename(E) === y || !/\d+\.\d+\.\d+/.test(y) ? p = c : p = u.join(u.dirname(c), u.basename(E)), (0, t.execFileSync)("mv", ["-f", E, p]), p !== c && this.emit("appimage-filename-updated", p);
      const h = {
        ...process.env,
        APPIMAGE_SILENT_INSTALL: "true"
      };
      return f.isForceRunAfter ? this.spawnLog(p, [], h) : (h.APPIMAGE_EXIT_AFTER_INSTALL = "true", (0, t.execFileSync)(p, [], { env: h })), !0;
    }
  };
  return an.AppImageUpdater = l, an;
}
var on = {}, fh;
function hh() {
  if (fh) return on;
  fh = 1, Object.defineProperty(on, "__esModule", { value: !0 }), on.DebUpdater = void 0;
  const e = kr(), t = mt(), i = pr();
  let r = class extends e.BaseUpdater {
    constructor(n, s) {
      super(n, s);
    }
    /*** @private */
    doDownloadUpdate(n) {
      const s = n.updateInfoAndProvider.provider, d = (0, t.findFile)(s.resolveFiles(n.updateInfoAndProvider.info), "deb", ["AppImage", "rpm", "pacman"]);
      return this.executeDownload({
        fileExtension: "deb",
        fileInfo: d,
        downloadUpdateOptions: n,
        task: async (a, l) => {
          this.listenerCount(i.DOWNLOAD_PROGRESS) > 0 && (l.onProgress = (o) => this.emit(i.DOWNLOAD_PROGRESS, o)), await this.httpExecutor.download(d.url, a, l);
        }
      });
    }
    get installerPath() {
      var n, s;
      return (s = (n = super.installerPath) === null || n === void 0 ? void 0 : n.replace(/ /g, "\\ ")) !== null && s !== void 0 ? s : null;
    }
    doInstall(n) {
      const s = this.wrapSudo(), d = /pkexec/i.test(s) ? "" : '"', a = this.installerPath;
      if (a == null)
        return this.dispatchError(new Error("No valid update available, can't quit and install")), !1;
      const l = ["dpkg", "-i", a, "||", "apt-get", "install", "-f", "-y"];
      return this.spawnSyncLog(s, [`${d}/bin/bash`, "-c", `'${l.join(" ")}'${d}`]), n.isForceRunAfter && this.app.relaunch(), !0;
    }
  };
  return on.DebUpdater = r, on;
}
var un = {}, ph;
function mh() {
  if (ph) return un;
  ph = 1, Object.defineProperty(un, "__esModule", { value: !0 }), un.PacmanUpdater = void 0;
  const e = kr(), t = pr(), i = mt();
  let r = class extends e.BaseUpdater {
    constructor(n, s) {
      super(n, s);
    }
    /*** @private */
    doDownloadUpdate(n) {
      const s = n.updateInfoAndProvider.provider, d = (0, i.findFile)(s.resolveFiles(n.updateInfoAndProvider.info), "pacman", ["AppImage", "deb", "rpm"]);
      return this.executeDownload({
        fileExtension: "pacman",
        fileInfo: d,
        downloadUpdateOptions: n,
        task: async (a, l) => {
          this.listenerCount(t.DOWNLOAD_PROGRESS) > 0 && (l.onProgress = (o) => this.emit(t.DOWNLOAD_PROGRESS, o)), await this.httpExecutor.download(d.url, a, l);
        }
      });
    }
    get installerPath() {
      var n, s;
      return (s = (n = super.installerPath) === null || n === void 0 ? void 0 : n.replace(/ /g, "\\ ")) !== null && s !== void 0 ? s : null;
    }
    doInstall(n) {
      const s = this.wrapSudo(), d = /pkexec/i.test(s) ? "" : '"', a = this.installerPath;
      if (a == null)
        return this.dispatchError(new Error("No valid update available, can't quit and install")), !1;
      const l = ["pacman", "-U", "--noconfirm", a];
      return this.spawnSyncLog(s, [`${d}/bin/bash`, "-c", `'${l.join(" ")}'${d}`]), n.isForceRunAfter && this.app.relaunch(), !0;
    }
  };
  return un.PacmanUpdater = r, un;
}
var ln = {}, gh;
function yh() {
  if (gh) return ln;
  gh = 1, Object.defineProperty(ln, "__esModule", { value: !0 }), ln.RpmUpdater = void 0;
  const e = kr(), t = pr(), i = mt();
  let r = class extends e.BaseUpdater {
    constructor(n, s) {
      super(n, s);
    }
    /*** @private */
    doDownloadUpdate(n) {
      const s = n.updateInfoAndProvider.provider, d = (0, i.findFile)(s.resolveFiles(n.updateInfoAndProvider.info), "rpm", ["AppImage", "deb", "pacman"]);
      return this.executeDownload({
        fileExtension: "rpm",
        fileInfo: d,
        downloadUpdateOptions: n,
        task: async (a, l) => {
          this.listenerCount(t.DOWNLOAD_PROGRESS) > 0 && (l.onProgress = (o) => this.emit(t.DOWNLOAD_PROGRESS, o)), await this.httpExecutor.download(d.url, a, l);
        }
      });
    }
    get installerPath() {
      var n, s;
      return (s = (n = super.installerPath) === null || n === void 0 ? void 0 : n.replace(/ /g, "\\ ")) !== null && s !== void 0 ? s : null;
    }
    doInstall(n) {
      const s = this.wrapSudo(), d = /pkexec/i.test(s) ? "" : '"', a = this.spawnSyncLog("which zypper"), l = this.installerPath;
      if (l == null)
        return this.dispatchError(new Error("No valid update available, can't quit and install")), !1;
      let o;
      return a ? o = [a, "--no-refresh", "install", "--allow-unsigned-rpm", "-y", "-f", l] : o = [this.spawnSyncLog("which dnf || which yum"), "-y", "install", l], this.spawnSyncLog(s, [`${d}/bin/bash`, "-c", `'${o.join(" ")}'${d}`]), n.isForceRunAfter && this.app.relaunch(), !0;
    }
  };
  return ln.RpmUpdater = r, ln;
}
var cn = {}, _h;
function Eh() {
  if (_h) return cn;
  _h = 1, Object.defineProperty(cn, "__esModule", { value: !0 }), cn.MacUpdater = void 0;
  const e = Qe(), t = /* @__PURE__ */ Wt(), i = Tt, r = $e, u = Tm, n = su(), s = mt(), d = Wi, a = Nr;
  let l = class extends n.AppUpdater {
    constructor(f, c) {
      super(f, c), this.nativeUpdater = zt.autoUpdater, this.squirrelDownloadedUpdate = !1, this.nativeUpdater.on("error", (p) => {
        this._logger.warn(p), this.emit("error", p);
      }), this.nativeUpdater.on("update-downloaded", () => {
        this.squirrelDownloadedUpdate = !0, this.debug("nativeUpdater.update-downloaded");
      });
    }
    debug(f) {
      this._logger.debug != null && this._logger.debug(f);
    }
    closeServerIfExists() {
      this.server && (this.debug("Closing proxy server"), this.server.close((f) => {
        f && this.debug("proxy server wasn't already open, probably attempted closing again as a safety check before quit");
      }));
    }
    async doDownloadUpdate(f) {
      let c = f.updateInfoAndProvider.provider.resolveFiles(f.updateInfoAndProvider.info);
      const p = this._logger, y = "sysctl.proc_translated";
      let E = !1;
      try {
        this.debug("Checking for macOS Rosetta environment"), E = (0, d.execFileSync)("sysctl", [y], { encoding: "utf8" }).includes(`${y}: 1`), p.info(`Checked for macOS Rosetta environment (isRosetta=${E})`);
      } catch (R) {
        p.warn(`sysctl shell command to check for macOS Rosetta environment failed: ${R}`);
      }
      let h = !1;
      try {
        this.debug("Checking for arm64 in uname");
        const v = (0, d.execFileSync)("uname", ["-a"], { encoding: "utf8" }).includes("ARM");
        p.info(`Checked 'uname -a': arm64=${v}`), h = h || v;
      } catch (R) {
        p.warn(`uname shell command to check for arm64 failed: ${R}`);
      }
      h = h || process.arch === "arm64" || E;
      const _ = (R) => {
        var v;
        return R.url.pathname.includes("arm64") || ((v = R.info.url) === null || v === void 0 ? void 0 : v.includes("arm64"));
      };
      h && c.some(_) ? c = c.filter((R) => h === _(R)) : c = c.filter((R) => !_(R));
      const g = (0, s.findFile)(c, "zip", ["pkg", "dmg"]);
      if (g == null)
        throw (0, e.newError)(`ZIP file not provided: ${(0, e.safeStringifyJson)(c)}`, "ERR_UPDATER_ZIP_FILE_NOT_FOUND");
      const w = f.updateInfoAndProvider.provider, b = "update.zip";
      return this.executeDownload({
        fileExtension: "zip",
        fileInfo: g,
        downloadUpdateOptions: f,
        task: async (R, v) => {
          const S = r.join(this.downloadedUpdateHelper.cacheDir, b), O = () => (0, t.pathExistsSync)(S) ? !f.disableDifferentialDownload : (p.info("Unable to locate previous update.zip for differential download (is this first install?), falling back to full download"), !1);
          let T = !0;
          O() && (T = await this.differentialDownloadInstaller(g, f, R, w, b)), T && await this.httpExecutor.download(g.url, R, v);
        },
        done: async (R) => {
          if (!f.disableDifferentialDownload)
            try {
              const v = r.join(this.downloadedUpdateHelper.cacheDir, b);
              await (0, t.copyFile)(R.downloadedFile, v);
            } catch (v) {
              this._logger.warn(`Unable to copy file for caching for future differential downloads: ${v.message}`);
            }
          return this.updateDownloaded(g, R);
        }
      });
    }
    async updateDownloaded(f, c) {
      var p;
      const y = c.downloadedFile, E = (p = f.info.size) !== null && p !== void 0 ? p : (await (0, t.stat)(y)).size, h = this._logger, _ = `fileToProxy=${f.url.href}`;
      this.closeServerIfExists(), this.debug(`Creating proxy server for native Squirrel.Mac (${_})`), this.server = (0, u.createServer)(), this.debug(`Proxy server for native Squirrel.Mac is created (${_})`), this.server.on("close", () => {
        h.info(`Proxy server for native Squirrel.Mac is closed (${_})`);
      });
      const g = (w) => {
        const b = w.address();
        return typeof b == "string" ? b : `http://127.0.0.1:${b?.port}`;
      };
      return await new Promise((w, b) => {
        const R = (0, a.randomBytes)(64).toString("base64").replace(/\//g, "_").replace(/\+/g, "-"), v = Buffer.from(`autoupdater:${R}`, "ascii"), S = `/${(0, a.randomBytes)(64).toString("hex")}.zip`;
        this.server.on("request", (O, T) => {
          const $ = O.url;
          if (h.info(`${$} requested`), $ === "/") {
            if (!O.headers.authorization || O.headers.authorization.indexOf("Basic ") === -1) {
              T.statusCode = 401, T.statusMessage = "Invalid Authentication Credentials", T.end(), h.warn("No authenthication info");
              return;
            }
            const V = O.headers.authorization.split(" ")[1], L = Buffer.from(V, "base64").toString("ascii"), [B, te] = L.split(":");
            if (B !== "autoupdater" || te !== R) {
              T.statusCode = 401, T.statusMessage = "Invalid Authentication Credentials", T.end(), h.warn("Invalid authenthication credentials");
              return;
            }
            const j = Buffer.from(`{ "url": "${g(this.server)}${S}" }`);
            T.writeHead(200, { "Content-Type": "application/json", "Content-Length": j.length }), T.end(j);
            return;
          }
          if (!$.startsWith(S)) {
            h.warn(`${$} requested, but not supported`), T.writeHead(404), T.end();
            return;
          }
          h.info(`${S} requested by Squirrel.Mac, pipe ${y}`);
          let k = !1;
          T.on("finish", () => {
            k || (this.nativeUpdater.removeListener("error", b), w([]));
          });
          const U = (0, i.createReadStream)(y);
          U.on("error", (V) => {
            try {
              T.end();
            } catch (L) {
              h.warn(`cannot end response: ${L}`);
            }
            k = !0, this.nativeUpdater.removeListener("error", b), b(new Error(`Cannot pipe "${y}": ${V}`));
          }), T.writeHead(200, {
            "Content-Type": "application/zip",
            "Content-Length": E
          }), U.pipe(T);
        }), this.debug(`Proxy server for native Squirrel.Mac is starting to listen (${_})`), this.server.listen(0, "127.0.0.1", () => {
          this.debug(`Proxy server for native Squirrel.Mac is listening (address=${g(this.server)}, ${_})`), this.nativeUpdater.setFeedURL({
            url: g(this.server),
            headers: {
              "Cache-Control": "no-cache",
              Authorization: `Basic ${v.toString("base64")}`
            }
          }), this.dispatchUpdateDownloaded(c), this.autoInstallOnAppQuit ? (this.nativeUpdater.once("error", b), this.nativeUpdater.checkForUpdates()) : w([]);
        });
      });
    }
    handleUpdateDownloaded() {
      this.autoRunAppAfterInstall ? this.nativeUpdater.quitAndInstall() : this.app.quit(), this.closeServerIfExists();
    }
    quitAndInstall() {
      this.squirrelDownloadedUpdate ? this.handleUpdateDownloaded() : (this.nativeUpdater.on("update-downloaded", () => this.handleUpdateDownloaded()), this.autoInstallOnAppQuit || this.nativeUpdater.checkForUpdates());
    }
  };
  return cn.MacUpdater = l, cn;
}
var dn = {}, Hi = {}, vh;
function j_() {
  if (vh) return Hi;
  vh = 1, Object.defineProperty(Hi, "__esModule", { value: !0 }), Hi.verifySignature = u;
  const e = Qe(), t = Wi, i = _n, r = $e;
  function u(a, l, o) {
    return new Promise((f, c) => {
      const p = l.replace(/'/g, "''");
      o.info(`Verifying signature ${p}`), (0, t.execFile)('set "PSModulePath=" & chcp 65001 >NUL & powershell.exe', ["-NoProfile", "-NonInteractive", "-InputFormat", "None", "-Command", `"Get-AuthenticodeSignature -LiteralPath '${p}' | ConvertTo-Json -Compress"`], {
        shell: !0,
        timeout: 20 * 1e3
      }, (y, E, h) => {
        var _;
        try {
          if (y != null || h) {
            s(o, y, h, c), f(null);
            return;
          }
          const g = n(E);
          if (g.Status === 0) {
            try {
              const v = r.normalize(g.Path), S = r.normalize(l);
              if (o.info(`LiteralPath: ${v}. Update Path: ${S}`), v !== S) {
                s(o, new Error(`LiteralPath of ${v} is different than ${S}`), h, c), f(null);
                return;
              }
            } catch (v) {
              o.warn(`Unable to verify LiteralPath of update asset due to missing data.Path. Skipping this step of validation. Message: ${(_ = v.message) !== null && _ !== void 0 ? _ : v.stack}`);
            }
            const b = (0, e.parseDn)(g.SignerCertificate.Subject);
            let R = !1;
            for (const v of a) {
              const S = (0, e.parseDn)(v);
              if (S.size ? R = Array.from(S.keys()).every((T) => S.get(T) === b.get(T)) : v === b.get("CN") && (o.warn(`Signature validated using only CN ${v}. Please add your full Distinguished Name (DN) to publisherNames configuration`), R = !0), R) {
                f(null);
                return;
              }
            }
          }
          const w = `publisherNames: ${a.join(" | ")}, raw info: ` + JSON.stringify(g, (b, R) => b === "RawData" ? void 0 : R, 2);
          o.warn(`Sign verification failed, installer signed with incorrect certificate: ${w}`), f(w);
        } catch (g) {
          s(o, g, null, c), f(null);
          return;
        }
      });
    });
  }
  function n(a) {
    const l = JSON.parse(a);
    delete l.PrivateKey, delete l.IsOSBinary, delete l.SignatureType;
    const o = l.SignerCertificate;
    return o != null && (delete o.Archived, delete o.Extensions, delete o.Handle, delete o.HasPrivateKey, delete o.SubjectName), l;
  }
  function s(a, l, o, f) {
    if (d()) {
      a.warn(`Cannot execute Get-AuthenticodeSignature: ${l || o}. Ignoring signature validation due to unsupported powershell version. Please upgrade to powershell 3 or higher.`);
      return;
    }
    try {
      (0, t.execFileSync)("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", "ConvertTo-Json test"], { timeout: 10 * 1e3 });
    } catch (c) {
      a.warn(`Cannot execute ConvertTo-Json: ${c.message}. Ignoring signature validation due to unsupported powershell version. Please upgrade to powershell 3 or higher.`);
      return;
    }
    l != null && f(l), o && f(new Error(`Cannot execute Get-AuthenticodeSignature, stderr: ${o}. Failing signature validation due to unknown stderr.`));
  }
  function d() {
    const a = i.release();
    return a.startsWith("6.") && !a.startsWith("6.3");
  }
  return Hi;
}
var wh;
function Sh() {
  if (wh) return dn;
  wh = 1, Object.defineProperty(dn, "__esModule", { value: !0 }), dn.NsisUpdater = void 0;
  const e = Qe(), t = $e, i = kr(), r = wp(), u = pr(), n = mt(), s = /* @__PURE__ */ Wt(), d = j_(), a = Pr;
  let l = class extends i.BaseUpdater {
    constructor(f, c) {
      super(f, c), this._verifyUpdateCodeSignature = (p, y) => (0, d.verifySignature)(p, y, this._logger);
    }
    /**
     * The verifyUpdateCodeSignature. You can pass [win-verify-signature](https://github.com/beyondkmp/win-verify-trust) or another custom verify function: ` (publisherName: string[], path: string) => Promise<string | null>`.
     * The default verify function uses [windowsExecutableCodeSignatureVerifier](https://github.com/electron-userland/electron-builder/blob/master/packages/electron-updater/src/windowsExecutableCodeSignatureVerifier.ts)
     */
    get verifyUpdateCodeSignature() {
      return this._verifyUpdateCodeSignature;
    }
    set verifyUpdateCodeSignature(f) {
      f && (this._verifyUpdateCodeSignature = f);
    }
    /*** @private */
    doDownloadUpdate(f) {
      const c = f.updateInfoAndProvider.provider, p = (0, n.findFile)(c.resolveFiles(f.updateInfoAndProvider.info), "exe");
      return this.executeDownload({
        fileExtension: "exe",
        downloadUpdateOptions: f,
        fileInfo: p,
        task: async (y, E, h, _) => {
          const g = p.packageInfo, w = g != null && h != null;
          if (w && f.disableWebInstaller)
            throw (0, e.newError)(`Unable to download new version ${f.updateInfoAndProvider.info.version}. Web Installers are disabled`, "ERR_UPDATER_WEB_INSTALLER_DISABLED");
          !w && !f.disableWebInstaller && this._logger.warn("disableWebInstaller is set to false, you should set it to true if you do not plan on using a web installer. This will default to true in a future version."), (w || f.disableDifferentialDownload || await this.differentialDownloadInstaller(p, f, y, c, e.CURRENT_APP_INSTALLER_FILE_NAME)) && await this.httpExecutor.download(p.url, y, E);
          const b = await this.verifySignature(y);
          if (b != null)
            throw await _(), (0, e.newError)(`New version ${f.updateInfoAndProvider.info.version} is not signed by the application owner: ${b}`, "ERR_UPDATER_INVALID_SIGNATURE");
          if (w && await this.differentialDownloadWebPackage(f, g, h, c))
            try {
              await this.httpExecutor.download(new a.URL(g.path), h, {
                headers: f.requestHeaders,
                cancellationToken: f.cancellationToken,
                sha512: g.sha512
              });
            } catch (R) {
              try {
                await (0, s.unlink)(h);
              } catch {
              }
              throw R;
            }
        }
      });
    }
    // $certificateInfo = (Get-AuthenticodeSignature 'xxx\yyy.exe'
    // | where {$_.Status.Equals([System.Management.Automation.SignatureStatus]::Valid) -and $_.SignerCertificate.Subject.Contains("CN=siemens.com")})
    // | Out-String ; if ($certificateInfo) { exit 0 } else { exit 1 }
    async verifySignature(f) {
      let c;
      try {
        if (c = (await this.configOnDisk.value).publisherName, c == null)
          return null;
      } catch (p) {
        if (p.code === "ENOENT")
          return null;
        throw p;
      }
      return await this._verifyUpdateCodeSignature(Array.isArray(c) ? c : [c], f);
    }
    doInstall(f) {
      const c = this.installerPath;
      if (c == null)
        return this.dispatchError(new Error("No valid update available, can't quit and install")), !1;
      const p = ["--updated"];
      f.isSilent && p.push("/S"), f.isForceRunAfter && p.push("--force-run"), this.installDirectory && p.push(`/D=${this.installDirectory}`);
      const y = this.downloadedUpdateHelper == null ? null : this.downloadedUpdateHelper.packageFile;
      y != null && p.push(`--package-file=${y}`);
      const E = () => {
        this.spawnLog(t.join(process.resourcesPath, "elevate.exe"), [c].concat(p)).catch((h) => this.dispatchError(h));
      };
      return f.isAdminRightsRequired ? (this._logger.info("isAdminRightsRequired is set to true, run installer using elevate.exe"), E(), !0) : (this.spawnLog(c, p).catch((h) => {
        const _ = h.code;
        this._logger.info(`Cannot run installer: error code: ${_}, error message: "${h.message}", will be executed again using elevate if EACCES, and will try to use electron.shell.openItem if ENOENT`), _ === "UNKNOWN" || _ === "EACCES" ? E() : _ === "ENOENT" ? zt.shell.openPath(c).catch((g) => this.dispatchError(g)) : this.dispatchError(h);
      }), !0);
    }
    async differentialDownloadWebPackage(f, c, p, y) {
      if (c.blockMapSize == null)
        return !0;
      try {
        const E = {
          newUrl: new a.URL(c.path),
          oldFile: t.join(this.downloadedUpdateHelper.cacheDir, e.CURRENT_APP_PACKAGE_FILE_NAME),
          logger: this._logger,
          newFile: p,
          requestHeaders: this.requestHeaders,
          isUseMultipleRangeRequest: y.isUseMultipleRangeRequest,
          cancellationToken: f.cancellationToken
        };
        this.listenerCount(u.DOWNLOAD_PROGRESS) > 0 && (E.onProgress = (h) => this.emit(u.DOWNLOAD_PROGRESS, h)), await new r.FileWithEmbeddedBlockMapDifferentialDownloader(c, this.httpExecutor, E).download();
      } catch (E) {
        return this._logger.error(`Cannot download differentially, fallback to full download: ${E.stack || E}`), process.platform === "win32";
      }
      return !1;
    }
  };
  return dn.NsisUpdater = l, dn;
}
var Th;
function B_() {
  return Th || (Th = 1, (function(e) {
    var t = sr && sr.__createBinding || (Object.create ? (function(h, _, g, w) {
      w === void 0 && (w = g);
      var b = Object.getOwnPropertyDescriptor(_, g);
      (!b || ("get" in b ? !_.__esModule : b.writable || b.configurable)) && (b = { enumerable: !0, get: function() {
        return _[g];
      } }), Object.defineProperty(h, w, b);
    }) : (function(h, _, g, w) {
      w === void 0 && (w = g), h[w] = _[g];
    })), i = sr && sr.__exportStar || function(h, _) {
      for (var g in h) g !== "default" && !Object.prototype.hasOwnProperty.call(_, g) && t(_, h, g);
    };
    Object.defineProperty(e, "__esModule", { value: !0 }), e.NsisUpdater = e.MacUpdater = e.RpmUpdater = e.PacmanUpdater = e.DebUpdater = e.AppImageUpdater = e.Provider = e.NoOpLogger = e.AppUpdater = e.BaseUpdater = void 0;
    const r = /* @__PURE__ */ Wt(), u = $e;
    var n = kr();
    Object.defineProperty(e, "BaseUpdater", { enumerable: !0, get: function() {
      return n.BaseUpdater;
    } });
    var s = su();
    Object.defineProperty(e, "AppUpdater", { enumerable: !0, get: function() {
      return s.AppUpdater;
    } }), Object.defineProperty(e, "NoOpLogger", { enumerable: !0, get: function() {
      return s.NoOpLogger;
    } });
    var d = mt();
    Object.defineProperty(e, "Provider", { enumerable: !0, get: function() {
      return d.Provider;
    } });
    var a = dh();
    Object.defineProperty(e, "AppImageUpdater", { enumerable: !0, get: function() {
      return a.AppImageUpdater;
    } });
    var l = hh();
    Object.defineProperty(e, "DebUpdater", { enumerable: !0, get: function() {
      return l.DebUpdater;
    } });
    var o = mh();
    Object.defineProperty(e, "PacmanUpdater", { enumerable: !0, get: function() {
      return o.PacmanUpdater;
    } });
    var f = yh();
    Object.defineProperty(e, "RpmUpdater", { enumerable: !0, get: function() {
      return f.RpmUpdater;
    } });
    var c = Eh();
    Object.defineProperty(e, "MacUpdater", { enumerable: !0, get: function() {
      return c.MacUpdater;
    } });
    var p = Sh();
    Object.defineProperty(e, "NsisUpdater", { enumerable: !0, get: function() {
      return p.NsisUpdater;
    } }), i(pr(), e);
    let y;
    function E() {
      if (process.platform === "win32")
        y = new (Sh()).NsisUpdater();
      else if (process.platform === "darwin")
        y = new (Eh()).MacUpdater();
      else {
        y = new (dh()).AppImageUpdater();
        try {
          const h = u.join(process.resourcesPath, "package-type");
          if (!(0, r.existsSync)(h))
            return y;
          console.info("Checking for beta autoupdate feature for deb/rpm distributions");
          const _ = (0, r.readFileSync)(h).toString().trim();
          switch (console.info("Found package-type:", _), _) {
            case "deb":
              y = new (hh()).DebUpdater();
              break;
            case "rpm":
              y = new (yh()).RpmUpdater();
              break;
            case "pacman":
              y = new (mh()).PacmanUpdater();
              break;
            default:
              break;
          }
        } catch (h) {
          console.warn("Unable to detect 'package-type' for autoUpdater (beta rpm/deb support). If you'd like to expand support, please consider contributing to electron-builder", h.message);
        }
      }
      return y;
    }
    Object.defineProperty(e, "autoUpdater", {
      enumerable: !0,
      get: () => y || E()
    });
  })(sr)), sr;
}
var at = B_();
let Vt = null, Ar = { status: "idle" };
function Lt(e) {
  Ar = { ...Ar, ...e }, H_();
}
function H_() {
  Vt && !Vt.isDestroyed() && Vt.webContents.send("auto-update:state", Ar);
}
function G_(e) {
  Vt = e, at.autoUpdater.autoDownload = !1, at.autoUpdater.autoInstallOnAppQuit = !0, at.autoUpdater.autoRunAppAfterInstall = !0, at.autoUpdater.allowPrerelease = !1, at.autoUpdater.logger = {
    info: (t) => console.log("[AutoUpdater]", t),
    warn: (t) => console.warn("[AutoUpdater]", t),
    error: (t) => console.error("[AutoUpdater]", t),
    debug: (t) => console.log("[AutoUpdater DEBUG]", t)
  }, at.autoUpdater.on("checking-for-update", () => {
    console.log("[AutoUpdater] Checking for updates..."), Lt({ status: "checking" });
  }), at.autoUpdater.on("update-available", (t) => {
    console.log("[AutoUpdater] Update available:", t.version), Lt({
      status: "available",
      version: t.version,
      releaseNotes: typeof t.releaseNotes == "string" ? t.releaseNotes : Array.isArray(t.releaseNotes) ? t.releaseNotes.map((i) => i.note).join(`
`) : void 0
    });
  }), at.autoUpdater.on("update-not-available", (t) => {
    console.log("[AutoUpdater] No updates available. Current:", t.version), Lt({
      status: "not-available",
      version: t.version
    });
  }), at.autoUpdater.on("download-progress", (t) => {
    console.log(`[AutoUpdater] Download progress: ${t.percent.toFixed(1)}%`), Lt({
      status: "downloading",
      progress: t.percent,
      bytesPerSecond: t.bytesPerSecond,
      downloadedBytes: t.transferred,
      totalBytes: t.total
    });
  }), at.autoUpdater.on("update-downloaded", (t) => {
    console.log("[AutoUpdater] Update downloaded:", t.version), Lt({
      status: "downloaded",
      version: t.version,
      releaseNotes: typeof t.releaseNotes == "string" ? t.releaseNotes : Array.isArray(t.releaseNotes) ? t.releaseNotes.map((i) => i.note).join(`
`) : void 0
    }), z_(t.version);
  }), at.autoUpdater.on("error", (t) => {
    console.error("[AutoUpdater] Error:", t.message), Lt({
      status: "error",
      error: t.message
    });
  }), Y_(), Ne.isPackaged && (setTimeout(() => {
    ko(!1);
  }, 1e4), setInterval(() => {
    ko(!1);
  }, 14400 * 1e3)), console.log("[AutoUpdater] Initialized");
}
async function ko(e = !0) {
  try {
    return Ne.isPackaged ? await at.autoUpdater.checkForUpdates() : (console.log("[AutoUpdater] Skipping update check in development mode"), e || Lt({
      status: "not-available",
      version: Ne.getVersion()
    }), null);
  } catch (t) {
    const i = t instanceof Error ? t.message : "Unknown error";
    return console.error("[AutoUpdater] Check failed:", i), e || Lt({
      status: "error",
      error: i
    }), null;
  }
}
async function V_() {
  try {
    await at.autoUpdater.downloadUpdate();
  } catch (e) {
    const t = e instanceof Error ? e.message : "Download failed";
    console.error("[AutoUpdater] Download failed:", t), Lt({
      status: "error",
      error: t
    });
  }
}
function Sp() {
  console.log("[AutoUpdater] Installing update and restarting..."), at.autoUpdater.quitAndInstall(!1, !0);
}
async function z_(e) {
  if (!Vt || Vt.isDestroyed()) return;
  const { response: t } = await Em.showMessageBox(Vt, {
    type: "info",
    title: "Actualización Lista",
    message: `Una nueva versión (${e}) está lista para instalar.`,
    detail: "La aplicación se reiniciará para aplicar la actualización.",
    buttons: ["Reiniciar Ahora", "Más Tarde"],
    defaultId: 0,
    cancelId: 1
  });
  t === 0 && Sp();
}
function Y_() {
  de.handle("auto-update:check", async (e, t) => (await ko(t ?? !0), Ar)), de.handle("auto-update:download", async () => (await V_(), Ar)), de.handle("auto-update:install", () => {
    Sp();
  }), de.handle("auto-update:getState", () => Ar), de.handle("auto-update:getVersion", () => Ne.getVersion());
}
function X_() {
  de.removeHandler("auto-update:check"), de.removeHandler("auto-update:download"), de.removeHandler("auto-update:install"), de.removeHandler("auto-update:getState"), de.removeHandler("auto-update:getVersion"), Vt = null;
}
const Yt = new Ko({
  name: "auto-launch-settings",
  defaults: {
    autoLaunch: {
      enabled: !1,
      minimized: !0
      // Start minimized by default
    }
  }
});
function ou() {
  return Yt.get("autoLaunch.enabled", !1);
}
function W_() {
  return Yt.get("autoLaunch.minimized", !0);
}
function K_() {
  return Yt.get("autoLaunch");
}
function uu(e = !0) {
  try {
    const t = lu();
    return Ne.setLoginItemSettings({
      openAtLogin: !0,
      openAsHidden: e,
      // Windows specific
      args: e ? ["--hidden"] : [],
      // macOS/Linux path
      path: process.execPath
    }), Yt.set("autoLaunch", {
      enabled: !0,
      minimized: e
    }), console.log("[AutoLaunch] Enabled:", { minimized: e }), !0;
  } catch (t) {
    return console.error("[AutoLaunch] Failed to enable:", t), !1;
  }
}
function Tp() {
  try {
    return Ne.setLoginItemSettings({
      openAtLogin: !1,
      openAsHidden: !1
    }), Yt.set("autoLaunch.enabled", !1), console.log("[AutoLaunch] Disabled"), !0;
  } catch (e) {
    return console.error("[AutoLaunch] Failed to disable:", e), !1;
  }
}
function J_() {
  const e = ou();
  return e ? Tp() : uu(W_()), !e;
}
function Q_(e) {
  Yt.set("autoLaunch.minimized", e), ou() && uu(e);
}
function lu() {
  return Ne.getLoginItemSettings();
}
function cu() {
  const e = process.argv.includes("--hidden"), i = lu().wasOpenedAsHidden ?? !1;
  return e || i;
}
function Z_() {
  const e = lu(), t = Yt.get("autoLaunch.enabled", !1);
  e.openAtLogin !== t && Yt.set("autoLaunch.enabled", e.openAtLogin), eE(), console.log("[AutoLaunch] Initialized:", {
    enabled: e.openAtLogin,
    wasOpenedAtLogin: cu()
  });
}
function eE() {
  de.handle("auto-launch:isEnabled", () => ou()), de.handle("auto-launch:getSettings", () => K_()), de.handle("auto-launch:enable", (e, t) => uu(t ?? !0)), de.handle("auto-launch:disable", () => Tp()), de.handle("auto-launch:toggle", () => J_()), de.handle("auto-launch:setStartMinimized", (e, t) => (Q_(t), !0)), de.handle("auto-launch:wasStartedAtLogin", () => cu());
}
function tE() {
  de.removeHandler("auto-launch:isEnabled"), de.removeHandler("auto-launch:getSettings"), de.removeHandler("auto-launch:enable"), de.removeHandler("auto-launch:disable"), de.removeHandler("auto-launch:toggle"), de.removeHandler("auto-launch:setStartMinimized"), de.removeHandler("auto-launch:wasStartedAtLogin");
}
const bp = Ne;
process.env.DIST = st.join(__dirname, "../dist");
process.env.VITE_PUBLIC = Ne.isPackaged ? process.env.DIST : st.join(process.env.DIST, "../public");
let Ye = null;
const Co = process.env.VITE_DEV_SERVER_URL;
function rE() {
  return Ne.isPackaged ? st.join(process.resourcesPath, "build", "icon.png") : st.join(process.env.VITE_PUBLIC, "icon.png");
}
function Rp() {
  const e = b0(), t = cu();
  if (Ye = new Lo({
    icon: rE(),
    width: e.width,
    height: e.height,
    x: e.x,
    y: e.y,
    minWidth: 800,
    minHeight: 600,
    show: !1,
    // Don't show until ready
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    webPreferences: {
      preload: st.join(__dirname, "preload.js"),
      nodeIntegration: !1,
      contextIsolation: !0
    }
  }), R0(Ye), e.isMaximized && Ye.maximize(), S0(Ye), Im(Ye), Om(Ye), N0(Ye), L0(), x0(Ye), G_(Ye), Z_(), Ph(Ye), Ye.on("close", (i) => {
    ld().get("settings.minimizeToTray", !0) && !bp.isQuitting && (i.preventDefault(), Ye?.hide());
  }), Ye.webContents.on("did-finish-load", () => {
    Ye?.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString()), qo(Ye, {
      timerActive: !1,
      isPaused: !1,
      timeRemaining: "25:00",
      currentTask: null,
      mode: "IDLE"
    });
  }), Co)
    console.log("Loading URL:", Co), Ye.loadURL(Co);
  else {
    const i = st.join(process.env.DIST, "index.html");
    console.log("Loading file:", i), Ye.loadFile(i);
  }
  Ye.once("ready-to-show", () => {
    !ld().get("settings.startMinimized", !1) && !t && Ye?.show(), q0();
  }), Ne.isPackaged || Ye.webContents.openDevTools();
}
Ne.on("before-quit", () => {
  bp.isQuitting = !0;
});
Ne.whenReady().then(Rp);
Ne.on("will-quit", () => {
  xo(), Nm(), I0(), F0(), T0(), X_(), tE(), M0();
});
Ne.on("window-all-closed", () => {
  process.platform !== "darwin" && Ne.quit();
});
Ne.on("activate", () => {
  Lo.getAllWindows().length === 0 ? Rp() : Ye?.show();
});
