import Wt, { nativeImage as Nl, Tray as $l, app as Ne, Menu as Cu, globalShortcut as Qi, shell as wa, Notification as Il, ipcMain as fe, screen as wm, BrowserWindow as Fu, dialog as wy } from "electron";
import * as ot from "path";
import De from "path";
import wn from "util";
import * as Pl from "fs";
import Rt from "fs";
import Pr from "crypto";
import Uu from "assert";
import qu from "events";
import Sn from "os";
import Sy from "better-sqlite3";
import Ty from "constants";
import Tn from "stream";
import ta from "child_process";
import Sm from "tty";
import Cr from "url";
import Ry from "string_decoder";
import Tm from "zlib";
import by from "http";
let St = null;
const Rm = {
  timerActive: !1,
  isPaused: !1,
  timeRemaining: "25:00",
  currentTask: null,
  mode: "IDLE"
};
let bm = { ...Rm };
function Ay() {
  const e = process.platform === "win32" ? "icon.ico" : "icon.png";
  return Ne.isPackaged ? ot.join(process.resourcesPath, "build", e) : ot.join(__dirname, "..", "build", e);
}
function Oy(e) {
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
function Ny(e) {
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
function $y(e) {
  const t = Ay();
  try {
    const i = Nl.createFromPath(t);
    St = new $l(i.resize({ width: 16, height: 16 }));
  } catch {
    console.warn("Tray icon not found, using default"), St = new $l(Nl.createEmpty());
  }
  return St.setToolTip("Ordo-Todo"), xu(e, Rm), St.on("click", () => {
    e.isVisible() ? e.hide() : (e.show(), e.focus());
  }), St;
}
function xu(e, t) {
  if (!St) return;
  bm = t;
  const i = Oy(t.mode), r = Ny(t.mode), u = t.timerActive ? `Ordo-Todo - ${r} ${t.timeRemaining}` : "Ordo-Todo";
  St.setToolTip(u);
  const s = Cu.buildFromTemplate([
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
  St.setContextMenu(s);
}
function Cl(e, t) {
  const i = { ...bm, ...t };
  xu(e, i);
}
function Iy() {
  St && (St.destroy(), St = null);
}
const Ar = [
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
], Or = /* @__PURE__ */ new Map();
function Am(e, t = Ar) {
  Mu(), t.forEach((i) => {
    if (i.enabled)
      try {
        Qi.register(i.accelerator, () => {
          Om(e, i.action);
        }) ? (Or.set(i.id, i), console.log(`Shortcut registered: ${i.accelerator} -> ${i.action}`)) : console.warn(`Failed to register shortcut: ${i.accelerator}`);
      } catch (r) {
        console.error(`Error registering shortcut ${i.accelerator}:`, r);
      }
  });
}
function Om(e, t) {
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
function Mu() {
  Qi.unregisterAll(), Or.clear(), console.log("All global shortcuts unregistered");
}
function Py() {
  return Array.from(Or.values());
}
function Cy(e, t, i) {
  const r = Or.get(t);
  if (!r) return !1;
  Qi.unregister(r.accelerator);
  const u = { ...r, ...i };
  return u.enabled && Qi.register(u.accelerator, () => {
    Om(e, u.action);
  }) ? (Or.set(t, u), !0) : (Or.delete(t), !1);
}
function Dy(e) {
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
            await wa.openExternal("https://ordo-todo.com/docs");
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
            await wa.openExternal("https://github.com/tiagofur/ordo-todo/issues/new");
          }
        },
        {
          label: "Solicitar Función",
          click: async () => {
            await wa.openExternal("https://github.com/tiagofur/ordo-todo/discussions/new?category=ideas");
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
  ], r = Cu.buildFromTemplate(i);
  return Cu.setApplicationMenu(r), r;
}
var Tt = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function Ly(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var gn = { exports: {} }, Sa, Dl;
function ky() {
  return Dl || (Dl = 1, Sa = (e) => {
    const t = typeof e;
    return e !== null && (t === "object" || t === "function");
  }), Sa;
}
var Ta, Ll;
function Fy() {
  if (Ll) return Ta;
  Ll = 1;
  const e = ky(), t = /* @__PURE__ */ new Set([
    "__proto__",
    "prototype",
    "constructor"
  ]), i = (u) => !u.some((s) => t.has(s));
  function r(u) {
    const s = u.split("."), o = [];
    for (let d = 0; d < s.length; d++) {
      let a = s[d];
      for (; a[a.length - 1] === "\\" && s[d + 1] !== void 0; )
        a = a.slice(0, -1) + ".", a += s[++d];
      o.push(a);
    }
    return i(o) ? o : [];
  }
  return Ta = {
    get(u, s, o) {
      if (!e(u) || typeof s != "string")
        return o === void 0 ? u : o;
      const d = r(s);
      if (d.length !== 0) {
        for (let a = 0; a < d.length; a++)
          if (u = u[d[a]], u == null) {
            if (a !== d.length - 1)
              return o;
            break;
          }
        return u === void 0 ? o : u;
      }
    },
    set(u, s, o) {
      if (!e(u) || typeof s != "string")
        return u;
      const d = u, a = r(s);
      for (let l = 0; l < a.length; l++) {
        const n = a[l];
        e(u[n]) || (u[n] = {}), l === a.length - 1 && (u[n] = o), u = u[n];
      }
      return d;
    },
    delete(u, s) {
      if (!e(u) || typeof s != "string")
        return !1;
      const o = r(s);
      for (let d = 0; d < o.length; d++) {
        const a = o[d];
        if (d === o.length - 1)
          return delete u[a], !0;
        if (u = u[a], !e(u))
          return !1;
      }
    },
    has(u, s) {
      if (!e(u) || typeof s != "string")
        return !1;
      const o = r(s);
      if (o.length === 0)
        return !1;
      for (let d = 0; d < o.length; d++)
        if (e(u)) {
          if (!(o[d] in u))
            return !1;
          u = u[o[d]];
        } else
          return !1;
      return !0;
    }
  }, Ta;
}
var kn = { exports: {} }, Fn = { exports: {} }, Un = { exports: {} }, qn = { exports: {} }, kl;
function Uy() {
  if (kl) return qn.exports;
  kl = 1;
  const e = Rt;
  return qn.exports = (t) => new Promise((i) => {
    e.access(t, (r) => {
      i(!r);
    });
  }), qn.exports.sync = (t) => {
    try {
      return e.accessSync(t), !0;
    } catch {
      return !1;
    }
  }, qn.exports;
}
var xn = { exports: {} }, Mn = { exports: {} }, Fl;
function qy() {
  if (Fl) return Mn.exports;
  Fl = 1;
  const e = (t, ...i) => new Promise((r) => {
    r(t(...i));
  });
  return Mn.exports = e, Mn.exports.default = e, Mn.exports;
}
var Ul;
function xy() {
  if (Ul) return xn.exports;
  Ul = 1;
  const e = qy(), t = (i) => {
    if (!((Number.isInteger(i) || i === 1 / 0) && i > 0))
      return Promise.reject(new TypeError("Expected `concurrency` to be a number from 1 and up"));
    const r = [];
    let u = 0;
    const s = () => {
      u--, r.length > 0 && r.shift()();
    }, o = (l, n, ...f) => {
      u++;
      const c = e(l, ...f);
      n(c), c.then(s, s);
    }, d = (l, n, ...f) => {
      u < i ? o(l, n, ...f) : r.push(o.bind(null, l, n, ...f));
    }, a = (l, ...n) => new Promise((f) => d(l, f, ...n));
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
  return xn.exports = t, xn.exports.default = t, xn.exports;
}
var Ra, ql;
function My() {
  if (ql) return Ra;
  ql = 1;
  const e = xy();
  class t extends Error {
    constructor(s) {
      super(), this.value = s;
    }
  }
  const i = (u, s) => Promise.resolve(u).then(s), r = (u) => Promise.all(u).then((s) => s[1] === !0 && Promise.reject(new t(s[0])));
  return Ra = (u, s, o) => {
    o = Object.assign({
      concurrency: 1 / 0,
      preserveOrder: !0
    }, o);
    const d = e(o.concurrency), a = [...u].map((n) => [n, d(i, n, s)]), l = e(o.preserveOrder ? 1 : 1 / 0);
    return Promise.all(a.map((n) => l(r, n))).then(() => {
    }).catch((n) => n instanceof t ? n.value : Promise.reject(n));
  }, Ra;
}
var xl;
function jy() {
  if (xl) return Un.exports;
  xl = 1;
  const e = De, t = Uy(), i = My();
  return Un.exports = (r, u) => (u = Object.assign({
    cwd: process.cwd()
  }, u), i(r, (s) => t(e.resolve(u.cwd, s)), u)), Un.exports.sync = (r, u) => {
    u = Object.assign({
      cwd: process.cwd()
    }, u);
    for (const s of r)
      if (t.sync(e.resolve(u.cwd, s)))
        return s;
  }, Un.exports;
}
var Ml;
function Gy() {
  if (Ml) return Fn.exports;
  Ml = 1;
  const e = De, t = jy();
  return Fn.exports = (i, r = {}) => {
    const u = e.resolve(r.cwd || ""), { root: s } = e.parse(u), o = [].concat(i);
    return new Promise((d) => {
      (function a(l) {
        t(o, { cwd: l }).then((n) => {
          n ? d(e.join(l, n)) : l === s ? d(null) : a(e.dirname(l));
        });
      })(u);
    });
  }, Fn.exports.sync = (i, r = {}) => {
    let u = e.resolve(r.cwd || "");
    const { root: s } = e.parse(u), o = [].concat(i);
    for (; ; ) {
      const d = t.sync(o, { cwd: u });
      if (d)
        return e.join(u, d);
      if (u === s)
        return null;
      u = e.dirname(u);
    }
  }, Fn.exports;
}
var jl;
function Hy() {
  if (jl) return kn.exports;
  jl = 1;
  const e = Gy();
  return kn.exports = async ({ cwd: t } = {}) => e("package.json", { cwd: t }), kn.exports.sync = ({ cwd: t } = {}) => e.sync("package.json", { cwd: t }), kn.exports;
}
var jn = { exports: {} }, Gl;
function By() {
  if (Gl) return jn.exports;
  Gl = 1;
  const e = De, t = Sn, i = t.homedir(), r = t.tmpdir(), { env: u } = process, s = (l) => {
    const n = e.join(i, "Library");
    return {
      data: e.join(n, "Application Support", l),
      config: e.join(n, "Preferences", l),
      cache: e.join(n, "Caches", l),
      log: e.join(n, "Logs", l),
      temp: e.join(r, l)
    };
  }, o = (l) => {
    const n = u.APPDATA || e.join(i, "AppData", "Roaming"), f = u.LOCALAPPDATA || e.join(i, "AppData", "Local");
    return {
      // Data/config/cache/log are invented by me as Windows isn't opinionated about this
      data: e.join(f, l, "Data"),
      config: e.join(n, l, "Config"),
      cache: e.join(f, l, "Cache"),
      log: e.join(f, l, "Log"),
      temp: e.join(r, l)
    };
  }, d = (l) => {
    const n = e.basename(i);
    return {
      data: e.join(u.XDG_DATA_HOME || e.join(i, ".local", "share"), l),
      config: e.join(u.XDG_CONFIG_HOME || e.join(i, ".config"), l),
      cache: e.join(u.XDG_CACHE_HOME || e.join(i, ".cache"), l),
      // https://wiki.debian.org/XDGBaseDirectorySpecification#state
      log: e.join(u.XDG_STATE_HOME || e.join(i, ".local", "state"), l),
      temp: e.join(r, n, l)
    };
  }, a = (l, n) => {
    if (typeof l != "string")
      throw new TypeError(`Expected string, got ${typeof l}`);
    return n = Object.assign({ suffix: "nodejs" }, n), n.suffix && (l += `-${n.suffix}`), process.platform === "darwin" ? s(l) : process.platform === "win32" ? o(l) : d(l);
  };
  return jn.exports = a, jn.exports.default = a, jn.exports;
}
var vt = {}, Ue = {}, Hl;
function Rn() {
  if (Hl) return Ue;
  Hl = 1, Object.defineProperty(Ue, "__esModule", { value: !0 }), Ue.NOOP = Ue.LIMIT_FILES_DESCRIPTORS = Ue.LIMIT_BASENAME_LENGTH = Ue.IS_USER_ROOT = Ue.IS_POSIX = Ue.DEFAULT_TIMEOUT_SYNC = Ue.DEFAULT_TIMEOUT_ASYNC = Ue.DEFAULT_WRITE_OPTIONS = Ue.DEFAULT_READ_OPTIONS = Ue.DEFAULT_FOLDER_MODE = Ue.DEFAULT_FILE_MODE = Ue.DEFAULT_ENCODING = void 0;
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
  const s = 5e3;
  Ue.DEFAULT_TIMEOUT_ASYNC = s;
  const o = 100;
  Ue.DEFAULT_TIMEOUT_SYNC = o;
  const d = !!process.getuid;
  Ue.IS_POSIX = d;
  const a = process.getuid ? !process.getuid() : !1;
  Ue.IS_USER_ROOT = a;
  const l = 128;
  Ue.LIMIT_BASENAME_LENGTH = l;
  const n = 1e4;
  Ue.LIMIT_FILES_DESCRIPTORS = n;
  const f = () => {
  };
  return Ue.NOOP = f, Ue;
}
var Gn = {}, ir = {}, Bl;
function Vy() {
  if (Bl) return ir;
  Bl = 1, Object.defineProperty(ir, "__esModule", { value: !0 }), ir.attemptifySync = ir.attemptifyAsync = void 0;
  const e = Rn(), t = (r, u = e.NOOP) => function() {
    return r.apply(void 0, arguments).catch(u);
  };
  ir.attemptifyAsync = t;
  const i = (r, u = e.NOOP) => function() {
    try {
      return r.apply(void 0, arguments);
    } catch (s) {
      return u(s);
    }
  };
  return ir.attemptifySync = i, ir;
}
var Hn = {}, Vl;
function zy() {
  if (Vl) return Hn;
  Vl = 1, Object.defineProperty(Hn, "__esModule", { value: !0 });
  const e = Rn(), t = {
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
  return Hn.default = t, Hn;
}
var ar = {}, Bn = {}, zl;
function Xy() {
  if (zl) return Bn;
  zl = 1, Object.defineProperty(Bn, "__esModule", { value: !0 });
  const t = {
    interval: 25,
    intervalId: void 0,
    limit: Rn().LIMIT_FILES_DESCRIPTORS,
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
  return Bn.default = t, Bn;
}
var Xl;
function Yy() {
  if (Xl) return ar;
  Xl = 1, Object.defineProperty(ar, "__esModule", { value: !0 }), ar.retryifySync = ar.retryifyAsync = void 0;
  const e = Xy(), t = (r, u) => function(s) {
    return function o() {
      return e.default.schedule().then((d) => r.apply(void 0, arguments).then((a) => (d(), a), (a) => {
        if (d(), Date.now() >= s)
          throw a;
        if (u(a)) {
          const l = Math.round(100 + 400 * Math.random());
          return new Promise((f) => setTimeout(f, l)).then(() => o.apply(void 0, arguments));
        }
        throw a;
      }));
    };
  };
  ar.retryifyAsync = t;
  const i = (r, u) => function(s) {
    return function o() {
      try {
        return r.apply(void 0, arguments);
      } catch (d) {
        if (Date.now() > s)
          throw d;
        if (u(d))
          return o.apply(void 0, arguments);
        throw d;
      }
    };
  };
  return ar.retryifySync = i, ar;
}
var Yl;
function Nm() {
  if (Yl) return Gn;
  Yl = 1, Object.defineProperty(Gn, "__esModule", { value: !0 });
  const e = Rt, t = wn, i = Vy(), r = zy(), u = Yy(), s = {
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
  return Gn.default = s, Gn;
}
var Vn = {}, Wl;
function Wy() {
  if (Wl) return Vn;
  Wl = 1, Object.defineProperty(Vn, "__esModule", { value: !0 });
  const e = {
    isFunction: (t) => typeof t == "function",
    isString: (t) => typeof t == "string",
    isUndefined: (t) => typeof t > "u"
  };
  return Vn.default = e, Vn;
}
var zn = {}, Kl;
function Ky() {
  if (Kl) return zn;
  Kl = 1, Object.defineProperty(zn, "__esModule", { value: !0 });
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
  return zn.default = t, zn;
}
var Xn = {}, Jl;
function Jy() {
  if (Jl) return Xn;
  Jl = 1, Object.defineProperty(Xn, "__esModule", { value: !0 });
  const e = De, t = Rn(), i = Nm(), r = {
    store: {},
    create: (u) => {
      const s = `000000${Math.floor(Math.random() * 16777215).toString(16)}`.slice(-6), o = Date.now().toString().slice(-10), d = "tmp-", a = `.${d}${o}${s}`;
      return `${u}${a}`;
    },
    get: (u, s, o = !0) => {
      const d = r.truncate(s(u));
      return d in r.store ? r.get(u, s, o) : (r.store[d] = o, [d, () => delete r.store[d]]);
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
      const s = e.basename(u);
      if (s.length <= t.LIMIT_BASENAME_LENGTH)
        return u;
      const o = /^(\.?)(.*?)((?:\.[^.]+)?(?:\.tmp-\d{10}[a-f0-9]{6})?)$/.exec(s);
      if (!o)
        return u;
      const d = s.length - t.LIMIT_BASENAME_LENGTH;
      return `${u.slice(0, -s.length)}${o[1]}${o[2].slice(0, -d)}${o[3]}`;
    }
  };
  return process.on("exit", r.purgeSyncAll), Xn.default = r, Xn;
}
var Ql;
function Qy() {
  if (Ql) return vt;
  Ql = 1, Object.defineProperty(vt, "__esModule", { value: !0 }), vt.writeFileSync = vt.writeFile = vt.readFileSync = vt.readFile = void 0;
  const e = De, t = Rn(), i = Nm(), r = Wy(), u = Ky(), s = Jy();
  function o(f, c = t.DEFAULT_READ_OPTIONS) {
    var h;
    if (r.default.isString(c))
      return o(f, { encoding: c });
    const y = Date.now() + ((h = c.timeout) !== null && h !== void 0 ? h : t.DEFAULT_TIMEOUT_ASYNC);
    return i.default.readFileRetry(y)(f, c);
  }
  vt.readFile = o;
  function d(f, c = t.DEFAULT_READ_OPTIONS) {
    var h;
    if (r.default.isString(c))
      return d(f, { encoding: c });
    const y = Date.now() + ((h = c.timeout) !== null && h !== void 0 ? h : t.DEFAULT_TIMEOUT_SYNC);
    return i.default.readFileSyncRetry(y)(f, c);
  }
  vt.readFileSync = d;
  const a = (f, c, h, y) => {
    if (r.default.isFunction(h))
      return a(f, c, t.DEFAULT_WRITE_OPTIONS, h);
    const E = l(f, c, h);
    return y && E.then(y, y), E;
  };
  vt.writeFile = a;
  const l = async (f, c, h = t.DEFAULT_WRITE_OPTIONS) => {
    var y;
    if (r.default.isString(h))
      return l(f, c, { encoding: h });
    const E = Date.now() + ((y = h.timeout) !== null && y !== void 0 ? y : t.DEFAULT_TIMEOUT_ASYNC);
    let p = null, v = null, m = null, w = null, T = null;
    try {
      h.schedule && (p = await h.schedule(f)), v = await u.default.schedule(f), f = await i.default.realpathAttempt(f) || f, [w, m] = s.default.get(f, h.tmpCreate || s.default.create, h.tmpPurge !== !1);
      const R = t.IS_POSIX && r.default.isUndefined(h.chown), _ = r.default.isUndefined(h.mode);
      if (R || _) {
        const A = await i.default.statAttempt(f);
        A && (h = { ...h }, R && (h.chown = { uid: A.uid, gid: A.gid }), _ && (h.mode = A.mode));
      }
      const S = e.dirname(f);
      await i.default.mkdirAttempt(S, {
        mode: t.DEFAULT_FOLDER_MODE,
        recursive: !0
      }), T = await i.default.openRetry(E)(w, "w", h.mode || t.DEFAULT_FILE_MODE), h.tmpCreated && h.tmpCreated(w), r.default.isString(c) ? await i.default.writeRetry(E)(T, c, 0, h.encoding || t.DEFAULT_ENCODING) : r.default.isUndefined(c) || await i.default.writeRetry(E)(T, c, 0, c.length, 0), h.fsync !== !1 && (h.fsyncWait !== !1 ? await i.default.fsyncRetry(E)(T) : i.default.fsyncAttempt(T)), await i.default.closeRetry(E)(T), T = null, h.chown && await i.default.chownAttempt(w, h.chown.uid, h.chown.gid), h.mode && await i.default.chmodAttempt(w, h.mode);
      try {
        await i.default.renameRetry(E)(w, f);
      } catch (A) {
        if (A.code !== "ENAMETOOLONG")
          throw A;
        await i.default.renameRetry(E)(w, s.default.truncate(f));
      }
      m(), w = null;
    } finally {
      T && await i.default.closeAttempt(T), w && s.default.purge(w), p && p(), v && v();
    }
  }, n = (f, c, h = t.DEFAULT_WRITE_OPTIONS) => {
    var y;
    if (r.default.isString(h))
      return n(f, c, { encoding: h });
    const E = Date.now() + ((y = h.timeout) !== null && y !== void 0 ? y : t.DEFAULT_TIMEOUT_SYNC);
    let p = null, v = null, m = null;
    try {
      f = i.default.realpathSyncAttempt(f) || f, [v, p] = s.default.get(f, h.tmpCreate || s.default.create, h.tmpPurge !== !1);
      const w = t.IS_POSIX && r.default.isUndefined(h.chown), T = r.default.isUndefined(h.mode);
      if (w || T) {
        const _ = i.default.statSyncAttempt(f);
        _ && (h = { ...h }, w && (h.chown = { uid: _.uid, gid: _.gid }), T && (h.mode = _.mode));
      }
      const R = e.dirname(f);
      i.default.mkdirSyncAttempt(R, {
        mode: t.DEFAULT_FOLDER_MODE,
        recursive: !0
      }), m = i.default.openSyncRetry(E)(v, "w", h.mode || t.DEFAULT_FILE_MODE), h.tmpCreated && h.tmpCreated(v), r.default.isString(c) ? i.default.writeSyncRetry(E)(m, c, 0, h.encoding || t.DEFAULT_ENCODING) : r.default.isUndefined(c) || i.default.writeSyncRetry(E)(m, c, 0, c.length, 0), h.fsync !== !1 && (h.fsyncWait !== !1 ? i.default.fsyncSyncRetry(E)(m) : i.default.fsyncAttempt(m)), i.default.closeSyncRetry(E)(m), m = null, h.chown && i.default.chownSyncAttempt(v, h.chown.uid, h.chown.gid), h.mode && i.default.chmodSyncAttempt(v, h.mode);
      try {
        i.default.renameSyncRetry(E)(v, f);
      } catch (_) {
        if (_.code !== "ENAMETOOLONG")
          throw _;
        i.default.renameSyncRetry(E)(v, s.default.truncate(f));
      }
      p(), v = null;
    } finally {
      m && i.default.closeSyncAttempt(m), v && s.default.purge(v);
    }
  };
  return vt.writeFileSync = n, vt;
}
var Yn = { exports: {} }, ba = {}, Lt = {}, sr = {}, Aa = {}, Oa = {}, Na = {}, Zl;
function Zi() {
  return Zl || (Zl = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.regexpCode = e.getEsmExportName = e.getProperty = e.safeStringify = e.stringify = e.strConcat = e.addCodeArg = e.str = e._ = e.nil = e._Code = e.Name = e.IDENTIFIER = e._CodeOrName = void 0;
    class t {
    }
    e._CodeOrName = t, e.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
    class i extends t {
      constructor(m) {
        if (super(), !e.IDENTIFIER.test(m))
          throw new Error("CodeGen: name must be a valid identifier");
        this.str = m;
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
      constructor(m) {
        super(), this._items = typeof m == "string" ? [m] : m;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        if (this._items.length > 1)
          return !1;
        const m = this._items[0];
        return m === "" || m === '""';
      }
      get str() {
        var m;
        return (m = this._str) !== null && m !== void 0 ? m : this._str = this._items.reduce((w, T) => `${w}${T}`, "");
      }
      get names() {
        var m;
        return (m = this._names) !== null && m !== void 0 ? m : this._names = this._items.reduce((w, T) => (T instanceof i && (w[T.str] = (w[T.str] || 0) + 1), w), {});
      }
    }
    e._Code = r, e.nil = new r("");
    function u(v, ...m) {
      const w = [v[0]];
      let T = 0;
      for (; T < m.length; )
        d(w, m[T]), w.push(v[++T]);
      return new r(w);
    }
    e._ = u;
    const s = new r("+");
    function o(v, ...m) {
      const w = [h(v[0])];
      let T = 0;
      for (; T < m.length; )
        w.push(s), d(w, m[T]), w.push(s, h(v[++T]));
      return a(w), new r(w);
    }
    e.str = o;
    function d(v, m) {
      m instanceof r ? v.push(...m._items) : m instanceof i ? v.push(m) : v.push(f(m));
    }
    e.addCodeArg = d;
    function a(v) {
      let m = 1;
      for (; m < v.length - 1; ) {
        if (v[m] === s) {
          const w = l(v[m - 1], v[m + 1]);
          if (w !== void 0) {
            v.splice(m - 1, 3, w);
            continue;
          }
          v[m++] = "+";
        }
        m++;
      }
    }
    function l(v, m) {
      if (m === '""')
        return v;
      if (v === '""')
        return m;
      if (typeof v == "string")
        return m instanceof i || v[v.length - 1] !== '"' ? void 0 : typeof m != "string" ? `${v.slice(0, -1)}${m}"` : m[0] === '"' ? v.slice(0, -1) + m.slice(1) : void 0;
      if (typeof m == "string" && m[0] === '"' && !(v instanceof i))
        return `"${v}${m.slice(1)}`;
    }
    function n(v, m) {
      return m.emptyStr() ? v : v.emptyStr() ? m : o`${v}${m}`;
    }
    e.strConcat = n;
    function f(v) {
      return typeof v == "number" || typeof v == "boolean" || v === null ? v : h(Array.isArray(v) ? v.join(",") : v);
    }
    function c(v) {
      return new r(h(v));
    }
    e.stringify = c;
    function h(v) {
      return JSON.stringify(v).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
    }
    e.safeStringify = h;
    function y(v) {
      return typeof v == "string" && e.IDENTIFIER.test(v) ? new r(`.${v}`) : u`[${v}]`;
    }
    e.getProperty = y;
    function E(v) {
      if (typeof v == "string" && e.IDENTIFIER.test(v))
        return new r(`${v}`);
      throw new Error(`CodeGen: invalid export name: ${v}, use explicit $id name mapping`);
    }
    e.getEsmExportName = E;
    function p(v) {
      return new r(v.toString());
    }
    e.regexpCode = p;
  })(Na)), Na;
}
var $a = {}, ec;
function tc() {
  return ec || (ec = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.ValueScope = e.ValueScopeName = e.Scope = e.varKinds = e.UsedValueState = void 0;
    const t = Zi();
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
      constructor({ prefixes: l, parent: n } = {}) {
        this._names = {}, this._prefixes = l, this._parent = n;
      }
      toName(l) {
        return l instanceof t.Name ? l : this.name(l);
      }
      name(l) {
        return new t.Name(this._newName(l));
      }
      _newName(l) {
        const n = this._names[l] || this._nameGroup(l);
        return `${l}${n.index++}`;
      }
      _nameGroup(l) {
        var n, f;
        if (!((f = (n = this._parent) === null || n === void 0 ? void 0 : n._prefixes) === null || f === void 0) && f.has(l) || this._prefixes && !this._prefixes.has(l))
          throw new Error(`CodeGen: prefix "${l}" is not allowed in this scope`);
        return this._names[l] = { prefix: l, index: 0 };
      }
    }
    e.Scope = u;
    class s extends t.Name {
      constructor(l, n) {
        super(n), this.prefix = l;
      }
      setValue(l, { property: n, itemIndex: f }) {
        this.value = l, this.scopePath = (0, t._)`.${new t.Name(n)}[${f}]`;
      }
    }
    e.ValueScopeName = s;
    const o = (0, t._)`\n`;
    class d extends u {
      constructor(l) {
        super(l), this._values = {}, this._scope = l.scope, this.opts = { ...l, _n: l.lines ? o : t.nil };
      }
      get() {
        return this._scope;
      }
      name(l) {
        return new s(l, this._newName(l));
      }
      value(l, n) {
        var f;
        if (n.ref === void 0)
          throw new Error("CodeGen: ref must be passed in value");
        const c = this.toName(l), { prefix: h } = c, y = (f = n.key) !== null && f !== void 0 ? f : n.ref;
        let E = this._values[h];
        if (E) {
          const m = E.get(y);
          if (m)
            return m;
        } else
          E = this._values[h] = /* @__PURE__ */ new Map();
        E.set(y, c);
        const p = this._scope[h] || (this._scope[h] = []), v = p.length;
        return p[v] = n.ref, c.setValue(n, { property: h, itemIndex: v }), c;
      }
      getValue(l, n) {
        const f = this._values[l];
        if (f)
          return f.get(n);
      }
      scopeRefs(l, n = this._values) {
        return this._reduceValues(n, (f) => {
          if (f.scopePath === void 0)
            throw new Error(`CodeGen: name "${f}" has no value`);
          return (0, t._)`${l}${f.scopePath}`;
        });
      }
      scopeCode(l = this._values, n, f) {
        return this._reduceValues(l, (c) => {
          if (c.value === void 0)
            throw new Error(`CodeGen: name "${c}" has no value`);
          return c.value.code;
        }, n, f);
      }
      _reduceValues(l, n, f = {}, c) {
        let h = t.nil;
        for (const y in l) {
          const E = l[y];
          if (!E)
            continue;
          const p = f[y] = f[y] || /* @__PURE__ */ new Map();
          E.forEach((v) => {
            if (p.has(v))
              return;
            p.set(v, r.Started);
            let m = n(v);
            if (m) {
              const w = this.opts.es5 ? e.varKinds.var : e.varKinds.const;
              h = (0, t._)`${h}${w} ${v} = ${m};${this.opts._n}`;
            } else if (m = c?.(v))
              h = (0, t._)`${h}${m}${this.opts._n}`;
            else
              throw new i(v);
            p.set(v, r.Completed);
          });
        }
        return h;
      }
    }
    e.ValueScope = d;
  })($a)), $a;
}
var rc;
function Oe() {
  return rc || (rc = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.or = e.and = e.not = e.CodeGen = e.operators = e.varKinds = e.ValueScopeName = e.ValueScope = e.Scope = e.Name = e.regexpCode = e.stringify = e.getProperty = e.nil = e.strConcat = e.str = e._ = void 0;
    const t = Zi(), i = tc();
    var r = Zi();
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
    var u = tc();
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
    class s {
      optimizeNodes() {
        return this;
      }
      optimizeNames($, I) {
        return this;
      }
    }
    class o extends s {
      constructor($, I, K) {
        super(), this.varKind = $, this.name = I, this.rhs = K;
      }
      render({ es5: $, _n: I }) {
        const K = $ ? i.varKinds.var : this.varKind, N = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
        return `${K} ${this.name}${N};` + I;
      }
      optimizeNames($, I) {
        if ($[this.name.str])
          return this.rhs && (this.rhs = P(this.rhs, $, I)), this;
      }
      get names() {
        return this.rhs instanceof t._CodeOrName ? this.rhs.names : {};
      }
    }
    class d extends s {
      constructor($, I, K) {
        super(), this.lhs = $, this.rhs = I, this.sideEffects = K;
      }
      render({ _n: $ }) {
        return `${this.lhs} = ${this.rhs};` + $;
      }
      optimizeNames($, I) {
        if (!(this.lhs instanceof t.Name && !$[this.lhs.str] && !this.sideEffects))
          return this.rhs = P(this.rhs, $, I), this;
      }
      get names() {
        const $ = this.lhs instanceof t.Name ? {} : { ...this.lhs.names };
        return X($, this.rhs);
      }
    }
    class a extends d {
      constructor($, I, K, N) {
        super($, K, N), this.op = I;
      }
      render({ _n: $ }) {
        return `${this.lhs} ${this.op}= ${this.rhs};` + $;
      }
    }
    class l extends s {
      constructor($) {
        super(), this.label = $, this.names = {};
      }
      render({ _n: $ }) {
        return `${this.label}:` + $;
      }
    }
    class n extends s {
      constructor($) {
        super(), this.label = $, this.names = {};
      }
      render({ _n: $ }) {
        return `break${this.label ? ` ${this.label}` : ""};` + $;
      }
    }
    class f extends s {
      constructor($) {
        super(), this.error = $;
      }
      render({ _n: $ }) {
        return `throw ${this.error};` + $;
      }
      get names() {
        return this.error.names;
      }
    }
    class c extends s {
      constructor($) {
        super(), this.code = $;
      }
      render({ _n: $ }) {
        return `${this.code};` + $;
      }
      optimizeNodes() {
        return `${this.code}` ? this : void 0;
      }
      optimizeNames($, I) {
        return this.code = P(this.code, $, I), this;
      }
      get names() {
        return this.code instanceof t._CodeOrName ? this.code.names : {};
      }
    }
    class h extends s {
      constructor($ = []) {
        super(), this.nodes = $;
      }
      render($) {
        return this.nodes.reduce((I, K) => I + K.render($), "");
      }
      optimizeNodes() {
        const { nodes: $ } = this;
        let I = $.length;
        for (; I--; ) {
          const K = $[I].optimizeNodes();
          Array.isArray(K) ? $.splice(I, 1, ...K) : K ? $[I] = K : $.splice(I, 1);
        }
        return $.length > 0 ? this : void 0;
      }
      optimizeNames($, I) {
        const { nodes: K } = this;
        let N = K.length;
        for (; N--; ) {
          const O = K[N];
          O.optimizeNames($, I) || (D($, O.names), K.splice(N, 1));
        }
        return K.length > 0 ? this : void 0;
      }
      get names() {
        return this.nodes.reduce(($, I) => j($, I.names), {});
      }
    }
    class y extends h {
      render($) {
        return "{" + $._n + super.render($) + "}" + $._n;
      }
    }
    class E extends h {
    }
    class p extends y {
    }
    p.kind = "else";
    class v extends y {
      constructor($, I) {
        super(I), this.condition = $;
      }
      render($) {
        let I = `if(${this.condition})` + super.render($);
        return this.else && (I += "else " + this.else.render($)), I;
      }
      optimizeNodes() {
        super.optimizeNodes();
        const $ = this.condition;
        if ($ === !0)
          return this.nodes;
        let I = this.else;
        if (I) {
          const K = I.optimizeNodes();
          I = this.else = Array.isArray(K) ? new p(K) : K;
        }
        if (I)
          return $ === !1 ? I instanceof v ? I : I.nodes : this.nodes.length ? this : new v(W($), I instanceof v ? [I] : I.nodes);
        if (!($ === !1 || !this.nodes.length))
          return this;
      }
      optimizeNames($, I) {
        var K;
        if (this.else = (K = this.else) === null || K === void 0 ? void 0 : K.optimizeNames($, I), !!(super.optimizeNames($, I) || this.else))
          return this.condition = P(this.condition, $, I), this;
      }
      get names() {
        const $ = super.names;
        return X($, this.condition), this.else && j($, this.else.names), $;
      }
    }
    v.kind = "if";
    class m extends y {
    }
    m.kind = "for";
    class w extends m {
      constructor($) {
        super(), this.iteration = $;
      }
      render($) {
        return `for(${this.iteration})` + super.render($);
      }
      optimizeNames($, I) {
        if (super.optimizeNames($, I))
          return this.iteration = P(this.iteration, $, I), this;
      }
      get names() {
        return j(super.names, this.iteration.names);
      }
    }
    class T extends m {
      constructor($, I, K, N) {
        super(), this.varKind = $, this.name = I, this.from = K, this.to = N;
      }
      render($) {
        const I = $.es5 ? i.varKinds.var : this.varKind, { name: K, from: N, to: O } = this;
        return `for(${I} ${K}=${N}; ${K}<${O}; ${K}++)` + super.render($);
      }
      get names() {
        const $ = X(super.names, this.from);
        return X($, this.to);
      }
    }
    class R extends m {
      constructor($, I, K, N) {
        super(), this.loop = $, this.varKind = I, this.name = K, this.iterable = N;
      }
      render($) {
        return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render($);
      }
      optimizeNames($, I) {
        if (super.optimizeNames($, I))
          return this.iterable = P(this.iterable, $, I), this;
      }
      get names() {
        return j(super.names, this.iterable.names);
      }
    }
    class _ extends y {
      constructor($, I, K) {
        super(), this.name = $, this.args = I, this.async = K;
      }
      render($) {
        return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render($);
      }
    }
    _.kind = "func";
    class S extends h {
      render($) {
        return "return " + super.render($);
      }
    }
    S.kind = "return";
    class A extends y {
      render($) {
        let I = "try" + super.render($);
        return this.catch && (I += this.catch.render($)), this.finally && (I += this.finally.render($)), I;
      }
      optimizeNodes() {
        var $, I;
        return super.optimizeNodes(), ($ = this.catch) === null || $ === void 0 || $.optimizeNodes(), (I = this.finally) === null || I === void 0 || I.optimizeNodes(), this;
      }
      optimizeNames($, I) {
        var K, N;
        return super.optimizeNames($, I), (K = this.catch) === null || K === void 0 || K.optimizeNames($, I), (N = this.finally) === null || N === void 0 || N.optimizeNames($, I), this;
      }
      get names() {
        const $ = super.names;
        return this.catch && j($, this.catch.names), this.finally && j($, this.finally.names), $;
      }
    }
    class b extends y {
      constructor($) {
        super(), this.error = $;
      }
      render($) {
        return `catch(${this.error})` + super.render($);
      }
    }
    b.kind = "catch";
    class x extends y {
      render($) {
        return "finally" + super.render($);
      }
    }
    x.kind = "finally";
    class M {
      constructor($, I = {}) {
        this._values = {}, this._blockStarts = [], this._constants = {}, this.opts = { ...I, _n: I.lines ? `
` : "" }, this._extScope = $, this._scope = new i.Scope({ parent: $ }), this._nodes = [new E()];
      }
      toString() {
        return this._root.render(this.opts);
      }
      // returns unique name in the internal scope
      name($) {
        return this._scope.name($);
      }
      // reserves unique name in the external scope
      scopeName($) {
        return this._extScope.name($);
      }
      // reserves unique name in the external scope and assigns value to it
      scopeValue($, I) {
        const K = this._extScope.value($, I);
        return (this._values[K.prefix] || (this._values[K.prefix] = /* @__PURE__ */ new Set())).add(K), K;
      }
      getScopeValue($, I) {
        return this._extScope.getValue($, I);
      }
      // return code that assigns values in the external scope to the names that are used internally
      // (same names that were returned by gen.scopeName or gen.scopeValue)
      scopeRefs($) {
        return this._extScope.scopeRefs($, this._values);
      }
      scopeCode() {
        return this._extScope.scopeCode(this._values);
      }
      _def($, I, K, N) {
        const O = this._scope.toName(I);
        return K !== void 0 && N && (this._constants[O.str] = K), this._leafNode(new o($, O, K)), O;
      }
      // `const` declaration (`var` in es5 mode)
      const($, I, K) {
        return this._def(i.varKinds.const, $, I, K);
      }
      // `let` declaration with optional assignment (`var` in es5 mode)
      let($, I, K) {
        return this._def(i.varKinds.let, $, I, K);
      }
      // `var` declaration with optional assignment
      var($, I, K) {
        return this._def(i.varKinds.var, $, I, K);
      }
      // assignment code
      assign($, I, K) {
        return this._leafNode(new d($, I, K));
      }
      // `+=` code
      add($, I) {
        return this._leafNode(new a($, e.operators.ADD, I));
      }
      // appends passed SafeExpr to code or executes Block
      code($) {
        return typeof $ == "function" ? $() : $ !== t.nil && this._leafNode(new c($)), this;
      }
      // returns code for object literal for the passed argument list of key-value pairs
      object(...$) {
        const I = ["{"];
        for (const [K, N] of $)
          I.length > 1 && I.push(","), I.push(K), (K !== N || this.opts.es5) && (I.push(":"), (0, t.addCodeArg)(I, N));
        return I.push("}"), new t._Code(I);
      }
      // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
      if($, I, K) {
        if (this._blockNode(new v($)), I && K)
          this.code(I).else().code(K).endIf();
        else if (I)
          this.code(I).endIf();
        else if (K)
          throw new Error('CodeGen: "else" body without "then" body');
        return this;
      }
      // `else if` clause - invalid without `if` or after `else` clauses
      elseIf($) {
        return this._elseNode(new v($));
      }
      // `else` clause - only valid after `if` or `else if` clauses
      else() {
        return this._elseNode(new p());
      }
      // end `if` statement (needed if gen.if was used only with condition)
      endIf() {
        return this._endBlockNode(v, p);
      }
      _for($, I) {
        return this._blockNode($), I && this.code(I).endFor(), this;
      }
      // a generic `for` clause (or statement if `forBody` is passed)
      for($, I) {
        return this._for(new w($), I);
      }
      // `for` statement for a range of values
      forRange($, I, K, N, O = this.opts.es5 ? i.varKinds.var : i.varKinds.let) {
        const Q = this._scope.toName($);
        return this._for(new T(O, Q, I, K), () => N(Q));
      }
      // `for-of` statement (in es5 mode replace with a normal for loop)
      forOf($, I, K, N = i.varKinds.const) {
        const O = this._scope.toName($);
        if (this.opts.es5) {
          const Q = I instanceof t.Name ? I : this.var("_arr", I);
          return this.forRange("_i", 0, (0, t._)`${Q}.length`, (V) => {
            this.var(O, (0, t._)`${Q}[${V}]`), K(O);
          });
        }
        return this._for(new R("of", N, O, I), () => K(O));
      }
      // `for-in` statement.
      // With option `ownProperties` replaced with a `for-of` loop for object keys
      forIn($, I, K, N = this.opts.es5 ? i.varKinds.var : i.varKinds.const) {
        if (this.opts.ownProperties)
          return this.forOf($, (0, t._)`Object.keys(${I})`, K);
        const O = this._scope.toName($);
        return this._for(new R("in", N, O, I), () => K(O));
      }
      // end `for` loop
      endFor() {
        return this._endBlockNode(m);
      }
      // `label` statement
      label($) {
        return this._leafNode(new l($));
      }
      // `break` statement
      break($) {
        return this._leafNode(new n($));
      }
      // `return` statement
      return($) {
        const I = new S();
        if (this._blockNode(I), this.code($), I.nodes.length !== 1)
          throw new Error('CodeGen: "return" should have one node');
        return this._endBlockNode(S);
      }
      // `try` statement
      try($, I, K) {
        if (!I && !K)
          throw new Error('CodeGen: "try" without "catch" and "finally"');
        const N = new A();
        if (this._blockNode(N), this.code($), I) {
          const O = this.name("e");
          this._currNode = N.catch = new b(O), I(O);
        }
        return K && (this._currNode = N.finally = new x(), this.code(K)), this._endBlockNode(b, x);
      }
      // `throw` statement
      throw($) {
        return this._leafNode(new f($));
      }
      // start self-balancing block
      block($, I) {
        return this._blockStarts.push(this._nodes.length), $ && this.code($).endBlock(I), this;
      }
      // end the current self-balancing block
      endBlock($) {
        const I = this._blockStarts.pop();
        if (I === void 0)
          throw new Error("CodeGen: not in self-balancing block");
        const K = this._nodes.length - I;
        if (K < 0 || $ !== void 0 && K !== $)
          throw new Error(`CodeGen: wrong number of nodes: ${K} vs ${$} expected`);
        return this._nodes.length = I, this;
      }
      // `function` heading (or definition if funcBody is passed)
      func($, I = t.nil, K, N) {
        return this._blockNode(new _($, I, K)), N && this.code(N).endFunc(), this;
      }
      // end function definition
      endFunc() {
        return this._endBlockNode(_);
      }
      optimize($ = 1) {
        for (; $-- > 0; )
          this._root.optimizeNodes(), this._root.optimizeNames(this._root.names, this._constants);
      }
      _leafNode($) {
        return this._currNode.nodes.push($), this;
      }
      _blockNode($) {
        this._currNode.nodes.push($), this._nodes.push($);
      }
      _endBlockNode($, I) {
        const K = this._currNode;
        if (K instanceof $ || I && K instanceof I)
          return this._nodes.pop(), this;
        throw new Error(`CodeGen: not in block "${I ? `${$.kind}/${I.kind}` : $.kind}"`);
      }
      _elseNode($) {
        const I = this._currNode;
        if (!(I instanceof v))
          throw new Error('CodeGen: "else" without "if"');
        return this._currNode = I.else = $, this;
      }
      get _root() {
        return this._nodes[0];
      }
      get _currNode() {
        const $ = this._nodes;
        return $[$.length - 1];
      }
      set _currNode($) {
        const I = this._nodes;
        I[I.length - 1] = $;
      }
    }
    e.CodeGen = M;
    function j(H, $) {
      for (const I in $)
        H[I] = (H[I] || 0) + ($[I] || 0);
      return H;
    }
    function X(H, $) {
      return $ instanceof t._CodeOrName ? j(H, $.names) : H;
    }
    function P(H, $, I) {
      if (H instanceof t.Name)
        return K(H);
      if (!N(H))
        return H;
      return new t._Code(H._items.reduce((O, Q) => (Q instanceof t.Name && (Q = K(Q)), Q instanceof t._Code ? O.push(...Q._items) : O.push(Q), O), []));
      function K(O) {
        const Q = I[O.str];
        return Q === void 0 || $[O.str] !== 1 ? O : (delete $[O.str], Q);
      }
      function N(O) {
        return O instanceof t._Code && O._items.some((Q) => Q instanceof t.Name && $[Q.str] === 1 && I[Q.str] !== void 0);
      }
    }
    function D(H, $) {
      for (const I in $)
        H[I] = (H[I] || 0) - ($[I] || 0);
    }
    function W(H) {
      return typeof H == "boolean" || typeof H == "number" || H === null ? !H : (0, t._)`!${z(H)}`;
    }
    e.not = W;
    const L = q(e.operators.AND);
    function F(...H) {
      return H.reduce(L);
    }
    e.and = F;
    const G = q(e.operators.OR);
    function k(...H) {
      return H.reduce(G);
    }
    e.or = k;
    function q(H) {
      return ($, I) => $ === t.nil ? I : I === t.nil ? $ : (0, t._)`${z($)} ${H} ${z(I)}`;
    }
    function z(H) {
      return H instanceof t.Name ? H : (0, t._)`(${H})`;
    }
  })(Oa)), Oa;
}
var Ae = {}, nc;
function Pe() {
  if (nc) return Ae;
  nc = 1, Object.defineProperty(Ae, "__esModule", { value: !0 }), Ae.checkStrictMode = Ae.getErrorPath = Ae.Type = Ae.useFunc = Ae.setEvaluated = Ae.evaluatedPropsToName = Ae.mergeEvaluated = Ae.eachItem = Ae.unescapeJsonPointer = Ae.escapeJsonPointer = Ae.escapeFragment = Ae.unescapeFragment = Ae.schemaRefOrVal = Ae.schemaHasRulesButRef = Ae.schemaHasRules = Ae.checkUnknownRules = Ae.alwaysValidSchema = Ae.toHash = void 0;
  const e = Oe(), t = Zi();
  function i(R) {
    const _ = {};
    for (const S of R)
      _[S] = !0;
    return _;
  }
  Ae.toHash = i;
  function r(R, _) {
    return typeof _ == "boolean" ? _ : Object.keys(_).length === 0 ? !0 : (u(R, _), !s(_, R.self.RULES.all));
  }
  Ae.alwaysValidSchema = r;
  function u(R, _ = R.schema) {
    const { opts: S, self: A } = R;
    if (!S.strictSchema || typeof _ == "boolean")
      return;
    const b = A.RULES.keywords;
    for (const x in _)
      b[x] || T(R, `unknown keyword: "${x}"`);
  }
  Ae.checkUnknownRules = u;
  function s(R, _) {
    if (typeof R == "boolean")
      return !R;
    for (const S in R)
      if (_[S])
        return !0;
    return !1;
  }
  Ae.schemaHasRules = s;
  function o(R, _) {
    if (typeof R == "boolean")
      return !R;
    for (const S in R)
      if (S !== "$ref" && _.all[S])
        return !0;
    return !1;
  }
  Ae.schemaHasRulesButRef = o;
  function d({ topSchemaRef: R, schemaPath: _ }, S, A, b) {
    if (!b) {
      if (typeof S == "number" || typeof S == "boolean")
        return S;
      if (typeof S == "string")
        return (0, e._)`${S}`;
    }
    return (0, e._)`${R}${_}${(0, e.getProperty)(A)}`;
  }
  Ae.schemaRefOrVal = d;
  function a(R) {
    return f(decodeURIComponent(R));
  }
  Ae.unescapeFragment = a;
  function l(R) {
    return encodeURIComponent(n(R));
  }
  Ae.escapeFragment = l;
  function n(R) {
    return typeof R == "number" ? `${R}` : R.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  Ae.escapeJsonPointer = n;
  function f(R) {
    return R.replace(/~1/g, "/").replace(/~0/g, "~");
  }
  Ae.unescapeJsonPointer = f;
  function c(R, _) {
    if (Array.isArray(R))
      for (const S of R)
        _(S);
    else
      _(R);
  }
  Ae.eachItem = c;
  function h({ mergeNames: R, mergeToName: _, mergeValues: S, resultToName: A }) {
    return (b, x, M, j) => {
      const X = M === void 0 ? x : M instanceof e.Name ? (x instanceof e.Name ? R(b, x, M) : _(b, x, M), M) : x instanceof e.Name ? (_(b, M, x), x) : S(x, M);
      return j === e.Name && !(X instanceof e.Name) ? A(b, X) : X;
    };
  }
  Ae.mergeEvaluated = {
    props: h({
      mergeNames: (R, _, S) => R.if((0, e._)`${S} !== true && ${_} !== undefined`, () => {
        R.if((0, e._)`${_} === true`, () => R.assign(S, !0), () => R.assign(S, (0, e._)`${S} || {}`).code((0, e._)`Object.assign(${S}, ${_})`));
      }),
      mergeToName: (R, _, S) => R.if((0, e._)`${S} !== true`, () => {
        _ === !0 ? R.assign(S, !0) : (R.assign(S, (0, e._)`${S} || {}`), E(R, S, _));
      }),
      mergeValues: (R, _) => R === !0 ? !0 : { ...R, ..._ },
      resultToName: y
    }),
    items: h({
      mergeNames: (R, _, S) => R.if((0, e._)`${S} !== true && ${_} !== undefined`, () => R.assign(S, (0, e._)`${_} === true ? true : ${S} > ${_} ? ${S} : ${_}`)),
      mergeToName: (R, _, S) => R.if((0, e._)`${S} !== true`, () => R.assign(S, _ === !0 ? !0 : (0, e._)`${S} > ${_} ? ${S} : ${_}`)),
      mergeValues: (R, _) => R === !0 ? !0 : Math.max(R, _),
      resultToName: (R, _) => R.var("items", _)
    })
  };
  function y(R, _) {
    if (_ === !0)
      return R.var("props", !0);
    const S = R.var("props", (0, e._)`{}`);
    return _ !== void 0 && E(R, S, _), S;
  }
  Ae.evaluatedPropsToName = y;
  function E(R, _, S) {
    Object.keys(S).forEach((A) => R.assign((0, e._)`${_}${(0, e.getProperty)(A)}`, !0));
  }
  Ae.setEvaluated = E;
  const p = {};
  function v(R, _) {
    return R.scopeValue("func", {
      ref: _,
      code: p[_.code] || (p[_.code] = new t._Code(_.code))
    });
  }
  Ae.useFunc = v;
  var m;
  (function(R) {
    R[R.Num = 0] = "Num", R[R.Str = 1] = "Str";
  })(m || (Ae.Type = m = {}));
  function w(R, _, S) {
    if (R instanceof e.Name) {
      const A = _ === m.Num;
      return S ? A ? (0, e._)`"[" + ${R} + "]"` : (0, e._)`"['" + ${R} + "']"` : A ? (0, e._)`"/" + ${R}` : (0, e._)`"/" + ${R}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
    }
    return S ? (0, e.getProperty)(R).toString() : "/" + n(R);
  }
  Ae.getErrorPath = w;
  function T(R, _, S = R.opts.strictSchema) {
    if (S) {
      if (_ = `strict mode: ${_}`, S === !0)
        throw new Error(_);
      R.self.logger.warn(_);
    }
  }
  return Ae.checkStrictMode = T, Ae;
}
var Wn = {}, ic;
function Jt() {
  if (ic) return Wn;
  ic = 1, Object.defineProperty(Wn, "__esModule", { value: !0 });
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
  return Wn.default = t, Wn;
}
var ac;
function ra() {
  return ac || (ac = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
    const t = Oe(), i = Pe(), r = Jt();
    e.keywordError = {
      message: ({ keyword: p }) => (0, t.str)`must pass "${p}" keyword validation`
    }, e.keyword$DataError = {
      message: ({ keyword: p, schemaType: v }) => v ? (0, t.str)`"${p}" keyword must be ${v} ($data)` : (0, t.str)`"${p}" keyword is invalid ($data)`
    };
    function u(p, v = e.keywordError, m, w) {
      const { it: T } = p, { gen: R, compositeRule: _, allErrors: S } = T, A = f(p, v, m);
      w ?? (_ || S) ? a(R, A) : l(T, (0, t._)`[${A}]`);
    }
    e.reportError = u;
    function s(p, v = e.keywordError, m) {
      const { it: w } = p, { gen: T, compositeRule: R, allErrors: _ } = w, S = f(p, v, m);
      a(T, S), R || _ || l(w, r.default.vErrors);
    }
    e.reportExtraError = s;
    function o(p, v) {
      p.assign(r.default.errors, v), p.if((0, t._)`${r.default.vErrors} !== null`, () => p.if(v, () => p.assign((0, t._)`${r.default.vErrors}.length`, v), () => p.assign(r.default.vErrors, null)));
    }
    e.resetErrorsCount = o;
    function d({ gen: p, keyword: v, schemaValue: m, data: w, errsCount: T, it: R }) {
      if (T === void 0)
        throw new Error("ajv implementation error");
      const _ = p.name("err");
      p.forRange("i", T, r.default.errors, (S) => {
        p.const(_, (0, t._)`${r.default.vErrors}[${S}]`), p.if((0, t._)`${_}.instancePath === undefined`, () => p.assign((0, t._)`${_}.instancePath`, (0, t.strConcat)(r.default.instancePath, R.errorPath))), p.assign((0, t._)`${_}.schemaPath`, (0, t.str)`${R.errSchemaPath}/${v}`), R.opts.verbose && (p.assign((0, t._)`${_}.schema`, m), p.assign((0, t._)`${_}.data`, w));
      });
    }
    e.extendErrors = d;
    function a(p, v) {
      const m = p.const("err", v);
      p.if((0, t._)`${r.default.vErrors} === null`, () => p.assign(r.default.vErrors, (0, t._)`[${m}]`), (0, t._)`${r.default.vErrors}.push(${m})`), p.code((0, t._)`${r.default.errors}++`);
    }
    function l(p, v) {
      const { gen: m, validateName: w, schemaEnv: T } = p;
      T.$async ? m.throw((0, t._)`new ${p.ValidationError}(${v})`) : (m.assign((0, t._)`${w}.errors`, v), m.return(!1));
    }
    const n = {
      keyword: new t.Name("keyword"),
      schemaPath: new t.Name("schemaPath"),
      // also used in JTD errors
      params: new t.Name("params"),
      propertyName: new t.Name("propertyName"),
      message: new t.Name("message"),
      schema: new t.Name("schema"),
      parentSchema: new t.Name("parentSchema")
    };
    function f(p, v, m) {
      const { createErrors: w } = p.it;
      return w === !1 ? (0, t._)`{}` : c(p, v, m);
    }
    function c(p, v, m = {}) {
      const { gen: w, it: T } = p, R = [
        h(T, m),
        y(p, m)
      ];
      return E(p, v, R), w.object(...R);
    }
    function h({ errorPath: p }, { instancePath: v }) {
      const m = v ? (0, t.str)`${p}${(0, i.getErrorPath)(v, i.Type.Str)}` : p;
      return [r.default.instancePath, (0, t.strConcat)(r.default.instancePath, m)];
    }
    function y({ keyword: p, it: { errSchemaPath: v } }, { schemaPath: m, parentSchema: w }) {
      let T = w ? v : (0, t.str)`${v}/${p}`;
      return m && (T = (0, t.str)`${T}${(0, i.getErrorPath)(m, i.Type.Str)}`), [n.schemaPath, T];
    }
    function E(p, { params: v, message: m }, w) {
      const { keyword: T, data: R, schemaValue: _, it: S } = p, { opts: A, propertyName: b, topSchemaRef: x, schemaPath: M } = S;
      w.push([n.keyword, T], [n.params, typeof v == "function" ? v(p) : v || (0, t._)`{}`]), A.messages && w.push([n.message, typeof m == "function" ? m(p) : m]), A.verbose && w.push([n.schema, _], [n.parentSchema, (0, t._)`${x}${M}`], [r.default.data, R]), b && w.push([n.propertyName, b]);
    }
  })(Aa)), Aa;
}
var sc;
function Zy() {
  if (sc) return sr;
  sc = 1, Object.defineProperty(sr, "__esModule", { value: !0 }), sr.boolOrEmptySchema = sr.topBoolOrEmptySchema = void 0;
  const e = ra(), t = Oe(), i = Jt(), r = {
    message: "boolean schema is false"
  };
  function u(d) {
    const { gen: a, schema: l, validateName: n } = d;
    l === !1 ? o(d, !1) : typeof l == "object" && l.$async === !0 ? a.return(i.default.data) : (a.assign((0, t._)`${n}.errors`, null), a.return(!0));
  }
  sr.topBoolOrEmptySchema = u;
  function s(d, a) {
    const { gen: l, schema: n } = d;
    n === !1 ? (l.var(a, !1), o(d)) : l.var(a, !0);
  }
  sr.boolOrEmptySchema = s;
  function o(d, a) {
    const { gen: l, data: n } = d, f = {
      gen: l,
      keyword: "false schema",
      data: n,
      schema: !1,
      schemaCode: !1,
      schemaValue: !1,
      params: {},
      it: d
    };
    (0, e.reportError)(f, r, void 0, a);
  }
  return sr;
}
var Je = {}, or = {}, oc;
function $m() {
  if (oc) return or;
  oc = 1, Object.defineProperty(or, "__esModule", { value: !0 }), or.getRules = or.isJSONType = void 0;
  const e = ["string", "number", "integer", "boolean", "null", "object", "array"], t = new Set(e);
  function i(u) {
    return typeof u == "string" && t.has(u);
  }
  or.isJSONType = i;
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
  return or.getRules = r, or;
}
var kt = {}, uc;
function Im() {
  if (uc) return kt;
  uc = 1, Object.defineProperty(kt, "__esModule", { value: !0 }), kt.shouldUseRule = kt.shouldUseGroup = kt.schemaHasRulesForType = void 0;
  function e({ schema: r, self: u }, s) {
    const o = u.RULES.types[s];
    return o && o !== !0 && t(r, o);
  }
  kt.schemaHasRulesForType = e;
  function t(r, u) {
    return u.rules.some((s) => i(r, s));
  }
  kt.shouldUseGroup = t;
  function i(r, u) {
    var s;
    return r[u.keyword] !== void 0 || ((s = u.definition.implements) === null || s === void 0 ? void 0 : s.some((o) => r[o] !== void 0));
  }
  return kt.shouldUseRule = i, kt;
}
var lc;
function ea() {
  if (lc) return Je;
  lc = 1, Object.defineProperty(Je, "__esModule", { value: !0 }), Je.reportTypeError = Je.checkDataTypes = Je.checkDataType = Je.coerceAndCheckDataType = Je.getJSONTypes = Je.getSchemaTypes = Je.DataType = void 0;
  const e = $m(), t = Im(), i = ra(), r = Oe(), u = Pe();
  var s;
  (function(m) {
    m[m.Correct = 0] = "Correct", m[m.Wrong = 1] = "Wrong";
  })(s || (Je.DataType = s = {}));
  function o(m) {
    const w = d(m.type);
    if (w.includes("null")) {
      if (m.nullable === !1)
        throw new Error("type: null contradicts nullable: false");
    } else {
      if (!w.length && m.nullable !== void 0)
        throw new Error('"nullable" cannot be used without "type"');
      m.nullable === !0 && w.push("null");
    }
    return w;
  }
  Je.getSchemaTypes = o;
  function d(m) {
    const w = Array.isArray(m) ? m : m ? [m] : [];
    if (w.every(e.isJSONType))
      return w;
    throw new Error("type must be JSONType or JSONType[]: " + w.join(","));
  }
  Je.getJSONTypes = d;
  function a(m, w) {
    const { gen: T, data: R, opts: _ } = m, S = n(w, _.coerceTypes), A = w.length > 0 && !(S.length === 0 && w.length === 1 && (0, t.schemaHasRulesForType)(m, w[0]));
    if (A) {
      const b = y(w, R, _.strictNumbers, s.Wrong);
      T.if(b, () => {
        S.length ? f(m, w, S) : p(m);
      });
    }
    return A;
  }
  Je.coerceAndCheckDataType = a;
  const l = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
  function n(m, w) {
    return w ? m.filter((T) => l.has(T) || w === "array" && T === "array") : [];
  }
  function f(m, w, T) {
    const { gen: R, data: _, opts: S } = m, A = R.let("dataType", (0, r._)`typeof ${_}`), b = R.let("coerced", (0, r._)`undefined`);
    S.coerceTypes === "array" && R.if((0, r._)`${A} == 'object' && Array.isArray(${_}) && ${_}.length == 1`, () => R.assign(_, (0, r._)`${_}[0]`).assign(A, (0, r._)`typeof ${_}`).if(y(w, _, S.strictNumbers), () => R.assign(b, _))), R.if((0, r._)`${b} !== undefined`);
    for (const M of T)
      (l.has(M) || M === "array" && S.coerceTypes === "array") && x(M);
    R.else(), p(m), R.endIf(), R.if((0, r._)`${b} !== undefined`, () => {
      R.assign(_, b), c(m, b);
    });
    function x(M) {
      switch (M) {
        case "string":
          R.elseIf((0, r._)`${A} == "number" || ${A} == "boolean"`).assign(b, (0, r._)`"" + ${_}`).elseIf((0, r._)`${_} === null`).assign(b, (0, r._)`""`);
          return;
        case "number":
          R.elseIf((0, r._)`${A} == "boolean" || ${_} === null
              || (${A} == "string" && ${_} && ${_} == +${_})`).assign(b, (0, r._)`+${_}`);
          return;
        case "integer":
          R.elseIf((0, r._)`${A} === "boolean" || ${_} === null
              || (${A} === "string" && ${_} && ${_} == +${_} && !(${_} % 1))`).assign(b, (0, r._)`+${_}`);
          return;
        case "boolean":
          R.elseIf((0, r._)`${_} === "false" || ${_} === 0 || ${_} === null`).assign(b, !1).elseIf((0, r._)`${_} === "true" || ${_} === 1`).assign(b, !0);
          return;
        case "null":
          R.elseIf((0, r._)`${_} === "" || ${_} === 0 || ${_} === false`), R.assign(b, null);
          return;
        case "array":
          R.elseIf((0, r._)`${A} === "string" || ${A} === "number"
              || ${A} === "boolean" || ${_} === null`).assign(b, (0, r._)`[${_}]`);
      }
    }
  }
  function c({ gen: m, parentData: w, parentDataProperty: T }, R) {
    m.if((0, r._)`${w} !== undefined`, () => m.assign((0, r._)`${w}[${T}]`, R));
  }
  function h(m, w, T, R = s.Correct) {
    const _ = R === s.Correct ? r.operators.EQ : r.operators.NEQ;
    let S;
    switch (m) {
      case "null":
        return (0, r._)`${w} ${_} null`;
      case "array":
        S = (0, r._)`Array.isArray(${w})`;
        break;
      case "object":
        S = (0, r._)`${w} && typeof ${w} == "object" && !Array.isArray(${w})`;
        break;
      case "integer":
        S = A((0, r._)`!(${w} % 1) && !isNaN(${w})`);
        break;
      case "number":
        S = A();
        break;
      default:
        return (0, r._)`typeof ${w} ${_} ${m}`;
    }
    return R === s.Correct ? S : (0, r.not)(S);
    function A(b = r.nil) {
      return (0, r.and)((0, r._)`typeof ${w} == "number"`, b, T ? (0, r._)`isFinite(${w})` : r.nil);
    }
  }
  Je.checkDataType = h;
  function y(m, w, T, R) {
    if (m.length === 1)
      return h(m[0], w, T, R);
    let _;
    const S = (0, u.toHash)(m);
    if (S.array && S.object) {
      const A = (0, r._)`typeof ${w} != "object"`;
      _ = S.null ? A : (0, r._)`!${w} || ${A}`, delete S.null, delete S.array, delete S.object;
    } else
      _ = r.nil;
    S.number && delete S.integer;
    for (const A in S)
      _ = (0, r.and)(_, h(A, w, T, R));
    return _;
  }
  Je.checkDataTypes = y;
  const E = {
    message: ({ schema: m }) => `must be ${m}`,
    params: ({ schema: m, schemaValue: w }) => typeof m == "string" ? (0, r._)`{type: ${m}}` : (0, r._)`{type: ${w}}`
  };
  function p(m) {
    const w = v(m);
    (0, i.reportError)(w, E);
  }
  Je.reportTypeError = p;
  function v(m) {
    const { gen: w, data: T, schema: R } = m, _ = (0, u.schemaRefOrVal)(m, R, "type");
    return {
      gen: w,
      keyword: "type",
      data: T,
      schema: R.type,
      schemaCode: _,
      schemaValue: _,
      parentSchema: R,
      params: {},
      it: m
    };
  }
  return Je;
}
var jr = {}, cc;
function e0() {
  if (cc) return jr;
  cc = 1, Object.defineProperty(jr, "__esModule", { value: !0 }), jr.assignDefaults = void 0;
  const e = Oe(), t = Pe();
  function i(u, s) {
    const { properties: o, items: d } = u.schema;
    if (s === "object" && o)
      for (const a in o)
        r(u, a, o[a].default);
    else s === "array" && Array.isArray(d) && d.forEach((a, l) => r(u, l, a.default));
  }
  jr.assignDefaults = i;
  function r(u, s, o) {
    const { gen: d, compositeRule: a, data: l, opts: n } = u;
    if (o === void 0)
      return;
    const f = (0, e._)`${l}${(0, e.getProperty)(s)}`;
    if (a) {
      (0, t.checkStrictMode)(u, `default is ignored for: ${f}`);
      return;
    }
    let c = (0, e._)`${f} === undefined`;
    n.useDefaults === "empty" && (c = (0, e._)`${c} || ${f} === null || ${f} === ""`), d.if(c, (0, e._)`${f} = ${(0, e.stringify)(o)}`);
  }
  return jr;
}
var _t = {}, Le = {}, fc;
function bt() {
  if (fc) return Le;
  fc = 1, Object.defineProperty(Le, "__esModule", { value: !0 }), Le.validateUnion = Le.validateArray = Le.usePattern = Le.callValidateCode = Le.schemaProperties = Le.allSchemaProperties = Le.noPropertyInData = Le.propertyInData = Le.isOwnProperty = Le.hasPropFunc = Le.reportMissingProp = Le.checkMissingProp = Le.checkReportMissingProp = void 0;
  const e = Oe(), t = Pe(), i = Jt(), r = Pe();
  function u(m, w) {
    const { gen: T, data: R, it: _ } = m;
    T.if(n(T, R, w, _.opts.ownProperties), () => {
      m.setParams({ missingProperty: (0, e._)`${w}` }, !0), m.error();
    });
  }
  Le.checkReportMissingProp = u;
  function s({ gen: m, data: w, it: { opts: T } }, R, _) {
    return (0, e.or)(...R.map((S) => (0, e.and)(n(m, w, S, T.ownProperties), (0, e._)`${_} = ${S}`)));
  }
  Le.checkMissingProp = s;
  function o(m, w) {
    m.setParams({ missingProperty: w }, !0), m.error();
  }
  Le.reportMissingProp = o;
  function d(m) {
    return m.scopeValue("func", {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      ref: Object.prototype.hasOwnProperty,
      code: (0, e._)`Object.prototype.hasOwnProperty`
    });
  }
  Le.hasPropFunc = d;
  function a(m, w, T) {
    return (0, e._)`${d(m)}.call(${w}, ${T})`;
  }
  Le.isOwnProperty = a;
  function l(m, w, T, R) {
    const _ = (0, e._)`${w}${(0, e.getProperty)(T)} !== undefined`;
    return R ? (0, e._)`${_} && ${a(m, w, T)}` : _;
  }
  Le.propertyInData = l;
  function n(m, w, T, R) {
    const _ = (0, e._)`${w}${(0, e.getProperty)(T)} === undefined`;
    return R ? (0, e.or)(_, (0, e.not)(a(m, w, T))) : _;
  }
  Le.noPropertyInData = n;
  function f(m) {
    return m ? Object.keys(m).filter((w) => w !== "__proto__") : [];
  }
  Le.allSchemaProperties = f;
  function c(m, w) {
    return f(w).filter((T) => !(0, t.alwaysValidSchema)(m, w[T]));
  }
  Le.schemaProperties = c;
  function h({ schemaCode: m, data: w, it: { gen: T, topSchemaRef: R, schemaPath: _, errorPath: S }, it: A }, b, x, M) {
    const j = M ? (0, e._)`${m}, ${w}, ${R}${_}` : w, X = [
      [i.default.instancePath, (0, e.strConcat)(i.default.instancePath, S)],
      [i.default.parentData, A.parentData],
      [i.default.parentDataProperty, A.parentDataProperty],
      [i.default.rootData, i.default.rootData]
    ];
    A.opts.dynamicRef && X.push([i.default.dynamicAnchors, i.default.dynamicAnchors]);
    const P = (0, e._)`${j}, ${T.object(...X)}`;
    return x !== e.nil ? (0, e._)`${b}.call(${x}, ${P})` : (0, e._)`${b}(${P})`;
  }
  Le.callValidateCode = h;
  const y = (0, e._)`new RegExp`;
  function E({ gen: m, it: { opts: w } }, T) {
    const R = w.unicodeRegExp ? "u" : "", { regExp: _ } = w.code, S = _(T, R);
    return m.scopeValue("pattern", {
      key: S.toString(),
      ref: S,
      code: (0, e._)`${_.code === "new RegExp" ? y : (0, r.useFunc)(m, _)}(${T}, ${R})`
    });
  }
  Le.usePattern = E;
  function p(m) {
    const { gen: w, data: T, keyword: R, it: _ } = m, S = w.name("valid");
    if (_.allErrors) {
      const b = w.let("valid", !0);
      return A(() => w.assign(b, !1)), b;
    }
    return w.var(S, !0), A(() => w.break()), S;
    function A(b) {
      const x = w.const("len", (0, e._)`${T}.length`);
      w.forRange("i", 0, x, (M) => {
        m.subschema({
          keyword: R,
          dataProp: M,
          dataPropType: t.Type.Num
        }, S), w.if((0, e.not)(S), b);
      });
    }
  }
  Le.validateArray = p;
  function v(m) {
    const { gen: w, schema: T, keyword: R, it: _ } = m;
    if (!Array.isArray(T))
      throw new Error("ajv implementation error");
    if (T.some((x) => (0, t.alwaysValidSchema)(_, x)) && !_.opts.unevaluated)
      return;
    const A = w.let("valid", !1), b = w.name("_valid");
    w.block(() => T.forEach((x, M) => {
      const j = m.subschema({
        keyword: R,
        schemaProp: M,
        compositeRule: !0
      }, b);
      w.assign(A, (0, e._)`${A} || ${b}`), m.mergeValidEvaluated(j, b) || w.if((0, e.not)(A));
    })), m.result(A, () => m.reset(), () => m.error(!0));
  }
  return Le.validateUnion = v, Le;
}
var dc;
function t0() {
  if (dc) return _t;
  dc = 1, Object.defineProperty(_t, "__esModule", { value: !0 }), _t.validateKeywordUsage = _t.validSchemaType = _t.funcKeywordCode = _t.macroKeywordCode = void 0;
  const e = Oe(), t = Jt(), i = bt(), r = ra();
  function u(c, h) {
    const { gen: y, keyword: E, schema: p, parentSchema: v, it: m } = c, w = h.macro.call(m.self, p, v, m), T = l(y, E, w);
    m.opts.validateSchema !== !1 && m.self.validateSchema(w, !0);
    const R = y.name("valid");
    c.subschema({
      schema: w,
      schemaPath: e.nil,
      errSchemaPath: `${m.errSchemaPath}/${E}`,
      topSchemaRef: T,
      compositeRule: !0
    }, R), c.pass(R, () => c.error(!0));
  }
  _t.macroKeywordCode = u;
  function s(c, h) {
    var y;
    const { gen: E, keyword: p, schema: v, parentSchema: m, $data: w, it: T } = c;
    a(T, h);
    const R = !w && h.compile ? h.compile.call(T.self, v, m, T) : h.validate, _ = l(E, p, R), S = E.let("valid");
    c.block$data(S, A), c.ok((y = h.valid) !== null && y !== void 0 ? y : S);
    function A() {
      if (h.errors === !1)
        M(), h.modifying && o(c), j(() => c.error());
      else {
        const X = h.async ? b() : x();
        h.modifying && o(c), j(() => d(c, X));
      }
    }
    function b() {
      const X = E.let("ruleErrs", null);
      return E.try(() => M((0, e._)`await `), (P) => E.assign(S, !1).if((0, e._)`${P} instanceof ${T.ValidationError}`, () => E.assign(X, (0, e._)`${P}.errors`), () => E.throw(P))), X;
    }
    function x() {
      const X = (0, e._)`${_}.errors`;
      return E.assign(X, null), M(e.nil), X;
    }
    function M(X = h.async ? (0, e._)`await ` : e.nil) {
      const P = T.opts.passContext ? t.default.this : t.default.self, D = !("compile" in h && !w || h.schema === !1);
      E.assign(S, (0, e._)`${X}${(0, i.callValidateCode)(c, _, P, D)}`, h.modifying);
    }
    function j(X) {
      var P;
      E.if((0, e.not)((P = h.valid) !== null && P !== void 0 ? P : S), X);
    }
  }
  _t.funcKeywordCode = s;
  function o(c) {
    const { gen: h, data: y, it: E } = c;
    h.if(E.parentData, () => h.assign(y, (0, e._)`${E.parentData}[${E.parentDataProperty}]`));
  }
  function d(c, h) {
    const { gen: y } = c;
    y.if((0, e._)`Array.isArray(${h})`, () => {
      y.assign(t.default.vErrors, (0, e._)`${t.default.vErrors} === null ? ${h} : ${t.default.vErrors}.concat(${h})`).assign(t.default.errors, (0, e._)`${t.default.vErrors}.length`), (0, r.extendErrors)(c);
    }, () => c.error());
  }
  function a({ schemaEnv: c }, h) {
    if (h.async && !c.$async)
      throw new Error("async keyword in sync schema");
  }
  function l(c, h, y) {
    if (y === void 0)
      throw new Error(`keyword "${h}" failed to compile`);
    return c.scopeValue("keyword", typeof y == "function" ? { ref: y } : { ref: y, code: (0, e.stringify)(y) });
  }
  function n(c, h, y = !1) {
    return !h.length || h.some((E) => E === "array" ? Array.isArray(c) : E === "object" ? c && typeof c == "object" && !Array.isArray(c) : typeof c == E || y && typeof c > "u");
  }
  _t.validSchemaType = n;
  function f({ schema: c, opts: h, self: y, errSchemaPath: E }, p, v) {
    if (Array.isArray(p.keyword) ? !p.keyword.includes(v) : p.keyword !== v)
      throw new Error("ajv implementation error");
    const m = p.dependencies;
    if (m?.some((w) => !Object.prototype.hasOwnProperty.call(c, w)))
      throw new Error(`parent schema must have dependencies of ${v}: ${m.join(",")}`);
    if (p.validateSchema && !p.validateSchema(c[v])) {
      const T = `keyword "${v}" value is invalid at path "${E}": ` + y.errorsText(p.validateSchema.errors);
      if (h.validateSchema === "log")
        y.logger.error(T);
      else
        throw new Error(T);
    }
  }
  return _t.validateKeywordUsage = f, _t;
}
var Ft = {}, hc;
function r0() {
  if (hc) return Ft;
  hc = 1, Object.defineProperty(Ft, "__esModule", { value: !0 }), Ft.extendSubschemaMode = Ft.extendSubschemaData = Ft.getSubschema = void 0;
  const e = Oe(), t = Pe();
  function i(s, { keyword: o, schemaProp: d, schema: a, schemaPath: l, errSchemaPath: n, topSchemaRef: f }) {
    if (o !== void 0 && a !== void 0)
      throw new Error('both "keyword" and "schema" passed, only one allowed');
    if (o !== void 0) {
      const c = s.schema[o];
      return d === void 0 ? {
        schema: c,
        schemaPath: (0, e._)`${s.schemaPath}${(0, e.getProperty)(o)}`,
        errSchemaPath: `${s.errSchemaPath}/${o}`
      } : {
        schema: c[d],
        schemaPath: (0, e._)`${s.schemaPath}${(0, e.getProperty)(o)}${(0, e.getProperty)(d)}`,
        errSchemaPath: `${s.errSchemaPath}/${o}/${(0, t.escapeFragment)(d)}`
      };
    }
    if (a !== void 0) {
      if (l === void 0 || n === void 0 || f === void 0)
        throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
      return {
        schema: a,
        schemaPath: l,
        topSchemaRef: f,
        errSchemaPath: n
      };
    }
    throw new Error('either "keyword" or "schema" must be passed');
  }
  Ft.getSubschema = i;
  function r(s, o, { dataProp: d, dataPropType: a, data: l, dataTypes: n, propertyName: f }) {
    if (l !== void 0 && d !== void 0)
      throw new Error('both "data" and "dataProp" passed, only one allowed');
    const { gen: c } = o;
    if (d !== void 0) {
      const { errorPath: y, dataPathArr: E, opts: p } = o, v = c.let("data", (0, e._)`${o.data}${(0, e.getProperty)(d)}`, !0);
      h(v), s.errorPath = (0, e.str)`${y}${(0, t.getErrorPath)(d, a, p.jsPropertySyntax)}`, s.parentDataProperty = (0, e._)`${d}`, s.dataPathArr = [...E, s.parentDataProperty];
    }
    if (l !== void 0) {
      const y = l instanceof e.Name ? l : c.let("data", l, !0);
      h(y), f !== void 0 && (s.propertyName = f);
    }
    n && (s.dataTypes = n);
    function h(y) {
      s.data = y, s.dataLevel = o.dataLevel + 1, s.dataTypes = [], o.definedProperties = /* @__PURE__ */ new Set(), s.parentData = o.data, s.dataNames = [...o.dataNames, y];
    }
  }
  Ft.extendSubschemaData = r;
  function u(s, { jtdDiscriminator: o, jtdMetadata: d, compositeRule: a, createErrors: l, allErrors: n }) {
    a !== void 0 && (s.compositeRule = a), l !== void 0 && (s.createErrors = l), n !== void 0 && (s.allErrors = n), s.jtdDiscriminator = o, s.jtdMetadata = d;
  }
  return Ft.extendSubschemaMode = u, Ft;
}
var rt = {}, Ia, pc;
function Pm() {
  return pc || (pc = 1, Ia = function e(t, i) {
    if (t === i) return !0;
    if (t && i && typeof t == "object" && typeof i == "object") {
      if (t.constructor !== i.constructor) return !1;
      var r, u, s;
      if (Array.isArray(t)) {
        if (r = t.length, r != i.length) return !1;
        for (u = r; u-- !== 0; )
          if (!e(t[u], i[u])) return !1;
        return !0;
      }
      if (t.constructor === RegExp) return t.source === i.source && t.flags === i.flags;
      if (t.valueOf !== Object.prototype.valueOf) return t.valueOf() === i.valueOf();
      if (t.toString !== Object.prototype.toString) return t.toString() === i.toString();
      if (s = Object.keys(t), r = s.length, r !== Object.keys(i).length) return !1;
      for (u = r; u-- !== 0; )
        if (!Object.prototype.hasOwnProperty.call(i, s[u])) return !1;
      for (u = r; u-- !== 0; ) {
        var o = s[u];
        if (!e(t[o], i[o])) return !1;
      }
      return !0;
    }
    return t !== t && i !== i;
  }), Ia;
}
var Pa = { exports: {} }, mc;
function n0() {
  if (mc) return Pa.exports;
  mc = 1;
  var e = Pa.exports = function(r, u, s) {
    typeof u == "function" && (s = u, u = {}), s = u.cb || s;
    var o = typeof s == "function" ? s : s.pre || function() {
    }, d = s.post || function() {
    };
    t(u, o, d, r, "", r);
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
  function t(r, u, s, o, d, a, l, n, f, c) {
    if (o && typeof o == "object" && !Array.isArray(o)) {
      u(o, d, a, l, n, f, c);
      for (var h in o) {
        var y = o[h];
        if (Array.isArray(y)) {
          if (h in e.arrayKeywords)
            for (var E = 0; E < y.length; E++)
              t(r, u, s, y[E], d + "/" + h + "/" + E, a, d, h, o, E);
        } else if (h in e.propsKeywords) {
          if (y && typeof y == "object")
            for (var p in y)
              t(r, u, s, y[p], d + "/" + h + "/" + i(p), a, d, h, o, p);
        } else (h in e.keywords || r.allKeys && !(h in e.skipKeywords)) && t(r, u, s, y, d + "/" + h, a, d, h, o);
      }
      s(o, d, a, l, n, f, c);
    }
  }
  function i(r) {
    return r.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  return Pa.exports;
}
var gc;
function na() {
  if (gc) return rt;
  gc = 1, Object.defineProperty(rt, "__esModule", { value: !0 }), rt.getSchemaRefs = rt.resolveUrl = rt.normalizeId = rt._getFullPath = rt.getFullPath = rt.inlineRef = void 0;
  const e = Pe(), t = Pm(), i = n0(), r = /* @__PURE__ */ new Set([
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
  function u(E, p = !0) {
    return typeof E == "boolean" ? !0 : p === !0 ? !o(E) : p ? d(E) <= p : !1;
  }
  rt.inlineRef = u;
  const s = /* @__PURE__ */ new Set([
    "$ref",
    "$recursiveRef",
    "$recursiveAnchor",
    "$dynamicRef",
    "$dynamicAnchor"
  ]);
  function o(E) {
    for (const p in E) {
      if (s.has(p))
        return !0;
      const v = E[p];
      if (Array.isArray(v) && v.some(o) || typeof v == "object" && o(v))
        return !0;
    }
    return !1;
  }
  function d(E) {
    let p = 0;
    for (const v in E) {
      if (v === "$ref")
        return 1 / 0;
      if (p++, !r.has(v) && (typeof E[v] == "object" && (0, e.eachItem)(E[v], (m) => p += d(m)), p === 1 / 0))
        return 1 / 0;
    }
    return p;
  }
  function a(E, p = "", v) {
    v !== !1 && (p = f(p));
    const m = E.parse(p);
    return l(E, m);
  }
  rt.getFullPath = a;
  function l(E, p) {
    return E.serialize(p).split("#")[0] + "#";
  }
  rt._getFullPath = l;
  const n = /#\/?$/;
  function f(E) {
    return E ? E.replace(n, "") : "";
  }
  rt.normalizeId = f;
  function c(E, p, v) {
    return v = f(v), E.resolve(p, v);
  }
  rt.resolveUrl = c;
  const h = /^[a-z_][-a-z0-9._]*$/i;
  function y(E, p) {
    if (typeof E == "boolean")
      return {};
    const { schemaId: v, uriResolver: m } = this.opts, w = f(E[v] || p), T = { "": w }, R = a(m, w, !1), _ = {}, S = /* @__PURE__ */ new Set();
    return i(E, { allKeys: !0 }, (x, M, j, X) => {
      if (X === void 0)
        return;
      const P = R + M;
      let D = T[X];
      typeof x[v] == "string" && (D = W.call(this, x[v])), L.call(this, x.$anchor), L.call(this, x.$dynamicAnchor), T[M] = D;
      function W(F) {
        const G = this.opts.uriResolver.resolve;
        if (F = f(D ? G(D, F) : F), S.has(F))
          throw b(F);
        S.add(F);
        let k = this.refs[F];
        return typeof k == "string" && (k = this.refs[k]), typeof k == "object" ? A(x, k.schema, F) : F !== f(P) && (F[0] === "#" ? (A(x, _[F], F), _[F] = x) : this.refs[F] = P), F;
      }
      function L(F) {
        if (typeof F == "string") {
          if (!h.test(F))
            throw new Error(`invalid anchor "${F}"`);
          W.call(this, `#${F}`);
        }
      }
    }), _;
    function A(x, M, j) {
      if (M !== void 0 && !t(x, M))
        throw b(j);
    }
    function b(x) {
      return new Error(`reference "${x}" resolves to more than one schema`);
    }
  }
  return rt.getSchemaRefs = y, rt;
}
var yc;
function ia() {
  if (yc) return Lt;
  yc = 1, Object.defineProperty(Lt, "__esModule", { value: !0 }), Lt.getData = Lt.KeywordCxt = Lt.validateFunctionCode = void 0;
  const e = Zy(), t = ea(), i = Im(), r = ea(), u = e0(), s = t0(), o = r0(), d = Oe(), a = Jt(), l = na(), n = Pe(), f = ra();
  function c(B) {
    if (R(B) && (S(B), T(B))) {
      p(B);
      return;
    }
    h(B, () => (0, e.topBoolOrEmptySchema)(B));
  }
  Lt.validateFunctionCode = c;
  function h({ gen: B, validateName: Y, schema: Z, schemaEnv: re, opts: le }, Se) {
    le.code.es5 ? B.func(Y, (0, d._)`${a.default.data}, ${a.default.valCxt}`, re.$async, () => {
      B.code((0, d._)`"use strict"; ${m(Z, le)}`), E(B, le), B.code(Se);
    }) : B.func(Y, (0, d._)`${a.default.data}, ${y(le)}`, re.$async, () => B.code(m(Z, le)).code(Se));
  }
  function y(B) {
    return (0, d._)`{${a.default.instancePath}="", ${a.default.parentData}, ${a.default.parentDataProperty}, ${a.default.rootData}=${a.default.data}${B.dynamicRef ? (0, d._)`, ${a.default.dynamicAnchors}={}` : d.nil}}={}`;
  }
  function E(B, Y) {
    B.if(a.default.valCxt, () => {
      B.var(a.default.instancePath, (0, d._)`${a.default.valCxt}.${a.default.instancePath}`), B.var(a.default.parentData, (0, d._)`${a.default.valCxt}.${a.default.parentData}`), B.var(a.default.parentDataProperty, (0, d._)`${a.default.valCxt}.${a.default.parentDataProperty}`), B.var(a.default.rootData, (0, d._)`${a.default.valCxt}.${a.default.rootData}`), Y.dynamicRef && B.var(a.default.dynamicAnchors, (0, d._)`${a.default.valCxt}.${a.default.dynamicAnchors}`);
    }, () => {
      B.var(a.default.instancePath, (0, d._)`""`), B.var(a.default.parentData, (0, d._)`undefined`), B.var(a.default.parentDataProperty, (0, d._)`undefined`), B.var(a.default.rootData, a.default.data), Y.dynamicRef && B.var(a.default.dynamicAnchors, (0, d._)`{}`);
    });
  }
  function p(B) {
    const { schema: Y, opts: Z, gen: re } = B;
    h(B, () => {
      Z.$comment && Y.$comment && X(B), x(B), re.let(a.default.vErrors, null), re.let(a.default.errors, 0), Z.unevaluated && v(B), A(B), P(B);
    });
  }
  function v(B) {
    const { gen: Y, validateName: Z } = B;
    B.evaluated = Y.const("evaluated", (0, d._)`${Z}.evaluated`), Y.if((0, d._)`${B.evaluated}.dynamicProps`, () => Y.assign((0, d._)`${B.evaluated}.props`, (0, d._)`undefined`)), Y.if((0, d._)`${B.evaluated}.dynamicItems`, () => Y.assign((0, d._)`${B.evaluated}.items`, (0, d._)`undefined`));
  }
  function m(B, Y) {
    const Z = typeof B == "object" && B[Y.schemaId];
    return Z && (Y.code.source || Y.code.process) ? (0, d._)`/*# sourceURL=${Z} */` : d.nil;
  }
  function w(B, Y) {
    if (R(B) && (S(B), T(B))) {
      _(B, Y);
      return;
    }
    (0, e.boolOrEmptySchema)(B, Y);
  }
  function T({ schema: B, self: Y }) {
    if (typeof B == "boolean")
      return !B;
    for (const Z in B)
      if (Y.RULES.all[Z])
        return !0;
    return !1;
  }
  function R(B) {
    return typeof B.schema != "boolean";
  }
  function _(B, Y) {
    const { schema: Z, gen: re, opts: le } = B;
    le.$comment && Z.$comment && X(B), M(B), j(B);
    const Se = re.const("_errs", a.default.errors);
    A(B, Se), re.var(Y, (0, d._)`${Se} === ${a.default.errors}`);
  }
  function S(B) {
    (0, n.checkUnknownRules)(B), b(B);
  }
  function A(B, Y) {
    if (B.opts.jtd)
      return W(B, [], !1, Y);
    const Z = (0, t.getSchemaTypes)(B.schema), re = (0, t.coerceAndCheckDataType)(B, Z);
    W(B, Z, !re, Y);
  }
  function b(B) {
    const { schema: Y, errSchemaPath: Z, opts: re, self: le } = B;
    Y.$ref && re.ignoreKeywordsWithRef && (0, n.schemaHasRulesButRef)(Y, le.RULES) && le.logger.warn(`$ref: keywords ignored in schema at path "${Z}"`);
  }
  function x(B) {
    const { schema: Y, opts: Z } = B;
    Y.default !== void 0 && Z.useDefaults && Z.strictSchema && (0, n.checkStrictMode)(B, "default is ignored in the schema root");
  }
  function M(B) {
    const Y = B.schema[B.opts.schemaId];
    Y && (B.baseId = (0, l.resolveUrl)(B.opts.uriResolver, B.baseId, Y));
  }
  function j(B) {
    if (B.schema.$async && !B.schemaEnv.$async)
      throw new Error("async schema in sync schema");
  }
  function X({ gen: B, schemaEnv: Y, schema: Z, errSchemaPath: re, opts: le }) {
    const Se = Z.$comment;
    if (le.$comment === !0)
      B.code((0, d._)`${a.default.self}.logger.log(${Se})`);
    else if (typeof le.$comment == "function") {
      const Te = (0, d.str)`${re}/$comment`, Fe = B.scopeValue("root", { ref: Y.root });
      B.code((0, d._)`${a.default.self}.opts.$comment(${Se}, ${Te}, ${Fe}.schema)`);
    }
  }
  function P(B) {
    const { gen: Y, schemaEnv: Z, validateName: re, ValidationError: le, opts: Se } = B;
    Z.$async ? Y.if((0, d._)`${a.default.errors} === 0`, () => Y.return(a.default.data), () => Y.throw((0, d._)`new ${le}(${a.default.vErrors})`)) : (Y.assign((0, d._)`${re}.errors`, a.default.vErrors), Se.unevaluated && D(B), Y.return((0, d._)`${a.default.errors} === 0`));
  }
  function D({ gen: B, evaluated: Y, props: Z, items: re }) {
    Z instanceof d.Name && B.assign((0, d._)`${Y}.props`, Z), re instanceof d.Name && B.assign((0, d._)`${Y}.items`, re);
  }
  function W(B, Y, Z, re) {
    const { gen: le, schema: Se, data: Te, allErrors: Fe, opts: He, self: Ge } = B, { RULES: ke } = Ge;
    if (Se.$ref && (He.ignoreKeywordsWithRef || !(0, n.schemaHasRulesButRef)(Se, ke))) {
      le.block(() => N(B, "$ref", ke.all.$ref.definition));
      return;
    }
    He.jtd || F(B, Y), le.block(() => {
      for (const ee of ke.rules)
        g(ee);
      g(ke.post);
    });
    function g(ee) {
      (0, i.shouldUseGroup)(Se, ee) && (ee.type ? (le.if((0, r.checkDataType)(ee.type, Te, He.strictNumbers)), L(B, ee), Y.length === 1 && Y[0] === ee.type && Z && (le.else(), (0, r.reportTypeError)(B)), le.endIf()) : L(B, ee), Fe || le.if((0, d._)`${a.default.errors} === ${re || 0}`));
    }
  }
  function L(B, Y) {
    const { gen: Z, schema: re, opts: { useDefaults: le } } = B;
    le && (0, u.assignDefaults)(B, Y.type), Z.block(() => {
      for (const Se of Y.rules)
        (0, i.shouldUseRule)(re, Se) && N(B, Se.keyword, Se.definition, Y.type);
    });
  }
  function F(B, Y) {
    B.schemaEnv.meta || !B.opts.strictTypes || (G(B, Y), B.opts.allowUnionTypes || k(B, Y), q(B, B.dataTypes));
  }
  function G(B, Y) {
    if (Y.length) {
      if (!B.dataTypes.length) {
        B.dataTypes = Y;
        return;
      }
      Y.forEach((Z) => {
        H(B.dataTypes, Z) || I(B, `type "${Z}" not allowed by context "${B.dataTypes.join(",")}"`);
      }), $(B, Y);
    }
  }
  function k(B, Y) {
    Y.length > 1 && !(Y.length === 2 && Y.includes("null")) && I(B, "use allowUnionTypes to allow union type keyword");
  }
  function q(B, Y) {
    const Z = B.self.RULES.all;
    for (const re in Z) {
      const le = Z[re];
      if (typeof le == "object" && (0, i.shouldUseRule)(B.schema, le)) {
        const { type: Se } = le.definition;
        Se.length && !Se.some((Te) => z(Y, Te)) && I(B, `missing type "${Se.join(",")}" for keyword "${re}"`);
      }
    }
  }
  function z(B, Y) {
    return B.includes(Y) || Y === "number" && B.includes("integer");
  }
  function H(B, Y) {
    return B.includes(Y) || Y === "integer" && B.includes("number");
  }
  function $(B, Y) {
    const Z = [];
    for (const re of B.dataTypes)
      H(Y, re) ? Z.push(re) : Y.includes("integer") && re === "number" && Z.push("integer");
    B.dataTypes = Z;
  }
  function I(B, Y) {
    const Z = B.schemaEnv.baseId + B.errSchemaPath;
    Y += ` at "${Z}" (strictTypes)`, (0, n.checkStrictMode)(B, Y, B.opts.strictTypes);
  }
  class K {
    constructor(Y, Z, re) {
      if ((0, s.validateKeywordUsage)(Y, Z, re), this.gen = Y.gen, this.allErrors = Y.allErrors, this.keyword = re, this.data = Y.data, this.schema = Y.schema[re], this.$data = Z.$data && Y.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, n.schemaRefOrVal)(Y, this.schema, re, this.$data), this.schemaType = Z.schemaType, this.parentSchema = Y.schema, this.params = {}, this.it = Y, this.def = Z, this.$data)
        this.schemaCode = Y.gen.const("vSchema", V(this.$data, Y));
      else if (this.schemaCode = this.schemaValue, !(0, s.validSchemaType)(this.schema, Z.schemaType, Z.allowUndefined))
        throw new Error(`${re} value must be ${JSON.stringify(Z.schemaType)}`);
      ("code" in Z ? Z.trackErrors : Z.errors !== !1) && (this.errsCount = Y.gen.const("_errs", a.default.errors));
    }
    result(Y, Z, re) {
      this.failResult((0, d.not)(Y), Z, re);
    }
    failResult(Y, Z, re) {
      this.gen.if(Y), re ? re() : this.error(), Z ? (this.gen.else(), Z(), this.allErrors && this.gen.endIf()) : this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    pass(Y, Z) {
      this.failResult((0, d.not)(Y), void 0, Z);
    }
    fail(Y) {
      if (Y === void 0) {
        this.error(), this.allErrors || this.gen.if(!1);
        return;
      }
      this.gen.if(Y), this.error(), this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    fail$data(Y) {
      if (!this.$data)
        return this.fail(Y);
      const { schemaCode: Z } = this;
      this.fail((0, d._)`${Z} !== undefined && (${(0, d.or)(this.invalid$data(), Y)})`);
    }
    error(Y, Z, re) {
      if (Z) {
        this.setParams(Z), this._error(Y, re), this.setParams({});
        return;
      }
      this._error(Y, re);
    }
    _error(Y, Z) {
      (Y ? f.reportExtraError : f.reportError)(this, this.def.error, Z);
    }
    $dataError() {
      (0, f.reportError)(this, this.def.$dataError || f.keyword$DataError);
    }
    reset() {
      if (this.errsCount === void 0)
        throw new Error('add "trackErrors" to keyword definition');
      (0, f.resetErrorsCount)(this.gen, this.errsCount);
    }
    ok(Y) {
      this.allErrors || this.gen.if(Y);
    }
    setParams(Y, Z) {
      Z ? Object.assign(this.params, Y) : this.params = Y;
    }
    block$data(Y, Z, re = d.nil) {
      this.gen.block(() => {
        this.check$data(Y, re), Z();
      });
    }
    check$data(Y = d.nil, Z = d.nil) {
      if (!this.$data)
        return;
      const { gen: re, schemaCode: le, schemaType: Se, def: Te } = this;
      re.if((0, d.or)((0, d._)`${le} === undefined`, Z)), Y !== d.nil && re.assign(Y, !0), (Se.length || Te.validateSchema) && (re.elseIf(this.invalid$data()), this.$dataError(), Y !== d.nil && re.assign(Y, !1)), re.else();
    }
    invalid$data() {
      const { gen: Y, schemaCode: Z, schemaType: re, def: le, it: Se } = this;
      return (0, d.or)(Te(), Fe());
      function Te() {
        if (re.length) {
          if (!(Z instanceof d.Name))
            throw new Error("ajv implementation error");
          const He = Array.isArray(re) ? re : [re];
          return (0, d._)`${(0, r.checkDataTypes)(He, Z, Se.opts.strictNumbers, r.DataType.Wrong)}`;
        }
        return d.nil;
      }
      function Fe() {
        if (le.validateSchema) {
          const He = Y.scopeValue("validate$data", { ref: le.validateSchema });
          return (0, d._)`!${He}(${Z})`;
        }
        return d.nil;
      }
    }
    subschema(Y, Z) {
      const re = (0, o.getSubschema)(this.it, Y);
      (0, o.extendSubschemaData)(re, this.it, Y), (0, o.extendSubschemaMode)(re, Y);
      const le = { ...this.it, ...re, items: void 0, props: void 0 };
      return w(le, Z), le;
    }
    mergeEvaluated(Y, Z) {
      const { it: re, gen: le } = this;
      re.opts.unevaluated && (re.props !== !0 && Y.props !== void 0 && (re.props = n.mergeEvaluated.props(le, Y.props, re.props, Z)), re.items !== !0 && Y.items !== void 0 && (re.items = n.mergeEvaluated.items(le, Y.items, re.items, Z)));
    }
    mergeValidEvaluated(Y, Z) {
      const { it: re, gen: le } = this;
      if (re.opts.unevaluated && (re.props !== !0 || re.items !== !0))
        return le.if(Z, () => this.mergeEvaluated(Y, d.Name)), !0;
    }
  }
  Lt.KeywordCxt = K;
  function N(B, Y, Z, re) {
    const le = new K(B, Z, Y);
    "code" in Z ? Z.code(le, re) : le.$data && Z.validate ? (0, s.funcKeywordCode)(le, Z) : "macro" in Z ? (0, s.macroKeywordCode)(le, Z) : (Z.compile || Z.validate) && (0, s.funcKeywordCode)(le, Z);
  }
  const O = /^\/(?:[^~]|~0|~1)*$/, Q = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
  function V(B, { dataLevel: Y, dataNames: Z, dataPathArr: re }) {
    let le, Se;
    if (B === "")
      return a.default.rootData;
    if (B[0] === "/") {
      if (!O.test(B))
        throw new Error(`Invalid JSON-pointer: ${B}`);
      le = B, Se = a.default.rootData;
    } else {
      const Ge = Q.exec(B);
      if (!Ge)
        throw new Error(`Invalid JSON-pointer: ${B}`);
      const ke = +Ge[1];
      if (le = Ge[2], le === "#") {
        if (ke >= Y)
          throw new Error(He("property/index", ke));
        return re[Y - ke];
      }
      if (ke > Y)
        throw new Error(He("data", ke));
      if (Se = Z[Y - ke], !le)
        return Se;
    }
    let Te = Se;
    const Fe = le.split("/");
    for (const Ge of Fe)
      Ge && (Se = (0, d._)`${Se}${(0, d.getProperty)((0, n.unescapeJsonPointer)(Ge))}`, Te = (0, d._)`${Te} && ${Se}`);
    return Te;
    function He(Ge, ke) {
      return `Cannot access ${Ge} ${ke} levels up, current level is ${Y}`;
    }
  }
  return Lt.getData = V, Lt;
}
var Kn = {}, Ec;
function ju() {
  if (Ec) return Kn;
  Ec = 1, Object.defineProperty(Kn, "__esModule", { value: !0 });
  class e extends Error {
    constructor(i) {
      super("validation failed"), this.errors = i, this.ajv = this.validation = !0;
    }
  }
  return Kn.default = e, Kn;
}
var Jn = {}, vc;
function aa() {
  if (vc) return Jn;
  vc = 1, Object.defineProperty(Jn, "__esModule", { value: !0 });
  const e = na();
  class t extends Error {
    constructor(r, u, s, o) {
      super(o || `can't resolve reference ${s} from id ${u}`), this.missingRef = (0, e.resolveUrl)(r, u, s), this.missingSchema = (0, e.normalizeId)((0, e.getFullPath)(r, this.missingRef));
    }
  }
  return Jn.default = t, Jn;
}
var ct = {}, _c;
function Gu() {
  if (_c) return ct;
  _c = 1, Object.defineProperty(ct, "__esModule", { value: !0 }), ct.resolveSchema = ct.getCompilingSchema = ct.resolveRef = ct.compileSchema = ct.SchemaEnv = void 0;
  const e = Oe(), t = ju(), i = Jt(), r = na(), u = Pe(), s = ia();
  class o {
    constructor(v) {
      var m;
      this.refs = {}, this.dynamicAnchors = {};
      let w;
      typeof v.schema == "object" && (w = v.schema), this.schema = v.schema, this.schemaId = v.schemaId, this.root = v.root || this, this.baseId = (m = v.baseId) !== null && m !== void 0 ? m : (0, r.normalizeId)(w?.[v.schemaId || "$id"]), this.schemaPath = v.schemaPath, this.localRefs = v.localRefs, this.meta = v.meta, this.$async = w?.$async, this.refs = {};
    }
  }
  ct.SchemaEnv = o;
  function d(p) {
    const v = n.call(this, p);
    if (v)
      return v;
    const m = (0, r.getFullPath)(this.opts.uriResolver, p.root.baseId), { es5: w, lines: T } = this.opts.code, { ownProperties: R } = this.opts, _ = new e.CodeGen(this.scope, { es5: w, lines: T, ownProperties: R });
    let S;
    p.$async && (S = _.scopeValue("Error", {
      ref: t.default,
      code: (0, e._)`require("ajv/dist/runtime/validation_error").default`
    }));
    const A = _.scopeName("validate");
    p.validateName = A;
    const b = {
      gen: _,
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
      topSchemaRef: _.scopeValue("schema", this.opts.code.source === !0 ? { ref: p.schema, code: (0, e.stringify)(p.schema) } : { ref: p.schema }),
      validateName: A,
      ValidationError: S,
      schema: p.schema,
      schemaEnv: p,
      rootId: m,
      baseId: p.baseId || m,
      schemaPath: e.nil,
      errSchemaPath: p.schemaPath || (this.opts.jtd ? "" : "#"),
      errorPath: (0, e._)`""`,
      opts: this.opts,
      self: this
    };
    let x;
    try {
      this._compilations.add(p), (0, s.validateFunctionCode)(b), _.optimize(this.opts.code.optimize);
      const M = _.toString();
      x = `${_.scopeRefs(i.default.scope)}return ${M}`, this.opts.code.process && (x = this.opts.code.process(x, p));
      const X = new Function(`${i.default.self}`, `${i.default.scope}`, x)(this, this.scope.get());
      if (this.scope.value(A, { ref: X }), X.errors = null, X.schema = p.schema, X.schemaEnv = p, p.$async && (X.$async = !0), this.opts.code.source === !0 && (X.source = { validateName: A, validateCode: M, scopeValues: _._values }), this.opts.unevaluated) {
        const { props: P, items: D } = b;
        X.evaluated = {
          props: P instanceof e.Name ? void 0 : P,
          items: D instanceof e.Name ? void 0 : D,
          dynamicProps: P instanceof e.Name,
          dynamicItems: D instanceof e.Name
        }, X.source && (X.source.evaluated = (0, e.stringify)(X.evaluated));
      }
      return p.validate = X, p;
    } catch (M) {
      throw delete p.validate, delete p.validateName, x && this.logger.error("Error compiling schema, function code:", x), M;
    } finally {
      this._compilations.delete(p);
    }
  }
  ct.compileSchema = d;
  function a(p, v, m) {
    var w;
    m = (0, r.resolveUrl)(this.opts.uriResolver, v, m);
    const T = p.refs[m];
    if (T)
      return T;
    let R = c.call(this, p, m);
    if (R === void 0) {
      const _ = (w = p.localRefs) === null || w === void 0 ? void 0 : w[m], { schemaId: S } = this.opts;
      _ && (R = new o({ schema: _, schemaId: S, root: p, baseId: v }));
    }
    if (R !== void 0)
      return p.refs[m] = l.call(this, R);
  }
  ct.resolveRef = a;
  function l(p) {
    return (0, r.inlineRef)(p.schema, this.opts.inlineRefs) ? p.schema : p.validate ? p : d.call(this, p);
  }
  function n(p) {
    for (const v of this._compilations)
      if (f(v, p))
        return v;
  }
  ct.getCompilingSchema = n;
  function f(p, v) {
    return p.schema === v.schema && p.root === v.root && p.baseId === v.baseId;
  }
  function c(p, v) {
    let m;
    for (; typeof (m = this.refs[v]) == "string"; )
      v = m;
    return m || this.schemas[v] || h.call(this, p, v);
  }
  function h(p, v) {
    const m = this.opts.uriResolver.parse(v), w = (0, r._getFullPath)(this.opts.uriResolver, m);
    let T = (0, r.getFullPath)(this.opts.uriResolver, p.baseId, void 0);
    if (Object.keys(p.schema).length > 0 && w === T)
      return E.call(this, m, p);
    const R = (0, r.normalizeId)(w), _ = this.refs[R] || this.schemas[R];
    if (typeof _ == "string") {
      const S = h.call(this, p, _);
      return typeof S?.schema != "object" ? void 0 : E.call(this, m, S);
    }
    if (typeof _?.schema == "object") {
      if (_.validate || d.call(this, _), R === (0, r.normalizeId)(v)) {
        const { schema: S } = _, { schemaId: A } = this.opts, b = S[A];
        return b && (T = (0, r.resolveUrl)(this.opts.uriResolver, T, b)), new o({ schema: S, schemaId: A, root: p, baseId: T });
      }
      return E.call(this, m, _);
    }
  }
  ct.resolveSchema = h;
  const y = /* @__PURE__ */ new Set([
    "properties",
    "patternProperties",
    "enum",
    "dependencies",
    "definitions"
  ]);
  function E(p, { baseId: v, schema: m, root: w }) {
    var T;
    if (((T = p.fragment) === null || T === void 0 ? void 0 : T[0]) !== "/")
      return;
    for (const S of p.fragment.slice(1).split("/")) {
      if (typeof m == "boolean")
        return;
      const A = m[(0, u.unescapeFragment)(S)];
      if (A === void 0)
        return;
      m = A;
      const b = typeof m == "object" && m[this.opts.schemaId];
      !y.has(S) && b && (v = (0, r.resolveUrl)(this.opts.uriResolver, v, b));
    }
    let R;
    if (typeof m != "boolean" && m.$ref && !(0, u.schemaHasRulesButRef)(m, this.RULES)) {
      const S = (0, r.resolveUrl)(this.opts.uriResolver, v, m.$ref);
      R = h.call(this, w, S);
    }
    const { schemaId: _ } = this.opts;
    if (R = R || new o({ schema: m, schemaId: _, root: w, baseId: v }), R.schema !== R.root.schema)
      return R;
  }
  return ct;
}
const i0 = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", a0 = "Meta-schema for $data reference (JSON AnySchema extension proposal)", s0 = "object", o0 = ["$data"], u0 = { $data: { type: "string", anyOf: [{ format: "relative-json-pointer" }, { format: "json-pointer" }] } }, l0 = !1, c0 = {
  $id: i0,
  description: a0,
  type: s0,
  required: o0,
  properties: u0,
  additionalProperties: l0
};
var Qn = {}, Gr = { exports: {} }, Ca, wc;
function Cm() {
  if (wc) return Ca;
  wc = 1;
  const e = RegExp.prototype.test.bind(/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu), t = RegExp.prototype.test.bind(/^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/u);
  function i(c) {
    let h = "", y = 0, E = 0;
    for (E = 0; E < c.length; E++)
      if (y = c[E].charCodeAt(0), y !== 48) {
        if (!(y >= 48 && y <= 57 || y >= 65 && y <= 70 || y >= 97 && y <= 102))
          return "";
        h += c[E];
        break;
      }
    for (E += 1; E < c.length; E++) {
      if (y = c[E].charCodeAt(0), !(y >= 48 && y <= 57 || y >= 65 && y <= 70 || y >= 97 && y <= 102))
        return "";
      h += c[E];
    }
    return h;
  }
  const r = RegExp.prototype.test.bind(/[^!"$&'()*+,\-.;=_`a-z{}~]/u);
  function u(c) {
    return c.length = 0, !0;
  }
  function s(c, h, y) {
    if (c.length) {
      const E = i(c);
      if (E !== "")
        h.push(E);
      else
        return y.error = !0, !1;
      c.length = 0;
    }
    return !0;
  }
  function o(c) {
    let h = 0;
    const y = { error: !1, address: "", zone: "" }, E = [], p = [];
    let v = !1, m = !1, w = s;
    for (let T = 0; T < c.length; T++) {
      const R = c[T];
      if (!(R === "[" || R === "]"))
        if (R === ":") {
          if (v === !0 && (m = !0), !w(p, E, y))
            break;
          if (++h > 7) {
            y.error = !0;
            break;
          }
          T > 0 && c[T - 1] === ":" && (v = !0), E.push(":");
          continue;
        } else if (R === "%") {
          if (!w(p, E, y))
            break;
          w = u;
        } else {
          p.push(R);
          continue;
        }
    }
    return p.length && (w === u ? y.zone = p.join("") : m ? E.push(p.join("")) : E.push(i(p))), y.address = E.join(""), y;
  }
  function d(c) {
    if (a(c, ":") < 2)
      return { host: c, isIPV6: !1 };
    const h = o(c);
    if (h.error)
      return { host: c, isIPV6: !1 };
    {
      let y = h.address, E = h.address;
      return h.zone && (y += "%" + h.zone, E += "%25" + h.zone), { host: y, isIPV6: !0, escapedHost: E };
    }
  }
  function a(c, h) {
    let y = 0;
    for (let E = 0; E < c.length; E++)
      c[E] === h && y++;
    return y;
  }
  function l(c) {
    let h = c;
    const y = [];
    let E = -1, p = 0;
    for (; p = h.length; ) {
      if (p === 1) {
        if (h === ".")
          break;
        if (h === "/") {
          y.push("/");
          break;
        } else {
          y.push(h);
          break;
        }
      } else if (p === 2) {
        if (h[0] === ".") {
          if (h[1] === ".")
            break;
          if (h[1] === "/") {
            h = h.slice(2);
            continue;
          }
        } else if (h[0] === "/" && (h[1] === "." || h[1] === "/")) {
          y.push("/");
          break;
        }
      } else if (p === 3 && h === "/..") {
        y.length !== 0 && y.pop(), y.push("/");
        break;
      }
      if (h[0] === ".") {
        if (h[1] === ".") {
          if (h[2] === "/") {
            h = h.slice(3);
            continue;
          }
        } else if (h[1] === "/") {
          h = h.slice(2);
          continue;
        }
      } else if (h[0] === "/" && h[1] === ".") {
        if (h[2] === "/") {
          h = h.slice(2);
          continue;
        } else if (h[2] === "." && h[3] === "/") {
          h = h.slice(3), y.length !== 0 && y.pop();
          continue;
        }
      }
      if ((E = h.indexOf("/", 1)) === -1) {
        y.push(h);
        break;
      } else
        y.push(h.slice(0, E)), h = h.slice(E);
    }
    return y.join("");
  }
  function n(c, h) {
    const y = h !== !0 ? escape : unescape;
    return c.scheme !== void 0 && (c.scheme = y(c.scheme)), c.userinfo !== void 0 && (c.userinfo = y(c.userinfo)), c.host !== void 0 && (c.host = y(c.host)), c.path !== void 0 && (c.path = y(c.path)), c.query !== void 0 && (c.query = y(c.query)), c.fragment !== void 0 && (c.fragment = y(c.fragment)), c;
  }
  function f(c) {
    const h = [];
    if (c.userinfo !== void 0 && (h.push(c.userinfo), h.push("@")), c.host !== void 0) {
      let y = unescape(c.host);
      if (!t(y)) {
        const E = d(y);
        E.isIPV6 === !0 ? y = `[${E.escapedHost}]` : y = c.host;
      }
      h.push(y);
    }
    return (typeof c.port == "number" || typeof c.port == "string") && (h.push(":"), h.push(String(c.port))), h.length ? h.join("") : void 0;
  }
  return Ca = {
    nonSimpleDomain: r,
    recomposeAuthority: f,
    normalizeComponentEncoding: n,
    removeDotSegments: l,
    isIPv4: t,
    isUUID: e,
    normalizeIPv6: d,
    stringArrayToHexStripped: i
  }, Ca;
}
var Da, Sc;
function f0() {
  if (Sc) return Da;
  Sc = 1;
  const { isUUID: e } = Cm(), t = /([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-.:;=@]|%[\da-f]{2})+)/iu, i = (
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
  function s(R) {
    return R.host || (R.error = R.error || "HTTP URIs must have a host."), R;
  }
  function o(R) {
    const _ = String(R.scheme).toLowerCase() === "https";
    return (R.port === (_ ? 443 : 80) || R.port === "") && (R.port = void 0), R.path || (R.path = "/"), R;
  }
  function d(R) {
    return R.secure = u(R), R.resourceName = (R.path || "/") + (R.query ? "?" + R.query : ""), R.path = void 0, R.query = void 0, R;
  }
  function a(R) {
    if ((R.port === (u(R) ? 443 : 80) || R.port === "") && (R.port = void 0), typeof R.secure == "boolean" && (R.scheme = R.secure ? "wss" : "ws", R.secure = void 0), R.resourceName) {
      const [_, S] = R.resourceName.split("?");
      R.path = _ && _ !== "/" ? _ : void 0, R.query = S, R.resourceName = void 0;
    }
    return R.fragment = void 0, R;
  }
  function l(R, _) {
    if (!R.path)
      return R.error = "URN can not be parsed", R;
    const S = R.path.match(t);
    if (S) {
      const A = _.scheme || R.scheme || "urn";
      R.nid = S[1].toLowerCase(), R.nss = S[2];
      const b = `${A}:${_.nid || R.nid}`, x = T(b);
      R.path = void 0, x && (R = x.parse(R, _));
    } else
      R.error = R.error || "URN can not be parsed.";
    return R;
  }
  function n(R, _) {
    if (R.nid === void 0)
      throw new Error("URN without nid cannot be serialized");
    const S = _.scheme || R.scheme || "urn", A = R.nid.toLowerCase(), b = `${S}:${_.nid || A}`, x = T(b);
    x && (R = x.serialize(R, _));
    const M = R, j = R.nss;
    return M.path = `${A || _.nid}:${j}`, _.skipEscape = !0, M;
  }
  function f(R, _) {
    const S = R;
    return S.uuid = S.nss, S.nss = void 0, !_.tolerant && (!S.uuid || !e(S.uuid)) && (S.error = S.error || "UUID is not valid."), S;
  }
  function c(R) {
    const _ = R;
    return _.nss = (R.uuid || "").toLowerCase(), _;
  }
  const h = (
    /** @type {SchemeHandler} */
    {
      scheme: "http",
      domainHost: !0,
      parse: s,
      serialize: o
    }
  ), y = (
    /** @type {SchemeHandler} */
    {
      scheme: "https",
      domainHost: h.domainHost,
      parse: s,
      serialize: o
    }
  ), E = (
    /** @type {SchemeHandler} */
    {
      scheme: "ws",
      domainHost: !0,
      parse: d,
      serialize: a
    }
  ), p = (
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
      http: h,
      https: y,
      ws: E,
      wss: p,
      urn: (
        /** @type {SchemeHandler} */
        {
          scheme: "urn",
          parse: l,
          serialize: n,
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
  function T(R) {
    return R && (w[
      /** @type {SchemeName} */
      R
    ] || w[
      /** @type {SchemeName} */
      R.toLowerCase()
    ]) || void 0;
  }
  return Da = {
    wsIsSecure: u,
    SCHEMES: w,
    isValidSchemeName: r,
    getSchemeHandler: T
  }, Da;
}
var Tc;
function d0() {
  if (Tc) return Gr.exports;
  Tc = 1;
  const { normalizeIPv6: e, removeDotSegments: t, recomposeAuthority: i, normalizeComponentEncoding: r, isIPv4: u, nonSimpleDomain: s } = Cm(), { SCHEMES: o, getSchemeHandler: d } = f0();
  function a(p, v) {
    return typeof p == "string" ? p = /** @type {T} */
    c(y(p, v), v) : typeof p == "object" && (p = /** @type {T} */
    y(c(p, v), v)), p;
  }
  function l(p, v, m) {
    const w = m ? Object.assign({ scheme: "null" }, m) : { scheme: "null" }, T = n(y(p, w), y(v, w), w, !0);
    return w.skipEscape = !0, c(T, w);
  }
  function n(p, v, m, w) {
    const T = {};
    return w || (p = y(c(p, m), m), v = y(c(v, m), m)), m = m || {}, !m.tolerant && v.scheme ? (T.scheme = v.scheme, T.userinfo = v.userinfo, T.host = v.host, T.port = v.port, T.path = t(v.path || ""), T.query = v.query) : (v.userinfo !== void 0 || v.host !== void 0 || v.port !== void 0 ? (T.userinfo = v.userinfo, T.host = v.host, T.port = v.port, T.path = t(v.path || ""), T.query = v.query) : (v.path ? (v.path[0] === "/" ? T.path = t(v.path) : ((p.userinfo !== void 0 || p.host !== void 0 || p.port !== void 0) && !p.path ? T.path = "/" + v.path : p.path ? T.path = p.path.slice(0, p.path.lastIndexOf("/") + 1) + v.path : T.path = v.path, T.path = t(T.path)), T.query = v.query) : (T.path = p.path, v.query !== void 0 ? T.query = v.query : T.query = p.query), T.userinfo = p.userinfo, T.host = p.host, T.port = p.port), T.scheme = p.scheme), T.fragment = v.fragment, T;
  }
  function f(p, v, m) {
    return typeof p == "string" ? (p = unescape(p), p = c(r(y(p, m), !0), { ...m, skipEscape: !0 })) : typeof p == "object" && (p = c(r(p, !0), { ...m, skipEscape: !0 })), typeof v == "string" ? (v = unescape(v), v = c(r(y(v, m), !0), { ...m, skipEscape: !0 })) : typeof v == "object" && (v = c(r(v, !0), { ...m, skipEscape: !0 })), p.toLowerCase() === v.toLowerCase();
  }
  function c(p, v) {
    const m = {
      host: p.host,
      scheme: p.scheme,
      userinfo: p.userinfo,
      port: p.port,
      path: p.path,
      query: p.query,
      nid: p.nid,
      nss: p.nss,
      uuid: p.uuid,
      fragment: p.fragment,
      reference: p.reference,
      resourceName: p.resourceName,
      secure: p.secure,
      error: ""
    }, w = Object.assign({}, v), T = [], R = d(w.scheme || m.scheme);
    R && R.serialize && R.serialize(m, w), m.path !== void 0 && (w.skipEscape ? m.path = unescape(m.path) : (m.path = escape(m.path), m.scheme !== void 0 && (m.path = m.path.split("%3A").join(":")))), w.reference !== "suffix" && m.scheme && T.push(m.scheme, ":");
    const _ = i(m);
    if (_ !== void 0 && (w.reference !== "suffix" && T.push("//"), T.push(_), m.path && m.path[0] !== "/" && T.push("/")), m.path !== void 0) {
      let S = m.path;
      !w.absolutePath && (!R || !R.absolutePath) && (S = t(S)), _ === void 0 && S[0] === "/" && S[1] === "/" && (S = "/%2F" + S.slice(2)), T.push(S);
    }
    return m.query !== void 0 && T.push("?", m.query), m.fragment !== void 0 && T.push("#", m.fragment), T.join("");
  }
  const h = /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u;
  function y(p, v) {
    const m = Object.assign({}, v), w = {
      scheme: void 0,
      userinfo: void 0,
      host: "",
      port: void 0,
      path: "",
      query: void 0,
      fragment: void 0
    };
    let T = !1;
    m.reference === "suffix" && (m.scheme ? p = m.scheme + ":" + p : p = "//" + p);
    const R = p.match(h);
    if (R) {
      if (w.scheme = R[1], w.userinfo = R[3], w.host = R[4], w.port = parseInt(R[5], 10), w.path = R[6] || "", w.query = R[7], w.fragment = R[8], isNaN(w.port) && (w.port = R[5]), w.host)
        if (u(w.host) === !1) {
          const A = e(w.host);
          w.host = A.host.toLowerCase(), T = A.isIPV6;
        } else
          T = !0;
      w.scheme === void 0 && w.userinfo === void 0 && w.host === void 0 && w.port === void 0 && w.query === void 0 && !w.path ? w.reference = "same-document" : w.scheme === void 0 ? w.reference = "relative" : w.fragment === void 0 ? w.reference = "absolute" : w.reference = "uri", m.reference && m.reference !== "suffix" && m.reference !== w.reference && (w.error = w.error || "URI is not a " + m.reference + " reference.");
      const _ = d(m.scheme || w.scheme);
      if (!m.unicodeSupport && (!_ || !_.unicodeSupport) && w.host && (m.domainHost || _ && _.domainHost) && T === !1 && s(w.host))
        try {
          w.host = URL.domainToASCII(w.host.toLowerCase());
        } catch (S) {
          w.error = w.error || "Host's domain name can not be converted to ASCII: " + S;
        }
      (!_ || _ && !_.skipNormalize) && (p.indexOf("%") !== -1 && (w.scheme !== void 0 && (w.scheme = unescape(w.scheme)), w.host !== void 0 && (w.host = unescape(w.host))), w.path && (w.path = escape(unescape(w.path))), w.fragment && (w.fragment = encodeURI(decodeURIComponent(w.fragment)))), _ && _.parse && _.parse(w, m);
    } else
      w.error = w.error || "URI can not be parsed.";
    return w;
  }
  const E = {
    SCHEMES: o,
    normalize: a,
    resolve: l,
    resolveComponent: n,
    equal: f,
    serialize: c,
    parse: y
  };
  return Gr.exports = E, Gr.exports.default = E, Gr.exports.fastUri = E, Gr.exports;
}
var Rc;
function h0() {
  if (Rc) return Qn;
  Rc = 1, Object.defineProperty(Qn, "__esModule", { value: !0 });
  const e = d0();
  return e.code = 'require("ajv/dist/runtime/uri").default', Qn.default = e, Qn;
}
var bc;
function p0() {
  return bc || (bc = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
    var t = ia();
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
    const r = ju(), u = aa(), s = $m(), o = Gu(), d = Oe(), a = na(), l = ea(), n = Pe(), f = c0, c = h0(), h = (k, q) => new RegExp(k, q);
    h.code = "new RegExp";
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
    ]), p = {
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
    }, v = {
      ignoreKeywordsWithRef: "",
      jsPropertySyntax: "",
      unicode: '"minLength"/"maxLength" account for unicode characters by default.'
    }, m = 200;
    function w(k) {
      var q, z, H, $, I, K, N, O, Q, V, B, Y, Z, re, le, Se, Te, Fe, He, Ge, ke, g, ee, ne, pe;
      const ie = k.strict, he = (q = k.code) === null || q === void 0 ? void 0 : q.optimize, ce = he === !0 || he === void 0 ? 1 : he || 0, me = (H = (z = k.code) === null || z === void 0 ? void 0 : z.regExp) !== null && H !== void 0 ? H : h, ye = ($ = k.uriResolver) !== null && $ !== void 0 ? $ : c.default;
      return {
        strictSchema: (K = (I = k.strictSchema) !== null && I !== void 0 ? I : ie) !== null && K !== void 0 ? K : !0,
        strictNumbers: (O = (N = k.strictNumbers) !== null && N !== void 0 ? N : ie) !== null && O !== void 0 ? O : !0,
        strictTypes: (V = (Q = k.strictTypes) !== null && Q !== void 0 ? Q : ie) !== null && V !== void 0 ? V : "log",
        strictTuples: (Y = (B = k.strictTuples) !== null && B !== void 0 ? B : ie) !== null && Y !== void 0 ? Y : "log",
        strictRequired: (re = (Z = k.strictRequired) !== null && Z !== void 0 ? Z : ie) !== null && re !== void 0 ? re : !1,
        code: k.code ? { ...k.code, optimize: ce, regExp: me } : { optimize: ce, regExp: me },
        loopRequired: (le = k.loopRequired) !== null && le !== void 0 ? le : m,
        loopEnum: (Se = k.loopEnum) !== null && Se !== void 0 ? Se : m,
        meta: (Te = k.meta) !== null && Te !== void 0 ? Te : !0,
        messages: (Fe = k.messages) !== null && Fe !== void 0 ? Fe : !0,
        inlineRefs: (He = k.inlineRefs) !== null && He !== void 0 ? He : !0,
        schemaId: (Ge = k.schemaId) !== null && Ge !== void 0 ? Ge : "$id",
        addUsedSchema: (ke = k.addUsedSchema) !== null && ke !== void 0 ? ke : !0,
        validateSchema: (g = k.validateSchema) !== null && g !== void 0 ? g : !0,
        validateFormats: (ee = k.validateFormats) !== null && ee !== void 0 ? ee : !0,
        unicodeRegExp: (ne = k.unicodeRegExp) !== null && ne !== void 0 ? ne : !0,
        int32range: (pe = k.int32range) !== null && pe !== void 0 ? pe : !0,
        uriResolver: ye
      };
    }
    class T {
      constructor(q = {}) {
        this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), q = this.opts = { ...q, ...w(q) };
        const { es5: z, lines: H } = this.opts.code;
        this.scope = new d.ValueScope({ scope: {}, prefixes: E, es5: z, lines: H }), this.logger = j(q.logger);
        const $ = q.validateFormats;
        q.validateFormats = !1, this.RULES = (0, s.getRules)(), R.call(this, p, q, "NOT SUPPORTED"), R.call(this, v, q, "DEPRECATED", "warn"), this._metaOpts = x.call(this), q.formats && A.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), q.keywords && b.call(this, q.keywords), typeof q.meta == "object" && this.addMetaSchema(q.meta), S.call(this), q.validateFormats = $;
      }
      _addVocabularies() {
        this.addKeyword("$async");
      }
      _addDefaultMetaSchema() {
        const { $data: q, meta: z, schemaId: H } = this.opts;
        let $ = f;
        H === "id" && ($ = { ...f }, $.id = $.$id, delete $.$id), z && q && this.addMetaSchema($, $[H], !1);
      }
      defaultMeta() {
        const { meta: q, schemaId: z } = this.opts;
        return this.opts.defaultMeta = typeof q == "object" ? q[z] || q : void 0;
      }
      validate(q, z) {
        let H;
        if (typeof q == "string") {
          if (H = this.getSchema(q), !H)
            throw new Error(`no schema with key or ref "${q}"`);
        } else
          H = this.compile(q);
        const $ = H(z);
        return "$async" in H || (this.errors = H.errors), $;
      }
      compile(q, z) {
        const H = this._addSchema(q, z);
        return H.validate || this._compileSchemaEnv(H);
      }
      compileAsync(q, z) {
        if (typeof this.opts.loadSchema != "function")
          throw new Error("options.loadSchema should be a function");
        const { loadSchema: H } = this.opts;
        return $.call(this, q, z);
        async function $(V, B) {
          await I.call(this, V.$schema);
          const Y = this._addSchema(V, B);
          return Y.validate || K.call(this, Y);
        }
        async function I(V) {
          V && !this.getSchema(V) && await $.call(this, { $ref: V }, !0);
        }
        async function K(V) {
          try {
            return this._compileSchemaEnv(V);
          } catch (B) {
            if (!(B instanceof u.default))
              throw B;
            return N.call(this, B), await O.call(this, B.missingSchema), K.call(this, V);
          }
        }
        function N({ missingSchema: V, missingRef: B }) {
          if (this.refs[V])
            throw new Error(`AnySchema ${V} is loaded but ${B} cannot be resolved`);
        }
        async function O(V) {
          const B = await Q.call(this, V);
          this.refs[V] || await I.call(this, B.$schema), this.refs[V] || this.addSchema(B, V, z);
        }
        async function Q(V) {
          const B = this._loading[V];
          if (B)
            return B;
          try {
            return await (this._loading[V] = H(V));
          } finally {
            delete this._loading[V];
          }
        }
      }
      // Adds schema to the instance
      addSchema(q, z, H, $ = this.opts.validateSchema) {
        if (Array.isArray(q)) {
          for (const K of q)
            this.addSchema(K, void 0, H, $);
          return this;
        }
        let I;
        if (typeof q == "object") {
          const { schemaId: K } = this.opts;
          if (I = q[K], I !== void 0 && typeof I != "string")
            throw new Error(`schema ${K} must be string`);
        }
        return z = (0, a.normalizeId)(z || I), this._checkUnique(z), this.schemas[z] = this._addSchema(q, H, z, $, !0), this;
      }
      // Add schema that will be used to validate other schemas
      // options in META_IGNORE_OPTIONS are alway set to false
      addMetaSchema(q, z, H = this.opts.validateSchema) {
        return this.addSchema(q, z, !0, H), this;
      }
      //  Validate schema against its meta-schema
      validateSchema(q, z) {
        if (typeof q == "boolean")
          return !0;
        let H;
        if (H = q.$schema, H !== void 0 && typeof H != "string")
          throw new Error("$schema must be a string");
        if (H = H || this.opts.defaultMeta || this.defaultMeta(), !H)
          return this.logger.warn("meta-schema not available"), this.errors = null, !0;
        const $ = this.validate(H, q);
        if (!$ && z) {
          const I = "schema is invalid: " + this.errorsText();
          if (this.opts.validateSchema === "log")
            this.logger.error(I);
          else
            throw new Error(I);
        }
        return $;
      }
      // Get compiled schema by `key` or `ref`.
      // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
      getSchema(q) {
        let z;
        for (; typeof (z = _.call(this, q)) == "string"; )
          q = z;
        if (z === void 0) {
          const { schemaId: H } = this.opts, $ = new o.SchemaEnv({ schema: {}, schemaId: H });
          if (z = o.resolveSchema.call(this, $, q), !z)
            return;
          this.refs[q] = z;
        }
        return z.validate || this._compileSchemaEnv(z);
      }
      // Remove cached schema(s).
      // If no parameter is passed all schemas but meta-schemas are removed.
      // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
      // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
      removeSchema(q) {
        if (q instanceof RegExp)
          return this._removeAllSchemas(this.schemas, q), this._removeAllSchemas(this.refs, q), this;
        switch (typeof q) {
          case "undefined":
            return this._removeAllSchemas(this.schemas), this._removeAllSchemas(this.refs), this._cache.clear(), this;
          case "string": {
            const z = _.call(this, q);
            return typeof z == "object" && this._cache.delete(z.schema), delete this.schemas[q], delete this.refs[q], this;
          }
          case "object": {
            const z = q;
            this._cache.delete(z);
            let H = q[this.opts.schemaId];
            return H && (H = (0, a.normalizeId)(H), delete this.schemas[H], delete this.refs[H]), this;
          }
          default:
            throw new Error("ajv.removeSchema: invalid parameter");
        }
      }
      // add "vocabulary" - a collection of keywords
      addVocabulary(q) {
        for (const z of q)
          this.addKeyword(z);
        return this;
      }
      addKeyword(q, z) {
        let H;
        if (typeof q == "string")
          H = q, typeof z == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), z.keyword = H);
        else if (typeof q == "object" && z === void 0) {
          if (z = q, H = z.keyword, Array.isArray(H) && !H.length)
            throw new Error("addKeywords: keyword must be string or non-empty array");
        } else
          throw new Error("invalid addKeywords parameters");
        if (P.call(this, H, z), !z)
          return (0, n.eachItem)(H, (I) => D.call(this, I)), this;
        L.call(this, z);
        const $ = {
          ...z,
          type: (0, l.getJSONTypes)(z.type),
          schemaType: (0, l.getJSONTypes)(z.schemaType)
        };
        return (0, n.eachItem)(H, $.type.length === 0 ? (I) => D.call(this, I, $) : (I) => $.type.forEach((K) => D.call(this, I, $, K))), this;
      }
      getKeyword(q) {
        const z = this.RULES.all[q];
        return typeof z == "object" ? z.definition : !!z;
      }
      // Remove keyword
      removeKeyword(q) {
        const { RULES: z } = this;
        delete z.keywords[q], delete z.all[q];
        for (const H of z.rules) {
          const $ = H.rules.findIndex((I) => I.keyword === q);
          $ >= 0 && H.rules.splice($, 1);
        }
        return this;
      }
      // Add format
      addFormat(q, z) {
        return typeof z == "string" && (z = new RegExp(z)), this.formats[q] = z, this;
      }
      errorsText(q = this.errors, { separator: z = ", ", dataVar: H = "data" } = {}) {
        return !q || q.length === 0 ? "No errors" : q.map(($) => `${H}${$.instancePath} ${$.message}`).reduce(($, I) => $ + z + I);
      }
      $dataMetaSchema(q, z) {
        const H = this.RULES.all;
        q = JSON.parse(JSON.stringify(q));
        for (const $ of z) {
          const I = $.split("/").slice(1);
          let K = q;
          for (const N of I)
            K = K[N];
          for (const N in H) {
            const O = H[N];
            if (typeof O != "object")
              continue;
            const { $data: Q } = O.definition, V = K[N];
            Q && V && (K[N] = G(V));
          }
        }
        return q;
      }
      _removeAllSchemas(q, z) {
        for (const H in q) {
          const $ = q[H];
          (!z || z.test(H)) && (typeof $ == "string" ? delete q[H] : $ && !$.meta && (this._cache.delete($.schema), delete q[H]));
        }
      }
      _addSchema(q, z, H, $ = this.opts.validateSchema, I = this.opts.addUsedSchema) {
        let K;
        const { schemaId: N } = this.opts;
        if (typeof q == "object")
          K = q[N];
        else {
          if (this.opts.jtd)
            throw new Error("schema must be object");
          if (typeof q != "boolean")
            throw new Error("schema must be object or boolean");
        }
        let O = this._cache.get(q);
        if (O !== void 0)
          return O;
        H = (0, a.normalizeId)(K || H);
        const Q = a.getSchemaRefs.call(this, q, H);
        return O = new o.SchemaEnv({ schema: q, schemaId: N, meta: z, baseId: H, localRefs: Q }), this._cache.set(O.schema, O), I && !H.startsWith("#") && (H && this._checkUnique(H), this.refs[H] = O), $ && this.validateSchema(q, !0), O;
      }
      _checkUnique(q) {
        if (this.schemas[q] || this.refs[q])
          throw new Error(`schema with key or id "${q}" already exists`);
      }
      _compileSchemaEnv(q) {
        if (q.meta ? this._compileMetaSchema(q) : o.compileSchema.call(this, q), !q.validate)
          throw new Error("ajv implementation error");
        return q.validate;
      }
      _compileMetaSchema(q) {
        const z = this.opts;
        this.opts = this._metaOpts;
        try {
          o.compileSchema.call(this, q);
        } finally {
          this.opts = z;
        }
      }
    }
    T.ValidationError = r.default, T.MissingRefError = u.default, e.default = T;
    function R(k, q, z, H = "error") {
      for (const $ in k) {
        const I = $;
        I in q && this.logger[H](`${z}: option ${$}. ${k[I]}`);
      }
    }
    function _(k) {
      return k = (0, a.normalizeId)(k), this.schemas[k] || this.refs[k];
    }
    function S() {
      const k = this.opts.schemas;
      if (k)
        if (Array.isArray(k))
          this.addSchema(k);
        else
          for (const q in k)
            this.addSchema(k[q], q);
    }
    function A() {
      for (const k in this.opts.formats) {
        const q = this.opts.formats[k];
        q && this.addFormat(k, q);
      }
    }
    function b(k) {
      if (Array.isArray(k)) {
        this.addVocabulary(k);
        return;
      }
      this.logger.warn("keywords option as map is deprecated, pass array");
      for (const q in k) {
        const z = k[q];
        z.keyword || (z.keyword = q), this.addKeyword(z);
      }
    }
    function x() {
      const k = { ...this.opts };
      for (const q of y)
        delete k[q];
      return k;
    }
    const M = { log() {
    }, warn() {
    }, error() {
    } };
    function j(k) {
      if (k === !1)
        return M;
      if (k === void 0)
        return console;
      if (k.log && k.warn && k.error)
        return k;
      throw new Error("logger must implement log, warn and error methods");
    }
    const X = /^[a-z_$][a-z0-9_$:-]*$/i;
    function P(k, q) {
      const { RULES: z } = this;
      if ((0, n.eachItem)(k, (H) => {
        if (z.keywords[H])
          throw new Error(`Keyword ${H} is already defined`);
        if (!X.test(H))
          throw new Error(`Keyword ${H} has invalid name`);
      }), !!q && q.$data && !("code" in q || "validate" in q))
        throw new Error('$data keyword must have "code" or "validate" function');
    }
    function D(k, q, z) {
      var H;
      const $ = q?.post;
      if (z && $)
        throw new Error('keyword with "post" flag cannot have "type"');
      const { RULES: I } = this;
      let K = $ ? I.post : I.rules.find(({ type: O }) => O === z);
      if (K || (K = { type: z, rules: [] }, I.rules.push(K)), I.keywords[k] = !0, !q)
        return;
      const N = {
        keyword: k,
        definition: {
          ...q,
          type: (0, l.getJSONTypes)(q.type),
          schemaType: (0, l.getJSONTypes)(q.schemaType)
        }
      };
      q.before ? W.call(this, K, N, q.before) : K.rules.push(N), I.all[k] = N, (H = q.implements) === null || H === void 0 || H.forEach((O) => this.addKeyword(O));
    }
    function W(k, q, z) {
      const H = k.rules.findIndex(($) => $.keyword === z);
      H >= 0 ? k.rules.splice(H, 0, q) : (k.rules.push(q), this.logger.warn(`rule ${z} is not defined`));
    }
    function L(k) {
      let { metaSchema: q } = k;
      q !== void 0 && (k.$data && this.opts.$data && (q = G(q)), k.validateSchema = this.compile(q, !0));
    }
    const F = {
      $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
    };
    function G(k) {
      return { anyOf: [k, F] };
    }
  })(ba)), ba;
}
var Zn = {}, ei = {}, ti = {}, Ac;
function m0() {
  if (Ac) return ti;
  Ac = 1, Object.defineProperty(ti, "__esModule", { value: !0 });
  const e = {
    keyword: "id",
    code() {
      throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
    }
  };
  return ti.default = e, ti;
}
var Ht = {}, Oc;
function g0() {
  if (Oc) return Ht;
  Oc = 1, Object.defineProperty(Ht, "__esModule", { value: !0 }), Ht.callRef = Ht.getValidate = void 0;
  const e = aa(), t = bt(), i = Oe(), r = Jt(), u = Gu(), s = Pe(), o = {
    keyword: "$ref",
    schemaType: "string",
    code(l) {
      const { gen: n, schema: f, it: c } = l, { baseId: h, schemaEnv: y, validateName: E, opts: p, self: v } = c, { root: m } = y;
      if ((f === "#" || f === "#/") && h === m.baseId)
        return T();
      const w = u.resolveRef.call(v, m, h, f);
      if (w === void 0)
        throw new e.default(c.opts.uriResolver, h, f);
      if (w instanceof u.SchemaEnv)
        return R(w);
      return _(w);
      function T() {
        if (y === m)
          return a(l, E, y, y.$async);
        const S = n.scopeValue("root", { ref: m });
        return a(l, (0, i._)`${S}.validate`, m, m.$async);
      }
      function R(S) {
        const A = d(l, S);
        a(l, A, S, S.$async);
      }
      function _(S) {
        const A = n.scopeValue("schema", p.code.source === !0 ? { ref: S, code: (0, i.stringify)(S) } : { ref: S }), b = n.name("valid"), x = l.subschema({
          schema: S,
          dataTypes: [],
          schemaPath: i.nil,
          topSchemaRef: A,
          errSchemaPath: f
        }, b);
        l.mergeEvaluated(x), l.ok(b);
      }
    }
  };
  function d(l, n) {
    const { gen: f } = l;
    return n.validate ? f.scopeValue("validate", { ref: n.validate }) : (0, i._)`${f.scopeValue("wrapper", { ref: n })}.validate`;
  }
  Ht.getValidate = d;
  function a(l, n, f, c) {
    const { gen: h, it: y } = l, { allErrors: E, schemaEnv: p, opts: v } = y, m = v.passContext ? r.default.this : i.nil;
    c ? w() : T();
    function w() {
      if (!p.$async)
        throw new Error("async schema referenced by sync schema");
      const S = h.let("valid");
      h.try(() => {
        h.code((0, i._)`await ${(0, t.callValidateCode)(l, n, m)}`), _(n), E || h.assign(S, !0);
      }, (A) => {
        h.if((0, i._)`!(${A} instanceof ${y.ValidationError})`, () => h.throw(A)), R(A), E || h.assign(S, !1);
      }), l.ok(S);
    }
    function T() {
      l.result((0, t.callValidateCode)(l, n, m), () => _(n), () => R(n));
    }
    function R(S) {
      const A = (0, i._)`${S}.errors`;
      h.assign(r.default.vErrors, (0, i._)`${r.default.vErrors} === null ? ${A} : ${r.default.vErrors}.concat(${A})`), h.assign(r.default.errors, (0, i._)`${r.default.vErrors}.length`);
    }
    function _(S) {
      var A;
      if (!y.opts.unevaluated)
        return;
      const b = (A = f?.validate) === null || A === void 0 ? void 0 : A.evaluated;
      if (y.props !== !0)
        if (b && !b.dynamicProps)
          b.props !== void 0 && (y.props = s.mergeEvaluated.props(h, b.props, y.props));
        else {
          const x = h.var("props", (0, i._)`${S}.evaluated.props`);
          y.props = s.mergeEvaluated.props(h, x, y.props, i.Name);
        }
      if (y.items !== !0)
        if (b && !b.dynamicItems)
          b.items !== void 0 && (y.items = s.mergeEvaluated.items(h, b.items, y.items));
        else {
          const x = h.var("items", (0, i._)`${S}.evaluated.items`);
          y.items = s.mergeEvaluated.items(h, x, y.items, i.Name);
        }
    }
  }
  return Ht.callRef = a, Ht.default = o, Ht;
}
var Nc;
function y0() {
  if (Nc) return ei;
  Nc = 1, Object.defineProperty(ei, "__esModule", { value: !0 });
  const e = m0(), t = g0(), i = [
    "$schema",
    "$id",
    "$defs",
    "$vocabulary",
    { keyword: "$comment" },
    "definitions",
    e.default,
    t.default
  ];
  return ei.default = i, ei;
}
var ri = {}, ni = {}, $c;
function E0() {
  if ($c) return ni;
  $c = 1, Object.defineProperty(ni, "__esModule", { value: !0 });
  const e = Oe(), t = e.operators, i = {
    maximum: { okStr: "<=", ok: t.LTE, fail: t.GT },
    minimum: { okStr: ">=", ok: t.GTE, fail: t.LT },
    exclusiveMaximum: { okStr: "<", ok: t.LT, fail: t.GTE },
    exclusiveMinimum: { okStr: ">", ok: t.GT, fail: t.LTE }
  }, r = {
    message: ({ keyword: s, schemaCode: o }) => (0, e.str)`must be ${i[s].okStr} ${o}`,
    params: ({ keyword: s, schemaCode: o }) => (0, e._)`{comparison: ${i[s].okStr}, limit: ${o}}`
  }, u = {
    keyword: Object.keys(i),
    type: "number",
    schemaType: "number",
    $data: !0,
    error: r,
    code(s) {
      const { keyword: o, data: d, schemaCode: a } = s;
      s.fail$data((0, e._)`${d} ${i[o].fail} ${a} || isNaN(${d})`);
    }
  };
  return ni.default = u, ni;
}
var ii = {}, Ic;
function v0() {
  if (Ic) return ii;
  Ic = 1, Object.defineProperty(ii, "__esModule", { value: !0 });
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
      const { gen: u, data: s, schemaCode: o, it: d } = r, a = d.opts.multipleOfPrecision, l = u.let("res"), n = a ? (0, e._)`Math.abs(Math.round(${l}) - ${l}) > 1e-${a}` : (0, e._)`${l} !== parseInt(${l})`;
      r.fail$data((0, e._)`(${o} === 0 || (${l} = ${s}/${o}, ${n}))`);
    }
  };
  return ii.default = i, ii;
}
var ai = {}, si = {}, Pc;
function _0() {
  if (Pc) return si;
  Pc = 1, Object.defineProperty(si, "__esModule", { value: !0 });
  function e(t) {
    const i = t.length;
    let r = 0, u = 0, s;
    for (; u < i; )
      r++, s = t.charCodeAt(u++), s >= 55296 && s <= 56319 && u < i && (s = t.charCodeAt(u), (s & 64512) === 56320 && u++);
    return r;
  }
  return si.default = e, e.code = 'require("ajv/dist/runtime/ucs2length").default', si;
}
var Cc;
function w0() {
  if (Cc) return ai;
  Cc = 1, Object.defineProperty(ai, "__esModule", { value: !0 });
  const e = Oe(), t = Pe(), i = _0(), u = {
    keyword: ["maxLength", "minLength"],
    type: "string",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: s, schemaCode: o }) {
        const d = s === "maxLength" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${d} than ${o} characters`;
      },
      params: ({ schemaCode: s }) => (0, e._)`{limit: ${s}}`
    },
    code(s) {
      const { keyword: o, data: d, schemaCode: a, it: l } = s, n = o === "maxLength" ? e.operators.GT : e.operators.LT, f = l.opts.unicode === !1 ? (0, e._)`${d}.length` : (0, e._)`${(0, t.useFunc)(s.gen, i.default)}(${d})`;
      s.fail$data((0, e._)`${f} ${n} ${a}`);
    }
  };
  return ai.default = u, ai;
}
var oi = {}, Dc;
function S0() {
  if (Dc) return oi;
  Dc = 1, Object.defineProperty(oi, "__esModule", { value: !0 });
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
      const { data: s, $data: o, schema: d, schemaCode: a, it: l } = u, n = l.opts.unicodeRegExp ? "u" : "", f = o ? (0, t._)`(new RegExp(${a}, ${n}))` : (0, e.usePattern)(u, d);
      u.fail$data((0, t._)`!${f}.test(${s})`);
    }
  };
  return oi.default = r, oi;
}
var ui = {}, Lc;
function T0() {
  if (Lc) return ui;
  Lc = 1, Object.defineProperty(ui, "__esModule", { value: !0 });
  const e = Oe(), i = {
    keyword: ["maxProperties", "minProperties"],
    type: "object",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: r, schemaCode: u }) {
        const s = r === "maxProperties" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${s} than ${u} properties`;
      },
      params: ({ schemaCode: r }) => (0, e._)`{limit: ${r}}`
    },
    code(r) {
      const { keyword: u, data: s, schemaCode: o } = r, d = u === "maxProperties" ? e.operators.GT : e.operators.LT;
      r.fail$data((0, e._)`Object.keys(${s}).length ${d} ${o}`);
    }
  };
  return ui.default = i, ui;
}
var li = {}, kc;
function R0() {
  if (kc) return li;
  kc = 1, Object.defineProperty(li, "__esModule", { value: !0 });
  const e = bt(), t = Oe(), i = Pe(), u = {
    keyword: "required",
    type: "object",
    schemaType: "array",
    $data: !0,
    error: {
      message: ({ params: { missingProperty: s } }) => (0, t.str)`must have required property '${s}'`,
      params: ({ params: { missingProperty: s } }) => (0, t._)`{missingProperty: ${s}}`
    },
    code(s) {
      const { gen: o, schema: d, schemaCode: a, data: l, $data: n, it: f } = s, { opts: c } = f;
      if (!n && d.length === 0)
        return;
      const h = d.length >= c.loopRequired;
      if (f.allErrors ? y() : E(), c.strictRequired) {
        const m = s.parentSchema.properties, { definedProperties: w } = s.it;
        for (const T of d)
          if (m?.[T] === void 0 && !w.has(T)) {
            const R = f.schemaEnv.baseId + f.errSchemaPath, _ = `required property "${T}" is not defined at "${R}" (strictRequired)`;
            (0, i.checkStrictMode)(f, _, f.opts.strictRequired);
          }
      }
      function y() {
        if (h || n)
          s.block$data(t.nil, p);
        else
          for (const m of d)
            (0, e.checkReportMissingProp)(s, m);
      }
      function E() {
        const m = o.let("missing");
        if (h || n) {
          const w = o.let("valid", !0);
          s.block$data(w, () => v(m, w)), s.ok(w);
        } else
          o.if((0, e.checkMissingProp)(s, d, m)), (0, e.reportMissingProp)(s, m), o.else();
      }
      function p() {
        o.forOf("prop", a, (m) => {
          s.setParams({ missingProperty: m }), o.if((0, e.noPropertyInData)(o, l, m, c.ownProperties), () => s.error());
        });
      }
      function v(m, w) {
        s.setParams({ missingProperty: m }), o.forOf(m, a, () => {
          o.assign(w, (0, e.propertyInData)(o, l, m, c.ownProperties)), o.if((0, t.not)(w), () => {
            s.error(), o.break();
          });
        }, t.nil);
      }
    }
  };
  return li.default = u, li;
}
var ci = {}, Fc;
function b0() {
  if (Fc) return ci;
  Fc = 1, Object.defineProperty(ci, "__esModule", { value: !0 });
  const e = Oe(), i = {
    keyword: ["maxItems", "minItems"],
    type: "array",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: r, schemaCode: u }) {
        const s = r === "maxItems" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${s} than ${u} items`;
      },
      params: ({ schemaCode: r }) => (0, e._)`{limit: ${r}}`
    },
    code(r) {
      const { keyword: u, data: s, schemaCode: o } = r, d = u === "maxItems" ? e.operators.GT : e.operators.LT;
      r.fail$data((0, e._)`${s}.length ${d} ${o}`);
    }
  };
  return ci.default = i, ci;
}
var fi = {}, di = {}, Uc;
function Hu() {
  if (Uc) return di;
  Uc = 1, Object.defineProperty(di, "__esModule", { value: !0 });
  const e = Pm();
  return e.code = 'require("ajv/dist/runtime/equal").default', di.default = e, di;
}
var qc;
function A0() {
  if (qc) return fi;
  qc = 1, Object.defineProperty(fi, "__esModule", { value: !0 });
  const e = ea(), t = Oe(), i = Pe(), r = Hu(), s = {
    keyword: "uniqueItems",
    type: "array",
    schemaType: "boolean",
    $data: !0,
    error: {
      message: ({ params: { i: o, j: d } }) => (0, t.str)`must NOT have duplicate items (items ## ${d} and ${o} are identical)`,
      params: ({ params: { i: o, j: d } }) => (0, t._)`{i: ${o}, j: ${d}}`
    },
    code(o) {
      const { gen: d, data: a, $data: l, schema: n, parentSchema: f, schemaCode: c, it: h } = o;
      if (!l && !n)
        return;
      const y = d.let("valid"), E = f.items ? (0, e.getSchemaTypes)(f.items) : [];
      o.block$data(y, p, (0, t._)`${c} === false`), o.ok(y);
      function p() {
        const T = d.let("i", (0, t._)`${a}.length`), R = d.let("j");
        o.setParams({ i: T, j: R }), d.assign(y, !0), d.if((0, t._)`${T} > 1`, () => (v() ? m : w)(T, R));
      }
      function v() {
        return E.length > 0 && !E.some((T) => T === "object" || T === "array");
      }
      function m(T, R) {
        const _ = d.name("item"), S = (0, e.checkDataTypes)(E, _, h.opts.strictNumbers, e.DataType.Wrong), A = d.const("indices", (0, t._)`{}`);
        d.for((0, t._)`;${T}--;`, () => {
          d.let(_, (0, t._)`${a}[${T}]`), d.if(S, (0, t._)`continue`), E.length > 1 && d.if((0, t._)`typeof ${_} == "string"`, (0, t._)`${_} += "_"`), d.if((0, t._)`typeof ${A}[${_}] == "number"`, () => {
            d.assign(R, (0, t._)`${A}[${_}]`), o.error(), d.assign(y, !1).break();
          }).code((0, t._)`${A}[${_}] = ${T}`);
        });
      }
      function w(T, R) {
        const _ = (0, i.useFunc)(d, r.default), S = d.name("outer");
        d.label(S).for((0, t._)`;${T}--;`, () => d.for((0, t._)`${R} = ${T}; ${R}--;`, () => d.if((0, t._)`${_}(${a}[${T}], ${a}[${R}])`, () => {
          o.error(), d.assign(y, !1).break(S);
        })));
      }
    }
  };
  return fi.default = s, fi;
}
var hi = {}, xc;
function O0() {
  if (xc) return hi;
  xc = 1, Object.defineProperty(hi, "__esModule", { value: !0 });
  const e = Oe(), t = Pe(), i = Hu(), u = {
    keyword: "const",
    $data: !0,
    error: {
      message: "must be equal to constant",
      params: ({ schemaCode: s }) => (0, e._)`{allowedValue: ${s}}`
    },
    code(s) {
      const { gen: o, data: d, $data: a, schemaCode: l, schema: n } = s;
      a || n && typeof n == "object" ? s.fail$data((0, e._)`!${(0, t.useFunc)(o, i.default)}(${d}, ${l})`) : s.fail((0, e._)`${n} !== ${d}`);
    }
  };
  return hi.default = u, hi;
}
var pi = {}, Mc;
function N0() {
  if (Mc) return pi;
  Mc = 1, Object.defineProperty(pi, "__esModule", { value: !0 });
  const e = Oe(), t = Pe(), i = Hu(), u = {
    keyword: "enum",
    schemaType: "array",
    $data: !0,
    error: {
      message: "must be equal to one of the allowed values",
      params: ({ schemaCode: s }) => (0, e._)`{allowedValues: ${s}}`
    },
    code(s) {
      const { gen: o, data: d, $data: a, schema: l, schemaCode: n, it: f } = s;
      if (!a && l.length === 0)
        throw new Error("enum must have non-empty array");
      const c = l.length >= f.opts.loopEnum;
      let h;
      const y = () => h ?? (h = (0, t.useFunc)(o, i.default));
      let E;
      if (c || a)
        E = o.let("valid"), s.block$data(E, p);
      else {
        if (!Array.isArray(l))
          throw new Error("ajv implementation error");
        const m = o.const("vSchema", n);
        E = (0, e.or)(...l.map((w, T) => v(m, T)));
      }
      s.pass(E);
      function p() {
        o.assign(E, !1), o.forOf("v", n, (m) => o.if((0, e._)`${y()}(${d}, ${m})`, () => o.assign(E, !0).break()));
      }
      function v(m, w) {
        const T = l[w];
        return typeof T == "object" && T !== null ? (0, e._)`${y()}(${d}, ${m}[${w}])` : (0, e._)`${d} === ${T}`;
      }
    }
  };
  return pi.default = u, pi;
}
var jc;
function $0() {
  if (jc) return ri;
  jc = 1, Object.defineProperty(ri, "__esModule", { value: !0 });
  const e = E0(), t = v0(), i = w0(), r = S0(), u = T0(), s = R0(), o = b0(), d = A0(), a = O0(), l = N0(), n = [
    // number
    e.default,
    t.default,
    // string
    i.default,
    r.default,
    // object
    u.default,
    s.default,
    // array
    o.default,
    d.default,
    // any
    { keyword: "type", schemaType: ["string", "array"] },
    { keyword: "nullable", schemaType: "boolean" },
    a.default,
    l.default
  ];
  return ri.default = n, ri;
}
var mi = {}, _r = {}, Gc;
function Dm() {
  if (Gc) return _r;
  Gc = 1, Object.defineProperty(_r, "__esModule", { value: !0 }), _r.validateAdditionalItems = void 0;
  const e = Oe(), t = Pe(), r = {
    keyword: "additionalItems",
    type: "array",
    schemaType: ["boolean", "object"],
    before: "uniqueItems",
    error: {
      message: ({ params: { len: s } }) => (0, e.str)`must NOT have more than ${s} items`,
      params: ({ params: { len: s } }) => (0, e._)`{limit: ${s}}`
    },
    code(s) {
      const { parentSchema: o, it: d } = s, { items: a } = o;
      if (!Array.isArray(a)) {
        (0, t.checkStrictMode)(d, '"additionalItems" is ignored when "items" is not an array of schemas');
        return;
      }
      u(s, a);
    }
  };
  function u(s, o) {
    const { gen: d, schema: a, data: l, keyword: n, it: f } = s;
    f.items = !0;
    const c = d.const("len", (0, e._)`${l}.length`);
    if (a === !1)
      s.setParams({ len: o.length }), s.pass((0, e._)`${c} <= ${o.length}`);
    else if (typeof a == "object" && !(0, t.alwaysValidSchema)(f, a)) {
      const y = d.var("valid", (0, e._)`${c} <= ${o.length}`);
      d.if((0, e.not)(y), () => h(y)), s.ok(y);
    }
    function h(y) {
      d.forRange("i", o.length, c, (E) => {
        s.subschema({ keyword: n, dataProp: E, dataPropType: t.Type.Num }, y), f.allErrors || d.if((0, e.not)(y), () => d.break());
      });
    }
  }
  return _r.validateAdditionalItems = u, _r.default = r, _r;
}
var gi = {}, wr = {}, Hc;
function Lm() {
  if (Hc) return wr;
  Hc = 1, Object.defineProperty(wr, "__esModule", { value: !0 }), wr.validateTuple = void 0;
  const e = Oe(), t = Pe(), i = bt(), r = {
    keyword: "items",
    type: "array",
    schemaType: ["object", "array", "boolean"],
    before: "uniqueItems",
    code(s) {
      const { schema: o, it: d } = s;
      if (Array.isArray(o))
        return u(s, "additionalItems", o);
      d.items = !0, !(0, t.alwaysValidSchema)(d, o) && s.ok((0, i.validateArray)(s));
    }
  };
  function u(s, o, d = s.schema) {
    const { gen: a, parentSchema: l, data: n, keyword: f, it: c } = s;
    E(l), c.opts.unevaluated && d.length && c.items !== !0 && (c.items = t.mergeEvaluated.items(a, d.length, c.items));
    const h = a.name("valid"), y = a.const("len", (0, e._)`${n}.length`);
    d.forEach((p, v) => {
      (0, t.alwaysValidSchema)(c, p) || (a.if((0, e._)`${y} > ${v}`, () => s.subschema({
        keyword: f,
        schemaProp: v,
        dataProp: v
      }, h)), s.ok(h));
    });
    function E(p) {
      const { opts: v, errSchemaPath: m } = c, w = d.length, T = w === p.minItems && (w === p.maxItems || p[o] === !1);
      if (v.strictTuples && !T) {
        const R = `"${f}" is ${w}-tuple, but minItems or maxItems/${o} are not specified or different at path "${m}"`;
        (0, t.checkStrictMode)(c, R, v.strictTuples);
      }
    }
  }
  return wr.validateTuple = u, wr.default = r, wr;
}
var Bc;
function I0() {
  if (Bc) return gi;
  Bc = 1, Object.defineProperty(gi, "__esModule", { value: !0 });
  const e = Lm(), t = {
    keyword: "prefixItems",
    type: "array",
    schemaType: ["array"],
    before: "uniqueItems",
    code: (i) => (0, e.validateTuple)(i, "items")
  };
  return gi.default = t, gi;
}
var yi = {}, Vc;
function P0() {
  if (Vc) return yi;
  Vc = 1, Object.defineProperty(yi, "__esModule", { value: !0 });
  const e = Oe(), t = Pe(), i = bt(), r = Dm(), s = {
    keyword: "items",
    type: "array",
    schemaType: ["object", "boolean"],
    before: "uniqueItems",
    error: {
      message: ({ params: { len: o } }) => (0, e.str)`must NOT have more than ${o} items`,
      params: ({ params: { len: o } }) => (0, e._)`{limit: ${o}}`
    },
    code(o) {
      const { schema: d, parentSchema: a, it: l } = o, { prefixItems: n } = a;
      l.items = !0, !(0, t.alwaysValidSchema)(l, d) && (n ? (0, r.validateAdditionalItems)(o, n) : o.ok((0, i.validateArray)(o)));
    }
  };
  return yi.default = s, yi;
}
var Ei = {}, zc;
function C0() {
  if (zc) return Ei;
  zc = 1, Object.defineProperty(Ei, "__esModule", { value: !0 });
  const e = Oe(), t = Pe(), r = {
    keyword: "contains",
    type: "array",
    schemaType: ["object", "boolean"],
    before: "uniqueItems",
    trackErrors: !0,
    error: {
      message: ({ params: { min: u, max: s } }) => s === void 0 ? (0, e.str)`must contain at least ${u} valid item(s)` : (0, e.str)`must contain at least ${u} and no more than ${s} valid item(s)`,
      params: ({ params: { min: u, max: s } }) => s === void 0 ? (0, e._)`{minContains: ${u}}` : (0, e._)`{minContains: ${u}, maxContains: ${s}}`
    },
    code(u) {
      const { gen: s, schema: o, parentSchema: d, data: a, it: l } = u;
      let n, f;
      const { minContains: c, maxContains: h } = d;
      l.opts.next ? (n = c === void 0 ? 1 : c, f = h) : n = 1;
      const y = s.const("len", (0, e._)`${a}.length`);
      if (u.setParams({ min: n, max: f }), f === void 0 && n === 0) {
        (0, t.checkStrictMode)(l, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
        return;
      }
      if (f !== void 0 && n > f) {
        (0, t.checkStrictMode)(l, '"minContains" > "maxContains" is always invalid'), u.fail();
        return;
      }
      if ((0, t.alwaysValidSchema)(l, o)) {
        let w = (0, e._)`${y} >= ${n}`;
        f !== void 0 && (w = (0, e._)`${w} && ${y} <= ${f}`), u.pass(w);
        return;
      }
      l.items = !0;
      const E = s.name("valid");
      f === void 0 && n === 1 ? v(E, () => s.if(E, () => s.break())) : n === 0 ? (s.let(E, !0), f !== void 0 && s.if((0, e._)`${a}.length > 0`, p)) : (s.let(E, !1), p()), u.result(E, () => u.reset());
      function p() {
        const w = s.name("_valid"), T = s.let("count", 0);
        v(w, () => s.if(w, () => m(T)));
      }
      function v(w, T) {
        s.forRange("i", 0, y, (R) => {
          u.subschema({
            keyword: "contains",
            dataProp: R,
            dataPropType: t.Type.Num,
            compositeRule: !0
          }, w), T();
        });
      }
      function m(w) {
        s.code((0, e._)`${w}++`), f === void 0 ? s.if((0, e._)`${w} >= ${n}`, () => s.assign(E, !0).break()) : (s.if((0, e._)`${w} > ${f}`, () => s.assign(E, !1).break()), n === 1 ? s.assign(E, !0) : s.if((0, e._)`${w} >= ${n}`, () => s.assign(E, !0)));
      }
    }
  };
  return Ei.default = r, Ei;
}
var La = {}, Xc;
function D0() {
  return Xc || (Xc = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.validateSchemaDeps = e.validatePropertyDeps = e.error = void 0;
    const t = Oe(), i = Pe(), r = bt();
    e.error = {
      message: ({ params: { property: a, depsCount: l, deps: n } }) => {
        const f = l === 1 ? "property" : "properties";
        return (0, t.str)`must have ${f} ${n} when property ${a} is present`;
      },
      params: ({ params: { property: a, depsCount: l, deps: n, missingProperty: f } }) => (0, t._)`{property: ${a},
    missingProperty: ${f},
    depsCount: ${l},
    deps: ${n}}`
      // TODO change to reference
    };
    const u = {
      keyword: "dependencies",
      type: "object",
      schemaType: "object",
      error: e.error,
      code(a) {
        const [l, n] = s(a);
        o(a, l), d(a, n);
      }
    };
    function s({ schema: a }) {
      const l = {}, n = {};
      for (const f in a) {
        if (f === "__proto__")
          continue;
        const c = Array.isArray(a[f]) ? l : n;
        c[f] = a[f];
      }
      return [l, n];
    }
    function o(a, l = a.schema) {
      const { gen: n, data: f, it: c } = a;
      if (Object.keys(l).length === 0)
        return;
      const h = n.let("missing");
      for (const y in l) {
        const E = l[y];
        if (E.length === 0)
          continue;
        const p = (0, r.propertyInData)(n, f, y, c.opts.ownProperties);
        a.setParams({
          property: y,
          depsCount: E.length,
          deps: E.join(", ")
        }), c.allErrors ? n.if(p, () => {
          for (const v of E)
            (0, r.checkReportMissingProp)(a, v);
        }) : (n.if((0, t._)`${p} && (${(0, r.checkMissingProp)(a, E, h)})`), (0, r.reportMissingProp)(a, h), n.else());
      }
    }
    e.validatePropertyDeps = o;
    function d(a, l = a.schema) {
      const { gen: n, data: f, keyword: c, it: h } = a, y = n.name("valid");
      for (const E in l)
        (0, i.alwaysValidSchema)(h, l[E]) || (n.if(
          (0, r.propertyInData)(n, f, E, h.opts.ownProperties),
          () => {
            const p = a.subschema({ keyword: c, schemaProp: E }, y);
            a.mergeValidEvaluated(p, y);
          },
          () => n.var(y, !0)
          // TODO var
        ), a.ok(y));
    }
    e.validateSchemaDeps = d, e.default = u;
  })(La)), La;
}
var vi = {}, Yc;
function L0() {
  if (Yc) return vi;
  Yc = 1, Object.defineProperty(vi, "__esModule", { value: !0 });
  const e = Oe(), t = Pe(), r = {
    keyword: "propertyNames",
    type: "object",
    schemaType: ["object", "boolean"],
    error: {
      message: "property name must be valid",
      params: ({ params: u }) => (0, e._)`{propertyName: ${u.propertyName}}`
    },
    code(u) {
      const { gen: s, schema: o, data: d, it: a } = u;
      if ((0, t.alwaysValidSchema)(a, o))
        return;
      const l = s.name("valid");
      s.forIn("key", d, (n) => {
        u.setParams({ propertyName: n }), u.subschema({
          keyword: "propertyNames",
          data: n,
          dataTypes: ["string"],
          propertyName: n,
          compositeRule: !0
        }, l), s.if((0, e.not)(l), () => {
          u.error(!0), a.allErrors || s.break();
        });
      }), u.ok(l);
    }
  };
  return vi.default = r, vi;
}
var _i = {}, Wc;
function km() {
  if (Wc) return _i;
  Wc = 1, Object.defineProperty(_i, "__esModule", { value: !0 });
  const e = bt(), t = Oe(), i = Jt(), r = Pe(), s = {
    keyword: "additionalProperties",
    type: ["object"],
    schemaType: ["boolean", "object"],
    allowUndefined: !0,
    trackErrors: !0,
    error: {
      message: "must NOT have additional properties",
      params: ({ params: o }) => (0, t._)`{additionalProperty: ${o.additionalProperty}}`
    },
    code(o) {
      const { gen: d, schema: a, parentSchema: l, data: n, errsCount: f, it: c } = o;
      if (!f)
        throw new Error("ajv implementation error");
      const { allErrors: h, opts: y } = c;
      if (c.props = !0, y.removeAdditional !== "all" && (0, r.alwaysValidSchema)(c, a))
        return;
      const E = (0, e.allSchemaProperties)(l.properties), p = (0, e.allSchemaProperties)(l.patternProperties);
      v(), o.ok((0, t._)`${f} === ${i.default.errors}`);
      function v() {
        d.forIn("key", n, (_) => {
          !E.length && !p.length ? T(_) : d.if(m(_), () => T(_));
        });
      }
      function m(_) {
        let S;
        if (E.length > 8) {
          const A = (0, r.schemaRefOrVal)(c, l.properties, "properties");
          S = (0, e.isOwnProperty)(d, A, _);
        } else E.length ? S = (0, t.or)(...E.map((A) => (0, t._)`${_} === ${A}`)) : S = t.nil;
        return p.length && (S = (0, t.or)(S, ...p.map((A) => (0, t._)`${(0, e.usePattern)(o, A)}.test(${_})`))), (0, t.not)(S);
      }
      function w(_) {
        d.code((0, t._)`delete ${n}[${_}]`);
      }
      function T(_) {
        if (y.removeAdditional === "all" || y.removeAdditional && a === !1) {
          w(_);
          return;
        }
        if (a === !1) {
          o.setParams({ additionalProperty: _ }), o.error(), h || d.break();
          return;
        }
        if (typeof a == "object" && !(0, r.alwaysValidSchema)(c, a)) {
          const S = d.name("valid");
          y.removeAdditional === "failing" ? (R(_, S, !1), d.if((0, t.not)(S), () => {
            o.reset(), w(_);
          })) : (R(_, S), h || d.if((0, t.not)(S), () => d.break()));
        }
      }
      function R(_, S, A) {
        const b = {
          keyword: "additionalProperties",
          dataProp: _,
          dataPropType: r.Type.Str
        };
        A === !1 && Object.assign(b, {
          compositeRule: !0,
          createErrors: !1,
          allErrors: !1
        }), o.subschema(b, S);
      }
    }
  };
  return _i.default = s, _i;
}
var wi = {}, Kc;
function k0() {
  if (Kc) return wi;
  Kc = 1, Object.defineProperty(wi, "__esModule", { value: !0 });
  const e = ia(), t = bt(), i = Pe(), r = km(), u = {
    keyword: "properties",
    type: "object",
    schemaType: "object",
    code(s) {
      const { gen: o, schema: d, parentSchema: a, data: l, it: n } = s;
      n.opts.removeAdditional === "all" && a.additionalProperties === void 0 && r.default.code(new e.KeywordCxt(n, r.default, "additionalProperties"));
      const f = (0, t.allSchemaProperties)(d);
      for (const p of f)
        n.definedProperties.add(p);
      n.opts.unevaluated && f.length && n.props !== !0 && (n.props = i.mergeEvaluated.props(o, (0, i.toHash)(f), n.props));
      const c = f.filter((p) => !(0, i.alwaysValidSchema)(n, d[p]));
      if (c.length === 0)
        return;
      const h = o.name("valid");
      for (const p of c)
        y(p) ? E(p) : (o.if((0, t.propertyInData)(o, l, p, n.opts.ownProperties)), E(p), n.allErrors || o.else().var(h, !0), o.endIf()), s.it.definedProperties.add(p), s.ok(h);
      function y(p) {
        return n.opts.useDefaults && !n.compositeRule && d[p].default !== void 0;
      }
      function E(p) {
        s.subschema({
          keyword: "properties",
          schemaProp: p,
          dataProp: p
        }, h);
      }
    }
  };
  return wi.default = u, wi;
}
var Si = {}, Jc;
function F0() {
  if (Jc) return Si;
  Jc = 1, Object.defineProperty(Si, "__esModule", { value: !0 });
  const e = bt(), t = Oe(), i = Pe(), r = Pe(), u = {
    keyword: "patternProperties",
    type: "object",
    schemaType: "object",
    code(s) {
      const { gen: o, schema: d, data: a, parentSchema: l, it: n } = s, { opts: f } = n, c = (0, e.allSchemaProperties)(d), h = c.filter((T) => (0, i.alwaysValidSchema)(n, d[T]));
      if (c.length === 0 || h.length === c.length && (!n.opts.unevaluated || n.props === !0))
        return;
      const y = f.strictSchema && !f.allowMatchingProperties && l.properties, E = o.name("valid");
      n.props !== !0 && !(n.props instanceof t.Name) && (n.props = (0, r.evaluatedPropsToName)(o, n.props));
      const { props: p } = n;
      v();
      function v() {
        for (const T of c)
          y && m(T), n.allErrors ? w(T) : (o.var(E, !0), w(T), o.if(E));
      }
      function m(T) {
        for (const R in y)
          new RegExp(T).test(R) && (0, i.checkStrictMode)(n, `property ${R} matches pattern ${T} (use allowMatchingProperties)`);
      }
      function w(T) {
        o.forIn("key", a, (R) => {
          o.if((0, t._)`${(0, e.usePattern)(s, T)}.test(${R})`, () => {
            const _ = h.includes(T);
            _ || s.subschema({
              keyword: "patternProperties",
              schemaProp: T,
              dataProp: R,
              dataPropType: r.Type.Str
            }, E), n.opts.unevaluated && p !== !0 ? o.assign((0, t._)`${p}[${R}]`, !0) : !_ && !n.allErrors && o.if((0, t.not)(E), () => o.break());
          });
        });
      }
    }
  };
  return Si.default = u, Si;
}
var Ti = {}, Qc;
function U0() {
  if (Qc) return Ti;
  Qc = 1, Object.defineProperty(Ti, "__esModule", { value: !0 });
  const e = Pe(), t = {
    keyword: "not",
    schemaType: ["object", "boolean"],
    trackErrors: !0,
    code(i) {
      const { gen: r, schema: u, it: s } = i;
      if ((0, e.alwaysValidSchema)(s, u)) {
        i.fail();
        return;
      }
      const o = r.name("valid");
      i.subschema({
        keyword: "not",
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }, o), i.failResult(o, () => i.reset(), () => i.error());
    },
    error: { message: "must NOT be valid" }
  };
  return Ti.default = t, Ti;
}
var Ri = {}, Zc;
function q0() {
  if (Zc) return Ri;
  Zc = 1, Object.defineProperty(Ri, "__esModule", { value: !0 });
  const t = {
    keyword: "anyOf",
    schemaType: "array",
    trackErrors: !0,
    code: bt().validateUnion,
    error: { message: "must match a schema in anyOf" }
  };
  return Ri.default = t, Ri;
}
var bi = {}, ef;
function x0() {
  if (ef) return bi;
  ef = 1, Object.defineProperty(bi, "__esModule", { value: !0 });
  const e = Oe(), t = Pe(), r = {
    keyword: "oneOf",
    schemaType: "array",
    trackErrors: !0,
    error: {
      message: "must match exactly one schema in oneOf",
      params: ({ params: u }) => (0, e._)`{passingSchemas: ${u.passing}}`
    },
    code(u) {
      const { gen: s, schema: o, parentSchema: d, it: a } = u;
      if (!Array.isArray(o))
        throw new Error("ajv implementation error");
      if (a.opts.discriminator && d.discriminator)
        return;
      const l = o, n = s.let("valid", !1), f = s.let("passing", null), c = s.name("_valid");
      u.setParams({ passing: f }), s.block(h), u.result(n, () => u.reset(), () => u.error(!0));
      function h() {
        l.forEach((y, E) => {
          let p;
          (0, t.alwaysValidSchema)(a, y) ? s.var(c, !0) : p = u.subschema({
            keyword: "oneOf",
            schemaProp: E,
            compositeRule: !0
          }, c), E > 0 && s.if((0, e._)`${c} && ${n}`).assign(n, !1).assign(f, (0, e._)`[${f}, ${E}]`).else(), s.if(c, () => {
            s.assign(n, !0), s.assign(f, E), p && u.mergeEvaluated(p, e.Name);
          });
        });
      }
    }
  };
  return bi.default = r, bi;
}
var Ai = {}, tf;
function M0() {
  if (tf) return Ai;
  tf = 1, Object.defineProperty(Ai, "__esModule", { value: !0 });
  const e = Pe(), t = {
    keyword: "allOf",
    schemaType: "array",
    code(i) {
      const { gen: r, schema: u, it: s } = i;
      if (!Array.isArray(u))
        throw new Error("ajv implementation error");
      const o = r.name("valid");
      u.forEach((d, a) => {
        if ((0, e.alwaysValidSchema)(s, d))
          return;
        const l = i.subschema({ keyword: "allOf", schemaProp: a }, o);
        i.ok(o), i.mergeEvaluated(l);
      });
    }
  };
  return Ai.default = t, Ai;
}
var Oi = {}, rf;
function j0() {
  if (rf) return Oi;
  rf = 1, Object.defineProperty(Oi, "__esModule", { value: !0 });
  const e = Oe(), t = Pe(), r = {
    keyword: "if",
    schemaType: ["object", "boolean"],
    trackErrors: !0,
    error: {
      message: ({ params: s }) => (0, e.str)`must match "${s.ifClause}" schema`,
      params: ({ params: s }) => (0, e._)`{failingKeyword: ${s.ifClause}}`
    },
    code(s) {
      const { gen: o, parentSchema: d, it: a } = s;
      d.then === void 0 && d.else === void 0 && (0, t.checkStrictMode)(a, '"if" without "then" and "else" is ignored');
      const l = u(a, "then"), n = u(a, "else");
      if (!l && !n)
        return;
      const f = o.let("valid", !0), c = o.name("_valid");
      if (h(), s.reset(), l && n) {
        const E = o.let("ifClause");
        s.setParams({ ifClause: E }), o.if(c, y("then", E), y("else", E));
      } else l ? o.if(c, y("then")) : o.if((0, e.not)(c), y("else"));
      s.pass(f, () => s.error(!0));
      function h() {
        const E = s.subschema({
          keyword: "if",
          compositeRule: !0,
          createErrors: !1,
          allErrors: !1
        }, c);
        s.mergeEvaluated(E);
      }
      function y(E, p) {
        return () => {
          const v = s.subschema({ keyword: E }, c);
          o.assign(f, c), s.mergeValidEvaluated(v, f), p ? o.assign(p, (0, e._)`${E}`) : s.setParams({ ifClause: E });
        };
      }
    }
  };
  function u(s, o) {
    const d = s.schema[o];
    return d !== void 0 && !(0, t.alwaysValidSchema)(s, d);
  }
  return Oi.default = r, Oi;
}
var Ni = {}, nf;
function G0() {
  if (nf) return Ni;
  nf = 1, Object.defineProperty(Ni, "__esModule", { value: !0 });
  const e = Pe(), t = {
    keyword: ["then", "else"],
    schemaType: ["object", "boolean"],
    code({ keyword: i, parentSchema: r, it: u }) {
      r.if === void 0 && (0, e.checkStrictMode)(u, `"${i}" without "if" is ignored`);
    }
  };
  return Ni.default = t, Ni;
}
var af;
function H0() {
  if (af) return mi;
  af = 1, Object.defineProperty(mi, "__esModule", { value: !0 });
  const e = Dm(), t = I0(), i = Lm(), r = P0(), u = C0(), s = D0(), o = L0(), d = km(), a = k0(), l = F0(), n = U0(), f = q0(), c = x0(), h = M0(), y = j0(), E = G0();
  function p(v = !1) {
    const m = [
      // any
      n.default,
      f.default,
      c.default,
      h.default,
      y.default,
      E.default,
      // object
      o.default,
      d.default,
      s.default,
      a.default,
      l.default
    ];
    return v ? m.push(t.default, r.default) : m.push(e.default, i.default), m.push(u.default), m;
  }
  return mi.default = p, mi;
}
var $i = {}, Ii = {}, sf;
function B0() {
  if (sf) return Ii;
  sf = 1, Object.defineProperty(Ii, "__esModule", { value: !0 });
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
      const { gen: s, data: o, $data: d, schema: a, schemaCode: l, it: n } = r, { opts: f, errSchemaPath: c, schemaEnv: h, self: y } = n;
      if (!f.validateFormats)
        return;
      d ? E() : p();
      function E() {
        const v = s.scopeValue("formats", {
          ref: y.formats,
          code: f.code.formats
        }), m = s.const("fDef", (0, e._)`${v}[${l}]`), w = s.let("fType"), T = s.let("format");
        s.if((0, e._)`typeof ${m} == "object" && !(${m} instanceof RegExp)`, () => s.assign(w, (0, e._)`${m}.type || "string"`).assign(T, (0, e._)`${m}.validate`), () => s.assign(w, (0, e._)`"string"`).assign(T, m)), r.fail$data((0, e.or)(R(), _()));
        function R() {
          return f.strictSchema === !1 ? e.nil : (0, e._)`${l} && !${T}`;
        }
        function _() {
          const S = h.$async ? (0, e._)`(${m}.async ? await ${T}(${o}) : ${T}(${o}))` : (0, e._)`${T}(${o})`, A = (0, e._)`(typeof ${T} == "function" ? ${S} : ${T}.test(${o}))`;
          return (0, e._)`${T} && ${T} !== true && ${w} === ${u} && !${A}`;
        }
      }
      function p() {
        const v = y.formats[a];
        if (!v) {
          R();
          return;
        }
        if (v === !0)
          return;
        const [m, w, T] = _(v);
        m === u && r.pass(S());
        function R() {
          if (f.strictSchema === !1) {
            y.logger.warn(A());
            return;
          }
          throw new Error(A());
          function A() {
            return `unknown format "${a}" ignored in schema at path "${c}"`;
          }
        }
        function _(A) {
          const b = A instanceof RegExp ? (0, e.regexpCode)(A) : f.code.formats ? (0, e._)`${f.code.formats}${(0, e.getProperty)(a)}` : void 0, x = s.scopeValue("formats", { key: a, ref: A, code: b });
          return typeof A == "object" && !(A instanceof RegExp) ? [A.type || "string", A.validate, (0, e._)`${x}.validate`] : ["string", A, x];
        }
        function S() {
          if (typeof v == "object" && !(v instanceof RegExp) && v.async) {
            if (!h.$async)
              throw new Error("async format in sync schema");
            return (0, e._)`await ${T}(${o})`;
          }
          return typeof w == "function" ? (0, e._)`${T}(${o})` : (0, e._)`${T}.test(${o})`;
        }
      }
    }
  };
  return Ii.default = i, Ii;
}
var of;
function V0() {
  if (of) return $i;
  of = 1, Object.defineProperty($i, "__esModule", { value: !0 });
  const t = [B0().default];
  return $i.default = t, $i;
}
var ur = {}, uf;
function z0() {
  return uf || (uf = 1, Object.defineProperty(ur, "__esModule", { value: !0 }), ur.contentVocabulary = ur.metadataVocabulary = void 0, ur.metadataVocabulary = [
    "title",
    "description",
    "default",
    "deprecated",
    "readOnly",
    "writeOnly",
    "examples"
  ], ur.contentVocabulary = [
    "contentMediaType",
    "contentEncoding",
    "contentSchema"
  ]), ur;
}
var lf;
function X0() {
  if (lf) return Zn;
  lf = 1, Object.defineProperty(Zn, "__esModule", { value: !0 });
  const e = y0(), t = $0(), i = H0(), r = V0(), u = z0(), s = [
    e.default,
    t.default,
    (0, i.default)(),
    r.default,
    u.metadataVocabulary,
    u.contentVocabulary
  ];
  return Zn.default = s, Zn;
}
var Pi = {}, Hr = {}, cf;
function Y0() {
  if (cf) return Hr;
  cf = 1, Object.defineProperty(Hr, "__esModule", { value: !0 }), Hr.DiscrError = void 0;
  var e;
  return (function(t) {
    t.Tag = "tag", t.Mapping = "mapping";
  })(e || (Hr.DiscrError = e = {})), Hr;
}
var ff;
function W0() {
  if (ff) return Pi;
  ff = 1, Object.defineProperty(Pi, "__esModule", { value: !0 });
  const e = Oe(), t = Y0(), i = Gu(), r = aa(), u = Pe(), o = {
    keyword: "discriminator",
    type: "object",
    schemaType: "object",
    error: {
      message: ({ params: { discrError: d, tagName: a } }) => d === t.DiscrError.Tag ? `tag "${a}" must be string` : `value of tag "${a}" must be in oneOf`,
      params: ({ params: { discrError: d, tag: a, tagName: l } }) => (0, e._)`{error: ${d}, tag: ${l}, tagValue: ${a}}`
    },
    code(d) {
      const { gen: a, data: l, schema: n, parentSchema: f, it: c } = d, { oneOf: h } = f;
      if (!c.opts.discriminator)
        throw new Error("discriminator: requires discriminator option");
      const y = n.propertyName;
      if (typeof y != "string")
        throw new Error("discriminator: requires propertyName");
      if (n.mapping)
        throw new Error("discriminator: mapping is not supported");
      if (!h)
        throw new Error("discriminator: requires oneOf keyword");
      const E = a.let("valid", !1), p = a.const("tag", (0, e._)`${l}${(0, e.getProperty)(y)}`);
      a.if((0, e._)`typeof ${p} == "string"`, () => v(), () => d.error(!1, { discrError: t.DiscrError.Tag, tag: p, tagName: y })), d.ok(E);
      function v() {
        const T = w();
        a.if(!1);
        for (const R in T)
          a.elseIf((0, e._)`${p} === ${R}`), a.assign(E, m(T[R]));
        a.else(), d.error(!1, { discrError: t.DiscrError.Mapping, tag: p, tagName: y }), a.endIf();
      }
      function m(T) {
        const R = a.name("valid"), _ = d.subschema({ keyword: "oneOf", schemaProp: T }, R);
        return d.mergeEvaluated(_, e.Name), R;
      }
      function w() {
        var T;
        const R = {}, _ = A(f);
        let S = !0;
        for (let M = 0; M < h.length; M++) {
          let j = h[M];
          if (j?.$ref && !(0, u.schemaHasRulesButRef)(j, c.self.RULES)) {
            const P = j.$ref;
            if (j = i.resolveRef.call(c.self, c.schemaEnv.root, c.baseId, P), j instanceof i.SchemaEnv && (j = j.schema), j === void 0)
              throw new r.default(c.opts.uriResolver, c.baseId, P);
          }
          const X = (T = j?.properties) === null || T === void 0 ? void 0 : T[y];
          if (typeof X != "object")
            throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${y}"`);
          S = S && (_ || A(j)), b(X, M);
        }
        if (!S)
          throw new Error(`discriminator: "${y}" must be required`);
        return R;
        function A({ required: M }) {
          return Array.isArray(M) && M.includes(y);
        }
        function b(M, j) {
          if (M.const)
            x(M.const, j);
          else if (M.enum)
            for (const X of M.enum)
              x(X, j);
          else
            throw new Error(`discriminator: "properties/${y}" must have "const" or "enum"`);
        }
        function x(M, j) {
          if (typeof M != "string" || M in R)
            throw new Error(`discriminator: "${y}" values must be unique strings`);
          R[M] = j;
        }
      }
    }
  };
  return Pi.default = o, Pi;
}
const K0 = "http://json-schema.org/draft-07/schema#", J0 = "http://json-schema.org/draft-07/schema#", Q0 = "Core schema meta-schema", Z0 = { schemaArray: { type: "array", minItems: 1, items: { $ref: "#" } }, nonNegativeInteger: { type: "integer", minimum: 0 }, nonNegativeIntegerDefault0: { allOf: [{ $ref: "#/definitions/nonNegativeInteger" }, { default: 0 }] }, simpleTypes: { enum: ["array", "boolean", "integer", "null", "number", "object", "string"] }, stringArray: { type: "array", items: { type: "string" }, uniqueItems: !0, default: [] } }, eE = ["object", "boolean"], tE = { $id: { type: "string", format: "uri-reference" }, $schema: { type: "string", format: "uri" }, $ref: { type: "string", format: "uri-reference" }, $comment: { type: "string" }, title: { type: "string" }, description: { type: "string" }, default: !0, readOnly: { type: "boolean", default: !1 }, examples: { type: "array", items: !0 }, multipleOf: { type: "number", exclusiveMinimum: 0 }, maximum: { type: "number" }, exclusiveMaximum: { type: "number" }, minimum: { type: "number" }, exclusiveMinimum: { type: "number" }, maxLength: { $ref: "#/definitions/nonNegativeInteger" }, minLength: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, pattern: { type: "string", format: "regex" }, additionalItems: { $ref: "#" }, items: { anyOf: [{ $ref: "#" }, { $ref: "#/definitions/schemaArray" }], default: !0 }, maxItems: { $ref: "#/definitions/nonNegativeInteger" }, minItems: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, uniqueItems: { type: "boolean", default: !1 }, contains: { $ref: "#" }, maxProperties: { $ref: "#/definitions/nonNegativeInteger" }, minProperties: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, required: { $ref: "#/definitions/stringArray" }, additionalProperties: { $ref: "#" }, definitions: { type: "object", additionalProperties: { $ref: "#" }, default: {} }, properties: { type: "object", additionalProperties: { $ref: "#" }, default: {} }, patternProperties: { type: "object", additionalProperties: { $ref: "#" }, propertyNames: { format: "regex" }, default: {} }, dependencies: { type: "object", additionalProperties: { anyOf: [{ $ref: "#" }, { $ref: "#/definitions/stringArray" }] } }, propertyNames: { $ref: "#" }, const: !0, enum: { type: "array", items: !0, minItems: 1, uniqueItems: !0 }, type: { anyOf: [{ $ref: "#/definitions/simpleTypes" }, { type: "array", items: { $ref: "#/definitions/simpleTypes" }, minItems: 1, uniqueItems: !0 }] }, format: { type: "string" }, contentMediaType: { type: "string" }, contentEncoding: { type: "string" }, if: { $ref: "#" }, then: { $ref: "#" }, else: { $ref: "#" }, allOf: { $ref: "#/definitions/schemaArray" }, anyOf: { $ref: "#/definitions/schemaArray" }, oneOf: { $ref: "#/definitions/schemaArray" }, not: { $ref: "#" } }, rE = {
  $schema: K0,
  $id: J0,
  title: Q0,
  definitions: Z0,
  type: eE,
  properties: tE,
  default: !0
};
var df;
function Fm() {
  return df || (df = 1, (function(e, t) {
    Object.defineProperty(t, "__esModule", { value: !0 }), t.MissingRefError = t.ValidationError = t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = t.Ajv = void 0;
    const i = p0(), r = X0(), u = W0(), s = rE, o = ["/properties"], d = "http://json-schema.org/draft-07/schema";
    class a extends i.default {
      _addVocabularies() {
        super._addVocabularies(), r.default.forEach((y) => this.addVocabulary(y)), this.opts.discriminator && this.addKeyword(u.default);
      }
      _addDefaultMetaSchema() {
        if (super._addDefaultMetaSchema(), !this.opts.meta)
          return;
        const y = this.opts.$data ? this.$dataMetaSchema(s, o) : s;
        this.addMetaSchema(y, d, !1), this.refs["http://json-schema.org/schema"] = d;
      }
      defaultMeta() {
        return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(d) ? d : void 0);
      }
    }
    t.Ajv = a, e.exports = t = a, e.exports.Ajv = a, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = a;
    var l = ia();
    Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
      return l.KeywordCxt;
    } });
    var n = Oe();
    Object.defineProperty(t, "_", { enumerable: !0, get: function() {
      return n._;
    } }), Object.defineProperty(t, "str", { enumerable: !0, get: function() {
      return n.str;
    } }), Object.defineProperty(t, "stringify", { enumerable: !0, get: function() {
      return n.stringify;
    } }), Object.defineProperty(t, "nil", { enumerable: !0, get: function() {
      return n.nil;
    } }), Object.defineProperty(t, "Name", { enumerable: !0, get: function() {
      return n.Name;
    } }), Object.defineProperty(t, "CodeGen", { enumerable: !0, get: function() {
      return n.CodeGen;
    } });
    var f = ju();
    Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
      return f.default;
    } });
    var c = aa();
    Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
      return c.default;
    } });
  })(Yn, Yn.exports)), Yn.exports;
}
var Ci = { exports: {} }, ka = {}, hf;
function nE() {
  return hf || (hf = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.formatNames = e.fastFormats = e.fullFormats = void 0;
    function t(b, x) {
      return { validate: b, compare: x };
    }
    e.fullFormats = {
      // date: http://tools.ietf.org/html/rfc3339#section-5.6
      date: t(s, o),
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
      regex: A,
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
      byte: v,
      // signed 32 bit integer
      int32: { type: "number", validate: T },
      // signed 64 bit integer
      int64: { type: "number", validate: R },
      // C-type float
      float: { type: "number", validate: _ },
      // C-type double
      double: { type: "number", validate: _ },
      // hint to the UI to hide input strings
      password: !0,
      // unchecked string payload
      binary: !0
    }, e.fastFormats = {
      ...e.fullFormats,
      date: t(/^\d\d\d\d-[0-1]\d-[0-3]\d$/, o),
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
    function i(b) {
      return b % 4 === 0 && (b % 100 !== 0 || b % 400 === 0);
    }
    const r = /^(\d\d\d\d)-(\d\d)-(\d\d)$/, u = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    function s(b) {
      const x = r.exec(b);
      if (!x)
        return !1;
      const M = +x[1], j = +x[2], X = +x[3];
      return j >= 1 && j <= 12 && X >= 1 && X <= (j === 2 && i(M) ? 29 : u[j]);
    }
    function o(b, x) {
      if (b && x)
        return b > x ? 1 : b < x ? -1 : 0;
    }
    const d = /^(\d\d):(\d\d):(\d\d)(\.\d+)?(z|[+-]\d\d(?::?\d\d)?)?$/i;
    function a(b, x) {
      const M = d.exec(b);
      if (!M)
        return !1;
      const j = +M[1], X = +M[2], P = +M[3], D = M[5];
      return (j <= 23 && X <= 59 && P <= 59 || j === 23 && X === 59 && P === 60) && (!x || D !== "");
    }
    function l(b, x) {
      if (!(b && x))
        return;
      const M = d.exec(b), j = d.exec(x);
      if (M && j)
        return b = M[1] + M[2] + M[3] + (M[4] || ""), x = j[1] + j[2] + j[3] + (j[4] || ""), b > x ? 1 : b < x ? -1 : 0;
    }
    const n = /t|\s/i;
    function f(b) {
      const x = b.split(n);
      return x.length === 2 && s(x[0]) && a(x[1], !0);
    }
    function c(b, x) {
      if (!(b && x))
        return;
      const [M, j] = b.split(n), [X, P] = x.split(n), D = o(M, X);
      if (D !== void 0)
        return D || l(j, P);
    }
    const h = /\/|:/, y = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
    function E(b) {
      return h.test(b) && y.test(b);
    }
    const p = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/gm;
    function v(b) {
      return p.lastIndex = 0, p.test(b);
    }
    const m = -2147483648, w = 2 ** 31 - 1;
    function T(b) {
      return Number.isInteger(b) && b <= w && b >= m;
    }
    function R(b) {
      return Number.isInteger(b);
    }
    function _() {
      return !0;
    }
    const S = /[^\\]\\Z/;
    function A(b) {
      if (S.test(b))
        return !1;
      try {
        return new RegExp(b), !0;
      } catch {
        return !1;
      }
    }
  })(ka)), ka;
}
var Fa = {}, pf;
function iE() {
  return pf || (pf = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.formatLimitDefinition = void 0;
    const t = Fm(), i = Oe(), r = i.operators, u = {
      formatMaximum: { okStr: "<=", ok: r.LTE, fail: r.GT },
      formatMinimum: { okStr: ">=", ok: r.GTE, fail: r.LT },
      formatExclusiveMaximum: { okStr: "<", ok: r.LT, fail: r.GTE },
      formatExclusiveMinimum: { okStr: ">", ok: r.GT, fail: r.LTE }
    }, s = {
      message: ({ keyword: d, schemaCode: a }) => i.str`should be ${u[d].okStr} ${a}`,
      params: ({ keyword: d, schemaCode: a }) => i._`{comparison: ${u[d].okStr}, limit: ${a}}`
    };
    e.formatLimitDefinition = {
      keyword: Object.keys(u),
      type: "string",
      schemaType: "string",
      $data: !0,
      error: s,
      code(d) {
        const { gen: a, data: l, schemaCode: n, keyword: f, it: c } = d, { opts: h, self: y } = c;
        if (!h.validateFormats)
          return;
        const E = new t.KeywordCxt(c, y.RULES.all.format.definition, "format");
        E.$data ? p() : v();
        function p() {
          const w = a.scopeValue("formats", {
            ref: y.formats,
            code: h.code.formats
          }), T = a.const("fmt", i._`${w}[${E.schemaCode}]`);
          d.fail$data(i.or(i._`typeof ${T} != "object"`, i._`${T} instanceof RegExp`, i._`typeof ${T}.compare != "function"`, m(T)));
        }
        function v() {
          const w = E.schema, T = y.formats[w];
          if (!T || T === !0)
            return;
          if (typeof T != "object" || T instanceof RegExp || typeof T.compare != "function")
            throw new Error(`"${f}": format "${w}" does not define "compare" function`);
          const R = a.scopeValue("formats", {
            key: w,
            ref: T,
            code: h.code.formats ? i._`${h.code.formats}${i.getProperty(w)}` : void 0
          });
          d.fail$data(m(R));
        }
        function m(w) {
          return i._`${w}.compare(${l}, ${n}) ${u[f].fail} 0`;
        }
      },
      dependencies: ["format"]
    };
    const o = (d) => (d.addKeyword(e.formatLimitDefinition), d);
    e.default = o;
  })(Fa)), Fa;
}
var mf;
function aE() {
  return mf || (mf = 1, (function(e, t) {
    Object.defineProperty(t, "__esModule", { value: !0 });
    const i = nE(), r = iE(), u = Oe(), s = new u.Name("fullFormats"), o = new u.Name("fastFormats"), d = (l, n = { keywords: !0 }) => {
      if (Array.isArray(n))
        return a(l, n, i.fullFormats, s), l;
      const [f, c] = n.mode === "fast" ? [i.fastFormats, o] : [i.fullFormats, s], h = n.formats || i.formatNames;
      return a(l, h, f, c), n.keywords && r.default(l), l;
    };
    d.get = (l, n = "full") => {
      const c = (n === "fast" ? i.fastFormats : i.fullFormats)[l];
      if (!c)
        throw new Error(`Unknown format "${l}"`);
      return c;
    };
    function a(l, n, f, c) {
      var h, y;
      (h = (y = l.opts.code).formats) !== null && h !== void 0 || (y.formats = u._`require("ajv-formats/dist/formats").${c}`);
      for (const E of n)
        l.addFormat(E, f[E]);
    }
    e.exports = t = d, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = d;
  })(Ci, Ci.exports)), Ci.exports;
}
var Ua, gf;
function sE() {
  if (gf) return Ua;
  gf = 1;
  const e = (a, l, n, f) => {
    if (n === "length" || n === "prototype" || n === "arguments" || n === "caller")
      return;
    const c = Object.getOwnPropertyDescriptor(a, n), h = Object.getOwnPropertyDescriptor(l, n);
    !t(c, h) && f || Object.defineProperty(a, n, h);
  }, t = function(a, l) {
    return a === void 0 || a.configurable || a.writable === l.writable && a.enumerable === l.enumerable && a.configurable === l.configurable && (a.writable || a.value === l.value);
  }, i = (a, l) => {
    const n = Object.getPrototypeOf(l);
    n !== Object.getPrototypeOf(a) && Object.setPrototypeOf(a, n);
  }, r = (a, l) => `/* Wrapped ${a}*/
${l}`, u = Object.getOwnPropertyDescriptor(Function.prototype, "toString"), s = Object.getOwnPropertyDescriptor(Function.prototype.toString, "name"), o = (a, l, n) => {
    const f = n === "" ? "" : `with ${n.trim()}() `, c = r.bind(null, f, l.toString());
    Object.defineProperty(c, "name", s), Object.defineProperty(a, "toString", { ...u, value: c });
  };
  return Ua = (a, l, { ignoreNonConfigurable: n = !1 } = {}) => {
    const { name: f } = a;
    for (const c of Reflect.ownKeys(l))
      e(a, l, c, n);
    return i(a, l), o(a, l, f), a;
  }, Ua;
}
var qa, yf;
function oE() {
  if (yf) return qa;
  yf = 1;
  const e = sE();
  return qa = (t, i = {}) => {
    if (typeof t != "function")
      throw new TypeError(`Expected the first argument to be a function, got \`${typeof t}\``);
    const {
      wait: r = 0,
      before: u = !1,
      after: s = !0
    } = i;
    if (!u && !s)
      throw new Error("Both `before` and `after` are false, function wouldn't be called.");
    let o, d;
    const a = function(...l) {
      const n = this, f = () => {
        o = void 0, s && (d = t.apply(n, l));
      }, c = u && !o;
      return clearTimeout(o), o = setTimeout(f, r), c && (d = t.apply(n, l)), d;
    };
    return e(a, t), a.cancel = () => {
      o && (clearTimeout(o), o = void 0);
    }, a;
  }, qa;
}
var Di = { exports: {} }, xa, Ef;
function sa() {
  if (Ef) return xa;
  Ef = 1;
  const e = "2.0.0", t = 256, i = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
  9007199254740991, r = 16, u = t - 6;
  return xa = {
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
  }, xa;
}
var Ma, vf;
function oa() {
  return vf || (vf = 1, Ma = typeof process == "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...t) => console.error("SEMVER", ...t) : () => {
  }), Ma;
}
var _f;
function bn() {
  return _f || (_f = 1, (function(e, t) {
    const {
      MAX_SAFE_COMPONENT_LENGTH: i,
      MAX_SAFE_BUILD_LENGTH: r,
      MAX_LENGTH: u
    } = sa(), s = oa();
    t = e.exports = {};
    const o = t.re = [], d = t.safeRe = [], a = t.src = [], l = t.safeSrc = [], n = t.t = {};
    let f = 0;
    const c = "[a-zA-Z0-9-]", h = [
      ["\\s", 1],
      ["\\d", u],
      [c, r]
    ], y = (p) => {
      for (const [v, m] of h)
        p = p.split(`${v}*`).join(`${v}{0,${m}}`).split(`${v}+`).join(`${v}{1,${m}}`);
      return p;
    }, E = (p, v, m) => {
      const w = y(v), T = f++;
      s(p, T, v), n[p] = T, a[T] = v, l[T] = w, o[T] = new RegExp(v, m ? "g" : void 0), d[T] = new RegExp(w, m ? "g" : void 0);
    };
    E("NUMERICIDENTIFIER", "0|[1-9]\\d*"), E("NUMERICIDENTIFIERLOOSE", "\\d+"), E("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${c}*`), E("MAINVERSION", `(${a[n.NUMERICIDENTIFIER]})\\.(${a[n.NUMERICIDENTIFIER]})\\.(${a[n.NUMERICIDENTIFIER]})`), E("MAINVERSIONLOOSE", `(${a[n.NUMERICIDENTIFIERLOOSE]})\\.(${a[n.NUMERICIDENTIFIERLOOSE]})\\.(${a[n.NUMERICIDENTIFIERLOOSE]})`), E("PRERELEASEIDENTIFIER", `(?:${a[n.NONNUMERICIDENTIFIER]}|${a[n.NUMERICIDENTIFIER]})`), E("PRERELEASEIDENTIFIERLOOSE", `(?:${a[n.NONNUMERICIDENTIFIER]}|${a[n.NUMERICIDENTIFIERLOOSE]})`), E("PRERELEASE", `(?:-(${a[n.PRERELEASEIDENTIFIER]}(?:\\.${a[n.PRERELEASEIDENTIFIER]})*))`), E("PRERELEASELOOSE", `(?:-?(${a[n.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${a[n.PRERELEASEIDENTIFIERLOOSE]})*))`), E("BUILDIDENTIFIER", `${c}+`), E("BUILD", `(?:\\+(${a[n.BUILDIDENTIFIER]}(?:\\.${a[n.BUILDIDENTIFIER]})*))`), E("FULLPLAIN", `v?${a[n.MAINVERSION]}${a[n.PRERELEASE]}?${a[n.BUILD]}?`), E("FULL", `^${a[n.FULLPLAIN]}$`), E("LOOSEPLAIN", `[v=\\s]*${a[n.MAINVERSIONLOOSE]}${a[n.PRERELEASELOOSE]}?${a[n.BUILD]}?`), E("LOOSE", `^${a[n.LOOSEPLAIN]}$`), E("GTLT", "((?:<|>)?=?)"), E("XRANGEIDENTIFIERLOOSE", `${a[n.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`), E("XRANGEIDENTIFIER", `${a[n.NUMERICIDENTIFIER]}|x|X|\\*`), E("XRANGEPLAIN", `[v=\\s]*(${a[n.XRANGEIDENTIFIER]})(?:\\.(${a[n.XRANGEIDENTIFIER]})(?:\\.(${a[n.XRANGEIDENTIFIER]})(?:${a[n.PRERELEASE]})?${a[n.BUILD]}?)?)?`), E("XRANGEPLAINLOOSE", `[v=\\s]*(${a[n.XRANGEIDENTIFIERLOOSE]})(?:\\.(${a[n.XRANGEIDENTIFIERLOOSE]})(?:\\.(${a[n.XRANGEIDENTIFIERLOOSE]})(?:${a[n.PRERELEASELOOSE]})?${a[n.BUILD]}?)?)?`), E("XRANGE", `^${a[n.GTLT]}\\s*${a[n.XRANGEPLAIN]}$`), E("XRANGELOOSE", `^${a[n.GTLT]}\\s*${a[n.XRANGEPLAINLOOSE]}$`), E("COERCEPLAIN", `(^|[^\\d])(\\d{1,${i}})(?:\\.(\\d{1,${i}}))?(?:\\.(\\d{1,${i}}))?`), E("COERCE", `${a[n.COERCEPLAIN]}(?:$|[^\\d])`), E("COERCEFULL", a[n.COERCEPLAIN] + `(?:${a[n.PRERELEASE]})?(?:${a[n.BUILD]})?(?:$|[^\\d])`), E("COERCERTL", a[n.COERCE], !0), E("COERCERTLFULL", a[n.COERCEFULL], !0), E("LONETILDE", "(?:~>?)"), E("TILDETRIM", `(\\s*)${a[n.LONETILDE]}\\s+`, !0), t.tildeTrimReplace = "$1~", E("TILDE", `^${a[n.LONETILDE]}${a[n.XRANGEPLAIN]}$`), E("TILDELOOSE", `^${a[n.LONETILDE]}${a[n.XRANGEPLAINLOOSE]}$`), E("LONECARET", "(?:\\^)"), E("CARETTRIM", `(\\s*)${a[n.LONECARET]}\\s+`, !0), t.caretTrimReplace = "$1^", E("CARET", `^${a[n.LONECARET]}${a[n.XRANGEPLAIN]}$`), E("CARETLOOSE", `^${a[n.LONECARET]}${a[n.XRANGEPLAINLOOSE]}$`), E("COMPARATORLOOSE", `^${a[n.GTLT]}\\s*(${a[n.LOOSEPLAIN]})$|^$`), E("COMPARATOR", `^${a[n.GTLT]}\\s*(${a[n.FULLPLAIN]})$|^$`), E("COMPARATORTRIM", `(\\s*)${a[n.GTLT]}\\s*(${a[n.LOOSEPLAIN]}|${a[n.XRANGEPLAIN]})`, !0), t.comparatorTrimReplace = "$1$2$3", E("HYPHENRANGE", `^\\s*(${a[n.XRANGEPLAIN]})\\s+-\\s+(${a[n.XRANGEPLAIN]})\\s*$`), E("HYPHENRANGELOOSE", `^\\s*(${a[n.XRANGEPLAINLOOSE]})\\s+-\\s+(${a[n.XRANGEPLAINLOOSE]})\\s*$`), E("STAR", "(<|>)?=?\\s*\\*"), E("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"), E("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
  })(Di, Di.exports)), Di.exports;
}
var ja, wf;
function Bu() {
  if (wf) return ja;
  wf = 1;
  const e = Object.freeze({ loose: !0 }), t = Object.freeze({});
  return ja = (r) => r ? typeof r != "object" ? e : r : t, ja;
}
var Ga, Sf;
function Um() {
  if (Sf) return Ga;
  Sf = 1;
  const e = /^[0-9]+$/, t = (r, u) => {
    if (typeof r == "number" && typeof u == "number")
      return r === u ? 0 : r < u ? -1 : 1;
    const s = e.test(r), o = e.test(u);
    return s && o && (r = +r, u = +u), r === u ? 0 : s && !o ? -1 : o && !s ? 1 : r < u ? -1 : 1;
  };
  return Ga = {
    compareIdentifiers: t,
    rcompareIdentifiers: (r, u) => t(u, r)
  }, Ga;
}
var Ha, Tf;
function nt() {
  if (Tf) return Ha;
  Tf = 1;
  const e = oa(), { MAX_LENGTH: t, MAX_SAFE_INTEGER: i } = sa(), { safeRe: r, t: u } = bn(), s = Bu(), { compareIdentifiers: o } = Um();
  class d {
    constructor(l, n) {
      if (n = s(n), l instanceof d) {
        if (l.loose === !!n.loose && l.includePrerelease === !!n.includePrerelease)
          return l;
        l = l.version;
      } else if (typeof l != "string")
        throw new TypeError(`Invalid version. Must be a string. Got type "${typeof l}".`);
      if (l.length > t)
        throw new TypeError(
          `version is longer than ${t} characters`
        );
      e("SemVer", l, n), this.options = n, this.loose = !!n.loose, this.includePrerelease = !!n.includePrerelease;
      const f = l.trim().match(n.loose ? r[u.LOOSE] : r[u.FULL]);
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
          const h = +c;
          if (h >= 0 && h < i)
            return h;
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
      let n = 0;
      do {
        const f = this.prerelease[n], c = l.prerelease[n];
        if (e("prerelease compare", n, f, c), f === void 0 && c === void 0)
          return 0;
        if (c === void 0)
          return 1;
        if (f === void 0)
          return -1;
        if (f === c)
          continue;
        return o(f, c);
      } while (++n);
    }
    compareBuild(l) {
      l instanceof d || (l = new d(l, this.options));
      let n = 0;
      do {
        const f = this.build[n], c = l.build[n];
        if (e("build compare", n, f, c), f === void 0 && c === void 0)
          return 0;
        if (c === void 0)
          return 1;
        if (f === void 0)
          return -1;
        if (f === c)
          continue;
        return o(f, c);
      } while (++n);
    }
    // preminor will bump the version up to the next minor release, and immediately
    // down to pre-release. premajor and prepatch work the same way.
    inc(l, n, f) {
      if (l.startsWith("pre")) {
        if (!n && f === !1)
          throw new Error("invalid increment argument: identifier is empty");
        if (n) {
          const c = `-${n}`.match(this.options.loose ? r[u.PRERELEASELOOSE] : r[u.PRERELEASE]);
          if (!c || c[1] !== n)
            throw new Error(`invalid identifier: ${n}`);
        }
      }
      switch (l) {
        case "premajor":
          this.prerelease.length = 0, this.patch = 0, this.minor = 0, this.major++, this.inc("pre", n, f);
          break;
        case "preminor":
          this.prerelease.length = 0, this.patch = 0, this.minor++, this.inc("pre", n, f);
          break;
        case "prepatch":
          this.prerelease.length = 0, this.inc("patch", n, f), this.inc("pre", n, f);
          break;
        // If the input is a non-prerelease version, this acts the same as
        // prepatch.
        case "prerelease":
          this.prerelease.length === 0 && this.inc("patch", n, f), this.inc("pre", n, f);
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
            let h = this.prerelease.length;
            for (; --h >= 0; )
              typeof this.prerelease[h] == "number" && (this.prerelease[h]++, h = -2);
            if (h === -1) {
              if (n === this.prerelease.join(".") && f === !1)
                throw new Error("invalid increment argument: identifier already exists");
              this.prerelease.push(c);
            }
          }
          if (n) {
            let h = [n, c];
            f === !1 && (h = [n]), o(this.prerelease[0], n) === 0 ? isNaN(this.prerelease[1]) && (this.prerelease = h) : this.prerelease = h;
          }
          break;
        }
        default:
          throw new Error(`invalid increment argument: ${l}`);
      }
      return this.raw = this.format(), this.build.length && (this.raw += `+${this.build.join(".")}`), this;
    }
  }
  return Ha = d, Ha;
}
var Ba, Rf;
function Dr() {
  if (Rf) return Ba;
  Rf = 1;
  const e = nt();
  return Ba = (i, r, u = !1) => {
    if (i instanceof e)
      return i;
    try {
      return new e(i, r);
    } catch (s) {
      if (!u)
        return null;
      throw s;
    }
  }, Ba;
}
var Va, bf;
function uE() {
  if (bf) return Va;
  bf = 1;
  const e = Dr();
  return Va = (i, r) => {
    const u = e(i, r);
    return u ? u.version : null;
  }, Va;
}
var za, Af;
function lE() {
  if (Af) return za;
  Af = 1;
  const e = Dr();
  return za = (i, r) => {
    const u = e(i.trim().replace(/^[=v]+/, ""), r);
    return u ? u.version : null;
  }, za;
}
var Xa, Of;
function cE() {
  if (Of) return Xa;
  Of = 1;
  const e = nt();
  return Xa = (i, r, u, s, o) => {
    typeof u == "string" && (o = s, s = u, u = void 0);
    try {
      return new e(
        i instanceof e ? i.version : i,
        u
      ).inc(r, s, o).version;
    } catch {
      return null;
    }
  }, Xa;
}
var Ya, Nf;
function fE() {
  if (Nf) return Ya;
  Nf = 1;
  const e = Dr();
  return Ya = (i, r) => {
    const u = e(i, null, !0), s = e(r, null, !0), o = u.compare(s);
    if (o === 0)
      return null;
    const d = o > 0, a = d ? u : s, l = d ? s : u, n = !!a.prerelease.length;
    if (!!l.prerelease.length && !n) {
      if (!l.patch && !l.minor)
        return "major";
      if (l.compareMain(a) === 0)
        return l.minor && !l.patch ? "minor" : "patch";
    }
    const c = n ? "pre" : "";
    return u.major !== s.major ? c + "major" : u.minor !== s.minor ? c + "minor" : u.patch !== s.patch ? c + "patch" : "prerelease";
  }, Ya;
}
var Wa, $f;
function dE() {
  if ($f) return Wa;
  $f = 1;
  const e = nt();
  return Wa = (i, r) => new e(i, r).major, Wa;
}
var Ka, If;
function hE() {
  if (If) return Ka;
  If = 1;
  const e = nt();
  return Ka = (i, r) => new e(i, r).minor, Ka;
}
var Ja, Pf;
function pE() {
  if (Pf) return Ja;
  Pf = 1;
  const e = nt();
  return Ja = (i, r) => new e(i, r).patch, Ja;
}
var Qa, Cf;
function mE() {
  if (Cf) return Qa;
  Cf = 1;
  const e = Dr();
  return Qa = (i, r) => {
    const u = e(i, r);
    return u && u.prerelease.length ? u.prerelease : null;
  }, Qa;
}
var Za, Df;
function At() {
  if (Df) return Za;
  Df = 1;
  const e = nt();
  return Za = (i, r, u) => new e(i, u).compare(new e(r, u)), Za;
}
var es, Lf;
function gE() {
  if (Lf) return es;
  Lf = 1;
  const e = At();
  return es = (i, r, u) => e(r, i, u), es;
}
var ts, kf;
function yE() {
  if (kf) return ts;
  kf = 1;
  const e = At();
  return ts = (i, r) => e(i, r, !0), ts;
}
var rs, Ff;
function Vu() {
  if (Ff) return rs;
  Ff = 1;
  const e = nt();
  return rs = (i, r, u) => {
    const s = new e(i, u), o = new e(r, u);
    return s.compare(o) || s.compareBuild(o);
  }, rs;
}
var ns, Uf;
function EE() {
  if (Uf) return ns;
  Uf = 1;
  const e = Vu();
  return ns = (i, r) => i.sort((u, s) => e(u, s, r)), ns;
}
var is, qf;
function vE() {
  if (qf) return is;
  qf = 1;
  const e = Vu();
  return is = (i, r) => i.sort((u, s) => e(s, u, r)), is;
}
var as, xf;
function ua() {
  if (xf) return as;
  xf = 1;
  const e = At();
  return as = (i, r, u) => e(i, r, u) > 0, as;
}
var ss, Mf;
function zu() {
  if (Mf) return ss;
  Mf = 1;
  const e = At();
  return ss = (i, r, u) => e(i, r, u) < 0, ss;
}
var os, jf;
function qm() {
  if (jf) return os;
  jf = 1;
  const e = At();
  return os = (i, r, u) => e(i, r, u) === 0, os;
}
var us, Gf;
function xm() {
  if (Gf) return us;
  Gf = 1;
  const e = At();
  return us = (i, r, u) => e(i, r, u) !== 0, us;
}
var ls, Hf;
function Xu() {
  if (Hf) return ls;
  Hf = 1;
  const e = At();
  return ls = (i, r, u) => e(i, r, u) >= 0, ls;
}
var cs, Bf;
function Yu() {
  if (Bf) return cs;
  Bf = 1;
  const e = At();
  return cs = (i, r, u) => e(i, r, u) <= 0, cs;
}
var fs, Vf;
function Mm() {
  if (Vf) return fs;
  Vf = 1;
  const e = qm(), t = xm(), i = ua(), r = Xu(), u = zu(), s = Yu();
  return fs = (d, a, l, n) => {
    switch (a) {
      case "===":
        return typeof d == "object" && (d = d.version), typeof l == "object" && (l = l.version), d === l;
      case "!==":
        return typeof d == "object" && (d = d.version), typeof l == "object" && (l = l.version), d !== l;
      case "":
      case "=":
      case "==":
        return e(d, l, n);
      case "!=":
        return t(d, l, n);
      case ">":
        return i(d, l, n);
      case ">=":
        return r(d, l, n);
      case "<":
        return u(d, l, n);
      case "<=":
        return s(d, l, n);
      default:
        throw new TypeError(`Invalid operator: ${a}`);
    }
  }, fs;
}
var ds, zf;
function _E() {
  if (zf) return ds;
  zf = 1;
  const e = nt(), t = Dr(), { safeRe: i, t: r } = bn();
  return ds = (s, o) => {
    if (s instanceof e)
      return s;
    if (typeof s == "number" && (s = String(s)), typeof s != "string")
      return null;
    o = o || {};
    let d = null;
    if (!o.rtl)
      d = s.match(o.includePrerelease ? i[r.COERCEFULL] : i[r.COERCE]);
    else {
      const h = o.includePrerelease ? i[r.COERCERTLFULL] : i[r.COERCERTL];
      let y;
      for (; (y = h.exec(s)) && (!d || d.index + d[0].length !== s.length); )
        (!d || y.index + y[0].length !== d.index + d[0].length) && (d = y), h.lastIndex = y.index + y[1].length + y[2].length;
      h.lastIndex = -1;
    }
    if (d === null)
      return null;
    const a = d[2], l = d[3] || "0", n = d[4] || "0", f = o.includePrerelease && d[5] ? `-${d[5]}` : "", c = o.includePrerelease && d[6] ? `+${d[6]}` : "";
    return t(`${a}.${l}.${n}${f}${c}`, o);
  }, ds;
}
var hs, Xf;
function wE() {
  if (Xf) return hs;
  Xf = 1;
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
          const s = this.map.keys().next().value;
          this.delete(s);
        }
        this.map.set(i, r);
      }
      return this;
    }
  }
  return hs = e, hs;
}
var ps, Yf;
function Ot() {
  if (Yf) return ps;
  Yf = 1;
  const e = /\s+/g;
  class t {
    constructor(D, W) {
      if (W = u(W), D instanceof t)
        return D.loose === !!W.loose && D.includePrerelease === !!W.includePrerelease ? D : new t(D.raw, W);
      if (D instanceof s)
        return this.raw = D.value, this.set = [[D]], this.formatted = void 0, this;
      if (this.options = W, this.loose = !!W.loose, this.includePrerelease = !!W.includePrerelease, this.raw = D.trim().replace(e, " "), this.set = this.raw.split("||").map((L) => this.parseRange(L.trim())).filter((L) => L.length), !this.set.length)
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      if (this.set.length > 1) {
        const L = this.set[0];
        if (this.set = this.set.filter((F) => !E(F[0])), this.set.length === 0)
          this.set = [L];
        else if (this.set.length > 1) {
          for (const F of this.set)
            if (F.length === 1 && p(F[0])) {
              this.set = [F];
              break;
            }
        }
      }
      this.formatted = void 0;
    }
    get range() {
      if (this.formatted === void 0) {
        this.formatted = "";
        for (let D = 0; D < this.set.length; D++) {
          D > 0 && (this.formatted += "||");
          const W = this.set[D];
          for (let L = 0; L < W.length; L++)
            L > 0 && (this.formatted += " "), this.formatted += W[L].toString().trim();
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
    parseRange(D) {
      const L = ((this.options.includePrerelease && h) | (this.options.loose && y)) + ":" + D, F = r.get(L);
      if (F)
        return F;
      const G = this.options.loose, k = G ? a[l.HYPHENRANGELOOSE] : a[l.HYPHENRANGE];
      D = D.replace(k, j(this.options.includePrerelease)), o("hyphen replace", D), D = D.replace(a[l.COMPARATORTRIM], n), o("comparator trim", D), D = D.replace(a[l.TILDETRIM], f), o("tilde trim", D), D = D.replace(a[l.CARETTRIM], c), o("caret trim", D);
      let q = D.split(" ").map((I) => m(I, this.options)).join(" ").split(/\s+/).map((I) => M(I, this.options));
      G && (q = q.filter((I) => (o("loose invalid filter", I, this.options), !!I.match(a[l.COMPARATORLOOSE])))), o("range list", q);
      const z = /* @__PURE__ */ new Map(), H = q.map((I) => new s(I, this.options));
      for (const I of H) {
        if (E(I))
          return [I];
        z.set(I.value, I);
      }
      z.size > 1 && z.has("") && z.delete("");
      const $ = [...z.values()];
      return r.set(L, $), $;
    }
    intersects(D, W) {
      if (!(D instanceof t))
        throw new TypeError("a Range is required");
      return this.set.some((L) => v(L, W) && D.set.some((F) => v(F, W) && L.every((G) => F.every((k) => G.intersects(k, W)))));
    }
    // if ANY of the sets match ALL of its comparators, then pass
    test(D) {
      if (!D)
        return !1;
      if (typeof D == "string")
        try {
          D = new d(D, this.options);
        } catch {
          return !1;
        }
      for (let W = 0; W < this.set.length; W++)
        if (X(this.set[W], D, this.options))
          return !0;
      return !1;
    }
  }
  ps = t;
  const i = wE(), r = new i(), u = Bu(), s = la(), o = oa(), d = nt(), {
    safeRe: a,
    t: l,
    comparatorTrimReplace: n,
    tildeTrimReplace: f,
    caretTrimReplace: c
  } = bn(), { FLAG_INCLUDE_PRERELEASE: h, FLAG_LOOSE: y } = sa(), E = (P) => P.value === "<0.0.0-0", p = (P) => P.value === "", v = (P, D) => {
    let W = !0;
    const L = P.slice();
    let F = L.pop();
    for (; W && L.length; )
      W = L.every((G) => F.intersects(G, D)), F = L.pop();
    return W;
  }, m = (P, D) => (P = P.replace(a[l.BUILD], ""), o("comp", P, D), P = _(P, D), o("caret", P), P = T(P, D), o("tildes", P), P = A(P, D), o("xrange", P), P = x(P, D), o("stars", P), P), w = (P) => !P || P.toLowerCase() === "x" || P === "*", T = (P, D) => P.trim().split(/\s+/).map((W) => R(W, D)).join(" "), R = (P, D) => {
    const W = D.loose ? a[l.TILDELOOSE] : a[l.TILDE];
    return P.replace(W, (L, F, G, k, q) => {
      o("tilde", P, L, F, G, k, q);
      let z;
      return w(F) ? z = "" : w(G) ? z = `>=${F}.0.0 <${+F + 1}.0.0-0` : w(k) ? z = `>=${F}.${G}.0 <${F}.${+G + 1}.0-0` : q ? (o("replaceTilde pr", q), z = `>=${F}.${G}.${k}-${q} <${F}.${+G + 1}.0-0`) : z = `>=${F}.${G}.${k} <${F}.${+G + 1}.0-0`, o("tilde return", z), z;
    });
  }, _ = (P, D) => P.trim().split(/\s+/).map((W) => S(W, D)).join(" "), S = (P, D) => {
    o("caret", P, D);
    const W = D.loose ? a[l.CARETLOOSE] : a[l.CARET], L = D.includePrerelease ? "-0" : "";
    return P.replace(W, (F, G, k, q, z) => {
      o("caret", P, F, G, k, q, z);
      let H;
      return w(G) ? H = "" : w(k) ? H = `>=${G}.0.0${L} <${+G + 1}.0.0-0` : w(q) ? G === "0" ? H = `>=${G}.${k}.0${L} <${G}.${+k + 1}.0-0` : H = `>=${G}.${k}.0${L} <${+G + 1}.0.0-0` : z ? (o("replaceCaret pr", z), G === "0" ? k === "0" ? H = `>=${G}.${k}.${q}-${z} <${G}.${k}.${+q + 1}-0` : H = `>=${G}.${k}.${q}-${z} <${G}.${+k + 1}.0-0` : H = `>=${G}.${k}.${q}-${z} <${+G + 1}.0.0-0`) : (o("no pr"), G === "0" ? k === "0" ? H = `>=${G}.${k}.${q}${L} <${G}.${k}.${+q + 1}-0` : H = `>=${G}.${k}.${q}${L} <${G}.${+k + 1}.0-0` : H = `>=${G}.${k}.${q} <${+G + 1}.0.0-0`), o("caret return", H), H;
    });
  }, A = (P, D) => (o("replaceXRanges", P, D), P.split(/\s+/).map((W) => b(W, D)).join(" ")), b = (P, D) => {
    P = P.trim();
    const W = D.loose ? a[l.XRANGELOOSE] : a[l.XRANGE];
    return P.replace(W, (L, F, G, k, q, z) => {
      o("xRange", P, L, F, G, k, q, z);
      const H = w(G), $ = H || w(k), I = $ || w(q), K = I;
      return F === "=" && K && (F = ""), z = D.includePrerelease ? "-0" : "", H ? F === ">" || F === "<" ? L = "<0.0.0-0" : L = "*" : F && K ? ($ && (k = 0), q = 0, F === ">" ? (F = ">=", $ ? (G = +G + 1, k = 0, q = 0) : (k = +k + 1, q = 0)) : F === "<=" && (F = "<", $ ? G = +G + 1 : k = +k + 1), F === "<" && (z = "-0"), L = `${F + G}.${k}.${q}${z}`) : $ ? L = `>=${G}.0.0${z} <${+G + 1}.0.0-0` : I && (L = `>=${G}.${k}.0${z} <${G}.${+k + 1}.0-0`), o("xRange return", L), L;
    });
  }, x = (P, D) => (o("replaceStars", P, D), P.trim().replace(a[l.STAR], "")), M = (P, D) => (o("replaceGTE0", P, D), P.trim().replace(a[D.includePrerelease ? l.GTE0PRE : l.GTE0], "")), j = (P) => (D, W, L, F, G, k, q, z, H, $, I, K) => (w(L) ? W = "" : w(F) ? W = `>=${L}.0.0${P ? "-0" : ""}` : w(G) ? W = `>=${L}.${F}.0${P ? "-0" : ""}` : k ? W = `>=${W}` : W = `>=${W}${P ? "-0" : ""}`, w(H) ? z = "" : w($) ? z = `<${+H + 1}.0.0-0` : w(I) ? z = `<${H}.${+$ + 1}.0-0` : K ? z = `<=${H}.${$}.${I}-${K}` : P ? z = `<${H}.${$}.${+I + 1}-0` : z = `<=${z}`, `${W} ${z}`.trim()), X = (P, D, W) => {
    for (let L = 0; L < P.length; L++)
      if (!P[L].test(D))
        return !1;
    if (D.prerelease.length && !W.includePrerelease) {
      for (let L = 0; L < P.length; L++)
        if (o(P[L].semver), P[L].semver !== s.ANY && P[L].semver.prerelease.length > 0) {
          const F = P[L].semver;
          if (F.major === D.major && F.minor === D.minor && F.patch === D.patch)
            return !0;
        }
      return !1;
    }
    return !0;
  };
  return ps;
}
var ms, Wf;
function la() {
  if (Wf) return ms;
  Wf = 1;
  const e = /* @__PURE__ */ Symbol("SemVer ANY");
  class t {
    static get ANY() {
      return e;
    }
    constructor(n, f) {
      if (f = i(f), n instanceof t) {
        if (n.loose === !!f.loose)
          return n;
        n = n.value;
      }
      n = n.trim().split(/\s+/).join(" "), o("comparator", n, f), this.options = f, this.loose = !!f.loose, this.parse(n), this.semver === e ? this.value = "" : this.value = this.operator + this.semver.version, o("comp", this);
    }
    parse(n) {
      const f = this.options.loose ? r[u.COMPARATORLOOSE] : r[u.COMPARATOR], c = n.match(f);
      if (!c)
        throw new TypeError(`Invalid comparator: ${n}`);
      this.operator = c[1] !== void 0 ? c[1] : "", this.operator === "=" && (this.operator = ""), c[2] ? this.semver = new d(c[2], this.options.loose) : this.semver = e;
    }
    toString() {
      return this.value;
    }
    test(n) {
      if (o("Comparator.test", n, this.options.loose), this.semver === e || n === e)
        return !0;
      if (typeof n == "string")
        try {
          n = new d(n, this.options);
        } catch {
          return !1;
        }
      return s(n, this.operator, this.semver, this.options);
    }
    intersects(n, f) {
      if (!(n instanceof t))
        throw new TypeError("a Comparator is required");
      return this.operator === "" ? this.value === "" ? !0 : new a(n.value, f).test(this.value) : n.operator === "" ? n.value === "" ? !0 : new a(this.value, f).test(n.semver) : (f = i(f), f.includePrerelease && (this.value === "<0.0.0-0" || n.value === "<0.0.0-0") || !f.includePrerelease && (this.value.startsWith("<0.0.0") || n.value.startsWith("<0.0.0")) ? !1 : !!(this.operator.startsWith(">") && n.operator.startsWith(">") || this.operator.startsWith("<") && n.operator.startsWith("<") || this.semver.version === n.semver.version && this.operator.includes("=") && n.operator.includes("=") || s(this.semver, "<", n.semver, f) && this.operator.startsWith(">") && n.operator.startsWith("<") || s(this.semver, ">", n.semver, f) && this.operator.startsWith("<") && n.operator.startsWith(">")));
    }
  }
  ms = t;
  const i = Bu(), { safeRe: r, t: u } = bn(), s = Mm(), o = oa(), d = nt(), a = Ot();
  return ms;
}
var gs, Kf;
function ca() {
  if (Kf) return gs;
  Kf = 1;
  const e = Ot();
  return gs = (i, r, u) => {
    try {
      r = new e(r, u);
    } catch {
      return !1;
    }
    return r.test(i);
  }, gs;
}
var ys, Jf;
function SE() {
  if (Jf) return ys;
  Jf = 1;
  const e = Ot();
  return ys = (i, r) => new e(i, r).set.map((u) => u.map((s) => s.value).join(" ").trim().split(" ")), ys;
}
var Es, Qf;
function TE() {
  if (Qf) return Es;
  Qf = 1;
  const e = nt(), t = Ot();
  return Es = (r, u, s) => {
    let o = null, d = null, a = null;
    try {
      a = new t(u, s);
    } catch {
      return null;
    }
    return r.forEach((l) => {
      a.test(l) && (!o || d.compare(l) === -1) && (o = l, d = new e(o, s));
    }), o;
  }, Es;
}
var vs, Zf;
function RE() {
  if (Zf) return vs;
  Zf = 1;
  const e = nt(), t = Ot();
  return vs = (r, u, s) => {
    let o = null, d = null, a = null;
    try {
      a = new t(u, s);
    } catch {
      return null;
    }
    return r.forEach((l) => {
      a.test(l) && (!o || d.compare(l) === 1) && (o = l, d = new e(o, s));
    }), o;
  }, vs;
}
var _s, ed;
function bE() {
  if (ed) return _s;
  ed = 1;
  const e = nt(), t = Ot(), i = ua();
  return _s = (u, s) => {
    u = new t(u, s);
    let o = new e("0.0.0");
    if (u.test(o) || (o = new e("0.0.0-0"), u.test(o)))
      return o;
    o = null;
    for (let d = 0; d < u.set.length; ++d) {
      const a = u.set[d];
      let l = null;
      a.forEach((n) => {
        const f = new e(n.semver.version);
        switch (n.operator) {
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
            throw new Error(`Unexpected operation: ${n.operator}`);
        }
      }), l && (!o || i(o, l)) && (o = l);
    }
    return o && u.test(o) ? o : null;
  }, _s;
}
var ws, td;
function AE() {
  if (td) return ws;
  td = 1;
  const e = Ot();
  return ws = (i, r) => {
    try {
      return new e(i, r).range || "*";
    } catch {
      return null;
    }
  }, ws;
}
var Ss, rd;
function Wu() {
  if (rd) return Ss;
  rd = 1;
  const e = nt(), t = la(), { ANY: i } = t, r = Ot(), u = ca(), s = ua(), o = zu(), d = Yu(), a = Xu();
  return Ss = (n, f, c, h) => {
    n = new e(n, h), f = new r(f, h);
    let y, E, p, v, m;
    switch (c) {
      case ">":
        y = s, E = d, p = o, v = ">", m = ">=";
        break;
      case "<":
        y = o, E = a, p = s, v = "<", m = "<=";
        break;
      default:
        throw new TypeError('Must provide a hilo val of "<" or ">"');
    }
    if (u(n, f, h))
      return !1;
    for (let w = 0; w < f.set.length; ++w) {
      const T = f.set[w];
      let R = null, _ = null;
      if (T.forEach((S) => {
        S.semver === i && (S = new t(">=0.0.0")), R = R || S, _ = _ || S, y(S.semver, R.semver, h) ? R = S : p(S.semver, _.semver, h) && (_ = S);
      }), R.operator === v || R.operator === m || (!_.operator || _.operator === v) && E(n, _.semver))
        return !1;
      if (_.operator === m && p(n, _.semver))
        return !1;
    }
    return !0;
  }, Ss;
}
var Ts, nd;
function OE() {
  if (nd) return Ts;
  nd = 1;
  const e = Wu();
  return Ts = (i, r, u) => e(i, r, ">", u), Ts;
}
var Rs, id;
function NE() {
  if (id) return Rs;
  id = 1;
  const e = Wu();
  return Rs = (i, r, u) => e(i, r, "<", u), Rs;
}
var bs, ad;
function $E() {
  if (ad) return bs;
  ad = 1;
  const e = Ot();
  return bs = (i, r, u) => (i = new e(i, u), r = new e(r, u), i.intersects(r, u)), bs;
}
var As, sd;
function IE() {
  if (sd) return As;
  sd = 1;
  const e = ca(), t = At();
  return As = (i, r, u) => {
    const s = [];
    let o = null, d = null;
    const a = i.sort((c, h) => t(c, h, u));
    for (const c of a)
      e(c, r, u) ? (d = c, o || (o = c)) : (d && s.push([o, d]), d = null, o = null);
    o && s.push([o, null]);
    const l = [];
    for (const [c, h] of s)
      c === h ? l.push(c) : !h && c === a[0] ? l.push("*") : h ? c === a[0] ? l.push(`<=${h}`) : l.push(`${c} - ${h}`) : l.push(`>=${c}`);
    const n = l.join(" || "), f = typeof r.raw == "string" ? r.raw : String(r);
    return n.length < f.length ? n : r;
  }, As;
}
var Os, od;
function PE() {
  if (od) return Os;
  od = 1;
  const e = Ot(), t = la(), { ANY: i } = t, r = ca(), u = At(), s = (f, c, h = {}) => {
    if (f === c)
      return !0;
    f = new e(f, h), c = new e(c, h);
    let y = !1;
    e: for (const E of f.set) {
      for (const p of c.set) {
        const v = a(E, p, h);
        if (y = y || v !== null, v)
          continue e;
      }
      if (y)
        return !1;
    }
    return !0;
  }, o = [new t(">=0.0.0-0")], d = [new t(">=0.0.0")], a = (f, c, h) => {
    if (f === c)
      return !0;
    if (f.length === 1 && f[0].semver === i) {
      if (c.length === 1 && c[0].semver === i)
        return !0;
      h.includePrerelease ? f = o : f = d;
    }
    if (c.length === 1 && c[0].semver === i) {
      if (h.includePrerelease)
        return !0;
      c = d;
    }
    const y = /* @__PURE__ */ new Set();
    let E, p;
    for (const A of f)
      A.operator === ">" || A.operator === ">=" ? E = l(E, A, h) : A.operator === "<" || A.operator === "<=" ? p = n(p, A, h) : y.add(A.semver);
    if (y.size > 1)
      return null;
    let v;
    if (E && p) {
      if (v = u(E.semver, p.semver, h), v > 0)
        return null;
      if (v === 0 && (E.operator !== ">=" || p.operator !== "<="))
        return null;
    }
    for (const A of y) {
      if (E && !r(A, String(E), h) || p && !r(A, String(p), h))
        return null;
      for (const b of c)
        if (!r(A, String(b), h))
          return !1;
      return !0;
    }
    let m, w, T, R, _ = p && !h.includePrerelease && p.semver.prerelease.length ? p.semver : !1, S = E && !h.includePrerelease && E.semver.prerelease.length ? E.semver : !1;
    _ && _.prerelease.length === 1 && p.operator === "<" && _.prerelease[0] === 0 && (_ = !1);
    for (const A of c) {
      if (R = R || A.operator === ">" || A.operator === ">=", T = T || A.operator === "<" || A.operator === "<=", E) {
        if (S && A.semver.prerelease && A.semver.prerelease.length && A.semver.major === S.major && A.semver.minor === S.minor && A.semver.patch === S.patch && (S = !1), A.operator === ">" || A.operator === ">=") {
          if (m = l(E, A, h), m === A && m !== E)
            return !1;
        } else if (E.operator === ">=" && !r(E.semver, String(A), h))
          return !1;
      }
      if (p) {
        if (_ && A.semver.prerelease && A.semver.prerelease.length && A.semver.major === _.major && A.semver.minor === _.minor && A.semver.patch === _.patch && (_ = !1), A.operator === "<" || A.operator === "<=") {
          if (w = n(p, A, h), w === A && w !== p)
            return !1;
        } else if (p.operator === "<=" && !r(p.semver, String(A), h))
          return !1;
      }
      if (!A.operator && (p || E) && v !== 0)
        return !1;
    }
    return !(E && T && !p && v !== 0 || p && R && !E && v !== 0 || S || _);
  }, l = (f, c, h) => {
    if (!f)
      return c;
    const y = u(f.semver, c.semver, h);
    return y > 0 ? f : y < 0 || c.operator === ">" && f.operator === ">=" ? c : f;
  }, n = (f, c, h) => {
    if (!f)
      return c;
    const y = u(f.semver, c.semver, h);
    return y < 0 ? f : y > 0 || c.operator === "<" && f.operator === "<=" ? c : f;
  };
  return Os = s, Os;
}
var Ns, ud;
function CE() {
  if (ud) return Ns;
  ud = 1;
  const e = bn(), t = sa(), i = nt(), r = Um(), u = Dr(), s = uE(), o = lE(), d = cE(), a = fE(), l = dE(), n = hE(), f = pE(), c = mE(), h = At(), y = gE(), E = yE(), p = Vu(), v = EE(), m = vE(), w = ua(), T = zu(), R = qm(), _ = xm(), S = Xu(), A = Yu(), b = Mm(), x = _E(), M = la(), j = Ot(), X = ca(), P = SE(), D = TE(), W = RE(), L = bE(), F = AE(), G = Wu(), k = OE(), q = NE(), z = $E(), H = IE(), $ = PE();
  return Ns = {
    parse: u,
    valid: s,
    clean: o,
    inc: d,
    diff: a,
    major: l,
    minor: n,
    patch: f,
    prerelease: c,
    compare: h,
    rcompare: y,
    compareLoose: E,
    compareBuild: p,
    sort: v,
    rsort: m,
    gt: w,
    lt: T,
    eq: R,
    neq: _,
    gte: S,
    lte: A,
    cmp: b,
    coerce: x,
    Comparator: M,
    Range: j,
    satisfies: X,
    toComparators: P,
    maxSatisfying: D,
    minSatisfying: W,
    minVersion: L,
    validRange: F,
    outside: G,
    gtr: k,
    ltr: q,
    intersects: z,
    simplifyRange: H,
    subset: $,
    SemVer: i,
    re: e.re,
    src: e.src,
    tokens: e.t,
    SEMVER_SPEC_VERSION: t.SEMVER_SPEC_VERSION,
    RELEASE_TYPES: t.RELEASE_TYPES,
    compareIdentifiers: r.compareIdentifiers,
    rcompareIdentifiers: r.rcompareIdentifiers
  }, Ns;
}
var Br = { exports: {} }, Li = { exports: {} }, ld;
function DE() {
  if (ld) return Li.exports;
  ld = 1;
  const e = (t, i) => {
    for (const r of Reflect.ownKeys(i))
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(i, r));
    return t;
  };
  return Li.exports = e, Li.exports.default = e, Li.exports;
}
var cd;
function LE() {
  if (cd) return Br.exports;
  cd = 1;
  const e = DE(), t = /* @__PURE__ */ new WeakMap(), i = (r, u = {}) => {
    if (typeof r != "function")
      throw new TypeError("Expected a function");
    let s, o = 0;
    const d = r.displayName || r.name || "<anonymous>", a = function(...l) {
      if (t.set(a, ++o), o === 1)
        s = r.apply(this, l), r = null;
      else if (u.throw === !0)
        throw new Error(`Function \`${d}\` can only be called once`);
      return s;
    };
    return e(a, r), t.set(a, o), a;
  };
  return Br.exports = i, Br.exports.default = i, Br.exports.callCount = (r) => {
    if (!t.has(r))
      throw new Error(`The given function \`${r.name}\` is not wrapped by the \`onetime\` package`);
    return t.get(r);
  }, Br.exports;
}
var ki = gn.exports, fd;
function kE() {
  return fd || (fd = 1, (function(e, t) {
    var i = ki && ki.__classPrivateFieldSet || function(L, F, G, k, q) {
      if (k === "m") throw new TypeError("Private method is not writable");
      if (k === "a" && !q) throw new TypeError("Private accessor was defined without a setter");
      if (typeof F == "function" ? L !== F || !q : !F.has(L)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
      return k === "a" ? q.call(L, G) : q ? q.value = G : F.set(L, G), G;
    }, r = ki && ki.__classPrivateFieldGet || function(L, F, G, k) {
      if (G === "a" && !k) throw new TypeError("Private accessor was defined without a getter");
      if (typeof F == "function" ? L !== F || !k : !F.has(L)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
      return G === "m" ? k : G === "a" ? k.call(L) : k ? k.value : F.get(L);
    }, u, s, o, d, a, l;
    Object.defineProperty(t, "__esModule", { value: !0 });
    const n = wn, f = Rt, c = De, h = Pr, y = Uu, E = qu, p = Fy(), v = Hy(), m = By(), w = Qy(), T = Fm(), R = aE(), _ = oE(), S = CE(), A = LE(), b = "aes-256-cbc", x = () => /* @__PURE__ */ Object.create(null), M = (L) => L != null;
    let j = "";
    try {
      delete require.cache[__filename], j = c.dirname((s = (u = e.parent) === null || u === void 0 ? void 0 : u.filename) !== null && s !== void 0 ? s : ".");
    } catch {
    }
    const X = (L, F) => {
      const G = /* @__PURE__ */ new Set([
        "undefined",
        "symbol",
        "function"
      ]), k = typeof F;
      if (G.has(k))
        throw new TypeError(`Setting a value of type \`${k}\` for key \`${L}\` is not allowed as it's not supported by JSON`);
    }, P = "__internal__", D = `${P}.migrations.version`;
    class W {
      constructor(F = {}) {
        var G;
        o.set(this, void 0), d.set(this, void 0), a.set(this, void 0), l.set(this, {}), this._deserialize = (I) => JSON.parse(I), this._serialize = (I) => JSON.stringify(I, void 0, "	");
        const k = {
          configName: "config",
          fileExtension: "json",
          projectSuffix: "nodejs",
          clearInvalidConfig: !1,
          accessPropertiesByDotNotation: !0,
          configFileMode: 438,
          ...F
        }, q = A(() => {
          const I = v.sync({ cwd: j }), K = I && JSON.parse(f.readFileSync(I, "utf8"));
          return K ?? {};
        });
        if (!k.cwd) {
          if (k.projectName || (k.projectName = q().name), !k.projectName)
            throw new Error("Project name could not be inferred. Please specify the `projectName` option.");
          k.cwd = m(k.projectName, { suffix: k.projectSuffix }).config;
        }
        if (i(this, a, k, "f"), k.schema) {
          if (typeof k.schema != "object")
            throw new TypeError("The `schema` option must be an object.");
          const I = new T.default({
            allErrors: !0,
            useDefaults: !0
          });
          (0, R.default)(I);
          const K = {
            type: "object",
            properties: k.schema
          };
          i(this, o, I.compile(K), "f");
          for (const [N, O] of Object.entries(k.schema))
            O?.default && (r(this, l, "f")[N] = O.default);
        }
        k.defaults && i(this, l, {
          ...r(this, l, "f"),
          ...k.defaults
        }, "f"), k.serialize && (this._serialize = k.serialize), k.deserialize && (this._deserialize = k.deserialize), this.events = new E.EventEmitter(), i(this, d, k.encryptionKey, "f");
        const z = k.fileExtension ? `.${k.fileExtension}` : "";
        this.path = c.resolve(k.cwd, `${(G = k.configName) !== null && G !== void 0 ? G : "config"}${z}`);
        const H = this.store, $ = Object.assign(x(), k.defaults, H);
        this._validate($);
        try {
          y.deepEqual(H, $);
        } catch {
          this.store = $;
        }
        if (k.watch && this._watch(), k.migrations) {
          if (k.projectVersion || (k.projectVersion = q().version), !k.projectVersion)
            throw new Error("Project version could not be inferred. Please specify the `projectVersion` option.");
          this._migrate(k.migrations, k.projectVersion, k.beforeEachMigration);
        }
      }
      get(F, G) {
        if (r(this, a, "f").accessPropertiesByDotNotation)
          return this._get(F, G);
        const { store: k } = this;
        return F in k ? k[F] : G;
      }
      set(F, G) {
        if (typeof F != "string" && typeof F != "object")
          throw new TypeError(`Expected \`key\` to be of type \`string\` or \`object\`, got ${typeof F}`);
        if (typeof F != "object" && G === void 0)
          throw new TypeError("Use `delete()` to clear values");
        if (this._containsReservedKey(F))
          throw new TypeError(`Please don't use the ${P} key, as it's used to manage this module internal operations.`);
        const { store: k } = this, q = (z, H) => {
          X(z, H), r(this, a, "f").accessPropertiesByDotNotation ? p.set(k, z, H) : k[z] = H;
        };
        if (typeof F == "object") {
          const z = F;
          for (const [H, $] of Object.entries(z))
            q(H, $);
        } else
          q(F, G);
        this.store = k;
      }
      /**
          Check if an item exists.
      
          @param key - The key of the item to check.
          */
      has(F) {
        return r(this, a, "f").accessPropertiesByDotNotation ? p.has(this.store, F) : F in this.store;
      }
      /**
          Reset items to their default values, as defined by the `defaults` or `schema` option.
      
          @see `clear()` to reset all items.
      
          @param keys - The keys of the items to reset.
          */
      reset(...F) {
        for (const G of F)
          M(r(this, l, "f")[G]) && this.set(G, r(this, l, "f")[G]);
      }
      /**
          Delete an item.
      
          @param key - The key of the item to delete.
          */
      delete(F) {
        const { store: G } = this;
        r(this, a, "f").accessPropertiesByDotNotation ? p.delete(G, F) : delete G[F], this.store = G;
      }
      /**
          Delete all items.
      
          This resets known items to their default values, if defined by the `defaults` or `schema` option.
          */
      clear() {
        this.store = x();
        for (const F of Object.keys(r(this, l, "f")))
          this.reset(F);
      }
      /**
          Watches the given `key`, calling `callback` on any changes.
      
          @param key - The key wo watch.
          @param callback - A callback function that is called on any changes. When a `key` is first set `oldValue` will be `undefined`, and when a key is deleted `newValue` will be `undefined`.
          @returns A function, that when called, will unsubscribe.
          */
      onDidChange(F, G) {
        if (typeof F != "string")
          throw new TypeError(`Expected \`key\` to be of type \`string\`, got ${typeof F}`);
        if (typeof G != "function")
          throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof G}`);
        return this._handleChange(() => this.get(F), G);
      }
      /**
          Watches the whole config object, calling `callback` on any changes.
      
          @param callback - A callback function that is called on any changes. When a `key` is first set `oldValue` will be `undefined`, and when a key is deleted `newValue` will be `undefined`.
          @returns A function, that when called, will unsubscribe.
          */
      onDidAnyChange(F) {
        if (typeof F != "function")
          throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof F}`);
        return this._handleChange(() => this.store, F);
      }
      get size() {
        return Object.keys(this.store).length;
      }
      get store() {
        try {
          const F = f.readFileSync(this.path, r(this, d, "f") ? null : "utf8"), G = this._encryptData(F), k = this._deserialize(G);
          return this._validate(k), Object.assign(x(), k);
        } catch (F) {
          if (F?.code === "ENOENT")
            return this._ensureDirectory(), x();
          if (r(this, a, "f").clearInvalidConfig && F.name === "SyntaxError")
            return x();
          throw F;
        }
      }
      set store(F) {
        this._ensureDirectory(), this._validate(F), this._write(F), this.events.emit("change");
      }
      *[(o = /* @__PURE__ */ new WeakMap(), d = /* @__PURE__ */ new WeakMap(), a = /* @__PURE__ */ new WeakMap(), l = /* @__PURE__ */ new WeakMap(), Symbol.iterator)]() {
        for (const [F, G] of Object.entries(this.store))
          yield [F, G];
      }
      _encryptData(F) {
        if (!r(this, d, "f"))
          return F.toString();
        try {
          if (r(this, d, "f"))
            try {
              if (F.slice(16, 17).toString() === ":") {
                const G = F.slice(0, 16), k = h.pbkdf2Sync(r(this, d, "f"), G.toString(), 1e4, 32, "sha512"), q = h.createDecipheriv(b, k, G);
                F = Buffer.concat([q.update(Buffer.from(F.slice(17))), q.final()]).toString("utf8");
              } else {
                const G = h.createDecipher(b, r(this, d, "f"));
                F = Buffer.concat([G.update(Buffer.from(F)), G.final()]).toString("utf8");
              }
            } catch {
            }
        } catch {
        }
        return F.toString();
      }
      _handleChange(F, G) {
        let k = F();
        const q = () => {
          const z = k, H = F();
          (0, n.isDeepStrictEqual)(H, z) || (k = H, G.call(this, H, z));
        };
        return this.events.on("change", q), () => this.events.removeListener("change", q);
      }
      _validate(F) {
        if (!r(this, o, "f") || r(this, o, "f").call(this, F) || !r(this, o, "f").errors)
          return;
        const k = r(this, o, "f").errors.map(({ instancePath: q, message: z = "" }) => `\`${q.slice(1)}\` ${z}`);
        throw new Error("Config schema violation: " + k.join("; "));
      }
      _ensureDirectory() {
        f.mkdirSync(c.dirname(this.path), { recursive: !0 });
      }
      _write(F) {
        let G = this._serialize(F);
        if (r(this, d, "f")) {
          const k = h.randomBytes(16), q = h.pbkdf2Sync(r(this, d, "f"), k.toString(), 1e4, 32, "sha512"), z = h.createCipheriv(b, q, k);
          G = Buffer.concat([k, Buffer.from(":"), z.update(Buffer.from(G)), z.final()]);
        }
        if (process.env.SNAP)
          f.writeFileSync(this.path, G, { mode: r(this, a, "f").configFileMode });
        else
          try {
            w.writeFileSync(this.path, G, { mode: r(this, a, "f").configFileMode });
          } catch (k) {
            if (k?.code === "EXDEV") {
              f.writeFileSync(this.path, G, { mode: r(this, a, "f").configFileMode });
              return;
            }
            throw k;
          }
      }
      _watch() {
        this._ensureDirectory(), f.existsSync(this.path) || this._write(x()), process.platform === "win32" ? f.watch(this.path, { persistent: !1 }, _(() => {
          this.events.emit("change");
        }, { wait: 100 })) : f.watchFile(this.path, { persistent: !1 }, _(() => {
          this.events.emit("change");
        }, { wait: 5e3 }));
      }
      _migrate(F, G, k) {
        let q = this._get(D, "0.0.0");
        const z = Object.keys(F).filter(($) => this._shouldPerformMigration($, q, G));
        let H = { ...this.store };
        for (const $ of z)
          try {
            k && k(this, {
              fromVersion: q,
              toVersion: $,
              finalVersion: G,
              versions: z
            });
            const I = F[$];
            I(this), this._set(D, $), q = $, H = { ...this.store };
          } catch (I) {
            throw this.store = H, new Error(`Something went wrong during the migration! Changes applied to the store until this failed migration will be restored. ${I}`);
          }
        (this._isVersionInRangeFormat(q) || !S.eq(q, G)) && this._set(D, G);
      }
      _containsReservedKey(F) {
        return typeof F == "object" && Object.keys(F)[0] === P ? !0 : typeof F != "string" ? !1 : r(this, a, "f").accessPropertiesByDotNotation ? !!F.startsWith(`${P}.`) : !1;
      }
      _isVersionInRangeFormat(F) {
        return S.clean(F) === null;
      }
      _shouldPerformMigration(F, G, k) {
        return this._isVersionInRangeFormat(F) ? G !== "0.0.0" && S.satisfies(G, F) ? !1 : S.satisfies(k, F) : !(S.lte(F, G) || S.gt(F, k));
      }
      _get(F, G) {
        return p.get(this.store, F, G);
      }
      _set(F, G) {
        const { store: k } = this;
        p.set(k, F, G), this.store = k;
      }
    }
    t.default = W, e.exports = W, e.exports.default = W;
  })(gn, gn.exports)), gn.exports;
}
var $s, dd;
function FE() {
  if (dd) return $s;
  dd = 1;
  const e = De, { app: t, ipcMain: i, ipcRenderer: r, shell: u } = Wt, s = kE();
  let o = !1;
  const d = () => {
    if (!i || !t)
      throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
    const l = {
      defaultCwd: t.getPath("userData"),
      appVersion: t.getVersion()
    };
    return o || (i.on("electron-store-get-data", (n) => {
      n.returnValue = l;
    }), o = !0), l;
  };
  class a extends s {
    constructor(n) {
      let f, c;
      if (r) {
        const h = r.sendSync("electron-store-get-data");
        if (!h)
          throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
        ({ defaultCwd: f, appVersion: c } = h);
      } else i && t && ({ defaultCwd: f, appVersion: c } = d());
      n = {
        name: "config",
        ...n
      }, n.projectVersion || (n.projectVersion = c), n.cwd ? n.cwd = e.isAbsolute(n.cwd) ? n.cwd : e.join(f, n.cwd) : n.cwd = f, n.configName = n.name, delete n.name, super(n);
    }
    static initRenderer() {
      d();
    }
    async openInEditor() {
      const n = await u.openPath(this.path);
      if (n)
        throw new Error(n);
    }
  }
  return $s = a, $s;
}
var UE = /* @__PURE__ */ FE();
const Ku = /* @__PURE__ */ Ly(UE);
function qE() {
  const { app: e } = require("electron");
  return e.isPackaged ? ot.join(process.resourcesPath, "build", "icon.png") : ot.join(__dirname, "..", "build", "icon.png");
}
function wt(e) {
  if (!Il.isSupported())
    return console.warn("Notifications are not supported on this system"), null;
  const t = new Il({
    title: e.title,
    body: e.body,
    silent: e.silent ?? !1,
    icon: qE(),
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
const Vr = {
  pomodoroComplete: (e) => wt({
    title: "🍅 ¡Pomodoro Completado!",
    body: "¡Excelente trabajo! Es hora de tomar un descanso.",
    urgency: "normal",
    onClick: () => {
      e.show(), e.focus();
    }
  }),
  shortBreakComplete: (e) => wt({
    title: "☕ Descanso Terminado",
    body: "Es hora de volver al trabajo. ¡Tú puedes!",
    urgency: "normal",
    onClick: () => {
      e.show(), e.focus();
    }
  }),
  longBreakComplete: (e) => wt({
    title: "🌿 Descanso Largo Terminado",
    body: "¡Recargado! Es hora de empezar una nueva sesión.",
    urgency: "normal",
    onClick: () => {
      e.show(), e.focus();
    }
  }),
  taskDue: (e, t) => wt({
    title: "⏰ Tarea Vencida",
    body: `La tarea "${t}" ha vencido.`,
    urgency: "critical",
    onClick: () => {
      e.show(), e.focus(), e.webContents.send("notification-action", "task:view-overdue");
    }
  }),
  taskReminder: (e, t, i) => wt({
    title: "📋 Recordatorio de Tarea",
    body: `"${t}" vence ${i}.`,
    urgency: "normal",
    onClick: () => {
      e.show(), e.focus();
    }
  }),
  syncComplete: () => wt({
    title: "✅ Sincronización Completada",
    body: "Todos los cambios han sido sincronizados.",
    urgency: "low",
    silent: !0
  }),
  syncError: (e) => wt({
    title: "❌ Error de Sincronización",
    body: "No se pudieron sincronizar los cambios. Reintentar.",
    urgency: "critical",
    onClick: () => {
      e.show(), e.focus();
    }
  }),
  achievementUnlocked: (e) => wt({
    title: "🏆 ¡Logro Desbloqueado!",
    body: e,
    urgency: "normal"
  }),
  streakMilestone: (e) => wt({
    title: "🔥 ¡Racha de Productividad!",
    body: `¡Has mantenido tu racha por ${e} días consecutivos!`,
    urgency: "normal"
  }),
  custom: (e, t, i) => wt({
    title: e,
    body: t,
    ...i
  })
}, Is = 1, xE = `
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
let ft = null;
function ME() {
  const e = Ne.getPath("userData");
  return ot.join(e, "ordo-todo.db");
}
function jm() {
  if (ft) return ft;
  const e = ME();
  console.log("[Database] Initializing database at:", e);
  const t = ot.dirname(e);
  return Pl.existsSync(t) || Pl.mkdirSync(t, { recursive: !0 }), ft = new Sy(e, {
    // Enable WAL mode for better concurrent read performance
    // verbose: console.log // Uncomment for debugging
  }), ft.pragma("journal_mode = WAL"), ft.pragma("foreign_keys = ON"), ft.pragma("synchronous = NORMAL"), jE(ft), console.log("[Database] Database initialized successfully"), ft;
}
function jE(e) {
  e.exec(xE);
  const t = e.prepare(`
    SELECT value FROM sync_metadata WHERE key = 'schema_version'
  `).get(), i = t ? parseInt(t.value, 10) : 0;
  i < Is && (console.log(`[Database] Migrating from version ${i} to ${Is}`), e.prepare(`
      INSERT OR REPLACE INTO sync_metadata (key, value, updated_at)
      VALUES ('schema_version', ?, ?)
    `).run(Is.toString(), Date.now()), console.log("[Database] Migration completed"));
}
function xe() {
  return ft || jm();
}
function GE() {
  ft && (ft.close(), ft = null, console.log("[Database] Database connection closed"));
}
function fa() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (e) => {
    const t = Math.random() * 16 | 0;
    return (e === "x" ? t : t & 3 | 8).toString(16);
  });
}
function It() {
  return Date.now();
}
function HE(e) {
  const t = xe(), i = It(), r = fa(), u = {
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
  `).run(u), Lr("task", r, "create", u), u;
}
function BE(e, t) {
  const i = xe(), r = It(), u = Object.keys(t).filter((o) => !["id", "created_at"].includes(o)).map((o) => `${o} = @${o}`).join(", ");
  if (!u) return Du(e);
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
  const s = Du(e);
  return s && Lr("task", e, "update", s), s;
}
function VE(e, t = !0) {
  const i = xe(), r = It();
  return t ? i.prepare(`
      UPDATE tasks 
      SET is_deleted = 1, sync_status = 'deleted', local_updated_at = ?, is_synced = 0
      WHERE id = ?
    `).run(r, e) : i.prepare("DELETE FROM tasks WHERE id = ?").run(e), Lr("task", e, "delete", { id: e }), !0;
}
function Du(e) {
  return xe().prepare(`
    SELECT * FROM tasks WHERE id = ? AND is_deleted = 0
  `).get(e);
}
function zE(e) {
  return xe().prepare(`
    SELECT * FROM tasks 
    WHERE workspace_id = ? AND is_deleted = 0
    ORDER BY position ASC, created_at DESC
  `).all(e);
}
function XE(e) {
  return xe().prepare(`
    SELECT * FROM tasks 
    WHERE project_id = ? AND is_deleted = 0
    ORDER BY position ASC, created_at DESC
  `).all(e);
}
function YE(e) {
  return xe().prepare(`
    SELECT * FROM tasks 
    WHERE workspace_id = ? AND status = 'pending' AND is_deleted = 0
    ORDER BY priority DESC, due_date ASC, position ASC
  `).all(e);
}
function WE() {
  return xe().prepare(`
    SELECT * FROM tasks WHERE is_synced = 0
  `).all();
}
function KE(e) {
  const t = xe(), i = It(), r = fa(), u = {
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
  `).run(u), Lr("workspace", r, "create", u), u;
}
function JE() {
  return xe().prepare(`
    SELECT * FROM workspaces WHERE is_deleted = 0 ORDER BY name ASC
  `).all();
}
function QE(e) {
  return xe().prepare(`
    SELECT * FROM workspaces WHERE id = ? AND is_deleted = 0
  `).get(e);
}
function ZE(e) {
  const t = xe(), i = It(), r = fa(), u = {
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
  `).run(u), Lr("project", r, "create", u), u;
}
function ev(e) {
  return xe().prepare(`
    SELECT * FROM projects 
    WHERE workspace_id = ? AND is_deleted = 0
    ORDER BY name ASC
  `).all(e);
}
function tv(e) {
  const t = xe(), i = It(), r = fa(), u = {
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
  `).run(u), Lr("pomodoro_session", r, "create", u), u;
}
function rv(e, t, i) {
  const r = xe();
  let u = "SELECT * FROM pomodoro_sessions WHERE workspace_id = ? AND is_deleted = 0";
  const s = [e];
  return t && (u += " AND started_at >= ?", s.push(t)), i && (u += " AND started_at <= ?", s.push(i)), u += " ORDER BY started_at DESC", r.prepare(u).all(...s);
}
function Lr(e, t, i, r) {
  const u = xe(), s = u.prepare(`
    SELECT id, operation FROM sync_queue 
    WHERE entity_type = ? AND entity_id = ? AND status = 'pending'
    ORDER BY created_at DESC LIMIT 1
  `).get(e, t);
  if (s) {
    if (s.operation === "create" && i === "update") {
      u.prepare(`
        UPDATE sync_queue SET payload = ? WHERE id = ?
      `).run(JSON.stringify(r), s.id);
      return;
    }
    if (s.operation === "create" && i === "delete") {
      u.prepare("DELETE FROM sync_queue WHERE id = ?").run(s.id);
      return;
    }
    if (s.operation === "update" && i === "delete") {
      u.prepare(`
        UPDATE sync_queue SET operation = 'delete', payload = ? WHERE id = ?
      `).run(JSON.stringify(r), s.id);
      return;
    }
    if (s.operation === "update" && i === "update") {
      u.prepare(`
        UPDATE sync_queue SET payload = ? WHERE id = ?
      `).run(JSON.stringify(r), s.id);
      return;
    }
  }
  u.prepare(`
    INSERT INTO sync_queue (entity_type, entity_id, operation, payload, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(e, t, i, JSON.stringify(r), It());
}
function nv(e = 50) {
  return xe().prepare(`
    SELECT * FROM sync_queue 
    WHERE status = 'pending' 
    ORDER BY created_at ASC
    LIMIT ?
  `).all(e);
}
function iv(e) {
  xe().prepare(`
    UPDATE sync_queue SET status = 'processing', last_attempt_at = ? WHERE id = ?
  `).run(It(), e);
}
function av(e) {
  xe().prepare("DELETE FROM sync_queue WHERE id = ?").run(e);
}
function sv(e, t) {
  xe().prepare(`
    UPDATE sync_queue 
    SET status = CASE WHEN attempts >= 5 THEN 'failed' ELSE 'pending' END,
        attempts = attempts + 1, 
        error = ?,
        last_attempt_at = ?
    WHERE id = ?
  `).run(t, It(), e);
}
function Gm() {
  return xe().prepare(`
    SELECT 
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
      COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
      COUNT(*) as total
    FROM sync_queue
  `).get();
}
function ov(e) {
  return xe().prepare(`
    SELECT value FROM sync_metadata WHERE key = ?
  `).get(e)?.value ?? null;
}
function uv(e, t) {
  xe().prepare(`
    INSERT OR REPLACE INTO sync_metadata (key, value, updated_at)
    VALUES (?, ?, ?)
  `).run(e, t, It());
}
function lv() {
  const e = ov("last_sync_time");
  return e ? parseInt(e, 10) : null;
}
function cv(e) {
  uv("last_sync_time", e.toString());
}
function fv(e, t) {
  const i = xe(), r = Ju(e);
  r && i.prepare(`
    UPDATE ${r} SET sync_status = 'conflict' WHERE id = ?
  `).run(t);
}
function Ju(e) {
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
function dv(e, t) {
  const i = xe(), r = Ju(e);
  if (!r || t.length === 0) return;
  i.transaction(() => {
    for (const s of t) {
      const o = i.prepare(`SELECT id, local_updated_at FROM ${r} WHERE id = ?`).get(s.id);
      if (o)
        if (o.local_updated_at > s.updated_at)
          fv(e, s.id);
        else {
          const d = Object.keys(s).filter((a) => a !== "id").map((a) => `${a} = @${a}`).join(", ");
          i.prepare(`
            UPDATE ${r} 
            SET ${d}, is_synced = 1, sync_status = 'synced', server_updated_at = @updated_at
            WHERE id = @id
          `).run(s);
        }
      else {
        const d = Object.keys(s).join(", "), a = Object.keys(s).map((l) => `@${l}`).join(", ");
        i.prepare(`
          INSERT INTO ${r} (${d}, is_synced, sync_status, local_updated_at, server_updated_at)
          VALUES (${a}, 1, 'synced', @updated_at, @updated_at)
        `).run(s);
      }
    }
  })();
}
function hv(e, t, i) {
  const r = xe(), u = Ju(e);
  u && r.prepare(`
    UPDATE ${u} 
    SET is_synced = 1, sync_status = 'synced', server_updated_at = ?
    WHERE id = ?
  `).run(i, t);
}
const Ye = {
  status: "idle",
  lastSyncTime: null,
  pendingChanges: 0,
  failedChanges: 0,
  isOnline: !0
};
let Nr = null, En = null, vn = "http://localhost:3001/api/v1", pr = null;
function pv(e, t) {
  En = e, vn = t, Ye.lastSyncTime = lv(), Bm(), console.log("[SyncEngine] Initialized");
}
function mv(e) {
  pr = e, console.log("[SyncEngine] Auth token updated");
}
function gv(e = 3e4) {
  Nr && clearInterval(Nr), Nr = setInterval(() => {
    Ye.isOnline && pr && Qu();
  }, e), console.log(`[SyncEngine] Auto-sync started with interval ${e}ms`);
}
function Hm() {
  Nr && (clearInterval(Nr), Nr = null), console.log("[SyncEngine] Auto-sync stopped");
}
function Bm() {
  const e = Gm();
  Ye.pendingChanges = e.pending, Ye.failedChanges = e.failed, Ir();
}
function Ir() {
  En && !En.isDestroyed() && En.webContents.send("sync-state-changed", Ye);
}
function yv(e) {
  const t = !Ye.isOnline;
  Ye.isOnline = e, Ye.status = e ? "idle" : "offline", t && e && pr && Qu(), Ir(), console.log(`[SyncEngine] Online status: ${e}`);
}
function hd() {
  return { ...Ye };
}
async function Qu() {
  if (Ye.status === "syncing") {
    console.log("[SyncEngine] Sync already in progress");
    return;
  }
  if (!pr) {
    console.log("[SyncEngine] No auth token, skipping sync");
    return;
  }
  if (!Ye.isOnline) {
    console.log("[SyncEngine] Offline, skipping sync");
    return;
  }
  try {
    Ye.status = "syncing", Ye.error = void 0, Ir(), console.log("[SyncEngine] Starting sync..."), await Ev(), await _v();
    const e = Date.now();
    cv(e), Ye.lastSyncTime = e, Ye.status = "idle", Bm(), console.log("[SyncEngine] Sync completed successfully");
  } catch (e) {
    console.error("[SyncEngine] Sync failed:", e), Ye.status = "error", Ye.error = e instanceof Error ? e.message : "Unknown error", Ir();
  }
}
async function Ev() {
  const e = nv(50);
  if (e.length === 0) {
    console.log("[SyncEngine] No pending changes to push");
    return;
  }
  console.log(`[SyncEngine] Pushing ${e.length} changes...`);
  for (const t of e)
    try {
      iv(t.id), Ye.currentOperation = `Syncing ${t.entity_type} ${t.operation}`, Ir(), await vv(t) && av(t.id);
    } catch (i) {
      const r = i instanceof Error ? i.message : "Unknown error";
      console.error(`[SyncEngine] Failed to push ${t.entity_type}:${t.entity_id}:`, r), sv(t.id, r);
    }
  Ye.currentOperation = void 0;
}
async function vv(e) {
  const t = Vm(e.entity_type);
  if (!t)
    return console.warn(`[SyncEngine] Unknown entity type: ${e.entity_type}`), !1;
  const i = e.payload ? JSON.parse(e.payload) : null;
  let r;
  switch (e.operation) {
    case "create":
      r = await fetch(`${vn}${t}`, {
        method: "POST",
        headers: Ki(),
        body: JSON.stringify(pd(e.entity_type, i))
      });
      break;
    case "update":
      r = await fetch(`${vn}${t}/${e.entity_id}`, {
        method: "PATCH",
        headers: Ki(),
        body: JSON.stringify(pd(e.entity_type, i))
      });
      break;
    case "delete":
      r = await fetch(`${vn}${t}/${e.entity_id}`, {
        method: "DELETE",
        headers: Ki()
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
    hv(e.entity_type, e.entity_id, u.updatedAt ? new Date(u.updatedAt).getTime() : Date.now());
  }
  return !0;
}
async function _v() {
  console.log("[SyncEngine] Pulling server changes...");
  const e = Ye.lastSyncTime, t = e ? new Date(e).toISOString() : void 0;
  await Fi("workspace", t), await Fi("project", t), await Fi("task", t), await Fi("pomodoro_session", t);
}
async function Fi(e, t) {
  const i = Vm(e);
  if (i)
    try {
      Ye.currentOperation = `Fetching ${e}s`, Ir();
      let r = `${vn}${i}`;
      t && (r += `?updatedSince=${t}`);
      const u = await fetch(r, {
        method: "GET",
        headers: Ki()
      });
      if (!u.ok)
        throw new Error(`Failed to fetch ${e}s: ${u.status}`);
      const s = await u.json(), o = Array.isArray(s) ? s : s.data || s.items || [];
      if (o.length > 0) {
        console.log(`[SyncEngine] Received ${o.length} ${e}s from server`);
        const d = o.map((a) => wv(e, a));
        dv(e, d);
      }
    } catch (r) {
      console.error(`[SyncEngine] Failed to pull ${e}s:`, r);
    }
}
function Vm(e) {
  return {
    workspace: "/workspaces",
    project: "/projects",
    task: "/tasks",
    tag: "/tags",
    pomodoro_session: "/pomodoro-sessions"
  }[e] ?? null;
}
function Ki() {
  const e = {
    "Content-Type": "application/json"
  };
  return pr && (e.Authorization = `Bearer ${pr}`), e;
}
function pd(e, t) {
  const { is_synced: i, sync_status: r, local_updated_at: u, server_updated_at: s, is_deleted: o, ...d } = t, a = {};
  for (const [l, n] of Object.entries(d))
    l.endsWith("_at") || l.endsWith("_date") ? a[md(l)] = n ? new Date(n).toISOString() : null : l.includes("_") ? a[md(l)] = n : a[l] = n;
  return a;
}
function wv(e, t) {
  const i = {};
  for (const [r, u] of Object.entries(t)) {
    const s = Sv(r);
    s.endsWith("_at") || s.endsWith("_date") ? i[s] = u ? new Date(u).getTime() : null : i[s] = u;
  }
  return i;
}
function md(e) {
  return e.replace(/_([a-z])/g, (t, i) => i.toUpperCase());
}
function Sv(e) {
  return e.replace(/[A-Z]/g, (t) => `_${t.toLowerCase()}`);
}
function Tv() {
  return Qu();
}
function Rv() {
  Hm(), En = null, pr = null, console.log("[SyncEngine] Cleaned up");
}
const zt = new Ku({
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
      shortcuts: Ar
    },
    theme: "system",
    locale: "es"
  }
});
function bv(e) {
  try {
    jm(), pv(e, process.env.VITE_API_URL || "http://localhost:3001/api/v1"), console.log("[IPC] Database and Sync Engine initialized");
  } catch (t) {
    console.error("[IPC] Failed to initialize database:", t);
  }
  fe.handle("minimize-window", () => {
    e.minimize();
  }), fe.handle("maximize-window", () => {
    e.isMaximized() ? e.unmaximize() : e.maximize();
  }), fe.handle("close-window", () => {
    zt.get("settings.minimizeToTray", !0) ? e.hide() : e.close();
  }), fe.handle("is-maximized", () => e.isMaximized()), fe.handle("window:setAlwaysOnTop", (t, i) => (e.setAlwaysOnTop(i), zt.set("settings.alwaysOnTop", i), i)), fe.handle("window:isAlwaysOnTop", () => e.isAlwaysOnTop()), fe.handle("window:show", () => {
    e.show(), e.focus();
  }), fe.handle("window:hide", () => {
    e.hide();
  }), fe.handle("tray:update", (t, i) => {
    Cl(e, i);
  }), fe.handle("notification:show", (t, i) => wt(i) !== null), fe.handle("notification:pomodoroComplete", () => {
    Vr.pomodoroComplete(e);
  }), fe.handle("notification:shortBreakComplete", () => {
    Vr.shortBreakComplete(e);
  }), fe.handle("notification:longBreakComplete", () => {
    Vr.longBreakComplete(e);
  }), fe.handle("notification:taskDue", (t, i) => {
    Vr.taskDue(e, i);
  }), fe.handle("notification:taskReminder", (t, i, r) => {
    Vr.taskReminder(e, i, r);
  }), fe.handle("shortcuts:getAll", () => Py()), fe.handle("shortcuts:getDefaults", () => Ar), fe.handle("shortcuts:update", (t, i, r) => Cy(e, i, r)), fe.handle("shortcuts:reset", () => (Am(e, Ar), zt.set("settings.shortcuts", Ar), Ar)), fe.handle("store:get", (t, i) => zt.get(i)), fe.handle("store:set", (t, i, r) => (zt.set(i, r), !0)), fe.handle("store:delete", (t, i) => (zt.delete(i), !0)), fe.handle("store:clear", () => (zt.clear(), !0)), fe.handle("app:getVersion", () => Ne.getVersion()), fe.handle("app:getName", () => Ne.getName()), fe.handle("app:getPath", (t, i) => Ne.getPath(i)), fe.handle("app:isPackaged", () => Ne.isPackaged), fe.on("timer:stateUpdate", (t, i) => {
    Cl(e, i);
  }), fe.handle("db:task:create", (t, i) => HE(i)), fe.handle("db:task:update", (t, i, r) => BE(i, r)), fe.handle("db:task:delete", (t, i, r) => VE(i, r !== !1)), fe.handle("db:task:getById", (t, i) => Du(i)), fe.handle("db:task:getByWorkspace", (t, i) => zE(i)), fe.handle("db:task:getByProject", (t, i) => XE(i)), fe.handle("db:task:getPending", (t, i) => YE(i)), fe.handle("db:task:getUnsynced", () => WE()), fe.handle("db:workspace:create", (t, i) => KE(i)), fe.handle("db:workspace:getAll", () => JE()), fe.handle("db:workspace:getById", (t, i) => QE(i)), fe.handle("db:project:create", (t, i) => ZE(i)), fe.handle("db:project:getByWorkspace", (t, i) => ev(i)), fe.handle("db:session:create", (t, i) => tv(i)), fe.handle("db:session:getByWorkspace", (t, i, r, u) => rv(i, r, u)), fe.handle("sync:setAuthToken", (t, i) => (mv(i), !0)), fe.handle("sync:startAuto", (t, i) => (gv(i), !0)), fe.handle("sync:stopAuto", () => (Hm(), !0)), fe.handle("sync:setOnlineStatus", (t, i) => (yv(i), !0)), fe.handle("sync:getState", () => hd()), fe.handle("sync:force", async () => (await Tv(), hd())), fe.handle("sync:getQueueStats", () => Gm());
}
function gd() {
  return zt;
}
function Av() {
  fe.removeAllListeners(), Mu(), Rv(), GE();
}
const Ji = new Ku({
  defaults: {
    windowState: {
      width: 1200,
      height: 800,
      isMaximized: !1
    }
  }
});
function Ov() {
  const e = Ji.get("windowState");
  return e.x !== void 0 && e.y !== void 0 && !wm.getAllDisplays().some((r) => {
    const u = r.bounds;
    return e.x >= u.x && e.x < u.x + u.width && e.y >= u.y && e.y < u.y + u.height;
  }) ? {
    width: e.width,
    height: e.height,
    isMaximized: e.isMaximized
  } : e;
}
function zr(e) {
  if (!e) return;
  if (e.isMaximized()) {
    const i = Ji.get("windowState");
    Ji.set("windowState", {
      ...i,
      isMaximized: !0
    });
  } else {
    const i = e.getBounds();
    Ji.set("windowState", {
      x: i.x,
      y: i.y,
      width: i.width,
      height: i.height,
      isMaximized: !1
    });
  }
}
function Nv(e) {
  let t = null;
  e.on("resize", () => {
    t && clearTimeout(t), t = setTimeout(() => {
      zr(e);
    }, 500);
  });
  let i = null;
  e.on("move", () => {
    i && clearTimeout(i), i = setTimeout(() => {
      zr(e);
    }, 500);
  }), e.on("maximize", () => {
    zr(e);
  }), e.on("unmaximize", () => {
    zr(e);
  }), e.on("close", () => {
    zr(e);
  });
}
let je = null, Xt = null;
const zm = 280, $v = 120;
function Iv() {
  const e = wm.getPrimaryDisplay(), { width: t, height: i } = e.workAreaSize;
  return {
    x: t - zm - 20,
    y: 20
  };
}
function Pv(e) {
  Xt = e;
  const { x: t, y: i } = Iv();
  je = new Fu({
    width: zm,
    height: $v,
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
      preload: ot.join(__dirname, "preload.js"),
      nodeIntegration: !1,
      contextIsolation: !0
    }
  });
  const r = process.env.VITE_DEV_SERVER_URL;
  return r ? je.loadURL(`${r}#/timer-floating`) : je.loadFile(ot.join(process.env.DIST, "index.html"), {
    hash: "/timer-floating"
  }), je.on("close", (u) => {
    Ne.isQuitting || (u.preventDefault(), je?.hide());
  }), je;
}
function Cv() {
  je && je.show();
}
function yd() {
  je && je.hide();
}
function Dv() {
  je && (je.isVisible() ? je.hide() : je.show());
}
function Ed() {
  return je?.isVisible() ?? !1;
}
function Lv() {
  je && (je.destroy(), je = null);
}
function kv(e) {
  je && !je.isDestroyed() && je.webContents.send("timer-window:state-update", e);
}
function Fv(e, t) {
  je && je.setPosition(e, t);
}
function Uv() {
  if (je) {
    const [e, t] = je.getPosition();
    return { x: e, y: t };
  }
  return null;
}
function qv() {
  fe.handle("timer-window:show", () => {
    Cv();
  }), fe.handle("timer-window:hide", () => {
    yd();
  }), fe.handle("timer-window:toggle", () => (Dv(), Ed())), fe.handle("timer-window:isVisible", () => Ed()), fe.handle("timer-window:setPosition", (e, t, i) => {
    Fv(t, i);
  }), fe.handle("timer-window:getPosition", () => Uv()), fe.handle("timer-window:action", (e, t) => {
    Xt && !Xt.isDestroyed() && Xt.webContents.send("timer-window:action", t);
  }), fe.handle("timer-window:expand", () => {
    Xt && !Xt.isDestroyed() && (Xt.show(), Xt.focus()), yd();
  }), fe.on("timer:stateUpdate", (e, t) => {
    kv(t);
  });
}
function xv() {
  fe.removeHandler("timer-window:show"), fe.removeHandler("timer-window:hide"), fe.removeHandler("timer-window:toggle"), fe.removeHandler("timer-window:isVisible"), fe.removeHandler("timer-window:setPosition"), fe.removeHandler("timer-window:getPosition"), fe.removeHandler("timer-window:action"), fe.removeHandler("timer-window:expand");
}
const xt = "ordo";
let mt = null, _n = null;
function Mv(e) {
  try {
    const i = e.replace(`${xt}://`, "").split("/"), [r, u, s] = i, o = {};
    if (u?.includes("?")) {
      const [d, a] = u.split("?");
      return new URLSearchParams(a).forEach((n, f) => {
        o[f] = n;
      }), {
        type: vd(r),
        id: d,
        action: s,
        params: Object.keys(o).length > 0 ? o : void 0
      };
    }
    return {
      type: vd(r),
      id: u || void 0,
      action: s || void 0,
      params: Object.keys(o).length > 0 ? o : void 0
    };
  } catch (t) {
    return console.error("[DeepLinks] Failed to parse URL:", e, t), { type: "unknown" };
  }
}
function vd(e) {
  return ["task", "project", "workspace", "timer", "settings"].includes(e) ? e : "unknown";
}
function Lu(e) {
  if (console.log("[DeepLinks] Handling URL:", e), !mt || mt.isDestroyed()) {
    _n = e;
    return;
  }
  const t = Mv(e);
  console.log("[DeepLinks] Parsed data:", t), mt.isMinimized() && mt.restore(), mt.show(), mt.focus(), mt.webContents.send("deep-link", t);
}
function jv() {
  _n && (Lu(_n), _n = null);
}
function Gv(e) {
  if (mt = e, process.defaultApp ? process.argv.length >= 2 && Ne.setAsDefaultProtocolClient(xt, process.execPath, [process.argv[1]]) : Ne.setAsDefaultProtocolClient(xt), !Ne.requestSingleInstanceLock()) {
    Ne.quit();
    return;
  }
  Ne.on("second-instance", (r, u) => {
    mt && (mt.isMinimized() && mt.restore(), mt.focus());
    const s = u.find((o) => o.startsWith(`${xt}://`));
    s && Lu(s);
  }), Ne.on("open-url", (r, u) => {
    r.preventDefault(), Lu(u);
  });
  const i = process.argv.find((r) => r.startsWith(`${xt}://`));
  i && (_n = i), console.log(`[DeepLinks] Protocol "${xt}://" registered`);
}
function Hv() {
  process.defaultApp ? process.argv.length >= 2 && Ne.removeAsDefaultProtocolClient(xt, process.execPath, [process.argv[1]]) : Ne.removeAsDefaultProtocolClient(xt), console.log(`[DeepLinks] Protocol "${xt}://" unregistered`);
}
var lr = {}, Ps = {}, Ui = {}, _d;
function dt() {
  return _d || (_d = 1, Ui.fromCallback = function(e) {
    return Object.defineProperty(function(...t) {
      if (typeof t[t.length - 1] == "function") e.apply(this, t);
      else
        return new Promise((i, r) => {
          t.push((u, s) => u != null ? r(u) : i(s)), e.apply(this, t);
        });
    }, "name", { value: e.name });
  }, Ui.fromPromise = function(e) {
    return Object.defineProperty(function(...t) {
      const i = t[t.length - 1];
      if (typeof i != "function") return e.apply(this, t);
      t.pop(), e.apply(this, t).then((r) => i(null, r), i);
    }, "name", { value: e.name });
  }), Ui;
}
var Cs, wd;
function Bv() {
  if (wd) return Cs;
  wd = 1;
  var e = Ty, t = process.cwd, i = null, r = process.env.GRACEFUL_FS_PLATFORM || process.platform;
  process.cwd = function() {
    return i || (i = t.call(process)), i;
  };
  try {
    process.cwd();
  } catch {
  }
  if (typeof process.chdir == "function") {
    var u = process.chdir;
    process.chdir = function(o) {
      i = null, u.call(process, o);
    }, Object.setPrototypeOf && Object.setPrototypeOf(process.chdir, u);
  }
  Cs = s;
  function s(o) {
    e.hasOwnProperty("O_SYMLINK") && process.version.match(/^v0\.6\.[0-2]|^v0\.5\./) && d(o), o.lutimes || a(o), o.chown = f(o.chown), o.fchown = f(o.fchown), o.lchown = f(o.lchown), o.chmod = l(o.chmod), o.fchmod = l(o.fchmod), o.lchmod = l(o.lchmod), o.chownSync = c(o.chownSync), o.fchownSync = c(o.fchownSync), o.lchownSync = c(o.lchownSync), o.chmodSync = n(o.chmodSync), o.fchmodSync = n(o.fchmodSync), o.lchmodSync = n(o.lchmodSync), o.stat = h(o.stat), o.fstat = h(o.fstat), o.lstat = h(o.lstat), o.statSync = y(o.statSync), o.fstatSync = y(o.fstatSync), o.lstatSync = y(o.lstatSync), o.chmod && !o.lchmod && (o.lchmod = function(p, v, m) {
      m && process.nextTick(m);
    }, o.lchmodSync = function() {
    }), o.chown && !o.lchown && (o.lchown = function(p, v, m, w) {
      w && process.nextTick(w);
    }, o.lchownSync = function() {
    }), r === "win32" && (o.rename = typeof o.rename != "function" ? o.rename : (function(p) {
      function v(m, w, T) {
        var R = Date.now(), _ = 0;
        p(m, w, function S(A) {
          if (A && (A.code === "EACCES" || A.code === "EPERM" || A.code === "EBUSY") && Date.now() - R < 6e4) {
            setTimeout(function() {
              o.stat(w, function(b, x) {
                b && b.code === "ENOENT" ? p(m, w, S) : T(A);
              });
            }, _), _ < 100 && (_ += 10);
            return;
          }
          T && T(A);
        });
      }
      return Object.setPrototypeOf && Object.setPrototypeOf(v, p), v;
    })(o.rename)), o.read = typeof o.read != "function" ? o.read : (function(p) {
      function v(m, w, T, R, _, S) {
        var A;
        if (S && typeof S == "function") {
          var b = 0;
          A = function(x, M, j) {
            if (x && x.code === "EAGAIN" && b < 10)
              return b++, p.call(o, m, w, T, R, _, A);
            S.apply(this, arguments);
          };
        }
        return p.call(o, m, w, T, R, _, A);
      }
      return Object.setPrototypeOf && Object.setPrototypeOf(v, p), v;
    })(o.read), o.readSync = typeof o.readSync != "function" ? o.readSync : /* @__PURE__ */ (function(p) {
      return function(v, m, w, T, R) {
        for (var _ = 0; ; )
          try {
            return p.call(o, v, m, w, T, R);
          } catch (S) {
            if (S.code === "EAGAIN" && _ < 10) {
              _++;
              continue;
            }
            throw S;
          }
      };
    })(o.readSync);
    function d(p) {
      p.lchmod = function(v, m, w) {
        p.open(
          v,
          e.O_WRONLY | e.O_SYMLINK,
          m,
          function(T, R) {
            if (T) {
              w && w(T);
              return;
            }
            p.fchmod(R, m, function(_) {
              p.close(R, function(S) {
                w && w(_ || S);
              });
            });
          }
        );
      }, p.lchmodSync = function(v, m) {
        var w = p.openSync(v, e.O_WRONLY | e.O_SYMLINK, m), T = !0, R;
        try {
          R = p.fchmodSync(w, m), T = !1;
        } finally {
          if (T)
            try {
              p.closeSync(w);
            } catch {
            }
          else
            p.closeSync(w);
        }
        return R;
      };
    }
    function a(p) {
      e.hasOwnProperty("O_SYMLINK") && p.futimes ? (p.lutimes = function(v, m, w, T) {
        p.open(v, e.O_SYMLINK, function(R, _) {
          if (R) {
            T && T(R);
            return;
          }
          p.futimes(_, m, w, function(S) {
            p.close(_, function(A) {
              T && T(S || A);
            });
          });
        });
      }, p.lutimesSync = function(v, m, w) {
        var T = p.openSync(v, e.O_SYMLINK), R, _ = !0;
        try {
          R = p.futimesSync(T, m, w), _ = !1;
        } finally {
          if (_)
            try {
              p.closeSync(T);
            } catch {
            }
          else
            p.closeSync(T);
        }
        return R;
      }) : p.futimes && (p.lutimes = function(v, m, w, T) {
        T && process.nextTick(T);
      }, p.lutimesSync = function() {
      });
    }
    function l(p) {
      return p && function(v, m, w) {
        return p.call(o, v, m, function(T) {
          E(T) && (T = null), w && w.apply(this, arguments);
        });
      };
    }
    function n(p) {
      return p && function(v, m) {
        try {
          return p.call(o, v, m);
        } catch (w) {
          if (!E(w)) throw w;
        }
      };
    }
    function f(p) {
      return p && function(v, m, w, T) {
        return p.call(o, v, m, w, function(R) {
          E(R) && (R = null), T && T.apply(this, arguments);
        });
      };
    }
    function c(p) {
      return p && function(v, m, w) {
        try {
          return p.call(o, v, m, w);
        } catch (T) {
          if (!E(T)) throw T;
        }
      };
    }
    function h(p) {
      return p && function(v, m, w) {
        typeof m == "function" && (w = m, m = null);
        function T(R, _) {
          _ && (_.uid < 0 && (_.uid += 4294967296), _.gid < 0 && (_.gid += 4294967296)), w && w.apply(this, arguments);
        }
        return m ? p.call(o, v, m, T) : p.call(o, v, T);
      };
    }
    function y(p) {
      return p && function(v, m) {
        var w = m ? p.call(o, v, m) : p.call(o, v);
        return w && (w.uid < 0 && (w.uid += 4294967296), w.gid < 0 && (w.gid += 4294967296)), w;
      };
    }
    function E(p) {
      if (!p || p.code === "ENOSYS")
        return !0;
      var v = !process.getuid || process.getuid() !== 0;
      return !!(v && (p.code === "EINVAL" || p.code === "EPERM"));
    }
  }
  return Cs;
}
var Ds, Sd;
function Vv() {
  if (Sd) return Ds;
  Sd = 1;
  var e = Tn.Stream;
  Ds = t;
  function t(i) {
    return {
      ReadStream: r,
      WriteStream: u
    };
    function r(s, o) {
      if (!(this instanceof r)) return new r(s, o);
      e.call(this);
      var d = this;
      this.path = s, this.fd = null, this.readable = !0, this.paused = !1, this.flags = "r", this.mode = 438, this.bufferSize = 64 * 1024, o = o || {};
      for (var a = Object.keys(o), l = 0, n = a.length; l < n; l++) {
        var f = a[l];
        this[f] = o[f];
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
      i.open(this.path, this.flags, this.mode, function(c, h) {
        if (c) {
          d.emit("error", c), d.readable = !1;
          return;
        }
        d.fd = h, d.emit("open", h), d._read();
      });
    }
    function u(s, o) {
      if (!(this instanceof u)) return new u(s, o);
      e.call(this), this.path = s, this.fd = null, this.writable = !0, this.flags = "w", this.encoding = "binary", this.mode = 438, this.bytesWritten = 0, o = o || {};
      for (var d = Object.keys(o), a = 0, l = d.length; a < l; a++) {
        var n = d[a];
        this[n] = o[n];
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
  return Ds;
}
var Ls, Td;
function zv() {
  if (Td) return Ls;
  Td = 1, Ls = t;
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
  return Ls;
}
var qi, Rd;
function ut() {
  if (Rd) return qi;
  Rd = 1;
  var e = Rt, t = Bv(), i = Vv(), r = zv(), u = wn, s, o;
  typeof Symbol == "function" && typeof Symbol.for == "function" ? (s = /* @__PURE__ */ Symbol.for("graceful-fs.queue"), o = /* @__PURE__ */ Symbol.for("graceful-fs.previous")) : (s = "___graceful-fs.queue", o = "___graceful-fs.previous");
  function d() {
  }
  function a(p, v) {
    Object.defineProperty(p, s, {
      get: function() {
        return v;
      }
    });
  }
  var l = d;
  if (u.debuglog ? l = u.debuglog("gfs4") : /\bgfs4\b/i.test(process.env.NODE_DEBUG || "") && (l = function() {
    var p = u.format.apply(u, arguments);
    p = "GFS4: " + p.split(/\n/).join(`
GFS4: `), console.error(p);
  }), !e[s]) {
    var n = Tt[s] || [];
    a(e, n), e.close = (function(p) {
      function v(m, w) {
        return p.call(e, m, function(T) {
          T || y(), typeof w == "function" && w.apply(this, arguments);
        });
      }
      return Object.defineProperty(v, o, {
        value: p
      }), v;
    })(e.close), e.closeSync = (function(p) {
      function v(m) {
        p.apply(e, arguments), y();
      }
      return Object.defineProperty(v, o, {
        value: p
      }), v;
    })(e.closeSync), /\bgfs4\b/i.test(process.env.NODE_DEBUG || "") && process.on("exit", function() {
      l(e[s]), Uu.equal(e[s].length, 0);
    });
  }
  Tt[s] || a(Tt, e[s]), qi = f(r(e)), process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !e.__patched && (qi = f(e), e.__patched = !0);
  function f(p) {
    t(p), p.gracefulify = f, p.createReadStream = q, p.createWriteStream = z;
    var v = p.readFile;
    p.readFile = m;
    function m(I, K, N) {
      return typeof K == "function" && (N = K, K = null), O(I, K, N);
      function O(Q, V, B, Y) {
        return v(Q, V, function(Z) {
          Z && (Z.code === "EMFILE" || Z.code === "ENFILE") ? c([O, [Q, V, B], Z, Y || Date.now(), Date.now()]) : typeof B == "function" && B.apply(this, arguments);
        });
      }
    }
    var w = p.writeFile;
    p.writeFile = T;
    function T(I, K, N, O) {
      return typeof N == "function" && (O = N, N = null), Q(I, K, N, O);
      function Q(V, B, Y, Z, re) {
        return w(V, B, Y, function(le) {
          le && (le.code === "EMFILE" || le.code === "ENFILE") ? c([Q, [V, B, Y, Z], le, re || Date.now(), Date.now()]) : typeof Z == "function" && Z.apply(this, arguments);
        });
      }
    }
    var R = p.appendFile;
    R && (p.appendFile = _);
    function _(I, K, N, O) {
      return typeof N == "function" && (O = N, N = null), Q(I, K, N, O);
      function Q(V, B, Y, Z, re) {
        return R(V, B, Y, function(le) {
          le && (le.code === "EMFILE" || le.code === "ENFILE") ? c([Q, [V, B, Y, Z], le, re || Date.now(), Date.now()]) : typeof Z == "function" && Z.apply(this, arguments);
        });
      }
    }
    var S = p.copyFile;
    S && (p.copyFile = A);
    function A(I, K, N, O) {
      return typeof N == "function" && (O = N, N = 0), Q(I, K, N, O);
      function Q(V, B, Y, Z, re) {
        return S(V, B, Y, function(le) {
          le && (le.code === "EMFILE" || le.code === "ENFILE") ? c([Q, [V, B, Y, Z], le, re || Date.now(), Date.now()]) : typeof Z == "function" && Z.apply(this, arguments);
        });
      }
    }
    var b = p.readdir;
    p.readdir = M;
    var x = /^v[0-5]\./;
    function M(I, K, N) {
      typeof K == "function" && (N = K, K = null);
      var O = x.test(process.version) ? function(B, Y, Z, re) {
        return b(B, Q(
          B,
          Y,
          Z,
          re
        ));
      } : function(B, Y, Z, re) {
        return b(B, Y, Q(
          B,
          Y,
          Z,
          re
        ));
      };
      return O(I, K, N);
      function Q(V, B, Y, Z) {
        return function(re, le) {
          re && (re.code === "EMFILE" || re.code === "ENFILE") ? c([
            O,
            [V, B, Y],
            re,
            Z || Date.now(),
            Date.now()
          ]) : (le && le.sort && le.sort(), typeof Y == "function" && Y.call(this, re, le));
        };
      }
    }
    if (process.version.substr(0, 4) === "v0.8") {
      var j = i(p);
      L = j.ReadStream, G = j.WriteStream;
    }
    var X = p.ReadStream;
    X && (L.prototype = Object.create(X.prototype), L.prototype.open = F);
    var P = p.WriteStream;
    P && (G.prototype = Object.create(P.prototype), G.prototype.open = k), Object.defineProperty(p, "ReadStream", {
      get: function() {
        return L;
      },
      set: function(I) {
        L = I;
      },
      enumerable: !0,
      configurable: !0
    }), Object.defineProperty(p, "WriteStream", {
      get: function() {
        return G;
      },
      set: function(I) {
        G = I;
      },
      enumerable: !0,
      configurable: !0
    });
    var D = L;
    Object.defineProperty(p, "FileReadStream", {
      get: function() {
        return D;
      },
      set: function(I) {
        D = I;
      },
      enumerable: !0,
      configurable: !0
    });
    var W = G;
    Object.defineProperty(p, "FileWriteStream", {
      get: function() {
        return W;
      },
      set: function(I) {
        W = I;
      },
      enumerable: !0,
      configurable: !0
    });
    function L(I, K) {
      return this instanceof L ? (X.apply(this, arguments), this) : L.apply(Object.create(L.prototype), arguments);
    }
    function F() {
      var I = this;
      $(I.path, I.flags, I.mode, function(K, N) {
        K ? (I.autoClose && I.destroy(), I.emit("error", K)) : (I.fd = N, I.emit("open", N), I.read());
      });
    }
    function G(I, K) {
      return this instanceof G ? (P.apply(this, arguments), this) : G.apply(Object.create(G.prototype), arguments);
    }
    function k() {
      var I = this;
      $(I.path, I.flags, I.mode, function(K, N) {
        K ? (I.destroy(), I.emit("error", K)) : (I.fd = N, I.emit("open", N));
      });
    }
    function q(I, K) {
      return new p.ReadStream(I, K);
    }
    function z(I, K) {
      return new p.WriteStream(I, K);
    }
    var H = p.open;
    p.open = $;
    function $(I, K, N, O) {
      return typeof N == "function" && (O = N, N = null), Q(I, K, N, O);
      function Q(V, B, Y, Z, re) {
        return H(V, B, Y, function(le, Se) {
          le && (le.code === "EMFILE" || le.code === "ENFILE") ? c([Q, [V, B, Y, Z], le, re || Date.now(), Date.now()]) : typeof Z == "function" && Z.apply(this, arguments);
        });
      }
    }
    return p;
  }
  function c(p) {
    l("ENQUEUE", p[0].name, p[1]), e[s].push(p), E();
  }
  var h;
  function y() {
    for (var p = Date.now(), v = 0; v < e[s].length; ++v)
      e[s][v].length > 2 && (e[s][v][3] = p, e[s][v][4] = p);
    E();
  }
  function E() {
    if (clearTimeout(h), h = void 0, e[s].length !== 0) {
      var p = e[s].shift(), v = p[0], m = p[1], w = p[2], T = p[3], R = p[4];
      if (T === void 0)
        l("RETRY", v.name, m), v.apply(null, m);
      else if (Date.now() - T >= 6e4) {
        l("TIMEOUT", v.name, m);
        var _ = m.pop();
        typeof _ == "function" && _.call(null, w);
      } else {
        var S = Date.now() - R, A = Math.max(R - T, 1), b = Math.min(A * 1.2, 100);
        S >= b ? (l("RETRY", v.name, m), v.apply(null, m.concat([T]))) : e[s].push(p);
      }
      h === void 0 && (h = setTimeout(E, 0));
    }
  }
  return qi;
}
var bd;
function kr() {
  return bd || (bd = 1, (function(e) {
    const t = dt().fromCallback, i = ut(), r = [
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
    }), e.exists = function(u, s) {
      return typeof s == "function" ? i.exists(u, s) : new Promise((o) => i.exists(u, o));
    }, e.read = function(u, s, o, d, a, l) {
      return typeof l == "function" ? i.read(u, s, o, d, a, l) : new Promise((n, f) => {
        i.read(u, s, o, d, a, (c, h, y) => {
          if (c) return f(c);
          n({ bytesRead: h, buffer: y });
        });
      });
    }, e.write = function(u, s, ...o) {
      return typeof o[o.length - 1] == "function" ? i.write(u, s, ...o) : new Promise((d, a) => {
        i.write(u, s, ...o, (l, n, f) => {
          if (l) return a(l);
          d({ bytesWritten: n, buffer: f });
        });
      });
    }, typeof i.writev == "function" && (e.writev = function(u, s, ...o) {
      return typeof o[o.length - 1] == "function" ? i.writev(u, s, ...o) : new Promise((d, a) => {
        i.writev(u, s, ...o, (l, n, f) => {
          if (l) return a(l);
          d({ bytesWritten: n, buffers: f });
        });
      });
    }), typeof i.realpath.native == "function" ? e.realpath.native = t(i.realpath.native) : process.emitWarning(
      "fs.realpath.native is not a function. Is fs being monkey-patched?",
      "Warning",
      "fs-extra-WARN0003"
    );
  })(Ps)), Ps;
}
var xi = {}, ks = {}, Ad;
function Xv() {
  if (Ad) return ks;
  Ad = 1;
  const e = De;
  return ks.checkPath = function(i) {
    if (process.platform === "win32" && /[<>:"|?*]/.test(i.replace(e.parse(i).root, ""))) {
      const u = new Error(`Path contains invalid characters: ${i}`);
      throw u.code = "EINVAL", u;
    }
  }, ks;
}
var Od;
function Yv() {
  if (Od) return xi;
  Od = 1;
  const e = /* @__PURE__ */ kr(), { checkPath: t } = /* @__PURE__ */ Xv(), i = (r) => {
    const u = { mode: 511 };
    return typeof r == "number" ? r : { ...u, ...r }.mode;
  };
  return xi.makeDir = async (r, u) => (t(r), e.mkdir(r, {
    mode: i(u),
    recursive: !0
  })), xi.makeDirSync = (r, u) => (t(r), e.mkdirSync(r, {
    mode: i(u),
    recursive: !0
  })), xi;
}
var Fs, Nd;
function Pt() {
  if (Nd) return Fs;
  Nd = 1;
  const e = dt().fromPromise, { makeDir: t, makeDirSync: i } = /* @__PURE__ */ Yv(), r = e(t);
  return Fs = {
    mkdirs: r,
    mkdirsSync: i,
    // alias
    mkdirp: r,
    mkdirpSync: i,
    ensureDir: r,
    ensureDirSync: i
  }, Fs;
}
var Us, $d;
function mr() {
  if ($d) return Us;
  $d = 1;
  const e = dt().fromPromise, t = /* @__PURE__ */ kr();
  function i(r) {
    return t.access(r).then(() => !0).catch(() => !1);
  }
  return Us = {
    pathExists: e(i),
    pathExistsSync: t.existsSync
  }, Us;
}
var qs, Id;
function Xm() {
  if (Id) return qs;
  Id = 1;
  const e = ut();
  function t(r, u, s, o) {
    e.open(r, "r+", (d, a) => {
      if (d) return o(d);
      e.futimes(a, u, s, (l) => {
        e.close(a, (n) => {
          o && o(l || n);
        });
      });
    });
  }
  function i(r, u, s) {
    const o = e.openSync(r, "r+");
    return e.futimesSync(o, u, s), e.closeSync(o);
  }
  return qs = {
    utimesMillis: t,
    utimesMillisSync: i
  }, qs;
}
var xs, Pd;
function Fr() {
  if (Pd) return xs;
  Pd = 1;
  const e = /* @__PURE__ */ kr(), t = De, i = wn;
  function r(c, h, y) {
    const E = y.dereference ? (p) => e.stat(p, { bigint: !0 }) : (p) => e.lstat(p, { bigint: !0 });
    return Promise.all([
      E(c),
      E(h).catch((p) => {
        if (p.code === "ENOENT") return null;
        throw p;
      })
    ]).then(([p, v]) => ({ srcStat: p, destStat: v }));
  }
  function u(c, h, y) {
    let E;
    const p = y.dereference ? (m) => e.statSync(m, { bigint: !0 }) : (m) => e.lstatSync(m, { bigint: !0 }), v = p(c);
    try {
      E = p(h);
    } catch (m) {
      if (m.code === "ENOENT") return { srcStat: v, destStat: null };
      throw m;
    }
    return { srcStat: v, destStat: E };
  }
  function s(c, h, y, E, p) {
    i.callbackify(r)(c, h, E, (v, m) => {
      if (v) return p(v);
      const { srcStat: w, destStat: T } = m;
      if (T) {
        if (l(w, T)) {
          const R = t.basename(c), _ = t.basename(h);
          return y === "move" && R !== _ && R.toLowerCase() === _.toLowerCase() ? p(null, { srcStat: w, destStat: T, isChangingCase: !0 }) : p(new Error("Source and destination must not be the same."));
        }
        if (w.isDirectory() && !T.isDirectory())
          return p(new Error(`Cannot overwrite non-directory '${h}' with directory '${c}'.`));
        if (!w.isDirectory() && T.isDirectory())
          return p(new Error(`Cannot overwrite directory '${h}' with non-directory '${c}'.`));
      }
      return w.isDirectory() && n(c, h) ? p(new Error(f(c, h, y))) : p(null, { srcStat: w, destStat: T });
    });
  }
  function o(c, h, y, E) {
    const { srcStat: p, destStat: v } = u(c, h, E);
    if (v) {
      if (l(p, v)) {
        const m = t.basename(c), w = t.basename(h);
        if (y === "move" && m !== w && m.toLowerCase() === w.toLowerCase())
          return { srcStat: p, destStat: v, isChangingCase: !0 };
        throw new Error("Source and destination must not be the same.");
      }
      if (p.isDirectory() && !v.isDirectory())
        throw new Error(`Cannot overwrite non-directory '${h}' with directory '${c}'.`);
      if (!p.isDirectory() && v.isDirectory())
        throw new Error(`Cannot overwrite directory '${h}' with non-directory '${c}'.`);
    }
    if (p.isDirectory() && n(c, h))
      throw new Error(f(c, h, y));
    return { srcStat: p, destStat: v };
  }
  function d(c, h, y, E, p) {
    const v = t.resolve(t.dirname(c)), m = t.resolve(t.dirname(y));
    if (m === v || m === t.parse(m).root) return p();
    e.stat(m, { bigint: !0 }, (w, T) => w ? w.code === "ENOENT" ? p() : p(w) : l(h, T) ? p(new Error(f(c, y, E))) : d(c, h, m, E, p));
  }
  function a(c, h, y, E) {
    const p = t.resolve(t.dirname(c)), v = t.resolve(t.dirname(y));
    if (v === p || v === t.parse(v).root) return;
    let m;
    try {
      m = e.statSync(v, { bigint: !0 });
    } catch (w) {
      if (w.code === "ENOENT") return;
      throw w;
    }
    if (l(h, m))
      throw new Error(f(c, y, E));
    return a(c, h, v, E);
  }
  function l(c, h) {
    return h.ino && h.dev && h.ino === c.ino && h.dev === c.dev;
  }
  function n(c, h) {
    const y = t.resolve(c).split(t.sep).filter((p) => p), E = t.resolve(h).split(t.sep).filter((p) => p);
    return y.reduce((p, v, m) => p && E[m] === v, !0);
  }
  function f(c, h, y) {
    return `Cannot ${y} '${c}' to a subdirectory of itself, '${h}'.`;
  }
  return xs = {
    checkPaths: s,
    checkPathsSync: o,
    checkParentPaths: d,
    checkParentPathsSync: a,
    isSrcSubdir: n,
    areIdentical: l
  }, xs;
}
var Ms, Cd;
function Wv() {
  if (Cd) return Ms;
  Cd = 1;
  const e = ut(), t = De, i = Pt().mkdirs, r = mr().pathExists, u = Xm().utimesMillis, s = /* @__PURE__ */ Fr();
  function o(M, j, X, P) {
    typeof X == "function" && !P ? (P = X, X = {}) : typeof X == "function" && (X = { filter: X }), P = P || function() {
    }, X = X || {}, X.clobber = "clobber" in X ? !!X.clobber : !0, X.overwrite = "overwrite" in X ? !!X.overwrite : X.clobber, X.preserveTimestamps && process.arch === "ia32" && process.emitWarning(
      `Using the preserveTimestamps option in 32-bit node is not recommended;

	see https://github.com/jprichardson/node-fs-extra/issues/269`,
      "Warning",
      "fs-extra-WARN0001"
    ), s.checkPaths(M, j, "copy", X, (D, W) => {
      if (D) return P(D);
      const { srcStat: L, destStat: F } = W;
      s.checkParentPaths(M, L, j, "copy", (G) => G ? P(G) : X.filter ? a(d, F, M, j, X, P) : d(F, M, j, X, P));
    });
  }
  function d(M, j, X, P, D) {
    const W = t.dirname(X);
    r(W, (L, F) => {
      if (L) return D(L);
      if (F) return n(M, j, X, P, D);
      i(W, (G) => G ? D(G) : n(M, j, X, P, D));
    });
  }
  function a(M, j, X, P, D, W) {
    Promise.resolve(D.filter(X, P)).then((L) => L ? M(j, X, P, D, W) : W(), (L) => W(L));
  }
  function l(M, j, X, P, D) {
    return P.filter ? a(n, M, j, X, P, D) : n(M, j, X, P, D);
  }
  function n(M, j, X, P, D) {
    (P.dereference ? e.stat : e.lstat)(j, (L, F) => L ? D(L) : F.isDirectory() ? T(F, M, j, X, P, D) : F.isFile() || F.isCharacterDevice() || F.isBlockDevice() ? f(F, M, j, X, P, D) : F.isSymbolicLink() ? b(M, j, X, P, D) : F.isSocket() ? D(new Error(`Cannot copy a socket file: ${j}`)) : F.isFIFO() ? D(new Error(`Cannot copy a FIFO pipe: ${j}`)) : D(new Error(`Unknown file: ${j}`)));
  }
  function f(M, j, X, P, D, W) {
    return j ? c(M, X, P, D, W) : h(M, X, P, D, W);
  }
  function c(M, j, X, P, D) {
    if (P.overwrite)
      e.unlink(X, (W) => W ? D(W) : h(M, j, X, P, D));
    else return P.errorOnExist ? D(new Error(`'${X}' already exists`)) : D();
  }
  function h(M, j, X, P, D) {
    e.copyFile(j, X, (W) => W ? D(W) : P.preserveTimestamps ? y(M.mode, j, X, D) : m(X, M.mode, D));
  }
  function y(M, j, X, P) {
    return E(M) ? p(X, M, (D) => D ? P(D) : v(M, j, X, P)) : v(M, j, X, P);
  }
  function E(M) {
    return (M & 128) === 0;
  }
  function p(M, j, X) {
    return m(M, j | 128, X);
  }
  function v(M, j, X, P) {
    w(j, X, (D) => D ? P(D) : m(X, M, P));
  }
  function m(M, j, X) {
    return e.chmod(M, j, X);
  }
  function w(M, j, X) {
    e.stat(M, (P, D) => P ? X(P) : u(j, D.atime, D.mtime, X));
  }
  function T(M, j, X, P, D, W) {
    return j ? _(X, P, D, W) : R(M.mode, X, P, D, W);
  }
  function R(M, j, X, P, D) {
    e.mkdir(X, (W) => {
      if (W) return D(W);
      _(j, X, P, (L) => L ? D(L) : m(X, M, D));
    });
  }
  function _(M, j, X, P) {
    e.readdir(M, (D, W) => D ? P(D) : S(W, M, j, X, P));
  }
  function S(M, j, X, P, D) {
    const W = M.pop();
    return W ? A(M, W, j, X, P, D) : D();
  }
  function A(M, j, X, P, D, W) {
    const L = t.join(X, j), F = t.join(P, j);
    s.checkPaths(L, F, "copy", D, (G, k) => {
      if (G) return W(G);
      const { destStat: q } = k;
      l(q, L, F, D, (z) => z ? W(z) : S(M, X, P, D, W));
    });
  }
  function b(M, j, X, P, D) {
    e.readlink(j, (W, L) => {
      if (W) return D(W);
      if (P.dereference && (L = t.resolve(process.cwd(), L)), M)
        e.readlink(X, (F, G) => F ? F.code === "EINVAL" || F.code === "UNKNOWN" ? e.symlink(L, X, D) : D(F) : (P.dereference && (G = t.resolve(process.cwd(), G)), s.isSrcSubdir(L, G) ? D(new Error(`Cannot copy '${L}' to a subdirectory of itself, '${G}'.`)) : M.isDirectory() && s.isSrcSubdir(G, L) ? D(new Error(`Cannot overwrite '${G}' with '${L}'.`)) : x(L, X, D)));
      else
        return e.symlink(L, X, D);
    });
  }
  function x(M, j, X) {
    e.unlink(j, (P) => P ? X(P) : e.symlink(M, j, X));
  }
  return Ms = o, Ms;
}
var js, Dd;
function Kv() {
  if (Dd) return js;
  Dd = 1;
  const e = ut(), t = De, i = Pt().mkdirsSync, r = Xm().utimesMillisSync, u = /* @__PURE__ */ Fr();
  function s(S, A, b) {
    typeof b == "function" && (b = { filter: b }), b = b || {}, b.clobber = "clobber" in b ? !!b.clobber : !0, b.overwrite = "overwrite" in b ? !!b.overwrite : b.clobber, b.preserveTimestamps && process.arch === "ia32" && process.emitWarning(
      `Using the preserveTimestamps option in 32-bit node is not recommended;

	see https://github.com/jprichardson/node-fs-extra/issues/269`,
      "Warning",
      "fs-extra-WARN0002"
    );
    const { srcStat: x, destStat: M } = u.checkPathsSync(S, A, "copy", b);
    return u.checkParentPathsSync(S, x, A, "copy"), o(M, S, A, b);
  }
  function o(S, A, b, x) {
    if (x.filter && !x.filter(A, b)) return;
    const M = t.dirname(b);
    return e.existsSync(M) || i(M), a(S, A, b, x);
  }
  function d(S, A, b, x) {
    if (!(x.filter && !x.filter(A, b)))
      return a(S, A, b, x);
  }
  function a(S, A, b, x) {
    const j = (x.dereference ? e.statSync : e.lstatSync)(A);
    if (j.isDirectory()) return v(j, S, A, b, x);
    if (j.isFile() || j.isCharacterDevice() || j.isBlockDevice()) return l(j, S, A, b, x);
    if (j.isSymbolicLink()) return R(S, A, b, x);
    throw j.isSocket() ? new Error(`Cannot copy a socket file: ${A}`) : j.isFIFO() ? new Error(`Cannot copy a FIFO pipe: ${A}`) : new Error(`Unknown file: ${A}`);
  }
  function l(S, A, b, x, M) {
    return A ? n(S, b, x, M) : f(S, b, x, M);
  }
  function n(S, A, b, x) {
    if (x.overwrite)
      return e.unlinkSync(b), f(S, A, b, x);
    if (x.errorOnExist)
      throw new Error(`'${b}' already exists`);
  }
  function f(S, A, b, x) {
    return e.copyFileSync(A, b), x.preserveTimestamps && c(S.mode, A, b), E(b, S.mode);
  }
  function c(S, A, b) {
    return h(S) && y(b, S), p(A, b);
  }
  function h(S) {
    return (S & 128) === 0;
  }
  function y(S, A) {
    return E(S, A | 128);
  }
  function E(S, A) {
    return e.chmodSync(S, A);
  }
  function p(S, A) {
    const b = e.statSync(S);
    return r(A, b.atime, b.mtime);
  }
  function v(S, A, b, x, M) {
    return A ? w(b, x, M) : m(S.mode, b, x, M);
  }
  function m(S, A, b, x) {
    return e.mkdirSync(b), w(A, b, x), E(b, S);
  }
  function w(S, A, b) {
    e.readdirSync(S).forEach((x) => T(x, S, A, b));
  }
  function T(S, A, b, x) {
    const M = t.join(A, S), j = t.join(b, S), { destStat: X } = u.checkPathsSync(M, j, "copy", x);
    return d(X, M, j, x);
  }
  function R(S, A, b, x) {
    let M = e.readlinkSync(A);
    if (x.dereference && (M = t.resolve(process.cwd(), M)), S) {
      let j;
      try {
        j = e.readlinkSync(b);
      } catch (X) {
        if (X.code === "EINVAL" || X.code === "UNKNOWN") return e.symlinkSync(M, b);
        throw X;
      }
      if (x.dereference && (j = t.resolve(process.cwd(), j)), u.isSrcSubdir(M, j))
        throw new Error(`Cannot copy '${M}' to a subdirectory of itself, '${j}'.`);
      if (e.statSync(b).isDirectory() && u.isSrcSubdir(j, M))
        throw new Error(`Cannot overwrite '${j}' with '${M}'.`);
      return _(M, b);
    } else
      return e.symlinkSync(M, b);
  }
  function _(S, A) {
    return e.unlinkSync(A), e.symlinkSync(S, A);
  }
  return js = s, js;
}
var Gs, Ld;
function Zu() {
  if (Ld) return Gs;
  Ld = 1;
  const e = dt().fromCallback;
  return Gs = {
    copy: e(/* @__PURE__ */ Wv()),
    copySync: /* @__PURE__ */ Kv()
  }, Gs;
}
var Hs, kd;
function Jv() {
  if (kd) return Hs;
  kd = 1;
  const e = ut(), t = De, i = Uu, r = process.platform === "win32";
  function u(y) {
    [
      "unlink",
      "chmod",
      "stat",
      "lstat",
      "rmdir",
      "readdir"
    ].forEach((p) => {
      y[p] = y[p] || e[p], p = p + "Sync", y[p] = y[p] || e[p];
    }), y.maxBusyTries = y.maxBusyTries || 3;
  }
  function s(y, E, p) {
    let v = 0;
    typeof E == "function" && (p = E, E = {}), i(y, "rimraf: missing path"), i.strictEqual(typeof y, "string", "rimraf: path should be a string"), i.strictEqual(typeof p, "function", "rimraf: callback function required"), i(E, "rimraf: invalid options argument provided"), i.strictEqual(typeof E, "object", "rimraf: options should be object"), u(E), o(y, E, function m(w) {
      if (w) {
        if ((w.code === "EBUSY" || w.code === "ENOTEMPTY" || w.code === "EPERM") && v < E.maxBusyTries) {
          v++;
          const T = v * 100;
          return setTimeout(() => o(y, E, m), T);
        }
        w.code === "ENOENT" && (w = null);
      }
      p(w);
    });
  }
  function o(y, E, p) {
    i(y), i(E), i(typeof p == "function"), E.lstat(y, (v, m) => {
      if (v && v.code === "ENOENT")
        return p(null);
      if (v && v.code === "EPERM" && r)
        return d(y, E, v, p);
      if (m && m.isDirectory())
        return l(y, E, v, p);
      E.unlink(y, (w) => {
        if (w) {
          if (w.code === "ENOENT")
            return p(null);
          if (w.code === "EPERM")
            return r ? d(y, E, w, p) : l(y, E, w, p);
          if (w.code === "EISDIR")
            return l(y, E, w, p);
        }
        return p(w);
      });
    });
  }
  function d(y, E, p, v) {
    i(y), i(E), i(typeof v == "function"), E.chmod(y, 438, (m) => {
      m ? v(m.code === "ENOENT" ? null : p) : E.stat(y, (w, T) => {
        w ? v(w.code === "ENOENT" ? null : p) : T.isDirectory() ? l(y, E, p, v) : E.unlink(y, v);
      });
    });
  }
  function a(y, E, p) {
    let v;
    i(y), i(E);
    try {
      E.chmodSync(y, 438);
    } catch (m) {
      if (m.code === "ENOENT")
        return;
      throw p;
    }
    try {
      v = E.statSync(y);
    } catch (m) {
      if (m.code === "ENOENT")
        return;
      throw p;
    }
    v.isDirectory() ? c(y, E, p) : E.unlinkSync(y);
  }
  function l(y, E, p, v) {
    i(y), i(E), i(typeof v == "function"), E.rmdir(y, (m) => {
      m && (m.code === "ENOTEMPTY" || m.code === "EEXIST" || m.code === "EPERM") ? n(y, E, v) : m && m.code === "ENOTDIR" ? v(p) : v(m);
    });
  }
  function n(y, E, p) {
    i(y), i(E), i(typeof p == "function"), E.readdir(y, (v, m) => {
      if (v) return p(v);
      let w = m.length, T;
      if (w === 0) return E.rmdir(y, p);
      m.forEach((R) => {
        s(t.join(y, R), E, (_) => {
          if (!T) {
            if (_) return p(T = _);
            --w === 0 && E.rmdir(y, p);
          }
        });
      });
    });
  }
  function f(y, E) {
    let p;
    E = E || {}, u(E), i(y, "rimraf: missing path"), i.strictEqual(typeof y, "string", "rimraf: path should be a string"), i(E, "rimraf: missing options"), i.strictEqual(typeof E, "object", "rimraf: options should be object");
    try {
      p = E.lstatSync(y);
    } catch (v) {
      if (v.code === "ENOENT")
        return;
      v.code === "EPERM" && r && a(y, E, v);
    }
    try {
      p && p.isDirectory() ? c(y, E, null) : E.unlinkSync(y);
    } catch (v) {
      if (v.code === "ENOENT")
        return;
      if (v.code === "EPERM")
        return r ? a(y, E, v) : c(y, E, v);
      if (v.code !== "EISDIR")
        throw v;
      c(y, E, v);
    }
  }
  function c(y, E, p) {
    i(y), i(E);
    try {
      E.rmdirSync(y);
    } catch (v) {
      if (v.code === "ENOTDIR")
        throw p;
      if (v.code === "ENOTEMPTY" || v.code === "EEXIST" || v.code === "EPERM")
        h(y, E);
      else if (v.code !== "ENOENT")
        throw v;
    }
  }
  function h(y, E) {
    if (i(y), i(E), E.readdirSync(y).forEach((p) => f(t.join(y, p), E)), r) {
      const p = Date.now();
      do
        try {
          return E.rmdirSync(y, E);
        } catch {
        }
      while (Date.now() - p < 500);
    } else
      return E.rmdirSync(y, E);
  }
  return Hs = s, s.sync = f, Hs;
}
var Bs, Fd;
function da() {
  if (Fd) return Bs;
  Fd = 1;
  const e = ut(), t = dt().fromCallback, i = /* @__PURE__ */ Jv();
  function r(s, o) {
    if (e.rm) return e.rm(s, { recursive: !0, force: !0 }, o);
    i(s, o);
  }
  function u(s) {
    if (e.rmSync) return e.rmSync(s, { recursive: !0, force: !0 });
    i.sync(s);
  }
  return Bs = {
    remove: t(r),
    removeSync: u
  }, Bs;
}
var Vs, Ud;
function Qv() {
  if (Ud) return Vs;
  Ud = 1;
  const e = dt().fromPromise, t = /* @__PURE__ */ kr(), i = De, r = /* @__PURE__ */ Pt(), u = /* @__PURE__ */ da(), s = e(async function(a) {
    let l;
    try {
      l = await t.readdir(a);
    } catch {
      return r.mkdirs(a);
    }
    return Promise.all(l.map((n) => u.remove(i.join(a, n))));
  });
  function o(d) {
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
  return Vs = {
    emptyDirSync: o,
    emptydirSync: o,
    emptyDir: s,
    emptydir: s
  }, Vs;
}
var zs, qd;
function Zv() {
  if (qd) return zs;
  qd = 1;
  const e = dt().fromCallback, t = De, i = ut(), r = /* @__PURE__ */ Pt();
  function u(o, d) {
    function a() {
      i.writeFile(o, "", (l) => {
        if (l) return d(l);
        d();
      });
    }
    i.stat(o, (l, n) => {
      if (!l && n.isFile()) return d();
      const f = t.dirname(o);
      i.stat(f, (c, h) => {
        if (c)
          return c.code === "ENOENT" ? r.mkdirs(f, (y) => {
            if (y) return d(y);
            a();
          }) : d(c);
        h.isDirectory() ? a() : i.readdir(f, (y) => {
          if (y) return d(y);
        });
      });
    });
  }
  function s(o) {
    let d;
    try {
      d = i.statSync(o);
    } catch {
    }
    if (d && d.isFile()) return;
    const a = t.dirname(o);
    try {
      i.statSync(a).isDirectory() || i.readdirSync(a);
    } catch (l) {
      if (l && l.code === "ENOENT") r.mkdirsSync(a);
      else throw l;
    }
    i.writeFileSync(o, "");
  }
  return zs = {
    createFile: e(u),
    createFileSync: s
  }, zs;
}
var Xs, xd;
function e_() {
  if (xd) return Xs;
  xd = 1;
  const e = dt().fromCallback, t = De, i = ut(), r = /* @__PURE__ */ Pt(), u = mr().pathExists, { areIdentical: s } = /* @__PURE__ */ Fr();
  function o(a, l, n) {
    function f(c, h) {
      i.link(c, h, (y) => {
        if (y) return n(y);
        n(null);
      });
    }
    i.lstat(l, (c, h) => {
      i.lstat(a, (y, E) => {
        if (y)
          return y.message = y.message.replace("lstat", "ensureLink"), n(y);
        if (h && s(E, h)) return n(null);
        const p = t.dirname(l);
        u(p, (v, m) => {
          if (v) return n(v);
          if (m) return f(a, l);
          r.mkdirs(p, (w) => {
            if (w) return n(w);
            f(a, l);
          });
        });
      });
    });
  }
  function d(a, l) {
    let n;
    try {
      n = i.lstatSync(l);
    } catch {
    }
    try {
      const h = i.lstatSync(a);
      if (n && s(h, n)) return;
    } catch (h) {
      throw h.message = h.message.replace("lstat", "ensureLink"), h;
    }
    const f = t.dirname(l);
    return i.existsSync(f) || r.mkdirsSync(f), i.linkSync(a, l);
  }
  return Xs = {
    createLink: e(o),
    createLinkSync: d
  }, Xs;
}
var Ys, Md;
function t_() {
  if (Md) return Ys;
  Md = 1;
  const e = De, t = ut(), i = mr().pathExists;
  function r(s, o, d) {
    if (e.isAbsolute(s))
      return t.lstat(s, (a) => a ? (a.message = a.message.replace("lstat", "ensureSymlink"), d(a)) : d(null, {
        toCwd: s,
        toDst: s
      }));
    {
      const a = e.dirname(o), l = e.join(a, s);
      return i(l, (n, f) => n ? d(n) : f ? d(null, {
        toCwd: l,
        toDst: s
      }) : t.lstat(s, (c) => c ? (c.message = c.message.replace("lstat", "ensureSymlink"), d(c)) : d(null, {
        toCwd: s,
        toDst: e.relative(a, s)
      })));
    }
  }
  function u(s, o) {
    let d;
    if (e.isAbsolute(s)) {
      if (d = t.existsSync(s), !d) throw new Error("absolute srcpath does not exist");
      return {
        toCwd: s,
        toDst: s
      };
    } else {
      const a = e.dirname(o), l = e.join(a, s);
      if (d = t.existsSync(l), d)
        return {
          toCwd: l,
          toDst: s
        };
      if (d = t.existsSync(s), !d) throw new Error("relative srcpath does not exist");
      return {
        toCwd: s,
        toDst: e.relative(a, s)
      };
    }
  }
  return Ys = {
    symlinkPaths: r,
    symlinkPathsSync: u
  }, Ys;
}
var Ws, jd;
function r_() {
  if (jd) return Ws;
  jd = 1;
  const e = ut();
  function t(r, u, s) {
    if (s = typeof u == "function" ? u : s, u = typeof u == "function" ? !1 : u, u) return s(null, u);
    e.lstat(r, (o, d) => {
      if (o) return s(null, "file");
      u = d && d.isDirectory() ? "dir" : "file", s(null, u);
    });
  }
  function i(r, u) {
    let s;
    if (u) return u;
    try {
      s = e.lstatSync(r);
    } catch {
      return "file";
    }
    return s && s.isDirectory() ? "dir" : "file";
  }
  return Ws = {
    symlinkType: t,
    symlinkTypeSync: i
  }, Ws;
}
var Ks, Gd;
function n_() {
  if (Gd) return Ks;
  Gd = 1;
  const e = dt().fromCallback, t = De, i = /* @__PURE__ */ kr(), r = /* @__PURE__ */ Pt(), u = r.mkdirs, s = r.mkdirsSync, o = /* @__PURE__ */ t_(), d = o.symlinkPaths, a = o.symlinkPathsSync, l = /* @__PURE__ */ r_(), n = l.symlinkType, f = l.symlinkTypeSync, c = mr().pathExists, { areIdentical: h } = /* @__PURE__ */ Fr();
  function y(v, m, w, T) {
    T = typeof w == "function" ? w : T, w = typeof w == "function" ? !1 : w, i.lstat(m, (R, _) => {
      !R && _.isSymbolicLink() ? Promise.all([
        i.stat(v),
        i.stat(m)
      ]).then(([S, A]) => {
        if (h(S, A)) return T(null);
        E(v, m, w, T);
      }) : E(v, m, w, T);
    });
  }
  function E(v, m, w, T) {
    d(v, m, (R, _) => {
      if (R) return T(R);
      v = _.toDst, n(_.toCwd, w, (S, A) => {
        if (S) return T(S);
        const b = t.dirname(m);
        c(b, (x, M) => {
          if (x) return T(x);
          if (M) return i.symlink(v, m, A, T);
          u(b, (j) => {
            if (j) return T(j);
            i.symlink(v, m, A, T);
          });
        });
      });
    });
  }
  function p(v, m, w) {
    let T;
    try {
      T = i.lstatSync(m);
    } catch {
    }
    if (T && T.isSymbolicLink()) {
      const A = i.statSync(v), b = i.statSync(m);
      if (h(A, b)) return;
    }
    const R = a(v, m);
    v = R.toDst, w = f(R.toCwd, w);
    const _ = t.dirname(m);
    return i.existsSync(_) || s(_), i.symlinkSync(v, m, w);
  }
  return Ks = {
    createSymlink: e(y),
    createSymlinkSync: p
  }, Ks;
}
var Js, Hd;
function i_() {
  if (Hd) return Js;
  Hd = 1;
  const { createFile: e, createFileSync: t } = /* @__PURE__ */ Zv(), { createLink: i, createLinkSync: r } = /* @__PURE__ */ e_(), { createSymlink: u, createSymlinkSync: s } = /* @__PURE__ */ n_();
  return Js = {
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
    createSymlinkSync: s,
    ensureSymlink: u,
    ensureSymlinkSync: s
  }, Js;
}
var Qs, Bd;
function el() {
  if (Bd) return Qs;
  Bd = 1;
  function e(i, { EOL: r = `
`, finalEOL: u = !0, replacer: s = null, spaces: o } = {}) {
    const d = u ? r : "";
    return JSON.stringify(i, s, o).replace(/\n/g, r) + d;
  }
  function t(i) {
    return Buffer.isBuffer(i) && (i = i.toString("utf8")), i.replace(/^\uFEFF/, "");
  }
  return Qs = { stringify: e, stripBom: t }, Qs;
}
var Zs, Vd;
function a_() {
  if (Vd) return Zs;
  Vd = 1;
  let e;
  try {
    e = ut();
  } catch {
    e = Rt;
  }
  const t = dt(), { stringify: i, stripBom: r } = el();
  async function u(n, f = {}) {
    typeof f == "string" && (f = { encoding: f });
    const c = f.fs || e, h = "throws" in f ? f.throws : !0;
    let y = await t.fromCallback(c.readFile)(n, f);
    y = r(y);
    let E;
    try {
      E = JSON.parse(y, f ? f.reviver : null);
    } catch (p) {
      if (h)
        throw p.message = `${n}: ${p.message}`, p;
      return null;
    }
    return E;
  }
  const s = t.fromPromise(u);
  function o(n, f = {}) {
    typeof f == "string" && (f = { encoding: f });
    const c = f.fs || e, h = "throws" in f ? f.throws : !0;
    try {
      let y = c.readFileSync(n, f);
      return y = r(y), JSON.parse(y, f.reviver);
    } catch (y) {
      if (h)
        throw y.message = `${n}: ${y.message}`, y;
      return null;
    }
  }
  async function d(n, f, c = {}) {
    const h = c.fs || e, y = i(f, c);
    await t.fromCallback(h.writeFile)(n, y, c);
  }
  const a = t.fromPromise(d);
  function l(n, f, c = {}) {
    const h = c.fs || e, y = i(f, c);
    return h.writeFileSync(n, y, c);
  }
  return Zs = {
    readFile: s,
    readFileSync: o,
    writeFile: a,
    writeFileSync: l
  }, Zs;
}
var eo, zd;
function s_() {
  if (zd) return eo;
  zd = 1;
  const e = a_();
  return eo = {
    // jsonfile exports
    readJson: e.readFile,
    readJsonSync: e.readFileSync,
    writeJson: e.writeFile,
    writeJsonSync: e.writeFileSync
  }, eo;
}
var to, Xd;
function tl() {
  if (Xd) return to;
  Xd = 1;
  const e = dt().fromCallback, t = ut(), i = De, r = /* @__PURE__ */ Pt(), u = mr().pathExists;
  function s(d, a, l, n) {
    typeof l == "function" && (n = l, l = "utf8");
    const f = i.dirname(d);
    u(f, (c, h) => {
      if (c) return n(c);
      if (h) return t.writeFile(d, a, l, n);
      r.mkdirs(f, (y) => {
        if (y) return n(y);
        t.writeFile(d, a, l, n);
      });
    });
  }
  function o(d, ...a) {
    const l = i.dirname(d);
    if (t.existsSync(l))
      return t.writeFileSync(d, ...a);
    r.mkdirsSync(l), t.writeFileSync(d, ...a);
  }
  return to = {
    outputFile: e(s),
    outputFileSync: o
  }, to;
}
var ro, Yd;
function o_() {
  if (Yd) return ro;
  Yd = 1;
  const { stringify: e } = el(), { outputFile: t } = /* @__PURE__ */ tl();
  async function i(r, u, s = {}) {
    const o = e(u, s);
    await t(r, o, s);
  }
  return ro = i, ro;
}
var no, Wd;
function u_() {
  if (Wd) return no;
  Wd = 1;
  const { stringify: e } = el(), { outputFileSync: t } = /* @__PURE__ */ tl();
  function i(r, u, s) {
    const o = e(u, s);
    t(r, o, s);
  }
  return no = i, no;
}
var io, Kd;
function l_() {
  if (Kd) return io;
  Kd = 1;
  const e = dt().fromPromise, t = /* @__PURE__ */ s_();
  return t.outputJson = e(/* @__PURE__ */ o_()), t.outputJsonSync = /* @__PURE__ */ u_(), t.outputJSON = t.outputJson, t.outputJSONSync = t.outputJsonSync, t.writeJSON = t.writeJson, t.writeJSONSync = t.writeJsonSync, t.readJSON = t.readJson, t.readJSONSync = t.readJsonSync, io = t, io;
}
var ao, Jd;
function c_() {
  if (Jd) return ao;
  Jd = 1;
  const e = ut(), t = De, i = Zu().copy, r = da().remove, u = Pt().mkdirp, s = mr().pathExists, o = /* @__PURE__ */ Fr();
  function d(c, h, y, E) {
    typeof y == "function" && (E = y, y = {}), y = y || {};
    const p = y.overwrite || y.clobber || !1;
    o.checkPaths(c, h, "move", y, (v, m) => {
      if (v) return E(v);
      const { srcStat: w, isChangingCase: T = !1 } = m;
      o.checkParentPaths(c, w, h, "move", (R) => {
        if (R) return E(R);
        if (a(h)) return l(c, h, p, T, E);
        u(t.dirname(h), (_) => _ ? E(_) : l(c, h, p, T, E));
      });
    });
  }
  function a(c) {
    const h = t.dirname(c);
    return t.parse(h).root === h;
  }
  function l(c, h, y, E, p) {
    if (E) return n(c, h, y, p);
    if (y)
      return r(h, (v) => v ? p(v) : n(c, h, y, p));
    s(h, (v, m) => v ? p(v) : m ? p(new Error("dest already exists.")) : n(c, h, y, p));
  }
  function n(c, h, y, E) {
    e.rename(c, h, (p) => p ? p.code !== "EXDEV" ? E(p) : f(c, h, y, E) : E());
  }
  function f(c, h, y, E) {
    i(c, h, {
      overwrite: y,
      errorOnExist: !0
    }, (v) => v ? E(v) : r(c, E));
  }
  return ao = d, ao;
}
var so, Qd;
function f_() {
  if (Qd) return so;
  Qd = 1;
  const e = ut(), t = De, i = Zu().copySync, r = da().removeSync, u = Pt().mkdirpSync, s = /* @__PURE__ */ Fr();
  function o(f, c, h) {
    h = h || {};
    const y = h.overwrite || h.clobber || !1, { srcStat: E, isChangingCase: p = !1 } = s.checkPathsSync(f, c, "move", h);
    return s.checkParentPathsSync(f, E, c, "move"), d(c) || u(t.dirname(c)), a(f, c, y, p);
  }
  function d(f) {
    const c = t.dirname(f);
    return t.parse(c).root === c;
  }
  function a(f, c, h, y) {
    if (y) return l(f, c, h);
    if (h)
      return r(c), l(f, c, h);
    if (e.existsSync(c)) throw new Error("dest already exists.");
    return l(f, c, h);
  }
  function l(f, c, h) {
    try {
      e.renameSync(f, c);
    } catch (y) {
      if (y.code !== "EXDEV") throw y;
      return n(f, c, h);
    }
  }
  function n(f, c, h) {
    return i(f, c, {
      overwrite: h,
      errorOnExist: !0
    }), r(f);
  }
  return so = o, so;
}
var oo, Zd;
function d_() {
  if (Zd) return oo;
  Zd = 1;
  const e = dt().fromCallback;
  return oo = {
    move: e(/* @__PURE__ */ c_()),
    moveSync: /* @__PURE__ */ f_()
  }, oo;
}
var uo, eh;
function Qt() {
  return eh || (eh = 1, uo = {
    // Export promiseified graceful-fs:
    .../* @__PURE__ */ kr(),
    // Export extra methods:
    .../* @__PURE__ */ Zu(),
    .../* @__PURE__ */ Qv(),
    .../* @__PURE__ */ i_(),
    .../* @__PURE__ */ l_(),
    .../* @__PURE__ */ Pt(),
    .../* @__PURE__ */ d_(),
    .../* @__PURE__ */ tl(),
    .../* @__PURE__ */ mr(),
    .../* @__PURE__ */ da()
  }), uo;
}
var Xr = {}, cr = {}, lo = {}, fr = {}, th;
function rl() {
  if (th) return fr;
  th = 1, Object.defineProperty(fr, "__esModule", { value: !0 }), fr.CancellationError = fr.CancellationToken = void 0;
  const e = qu;
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
      const s = () => {
        if (o != null)
          try {
            this.removeListener("cancel", o), o = null;
          } catch {
          }
      };
      let o = null;
      return new Promise((d, a) => {
        let l = null;
        if (o = () => {
          try {
            l != null && (l(), l = null);
          } finally {
            a(new i());
          }
        }, this.cancelled) {
          o();
          return;
        }
        this.onCancel(o), u(d, a, (n) => {
          l = n;
        });
      }).then((d) => (s(), d)).catch((d) => {
        throw s(), d;
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
  fr.CancellationToken = t;
  class i extends Error {
    constructor() {
      super("cancelled");
    }
  }
  return fr.CancellationError = i, fr;
}
var Mi = {}, rh;
function ha() {
  if (rh) return Mi;
  rh = 1, Object.defineProperty(Mi, "__esModule", { value: !0 }), Mi.newError = e;
  function e(t, i) {
    const r = new Error(t);
    return r.code = i, r;
  }
  return Mi;
}
var et = {}, ji = { exports: {} }, Gi = { exports: {} }, co, nh;
function h_() {
  if (nh) return co;
  nh = 1;
  var e = 1e3, t = e * 60, i = t * 60, r = i * 24, u = r * 7, s = r * 365.25;
  co = function(n, f) {
    f = f || {};
    var c = typeof n;
    if (c === "string" && n.length > 0)
      return o(n);
    if (c === "number" && isFinite(n))
      return f.long ? a(n) : d(n);
    throw new Error(
      "val is not a non-empty string or a valid number. val=" + JSON.stringify(n)
    );
  };
  function o(n) {
    if (n = String(n), !(n.length > 100)) {
      var f = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        n
      );
      if (f) {
        var c = parseFloat(f[1]), h = (f[2] || "ms").toLowerCase();
        switch (h) {
          case "years":
          case "year":
          case "yrs":
          case "yr":
          case "y":
            return c * s;
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
  function d(n) {
    var f = Math.abs(n);
    return f >= r ? Math.round(n / r) + "d" : f >= i ? Math.round(n / i) + "h" : f >= t ? Math.round(n / t) + "m" : f >= e ? Math.round(n / e) + "s" : n + "ms";
  }
  function a(n) {
    var f = Math.abs(n);
    return f >= r ? l(n, f, r, "day") : f >= i ? l(n, f, i, "hour") : f >= t ? l(n, f, t, "minute") : f >= e ? l(n, f, e, "second") : n + " ms";
  }
  function l(n, f, c, h) {
    var y = f >= c * 1.5;
    return Math.round(n / c) + " " + h + (y ? "s" : "");
  }
  return co;
}
var fo, ih;
function Ym() {
  if (ih) return fo;
  ih = 1;
  function e(t) {
    r.debug = r, r.default = r, r.coerce = l, r.disable = d, r.enable = s, r.enabled = a, r.humanize = h_(), r.destroy = n, Object.keys(t).forEach((f) => {
      r[f] = t[f];
    }), r.names = [], r.skips = [], r.formatters = {};
    function i(f) {
      let c = 0;
      for (let h = 0; h < f.length; h++)
        c = (c << 5) - c + f.charCodeAt(h), c |= 0;
      return r.colors[Math.abs(c) % r.colors.length];
    }
    r.selectColor = i;
    function r(f) {
      let c, h = null, y, E;
      function p(...v) {
        if (!p.enabled)
          return;
        const m = p, w = Number(/* @__PURE__ */ new Date()), T = w - (c || w);
        m.diff = T, m.prev = c, m.curr = w, c = w, v[0] = r.coerce(v[0]), typeof v[0] != "string" && v.unshift("%O");
        let R = 0;
        v[0] = v[0].replace(/%([a-zA-Z%])/g, (S, A) => {
          if (S === "%%")
            return "%";
          R++;
          const b = r.formatters[A];
          if (typeof b == "function") {
            const x = v[R];
            S = b.call(m, x), v.splice(R, 1), R--;
          }
          return S;
        }), r.formatArgs.call(m, v), (m.log || r.log).apply(m, v);
      }
      return p.namespace = f, p.useColors = r.useColors(), p.color = r.selectColor(f), p.extend = u, p.destroy = r.destroy, Object.defineProperty(p, "enabled", {
        enumerable: !0,
        configurable: !1,
        get: () => h !== null ? h : (y !== r.namespaces && (y = r.namespaces, E = r.enabled(f)), E),
        set: (v) => {
          h = v;
        }
      }), typeof r.init == "function" && r.init(p), p;
    }
    function u(f, c) {
      const h = r(this.namespace + (typeof c > "u" ? ":" : c) + f);
      return h.log = this.log, h;
    }
    function s(f) {
      r.save(f), r.namespaces = f, r.names = [], r.skips = [];
      const c = (typeof f == "string" ? f : "").trim().replace(/\s+/g, ",").split(",").filter(Boolean);
      for (const h of c)
        h[0] === "-" ? r.skips.push(h.slice(1)) : r.names.push(h);
    }
    function o(f, c) {
      let h = 0, y = 0, E = -1, p = 0;
      for (; h < f.length; )
        if (y < c.length && (c[y] === f[h] || c[y] === "*"))
          c[y] === "*" ? (E = y, p = h, y++) : (h++, y++);
        else if (E !== -1)
          y = E + 1, p++, h = p;
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
        if (o(f, c))
          return !1;
      for (const c of r.names)
        if (o(f, c))
          return !0;
      return !1;
    }
    function l(f) {
      return f instanceof Error ? f.stack || f.message : f;
    }
    function n() {
      console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
    }
    return r.enable(r.load()), r;
  }
  return fo = e, fo;
}
var ah;
function p_() {
  return ah || (ah = 1, (function(e, t) {
    t.formatArgs = r, t.save = u, t.load = s, t.useColors = i, t.storage = o(), t.destroy = /* @__PURE__ */ (() => {
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
      let n = 0, f = 0;
      a[0].replace(/%[a-zA-Z%]/g, (c) => {
        c !== "%%" && (n++, c === "%c" && (f = n));
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
    function s() {
      let a;
      try {
        a = t.storage.getItem("debug") || t.storage.getItem("DEBUG");
      } catch {
      }
      return !a && typeof process < "u" && "env" in process && (a = process.env.DEBUG), a;
    }
    function o() {
      try {
        return localStorage;
      } catch {
      }
    }
    e.exports = Ym()(t);
    const { formatters: d } = e.exports;
    d.j = function(a) {
      try {
        return JSON.stringify(a);
      } catch (l) {
        return "[UnexpectedJSONParseError]: " + l.message;
      }
    };
  })(Gi, Gi.exports)), Gi.exports;
}
var Hi = { exports: {} }, ho, sh;
function m_() {
  return sh || (sh = 1, ho = (e, t = process.argv) => {
    const i = e.startsWith("-") ? "" : e.length === 1 ? "-" : "--", r = t.indexOf(i + e), u = t.indexOf("--");
    return r !== -1 && (u === -1 || r < u);
  }), ho;
}
var po, oh;
function g_() {
  if (oh) return po;
  oh = 1;
  const e = Sn, t = Sm, i = m_(), { env: r } = process;
  let u;
  i("no-color") || i("no-colors") || i("color=false") || i("color=never") ? u = 0 : (i("color") || i("colors") || i("color=true") || i("color=always")) && (u = 1), "FORCE_COLOR" in r && (r.FORCE_COLOR === "true" ? u = 1 : r.FORCE_COLOR === "false" ? u = 0 : u = r.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(r.FORCE_COLOR, 10), 3));
  function s(a) {
    return a === 0 ? !1 : {
      level: a,
      hasBasic: !0,
      has256: a >= 2,
      has16m: a >= 3
    };
  }
  function o(a, l) {
    if (u === 0)
      return 0;
    if (i("color=16m") || i("color=full") || i("color=truecolor"))
      return 3;
    if (i("color=256"))
      return 2;
    if (a && !l && u === void 0)
      return 0;
    const n = u || 0;
    if (r.TERM === "dumb")
      return n;
    if (process.platform === "win32") {
      const f = e.release().split(".");
      return Number(f[0]) >= 10 && Number(f[2]) >= 10586 ? Number(f[2]) >= 14931 ? 3 : 2 : 1;
    }
    if ("CI" in r)
      return ["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI", "GITHUB_ACTIONS", "BUILDKITE"].some((f) => f in r) || r.CI_NAME === "codeship" ? 1 : n;
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
    return /-256(color)?$/i.test(r.TERM) ? 2 : /^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(r.TERM) || "COLORTERM" in r ? 1 : n;
  }
  function d(a) {
    const l = o(a, a && a.isTTY);
    return s(l);
  }
  return po = {
    supportsColor: d,
    stdout: s(o(!0, t.isatty(1))),
    stderr: s(o(!0, t.isatty(2)))
  }, po;
}
var uh;
function y_() {
  return uh || (uh = 1, (function(e, t) {
    const i = Sm, r = wn;
    t.init = n, t.log = d, t.formatArgs = s, t.save = a, t.load = l, t.useColors = u, t.destroy = r.deprecate(
      () => {
      },
      "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."
    ), t.colors = [6, 2, 3, 4, 5, 1];
    try {
      const c = g_();
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
    t.inspectOpts = Object.keys(process.env).filter((c) => /^debug_/i.test(c)).reduce((c, h) => {
      const y = h.substring(6).toLowerCase().replace(/_([a-z])/g, (p, v) => v.toUpperCase());
      let E = process.env[h];
      return /^(yes|on|true|enabled)$/i.test(E) ? E = !0 : /^(no|off|false|disabled)$/i.test(E) ? E = !1 : E === "null" ? E = null : E = Number(E), c[y] = E, c;
    }, {});
    function u() {
      return "colors" in t.inspectOpts ? !!t.inspectOpts.colors : i.isatty(process.stderr.fd);
    }
    function s(c) {
      const { namespace: h, useColors: y } = this;
      if (y) {
        const E = this.color, p = "\x1B[3" + (E < 8 ? E : "8;5;" + E), v = `  ${p};1m${h} \x1B[0m`;
        c[0] = v + c[0].split(`
`).join(`
` + v), c.push(p + "m+" + e.exports.humanize(this.diff) + "\x1B[0m");
      } else
        c[0] = o() + h + " " + c[0];
    }
    function o() {
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
    function n(c) {
      c.inspectOpts = {};
      const h = Object.keys(t.inspectOpts);
      for (let y = 0; y < h.length; y++)
        c.inspectOpts[h[y]] = t.inspectOpts[h[y]];
    }
    e.exports = Ym()(t);
    const { formatters: f } = e.exports;
    f.o = function(c) {
      return this.inspectOpts.colors = this.useColors, r.inspect(c, this.inspectOpts).split(`
`).map((h) => h.trim()).join(" ");
    }, f.O = function(c) {
      return this.inspectOpts.colors = this.useColors, r.inspect(c, this.inspectOpts);
    };
  })(Hi, Hi.exports)), Hi.exports;
}
var lh;
function E_() {
  return lh || (lh = 1, typeof process > "u" || process.type === "renderer" || process.browser === !0 || process.__nwjs ? ji.exports = p_() : ji.exports = y_()), ji.exports;
}
var Yr = {}, ch;
function Wm() {
  if (ch) return Yr;
  ch = 1, Object.defineProperty(Yr, "__esModule", { value: !0 }), Yr.ProgressCallbackTransform = void 0;
  const e = Tn;
  let t = class extends e.Transform {
    constructor(r, u, s) {
      super(), this.total = r, this.cancellationToken = u, this.onProgress = s, this.start = Date.now(), this.transferred = 0, this.delta = 0, this.nextUpdate = this.start + 1e3;
    }
    _transform(r, u, s) {
      if (this.cancellationToken.cancelled) {
        s(new Error("cancelled"), null);
        return;
      }
      this.transferred += r.length, this.delta += r.length;
      const o = Date.now();
      o >= this.nextUpdate && this.transferred !== this.total && (this.nextUpdate = o + 1e3, this.onProgress({
        total: this.total,
        delta: this.delta,
        transferred: this.transferred,
        percent: this.transferred / this.total * 100,
        bytesPerSecond: Math.round(this.transferred / ((o - this.start) / 1e3))
      }), this.delta = 0), s(null, r);
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
  return Yr.ProgressCallbackTransform = t, Yr;
}
var fh;
function v_() {
  if (fh) return et;
  fh = 1, Object.defineProperty(et, "__esModule", { value: !0 }), et.DigestTransform = et.HttpExecutor = et.HttpError = void 0, et.createHttpError = l, et.parseJson = c, et.configureRequestOptionsFromUrl = y, et.configureRequestUrl = E, et.safeGetHeader = m, et.configureRequestOptions = T, et.safeStringifyJson = R;
  const e = Pr, t = E_(), i = Rt, r = Tn, u = Cr, s = rl(), o = ha(), d = Wm(), a = (0, t.default)("electron-builder");
  function l(_, S = null) {
    return new f(_.statusCode || -1, `${_.statusCode} ${_.statusMessage}` + (S == null ? "" : `
` + JSON.stringify(S, null, "  ")) + `
Headers: ` + R(_.headers), S);
  }
  const n = /* @__PURE__ */ new Map([
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
    constructor(S, A = `HTTP error: ${n.get(S) || S}`, b = null) {
      super(A), this.statusCode = S, this.description = b, this.name = "HttpError", this.code = `HTTP_ERROR_${S}`;
    }
    isServerError() {
      return this.statusCode >= 500 && this.statusCode <= 599;
    }
  }
  et.HttpError = f;
  function c(_) {
    return _.then((S) => S == null || S.length === 0 ? null : JSON.parse(S));
  }
  class h {
    constructor() {
      this.maxRedirects = 10;
    }
    request(S, A = new s.CancellationToken(), b) {
      T(S);
      const x = b == null ? void 0 : JSON.stringify(b), M = x ? Buffer.from(x) : void 0;
      if (M != null) {
        a(x);
        const { headers: j, ...X } = S;
        S = {
          method: "post",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": M.length,
            ...j
          },
          ...X
        };
      }
      return this.doApiRequest(S, A, (j) => j.end(M));
    }
    doApiRequest(S, A, b, x = 0) {
      return a.enabled && a(`Request: ${R(S)}`), A.createPromise((M, j, X) => {
        const P = this.createRequest(S, (D) => {
          try {
            this.handleResponse(D, S, A, M, j, x, b);
          } catch (W) {
            j(W);
          }
        });
        this.addErrorAndTimeoutHandlers(P, j, S.timeout), this.addRedirectHandlers(P, S, j, x, (D) => {
          this.doApiRequest(D, A, b, x).then(M).catch(j);
        }), b(P, j), X(() => P.abort());
      });
    }
    // noinspection JSUnusedLocalSymbols
    // eslint-disable-next-line
    addRedirectHandlers(S, A, b, x, M) {
    }
    addErrorAndTimeoutHandlers(S, A, b = 60 * 1e3) {
      this.addTimeOutHandler(S, A, b), S.on("error", A), S.on("aborted", () => {
        A(new Error("Request has been aborted by the server"));
      });
    }
    handleResponse(S, A, b, x, M, j, X) {
      var P;
      if (a.enabled && a(`Response: ${S.statusCode} ${S.statusMessage}, request options: ${R(A)}`), S.statusCode === 404) {
        M(l(S, `method: ${A.method || "GET"} url: ${A.protocol || "https:"}//${A.hostname}${A.port ? `:${A.port}` : ""}${A.path}

Please double check that your authentication token is correct. Due to security reasons, actual status maybe not reported, but 404.
`));
        return;
      } else if (S.statusCode === 204) {
        x();
        return;
      }
      const D = (P = S.statusCode) !== null && P !== void 0 ? P : 0, W = D >= 300 && D < 400, L = m(S, "location");
      if (W && L != null) {
        if (j > this.maxRedirects) {
          M(this.createMaxRedirectError());
          return;
        }
        this.doApiRequest(h.prepareRedirectUrlOptions(L, A), b, X, j).then(x).catch(M);
        return;
      }
      S.setEncoding("utf8");
      let F = "";
      S.on("error", M), S.on("data", (G) => F += G), S.on("end", () => {
        try {
          if (S.statusCode != null && S.statusCode >= 400) {
            const G = m(S, "content-type"), k = G != null && (Array.isArray(G) ? G.find((q) => q.includes("json")) != null : G.includes("json"));
            M(l(S, `method: ${A.method || "GET"} url: ${A.protocol || "https:"}//${A.hostname}${A.port ? `:${A.port}` : ""}${A.path}

          Data:
          ${k ? JSON.stringify(JSON.parse(F)) : F}
          `));
          } else
            x(F.length === 0 ? null : F);
        } catch (G) {
          M(G);
        }
      });
    }
    async downloadToBuffer(S, A) {
      return await A.cancellationToken.createPromise((b, x, M) => {
        const j = [], X = {
          headers: A.headers || void 0,
          // because PrivateGitHubProvider requires HttpExecutor.prepareRedirectUrlOptions logic, so, we need to redirect manually
          redirect: "manual"
        };
        E(S, X), T(X), this.doDownload(X, {
          destination: null,
          options: A,
          onCancel: M,
          callback: (P) => {
            P == null ? b(Buffer.concat(j)) : x(P);
          },
          responseHandler: (P, D) => {
            let W = 0;
            P.on("data", (L) => {
              if (W += L.length, W > 524288e3) {
                D(new Error("Maximum allowed size is 500 MB"));
                return;
              }
              j.push(L);
            }), P.on("end", () => {
              D(null);
            });
          }
        }, 0);
      });
    }
    doDownload(S, A, b) {
      const x = this.createRequest(S, (M) => {
        if (M.statusCode >= 400) {
          A.callback(new Error(`Cannot download "${S.protocol || "https:"}//${S.hostname}${S.path}", status ${M.statusCode}: ${M.statusMessage}`));
          return;
        }
        M.on("error", A.callback);
        const j = m(M, "location");
        if (j != null) {
          b < this.maxRedirects ? this.doDownload(h.prepareRedirectUrlOptions(j, S), A, b++) : A.callback(this.createMaxRedirectError());
          return;
        }
        A.responseHandler == null ? w(A, M) : A.responseHandler(M, A.callback);
      });
      this.addErrorAndTimeoutHandlers(x, A.callback, S.timeout), this.addRedirectHandlers(x, S, A.callback, b, (M) => {
        this.doDownload(M, A, b++);
      }), x.end();
    }
    createMaxRedirectError() {
      return new Error(`Too many redirects (> ${this.maxRedirects})`);
    }
    addTimeOutHandler(S, A, b) {
      S.on("socket", (x) => {
        x.setTimeout(b, () => {
          S.abort(), A(new Error("Request timed out"));
        });
      });
    }
    static prepareRedirectUrlOptions(S, A) {
      const b = y(S, { ...A }), x = b.headers;
      if (x?.authorization) {
        const M = new u.URL(S);
        (M.hostname.endsWith(".amazonaws.com") || M.searchParams.has("X-Amz-Credential")) && delete x.authorization;
      }
      return b;
    }
    static retryOnServerError(S, A = 3) {
      for (let b = 0; ; b++)
        try {
          return S();
        } catch (x) {
          if (b < A && (x instanceof f && x.isServerError() || x.code === "EPIPE"))
            continue;
          throw x;
        }
    }
  }
  et.HttpExecutor = h;
  function y(_, S) {
    const A = T(S);
    return E(new u.URL(_), A), A;
  }
  function E(_, S) {
    S.protocol = _.protocol, S.hostname = _.hostname, _.port ? S.port = _.port : S.port && delete S.port, S.path = _.pathname + _.search;
  }
  class p extends r.Transform {
    // noinspection JSUnusedGlobalSymbols
    get actual() {
      return this._actual;
    }
    constructor(S, A = "sha512", b = "base64") {
      super(), this.expected = S, this.algorithm = A, this.encoding = b, this._actual = null, this.isValidateOnEnd = !0, this.digester = (0, e.createHash)(A);
    }
    // noinspection JSUnusedGlobalSymbols
    _transform(S, A, b) {
      this.digester.update(S), b(null, S);
    }
    // noinspection JSUnusedGlobalSymbols
    _flush(S) {
      if (this._actual = this.digester.digest(this.encoding), this.isValidateOnEnd)
        try {
          this.validate();
        } catch (A) {
          S(A);
          return;
        }
      S(null);
    }
    validate() {
      if (this._actual == null)
        throw (0, o.newError)("Not finished yet", "ERR_STREAM_NOT_FINISHED");
      if (this._actual !== this.expected)
        throw (0, o.newError)(`${this.algorithm} checksum mismatch, expected ${this.expected}, got ${this._actual}`, "ERR_CHECKSUM_MISMATCH");
      return null;
    }
  }
  et.DigestTransform = p;
  function v(_, S, A) {
    return _ != null && S != null && _ !== S ? (A(new Error(`checksum mismatch: expected ${S} but got ${_} (X-Checksum-Sha2 header)`)), !1) : !0;
  }
  function m(_, S) {
    const A = _.headers[S];
    return A == null ? null : Array.isArray(A) ? A.length === 0 ? null : A[A.length - 1] : A;
  }
  function w(_, S) {
    if (!v(m(S, "X-Checksum-Sha2"), _.options.sha2, _.callback))
      return;
    const A = [];
    if (_.options.onProgress != null) {
      const j = m(S, "content-length");
      j != null && A.push(new d.ProgressCallbackTransform(parseInt(j, 10), _.options.cancellationToken, _.options.onProgress));
    }
    const b = _.options.sha512;
    b != null ? A.push(new p(b, "sha512", b.length === 128 && !b.includes("+") && !b.includes("Z") && !b.includes("=") ? "hex" : "base64")) : _.options.sha2 != null && A.push(new p(_.options.sha2, "sha256", "hex"));
    const x = (0, i.createWriteStream)(_.destination);
    A.push(x);
    let M = S;
    for (const j of A)
      j.on("error", (X) => {
        x.close(), _.options.cancellationToken.cancelled || _.callback(X);
      }), M = M.pipe(j);
    x.on("finish", () => {
      x.close(_.callback);
    });
  }
  function T(_, S, A) {
    A != null && (_.method = A), _.headers = { ..._.headers };
    const b = _.headers;
    return S != null && (b.authorization = S.startsWith("Basic") || S.startsWith("Bearer") ? S : `token ${S}`), b["User-Agent"] == null && (b["User-Agent"] = "electron-builder"), (A == null || A === "GET" || b["Cache-Control"] == null) && (b["Cache-Control"] = "no-cache"), _.protocol == null && process.versions.electron != null && (_.protocol = "https:"), _;
  }
  function R(_, S) {
    return JSON.stringify(_, (A, b) => A.endsWith("Authorization") || A.endsWith("authorization") || A.endsWith("Password") || A.endsWith("PASSWORD") || A.endsWith("Token") || A.includes("password") || A.includes("token") || S != null && S.has(A) ? "<stripped sensitive data>" : b, 2);
  }
  return et;
}
var Wr = {}, dh;
function __() {
  if (dh) return Wr;
  dh = 1, Object.defineProperty(Wr, "__esModule", { value: !0 }), Wr.MemoLazy = void 0;
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
  Wr.MemoLazy = e;
  function t(i, r) {
    if (typeof i == "object" && i !== null && (typeof r == "object" && r !== null)) {
      const o = Object.keys(i), d = Object.keys(r);
      return o.length === d.length && o.every((a) => t(i[a], r[a]));
    }
    return i === r;
  }
  return Wr;
}
var Kr = {}, hh;
function w_() {
  if (hh) return Kr;
  hh = 1, Object.defineProperty(Kr, "__esModule", { value: !0 }), Kr.githubUrl = e, Kr.getS3LikeProviderBaseUrl = t;
  function e(s, o = "github.com") {
    return `${s.protocol || "https"}://${s.host || o}`;
  }
  function t(s) {
    const o = s.provider;
    if (o === "s3")
      return i(s);
    if (o === "spaces")
      return u(s);
    throw new Error(`Not supported provider: ${o}`);
  }
  function i(s) {
    let o;
    if (s.accelerate == !0)
      o = `https://${s.bucket}.s3-accelerate.amazonaws.com`;
    else if (s.endpoint != null)
      o = `${s.endpoint}/${s.bucket}`;
    else if (s.bucket.includes(".")) {
      if (s.region == null)
        throw new Error(`Bucket name "${s.bucket}" includes a dot, but S3 region is missing`);
      s.region === "us-east-1" ? o = `https://s3.amazonaws.com/${s.bucket}` : o = `https://s3-${s.region}.amazonaws.com/${s.bucket}`;
    } else s.region === "cn-north-1" ? o = `https://${s.bucket}.s3.${s.region}.amazonaws.com.cn` : o = `https://${s.bucket}.s3.amazonaws.com`;
    return r(o, s.path);
  }
  function r(s, o) {
    return o != null && o.length > 0 && (o.startsWith("/") || (s += "/"), s += o), s;
  }
  function u(s) {
    if (s.name == null)
      throw new Error("name is missing");
    if (s.region == null)
      throw new Error("region is missing");
    return r(`https://${s.name}.${s.region}.digitaloceanspaces.com`, s.path);
  }
  return Kr;
}
var Bi = {}, ph;
function S_() {
  if (ph) return Bi;
  ph = 1, Object.defineProperty(Bi, "__esModule", { value: !0 }), Bi.retry = t;
  const e = rl();
  async function t(i, r, u, s = 0, o = 0, d) {
    var a;
    const l = new e.CancellationToken();
    try {
      return await i();
    } catch (n) {
      if ((!((a = d?.(n)) !== null && a !== void 0) || a) && r > 0 && !l.cancelled)
        return await new Promise((f) => setTimeout(f, u + s * o)), await t(i, r - 1, u, s, o + 1, d);
      throw n;
    }
  }
  return Bi;
}
var Vi = {}, mh;
function T_() {
  if (mh) return Vi;
  mh = 1, Object.defineProperty(Vi, "__esModule", { value: !0 }), Vi.parseDn = e;
  function e(t) {
    let i = !1, r = null, u = "", s = 0;
    t = t.trim();
    const o = /* @__PURE__ */ new Map();
    for (let d = 0; d <= t.length; d++) {
      if (d === t.length) {
        r !== null && o.set(r, u);
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
          r !== null && o.set(r, u), r = null, u = "";
          continue;
        }
      }
      if (a === " " && !i) {
        if (u.length === 0)
          continue;
        if (d > s) {
          let l = d;
          for (; t[l] === " "; )
            l++;
          s = l;
        }
        if (s >= t.length || t[s] === "," || t[s] === ";" || r === null && t[s] === "=" || r !== null && t[s] === "+") {
          d = s - 1;
          continue;
        }
      }
      u += a;
    }
    return o;
  }
  return Vi;
}
var dr = {}, gh;
function R_() {
  if (gh) return dr;
  gh = 1, Object.defineProperty(dr, "__esModule", { value: !0 }), dr.nil = dr.UUID = void 0;
  const e = Pr, t = ha(), i = "options.name must be either a string or a Buffer", r = (0, e.randomBytes)(16);
  r[0] = r[0] | 1;
  const u = {}, s = [];
  for (let f = 0; f < 256; f++) {
    const c = (f + 256).toString(16).substr(1);
    u[c] = f, s[f] = c;
  }
  class o {
    constructor(c) {
      this.ascii = null, this.binary = null;
      const h = o.check(c);
      if (!h)
        throw new Error("not a UUID");
      this.version = h.version, h.format === "ascii" ? this.ascii = c : this.binary = c;
    }
    static v5(c, h) {
      return l(c, "sha1", 80, h);
    }
    toString() {
      return this.ascii == null && (this.ascii = n(this.binary)), this.ascii;
    }
    inspect() {
      return `UUID v${this.version} ${this.toString()}`;
    }
    static check(c, h = 0) {
      if (typeof c == "string")
        return c = c.toLowerCase(), /^[a-f0-9]{8}(-[a-f0-9]{4}){3}-([a-f0-9]{12})$/.test(c) ? c === "00000000-0000-0000-0000-000000000000" ? { version: void 0, variant: "nil", format: "ascii" } : {
          version: (u[c[14] + c[15]] & 240) >> 4,
          variant: d((u[c[19] + c[20]] & 224) >> 5),
          format: "ascii"
        } : !1;
      if (Buffer.isBuffer(c)) {
        if (c.length < h + 16)
          return !1;
        let y = 0;
        for (; y < 16 && c[h + y] === 0; y++)
          ;
        return y === 16 ? { version: void 0, variant: "nil", format: "binary" } : {
          version: (c[h + 6] & 240) >> 4,
          variant: d((c[h + 8] & 224) >> 5),
          format: "binary"
        };
      }
      throw (0, t.newError)("Unknown type of uuid", "ERR_UNKNOWN_UUID_TYPE");
    }
    // read stringified uuid into a Buffer
    static parse(c) {
      const h = Buffer.allocUnsafe(16);
      let y = 0;
      for (let E = 0; E < 16; E++)
        h[E] = u[c[y++] + c[y++]], (E === 3 || E === 5 || E === 7 || E === 9) && (y += 1);
      return h;
    }
  }
  dr.UUID = o, o.OID = o.parse("6ba7b812-9dad-11d1-80b4-00c04fd430c8");
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
  function l(f, c, h, y, E = a.ASCII) {
    const p = (0, e.createHash)(c);
    if (typeof f != "string" && !Buffer.isBuffer(f))
      throw (0, t.newError)(i, "ERR_INVALID_UUID_NAME");
    p.update(y), p.update(f);
    const m = p.digest();
    let w;
    switch (E) {
      case a.BINARY:
        m[6] = m[6] & 15 | h, m[8] = m[8] & 63 | 128, w = m;
        break;
      case a.OBJECT:
        m[6] = m[6] & 15 | h, m[8] = m[8] & 63 | 128, w = new o(m);
        break;
      default:
        w = s[m[0]] + s[m[1]] + s[m[2]] + s[m[3]] + "-" + s[m[4]] + s[m[5]] + "-" + s[m[6] & 15 | h] + s[m[7]] + "-" + s[m[8] & 63 | 128] + s[m[9]] + "-" + s[m[10]] + s[m[11]] + s[m[12]] + s[m[13]] + s[m[14]] + s[m[15]];
        break;
    }
    return w;
  }
  function n(f) {
    return s[f[0]] + s[f[1]] + s[f[2]] + s[f[3]] + "-" + s[f[4]] + s[f[5]] + "-" + s[f[6]] + s[f[7]] + "-" + s[f[8]] + s[f[9]] + "-" + s[f[10]] + s[f[11]] + s[f[12]] + s[f[13]] + s[f[14]] + s[f[15]];
  }
  return dr.nil = new o("00000000-0000-0000-0000-000000000000"), dr;
}
var Sr = {}, mo = {}, yh;
function b_() {
  return yh || (yh = 1, (function(e) {
    (function(t) {
      t.parser = function(N, O) {
        return new r(N, O);
      }, t.SAXParser = r, t.SAXStream = n, t.createStream = l, t.MAX_BUFFER_LENGTH = 64 * 1024;
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
      function r(N, O) {
        if (!(this instanceof r))
          return new r(N, O);
        var Q = this;
        s(Q), Q.q = Q.c = "", Q.bufferCheckPosition = t.MAX_BUFFER_LENGTH, Q.opt = O || {}, Q.opt.lowercase = Q.opt.lowercase || Q.opt.lowercasetags, Q.looseCase = Q.opt.lowercase ? "toLowerCase" : "toUpperCase", Q.tags = [], Q.closed = Q.closedRoot = Q.sawRoot = !1, Q.tag = Q.error = null, Q.strict = !!N, Q.noscript = !!(N || Q.opt.noscript), Q.state = b.BEGIN, Q.strictEntities = Q.opt.strictEntities, Q.ENTITIES = Q.strictEntities ? Object.create(t.XML_ENTITIES) : Object.create(t.ENTITIES), Q.attribList = [], Q.opt.xmlns && (Q.ns = Object.create(E)), Q.opt.unquotedAttributeValues === void 0 && (Q.opt.unquotedAttributeValues = !N), Q.trackPosition = Q.opt.position !== !1, Q.trackPosition && (Q.position = Q.line = Q.column = 0), M(Q, "onready");
      }
      Object.create || (Object.create = function(N) {
        function O() {
        }
        O.prototype = N;
        var Q = new O();
        return Q;
      }), Object.keys || (Object.keys = function(N) {
        var O = [];
        for (var Q in N) N.hasOwnProperty(Q) && O.push(Q);
        return O;
      });
      function u(N) {
        for (var O = Math.max(t.MAX_BUFFER_LENGTH, 10), Q = 0, V = 0, B = i.length; V < B; V++) {
          var Y = N[i[V]].length;
          if (Y > O)
            switch (i[V]) {
              case "textNode":
                X(N);
                break;
              case "cdata":
                j(N, "oncdata", N.cdata), N.cdata = "";
                break;
              case "script":
                j(N, "onscript", N.script), N.script = "";
                break;
              default:
                D(N, "Max buffer length exceeded: " + i[V]);
            }
          Q = Math.max(Q, Y);
        }
        var Z = t.MAX_BUFFER_LENGTH - Q;
        N.bufferCheckPosition = Z + N.position;
      }
      function s(N) {
        for (var O = 0, Q = i.length; O < Q; O++)
          N[i[O]] = "";
      }
      function o(N) {
        X(N), N.cdata !== "" && (j(N, "oncdata", N.cdata), N.cdata = ""), N.script !== "" && (j(N, "onscript", N.script), N.script = "");
      }
      r.prototype = {
        end: function() {
          W(this);
        },
        write: K,
        resume: function() {
          return this.error = null, this;
        },
        close: function() {
          return this.write(null);
        },
        flush: function() {
          o(this);
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
      function l(N, O) {
        return new n(N, O);
      }
      function n(N, O) {
        if (!(this instanceof n))
          return new n(N, O);
        d.apply(this), this._parser = new r(N, O), this.writable = !0, this.readable = !0;
        var Q = this;
        this._parser.onend = function() {
          Q.emit("end");
        }, this._parser.onerror = function(V) {
          Q.emit("error", V), Q._parser.error = null;
        }, this._decoder = null, a.forEach(function(V) {
          Object.defineProperty(Q, "on" + V, {
            get: function() {
              return Q._parser["on" + V];
            },
            set: function(B) {
              if (!B)
                return Q.removeAllListeners(V), Q._parser["on" + V] = B, B;
              Q.on(V, B);
            },
            enumerable: !0,
            configurable: !1
          });
        });
      }
      n.prototype = Object.create(d.prototype, {
        constructor: {
          value: n
        }
      }), n.prototype.write = function(N) {
        if (typeof Buffer == "function" && typeof Buffer.isBuffer == "function" && Buffer.isBuffer(N)) {
          if (!this._decoder) {
            var O = Ry.StringDecoder;
            this._decoder = new O("utf8");
          }
          N = this._decoder.write(N);
        }
        return this._parser.write(N.toString()), this.emit("data", N), !0;
      }, n.prototype.end = function(N) {
        return N && N.length && this.write(N), this._parser.end(), !0;
      }, n.prototype.on = function(N, O) {
        var Q = this;
        return !Q._parser["on" + N] && a.indexOf(N) !== -1 && (Q._parser["on" + N] = function() {
          var V = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);
          V.splice(0, 0, N), Q.emit.apply(Q, V);
        }), d.prototype.on.call(Q, N, O);
      };
      var f = "[CDATA[", c = "DOCTYPE", h = "http://www.w3.org/XML/1998/namespace", y = "http://www.w3.org/2000/xmlns/", E = { xml: h, xmlns: y }, p = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, v = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/, m = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, w = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
      function T(N) {
        return N === " " || N === `
` || N === "\r" || N === "	";
      }
      function R(N) {
        return N === '"' || N === "'";
      }
      function _(N) {
        return N === ">" || T(N);
      }
      function S(N, O) {
        return N.test(O);
      }
      function A(N, O) {
        return !S(N, O);
      }
      var b = 0;
      t.STATE = {
        BEGIN: b++,
        // leading byte order mark or whitespace
        BEGIN_WHITESPACE: b++,
        // leading whitespace
        TEXT: b++,
        // general stuff
        TEXT_ENTITY: b++,
        // &amp and such.
        OPEN_WAKA: b++,
        // <
        SGML_DECL: b++,
        // <!BLARG
        SGML_DECL_QUOTED: b++,
        // <!BLARG foo "bar
        DOCTYPE: b++,
        // <!DOCTYPE
        DOCTYPE_QUOTED: b++,
        // <!DOCTYPE "//blah
        DOCTYPE_DTD: b++,
        // <!DOCTYPE "//blah" [ ...
        DOCTYPE_DTD_QUOTED: b++,
        // <!DOCTYPE "//blah" [ "foo
        COMMENT_STARTING: b++,
        // <!-
        COMMENT: b++,
        // <!--
        COMMENT_ENDING: b++,
        // <!-- blah -
        COMMENT_ENDED: b++,
        // <!-- blah --
        CDATA: b++,
        // <![CDATA[ something
        CDATA_ENDING: b++,
        // ]
        CDATA_ENDING_2: b++,
        // ]]
        PROC_INST: b++,
        // <?hi
        PROC_INST_BODY: b++,
        // <?hi there
        PROC_INST_ENDING: b++,
        // <?hi "there" ?
        OPEN_TAG: b++,
        // <strong
        OPEN_TAG_SLASH: b++,
        // <strong /
        ATTRIB: b++,
        // <a
        ATTRIB_NAME: b++,
        // <a foo
        ATTRIB_NAME_SAW_WHITE: b++,
        // <a foo _
        ATTRIB_VALUE: b++,
        // <a foo=
        ATTRIB_VALUE_QUOTED: b++,
        // <a foo="bar
        ATTRIB_VALUE_CLOSED: b++,
        // <a foo="bar"
        ATTRIB_VALUE_UNQUOTED: b++,
        // <a foo=bar
        ATTRIB_VALUE_ENTITY_Q: b++,
        // <foo bar="&quot;"
        ATTRIB_VALUE_ENTITY_U: b++,
        // <foo bar=&quot
        CLOSE_TAG: b++,
        // </a
        CLOSE_TAG_SAW_WHITE: b++,
        // </a   >
        SCRIPT: b++,
        // <script> ...
        SCRIPT_ENDING: b++
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
        var O = t.ENTITIES[N], Q = typeof O == "number" ? String.fromCharCode(O) : O;
        t.ENTITIES[N] = Q;
      });
      for (var x in t.STATE)
        t.STATE[t.STATE[x]] = x;
      b = t.STATE;
      function M(N, O, Q) {
        N[O] && N[O](Q);
      }
      function j(N, O, Q) {
        N.textNode && X(N), M(N, O, Q);
      }
      function X(N) {
        N.textNode = P(N.opt, N.textNode), N.textNode && M(N, "ontext", N.textNode), N.textNode = "";
      }
      function P(N, O) {
        return N.trim && (O = O.trim()), N.normalize && (O = O.replace(/\s+/g, " ")), O;
      }
      function D(N, O) {
        return X(N), N.trackPosition && (O += `
Line: ` + N.line + `
Column: ` + N.column + `
Char: ` + N.c), O = new Error(O), N.error = O, M(N, "onerror", O), N;
      }
      function W(N) {
        return N.sawRoot && !N.closedRoot && L(N, "Unclosed root tag"), N.state !== b.BEGIN && N.state !== b.BEGIN_WHITESPACE && N.state !== b.TEXT && D(N, "Unexpected end"), X(N), N.c = "", N.closed = !0, M(N, "onend"), r.call(N, N.strict, N.opt), N;
      }
      function L(N, O) {
        if (typeof N != "object" || !(N instanceof r))
          throw new Error("bad call to strictFail");
        N.strict && D(N, O);
      }
      function F(N) {
        N.strict || (N.tagName = N.tagName[N.looseCase]());
        var O = N.tags[N.tags.length - 1] || N, Q = N.tag = { name: N.tagName, attributes: {} };
        N.opt.xmlns && (Q.ns = O.ns), N.attribList.length = 0, j(N, "onopentagstart", Q);
      }
      function G(N, O) {
        var Q = N.indexOf(":"), V = Q < 0 ? ["", N] : N.split(":"), B = V[0], Y = V[1];
        return O && N === "xmlns" && (B = "xmlns", Y = ""), { prefix: B, local: Y };
      }
      function k(N) {
        if (N.strict || (N.attribName = N.attribName[N.looseCase]()), N.attribList.indexOf(N.attribName) !== -1 || N.tag.attributes.hasOwnProperty(N.attribName)) {
          N.attribName = N.attribValue = "";
          return;
        }
        if (N.opt.xmlns) {
          var O = G(N.attribName, !0), Q = O.prefix, V = O.local;
          if (Q === "xmlns")
            if (V === "xml" && N.attribValue !== h)
              L(
                N,
                "xml: prefix must be bound to " + h + `
Actual: ` + N.attribValue
              );
            else if (V === "xmlns" && N.attribValue !== y)
              L(
                N,
                "xmlns: prefix must be bound to " + y + `
Actual: ` + N.attribValue
              );
            else {
              var B = N.tag, Y = N.tags[N.tags.length - 1] || N;
              B.ns === Y.ns && (B.ns = Object.create(Y.ns)), B.ns[V] = N.attribValue;
            }
          N.attribList.push([N.attribName, N.attribValue]);
        } else
          N.tag.attributes[N.attribName] = N.attribValue, j(N, "onattribute", {
            name: N.attribName,
            value: N.attribValue
          });
        N.attribName = N.attribValue = "";
      }
      function q(N, O) {
        if (N.opt.xmlns) {
          var Q = N.tag, V = G(N.tagName);
          Q.prefix = V.prefix, Q.local = V.local, Q.uri = Q.ns[V.prefix] || "", Q.prefix && !Q.uri && (L(
            N,
            "Unbound namespace prefix: " + JSON.stringify(N.tagName)
          ), Q.uri = V.prefix);
          var B = N.tags[N.tags.length - 1] || N;
          Q.ns && B.ns !== Q.ns && Object.keys(Q.ns).forEach(function(g) {
            j(N, "onopennamespace", {
              prefix: g,
              uri: Q.ns[g]
            });
          });
          for (var Y = 0, Z = N.attribList.length; Y < Z; Y++) {
            var re = N.attribList[Y], le = re[0], Se = re[1], Te = G(le, !0), Fe = Te.prefix, He = Te.local, Ge = Fe === "" ? "" : Q.ns[Fe] || "", ke = {
              name: le,
              value: Se,
              prefix: Fe,
              local: He,
              uri: Ge
            };
            Fe && Fe !== "xmlns" && !Ge && (L(
              N,
              "Unbound namespace prefix: " + JSON.stringify(Fe)
            ), ke.uri = Fe), N.tag.attributes[le] = ke, j(N, "onattribute", ke);
          }
          N.attribList.length = 0;
        }
        N.tag.isSelfClosing = !!O, N.sawRoot = !0, N.tags.push(N.tag), j(N, "onopentag", N.tag), O || (!N.noscript && N.tagName.toLowerCase() === "script" ? N.state = b.SCRIPT : N.state = b.TEXT, N.tag = null, N.tagName = ""), N.attribName = N.attribValue = "", N.attribList.length = 0;
      }
      function z(N) {
        if (!N.tagName) {
          L(N, "Weird empty close tag."), N.textNode += "</>", N.state = b.TEXT;
          return;
        }
        if (N.script) {
          if (N.tagName !== "script") {
            N.script += "</" + N.tagName + ">", N.tagName = "", N.state = b.SCRIPT;
            return;
          }
          j(N, "onscript", N.script), N.script = "";
        }
        var O = N.tags.length, Q = N.tagName;
        N.strict || (Q = Q[N.looseCase]());
        for (var V = Q; O--; ) {
          var B = N.tags[O];
          if (B.name !== V)
            L(N, "Unexpected close tag");
          else
            break;
        }
        if (O < 0) {
          L(N, "Unmatched closing tag: " + N.tagName), N.textNode += "</" + N.tagName + ">", N.state = b.TEXT;
          return;
        }
        N.tagName = Q;
        for (var Y = N.tags.length; Y-- > O; ) {
          var Z = N.tag = N.tags.pop();
          N.tagName = N.tag.name, j(N, "onclosetag", N.tagName);
          var re = {};
          for (var le in Z.ns)
            re[le] = Z.ns[le];
          var Se = N.tags[N.tags.length - 1] || N;
          N.opt.xmlns && Z.ns !== Se.ns && Object.keys(Z.ns).forEach(function(Te) {
            var Fe = Z.ns[Te];
            j(N, "onclosenamespace", { prefix: Te, uri: Fe });
          });
        }
        O === 0 && (N.closedRoot = !0), N.tagName = N.attribValue = N.attribName = "", N.attribList.length = 0, N.state = b.TEXT;
      }
      function H(N) {
        var O = N.entity, Q = O.toLowerCase(), V, B = "";
        return N.ENTITIES[O] ? N.ENTITIES[O] : N.ENTITIES[Q] ? N.ENTITIES[Q] : (O = Q, O.charAt(0) === "#" && (O.charAt(1) === "x" ? (O = O.slice(2), V = parseInt(O, 16), B = V.toString(16)) : (O = O.slice(1), V = parseInt(O, 10), B = V.toString(10))), O = O.replace(/^0+/, ""), isNaN(V) || B.toLowerCase() !== O || V < 0 || V > 1114111 ? (L(N, "Invalid character entity"), "&" + N.entity + ";") : String.fromCodePoint(V));
      }
      function $(N, O) {
        O === "<" ? (N.state = b.OPEN_WAKA, N.startTagPosition = N.position) : T(O) || (L(N, "Non-whitespace before first tag."), N.textNode = O, N.state = b.TEXT);
      }
      function I(N, O) {
        var Q = "";
        return O < N.length && (Q = N.charAt(O)), Q;
      }
      function K(N) {
        var O = this;
        if (this.error)
          throw this.error;
        if (O.closed)
          return D(
            O,
            "Cannot write after close. Assign an onready handler."
          );
        if (N === null)
          return W(O);
        typeof N == "object" && (N = N.toString());
        for (var Q = 0, V = ""; V = I(N, Q++), O.c = V, !!V; )
          switch (O.trackPosition && (O.position++, V === `
` ? (O.line++, O.column = 0) : O.column++), O.state) {
            case b.BEGIN:
              if (O.state = b.BEGIN_WHITESPACE, V === "\uFEFF")
                continue;
              $(O, V);
              continue;
            case b.BEGIN_WHITESPACE:
              $(O, V);
              continue;
            case b.TEXT:
              if (O.sawRoot && !O.closedRoot) {
                for (var Y = Q - 1; V && V !== "<" && V !== "&"; )
                  V = I(N, Q++), V && O.trackPosition && (O.position++, V === `
` ? (O.line++, O.column = 0) : O.column++);
                O.textNode += N.substring(Y, Q - 1);
              }
              V === "<" && !(O.sawRoot && O.closedRoot && !O.strict) ? (O.state = b.OPEN_WAKA, O.startTagPosition = O.position) : (!T(V) && (!O.sawRoot || O.closedRoot) && L(O, "Text data outside of root node."), V === "&" ? O.state = b.TEXT_ENTITY : O.textNode += V);
              continue;
            case b.SCRIPT:
              V === "<" ? O.state = b.SCRIPT_ENDING : O.script += V;
              continue;
            case b.SCRIPT_ENDING:
              V === "/" ? O.state = b.CLOSE_TAG : (O.script += "<" + V, O.state = b.SCRIPT);
              continue;
            case b.OPEN_WAKA:
              if (V === "!")
                O.state = b.SGML_DECL, O.sgmlDecl = "";
              else if (!T(V)) if (S(p, V))
                O.state = b.OPEN_TAG, O.tagName = V;
              else if (V === "/")
                O.state = b.CLOSE_TAG, O.tagName = "";
              else if (V === "?")
                O.state = b.PROC_INST, O.procInstName = O.procInstBody = "";
              else {
                if (L(O, "Unencoded <"), O.startTagPosition + 1 < O.position) {
                  var B = O.position - O.startTagPosition;
                  V = new Array(B).join(" ") + V;
                }
                O.textNode += "<" + V, O.state = b.TEXT;
              }
              continue;
            case b.SGML_DECL:
              if (O.sgmlDecl + V === "--") {
                O.state = b.COMMENT, O.comment = "", O.sgmlDecl = "";
                continue;
              }
              O.doctype && O.doctype !== !0 && O.sgmlDecl ? (O.state = b.DOCTYPE_DTD, O.doctype += "<!" + O.sgmlDecl + V, O.sgmlDecl = "") : (O.sgmlDecl + V).toUpperCase() === f ? (j(O, "onopencdata"), O.state = b.CDATA, O.sgmlDecl = "", O.cdata = "") : (O.sgmlDecl + V).toUpperCase() === c ? (O.state = b.DOCTYPE, (O.doctype || O.sawRoot) && L(
                O,
                "Inappropriately located doctype declaration"
              ), O.doctype = "", O.sgmlDecl = "") : V === ">" ? (j(O, "onsgmldeclaration", O.sgmlDecl), O.sgmlDecl = "", O.state = b.TEXT) : (R(V) && (O.state = b.SGML_DECL_QUOTED), O.sgmlDecl += V);
              continue;
            case b.SGML_DECL_QUOTED:
              V === O.q && (O.state = b.SGML_DECL, O.q = ""), O.sgmlDecl += V;
              continue;
            case b.DOCTYPE:
              V === ">" ? (O.state = b.TEXT, j(O, "ondoctype", O.doctype), O.doctype = !0) : (O.doctype += V, V === "[" ? O.state = b.DOCTYPE_DTD : R(V) && (O.state = b.DOCTYPE_QUOTED, O.q = V));
              continue;
            case b.DOCTYPE_QUOTED:
              O.doctype += V, V === O.q && (O.q = "", O.state = b.DOCTYPE);
              continue;
            case b.DOCTYPE_DTD:
              V === "]" ? (O.doctype += V, O.state = b.DOCTYPE) : V === "<" ? (O.state = b.OPEN_WAKA, O.startTagPosition = O.position) : R(V) ? (O.doctype += V, O.state = b.DOCTYPE_DTD_QUOTED, O.q = V) : O.doctype += V;
              continue;
            case b.DOCTYPE_DTD_QUOTED:
              O.doctype += V, V === O.q && (O.state = b.DOCTYPE_DTD, O.q = "");
              continue;
            case b.COMMENT:
              V === "-" ? O.state = b.COMMENT_ENDING : O.comment += V;
              continue;
            case b.COMMENT_ENDING:
              V === "-" ? (O.state = b.COMMENT_ENDED, O.comment = P(O.opt, O.comment), O.comment && j(O, "oncomment", O.comment), O.comment = "") : (O.comment += "-" + V, O.state = b.COMMENT);
              continue;
            case b.COMMENT_ENDED:
              V !== ">" ? (L(O, "Malformed comment"), O.comment += "--" + V, O.state = b.COMMENT) : O.doctype && O.doctype !== !0 ? O.state = b.DOCTYPE_DTD : O.state = b.TEXT;
              continue;
            case b.CDATA:
              for (var Y = Q - 1; V && V !== "]"; )
                V = I(N, Q++), V && O.trackPosition && (O.position++, V === `
` ? (O.line++, O.column = 0) : O.column++);
              O.cdata += N.substring(Y, Q - 1), V === "]" && (O.state = b.CDATA_ENDING);
              continue;
            case b.CDATA_ENDING:
              V === "]" ? O.state = b.CDATA_ENDING_2 : (O.cdata += "]" + V, O.state = b.CDATA);
              continue;
            case b.CDATA_ENDING_2:
              V === ">" ? (O.cdata && j(O, "oncdata", O.cdata), j(O, "onclosecdata"), O.cdata = "", O.state = b.TEXT) : V === "]" ? O.cdata += "]" : (O.cdata += "]]" + V, O.state = b.CDATA);
              continue;
            case b.PROC_INST:
              V === "?" ? O.state = b.PROC_INST_ENDING : T(V) ? O.state = b.PROC_INST_BODY : O.procInstName += V;
              continue;
            case b.PROC_INST_BODY:
              if (!O.procInstBody && T(V))
                continue;
              V === "?" ? O.state = b.PROC_INST_ENDING : O.procInstBody += V;
              continue;
            case b.PROC_INST_ENDING:
              V === ">" ? (j(O, "onprocessinginstruction", {
                name: O.procInstName,
                body: O.procInstBody
              }), O.procInstName = O.procInstBody = "", O.state = b.TEXT) : (O.procInstBody += "?" + V, O.state = b.PROC_INST_BODY);
              continue;
            case b.OPEN_TAG:
              S(v, V) ? O.tagName += V : (F(O), V === ">" ? q(O) : V === "/" ? O.state = b.OPEN_TAG_SLASH : (T(V) || L(O, "Invalid character in tag name"), O.state = b.ATTRIB));
              continue;
            case b.OPEN_TAG_SLASH:
              V === ">" ? (q(O, !0), z(O)) : (L(
                O,
                "Forward-slash in opening tag not followed by >"
              ), O.state = b.ATTRIB);
              continue;
            case b.ATTRIB:
              if (T(V))
                continue;
              V === ">" ? q(O) : V === "/" ? O.state = b.OPEN_TAG_SLASH : S(p, V) ? (O.attribName = V, O.attribValue = "", O.state = b.ATTRIB_NAME) : L(O, "Invalid attribute name");
              continue;
            case b.ATTRIB_NAME:
              V === "=" ? O.state = b.ATTRIB_VALUE : V === ">" ? (L(O, "Attribute without value"), O.attribValue = O.attribName, k(O), q(O)) : T(V) ? O.state = b.ATTRIB_NAME_SAW_WHITE : S(v, V) ? O.attribName += V : L(O, "Invalid attribute name");
              continue;
            case b.ATTRIB_NAME_SAW_WHITE:
              if (V === "=")
                O.state = b.ATTRIB_VALUE;
              else {
                if (T(V))
                  continue;
                L(O, "Attribute without value"), O.tag.attributes[O.attribName] = "", O.attribValue = "", j(O, "onattribute", {
                  name: O.attribName,
                  value: ""
                }), O.attribName = "", V === ">" ? q(O) : S(p, V) ? (O.attribName = V, O.state = b.ATTRIB_NAME) : (L(O, "Invalid attribute name"), O.state = b.ATTRIB);
              }
              continue;
            case b.ATTRIB_VALUE:
              if (T(V))
                continue;
              R(V) ? (O.q = V, O.state = b.ATTRIB_VALUE_QUOTED) : (O.opt.unquotedAttributeValues || D(O, "Unquoted attribute value"), O.state = b.ATTRIB_VALUE_UNQUOTED, O.attribValue = V);
              continue;
            case b.ATTRIB_VALUE_QUOTED:
              if (V !== O.q) {
                V === "&" ? O.state = b.ATTRIB_VALUE_ENTITY_Q : O.attribValue += V;
                continue;
              }
              k(O), O.q = "", O.state = b.ATTRIB_VALUE_CLOSED;
              continue;
            case b.ATTRIB_VALUE_CLOSED:
              T(V) ? O.state = b.ATTRIB : V === ">" ? q(O) : V === "/" ? O.state = b.OPEN_TAG_SLASH : S(p, V) ? (L(O, "No whitespace between attributes"), O.attribName = V, O.attribValue = "", O.state = b.ATTRIB_NAME) : L(O, "Invalid attribute name");
              continue;
            case b.ATTRIB_VALUE_UNQUOTED:
              if (!_(V)) {
                V === "&" ? O.state = b.ATTRIB_VALUE_ENTITY_U : O.attribValue += V;
                continue;
              }
              k(O), V === ">" ? q(O) : O.state = b.ATTRIB;
              continue;
            case b.CLOSE_TAG:
              if (O.tagName)
                V === ">" ? z(O) : S(v, V) ? O.tagName += V : O.script ? (O.script += "</" + O.tagName, O.tagName = "", O.state = b.SCRIPT) : (T(V) || L(O, "Invalid tagname in closing tag"), O.state = b.CLOSE_TAG_SAW_WHITE);
              else {
                if (T(V))
                  continue;
                A(p, V) ? O.script ? (O.script += "</" + V, O.state = b.SCRIPT) : L(O, "Invalid tagname in closing tag.") : O.tagName = V;
              }
              continue;
            case b.CLOSE_TAG_SAW_WHITE:
              if (T(V))
                continue;
              V === ">" ? z(O) : L(O, "Invalid characters in closing tag");
              continue;
            case b.TEXT_ENTITY:
            case b.ATTRIB_VALUE_ENTITY_Q:
            case b.ATTRIB_VALUE_ENTITY_U:
              var Z, re;
              switch (O.state) {
                case b.TEXT_ENTITY:
                  Z = b.TEXT, re = "textNode";
                  break;
                case b.ATTRIB_VALUE_ENTITY_Q:
                  Z = b.ATTRIB_VALUE_QUOTED, re = "attribValue";
                  break;
                case b.ATTRIB_VALUE_ENTITY_U:
                  Z = b.ATTRIB_VALUE_UNQUOTED, re = "attribValue";
                  break;
              }
              if (V === ";") {
                var le = H(O);
                O.opt.unparsedEntities && !Object.values(t.XML_ENTITIES).includes(le) ? (O.entity = "", O.state = Z, O.write(le)) : (O[re] += le, O.entity = "", O.state = Z);
              } else S(O.entity.length ? w : m, V) ? O.entity += V : (L(O, "Invalid character in entity name"), O[re] += "&" + O.entity + V, O.entity = "", O.state = Z);
              continue;
            default:
              throw new Error(O, "Unknown state: " + O.state);
          }
        return O.position >= O.bufferCheckPosition && u(O), O;
      }
      String.fromCodePoint || (function() {
        var N = String.fromCharCode, O = Math.floor, Q = function() {
          var V = 16384, B = [], Y, Z, re = -1, le = arguments.length;
          if (!le)
            return "";
          for (var Se = ""; ++re < le; ) {
            var Te = Number(arguments[re]);
            if (!isFinite(Te) || // `NaN`, `+Infinity`, or `-Infinity`
            Te < 0 || // not a valid Unicode code point
            Te > 1114111 || // not a valid Unicode code point
            O(Te) !== Te)
              throw RangeError("Invalid code point: " + Te);
            Te <= 65535 ? B.push(Te) : (Te -= 65536, Y = (Te >> 10) + 55296, Z = Te % 1024 + 56320, B.push(Y, Z)), (re + 1 === le || B.length > V) && (Se += N.apply(null, B), B.length = 0);
          }
          return Se;
        };
        Object.defineProperty ? Object.defineProperty(String, "fromCodePoint", {
          value: Q,
          configurable: !0,
          writable: !0
        }) : String.fromCodePoint = Q;
      })();
    })(e);
  })(mo)), mo;
}
var Eh;
function A_() {
  if (Eh) return Sr;
  Eh = 1, Object.defineProperty(Sr, "__esModule", { value: !0 }), Sr.XElement = void 0, Sr.parseXml = o;
  const e = b_(), t = ha();
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
    element(a, l = !1, n = null) {
      const f = this.elementOrNull(a, l);
      if (f === null)
        throw (0, t.newError)(n || `No element "${a}"`, "ERR_XML_MISSED_ELEMENT");
      return f;
    }
    elementOrNull(a, l = !1) {
      if (this.elements === null)
        return null;
      for (const n of this.elements)
        if (s(n, a, l))
          return n;
      return null;
    }
    getElements(a, l = !1) {
      return this.elements === null ? [] : this.elements.filter((n) => s(n, a, l));
    }
    elementValueOrEmpty(a, l = !1) {
      const n = this.elementOrNull(a, l);
      return n === null ? "" : n.value;
    }
  }
  Sr.XElement = i;
  const r = new RegExp(/^[A-Za-z_][:A-Za-z0-9_-]*$/i);
  function u(d) {
    return r.test(d);
  }
  function s(d, a, l) {
    const n = d.name;
    return n === a || l === !0 && n.length === a.length && n.toLowerCase() === a.toLowerCase();
  }
  function o(d) {
    let a = null;
    const l = e.parser(!0, {}), n = [];
    return l.onopentag = (f) => {
      const c = new i(f.name);
      if (c.attributes = f.attributes, a === null)
        a = c;
      else {
        const h = n[n.length - 1];
        h.elements == null && (h.elements = []), h.elements.push(c);
      }
      n.push(c);
    }, l.onclosetag = () => {
      n.pop();
    }, l.ontext = (f) => {
      n.length > 0 && (n[n.length - 1].value = f);
    }, l.oncdata = (f) => {
      const c = n[n.length - 1];
      c.value = f, c.isCData = !0;
    }, l.onerror = (f) => {
      throw f;
    }, l.write(d), a;
  }
  return Sr;
}
var vh;
function Qe() {
  return vh || (vh = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.CURRENT_APP_PACKAGE_FILE_NAME = e.CURRENT_APP_INSTALLER_FILE_NAME = e.XElement = e.parseXml = e.UUID = e.parseDn = e.retry = e.githubUrl = e.getS3LikeProviderBaseUrl = e.ProgressCallbackTransform = e.MemoLazy = e.safeStringifyJson = e.safeGetHeader = e.parseJson = e.HttpExecutor = e.HttpError = e.DigestTransform = e.createHttpError = e.configureRequestUrl = e.configureRequestOptionsFromUrl = e.configureRequestOptions = e.newError = e.CancellationToken = e.CancellationError = void 0, e.asArray = f;
    var t = rl();
    Object.defineProperty(e, "CancellationError", { enumerable: !0, get: function() {
      return t.CancellationError;
    } }), Object.defineProperty(e, "CancellationToken", { enumerable: !0, get: function() {
      return t.CancellationToken;
    } });
    var i = ha();
    Object.defineProperty(e, "newError", { enumerable: !0, get: function() {
      return i.newError;
    } });
    var r = v_();
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
    var u = __();
    Object.defineProperty(e, "MemoLazy", { enumerable: !0, get: function() {
      return u.MemoLazy;
    } });
    var s = Wm();
    Object.defineProperty(e, "ProgressCallbackTransform", { enumerable: !0, get: function() {
      return s.ProgressCallbackTransform;
    } });
    var o = w_();
    Object.defineProperty(e, "getS3LikeProviderBaseUrl", { enumerable: !0, get: function() {
      return o.getS3LikeProviderBaseUrl;
    } }), Object.defineProperty(e, "githubUrl", { enumerable: !0, get: function() {
      return o.githubUrl;
    } });
    var d = S_();
    Object.defineProperty(e, "retry", { enumerable: !0, get: function() {
      return d.retry;
    } });
    var a = T_();
    Object.defineProperty(e, "parseDn", { enumerable: !0, get: function() {
      return a.parseDn;
    } });
    var l = R_();
    Object.defineProperty(e, "UUID", { enumerable: !0, get: function() {
      return l.UUID;
    } });
    var n = A_();
    Object.defineProperty(e, "parseXml", { enumerable: !0, get: function() {
      return n.parseXml;
    } }), Object.defineProperty(e, "XElement", { enumerable: !0, get: function() {
      return n.XElement;
    } }), e.CURRENT_APP_INSTALLER_FILE_NAME = "installer.exe", e.CURRENT_APP_PACKAGE_FILE_NAME = "package.7z";
    function f(c) {
      return c == null ? [] : Array.isArray(c) ? c : [c];
    }
  })(lo)), lo;
}
var tt = {}, zi = {}, Bt = {}, _h;
function An() {
  if (_h) return Bt;
  _h = 1;
  function e(o) {
    return typeof o > "u" || o === null;
  }
  function t(o) {
    return typeof o == "object" && o !== null;
  }
  function i(o) {
    return Array.isArray(o) ? o : e(o) ? [] : [o];
  }
  function r(o, d) {
    var a, l, n, f;
    if (d)
      for (f = Object.keys(d), a = 0, l = f.length; a < l; a += 1)
        n = f[a], o[n] = d[n];
    return o;
  }
  function u(o, d) {
    var a = "", l;
    for (l = 0; l < d; l += 1)
      a += o;
    return a;
  }
  function s(o) {
    return o === 0 && Number.NEGATIVE_INFINITY === 1 / o;
  }
  return Bt.isNothing = e, Bt.isObject = t, Bt.toArray = i, Bt.repeat = u, Bt.isNegativeZero = s, Bt.extend = r, Bt;
}
var go, wh;
function On() {
  if (wh) return go;
  wh = 1;
  function e(i, r) {
    var u = "", s = i.reason || "(unknown reason)";
    return i.mark ? (i.mark.name && (u += 'in "' + i.mark.name + '" '), u += "(" + (i.mark.line + 1) + ":" + (i.mark.column + 1) + ")", !r && i.mark.snippet && (u += `

` + i.mark.snippet), s + " " + u) : s;
  }
  function t(i, r) {
    Error.call(this), this.name = "YAMLException", this.reason = i, this.mark = r, this.message = e(this, !1), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error().stack || "";
  }
  return t.prototype = Object.create(Error.prototype), t.prototype.constructor = t, t.prototype.toString = function(r) {
    return this.name + ": " + e(this, r);
  }, go = t, go;
}
var yo, Sh;
function O_() {
  if (Sh) return yo;
  Sh = 1;
  var e = An();
  function t(u, s, o, d, a) {
    var l = "", n = "", f = Math.floor(a / 2) - 1;
    return d - s > f && (l = " ... ", s = d - f + l.length), o - d > f && (n = " ...", o = d + f - n.length), {
      str: l + u.slice(s, o).replace(/\t/g, "→") + n,
      pos: d - s + l.length
      // relative position
    };
  }
  function i(u, s) {
    return e.repeat(" ", s - u.length) + u;
  }
  function r(u, s) {
    if (s = Object.create(s || null), !u.buffer) return null;
    s.maxLength || (s.maxLength = 79), typeof s.indent != "number" && (s.indent = 1), typeof s.linesBefore != "number" && (s.linesBefore = 3), typeof s.linesAfter != "number" && (s.linesAfter = 2);
    for (var o = /\r?\n|\r|\0/g, d = [0], a = [], l, n = -1; l = o.exec(u.buffer); )
      a.push(l.index), d.push(l.index + l[0].length), u.position <= l.index && n < 0 && (n = d.length - 2);
    n < 0 && (n = d.length - 1);
    var f = "", c, h, y = Math.min(u.line + s.linesAfter, a.length).toString().length, E = s.maxLength - (s.indent + y + 3);
    for (c = 1; c <= s.linesBefore && !(n - c < 0); c++)
      h = t(
        u.buffer,
        d[n - c],
        a[n - c],
        u.position - (d[n] - d[n - c]),
        E
      ), f = e.repeat(" ", s.indent) + i((u.line - c + 1).toString(), y) + " | " + h.str + `
` + f;
    for (h = t(u.buffer, d[n], a[n], u.position, E), f += e.repeat(" ", s.indent) + i((u.line + 1).toString(), y) + " | " + h.str + `
`, f += e.repeat("-", s.indent + y + 3 + h.pos) + `^
`, c = 1; c <= s.linesAfter && !(n + c >= a.length); c++)
      h = t(
        u.buffer,
        d[n + c],
        a[n + c],
        u.position - (d[n] - d[n + c]),
        E
      ), f += e.repeat(" ", s.indent) + i((u.line + c + 1).toString(), y) + " | " + h.str + `
`;
    return f.replace(/\n$/, "");
  }
  return yo = r, yo;
}
var Eo, Th;
function it() {
  if (Th) return Eo;
  Th = 1;
  var e = On(), t = [
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
  function r(s) {
    var o = {};
    return s !== null && Object.keys(s).forEach(function(d) {
      s[d].forEach(function(a) {
        o[String(a)] = d;
      });
    }), o;
  }
  function u(s, o) {
    if (o = o || {}, Object.keys(o).forEach(function(d) {
      if (t.indexOf(d) === -1)
        throw new e('Unknown option "' + d + '" is met in definition of "' + s + '" YAML type.');
    }), this.options = o, this.tag = s, this.kind = o.kind || null, this.resolve = o.resolve || function() {
      return !0;
    }, this.construct = o.construct || function(d) {
      return d;
    }, this.instanceOf = o.instanceOf || null, this.predicate = o.predicate || null, this.represent = o.represent || null, this.representName = o.representName || null, this.defaultStyle = o.defaultStyle || null, this.multi = o.multi || !1, this.styleAliases = r(o.styleAliases || null), i.indexOf(this.kind) === -1)
      throw new e('Unknown kind "' + this.kind + '" is specified for "' + s + '" YAML type.');
  }
  return Eo = u, Eo;
}
var vo, Rh;
function Km() {
  if (Rh) return vo;
  Rh = 1;
  var e = On(), t = it();
  function i(s, o) {
    var d = [];
    return s[o].forEach(function(a) {
      var l = d.length;
      d.forEach(function(n, f) {
        n.tag === a.tag && n.kind === a.kind && n.multi === a.multi && (l = f);
      }), d[l] = a;
    }), d;
  }
  function r() {
    var s = {
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
    }, o, d;
    function a(l) {
      l.multi ? (s.multi[l.kind].push(l), s.multi.fallback.push(l)) : s[l.kind][l.tag] = s.fallback[l.tag] = l;
    }
    for (o = 0, d = arguments.length; o < d; o += 1)
      arguments[o].forEach(a);
    return s;
  }
  function u(s) {
    return this.extend(s);
  }
  return u.prototype.extend = function(o) {
    var d = [], a = [];
    if (o instanceof t)
      a.push(o);
    else if (Array.isArray(o))
      a = a.concat(o);
    else if (o && (Array.isArray(o.implicit) || Array.isArray(o.explicit)))
      o.implicit && (d = d.concat(o.implicit)), o.explicit && (a = a.concat(o.explicit));
    else
      throw new e("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");
    d.forEach(function(n) {
      if (!(n instanceof t))
        throw new e("Specified list of YAML types (or a single Type object) contains a non-Type object.");
      if (n.loadKind && n.loadKind !== "scalar")
        throw new e("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
      if (n.multi)
        throw new e("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.");
    }), a.forEach(function(n) {
      if (!(n instanceof t))
        throw new e("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    });
    var l = Object.create(u.prototype);
    return l.implicit = (this.implicit || []).concat(d), l.explicit = (this.explicit || []).concat(a), l.compiledImplicit = i(l, "implicit"), l.compiledExplicit = i(l, "explicit"), l.compiledTypeMap = r(l.compiledImplicit, l.compiledExplicit), l;
  }, vo = u, vo;
}
var _o, bh;
function Jm() {
  if (bh) return _o;
  bh = 1;
  var e = it();
  return _o = new e("tag:yaml.org,2002:str", {
    kind: "scalar",
    construct: function(t) {
      return t !== null ? t : "";
    }
  }), _o;
}
var wo, Ah;
function Qm() {
  if (Ah) return wo;
  Ah = 1;
  var e = it();
  return wo = new e("tag:yaml.org,2002:seq", {
    kind: "sequence",
    construct: function(t) {
      return t !== null ? t : [];
    }
  }), wo;
}
var So, Oh;
function Zm() {
  if (Oh) return So;
  Oh = 1;
  var e = it();
  return So = new e("tag:yaml.org,2002:map", {
    kind: "mapping",
    construct: function(t) {
      return t !== null ? t : {};
    }
  }), So;
}
var To, Nh;
function eg() {
  if (Nh) return To;
  Nh = 1;
  var e = Km();
  return To = new e({
    explicit: [
      Jm(),
      Qm(),
      Zm()
    ]
  }), To;
}
var Ro, $h;
function tg() {
  if ($h) return Ro;
  $h = 1;
  var e = it();
  function t(u) {
    if (u === null) return !0;
    var s = u.length;
    return s === 1 && u === "~" || s === 4 && (u === "null" || u === "Null" || u === "NULL");
  }
  function i() {
    return null;
  }
  function r(u) {
    return u === null;
  }
  return Ro = new e("tag:yaml.org,2002:null", {
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
  }), Ro;
}
var bo, Ih;
function rg() {
  if (Ih) return bo;
  Ih = 1;
  var e = it();
  function t(u) {
    if (u === null) return !1;
    var s = u.length;
    return s === 4 && (u === "true" || u === "True" || u === "TRUE") || s === 5 && (u === "false" || u === "False" || u === "FALSE");
  }
  function i(u) {
    return u === "true" || u === "True" || u === "TRUE";
  }
  function r(u) {
    return Object.prototype.toString.call(u) === "[object Boolean]";
  }
  return bo = new e("tag:yaml.org,2002:bool", {
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
  }), bo;
}
var Ao, Ph;
function ng() {
  if (Ph) return Ao;
  Ph = 1;
  var e = An(), t = it();
  function i(a) {
    return 48 <= a && a <= 57 || 65 <= a && a <= 70 || 97 <= a && a <= 102;
  }
  function r(a) {
    return 48 <= a && a <= 55;
  }
  function u(a) {
    return 48 <= a && a <= 57;
  }
  function s(a) {
    if (a === null) return !1;
    var l = a.length, n = 0, f = !1, c;
    if (!l) return !1;
    if (c = a[n], (c === "-" || c === "+") && (c = a[++n]), c === "0") {
      if (n + 1 === l) return !0;
      if (c = a[++n], c === "b") {
        for (n++; n < l; n++)
          if (c = a[n], c !== "_") {
            if (c !== "0" && c !== "1") return !1;
            f = !0;
          }
        return f && c !== "_";
      }
      if (c === "x") {
        for (n++; n < l; n++)
          if (c = a[n], c !== "_") {
            if (!i(a.charCodeAt(n))) return !1;
            f = !0;
          }
        return f && c !== "_";
      }
      if (c === "o") {
        for (n++; n < l; n++)
          if (c = a[n], c !== "_") {
            if (!r(a.charCodeAt(n))) return !1;
            f = !0;
          }
        return f && c !== "_";
      }
    }
    if (c === "_") return !1;
    for (; n < l; n++)
      if (c = a[n], c !== "_") {
        if (!u(a.charCodeAt(n)))
          return !1;
        f = !0;
      }
    return !(!f || c === "_");
  }
  function o(a) {
    var l = a, n = 1, f;
    if (l.indexOf("_") !== -1 && (l = l.replace(/_/g, "")), f = l[0], (f === "-" || f === "+") && (f === "-" && (n = -1), l = l.slice(1), f = l[0]), l === "0") return 0;
    if (f === "0") {
      if (l[1] === "b") return n * parseInt(l.slice(2), 2);
      if (l[1] === "x") return n * parseInt(l.slice(2), 16);
      if (l[1] === "o") return n * parseInt(l.slice(2), 8);
    }
    return n * parseInt(l, 10);
  }
  function d(a) {
    return Object.prototype.toString.call(a) === "[object Number]" && a % 1 === 0 && !e.isNegativeZero(a);
  }
  return Ao = new t("tag:yaml.org,2002:int", {
    kind: "scalar",
    resolve: s,
    construct: o,
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
  }), Ao;
}
var Oo, Ch;
function ig() {
  if (Ch) return Oo;
  Ch = 1;
  var e = An(), t = it(), i = new RegExp(
    // 2.5e4, 2.5 and integers
    "^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$"
  );
  function r(a) {
    return !(a === null || !i.test(a) || // Quick hack to not allow integers end with `_`
    // Probably should update regexp & check speed
    a[a.length - 1] === "_");
  }
  function u(a) {
    var l, n;
    return l = a.replace(/_/g, "").toLowerCase(), n = l[0] === "-" ? -1 : 1, "+-".indexOf(l[0]) >= 0 && (l = l.slice(1)), l === ".inf" ? n === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY : l === ".nan" ? NaN : n * parseFloat(l, 10);
  }
  var s = /^[-+]?[0-9]+e/;
  function o(a, l) {
    var n;
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
    return n = a.toString(10), s.test(n) ? n.replace("e", ".e") : n;
  }
  function d(a) {
    return Object.prototype.toString.call(a) === "[object Number]" && (a % 1 !== 0 || e.isNegativeZero(a));
  }
  return Oo = new t("tag:yaml.org,2002:float", {
    kind: "scalar",
    resolve: r,
    construct: u,
    predicate: d,
    represent: o,
    defaultStyle: "lowercase"
  }), Oo;
}
var No, Dh;
function ag() {
  return Dh || (Dh = 1, No = eg().extend({
    implicit: [
      tg(),
      rg(),
      ng(),
      ig()
    ]
  })), No;
}
var $o, Lh;
function sg() {
  return Lh || (Lh = 1, $o = ag()), $o;
}
var Io, kh;
function og() {
  if (kh) return Io;
  kh = 1;
  var e = it(), t = new RegExp(
    "^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"
  ), i = new RegExp(
    "^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$"
  );
  function r(o) {
    return o === null ? !1 : t.exec(o) !== null || i.exec(o) !== null;
  }
  function u(o) {
    var d, a, l, n, f, c, h, y = 0, E = null, p, v, m;
    if (d = t.exec(o), d === null && (d = i.exec(o)), d === null) throw new Error("Date resolve error");
    if (a = +d[1], l = +d[2] - 1, n = +d[3], !d[4])
      return new Date(Date.UTC(a, l, n));
    if (f = +d[4], c = +d[5], h = +d[6], d[7]) {
      for (y = d[7].slice(0, 3); y.length < 3; )
        y += "0";
      y = +y;
    }
    return d[9] && (p = +d[10], v = +(d[11] || 0), E = (p * 60 + v) * 6e4, d[9] === "-" && (E = -E)), m = new Date(Date.UTC(a, l, n, f, c, h, y)), E && m.setTime(m.getTime() - E), m;
  }
  function s(o) {
    return o.toISOString();
  }
  return Io = new e("tag:yaml.org,2002:timestamp", {
    kind: "scalar",
    resolve: r,
    construct: u,
    instanceOf: Date,
    represent: s
  }), Io;
}
var Po, Fh;
function ug() {
  if (Fh) return Po;
  Fh = 1;
  var e = it();
  function t(i) {
    return i === "<<" || i === null;
  }
  return Po = new e("tag:yaml.org,2002:merge", {
    kind: "scalar",
    resolve: t
  }), Po;
}
var Co, Uh;
function lg() {
  if (Uh) return Co;
  Uh = 1;
  var e = it(), t = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;
  function i(o) {
    if (o === null) return !1;
    var d, a, l = 0, n = o.length, f = t;
    for (a = 0; a < n; a++)
      if (d = f.indexOf(o.charAt(a)), !(d > 64)) {
        if (d < 0) return !1;
        l += 6;
      }
    return l % 8 === 0;
  }
  function r(o) {
    var d, a, l = o.replace(/[\r\n=]/g, ""), n = l.length, f = t, c = 0, h = [];
    for (d = 0; d < n; d++)
      d % 4 === 0 && d && (h.push(c >> 16 & 255), h.push(c >> 8 & 255), h.push(c & 255)), c = c << 6 | f.indexOf(l.charAt(d));
    return a = n % 4 * 6, a === 0 ? (h.push(c >> 16 & 255), h.push(c >> 8 & 255), h.push(c & 255)) : a === 18 ? (h.push(c >> 10 & 255), h.push(c >> 2 & 255)) : a === 12 && h.push(c >> 4 & 255), new Uint8Array(h);
  }
  function u(o) {
    var d = "", a = 0, l, n, f = o.length, c = t;
    for (l = 0; l < f; l++)
      l % 3 === 0 && l && (d += c[a >> 18 & 63], d += c[a >> 12 & 63], d += c[a >> 6 & 63], d += c[a & 63]), a = (a << 8) + o[l];
    return n = f % 3, n === 0 ? (d += c[a >> 18 & 63], d += c[a >> 12 & 63], d += c[a >> 6 & 63], d += c[a & 63]) : n === 2 ? (d += c[a >> 10 & 63], d += c[a >> 4 & 63], d += c[a << 2 & 63], d += c[64]) : n === 1 && (d += c[a >> 2 & 63], d += c[a << 4 & 63], d += c[64], d += c[64]), d;
  }
  function s(o) {
    return Object.prototype.toString.call(o) === "[object Uint8Array]";
  }
  return Co = new e("tag:yaml.org,2002:binary", {
    kind: "scalar",
    resolve: i,
    construct: r,
    predicate: s,
    represent: u
  }), Co;
}
var Do, qh;
function cg() {
  if (qh) return Do;
  qh = 1;
  var e = it(), t = Object.prototype.hasOwnProperty, i = Object.prototype.toString;
  function r(s) {
    if (s === null) return !0;
    var o = [], d, a, l, n, f, c = s;
    for (d = 0, a = c.length; d < a; d += 1) {
      if (l = c[d], f = !1, i.call(l) !== "[object Object]") return !1;
      for (n in l)
        if (t.call(l, n))
          if (!f) f = !0;
          else return !1;
      if (!f) return !1;
      if (o.indexOf(n) === -1) o.push(n);
      else return !1;
    }
    return !0;
  }
  function u(s) {
    return s !== null ? s : [];
  }
  return Do = new e("tag:yaml.org,2002:omap", {
    kind: "sequence",
    resolve: r,
    construct: u
  }), Do;
}
var Lo, xh;
function fg() {
  if (xh) return Lo;
  xh = 1;
  var e = it(), t = Object.prototype.toString;
  function i(u) {
    if (u === null) return !0;
    var s, o, d, a, l, n = u;
    for (l = new Array(n.length), s = 0, o = n.length; s < o; s += 1) {
      if (d = n[s], t.call(d) !== "[object Object]" || (a = Object.keys(d), a.length !== 1)) return !1;
      l[s] = [a[0], d[a[0]]];
    }
    return !0;
  }
  function r(u) {
    if (u === null) return [];
    var s, o, d, a, l, n = u;
    for (l = new Array(n.length), s = 0, o = n.length; s < o; s += 1)
      d = n[s], a = Object.keys(d), l[s] = [a[0], d[a[0]]];
    return l;
  }
  return Lo = new e("tag:yaml.org,2002:pairs", {
    kind: "sequence",
    resolve: i,
    construct: r
  }), Lo;
}
var ko, Mh;
function dg() {
  if (Mh) return ko;
  Mh = 1;
  var e = it(), t = Object.prototype.hasOwnProperty;
  function i(u) {
    if (u === null) return !0;
    var s, o = u;
    for (s in o)
      if (t.call(o, s) && o[s] !== null)
        return !1;
    return !0;
  }
  function r(u) {
    return u !== null ? u : {};
  }
  return ko = new e("tag:yaml.org,2002:set", {
    kind: "mapping",
    resolve: i,
    construct: r
  }), ko;
}
var Fo, jh;
function nl() {
  return jh || (jh = 1, Fo = sg().extend({
    implicit: [
      og(),
      ug()
    ],
    explicit: [
      lg(),
      cg(),
      fg(),
      dg()
    ]
  })), Fo;
}
var Gh;
function N_() {
  if (Gh) return zi;
  Gh = 1;
  var e = An(), t = On(), i = O_(), r = nl(), u = Object.prototype.hasOwnProperty, s = 1, o = 2, d = 3, a = 4, l = 1, n = 2, f = 3, c = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/, h = /[\x85\u2028\u2029]/, y = /[,\[\]\{\}]/, E = /^(?:!|!!|![a-z\-]+!)$/i, p = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
  function v(g) {
    return Object.prototype.toString.call(g);
  }
  function m(g) {
    return g === 10 || g === 13;
  }
  function w(g) {
    return g === 9 || g === 32;
  }
  function T(g) {
    return g === 9 || g === 32 || g === 10 || g === 13;
  }
  function R(g) {
    return g === 44 || g === 91 || g === 93 || g === 123 || g === 125;
  }
  function _(g) {
    var ee;
    return 48 <= g && g <= 57 ? g - 48 : (ee = g | 32, 97 <= ee && ee <= 102 ? ee - 97 + 10 : -1);
  }
  function S(g) {
    return g === 120 ? 2 : g === 117 ? 4 : g === 85 ? 8 : 0;
  }
  function A(g) {
    return 48 <= g && g <= 57 ? g - 48 : -1;
  }
  function b(g) {
    return g === 48 ? "\0" : g === 97 ? "\x07" : g === 98 ? "\b" : g === 116 || g === 9 ? "	" : g === 110 ? `
` : g === 118 ? "\v" : g === 102 ? "\f" : g === 114 ? "\r" : g === 101 ? "\x1B" : g === 32 ? " " : g === 34 ? '"' : g === 47 ? "/" : g === 92 ? "\\" : g === 78 ? "" : g === 95 ? " " : g === 76 ? "\u2028" : g === 80 ? "\u2029" : "";
  }
  function x(g) {
    return g <= 65535 ? String.fromCharCode(g) : String.fromCharCode(
      (g - 65536 >> 10) + 55296,
      (g - 65536 & 1023) + 56320
    );
  }
  function M(g, ee, ne) {
    ee === "__proto__" ? Object.defineProperty(g, ee, {
      configurable: !0,
      enumerable: !0,
      writable: !0,
      value: ne
    }) : g[ee] = ne;
  }
  for (var j = new Array(256), X = new Array(256), P = 0; P < 256; P++)
    j[P] = b(P) ? 1 : 0, X[P] = b(P);
  function D(g, ee) {
    this.input = g, this.filename = ee.filename || null, this.schema = ee.schema || r, this.onWarning = ee.onWarning || null, this.legacy = ee.legacy || !1, this.json = ee.json || !1, this.listener = ee.listener || null, this.implicitTypes = this.schema.compiledImplicit, this.typeMap = this.schema.compiledTypeMap, this.length = g.length, this.position = 0, this.line = 0, this.lineStart = 0, this.lineIndent = 0, this.firstTabInLine = -1, this.documents = [];
  }
  function W(g, ee) {
    var ne = {
      name: g.filename,
      buffer: g.input.slice(0, -1),
      // omit trailing \0
      position: g.position,
      line: g.line,
      column: g.position - g.lineStart
    };
    return ne.snippet = i(ne), new t(ee, ne);
  }
  function L(g, ee) {
    throw W(g, ee);
  }
  function F(g, ee) {
    g.onWarning && g.onWarning.call(null, W(g, ee));
  }
  var G = {
    YAML: function(ee, ne, pe) {
      var ie, he, ce;
      ee.version !== null && L(ee, "duplication of %YAML directive"), pe.length !== 1 && L(ee, "YAML directive accepts exactly one argument"), ie = /^([0-9]+)\.([0-9]+)$/.exec(pe[0]), ie === null && L(ee, "ill-formed argument of the YAML directive"), he = parseInt(ie[1], 10), ce = parseInt(ie[2], 10), he !== 1 && L(ee, "unacceptable YAML version of the document"), ee.version = pe[0], ee.checkLineBreaks = ce < 2, ce !== 1 && ce !== 2 && F(ee, "unsupported YAML version of the document");
    },
    TAG: function(ee, ne, pe) {
      var ie, he;
      pe.length !== 2 && L(ee, "TAG directive accepts exactly two arguments"), ie = pe[0], he = pe[1], E.test(ie) || L(ee, "ill-formed tag handle (first argument) of the TAG directive"), u.call(ee.tagMap, ie) && L(ee, 'there is a previously declared suffix for "' + ie + '" tag handle'), p.test(he) || L(ee, "ill-formed tag prefix (second argument) of the TAG directive");
      try {
        he = decodeURIComponent(he);
      } catch {
        L(ee, "tag prefix is malformed: " + he);
      }
      ee.tagMap[ie] = he;
    }
  };
  function k(g, ee, ne, pe) {
    var ie, he, ce, me;
    if (ee < ne) {
      if (me = g.input.slice(ee, ne), pe)
        for (ie = 0, he = me.length; ie < he; ie += 1)
          ce = me.charCodeAt(ie), ce === 9 || 32 <= ce && ce <= 1114111 || L(g, "expected valid JSON character");
      else c.test(me) && L(g, "the stream contains non-printable characters");
      g.result += me;
    }
  }
  function q(g, ee, ne, pe) {
    var ie, he, ce, me;
    for (e.isObject(ne) || L(g, "cannot merge mappings; the provided source object is unacceptable"), ie = Object.keys(ne), ce = 0, me = ie.length; ce < me; ce += 1)
      he = ie[ce], u.call(ee, he) || (M(ee, he, ne[he]), pe[he] = !0);
  }
  function z(g, ee, ne, pe, ie, he, ce, me, ye) {
    var $e, Ie;
    if (Array.isArray(ie))
      for (ie = Array.prototype.slice.call(ie), $e = 0, Ie = ie.length; $e < Ie; $e += 1)
        Array.isArray(ie[$e]) && L(g, "nested arrays are not supported inside keys"), typeof ie == "object" && v(ie[$e]) === "[object Object]" && (ie[$e] = "[object Object]");
    if (typeof ie == "object" && v(ie) === "[object Object]" && (ie = "[object Object]"), ie = String(ie), ee === null && (ee = {}), pe === "tag:yaml.org,2002:merge")
      if (Array.isArray(he))
        for ($e = 0, Ie = he.length; $e < Ie; $e += 1)
          q(g, ee, he[$e], ne);
      else
        q(g, ee, he, ne);
    else
      !g.json && !u.call(ne, ie) && u.call(ee, ie) && (g.line = ce || g.line, g.lineStart = me || g.lineStart, g.position = ye || g.position, L(g, "duplicated mapping key")), M(ee, ie, he), delete ne[ie];
    return ee;
  }
  function H(g) {
    var ee;
    ee = g.input.charCodeAt(g.position), ee === 10 ? g.position++ : ee === 13 ? (g.position++, g.input.charCodeAt(g.position) === 10 && g.position++) : L(g, "a line break is expected"), g.line += 1, g.lineStart = g.position, g.firstTabInLine = -1;
  }
  function $(g, ee, ne) {
    for (var pe = 0, ie = g.input.charCodeAt(g.position); ie !== 0; ) {
      for (; w(ie); )
        ie === 9 && g.firstTabInLine === -1 && (g.firstTabInLine = g.position), ie = g.input.charCodeAt(++g.position);
      if (ee && ie === 35)
        do
          ie = g.input.charCodeAt(++g.position);
        while (ie !== 10 && ie !== 13 && ie !== 0);
      if (m(ie))
        for (H(g), ie = g.input.charCodeAt(g.position), pe++, g.lineIndent = 0; ie === 32; )
          g.lineIndent++, ie = g.input.charCodeAt(++g.position);
      else
        break;
    }
    return ne !== -1 && pe !== 0 && g.lineIndent < ne && F(g, "deficient indentation"), pe;
  }
  function I(g) {
    var ee = g.position, ne;
    return ne = g.input.charCodeAt(ee), !!((ne === 45 || ne === 46) && ne === g.input.charCodeAt(ee + 1) && ne === g.input.charCodeAt(ee + 2) && (ee += 3, ne = g.input.charCodeAt(ee), ne === 0 || T(ne)));
  }
  function K(g, ee) {
    ee === 1 ? g.result += " " : ee > 1 && (g.result += e.repeat(`
`, ee - 1));
  }
  function N(g, ee, ne) {
    var pe, ie, he, ce, me, ye, $e, Ie, we = g.kind, C = g.result, te;
    if (te = g.input.charCodeAt(g.position), T(te) || R(te) || te === 35 || te === 38 || te === 42 || te === 33 || te === 124 || te === 62 || te === 39 || te === 34 || te === 37 || te === 64 || te === 96 || (te === 63 || te === 45) && (ie = g.input.charCodeAt(g.position + 1), T(ie) || ne && R(ie)))
      return !1;
    for (g.kind = "scalar", g.result = "", he = ce = g.position, me = !1; te !== 0; ) {
      if (te === 58) {
        if (ie = g.input.charCodeAt(g.position + 1), T(ie) || ne && R(ie))
          break;
      } else if (te === 35) {
        if (pe = g.input.charCodeAt(g.position - 1), T(pe))
          break;
      } else {
        if (g.position === g.lineStart && I(g) || ne && R(te))
          break;
        if (m(te))
          if (ye = g.line, $e = g.lineStart, Ie = g.lineIndent, $(g, !1, -1), g.lineIndent >= ee) {
            me = !0, te = g.input.charCodeAt(g.position);
            continue;
          } else {
            g.position = ce, g.line = ye, g.lineStart = $e, g.lineIndent = Ie;
            break;
          }
      }
      me && (k(g, he, ce, !1), K(g, g.line - ye), he = ce = g.position, me = !1), w(te) || (ce = g.position + 1), te = g.input.charCodeAt(++g.position);
    }
    return k(g, he, ce, !1), g.result ? !0 : (g.kind = we, g.result = C, !1);
  }
  function O(g, ee) {
    var ne, pe, ie;
    if (ne = g.input.charCodeAt(g.position), ne !== 39)
      return !1;
    for (g.kind = "scalar", g.result = "", g.position++, pe = ie = g.position; (ne = g.input.charCodeAt(g.position)) !== 0; )
      if (ne === 39)
        if (k(g, pe, g.position, !0), ne = g.input.charCodeAt(++g.position), ne === 39)
          pe = g.position, g.position++, ie = g.position;
        else
          return !0;
      else m(ne) ? (k(g, pe, ie, !0), K(g, $(g, !1, ee)), pe = ie = g.position) : g.position === g.lineStart && I(g) ? L(g, "unexpected end of the document within a single quoted scalar") : (g.position++, ie = g.position);
    L(g, "unexpected end of the stream within a single quoted scalar");
  }
  function Q(g, ee) {
    var ne, pe, ie, he, ce, me;
    if (me = g.input.charCodeAt(g.position), me !== 34)
      return !1;
    for (g.kind = "scalar", g.result = "", g.position++, ne = pe = g.position; (me = g.input.charCodeAt(g.position)) !== 0; ) {
      if (me === 34)
        return k(g, ne, g.position, !0), g.position++, !0;
      if (me === 92) {
        if (k(g, ne, g.position, !0), me = g.input.charCodeAt(++g.position), m(me))
          $(g, !1, ee);
        else if (me < 256 && j[me])
          g.result += X[me], g.position++;
        else if ((ce = S(me)) > 0) {
          for (ie = ce, he = 0; ie > 0; ie--)
            me = g.input.charCodeAt(++g.position), (ce = _(me)) >= 0 ? he = (he << 4) + ce : L(g, "expected hexadecimal character");
          g.result += x(he), g.position++;
        } else
          L(g, "unknown escape sequence");
        ne = pe = g.position;
      } else m(me) ? (k(g, ne, pe, !0), K(g, $(g, !1, ee)), ne = pe = g.position) : g.position === g.lineStart && I(g) ? L(g, "unexpected end of the document within a double quoted scalar") : (g.position++, pe = g.position);
    }
    L(g, "unexpected end of the stream within a double quoted scalar");
  }
  function V(g, ee) {
    var ne = !0, pe, ie, he, ce = g.tag, me, ye = g.anchor, $e, Ie, we, C, te, ae = /* @__PURE__ */ Object.create(null), se, oe, ge, de;
    if (de = g.input.charCodeAt(g.position), de === 91)
      Ie = 93, te = !1, me = [];
    else if (de === 123)
      Ie = 125, te = !0, me = {};
    else
      return !1;
    for (g.anchor !== null && (g.anchorMap[g.anchor] = me), de = g.input.charCodeAt(++g.position); de !== 0; ) {
      if ($(g, !0, ee), de = g.input.charCodeAt(g.position), de === Ie)
        return g.position++, g.tag = ce, g.anchor = ye, g.kind = te ? "mapping" : "sequence", g.result = me, !0;
      ne ? de === 44 && L(g, "expected the node content, but found ','") : L(g, "missed comma between flow collection entries"), oe = se = ge = null, we = C = !1, de === 63 && ($e = g.input.charCodeAt(g.position + 1), T($e) && (we = C = !0, g.position++, $(g, !0, ee))), pe = g.line, ie = g.lineStart, he = g.position, Te(g, ee, s, !1, !0), oe = g.tag, se = g.result, $(g, !0, ee), de = g.input.charCodeAt(g.position), (C || g.line === pe) && de === 58 && (we = !0, de = g.input.charCodeAt(++g.position), $(g, !0, ee), Te(g, ee, s, !1, !0), ge = g.result), te ? z(g, me, ae, oe, se, ge, pe, ie, he) : we ? me.push(z(g, null, ae, oe, se, ge, pe, ie, he)) : me.push(se), $(g, !0, ee), de = g.input.charCodeAt(g.position), de === 44 ? (ne = !0, de = g.input.charCodeAt(++g.position)) : ne = !1;
    }
    L(g, "unexpected end of the stream within a flow collection");
  }
  function B(g, ee) {
    var ne, pe, ie = l, he = !1, ce = !1, me = ee, ye = 0, $e = !1, Ie, we;
    if (we = g.input.charCodeAt(g.position), we === 124)
      pe = !1;
    else if (we === 62)
      pe = !0;
    else
      return !1;
    for (g.kind = "scalar", g.result = ""; we !== 0; )
      if (we = g.input.charCodeAt(++g.position), we === 43 || we === 45)
        l === ie ? ie = we === 43 ? f : n : L(g, "repeat of a chomping mode identifier");
      else if ((Ie = A(we)) >= 0)
        Ie === 0 ? L(g, "bad explicit indentation width of a block scalar; it cannot be less than one") : ce ? L(g, "repeat of an indentation width identifier") : (me = ee + Ie - 1, ce = !0);
      else
        break;
    if (w(we)) {
      do
        we = g.input.charCodeAt(++g.position);
      while (w(we));
      if (we === 35)
        do
          we = g.input.charCodeAt(++g.position);
        while (!m(we) && we !== 0);
    }
    for (; we !== 0; ) {
      for (H(g), g.lineIndent = 0, we = g.input.charCodeAt(g.position); (!ce || g.lineIndent < me) && we === 32; )
        g.lineIndent++, we = g.input.charCodeAt(++g.position);
      if (!ce && g.lineIndent > me && (me = g.lineIndent), m(we)) {
        ye++;
        continue;
      }
      if (g.lineIndent < me) {
        ie === f ? g.result += e.repeat(`
`, he ? 1 + ye : ye) : ie === l && he && (g.result += `
`);
        break;
      }
      for (pe ? w(we) ? ($e = !0, g.result += e.repeat(`
`, he ? 1 + ye : ye)) : $e ? ($e = !1, g.result += e.repeat(`
`, ye + 1)) : ye === 0 ? he && (g.result += " ") : g.result += e.repeat(`
`, ye) : g.result += e.repeat(`
`, he ? 1 + ye : ye), he = !0, ce = !0, ye = 0, ne = g.position; !m(we) && we !== 0; )
        we = g.input.charCodeAt(++g.position);
      k(g, ne, g.position, !1);
    }
    return !0;
  }
  function Y(g, ee) {
    var ne, pe = g.tag, ie = g.anchor, he = [], ce, me = !1, ye;
    if (g.firstTabInLine !== -1) return !1;
    for (g.anchor !== null && (g.anchorMap[g.anchor] = he), ye = g.input.charCodeAt(g.position); ye !== 0 && (g.firstTabInLine !== -1 && (g.position = g.firstTabInLine, L(g, "tab characters must not be used in indentation")), !(ye !== 45 || (ce = g.input.charCodeAt(g.position + 1), !T(ce)))); ) {
      if (me = !0, g.position++, $(g, !0, -1) && g.lineIndent <= ee) {
        he.push(null), ye = g.input.charCodeAt(g.position);
        continue;
      }
      if (ne = g.line, Te(g, ee, d, !1, !0), he.push(g.result), $(g, !0, -1), ye = g.input.charCodeAt(g.position), (g.line === ne || g.lineIndent > ee) && ye !== 0)
        L(g, "bad indentation of a sequence entry");
      else if (g.lineIndent < ee)
        break;
    }
    return me ? (g.tag = pe, g.anchor = ie, g.kind = "sequence", g.result = he, !0) : !1;
  }
  function Z(g, ee, ne) {
    var pe, ie, he, ce, me, ye, $e = g.tag, Ie = g.anchor, we = {}, C = /* @__PURE__ */ Object.create(null), te = null, ae = null, se = null, oe = !1, ge = !1, de;
    if (g.firstTabInLine !== -1) return !1;
    for (g.anchor !== null && (g.anchorMap[g.anchor] = we), de = g.input.charCodeAt(g.position); de !== 0; ) {
      if (!oe && g.firstTabInLine !== -1 && (g.position = g.firstTabInLine, L(g, "tab characters must not be used in indentation")), pe = g.input.charCodeAt(g.position + 1), he = g.line, (de === 63 || de === 58) && T(pe))
        de === 63 ? (oe && (z(g, we, C, te, ae, null, ce, me, ye), te = ae = se = null), ge = !0, oe = !0, ie = !0) : oe ? (oe = !1, ie = !0) : L(g, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"), g.position += 1, de = pe;
      else {
        if (ce = g.line, me = g.lineStart, ye = g.position, !Te(g, ne, o, !1, !0))
          break;
        if (g.line === he) {
          for (de = g.input.charCodeAt(g.position); w(de); )
            de = g.input.charCodeAt(++g.position);
          if (de === 58)
            de = g.input.charCodeAt(++g.position), T(de) || L(g, "a whitespace character is expected after the key-value separator within a block mapping"), oe && (z(g, we, C, te, ae, null, ce, me, ye), te = ae = se = null), ge = !0, oe = !1, ie = !1, te = g.tag, ae = g.result;
          else if (ge)
            L(g, "can not read an implicit mapping pair; a colon is missed");
          else
            return g.tag = $e, g.anchor = Ie, !0;
        } else if (ge)
          L(g, "can not read a block mapping entry; a multiline key may not be an implicit key");
        else
          return g.tag = $e, g.anchor = Ie, !0;
      }
      if ((g.line === he || g.lineIndent > ee) && (oe && (ce = g.line, me = g.lineStart, ye = g.position), Te(g, ee, a, !0, ie) && (oe ? ae = g.result : se = g.result), oe || (z(g, we, C, te, ae, se, ce, me, ye), te = ae = se = null), $(g, !0, -1), de = g.input.charCodeAt(g.position)), (g.line === he || g.lineIndent > ee) && de !== 0)
        L(g, "bad indentation of a mapping entry");
      else if (g.lineIndent < ee)
        break;
    }
    return oe && z(g, we, C, te, ae, null, ce, me, ye), ge && (g.tag = $e, g.anchor = Ie, g.kind = "mapping", g.result = we), ge;
  }
  function re(g) {
    var ee, ne = !1, pe = !1, ie, he, ce;
    if (ce = g.input.charCodeAt(g.position), ce !== 33) return !1;
    if (g.tag !== null && L(g, "duplication of a tag property"), ce = g.input.charCodeAt(++g.position), ce === 60 ? (ne = !0, ce = g.input.charCodeAt(++g.position)) : ce === 33 ? (pe = !0, ie = "!!", ce = g.input.charCodeAt(++g.position)) : ie = "!", ee = g.position, ne) {
      do
        ce = g.input.charCodeAt(++g.position);
      while (ce !== 0 && ce !== 62);
      g.position < g.length ? (he = g.input.slice(ee, g.position), ce = g.input.charCodeAt(++g.position)) : L(g, "unexpected end of the stream within a verbatim tag");
    } else {
      for (; ce !== 0 && !T(ce); )
        ce === 33 && (pe ? L(g, "tag suffix cannot contain exclamation marks") : (ie = g.input.slice(ee - 1, g.position + 1), E.test(ie) || L(g, "named tag handle cannot contain such characters"), pe = !0, ee = g.position + 1)), ce = g.input.charCodeAt(++g.position);
      he = g.input.slice(ee, g.position), y.test(he) && L(g, "tag suffix cannot contain flow indicator characters");
    }
    he && !p.test(he) && L(g, "tag name cannot contain such characters: " + he);
    try {
      he = decodeURIComponent(he);
    } catch {
      L(g, "tag name is malformed: " + he);
    }
    return ne ? g.tag = he : u.call(g.tagMap, ie) ? g.tag = g.tagMap[ie] + he : ie === "!" ? g.tag = "!" + he : ie === "!!" ? g.tag = "tag:yaml.org,2002:" + he : L(g, 'undeclared tag handle "' + ie + '"'), !0;
  }
  function le(g) {
    var ee, ne;
    if (ne = g.input.charCodeAt(g.position), ne !== 38) return !1;
    for (g.anchor !== null && L(g, "duplication of an anchor property"), ne = g.input.charCodeAt(++g.position), ee = g.position; ne !== 0 && !T(ne) && !R(ne); )
      ne = g.input.charCodeAt(++g.position);
    return g.position === ee && L(g, "name of an anchor node must contain at least one character"), g.anchor = g.input.slice(ee, g.position), !0;
  }
  function Se(g) {
    var ee, ne, pe;
    if (pe = g.input.charCodeAt(g.position), pe !== 42) return !1;
    for (pe = g.input.charCodeAt(++g.position), ee = g.position; pe !== 0 && !T(pe) && !R(pe); )
      pe = g.input.charCodeAt(++g.position);
    return g.position === ee && L(g, "name of an alias node must contain at least one character"), ne = g.input.slice(ee, g.position), u.call(g.anchorMap, ne) || L(g, 'unidentified alias "' + ne + '"'), g.result = g.anchorMap[ne], $(g, !0, -1), !0;
  }
  function Te(g, ee, ne, pe, ie) {
    var he, ce, me, ye = 1, $e = !1, Ie = !1, we, C, te, ae, se, oe;
    if (g.listener !== null && g.listener("open", g), g.tag = null, g.anchor = null, g.kind = null, g.result = null, he = ce = me = a === ne || d === ne, pe && $(g, !0, -1) && ($e = !0, g.lineIndent > ee ? ye = 1 : g.lineIndent === ee ? ye = 0 : g.lineIndent < ee && (ye = -1)), ye === 1)
      for (; re(g) || le(g); )
        $(g, !0, -1) ? ($e = !0, me = he, g.lineIndent > ee ? ye = 1 : g.lineIndent === ee ? ye = 0 : g.lineIndent < ee && (ye = -1)) : me = !1;
    if (me && (me = $e || ie), (ye === 1 || a === ne) && (s === ne || o === ne ? se = ee : se = ee + 1, oe = g.position - g.lineStart, ye === 1 ? me && (Y(g, oe) || Z(g, oe, se)) || V(g, se) ? Ie = !0 : (ce && B(g, se) || O(g, se) || Q(g, se) ? Ie = !0 : Se(g) ? (Ie = !0, (g.tag !== null || g.anchor !== null) && L(g, "alias node should not have any properties")) : N(g, se, s === ne) && (Ie = !0, g.tag === null && (g.tag = "?")), g.anchor !== null && (g.anchorMap[g.anchor] = g.result)) : ye === 0 && (Ie = me && Y(g, oe))), g.tag === null)
      g.anchor !== null && (g.anchorMap[g.anchor] = g.result);
    else if (g.tag === "?") {
      for (g.result !== null && g.kind !== "scalar" && L(g, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + g.kind + '"'), we = 0, C = g.implicitTypes.length; we < C; we += 1)
        if (ae = g.implicitTypes[we], ae.resolve(g.result)) {
          g.result = ae.construct(g.result), g.tag = ae.tag, g.anchor !== null && (g.anchorMap[g.anchor] = g.result);
          break;
        }
    } else if (g.tag !== "!") {
      if (u.call(g.typeMap[g.kind || "fallback"], g.tag))
        ae = g.typeMap[g.kind || "fallback"][g.tag];
      else
        for (ae = null, te = g.typeMap.multi[g.kind || "fallback"], we = 0, C = te.length; we < C; we += 1)
          if (g.tag.slice(0, te[we].tag.length) === te[we].tag) {
            ae = te[we];
            break;
          }
      ae || L(g, "unknown tag !<" + g.tag + ">"), g.result !== null && ae.kind !== g.kind && L(g, "unacceptable node kind for !<" + g.tag + '> tag; it should be "' + ae.kind + '", not "' + g.kind + '"'), ae.resolve(g.result, g.tag) ? (g.result = ae.construct(g.result, g.tag), g.anchor !== null && (g.anchorMap[g.anchor] = g.result)) : L(g, "cannot resolve a node with !<" + g.tag + "> explicit tag");
    }
    return g.listener !== null && g.listener("close", g), g.tag !== null || g.anchor !== null || Ie;
  }
  function Fe(g) {
    var ee = g.position, ne, pe, ie, he = !1, ce;
    for (g.version = null, g.checkLineBreaks = g.legacy, g.tagMap = /* @__PURE__ */ Object.create(null), g.anchorMap = /* @__PURE__ */ Object.create(null); (ce = g.input.charCodeAt(g.position)) !== 0 && ($(g, !0, -1), ce = g.input.charCodeAt(g.position), !(g.lineIndent > 0 || ce !== 37)); ) {
      for (he = !0, ce = g.input.charCodeAt(++g.position), ne = g.position; ce !== 0 && !T(ce); )
        ce = g.input.charCodeAt(++g.position);
      for (pe = g.input.slice(ne, g.position), ie = [], pe.length < 1 && L(g, "directive name must not be less than one character in length"); ce !== 0; ) {
        for (; w(ce); )
          ce = g.input.charCodeAt(++g.position);
        if (ce === 35) {
          do
            ce = g.input.charCodeAt(++g.position);
          while (ce !== 0 && !m(ce));
          break;
        }
        if (m(ce)) break;
        for (ne = g.position; ce !== 0 && !T(ce); )
          ce = g.input.charCodeAt(++g.position);
        ie.push(g.input.slice(ne, g.position));
      }
      ce !== 0 && H(g), u.call(G, pe) ? G[pe](g, pe, ie) : F(g, 'unknown document directive "' + pe + '"');
    }
    if ($(g, !0, -1), g.lineIndent === 0 && g.input.charCodeAt(g.position) === 45 && g.input.charCodeAt(g.position + 1) === 45 && g.input.charCodeAt(g.position + 2) === 45 ? (g.position += 3, $(g, !0, -1)) : he && L(g, "directives end mark is expected"), Te(g, g.lineIndent - 1, a, !1, !0), $(g, !0, -1), g.checkLineBreaks && h.test(g.input.slice(ee, g.position)) && F(g, "non-ASCII line breaks are interpreted as content"), g.documents.push(g.result), g.position === g.lineStart && I(g)) {
      g.input.charCodeAt(g.position) === 46 && (g.position += 3, $(g, !0, -1));
      return;
    }
    if (g.position < g.length - 1)
      L(g, "end of the stream or a document separator is expected");
    else
      return;
  }
  function He(g, ee) {
    g = String(g), ee = ee || {}, g.length !== 0 && (g.charCodeAt(g.length - 1) !== 10 && g.charCodeAt(g.length - 1) !== 13 && (g += `
`), g.charCodeAt(0) === 65279 && (g = g.slice(1)));
    var ne = new D(g, ee), pe = g.indexOf("\0");
    for (pe !== -1 && (ne.position = pe, L(ne, "null byte is not allowed in input")), ne.input += "\0"; ne.input.charCodeAt(ne.position) === 32; )
      ne.lineIndent += 1, ne.position += 1;
    for (; ne.position < ne.length - 1; )
      Fe(ne);
    return ne.documents;
  }
  function Ge(g, ee, ne) {
    ee !== null && typeof ee == "object" && typeof ne > "u" && (ne = ee, ee = null);
    var pe = He(g, ne);
    if (typeof ee != "function")
      return pe;
    for (var ie = 0, he = pe.length; ie < he; ie += 1)
      ee(pe[ie]);
  }
  function ke(g, ee) {
    var ne = He(g, ee);
    if (ne.length !== 0) {
      if (ne.length === 1)
        return ne[0];
      throw new t("expected a single document in the stream, but found more");
    }
  }
  return zi.loadAll = Ge, zi.load = ke, zi;
}
var Uo = {}, Hh;
function $_() {
  if (Hh) return Uo;
  Hh = 1;
  var e = An(), t = On(), i = nl(), r = Object.prototype.toString, u = Object.prototype.hasOwnProperty, s = 65279, o = 9, d = 10, a = 13, l = 32, n = 33, f = 34, c = 35, h = 37, y = 38, E = 39, p = 42, v = 44, m = 45, w = 58, T = 61, R = 62, _ = 63, S = 64, A = 91, b = 93, x = 96, M = 123, j = 124, X = 125, P = {};
  P[0] = "\\0", P[7] = "\\a", P[8] = "\\b", P[9] = "\\t", P[10] = "\\n", P[11] = "\\v", P[12] = "\\f", P[13] = "\\r", P[27] = "\\e", P[34] = '\\"', P[92] = "\\\\", P[133] = "\\N", P[160] = "\\_", P[8232] = "\\L", P[8233] = "\\P";
  var D = [
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
  ], W = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;
  function L(C, te) {
    var ae, se, oe, ge, de, Ee, _e;
    if (te === null) return {};
    for (ae = {}, se = Object.keys(te), oe = 0, ge = se.length; oe < ge; oe += 1)
      de = se[oe], Ee = String(te[de]), de.slice(0, 2) === "!!" && (de = "tag:yaml.org,2002:" + de.slice(2)), _e = C.compiledTypeMap.fallback[de], _e && u.call(_e.styleAliases, Ee) && (Ee = _e.styleAliases[Ee]), ae[de] = Ee;
    return ae;
  }
  function F(C) {
    var te, ae, se;
    if (te = C.toString(16).toUpperCase(), C <= 255)
      ae = "x", se = 2;
    else if (C <= 65535)
      ae = "u", se = 4;
    else if (C <= 4294967295)
      ae = "U", se = 8;
    else
      throw new t("code point within a string may not be greater than 0xFFFFFFFF");
    return "\\" + ae + e.repeat("0", se - te.length) + te;
  }
  var G = 1, k = 2;
  function q(C) {
    this.schema = C.schema || i, this.indent = Math.max(1, C.indent || 2), this.noArrayIndent = C.noArrayIndent || !1, this.skipInvalid = C.skipInvalid || !1, this.flowLevel = e.isNothing(C.flowLevel) ? -1 : C.flowLevel, this.styleMap = L(this.schema, C.styles || null), this.sortKeys = C.sortKeys || !1, this.lineWidth = C.lineWidth || 80, this.noRefs = C.noRefs || !1, this.noCompatMode = C.noCompatMode || !1, this.condenseFlow = C.condenseFlow || !1, this.quotingType = C.quotingType === '"' ? k : G, this.forceQuotes = C.forceQuotes || !1, this.replacer = typeof C.replacer == "function" ? C.replacer : null, this.implicitTypes = this.schema.compiledImplicit, this.explicitTypes = this.schema.compiledExplicit, this.tag = null, this.result = "", this.duplicates = [], this.usedDuplicates = null;
  }
  function z(C, te) {
    for (var ae = e.repeat(" ", te), se = 0, oe = -1, ge = "", de, Ee = C.length; se < Ee; )
      oe = C.indexOf(`
`, se), oe === -1 ? (de = C.slice(se), se = Ee) : (de = C.slice(se, oe + 1), se = oe + 1), de.length && de !== `
` && (ge += ae), ge += de;
    return ge;
  }
  function H(C, te) {
    return `
` + e.repeat(" ", C.indent * te);
  }
  function $(C, te) {
    var ae, se, oe;
    for (ae = 0, se = C.implicitTypes.length; ae < se; ae += 1)
      if (oe = C.implicitTypes[ae], oe.resolve(te))
        return !0;
    return !1;
  }
  function I(C) {
    return C === l || C === o;
  }
  function K(C) {
    return 32 <= C && C <= 126 || 161 <= C && C <= 55295 && C !== 8232 && C !== 8233 || 57344 <= C && C <= 65533 && C !== s || 65536 <= C && C <= 1114111;
  }
  function N(C) {
    return K(C) && C !== s && C !== a && C !== d;
  }
  function O(C, te, ae) {
    var se = N(C), oe = se && !I(C);
    return (
      // ns-plain-safe
      (ae ? (
        // c = flow-in
        se
      ) : se && C !== v && C !== A && C !== b && C !== M && C !== X) && C !== c && !(te === w && !oe) || N(te) && !I(te) && C === c || te === w && oe
    );
  }
  function Q(C) {
    return K(C) && C !== s && !I(C) && C !== m && C !== _ && C !== w && C !== v && C !== A && C !== b && C !== M && C !== X && C !== c && C !== y && C !== p && C !== n && C !== j && C !== T && C !== R && C !== E && C !== f && C !== h && C !== S && C !== x;
  }
  function V(C) {
    return !I(C) && C !== w;
  }
  function B(C, te) {
    var ae = C.charCodeAt(te), se;
    return ae >= 55296 && ae <= 56319 && te + 1 < C.length && (se = C.charCodeAt(te + 1), se >= 56320 && se <= 57343) ? (ae - 55296) * 1024 + se - 56320 + 65536 : ae;
  }
  function Y(C) {
    var te = /^\n* /;
    return te.test(C);
  }
  var Z = 1, re = 2, le = 3, Se = 4, Te = 5;
  function Fe(C, te, ae, se, oe, ge, de, Ee) {
    var _e, Re = 0, qe = null, Ve = !1, Ce = !1, Er = se !== -1, yt = -1, Zt = Q(B(C, 0)) && V(B(C, C.length - 1));
    if (te || de)
      for (_e = 0; _e < C.length; Re >= 65536 ? _e += 2 : _e++) {
        if (Re = B(C, _e), !K(Re))
          return Te;
        Zt = Zt && O(Re, qe, Ee), qe = Re;
      }
    else {
      for (_e = 0; _e < C.length; Re >= 65536 ? _e += 2 : _e++) {
        if (Re = B(C, _e), Re === d)
          Ve = !0, Er && (Ce = Ce || // Foldable line = too long, and not more-indented.
          _e - yt - 1 > se && C[yt + 1] !== " ", yt = _e);
        else if (!K(Re))
          return Te;
        Zt = Zt && O(Re, qe, Ee), qe = Re;
      }
      Ce = Ce || Er && _e - yt - 1 > se && C[yt + 1] !== " ";
    }
    return !Ve && !Ce ? Zt && !de && !oe(C) ? Z : ge === k ? Te : re : ae > 9 && Y(C) ? Te : de ? ge === k ? Te : re : Ce ? Se : le;
  }
  function He(C, te, ae, se, oe) {
    C.dump = (function() {
      if (te.length === 0)
        return C.quotingType === k ? '""' : "''";
      if (!C.noCompatMode && (D.indexOf(te) !== -1 || W.test(te)))
        return C.quotingType === k ? '"' + te + '"' : "'" + te + "'";
      var ge = C.indent * Math.max(1, ae), de = C.lineWidth === -1 ? -1 : Math.max(Math.min(C.lineWidth, 40), C.lineWidth - ge), Ee = se || C.flowLevel > -1 && ae >= C.flowLevel;
      function _e(Re) {
        return $(C, Re);
      }
      switch (Fe(
        te,
        Ee,
        C.indent,
        de,
        _e,
        C.quotingType,
        C.forceQuotes && !se,
        oe
      )) {
        case Z:
          return te;
        case re:
          return "'" + te.replace(/'/g, "''") + "'";
        case le:
          return "|" + Ge(te, C.indent) + ke(z(te, ge));
        case Se:
          return ">" + Ge(te, C.indent) + ke(z(g(te, de), ge));
        case Te:
          return '"' + ne(te) + '"';
        default:
          throw new t("impossible error: invalid scalar style");
      }
    })();
  }
  function Ge(C, te) {
    var ae = Y(C) ? String(te) : "", se = C[C.length - 1] === `
`, oe = se && (C[C.length - 2] === `
` || C === `
`), ge = oe ? "+" : se ? "" : "-";
    return ae + ge + `
`;
  }
  function ke(C) {
    return C[C.length - 1] === `
` ? C.slice(0, -1) : C;
  }
  function g(C, te) {
    for (var ae = /(\n+)([^\n]*)/g, se = (function() {
      var Re = C.indexOf(`
`);
      return Re = Re !== -1 ? Re : C.length, ae.lastIndex = Re, ee(C.slice(0, Re), te);
    })(), oe = C[0] === `
` || C[0] === " ", ge, de; de = ae.exec(C); ) {
      var Ee = de[1], _e = de[2];
      ge = _e[0] === " ", se += Ee + (!oe && !ge && _e !== "" ? `
` : "") + ee(_e, te), oe = ge;
    }
    return se;
  }
  function ee(C, te) {
    if (C === "" || C[0] === " ") return C;
    for (var ae = / [^ ]/g, se, oe = 0, ge, de = 0, Ee = 0, _e = ""; se = ae.exec(C); )
      Ee = se.index, Ee - oe > te && (ge = de > oe ? de : Ee, _e += `
` + C.slice(oe, ge), oe = ge + 1), de = Ee;
    return _e += `
`, C.length - oe > te && de > oe ? _e += C.slice(oe, de) + `
` + C.slice(de + 1) : _e += C.slice(oe), _e.slice(1);
  }
  function ne(C) {
    for (var te = "", ae = 0, se, oe = 0; oe < C.length; ae >= 65536 ? oe += 2 : oe++)
      ae = B(C, oe), se = P[ae], !se && K(ae) ? (te += C[oe], ae >= 65536 && (te += C[oe + 1])) : te += se || F(ae);
    return te;
  }
  function pe(C, te, ae) {
    var se = "", oe = C.tag, ge, de, Ee;
    for (ge = 0, de = ae.length; ge < de; ge += 1)
      Ee = ae[ge], C.replacer && (Ee = C.replacer.call(ae, String(ge), Ee)), (ye(C, te, Ee, !1, !1) || typeof Ee > "u" && ye(C, te, null, !1, !1)) && (se !== "" && (se += "," + (C.condenseFlow ? "" : " ")), se += C.dump);
    C.tag = oe, C.dump = "[" + se + "]";
  }
  function ie(C, te, ae, se) {
    var oe = "", ge = C.tag, de, Ee, _e;
    for (de = 0, Ee = ae.length; de < Ee; de += 1)
      _e = ae[de], C.replacer && (_e = C.replacer.call(ae, String(de), _e)), (ye(C, te + 1, _e, !0, !0, !1, !0) || typeof _e > "u" && ye(C, te + 1, null, !0, !0, !1, !0)) && ((!se || oe !== "") && (oe += H(C, te)), C.dump && d === C.dump.charCodeAt(0) ? oe += "-" : oe += "- ", oe += C.dump);
    C.tag = ge, C.dump = oe || "[]";
  }
  function he(C, te, ae) {
    var se = "", oe = C.tag, ge = Object.keys(ae), de, Ee, _e, Re, qe;
    for (de = 0, Ee = ge.length; de < Ee; de += 1)
      qe = "", se !== "" && (qe += ", "), C.condenseFlow && (qe += '"'), _e = ge[de], Re = ae[_e], C.replacer && (Re = C.replacer.call(ae, _e, Re)), ye(C, te, _e, !1, !1) && (C.dump.length > 1024 && (qe += "? "), qe += C.dump + (C.condenseFlow ? '"' : "") + ":" + (C.condenseFlow ? "" : " "), ye(C, te, Re, !1, !1) && (qe += C.dump, se += qe));
    C.tag = oe, C.dump = "{" + se + "}";
  }
  function ce(C, te, ae, se) {
    var oe = "", ge = C.tag, de = Object.keys(ae), Ee, _e, Re, qe, Ve, Ce;
    if (C.sortKeys === !0)
      de.sort();
    else if (typeof C.sortKeys == "function")
      de.sort(C.sortKeys);
    else if (C.sortKeys)
      throw new t("sortKeys must be a boolean or a function");
    for (Ee = 0, _e = de.length; Ee < _e; Ee += 1)
      Ce = "", (!se || oe !== "") && (Ce += H(C, te)), Re = de[Ee], qe = ae[Re], C.replacer && (qe = C.replacer.call(ae, Re, qe)), ye(C, te + 1, Re, !0, !0, !0) && (Ve = C.tag !== null && C.tag !== "?" || C.dump && C.dump.length > 1024, Ve && (C.dump && d === C.dump.charCodeAt(0) ? Ce += "?" : Ce += "? "), Ce += C.dump, Ve && (Ce += H(C, te)), ye(C, te + 1, qe, !0, Ve) && (C.dump && d === C.dump.charCodeAt(0) ? Ce += ":" : Ce += ": ", Ce += C.dump, oe += Ce));
    C.tag = ge, C.dump = oe || "{}";
  }
  function me(C, te, ae) {
    var se, oe, ge, de, Ee, _e;
    for (oe = ae ? C.explicitTypes : C.implicitTypes, ge = 0, de = oe.length; ge < de; ge += 1)
      if (Ee = oe[ge], (Ee.instanceOf || Ee.predicate) && (!Ee.instanceOf || typeof te == "object" && te instanceof Ee.instanceOf) && (!Ee.predicate || Ee.predicate(te))) {
        if (ae ? Ee.multi && Ee.representName ? C.tag = Ee.representName(te) : C.tag = Ee.tag : C.tag = "?", Ee.represent) {
          if (_e = C.styleMap[Ee.tag] || Ee.defaultStyle, r.call(Ee.represent) === "[object Function]")
            se = Ee.represent(te, _e);
          else if (u.call(Ee.represent, _e))
            se = Ee.represent[_e](te, _e);
          else
            throw new t("!<" + Ee.tag + '> tag resolver accepts not "' + _e + '" style');
          C.dump = se;
        }
        return !0;
      }
    return !1;
  }
  function ye(C, te, ae, se, oe, ge, de) {
    C.tag = null, C.dump = ae, me(C, ae, !1) || me(C, ae, !0);
    var Ee = r.call(C.dump), _e = se, Re;
    se && (se = C.flowLevel < 0 || C.flowLevel > te);
    var qe = Ee === "[object Object]" || Ee === "[object Array]", Ve, Ce;
    if (qe && (Ve = C.duplicates.indexOf(ae), Ce = Ve !== -1), (C.tag !== null && C.tag !== "?" || Ce || C.indent !== 2 && te > 0) && (oe = !1), Ce && C.usedDuplicates[Ve])
      C.dump = "*ref_" + Ve;
    else {
      if (qe && Ce && !C.usedDuplicates[Ve] && (C.usedDuplicates[Ve] = !0), Ee === "[object Object]")
        se && Object.keys(C.dump).length !== 0 ? (ce(C, te, C.dump, oe), Ce && (C.dump = "&ref_" + Ve + C.dump)) : (he(C, te, C.dump), Ce && (C.dump = "&ref_" + Ve + " " + C.dump));
      else if (Ee === "[object Array]")
        se && C.dump.length !== 0 ? (C.noArrayIndent && !de && te > 0 ? ie(C, te - 1, C.dump, oe) : ie(C, te, C.dump, oe), Ce && (C.dump = "&ref_" + Ve + C.dump)) : (pe(C, te, C.dump), Ce && (C.dump = "&ref_" + Ve + " " + C.dump));
      else if (Ee === "[object String]")
        C.tag !== "?" && He(C, C.dump, te, ge, _e);
      else {
        if (Ee === "[object Undefined]")
          return !1;
        if (C.skipInvalid) return !1;
        throw new t("unacceptable kind of an object to dump " + Ee);
      }
      C.tag !== null && C.tag !== "?" && (Re = encodeURI(
        C.tag[0] === "!" ? C.tag.slice(1) : C.tag
      ).replace(/!/g, "%21"), C.tag[0] === "!" ? Re = "!" + Re : Re.slice(0, 18) === "tag:yaml.org,2002:" ? Re = "!!" + Re.slice(18) : Re = "!<" + Re + ">", C.dump = Re + " " + C.dump);
    }
    return !0;
  }
  function $e(C, te) {
    var ae = [], se = [], oe, ge;
    for (Ie(C, ae, se), oe = 0, ge = se.length; oe < ge; oe += 1)
      te.duplicates.push(ae[se[oe]]);
    te.usedDuplicates = new Array(ge);
  }
  function Ie(C, te, ae) {
    var se, oe, ge;
    if (C !== null && typeof C == "object")
      if (oe = te.indexOf(C), oe !== -1)
        ae.indexOf(oe) === -1 && ae.push(oe);
      else if (te.push(C), Array.isArray(C))
        for (oe = 0, ge = C.length; oe < ge; oe += 1)
          Ie(C[oe], te, ae);
      else
        for (se = Object.keys(C), oe = 0, ge = se.length; oe < ge; oe += 1)
          Ie(C[se[oe]], te, ae);
  }
  function we(C, te) {
    te = te || {};
    var ae = new q(te);
    ae.noRefs || $e(C, ae);
    var se = C;
    return ae.replacer && (se = ae.replacer.call({ "": se }, "", se)), ye(ae, 0, se, !0, !0) ? ae.dump + `
` : "";
  }
  return Uo.dump = we, Uo;
}
var Bh;
function il() {
  if (Bh) return tt;
  Bh = 1;
  var e = N_(), t = $_();
  function i(r, u) {
    return function() {
      throw new Error("Function yaml." + r + " is removed in js-yaml 4. Use yaml." + u + " instead, which is now safe by default.");
    };
  }
  return tt.Type = it(), tt.Schema = Km(), tt.FAILSAFE_SCHEMA = eg(), tt.JSON_SCHEMA = ag(), tt.CORE_SCHEMA = sg(), tt.DEFAULT_SCHEMA = nl(), tt.load = e.load, tt.loadAll = e.loadAll, tt.dump = t.dump, tt.YAMLException = On(), tt.types = {
    binary: lg(),
    float: ig(),
    map: Zm(),
    null: tg(),
    pairs: fg(),
    set: dg(),
    timestamp: og(),
    bool: rg(),
    int: ng(),
    merge: ug(),
    omap: cg(),
    seq: Qm(),
    str: Jm()
  }, tt.safeLoad = i("safeLoad", "load"), tt.safeLoadAll = i("safeLoadAll", "loadAll"), tt.safeDump = i("safeDump", "dump"), tt;
}
var Jr = {}, Vh;
function I_() {
  if (Vh) return Jr;
  Vh = 1, Object.defineProperty(Jr, "__esModule", { value: !0 }), Jr.Lazy = void 0;
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
  return Jr.Lazy = e, Jr;
}
var Xi = { exports: {} }, qo, zh;
function pa() {
  if (zh) return qo;
  zh = 1;
  const e = "2.0.0", t = 256, i = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
  9007199254740991, r = 16, u = t - 6;
  return qo = {
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
  }, qo;
}
var xo, Xh;
function ma() {
  return Xh || (Xh = 1, xo = typeof process == "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...t) => console.error("SEMVER", ...t) : () => {
  }), xo;
}
var Yh;
function Nn() {
  return Yh || (Yh = 1, (function(e, t) {
    const {
      MAX_SAFE_COMPONENT_LENGTH: i,
      MAX_SAFE_BUILD_LENGTH: r,
      MAX_LENGTH: u
    } = pa(), s = ma();
    t = e.exports = {};
    const o = t.re = [], d = t.safeRe = [], a = t.src = [], l = t.safeSrc = [], n = t.t = {};
    let f = 0;
    const c = "[a-zA-Z0-9-]", h = [
      ["\\s", 1],
      ["\\d", u],
      [c, r]
    ], y = (p) => {
      for (const [v, m] of h)
        p = p.split(`${v}*`).join(`${v}{0,${m}}`).split(`${v}+`).join(`${v}{1,${m}}`);
      return p;
    }, E = (p, v, m) => {
      const w = y(v), T = f++;
      s(p, T, v), n[p] = T, a[T] = v, l[T] = w, o[T] = new RegExp(v, m ? "g" : void 0), d[T] = new RegExp(w, m ? "g" : void 0);
    };
    E("NUMERICIDENTIFIER", "0|[1-9]\\d*"), E("NUMERICIDENTIFIERLOOSE", "\\d+"), E("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${c}*`), E("MAINVERSION", `(${a[n.NUMERICIDENTIFIER]})\\.(${a[n.NUMERICIDENTIFIER]})\\.(${a[n.NUMERICIDENTIFIER]})`), E("MAINVERSIONLOOSE", `(${a[n.NUMERICIDENTIFIERLOOSE]})\\.(${a[n.NUMERICIDENTIFIERLOOSE]})\\.(${a[n.NUMERICIDENTIFIERLOOSE]})`), E("PRERELEASEIDENTIFIER", `(?:${a[n.NONNUMERICIDENTIFIER]}|${a[n.NUMERICIDENTIFIER]})`), E("PRERELEASEIDENTIFIERLOOSE", `(?:${a[n.NONNUMERICIDENTIFIER]}|${a[n.NUMERICIDENTIFIERLOOSE]})`), E("PRERELEASE", `(?:-(${a[n.PRERELEASEIDENTIFIER]}(?:\\.${a[n.PRERELEASEIDENTIFIER]})*))`), E("PRERELEASELOOSE", `(?:-?(${a[n.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${a[n.PRERELEASEIDENTIFIERLOOSE]})*))`), E("BUILDIDENTIFIER", `${c}+`), E("BUILD", `(?:\\+(${a[n.BUILDIDENTIFIER]}(?:\\.${a[n.BUILDIDENTIFIER]})*))`), E("FULLPLAIN", `v?${a[n.MAINVERSION]}${a[n.PRERELEASE]}?${a[n.BUILD]}?`), E("FULL", `^${a[n.FULLPLAIN]}$`), E("LOOSEPLAIN", `[v=\\s]*${a[n.MAINVERSIONLOOSE]}${a[n.PRERELEASELOOSE]}?${a[n.BUILD]}?`), E("LOOSE", `^${a[n.LOOSEPLAIN]}$`), E("GTLT", "((?:<|>)?=?)"), E("XRANGEIDENTIFIERLOOSE", `${a[n.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`), E("XRANGEIDENTIFIER", `${a[n.NUMERICIDENTIFIER]}|x|X|\\*`), E("XRANGEPLAIN", `[v=\\s]*(${a[n.XRANGEIDENTIFIER]})(?:\\.(${a[n.XRANGEIDENTIFIER]})(?:\\.(${a[n.XRANGEIDENTIFIER]})(?:${a[n.PRERELEASE]})?${a[n.BUILD]}?)?)?`), E("XRANGEPLAINLOOSE", `[v=\\s]*(${a[n.XRANGEIDENTIFIERLOOSE]})(?:\\.(${a[n.XRANGEIDENTIFIERLOOSE]})(?:\\.(${a[n.XRANGEIDENTIFIERLOOSE]})(?:${a[n.PRERELEASELOOSE]})?${a[n.BUILD]}?)?)?`), E("XRANGE", `^${a[n.GTLT]}\\s*${a[n.XRANGEPLAIN]}$`), E("XRANGELOOSE", `^${a[n.GTLT]}\\s*${a[n.XRANGEPLAINLOOSE]}$`), E("COERCEPLAIN", `(^|[^\\d])(\\d{1,${i}})(?:\\.(\\d{1,${i}}))?(?:\\.(\\d{1,${i}}))?`), E("COERCE", `${a[n.COERCEPLAIN]}(?:$|[^\\d])`), E("COERCEFULL", a[n.COERCEPLAIN] + `(?:${a[n.PRERELEASE]})?(?:${a[n.BUILD]})?(?:$|[^\\d])`), E("COERCERTL", a[n.COERCE], !0), E("COERCERTLFULL", a[n.COERCEFULL], !0), E("LONETILDE", "(?:~>?)"), E("TILDETRIM", `(\\s*)${a[n.LONETILDE]}\\s+`, !0), t.tildeTrimReplace = "$1~", E("TILDE", `^${a[n.LONETILDE]}${a[n.XRANGEPLAIN]}$`), E("TILDELOOSE", `^${a[n.LONETILDE]}${a[n.XRANGEPLAINLOOSE]}$`), E("LONECARET", "(?:\\^)"), E("CARETTRIM", `(\\s*)${a[n.LONECARET]}\\s+`, !0), t.caretTrimReplace = "$1^", E("CARET", `^${a[n.LONECARET]}${a[n.XRANGEPLAIN]}$`), E("CARETLOOSE", `^${a[n.LONECARET]}${a[n.XRANGEPLAINLOOSE]}$`), E("COMPARATORLOOSE", `^${a[n.GTLT]}\\s*(${a[n.LOOSEPLAIN]})$|^$`), E("COMPARATOR", `^${a[n.GTLT]}\\s*(${a[n.FULLPLAIN]})$|^$`), E("COMPARATORTRIM", `(\\s*)${a[n.GTLT]}\\s*(${a[n.LOOSEPLAIN]}|${a[n.XRANGEPLAIN]})`, !0), t.comparatorTrimReplace = "$1$2$3", E("HYPHENRANGE", `^\\s*(${a[n.XRANGEPLAIN]})\\s+-\\s+(${a[n.XRANGEPLAIN]})\\s*$`), E("HYPHENRANGELOOSE", `^\\s*(${a[n.XRANGEPLAINLOOSE]})\\s+-\\s+(${a[n.XRANGEPLAINLOOSE]})\\s*$`), E("STAR", "(<|>)?=?\\s*\\*"), E("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"), E("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
  })(Xi, Xi.exports)), Xi.exports;
}
var Mo, Wh;
function al() {
  if (Wh) return Mo;
  Wh = 1;
  const e = Object.freeze({ loose: !0 }), t = Object.freeze({});
  return Mo = (r) => r ? typeof r != "object" ? e : r : t, Mo;
}
var jo, Kh;
function hg() {
  if (Kh) return jo;
  Kh = 1;
  const e = /^[0-9]+$/, t = (r, u) => {
    if (typeof r == "number" && typeof u == "number")
      return r === u ? 0 : r < u ? -1 : 1;
    const s = e.test(r), o = e.test(u);
    return s && o && (r = +r, u = +u), r === u ? 0 : s && !o ? -1 : o && !s ? 1 : r < u ? -1 : 1;
  };
  return jo = {
    compareIdentifiers: t,
    rcompareIdentifiers: (r, u) => t(u, r)
  }, jo;
}
var Go, Jh;
function at() {
  if (Jh) return Go;
  Jh = 1;
  const e = ma(), { MAX_LENGTH: t, MAX_SAFE_INTEGER: i } = pa(), { safeRe: r, t: u } = Nn(), s = al(), { compareIdentifiers: o } = hg();
  class d {
    constructor(l, n) {
      if (n = s(n), l instanceof d) {
        if (l.loose === !!n.loose && l.includePrerelease === !!n.includePrerelease)
          return l;
        l = l.version;
      } else if (typeof l != "string")
        throw new TypeError(`Invalid version. Must be a string. Got type "${typeof l}".`);
      if (l.length > t)
        throw new TypeError(
          `version is longer than ${t} characters`
        );
      e("SemVer", l, n), this.options = n, this.loose = !!n.loose, this.includePrerelease = !!n.includePrerelease;
      const f = l.trim().match(n.loose ? r[u.LOOSE] : r[u.FULL]);
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
          const h = +c;
          if (h >= 0 && h < i)
            return h;
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
      let n = 0;
      do {
        const f = this.prerelease[n], c = l.prerelease[n];
        if (e("prerelease compare", n, f, c), f === void 0 && c === void 0)
          return 0;
        if (c === void 0)
          return 1;
        if (f === void 0)
          return -1;
        if (f === c)
          continue;
        return o(f, c);
      } while (++n);
    }
    compareBuild(l) {
      l instanceof d || (l = new d(l, this.options));
      let n = 0;
      do {
        const f = this.build[n], c = l.build[n];
        if (e("build compare", n, f, c), f === void 0 && c === void 0)
          return 0;
        if (c === void 0)
          return 1;
        if (f === void 0)
          return -1;
        if (f === c)
          continue;
        return o(f, c);
      } while (++n);
    }
    // preminor will bump the version up to the next minor release, and immediately
    // down to pre-release. premajor and prepatch work the same way.
    inc(l, n, f) {
      if (l.startsWith("pre")) {
        if (!n && f === !1)
          throw new Error("invalid increment argument: identifier is empty");
        if (n) {
          const c = `-${n}`.match(this.options.loose ? r[u.PRERELEASELOOSE] : r[u.PRERELEASE]);
          if (!c || c[1] !== n)
            throw new Error(`invalid identifier: ${n}`);
        }
      }
      switch (l) {
        case "premajor":
          this.prerelease.length = 0, this.patch = 0, this.minor = 0, this.major++, this.inc("pre", n, f);
          break;
        case "preminor":
          this.prerelease.length = 0, this.patch = 0, this.minor++, this.inc("pre", n, f);
          break;
        case "prepatch":
          this.prerelease.length = 0, this.inc("patch", n, f), this.inc("pre", n, f);
          break;
        // If the input is a non-prerelease version, this acts the same as
        // prepatch.
        case "prerelease":
          this.prerelease.length === 0 && this.inc("patch", n, f), this.inc("pre", n, f);
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
            let h = this.prerelease.length;
            for (; --h >= 0; )
              typeof this.prerelease[h] == "number" && (this.prerelease[h]++, h = -2);
            if (h === -1) {
              if (n === this.prerelease.join(".") && f === !1)
                throw new Error("invalid increment argument: identifier already exists");
              this.prerelease.push(c);
            }
          }
          if (n) {
            let h = [n, c];
            f === !1 && (h = [n]), o(this.prerelease[0], n) === 0 ? isNaN(this.prerelease[1]) && (this.prerelease = h) : this.prerelease = h;
          }
          break;
        }
        default:
          throw new Error(`invalid increment argument: ${l}`);
      }
      return this.raw = this.format(), this.build.length && (this.raw += `+${this.build.join(".")}`), this;
    }
  }
  return Go = d, Go;
}
var Ho, Qh;
function Ur() {
  if (Qh) return Ho;
  Qh = 1;
  const e = at();
  return Ho = (i, r, u = !1) => {
    if (i instanceof e)
      return i;
    try {
      return new e(i, r);
    } catch (s) {
      if (!u)
        return null;
      throw s;
    }
  }, Ho;
}
var Bo, Zh;
function P_() {
  if (Zh) return Bo;
  Zh = 1;
  const e = Ur();
  return Bo = (i, r) => {
    const u = e(i, r);
    return u ? u.version : null;
  }, Bo;
}
var Vo, ep;
function C_() {
  if (ep) return Vo;
  ep = 1;
  const e = Ur();
  return Vo = (i, r) => {
    const u = e(i.trim().replace(/^[=v]+/, ""), r);
    return u ? u.version : null;
  }, Vo;
}
var zo, tp;
function D_() {
  if (tp) return zo;
  tp = 1;
  const e = at();
  return zo = (i, r, u, s, o) => {
    typeof u == "string" && (o = s, s = u, u = void 0);
    try {
      return new e(
        i instanceof e ? i.version : i,
        u
      ).inc(r, s, o).version;
    } catch {
      return null;
    }
  }, zo;
}
var Xo, rp;
function L_() {
  if (rp) return Xo;
  rp = 1;
  const e = Ur();
  return Xo = (i, r) => {
    const u = e(i, null, !0), s = e(r, null, !0), o = u.compare(s);
    if (o === 0)
      return null;
    const d = o > 0, a = d ? u : s, l = d ? s : u, n = !!a.prerelease.length;
    if (!!l.prerelease.length && !n) {
      if (!l.patch && !l.minor)
        return "major";
      if (l.compareMain(a) === 0)
        return l.minor && !l.patch ? "minor" : "patch";
    }
    const c = n ? "pre" : "";
    return u.major !== s.major ? c + "major" : u.minor !== s.minor ? c + "minor" : u.patch !== s.patch ? c + "patch" : "prerelease";
  }, Xo;
}
var Yo, np;
function k_() {
  if (np) return Yo;
  np = 1;
  const e = at();
  return Yo = (i, r) => new e(i, r).major, Yo;
}
var Wo, ip;
function F_() {
  if (ip) return Wo;
  ip = 1;
  const e = at();
  return Wo = (i, r) => new e(i, r).minor, Wo;
}
var Ko, ap;
function U_() {
  if (ap) return Ko;
  ap = 1;
  const e = at();
  return Ko = (i, r) => new e(i, r).patch, Ko;
}
var Jo, sp;
function q_() {
  if (sp) return Jo;
  sp = 1;
  const e = Ur();
  return Jo = (i, r) => {
    const u = e(i, r);
    return u && u.prerelease.length ? u.prerelease : null;
  }, Jo;
}
var Qo, op;
function Nt() {
  if (op) return Qo;
  op = 1;
  const e = at();
  return Qo = (i, r, u) => new e(i, u).compare(new e(r, u)), Qo;
}
var Zo, up;
function x_() {
  if (up) return Zo;
  up = 1;
  const e = Nt();
  return Zo = (i, r, u) => e(r, i, u), Zo;
}
var eu, lp;
function M_() {
  if (lp) return eu;
  lp = 1;
  const e = Nt();
  return eu = (i, r) => e(i, r, !0), eu;
}
var tu, cp;
function sl() {
  if (cp) return tu;
  cp = 1;
  const e = at();
  return tu = (i, r, u) => {
    const s = new e(i, u), o = new e(r, u);
    return s.compare(o) || s.compareBuild(o);
  }, tu;
}
var ru, fp;
function j_() {
  if (fp) return ru;
  fp = 1;
  const e = sl();
  return ru = (i, r) => i.sort((u, s) => e(u, s, r)), ru;
}
var nu, dp;
function G_() {
  if (dp) return nu;
  dp = 1;
  const e = sl();
  return nu = (i, r) => i.sort((u, s) => e(s, u, r)), nu;
}
var iu, hp;
function ga() {
  if (hp) return iu;
  hp = 1;
  const e = Nt();
  return iu = (i, r, u) => e(i, r, u) > 0, iu;
}
var au, pp;
function ol() {
  if (pp) return au;
  pp = 1;
  const e = Nt();
  return au = (i, r, u) => e(i, r, u) < 0, au;
}
var su, mp;
function pg() {
  if (mp) return su;
  mp = 1;
  const e = Nt();
  return su = (i, r, u) => e(i, r, u) === 0, su;
}
var ou, gp;
function mg() {
  if (gp) return ou;
  gp = 1;
  const e = Nt();
  return ou = (i, r, u) => e(i, r, u) !== 0, ou;
}
var uu, yp;
function ul() {
  if (yp) return uu;
  yp = 1;
  const e = Nt();
  return uu = (i, r, u) => e(i, r, u) >= 0, uu;
}
var lu, Ep;
function ll() {
  if (Ep) return lu;
  Ep = 1;
  const e = Nt();
  return lu = (i, r, u) => e(i, r, u) <= 0, lu;
}
var cu, vp;
function gg() {
  if (vp) return cu;
  vp = 1;
  const e = pg(), t = mg(), i = ga(), r = ul(), u = ol(), s = ll();
  return cu = (d, a, l, n) => {
    switch (a) {
      case "===":
        return typeof d == "object" && (d = d.version), typeof l == "object" && (l = l.version), d === l;
      case "!==":
        return typeof d == "object" && (d = d.version), typeof l == "object" && (l = l.version), d !== l;
      case "":
      case "=":
      case "==":
        return e(d, l, n);
      case "!=":
        return t(d, l, n);
      case ">":
        return i(d, l, n);
      case ">=":
        return r(d, l, n);
      case "<":
        return u(d, l, n);
      case "<=":
        return s(d, l, n);
      default:
        throw new TypeError(`Invalid operator: ${a}`);
    }
  }, cu;
}
var fu, _p;
function H_() {
  if (_p) return fu;
  _p = 1;
  const e = at(), t = Ur(), { safeRe: i, t: r } = Nn();
  return fu = (s, o) => {
    if (s instanceof e)
      return s;
    if (typeof s == "number" && (s = String(s)), typeof s != "string")
      return null;
    o = o || {};
    let d = null;
    if (!o.rtl)
      d = s.match(o.includePrerelease ? i[r.COERCEFULL] : i[r.COERCE]);
    else {
      const h = o.includePrerelease ? i[r.COERCERTLFULL] : i[r.COERCERTL];
      let y;
      for (; (y = h.exec(s)) && (!d || d.index + d[0].length !== s.length); )
        (!d || y.index + y[0].length !== d.index + d[0].length) && (d = y), h.lastIndex = y.index + y[1].length + y[2].length;
      h.lastIndex = -1;
    }
    if (d === null)
      return null;
    const a = d[2], l = d[3] || "0", n = d[4] || "0", f = o.includePrerelease && d[5] ? `-${d[5]}` : "", c = o.includePrerelease && d[6] ? `+${d[6]}` : "";
    return t(`${a}.${l}.${n}${f}${c}`, o);
  }, fu;
}
var du, wp;
function B_() {
  if (wp) return du;
  wp = 1;
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
          const s = this.map.keys().next().value;
          this.delete(s);
        }
        this.map.set(i, r);
      }
      return this;
    }
  }
  return du = e, du;
}
var hu, Sp;
function $t() {
  if (Sp) return hu;
  Sp = 1;
  const e = /\s+/g;
  class t {
    constructor(D, W) {
      if (W = u(W), D instanceof t)
        return D.loose === !!W.loose && D.includePrerelease === !!W.includePrerelease ? D : new t(D.raw, W);
      if (D instanceof s)
        return this.raw = D.value, this.set = [[D]], this.formatted = void 0, this;
      if (this.options = W, this.loose = !!W.loose, this.includePrerelease = !!W.includePrerelease, this.raw = D.trim().replace(e, " "), this.set = this.raw.split("||").map((L) => this.parseRange(L.trim())).filter((L) => L.length), !this.set.length)
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      if (this.set.length > 1) {
        const L = this.set[0];
        if (this.set = this.set.filter((F) => !E(F[0])), this.set.length === 0)
          this.set = [L];
        else if (this.set.length > 1) {
          for (const F of this.set)
            if (F.length === 1 && p(F[0])) {
              this.set = [F];
              break;
            }
        }
      }
      this.formatted = void 0;
    }
    get range() {
      if (this.formatted === void 0) {
        this.formatted = "";
        for (let D = 0; D < this.set.length; D++) {
          D > 0 && (this.formatted += "||");
          const W = this.set[D];
          for (let L = 0; L < W.length; L++)
            L > 0 && (this.formatted += " "), this.formatted += W[L].toString().trim();
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
    parseRange(D) {
      const L = ((this.options.includePrerelease && h) | (this.options.loose && y)) + ":" + D, F = r.get(L);
      if (F)
        return F;
      const G = this.options.loose, k = G ? a[l.HYPHENRANGELOOSE] : a[l.HYPHENRANGE];
      D = D.replace(k, j(this.options.includePrerelease)), o("hyphen replace", D), D = D.replace(a[l.COMPARATORTRIM], n), o("comparator trim", D), D = D.replace(a[l.TILDETRIM], f), o("tilde trim", D), D = D.replace(a[l.CARETTRIM], c), o("caret trim", D);
      let q = D.split(" ").map((I) => m(I, this.options)).join(" ").split(/\s+/).map((I) => M(I, this.options));
      G && (q = q.filter((I) => (o("loose invalid filter", I, this.options), !!I.match(a[l.COMPARATORLOOSE])))), o("range list", q);
      const z = /* @__PURE__ */ new Map(), H = q.map((I) => new s(I, this.options));
      for (const I of H) {
        if (E(I))
          return [I];
        z.set(I.value, I);
      }
      z.size > 1 && z.has("") && z.delete("");
      const $ = [...z.values()];
      return r.set(L, $), $;
    }
    intersects(D, W) {
      if (!(D instanceof t))
        throw new TypeError("a Range is required");
      return this.set.some((L) => v(L, W) && D.set.some((F) => v(F, W) && L.every((G) => F.every((k) => G.intersects(k, W)))));
    }
    // if ANY of the sets match ALL of its comparators, then pass
    test(D) {
      if (!D)
        return !1;
      if (typeof D == "string")
        try {
          D = new d(D, this.options);
        } catch {
          return !1;
        }
      for (let W = 0; W < this.set.length; W++)
        if (X(this.set[W], D, this.options))
          return !0;
      return !1;
    }
  }
  hu = t;
  const i = B_(), r = new i(), u = al(), s = ya(), o = ma(), d = at(), {
    safeRe: a,
    t: l,
    comparatorTrimReplace: n,
    tildeTrimReplace: f,
    caretTrimReplace: c
  } = Nn(), { FLAG_INCLUDE_PRERELEASE: h, FLAG_LOOSE: y } = pa(), E = (P) => P.value === "<0.0.0-0", p = (P) => P.value === "", v = (P, D) => {
    let W = !0;
    const L = P.slice();
    let F = L.pop();
    for (; W && L.length; )
      W = L.every((G) => F.intersects(G, D)), F = L.pop();
    return W;
  }, m = (P, D) => (P = P.replace(a[l.BUILD], ""), o("comp", P, D), P = _(P, D), o("caret", P), P = T(P, D), o("tildes", P), P = A(P, D), o("xrange", P), P = x(P, D), o("stars", P), P), w = (P) => !P || P.toLowerCase() === "x" || P === "*", T = (P, D) => P.trim().split(/\s+/).map((W) => R(W, D)).join(" "), R = (P, D) => {
    const W = D.loose ? a[l.TILDELOOSE] : a[l.TILDE];
    return P.replace(W, (L, F, G, k, q) => {
      o("tilde", P, L, F, G, k, q);
      let z;
      return w(F) ? z = "" : w(G) ? z = `>=${F}.0.0 <${+F + 1}.0.0-0` : w(k) ? z = `>=${F}.${G}.0 <${F}.${+G + 1}.0-0` : q ? (o("replaceTilde pr", q), z = `>=${F}.${G}.${k}-${q} <${F}.${+G + 1}.0-0`) : z = `>=${F}.${G}.${k} <${F}.${+G + 1}.0-0`, o("tilde return", z), z;
    });
  }, _ = (P, D) => P.trim().split(/\s+/).map((W) => S(W, D)).join(" "), S = (P, D) => {
    o("caret", P, D);
    const W = D.loose ? a[l.CARETLOOSE] : a[l.CARET], L = D.includePrerelease ? "-0" : "";
    return P.replace(W, (F, G, k, q, z) => {
      o("caret", P, F, G, k, q, z);
      let H;
      return w(G) ? H = "" : w(k) ? H = `>=${G}.0.0${L} <${+G + 1}.0.0-0` : w(q) ? G === "0" ? H = `>=${G}.${k}.0${L} <${G}.${+k + 1}.0-0` : H = `>=${G}.${k}.0${L} <${+G + 1}.0.0-0` : z ? (o("replaceCaret pr", z), G === "0" ? k === "0" ? H = `>=${G}.${k}.${q}-${z} <${G}.${k}.${+q + 1}-0` : H = `>=${G}.${k}.${q}-${z} <${G}.${+k + 1}.0-0` : H = `>=${G}.${k}.${q}-${z} <${+G + 1}.0.0-0`) : (o("no pr"), G === "0" ? k === "0" ? H = `>=${G}.${k}.${q}${L} <${G}.${k}.${+q + 1}-0` : H = `>=${G}.${k}.${q}${L} <${G}.${+k + 1}.0-0` : H = `>=${G}.${k}.${q} <${+G + 1}.0.0-0`), o("caret return", H), H;
    });
  }, A = (P, D) => (o("replaceXRanges", P, D), P.split(/\s+/).map((W) => b(W, D)).join(" ")), b = (P, D) => {
    P = P.trim();
    const W = D.loose ? a[l.XRANGELOOSE] : a[l.XRANGE];
    return P.replace(W, (L, F, G, k, q, z) => {
      o("xRange", P, L, F, G, k, q, z);
      const H = w(G), $ = H || w(k), I = $ || w(q), K = I;
      return F === "=" && K && (F = ""), z = D.includePrerelease ? "-0" : "", H ? F === ">" || F === "<" ? L = "<0.0.0-0" : L = "*" : F && K ? ($ && (k = 0), q = 0, F === ">" ? (F = ">=", $ ? (G = +G + 1, k = 0, q = 0) : (k = +k + 1, q = 0)) : F === "<=" && (F = "<", $ ? G = +G + 1 : k = +k + 1), F === "<" && (z = "-0"), L = `${F + G}.${k}.${q}${z}`) : $ ? L = `>=${G}.0.0${z} <${+G + 1}.0.0-0` : I && (L = `>=${G}.${k}.0${z} <${G}.${+k + 1}.0-0`), o("xRange return", L), L;
    });
  }, x = (P, D) => (o("replaceStars", P, D), P.trim().replace(a[l.STAR], "")), M = (P, D) => (o("replaceGTE0", P, D), P.trim().replace(a[D.includePrerelease ? l.GTE0PRE : l.GTE0], "")), j = (P) => (D, W, L, F, G, k, q, z, H, $, I, K) => (w(L) ? W = "" : w(F) ? W = `>=${L}.0.0${P ? "-0" : ""}` : w(G) ? W = `>=${L}.${F}.0${P ? "-0" : ""}` : k ? W = `>=${W}` : W = `>=${W}${P ? "-0" : ""}`, w(H) ? z = "" : w($) ? z = `<${+H + 1}.0.0-0` : w(I) ? z = `<${H}.${+$ + 1}.0-0` : K ? z = `<=${H}.${$}.${I}-${K}` : P ? z = `<${H}.${$}.${+I + 1}-0` : z = `<=${z}`, `${W} ${z}`.trim()), X = (P, D, W) => {
    for (let L = 0; L < P.length; L++)
      if (!P[L].test(D))
        return !1;
    if (D.prerelease.length && !W.includePrerelease) {
      for (let L = 0; L < P.length; L++)
        if (o(P[L].semver), P[L].semver !== s.ANY && P[L].semver.prerelease.length > 0) {
          const F = P[L].semver;
          if (F.major === D.major && F.minor === D.minor && F.patch === D.patch)
            return !0;
        }
      return !1;
    }
    return !0;
  };
  return hu;
}
var pu, Tp;
function ya() {
  if (Tp) return pu;
  Tp = 1;
  const e = /* @__PURE__ */ Symbol("SemVer ANY");
  class t {
    static get ANY() {
      return e;
    }
    constructor(n, f) {
      if (f = i(f), n instanceof t) {
        if (n.loose === !!f.loose)
          return n;
        n = n.value;
      }
      n = n.trim().split(/\s+/).join(" "), o("comparator", n, f), this.options = f, this.loose = !!f.loose, this.parse(n), this.semver === e ? this.value = "" : this.value = this.operator + this.semver.version, o("comp", this);
    }
    parse(n) {
      const f = this.options.loose ? r[u.COMPARATORLOOSE] : r[u.COMPARATOR], c = n.match(f);
      if (!c)
        throw new TypeError(`Invalid comparator: ${n}`);
      this.operator = c[1] !== void 0 ? c[1] : "", this.operator === "=" && (this.operator = ""), c[2] ? this.semver = new d(c[2], this.options.loose) : this.semver = e;
    }
    toString() {
      return this.value;
    }
    test(n) {
      if (o("Comparator.test", n, this.options.loose), this.semver === e || n === e)
        return !0;
      if (typeof n == "string")
        try {
          n = new d(n, this.options);
        } catch {
          return !1;
        }
      return s(n, this.operator, this.semver, this.options);
    }
    intersects(n, f) {
      if (!(n instanceof t))
        throw new TypeError("a Comparator is required");
      return this.operator === "" ? this.value === "" ? !0 : new a(n.value, f).test(this.value) : n.operator === "" ? n.value === "" ? !0 : new a(this.value, f).test(n.semver) : (f = i(f), f.includePrerelease && (this.value === "<0.0.0-0" || n.value === "<0.0.0-0") || !f.includePrerelease && (this.value.startsWith("<0.0.0") || n.value.startsWith("<0.0.0")) ? !1 : !!(this.operator.startsWith(">") && n.operator.startsWith(">") || this.operator.startsWith("<") && n.operator.startsWith("<") || this.semver.version === n.semver.version && this.operator.includes("=") && n.operator.includes("=") || s(this.semver, "<", n.semver, f) && this.operator.startsWith(">") && n.operator.startsWith("<") || s(this.semver, ">", n.semver, f) && this.operator.startsWith("<") && n.operator.startsWith(">")));
    }
  }
  pu = t;
  const i = al(), { safeRe: r, t: u } = Nn(), s = gg(), o = ma(), d = at(), a = $t();
  return pu;
}
var mu, Rp;
function Ea() {
  if (Rp) return mu;
  Rp = 1;
  const e = $t();
  return mu = (i, r, u) => {
    try {
      r = new e(r, u);
    } catch {
      return !1;
    }
    return r.test(i);
  }, mu;
}
var gu, bp;
function V_() {
  if (bp) return gu;
  bp = 1;
  const e = $t();
  return gu = (i, r) => new e(i, r).set.map((u) => u.map((s) => s.value).join(" ").trim().split(" ")), gu;
}
var yu, Ap;
function z_() {
  if (Ap) return yu;
  Ap = 1;
  const e = at(), t = $t();
  return yu = (r, u, s) => {
    let o = null, d = null, a = null;
    try {
      a = new t(u, s);
    } catch {
      return null;
    }
    return r.forEach((l) => {
      a.test(l) && (!o || d.compare(l) === -1) && (o = l, d = new e(o, s));
    }), o;
  }, yu;
}
var Eu, Op;
function X_() {
  if (Op) return Eu;
  Op = 1;
  const e = at(), t = $t();
  return Eu = (r, u, s) => {
    let o = null, d = null, a = null;
    try {
      a = new t(u, s);
    } catch {
      return null;
    }
    return r.forEach((l) => {
      a.test(l) && (!o || d.compare(l) === 1) && (o = l, d = new e(o, s));
    }), o;
  }, Eu;
}
var vu, Np;
function Y_() {
  if (Np) return vu;
  Np = 1;
  const e = at(), t = $t(), i = ga();
  return vu = (u, s) => {
    u = new t(u, s);
    let o = new e("0.0.0");
    if (u.test(o) || (o = new e("0.0.0-0"), u.test(o)))
      return o;
    o = null;
    for (let d = 0; d < u.set.length; ++d) {
      const a = u.set[d];
      let l = null;
      a.forEach((n) => {
        const f = new e(n.semver.version);
        switch (n.operator) {
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
            throw new Error(`Unexpected operation: ${n.operator}`);
        }
      }), l && (!o || i(o, l)) && (o = l);
    }
    return o && u.test(o) ? o : null;
  }, vu;
}
var _u, $p;
function W_() {
  if ($p) return _u;
  $p = 1;
  const e = $t();
  return _u = (i, r) => {
    try {
      return new e(i, r).range || "*";
    } catch {
      return null;
    }
  }, _u;
}
var wu, Ip;
function cl() {
  if (Ip) return wu;
  Ip = 1;
  const e = at(), t = ya(), { ANY: i } = t, r = $t(), u = Ea(), s = ga(), o = ol(), d = ll(), a = ul();
  return wu = (n, f, c, h) => {
    n = new e(n, h), f = new r(f, h);
    let y, E, p, v, m;
    switch (c) {
      case ">":
        y = s, E = d, p = o, v = ">", m = ">=";
        break;
      case "<":
        y = o, E = a, p = s, v = "<", m = "<=";
        break;
      default:
        throw new TypeError('Must provide a hilo val of "<" or ">"');
    }
    if (u(n, f, h))
      return !1;
    for (let w = 0; w < f.set.length; ++w) {
      const T = f.set[w];
      let R = null, _ = null;
      if (T.forEach((S) => {
        S.semver === i && (S = new t(">=0.0.0")), R = R || S, _ = _ || S, y(S.semver, R.semver, h) ? R = S : p(S.semver, _.semver, h) && (_ = S);
      }), R.operator === v || R.operator === m || (!_.operator || _.operator === v) && E(n, _.semver))
        return !1;
      if (_.operator === m && p(n, _.semver))
        return !1;
    }
    return !0;
  }, wu;
}
var Su, Pp;
function K_() {
  if (Pp) return Su;
  Pp = 1;
  const e = cl();
  return Su = (i, r, u) => e(i, r, ">", u), Su;
}
var Tu, Cp;
function J_() {
  if (Cp) return Tu;
  Cp = 1;
  const e = cl();
  return Tu = (i, r, u) => e(i, r, "<", u), Tu;
}
var Ru, Dp;
function Q_() {
  if (Dp) return Ru;
  Dp = 1;
  const e = $t();
  return Ru = (i, r, u) => (i = new e(i, u), r = new e(r, u), i.intersects(r, u)), Ru;
}
var bu, Lp;
function Z_() {
  if (Lp) return bu;
  Lp = 1;
  const e = Ea(), t = Nt();
  return bu = (i, r, u) => {
    const s = [];
    let o = null, d = null;
    const a = i.sort((c, h) => t(c, h, u));
    for (const c of a)
      e(c, r, u) ? (d = c, o || (o = c)) : (d && s.push([o, d]), d = null, o = null);
    o && s.push([o, null]);
    const l = [];
    for (const [c, h] of s)
      c === h ? l.push(c) : !h && c === a[0] ? l.push("*") : h ? c === a[0] ? l.push(`<=${h}`) : l.push(`${c} - ${h}`) : l.push(`>=${c}`);
    const n = l.join(" || "), f = typeof r.raw == "string" ? r.raw : String(r);
    return n.length < f.length ? n : r;
  }, bu;
}
var Au, kp;
function ew() {
  if (kp) return Au;
  kp = 1;
  const e = $t(), t = ya(), { ANY: i } = t, r = Ea(), u = Nt(), s = (f, c, h = {}) => {
    if (f === c)
      return !0;
    f = new e(f, h), c = new e(c, h);
    let y = !1;
    e: for (const E of f.set) {
      for (const p of c.set) {
        const v = a(E, p, h);
        if (y = y || v !== null, v)
          continue e;
      }
      if (y)
        return !1;
    }
    return !0;
  }, o = [new t(">=0.0.0-0")], d = [new t(">=0.0.0")], a = (f, c, h) => {
    if (f === c)
      return !0;
    if (f.length === 1 && f[0].semver === i) {
      if (c.length === 1 && c[0].semver === i)
        return !0;
      h.includePrerelease ? f = o : f = d;
    }
    if (c.length === 1 && c[0].semver === i) {
      if (h.includePrerelease)
        return !0;
      c = d;
    }
    const y = /* @__PURE__ */ new Set();
    let E, p;
    for (const A of f)
      A.operator === ">" || A.operator === ">=" ? E = l(E, A, h) : A.operator === "<" || A.operator === "<=" ? p = n(p, A, h) : y.add(A.semver);
    if (y.size > 1)
      return null;
    let v;
    if (E && p) {
      if (v = u(E.semver, p.semver, h), v > 0)
        return null;
      if (v === 0 && (E.operator !== ">=" || p.operator !== "<="))
        return null;
    }
    for (const A of y) {
      if (E && !r(A, String(E), h) || p && !r(A, String(p), h))
        return null;
      for (const b of c)
        if (!r(A, String(b), h))
          return !1;
      return !0;
    }
    let m, w, T, R, _ = p && !h.includePrerelease && p.semver.prerelease.length ? p.semver : !1, S = E && !h.includePrerelease && E.semver.prerelease.length ? E.semver : !1;
    _ && _.prerelease.length === 1 && p.operator === "<" && _.prerelease[0] === 0 && (_ = !1);
    for (const A of c) {
      if (R = R || A.operator === ">" || A.operator === ">=", T = T || A.operator === "<" || A.operator === "<=", E) {
        if (S && A.semver.prerelease && A.semver.prerelease.length && A.semver.major === S.major && A.semver.minor === S.minor && A.semver.patch === S.patch && (S = !1), A.operator === ">" || A.operator === ">=") {
          if (m = l(E, A, h), m === A && m !== E)
            return !1;
        } else if (E.operator === ">=" && !r(E.semver, String(A), h))
          return !1;
      }
      if (p) {
        if (_ && A.semver.prerelease && A.semver.prerelease.length && A.semver.major === _.major && A.semver.minor === _.minor && A.semver.patch === _.patch && (_ = !1), A.operator === "<" || A.operator === "<=") {
          if (w = n(p, A, h), w === A && w !== p)
            return !1;
        } else if (p.operator === "<=" && !r(p.semver, String(A), h))
          return !1;
      }
      if (!A.operator && (p || E) && v !== 0)
        return !1;
    }
    return !(E && T && !p && v !== 0 || p && R && !E && v !== 0 || S || _);
  }, l = (f, c, h) => {
    if (!f)
      return c;
    const y = u(f.semver, c.semver, h);
    return y > 0 ? f : y < 0 || c.operator === ">" && f.operator === ">=" ? c : f;
  }, n = (f, c, h) => {
    if (!f)
      return c;
    const y = u(f.semver, c.semver, h);
    return y < 0 ? f : y > 0 || c.operator === "<" && f.operator === "<=" ? c : f;
  };
  return Au = s, Au;
}
var Ou, Fp;
function yg() {
  if (Fp) return Ou;
  Fp = 1;
  const e = Nn(), t = pa(), i = at(), r = hg(), u = Ur(), s = P_(), o = C_(), d = D_(), a = L_(), l = k_(), n = F_(), f = U_(), c = q_(), h = Nt(), y = x_(), E = M_(), p = sl(), v = j_(), m = G_(), w = ga(), T = ol(), R = pg(), _ = mg(), S = ul(), A = ll(), b = gg(), x = H_(), M = ya(), j = $t(), X = Ea(), P = V_(), D = z_(), W = X_(), L = Y_(), F = W_(), G = cl(), k = K_(), q = J_(), z = Q_(), H = Z_(), $ = ew();
  return Ou = {
    parse: u,
    valid: s,
    clean: o,
    inc: d,
    diff: a,
    major: l,
    minor: n,
    patch: f,
    prerelease: c,
    compare: h,
    rcompare: y,
    compareLoose: E,
    compareBuild: p,
    sort: v,
    rsort: m,
    gt: w,
    lt: T,
    eq: R,
    neq: _,
    gte: S,
    lte: A,
    cmp: b,
    coerce: x,
    Comparator: M,
    Range: j,
    satisfies: X,
    toComparators: P,
    maxSatisfying: D,
    minSatisfying: W,
    minVersion: L,
    validRange: F,
    outside: G,
    gtr: k,
    ltr: q,
    intersects: z,
    simplifyRange: H,
    subset: $,
    SemVer: i,
    re: e.re,
    src: e.src,
    tokens: e.t,
    SEMVER_SPEC_VERSION: t.SEMVER_SPEC_VERSION,
    RELEASE_TYPES: t.RELEASE_TYPES,
    compareIdentifiers: r.compareIdentifiers,
    rcompareIdentifiers: r.rcompareIdentifiers
  }, Ou;
}
var Tr = {}, yn = { exports: {} };
yn.exports;
var Up;
function tw() {
  return Up || (Up = 1, (function(e, t) {
    var i = 200, r = "__lodash_hash_undefined__", u = 1, s = 2, o = 9007199254740991, d = "[object Arguments]", a = "[object Array]", l = "[object AsyncFunction]", n = "[object Boolean]", f = "[object Date]", c = "[object Error]", h = "[object Function]", y = "[object GeneratorFunction]", E = "[object Map]", p = "[object Number]", v = "[object Null]", m = "[object Object]", w = "[object Promise]", T = "[object Proxy]", R = "[object RegExp]", _ = "[object Set]", S = "[object String]", A = "[object Symbol]", b = "[object Undefined]", x = "[object WeakMap]", M = "[object ArrayBuffer]", j = "[object DataView]", X = "[object Float32Array]", P = "[object Float64Array]", D = "[object Int8Array]", W = "[object Int16Array]", L = "[object Int32Array]", F = "[object Uint8Array]", G = "[object Uint8ClampedArray]", k = "[object Uint16Array]", q = "[object Uint32Array]", z = /[\\^$.*+?()[\]{}|]/g, H = /^\[object .+?Constructor\]$/, $ = /^(?:0|[1-9]\d*)$/, I = {};
    I[X] = I[P] = I[D] = I[W] = I[L] = I[F] = I[G] = I[k] = I[q] = !0, I[d] = I[a] = I[M] = I[n] = I[j] = I[f] = I[c] = I[h] = I[E] = I[p] = I[m] = I[R] = I[_] = I[S] = I[x] = !1;
    var K = typeof Tt == "object" && Tt && Tt.Object === Object && Tt, N = typeof self == "object" && self && self.Object === Object && self, O = K || N || Function("return this")(), Q = t && !t.nodeType && t, V = Q && !0 && e && !e.nodeType && e, B = V && V.exports === Q, Y = B && K.process, Z = (function() {
      try {
        return Y && Y.binding && Y.binding("util");
      } catch {
      }
    })(), re = Z && Z.isTypedArray;
    function le(U, J) {
      for (var ue = -1, ve = U == null ? 0 : U.length, Me = 0, be = []; ++ue < ve; ) {
        var ze = U[ue];
        J(ze, ue, U) && (be[Me++] = ze);
      }
      return be;
    }
    function Se(U, J) {
      for (var ue = -1, ve = J.length, Me = U.length; ++ue < ve; )
        U[Me + ue] = J[ue];
      return U;
    }
    function Te(U, J) {
      for (var ue = -1, ve = U == null ? 0 : U.length; ++ue < ve; )
        if (J(U[ue], ue, U))
          return !0;
      return !1;
    }
    function Fe(U, J) {
      for (var ue = -1, ve = Array(U); ++ue < U; )
        ve[ue] = J(ue);
      return ve;
    }
    function He(U) {
      return function(J) {
        return U(J);
      };
    }
    function Ge(U, J) {
      return U.has(J);
    }
    function ke(U, J) {
      return U?.[J];
    }
    function g(U) {
      var J = -1, ue = Array(U.size);
      return U.forEach(function(ve, Me) {
        ue[++J] = [Me, ve];
      }), ue;
    }
    function ee(U, J) {
      return function(ue) {
        return U(J(ue));
      };
    }
    function ne(U) {
      var J = -1, ue = Array(U.size);
      return U.forEach(function(ve) {
        ue[++J] = ve;
      }), ue;
    }
    var pe = Array.prototype, ie = Function.prototype, he = Object.prototype, ce = O["__core-js_shared__"], me = ie.toString, ye = he.hasOwnProperty, $e = (function() {
      var U = /[^.]+$/.exec(ce && ce.keys && ce.keys.IE_PROTO || "");
      return U ? "Symbol(src)_1." + U : "";
    })(), Ie = he.toString, we = RegExp(
      "^" + me.call(ye).replace(z, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
    ), C = B ? O.Buffer : void 0, te = O.Symbol, ae = O.Uint8Array, se = he.propertyIsEnumerable, oe = pe.splice, ge = te ? te.toStringTag : void 0, de = Object.getOwnPropertySymbols, Ee = C ? C.isBuffer : void 0, _e = ee(Object.keys, Object), Re = vr(O, "DataView"), qe = vr(O, "Map"), Ve = vr(O, "Promise"), Ce = vr(O, "Set"), Er = vr(O, "WeakMap"), yt = vr(Object, "create"), Zt = rr(Re), Ng = rr(qe), $g = rr(Ve), Ig = rr(Ce), Pg = rr(Er), yl = te ? te.prototype : void 0, va = yl ? yl.valueOf : void 0;
    function er(U) {
      var J = -1, ue = U == null ? 0 : U.length;
      for (this.clear(); ++J < ue; ) {
        var ve = U[J];
        this.set(ve[0], ve[1]);
      }
    }
    function Cg() {
      this.__data__ = yt ? yt(null) : {}, this.size = 0;
    }
    function Dg(U) {
      var J = this.has(U) && delete this.__data__[U];
      return this.size -= J ? 1 : 0, J;
    }
    function Lg(U) {
      var J = this.__data__;
      if (yt) {
        var ue = J[U];
        return ue === r ? void 0 : ue;
      }
      return ye.call(J, U) ? J[U] : void 0;
    }
    function kg(U) {
      var J = this.__data__;
      return yt ? J[U] !== void 0 : ye.call(J, U);
    }
    function Fg(U, J) {
      var ue = this.__data__;
      return this.size += this.has(U) ? 0 : 1, ue[U] = yt && J === void 0 ? r : J, this;
    }
    er.prototype.clear = Cg, er.prototype.delete = Dg, er.prototype.get = Lg, er.prototype.has = kg, er.prototype.set = Fg;
    function Ct(U) {
      var J = -1, ue = U == null ? 0 : U.length;
      for (this.clear(); ++J < ue; ) {
        var ve = U[J];
        this.set(ve[0], ve[1]);
      }
    }
    function Ug() {
      this.__data__ = [], this.size = 0;
    }
    function qg(U) {
      var J = this.__data__, ue = In(J, U);
      if (ue < 0)
        return !1;
      var ve = J.length - 1;
      return ue == ve ? J.pop() : oe.call(J, ue, 1), --this.size, !0;
    }
    function xg(U) {
      var J = this.__data__, ue = In(J, U);
      return ue < 0 ? void 0 : J[ue][1];
    }
    function Mg(U) {
      return In(this.__data__, U) > -1;
    }
    function jg(U, J) {
      var ue = this.__data__, ve = In(ue, U);
      return ve < 0 ? (++this.size, ue.push([U, J])) : ue[ve][1] = J, this;
    }
    Ct.prototype.clear = Ug, Ct.prototype.delete = qg, Ct.prototype.get = xg, Ct.prototype.has = Mg, Ct.prototype.set = jg;
    function tr(U) {
      var J = -1, ue = U == null ? 0 : U.length;
      for (this.clear(); ++J < ue; ) {
        var ve = U[J];
        this.set(ve[0], ve[1]);
      }
    }
    function Gg() {
      this.size = 0, this.__data__ = {
        hash: new er(),
        map: new (qe || Ct)(),
        string: new er()
      };
    }
    function Hg(U) {
      var J = Pn(this, U).delete(U);
      return this.size -= J ? 1 : 0, J;
    }
    function Bg(U) {
      return Pn(this, U).get(U);
    }
    function Vg(U) {
      return Pn(this, U).has(U);
    }
    function zg(U, J) {
      var ue = Pn(this, U), ve = ue.size;
      return ue.set(U, J), this.size += ue.size == ve ? 0 : 1, this;
    }
    tr.prototype.clear = Gg, tr.prototype.delete = Hg, tr.prototype.get = Bg, tr.prototype.has = Vg, tr.prototype.set = zg;
    function $n(U) {
      var J = -1, ue = U == null ? 0 : U.length;
      for (this.__data__ = new tr(); ++J < ue; )
        this.add(U[J]);
    }
    function Xg(U) {
      return this.__data__.set(U, r), this;
    }
    function Yg(U) {
      return this.__data__.has(U);
    }
    $n.prototype.add = $n.prototype.push = Xg, $n.prototype.has = Yg;
    function Mt(U) {
      var J = this.__data__ = new Ct(U);
      this.size = J.size;
    }
    function Wg() {
      this.__data__ = new Ct(), this.size = 0;
    }
    function Kg(U) {
      var J = this.__data__, ue = J.delete(U);
      return this.size = J.size, ue;
    }
    function Jg(U) {
      return this.__data__.get(U);
    }
    function Qg(U) {
      return this.__data__.has(U);
    }
    function Zg(U, J) {
      var ue = this.__data__;
      if (ue instanceof Ct) {
        var ve = ue.__data__;
        if (!qe || ve.length < i - 1)
          return ve.push([U, J]), this.size = ++ue.size, this;
        ue = this.__data__ = new tr(ve);
      }
      return ue.set(U, J), this.size = ue.size, this;
    }
    Mt.prototype.clear = Wg, Mt.prototype.delete = Kg, Mt.prototype.get = Jg, Mt.prototype.has = Qg, Mt.prototype.set = Zg;
    function ey(U, J) {
      var ue = Cn(U), ve = !ue && my(U), Me = !ue && !ve && _a(U), be = !ue && !ve && !Me && Al(U), ze = ue || ve || Me || be, We = ze ? Fe(U.length, String) : [], Ke = We.length;
      for (var Be in U)
        ye.call(U, Be) && !(ze && // Safari 9 has enumerable `arguments.length` in strict mode.
        (Be == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
        Me && (Be == "offset" || Be == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
        be && (Be == "buffer" || Be == "byteLength" || Be == "byteOffset") || // Skip index properties.
        cy(Be, Ke))) && We.push(Be);
      return We;
    }
    function In(U, J) {
      for (var ue = U.length; ue--; )
        if (Sl(U[ue][0], J))
          return ue;
      return -1;
    }
    function ty(U, J, ue) {
      var ve = J(U);
      return Cn(U) ? ve : Se(ve, ue(U));
    }
    function xr(U) {
      return U == null ? U === void 0 ? b : v : ge && ge in Object(U) ? uy(U) : py(U);
    }
    function El(U) {
      return Mr(U) && xr(U) == d;
    }
    function vl(U, J, ue, ve, Me) {
      return U === J ? !0 : U == null || J == null || !Mr(U) && !Mr(J) ? U !== U && J !== J : ry(U, J, ue, ve, vl, Me);
    }
    function ry(U, J, ue, ve, Me, be) {
      var ze = Cn(U), We = Cn(J), Ke = ze ? a : jt(U), Be = We ? a : jt(J);
      Ke = Ke == d ? m : Ke, Be = Be == d ? m : Be;
      var lt = Ke == m, Et = Be == m, Ze = Ke == Be;
      if (Ze && _a(U)) {
        if (!_a(J))
          return !1;
        ze = !0, lt = !1;
      }
      if (Ze && !lt)
        return be || (be = new Mt()), ze || Al(U) ? _l(U, J, ue, ve, Me, be) : sy(U, J, Ke, ue, ve, Me, be);
      if (!(ue & u)) {
        var ht = lt && ye.call(U, "__wrapped__"), pt = Et && ye.call(J, "__wrapped__");
        if (ht || pt) {
          var Gt = ht ? U.value() : U, Dt = pt ? J.value() : J;
          return be || (be = new Mt()), Me(Gt, Dt, ue, ve, be);
        }
      }
      return Ze ? (be || (be = new Mt()), oy(U, J, ue, ve, Me, be)) : !1;
    }
    function ny(U) {
      if (!bl(U) || dy(U))
        return !1;
      var J = Tl(U) ? we : H;
      return J.test(rr(U));
    }
    function iy(U) {
      return Mr(U) && Rl(U.length) && !!I[xr(U)];
    }
    function ay(U) {
      if (!hy(U))
        return _e(U);
      var J = [];
      for (var ue in Object(U))
        ye.call(U, ue) && ue != "constructor" && J.push(ue);
      return J;
    }
    function _l(U, J, ue, ve, Me, be) {
      var ze = ue & u, We = U.length, Ke = J.length;
      if (We != Ke && !(ze && Ke > We))
        return !1;
      var Be = be.get(U);
      if (Be && be.get(J))
        return Be == J;
      var lt = -1, Et = !0, Ze = ue & s ? new $n() : void 0;
      for (be.set(U, J), be.set(J, U); ++lt < We; ) {
        var ht = U[lt], pt = J[lt];
        if (ve)
          var Gt = ze ? ve(pt, ht, lt, J, U, be) : ve(ht, pt, lt, U, J, be);
        if (Gt !== void 0) {
          if (Gt)
            continue;
          Et = !1;
          break;
        }
        if (Ze) {
          if (!Te(J, function(Dt, nr) {
            if (!Ge(Ze, nr) && (ht === Dt || Me(ht, Dt, ue, ve, be)))
              return Ze.push(nr);
          })) {
            Et = !1;
            break;
          }
        } else if (!(ht === pt || Me(ht, pt, ue, ve, be))) {
          Et = !1;
          break;
        }
      }
      return be.delete(U), be.delete(J), Et;
    }
    function sy(U, J, ue, ve, Me, be, ze) {
      switch (ue) {
        case j:
          if (U.byteLength != J.byteLength || U.byteOffset != J.byteOffset)
            return !1;
          U = U.buffer, J = J.buffer;
        case M:
          return !(U.byteLength != J.byteLength || !be(new ae(U), new ae(J)));
        case n:
        case f:
        case p:
          return Sl(+U, +J);
        case c:
          return U.name == J.name && U.message == J.message;
        case R:
        case S:
          return U == J + "";
        case E:
          var We = g;
        case _:
          var Ke = ve & u;
          if (We || (We = ne), U.size != J.size && !Ke)
            return !1;
          var Be = ze.get(U);
          if (Be)
            return Be == J;
          ve |= s, ze.set(U, J);
          var lt = _l(We(U), We(J), ve, Me, be, ze);
          return ze.delete(U), lt;
        case A:
          if (va)
            return va.call(U) == va.call(J);
      }
      return !1;
    }
    function oy(U, J, ue, ve, Me, be) {
      var ze = ue & u, We = wl(U), Ke = We.length, Be = wl(J), lt = Be.length;
      if (Ke != lt && !ze)
        return !1;
      for (var Et = Ke; Et--; ) {
        var Ze = We[Et];
        if (!(ze ? Ze in J : ye.call(J, Ze)))
          return !1;
      }
      var ht = be.get(U);
      if (ht && be.get(J))
        return ht == J;
      var pt = !0;
      be.set(U, J), be.set(J, U);
      for (var Gt = ze; ++Et < Ke; ) {
        Ze = We[Et];
        var Dt = U[Ze], nr = J[Ze];
        if (ve)
          var Ol = ze ? ve(nr, Dt, Ze, J, U, be) : ve(Dt, nr, Ze, U, J, be);
        if (!(Ol === void 0 ? Dt === nr || Me(Dt, nr, ue, ve, be) : Ol)) {
          pt = !1;
          break;
        }
        Gt || (Gt = Ze == "constructor");
      }
      if (pt && !Gt) {
        var Dn = U.constructor, Ln = J.constructor;
        Dn != Ln && "constructor" in U && "constructor" in J && !(typeof Dn == "function" && Dn instanceof Dn && typeof Ln == "function" && Ln instanceof Ln) && (pt = !1);
      }
      return be.delete(U), be.delete(J), pt;
    }
    function wl(U) {
      return ty(U, Ey, ly);
    }
    function Pn(U, J) {
      var ue = U.__data__;
      return fy(J) ? ue[typeof J == "string" ? "string" : "hash"] : ue.map;
    }
    function vr(U, J) {
      var ue = ke(U, J);
      return ny(ue) ? ue : void 0;
    }
    function uy(U) {
      var J = ye.call(U, ge), ue = U[ge];
      try {
        U[ge] = void 0;
        var ve = !0;
      } catch {
      }
      var Me = Ie.call(U);
      return ve && (J ? U[ge] = ue : delete U[ge]), Me;
    }
    var ly = de ? function(U) {
      return U == null ? [] : (U = Object(U), le(de(U), function(J) {
        return se.call(U, J);
      }));
    } : vy, jt = xr;
    (Re && jt(new Re(new ArrayBuffer(1))) != j || qe && jt(new qe()) != E || Ve && jt(Ve.resolve()) != w || Ce && jt(new Ce()) != _ || Er && jt(new Er()) != x) && (jt = function(U) {
      var J = xr(U), ue = J == m ? U.constructor : void 0, ve = ue ? rr(ue) : "";
      if (ve)
        switch (ve) {
          case Zt:
            return j;
          case Ng:
            return E;
          case $g:
            return w;
          case Ig:
            return _;
          case Pg:
            return x;
        }
      return J;
    });
    function cy(U, J) {
      return J = J ?? o, !!J && (typeof U == "number" || $.test(U)) && U > -1 && U % 1 == 0 && U < J;
    }
    function fy(U) {
      var J = typeof U;
      return J == "string" || J == "number" || J == "symbol" || J == "boolean" ? U !== "__proto__" : U === null;
    }
    function dy(U) {
      return !!$e && $e in U;
    }
    function hy(U) {
      var J = U && U.constructor, ue = typeof J == "function" && J.prototype || he;
      return U === ue;
    }
    function py(U) {
      return Ie.call(U);
    }
    function rr(U) {
      if (U != null) {
        try {
          return me.call(U);
        } catch {
        }
        try {
          return U + "";
        } catch {
        }
      }
      return "";
    }
    function Sl(U, J) {
      return U === J || U !== U && J !== J;
    }
    var my = El(/* @__PURE__ */ (function() {
      return arguments;
    })()) ? El : function(U) {
      return Mr(U) && ye.call(U, "callee") && !se.call(U, "callee");
    }, Cn = Array.isArray;
    function gy(U) {
      return U != null && Rl(U.length) && !Tl(U);
    }
    var _a = Ee || _y;
    function yy(U, J) {
      return vl(U, J);
    }
    function Tl(U) {
      if (!bl(U))
        return !1;
      var J = xr(U);
      return J == h || J == y || J == l || J == T;
    }
    function Rl(U) {
      return typeof U == "number" && U > -1 && U % 1 == 0 && U <= o;
    }
    function bl(U) {
      var J = typeof U;
      return U != null && (J == "object" || J == "function");
    }
    function Mr(U) {
      return U != null && typeof U == "object";
    }
    var Al = re ? He(re) : iy;
    function Ey(U) {
      return gy(U) ? ey(U) : ay(U);
    }
    function vy() {
      return [];
    }
    function _y() {
      return !1;
    }
    e.exports = yy;
  })(yn, yn.exports)), yn.exports;
}
var qp;
function rw() {
  if (qp) return Tr;
  qp = 1, Object.defineProperty(Tr, "__esModule", { value: !0 }), Tr.DownloadedUpdateHelper = void 0, Tr.createTempUpdateFile = d;
  const e = Pr, t = Rt, i = tw(), r = /* @__PURE__ */ Qt(), u = De;
  let s = class {
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
    async validateDownloadedPath(l, n, f, c) {
      if (this.versionInfo != null && this.file === l && this.fileInfo != null)
        return i(this.versionInfo, n) && i(this.fileInfo.info, f.info) && await (0, r.pathExists)(l) ? l : null;
      const h = await this.getValidCachedUpdateFile(f, c);
      return h === null ? null : (c.info(`Update has already been downloaded to ${l}).`), this._file = h, h);
    }
    async setDownloadedFile(l, n, f, c, h, y) {
      this._file = l, this._packageFile = n, this.versionInfo = f, this.fileInfo = c, this._downloadedFileInfo = {
        fileName: h,
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
    async getValidCachedUpdateFile(l, n) {
      const f = this.getUpdateInfoFile();
      if (!await (0, r.pathExists)(f))
        return null;
      let h;
      try {
        h = await (0, r.readJson)(f);
      } catch (v) {
        let m = "No cached update info available";
        return v.code !== "ENOENT" && (await this.cleanCacheDirForPendingUpdate(), m += ` (error on read: ${v.message})`), n.info(m), null;
      }
      if (!(h?.fileName !== null))
        return n.warn("Cached update info is corrupted: no fileName, directory for cached update will be cleaned"), await this.cleanCacheDirForPendingUpdate(), null;
      if (l.info.sha512 !== h.sha512)
        return n.info(`Cached update sha512 checksum doesn't match the latest available update. New update must be downloaded. Cached: ${h.sha512}, expected: ${l.info.sha512}. Directory for cached update will be cleaned`), await this.cleanCacheDirForPendingUpdate(), null;
      const E = u.join(this.cacheDirForPendingUpdate, h.fileName);
      if (!await (0, r.pathExists)(E))
        return n.info("Cached update file doesn't exist"), null;
      const p = await o(E);
      return l.info.sha512 !== p ? (n.warn(`Sha512 checksum doesn't match the latest available update. New update must be downloaded. Cached: ${p}, expected: ${l.info.sha512}`), await this.cleanCacheDirForPendingUpdate(), null) : (this._downloadedFileInfo = h, E);
    }
    getUpdateInfoFile() {
      return u.join(this.cacheDirForPendingUpdate, "update-info.json");
    }
  };
  Tr.DownloadedUpdateHelper = s;
  function o(a, l = "sha512", n = "base64", f) {
    return new Promise((c, h) => {
      const y = (0, e.createHash)(l);
      y.on("error", h).setEncoding(n), (0, t.createReadStream)(a, {
        ...f,
        highWaterMark: 1024 * 1024
        /* better to use more memory but hash faster */
      }).on("error", h).on("end", () => {
        y.end(), c(y.read());
      }).pipe(y, { end: !1 });
    });
  }
  async function d(a, l, n) {
    let f = 0, c = u.join(l, a);
    for (let h = 0; h < 3; h++)
      try {
        return await (0, r.unlink)(c), c;
      } catch (y) {
        if (y.code === "ENOENT")
          return c;
        n.warn(`Error on remove temp update file: ${y}`), c = u.join(l, `${f++}-${a}`);
      }
    return c;
  }
  return Tr;
}
var Qr = {}, Yi = {}, xp;
function nw() {
  if (xp) return Yi;
  xp = 1, Object.defineProperty(Yi, "__esModule", { value: !0 }), Yi.getAppCacheDir = i;
  const e = De, t = Sn;
  function i() {
    const r = (0, t.homedir)();
    let u;
    return process.platform === "win32" ? u = process.env.LOCALAPPDATA || e.join(r, "AppData", "Local") : process.platform === "darwin" ? u = e.join(r, "Library", "Caches") : u = process.env.XDG_CACHE_HOME || e.join(r, ".cache"), u;
  }
  return Yi;
}
var Mp;
function iw() {
  if (Mp) return Qr;
  Mp = 1, Object.defineProperty(Qr, "__esModule", { value: !0 }), Qr.ElectronAppAdapter = void 0;
  const e = De, t = nw();
  let i = class {
    constructor(u = Wt.app) {
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
      this.app.once("quit", (s, o) => u(o));
    }
  };
  return Qr.ElectronAppAdapter = i, Qr;
}
var Nu = {}, jp;
function aw() {
  return jp || (jp = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.ElectronHttpExecutor = e.NET_SESSION_NAME = void 0, e.getNetSession = i;
    const t = Qe();
    e.NET_SESSION_NAME = "electron-updater";
    function i() {
      return Wt.session.fromPartition(e.NET_SESSION_NAME, {
        cache: !1
      });
    }
    class r extends t.HttpExecutor {
      constructor(s) {
        super(), this.proxyLoginCallback = s, this.cachedSession = null;
      }
      async download(s, o, d) {
        return await d.cancellationToken.createPromise((a, l, n) => {
          const f = {
            headers: d.headers || void 0,
            redirect: "manual"
          };
          (0, t.configureRequestUrl)(s, f), (0, t.configureRequestOptions)(f), this.doDownload(f, {
            destination: o,
            options: d,
            onCancel: n,
            callback: (c) => {
              c == null ? a(o) : l(c);
            },
            responseHandler: null
          }, 0);
        });
      }
      createRequest(s, o) {
        s.headers && s.headers.Host && (s.host = s.headers.Host, delete s.headers.Host), this.cachedSession == null && (this.cachedSession = i());
        const d = Wt.net.request({
          ...s,
          session: this.cachedSession
        });
        return d.on("response", o), this.proxyLoginCallback != null && d.on("login", this.proxyLoginCallback), d;
      }
      addRedirectHandlers(s, o, d, a, l) {
        s.on("redirect", (n, f, c) => {
          s.abort(), a > this.maxRedirects ? d(this.createMaxRedirectError()) : l(t.HttpExecutor.prepareRedirectUrlOptions(c, o));
        });
      }
    }
    e.ElectronHttpExecutor = r;
  })(Nu)), Nu;
}
var Zr = {}, hr = {}, $u, Gp;
function sw() {
  if (Gp) return $u;
  Gp = 1;
  var e = "[object Symbol]", t = /[\\^$.*+?()[\]{}|]/g, i = RegExp(t.source), r = typeof Tt == "object" && Tt && Tt.Object === Object && Tt, u = typeof self == "object" && self && self.Object === Object && self, s = r || u || Function("return this")(), o = Object.prototype, d = o.toString, a = s.Symbol, l = a ? a.prototype : void 0, n = l ? l.toString : void 0;
  function f(p) {
    if (typeof p == "string")
      return p;
    if (h(p))
      return n ? n.call(p) : "";
    var v = p + "";
    return v == "0" && 1 / p == -1 / 0 ? "-0" : v;
  }
  function c(p) {
    return !!p && typeof p == "object";
  }
  function h(p) {
    return typeof p == "symbol" || c(p) && d.call(p) == e;
  }
  function y(p) {
    return p == null ? "" : f(p);
  }
  function E(p) {
    return p = y(p), p && i.test(p) ? p.replace(t, "\\$&") : p;
  }
  return $u = E, $u;
}
var Hp;
function gr() {
  if (Hp) return hr;
  Hp = 1, Object.defineProperty(hr, "__esModule", { value: !0 }), hr.newBaseUrl = i, hr.newUrlFromBase = r, hr.getChannelFilename = u, hr.blockmapFiles = s;
  const e = Cr, t = sw();
  function i(o) {
    const d = new e.URL(o);
    return d.pathname.endsWith("/") || (d.pathname += "/"), d;
  }
  function r(o, d, a = !1) {
    const l = new e.URL(o, d), n = d.search;
    return n != null && n.length !== 0 ? l.search = n : a && (l.search = `noCache=${Date.now().toString(32)}`), l;
  }
  function u(o) {
    return `${o}.yml`;
  }
  function s(o, d, a) {
    const l = r(`${o.pathname}.blockmap`, o);
    return [r(`${o.pathname.replace(new RegExp(t(a), "g"), d)}.blockmap`, o), l];
  }
  return hr;
}
var Ut = {}, Bp;
function gt() {
  if (Bp) return Ut;
  Bp = 1, Object.defineProperty(Ut, "__esModule", { value: !0 }), Ut.Provider = void 0, Ut.findFile = u, Ut.parseUpdateInfo = s, Ut.getFileList = o, Ut.resolveFiles = d;
  const e = Qe(), t = il(), i = gr();
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
    httpRequest(l, n, f) {
      return this.executor.request(this.createRequestOptions(l, n), f);
    }
    createRequestOptions(l, n) {
      const f = {};
      return this.requestHeaders == null ? n != null && (f.headers = n) : f.headers = n == null ? this.requestHeaders : { ...this.requestHeaders, ...n }, (0, e.configureRequestUrl)(l, f), f;
    }
  };
  Ut.Provider = r;
  function u(a, l, n) {
    if (a.length === 0)
      throw (0, e.newError)("No files provided", "ERR_UPDATER_NO_FILES_PROVIDED");
    const f = a.find((c) => c.url.pathname.toLowerCase().endsWith(`.${l}`));
    return f ?? (n == null ? a[0] : a.find((c) => !n.some((h) => c.url.pathname.toLowerCase().endsWith(`.${h}`))));
  }
  function s(a, l, n) {
    if (a == null)
      throw (0, e.newError)(`Cannot parse update info from ${l} in the latest release artifacts (${n}): rawData: null`, "ERR_UPDATER_INVALID_UPDATE_INFO");
    let f;
    try {
      f = (0, t.load)(a);
    } catch (c) {
      throw (0, e.newError)(`Cannot parse update info from ${l} in the latest release artifacts (${n}): ${c.stack || c.message}, rawData: ${a}`, "ERR_UPDATER_INVALID_UPDATE_INFO");
    }
    return f;
  }
  function o(a) {
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
  function d(a, l, n = (f) => f) {
    const c = o(a).map((E) => {
      if (E.sha2 == null && E.sha512 == null)
        throw (0, e.newError)(`Update info doesn't contain nor sha256 neither sha512 checksum: ${(0, e.safeStringifyJson)(E)}`, "ERR_UPDATER_NO_CHECKSUM");
      return {
        url: (0, i.newUrlFromBase)(n(E.url), l),
        info: E
      };
    }), h = a.packages, y = h == null ? null : h[process.arch] || h.ia32;
    return y != null && (c[0].packageInfo = {
      ...y,
      path: (0, i.newUrlFromBase)(n(y.path), l).href
    }), c;
  }
  return Ut;
}
var Vp;
function Eg() {
  if (Vp) return Zr;
  Vp = 1, Object.defineProperty(Zr, "__esModule", { value: !0 }), Zr.GenericProvider = void 0;
  const e = Qe(), t = gr(), i = gt();
  let r = class extends i.Provider {
    constructor(s, o, d) {
      super(d), this.configuration = s, this.updater = o, this.baseUrl = (0, t.newBaseUrl)(this.configuration.url);
    }
    get channel() {
      const s = this.updater.channel || this.configuration.channel;
      return s == null ? this.getDefaultChannelName() : this.getCustomChannelName(s);
    }
    async getLatestVersion() {
      const s = (0, t.getChannelFilename)(this.channel), o = (0, t.newUrlFromBase)(s, this.baseUrl, this.updater.isAddNoCacheQuery);
      for (let d = 0; ; d++)
        try {
          return (0, i.parseUpdateInfo)(await this.httpRequest(o), s, o);
        } catch (a) {
          if (a instanceof e.HttpError && a.statusCode === 404)
            throw (0, e.newError)(`Cannot find channel "${s}" update info: ${a.stack || a.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
          if (a.code === "ECONNREFUSED" && d < 3) {
            await new Promise((l, n) => {
              try {
                setTimeout(l, 1e3 * d);
              } catch (f) {
                n(f);
              }
            });
            continue;
          }
          throw a;
        }
    }
    resolveFiles(s) {
      return (0, i.resolveFiles)(s, this.baseUrl);
    }
  };
  return Zr.GenericProvider = r, Zr;
}
var en = {}, tn = {}, zp;
function ow() {
  if (zp) return tn;
  zp = 1, Object.defineProperty(tn, "__esModule", { value: !0 }), tn.BitbucketProvider = void 0;
  const e = Qe(), t = gr(), i = gt();
  let r = class extends i.Provider {
    constructor(s, o, d) {
      super({
        ...d,
        isUseMultipleRangeRequest: !1
      }), this.configuration = s, this.updater = o;
      const { owner: a, slug: l } = s;
      this.baseUrl = (0, t.newBaseUrl)(`https://api.bitbucket.org/2.0/repositories/${a}/${l}/downloads`);
    }
    get channel() {
      return this.updater.channel || this.configuration.channel || "latest";
    }
    async getLatestVersion() {
      const s = new e.CancellationToken(), o = (0, t.getChannelFilename)(this.getCustomChannelName(this.channel)), d = (0, t.newUrlFromBase)(o, this.baseUrl, this.updater.isAddNoCacheQuery);
      try {
        const a = await this.httpRequest(d, void 0, s);
        return (0, i.parseUpdateInfo)(a, o, d);
      } catch (a) {
        throw (0, e.newError)(`Unable to find latest version on ${this.toString()}, please ensure release exists: ${a.stack || a.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
      }
    }
    resolveFiles(s) {
      return (0, i.resolveFiles)(s, this.baseUrl);
    }
    toString() {
      const { owner: s, slug: o } = this.configuration;
      return `Bitbucket (owner: ${s}, slug: ${o}, channel: ${this.channel})`;
    }
  };
  return tn.BitbucketProvider = r, tn;
}
var Vt = {}, Xp;
function vg() {
  if (Xp) return Vt;
  Xp = 1, Object.defineProperty(Vt, "__esModule", { value: !0 }), Vt.GitHubProvider = Vt.BaseGitHubProvider = void 0, Vt.computeReleaseNotes = l;
  const e = Qe(), t = yg(), i = Cr, r = gr(), u = gt(), s = /\/tag\/([^/]+)$/;
  class o extends u.Provider {
    constructor(f, c, h) {
      super({
        ...h,
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
  Vt.BaseGitHubProvider = o;
  let d = class extends o {
    constructor(f, c, h) {
      super(f, "github.com", h), this.options = f, this.updater = c;
    }
    get channel() {
      const f = this.updater.channel || this.options.channel;
      return f == null ? this.getDefaultChannelName() : this.getCustomChannelName(f);
    }
    async getLatestVersion() {
      var f, c, h, y, E;
      const p = new e.CancellationToken(), v = await this.httpRequest((0, r.newUrlFromBase)(`${this.basePath}.atom`, this.baseUrl), {
        accept: "application/xml, application/atom+xml, text/xml, */*"
      }, p), m = (0, e.parseXml)(v);
      let w = m.element("entry", !1, "No published versions on GitHub"), T = null;
      try {
        if (this.updater.allowPrerelease) {
          const x = ((f = this.updater) === null || f === void 0 ? void 0 : f.channel) || ((c = t.prerelease(this.updater.currentVersion)) === null || c === void 0 ? void 0 : c[0]) || null;
          if (x === null)
            T = s.exec(w.element("link").attribute("href"))[1];
          else
            for (const M of m.getElements("entry")) {
              const j = s.exec(M.element("link").attribute("href"));
              if (j === null)
                continue;
              const X = j[1], P = ((h = t.prerelease(X)) === null || h === void 0 ? void 0 : h[0]) || null, D = !x || ["alpha", "beta"].includes(x), W = P !== null && !["alpha", "beta"].includes(String(P));
              if (D && !W && !(x === "beta" && P === "alpha")) {
                T = X;
                break;
              }
              if (P && P === x) {
                T = X;
                break;
              }
            }
        } else {
          T = await this.getLatestTagName(p);
          for (const x of m.getElements("entry"))
            if (s.exec(x.element("link").attribute("href"))[1] === T) {
              w = x;
              break;
            }
        }
      } catch (x) {
        throw (0, e.newError)(`Cannot parse releases feed: ${x.stack || x.message},
XML:
${v}`, "ERR_UPDATER_INVALID_RELEASE_FEED");
      }
      if (T == null)
        throw (0, e.newError)("No published versions on GitHub", "ERR_UPDATER_NO_PUBLISHED_VERSIONS");
      let R, _ = "", S = "";
      const A = async (x) => {
        _ = (0, r.getChannelFilename)(x), S = (0, r.newUrlFromBase)(this.getBaseDownloadPath(String(T), _), this.baseUrl);
        const M = this.createRequestOptions(S);
        try {
          return await this.executor.request(M, p);
        } catch (j) {
          throw j instanceof e.HttpError && j.statusCode === 404 ? (0, e.newError)(`Cannot find ${_} in the latest release artifacts (${S}): ${j.stack || j.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND") : j;
        }
      };
      try {
        let x = this.channel;
        this.updater.allowPrerelease && (!((y = t.prerelease(T)) === null || y === void 0) && y[0]) && (x = this.getCustomChannelName(String((E = t.prerelease(T)) === null || E === void 0 ? void 0 : E[0]))), R = await A(x);
      } catch (x) {
        if (this.updater.allowPrerelease)
          R = await A(this.getDefaultChannelName());
        else
          throw x;
      }
      const b = (0, u.parseUpdateInfo)(R, _, S);
      return b.releaseName == null && (b.releaseName = w.elementValueOrEmpty("title")), b.releaseNotes == null && (b.releaseNotes = l(this.updater.currentVersion, this.updater.fullChangelog, m, w)), {
        tag: T,
        ...b
      };
    }
    async getLatestTagName(f) {
      const c = this.options, h = c.host == null || c.host === "github.com" ? (0, r.newUrlFromBase)(`${this.basePath}/latest`, this.baseUrl) : new i.URL(`${this.computeGithubBasePath(`/repos/${c.owner}/${c.repo}/releases`)}/latest`, this.baseApiUrl);
      try {
        const y = await this.httpRequest(h, { Accept: "application/json" }, f);
        return y == null ? null : JSON.parse(y).tag_name;
      } catch (y) {
        throw (0, e.newError)(`Unable to find latest version on GitHub (${h}), please ensure a production release exists: ${y.stack || y.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
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
  Vt.GitHubProvider = d;
  function a(n) {
    const f = n.elementValueOrEmpty("content");
    return f === "No content." ? "" : f;
  }
  function l(n, f, c, h) {
    if (!f)
      return a(h);
    const y = [];
    for (const E of c.getElements("entry")) {
      const p = /\/tag\/v?([^/]+)$/.exec(E.element("link").attribute("href"))[1];
      t.lt(n, p) && y.push({
        version: p,
        note: a(E)
      });
    }
    return y.sort((E, p) => t.rcompare(E.version, p.version));
  }
  return Vt;
}
var rn = {}, Yp;
function uw() {
  if (Yp) return rn;
  Yp = 1, Object.defineProperty(rn, "__esModule", { value: !0 }), rn.KeygenProvider = void 0;
  const e = Qe(), t = gr(), i = gt();
  let r = class extends i.Provider {
    constructor(s, o, d) {
      super({
        ...d,
        isUseMultipleRangeRequest: !1
      }), this.configuration = s, this.updater = o, this.defaultHostname = "api.keygen.sh";
      const a = this.configuration.host || this.defaultHostname;
      this.baseUrl = (0, t.newBaseUrl)(`https://${a}/v1/accounts/${this.configuration.account}/artifacts?product=${this.configuration.product}`);
    }
    get channel() {
      return this.updater.channel || this.configuration.channel || "stable";
    }
    async getLatestVersion() {
      const s = new e.CancellationToken(), o = (0, t.getChannelFilename)(this.getCustomChannelName(this.channel)), d = (0, t.newUrlFromBase)(o, this.baseUrl, this.updater.isAddNoCacheQuery);
      try {
        const a = await this.httpRequest(d, {
          Accept: "application/vnd.api+json",
          "Keygen-Version": "1.1"
        }, s);
        return (0, i.parseUpdateInfo)(a, o, d);
      } catch (a) {
        throw (0, e.newError)(`Unable to find latest version on ${this.toString()}, please ensure release exists: ${a.stack || a.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
      }
    }
    resolveFiles(s) {
      return (0, i.resolveFiles)(s, this.baseUrl);
    }
    toString() {
      const { account: s, product: o, platform: d } = this.configuration;
      return `Keygen (account: ${s}, product: ${o}, platform: ${d}, channel: ${this.channel})`;
    }
  };
  return rn.KeygenProvider = r, rn;
}
var nn = {}, Wp;
function lw() {
  if (Wp) return nn;
  Wp = 1, Object.defineProperty(nn, "__esModule", { value: !0 }), nn.PrivateGitHubProvider = void 0;
  const e = Qe(), t = il(), i = De, r = Cr, u = gr(), s = vg(), o = gt();
  let d = class extends s.BaseGitHubProvider {
    constructor(l, n, f, c) {
      super(l, "api.github.com", c), this.updater = n, this.token = f;
    }
    createRequestOptions(l, n) {
      const f = super.createRequestOptions(l, n);
      return f.redirect = "manual", f;
    }
    async getLatestVersion() {
      const l = new e.CancellationToken(), n = (0, u.getChannelFilename)(this.getDefaultChannelName()), f = await this.getLatestVersionInfo(l), c = f.assets.find((E) => E.name === n);
      if (c == null)
        throw (0, e.newError)(`Cannot find ${n} in the release ${f.html_url || f.name}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
      const h = new r.URL(c.url);
      let y;
      try {
        y = (0, t.load)(await this.httpRequest(h, this.configureHeaders("application/octet-stream"), l));
      } catch (E) {
        throw E instanceof e.HttpError && E.statusCode === 404 ? (0, e.newError)(`Cannot find ${n} in the latest release artifacts (${h}): ${E.stack || E.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND") : E;
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
      const n = this.updater.allowPrerelease;
      let f = this.basePath;
      n || (f = `${f}/latest`);
      const c = (0, u.newUrlFromBase)(f, this.baseUrl);
      try {
        const h = JSON.parse(await this.httpRequest(c, this.configureHeaders("application/vnd.github.v3+json"), l));
        return n ? h.find((y) => y.prerelease) || h[0] : h;
      } catch (h) {
        throw (0, e.newError)(`Unable to find latest version on GitHub (${c}), please ensure a production release exists: ${h.stack || h.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
      }
    }
    get basePath() {
      return this.computeGithubBasePath(`/repos/${this.options.owner}/${this.options.repo}/releases`);
    }
    resolveFiles(l) {
      return (0, o.getFileList)(l).map((n) => {
        const f = i.posix.basename(n.url).replace(/ /g, "-"), c = l.assets.find((h) => h != null && h.name === f);
        if (c == null)
          throw (0, e.newError)(`Cannot find asset "${f}" in: ${JSON.stringify(l.assets, null, 2)}`, "ERR_UPDATER_ASSET_NOT_FOUND");
        return {
          url: new r.URL(c.url),
          info: n
        };
      });
    }
  };
  return nn.PrivateGitHubProvider = d, nn;
}
var Kp;
function cw() {
  if (Kp) return en;
  Kp = 1, Object.defineProperty(en, "__esModule", { value: !0 }), en.isUrlProbablySupportMultiRangeRequests = o, en.createClient = d;
  const e = Qe(), t = ow(), i = Eg(), r = vg(), u = uw(), s = lw();
  function o(a) {
    return !a.includes("s3.amazonaws.com");
  }
  function d(a, l, n) {
    if (typeof a == "string")
      throw (0, e.newError)("Please pass PublishConfiguration object", "ERR_UPDATER_INVALID_PROVIDER_CONFIGURATION");
    const f = a.provider;
    switch (f) {
      case "github": {
        const c = a, h = (c.private ? process.env.GH_TOKEN || process.env.GITHUB_TOKEN : null) || c.token;
        return h == null ? new r.GitHubProvider(c, l, n) : new s.PrivateGitHubProvider(c, l, h, n);
      }
      case "bitbucket":
        return new t.BitbucketProvider(a, l, n);
      case "keygen":
        return new u.KeygenProvider(a, l, n);
      case "s3":
      case "spaces":
        return new i.GenericProvider({
          provider: "generic",
          url: (0, e.getS3LikeProviderBaseUrl)(a),
          channel: a.channel || null
        }, l, {
          ...n,
          // https://github.com/minio/minio/issues/5285#issuecomment-350428955
          isUseMultipleRangeRequest: !1
        });
      case "generic": {
        const c = a;
        return new i.GenericProvider(c, l, {
          ...n,
          isUseMultipleRangeRequest: c.useMultipleRangeRequest !== !1 && o(c.url)
        });
      }
      case "custom": {
        const c = a, h = c.updateProvider;
        if (!h)
          throw (0, e.newError)("Custom provider not specified", "ERR_UPDATER_INVALID_PROVIDER_CONFIGURATION");
        return new h(c, l, n);
      }
      default:
        throw (0, e.newError)(`Unsupported provider: ${f}`, "ERR_UPDATER_UNSUPPORTED_PROVIDER");
    }
  }
  return en;
}
var an = {}, sn = {}, Rr = {}, br = {}, Jp;
function fl() {
  if (Jp) return br;
  Jp = 1, Object.defineProperty(br, "__esModule", { value: !0 }), br.OperationKind = void 0, br.computeOperations = t;
  var e;
  (function(o) {
    o[o.COPY = 0] = "COPY", o[o.DOWNLOAD = 1] = "DOWNLOAD";
  })(e || (br.OperationKind = e = {}));
  function t(o, d, a) {
    const l = s(o.files), n = s(d.files);
    let f = null;
    const c = d.files[0], h = [], y = c.name, E = l.get(y);
    if (E == null)
      throw new Error(`no file ${y} in old blockmap`);
    const p = n.get(y);
    let v = 0;
    const { checksumToOffset: m, checksumToOldSize: w } = u(l.get(y), E.offset, a);
    let T = c.offset;
    for (let R = 0; R < p.checksums.length; T += p.sizes[R], R++) {
      const _ = p.sizes[R], S = p.checksums[R];
      let A = m.get(S);
      A != null && w.get(S) !== _ && (a.warn(`Checksum ("${S}") matches, but size differs (old: ${w.get(S)}, new: ${_})`), A = void 0), A === void 0 ? (v++, f != null && f.kind === e.DOWNLOAD && f.end === T ? f.end += _ : (f = {
        kind: e.DOWNLOAD,
        start: T,
        end: T + _
        // oldBlocks: null,
      }, r(f, h, S, R))) : f != null && f.kind === e.COPY && f.end === A ? f.end += _ : (f = {
        kind: e.COPY,
        start: A,
        end: A + _
        // oldBlocks: [checksum]
      }, r(f, h, S, R));
    }
    return v > 0 && a.info(`File${c.name === "file" ? "" : " " + c.name} has ${v} changed blocks`), h;
  }
  const i = process.env.DIFFERENTIAL_DOWNLOAD_PLAN_BUILDER_VALIDATE_RANGES === "true";
  function r(o, d, a, l) {
    if (i && d.length !== 0) {
      const n = d[d.length - 1];
      if (n.kind === o.kind && o.start < n.end && o.start > n.start) {
        const f = [n.start, n.end, o.start, o.end].reduce((c, h) => c < h ? c : h);
        throw new Error(`operation (block index: ${l}, checksum: ${a}, kind: ${e[o.kind]}) overlaps previous operation (checksum: ${a}):
abs: ${n.start} until ${n.end} and ${o.start} until ${o.end}
rel: ${n.start - f} until ${n.end - f} and ${o.start - f} until ${o.end - f}`);
      }
    }
    d.push(o);
  }
  function u(o, d, a) {
    const l = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map();
    let f = d;
    for (let c = 0; c < o.checksums.length; c++) {
      const h = o.checksums[c], y = o.sizes[c], E = n.get(h);
      if (E === void 0)
        l.set(h, f), n.set(h, y);
      else if (a.debug != null) {
        const p = E === y ? "(same size)" : `(size: ${E}, this size: ${y})`;
        a.debug(`${h} duplicated in blockmap ${p}, it doesn't lead to broken differential downloader, just corresponding block will be skipped)`);
      }
      f += y;
    }
    return { checksumToOffset: l, checksumToOldSize: n };
  }
  function s(o) {
    const d = /* @__PURE__ */ new Map();
    for (const a of o)
      d.set(a.name, a);
    return d;
  }
  return br;
}
var Qp;
function _g() {
  if (Qp) return Rr;
  Qp = 1, Object.defineProperty(Rr, "__esModule", { value: !0 }), Rr.DataSplitter = void 0, Rr.copyData = o;
  const e = Qe(), t = Rt, i = Tn, r = fl(), u = Buffer.from(`\r
\r
`);
  var s;
  (function(a) {
    a[a.INIT = 0] = "INIT", a[a.HEADER = 1] = "HEADER", a[a.BODY = 2] = "BODY";
  })(s || (s = {}));
  function o(a, l, n, f, c) {
    const h = (0, t.createReadStream)("", {
      fd: n,
      autoClose: !1,
      start: a.start,
      // end is inclusive
      end: a.end - 1
    });
    h.on("error", f), h.once("end", c), h.pipe(l, {
      end: !1
    });
  }
  let d = class extends i.Writable {
    constructor(l, n, f, c, h, y) {
      super(), this.out = l, this.options = n, this.partIndexToTaskIndex = f, this.partIndexToLength = h, this.finishHandler = y, this.partIndex = -1, this.headerListBuffer = null, this.readState = s.INIT, this.ignoreByteCount = 0, this.remainingPartDataCount = 0, this.actualPartLength = 0, this.boundaryLength = c.length + 4, this.ignoreByteCount = this.boundaryLength - 2;
    }
    get isFinished() {
      return this.partIndex === this.partIndexToLength.length;
    }
    // noinspection JSUnusedGlobalSymbols
    _write(l, n, f) {
      if (this.isFinished) {
        console.error(`Trailing ignored data: ${l.length} bytes`);
        return;
      }
      this.handleData(l).then(f).catch(f);
    }
    async handleData(l) {
      let n = 0;
      if (this.ignoreByteCount !== 0 && this.remainingPartDataCount !== 0)
        throw (0, e.newError)("Internal error", "ERR_DATA_SPLITTER_BYTE_COUNT_MISMATCH");
      if (this.ignoreByteCount > 0) {
        const f = Math.min(this.ignoreByteCount, l.length);
        this.ignoreByteCount -= f, n = f;
      } else if (this.remainingPartDataCount > 0) {
        const f = Math.min(this.remainingPartDataCount, l.length);
        this.remainingPartDataCount -= f, await this.processPartData(l, 0, f), n = f;
      }
      if (n !== l.length) {
        if (this.readState === s.HEADER) {
          const f = this.searchHeaderListEnd(l, n);
          if (f === -1)
            return;
          n = f, this.readState = s.BODY, this.headerListBuffer = null;
        }
        for (; ; ) {
          if (this.readState === s.BODY)
            this.readState = s.INIT;
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
            if (n = this.searchHeaderListEnd(l, n), n === -1) {
              this.readState = s.HEADER;
              return;
            }
          }
          const f = this.partIndexToLength[this.partIndex], c = n + f, h = Math.min(c, l.length);
          if (await this.processPartStarted(l, n, h), this.remainingPartDataCount = f - (h - n), this.remainingPartDataCount > 0)
            return;
          if (n = c + this.boundaryLength, n >= l.length) {
            this.ignoreByteCount = this.boundaryLength - (l.length - c);
            return;
          }
        }
      }
    }
    copyExistingData(l, n) {
      return new Promise((f, c) => {
        const h = () => {
          if (l === n) {
            f();
            return;
          }
          const y = this.options.tasks[l];
          if (y.kind !== r.OperationKind.COPY) {
            c(new Error("Task kind must be COPY"));
            return;
          }
          o(y, this.out, this.options.oldFileFd, c, () => {
            l++, h();
          });
        };
        h();
      });
    }
    searchHeaderListEnd(l, n) {
      const f = l.indexOf(u, n);
      if (f !== -1)
        return f + u.length;
      const c = n === 0 ? l : l.slice(n);
      return this.headerListBuffer == null ? this.headerListBuffer = c : this.headerListBuffer = Buffer.concat([this.headerListBuffer, c]), -1;
    }
    onPartEnd() {
      const l = this.partIndexToLength[this.partIndex - 1];
      if (this.actualPartLength !== l)
        throw (0, e.newError)(`Expected length: ${l} differs from actual: ${this.actualPartLength}`, "ERR_DATA_SPLITTER_LENGTH_MISMATCH");
      this.actualPartLength = 0;
    }
    processPartStarted(l, n, f) {
      return this.partIndex !== 0 && this.onPartEnd(), this.processPartData(l, n, f);
    }
    processPartData(l, n, f) {
      this.actualPartLength += f - n;
      const c = this.out;
      return c.write(n === 0 && l.length === f ? l : l.slice(n, f)) ? Promise.resolve() : new Promise((h, y) => {
        c.on("error", y), c.once("drain", () => {
          c.removeListener("error", y), h();
        });
      });
    }
  };
  return Rr.DataSplitter = d, Rr;
}
var on = {}, Zp;
function fw() {
  if (Zp) return on;
  Zp = 1, Object.defineProperty(on, "__esModule", { value: !0 }), on.executeTasksUsingMultipleRangeRequests = r, on.checkIsRangesSupported = s;
  const e = Qe(), t = _g(), i = fl();
  function r(o, d, a, l, n) {
    const f = (c) => {
      if (c >= d.length) {
        o.fileMetadataBuffer != null && a.write(o.fileMetadataBuffer), a.end();
        return;
      }
      const h = c + 1e3;
      u(o, {
        tasks: d,
        start: c,
        end: Math.min(d.length, h),
        oldFileFd: l
      }, a, () => f(h), n);
    };
    return f;
  }
  function u(o, d, a, l, n) {
    let f = "bytes=", c = 0;
    const h = /* @__PURE__ */ new Map(), y = [];
    for (let v = d.start; v < d.end; v++) {
      const m = d.tasks[v];
      m.kind === i.OperationKind.DOWNLOAD && (f += `${m.start}-${m.end - 1}, `, h.set(c, v), c++, y.push(m.end - m.start));
    }
    if (c <= 1) {
      const v = (m) => {
        if (m >= d.end) {
          l();
          return;
        }
        const w = d.tasks[m++];
        if (w.kind === i.OperationKind.COPY)
          (0, t.copyData)(w, a, d.oldFileFd, n, () => v(m));
        else {
          const T = o.createRequestOptions();
          T.headers.Range = `bytes=${w.start}-${w.end - 1}`;
          const R = o.httpExecutor.createRequest(T, (_) => {
            s(_, n) && (_.pipe(a, {
              end: !1
            }), _.once("end", () => v(m)));
          });
          o.httpExecutor.addErrorAndTimeoutHandlers(R, n), R.end();
        }
      };
      v(d.start);
      return;
    }
    const E = o.createRequestOptions();
    E.headers.Range = f.substring(0, f.length - 2);
    const p = o.httpExecutor.createRequest(E, (v) => {
      if (!s(v, n))
        return;
      const m = (0, e.safeGetHeader)(v, "content-type"), w = /^multipart\/.+?(?:; boundary=(?:(?:"(.+)")|(?:([^\s]+))))$/i.exec(m);
      if (w == null) {
        n(new Error(`Content-Type "multipart/byteranges" is expected, but got "${m}"`));
        return;
      }
      const T = new t.DataSplitter(a, d, h, w[1] || w[2], y, l);
      T.on("error", n), v.pipe(T), v.on("end", () => {
        setTimeout(() => {
          p.abort(), n(new Error("Response ends without calling any handlers"));
        }, 1e4);
      });
    });
    o.httpExecutor.addErrorAndTimeoutHandlers(p, n), p.end();
  }
  function s(o, d) {
    if (o.statusCode >= 400)
      return d((0, e.createHttpError)(o)), !1;
    if (o.statusCode !== 206) {
      const a = (0, e.safeGetHeader)(o, "accept-ranges");
      if (a == null || a === "none")
        return d(new Error(`Server doesn't support Accept-Ranges (response code ${o.statusCode})`)), !1;
    }
    return !0;
  }
  return on;
}
var un = {}, em;
function dw() {
  if (em) return un;
  em = 1, Object.defineProperty(un, "__esModule", { value: !0 }), un.ProgressDifferentialDownloadCallbackTransform = void 0;
  const e = Tn;
  var t;
  (function(r) {
    r[r.COPY = 0] = "COPY", r[r.DOWNLOAD = 1] = "DOWNLOAD";
  })(t || (t = {}));
  let i = class extends e.Transform {
    constructor(u, s, o) {
      super(), this.progressDifferentialDownloadInfo = u, this.cancellationToken = s, this.onProgress = o, this.start = Date.now(), this.transferred = 0, this.delta = 0, this.expectedBytes = 0, this.index = 0, this.operationType = t.COPY, this.nextUpdate = this.start + 1e3;
    }
    _transform(u, s, o) {
      if (this.cancellationToken.cancelled) {
        o(new Error("cancelled"), null);
        return;
      }
      if (this.operationType == t.COPY) {
        o(null, u);
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
      }), this.delta = 0), o(null, u);
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
  return un.ProgressDifferentialDownloadCallbackTransform = i, un;
}
var tm;
function wg() {
  if (tm) return sn;
  tm = 1, Object.defineProperty(sn, "__esModule", { value: !0 }), sn.DifferentialDownloader = void 0;
  const e = Qe(), t = /* @__PURE__ */ Qt(), i = Rt, r = _g(), u = Cr, s = fl(), o = fw(), d = dw();
  let a = class {
    // noinspection TypeScriptAbstractClassConstructorCanBeMadeProtected
    constructor(c, h, y) {
      this.blockAwareFileInfo = c, this.httpExecutor = h, this.options = y, this.fileMetadataBuffer = null, this.logger = y.logger;
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
    doDownload(c, h) {
      if (c.version !== h.version)
        throw new Error(`version is different (${c.version} - ${h.version}), full download is required`);
      const y = this.logger, E = (0, s.computeOperations)(c, h, y);
      y.debug != null && y.debug(JSON.stringify(E, null, 2));
      let p = 0, v = 0;
      for (const w of E) {
        const T = w.end - w.start;
        w.kind === s.OperationKind.DOWNLOAD ? p += T : v += T;
      }
      const m = this.blockAwareFileInfo.size;
      if (p + v + (this.fileMetadataBuffer == null ? 0 : this.fileMetadataBuffer.length) !== m)
        throw new Error(`Internal error, size mismatch: downloadSize: ${p}, copySize: ${v}, newSize: ${m}`);
      return y.info(`Full: ${l(m)}, To download: ${l(p)} (${Math.round(p / (m / 100))}%)`), this.downloadFile(E);
    }
    downloadFile(c) {
      const h = [], y = () => Promise.all(h.map((E) => (0, t.close)(E.descriptor).catch((p) => {
        this.logger.error(`cannot close file "${E.path}": ${p}`);
      })));
      return this.doDownloadFile(c, h).then(y).catch((E) => y().catch((p) => {
        try {
          this.logger.error(`cannot close files: ${p}`);
        } catch (v) {
          try {
            console.error(v);
          } catch {
          }
        }
        throw E;
      }).then(() => {
        throw E;
      }));
    }
    async doDownloadFile(c, h) {
      const y = await (0, t.open)(this.options.oldFile, "r");
      h.push({ descriptor: y, path: this.options.oldFile });
      const E = await (0, t.open)(this.options.newFile, "w");
      h.push({ descriptor: E, path: this.options.newFile });
      const p = (0, i.createWriteStream)(this.options.newFile, { fd: E });
      await new Promise((v, m) => {
        const w = [];
        let T;
        if (!this.options.isUseMultipleRangeRequest && this.options.onProgress) {
          const j = [];
          let X = 0;
          for (const D of c)
            D.kind === s.OperationKind.DOWNLOAD && (j.push(D.end - D.start), X += D.end - D.start);
          const P = {
            expectedByteCounts: j,
            grandTotal: X
          };
          T = new d.ProgressDifferentialDownloadCallbackTransform(P, this.options.cancellationToken, this.options.onProgress), w.push(T);
        }
        const R = new e.DigestTransform(this.blockAwareFileInfo.sha512);
        R.isValidateOnEnd = !1, w.push(R), p.on("finish", () => {
          p.close(() => {
            h.splice(1, 1);
            try {
              R.validate();
            } catch (j) {
              m(j);
              return;
            }
            v(void 0);
          });
        }), w.push(p);
        let _ = null;
        for (const j of w)
          j.on("error", m), _ == null ? _ = j : _ = _.pipe(j);
        const S = w[0];
        let A;
        if (this.options.isUseMultipleRangeRequest) {
          A = (0, o.executeTasksUsingMultipleRangeRequests)(this, c, S, y, m), A(0);
          return;
        }
        let b = 0, x = null;
        this.logger.info(`Differential download: ${this.options.newUrl}`);
        const M = this.createRequestOptions();
        M.redirect = "manual", A = (j) => {
          var X, P;
          if (j >= c.length) {
            this.fileMetadataBuffer != null && S.write(this.fileMetadataBuffer), S.end();
            return;
          }
          const D = c[j++];
          if (D.kind === s.OperationKind.COPY) {
            T && T.beginFileCopy(), (0, r.copyData)(D, S, y, m, () => A(j));
            return;
          }
          const W = `bytes=${D.start}-${D.end - 1}`;
          M.headers.range = W, (P = (X = this.logger) === null || X === void 0 ? void 0 : X.debug) === null || P === void 0 || P.call(X, `download range: ${W}`), T && T.beginRangeDownload();
          const L = this.httpExecutor.createRequest(M, (F) => {
            F.on("error", m), F.on("aborted", () => {
              m(new Error("response has been aborted by the server"));
            }), F.statusCode >= 400 && m((0, e.createHttpError)(F)), F.pipe(S, {
              end: !1
            }), F.once("end", () => {
              T && T.endRangeDownload(), ++b === 100 ? (b = 0, setTimeout(() => A(j), 1e3)) : A(j);
            });
          });
          L.on("redirect", (F, G, k) => {
            this.logger.info(`Redirect to ${n(k)}`), x = k, (0, e.configureRequestUrl)(new u.URL(x), M), L.followRedirect();
          }), this.httpExecutor.addErrorAndTimeoutHandlers(L, m), L.end();
        }, A(0);
      });
    }
    async readRemoteBytes(c, h) {
      const y = Buffer.allocUnsafe(h + 1 - c), E = this.createRequestOptions();
      E.headers.range = `bytes=${c}-${h}`;
      let p = 0;
      if (await this.request(E, (v) => {
        v.copy(y, p), p += v.length;
      }), p !== y.length)
        throw new Error(`Received data length ${p} is not equal to expected ${y.length}`);
      return y;
    }
    request(c, h) {
      return new Promise((y, E) => {
        const p = this.httpExecutor.createRequest(c, (v) => {
          (0, o.checkIsRangesSupported)(v, E) && (v.on("error", E), v.on("aborted", () => {
            E(new Error("response has been aborted by the server"));
          }), v.on("data", h), v.on("end", () => y()));
        });
        this.httpExecutor.addErrorAndTimeoutHandlers(p, E), p.end();
      });
    }
  };
  sn.DifferentialDownloader = a;
  function l(f, c = " KB") {
    return new Intl.NumberFormat("en").format((f / 1024).toFixed(2)) + c;
  }
  function n(f) {
    const c = f.indexOf("?");
    return c < 0 ? f : f.substring(0, c);
  }
  return sn;
}
var rm;
function hw() {
  if (rm) return an;
  rm = 1, Object.defineProperty(an, "__esModule", { value: !0 }), an.GenericDifferentialDownloader = void 0;
  const e = wg();
  let t = class extends e.DifferentialDownloader {
    download(r, u) {
      return this.doDownload(r, u);
    }
  };
  return an.GenericDifferentialDownloader = t, an;
}
var Iu = {}, nm;
function yr() {
  return nm || (nm = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.UpdaterSignal = e.UPDATE_DOWNLOADED = e.DOWNLOAD_PROGRESS = e.CancellationToken = void 0, e.addHandler = r;
    const t = Qe();
    Object.defineProperty(e, "CancellationToken", { enumerable: !0, get: function() {
      return t.CancellationToken;
    } }), e.DOWNLOAD_PROGRESS = "download-progress", e.UPDATE_DOWNLOADED = "update-downloaded";
    class i {
      constructor(s) {
        this.emitter = s;
      }
      /**
       * Emitted when an authenticating proxy is [asking for user credentials](https://github.com/electron/electron/blob/master/docs/api/client-request.md#event-login).
       */
      login(s) {
        r(this.emitter, "login", s);
      }
      progress(s) {
        r(this.emitter, e.DOWNLOAD_PROGRESS, s);
      }
      updateDownloaded(s) {
        r(this.emitter, e.UPDATE_DOWNLOADED, s);
      }
      updateCancelled(s) {
        r(this.emitter, "update-cancelled", s);
      }
    }
    e.UpdaterSignal = i;
    function r(u, s, o) {
      u.on(s, o);
    }
  })(Iu)), Iu;
}
var im;
function dl() {
  if (im) return cr;
  im = 1, Object.defineProperty(cr, "__esModule", { value: !0 }), cr.NoOpLogger = cr.AppUpdater = void 0;
  const e = Qe(), t = Pr, i = Sn, r = qu, u = /* @__PURE__ */ Qt(), s = il(), o = I_(), d = De, a = yg(), l = rw(), n = iw(), f = aw(), c = Eg(), h = cw(), y = Tm, E = gr(), p = hw(), v = yr();
  let m = class Sg extends r.EventEmitter {
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
    set channel(_) {
      if (this._channel != null) {
        if (typeof _ != "string")
          throw (0, e.newError)(`Channel must be a string, but got: ${_}`, "ERR_UPDATER_INVALID_CHANNEL");
        if (_.length === 0)
          throw (0, e.newError)("Channel must be not an empty string", "ERR_UPDATER_INVALID_CHANNEL");
      }
      this._channel = _, this.allowDowngrade = !0;
    }
    /**
     *  Shortcut for explicitly adding auth tokens to request headers
     */
    addAuthHeader(_) {
      this.requestHeaders = Object.assign({}, this.requestHeaders, {
        authorization: _
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
    set logger(_) {
      this._logger = _ ?? new T();
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * test only
     * @private
     */
    set updateConfigPath(_) {
      this.clientPromise = null, this._appUpdateConfigPath = _, this.configOnDisk = new o.Lazy(() => this.loadUpdateConfig());
    }
    /**
     * Allows developer to override default logic for determining if an update is supported.
     * The default logic compares the `UpdateInfo` minimum system version against the `os.release()` with `semver` package
     */
    get isUpdateSupported() {
      return this._isUpdateSupported;
    }
    set isUpdateSupported(_) {
      _ && (this._isUpdateSupported = _);
    }
    constructor(_, S) {
      super(), this.autoDownload = !0, this.autoInstallOnAppQuit = !0, this.autoRunAppAfterInstall = !0, this.allowPrerelease = !1, this.fullChangelog = !1, this.allowDowngrade = !1, this.disableWebInstaller = !1, this.disableDifferentialDownload = !1, this.forceDevUpdateConfig = !1, this._channel = null, this.downloadedUpdateHelper = null, this.requestHeaders = null, this._logger = console, this.signals = new v.UpdaterSignal(this), this._appUpdateConfigPath = null, this._isUpdateSupported = (x) => this.checkIfUpdateSupported(x), this.clientPromise = null, this.stagingUserIdPromise = new o.Lazy(() => this.getOrCreateStagingUserId()), this.configOnDisk = new o.Lazy(() => this.loadUpdateConfig()), this.checkForUpdatesPromise = null, this.downloadPromise = null, this.updateInfoAndProvider = null, this._testOnlyOptions = null, this.on("error", (x) => {
        this._logger.error(`Error: ${x.stack || x.message}`);
      }), S == null ? (this.app = new n.ElectronAppAdapter(), this.httpExecutor = new f.ElectronHttpExecutor((x, M) => this.emit("login", x, M))) : (this.app = S, this.httpExecutor = null);
      const A = this.app.version, b = (0, a.parse)(A);
      if (b == null)
        throw (0, e.newError)(`App version is not a valid semver version: "${A}"`, "ERR_UPDATER_INVALID_VERSION");
      this.currentVersion = b, this.allowPrerelease = w(b), _ != null && (this.setFeedURL(_), typeof _ != "string" && _.requestHeaders && (this.requestHeaders = _.requestHeaders));
    }
    //noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
    getFeedURL() {
      return "Deprecated. Do not use it.";
    }
    /**
     * Configure update provider. If value is `string`, [GenericServerOptions](./publish.md#genericserveroptions) will be set with value as `url`.
     * @param options If you want to override configuration in the `app-update.yml`.
     */
    setFeedURL(_) {
      const S = this.createProviderRuntimeOptions();
      let A;
      typeof _ == "string" ? A = new c.GenericProvider({ provider: "generic", url: _ }, this, {
        ...S,
        isUseMultipleRangeRequest: (0, h.isUrlProbablySupportMultiRangeRequests)(_)
      }) : A = (0, h.createClient)(_, this, S), this.clientPromise = Promise.resolve(A);
    }
    /**
     * Asks the server whether there is an update.
     * @returns null if the updater is disabled, otherwise info about the latest version
     */
    checkForUpdates() {
      if (!this.isUpdaterActive())
        return Promise.resolve(null);
      let _ = this.checkForUpdatesPromise;
      if (_ != null)
        return this._logger.info("Checking for update (already in progress)"), _;
      const S = () => this.checkForUpdatesPromise = null;
      return this._logger.info("Checking for update"), _ = this.doCheckForUpdates().then((A) => (S(), A)).catch((A) => {
        throw S(), this.emit("error", A, `Cannot check for updates: ${(A.stack || A).toString()}`), A;
      }), this.checkForUpdatesPromise = _, _;
    }
    isUpdaterActive() {
      return this.app.isPackaged || this.forceDevUpdateConfig ? !0 : (this._logger.info("Skip checkForUpdates because application is not packed and dev update config is not forced"), !1);
    }
    // noinspection JSUnusedGlobalSymbols
    checkForUpdatesAndNotify(_) {
      return this.checkForUpdates().then((S) => S?.downloadPromise ? (S.downloadPromise.then(() => {
        const A = Sg.formatDownloadNotification(S.updateInfo.version, this.app.name, _);
        new Wt.Notification(A).show();
      }), S) : (this._logger.debug != null && this._logger.debug("checkForUpdatesAndNotify called, downloadPromise is null"), S));
    }
    static formatDownloadNotification(_, S, A) {
      return A == null && (A = {
        title: "A new update is ready to install",
        body: "{appName} version {version} has been downloaded and will be automatically installed on exit"
      }), A = {
        title: A.title.replace("{appName}", S).replace("{version}", _),
        body: A.body.replace("{appName}", S).replace("{version}", _)
      }, A;
    }
    async isStagingMatch(_) {
      const S = _.stagingPercentage;
      let A = S;
      if (A == null)
        return !0;
      if (A = parseInt(A, 10), isNaN(A))
        return this._logger.warn(`Staging percentage is NaN: ${S}`), !0;
      A = A / 100;
      const b = await this.stagingUserIdPromise.value, M = e.UUID.parse(b).readUInt32BE(12) / 4294967295;
      return this._logger.info(`Staging percentage: ${A}, percentage: ${M}, user id: ${b}`), M < A;
    }
    computeFinalHeaders(_) {
      return this.requestHeaders != null && Object.assign(_, this.requestHeaders), _;
    }
    async isUpdateAvailable(_) {
      const S = (0, a.parse)(_.version);
      if (S == null)
        throw (0, e.newError)(`This file could not be downloaded, or the latest version (from update server) does not have a valid semver version: "${_.version}"`, "ERR_UPDATER_INVALID_VERSION");
      const A = this.currentVersion;
      if ((0, a.eq)(S, A) || !await Promise.resolve(this.isUpdateSupported(_)) || !await this.isStagingMatch(_))
        return !1;
      const x = (0, a.gt)(S, A), M = (0, a.lt)(S, A);
      return x ? !0 : this.allowDowngrade && M;
    }
    checkIfUpdateSupported(_) {
      const S = _?.minimumSystemVersion, A = (0, i.release)();
      if (S)
        try {
          if ((0, a.lt)(A, S))
            return this._logger.info(`Current OS version ${A} is less than the minimum OS version required ${S} for version ${A}`), !1;
        } catch (b) {
          this._logger.warn(`Failed to compare current OS version(${A}) with minimum OS version(${S}): ${(b.message || b).toString()}`);
        }
      return !0;
    }
    async getUpdateInfoAndProvider() {
      await this.app.whenReady(), this.clientPromise == null && (this.clientPromise = this.configOnDisk.value.then((A) => (0, h.createClient)(A, this, this.createProviderRuntimeOptions())));
      const _ = await this.clientPromise, S = await this.stagingUserIdPromise.value;
      return _.setRequestHeaders(this.computeFinalHeaders({ "x-user-staging-id": S })), {
        info: await _.getLatestVersion(),
        provider: _
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
      const _ = await this.getUpdateInfoAndProvider(), S = _.info;
      if (!await this.isUpdateAvailable(S))
        return this._logger.info(`Update for version ${this.currentVersion.format()} is not available (latest version: ${S.version}, downgrade is ${this.allowDowngrade ? "allowed" : "disallowed"}).`), this.emit("update-not-available", S), {
          isUpdateAvailable: !1,
          versionInfo: S,
          updateInfo: S
        };
      this.updateInfoAndProvider = _, this.onUpdateAvailable(S);
      const A = new e.CancellationToken();
      return {
        isUpdateAvailable: !0,
        versionInfo: S,
        updateInfo: S,
        cancellationToken: A,
        downloadPromise: this.autoDownload ? this.downloadUpdate(A) : null
      };
    }
    onUpdateAvailable(_) {
      this._logger.info(`Found version ${_.version} (url: ${(0, e.asArray)(_.files).map((S) => S.url).join(", ")})`), this.emit("update-available", _);
    }
    /**
     * Start downloading update manually. You can use this method if `autoDownload` option is set to `false`.
     * @returns {Promise<Array<string>>} Paths to downloaded files.
     */
    downloadUpdate(_ = new e.CancellationToken()) {
      const S = this.updateInfoAndProvider;
      if (S == null) {
        const b = new Error("Please check update first");
        return this.dispatchError(b), Promise.reject(b);
      }
      if (this.downloadPromise != null)
        return this._logger.info("Downloading update (already in progress)"), this.downloadPromise;
      this._logger.info(`Downloading update from ${(0, e.asArray)(S.info.files).map((b) => b.url).join(", ")}`);
      const A = (b) => {
        if (!(b instanceof e.CancellationError))
          try {
            this.dispatchError(b);
          } catch (x) {
            this._logger.warn(`Cannot dispatch error event: ${x.stack || x}`);
          }
        return b;
      };
      return this.downloadPromise = this.doDownloadUpdate({
        updateInfoAndProvider: S,
        requestHeaders: this.computeRequestHeaders(S.provider),
        cancellationToken: _,
        disableWebInstaller: this.disableWebInstaller,
        disableDifferentialDownload: this.disableDifferentialDownload
      }).catch((b) => {
        throw A(b);
      }).finally(() => {
        this.downloadPromise = null;
      }), this.downloadPromise;
    }
    dispatchError(_) {
      this.emit("error", _, (_.stack || _).toString());
    }
    dispatchUpdateDownloaded(_) {
      this.emit(v.UPDATE_DOWNLOADED, _);
    }
    async loadUpdateConfig() {
      return this._appUpdateConfigPath == null && (this._appUpdateConfigPath = this.app.appUpdateConfigPath), (0, s.load)(await (0, u.readFile)(this._appUpdateConfigPath, "utf-8"));
    }
    computeRequestHeaders(_) {
      const S = _.fileExtraDownloadHeaders;
      if (S != null) {
        const A = this.requestHeaders;
        return A == null ? S : {
          ...S,
          ...A
        };
      }
      return this.computeFinalHeaders({ accept: "*/*" });
    }
    async getOrCreateStagingUserId() {
      const _ = d.join(this.app.userDataPath, ".updaterId");
      try {
        const A = await (0, u.readFile)(_, "utf-8");
        if (e.UUID.check(A))
          return A;
        this._logger.warn(`Staging user id file exists, but content was invalid: ${A}`);
      } catch (A) {
        A.code !== "ENOENT" && this._logger.warn(`Couldn't read staging user ID, creating a blank one: ${A}`);
      }
      const S = e.UUID.v5((0, t.randomBytes)(4096), e.UUID.OID);
      this._logger.info(`Generated new staging user ID: ${S}`);
      try {
        await (0, u.outputFile)(_, S);
      } catch (A) {
        this._logger.warn(`Couldn't write out staging user ID: ${A}`);
      }
      return S;
    }
    /** @internal */
    get isAddNoCacheQuery() {
      const _ = this.requestHeaders;
      if (_ == null)
        return !0;
      for (const S of Object.keys(_)) {
        const A = S.toLowerCase();
        if (A === "authorization" || A === "private-token")
          return !1;
      }
      return !0;
    }
    async getOrCreateDownloadHelper() {
      let _ = this.downloadedUpdateHelper;
      if (_ == null) {
        const S = (await this.configOnDisk.value).updaterCacheDirName, A = this._logger;
        S == null && A.error("updaterCacheDirName is not specified in app-update.yml Was app build using at least electron-builder 20.34.0?");
        const b = d.join(this.app.baseCachePath, S || this.app.name);
        A.debug != null && A.debug(`updater cache dir: ${b}`), _ = new l.DownloadedUpdateHelper(b), this.downloadedUpdateHelper = _;
      }
      return _;
    }
    async executeDownload(_) {
      const S = _.fileInfo, A = {
        headers: _.downloadUpdateOptions.requestHeaders,
        cancellationToken: _.downloadUpdateOptions.cancellationToken,
        sha2: S.info.sha2,
        sha512: S.info.sha512
      };
      this.listenerCount(v.DOWNLOAD_PROGRESS) > 0 && (A.onProgress = (H) => this.emit(v.DOWNLOAD_PROGRESS, H));
      const b = _.downloadUpdateOptions.updateInfoAndProvider.info, x = b.version, M = S.packageInfo;
      function j() {
        const H = decodeURIComponent(_.fileInfo.url.pathname);
        return H.endsWith(`.${_.fileExtension}`) ? d.basename(H) : _.fileInfo.info.url;
      }
      const X = await this.getOrCreateDownloadHelper(), P = X.cacheDirForPendingUpdate;
      await (0, u.mkdir)(P, { recursive: !0 });
      const D = j();
      let W = d.join(P, D);
      const L = M == null ? null : d.join(P, `package-${x}${d.extname(M.path) || ".7z"}`), F = async (H) => (await X.setDownloadedFile(W, L, b, S, D, H), await _.done({
        ...b,
        downloadedFile: W
      }), L == null ? [W] : [W, L]), G = this._logger, k = await X.validateDownloadedPath(W, b, S, G);
      if (k != null)
        return W = k, await F(!1);
      const q = async () => (await X.clear().catch(() => {
      }), await (0, u.unlink)(W).catch(() => {
      })), z = await (0, l.createTempUpdateFile)(`temp-${D}`, P, G);
      try {
        await _.task(z, A, L, q), await (0, e.retry)(() => (0, u.rename)(z, W), 60, 500, 0, 0, (H) => H instanceof Error && /^EBUSY:/.test(H.message));
      } catch (H) {
        throw await q(), H instanceof e.CancellationError && (G.info("cancelled"), this.emit("update-cancelled", b)), H;
      }
      return G.info(`New version ${x} has been downloaded to ${W}`), await F(!0);
    }
    async differentialDownloadInstaller(_, S, A, b, x) {
      try {
        if (this._testOnlyOptions != null && !this._testOnlyOptions.isUseDifferentialDownload)
          return !0;
        const M = (0, E.blockmapFiles)(_.url, this.app.version, S.updateInfoAndProvider.info.version);
        this._logger.info(`Download block maps (old: "${M[0]}", new: ${M[1]})`);
        const j = async (D) => {
          const W = await this.httpExecutor.downloadToBuffer(D, {
            headers: S.requestHeaders,
            cancellationToken: S.cancellationToken
          });
          if (W == null || W.length === 0)
            throw new Error(`Blockmap "${D.href}" is empty`);
          try {
            return JSON.parse((0, y.gunzipSync)(W).toString());
          } catch (L) {
            throw new Error(`Cannot parse blockmap "${D.href}", error: ${L}`);
          }
        }, X = {
          newUrl: _.url,
          oldFile: d.join(this.downloadedUpdateHelper.cacheDir, x),
          logger: this._logger,
          newFile: A,
          isUseMultipleRangeRequest: b.isUseMultipleRangeRequest,
          requestHeaders: S.requestHeaders,
          cancellationToken: S.cancellationToken
        };
        this.listenerCount(v.DOWNLOAD_PROGRESS) > 0 && (X.onProgress = (D) => this.emit(v.DOWNLOAD_PROGRESS, D));
        const P = await Promise.all(M.map((D) => j(D)));
        return await new p.GenericDifferentialDownloader(_.info, this.httpExecutor, X).download(P[0], P[1]), !1;
      } catch (M) {
        if (this._logger.error(`Cannot download differentially, fallback to full download: ${M.stack || M}`), this._testOnlyOptions != null)
          throw M;
        return !0;
      }
    }
  };
  cr.AppUpdater = m;
  function w(R) {
    const _ = (0, a.prerelease)(R);
    return _ != null && _.length > 0;
  }
  class T {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    info(_) {
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    warn(_) {
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    error(_) {
    }
  }
  return cr.NoOpLogger = T, cr;
}
var am;
function qr() {
  if (am) return Xr;
  am = 1, Object.defineProperty(Xr, "__esModule", { value: !0 }), Xr.BaseUpdater = void 0;
  const e = ta, t = dl();
  let i = class extends t.AppUpdater {
    constructor(u, s) {
      super(u, s), this.quitAndInstallCalled = !1, this.quitHandlerAdded = !1;
    }
    quitAndInstall(u = !1, s = !1) {
      this._logger.info("Install on explicit quitAndInstall"), this.install(u, u ? s : this.autoRunAppAfterInstall) ? setImmediate(() => {
        Wt.autoUpdater.emit("before-quit-for-update"), this.app.quit();
      }) : this.quitAndInstallCalled = !1;
    }
    executeDownload(u) {
      return super.executeDownload({
        ...u,
        done: (s) => (this.dispatchUpdateDownloaded(s), this.addQuitHandler(), Promise.resolve())
      });
    }
    get installerPath() {
      return this.downloadedUpdateHelper == null ? null : this.downloadedUpdateHelper.file;
    }
    // must be sync (because quit even handler is not async)
    install(u = !1, s = !1) {
      if (this.quitAndInstallCalled)
        return this._logger.warn("install call ignored: quitAndInstallCalled is set to true"), !1;
      const o = this.downloadedUpdateHelper, d = this.installerPath, a = o == null ? null : o.downloadedFileInfo;
      if (d == null || a == null)
        return this.dispatchError(new Error("No valid update available, can't quit and install")), !1;
      this.quitAndInstallCalled = !0;
      try {
        return this._logger.info(`Install: isSilent: ${u}, isForceRunAfter: ${s}`), this.doInstall({
          isSilent: u,
          isForceRunAfter: s,
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
      const { name: u } = this.app, s = `"${u} would like to update"`, o = this.spawnSyncLog("which gksudo || which kdesudo || which pkexec || which beesu"), d = [o];
      return /kdesudo/i.test(o) ? (d.push("--comment", s), d.push("-c")) : /gksudo/i.test(o) ? d.push("--message", s) : /pkexec/i.test(o) && d.push("--disable-internal-agent"), d.join(" ");
    }
    spawnSyncLog(u, s = [], o = {}) {
      this._logger.info(`Executing: ${u} with args: ${s}`);
      const d = (0, e.spawnSync)(u, s, {
        env: { ...process.env, ...o },
        encoding: "utf-8",
        shell: !0
      }), { error: a, status: l, stdout: n, stderr: f } = d;
      if (a != null)
        throw this._logger.error(f), a;
      if (l != null && l !== 0)
        throw this._logger.error(f), new Error(`Command ${u} exited with code ${l}`);
      return n.trim();
    }
    /**
     * This handles both node 8 and node 10 way of emitting error when spawning a process
     *   - node 8: Throws the error
     *   - node 10: Emit the error(Need to listen with on)
     */
    // https://github.com/electron-userland/electron-builder/issues/1129
    // Node 8 sends errors: https://nodejs.org/dist/latest-v8.x/docs/api/errors.html#errors_common_system_errors
    async spawnLog(u, s = [], o = void 0, d = "ignore") {
      return this._logger.info(`Executing: ${u} with args: ${s}`), new Promise((a, l) => {
        try {
          const n = { stdio: d, env: o, detached: !0 }, f = (0, e.spawn)(u, s, n);
          f.on("error", (c) => {
            l(c);
          }), f.unref(), f.pid !== void 0 && a(!0);
        } catch (n) {
          l(n);
        }
      });
    }
  };
  return Xr.BaseUpdater = i, Xr;
}
var ln = {}, cn = {}, sm;
function Tg() {
  if (sm) return cn;
  sm = 1, Object.defineProperty(cn, "__esModule", { value: !0 }), cn.FileWithEmbeddedBlockMapDifferentialDownloader = void 0;
  const e = /* @__PURE__ */ Qt(), t = wg(), i = Tm;
  let r = class extends t.DifferentialDownloader {
    async download() {
      const d = this.blockAwareFileInfo, a = d.size, l = a - (d.blockMapSize + 4);
      this.fileMetadataBuffer = await this.readRemoteBytes(l, a - 1);
      const n = u(this.fileMetadataBuffer.slice(0, this.fileMetadataBuffer.length - 4));
      await this.doDownload(await s(this.options.oldFile), n);
    }
  };
  cn.FileWithEmbeddedBlockMapDifferentialDownloader = r;
  function u(o) {
    return JSON.parse((0, i.inflateRawSync)(o).toString());
  }
  async function s(o) {
    const d = await (0, e.open)(o, "r");
    try {
      const a = (await (0, e.fstat)(d)).size, l = Buffer.allocUnsafe(4);
      await (0, e.read)(d, l, 0, l.length, a - l.length);
      const n = Buffer.allocUnsafe(l.readUInt32BE(0));
      return await (0, e.read)(d, n, 0, n.length, a - l.length - n.length), await (0, e.close)(d), u(n);
    } catch (a) {
      throw await (0, e.close)(d), a;
    }
  }
  return cn;
}
var om;
function um() {
  if (om) return ln;
  om = 1, Object.defineProperty(ln, "__esModule", { value: !0 }), ln.AppImageUpdater = void 0;
  const e = Qe(), t = ta, i = /* @__PURE__ */ Qt(), r = Rt, u = De, s = qr(), o = Tg(), d = gt(), a = yr();
  let l = class extends s.BaseUpdater {
    constructor(f, c) {
      super(f, c);
    }
    isUpdaterActive() {
      return process.env.APPIMAGE == null ? (process.env.SNAP == null ? this._logger.warn("APPIMAGE env is not defined, current application is not an AppImage") : this._logger.info("SNAP env is defined, updater is disabled"), !1) : super.isUpdaterActive();
    }
    /*** @private */
    doDownloadUpdate(f) {
      const c = f.updateInfoAndProvider.provider, h = (0, d.findFile)(c.resolveFiles(f.updateInfoAndProvider.info), "AppImage", ["rpm", "deb", "pacman"]);
      return this.executeDownload({
        fileExtension: "AppImage",
        fileInfo: h,
        downloadUpdateOptions: f,
        task: async (y, E) => {
          const p = process.env.APPIMAGE;
          if (p == null)
            throw (0, e.newError)("APPIMAGE env is not defined", "ERR_UPDATER_OLD_FILE_NOT_FOUND");
          (f.disableDifferentialDownload || await this.downloadDifferential(h, p, y, c, f)) && await this.httpExecutor.download(h.url, y, E), await (0, i.chmod)(y, 493);
        }
      });
    }
    async downloadDifferential(f, c, h, y, E) {
      try {
        const p = {
          newUrl: f.url,
          oldFile: c,
          logger: this._logger,
          newFile: h,
          isUseMultipleRangeRequest: y.isUseMultipleRangeRequest,
          requestHeaders: E.requestHeaders,
          cancellationToken: E.cancellationToken
        };
        return this.listenerCount(a.DOWNLOAD_PROGRESS) > 0 && (p.onProgress = (v) => this.emit(a.DOWNLOAD_PROGRESS, v)), await new o.FileWithEmbeddedBlockMapDifferentialDownloader(f.info, this.httpExecutor, p).download(), !1;
      } catch (p) {
        return this._logger.error(`Cannot download differentially, fallback to full download: ${p.stack || p}`), process.platform === "linux";
      }
    }
    doInstall(f) {
      const c = process.env.APPIMAGE;
      if (c == null)
        throw (0, e.newError)("APPIMAGE env is not defined", "ERR_UPDATER_OLD_FILE_NOT_FOUND");
      (0, r.unlinkSync)(c);
      let h;
      const y = u.basename(c), E = this.installerPath;
      if (E == null)
        return this.dispatchError(new Error("No valid update available, can't quit and install")), !1;
      u.basename(E) === y || !/\d+\.\d+\.\d+/.test(y) ? h = c : h = u.join(u.dirname(c), u.basename(E)), (0, t.execFileSync)("mv", ["-f", E, h]), h !== c && this.emit("appimage-filename-updated", h);
      const p = {
        ...process.env,
        APPIMAGE_SILENT_INSTALL: "true"
      };
      return f.isForceRunAfter ? this.spawnLog(h, [], p) : (p.APPIMAGE_EXIT_AFTER_INSTALL = "true", (0, t.execFileSync)(h, [], { env: p })), !0;
    }
  };
  return ln.AppImageUpdater = l, ln;
}
var fn = {}, lm;
function cm() {
  if (lm) return fn;
  lm = 1, Object.defineProperty(fn, "__esModule", { value: !0 }), fn.DebUpdater = void 0;
  const e = qr(), t = gt(), i = yr();
  let r = class extends e.BaseUpdater {
    constructor(s, o) {
      super(s, o);
    }
    /*** @private */
    doDownloadUpdate(s) {
      const o = s.updateInfoAndProvider.provider, d = (0, t.findFile)(o.resolveFiles(s.updateInfoAndProvider.info), "deb", ["AppImage", "rpm", "pacman"]);
      return this.executeDownload({
        fileExtension: "deb",
        fileInfo: d,
        downloadUpdateOptions: s,
        task: async (a, l) => {
          this.listenerCount(i.DOWNLOAD_PROGRESS) > 0 && (l.onProgress = (n) => this.emit(i.DOWNLOAD_PROGRESS, n)), await this.httpExecutor.download(d.url, a, l);
        }
      });
    }
    get installerPath() {
      var s, o;
      return (o = (s = super.installerPath) === null || s === void 0 ? void 0 : s.replace(/ /g, "\\ ")) !== null && o !== void 0 ? o : null;
    }
    doInstall(s) {
      const o = this.wrapSudo(), d = /pkexec/i.test(o) ? "" : '"', a = this.installerPath;
      if (a == null)
        return this.dispatchError(new Error("No valid update available, can't quit and install")), !1;
      const l = ["dpkg", "-i", a, "||", "apt-get", "install", "-f", "-y"];
      return this.spawnSyncLog(o, [`${d}/bin/bash`, "-c", `'${l.join(" ")}'${d}`]), s.isForceRunAfter && this.app.relaunch(), !0;
    }
  };
  return fn.DebUpdater = r, fn;
}
var dn = {}, fm;
function dm() {
  if (fm) return dn;
  fm = 1, Object.defineProperty(dn, "__esModule", { value: !0 }), dn.PacmanUpdater = void 0;
  const e = qr(), t = yr(), i = gt();
  let r = class extends e.BaseUpdater {
    constructor(s, o) {
      super(s, o);
    }
    /*** @private */
    doDownloadUpdate(s) {
      const o = s.updateInfoAndProvider.provider, d = (0, i.findFile)(o.resolveFiles(s.updateInfoAndProvider.info), "pacman", ["AppImage", "deb", "rpm"]);
      return this.executeDownload({
        fileExtension: "pacman",
        fileInfo: d,
        downloadUpdateOptions: s,
        task: async (a, l) => {
          this.listenerCount(t.DOWNLOAD_PROGRESS) > 0 && (l.onProgress = (n) => this.emit(t.DOWNLOAD_PROGRESS, n)), await this.httpExecutor.download(d.url, a, l);
        }
      });
    }
    get installerPath() {
      var s, o;
      return (o = (s = super.installerPath) === null || s === void 0 ? void 0 : s.replace(/ /g, "\\ ")) !== null && o !== void 0 ? o : null;
    }
    doInstall(s) {
      const o = this.wrapSudo(), d = /pkexec/i.test(o) ? "" : '"', a = this.installerPath;
      if (a == null)
        return this.dispatchError(new Error("No valid update available, can't quit and install")), !1;
      const l = ["pacman", "-U", "--noconfirm", a];
      return this.spawnSyncLog(o, [`${d}/bin/bash`, "-c", `'${l.join(" ")}'${d}`]), s.isForceRunAfter && this.app.relaunch(), !0;
    }
  };
  return dn.PacmanUpdater = r, dn;
}
var hn = {}, hm;
function pm() {
  if (hm) return hn;
  hm = 1, Object.defineProperty(hn, "__esModule", { value: !0 }), hn.RpmUpdater = void 0;
  const e = qr(), t = yr(), i = gt();
  let r = class extends e.BaseUpdater {
    constructor(s, o) {
      super(s, o);
    }
    /*** @private */
    doDownloadUpdate(s) {
      const o = s.updateInfoAndProvider.provider, d = (0, i.findFile)(o.resolveFiles(s.updateInfoAndProvider.info), "rpm", ["AppImage", "deb", "pacman"]);
      return this.executeDownload({
        fileExtension: "rpm",
        fileInfo: d,
        downloadUpdateOptions: s,
        task: async (a, l) => {
          this.listenerCount(t.DOWNLOAD_PROGRESS) > 0 && (l.onProgress = (n) => this.emit(t.DOWNLOAD_PROGRESS, n)), await this.httpExecutor.download(d.url, a, l);
        }
      });
    }
    get installerPath() {
      var s, o;
      return (o = (s = super.installerPath) === null || s === void 0 ? void 0 : s.replace(/ /g, "\\ ")) !== null && o !== void 0 ? o : null;
    }
    doInstall(s) {
      const o = this.wrapSudo(), d = /pkexec/i.test(o) ? "" : '"', a = this.spawnSyncLog("which zypper"), l = this.installerPath;
      if (l == null)
        return this.dispatchError(new Error("No valid update available, can't quit and install")), !1;
      let n;
      return a ? n = [a, "--no-refresh", "install", "--allow-unsigned-rpm", "-y", "-f", l] : n = [this.spawnSyncLog("which dnf || which yum"), "-y", "install", l], this.spawnSyncLog(o, [`${d}/bin/bash`, "-c", `'${n.join(" ")}'${d}`]), s.isForceRunAfter && this.app.relaunch(), !0;
    }
  };
  return hn.RpmUpdater = r, hn;
}
var pn = {}, mm;
function gm() {
  if (mm) return pn;
  mm = 1, Object.defineProperty(pn, "__esModule", { value: !0 }), pn.MacUpdater = void 0;
  const e = Qe(), t = /* @__PURE__ */ Qt(), i = Rt, r = De, u = by, s = dl(), o = gt(), d = ta, a = Pr;
  let l = class extends s.AppUpdater {
    constructor(f, c) {
      super(f, c), this.nativeUpdater = Wt.autoUpdater, this.squirrelDownloadedUpdate = !1, this.nativeUpdater.on("error", (h) => {
        this._logger.warn(h), this.emit("error", h);
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
      const h = this._logger, y = "sysctl.proc_translated";
      let E = !1;
      try {
        this.debug("Checking for macOS Rosetta environment"), E = (0, d.execFileSync)("sysctl", [y], { encoding: "utf8" }).includes(`${y}: 1`), h.info(`Checked for macOS Rosetta environment (isRosetta=${E})`);
      } catch (R) {
        h.warn(`sysctl shell command to check for macOS Rosetta environment failed: ${R}`);
      }
      let p = !1;
      try {
        this.debug("Checking for arm64 in uname");
        const _ = (0, d.execFileSync)("uname", ["-a"], { encoding: "utf8" }).includes("ARM");
        h.info(`Checked 'uname -a': arm64=${_}`), p = p || _;
      } catch (R) {
        h.warn(`uname shell command to check for arm64 failed: ${R}`);
      }
      p = p || process.arch === "arm64" || E;
      const v = (R) => {
        var _;
        return R.url.pathname.includes("arm64") || ((_ = R.info.url) === null || _ === void 0 ? void 0 : _.includes("arm64"));
      };
      p && c.some(v) ? c = c.filter((R) => p === v(R)) : c = c.filter((R) => !v(R));
      const m = (0, o.findFile)(c, "zip", ["pkg", "dmg"]);
      if (m == null)
        throw (0, e.newError)(`ZIP file not provided: ${(0, e.safeStringifyJson)(c)}`, "ERR_UPDATER_ZIP_FILE_NOT_FOUND");
      const w = f.updateInfoAndProvider.provider, T = "update.zip";
      return this.executeDownload({
        fileExtension: "zip",
        fileInfo: m,
        downloadUpdateOptions: f,
        task: async (R, _) => {
          const S = r.join(this.downloadedUpdateHelper.cacheDir, T), A = () => (0, t.pathExistsSync)(S) ? !f.disableDifferentialDownload : (h.info("Unable to locate previous update.zip for differential download (is this first install?), falling back to full download"), !1);
          let b = !0;
          A() && (b = await this.differentialDownloadInstaller(m, f, R, w, T)), b && await this.httpExecutor.download(m.url, R, _);
        },
        done: async (R) => {
          if (!f.disableDifferentialDownload)
            try {
              const _ = r.join(this.downloadedUpdateHelper.cacheDir, T);
              await (0, t.copyFile)(R.downloadedFile, _);
            } catch (_) {
              this._logger.warn(`Unable to copy file for caching for future differential downloads: ${_.message}`);
            }
          return this.updateDownloaded(m, R);
        }
      });
    }
    async updateDownloaded(f, c) {
      var h;
      const y = c.downloadedFile, E = (h = f.info.size) !== null && h !== void 0 ? h : (await (0, t.stat)(y)).size, p = this._logger, v = `fileToProxy=${f.url.href}`;
      this.closeServerIfExists(), this.debug(`Creating proxy server for native Squirrel.Mac (${v})`), this.server = (0, u.createServer)(), this.debug(`Proxy server for native Squirrel.Mac is created (${v})`), this.server.on("close", () => {
        p.info(`Proxy server for native Squirrel.Mac is closed (${v})`);
      });
      const m = (w) => {
        const T = w.address();
        return typeof T == "string" ? T : `http://127.0.0.1:${T?.port}`;
      };
      return await new Promise((w, T) => {
        const R = (0, a.randomBytes)(64).toString("base64").replace(/\//g, "_").replace(/\+/g, "-"), _ = Buffer.from(`autoupdater:${R}`, "ascii"), S = `/${(0, a.randomBytes)(64).toString("hex")}.zip`;
        this.server.on("request", (A, b) => {
          const x = A.url;
          if (p.info(`${x} requested`), x === "/") {
            if (!A.headers.authorization || A.headers.authorization.indexOf("Basic ") === -1) {
              b.statusCode = 401, b.statusMessage = "Invalid Authentication Credentials", b.end(), p.warn("No authenthication info");
              return;
            }
            const X = A.headers.authorization.split(" ")[1], P = Buffer.from(X, "base64").toString("ascii"), [D, W] = P.split(":");
            if (D !== "autoupdater" || W !== R) {
              b.statusCode = 401, b.statusMessage = "Invalid Authentication Credentials", b.end(), p.warn("Invalid authenthication credentials");
              return;
            }
            const L = Buffer.from(`{ "url": "${m(this.server)}${S}" }`);
            b.writeHead(200, { "Content-Type": "application/json", "Content-Length": L.length }), b.end(L);
            return;
          }
          if (!x.startsWith(S)) {
            p.warn(`${x} requested, but not supported`), b.writeHead(404), b.end();
            return;
          }
          p.info(`${S} requested by Squirrel.Mac, pipe ${y}`);
          let M = !1;
          b.on("finish", () => {
            M || (this.nativeUpdater.removeListener("error", T), w([]));
          });
          const j = (0, i.createReadStream)(y);
          j.on("error", (X) => {
            try {
              b.end();
            } catch (P) {
              p.warn(`cannot end response: ${P}`);
            }
            M = !0, this.nativeUpdater.removeListener("error", T), T(new Error(`Cannot pipe "${y}": ${X}`));
          }), b.writeHead(200, {
            "Content-Type": "application/zip",
            "Content-Length": E
          }), j.pipe(b);
        }), this.debug(`Proxy server for native Squirrel.Mac is starting to listen (${v})`), this.server.listen(0, "127.0.0.1", () => {
          this.debug(`Proxy server for native Squirrel.Mac is listening (address=${m(this.server)}, ${v})`), this.nativeUpdater.setFeedURL({
            url: m(this.server),
            headers: {
              "Cache-Control": "no-cache",
              Authorization: `Basic ${_.toString("base64")}`
            }
          }), this.dispatchUpdateDownloaded(c), this.autoInstallOnAppQuit ? (this.nativeUpdater.once("error", T), this.nativeUpdater.checkForUpdates()) : w([]);
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
  return pn.MacUpdater = l, pn;
}
var mn = {}, Wi = {}, ym;
function pw() {
  if (ym) return Wi;
  ym = 1, Object.defineProperty(Wi, "__esModule", { value: !0 }), Wi.verifySignature = u;
  const e = Qe(), t = ta, i = Sn, r = De;
  function u(a, l, n) {
    return new Promise((f, c) => {
      const h = l.replace(/'/g, "''");
      n.info(`Verifying signature ${h}`), (0, t.execFile)('set "PSModulePath=" & chcp 65001 >NUL & powershell.exe', ["-NoProfile", "-NonInteractive", "-InputFormat", "None", "-Command", `"Get-AuthenticodeSignature -LiteralPath '${h}' | ConvertTo-Json -Compress"`], {
        shell: !0,
        timeout: 20 * 1e3
      }, (y, E, p) => {
        var v;
        try {
          if (y != null || p) {
            o(n, y, p, c), f(null);
            return;
          }
          const m = s(E);
          if (m.Status === 0) {
            try {
              const _ = r.normalize(m.Path), S = r.normalize(l);
              if (n.info(`LiteralPath: ${_}. Update Path: ${S}`), _ !== S) {
                o(n, new Error(`LiteralPath of ${_} is different than ${S}`), p, c), f(null);
                return;
              }
            } catch (_) {
              n.warn(`Unable to verify LiteralPath of update asset due to missing data.Path. Skipping this step of validation. Message: ${(v = _.message) !== null && v !== void 0 ? v : _.stack}`);
            }
            const T = (0, e.parseDn)(m.SignerCertificate.Subject);
            let R = !1;
            for (const _ of a) {
              const S = (0, e.parseDn)(_);
              if (S.size ? R = Array.from(S.keys()).every((b) => S.get(b) === T.get(b)) : _ === T.get("CN") && (n.warn(`Signature validated using only CN ${_}. Please add your full Distinguished Name (DN) to publisherNames configuration`), R = !0), R) {
                f(null);
                return;
              }
            }
          }
          const w = `publisherNames: ${a.join(" | ")}, raw info: ` + JSON.stringify(m, (T, R) => T === "RawData" ? void 0 : R, 2);
          n.warn(`Sign verification failed, installer signed with incorrect certificate: ${w}`), f(w);
        } catch (m) {
          o(n, m, null, c), f(null);
          return;
        }
      });
    });
  }
  function s(a) {
    const l = JSON.parse(a);
    delete l.PrivateKey, delete l.IsOSBinary, delete l.SignatureType;
    const n = l.SignerCertificate;
    return n != null && (delete n.Archived, delete n.Extensions, delete n.Handle, delete n.HasPrivateKey, delete n.SubjectName), l;
  }
  function o(a, l, n, f) {
    if (d()) {
      a.warn(`Cannot execute Get-AuthenticodeSignature: ${l || n}. Ignoring signature validation due to unsupported powershell version. Please upgrade to powershell 3 or higher.`);
      return;
    }
    try {
      (0, t.execFileSync)("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", "ConvertTo-Json test"], { timeout: 10 * 1e3 });
    } catch (c) {
      a.warn(`Cannot execute ConvertTo-Json: ${c.message}. Ignoring signature validation due to unsupported powershell version. Please upgrade to powershell 3 or higher.`);
      return;
    }
    l != null && f(l), n && f(new Error(`Cannot execute Get-AuthenticodeSignature, stderr: ${n}. Failing signature validation due to unknown stderr.`));
  }
  function d() {
    const a = i.release();
    return a.startsWith("6.") && !a.startsWith("6.3");
  }
  return Wi;
}
var Em;
function vm() {
  if (Em) return mn;
  Em = 1, Object.defineProperty(mn, "__esModule", { value: !0 }), mn.NsisUpdater = void 0;
  const e = Qe(), t = De, i = qr(), r = Tg(), u = yr(), s = gt(), o = /* @__PURE__ */ Qt(), d = pw(), a = Cr;
  let l = class extends i.BaseUpdater {
    constructor(f, c) {
      super(f, c), this._verifyUpdateCodeSignature = (h, y) => (0, d.verifySignature)(h, y, this._logger);
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
      const c = f.updateInfoAndProvider.provider, h = (0, s.findFile)(c.resolveFiles(f.updateInfoAndProvider.info), "exe");
      return this.executeDownload({
        fileExtension: "exe",
        downloadUpdateOptions: f,
        fileInfo: h,
        task: async (y, E, p, v) => {
          const m = h.packageInfo, w = m != null && p != null;
          if (w && f.disableWebInstaller)
            throw (0, e.newError)(`Unable to download new version ${f.updateInfoAndProvider.info.version}. Web Installers are disabled`, "ERR_UPDATER_WEB_INSTALLER_DISABLED");
          !w && !f.disableWebInstaller && this._logger.warn("disableWebInstaller is set to false, you should set it to true if you do not plan on using a web installer. This will default to true in a future version."), (w || f.disableDifferentialDownload || await this.differentialDownloadInstaller(h, f, y, c, e.CURRENT_APP_INSTALLER_FILE_NAME)) && await this.httpExecutor.download(h.url, y, E);
          const T = await this.verifySignature(y);
          if (T != null)
            throw await v(), (0, e.newError)(`New version ${f.updateInfoAndProvider.info.version} is not signed by the application owner: ${T}`, "ERR_UPDATER_INVALID_SIGNATURE");
          if (w && await this.differentialDownloadWebPackage(f, m, p, c))
            try {
              await this.httpExecutor.download(new a.URL(m.path), p, {
                headers: f.requestHeaders,
                cancellationToken: f.cancellationToken,
                sha512: m.sha512
              });
            } catch (R) {
              try {
                await (0, o.unlink)(p);
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
      } catch (h) {
        if (h.code === "ENOENT")
          return null;
        throw h;
      }
      return await this._verifyUpdateCodeSignature(Array.isArray(c) ? c : [c], f);
    }
    doInstall(f) {
      const c = this.installerPath;
      if (c == null)
        return this.dispatchError(new Error("No valid update available, can't quit and install")), !1;
      const h = ["--updated"];
      f.isSilent && h.push("/S"), f.isForceRunAfter && h.push("--force-run"), this.installDirectory && h.push(`/D=${this.installDirectory}`);
      const y = this.downloadedUpdateHelper == null ? null : this.downloadedUpdateHelper.packageFile;
      y != null && h.push(`--package-file=${y}`);
      const E = () => {
        this.spawnLog(t.join(process.resourcesPath, "elevate.exe"), [c].concat(h)).catch((p) => this.dispatchError(p));
      };
      return f.isAdminRightsRequired ? (this._logger.info("isAdminRightsRequired is set to true, run installer using elevate.exe"), E(), !0) : (this.spawnLog(c, h).catch((p) => {
        const v = p.code;
        this._logger.info(`Cannot run installer: error code: ${v}, error message: "${p.message}", will be executed again using elevate if EACCES, and will try to use electron.shell.openItem if ENOENT`), v === "UNKNOWN" || v === "EACCES" ? E() : v === "ENOENT" ? Wt.shell.openPath(c).catch((m) => this.dispatchError(m)) : this.dispatchError(p);
      }), !0);
    }
    async differentialDownloadWebPackage(f, c, h, y) {
      if (c.blockMapSize == null)
        return !0;
      try {
        const E = {
          newUrl: new a.URL(c.path),
          oldFile: t.join(this.downloadedUpdateHelper.cacheDir, e.CURRENT_APP_PACKAGE_FILE_NAME),
          logger: this._logger,
          newFile: h,
          requestHeaders: this.requestHeaders,
          isUseMultipleRangeRequest: y.isUseMultipleRangeRequest,
          cancellationToken: f.cancellationToken
        };
        this.listenerCount(u.DOWNLOAD_PROGRESS) > 0 && (E.onProgress = (p) => this.emit(u.DOWNLOAD_PROGRESS, p)), await new r.FileWithEmbeddedBlockMapDifferentialDownloader(c, this.httpExecutor, E).download();
      } catch (E) {
        return this._logger.error(`Cannot download differentially, fallback to full download: ${E.stack || E}`), process.platform === "win32";
      }
      return !1;
    }
  };
  return mn.NsisUpdater = l, mn;
}
var _m;
function mw() {
  return _m || (_m = 1, (function(e) {
    var t = lr && lr.__createBinding || (Object.create ? (function(p, v, m, w) {
      w === void 0 && (w = m);
      var T = Object.getOwnPropertyDescriptor(v, m);
      (!T || ("get" in T ? !v.__esModule : T.writable || T.configurable)) && (T = { enumerable: !0, get: function() {
        return v[m];
      } }), Object.defineProperty(p, w, T);
    }) : (function(p, v, m, w) {
      w === void 0 && (w = m), p[w] = v[m];
    })), i = lr && lr.__exportStar || function(p, v) {
      for (var m in p) m !== "default" && !Object.prototype.hasOwnProperty.call(v, m) && t(v, p, m);
    };
    Object.defineProperty(e, "__esModule", { value: !0 }), e.NsisUpdater = e.MacUpdater = e.RpmUpdater = e.PacmanUpdater = e.DebUpdater = e.AppImageUpdater = e.Provider = e.NoOpLogger = e.AppUpdater = e.BaseUpdater = void 0;
    const r = /* @__PURE__ */ Qt(), u = De;
    var s = qr();
    Object.defineProperty(e, "BaseUpdater", { enumerable: !0, get: function() {
      return s.BaseUpdater;
    } });
    var o = dl();
    Object.defineProperty(e, "AppUpdater", { enumerable: !0, get: function() {
      return o.AppUpdater;
    } }), Object.defineProperty(e, "NoOpLogger", { enumerable: !0, get: function() {
      return o.NoOpLogger;
    } });
    var d = gt();
    Object.defineProperty(e, "Provider", { enumerable: !0, get: function() {
      return d.Provider;
    } });
    var a = um();
    Object.defineProperty(e, "AppImageUpdater", { enumerable: !0, get: function() {
      return a.AppImageUpdater;
    } });
    var l = cm();
    Object.defineProperty(e, "DebUpdater", { enumerable: !0, get: function() {
      return l.DebUpdater;
    } });
    var n = dm();
    Object.defineProperty(e, "PacmanUpdater", { enumerable: !0, get: function() {
      return n.PacmanUpdater;
    } });
    var f = pm();
    Object.defineProperty(e, "RpmUpdater", { enumerable: !0, get: function() {
      return f.RpmUpdater;
    } });
    var c = gm();
    Object.defineProperty(e, "MacUpdater", { enumerable: !0, get: function() {
      return c.MacUpdater;
    } });
    var h = vm();
    Object.defineProperty(e, "NsisUpdater", { enumerable: !0, get: function() {
      return h.NsisUpdater;
    } }), i(yr(), e);
    let y;
    function E() {
      if (process.platform === "win32")
        y = new (vm()).NsisUpdater();
      else if (process.platform === "darwin")
        y = new (gm()).MacUpdater();
      else {
        y = new (um()).AppImageUpdater();
        try {
          const p = u.join(process.resourcesPath, "package-type");
          if (!(0, r.existsSync)(p))
            return y;
          console.info("Checking for beta autoupdate feature for deb/rpm distributions");
          const v = (0, r.readFileSync)(p).toString().trim();
          switch (console.info("Found package-type:", v), v) {
            case "deb":
              y = new (cm()).DebUpdater();
              break;
            case "rpm":
              y = new (pm()).RpmUpdater();
              break;
            case "pacman":
              y = new (dm()).PacmanUpdater();
              break;
            default:
              break;
          }
        } catch (p) {
          console.warn("Unable to detect 'package-type' for autoUpdater (beta rpm/deb support). If you'd like to expand support, please consider contributing to electron-builder", p.message);
        }
      }
      return y;
    }
    Object.defineProperty(e, "autoUpdater", {
      enumerable: !0,
      get: () => y || E()
    });
  })(lr)), lr;
}
var st = mw();
let Yt = null, $r = { status: "idle" };
function qt(e) {
  $r = { ...$r, ...e }, gw();
}
function gw() {
  Yt && !Yt.isDestroyed() && Yt.webContents.send("auto-update:state", $r);
}
function yw(e) {
  Yt = e, st.autoUpdater.autoDownload = !1, st.autoUpdater.autoInstallOnAppQuit = !0, st.autoUpdater.autoRunAppAfterInstall = !0, st.autoUpdater.allowPrerelease = !1, st.autoUpdater.logger = {
    info: (t) => console.log("[AutoUpdater]", t),
    warn: (t) => console.warn("[AutoUpdater]", t),
    error: (t) => console.error("[AutoUpdater]", t),
    debug: (t) => console.log("[AutoUpdater DEBUG]", t)
  }, st.autoUpdater.on("checking-for-update", () => {
    console.log("[AutoUpdater] Checking for updates..."), qt({ status: "checking" });
  }), st.autoUpdater.on("update-available", (t) => {
    console.log("[AutoUpdater] Update available:", t.version), qt({
      status: "available",
      version: t.version,
      releaseNotes: typeof t.releaseNotes == "string" ? t.releaseNotes : Array.isArray(t.releaseNotes) ? t.releaseNotes.map((i) => i.note).join(`
`) : void 0
    });
  }), st.autoUpdater.on("update-not-available", (t) => {
    console.log("[AutoUpdater] No updates available. Current:", t.version), qt({
      status: "not-available",
      version: t.version
    });
  }), st.autoUpdater.on("download-progress", (t) => {
    console.log(`[AutoUpdater] Download progress: ${t.percent.toFixed(1)}%`), qt({
      status: "downloading",
      progress: t.percent,
      bytesPerSecond: t.bytesPerSecond,
      downloadedBytes: t.transferred,
      totalBytes: t.total
    });
  }), st.autoUpdater.on("update-downloaded", (t) => {
    console.log("[AutoUpdater] Update downloaded:", t.version), qt({
      status: "downloaded",
      version: t.version,
      releaseNotes: typeof t.releaseNotes == "string" ? t.releaseNotes : Array.isArray(t.releaseNotes) ? t.releaseNotes.map((i) => i.note).join(`
`) : void 0
    }), vw(t.version);
  }), st.autoUpdater.on("error", (t) => {
    console.error("[AutoUpdater] Error:", t.message), qt({
      status: "error",
      error: t.message
    });
  }), _w(), Ne.isPackaged && (setTimeout(() => {
    ku(!1);
  }, 1e4), setInterval(() => {
    ku(!1);
  }, 14400 * 1e3)), console.log("[AutoUpdater] Initialized");
}
async function ku(e = !0) {
  try {
    return Ne.isPackaged ? await st.autoUpdater.checkForUpdates() : (console.log("[AutoUpdater] Skipping update check in development mode"), e || qt({
      status: "not-available",
      version: Ne.getVersion()
    }), null);
  } catch (t) {
    const i = t instanceof Error ? t.message : "Unknown error";
    return console.error("[AutoUpdater] Check failed:", i), e || qt({
      status: "error",
      error: i
    }), null;
  }
}
async function Ew() {
  try {
    await st.autoUpdater.downloadUpdate();
  } catch (e) {
    const t = e instanceof Error ? e.message : "Download failed";
    console.error("[AutoUpdater] Download failed:", t), qt({
      status: "error",
      error: t
    });
  }
}
function Rg() {
  console.log("[AutoUpdater] Installing update and restarting..."), st.autoUpdater.quitAndInstall(!1, !0);
}
async function vw(e) {
  if (!Yt || Yt.isDestroyed()) return;
  const { response: t } = await wy.showMessageBox(Yt, {
    type: "info",
    title: "Actualización Lista",
    message: `Una nueva versión (${e}) está lista para instalar.`,
    detail: "La aplicación se reiniciará para aplicar la actualización.",
    buttons: ["Reiniciar Ahora", "Más Tarde"],
    defaultId: 0,
    cancelId: 1
  });
  t === 0 && Rg();
}
function _w() {
  fe.handle("auto-update:check", async (e, t) => (await ku(t ?? !0), $r)), fe.handle("auto-update:download", async () => (await Ew(), $r)), fe.handle("auto-update:install", () => {
    Rg();
  }), fe.handle("auto-update:getState", () => $r), fe.handle("auto-update:getVersion", () => Ne.getVersion());
}
function ww() {
  fe.removeHandler("auto-update:check"), fe.removeHandler("auto-update:download"), fe.removeHandler("auto-update:install"), fe.removeHandler("auto-update:getState"), fe.removeHandler("auto-update:getVersion"), Yt = null;
}
const Kt = new Ku({
  name: "auto-launch-settings",
  defaults: {
    autoLaunch: {
      enabled: !1,
      minimized: !0
      // Start minimized by default
    }
  }
});
function hl() {
  return Kt.get("autoLaunch.enabled", !1);
}
function Sw() {
  return Kt.get("autoLaunch.minimized", !0);
}
function Tw() {
  return Kt.get("autoLaunch");
}
function pl(e = !0) {
  try {
    const t = ml();
    return Ne.setLoginItemSettings({
      openAtLogin: !0,
      openAsHidden: e,
      // Windows specific
      args: e ? ["--hidden"] : [],
      // macOS/Linux path
      path: process.execPath
    }), Kt.set("autoLaunch", {
      enabled: !0,
      minimized: e
    }), console.log("[AutoLaunch] Enabled:", { minimized: e }), !0;
  } catch (t) {
    return console.error("[AutoLaunch] Failed to enable:", t), !1;
  }
}
function bg() {
  try {
    return Ne.setLoginItemSettings({
      openAtLogin: !1,
      openAsHidden: !1
    }), Kt.set("autoLaunch.enabled", !1), console.log("[AutoLaunch] Disabled"), !0;
  } catch (e) {
    return console.error("[AutoLaunch] Failed to disable:", e), !1;
  }
}
function Rw() {
  const e = hl();
  return e ? bg() : pl(Sw()), !e;
}
function bw(e) {
  Kt.set("autoLaunch.minimized", e), hl() && pl(e);
}
function ml() {
  return Ne.getLoginItemSettings();
}
function gl() {
  const e = process.argv.includes("--hidden"), i = ml().wasOpenedAsHidden ?? !1;
  return e || i;
}
function Aw() {
  const e = ml(), t = Kt.get("autoLaunch.enabled", !1);
  e.openAtLogin !== t && Kt.set("autoLaunch.enabled", e.openAtLogin), Ow(), console.log("[AutoLaunch] Initialized:", {
    enabled: e.openAtLogin,
    wasOpenedAtLogin: gl()
  });
}
function Ow() {
  fe.handle("auto-launch:isEnabled", () => hl()), fe.handle("auto-launch:getSettings", () => Tw()), fe.handle("auto-launch:enable", (e, t) => pl(t ?? !0)), fe.handle("auto-launch:disable", () => bg()), fe.handle("auto-launch:toggle", () => Rw()), fe.handle("auto-launch:setStartMinimized", (e, t) => (bw(t), !0)), fe.handle("auto-launch:wasStartedAtLogin", () => gl());
}
function Nw() {
  fe.removeHandler("auto-launch:isEnabled"), fe.removeHandler("auto-launch:getSettings"), fe.removeHandler("auto-launch:enable"), fe.removeHandler("auto-launch:disable"), fe.removeHandler("auto-launch:toggle"), fe.removeHandler("auto-launch:setStartMinimized"), fe.removeHandler("auto-launch:wasStartedAtLogin");
}
const Ag = Ne;
process.env.DIST = ot.join(__dirname, "../dist");
process.env.VITE_PUBLIC = Ne.isPackaged ? process.env.DIST : ot.join(process.env.DIST, "../public");
let Xe = null;
const Pu = process.env.VITE_DEV_SERVER_URL;
function $w() {
  return Ne.isPackaged ? ot.join(process.resourcesPath, "build", "icon.png") : ot.join(process.env.VITE_PUBLIC, "icon.png");
}
function Og() {
  const e = Ov(), t = gl();
  if (Xe = new Fu({
    icon: $w(),
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
      preload: ot.join(__dirname, "preload.js"),
      nodeIntegration: !1,
      contextIsolation: !0
    }
  }), Nv(Xe), e.isMaximized && Xe.maximize(), bv(Xe), Dy(Xe), $y(Xe), Pv(Xe), qv(), Gv(Xe), yw(Xe), Aw(), Am(Xe), Xe.on("close", (i) => {
    gd().get("settings.minimizeToTray", !0) && !Ag.isQuitting && (i.preventDefault(), Xe?.hide());
  }), Xe.webContents.on("did-finish-load", () => {
    Xe?.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString()), xu(Xe, {
      timerActive: !1,
      isPaused: !1,
      timeRemaining: "25:00",
      currentTask: null,
      mode: "IDLE"
    });
  }), Pu)
    console.log("Loading URL:", Pu), Xe.loadURL(Pu);
  else {
    const i = ot.join(process.env.DIST, "index.html");
    console.log("Loading file:", i), Xe.loadFile(i);
  }
  Xe.once("ready-to-show", () => {
    !gd().get("settings.startMinimized", !1) && !t && Xe?.show(), jv();
  }), Ne.isPackaged || Xe.webContents.openDevTools();
}
Ne.on("before-quit", () => {
  Ag.isQuitting = !0;
});
Ne.whenReady().then(Og);
Ne.on("will-quit", () => {
  Mu(), Iy(), Lv(), xv(), Av(), ww(), Nw(), Hv();
});
Ne.on("window-all-closed", () => {
  process.platform !== "darwin" && Ne.quit();
});
Ne.on("activate", () => {
  Fu.getAllWindows().length === 0 ? Og() : Xe?.show();
});
