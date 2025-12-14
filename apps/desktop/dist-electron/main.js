import ur, { nativeImage as Yl, Tray as Jl, app as ke, Menu as Jc, globalShortcut as ns, shell as Ds, Notification as Ql, ipcMain as he, screen as Qg, BrowserWindow as tl, dialog as r_ } from "electron";
import * as ht from "path";
import Me from "path";
import Vn from "util";
import * as Zl from "fs";
import Ct from "fs";
import Yr from "crypto";
import rl from "assert";
import nl from "events";
import Gn from "os";
import n_ from "better-sqlite3";
import i_ from "constants";
import Hn from "stream";
import us from "child_process";
import Zg from "tty";
import Jr from "url";
import a_ from "string_decoder";
import e0 from "zlib";
import s_ from "http";
let At = null;
const t0 = {
  timerActive: !1,
  isPaused: !1,
  timeRemaining: "25:00",
  currentTask: null,
  mode: "IDLE"
};
let r0 = { ...t0 };
function o_() {
  const e = process.platform === "win32" ? "icon.ico" : "icon.png";
  return ke.isPackaged ? ht.join(process.resourcesPath, "build", e) : ht.join(__dirname, "..", "build", e);
}
function u_(e) {
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
function c_(e) {
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
function l_(e) {
  const t = o_();
  try {
    const o = Yl.createFromPath(t);
    At = new Jl(o.resize({ width: 16, height: 16 }));
  } catch {
    console.warn("Tray icon not found, using default"), At = new Jl(Yl.createEmpty());
  }
  return At.setToolTip("Ordo-Todo"), il(e, t0), At.on("click", () => {
    e.isVisible() ? e.hide() : (e.show(), e.focus());
  }), At;
}
function il(e, t) {
  if (!At) return;
  r0 = t;
  const o = u_(t.mode), r = c_(t.mode), c = t.timerActive ? `Ordo-Todo - ${r} ${t.timeRemaining}` : "Ordo-Todo";
  At.setToolTip(c);
  const n = Jc.buildFromTemplate([
    // Current task info
    {
      label: t.currentTask || "Sin tarea seleccionada",
      enabled: !1,
      icon: void 0
    },
    { type: "separator" },
    // Timer status
    {
      label: `${o} ${r}`,
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
        ke.quit();
      }
    }
  ]);
  At.setContextMenu(n);
}
function ed(e, t) {
  const o = { ...r0, ...t };
  il(e, o);
}
function d_() {
  At && (At.destroy(), At = null);
}
const Br = [
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
], zr = /* @__PURE__ */ new Map();
function n0(e, t = Br) {
  al(), t.forEach((o) => {
    if (o.enabled)
      try {
        ns.register(o.accelerator, () => {
          i0(e, o.action);
        }) ? (zr.set(o.id, o), console.log(`Shortcut registered: ${o.accelerator} -> ${o.action}`)) : console.warn(`Failed to register shortcut: ${o.accelerator}`);
      } catch (r) {
        console.error(`Error registering shortcut ${o.accelerator}:`, r);
      }
  });
}
function i0(e, t) {
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
function al() {
  ns.unregisterAll(), zr.clear(), console.log("All global shortcuts unregistered");
}
function f_() {
  return Array.from(zr.values());
}
function h_(e, t, o) {
  const r = zr.get(t);
  if (!r) return !1;
  ns.unregister(r.accelerator);
  const c = { ...r, ...o };
  return c.enabled && ns.register(c.accelerator, () => {
    i0(e, c.action);
  }) ? (zr.set(t, c), !0) : (zr.delete(t), !1);
}
function p_(e) {
  const t = process.platform === "darwin", o = [
    // App menu (macOS only)
    ...t ? [
      {
        label: ke.name,
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
          click: (c) => {
            e.setAlwaysOnTop(c.checked), e.webContents.send("menu-action", "window:alwaysOnTop", c.checked);
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
            await Ds.openExternal("https://ordo-todo.com/docs");
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
            await Ds.openExternal("https://github.com/tiagofur/ordo-todo/issues/new");
          }
        },
        {
          label: "Solicitar Función",
          click: async () => {
            await Ds.openExternal("https://github.com/tiagofur/ordo-todo/discussions/new?category=ideas");
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
  ], r = Jc.buildFromTemplate(o);
  return Jc.setApplicationMenu(r), r;
}
var It = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function m_(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var qn = { exports: {} }, ks, td;
function y_() {
  return td || (td = 1, ks = (e) => {
    const t = typeof e;
    return e !== null && (t === "object" || t === "function");
  }), ks;
}
var Ls, rd;
function g_() {
  if (rd) return Ls;
  rd = 1;
  const e = y_(), t = /* @__PURE__ */ new Set([
    "__proto__",
    "prototype",
    "constructor"
  ]), o = (c) => !c.some((n) => t.has(n));
  function r(c) {
    const n = c.split("."), s = [];
    for (let l = 0; l < n.length; l++) {
      let a = n[l];
      for (; a[a.length - 1] === "\\" && n[l + 1] !== void 0; )
        a = a.slice(0, -1) + ".", a += n[++l];
      s.push(a);
    }
    return o(s) ? s : [];
  }
  return Ls = {
    get(c, n, s) {
      if (!e(c) || typeof n != "string")
        return s === void 0 ? c : s;
      const l = r(n);
      if (l.length !== 0) {
        for (let a = 0; a < l.length; a++)
          if (c = c[l[a]], c == null) {
            if (a !== l.length - 1)
              return s;
            break;
          }
        return c === void 0 ? s : c;
      }
    },
    set(c, n, s) {
      if (!e(c) || typeof n != "string")
        return c;
      const l = c, a = r(n);
      for (let u = 0; u < a.length; u++) {
        const i = a[u];
        e(c[i]) || (c[i] = {}), u === a.length - 1 && (c[i] = s), c = c[i];
      }
      return l;
    },
    delete(c, n) {
      if (!e(c) || typeof n != "string")
        return !1;
      const s = r(n);
      for (let l = 0; l < s.length; l++) {
        const a = s[l];
        if (l === s.length - 1)
          return delete c[a], !0;
        if (c = c[a], !e(c))
          return !1;
      }
    },
    has(c, n) {
      if (!e(c) || typeof n != "string")
        return !1;
      const s = r(n);
      if (s.length === 0)
        return !1;
      for (let l = 0; l < s.length; l++)
        if (e(c)) {
          if (!(s[l] in c))
            return !1;
          c = c[s[l]];
        } else
          return !1;
      return !0;
    }
  }, Ls;
}
var ri = { exports: {} }, ni = { exports: {} }, ii = { exports: {} }, ai = { exports: {} }, nd;
function v_() {
  if (nd) return ai.exports;
  nd = 1;
  const e = Ct;
  return ai.exports = (t) => new Promise((o) => {
    e.access(t, (r) => {
      o(!r);
    });
  }), ai.exports.sync = (t) => {
    try {
      return e.accessSync(t), !0;
    } catch {
      return !1;
    }
  }, ai.exports;
}
var si = { exports: {} }, oi = { exports: {} }, id;
function __() {
  if (id) return oi.exports;
  id = 1;
  const e = (t, ...o) => new Promise((r) => {
    r(t(...o));
  });
  return oi.exports = e, oi.exports.default = e, oi.exports;
}
var ad;
function E_() {
  if (ad) return si.exports;
  ad = 1;
  const e = __(), t = (o) => {
    if (!((Number.isInteger(o) || o === 1 / 0) && o > 0))
      return Promise.reject(new TypeError("Expected `concurrency` to be a number from 1 and up"));
    const r = [];
    let c = 0;
    const n = () => {
      c--, r.length > 0 && r.shift()();
    }, s = (u, i, ...f) => {
      c++;
      const d = e(u, ...f);
      i(d), d.then(n, n);
    }, l = (u, i, ...f) => {
      c < o ? s(u, i, ...f) : r.push(s.bind(null, u, i, ...f));
    }, a = (u, ...i) => new Promise((f) => l(u, f, ...i));
    return Object.defineProperties(a, {
      activeCount: {
        get: () => c
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
  return si.exports = t, si.exports.default = t, si.exports;
}
var Fs, sd;
function w_() {
  if (sd) return Fs;
  sd = 1;
  const e = E_();
  class t extends Error {
    constructor(n) {
      super(), this.value = n;
    }
  }
  const o = (c, n) => Promise.resolve(c).then(n), r = (c) => Promise.all(c).then((n) => n[1] === !0 && Promise.reject(new t(n[0])));
  return Fs = (c, n, s) => {
    s = Object.assign({
      concurrency: 1 / 0,
      preserveOrder: !0
    }, s);
    const l = e(s.concurrency), a = [...c].map((i) => [i, l(o, i, n)]), u = e(s.preserveOrder ? 1 : 1 / 0);
    return Promise.all(a.map((i) => u(r, i))).then(() => {
    }).catch((i) => i instanceof t ? i.value : Promise.reject(i));
  }, Fs;
}
var od;
function S_() {
  if (od) return ii.exports;
  od = 1;
  const e = Me, t = v_(), o = w_();
  return ii.exports = (r, c) => (c = Object.assign({
    cwd: process.cwd()
  }, c), o(r, (n) => t(e.resolve(c.cwd, n)), c)), ii.exports.sync = (r, c) => {
    c = Object.assign({
      cwd: process.cwd()
    }, c);
    for (const n of r)
      if (t.sync(e.resolve(c.cwd, n)))
        return n;
  }, ii.exports;
}
var ud;
function $_() {
  if (ud) return ni.exports;
  ud = 1;
  const e = Me, t = S_();
  return ni.exports = (o, r = {}) => {
    const c = e.resolve(r.cwd || ""), { root: n } = e.parse(c), s = [].concat(o);
    return new Promise((l) => {
      (function a(u) {
        t(s, { cwd: u }).then((i) => {
          i ? l(e.join(u, i)) : u === n ? l(null) : a(e.dirname(u));
        });
      })(c);
    });
  }, ni.exports.sync = (o, r = {}) => {
    let c = e.resolve(r.cwd || "");
    const { root: n } = e.parse(c), s = [].concat(o);
    for (; ; ) {
      const l = t.sync(s, { cwd: c });
      if (l)
        return e.join(c, l);
      if (c === n)
        return null;
      c = e.dirname(c);
    }
  }, ni.exports;
}
var cd;
function b_() {
  if (cd) return ri.exports;
  cd = 1;
  const e = $_();
  return ri.exports = async ({ cwd: t } = {}) => e("package.json", { cwd: t }), ri.exports.sync = ({ cwd: t } = {}) => e.sync("package.json", { cwd: t }), ri.exports;
}
var ui = { exports: {} }, ld;
function T_() {
  if (ld) return ui.exports;
  ld = 1;
  const e = Me, t = Gn, o = t.homedir(), r = t.tmpdir(), { env: c } = process, n = (u) => {
    const i = e.join(o, "Library");
    return {
      data: e.join(i, "Application Support", u),
      config: e.join(i, "Preferences", u),
      cache: e.join(i, "Caches", u),
      log: e.join(i, "Logs", u),
      temp: e.join(r, u)
    };
  }, s = (u) => {
    const i = c.APPDATA || e.join(o, "AppData", "Roaming"), f = c.LOCALAPPDATA || e.join(o, "AppData", "Local");
    return {
      // Data/config/cache/log are invented by me as Windows isn't opinionated about this
      data: e.join(f, u, "Data"),
      config: e.join(i, u, "Config"),
      cache: e.join(f, u, "Cache"),
      log: e.join(f, u, "Log"),
      temp: e.join(r, u)
    };
  }, l = (u) => {
    const i = e.basename(o);
    return {
      data: e.join(c.XDG_DATA_HOME || e.join(o, ".local", "share"), u),
      config: e.join(c.XDG_CONFIG_HOME || e.join(o, ".config"), u),
      cache: e.join(c.XDG_CACHE_HOME || e.join(o, ".cache"), u),
      // https://wiki.debian.org/XDGBaseDirectorySpecification#state
      log: e.join(c.XDG_STATE_HOME || e.join(o, ".local", "state"), u),
      temp: e.join(r, i, u)
    };
  }, a = (u, i) => {
    if (typeof u != "string")
      throw new TypeError(`Expected string, got ${typeof u}`);
    return i = Object.assign({ suffix: "nodejs" }, i), i.suffix && (u += `-${i.suffix}`), process.platform === "darwin" ? n(u) : process.platform === "win32" ? s(u) : l(u);
  };
  return ui.exports = a, ui.exports.default = a, ui.exports;
}
var Rt = {}, Ge = {}, dd;
function Bn() {
  if (dd) return Ge;
  dd = 1, Object.defineProperty(Ge, "__esModule", { value: !0 }), Ge.NOOP = Ge.LIMIT_FILES_DESCRIPTORS = Ge.LIMIT_BASENAME_LENGTH = Ge.IS_USER_ROOT = Ge.IS_POSIX = Ge.DEFAULT_TIMEOUT_SYNC = Ge.DEFAULT_TIMEOUT_ASYNC = Ge.DEFAULT_WRITE_OPTIONS = Ge.DEFAULT_READ_OPTIONS = Ge.DEFAULT_FOLDER_MODE = Ge.DEFAULT_FILE_MODE = Ge.DEFAULT_ENCODING = void 0;
  const e = "utf8";
  Ge.DEFAULT_ENCODING = e;
  const t = 438;
  Ge.DEFAULT_FILE_MODE = t;
  const o = 511;
  Ge.DEFAULT_FOLDER_MODE = o;
  const r = {};
  Ge.DEFAULT_READ_OPTIONS = r;
  const c = {};
  Ge.DEFAULT_WRITE_OPTIONS = c;
  const n = 5e3;
  Ge.DEFAULT_TIMEOUT_ASYNC = n;
  const s = 100;
  Ge.DEFAULT_TIMEOUT_SYNC = s;
  const l = !!process.getuid;
  Ge.IS_POSIX = l;
  const a = process.getuid ? !process.getuid() : !1;
  Ge.IS_USER_ROOT = a;
  const u = 128;
  Ge.LIMIT_BASENAME_LENGTH = u;
  const i = 1e4;
  Ge.LIMIT_FILES_DESCRIPTORS = i;
  const f = () => {
  };
  return Ge.NOOP = f, Ge;
}
var ci = {}, vr = {}, fd;
function R_() {
  if (fd) return vr;
  fd = 1, Object.defineProperty(vr, "__esModule", { value: !0 }), vr.attemptifySync = vr.attemptifyAsync = void 0;
  const e = Bn(), t = (r, c = e.NOOP) => function() {
    return r.apply(void 0, arguments).catch(c);
  };
  vr.attemptifyAsync = t;
  const o = (r, c = e.NOOP) => function() {
    try {
      return r.apply(void 0, arguments);
    } catch (n) {
      return c(n);
    }
  };
  return vr.attemptifySync = o, vr;
}
var li = {}, hd;
function P_() {
  if (hd) return li;
  hd = 1, Object.defineProperty(li, "__esModule", { value: !0 });
  const e = Bn(), t = {
    isChangeErrorOk: (o) => {
      const { code: r } = o;
      return r === "ENOSYS" || !e.IS_USER_ROOT && (r === "EINVAL" || r === "EPERM");
    },
    isRetriableError: (o) => {
      const { code: r } = o;
      return r === "EMFILE" || r === "ENFILE" || r === "EAGAIN" || r === "EBUSY" || r === "EACCESS" || r === "EACCS" || r === "EPERM";
    },
    onChangeError: (o) => {
      if (!t.isChangeErrorOk(o))
        throw o;
    }
  };
  return li.default = t, li;
}
var _r = {}, di = {}, pd;
function N_() {
  if (pd) return di;
  pd = 1, Object.defineProperty(di, "__esModule", { value: !0 });
  const t = {
    interval: 25,
    intervalId: void 0,
    limit: Bn().LIMIT_FILES_DESCRIPTORS,
    queueActive: /* @__PURE__ */ new Set(),
    queueWaiting: /* @__PURE__ */ new Set(),
    init: () => {
      t.intervalId || (t.intervalId = setInterval(t.tick, t.interval));
    },
    reset: () => {
      t.intervalId && (clearInterval(t.intervalId), delete t.intervalId);
    },
    add: (o) => {
      t.queueWaiting.add(o), t.queueActive.size < t.limit / 2 ? t.tick() : t.init();
    },
    remove: (o) => {
      t.queueWaiting.delete(o), t.queueActive.delete(o);
    },
    schedule: () => new Promise((o) => {
      const r = () => t.remove(c), c = () => o(r);
      t.add(c);
    }),
    tick: () => {
      if (!(t.queueActive.size >= t.limit)) {
        if (!t.queueWaiting.size)
          return t.reset();
        for (const o of t.queueWaiting) {
          if (t.queueActive.size >= t.limit)
            break;
          t.queueWaiting.delete(o), t.queueActive.add(o), o();
        }
      }
    }
  };
  return di.default = t, di;
}
var md;
function O_() {
  if (md) return _r;
  md = 1, Object.defineProperty(_r, "__esModule", { value: !0 }), _r.retryifySync = _r.retryifyAsync = void 0;
  const e = N_(), t = (r, c) => function(n) {
    return function s() {
      return e.default.schedule().then((l) => r.apply(void 0, arguments).then((a) => (l(), a), (a) => {
        if (l(), Date.now() >= n)
          throw a;
        if (c(a)) {
          const u = Math.round(100 + 400 * Math.random());
          return new Promise((f) => setTimeout(f, u)).then(() => s.apply(void 0, arguments));
        }
        throw a;
      }));
    };
  };
  _r.retryifyAsync = t;
  const o = (r, c) => function(n) {
    return function s() {
      try {
        return r.apply(void 0, arguments);
      } catch (l) {
        if (Date.now() > n)
          throw l;
        if (c(l))
          return s.apply(void 0, arguments);
        throw l;
      }
    };
  };
  return _r.retryifySync = o, _r;
}
var yd;
function a0() {
  if (yd) return ci;
  yd = 1, Object.defineProperty(ci, "__esModule", { value: !0 });
  const e = Ct, t = Vn, o = R_(), r = P_(), c = O_(), n = {
    chmodAttempt: o.attemptifyAsync(t.promisify(e.chmod), r.default.onChangeError),
    chownAttempt: o.attemptifyAsync(t.promisify(e.chown), r.default.onChangeError),
    closeAttempt: o.attemptifyAsync(t.promisify(e.close)),
    fsyncAttempt: o.attemptifyAsync(t.promisify(e.fsync)),
    mkdirAttempt: o.attemptifyAsync(t.promisify(e.mkdir)),
    realpathAttempt: o.attemptifyAsync(t.promisify(e.realpath)),
    statAttempt: o.attemptifyAsync(t.promisify(e.stat)),
    unlinkAttempt: o.attemptifyAsync(t.promisify(e.unlink)),
    closeRetry: c.retryifyAsync(t.promisify(e.close), r.default.isRetriableError),
    fsyncRetry: c.retryifyAsync(t.promisify(e.fsync), r.default.isRetriableError),
    openRetry: c.retryifyAsync(t.promisify(e.open), r.default.isRetriableError),
    readFileRetry: c.retryifyAsync(t.promisify(e.readFile), r.default.isRetriableError),
    renameRetry: c.retryifyAsync(t.promisify(e.rename), r.default.isRetriableError),
    statRetry: c.retryifyAsync(t.promisify(e.stat), r.default.isRetriableError),
    writeRetry: c.retryifyAsync(t.promisify(e.write), r.default.isRetriableError),
    chmodSyncAttempt: o.attemptifySync(e.chmodSync, r.default.onChangeError),
    chownSyncAttempt: o.attemptifySync(e.chownSync, r.default.onChangeError),
    closeSyncAttempt: o.attemptifySync(e.closeSync),
    mkdirSyncAttempt: o.attemptifySync(e.mkdirSync),
    realpathSyncAttempt: o.attemptifySync(e.realpathSync),
    statSyncAttempt: o.attemptifySync(e.statSync),
    unlinkSyncAttempt: o.attemptifySync(e.unlinkSync),
    closeSyncRetry: c.retryifySync(e.closeSync, r.default.isRetriableError),
    fsyncSyncRetry: c.retryifySync(e.fsyncSync, r.default.isRetriableError),
    openSyncRetry: c.retryifySync(e.openSync, r.default.isRetriableError),
    readFileSyncRetry: c.retryifySync(e.readFileSync, r.default.isRetriableError),
    renameSyncRetry: c.retryifySync(e.renameSync, r.default.isRetriableError),
    statSyncRetry: c.retryifySync(e.statSync, r.default.isRetriableError),
    writeSyncRetry: c.retryifySync(e.writeSync, r.default.isRetriableError)
  };
  return ci.default = n, ci;
}
var fi = {}, gd;
function A_() {
  if (gd) return fi;
  gd = 1, Object.defineProperty(fi, "__esModule", { value: !0 });
  const e = {
    isFunction: (t) => typeof t == "function",
    isString: (t) => typeof t == "string",
    isUndefined: (t) => typeof t > "u"
  };
  return fi.default = e, fi;
}
var hi = {}, vd;
function I_() {
  if (vd) return hi;
  vd = 1, Object.defineProperty(hi, "__esModule", { value: !0 });
  const e = {}, t = {
    next: (o) => {
      const r = e[o];
      if (!r)
        return;
      r.shift();
      const c = r[0];
      c ? c(() => t.next(o)) : delete e[o];
    },
    schedule: (o) => new Promise((r) => {
      let c = e[o];
      c || (c = e[o] = []), c.push(r), !(c.length > 1) && r(() => t.next(o));
    })
  };
  return hi.default = t, hi;
}
var pi = {}, _d;
function C_() {
  if (_d) return pi;
  _d = 1, Object.defineProperty(pi, "__esModule", { value: !0 });
  const e = Me, t = Bn(), o = a0(), r = {
    store: {},
    create: (c) => {
      const n = `000000${Math.floor(Math.random() * 16777215).toString(16)}`.slice(-6), s = Date.now().toString().slice(-10), l = "tmp-", a = `.${l}${s}${n}`;
      return `${c}${a}`;
    },
    get: (c, n, s = !0) => {
      const l = r.truncate(n(c));
      return l in r.store ? r.get(c, n, s) : (r.store[l] = s, [l, () => delete r.store[l]]);
    },
    purge: (c) => {
      r.store[c] && (delete r.store[c], o.default.unlinkAttempt(c));
    },
    purgeSync: (c) => {
      r.store[c] && (delete r.store[c], o.default.unlinkSyncAttempt(c));
    },
    purgeSyncAll: () => {
      for (const c in r.store)
        r.purgeSync(c);
    },
    truncate: (c) => {
      const n = e.basename(c);
      if (n.length <= t.LIMIT_BASENAME_LENGTH)
        return c;
      const s = /^(\.?)(.*?)((?:\.[^.]+)?(?:\.tmp-\d{10}[a-f0-9]{6})?)$/.exec(n);
      if (!s)
        return c;
      const l = n.length - t.LIMIT_BASENAME_LENGTH;
      return `${c.slice(0, -n.length)}${s[1]}${s[2].slice(0, -l)}${s[3]}`;
    }
  };
  return process.on("exit", r.purgeSyncAll), pi.default = r, pi;
}
var Ed;
function D_() {
  if (Ed) return Rt;
  Ed = 1, Object.defineProperty(Rt, "__esModule", { value: !0 }), Rt.writeFileSync = Rt.writeFile = Rt.readFileSync = Rt.readFile = void 0;
  const e = Me, t = Bn(), o = a0(), r = A_(), c = I_(), n = C_();
  function s(f, d = t.DEFAULT_READ_OPTIONS) {
    var m;
    if (r.default.isString(d))
      return s(f, { encoding: d });
    const g = Date.now() + ((m = d.timeout) !== null && m !== void 0 ? m : t.DEFAULT_TIMEOUT_ASYNC);
    return o.default.readFileRetry(g)(f, d);
  }
  Rt.readFile = s;
  function l(f, d = t.DEFAULT_READ_OPTIONS) {
    var m;
    if (r.default.isString(d))
      return l(f, { encoding: d });
    const g = Date.now() + ((m = d.timeout) !== null && m !== void 0 ? m : t.DEFAULT_TIMEOUT_SYNC);
    return o.default.readFileSyncRetry(g)(f, d);
  }
  Rt.readFileSync = l;
  const a = (f, d, m, g) => {
    if (r.default.isFunction(m))
      return a(f, d, t.DEFAULT_WRITE_OPTIONS, m);
    const v = u(f, d, m);
    return g && v.then(g, g), v;
  };
  Rt.writeFile = a;
  const u = async (f, d, m = t.DEFAULT_WRITE_OPTIONS) => {
    var g;
    if (r.default.isString(m))
      return u(f, d, { encoding: m });
    const v = Date.now() + ((g = m.timeout) !== null && g !== void 0 ? g : t.DEFAULT_TIMEOUT_ASYNC);
    let h = null, y = null, p = null, E = null, $ = null;
    try {
      m.schedule && (h = await m.schedule(f)), y = await c.default.schedule(f), f = await o.default.realpathAttempt(f) || f, [E, p] = n.default.get(f, m.tmpCreate || n.default.create, m.tmpPurge !== !1);
      const S = t.IS_POSIX && r.default.isUndefined(m.chown), _ = r.default.isUndefined(m.mode);
      if (S || _) {
        const R = await o.default.statAttempt(f);
        R && (m = { ...m }, S && (m.chown = { uid: R.uid, gid: R.gid }), _ && (m.mode = R.mode));
      }
      const w = e.dirname(f);
      await o.default.mkdirAttempt(w, {
        mode: t.DEFAULT_FOLDER_MODE,
        recursive: !0
      }), $ = await o.default.openRetry(v)(E, "w", m.mode || t.DEFAULT_FILE_MODE), m.tmpCreated && m.tmpCreated(E), r.default.isString(d) ? await o.default.writeRetry(v)($, d, 0, m.encoding || t.DEFAULT_ENCODING) : r.default.isUndefined(d) || await o.default.writeRetry(v)($, d, 0, d.length, 0), m.fsync !== !1 && (m.fsyncWait !== !1 ? await o.default.fsyncRetry(v)($) : o.default.fsyncAttempt($)), await o.default.closeRetry(v)($), $ = null, m.chown && await o.default.chownAttempt(E, m.chown.uid, m.chown.gid), m.mode && await o.default.chmodAttempt(E, m.mode);
      try {
        await o.default.renameRetry(v)(E, f);
      } catch (R) {
        if (R.code !== "ENAMETOOLONG")
          throw R;
        await o.default.renameRetry(v)(E, n.default.truncate(f));
      }
      p(), E = null;
    } finally {
      $ && await o.default.closeAttempt($), E && n.default.purge(E), h && h(), y && y();
    }
  }, i = (f, d, m = t.DEFAULT_WRITE_OPTIONS) => {
    var g;
    if (r.default.isString(m))
      return i(f, d, { encoding: m });
    const v = Date.now() + ((g = m.timeout) !== null && g !== void 0 ? g : t.DEFAULT_TIMEOUT_SYNC);
    let h = null, y = null, p = null;
    try {
      f = o.default.realpathSyncAttempt(f) || f, [y, h] = n.default.get(f, m.tmpCreate || n.default.create, m.tmpPurge !== !1);
      const E = t.IS_POSIX && r.default.isUndefined(m.chown), $ = r.default.isUndefined(m.mode);
      if (E || $) {
        const _ = o.default.statSyncAttempt(f);
        _ && (m = { ...m }, E && (m.chown = { uid: _.uid, gid: _.gid }), $ && (m.mode = _.mode));
      }
      const S = e.dirname(f);
      o.default.mkdirSyncAttempt(S, {
        mode: t.DEFAULT_FOLDER_MODE,
        recursive: !0
      }), p = o.default.openSyncRetry(v)(y, "w", m.mode || t.DEFAULT_FILE_MODE), m.tmpCreated && m.tmpCreated(y), r.default.isString(d) ? o.default.writeSyncRetry(v)(p, d, 0, m.encoding || t.DEFAULT_ENCODING) : r.default.isUndefined(d) || o.default.writeSyncRetry(v)(p, d, 0, d.length, 0), m.fsync !== !1 && (m.fsyncWait !== !1 ? o.default.fsyncSyncRetry(v)(p) : o.default.fsyncAttempt(p)), o.default.closeSyncRetry(v)(p), p = null, m.chown && o.default.chownSyncAttempt(y, m.chown.uid, m.chown.gid), m.mode && o.default.chmodSyncAttempt(y, m.mode);
      try {
        o.default.renameSyncRetry(v)(y, f);
      } catch (_) {
        if (_.code !== "ENAMETOOLONG")
          throw _;
        o.default.renameSyncRetry(v)(y, n.default.truncate(f));
      }
      h(), y = null;
    } finally {
      p && o.default.closeSyncAttempt(p), y && n.default.purge(y);
    }
  };
  return Rt.writeFileSync = i, Rt;
}
var mi = { exports: {} }, qs = {}, Gt = {}, Er = {}, Us = {}, js = {}, Ms = {}, wd;
function is() {
  return wd || (wd = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.regexpCode = e.getEsmExportName = e.getProperty = e.safeStringify = e.stringify = e.strConcat = e.addCodeArg = e.str = e._ = e.nil = e._Code = e.Name = e.IDENTIFIER = e._CodeOrName = void 0;
    class t {
    }
    e._CodeOrName = t, e.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
    class o extends t {
      constructor(p) {
        if (super(), !e.IDENTIFIER.test(p))
          throw new Error("CodeGen: name must be a valid identifier");
        this.str = p;
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
    e.Name = o;
    class r extends t {
      constructor(p) {
        super(), this._items = typeof p == "string" ? [p] : p;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        if (this._items.length > 1)
          return !1;
        const p = this._items[0];
        return p === "" || p === '""';
      }
      get str() {
        var p;
        return (p = this._str) !== null && p !== void 0 ? p : this._str = this._items.reduce((E, $) => `${E}${$}`, "");
      }
      get names() {
        var p;
        return (p = this._names) !== null && p !== void 0 ? p : this._names = this._items.reduce((E, $) => ($ instanceof o && (E[$.str] = (E[$.str] || 0) + 1), E), {});
      }
    }
    e._Code = r, e.nil = new r("");
    function c(y, ...p) {
      const E = [y[0]];
      let $ = 0;
      for (; $ < p.length; )
        l(E, p[$]), E.push(y[++$]);
      return new r(E);
    }
    e._ = c;
    const n = new r("+");
    function s(y, ...p) {
      const E = [m(y[0])];
      let $ = 0;
      for (; $ < p.length; )
        E.push(n), l(E, p[$]), E.push(n, m(y[++$]));
      return a(E), new r(E);
    }
    e.str = s;
    function l(y, p) {
      p instanceof r ? y.push(...p._items) : p instanceof o ? y.push(p) : y.push(f(p));
    }
    e.addCodeArg = l;
    function a(y) {
      let p = 1;
      for (; p < y.length - 1; ) {
        if (y[p] === n) {
          const E = u(y[p - 1], y[p + 1]);
          if (E !== void 0) {
            y.splice(p - 1, 3, E);
            continue;
          }
          y[p++] = "+";
        }
        p++;
      }
    }
    function u(y, p) {
      if (p === '""')
        return y;
      if (y === '""')
        return p;
      if (typeof y == "string")
        return p instanceof o || y[y.length - 1] !== '"' ? void 0 : typeof p != "string" ? `${y.slice(0, -1)}${p}"` : p[0] === '"' ? y.slice(0, -1) + p.slice(1) : void 0;
      if (typeof p == "string" && p[0] === '"' && !(y instanceof o))
        return `"${y}${p.slice(1)}`;
    }
    function i(y, p) {
      return p.emptyStr() ? y : y.emptyStr() ? p : s`${y}${p}`;
    }
    e.strConcat = i;
    function f(y) {
      return typeof y == "number" || typeof y == "boolean" || y === null ? y : m(Array.isArray(y) ? y.join(",") : y);
    }
    function d(y) {
      return new r(m(y));
    }
    e.stringify = d;
    function m(y) {
      return JSON.stringify(y).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
    }
    e.safeStringify = m;
    function g(y) {
      return typeof y == "string" && e.IDENTIFIER.test(y) ? new r(`.${y}`) : c`[${y}]`;
    }
    e.getProperty = g;
    function v(y) {
      if (typeof y == "string" && e.IDENTIFIER.test(y))
        return new r(`${y}`);
      throw new Error(`CodeGen: invalid export name: ${y}, use explicit $id name mapping`);
    }
    e.getEsmExportName = v;
    function h(y) {
      return new r(y.toString());
    }
    e.regexpCode = h;
  })(Ms)), Ms;
}
var xs = {}, Sd;
function $d() {
  return Sd || (Sd = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.ValueScope = e.ValueScopeName = e.Scope = e.varKinds = e.UsedValueState = void 0;
    const t = is();
    class o extends Error {
      constructor(u) {
        super(`CodeGen: "code" for ${u} not defined`), this.value = u.value;
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
    class c {
      constructor({ prefixes: u, parent: i } = {}) {
        this._names = {}, this._prefixes = u, this._parent = i;
      }
      toName(u) {
        return u instanceof t.Name ? u : this.name(u);
      }
      name(u) {
        return new t.Name(this._newName(u));
      }
      _newName(u) {
        const i = this._names[u] || this._nameGroup(u);
        return `${u}${i.index++}`;
      }
      _nameGroup(u) {
        var i, f;
        if (!((f = (i = this._parent) === null || i === void 0 ? void 0 : i._prefixes) === null || f === void 0) && f.has(u) || this._prefixes && !this._prefixes.has(u))
          throw new Error(`CodeGen: prefix "${u}" is not allowed in this scope`);
        return this._names[u] = { prefix: u, index: 0 };
      }
    }
    e.Scope = c;
    class n extends t.Name {
      constructor(u, i) {
        super(i), this.prefix = u;
      }
      setValue(u, { property: i, itemIndex: f }) {
        this.value = u, this.scopePath = (0, t._)`.${new t.Name(i)}[${f}]`;
      }
    }
    e.ValueScopeName = n;
    const s = (0, t._)`\n`;
    class l extends c {
      constructor(u) {
        super(u), this._values = {}, this._scope = u.scope, this.opts = { ...u, _n: u.lines ? s : t.nil };
      }
      get() {
        return this._scope;
      }
      name(u) {
        return new n(u, this._newName(u));
      }
      value(u, i) {
        var f;
        if (i.ref === void 0)
          throw new Error("CodeGen: ref must be passed in value");
        const d = this.toName(u), { prefix: m } = d, g = (f = i.key) !== null && f !== void 0 ? f : i.ref;
        let v = this._values[m];
        if (v) {
          const p = v.get(g);
          if (p)
            return p;
        } else
          v = this._values[m] = /* @__PURE__ */ new Map();
        v.set(g, d);
        const h = this._scope[m] || (this._scope[m] = []), y = h.length;
        return h[y] = i.ref, d.setValue(i, { property: m, itemIndex: y }), d;
      }
      getValue(u, i) {
        const f = this._values[u];
        if (f)
          return f.get(i);
      }
      scopeRefs(u, i = this._values) {
        return this._reduceValues(i, (f) => {
          if (f.scopePath === void 0)
            throw new Error(`CodeGen: name "${f}" has no value`);
          return (0, t._)`${u}${f.scopePath}`;
        });
      }
      scopeCode(u = this._values, i, f) {
        return this._reduceValues(u, (d) => {
          if (d.value === void 0)
            throw new Error(`CodeGen: name "${d}" has no value`);
          return d.value.code;
        }, i, f);
      }
      _reduceValues(u, i, f = {}, d) {
        let m = t.nil;
        for (const g in u) {
          const v = u[g];
          if (!v)
            continue;
          const h = f[g] = f[g] || /* @__PURE__ */ new Map();
          v.forEach((y) => {
            if (h.has(y))
              return;
            h.set(y, r.Started);
            let p = i(y);
            if (p) {
              const E = this.opts.es5 ? e.varKinds.var : e.varKinds.const;
              m = (0, t._)`${m}${E} ${y} = ${p};${this.opts._n}`;
            } else if (p = d?.(y))
              m = (0, t._)`${m}${p}${this.opts._n}`;
            else
              throw new o(y);
            h.set(y, r.Completed);
          });
        }
        return m;
      }
    }
    e.ValueScope = l;
  })(xs)), xs;
}
var bd;
function De() {
  return bd || (bd = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.or = e.and = e.not = e.CodeGen = e.operators = e.varKinds = e.ValueScopeName = e.ValueScope = e.Scope = e.Name = e.regexpCode = e.stringify = e.getProperty = e.nil = e.strConcat = e.str = e._ = void 0;
    const t = is(), o = $d();
    var r = is();
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
    var c = $d();
    Object.defineProperty(e, "Scope", { enumerable: !0, get: function() {
      return c.Scope;
    } }), Object.defineProperty(e, "ValueScope", { enumerable: !0, get: function() {
      return c.ValueScope;
    } }), Object.defineProperty(e, "ValueScopeName", { enumerable: !0, get: function() {
      return c.ValueScopeName;
    } }), Object.defineProperty(e, "varKinds", { enumerable: !0, get: function() {
      return c.varKinds;
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
      optimizeNames(T, N) {
        return this;
      }
    }
    class s extends n {
      constructor(T, N, V) {
        super(), this.varKind = T, this.name = N, this.rhs = V;
      }
      render({ es5: T, _n: N }) {
        const V = T ? o.varKinds.var : this.varKind, A = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
        return `${V} ${this.name}${A};` + N;
      }
      optimizeNames(T, N) {
        if (T[this.name.str])
          return this.rhs && (this.rhs = F(this.rhs, T, N)), this;
      }
      get names() {
        return this.rhs instanceof t._CodeOrName ? this.rhs.names : {};
      }
    }
    class l extends n {
      constructor(T, N, V) {
        super(), this.lhs = T, this.rhs = N, this.sideEffects = V;
      }
      render({ _n: T }) {
        return `${this.lhs} = ${this.rhs};` + T;
      }
      optimizeNames(T, N) {
        if (!(this.lhs instanceof t.Name && !T[this.lhs.str] && !this.sideEffects))
          return this.rhs = F(this.rhs, T, N), this;
      }
      get names() {
        const T = this.lhs instanceof t.Name ? {} : { ...this.lhs.names };
        return W(T, this.rhs);
      }
    }
    class a extends l {
      constructor(T, N, V, A) {
        super(T, V, A), this.op = N;
      }
      render({ _n: T }) {
        return `${this.lhs} ${this.op}= ${this.rhs};` + T;
      }
    }
    class u extends n {
      constructor(T) {
        super(), this.label = T, this.names = {};
      }
      render({ _n: T }) {
        return `${this.label}:` + T;
      }
    }
    class i extends n {
      constructor(T) {
        super(), this.label = T, this.names = {};
      }
      render({ _n: T }) {
        return `break${this.label ? ` ${this.label}` : ""};` + T;
      }
    }
    class f extends n {
      constructor(T) {
        super(), this.error = T;
      }
      render({ _n: T }) {
        return `throw ${this.error};` + T;
      }
      get names() {
        return this.error.names;
      }
    }
    class d extends n {
      constructor(T) {
        super(), this.code = T;
      }
      render({ _n: T }) {
        return `${this.code};` + T;
      }
      optimizeNodes() {
        return `${this.code}` ? this : void 0;
      }
      optimizeNames(T, N) {
        return this.code = F(this.code, T, N), this;
      }
      get names() {
        return this.code instanceof t._CodeOrName ? this.code.names : {};
      }
    }
    class m extends n {
      constructor(T = []) {
        super(), this.nodes = T;
      }
      render(T) {
        return this.nodes.reduce((N, V) => N + V.render(T), "");
      }
      optimizeNodes() {
        const { nodes: T } = this;
        let N = T.length;
        for (; N--; ) {
          const V = T[N].optimizeNodes();
          Array.isArray(V) ? T.splice(N, 1, ...V) : V ? T[N] = V : T.splice(N, 1);
        }
        return T.length > 0 ? this : void 0;
      }
      optimizeNames(T, N) {
        const { nodes: V } = this;
        let A = V.length;
        for (; A--; ) {
          const O = V[A];
          O.optimizeNames(T, N) || (q(T, O.names), V.splice(A, 1));
        }
        return V.length > 0 ? this : void 0;
      }
      get names() {
        return this.nodes.reduce((T, N) => B(T, N.names), {});
      }
    }
    class g extends m {
      render(T) {
        return "{" + T._n + super.render(T) + "}" + T._n;
      }
    }
    class v extends m {
    }
    class h extends g {
    }
    h.kind = "else";
    class y extends g {
      constructor(T, N) {
        super(N), this.condition = T;
      }
      render(T) {
        let N = `if(${this.condition})` + super.render(T);
        return this.else && (N += "else " + this.else.render(T)), N;
      }
      optimizeNodes() {
        super.optimizeNodes();
        const T = this.condition;
        if (T === !0)
          return this.nodes;
        let N = this.else;
        if (N) {
          const V = N.optimizeNodes();
          N = this.else = Array.isArray(V) ? new h(V) : V;
        }
        if (N)
          return T === !1 ? N instanceof y ? N : N.nodes : this.nodes.length ? this : new y(J(T), N instanceof y ? [N] : N.nodes);
        if (!(T === !1 || !this.nodes.length))
          return this;
      }
      optimizeNames(T, N) {
        var V;
        if (this.else = (V = this.else) === null || V === void 0 ? void 0 : V.optimizeNames(T, N), !!(super.optimizeNames(T, N) || this.else))
          return this.condition = F(this.condition, T, N), this;
      }
      get names() {
        const T = super.names;
        return W(T, this.condition), this.else && B(T, this.else.names), T;
      }
    }
    y.kind = "if";
    class p extends g {
    }
    p.kind = "for";
    class E extends p {
      constructor(T) {
        super(), this.iteration = T;
      }
      render(T) {
        return `for(${this.iteration})` + super.render(T);
      }
      optimizeNames(T, N) {
        if (super.optimizeNames(T, N))
          return this.iteration = F(this.iteration, T, N), this;
      }
      get names() {
        return B(super.names, this.iteration.names);
      }
    }
    class $ extends p {
      constructor(T, N, V, A) {
        super(), this.varKind = T, this.name = N, this.from = V, this.to = A;
      }
      render(T) {
        const N = T.es5 ? o.varKinds.var : this.varKind, { name: V, from: A, to: O } = this;
        return `for(${N} ${V}=${A}; ${V}<${O}; ${V}++)` + super.render(T);
      }
      get names() {
        const T = W(super.names, this.from);
        return W(T, this.to);
      }
    }
    class S extends p {
      constructor(T, N, V, A) {
        super(), this.loop = T, this.varKind = N, this.name = V, this.iterable = A;
      }
      render(T) {
        return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(T);
      }
      optimizeNames(T, N) {
        if (super.optimizeNames(T, N))
          return this.iterable = F(this.iterable, T, N), this;
      }
      get names() {
        return B(super.names, this.iterable.names);
      }
    }
    class _ extends g {
      constructor(T, N, V) {
        super(), this.name = T, this.args = N, this.async = V;
      }
      render(T) {
        return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(T);
      }
    }
    _.kind = "func";
    class w extends m {
      render(T) {
        return "return " + super.render(T);
      }
    }
    w.kind = "return";
    class R extends g {
      render(T) {
        let N = "try" + super.render(T);
        return this.catch && (N += this.catch.render(T)), this.finally && (N += this.finally.render(T)), N;
      }
      optimizeNodes() {
        var T, N;
        return super.optimizeNodes(), (T = this.catch) === null || T === void 0 || T.optimizeNodes(), (N = this.finally) === null || N === void 0 || N.optimizeNodes(), this;
      }
      optimizeNames(T, N) {
        var V, A;
        return super.optimizeNames(T, N), (V = this.catch) === null || V === void 0 || V.optimizeNames(T, N), (A = this.finally) === null || A === void 0 || A.optimizeNames(T, N), this;
      }
      get names() {
        const T = super.names;
        return this.catch && B(T, this.catch.names), this.finally && B(T, this.finally.names), T;
      }
    }
    class P extends g {
      constructor(T) {
        super(), this.error = T;
      }
      render(T) {
        return `catch(${this.error})` + super.render(T);
      }
    }
    P.kind = "catch";
    class j extends g {
      render(T) {
        return "finally" + super.render(T);
      }
    }
    j.kind = "finally";
    class M {
      constructor(T, N = {}) {
        this._values = {}, this._blockStarts = [], this._constants = {}, this.opts = { ...N, _n: N.lines ? `
` : "" }, this._extScope = T, this._scope = new o.Scope({ parent: T }), this._nodes = [new v()];
      }
      toString() {
        return this._root.render(this.opts);
      }
      // returns unique name in the internal scope
      name(T) {
        return this._scope.name(T);
      }
      // reserves unique name in the external scope
      scopeName(T) {
        return this._extScope.name(T);
      }
      // reserves unique name in the external scope and assigns value to it
      scopeValue(T, N) {
        const V = this._extScope.value(T, N);
        return (this._values[V.prefix] || (this._values[V.prefix] = /* @__PURE__ */ new Set())).add(V), V;
      }
      getScopeValue(T, N) {
        return this._extScope.getValue(T, N);
      }
      // return code that assigns values in the external scope to the names that are used internally
      // (same names that were returned by gen.scopeName or gen.scopeValue)
      scopeRefs(T) {
        return this._extScope.scopeRefs(T, this._values);
      }
      scopeCode() {
        return this._extScope.scopeCode(this._values);
      }
      _def(T, N, V, A) {
        const O = this._scope.toName(N);
        return V !== void 0 && A && (this._constants[O.str] = V), this._leafNode(new s(T, O, V)), O;
      }
      // `const` declaration (`var` in es5 mode)
      const(T, N, V) {
        return this._def(o.varKinds.const, T, N, V);
      }
      // `let` declaration with optional assignment (`var` in es5 mode)
      let(T, N, V) {
        return this._def(o.varKinds.let, T, N, V);
      }
      // `var` declaration with optional assignment
      var(T, N, V) {
        return this._def(o.varKinds.var, T, N, V);
      }
      // assignment code
      assign(T, N, V) {
        return this._leafNode(new l(T, N, V));
      }
      // `+=` code
      add(T, N) {
        return this._leafNode(new a(T, e.operators.ADD, N));
      }
      // appends passed SafeExpr to code or executes Block
      code(T) {
        return typeof T == "function" ? T() : T !== t.nil && this._leafNode(new d(T)), this;
      }
      // returns code for object literal for the passed argument list of key-value pairs
      object(...T) {
        const N = ["{"];
        for (const [V, A] of T)
          N.length > 1 && N.push(","), N.push(V), (V !== A || this.opts.es5) && (N.push(":"), (0, t.addCodeArg)(N, A));
        return N.push("}"), new t._Code(N);
      }
      // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
      if(T, N, V) {
        if (this._blockNode(new y(T)), N && V)
          this.code(N).else().code(V).endIf();
        else if (N)
          this.code(N).endIf();
        else if (V)
          throw new Error('CodeGen: "else" body without "then" body');
        return this;
      }
      // `else if` clause - invalid without `if` or after `else` clauses
      elseIf(T) {
        return this._elseNode(new y(T));
      }
      // `else` clause - only valid after `if` or `else if` clauses
      else() {
        return this._elseNode(new h());
      }
      // end `if` statement (needed if gen.if was used only with condition)
      endIf() {
        return this._endBlockNode(y, h);
      }
      _for(T, N) {
        return this._blockNode(T), N && this.code(N).endFor(), this;
      }
      // a generic `for` clause (or statement if `forBody` is passed)
      for(T, N) {
        return this._for(new E(T), N);
      }
      // `for` statement for a range of values
      forRange(T, N, V, A, O = this.opts.es5 ? o.varKinds.var : o.varKinds.let) {
        const Z = this._scope.toName(T);
        return this._for(new $(O, Z, N, V), () => A(Z));
      }
      // `for-of` statement (in es5 mode replace with a normal for loop)
      forOf(T, N, V, A = o.varKinds.const) {
        const O = this._scope.toName(T);
        if (this.opts.es5) {
          const Z = N instanceof t.Name ? N : this.var("_arr", N);
          return this.forRange("_i", 0, (0, t._)`${Z}.length`, (z) => {
            this.var(O, (0, t._)`${Z}[${z}]`), V(O);
          });
        }
        return this._for(new S("of", A, O, N), () => V(O));
      }
      // `for-in` statement.
      // With option `ownProperties` replaced with a `for-of` loop for object keys
      forIn(T, N, V, A = this.opts.es5 ? o.varKinds.var : o.varKinds.const) {
        if (this.opts.ownProperties)
          return this.forOf(T, (0, t._)`Object.keys(${N})`, V);
        const O = this._scope.toName(T);
        return this._for(new S("in", A, O, N), () => V(O));
      }
      // end `for` loop
      endFor() {
        return this._endBlockNode(p);
      }
      // `label` statement
      label(T) {
        return this._leafNode(new u(T));
      }
      // `break` statement
      break(T) {
        return this._leafNode(new i(T));
      }
      // `return` statement
      return(T) {
        const N = new w();
        if (this._blockNode(N), this.code(T), N.nodes.length !== 1)
          throw new Error('CodeGen: "return" should have one node');
        return this._endBlockNode(w);
      }
      // `try` statement
      try(T, N, V) {
        if (!N && !V)
          throw new Error('CodeGen: "try" without "catch" and "finally"');
        const A = new R();
        if (this._blockNode(A), this.code(T), N) {
          const O = this.name("e");
          this._currNode = A.catch = new P(O), N(O);
        }
        return V && (this._currNode = A.finally = new j(), this.code(V)), this._endBlockNode(P, j);
      }
      // `throw` statement
      throw(T) {
        return this._leafNode(new f(T));
      }
      // start self-balancing block
      block(T, N) {
        return this._blockStarts.push(this._nodes.length), T && this.code(T).endBlock(N), this;
      }
      // end the current self-balancing block
      endBlock(T) {
        const N = this._blockStarts.pop();
        if (N === void 0)
          throw new Error("CodeGen: not in self-balancing block");
        const V = this._nodes.length - N;
        if (V < 0 || T !== void 0 && V !== T)
          throw new Error(`CodeGen: wrong number of nodes: ${V} vs ${T} expected`);
        return this._nodes.length = N, this;
      }
      // `function` heading (or definition if funcBody is passed)
      func(T, N = t.nil, V, A) {
        return this._blockNode(new _(T, N, V)), A && this.code(A).endFunc(), this;
      }
      // end function definition
      endFunc() {
        return this._endBlockNode(_);
      }
      optimize(T = 1) {
        for (; T-- > 0; )
          this._root.optimizeNodes(), this._root.optimizeNames(this._root.names, this._constants);
      }
      _leafNode(T) {
        return this._currNode.nodes.push(T), this;
      }
      _blockNode(T) {
        this._currNode.nodes.push(T), this._nodes.push(T);
      }
      _endBlockNode(T, N) {
        const V = this._currNode;
        if (V instanceof T || N && V instanceof N)
          return this._nodes.pop(), this;
        throw new Error(`CodeGen: not in block "${N ? `${T.kind}/${N.kind}` : T.kind}"`);
      }
      _elseNode(T) {
        const N = this._currNode;
        if (!(N instanceof y))
          throw new Error('CodeGen: "else" without "if"');
        return this._currNode = N.else = T, this;
      }
      get _root() {
        return this._nodes[0];
      }
      get _currNode() {
        const T = this._nodes;
        return T[T.length - 1];
      }
      set _currNode(T) {
        const N = this._nodes;
        N[N.length - 1] = T;
      }
    }
    e.CodeGen = M;
    function B(D, T) {
      for (const N in T)
        D[N] = (D[N] || 0) + (T[N] || 0);
      return D;
    }
    function W(D, T) {
      return T instanceof t._CodeOrName ? B(D, T.names) : D;
    }
    function F(D, T, N) {
      if (D instanceof t.Name)
        return V(D);
      if (!A(D))
        return D;
      return new t._Code(D._items.reduce((O, Z) => (Z instanceof t.Name && (Z = V(Z)), Z instanceof t._Code ? O.push(...Z._items) : O.push(Z), O), []));
      function V(O) {
        const Z = N[O.str];
        return Z === void 0 || T[O.str] !== 1 ? O : (delete T[O.str], Z);
      }
      function A(O) {
        return O instanceof t._Code && O._items.some((Z) => Z instanceof t.Name && T[Z.str] === 1 && N[Z.str] !== void 0);
      }
    }
    function q(D, T) {
      for (const N in T)
        D[N] = (D[N] || 0) - (T[N] || 0);
    }
    function J(D) {
      return typeof D == "boolean" || typeof D == "number" || D === null ? !D : (0, t._)`!${U(D)}`;
    }
    e.not = J;
    const H = I(e.operators.AND);
    function G(...D) {
      return D.reduce(H);
    }
    e.and = G;
    const Y = I(e.operators.OR);
    function k(...D) {
      return D.reduce(Y);
    }
    e.or = k;
    function I(D) {
      return (T, N) => T === t.nil ? N : N === t.nil ? T : (0, t._)`${U(T)} ${D} ${U(N)}`;
    }
    function U(D) {
      return D instanceof t.Name ? D : (0, t._)`(${D})`;
    }
  })(js)), js;
}
var Oe = {}, Td;
function qe() {
  if (Td) return Oe;
  Td = 1, Object.defineProperty(Oe, "__esModule", { value: !0 }), Oe.checkStrictMode = Oe.getErrorPath = Oe.Type = Oe.useFunc = Oe.setEvaluated = Oe.evaluatedPropsToName = Oe.mergeEvaluated = Oe.eachItem = Oe.unescapeJsonPointer = Oe.escapeJsonPointer = Oe.escapeFragment = Oe.unescapeFragment = Oe.schemaRefOrVal = Oe.schemaHasRulesButRef = Oe.schemaHasRules = Oe.checkUnknownRules = Oe.alwaysValidSchema = Oe.toHash = void 0;
  const e = De(), t = is();
  function o(S) {
    const _ = {};
    for (const w of S)
      _[w] = !0;
    return _;
  }
  Oe.toHash = o;
  function r(S, _) {
    return typeof _ == "boolean" ? _ : Object.keys(_).length === 0 ? !0 : (c(S, _), !n(_, S.self.RULES.all));
  }
  Oe.alwaysValidSchema = r;
  function c(S, _ = S.schema) {
    const { opts: w, self: R } = S;
    if (!w.strictSchema || typeof _ == "boolean")
      return;
    const P = R.RULES.keywords;
    for (const j in _)
      P[j] || $(S, `unknown keyword: "${j}"`);
  }
  Oe.checkUnknownRules = c;
  function n(S, _) {
    if (typeof S == "boolean")
      return !S;
    for (const w in S)
      if (_[w])
        return !0;
    return !1;
  }
  Oe.schemaHasRules = n;
  function s(S, _) {
    if (typeof S == "boolean")
      return !S;
    for (const w in S)
      if (w !== "$ref" && _.all[w])
        return !0;
    return !1;
  }
  Oe.schemaHasRulesButRef = s;
  function l({ topSchemaRef: S, schemaPath: _ }, w, R, P) {
    if (!P) {
      if (typeof w == "number" || typeof w == "boolean")
        return w;
      if (typeof w == "string")
        return (0, e._)`${w}`;
    }
    return (0, e._)`${S}${_}${(0, e.getProperty)(R)}`;
  }
  Oe.schemaRefOrVal = l;
  function a(S) {
    return f(decodeURIComponent(S));
  }
  Oe.unescapeFragment = a;
  function u(S) {
    return encodeURIComponent(i(S));
  }
  Oe.escapeFragment = u;
  function i(S) {
    return typeof S == "number" ? `${S}` : S.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  Oe.escapeJsonPointer = i;
  function f(S) {
    return S.replace(/~1/g, "/").replace(/~0/g, "~");
  }
  Oe.unescapeJsonPointer = f;
  function d(S, _) {
    if (Array.isArray(S))
      for (const w of S)
        _(w);
    else
      _(S);
  }
  Oe.eachItem = d;
  function m({ mergeNames: S, mergeToName: _, mergeValues: w, resultToName: R }) {
    return (P, j, M, B) => {
      const W = M === void 0 ? j : M instanceof e.Name ? (j instanceof e.Name ? S(P, j, M) : _(P, j, M), M) : j instanceof e.Name ? (_(P, M, j), j) : w(j, M);
      return B === e.Name && !(W instanceof e.Name) ? R(P, W) : W;
    };
  }
  Oe.mergeEvaluated = {
    props: m({
      mergeNames: (S, _, w) => S.if((0, e._)`${w} !== true && ${_} !== undefined`, () => {
        S.if((0, e._)`${_} === true`, () => S.assign(w, !0), () => S.assign(w, (0, e._)`${w} || {}`).code((0, e._)`Object.assign(${w}, ${_})`));
      }),
      mergeToName: (S, _, w) => S.if((0, e._)`${w} !== true`, () => {
        _ === !0 ? S.assign(w, !0) : (S.assign(w, (0, e._)`${w} || {}`), v(S, w, _));
      }),
      mergeValues: (S, _) => S === !0 ? !0 : { ...S, ..._ },
      resultToName: g
    }),
    items: m({
      mergeNames: (S, _, w) => S.if((0, e._)`${w} !== true && ${_} !== undefined`, () => S.assign(w, (0, e._)`${_} === true ? true : ${w} > ${_} ? ${w} : ${_}`)),
      mergeToName: (S, _, w) => S.if((0, e._)`${w} !== true`, () => S.assign(w, _ === !0 ? !0 : (0, e._)`${w} > ${_} ? ${w} : ${_}`)),
      mergeValues: (S, _) => S === !0 ? !0 : Math.max(S, _),
      resultToName: (S, _) => S.var("items", _)
    })
  };
  function g(S, _) {
    if (_ === !0)
      return S.var("props", !0);
    const w = S.var("props", (0, e._)`{}`);
    return _ !== void 0 && v(S, w, _), w;
  }
  Oe.evaluatedPropsToName = g;
  function v(S, _, w) {
    Object.keys(w).forEach((R) => S.assign((0, e._)`${_}${(0, e.getProperty)(R)}`, !0));
  }
  Oe.setEvaluated = v;
  const h = {};
  function y(S, _) {
    return S.scopeValue("func", {
      ref: _,
      code: h[_.code] || (h[_.code] = new t._Code(_.code))
    });
  }
  Oe.useFunc = y;
  var p;
  (function(S) {
    S[S.Num = 0] = "Num", S[S.Str = 1] = "Str";
  })(p || (Oe.Type = p = {}));
  function E(S, _, w) {
    if (S instanceof e.Name) {
      const R = _ === p.Num;
      return w ? R ? (0, e._)`"[" + ${S} + "]"` : (0, e._)`"['" + ${S} + "']"` : R ? (0, e._)`"/" + ${S}` : (0, e._)`"/" + ${S}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
    }
    return w ? (0, e.getProperty)(S).toString() : "/" + i(S);
  }
  Oe.getErrorPath = E;
  function $(S, _, w = S.opts.strictSchema) {
    if (w) {
      if (_ = `strict mode: ${_}`, w === !0)
        throw new Error(_);
      S.self.logger.warn(_);
    }
  }
  return Oe.checkStrictMode = $, Oe;
}
var yi = {}, Rd;
function lr() {
  if (Rd) return yi;
  Rd = 1, Object.defineProperty(yi, "__esModule", { value: !0 });
  const e = De(), t = {
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
  return yi.default = t, yi;
}
var Pd;
function cs() {
  return Pd || (Pd = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
    const t = De(), o = qe(), r = lr();
    e.keywordError = {
      message: ({ keyword: h }) => (0, t.str)`must pass "${h}" keyword validation`
    }, e.keyword$DataError = {
      message: ({ keyword: h, schemaType: y }) => y ? (0, t.str)`"${h}" keyword must be ${y} ($data)` : (0, t.str)`"${h}" keyword is invalid ($data)`
    };
    function c(h, y = e.keywordError, p, E) {
      const { it: $ } = h, { gen: S, compositeRule: _, allErrors: w } = $, R = f(h, y, p);
      E ?? (_ || w) ? a(S, R) : u($, (0, t._)`[${R}]`);
    }
    e.reportError = c;
    function n(h, y = e.keywordError, p) {
      const { it: E } = h, { gen: $, compositeRule: S, allErrors: _ } = E, w = f(h, y, p);
      a($, w), S || _ || u(E, r.default.vErrors);
    }
    e.reportExtraError = n;
    function s(h, y) {
      h.assign(r.default.errors, y), h.if((0, t._)`${r.default.vErrors} !== null`, () => h.if(y, () => h.assign((0, t._)`${r.default.vErrors}.length`, y), () => h.assign(r.default.vErrors, null)));
    }
    e.resetErrorsCount = s;
    function l({ gen: h, keyword: y, schemaValue: p, data: E, errsCount: $, it: S }) {
      if ($ === void 0)
        throw new Error("ajv implementation error");
      const _ = h.name("err");
      h.forRange("i", $, r.default.errors, (w) => {
        h.const(_, (0, t._)`${r.default.vErrors}[${w}]`), h.if((0, t._)`${_}.instancePath === undefined`, () => h.assign((0, t._)`${_}.instancePath`, (0, t.strConcat)(r.default.instancePath, S.errorPath))), h.assign((0, t._)`${_}.schemaPath`, (0, t.str)`${S.errSchemaPath}/${y}`), S.opts.verbose && (h.assign((0, t._)`${_}.schema`, p), h.assign((0, t._)`${_}.data`, E));
      });
    }
    e.extendErrors = l;
    function a(h, y) {
      const p = h.const("err", y);
      h.if((0, t._)`${r.default.vErrors} === null`, () => h.assign(r.default.vErrors, (0, t._)`[${p}]`), (0, t._)`${r.default.vErrors}.push(${p})`), h.code((0, t._)`${r.default.errors}++`);
    }
    function u(h, y) {
      const { gen: p, validateName: E, schemaEnv: $ } = h;
      $.$async ? p.throw((0, t._)`new ${h.ValidationError}(${y})`) : (p.assign((0, t._)`${E}.errors`, y), p.return(!1));
    }
    const i = {
      keyword: new t.Name("keyword"),
      schemaPath: new t.Name("schemaPath"),
      // also used in JTD errors
      params: new t.Name("params"),
      propertyName: new t.Name("propertyName"),
      message: new t.Name("message"),
      schema: new t.Name("schema"),
      parentSchema: new t.Name("parentSchema")
    };
    function f(h, y, p) {
      const { createErrors: E } = h.it;
      return E === !1 ? (0, t._)`{}` : d(h, y, p);
    }
    function d(h, y, p = {}) {
      const { gen: E, it: $ } = h, S = [
        m($, p),
        g(h, p)
      ];
      return v(h, y, S), E.object(...S);
    }
    function m({ errorPath: h }, { instancePath: y }) {
      const p = y ? (0, t.str)`${h}${(0, o.getErrorPath)(y, o.Type.Str)}` : h;
      return [r.default.instancePath, (0, t.strConcat)(r.default.instancePath, p)];
    }
    function g({ keyword: h, it: { errSchemaPath: y } }, { schemaPath: p, parentSchema: E }) {
      let $ = E ? y : (0, t.str)`${y}/${h}`;
      return p && ($ = (0, t.str)`${$}${(0, o.getErrorPath)(p, o.Type.Str)}`), [i.schemaPath, $];
    }
    function v(h, { params: y, message: p }, E) {
      const { keyword: $, data: S, schemaValue: _, it: w } = h, { opts: R, propertyName: P, topSchemaRef: j, schemaPath: M } = w;
      E.push([i.keyword, $], [i.params, typeof y == "function" ? y(h) : y || (0, t._)`{}`]), R.messages && E.push([i.message, typeof p == "function" ? p(h) : p]), R.verbose && E.push([i.schema, _], [i.parentSchema, (0, t._)`${j}${M}`], [r.default.data, S]), P && E.push([i.propertyName, P]);
    }
  })(Us)), Us;
}
var Nd;
function k_() {
  if (Nd) return Er;
  Nd = 1, Object.defineProperty(Er, "__esModule", { value: !0 }), Er.boolOrEmptySchema = Er.topBoolOrEmptySchema = void 0;
  const e = cs(), t = De(), o = lr(), r = {
    message: "boolean schema is false"
  };
  function c(l) {
    const { gen: a, schema: u, validateName: i } = l;
    u === !1 ? s(l, !1) : typeof u == "object" && u.$async === !0 ? a.return(o.default.data) : (a.assign((0, t._)`${i}.errors`, null), a.return(!0));
  }
  Er.topBoolOrEmptySchema = c;
  function n(l, a) {
    const { gen: u, schema: i } = l;
    i === !1 ? (u.var(a, !1), s(l)) : u.var(a, !0);
  }
  Er.boolOrEmptySchema = n;
  function s(l, a) {
    const { gen: u, data: i } = l, f = {
      gen: u,
      keyword: "false schema",
      data: i,
      schema: !1,
      schemaCode: !1,
      schemaValue: !1,
      params: {},
      it: l
    };
    (0, e.reportError)(f, r, void 0, a);
  }
  return Er;
}
var tt = {}, wr = {}, Od;
function s0() {
  if (Od) return wr;
  Od = 1, Object.defineProperty(wr, "__esModule", { value: !0 }), wr.getRules = wr.isJSONType = void 0;
  const e = ["string", "number", "integer", "boolean", "null", "object", "array"], t = new Set(e);
  function o(c) {
    return typeof c == "string" && t.has(c);
  }
  wr.isJSONType = o;
  function r() {
    const c = {
      number: { type: "number", rules: [] },
      string: { type: "string", rules: [] },
      array: { type: "array", rules: [] },
      object: { type: "object", rules: [] }
    };
    return {
      types: { ...c, integer: !0, boolean: !0, null: !0 },
      rules: [{ rules: [] }, c.number, c.string, c.array, c.object],
      post: { rules: [] },
      all: {},
      keywords: {}
    };
  }
  return wr.getRules = r, wr;
}
var Ht = {}, Ad;
function o0() {
  if (Ad) return Ht;
  Ad = 1, Object.defineProperty(Ht, "__esModule", { value: !0 }), Ht.shouldUseRule = Ht.shouldUseGroup = Ht.schemaHasRulesForType = void 0;
  function e({ schema: r, self: c }, n) {
    const s = c.RULES.types[n];
    return s && s !== !0 && t(r, s);
  }
  Ht.schemaHasRulesForType = e;
  function t(r, c) {
    return c.rules.some((n) => o(r, n));
  }
  Ht.shouldUseGroup = t;
  function o(r, c) {
    var n;
    return r[c.keyword] !== void 0 || ((n = c.definition.implements) === null || n === void 0 ? void 0 : n.some((s) => r[s] !== void 0));
  }
  return Ht.shouldUseRule = o, Ht;
}
var Id;
function as() {
  if (Id) return tt;
  Id = 1, Object.defineProperty(tt, "__esModule", { value: !0 }), tt.reportTypeError = tt.checkDataTypes = tt.checkDataType = tt.coerceAndCheckDataType = tt.getJSONTypes = tt.getSchemaTypes = tt.DataType = void 0;
  const e = s0(), t = o0(), o = cs(), r = De(), c = qe();
  var n;
  (function(p) {
    p[p.Correct = 0] = "Correct", p[p.Wrong = 1] = "Wrong";
  })(n || (tt.DataType = n = {}));
  function s(p) {
    const E = l(p.type);
    if (E.includes("null")) {
      if (p.nullable === !1)
        throw new Error("type: null contradicts nullable: false");
    } else {
      if (!E.length && p.nullable !== void 0)
        throw new Error('"nullable" cannot be used without "type"');
      p.nullable === !0 && E.push("null");
    }
    return E;
  }
  tt.getSchemaTypes = s;
  function l(p) {
    const E = Array.isArray(p) ? p : p ? [p] : [];
    if (E.every(e.isJSONType))
      return E;
    throw new Error("type must be JSONType or JSONType[]: " + E.join(","));
  }
  tt.getJSONTypes = l;
  function a(p, E) {
    const { gen: $, data: S, opts: _ } = p, w = i(E, _.coerceTypes), R = E.length > 0 && !(w.length === 0 && E.length === 1 && (0, t.schemaHasRulesForType)(p, E[0]));
    if (R) {
      const P = g(E, S, _.strictNumbers, n.Wrong);
      $.if(P, () => {
        w.length ? f(p, E, w) : h(p);
      });
    }
    return R;
  }
  tt.coerceAndCheckDataType = a;
  const u = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
  function i(p, E) {
    return E ? p.filter(($) => u.has($) || E === "array" && $ === "array") : [];
  }
  function f(p, E, $) {
    const { gen: S, data: _, opts: w } = p, R = S.let("dataType", (0, r._)`typeof ${_}`), P = S.let("coerced", (0, r._)`undefined`);
    w.coerceTypes === "array" && S.if((0, r._)`${R} == 'object' && Array.isArray(${_}) && ${_}.length == 1`, () => S.assign(_, (0, r._)`${_}[0]`).assign(R, (0, r._)`typeof ${_}`).if(g(E, _, w.strictNumbers), () => S.assign(P, _))), S.if((0, r._)`${P} !== undefined`);
    for (const M of $)
      (u.has(M) || M === "array" && w.coerceTypes === "array") && j(M);
    S.else(), h(p), S.endIf(), S.if((0, r._)`${P} !== undefined`, () => {
      S.assign(_, P), d(p, P);
    });
    function j(M) {
      switch (M) {
        case "string":
          S.elseIf((0, r._)`${R} == "number" || ${R} == "boolean"`).assign(P, (0, r._)`"" + ${_}`).elseIf((0, r._)`${_} === null`).assign(P, (0, r._)`""`);
          return;
        case "number":
          S.elseIf((0, r._)`${R} == "boolean" || ${_} === null
              || (${R} == "string" && ${_} && ${_} == +${_})`).assign(P, (0, r._)`+${_}`);
          return;
        case "integer":
          S.elseIf((0, r._)`${R} === "boolean" || ${_} === null
              || (${R} === "string" && ${_} && ${_} == +${_} && !(${_} % 1))`).assign(P, (0, r._)`+${_}`);
          return;
        case "boolean":
          S.elseIf((0, r._)`${_} === "false" || ${_} === 0 || ${_} === null`).assign(P, !1).elseIf((0, r._)`${_} === "true" || ${_} === 1`).assign(P, !0);
          return;
        case "null":
          S.elseIf((0, r._)`${_} === "" || ${_} === 0 || ${_} === false`), S.assign(P, null);
          return;
        case "array":
          S.elseIf((0, r._)`${R} === "string" || ${R} === "number"
              || ${R} === "boolean" || ${_} === null`).assign(P, (0, r._)`[${_}]`);
      }
    }
  }
  function d({ gen: p, parentData: E, parentDataProperty: $ }, S) {
    p.if((0, r._)`${E} !== undefined`, () => p.assign((0, r._)`${E}[${$}]`, S));
  }
  function m(p, E, $, S = n.Correct) {
    const _ = S === n.Correct ? r.operators.EQ : r.operators.NEQ;
    let w;
    switch (p) {
      case "null":
        return (0, r._)`${E} ${_} null`;
      case "array":
        w = (0, r._)`Array.isArray(${E})`;
        break;
      case "object":
        w = (0, r._)`${E} && typeof ${E} == "object" && !Array.isArray(${E})`;
        break;
      case "integer":
        w = R((0, r._)`!(${E} % 1) && !isNaN(${E})`);
        break;
      case "number":
        w = R();
        break;
      default:
        return (0, r._)`typeof ${E} ${_} ${p}`;
    }
    return S === n.Correct ? w : (0, r.not)(w);
    function R(P = r.nil) {
      return (0, r.and)((0, r._)`typeof ${E} == "number"`, P, $ ? (0, r._)`isFinite(${E})` : r.nil);
    }
  }
  tt.checkDataType = m;
  function g(p, E, $, S) {
    if (p.length === 1)
      return m(p[0], E, $, S);
    let _;
    const w = (0, c.toHash)(p);
    if (w.array && w.object) {
      const R = (0, r._)`typeof ${E} != "object"`;
      _ = w.null ? R : (0, r._)`!${E} || ${R}`, delete w.null, delete w.array, delete w.object;
    } else
      _ = r.nil;
    w.number && delete w.integer;
    for (const R in w)
      _ = (0, r.and)(_, m(R, E, $, S));
    return _;
  }
  tt.checkDataTypes = g;
  const v = {
    message: ({ schema: p }) => `must be ${p}`,
    params: ({ schema: p, schemaValue: E }) => typeof p == "string" ? (0, r._)`{type: ${p}}` : (0, r._)`{type: ${E}}`
  };
  function h(p) {
    const E = y(p);
    (0, o.reportError)(E, v);
  }
  tt.reportTypeError = h;
  function y(p) {
    const { gen: E, data: $, schema: S } = p, _ = (0, c.schemaRefOrVal)(p, S, "type");
    return {
      gen: E,
      keyword: "type",
      data: $,
      schema: S.type,
      schemaCode: _,
      schemaValue: _,
      parentSchema: S,
      params: {},
      it: p
    };
  }
  return tt;
}
var on = {}, Cd;
function L_() {
  if (Cd) return on;
  Cd = 1, Object.defineProperty(on, "__esModule", { value: !0 }), on.assignDefaults = void 0;
  const e = De(), t = qe();
  function o(c, n) {
    const { properties: s, items: l } = c.schema;
    if (n === "object" && s)
      for (const a in s)
        r(c, a, s[a].default);
    else n === "array" && Array.isArray(l) && l.forEach((a, u) => r(c, u, a.default));
  }
  on.assignDefaults = o;
  function r(c, n, s) {
    const { gen: l, compositeRule: a, data: u, opts: i } = c;
    if (s === void 0)
      return;
    const f = (0, e._)`${u}${(0, e.getProperty)(n)}`;
    if (a) {
      (0, t.checkStrictMode)(c, `default is ignored for: ${f}`);
      return;
    }
    let d = (0, e._)`${f} === undefined`;
    i.useDefaults === "empty" && (d = (0, e._)`${d} || ${f} === null || ${f} === ""`), l.if(d, (0, e._)`${f} = ${(0, e.stringify)(s)}`);
  }
  return on;
}
var Pt = {}, xe = {}, Dd;
function Dt() {
  if (Dd) return xe;
  Dd = 1, Object.defineProperty(xe, "__esModule", { value: !0 }), xe.validateUnion = xe.validateArray = xe.usePattern = xe.callValidateCode = xe.schemaProperties = xe.allSchemaProperties = xe.noPropertyInData = xe.propertyInData = xe.isOwnProperty = xe.hasPropFunc = xe.reportMissingProp = xe.checkMissingProp = xe.checkReportMissingProp = void 0;
  const e = De(), t = qe(), o = lr(), r = qe();
  function c(p, E) {
    const { gen: $, data: S, it: _ } = p;
    $.if(i($, S, E, _.opts.ownProperties), () => {
      p.setParams({ missingProperty: (0, e._)`${E}` }, !0), p.error();
    });
  }
  xe.checkReportMissingProp = c;
  function n({ gen: p, data: E, it: { opts: $ } }, S, _) {
    return (0, e.or)(...S.map((w) => (0, e.and)(i(p, E, w, $.ownProperties), (0, e._)`${_} = ${w}`)));
  }
  xe.checkMissingProp = n;
  function s(p, E) {
    p.setParams({ missingProperty: E }, !0), p.error();
  }
  xe.reportMissingProp = s;
  function l(p) {
    return p.scopeValue("func", {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      ref: Object.prototype.hasOwnProperty,
      code: (0, e._)`Object.prototype.hasOwnProperty`
    });
  }
  xe.hasPropFunc = l;
  function a(p, E, $) {
    return (0, e._)`${l(p)}.call(${E}, ${$})`;
  }
  xe.isOwnProperty = a;
  function u(p, E, $, S) {
    const _ = (0, e._)`${E}${(0, e.getProperty)($)} !== undefined`;
    return S ? (0, e._)`${_} && ${a(p, E, $)}` : _;
  }
  xe.propertyInData = u;
  function i(p, E, $, S) {
    const _ = (0, e._)`${E}${(0, e.getProperty)($)} === undefined`;
    return S ? (0, e.or)(_, (0, e.not)(a(p, E, $))) : _;
  }
  xe.noPropertyInData = i;
  function f(p) {
    return p ? Object.keys(p).filter((E) => E !== "__proto__") : [];
  }
  xe.allSchemaProperties = f;
  function d(p, E) {
    return f(E).filter(($) => !(0, t.alwaysValidSchema)(p, E[$]));
  }
  xe.schemaProperties = d;
  function m({ schemaCode: p, data: E, it: { gen: $, topSchemaRef: S, schemaPath: _, errorPath: w }, it: R }, P, j, M) {
    const B = M ? (0, e._)`${p}, ${E}, ${S}${_}` : E, W = [
      [o.default.instancePath, (0, e.strConcat)(o.default.instancePath, w)],
      [o.default.parentData, R.parentData],
      [o.default.parentDataProperty, R.parentDataProperty],
      [o.default.rootData, o.default.rootData]
    ];
    R.opts.dynamicRef && W.push([o.default.dynamicAnchors, o.default.dynamicAnchors]);
    const F = (0, e._)`${B}, ${$.object(...W)}`;
    return j !== e.nil ? (0, e._)`${P}.call(${j}, ${F})` : (0, e._)`${P}(${F})`;
  }
  xe.callValidateCode = m;
  const g = (0, e._)`new RegExp`;
  function v({ gen: p, it: { opts: E } }, $) {
    const S = E.unicodeRegExp ? "u" : "", { regExp: _ } = E.code, w = _($, S);
    return p.scopeValue("pattern", {
      key: w.toString(),
      ref: w,
      code: (0, e._)`${_.code === "new RegExp" ? g : (0, r.useFunc)(p, _)}(${$}, ${S})`
    });
  }
  xe.usePattern = v;
  function h(p) {
    const { gen: E, data: $, keyword: S, it: _ } = p, w = E.name("valid");
    if (_.allErrors) {
      const P = E.let("valid", !0);
      return R(() => E.assign(P, !1)), P;
    }
    return E.var(w, !0), R(() => E.break()), w;
    function R(P) {
      const j = E.const("len", (0, e._)`${$}.length`);
      E.forRange("i", 0, j, (M) => {
        p.subschema({
          keyword: S,
          dataProp: M,
          dataPropType: t.Type.Num
        }, w), E.if((0, e.not)(w), P);
      });
    }
  }
  xe.validateArray = h;
  function y(p) {
    const { gen: E, schema: $, keyword: S, it: _ } = p;
    if (!Array.isArray($))
      throw new Error("ajv implementation error");
    if ($.some((j) => (0, t.alwaysValidSchema)(_, j)) && !_.opts.unevaluated)
      return;
    const R = E.let("valid", !1), P = E.name("_valid");
    E.block(() => $.forEach((j, M) => {
      const B = p.subschema({
        keyword: S,
        schemaProp: M,
        compositeRule: !0
      }, P);
      E.assign(R, (0, e._)`${R} || ${P}`), p.mergeValidEvaluated(B, P) || E.if((0, e.not)(R));
    })), p.result(R, () => p.reset(), () => p.error(!0));
  }
  return xe.validateUnion = y, xe;
}
var kd;
function F_() {
  if (kd) return Pt;
  kd = 1, Object.defineProperty(Pt, "__esModule", { value: !0 }), Pt.validateKeywordUsage = Pt.validSchemaType = Pt.funcKeywordCode = Pt.macroKeywordCode = void 0;
  const e = De(), t = lr(), o = Dt(), r = cs();
  function c(d, m) {
    const { gen: g, keyword: v, schema: h, parentSchema: y, it: p } = d, E = m.macro.call(p.self, h, y, p), $ = u(g, v, E);
    p.opts.validateSchema !== !1 && p.self.validateSchema(E, !0);
    const S = g.name("valid");
    d.subschema({
      schema: E,
      schemaPath: e.nil,
      errSchemaPath: `${p.errSchemaPath}/${v}`,
      topSchemaRef: $,
      compositeRule: !0
    }, S), d.pass(S, () => d.error(!0));
  }
  Pt.macroKeywordCode = c;
  function n(d, m) {
    var g;
    const { gen: v, keyword: h, schema: y, parentSchema: p, $data: E, it: $ } = d;
    a($, m);
    const S = !E && m.compile ? m.compile.call($.self, y, p, $) : m.validate, _ = u(v, h, S), w = v.let("valid");
    d.block$data(w, R), d.ok((g = m.valid) !== null && g !== void 0 ? g : w);
    function R() {
      if (m.errors === !1)
        M(), m.modifying && s(d), B(() => d.error());
      else {
        const W = m.async ? P() : j();
        m.modifying && s(d), B(() => l(d, W));
      }
    }
    function P() {
      const W = v.let("ruleErrs", null);
      return v.try(() => M((0, e._)`await `), (F) => v.assign(w, !1).if((0, e._)`${F} instanceof ${$.ValidationError}`, () => v.assign(W, (0, e._)`${F}.errors`), () => v.throw(F))), W;
    }
    function j() {
      const W = (0, e._)`${_}.errors`;
      return v.assign(W, null), M(e.nil), W;
    }
    function M(W = m.async ? (0, e._)`await ` : e.nil) {
      const F = $.opts.passContext ? t.default.this : t.default.self, q = !("compile" in m && !E || m.schema === !1);
      v.assign(w, (0, e._)`${W}${(0, o.callValidateCode)(d, _, F, q)}`, m.modifying);
    }
    function B(W) {
      var F;
      v.if((0, e.not)((F = m.valid) !== null && F !== void 0 ? F : w), W);
    }
  }
  Pt.funcKeywordCode = n;
  function s(d) {
    const { gen: m, data: g, it: v } = d;
    m.if(v.parentData, () => m.assign(g, (0, e._)`${v.parentData}[${v.parentDataProperty}]`));
  }
  function l(d, m) {
    const { gen: g } = d;
    g.if((0, e._)`Array.isArray(${m})`, () => {
      g.assign(t.default.vErrors, (0, e._)`${t.default.vErrors} === null ? ${m} : ${t.default.vErrors}.concat(${m})`).assign(t.default.errors, (0, e._)`${t.default.vErrors}.length`), (0, r.extendErrors)(d);
    }, () => d.error());
  }
  function a({ schemaEnv: d }, m) {
    if (m.async && !d.$async)
      throw new Error("async keyword in sync schema");
  }
  function u(d, m, g) {
    if (g === void 0)
      throw new Error(`keyword "${m}" failed to compile`);
    return d.scopeValue("keyword", typeof g == "function" ? { ref: g } : { ref: g, code: (0, e.stringify)(g) });
  }
  function i(d, m, g = !1) {
    return !m.length || m.some((v) => v === "array" ? Array.isArray(d) : v === "object" ? d && typeof d == "object" && !Array.isArray(d) : typeof d == v || g && typeof d > "u");
  }
  Pt.validSchemaType = i;
  function f({ schema: d, opts: m, self: g, errSchemaPath: v }, h, y) {
    if (Array.isArray(h.keyword) ? !h.keyword.includes(y) : h.keyword !== y)
      throw new Error("ajv implementation error");
    const p = h.dependencies;
    if (p?.some((E) => !Object.prototype.hasOwnProperty.call(d, E)))
      throw new Error(`parent schema must have dependencies of ${y}: ${p.join(",")}`);
    if (h.validateSchema && !h.validateSchema(d[y])) {
      const $ = `keyword "${y}" value is invalid at path "${v}": ` + g.errorsText(h.validateSchema.errors);
      if (m.validateSchema === "log")
        g.logger.error($);
      else
        throw new Error($);
    }
  }
  return Pt.validateKeywordUsage = f, Pt;
}
var Bt = {}, Ld;
function q_() {
  if (Ld) return Bt;
  Ld = 1, Object.defineProperty(Bt, "__esModule", { value: !0 }), Bt.extendSubschemaMode = Bt.extendSubschemaData = Bt.getSubschema = void 0;
  const e = De(), t = qe();
  function o(n, { keyword: s, schemaProp: l, schema: a, schemaPath: u, errSchemaPath: i, topSchemaRef: f }) {
    if (s !== void 0 && a !== void 0)
      throw new Error('both "keyword" and "schema" passed, only one allowed');
    if (s !== void 0) {
      const d = n.schema[s];
      return l === void 0 ? {
        schema: d,
        schemaPath: (0, e._)`${n.schemaPath}${(0, e.getProperty)(s)}`,
        errSchemaPath: `${n.errSchemaPath}/${s}`
      } : {
        schema: d[l],
        schemaPath: (0, e._)`${n.schemaPath}${(0, e.getProperty)(s)}${(0, e.getProperty)(l)}`,
        errSchemaPath: `${n.errSchemaPath}/${s}/${(0, t.escapeFragment)(l)}`
      };
    }
    if (a !== void 0) {
      if (u === void 0 || i === void 0 || f === void 0)
        throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
      return {
        schema: a,
        schemaPath: u,
        topSchemaRef: f,
        errSchemaPath: i
      };
    }
    throw new Error('either "keyword" or "schema" must be passed');
  }
  Bt.getSubschema = o;
  function r(n, s, { dataProp: l, dataPropType: a, data: u, dataTypes: i, propertyName: f }) {
    if (u !== void 0 && l !== void 0)
      throw new Error('both "data" and "dataProp" passed, only one allowed');
    const { gen: d } = s;
    if (l !== void 0) {
      const { errorPath: g, dataPathArr: v, opts: h } = s, y = d.let("data", (0, e._)`${s.data}${(0, e.getProperty)(l)}`, !0);
      m(y), n.errorPath = (0, e.str)`${g}${(0, t.getErrorPath)(l, a, h.jsPropertySyntax)}`, n.parentDataProperty = (0, e._)`${l}`, n.dataPathArr = [...v, n.parentDataProperty];
    }
    if (u !== void 0) {
      const g = u instanceof e.Name ? u : d.let("data", u, !0);
      m(g), f !== void 0 && (n.propertyName = f);
    }
    i && (n.dataTypes = i);
    function m(g) {
      n.data = g, n.dataLevel = s.dataLevel + 1, n.dataTypes = [], s.definedProperties = /* @__PURE__ */ new Set(), n.parentData = s.data, n.dataNames = [...s.dataNames, g];
    }
  }
  Bt.extendSubschemaData = r;
  function c(n, { jtdDiscriminator: s, jtdMetadata: l, compositeRule: a, createErrors: u, allErrors: i }) {
    a !== void 0 && (n.compositeRule = a), u !== void 0 && (n.createErrors = u), i !== void 0 && (n.allErrors = i), n.jtdDiscriminator = s, n.jtdMetadata = l;
  }
  return Bt.extendSubschemaMode = c, Bt;
}
var ot = {}, Vs, Fd;
function ls() {
  return Fd || (Fd = 1, Vs = function e(t, o) {
    if (t === o) return !0;
    if (t && o && typeof t == "object" && typeof o == "object") {
      if (t.constructor !== o.constructor) return !1;
      var r, c, n;
      if (Array.isArray(t)) {
        if (r = t.length, r != o.length) return !1;
        for (c = r; c-- !== 0; )
          if (!e(t[c], o[c])) return !1;
        return !0;
      }
      if (t.constructor === RegExp) return t.source === o.source && t.flags === o.flags;
      if (t.valueOf !== Object.prototype.valueOf) return t.valueOf() === o.valueOf();
      if (t.toString !== Object.prototype.toString) return t.toString() === o.toString();
      if (n = Object.keys(t), r = n.length, r !== Object.keys(o).length) return !1;
      for (c = r; c-- !== 0; )
        if (!Object.prototype.hasOwnProperty.call(o, n[c])) return !1;
      for (c = r; c-- !== 0; ) {
        var s = n[c];
        if (!e(t[s], o[s])) return !1;
      }
      return !0;
    }
    return t !== t && o !== o;
  }), Vs;
}
var Gs = { exports: {} }, qd;
function U_() {
  if (qd) return Gs.exports;
  qd = 1;
  var e = Gs.exports = function(r, c, n) {
    typeof c == "function" && (n = c, c = {}), n = c.cb || n;
    var s = typeof n == "function" ? n : n.pre || function() {
    }, l = n.post || function() {
    };
    t(c, s, l, r, "", r);
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
  function t(r, c, n, s, l, a, u, i, f, d) {
    if (s && typeof s == "object" && !Array.isArray(s)) {
      c(s, l, a, u, i, f, d);
      for (var m in s) {
        var g = s[m];
        if (Array.isArray(g)) {
          if (m in e.arrayKeywords)
            for (var v = 0; v < g.length; v++)
              t(r, c, n, g[v], l + "/" + m + "/" + v, a, l, m, s, v);
        } else if (m in e.propsKeywords) {
          if (g && typeof g == "object")
            for (var h in g)
              t(r, c, n, g[h], l + "/" + m + "/" + o(h), a, l, m, s, h);
        } else (m in e.keywords || r.allKeys && !(m in e.skipKeywords)) && t(r, c, n, g, l + "/" + m, a, l, m, s);
      }
      n(s, l, a, u, i, f, d);
    }
  }
  function o(r) {
    return r.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  return Gs.exports;
}
var Ud;
function ds() {
  if (Ud) return ot;
  Ud = 1, Object.defineProperty(ot, "__esModule", { value: !0 }), ot.getSchemaRefs = ot.resolveUrl = ot.normalizeId = ot._getFullPath = ot.getFullPath = ot.inlineRef = void 0;
  const e = qe(), t = ls(), o = U_(), r = /* @__PURE__ */ new Set([
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
  function c(v, h = !0) {
    return typeof v == "boolean" ? !0 : h === !0 ? !s(v) : h ? l(v) <= h : !1;
  }
  ot.inlineRef = c;
  const n = /* @__PURE__ */ new Set([
    "$ref",
    "$recursiveRef",
    "$recursiveAnchor",
    "$dynamicRef",
    "$dynamicAnchor"
  ]);
  function s(v) {
    for (const h in v) {
      if (n.has(h))
        return !0;
      const y = v[h];
      if (Array.isArray(y) && y.some(s) || typeof y == "object" && s(y))
        return !0;
    }
    return !1;
  }
  function l(v) {
    let h = 0;
    for (const y in v) {
      if (y === "$ref")
        return 1 / 0;
      if (h++, !r.has(y) && (typeof v[y] == "object" && (0, e.eachItem)(v[y], (p) => h += l(p)), h === 1 / 0))
        return 1 / 0;
    }
    return h;
  }
  function a(v, h = "", y) {
    y !== !1 && (h = f(h));
    const p = v.parse(h);
    return u(v, p);
  }
  ot.getFullPath = a;
  function u(v, h) {
    return v.serialize(h).split("#")[0] + "#";
  }
  ot._getFullPath = u;
  const i = /#\/?$/;
  function f(v) {
    return v ? v.replace(i, "") : "";
  }
  ot.normalizeId = f;
  function d(v, h, y) {
    return y = f(y), v.resolve(h, y);
  }
  ot.resolveUrl = d;
  const m = /^[a-z_][-a-z0-9._]*$/i;
  function g(v, h) {
    if (typeof v == "boolean")
      return {};
    const { schemaId: y, uriResolver: p } = this.opts, E = f(v[y] || h), $ = { "": E }, S = a(p, E, !1), _ = {}, w = /* @__PURE__ */ new Set();
    return o(v, { allKeys: !0 }, (j, M, B, W) => {
      if (W === void 0)
        return;
      const F = S + M;
      let q = $[W];
      typeof j[y] == "string" && (q = J.call(this, j[y])), H.call(this, j.$anchor), H.call(this, j.$dynamicAnchor), $[M] = q;
      function J(G) {
        const Y = this.opts.uriResolver.resolve;
        if (G = f(q ? Y(q, G) : G), w.has(G))
          throw P(G);
        w.add(G);
        let k = this.refs[G];
        return typeof k == "string" && (k = this.refs[k]), typeof k == "object" ? R(j, k.schema, G) : G !== f(F) && (G[0] === "#" ? (R(j, _[G], G), _[G] = j) : this.refs[G] = F), G;
      }
      function H(G) {
        if (typeof G == "string") {
          if (!m.test(G))
            throw new Error(`invalid anchor "${G}"`);
          J.call(this, `#${G}`);
        }
      }
    }), _;
    function R(j, M, B) {
      if (M !== void 0 && !t(j, M))
        throw P(B);
    }
    function P(j) {
      return new Error(`reference "${j}" resolves to more than one schema`);
    }
  }
  return ot.getSchemaRefs = g, ot;
}
var jd;
function fs() {
  if (jd) return Gt;
  jd = 1, Object.defineProperty(Gt, "__esModule", { value: !0 }), Gt.getData = Gt.KeywordCxt = Gt.validateFunctionCode = void 0;
  const e = k_(), t = as(), o = o0(), r = as(), c = L_(), n = F_(), s = q_(), l = De(), a = lr(), u = ds(), i = qe(), f = cs();
  function d(C) {
    if (S(C) && (w(C), $(C))) {
      h(C);
      return;
    }
    m(C, () => (0, e.topBoolOrEmptySchema)(C));
  }
  Gt.validateFunctionCode = d;
  function m({ gen: C, validateName: L, schema: X, schemaEnv: Q, opts: re }, de) {
    re.code.es5 ? C.func(L, (0, l._)`${a.default.data}, ${a.default.valCxt}`, Q.$async, () => {
      C.code((0, l._)`"use strict"; ${p(X, re)}`), v(C, re), C.code(de);
    }) : C.func(L, (0, l._)`${a.default.data}, ${g(re)}`, Q.$async, () => C.code(p(X, re)).code(de));
  }
  function g(C) {
    return (0, l._)`{${a.default.instancePath}="", ${a.default.parentData}, ${a.default.parentDataProperty}, ${a.default.rootData}=${a.default.data}${C.dynamicRef ? (0, l._)`, ${a.default.dynamicAnchors}={}` : l.nil}}={}`;
  }
  function v(C, L) {
    C.if(a.default.valCxt, () => {
      C.var(a.default.instancePath, (0, l._)`${a.default.valCxt}.${a.default.instancePath}`), C.var(a.default.parentData, (0, l._)`${a.default.valCxt}.${a.default.parentData}`), C.var(a.default.parentDataProperty, (0, l._)`${a.default.valCxt}.${a.default.parentDataProperty}`), C.var(a.default.rootData, (0, l._)`${a.default.valCxt}.${a.default.rootData}`), L.dynamicRef && C.var(a.default.dynamicAnchors, (0, l._)`${a.default.valCxt}.${a.default.dynamicAnchors}`);
    }, () => {
      C.var(a.default.instancePath, (0, l._)`""`), C.var(a.default.parentData, (0, l._)`undefined`), C.var(a.default.parentDataProperty, (0, l._)`undefined`), C.var(a.default.rootData, a.default.data), L.dynamicRef && C.var(a.default.dynamicAnchors, (0, l._)`{}`);
    });
  }
  function h(C) {
    const { schema: L, opts: X, gen: Q } = C;
    m(C, () => {
      X.$comment && L.$comment && W(C), j(C), Q.let(a.default.vErrors, null), Q.let(a.default.errors, 0), X.unevaluated && y(C), R(C), F(C);
    });
  }
  function y(C) {
    const { gen: L, validateName: X } = C;
    C.evaluated = L.const("evaluated", (0, l._)`${X}.evaluated`), L.if((0, l._)`${C.evaluated}.dynamicProps`, () => L.assign((0, l._)`${C.evaluated}.props`, (0, l._)`undefined`)), L.if((0, l._)`${C.evaluated}.dynamicItems`, () => L.assign((0, l._)`${C.evaluated}.items`, (0, l._)`undefined`));
  }
  function p(C, L) {
    const X = typeof C == "object" && C[L.schemaId];
    return X && (L.code.source || L.code.process) ? (0, l._)`/*# sourceURL=${X} */` : l.nil;
  }
  function E(C, L) {
    if (S(C) && (w(C), $(C))) {
      _(C, L);
      return;
    }
    (0, e.boolOrEmptySchema)(C, L);
  }
  function $({ schema: C, self: L }) {
    if (typeof C == "boolean")
      return !C;
    for (const X in C)
      if (L.RULES.all[X])
        return !0;
    return !1;
  }
  function S(C) {
    return typeof C.schema != "boolean";
  }
  function _(C, L) {
    const { schema: X, gen: Q, opts: re } = C;
    re.$comment && X.$comment && W(C), M(C), B(C);
    const de = Q.const("_errs", a.default.errors);
    R(C, de), Q.var(L, (0, l._)`${de} === ${a.default.errors}`);
  }
  function w(C) {
    (0, i.checkUnknownRules)(C), P(C);
  }
  function R(C, L) {
    if (C.opts.jtd)
      return J(C, [], !1, L);
    const X = (0, t.getSchemaTypes)(C.schema), Q = (0, t.coerceAndCheckDataType)(C, X);
    J(C, X, !Q, L);
  }
  function P(C) {
    const { schema: L, errSchemaPath: X, opts: Q, self: re } = C;
    L.$ref && Q.ignoreKeywordsWithRef && (0, i.schemaHasRulesButRef)(L, re.RULES) && re.logger.warn(`$ref: keywords ignored in schema at path "${X}"`);
  }
  function j(C) {
    const { schema: L, opts: X } = C;
    L.default !== void 0 && X.useDefaults && X.strictSchema && (0, i.checkStrictMode)(C, "default is ignored in the schema root");
  }
  function M(C) {
    const L = C.schema[C.opts.schemaId];
    L && (C.baseId = (0, u.resolveUrl)(C.opts.uriResolver, C.baseId, L));
  }
  function B(C) {
    if (C.schema.$async && !C.schemaEnv.$async)
      throw new Error("async schema in sync schema");
  }
  function W({ gen: C, schemaEnv: L, schema: X, errSchemaPath: Q, opts: re }) {
    const de = X.$comment;
    if (re.$comment === !0)
      C.code((0, l._)`${a.default.self}.logger.log(${de})`);
    else if (typeof re.$comment == "function") {
      const ve = (0, l.str)`${Q}/$comment`, Pe = C.scopeValue("root", { ref: L.root });
      C.code((0, l._)`${a.default.self}.opts.$comment(${de}, ${ve}, ${Pe}.schema)`);
    }
  }
  function F(C) {
    const { gen: L, schemaEnv: X, validateName: Q, ValidationError: re, opts: de } = C;
    X.$async ? L.if((0, l._)`${a.default.errors} === 0`, () => L.return(a.default.data), () => L.throw((0, l._)`new ${re}(${a.default.vErrors})`)) : (L.assign((0, l._)`${Q}.errors`, a.default.vErrors), de.unevaluated && q(C), L.return((0, l._)`${a.default.errors} === 0`));
  }
  function q({ gen: C, evaluated: L, props: X, items: Q }) {
    X instanceof l.Name && C.assign((0, l._)`${L}.props`, X), Q instanceof l.Name && C.assign((0, l._)`${L}.items`, Q);
  }
  function J(C, L, X, Q) {
    const { gen: re, schema: de, data: ve, allErrors: Pe, opts: Ce, self: Ne } = C, { RULES: be } = Ne;
    if (de.$ref && (Ce.ignoreKeywordsWithRef || !(0, i.schemaHasRulesButRef)(de, be))) {
      re.block(() => A(C, "$ref", be.all.$ref.definition));
      return;
    }
    Ce.jtd || G(C, L), re.block(() => {
      for (const te of be.rules)
        b(te);
      b(be.post);
    });
    function b(te) {
      (0, o.shouldUseGroup)(de, te) && (te.type ? (re.if((0, r.checkDataType)(te.type, ve, Ce.strictNumbers)), H(C, te), L.length === 1 && L[0] === te.type && X && (re.else(), (0, r.reportTypeError)(C)), re.endIf()) : H(C, te), Pe || re.if((0, l._)`${a.default.errors} === ${Q || 0}`));
    }
  }
  function H(C, L) {
    const { gen: X, schema: Q, opts: { useDefaults: re } } = C;
    re && (0, c.assignDefaults)(C, L.type), X.block(() => {
      for (const de of L.rules)
        (0, o.shouldUseRule)(Q, de) && A(C, de.keyword, de.definition, L.type);
    });
  }
  function G(C, L) {
    C.schemaEnv.meta || !C.opts.strictTypes || (Y(C, L), C.opts.allowUnionTypes || k(C, L), I(C, C.dataTypes));
  }
  function Y(C, L) {
    if (L.length) {
      if (!C.dataTypes.length) {
        C.dataTypes = L;
        return;
      }
      L.forEach((X) => {
        D(C.dataTypes, X) || N(C, `type "${X}" not allowed by context "${C.dataTypes.join(",")}"`);
      }), T(C, L);
    }
  }
  function k(C, L) {
    L.length > 1 && !(L.length === 2 && L.includes("null")) && N(C, "use allowUnionTypes to allow union type keyword");
  }
  function I(C, L) {
    const X = C.self.RULES.all;
    for (const Q in X) {
      const re = X[Q];
      if (typeof re == "object" && (0, o.shouldUseRule)(C.schema, re)) {
        const { type: de } = re.definition;
        de.length && !de.some((ve) => U(L, ve)) && N(C, `missing type "${de.join(",")}" for keyword "${Q}"`);
      }
    }
  }
  function U(C, L) {
    return C.includes(L) || L === "number" && C.includes("integer");
  }
  function D(C, L) {
    return C.includes(L) || L === "integer" && C.includes("number");
  }
  function T(C, L) {
    const X = [];
    for (const Q of C.dataTypes)
      D(L, Q) ? X.push(Q) : L.includes("integer") && Q === "number" && X.push("integer");
    C.dataTypes = X;
  }
  function N(C, L) {
    const X = C.schemaEnv.baseId + C.errSchemaPath;
    L += ` at "${X}" (strictTypes)`, (0, i.checkStrictMode)(C, L, C.opts.strictTypes);
  }
  class V {
    constructor(L, X, Q) {
      if ((0, n.validateKeywordUsage)(L, X, Q), this.gen = L.gen, this.allErrors = L.allErrors, this.keyword = Q, this.data = L.data, this.schema = L.schema[Q], this.$data = X.$data && L.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, i.schemaRefOrVal)(L, this.schema, Q, this.$data), this.schemaType = X.schemaType, this.parentSchema = L.schema, this.params = {}, this.it = L, this.def = X, this.$data)
        this.schemaCode = L.gen.const("vSchema", z(this.$data, L));
      else if (this.schemaCode = this.schemaValue, !(0, n.validSchemaType)(this.schema, X.schemaType, X.allowUndefined))
        throw new Error(`${Q} value must be ${JSON.stringify(X.schemaType)}`);
      ("code" in X ? X.trackErrors : X.errors !== !1) && (this.errsCount = L.gen.const("_errs", a.default.errors));
    }
    result(L, X, Q) {
      this.failResult((0, l.not)(L), X, Q);
    }
    failResult(L, X, Q) {
      this.gen.if(L), Q ? Q() : this.error(), X ? (this.gen.else(), X(), this.allErrors && this.gen.endIf()) : this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    pass(L, X) {
      this.failResult((0, l.not)(L), void 0, X);
    }
    fail(L) {
      if (L === void 0) {
        this.error(), this.allErrors || this.gen.if(!1);
        return;
      }
      this.gen.if(L), this.error(), this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    fail$data(L) {
      if (!this.$data)
        return this.fail(L);
      const { schemaCode: X } = this;
      this.fail((0, l._)`${X} !== undefined && (${(0, l.or)(this.invalid$data(), L)})`);
    }
    error(L, X, Q) {
      if (X) {
        this.setParams(X), this._error(L, Q), this.setParams({});
        return;
      }
      this._error(L, Q);
    }
    _error(L, X) {
      (L ? f.reportExtraError : f.reportError)(this, this.def.error, X);
    }
    $dataError() {
      (0, f.reportError)(this, this.def.$dataError || f.keyword$DataError);
    }
    reset() {
      if (this.errsCount === void 0)
        throw new Error('add "trackErrors" to keyword definition');
      (0, f.resetErrorsCount)(this.gen, this.errsCount);
    }
    ok(L) {
      this.allErrors || this.gen.if(L);
    }
    setParams(L, X) {
      X ? Object.assign(this.params, L) : this.params = L;
    }
    block$data(L, X, Q = l.nil) {
      this.gen.block(() => {
        this.check$data(L, Q), X();
      });
    }
    check$data(L = l.nil, X = l.nil) {
      if (!this.$data)
        return;
      const { gen: Q, schemaCode: re, schemaType: de, def: ve } = this;
      Q.if((0, l.or)((0, l._)`${re} === undefined`, X)), L !== l.nil && Q.assign(L, !0), (de.length || ve.validateSchema) && (Q.elseIf(this.invalid$data()), this.$dataError(), L !== l.nil && Q.assign(L, !1)), Q.else();
    }
    invalid$data() {
      const { gen: L, schemaCode: X, schemaType: Q, def: re, it: de } = this;
      return (0, l.or)(ve(), Pe());
      function ve() {
        if (Q.length) {
          if (!(X instanceof l.Name))
            throw new Error("ajv implementation error");
          const Ce = Array.isArray(Q) ? Q : [Q];
          return (0, l._)`${(0, r.checkDataTypes)(Ce, X, de.opts.strictNumbers, r.DataType.Wrong)}`;
        }
        return l.nil;
      }
      function Pe() {
        if (re.validateSchema) {
          const Ce = L.scopeValue("validate$data", { ref: re.validateSchema });
          return (0, l._)`!${Ce}(${X})`;
        }
        return l.nil;
      }
    }
    subschema(L, X) {
      const Q = (0, s.getSubschema)(this.it, L);
      (0, s.extendSubschemaData)(Q, this.it, L), (0, s.extendSubschemaMode)(Q, L);
      const re = { ...this.it, ...Q, items: void 0, props: void 0 };
      return E(re, X), re;
    }
    mergeEvaluated(L, X) {
      const { it: Q, gen: re } = this;
      Q.opts.unevaluated && (Q.props !== !0 && L.props !== void 0 && (Q.props = i.mergeEvaluated.props(re, L.props, Q.props, X)), Q.items !== !0 && L.items !== void 0 && (Q.items = i.mergeEvaluated.items(re, L.items, Q.items, X)));
    }
    mergeValidEvaluated(L, X) {
      const { it: Q, gen: re } = this;
      if (Q.opts.unevaluated && (Q.props !== !0 || Q.items !== !0))
        return re.if(X, () => this.mergeEvaluated(L, l.Name)), !0;
    }
  }
  Gt.KeywordCxt = V;
  function A(C, L, X, Q) {
    const re = new V(C, X, L);
    "code" in X ? X.code(re, Q) : re.$data && X.validate ? (0, n.funcKeywordCode)(re, X) : "macro" in X ? (0, n.macroKeywordCode)(re, X) : (X.compile || X.validate) && (0, n.funcKeywordCode)(re, X);
  }
  const O = /^\/(?:[^~]|~0|~1)*$/, Z = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
  function z(C, { dataLevel: L, dataNames: X, dataPathArr: Q }) {
    let re, de;
    if (C === "")
      return a.default.rootData;
    if (C[0] === "/") {
      if (!O.test(C))
        throw new Error(`Invalid JSON-pointer: ${C}`);
      re = C, de = a.default.rootData;
    } else {
      const Ne = Z.exec(C);
      if (!Ne)
        throw new Error(`Invalid JSON-pointer: ${C}`);
      const be = +Ne[1];
      if (re = Ne[2], re === "#") {
        if (be >= L)
          throw new Error(Ce("property/index", be));
        return Q[L - be];
      }
      if (be > L)
        throw new Error(Ce("data", be));
      if (de = X[L - be], !re)
        return de;
    }
    let ve = de;
    const Pe = re.split("/");
    for (const Ne of Pe)
      Ne && (de = (0, l._)`${de}${(0, l.getProperty)((0, i.unescapeJsonPointer)(Ne))}`, ve = (0, l._)`${ve} && ${de}`);
    return ve;
    function Ce(Ne, be) {
      return `Cannot access ${Ne} ${be} levels up, current level is ${L}`;
    }
  }
  return Gt.getData = z, Gt;
}
var gi = {}, Md;
function sl() {
  if (Md) return gi;
  Md = 1, Object.defineProperty(gi, "__esModule", { value: !0 });
  class e extends Error {
    constructor(o) {
      super("validation failed"), this.errors = o, this.ajv = this.validation = !0;
    }
  }
  return gi.default = e, gi;
}
var vi = {}, xd;
function hs() {
  if (xd) return vi;
  xd = 1, Object.defineProperty(vi, "__esModule", { value: !0 });
  const e = ds();
  class t extends Error {
    constructor(r, c, n, s) {
      super(s || `can't resolve reference ${n} from id ${c}`), this.missingRef = (0, e.resolveUrl)(r, c, n), this.missingSchema = (0, e.normalizeId)((0, e.getFullPath)(r, this.missingRef));
    }
  }
  return vi.default = t, vi;
}
var yt = {}, Vd;
function ol() {
  if (Vd) return yt;
  Vd = 1, Object.defineProperty(yt, "__esModule", { value: !0 }), yt.resolveSchema = yt.getCompilingSchema = yt.resolveRef = yt.compileSchema = yt.SchemaEnv = void 0;
  const e = De(), t = sl(), o = lr(), r = ds(), c = qe(), n = fs();
  class s {
    constructor(y) {
      var p;
      this.refs = {}, this.dynamicAnchors = {};
      let E;
      typeof y.schema == "object" && (E = y.schema), this.schema = y.schema, this.schemaId = y.schemaId, this.root = y.root || this, this.baseId = (p = y.baseId) !== null && p !== void 0 ? p : (0, r.normalizeId)(E?.[y.schemaId || "$id"]), this.schemaPath = y.schemaPath, this.localRefs = y.localRefs, this.meta = y.meta, this.$async = E?.$async, this.refs = {};
    }
  }
  yt.SchemaEnv = s;
  function l(h) {
    const y = i.call(this, h);
    if (y)
      return y;
    const p = (0, r.getFullPath)(this.opts.uriResolver, h.root.baseId), { es5: E, lines: $ } = this.opts.code, { ownProperties: S } = this.opts, _ = new e.CodeGen(this.scope, { es5: E, lines: $, ownProperties: S });
    let w;
    h.$async && (w = _.scopeValue("Error", {
      ref: t.default,
      code: (0, e._)`require("ajv/dist/runtime/validation_error").default`
    }));
    const R = _.scopeName("validate");
    h.validateName = R;
    const P = {
      gen: _,
      allErrors: this.opts.allErrors,
      data: o.default.data,
      parentData: o.default.parentData,
      parentDataProperty: o.default.parentDataProperty,
      dataNames: [o.default.data],
      dataPathArr: [e.nil],
      // TODO can its length be used as dataLevel if nil is removed?
      dataLevel: 0,
      dataTypes: [],
      definedProperties: /* @__PURE__ */ new Set(),
      topSchemaRef: _.scopeValue("schema", this.opts.code.source === !0 ? { ref: h.schema, code: (0, e.stringify)(h.schema) } : { ref: h.schema }),
      validateName: R,
      ValidationError: w,
      schema: h.schema,
      schemaEnv: h,
      rootId: p,
      baseId: h.baseId || p,
      schemaPath: e.nil,
      errSchemaPath: h.schemaPath || (this.opts.jtd ? "" : "#"),
      errorPath: (0, e._)`""`,
      opts: this.opts,
      self: this
    };
    let j;
    try {
      this._compilations.add(h), (0, n.validateFunctionCode)(P), _.optimize(this.opts.code.optimize);
      const M = _.toString();
      j = `${_.scopeRefs(o.default.scope)}return ${M}`, this.opts.code.process && (j = this.opts.code.process(j, h));
      const W = new Function(`${o.default.self}`, `${o.default.scope}`, j)(this, this.scope.get());
      if (this.scope.value(R, { ref: W }), W.errors = null, W.schema = h.schema, W.schemaEnv = h, h.$async && (W.$async = !0), this.opts.code.source === !0 && (W.source = { validateName: R, validateCode: M, scopeValues: _._values }), this.opts.unevaluated) {
        const { props: F, items: q } = P;
        W.evaluated = {
          props: F instanceof e.Name ? void 0 : F,
          items: q instanceof e.Name ? void 0 : q,
          dynamicProps: F instanceof e.Name,
          dynamicItems: q instanceof e.Name
        }, W.source && (W.source.evaluated = (0, e.stringify)(W.evaluated));
      }
      return h.validate = W, h;
    } catch (M) {
      throw delete h.validate, delete h.validateName, j && this.logger.error("Error compiling schema, function code:", j), M;
    } finally {
      this._compilations.delete(h);
    }
  }
  yt.compileSchema = l;
  function a(h, y, p) {
    var E;
    p = (0, r.resolveUrl)(this.opts.uriResolver, y, p);
    const $ = h.refs[p];
    if ($)
      return $;
    let S = d.call(this, h, p);
    if (S === void 0) {
      const _ = (E = h.localRefs) === null || E === void 0 ? void 0 : E[p], { schemaId: w } = this.opts;
      _ && (S = new s({ schema: _, schemaId: w, root: h, baseId: y }));
    }
    if (S !== void 0)
      return h.refs[p] = u.call(this, S);
  }
  yt.resolveRef = a;
  function u(h) {
    return (0, r.inlineRef)(h.schema, this.opts.inlineRefs) ? h.schema : h.validate ? h : l.call(this, h);
  }
  function i(h) {
    for (const y of this._compilations)
      if (f(y, h))
        return y;
  }
  yt.getCompilingSchema = i;
  function f(h, y) {
    return h.schema === y.schema && h.root === y.root && h.baseId === y.baseId;
  }
  function d(h, y) {
    let p;
    for (; typeof (p = this.refs[y]) == "string"; )
      y = p;
    return p || this.schemas[y] || m.call(this, h, y);
  }
  function m(h, y) {
    const p = this.opts.uriResolver.parse(y), E = (0, r._getFullPath)(this.opts.uriResolver, p);
    let $ = (0, r.getFullPath)(this.opts.uriResolver, h.baseId, void 0);
    if (Object.keys(h.schema).length > 0 && E === $)
      return v.call(this, p, h);
    const S = (0, r.normalizeId)(E), _ = this.refs[S] || this.schemas[S];
    if (typeof _ == "string") {
      const w = m.call(this, h, _);
      return typeof w?.schema != "object" ? void 0 : v.call(this, p, w);
    }
    if (typeof _?.schema == "object") {
      if (_.validate || l.call(this, _), S === (0, r.normalizeId)(y)) {
        const { schema: w } = _, { schemaId: R } = this.opts, P = w[R];
        return P && ($ = (0, r.resolveUrl)(this.opts.uriResolver, $, P)), new s({ schema: w, schemaId: R, root: h, baseId: $ });
      }
      return v.call(this, p, _);
    }
  }
  yt.resolveSchema = m;
  const g = /* @__PURE__ */ new Set([
    "properties",
    "patternProperties",
    "enum",
    "dependencies",
    "definitions"
  ]);
  function v(h, { baseId: y, schema: p, root: E }) {
    var $;
    if ((($ = h.fragment) === null || $ === void 0 ? void 0 : $[0]) !== "/")
      return;
    for (const w of h.fragment.slice(1).split("/")) {
      if (typeof p == "boolean")
        return;
      const R = p[(0, c.unescapeFragment)(w)];
      if (R === void 0)
        return;
      p = R;
      const P = typeof p == "object" && p[this.opts.schemaId];
      !g.has(w) && P && (y = (0, r.resolveUrl)(this.opts.uriResolver, y, P));
    }
    let S;
    if (typeof p != "boolean" && p.$ref && !(0, c.schemaHasRulesButRef)(p, this.RULES)) {
      const w = (0, r.resolveUrl)(this.opts.uriResolver, y, p.$ref);
      S = m.call(this, E, w);
    }
    const { schemaId: _ } = this.opts;
    if (S = S || new s({ schema: p, schemaId: _, root: E, baseId: y }), S.schema !== S.root.schema)
      return S;
  }
  return yt;
}
const j_ = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", M_ = "Meta-schema for $data reference (JSON AnySchema extension proposal)", x_ = "object", V_ = ["$data"], G_ = { $data: { type: "string", anyOf: [{ format: "relative-json-pointer" }, { format: "json-pointer" }] } }, H_ = !1, B_ = {
  $id: j_,
  description: M_,
  type: x_,
  required: V_,
  properties: G_,
  additionalProperties: H_
};
var _i = {}, un = { exports: {} }, Hs, Gd;
function u0() {
  if (Gd) return Hs;
  Gd = 1;
  const e = RegExp.prototype.test.bind(/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu), t = RegExp.prototype.test.bind(/^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/u);
  function o(d) {
    let m = "", g = 0, v = 0;
    for (v = 0; v < d.length; v++)
      if (g = d[v].charCodeAt(0), g !== 48) {
        if (!(g >= 48 && g <= 57 || g >= 65 && g <= 70 || g >= 97 && g <= 102))
          return "";
        m += d[v];
        break;
      }
    for (v += 1; v < d.length; v++) {
      if (g = d[v].charCodeAt(0), !(g >= 48 && g <= 57 || g >= 65 && g <= 70 || g >= 97 && g <= 102))
        return "";
      m += d[v];
    }
    return m;
  }
  const r = RegExp.prototype.test.bind(/[^!"$&'()*+,\-.;=_`a-z{}~]/u);
  function c(d) {
    return d.length = 0, !0;
  }
  function n(d, m, g) {
    if (d.length) {
      const v = o(d);
      if (v !== "")
        m.push(v);
      else
        return g.error = !0, !1;
      d.length = 0;
    }
    return !0;
  }
  function s(d) {
    let m = 0;
    const g = { error: !1, address: "", zone: "" }, v = [], h = [];
    let y = !1, p = !1, E = n;
    for (let $ = 0; $ < d.length; $++) {
      const S = d[$];
      if (!(S === "[" || S === "]"))
        if (S === ":") {
          if (y === !0 && (p = !0), !E(h, v, g))
            break;
          if (++m > 7) {
            g.error = !0;
            break;
          }
          $ > 0 && d[$ - 1] === ":" && (y = !0), v.push(":");
          continue;
        } else if (S === "%") {
          if (!E(h, v, g))
            break;
          E = c;
        } else {
          h.push(S);
          continue;
        }
    }
    return h.length && (E === c ? g.zone = h.join("") : p ? v.push(h.join("")) : v.push(o(h))), g.address = v.join(""), g;
  }
  function l(d) {
    if (a(d, ":") < 2)
      return { host: d, isIPV6: !1 };
    const m = s(d);
    if (m.error)
      return { host: d, isIPV6: !1 };
    {
      let g = m.address, v = m.address;
      return m.zone && (g += "%" + m.zone, v += "%25" + m.zone), { host: g, isIPV6: !0, escapedHost: v };
    }
  }
  function a(d, m) {
    let g = 0;
    for (let v = 0; v < d.length; v++)
      d[v] === m && g++;
    return g;
  }
  function u(d) {
    let m = d;
    const g = [];
    let v = -1, h = 0;
    for (; h = m.length; ) {
      if (h === 1) {
        if (m === ".")
          break;
        if (m === "/") {
          g.push("/");
          break;
        } else {
          g.push(m);
          break;
        }
      } else if (h === 2) {
        if (m[0] === ".") {
          if (m[1] === ".")
            break;
          if (m[1] === "/") {
            m = m.slice(2);
            continue;
          }
        } else if (m[0] === "/" && (m[1] === "." || m[1] === "/")) {
          g.push("/");
          break;
        }
      } else if (h === 3 && m === "/..") {
        g.length !== 0 && g.pop(), g.push("/");
        break;
      }
      if (m[0] === ".") {
        if (m[1] === ".") {
          if (m[2] === "/") {
            m = m.slice(3);
            continue;
          }
        } else if (m[1] === "/") {
          m = m.slice(2);
          continue;
        }
      } else if (m[0] === "/" && m[1] === ".") {
        if (m[2] === "/") {
          m = m.slice(2);
          continue;
        } else if (m[2] === "." && m[3] === "/") {
          m = m.slice(3), g.length !== 0 && g.pop();
          continue;
        }
      }
      if ((v = m.indexOf("/", 1)) === -1) {
        g.push(m);
        break;
      } else
        g.push(m.slice(0, v)), m = m.slice(v);
    }
    return g.join("");
  }
  function i(d, m) {
    const g = m !== !0 ? escape : unescape;
    return d.scheme !== void 0 && (d.scheme = g(d.scheme)), d.userinfo !== void 0 && (d.userinfo = g(d.userinfo)), d.host !== void 0 && (d.host = g(d.host)), d.path !== void 0 && (d.path = g(d.path)), d.query !== void 0 && (d.query = g(d.query)), d.fragment !== void 0 && (d.fragment = g(d.fragment)), d;
  }
  function f(d) {
    const m = [];
    if (d.userinfo !== void 0 && (m.push(d.userinfo), m.push("@")), d.host !== void 0) {
      let g = unescape(d.host);
      if (!t(g)) {
        const v = l(g);
        v.isIPV6 === !0 ? g = `[${v.escapedHost}]` : g = d.host;
      }
      m.push(g);
    }
    return (typeof d.port == "number" || typeof d.port == "string") && (m.push(":"), m.push(String(d.port))), m.length ? m.join("") : void 0;
  }
  return Hs = {
    nonSimpleDomain: r,
    recomposeAuthority: f,
    normalizeComponentEncoding: i,
    removeDotSegments: u,
    isIPv4: t,
    isUUID: e,
    normalizeIPv6: l,
    stringArrayToHexStripped: o
  }, Hs;
}
var Bs, Hd;
function z_() {
  if (Hd) return Bs;
  Hd = 1;
  const { isUUID: e } = u0(), t = /([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-.:;=@]|%[\da-f]{2})+)/iu, o = (
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
  function r(S) {
    return o.indexOf(
      /** @type {*} */
      S
    ) !== -1;
  }
  function c(S) {
    return S.secure === !0 ? !0 : S.secure === !1 ? !1 : S.scheme ? S.scheme.length === 3 && (S.scheme[0] === "w" || S.scheme[0] === "W") && (S.scheme[1] === "s" || S.scheme[1] === "S") && (S.scheme[2] === "s" || S.scheme[2] === "S") : !1;
  }
  function n(S) {
    return S.host || (S.error = S.error || "HTTP URIs must have a host."), S;
  }
  function s(S) {
    const _ = String(S.scheme).toLowerCase() === "https";
    return (S.port === (_ ? 443 : 80) || S.port === "") && (S.port = void 0), S.path || (S.path = "/"), S;
  }
  function l(S) {
    return S.secure = c(S), S.resourceName = (S.path || "/") + (S.query ? "?" + S.query : ""), S.path = void 0, S.query = void 0, S;
  }
  function a(S) {
    if ((S.port === (c(S) ? 443 : 80) || S.port === "") && (S.port = void 0), typeof S.secure == "boolean" && (S.scheme = S.secure ? "wss" : "ws", S.secure = void 0), S.resourceName) {
      const [_, w] = S.resourceName.split("?");
      S.path = _ && _ !== "/" ? _ : void 0, S.query = w, S.resourceName = void 0;
    }
    return S.fragment = void 0, S;
  }
  function u(S, _) {
    if (!S.path)
      return S.error = "URN can not be parsed", S;
    const w = S.path.match(t);
    if (w) {
      const R = _.scheme || S.scheme || "urn";
      S.nid = w[1].toLowerCase(), S.nss = w[2];
      const P = `${R}:${_.nid || S.nid}`, j = $(P);
      S.path = void 0, j && (S = j.parse(S, _));
    } else
      S.error = S.error || "URN can not be parsed.";
    return S;
  }
  function i(S, _) {
    if (S.nid === void 0)
      throw new Error("URN without nid cannot be serialized");
    const w = _.scheme || S.scheme || "urn", R = S.nid.toLowerCase(), P = `${w}:${_.nid || R}`, j = $(P);
    j && (S = j.serialize(S, _));
    const M = S, B = S.nss;
    return M.path = `${R || _.nid}:${B}`, _.skipEscape = !0, M;
  }
  function f(S, _) {
    const w = S;
    return w.uuid = w.nss, w.nss = void 0, !_.tolerant && (!w.uuid || !e(w.uuid)) && (w.error = w.error || "UUID is not valid."), w;
  }
  function d(S) {
    const _ = S;
    return _.nss = (S.uuid || "").toLowerCase(), _;
  }
  const m = (
    /** @type {SchemeHandler} */
    {
      scheme: "http",
      domainHost: !0,
      parse: n,
      serialize: s
    }
  ), g = (
    /** @type {SchemeHandler} */
    {
      scheme: "https",
      domainHost: m.domainHost,
      parse: n,
      serialize: s
    }
  ), v = (
    /** @type {SchemeHandler} */
    {
      scheme: "ws",
      domainHost: !0,
      parse: l,
      serialize: a
    }
  ), h = (
    /** @type {SchemeHandler} */
    {
      scheme: "wss",
      domainHost: v.domainHost,
      parse: v.parse,
      serialize: v.serialize
    }
  ), E = (
    /** @type {Record<SchemeName, SchemeHandler>} */
    {
      http: m,
      https: g,
      ws: v,
      wss: h,
      urn: (
        /** @type {SchemeHandler} */
        {
          scheme: "urn",
          parse: u,
          serialize: i,
          skipNormalize: !0
        }
      ),
      "urn:uuid": (
        /** @type {SchemeHandler} */
        {
          scheme: "urn:uuid",
          parse: f,
          serialize: d,
          skipNormalize: !0
        }
      )
    }
  );
  Object.setPrototypeOf(E, null);
  function $(S) {
    return S && (E[
      /** @type {SchemeName} */
      S
    ] || E[
      /** @type {SchemeName} */
      S.toLowerCase()
    ]) || void 0;
  }
  return Bs = {
    wsIsSecure: c,
    SCHEMES: E,
    isValidSchemeName: r,
    getSchemeHandler: $
  }, Bs;
}
var Bd;
function c0() {
  if (Bd) return un.exports;
  Bd = 1;
  const { normalizeIPv6: e, removeDotSegments: t, recomposeAuthority: o, normalizeComponentEncoding: r, isIPv4: c, nonSimpleDomain: n } = u0(), { SCHEMES: s, getSchemeHandler: l } = z_();
  function a(h, y) {
    return typeof h == "string" ? h = /** @type {T} */
    d(g(h, y), y) : typeof h == "object" && (h = /** @type {T} */
    g(d(h, y), y)), h;
  }
  function u(h, y, p) {
    const E = p ? Object.assign({ scheme: "null" }, p) : { scheme: "null" }, $ = i(g(h, E), g(y, E), E, !0);
    return E.skipEscape = !0, d($, E);
  }
  function i(h, y, p, E) {
    const $ = {};
    return E || (h = g(d(h, p), p), y = g(d(y, p), p)), p = p || {}, !p.tolerant && y.scheme ? ($.scheme = y.scheme, $.userinfo = y.userinfo, $.host = y.host, $.port = y.port, $.path = t(y.path || ""), $.query = y.query) : (y.userinfo !== void 0 || y.host !== void 0 || y.port !== void 0 ? ($.userinfo = y.userinfo, $.host = y.host, $.port = y.port, $.path = t(y.path || ""), $.query = y.query) : (y.path ? (y.path[0] === "/" ? $.path = t(y.path) : ((h.userinfo !== void 0 || h.host !== void 0 || h.port !== void 0) && !h.path ? $.path = "/" + y.path : h.path ? $.path = h.path.slice(0, h.path.lastIndexOf("/") + 1) + y.path : $.path = y.path, $.path = t($.path)), $.query = y.query) : ($.path = h.path, y.query !== void 0 ? $.query = y.query : $.query = h.query), $.userinfo = h.userinfo, $.host = h.host, $.port = h.port), $.scheme = h.scheme), $.fragment = y.fragment, $;
  }
  function f(h, y, p) {
    return typeof h == "string" ? (h = unescape(h), h = d(r(g(h, p), !0), { ...p, skipEscape: !0 })) : typeof h == "object" && (h = d(r(h, !0), { ...p, skipEscape: !0 })), typeof y == "string" ? (y = unescape(y), y = d(r(g(y, p), !0), { ...p, skipEscape: !0 })) : typeof y == "object" && (y = d(r(y, !0), { ...p, skipEscape: !0 })), h.toLowerCase() === y.toLowerCase();
  }
  function d(h, y) {
    const p = {
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
    }, E = Object.assign({}, y), $ = [], S = l(E.scheme || p.scheme);
    S && S.serialize && S.serialize(p, E), p.path !== void 0 && (E.skipEscape ? p.path = unescape(p.path) : (p.path = escape(p.path), p.scheme !== void 0 && (p.path = p.path.split("%3A").join(":")))), E.reference !== "suffix" && p.scheme && $.push(p.scheme, ":");
    const _ = o(p);
    if (_ !== void 0 && (E.reference !== "suffix" && $.push("//"), $.push(_), p.path && p.path[0] !== "/" && $.push("/")), p.path !== void 0) {
      let w = p.path;
      !E.absolutePath && (!S || !S.absolutePath) && (w = t(w)), _ === void 0 && w[0] === "/" && w[1] === "/" && (w = "/%2F" + w.slice(2)), $.push(w);
    }
    return p.query !== void 0 && $.push("?", p.query), p.fragment !== void 0 && $.push("#", p.fragment), $.join("");
  }
  const m = /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u;
  function g(h, y) {
    const p = Object.assign({}, y), E = {
      scheme: void 0,
      userinfo: void 0,
      host: "",
      port: void 0,
      path: "",
      query: void 0,
      fragment: void 0
    };
    let $ = !1;
    p.reference === "suffix" && (p.scheme ? h = p.scheme + ":" + h : h = "//" + h);
    const S = h.match(m);
    if (S) {
      if (E.scheme = S[1], E.userinfo = S[3], E.host = S[4], E.port = parseInt(S[5], 10), E.path = S[6] || "", E.query = S[7], E.fragment = S[8], isNaN(E.port) && (E.port = S[5]), E.host)
        if (c(E.host) === !1) {
          const R = e(E.host);
          E.host = R.host.toLowerCase(), $ = R.isIPV6;
        } else
          $ = !0;
      E.scheme === void 0 && E.userinfo === void 0 && E.host === void 0 && E.port === void 0 && E.query === void 0 && !E.path ? E.reference = "same-document" : E.scheme === void 0 ? E.reference = "relative" : E.fragment === void 0 ? E.reference = "absolute" : E.reference = "uri", p.reference && p.reference !== "suffix" && p.reference !== E.reference && (E.error = E.error || "URI is not a " + p.reference + " reference.");
      const _ = l(p.scheme || E.scheme);
      if (!p.unicodeSupport && (!_ || !_.unicodeSupport) && E.host && (p.domainHost || _ && _.domainHost) && $ === !1 && n(E.host))
        try {
          E.host = URL.domainToASCII(E.host.toLowerCase());
        } catch (w) {
          E.error = E.error || "Host's domain name can not be converted to ASCII: " + w;
        }
      (!_ || _ && !_.skipNormalize) && (h.indexOf("%") !== -1 && (E.scheme !== void 0 && (E.scheme = unescape(E.scheme)), E.host !== void 0 && (E.host = unescape(E.host))), E.path && (E.path = escape(unescape(E.path))), E.fragment && (E.fragment = encodeURI(decodeURIComponent(E.fragment)))), _ && _.parse && _.parse(E, p);
    } else
      E.error = E.error || "URI can not be parsed.";
    return E;
  }
  const v = {
    SCHEMES: s,
    normalize: a,
    resolve: u,
    resolveComponent: i,
    equal: f,
    serialize: d,
    parse: g
  };
  return un.exports = v, un.exports.default = v, un.exports.fastUri = v, un.exports;
}
var zd;
function K_() {
  if (zd) return _i;
  zd = 1, Object.defineProperty(_i, "__esModule", { value: !0 });
  const e = c0();
  return e.code = 'require("ajv/dist/runtime/uri").default', _i.default = e, _i;
}
var Kd;
function X_() {
  return Kd || (Kd = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
    var t = fs();
    Object.defineProperty(e, "KeywordCxt", { enumerable: !0, get: function() {
      return t.KeywordCxt;
    } });
    var o = De();
    Object.defineProperty(e, "_", { enumerable: !0, get: function() {
      return o._;
    } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
      return o.str;
    } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
      return o.stringify;
    } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
      return o.nil;
    } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
      return o.Name;
    } }), Object.defineProperty(e, "CodeGen", { enumerable: !0, get: function() {
      return o.CodeGen;
    } });
    const r = sl(), c = hs(), n = s0(), s = ol(), l = De(), a = ds(), u = as(), i = qe(), f = B_, d = K_(), m = (k, I) => new RegExp(k, I);
    m.code = "new RegExp";
    const g = ["removeAdditional", "useDefaults", "coerceTypes"], v = /* @__PURE__ */ new Set([
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
    }, y = {
      ignoreKeywordsWithRef: "",
      jsPropertySyntax: "",
      unicode: '"minLength"/"maxLength" account for unicode characters by default.'
    }, p = 200;
    function E(k) {
      var I, U, D, T, N, V, A, O, Z, z, C, L, X, Q, re, de, ve, Pe, Ce, Ne, be, b, te, ie, me;
      const ae = k.strict, fe = (I = k.code) === null || I === void 0 ? void 0 : I.optimize, le = fe === !0 || fe === void 0 ? 1 : fe || 0, ye = (D = (U = k.code) === null || U === void 0 ? void 0 : U.regExp) !== null && D !== void 0 ? D : m, _e = (T = k.uriResolver) !== null && T !== void 0 ? T : d.default;
      return {
        strictSchema: (V = (N = k.strictSchema) !== null && N !== void 0 ? N : ae) !== null && V !== void 0 ? V : !0,
        strictNumbers: (O = (A = k.strictNumbers) !== null && A !== void 0 ? A : ae) !== null && O !== void 0 ? O : !0,
        strictTypes: (z = (Z = k.strictTypes) !== null && Z !== void 0 ? Z : ae) !== null && z !== void 0 ? z : "log",
        strictTuples: (L = (C = k.strictTuples) !== null && C !== void 0 ? C : ae) !== null && L !== void 0 ? L : "log",
        strictRequired: (Q = (X = k.strictRequired) !== null && X !== void 0 ? X : ae) !== null && Q !== void 0 ? Q : !1,
        code: k.code ? { ...k.code, optimize: le, regExp: ye } : { optimize: le, regExp: ye },
        loopRequired: (re = k.loopRequired) !== null && re !== void 0 ? re : p,
        loopEnum: (de = k.loopEnum) !== null && de !== void 0 ? de : p,
        meta: (ve = k.meta) !== null && ve !== void 0 ? ve : !0,
        messages: (Pe = k.messages) !== null && Pe !== void 0 ? Pe : !0,
        inlineRefs: (Ce = k.inlineRefs) !== null && Ce !== void 0 ? Ce : !0,
        schemaId: (Ne = k.schemaId) !== null && Ne !== void 0 ? Ne : "$id",
        addUsedSchema: (be = k.addUsedSchema) !== null && be !== void 0 ? be : !0,
        validateSchema: (b = k.validateSchema) !== null && b !== void 0 ? b : !0,
        validateFormats: (te = k.validateFormats) !== null && te !== void 0 ? te : !0,
        unicodeRegExp: (ie = k.unicodeRegExp) !== null && ie !== void 0 ? ie : !0,
        int32range: (me = k.int32range) !== null && me !== void 0 ? me : !0,
        uriResolver: _e
      };
    }
    class $ {
      constructor(I = {}) {
        this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), I = this.opts = { ...I, ...E(I) };
        const { es5: U, lines: D } = this.opts.code;
        this.scope = new l.ValueScope({ scope: {}, prefixes: v, es5: U, lines: D }), this.logger = B(I.logger);
        const T = I.validateFormats;
        I.validateFormats = !1, this.RULES = (0, n.getRules)(), S.call(this, h, I, "NOT SUPPORTED"), S.call(this, y, I, "DEPRECATED", "warn"), this._metaOpts = j.call(this), I.formats && R.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), I.keywords && P.call(this, I.keywords), typeof I.meta == "object" && this.addMetaSchema(I.meta), w.call(this), I.validateFormats = T;
      }
      _addVocabularies() {
        this.addKeyword("$async");
      }
      _addDefaultMetaSchema() {
        const { $data: I, meta: U, schemaId: D } = this.opts;
        let T = f;
        D === "id" && (T = { ...f }, T.id = T.$id, delete T.$id), U && I && this.addMetaSchema(T, T[D], !1);
      }
      defaultMeta() {
        const { meta: I, schemaId: U } = this.opts;
        return this.opts.defaultMeta = typeof I == "object" ? I[U] || I : void 0;
      }
      validate(I, U) {
        let D;
        if (typeof I == "string") {
          if (D = this.getSchema(I), !D)
            throw new Error(`no schema with key or ref "${I}"`);
        } else
          D = this.compile(I);
        const T = D(U);
        return "$async" in D || (this.errors = D.errors), T;
      }
      compile(I, U) {
        const D = this._addSchema(I, U);
        return D.validate || this._compileSchemaEnv(D);
      }
      compileAsync(I, U) {
        if (typeof this.opts.loadSchema != "function")
          throw new Error("options.loadSchema should be a function");
        const { loadSchema: D } = this.opts;
        return T.call(this, I, U);
        async function T(z, C) {
          await N.call(this, z.$schema);
          const L = this._addSchema(z, C);
          return L.validate || V.call(this, L);
        }
        async function N(z) {
          z && !this.getSchema(z) && await T.call(this, { $ref: z }, !0);
        }
        async function V(z) {
          try {
            return this._compileSchemaEnv(z);
          } catch (C) {
            if (!(C instanceof c.default))
              throw C;
            return A.call(this, C), await O.call(this, C.missingSchema), V.call(this, z);
          }
        }
        function A({ missingSchema: z, missingRef: C }) {
          if (this.refs[z])
            throw new Error(`AnySchema ${z} is loaded but ${C} cannot be resolved`);
        }
        async function O(z) {
          const C = await Z.call(this, z);
          this.refs[z] || await N.call(this, C.$schema), this.refs[z] || this.addSchema(C, z, U);
        }
        async function Z(z) {
          const C = this._loading[z];
          if (C)
            return C;
          try {
            return await (this._loading[z] = D(z));
          } finally {
            delete this._loading[z];
          }
        }
      }
      // Adds schema to the instance
      addSchema(I, U, D, T = this.opts.validateSchema) {
        if (Array.isArray(I)) {
          for (const V of I)
            this.addSchema(V, void 0, D, T);
          return this;
        }
        let N;
        if (typeof I == "object") {
          const { schemaId: V } = this.opts;
          if (N = I[V], N !== void 0 && typeof N != "string")
            throw new Error(`schema ${V} must be string`);
        }
        return U = (0, a.normalizeId)(U || N), this._checkUnique(U), this.schemas[U] = this._addSchema(I, D, U, T, !0), this;
      }
      // Add schema that will be used to validate other schemas
      // options in META_IGNORE_OPTIONS are alway set to false
      addMetaSchema(I, U, D = this.opts.validateSchema) {
        return this.addSchema(I, U, !0, D), this;
      }
      //  Validate schema against its meta-schema
      validateSchema(I, U) {
        if (typeof I == "boolean")
          return !0;
        let D;
        if (D = I.$schema, D !== void 0 && typeof D != "string")
          throw new Error("$schema must be a string");
        if (D = D || this.opts.defaultMeta || this.defaultMeta(), !D)
          return this.logger.warn("meta-schema not available"), this.errors = null, !0;
        const T = this.validate(D, I);
        if (!T && U) {
          const N = "schema is invalid: " + this.errorsText();
          if (this.opts.validateSchema === "log")
            this.logger.error(N);
          else
            throw new Error(N);
        }
        return T;
      }
      // Get compiled schema by `key` or `ref`.
      // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
      getSchema(I) {
        let U;
        for (; typeof (U = _.call(this, I)) == "string"; )
          I = U;
        if (U === void 0) {
          const { schemaId: D } = this.opts, T = new s.SchemaEnv({ schema: {}, schemaId: D });
          if (U = s.resolveSchema.call(this, T, I), !U)
            return;
          this.refs[I] = U;
        }
        return U.validate || this._compileSchemaEnv(U);
      }
      // Remove cached schema(s).
      // If no parameter is passed all schemas but meta-schemas are removed.
      // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
      // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
      removeSchema(I) {
        if (I instanceof RegExp)
          return this._removeAllSchemas(this.schemas, I), this._removeAllSchemas(this.refs, I), this;
        switch (typeof I) {
          case "undefined":
            return this._removeAllSchemas(this.schemas), this._removeAllSchemas(this.refs), this._cache.clear(), this;
          case "string": {
            const U = _.call(this, I);
            return typeof U == "object" && this._cache.delete(U.schema), delete this.schemas[I], delete this.refs[I], this;
          }
          case "object": {
            const U = I;
            this._cache.delete(U);
            let D = I[this.opts.schemaId];
            return D && (D = (0, a.normalizeId)(D), delete this.schemas[D], delete this.refs[D]), this;
          }
          default:
            throw new Error("ajv.removeSchema: invalid parameter");
        }
      }
      // add "vocabulary" - a collection of keywords
      addVocabulary(I) {
        for (const U of I)
          this.addKeyword(U);
        return this;
      }
      addKeyword(I, U) {
        let D;
        if (typeof I == "string")
          D = I, typeof U == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), U.keyword = D);
        else if (typeof I == "object" && U === void 0) {
          if (U = I, D = U.keyword, Array.isArray(D) && !D.length)
            throw new Error("addKeywords: keyword must be string or non-empty array");
        } else
          throw new Error("invalid addKeywords parameters");
        if (F.call(this, D, U), !U)
          return (0, i.eachItem)(D, (N) => q.call(this, N)), this;
        H.call(this, U);
        const T = {
          ...U,
          type: (0, u.getJSONTypes)(U.type),
          schemaType: (0, u.getJSONTypes)(U.schemaType)
        };
        return (0, i.eachItem)(D, T.type.length === 0 ? (N) => q.call(this, N, T) : (N) => T.type.forEach((V) => q.call(this, N, T, V))), this;
      }
      getKeyword(I) {
        const U = this.RULES.all[I];
        return typeof U == "object" ? U.definition : !!U;
      }
      // Remove keyword
      removeKeyword(I) {
        const { RULES: U } = this;
        delete U.keywords[I], delete U.all[I];
        for (const D of U.rules) {
          const T = D.rules.findIndex((N) => N.keyword === I);
          T >= 0 && D.rules.splice(T, 1);
        }
        return this;
      }
      // Add format
      addFormat(I, U) {
        return typeof U == "string" && (U = new RegExp(U)), this.formats[I] = U, this;
      }
      errorsText(I = this.errors, { separator: U = ", ", dataVar: D = "data" } = {}) {
        return !I || I.length === 0 ? "No errors" : I.map((T) => `${D}${T.instancePath} ${T.message}`).reduce((T, N) => T + U + N);
      }
      $dataMetaSchema(I, U) {
        const D = this.RULES.all;
        I = JSON.parse(JSON.stringify(I));
        for (const T of U) {
          const N = T.split("/").slice(1);
          let V = I;
          for (const A of N)
            V = V[A];
          for (const A in D) {
            const O = D[A];
            if (typeof O != "object")
              continue;
            const { $data: Z } = O.definition, z = V[A];
            Z && z && (V[A] = Y(z));
          }
        }
        return I;
      }
      _removeAllSchemas(I, U) {
        for (const D in I) {
          const T = I[D];
          (!U || U.test(D)) && (typeof T == "string" ? delete I[D] : T && !T.meta && (this._cache.delete(T.schema), delete I[D]));
        }
      }
      _addSchema(I, U, D, T = this.opts.validateSchema, N = this.opts.addUsedSchema) {
        let V;
        const { schemaId: A } = this.opts;
        if (typeof I == "object")
          V = I[A];
        else {
          if (this.opts.jtd)
            throw new Error("schema must be object");
          if (typeof I != "boolean")
            throw new Error("schema must be object or boolean");
        }
        let O = this._cache.get(I);
        if (O !== void 0)
          return O;
        D = (0, a.normalizeId)(V || D);
        const Z = a.getSchemaRefs.call(this, I, D);
        return O = new s.SchemaEnv({ schema: I, schemaId: A, meta: U, baseId: D, localRefs: Z }), this._cache.set(O.schema, O), N && !D.startsWith("#") && (D && this._checkUnique(D), this.refs[D] = O), T && this.validateSchema(I, !0), O;
      }
      _checkUnique(I) {
        if (this.schemas[I] || this.refs[I])
          throw new Error(`schema with key or id "${I}" already exists`);
      }
      _compileSchemaEnv(I) {
        if (I.meta ? this._compileMetaSchema(I) : s.compileSchema.call(this, I), !I.validate)
          throw new Error("ajv implementation error");
        return I.validate;
      }
      _compileMetaSchema(I) {
        const U = this.opts;
        this.opts = this._metaOpts;
        try {
          s.compileSchema.call(this, I);
        } finally {
          this.opts = U;
        }
      }
    }
    $.ValidationError = r.default, $.MissingRefError = c.default, e.default = $;
    function S(k, I, U, D = "error") {
      for (const T in k) {
        const N = T;
        N in I && this.logger[D](`${U}: option ${T}. ${k[N]}`);
      }
    }
    function _(k) {
      return k = (0, a.normalizeId)(k), this.schemas[k] || this.refs[k];
    }
    function w() {
      const k = this.opts.schemas;
      if (k)
        if (Array.isArray(k))
          this.addSchema(k);
        else
          for (const I in k)
            this.addSchema(k[I], I);
    }
    function R() {
      for (const k in this.opts.formats) {
        const I = this.opts.formats[k];
        I && this.addFormat(k, I);
      }
    }
    function P(k) {
      if (Array.isArray(k)) {
        this.addVocabulary(k);
        return;
      }
      this.logger.warn("keywords option as map is deprecated, pass array");
      for (const I in k) {
        const U = k[I];
        U.keyword || (U.keyword = I), this.addKeyword(U);
      }
    }
    function j() {
      const k = { ...this.opts };
      for (const I of g)
        delete k[I];
      return k;
    }
    const M = { log() {
    }, warn() {
    }, error() {
    } };
    function B(k) {
      if (k === !1)
        return M;
      if (k === void 0)
        return console;
      if (k.log && k.warn && k.error)
        return k;
      throw new Error("logger must implement log, warn and error methods");
    }
    const W = /^[a-z_$][a-z0-9_$:-]*$/i;
    function F(k, I) {
      const { RULES: U } = this;
      if ((0, i.eachItem)(k, (D) => {
        if (U.keywords[D])
          throw new Error(`Keyword ${D} is already defined`);
        if (!W.test(D))
          throw new Error(`Keyword ${D} has invalid name`);
      }), !!I && I.$data && !("code" in I || "validate" in I))
        throw new Error('$data keyword must have "code" or "validate" function');
    }
    function q(k, I, U) {
      var D;
      const T = I?.post;
      if (U && T)
        throw new Error('keyword with "post" flag cannot have "type"');
      const { RULES: N } = this;
      let V = T ? N.post : N.rules.find(({ type: O }) => O === U);
      if (V || (V = { type: U, rules: [] }, N.rules.push(V)), N.keywords[k] = !0, !I)
        return;
      const A = {
        keyword: k,
        definition: {
          ...I,
          type: (0, u.getJSONTypes)(I.type),
          schemaType: (0, u.getJSONTypes)(I.schemaType)
        }
      };
      I.before ? J.call(this, V, A, I.before) : V.rules.push(A), N.all[k] = A, (D = I.implements) === null || D === void 0 || D.forEach((O) => this.addKeyword(O));
    }
    function J(k, I, U) {
      const D = k.rules.findIndex((T) => T.keyword === U);
      D >= 0 ? k.rules.splice(D, 0, I) : (k.rules.push(I), this.logger.warn(`rule ${U} is not defined`));
    }
    function H(k) {
      let { metaSchema: I } = k;
      I !== void 0 && (k.$data && this.opts.$data && (I = Y(I)), k.validateSchema = this.compile(I, !0));
    }
    const G = {
      $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
    };
    function Y(k) {
      return { anyOf: [k, G] };
    }
  })(qs)), qs;
}
var Ei = {}, wi = {}, Si = {}, Xd;
function W_() {
  if (Xd) return Si;
  Xd = 1, Object.defineProperty(Si, "__esModule", { value: !0 });
  const e = {
    keyword: "id",
    code() {
      throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
    }
  };
  return Si.default = e, Si;
}
var tr = {}, Wd;
function Y_() {
  if (Wd) return tr;
  Wd = 1, Object.defineProperty(tr, "__esModule", { value: !0 }), tr.callRef = tr.getValidate = void 0;
  const e = hs(), t = Dt(), o = De(), r = lr(), c = ol(), n = qe(), s = {
    keyword: "$ref",
    schemaType: "string",
    code(u) {
      const { gen: i, schema: f, it: d } = u, { baseId: m, schemaEnv: g, validateName: v, opts: h, self: y } = d, { root: p } = g;
      if ((f === "#" || f === "#/") && m === p.baseId)
        return $();
      const E = c.resolveRef.call(y, p, m, f);
      if (E === void 0)
        throw new e.default(d.opts.uriResolver, m, f);
      if (E instanceof c.SchemaEnv)
        return S(E);
      return _(E);
      function $() {
        if (g === p)
          return a(u, v, g, g.$async);
        const w = i.scopeValue("root", { ref: p });
        return a(u, (0, o._)`${w}.validate`, p, p.$async);
      }
      function S(w) {
        const R = l(u, w);
        a(u, R, w, w.$async);
      }
      function _(w) {
        const R = i.scopeValue("schema", h.code.source === !0 ? { ref: w, code: (0, o.stringify)(w) } : { ref: w }), P = i.name("valid"), j = u.subschema({
          schema: w,
          dataTypes: [],
          schemaPath: o.nil,
          topSchemaRef: R,
          errSchemaPath: f
        }, P);
        u.mergeEvaluated(j), u.ok(P);
      }
    }
  };
  function l(u, i) {
    const { gen: f } = u;
    return i.validate ? f.scopeValue("validate", { ref: i.validate }) : (0, o._)`${f.scopeValue("wrapper", { ref: i })}.validate`;
  }
  tr.getValidate = l;
  function a(u, i, f, d) {
    const { gen: m, it: g } = u, { allErrors: v, schemaEnv: h, opts: y } = g, p = y.passContext ? r.default.this : o.nil;
    d ? E() : $();
    function E() {
      if (!h.$async)
        throw new Error("async schema referenced by sync schema");
      const w = m.let("valid");
      m.try(() => {
        m.code((0, o._)`await ${(0, t.callValidateCode)(u, i, p)}`), _(i), v || m.assign(w, !0);
      }, (R) => {
        m.if((0, o._)`!(${R} instanceof ${g.ValidationError})`, () => m.throw(R)), S(R), v || m.assign(w, !1);
      }), u.ok(w);
    }
    function $() {
      u.result((0, t.callValidateCode)(u, i, p), () => _(i), () => S(i));
    }
    function S(w) {
      const R = (0, o._)`${w}.errors`;
      m.assign(r.default.vErrors, (0, o._)`${r.default.vErrors} === null ? ${R} : ${r.default.vErrors}.concat(${R})`), m.assign(r.default.errors, (0, o._)`${r.default.vErrors}.length`);
    }
    function _(w) {
      var R;
      if (!g.opts.unevaluated)
        return;
      const P = (R = f?.validate) === null || R === void 0 ? void 0 : R.evaluated;
      if (g.props !== !0)
        if (P && !P.dynamicProps)
          P.props !== void 0 && (g.props = n.mergeEvaluated.props(m, P.props, g.props));
        else {
          const j = m.var("props", (0, o._)`${w}.evaluated.props`);
          g.props = n.mergeEvaluated.props(m, j, g.props, o.Name);
        }
      if (g.items !== !0)
        if (P && !P.dynamicItems)
          P.items !== void 0 && (g.items = n.mergeEvaluated.items(m, P.items, g.items));
        else {
          const j = m.var("items", (0, o._)`${w}.evaluated.items`);
          g.items = n.mergeEvaluated.items(m, j, g.items, o.Name);
        }
    }
  }
  return tr.callRef = a, tr.default = s, tr;
}
var Yd;
function J_() {
  if (Yd) return wi;
  Yd = 1, Object.defineProperty(wi, "__esModule", { value: !0 });
  const e = W_(), t = Y_(), o = [
    "$schema",
    "$id",
    "$defs",
    "$vocabulary",
    { keyword: "$comment" },
    "definitions",
    e.default,
    t.default
  ];
  return wi.default = o, wi;
}
var $i = {}, bi = {}, Jd;
function Q_() {
  if (Jd) return bi;
  Jd = 1, Object.defineProperty(bi, "__esModule", { value: !0 });
  const e = De(), t = e.operators, o = {
    maximum: { okStr: "<=", ok: t.LTE, fail: t.GT },
    minimum: { okStr: ">=", ok: t.GTE, fail: t.LT },
    exclusiveMaximum: { okStr: "<", ok: t.LT, fail: t.GTE },
    exclusiveMinimum: { okStr: ">", ok: t.GT, fail: t.LTE }
  }, r = {
    message: ({ keyword: n, schemaCode: s }) => (0, e.str)`must be ${o[n].okStr} ${s}`,
    params: ({ keyword: n, schemaCode: s }) => (0, e._)`{comparison: ${o[n].okStr}, limit: ${s}}`
  }, c = {
    keyword: Object.keys(o),
    type: "number",
    schemaType: "number",
    $data: !0,
    error: r,
    code(n) {
      const { keyword: s, data: l, schemaCode: a } = n;
      n.fail$data((0, e._)`${l} ${o[s].fail} ${a} || isNaN(${l})`);
    }
  };
  return bi.default = c, bi;
}
var Ti = {}, Qd;
function Z_() {
  if (Qd) return Ti;
  Qd = 1, Object.defineProperty(Ti, "__esModule", { value: !0 });
  const e = De(), o = {
    keyword: "multipleOf",
    type: "number",
    schemaType: "number",
    $data: !0,
    error: {
      message: ({ schemaCode: r }) => (0, e.str)`must be multiple of ${r}`,
      params: ({ schemaCode: r }) => (0, e._)`{multipleOf: ${r}}`
    },
    code(r) {
      const { gen: c, data: n, schemaCode: s, it: l } = r, a = l.opts.multipleOfPrecision, u = c.let("res"), i = a ? (0, e._)`Math.abs(Math.round(${u}) - ${u}) > 1e-${a}` : (0, e._)`${u} !== parseInt(${u})`;
      r.fail$data((0, e._)`(${s} === 0 || (${u} = ${n}/${s}, ${i}))`);
    }
  };
  return Ti.default = o, Ti;
}
var Ri = {}, Pi = {}, Zd;
function eE() {
  if (Zd) return Pi;
  Zd = 1, Object.defineProperty(Pi, "__esModule", { value: !0 });
  function e(t) {
    const o = t.length;
    let r = 0, c = 0, n;
    for (; c < o; )
      r++, n = t.charCodeAt(c++), n >= 55296 && n <= 56319 && c < o && (n = t.charCodeAt(c), (n & 64512) === 56320 && c++);
    return r;
  }
  return Pi.default = e, e.code = 'require("ajv/dist/runtime/ucs2length").default', Pi;
}
var ef;
function tE() {
  if (ef) return Ri;
  ef = 1, Object.defineProperty(Ri, "__esModule", { value: !0 });
  const e = De(), t = qe(), o = eE(), c = {
    keyword: ["maxLength", "minLength"],
    type: "string",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: n, schemaCode: s }) {
        const l = n === "maxLength" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${l} than ${s} characters`;
      },
      params: ({ schemaCode: n }) => (0, e._)`{limit: ${n}}`
    },
    code(n) {
      const { keyword: s, data: l, schemaCode: a, it: u } = n, i = s === "maxLength" ? e.operators.GT : e.operators.LT, f = u.opts.unicode === !1 ? (0, e._)`${l}.length` : (0, e._)`${(0, t.useFunc)(n.gen, o.default)}(${l})`;
      n.fail$data((0, e._)`${f} ${i} ${a}`);
    }
  };
  return Ri.default = c, Ri;
}
var Ni = {}, tf;
function rE() {
  if (tf) return Ni;
  tf = 1, Object.defineProperty(Ni, "__esModule", { value: !0 });
  const e = Dt(), t = De(), r = {
    keyword: "pattern",
    type: "string",
    schemaType: "string",
    $data: !0,
    error: {
      message: ({ schemaCode: c }) => (0, t.str)`must match pattern "${c}"`,
      params: ({ schemaCode: c }) => (0, t._)`{pattern: ${c}}`
    },
    code(c) {
      const { data: n, $data: s, schema: l, schemaCode: a, it: u } = c, i = u.opts.unicodeRegExp ? "u" : "", f = s ? (0, t._)`(new RegExp(${a}, ${i}))` : (0, e.usePattern)(c, l);
      c.fail$data((0, t._)`!${f}.test(${n})`);
    }
  };
  return Ni.default = r, Ni;
}
var Oi = {}, rf;
function nE() {
  if (rf) return Oi;
  rf = 1, Object.defineProperty(Oi, "__esModule", { value: !0 });
  const e = De(), o = {
    keyword: ["maxProperties", "minProperties"],
    type: "object",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: r, schemaCode: c }) {
        const n = r === "maxProperties" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${n} than ${c} properties`;
      },
      params: ({ schemaCode: r }) => (0, e._)`{limit: ${r}}`
    },
    code(r) {
      const { keyword: c, data: n, schemaCode: s } = r, l = c === "maxProperties" ? e.operators.GT : e.operators.LT;
      r.fail$data((0, e._)`Object.keys(${n}).length ${l} ${s}`);
    }
  };
  return Oi.default = o, Oi;
}
var Ai = {}, nf;
function iE() {
  if (nf) return Ai;
  nf = 1, Object.defineProperty(Ai, "__esModule", { value: !0 });
  const e = Dt(), t = De(), o = qe(), c = {
    keyword: "required",
    type: "object",
    schemaType: "array",
    $data: !0,
    error: {
      message: ({ params: { missingProperty: n } }) => (0, t.str)`must have required property '${n}'`,
      params: ({ params: { missingProperty: n } }) => (0, t._)`{missingProperty: ${n}}`
    },
    code(n) {
      const { gen: s, schema: l, schemaCode: a, data: u, $data: i, it: f } = n, { opts: d } = f;
      if (!i && l.length === 0)
        return;
      const m = l.length >= d.loopRequired;
      if (f.allErrors ? g() : v(), d.strictRequired) {
        const p = n.parentSchema.properties, { definedProperties: E } = n.it;
        for (const $ of l)
          if (p?.[$] === void 0 && !E.has($)) {
            const S = f.schemaEnv.baseId + f.errSchemaPath, _ = `required property "${$}" is not defined at "${S}" (strictRequired)`;
            (0, o.checkStrictMode)(f, _, f.opts.strictRequired);
          }
      }
      function g() {
        if (m || i)
          n.block$data(t.nil, h);
        else
          for (const p of l)
            (0, e.checkReportMissingProp)(n, p);
      }
      function v() {
        const p = s.let("missing");
        if (m || i) {
          const E = s.let("valid", !0);
          n.block$data(E, () => y(p, E)), n.ok(E);
        } else
          s.if((0, e.checkMissingProp)(n, l, p)), (0, e.reportMissingProp)(n, p), s.else();
      }
      function h() {
        s.forOf("prop", a, (p) => {
          n.setParams({ missingProperty: p }), s.if((0, e.noPropertyInData)(s, u, p, d.ownProperties), () => n.error());
        });
      }
      function y(p, E) {
        n.setParams({ missingProperty: p }), s.forOf(p, a, () => {
          s.assign(E, (0, e.propertyInData)(s, u, p, d.ownProperties)), s.if((0, t.not)(E), () => {
            n.error(), s.break();
          });
        }, t.nil);
      }
    }
  };
  return Ai.default = c, Ai;
}
var Ii = {}, af;
function aE() {
  if (af) return Ii;
  af = 1, Object.defineProperty(Ii, "__esModule", { value: !0 });
  const e = De(), o = {
    keyword: ["maxItems", "minItems"],
    type: "array",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: r, schemaCode: c }) {
        const n = r === "maxItems" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${n} than ${c} items`;
      },
      params: ({ schemaCode: r }) => (0, e._)`{limit: ${r}}`
    },
    code(r) {
      const { keyword: c, data: n, schemaCode: s } = r, l = c === "maxItems" ? e.operators.GT : e.operators.LT;
      r.fail$data((0, e._)`${n}.length ${l} ${s}`);
    }
  };
  return Ii.default = o, Ii;
}
var Ci = {}, Di = {}, sf;
function ul() {
  if (sf) return Di;
  sf = 1, Object.defineProperty(Di, "__esModule", { value: !0 });
  const e = ls();
  return e.code = 'require("ajv/dist/runtime/equal").default', Di.default = e, Di;
}
var of;
function sE() {
  if (of) return Ci;
  of = 1, Object.defineProperty(Ci, "__esModule", { value: !0 });
  const e = as(), t = De(), o = qe(), r = ul(), n = {
    keyword: "uniqueItems",
    type: "array",
    schemaType: "boolean",
    $data: !0,
    error: {
      message: ({ params: { i: s, j: l } }) => (0, t.str)`must NOT have duplicate items (items ## ${l} and ${s} are identical)`,
      params: ({ params: { i: s, j: l } }) => (0, t._)`{i: ${s}, j: ${l}}`
    },
    code(s) {
      const { gen: l, data: a, $data: u, schema: i, parentSchema: f, schemaCode: d, it: m } = s;
      if (!u && !i)
        return;
      const g = l.let("valid"), v = f.items ? (0, e.getSchemaTypes)(f.items) : [];
      s.block$data(g, h, (0, t._)`${d} === false`), s.ok(g);
      function h() {
        const $ = l.let("i", (0, t._)`${a}.length`), S = l.let("j");
        s.setParams({ i: $, j: S }), l.assign(g, !0), l.if((0, t._)`${$} > 1`, () => (y() ? p : E)($, S));
      }
      function y() {
        return v.length > 0 && !v.some(($) => $ === "object" || $ === "array");
      }
      function p($, S) {
        const _ = l.name("item"), w = (0, e.checkDataTypes)(v, _, m.opts.strictNumbers, e.DataType.Wrong), R = l.const("indices", (0, t._)`{}`);
        l.for((0, t._)`;${$}--;`, () => {
          l.let(_, (0, t._)`${a}[${$}]`), l.if(w, (0, t._)`continue`), v.length > 1 && l.if((0, t._)`typeof ${_} == "string"`, (0, t._)`${_} += "_"`), l.if((0, t._)`typeof ${R}[${_}] == "number"`, () => {
            l.assign(S, (0, t._)`${R}[${_}]`), s.error(), l.assign(g, !1).break();
          }).code((0, t._)`${R}[${_}] = ${$}`);
        });
      }
      function E($, S) {
        const _ = (0, o.useFunc)(l, r.default), w = l.name("outer");
        l.label(w).for((0, t._)`;${$}--;`, () => l.for((0, t._)`${S} = ${$}; ${S}--;`, () => l.if((0, t._)`${_}(${a}[${$}], ${a}[${S}])`, () => {
          s.error(), l.assign(g, !1).break(w);
        })));
      }
    }
  };
  return Ci.default = n, Ci;
}
var ki = {}, uf;
function oE() {
  if (uf) return ki;
  uf = 1, Object.defineProperty(ki, "__esModule", { value: !0 });
  const e = De(), t = qe(), o = ul(), c = {
    keyword: "const",
    $data: !0,
    error: {
      message: "must be equal to constant",
      params: ({ schemaCode: n }) => (0, e._)`{allowedValue: ${n}}`
    },
    code(n) {
      const { gen: s, data: l, $data: a, schemaCode: u, schema: i } = n;
      a || i && typeof i == "object" ? n.fail$data((0, e._)`!${(0, t.useFunc)(s, o.default)}(${l}, ${u})`) : n.fail((0, e._)`${i} !== ${l}`);
    }
  };
  return ki.default = c, ki;
}
var Li = {}, cf;
function uE() {
  if (cf) return Li;
  cf = 1, Object.defineProperty(Li, "__esModule", { value: !0 });
  const e = De(), t = qe(), o = ul(), c = {
    keyword: "enum",
    schemaType: "array",
    $data: !0,
    error: {
      message: "must be equal to one of the allowed values",
      params: ({ schemaCode: n }) => (0, e._)`{allowedValues: ${n}}`
    },
    code(n) {
      const { gen: s, data: l, $data: a, schema: u, schemaCode: i, it: f } = n;
      if (!a && u.length === 0)
        throw new Error("enum must have non-empty array");
      const d = u.length >= f.opts.loopEnum;
      let m;
      const g = () => m ?? (m = (0, t.useFunc)(s, o.default));
      let v;
      if (d || a)
        v = s.let("valid"), n.block$data(v, h);
      else {
        if (!Array.isArray(u))
          throw new Error("ajv implementation error");
        const p = s.const("vSchema", i);
        v = (0, e.or)(...u.map((E, $) => y(p, $)));
      }
      n.pass(v);
      function h() {
        s.assign(v, !1), s.forOf("v", i, (p) => s.if((0, e._)`${g()}(${l}, ${p})`, () => s.assign(v, !0).break()));
      }
      function y(p, E) {
        const $ = u[E];
        return typeof $ == "object" && $ !== null ? (0, e._)`${g()}(${l}, ${p}[${E}])` : (0, e._)`${l} === ${$}`;
      }
    }
  };
  return Li.default = c, Li;
}
var lf;
function cE() {
  if (lf) return $i;
  lf = 1, Object.defineProperty($i, "__esModule", { value: !0 });
  const e = Q_(), t = Z_(), o = tE(), r = rE(), c = nE(), n = iE(), s = aE(), l = sE(), a = oE(), u = uE(), i = [
    // number
    e.default,
    t.default,
    // string
    o.default,
    r.default,
    // object
    c.default,
    n.default,
    // array
    s.default,
    l.default,
    // any
    { keyword: "type", schemaType: ["string", "array"] },
    { keyword: "nullable", schemaType: "boolean" },
    a.default,
    u.default
  ];
  return $i.default = i, $i;
}
var Fi = {}, qr = {}, df;
function l0() {
  if (df) return qr;
  df = 1, Object.defineProperty(qr, "__esModule", { value: !0 }), qr.validateAdditionalItems = void 0;
  const e = De(), t = qe(), r = {
    keyword: "additionalItems",
    type: "array",
    schemaType: ["boolean", "object"],
    before: "uniqueItems",
    error: {
      message: ({ params: { len: n } }) => (0, e.str)`must NOT have more than ${n} items`,
      params: ({ params: { len: n } }) => (0, e._)`{limit: ${n}}`
    },
    code(n) {
      const { parentSchema: s, it: l } = n, { items: a } = s;
      if (!Array.isArray(a)) {
        (0, t.checkStrictMode)(l, '"additionalItems" is ignored when "items" is not an array of schemas');
        return;
      }
      c(n, a);
    }
  };
  function c(n, s) {
    const { gen: l, schema: a, data: u, keyword: i, it: f } = n;
    f.items = !0;
    const d = l.const("len", (0, e._)`${u}.length`);
    if (a === !1)
      n.setParams({ len: s.length }), n.pass((0, e._)`${d} <= ${s.length}`);
    else if (typeof a == "object" && !(0, t.alwaysValidSchema)(f, a)) {
      const g = l.var("valid", (0, e._)`${d} <= ${s.length}`);
      l.if((0, e.not)(g), () => m(g)), n.ok(g);
    }
    function m(g) {
      l.forRange("i", s.length, d, (v) => {
        n.subschema({ keyword: i, dataProp: v, dataPropType: t.Type.Num }, g), f.allErrors || l.if((0, e.not)(g), () => l.break());
      });
    }
  }
  return qr.validateAdditionalItems = c, qr.default = r, qr;
}
var qi = {}, Ur = {}, ff;
function d0() {
  if (ff) return Ur;
  ff = 1, Object.defineProperty(Ur, "__esModule", { value: !0 }), Ur.validateTuple = void 0;
  const e = De(), t = qe(), o = Dt(), r = {
    keyword: "items",
    type: "array",
    schemaType: ["object", "array", "boolean"],
    before: "uniqueItems",
    code(n) {
      const { schema: s, it: l } = n;
      if (Array.isArray(s))
        return c(n, "additionalItems", s);
      l.items = !0, !(0, t.alwaysValidSchema)(l, s) && n.ok((0, o.validateArray)(n));
    }
  };
  function c(n, s, l = n.schema) {
    const { gen: a, parentSchema: u, data: i, keyword: f, it: d } = n;
    v(u), d.opts.unevaluated && l.length && d.items !== !0 && (d.items = t.mergeEvaluated.items(a, l.length, d.items));
    const m = a.name("valid"), g = a.const("len", (0, e._)`${i}.length`);
    l.forEach((h, y) => {
      (0, t.alwaysValidSchema)(d, h) || (a.if((0, e._)`${g} > ${y}`, () => n.subschema({
        keyword: f,
        schemaProp: y,
        dataProp: y
      }, m)), n.ok(m));
    });
    function v(h) {
      const { opts: y, errSchemaPath: p } = d, E = l.length, $ = E === h.minItems && (E === h.maxItems || h[s] === !1);
      if (y.strictTuples && !$) {
        const S = `"${f}" is ${E}-tuple, but minItems or maxItems/${s} are not specified or different at path "${p}"`;
        (0, t.checkStrictMode)(d, S, y.strictTuples);
      }
    }
  }
  return Ur.validateTuple = c, Ur.default = r, Ur;
}
var hf;
function lE() {
  if (hf) return qi;
  hf = 1, Object.defineProperty(qi, "__esModule", { value: !0 });
  const e = d0(), t = {
    keyword: "prefixItems",
    type: "array",
    schemaType: ["array"],
    before: "uniqueItems",
    code: (o) => (0, e.validateTuple)(o, "items")
  };
  return qi.default = t, qi;
}
var Ui = {}, pf;
function dE() {
  if (pf) return Ui;
  pf = 1, Object.defineProperty(Ui, "__esModule", { value: !0 });
  const e = De(), t = qe(), o = Dt(), r = l0(), n = {
    keyword: "items",
    type: "array",
    schemaType: ["object", "boolean"],
    before: "uniqueItems",
    error: {
      message: ({ params: { len: s } }) => (0, e.str)`must NOT have more than ${s} items`,
      params: ({ params: { len: s } }) => (0, e._)`{limit: ${s}}`
    },
    code(s) {
      const { schema: l, parentSchema: a, it: u } = s, { prefixItems: i } = a;
      u.items = !0, !(0, t.alwaysValidSchema)(u, l) && (i ? (0, r.validateAdditionalItems)(s, i) : s.ok((0, o.validateArray)(s)));
    }
  };
  return Ui.default = n, Ui;
}
var ji = {}, mf;
function fE() {
  if (mf) return ji;
  mf = 1, Object.defineProperty(ji, "__esModule", { value: !0 });
  const e = De(), t = qe(), r = {
    keyword: "contains",
    type: "array",
    schemaType: ["object", "boolean"],
    before: "uniqueItems",
    trackErrors: !0,
    error: {
      message: ({ params: { min: c, max: n } }) => n === void 0 ? (0, e.str)`must contain at least ${c} valid item(s)` : (0, e.str)`must contain at least ${c} and no more than ${n} valid item(s)`,
      params: ({ params: { min: c, max: n } }) => n === void 0 ? (0, e._)`{minContains: ${c}}` : (0, e._)`{minContains: ${c}, maxContains: ${n}}`
    },
    code(c) {
      const { gen: n, schema: s, parentSchema: l, data: a, it: u } = c;
      let i, f;
      const { minContains: d, maxContains: m } = l;
      u.opts.next ? (i = d === void 0 ? 1 : d, f = m) : i = 1;
      const g = n.const("len", (0, e._)`${a}.length`);
      if (c.setParams({ min: i, max: f }), f === void 0 && i === 0) {
        (0, t.checkStrictMode)(u, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
        return;
      }
      if (f !== void 0 && i > f) {
        (0, t.checkStrictMode)(u, '"minContains" > "maxContains" is always invalid'), c.fail();
        return;
      }
      if ((0, t.alwaysValidSchema)(u, s)) {
        let E = (0, e._)`${g} >= ${i}`;
        f !== void 0 && (E = (0, e._)`${E} && ${g} <= ${f}`), c.pass(E);
        return;
      }
      u.items = !0;
      const v = n.name("valid");
      f === void 0 && i === 1 ? y(v, () => n.if(v, () => n.break())) : i === 0 ? (n.let(v, !0), f !== void 0 && n.if((0, e._)`${a}.length > 0`, h)) : (n.let(v, !1), h()), c.result(v, () => c.reset());
      function h() {
        const E = n.name("_valid"), $ = n.let("count", 0);
        y(E, () => n.if(E, () => p($)));
      }
      function y(E, $) {
        n.forRange("i", 0, g, (S) => {
          c.subschema({
            keyword: "contains",
            dataProp: S,
            dataPropType: t.Type.Num,
            compositeRule: !0
          }, E), $();
        });
      }
      function p(E) {
        n.code((0, e._)`${E}++`), f === void 0 ? n.if((0, e._)`${E} >= ${i}`, () => n.assign(v, !0).break()) : (n.if((0, e._)`${E} > ${f}`, () => n.assign(v, !1).break()), i === 1 ? n.assign(v, !0) : n.if((0, e._)`${E} >= ${i}`, () => n.assign(v, !0)));
      }
    }
  };
  return ji.default = r, ji;
}
var zs = {}, yf;
function hE() {
  return yf || (yf = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.validateSchemaDeps = e.validatePropertyDeps = e.error = void 0;
    const t = De(), o = qe(), r = Dt();
    e.error = {
      message: ({ params: { property: a, depsCount: u, deps: i } }) => {
        const f = u === 1 ? "property" : "properties";
        return (0, t.str)`must have ${f} ${i} when property ${a} is present`;
      },
      params: ({ params: { property: a, depsCount: u, deps: i, missingProperty: f } }) => (0, t._)`{property: ${a},
    missingProperty: ${f},
    depsCount: ${u},
    deps: ${i}}`
      // TODO change to reference
    };
    const c = {
      keyword: "dependencies",
      type: "object",
      schemaType: "object",
      error: e.error,
      code(a) {
        const [u, i] = n(a);
        s(a, u), l(a, i);
      }
    };
    function n({ schema: a }) {
      const u = {}, i = {};
      for (const f in a) {
        if (f === "__proto__")
          continue;
        const d = Array.isArray(a[f]) ? u : i;
        d[f] = a[f];
      }
      return [u, i];
    }
    function s(a, u = a.schema) {
      const { gen: i, data: f, it: d } = a;
      if (Object.keys(u).length === 0)
        return;
      const m = i.let("missing");
      for (const g in u) {
        const v = u[g];
        if (v.length === 0)
          continue;
        const h = (0, r.propertyInData)(i, f, g, d.opts.ownProperties);
        a.setParams({
          property: g,
          depsCount: v.length,
          deps: v.join(", ")
        }), d.allErrors ? i.if(h, () => {
          for (const y of v)
            (0, r.checkReportMissingProp)(a, y);
        }) : (i.if((0, t._)`${h} && (${(0, r.checkMissingProp)(a, v, m)})`), (0, r.reportMissingProp)(a, m), i.else());
      }
    }
    e.validatePropertyDeps = s;
    function l(a, u = a.schema) {
      const { gen: i, data: f, keyword: d, it: m } = a, g = i.name("valid");
      for (const v in u)
        (0, o.alwaysValidSchema)(m, u[v]) || (i.if(
          (0, r.propertyInData)(i, f, v, m.opts.ownProperties),
          () => {
            const h = a.subschema({ keyword: d, schemaProp: v }, g);
            a.mergeValidEvaluated(h, g);
          },
          () => i.var(g, !0)
          // TODO var
        ), a.ok(g));
    }
    e.validateSchemaDeps = l, e.default = c;
  })(zs)), zs;
}
var Mi = {}, gf;
function pE() {
  if (gf) return Mi;
  gf = 1, Object.defineProperty(Mi, "__esModule", { value: !0 });
  const e = De(), t = qe(), r = {
    keyword: "propertyNames",
    type: "object",
    schemaType: ["object", "boolean"],
    error: {
      message: "property name must be valid",
      params: ({ params: c }) => (0, e._)`{propertyName: ${c.propertyName}}`
    },
    code(c) {
      const { gen: n, schema: s, data: l, it: a } = c;
      if ((0, t.alwaysValidSchema)(a, s))
        return;
      const u = n.name("valid");
      n.forIn("key", l, (i) => {
        c.setParams({ propertyName: i }), c.subschema({
          keyword: "propertyNames",
          data: i,
          dataTypes: ["string"],
          propertyName: i,
          compositeRule: !0
        }, u), n.if((0, e.not)(u), () => {
          c.error(!0), a.allErrors || n.break();
        });
      }), c.ok(u);
    }
  };
  return Mi.default = r, Mi;
}
var xi = {}, vf;
function f0() {
  if (vf) return xi;
  vf = 1, Object.defineProperty(xi, "__esModule", { value: !0 });
  const e = Dt(), t = De(), o = lr(), r = qe(), n = {
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
      const { gen: l, schema: a, parentSchema: u, data: i, errsCount: f, it: d } = s;
      if (!f)
        throw new Error("ajv implementation error");
      const { allErrors: m, opts: g } = d;
      if (d.props = !0, g.removeAdditional !== "all" && (0, r.alwaysValidSchema)(d, a))
        return;
      const v = (0, e.allSchemaProperties)(u.properties), h = (0, e.allSchemaProperties)(u.patternProperties);
      y(), s.ok((0, t._)`${f} === ${o.default.errors}`);
      function y() {
        l.forIn("key", i, (_) => {
          !v.length && !h.length ? $(_) : l.if(p(_), () => $(_));
        });
      }
      function p(_) {
        let w;
        if (v.length > 8) {
          const R = (0, r.schemaRefOrVal)(d, u.properties, "properties");
          w = (0, e.isOwnProperty)(l, R, _);
        } else v.length ? w = (0, t.or)(...v.map((R) => (0, t._)`${_} === ${R}`)) : w = t.nil;
        return h.length && (w = (0, t.or)(w, ...h.map((R) => (0, t._)`${(0, e.usePattern)(s, R)}.test(${_})`))), (0, t.not)(w);
      }
      function E(_) {
        l.code((0, t._)`delete ${i}[${_}]`);
      }
      function $(_) {
        if (g.removeAdditional === "all" || g.removeAdditional && a === !1) {
          E(_);
          return;
        }
        if (a === !1) {
          s.setParams({ additionalProperty: _ }), s.error(), m || l.break();
          return;
        }
        if (typeof a == "object" && !(0, r.alwaysValidSchema)(d, a)) {
          const w = l.name("valid");
          g.removeAdditional === "failing" ? (S(_, w, !1), l.if((0, t.not)(w), () => {
            s.reset(), E(_);
          })) : (S(_, w), m || l.if((0, t.not)(w), () => l.break()));
        }
      }
      function S(_, w, R) {
        const P = {
          keyword: "additionalProperties",
          dataProp: _,
          dataPropType: r.Type.Str
        };
        R === !1 && Object.assign(P, {
          compositeRule: !0,
          createErrors: !1,
          allErrors: !1
        }), s.subschema(P, w);
      }
    }
  };
  return xi.default = n, xi;
}
var Vi = {}, _f;
function mE() {
  if (_f) return Vi;
  _f = 1, Object.defineProperty(Vi, "__esModule", { value: !0 });
  const e = fs(), t = Dt(), o = qe(), r = f0(), c = {
    keyword: "properties",
    type: "object",
    schemaType: "object",
    code(n) {
      const { gen: s, schema: l, parentSchema: a, data: u, it: i } = n;
      i.opts.removeAdditional === "all" && a.additionalProperties === void 0 && r.default.code(new e.KeywordCxt(i, r.default, "additionalProperties"));
      const f = (0, t.allSchemaProperties)(l);
      for (const h of f)
        i.definedProperties.add(h);
      i.opts.unevaluated && f.length && i.props !== !0 && (i.props = o.mergeEvaluated.props(s, (0, o.toHash)(f), i.props));
      const d = f.filter((h) => !(0, o.alwaysValidSchema)(i, l[h]));
      if (d.length === 0)
        return;
      const m = s.name("valid");
      for (const h of d)
        g(h) ? v(h) : (s.if((0, t.propertyInData)(s, u, h, i.opts.ownProperties)), v(h), i.allErrors || s.else().var(m, !0), s.endIf()), n.it.definedProperties.add(h), n.ok(m);
      function g(h) {
        return i.opts.useDefaults && !i.compositeRule && l[h].default !== void 0;
      }
      function v(h) {
        n.subschema({
          keyword: "properties",
          schemaProp: h,
          dataProp: h
        }, m);
      }
    }
  };
  return Vi.default = c, Vi;
}
var Gi = {}, Ef;
function yE() {
  if (Ef) return Gi;
  Ef = 1, Object.defineProperty(Gi, "__esModule", { value: !0 });
  const e = Dt(), t = De(), o = qe(), r = qe(), c = {
    keyword: "patternProperties",
    type: "object",
    schemaType: "object",
    code(n) {
      const { gen: s, schema: l, data: a, parentSchema: u, it: i } = n, { opts: f } = i, d = (0, e.allSchemaProperties)(l), m = d.filter(($) => (0, o.alwaysValidSchema)(i, l[$]));
      if (d.length === 0 || m.length === d.length && (!i.opts.unevaluated || i.props === !0))
        return;
      const g = f.strictSchema && !f.allowMatchingProperties && u.properties, v = s.name("valid");
      i.props !== !0 && !(i.props instanceof t.Name) && (i.props = (0, r.evaluatedPropsToName)(s, i.props));
      const { props: h } = i;
      y();
      function y() {
        for (const $ of d)
          g && p($), i.allErrors ? E($) : (s.var(v, !0), E($), s.if(v));
      }
      function p($) {
        for (const S in g)
          new RegExp($).test(S) && (0, o.checkStrictMode)(i, `property ${S} matches pattern ${$} (use allowMatchingProperties)`);
      }
      function E($) {
        s.forIn("key", a, (S) => {
          s.if((0, t._)`${(0, e.usePattern)(n, $)}.test(${S})`, () => {
            const _ = m.includes($);
            _ || n.subschema({
              keyword: "patternProperties",
              schemaProp: $,
              dataProp: S,
              dataPropType: r.Type.Str
            }, v), i.opts.unevaluated && h !== !0 ? s.assign((0, t._)`${h}[${S}]`, !0) : !_ && !i.allErrors && s.if((0, t.not)(v), () => s.break());
          });
        });
      }
    }
  };
  return Gi.default = c, Gi;
}
var Hi = {}, wf;
function gE() {
  if (wf) return Hi;
  wf = 1, Object.defineProperty(Hi, "__esModule", { value: !0 });
  const e = qe(), t = {
    keyword: "not",
    schemaType: ["object", "boolean"],
    trackErrors: !0,
    code(o) {
      const { gen: r, schema: c, it: n } = o;
      if ((0, e.alwaysValidSchema)(n, c)) {
        o.fail();
        return;
      }
      const s = r.name("valid");
      o.subschema({
        keyword: "not",
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }, s), o.failResult(s, () => o.reset(), () => o.error());
    },
    error: { message: "must NOT be valid" }
  };
  return Hi.default = t, Hi;
}
var Bi = {}, Sf;
function vE() {
  if (Sf) return Bi;
  Sf = 1, Object.defineProperty(Bi, "__esModule", { value: !0 });
  const t = {
    keyword: "anyOf",
    schemaType: "array",
    trackErrors: !0,
    code: Dt().validateUnion,
    error: { message: "must match a schema in anyOf" }
  };
  return Bi.default = t, Bi;
}
var zi = {}, $f;
function _E() {
  if ($f) return zi;
  $f = 1, Object.defineProperty(zi, "__esModule", { value: !0 });
  const e = De(), t = qe(), r = {
    keyword: "oneOf",
    schemaType: "array",
    trackErrors: !0,
    error: {
      message: "must match exactly one schema in oneOf",
      params: ({ params: c }) => (0, e._)`{passingSchemas: ${c.passing}}`
    },
    code(c) {
      const { gen: n, schema: s, parentSchema: l, it: a } = c;
      if (!Array.isArray(s))
        throw new Error("ajv implementation error");
      if (a.opts.discriminator && l.discriminator)
        return;
      const u = s, i = n.let("valid", !1), f = n.let("passing", null), d = n.name("_valid");
      c.setParams({ passing: f }), n.block(m), c.result(i, () => c.reset(), () => c.error(!0));
      function m() {
        u.forEach((g, v) => {
          let h;
          (0, t.alwaysValidSchema)(a, g) ? n.var(d, !0) : h = c.subschema({
            keyword: "oneOf",
            schemaProp: v,
            compositeRule: !0
          }, d), v > 0 && n.if((0, e._)`${d} && ${i}`).assign(i, !1).assign(f, (0, e._)`[${f}, ${v}]`).else(), n.if(d, () => {
            n.assign(i, !0), n.assign(f, v), h && c.mergeEvaluated(h, e.Name);
          });
        });
      }
    }
  };
  return zi.default = r, zi;
}
var Ki = {}, bf;
function EE() {
  if (bf) return Ki;
  bf = 1, Object.defineProperty(Ki, "__esModule", { value: !0 });
  const e = qe(), t = {
    keyword: "allOf",
    schemaType: "array",
    code(o) {
      const { gen: r, schema: c, it: n } = o;
      if (!Array.isArray(c))
        throw new Error("ajv implementation error");
      const s = r.name("valid");
      c.forEach((l, a) => {
        if ((0, e.alwaysValidSchema)(n, l))
          return;
        const u = o.subschema({ keyword: "allOf", schemaProp: a }, s);
        o.ok(s), o.mergeEvaluated(u);
      });
    }
  };
  return Ki.default = t, Ki;
}
var Xi = {}, Tf;
function wE() {
  if (Tf) return Xi;
  Tf = 1, Object.defineProperty(Xi, "__esModule", { value: !0 });
  const e = De(), t = qe(), r = {
    keyword: "if",
    schemaType: ["object", "boolean"],
    trackErrors: !0,
    error: {
      message: ({ params: n }) => (0, e.str)`must match "${n.ifClause}" schema`,
      params: ({ params: n }) => (0, e._)`{failingKeyword: ${n.ifClause}}`
    },
    code(n) {
      const { gen: s, parentSchema: l, it: a } = n;
      l.then === void 0 && l.else === void 0 && (0, t.checkStrictMode)(a, '"if" without "then" and "else" is ignored');
      const u = c(a, "then"), i = c(a, "else");
      if (!u && !i)
        return;
      const f = s.let("valid", !0), d = s.name("_valid");
      if (m(), n.reset(), u && i) {
        const v = s.let("ifClause");
        n.setParams({ ifClause: v }), s.if(d, g("then", v), g("else", v));
      } else u ? s.if(d, g("then")) : s.if((0, e.not)(d), g("else"));
      n.pass(f, () => n.error(!0));
      function m() {
        const v = n.subschema({
          keyword: "if",
          compositeRule: !0,
          createErrors: !1,
          allErrors: !1
        }, d);
        n.mergeEvaluated(v);
      }
      function g(v, h) {
        return () => {
          const y = n.subschema({ keyword: v }, d);
          s.assign(f, d), n.mergeValidEvaluated(y, f), h ? s.assign(h, (0, e._)`${v}`) : n.setParams({ ifClause: v });
        };
      }
    }
  };
  function c(n, s) {
    const l = n.schema[s];
    return l !== void 0 && !(0, t.alwaysValidSchema)(n, l);
  }
  return Xi.default = r, Xi;
}
var Wi = {}, Rf;
function SE() {
  if (Rf) return Wi;
  Rf = 1, Object.defineProperty(Wi, "__esModule", { value: !0 });
  const e = qe(), t = {
    keyword: ["then", "else"],
    schemaType: ["object", "boolean"],
    code({ keyword: o, parentSchema: r, it: c }) {
      r.if === void 0 && (0, e.checkStrictMode)(c, `"${o}" without "if" is ignored`);
    }
  };
  return Wi.default = t, Wi;
}
var Pf;
function $E() {
  if (Pf) return Fi;
  Pf = 1, Object.defineProperty(Fi, "__esModule", { value: !0 });
  const e = l0(), t = lE(), o = d0(), r = dE(), c = fE(), n = hE(), s = pE(), l = f0(), a = mE(), u = yE(), i = gE(), f = vE(), d = _E(), m = EE(), g = wE(), v = SE();
  function h(y = !1) {
    const p = [
      // any
      i.default,
      f.default,
      d.default,
      m.default,
      g.default,
      v.default,
      // object
      s.default,
      l.default,
      n.default,
      a.default,
      u.default
    ];
    return y ? p.push(t.default, r.default) : p.push(e.default, o.default), p.push(c.default), p;
  }
  return Fi.default = h, Fi;
}
var Yi = {}, Ji = {}, Nf;
function bE() {
  if (Nf) return Ji;
  Nf = 1, Object.defineProperty(Ji, "__esModule", { value: !0 });
  const e = De(), o = {
    keyword: "format",
    type: ["number", "string"],
    schemaType: "string",
    $data: !0,
    error: {
      message: ({ schemaCode: r }) => (0, e.str)`must match format "${r}"`,
      params: ({ schemaCode: r }) => (0, e._)`{format: ${r}}`
    },
    code(r, c) {
      const { gen: n, data: s, $data: l, schema: a, schemaCode: u, it: i } = r, { opts: f, errSchemaPath: d, schemaEnv: m, self: g } = i;
      if (!f.validateFormats)
        return;
      l ? v() : h();
      function v() {
        const y = n.scopeValue("formats", {
          ref: g.formats,
          code: f.code.formats
        }), p = n.const("fDef", (0, e._)`${y}[${u}]`), E = n.let("fType"), $ = n.let("format");
        n.if((0, e._)`typeof ${p} == "object" && !(${p} instanceof RegExp)`, () => n.assign(E, (0, e._)`${p}.type || "string"`).assign($, (0, e._)`${p}.validate`), () => n.assign(E, (0, e._)`"string"`).assign($, p)), r.fail$data((0, e.or)(S(), _()));
        function S() {
          return f.strictSchema === !1 ? e.nil : (0, e._)`${u} && !${$}`;
        }
        function _() {
          const w = m.$async ? (0, e._)`(${p}.async ? await ${$}(${s}) : ${$}(${s}))` : (0, e._)`${$}(${s})`, R = (0, e._)`(typeof ${$} == "function" ? ${w} : ${$}.test(${s}))`;
          return (0, e._)`${$} && ${$} !== true && ${E} === ${c} && !${R}`;
        }
      }
      function h() {
        const y = g.formats[a];
        if (!y) {
          S();
          return;
        }
        if (y === !0)
          return;
        const [p, E, $] = _(y);
        p === c && r.pass(w());
        function S() {
          if (f.strictSchema === !1) {
            g.logger.warn(R());
            return;
          }
          throw new Error(R());
          function R() {
            return `unknown format "${a}" ignored in schema at path "${d}"`;
          }
        }
        function _(R) {
          const P = R instanceof RegExp ? (0, e.regexpCode)(R) : f.code.formats ? (0, e._)`${f.code.formats}${(0, e.getProperty)(a)}` : void 0, j = n.scopeValue("formats", { key: a, ref: R, code: P });
          return typeof R == "object" && !(R instanceof RegExp) ? [R.type || "string", R.validate, (0, e._)`${j}.validate`] : ["string", R, j];
        }
        function w() {
          if (typeof y == "object" && !(y instanceof RegExp) && y.async) {
            if (!m.$async)
              throw new Error("async format in sync schema");
            return (0, e._)`await ${$}(${s})`;
          }
          return typeof E == "function" ? (0, e._)`${$}(${s})` : (0, e._)`${$}.test(${s})`;
        }
      }
    }
  };
  return Ji.default = o, Ji;
}
var Of;
function TE() {
  if (Of) return Yi;
  Of = 1, Object.defineProperty(Yi, "__esModule", { value: !0 });
  const t = [bE().default];
  return Yi.default = t, Yi;
}
var Sr = {}, Af;
function RE() {
  return Af || (Af = 1, Object.defineProperty(Sr, "__esModule", { value: !0 }), Sr.contentVocabulary = Sr.metadataVocabulary = void 0, Sr.metadataVocabulary = [
    "title",
    "description",
    "default",
    "deprecated",
    "readOnly",
    "writeOnly",
    "examples"
  ], Sr.contentVocabulary = [
    "contentMediaType",
    "contentEncoding",
    "contentSchema"
  ]), Sr;
}
var If;
function PE() {
  if (If) return Ei;
  If = 1, Object.defineProperty(Ei, "__esModule", { value: !0 });
  const e = J_(), t = cE(), o = $E(), r = TE(), c = RE(), n = [
    e.default,
    t.default,
    (0, o.default)(),
    r.default,
    c.metadataVocabulary,
    c.contentVocabulary
  ];
  return Ei.default = n, Ei;
}
var Qi = {}, cn = {}, Cf;
function NE() {
  if (Cf) return cn;
  Cf = 1, Object.defineProperty(cn, "__esModule", { value: !0 }), cn.DiscrError = void 0;
  var e;
  return (function(t) {
    t.Tag = "tag", t.Mapping = "mapping";
  })(e || (cn.DiscrError = e = {})), cn;
}
var Df;
function OE() {
  if (Df) return Qi;
  Df = 1, Object.defineProperty(Qi, "__esModule", { value: !0 });
  const e = De(), t = NE(), o = ol(), r = hs(), c = qe(), s = {
    keyword: "discriminator",
    type: "object",
    schemaType: "object",
    error: {
      message: ({ params: { discrError: l, tagName: a } }) => l === t.DiscrError.Tag ? `tag "${a}" must be string` : `value of tag "${a}" must be in oneOf`,
      params: ({ params: { discrError: l, tag: a, tagName: u } }) => (0, e._)`{error: ${l}, tag: ${u}, tagValue: ${a}}`
    },
    code(l) {
      const { gen: a, data: u, schema: i, parentSchema: f, it: d } = l, { oneOf: m } = f;
      if (!d.opts.discriminator)
        throw new Error("discriminator: requires discriminator option");
      const g = i.propertyName;
      if (typeof g != "string")
        throw new Error("discriminator: requires propertyName");
      if (i.mapping)
        throw new Error("discriminator: mapping is not supported");
      if (!m)
        throw new Error("discriminator: requires oneOf keyword");
      const v = a.let("valid", !1), h = a.const("tag", (0, e._)`${u}${(0, e.getProperty)(g)}`);
      a.if((0, e._)`typeof ${h} == "string"`, () => y(), () => l.error(!1, { discrError: t.DiscrError.Tag, tag: h, tagName: g })), l.ok(v);
      function y() {
        const $ = E();
        a.if(!1);
        for (const S in $)
          a.elseIf((0, e._)`${h} === ${S}`), a.assign(v, p($[S]));
        a.else(), l.error(!1, { discrError: t.DiscrError.Mapping, tag: h, tagName: g }), a.endIf();
      }
      function p($) {
        const S = a.name("valid"), _ = l.subschema({ keyword: "oneOf", schemaProp: $ }, S);
        return l.mergeEvaluated(_, e.Name), S;
      }
      function E() {
        var $;
        const S = {}, _ = R(f);
        let w = !0;
        for (let M = 0; M < m.length; M++) {
          let B = m[M];
          if (B?.$ref && !(0, c.schemaHasRulesButRef)(B, d.self.RULES)) {
            const F = B.$ref;
            if (B = o.resolveRef.call(d.self, d.schemaEnv.root, d.baseId, F), B instanceof o.SchemaEnv && (B = B.schema), B === void 0)
              throw new r.default(d.opts.uriResolver, d.baseId, F);
          }
          const W = ($ = B?.properties) === null || $ === void 0 ? void 0 : $[g];
          if (typeof W != "object")
            throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${g}"`);
          w = w && (_ || R(B)), P(W, M);
        }
        if (!w)
          throw new Error(`discriminator: "${g}" must be required`);
        return S;
        function R({ required: M }) {
          return Array.isArray(M) && M.includes(g);
        }
        function P(M, B) {
          if (M.const)
            j(M.const, B);
          else if (M.enum)
            for (const W of M.enum)
              j(W, B);
          else
            throw new Error(`discriminator: "properties/${g}" must have "const" or "enum"`);
        }
        function j(M, B) {
          if (typeof M != "string" || M in S)
            throw new Error(`discriminator: "${g}" values must be unique strings`);
          S[M] = B;
        }
      }
    }
  };
  return Qi.default = s, Qi;
}
const AE = "http://json-schema.org/draft-07/schema#", IE = "http://json-schema.org/draft-07/schema#", CE = "Core schema meta-schema", DE = { schemaArray: { type: "array", minItems: 1, items: { $ref: "#" } }, nonNegativeInteger: { type: "integer", minimum: 0 }, nonNegativeIntegerDefault0: { allOf: [{ $ref: "#/definitions/nonNegativeInteger" }, { default: 0 }] }, simpleTypes: { enum: ["array", "boolean", "integer", "null", "number", "object", "string"] }, stringArray: { type: "array", items: { type: "string" }, uniqueItems: !0, default: [] } }, kE = ["object", "boolean"], LE = { $id: { type: "string", format: "uri-reference" }, $schema: { type: "string", format: "uri" }, $ref: { type: "string", format: "uri-reference" }, $comment: { type: "string" }, title: { type: "string" }, description: { type: "string" }, default: !0, readOnly: { type: "boolean", default: !1 }, examples: { type: "array", items: !0 }, multipleOf: { type: "number", exclusiveMinimum: 0 }, maximum: { type: "number" }, exclusiveMaximum: { type: "number" }, minimum: { type: "number" }, exclusiveMinimum: { type: "number" }, maxLength: { $ref: "#/definitions/nonNegativeInteger" }, minLength: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, pattern: { type: "string", format: "regex" }, additionalItems: { $ref: "#" }, items: { anyOf: [{ $ref: "#" }, { $ref: "#/definitions/schemaArray" }], default: !0 }, maxItems: { $ref: "#/definitions/nonNegativeInteger" }, minItems: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, uniqueItems: { type: "boolean", default: !1 }, contains: { $ref: "#" }, maxProperties: { $ref: "#/definitions/nonNegativeInteger" }, minProperties: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, required: { $ref: "#/definitions/stringArray" }, additionalProperties: { $ref: "#" }, definitions: { type: "object", additionalProperties: { $ref: "#" }, default: {} }, properties: { type: "object", additionalProperties: { $ref: "#" }, default: {} }, patternProperties: { type: "object", additionalProperties: { $ref: "#" }, propertyNames: { format: "regex" }, default: {} }, dependencies: { type: "object", additionalProperties: { anyOf: [{ $ref: "#" }, { $ref: "#/definitions/stringArray" }] } }, propertyNames: { $ref: "#" }, const: !0, enum: { type: "array", items: !0, minItems: 1, uniqueItems: !0 }, type: { anyOf: [{ $ref: "#/definitions/simpleTypes" }, { type: "array", items: { $ref: "#/definitions/simpleTypes" }, minItems: 1, uniqueItems: !0 }] }, format: { type: "string" }, contentMediaType: { type: "string" }, contentEncoding: { type: "string" }, if: { $ref: "#" }, then: { $ref: "#" }, else: { $ref: "#" }, allOf: { $ref: "#/definitions/schemaArray" }, anyOf: { $ref: "#/definitions/schemaArray" }, oneOf: { $ref: "#/definitions/schemaArray" }, not: { $ref: "#" } }, FE = {
  $schema: AE,
  $id: IE,
  title: CE,
  definitions: DE,
  type: kE,
  properties: LE,
  default: !0
};
var kf;
function qE() {
  return kf || (kf = 1, (function(e, t) {
    Object.defineProperty(t, "__esModule", { value: !0 }), t.MissingRefError = t.ValidationError = t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = t.Ajv = void 0;
    const o = X_(), r = PE(), c = OE(), n = FE, s = ["/properties"], l = "http://json-schema.org/draft-07/schema";
    class a extends o.default {
      _addVocabularies() {
        super._addVocabularies(), r.default.forEach((g) => this.addVocabulary(g)), this.opts.discriminator && this.addKeyword(c.default);
      }
      _addDefaultMetaSchema() {
        if (super._addDefaultMetaSchema(), !this.opts.meta)
          return;
        const g = this.opts.$data ? this.$dataMetaSchema(n, s) : n;
        this.addMetaSchema(g, l, !1), this.refs["http://json-schema.org/schema"] = l;
      }
      defaultMeta() {
        return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(l) ? l : void 0);
      }
    }
    t.Ajv = a, e.exports = t = a, e.exports.Ajv = a, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = a;
    var u = fs();
    Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
      return u.KeywordCxt;
    } });
    var i = De();
    Object.defineProperty(t, "_", { enumerable: !0, get: function() {
      return i._;
    } }), Object.defineProperty(t, "str", { enumerable: !0, get: function() {
      return i.str;
    } }), Object.defineProperty(t, "stringify", { enumerable: !0, get: function() {
      return i.stringify;
    } }), Object.defineProperty(t, "nil", { enumerable: !0, get: function() {
      return i.nil;
    } }), Object.defineProperty(t, "Name", { enumerable: !0, get: function() {
      return i.Name;
    } }), Object.defineProperty(t, "CodeGen", { enumerable: !0, get: function() {
      return i.CodeGen;
    } });
    var f = sl();
    Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
      return f.default;
    } });
    var d = hs();
    Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
      return d.default;
    } });
  })(mi, mi.exports)), mi.exports;
}
var Zi = { exports: {} }, Ks = {}, Lf;
function UE() {
  return Lf || (Lf = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.formatNames = e.fastFormats = e.fullFormats = void 0;
    function t(P, j) {
      return { validate: P, compare: j };
    }
    e.fullFormats = {
      // date: http://tools.ietf.org/html/rfc3339#section-5.6
      date: t(n, s),
      // date-time: http://tools.ietf.org/html/rfc3339#section-5.6
      time: t(a, u),
      "date-time": t(f, d),
      // duration: https://tools.ietf.org/html/rfc3339#appendix-A
      duration: /^P(?!$)((\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+S)?)?|(\d+W)?)$/,
      uri: v,
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
      regex: R,
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
      byte: y,
      // signed 32 bit integer
      int32: { type: "number", validate: $ },
      // signed 64 bit integer
      int64: { type: "number", validate: S },
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
      date: t(/^\d\d\d\d-[0-1]\d-[0-3]\d$/, s),
      time: t(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, u),
      "date-time": t(/^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, d),
      // uri: https://github.com/mafintosh/is-my-json-valid/blob/master/formats.js
      uri: /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/)?[^\s]*$/i,
      "uri-reference": /^(?:(?:[a-z][a-z0-9+\-.]*:)?\/?\/)?(?:[^\\\s#][^\s#]*)?(?:#[^\\\s]*)?$/i,
      // email (sources from jsen validator):
      // http://stackoverflow.com/questions/201323/using-a-regular-expression-to-validate-an-email-address#answer-8829363
      // http://www.w3.org/TR/html5/forms.html#valid-e-mail-address (search for 'wilful violation')
      email: /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i
    }, e.formatNames = Object.keys(e.fullFormats);
    function o(P) {
      return P % 4 === 0 && (P % 100 !== 0 || P % 400 === 0);
    }
    const r = /^(\d\d\d\d)-(\d\d)-(\d\d)$/, c = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    function n(P) {
      const j = r.exec(P);
      if (!j)
        return !1;
      const M = +j[1], B = +j[2], W = +j[3];
      return B >= 1 && B <= 12 && W >= 1 && W <= (B === 2 && o(M) ? 29 : c[B]);
    }
    function s(P, j) {
      if (P && j)
        return P > j ? 1 : P < j ? -1 : 0;
    }
    const l = /^(\d\d):(\d\d):(\d\d)(\.\d+)?(z|[+-]\d\d(?::?\d\d)?)?$/i;
    function a(P, j) {
      const M = l.exec(P);
      if (!M)
        return !1;
      const B = +M[1], W = +M[2], F = +M[3], q = M[5];
      return (B <= 23 && W <= 59 && F <= 59 || B === 23 && W === 59 && F === 60) && (!j || q !== "");
    }
    function u(P, j) {
      if (!(P && j))
        return;
      const M = l.exec(P), B = l.exec(j);
      if (M && B)
        return P = M[1] + M[2] + M[3] + (M[4] || ""), j = B[1] + B[2] + B[3] + (B[4] || ""), P > j ? 1 : P < j ? -1 : 0;
    }
    const i = /t|\s/i;
    function f(P) {
      const j = P.split(i);
      return j.length === 2 && n(j[0]) && a(j[1], !0);
    }
    function d(P, j) {
      if (!(P && j))
        return;
      const [M, B] = P.split(i), [W, F] = j.split(i), q = s(M, W);
      if (q !== void 0)
        return q || u(B, F);
    }
    const m = /\/|:/, g = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
    function v(P) {
      return m.test(P) && g.test(P);
    }
    const h = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/gm;
    function y(P) {
      return h.lastIndex = 0, h.test(P);
    }
    const p = -2147483648, E = 2 ** 31 - 1;
    function $(P) {
      return Number.isInteger(P) && P <= E && P >= p;
    }
    function S(P) {
      return Number.isInteger(P);
    }
    function _() {
      return !0;
    }
    const w = /[^\\]\\Z/;
    function R(P) {
      if (w.test(P))
        return !1;
      try {
        return new RegExp(P), !0;
      } catch {
        return !1;
      }
    }
  })(Ks)), Ks;
}
var Xs = {}, ea = { exports: {} }, Ws = {}, zt = {}, $r = {}, Ys = {}, Js = {}, Qs = {}, Ff;
function ss() {
  return Ff || (Ff = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.regexpCode = e.getEsmExportName = e.getProperty = e.safeStringify = e.stringify = e.strConcat = e.addCodeArg = e.str = e._ = e.nil = e._Code = e.Name = e.IDENTIFIER = e._CodeOrName = void 0;
    class t {
    }
    e._CodeOrName = t, e.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
    class o extends t {
      constructor(p) {
        if (super(), !e.IDENTIFIER.test(p))
          throw new Error("CodeGen: name must be a valid identifier");
        this.str = p;
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
    e.Name = o;
    class r extends t {
      constructor(p) {
        super(), this._items = typeof p == "string" ? [p] : p;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        if (this._items.length > 1)
          return !1;
        const p = this._items[0];
        return p === "" || p === '""';
      }
      get str() {
        var p;
        return (p = this._str) !== null && p !== void 0 ? p : this._str = this._items.reduce((E, $) => `${E}${$}`, "");
      }
      get names() {
        var p;
        return (p = this._names) !== null && p !== void 0 ? p : this._names = this._items.reduce((E, $) => ($ instanceof o && (E[$.str] = (E[$.str] || 0) + 1), E), {});
      }
    }
    e._Code = r, e.nil = new r("");
    function c(y, ...p) {
      const E = [y[0]];
      let $ = 0;
      for (; $ < p.length; )
        l(E, p[$]), E.push(y[++$]);
      return new r(E);
    }
    e._ = c;
    const n = new r("+");
    function s(y, ...p) {
      const E = [m(y[0])];
      let $ = 0;
      for (; $ < p.length; )
        E.push(n), l(E, p[$]), E.push(n, m(y[++$]));
      return a(E), new r(E);
    }
    e.str = s;
    function l(y, p) {
      p instanceof r ? y.push(...p._items) : p instanceof o ? y.push(p) : y.push(f(p));
    }
    e.addCodeArg = l;
    function a(y) {
      let p = 1;
      for (; p < y.length - 1; ) {
        if (y[p] === n) {
          const E = u(y[p - 1], y[p + 1]);
          if (E !== void 0) {
            y.splice(p - 1, 3, E);
            continue;
          }
          y[p++] = "+";
        }
        p++;
      }
    }
    function u(y, p) {
      if (p === '""')
        return y;
      if (y === '""')
        return p;
      if (typeof y == "string")
        return p instanceof o || y[y.length - 1] !== '"' ? void 0 : typeof p != "string" ? `${y.slice(0, -1)}${p}"` : p[0] === '"' ? y.slice(0, -1) + p.slice(1) : void 0;
      if (typeof p == "string" && p[0] === '"' && !(y instanceof o))
        return `"${y}${p.slice(1)}`;
    }
    function i(y, p) {
      return p.emptyStr() ? y : y.emptyStr() ? p : s`${y}${p}`;
    }
    e.strConcat = i;
    function f(y) {
      return typeof y == "number" || typeof y == "boolean" || y === null ? y : m(Array.isArray(y) ? y.join(",") : y);
    }
    function d(y) {
      return new r(m(y));
    }
    e.stringify = d;
    function m(y) {
      return JSON.stringify(y).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
    }
    e.safeStringify = m;
    function g(y) {
      return typeof y == "string" && e.IDENTIFIER.test(y) ? new r(`.${y}`) : c`[${y}]`;
    }
    e.getProperty = g;
    function v(y) {
      if (typeof y == "string" && e.IDENTIFIER.test(y))
        return new r(`${y}`);
      throw new Error(`CodeGen: invalid export name: ${y}, use explicit $id name mapping`);
    }
    e.getEsmExportName = v;
    function h(y) {
      return new r(y.toString());
    }
    e.regexpCode = h;
  })(Qs)), Qs;
}
var Zs = {}, qf;
function Uf() {
  return qf || (qf = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.ValueScope = e.ValueScopeName = e.Scope = e.varKinds = e.UsedValueState = void 0;
    const t = ss();
    class o extends Error {
      constructor(u) {
        super(`CodeGen: "code" for ${u} not defined`), this.value = u.value;
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
    class c {
      constructor({ prefixes: u, parent: i } = {}) {
        this._names = {}, this._prefixes = u, this._parent = i;
      }
      toName(u) {
        return u instanceof t.Name ? u : this.name(u);
      }
      name(u) {
        return new t.Name(this._newName(u));
      }
      _newName(u) {
        const i = this._names[u] || this._nameGroup(u);
        return `${u}${i.index++}`;
      }
      _nameGroup(u) {
        var i, f;
        if (!((f = (i = this._parent) === null || i === void 0 ? void 0 : i._prefixes) === null || f === void 0) && f.has(u) || this._prefixes && !this._prefixes.has(u))
          throw new Error(`CodeGen: prefix "${u}" is not allowed in this scope`);
        return this._names[u] = { prefix: u, index: 0 };
      }
    }
    e.Scope = c;
    class n extends t.Name {
      constructor(u, i) {
        super(i), this.prefix = u;
      }
      setValue(u, { property: i, itemIndex: f }) {
        this.value = u, this.scopePath = (0, t._)`.${new t.Name(i)}[${f}]`;
      }
    }
    e.ValueScopeName = n;
    const s = (0, t._)`\n`;
    class l extends c {
      constructor(u) {
        super(u), this._values = {}, this._scope = u.scope, this.opts = { ...u, _n: u.lines ? s : t.nil };
      }
      get() {
        return this._scope;
      }
      name(u) {
        return new n(u, this._newName(u));
      }
      value(u, i) {
        var f;
        if (i.ref === void 0)
          throw new Error("CodeGen: ref must be passed in value");
        const d = this.toName(u), { prefix: m } = d, g = (f = i.key) !== null && f !== void 0 ? f : i.ref;
        let v = this._values[m];
        if (v) {
          const p = v.get(g);
          if (p)
            return p;
        } else
          v = this._values[m] = /* @__PURE__ */ new Map();
        v.set(g, d);
        const h = this._scope[m] || (this._scope[m] = []), y = h.length;
        return h[y] = i.ref, d.setValue(i, { property: m, itemIndex: y }), d;
      }
      getValue(u, i) {
        const f = this._values[u];
        if (f)
          return f.get(i);
      }
      scopeRefs(u, i = this._values) {
        return this._reduceValues(i, (f) => {
          if (f.scopePath === void 0)
            throw new Error(`CodeGen: name "${f}" has no value`);
          return (0, t._)`${u}${f.scopePath}`;
        });
      }
      scopeCode(u = this._values, i, f) {
        return this._reduceValues(u, (d) => {
          if (d.value === void 0)
            throw new Error(`CodeGen: name "${d}" has no value`);
          return d.value.code;
        }, i, f);
      }
      _reduceValues(u, i, f = {}, d) {
        let m = t.nil;
        for (const g in u) {
          const v = u[g];
          if (!v)
            continue;
          const h = f[g] = f[g] || /* @__PURE__ */ new Map();
          v.forEach((y) => {
            if (h.has(y))
              return;
            h.set(y, r.Started);
            let p = i(y);
            if (p) {
              const E = this.opts.es5 ? e.varKinds.var : e.varKinds.const;
              m = (0, t._)`${m}${E} ${y} = ${p};${this.opts._n}`;
            } else if (p = d?.(y))
              m = (0, t._)`${m}${p}${this.opts._n}`;
            else
              throw new o(y);
            h.set(y, r.Completed);
          });
        }
        return m;
      }
    }
    e.ValueScope = l;
  })(Zs)), Zs;
}
var jf;
function Ie() {
  return jf || (jf = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.or = e.and = e.not = e.CodeGen = e.operators = e.varKinds = e.ValueScopeName = e.ValueScope = e.Scope = e.Name = e.regexpCode = e.stringify = e.getProperty = e.nil = e.strConcat = e.str = e._ = void 0;
    const t = ss(), o = Uf();
    var r = ss();
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
    var c = Uf();
    Object.defineProperty(e, "Scope", { enumerable: !0, get: function() {
      return c.Scope;
    } }), Object.defineProperty(e, "ValueScope", { enumerable: !0, get: function() {
      return c.ValueScope;
    } }), Object.defineProperty(e, "ValueScopeName", { enumerable: !0, get: function() {
      return c.ValueScopeName;
    } }), Object.defineProperty(e, "varKinds", { enumerable: !0, get: function() {
      return c.varKinds;
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
      optimizeNames(T, N) {
        return this;
      }
    }
    class s extends n {
      constructor(T, N, V) {
        super(), this.varKind = T, this.name = N, this.rhs = V;
      }
      render({ es5: T, _n: N }) {
        const V = T ? o.varKinds.var : this.varKind, A = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
        return `${V} ${this.name}${A};` + N;
      }
      optimizeNames(T, N) {
        if (T[this.name.str])
          return this.rhs && (this.rhs = F(this.rhs, T, N)), this;
      }
      get names() {
        return this.rhs instanceof t._CodeOrName ? this.rhs.names : {};
      }
    }
    class l extends n {
      constructor(T, N, V) {
        super(), this.lhs = T, this.rhs = N, this.sideEffects = V;
      }
      render({ _n: T }) {
        return `${this.lhs} = ${this.rhs};` + T;
      }
      optimizeNames(T, N) {
        if (!(this.lhs instanceof t.Name && !T[this.lhs.str] && !this.sideEffects))
          return this.rhs = F(this.rhs, T, N), this;
      }
      get names() {
        const T = this.lhs instanceof t.Name ? {} : { ...this.lhs.names };
        return W(T, this.rhs);
      }
    }
    class a extends l {
      constructor(T, N, V, A) {
        super(T, V, A), this.op = N;
      }
      render({ _n: T }) {
        return `${this.lhs} ${this.op}= ${this.rhs};` + T;
      }
    }
    class u extends n {
      constructor(T) {
        super(), this.label = T, this.names = {};
      }
      render({ _n: T }) {
        return `${this.label}:` + T;
      }
    }
    class i extends n {
      constructor(T) {
        super(), this.label = T, this.names = {};
      }
      render({ _n: T }) {
        return `break${this.label ? ` ${this.label}` : ""};` + T;
      }
    }
    class f extends n {
      constructor(T) {
        super(), this.error = T;
      }
      render({ _n: T }) {
        return `throw ${this.error};` + T;
      }
      get names() {
        return this.error.names;
      }
    }
    class d extends n {
      constructor(T) {
        super(), this.code = T;
      }
      render({ _n: T }) {
        return `${this.code};` + T;
      }
      optimizeNodes() {
        return `${this.code}` ? this : void 0;
      }
      optimizeNames(T, N) {
        return this.code = F(this.code, T, N), this;
      }
      get names() {
        return this.code instanceof t._CodeOrName ? this.code.names : {};
      }
    }
    class m extends n {
      constructor(T = []) {
        super(), this.nodes = T;
      }
      render(T) {
        return this.nodes.reduce((N, V) => N + V.render(T), "");
      }
      optimizeNodes() {
        const { nodes: T } = this;
        let N = T.length;
        for (; N--; ) {
          const V = T[N].optimizeNodes();
          Array.isArray(V) ? T.splice(N, 1, ...V) : V ? T[N] = V : T.splice(N, 1);
        }
        return T.length > 0 ? this : void 0;
      }
      optimizeNames(T, N) {
        const { nodes: V } = this;
        let A = V.length;
        for (; A--; ) {
          const O = V[A];
          O.optimizeNames(T, N) || (q(T, O.names), V.splice(A, 1));
        }
        return V.length > 0 ? this : void 0;
      }
      get names() {
        return this.nodes.reduce((T, N) => B(T, N.names), {});
      }
    }
    class g extends m {
      render(T) {
        return "{" + T._n + super.render(T) + "}" + T._n;
      }
    }
    class v extends m {
    }
    class h extends g {
    }
    h.kind = "else";
    class y extends g {
      constructor(T, N) {
        super(N), this.condition = T;
      }
      render(T) {
        let N = `if(${this.condition})` + super.render(T);
        return this.else && (N += "else " + this.else.render(T)), N;
      }
      optimizeNodes() {
        super.optimizeNodes();
        const T = this.condition;
        if (T === !0)
          return this.nodes;
        let N = this.else;
        if (N) {
          const V = N.optimizeNodes();
          N = this.else = Array.isArray(V) ? new h(V) : V;
        }
        if (N)
          return T === !1 ? N instanceof y ? N : N.nodes : this.nodes.length ? this : new y(J(T), N instanceof y ? [N] : N.nodes);
        if (!(T === !1 || !this.nodes.length))
          return this;
      }
      optimizeNames(T, N) {
        var V;
        if (this.else = (V = this.else) === null || V === void 0 ? void 0 : V.optimizeNames(T, N), !!(super.optimizeNames(T, N) || this.else))
          return this.condition = F(this.condition, T, N), this;
      }
      get names() {
        const T = super.names;
        return W(T, this.condition), this.else && B(T, this.else.names), T;
      }
    }
    y.kind = "if";
    class p extends g {
    }
    p.kind = "for";
    class E extends p {
      constructor(T) {
        super(), this.iteration = T;
      }
      render(T) {
        return `for(${this.iteration})` + super.render(T);
      }
      optimizeNames(T, N) {
        if (super.optimizeNames(T, N))
          return this.iteration = F(this.iteration, T, N), this;
      }
      get names() {
        return B(super.names, this.iteration.names);
      }
    }
    class $ extends p {
      constructor(T, N, V, A) {
        super(), this.varKind = T, this.name = N, this.from = V, this.to = A;
      }
      render(T) {
        const N = T.es5 ? o.varKinds.var : this.varKind, { name: V, from: A, to: O } = this;
        return `for(${N} ${V}=${A}; ${V}<${O}; ${V}++)` + super.render(T);
      }
      get names() {
        const T = W(super.names, this.from);
        return W(T, this.to);
      }
    }
    class S extends p {
      constructor(T, N, V, A) {
        super(), this.loop = T, this.varKind = N, this.name = V, this.iterable = A;
      }
      render(T) {
        return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(T);
      }
      optimizeNames(T, N) {
        if (super.optimizeNames(T, N))
          return this.iterable = F(this.iterable, T, N), this;
      }
      get names() {
        return B(super.names, this.iterable.names);
      }
    }
    class _ extends g {
      constructor(T, N, V) {
        super(), this.name = T, this.args = N, this.async = V;
      }
      render(T) {
        return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(T);
      }
    }
    _.kind = "func";
    class w extends m {
      render(T) {
        return "return " + super.render(T);
      }
    }
    w.kind = "return";
    class R extends g {
      render(T) {
        let N = "try" + super.render(T);
        return this.catch && (N += this.catch.render(T)), this.finally && (N += this.finally.render(T)), N;
      }
      optimizeNodes() {
        var T, N;
        return super.optimizeNodes(), (T = this.catch) === null || T === void 0 || T.optimizeNodes(), (N = this.finally) === null || N === void 0 || N.optimizeNodes(), this;
      }
      optimizeNames(T, N) {
        var V, A;
        return super.optimizeNames(T, N), (V = this.catch) === null || V === void 0 || V.optimizeNames(T, N), (A = this.finally) === null || A === void 0 || A.optimizeNames(T, N), this;
      }
      get names() {
        const T = super.names;
        return this.catch && B(T, this.catch.names), this.finally && B(T, this.finally.names), T;
      }
    }
    class P extends g {
      constructor(T) {
        super(), this.error = T;
      }
      render(T) {
        return `catch(${this.error})` + super.render(T);
      }
    }
    P.kind = "catch";
    class j extends g {
      render(T) {
        return "finally" + super.render(T);
      }
    }
    j.kind = "finally";
    class M {
      constructor(T, N = {}) {
        this._values = {}, this._blockStarts = [], this._constants = {}, this.opts = { ...N, _n: N.lines ? `
` : "" }, this._extScope = T, this._scope = new o.Scope({ parent: T }), this._nodes = [new v()];
      }
      toString() {
        return this._root.render(this.opts);
      }
      // returns unique name in the internal scope
      name(T) {
        return this._scope.name(T);
      }
      // reserves unique name in the external scope
      scopeName(T) {
        return this._extScope.name(T);
      }
      // reserves unique name in the external scope and assigns value to it
      scopeValue(T, N) {
        const V = this._extScope.value(T, N);
        return (this._values[V.prefix] || (this._values[V.prefix] = /* @__PURE__ */ new Set())).add(V), V;
      }
      getScopeValue(T, N) {
        return this._extScope.getValue(T, N);
      }
      // return code that assigns values in the external scope to the names that are used internally
      // (same names that were returned by gen.scopeName or gen.scopeValue)
      scopeRefs(T) {
        return this._extScope.scopeRefs(T, this._values);
      }
      scopeCode() {
        return this._extScope.scopeCode(this._values);
      }
      _def(T, N, V, A) {
        const O = this._scope.toName(N);
        return V !== void 0 && A && (this._constants[O.str] = V), this._leafNode(new s(T, O, V)), O;
      }
      // `const` declaration (`var` in es5 mode)
      const(T, N, V) {
        return this._def(o.varKinds.const, T, N, V);
      }
      // `let` declaration with optional assignment (`var` in es5 mode)
      let(T, N, V) {
        return this._def(o.varKinds.let, T, N, V);
      }
      // `var` declaration with optional assignment
      var(T, N, V) {
        return this._def(o.varKinds.var, T, N, V);
      }
      // assignment code
      assign(T, N, V) {
        return this._leafNode(new l(T, N, V));
      }
      // `+=` code
      add(T, N) {
        return this._leafNode(new a(T, e.operators.ADD, N));
      }
      // appends passed SafeExpr to code or executes Block
      code(T) {
        return typeof T == "function" ? T() : T !== t.nil && this._leafNode(new d(T)), this;
      }
      // returns code for object literal for the passed argument list of key-value pairs
      object(...T) {
        const N = ["{"];
        for (const [V, A] of T)
          N.length > 1 && N.push(","), N.push(V), (V !== A || this.opts.es5) && (N.push(":"), (0, t.addCodeArg)(N, A));
        return N.push("}"), new t._Code(N);
      }
      // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
      if(T, N, V) {
        if (this._blockNode(new y(T)), N && V)
          this.code(N).else().code(V).endIf();
        else if (N)
          this.code(N).endIf();
        else if (V)
          throw new Error('CodeGen: "else" body without "then" body');
        return this;
      }
      // `else if` clause - invalid without `if` or after `else` clauses
      elseIf(T) {
        return this._elseNode(new y(T));
      }
      // `else` clause - only valid after `if` or `else if` clauses
      else() {
        return this._elseNode(new h());
      }
      // end `if` statement (needed if gen.if was used only with condition)
      endIf() {
        return this._endBlockNode(y, h);
      }
      _for(T, N) {
        return this._blockNode(T), N && this.code(N).endFor(), this;
      }
      // a generic `for` clause (or statement if `forBody` is passed)
      for(T, N) {
        return this._for(new E(T), N);
      }
      // `for` statement for a range of values
      forRange(T, N, V, A, O = this.opts.es5 ? o.varKinds.var : o.varKinds.let) {
        const Z = this._scope.toName(T);
        return this._for(new $(O, Z, N, V), () => A(Z));
      }
      // `for-of` statement (in es5 mode replace with a normal for loop)
      forOf(T, N, V, A = o.varKinds.const) {
        const O = this._scope.toName(T);
        if (this.opts.es5) {
          const Z = N instanceof t.Name ? N : this.var("_arr", N);
          return this.forRange("_i", 0, (0, t._)`${Z}.length`, (z) => {
            this.var(O, (0, t._)`${Z}[${z}]`), V(O);
          });
        }
        return this._for(new S("of", A, O, N), () => V(O));
      }
      // `for-in` statement.
      // With option `ownProperties` replaced with a `for-of` loop for object keys
      forIn(T, N, V, A = this.opts.es5 ? o.varKinds.var : o.varKinds.const) {
        if (this.opts.ownProperties)
          return this.forOf(T, (0, t._)`Object.keys(${N})`, V);
        const O = this._scope.toName(T);
        return this._for(new S("in", A, O, N), () => V(O));
      }
      // end `for` loop
      endFor() {
        return this._endBlockNode(p);
      }
      // `label` statement
      label(T) {
        return this._leafNode(new u(T));
      }
      // `break` statement
      break(T) {
        return this._leafNode(new i(T));
      }
      // `return` statement
      return(T) {
        const N = new w();
        if (this._blockNode(N), this.code(T), N.nodes.length !== 1)
          throw new Error('CodeGen: "return" should have one node');
        return this._endBlockNode(w);
      }
      // `try` statement
      try(T, N, V) {
        if (!N && !V)
          throw new Error('CodeGen: "try" without "catch" and "finally"');
        const A = new R();
        if (this._blockNode(A), this.code(T), N) {
          const O = this.name("e");
          this._currNode = A.catch = new P(O), N(O);
        }
        return V && (this._currNode = A.finally = new j(), this.code(V)), this._endBlockNode(P, j);
      }
      // `throw` statement
      throw(T) {
        return this._leafNode(new f(T));
      }
      // start self-balancing block
      block(T, N) {
        return this._blockStarts.push(this._nodes.length), T && this.code(T).endBlock(N), this;
      }
      // end the current self-balancing block
      endBlock(T) {
        const N = this._blockStarts.pop();
        if (N === void 0)
          throw new Error("CodeGen: not in self-balancing block");
        const V = this._nodes.length - N;
        if (V < 0 || T !== void 0 && V !== T)
          throw new Error(`CodeGen: wrong number of nodes: ${V} vs ${T} expected`);
        return this._nodes.length = N, this;
      }
      // `function` heading (or definition if funcBody is passed)
      func(T, N = t.nil, V, A) {
        return this._blockNode(new _(T, N, V)), A && this.code(A).endFunc(), this;
      }
      // end function definition
      endFunc() {
        return this._endBlockNode(_);
      }
      optimize(T = 1) {
        for (; T-- > 0; )
          this._root.optimizeNodes(), this._root.optimizeNames(this._root.names, this._constants);
      }
      _leafNode(T) {
        return this._currNode.nodes.push(T), this;
      }
      _blockNode(T) {
        this._currNode.nodes.push(T), this._nodes.push(T);
      }
      _endBlockNode(T, N) {
        const V = this._currNode;
        if (V instanceof T || N && V instanceof N)
          return this._nodes.pop(), this;
        throw new Error(`CodeGen: not in block "${N ? `${T.kind}/${N.kind}` : T.kind}"`);
      }
      _elseNode(T) {
        const N = this._currNode;
        if (!(N instanceof y))
          throw new Error('CodeGen: "else" without "if"');
        return this._currNode = N.else = T, this;
      }
      get _root() {
        return this._nodes[0];
      }
      get _currNode() {
        const T = this._nodes;
        return T[T.length - 1];
      }
      set _currNode(T) {
        const N = this._nodes;
        N[N.length - 1] = T;
      }
    }
    e.CodeGen = M;
    function B(D, T) {
      for (const N in T)
        D[N] = (D[N] || 0) + (T[N] || 0);
      return D;
    }
    function W(D, T) {
      return T instanceof t._CodeOrName ? B(D, T.names) : D;
    }
    function F(D, T, N) {
      if (D instanceof t.Name)
        return V(D);
      if (!A(D))
        return D;
      return new t._Code(D._items.reduce((O, Z) => (Z instanceof t.Name && (Z = V(Z)), Z instanceof t._Code ? O.push(...Z._items) : O.push(Z), O), []));
      function V(O) {
        const Z = N[O.str];
        return Z === void 0 || T[O.str] !== 1 ? O : (delete T[O.str], Z);
      }
      function A(O) {
        return O instanceof t._Code && O._items.some((Z) => Z instanceof t.Name && T[Z.str] === 1 && N[Z.str] !== void 0);
      }
    }
    function q(D, T) {
      for (const N in T)
        D[N] = (D[N] || 0) - (T[N] || 0);
    }
    function J(D) {
      return typeof D == "boolean" || typeof D == "number" || D === null ? !D : (0, t._)`!${U(D)}`;
    }
    e.not = J;
    const H = I(e.operators.AND);
    function G(...D) {
      return D.reduce(H);
    }
    e.and = G;
    const Y = I(e.operators.OR);
    function k(...D) {
      return D.reduce(Y);
    }
    e.or = k;
    function I(D) {
      return (T, N) => T === t.nil ? N : N === t.nil ? T : (0, t._)`${U(T)} ${D} ${U(N)}`;
    }
    function U(D) {
      return D instanceof t.Name ? D : (0, t._)`(${D})`;
    }
  })(Js)), Js;
}
var Ae = {}, Mf;
function Ue() {
  if (Mf) return Ae;
  Mf = 1, Object.defineProperty(Ae, "__esModule", { value: !0 }), Ae.checkStrictMode = Ae.getErrorPath = Ae.Type = Ae.useFunc = Ae.setEvaluated = Ae.evaluatedPropsToName = Ae.mergeEvaluated = Ae.eachItem = Ae.unescapeJsonPointer = Ae.escapeJsonPointer = Ae.escapeFragment = Ae.unescapeFragment = Ae.schemaRefOrVal = Ae.schemaHasRulesButRef = Ae.schemaHasRules = Ae.checkUnknownRules = Ae.alwaysValidSchema = Ae.toHash = void 0;
  const e = Ie(), t = ss();
  function o(S) {
    const _ = {};
    for (const w of S)
      _[w] = !0;
    return _;
  }
  Ae.toHash = o;
  function r(S, _) {
    return typeof _ == "boolean" ? _ : Object.keys(_).length === 0 ? !0 : (c(S, _), !n(_, S.self.RULES.all));
  }
  Ae.alwaysValidSchema = r;
  function c(S, _ = S.schema) {
    const { opts: w, self: R } = S;
    if (!w.strictSchema || typeof _ == "boolean")
      return;
    const P = R.RULES.keywords;
    for (const j in _)
      P[j] || $(S, `unknown keyword: "${j}"`);
  }
  Ae.checkUnknownRules = c;
  function n(S, _) {
    if (typeof S == "boolean")
      return !S;
    for (const w in S)
      if (_[w])
        return !0;
    return !1;
  }
  Ae.schemaHasRules = n;
  function s(S, _) {
    if (typeof S == "boolean")
      return !S;
    for (const w in S)
      if (w !== "$ref" && _.all[w])
        return !0;
    return !1;
  }
  Ae.schemaHasRulesButRef = s;
  function l({ topSchemaRef: S, schemaPath: _ }, w, R, P) {
    if (!P) {
      if (typeof w == "number" || typeof w == "boolean")
        return w;
      if (typeof w == "string")
        return (0, e._)`${w}`;
    }
    return (0, e._)`${S}${_}${(0, e.getProperty)(R)}`;
  }
  Ae.schemaRefOrVal = l;
  function a(S) {
    return f(decodeURIComponent(S));
  }
  Ae.unescapeFragment = a;
  function u(S) {
    return encodeURIComponent(i(S));
  }
  Ae.escapeFragment = u;
  function i(S) {
    return typeof S == "number" ? `${S}` : S.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  Ae.escapeJsonPointer = i;
  function f(S) {
    return S.replace(/~1/g, "/").replace(/~0/g, "~");
  }
  Ae.unescapeJsonPointer = f;
  function d(S, _) {
    if (Array.isArray(S))
      for (const w of S)
        _(w);
    else
      _(S);
  }
  Ae.eachItem = d;
  function m({ mergeNames: S, mergeToName: _, mergeValues: w, resultToName: R }) {
    return (P, j, M, B) => {
      const W = M === void 0 ? j : M instanceof e.Name ? (j instanceof e.Name ? S(P, j, M) : _(P, j, M), M) : j instanceof e.Name ? (_(P, M, j), j) : w(j, M);
      return B === e.Name && !(W instanceof e.Name) ? R(P, W) : W;
    };
  }
  Ae.mergeEvaluated = {
    props: m({
      mergeNames: (S, _, w) => S.if((0, e._)`${w} !== true && ${_} !== undefined`, () => {
        S.if((0, e._)`${_} === true`, () => S.assign(w, !0), () => S.assign(w, (0, e._)`${w} || {}`).code((0, e._)`Object.assign(${w}, ${_})`));
      }),
      mergeToName: (S, _, w) => S.if((0, e._)`${w} !== true`, () => {
        _ === !0 ? S.assign(w, !0) : (S.assign(w, (0, e._)`${w} || {}`), v(S, w, _));
      }),
      mergeValues: (S, _) => S === !0 ? !0 : { ...S, ..._ },
      resultToName: g
    }),
    items: m({
      mergeNames: (S, _, w) => S.if((0, e._)`${w} !== true && ${_} !== undefined`, () => S.assign(w, (0, e._)`${_} === true ? true : ${w} > ${_} ? ${w} : ${_}`)),
      mergeToName: (S, _, w) => S.if((0, e._)`${w} !== true`, () => S.assign(w, _ === !0 ? !0 : (0, e._)`${w} > ${_} ? ${w} : ${_}`)),
      mergeValues: (S, _) => S === !0 ? !0 : Math.max(S, _),
      resultToName: (S, _) => S.var("items", _)
    })
  };
  function g(S, _) {
    if (_ === !0)
      return S.var("props", !0);
    const w = S.var("props", (0, e._)`{}`);
    return _ !== void 0 && v(S, w, _), w;
  }
  Ae.evaluatedPropsToName = g;
  function v(S, _, w) {
    Object.keys(w).forEach((R) => S.assign((0, e._)`${_}${(0, e.getProperty)(R)}`, !0));
  }
  Ae.setEvaluated = v;
  const h = {};
  function y(S, _) {
    return S.scopeValue("func", {
      ref: _,
      code: h[_.code] || (h[_.code] = new t._Code(_.code))
    });
  }
  Ae.useFunc = y;
  var p;
  (function(S) {
    S[S.Num = 0] = "Num", S[S.Str = 1] = "Str";
  })(p || (Ae.Type = p = {}));
  function E(S, _, w) {
    if (S instanceof e.Name) {
      const R = _ === p.Num;
      return w ? R ? (0, e._)`"[" + ${S} + "]"` : (0, e._)`"['" + ${S} + "']"` : R ? (0, e._)`"/" + ${S}` : (0, e._)`"/" + ${S}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
    }
    return w ? (0, e.getProperty)(S).toString() : "/" + i(S);
  }
  Ae.getErrorPath = E;
  function $(S, _, w = S.opts.strictSchema) {
    if (w) {
      if (_ = `strict mode: ${_}`, w === !0)
        throw new Error(_);
      S.self.logger.warn(_);
    }
  }
  return Ae.checkStrictMode = $, Ae;
}
var ta = {}, xf;
function dr() {
  if (xf) return ta;
  xf = 1, Object.defineProperty(ta, "__esModule", { value: !0 });
  const e = Ie(), t = {
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
  return ta.default = t, ta;
}
var Vf;
function ps() {
  return Vf || (Vf = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
    const t = Ie(), o = Ue(), r = dr();
    e.keywordError = {
      message: ({ keyword: h }) => (0, t.str)`must pass "${h}" keyword validation`
    }, e.keyword$DataError = {
      message: ({ keyword: h, schemaType: y }) => y ? (0, t.str)`"${h}" keyword must be ${y} ($data)` : (0, t.str)`"${h}" keyword is invalid ($data)`
    };
    function c(h, y = e.keywordError, p, E) {
      const { it: $ } = h, { gen: S, compositeRule: _, allErrors: w } = $, R = f(h, y, p);
      E ?? (_ || w) ? a(S, R) : u($, (0, t._)`[${R}]`);
    }
    e.reportError = c;
    function n(h, y = e.keywordError, p) {
      const { it: E } = h, { gen: $, compositeRule: S, allErrors: _ } = E, w = f(h, y, p);
      a($, w), S || _ || u(E, r.default.vErrors);
    }
    e.reportExtraError = n;
    function s(h, y) {
      h.assign(r.default.errors, y), h.if((0, t._)`${r.default.vErrors} !== null`, () => h.if(y, () => h.assign((0, t._)`${r.default.vErrors}.length`, y), () => h.assign(r.default.vErrors, null)));
    }
    e.resetErrorsCount = s;
    function l({ gen: h, keyword: y, schemaValue: p, data: E, errsCount: $, it: S }) {
      if ($ === void 0)
        throw new Error("ajv implementation error");
      const _ = h.name("err");
      h.forRange("i", $, r.default.errors, (w) => {
        h.const(_, (0, t._)`${r.default.vErrors}[${w}]`), h.if((0, t._)`${_}.instancePath === undefined`, () => h.assign((0, t._)`${_}.instancePath`, (0, t.strConcat)(r.default.instancePath, S.errorPath))), h.assign((0, t._)`${_}.schemaPath`, (0, t.str)`${S.errSchemaPath}/${y}`), S.opts.verbose && (h.assign((0, t._)`${_}.schema`, p), h.assign((0, t._)`${_}.data`, E));
      });
    }
    e.extendErrors = l;
    function a(h, y) {
      const p = h.const("err", y);
      h.if((0, t._)`${r.default.vErrors} === null`, () => h.assign(r.default.vErrors, (0, t._)`[${p}]`), (0, t._)`${r.default.vErrors}.push(${p})`), h.code((0, t._)`${r.default.errors}++`);
    }
    function u(h, y) {
      const { gen: p, validateName: E, schemaEnv: $ } = h;
      $.$async ? p.throw((0, t._)`new ${h.ValidationError}(${y})`) : (p.assign((0, t._)`${E}.errors`, y), p.return(!1));
    }
    const i = {
      keyword: new t.Name("keyword"),
      schemaPath: new t.Name("schemaPath"),
      // also used in JTD errors
      params: new t.Name("params"),
      propertyName: new t.Name("propertyName"),
      message: new t.Name("message"),
      schema: new t.Name("schema"),
      parentSchema: new t.Name("parentSchema")
    };
    function f(h, y, p) {
      const { createErrors: E } = h.it;
      return E === !1 ? (0, t._)`{}` : d(h, y, p);
    }
    function d(h, y, p = {}) {
      const { gen: E, it: $ } = h, S = [
        m($, p),
        g(h, p)
      ];
      return v(h, y, S), E.object(...S);
    }
    function m({ errorPath: h }, { instancePath: y }) {
      const p = y ? (0, t.str)`${h}${(0, o.getErrorPath)(y, o.Type.Str)}` : h;
      return [r.default.instancePath, (0, t.strConcat)(r.default.instancePath, p)];
    }
    function g({ keyword: h, it: { errSchemaPath: y } }, { schemaPath: p, parentSchema: E }) {
      let $ = E ? y : (0, t.str)`${y}/${h}`;
      return p && ($ = (0, t.str)`${$}${(0, o.getErrorPath)(p, o.Type.Str)}`), [i.schemaPath, $];
    }
    function v(h, { params: y, message: p }, E) {
      const { keyword: $, data: S, schemaValue: _, it: w } = h, { opts: R, propertyName: P, topSchemaRef: j, schemaPath: M } = w;
      E.push([i.keyword, $], [i.params, typeof y == "function" ? y(h) : y || (0, t._)`{}`]), R.messages && E.push([i.message, typeof p == "function" ? p(h) : p]), R.verbose && E.push([i.schema, _], [i.parentSchema, (0, t._)`${j}${M}`], [r.default.data, S]), P && E.push([i.propertyName, P]);
    }
  })(Ys)), Ys;
}
var Gf;
function jE() {
  if (Gf) return $r;
  Gf = 1, Object.defineProperty($r, "__esModule", { value: !0 }), $r.boolOrEmptySchema = $r.topBoolOrEmptySchema = void 0;
  const e = ps(), t = Ie(), o = dr(), r = {
    message: "boolean schema is false"
  };
  function c(l) {
    const { gen: a, schema: u, validateName: i } = l;
    u === !1 ? s(l, !1) : typeof u == "object" && u.$async === !0 ? a.return(o.default.data) : (a.assign((0, t._)`${i}.errors`, null), a.return(!0));
  }
  $r.topBoolOrEmptySchema = c;
  function n(l, a) {
    const { gen: u, schema: i } = l;
    i === !1 ? (u.var(a, !1), s(l)) : u.var(a, !0);
  }
  $r.boolOrEmptySchema = n;
  function s(l, a) {
    const { gen: u, data: i } = l, f = {
      gen: u,
      keyword: "false schema",
      data: i,
      schema: !1,
      schemaCode: !1,
      schemaValue: !1,
      params: {},
      it: l
    };
    (0, e.reportError)(f, r, void 0, a);
  }
  return $r;
}
var rt = {}, br = {}, Hf;
function h0() {
  if (Hf) return br;
  Hf = 1, Object.defineProperty(br, "__esModule", { value: !0 }), br.getRules = br.isJSONType = void 0;
  const e = ["string", "number", "integer", "boolean", "null", "object", "array"], t = new Set(e);
  function o(c) {
    return typeof c == "string" && t.has(c);
  }
  br.isJSONType = o;
  function r() {
    const c = {
      number: { type: "number", rules: [] },
      string: { type: "string", rules: [] },
      array: { type: "array", rules: [] },
      object: { type: "object", rules: [] }
    };
    return {
      types: { ...c, integer: !0, boolean: !0, null: !0 },
      rules: [{ rules: [] }, c.number, c.string, c.array, c.object],
      post: { rules: [] },
      all: {},
      keywords: {}
    };
  }
  return br.getRules = r, br;
}
var Kt = {}, Bf;
function p0() {
  if (Bf) return Kt;
  Bf = 1, Object.defineProperty(Kt, "__esModule", { value: !0 }), Kt.shouldUseRule = Kt.shouldUseGroup = Kt.schemaHasRulesForType = void 0;
  function e({ schema: r, self: c }, n) {
    const s = c.RULES.types[n];
    return s && s !== !0 && t(r, s);
  }
  Kt.schemaHasRulesForType = e;
  function t(r, c) {
    return c.rules.some((n) => o(r, n));
  }
  Kt.shouldUseGroup = t;
  function o(r, c) {
    var n;
    return r[c.keyword] !== void 0 || ((n = c.definition.implements) === null || n === void 0 ? void 0 : n.some((s) => r[s] !== void 0));
  }
  return Kt.shouldUseRule = o, Kt;
}
var zf;
function os() {
  if (zf) return rt;
  zf = 1, Object.defineProperty(rt, "__esModule", { value: !0 }), rt.reportTypeError = rt.checkDataTypes = rt.checkDataType = rt.coerceAndCheckDataType = rt.getJSONTypes = rt.getSchemaTypes = rt.DataType = void 0;
  const e = h0(), t = p0(), o = ps(), r = Ie(), c = Ue();
  var n;
  (function(p) {
    p[p.Correct = 0] = "Correct", p[p.Wrong = 1] = "Wrong";
  })(n || (rt.DataType = n = {}));
  function s(p) {
    const E = l(p.type);
    if (E.includes("null")) {
      if (p.nullable === !1)
        throw new Error("type: null contradicts nullable: false");
    } else {
      if (!E.length && p.nullable !== void 0)
        throw new Error('"nullable" cannot be used without "type"');
      p.nullable === !0 && E.push("null");
    }
    return E;
  }
  rt.getSchemaTypes = s;
  function l(p) {
    const E = Array.isArray(p) ? p : p ? [p] : [];
    if (E.every(e.isJSONType))
      return E;
    throw new Error("type must be JSONType or JSONType[]: " + E.join(","));
  }
  rt.getJSONTypes = l;
  function a(p, E) {
    const { gen: $, data: S, opts: _ } = p, w = i(E, _.coerceTypes), R = E.length > 0 && !(w.length === 0 && E.length === 1 && (0, t.schemaHasRulesForType)(p, E[0]));
    if (R) {
      const P = g(E, S, _.strictNumbers, n.Wrong);
      $.if(P, () => {
        w.length ? f(p, E, w) : h(p);
      });
    }
    return R;
  }
  rt.coerceAndCheckDataType = a;
  const u = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
  function i(p, E) {
    return E ? p.filter(($) => u.has($) || E === "array" && $ === "array") : [];
  }
  function f(p, E, $) {
    const { gen: S, data: _, opts: w } = p, R = S.let("dataType", (0, r._)`typeof ${_}`), P = S.let("coerced", (0, r._)`undefined`);
    w.coerceTypes === "array" && S.if((0, r._)`${R} == 'object' && Array.isArray(${_}) && ${_}.length == 1`, () => S.assign(_, (0, r._)`${_}[0]`).assign(R, (0, r._)`typeof ${_}`).if(g(E, _, w.strictNumbers), () => S.assign(P, _))), S.if((0, r._)`${P} !== undefined`);
    for (const M of $)
      (u.has(M) || M === "array" && w.coerceTypes === "array") && j(M);
    S.else(), h(p), S.endIf(), S.if((0, r._)`${P} !== undefined`, () => {
      S.assign(_, P), d(p, P);
    });
    function j(M) {
      switch (M) {
        case "string":
          S.elseIf((0, r._)`${R} == "number" || ${R} == "boolean"`).assign(P, (0, r._)`"" + ${_}`).elseIf((0, r._)`${_} === null`).assign(P, (0, r._)`""`);
          return;
        case "number":
          S.elseIf((0, r._)`${R} == "boolean" || ${_} === null
              || (${R} == "string" && ${_} && ${_} == +${_})`).assign(P, (0, r._)`+${_}`);
          return;
        case "integer":
          S.elseIf((0, r._)`${R} === "boolean" || ${_} === null
              || (${R} === "string" && ${_} && ${_} == +${_} && !(${_} % 1))`).assign(P, (0, r._)`+${_}`);
          return;
        case "boolean":
          S.elseIf((0, r._)`${_} === "false" || ${_} === 0 || ${_} === null`).assign(P, !1).elseIf((0, r._)`${_} === "true" || ${_} === 1`).assign(P, !0);
          return;
        case "null":
          S.elseIf((0, r._)`${_} === "" || ${_} === 0 || ${_} === false`), S.assign(P, null);
          return;
        case "array":
          S.elseIf((0, r._)`${R} === "string" || ${R} === "number"
              || ${R} === "boolean" || ${_} === null`).assign(P, (0, r._)`[${_}]`);
      }
    }
  }
  function d({ gen: p, parentData: E, parentDataProperty: $ }, S) {
    p.if((0, r._)`${E} !== undefined`, () => p.assign((0, r._)`${E}[${$}]`, S));
  }
  function m(p, E, $, S = n.Correct) {
    const _ = S === n.Correct ? r.operators.EQ : r.operators.NEQ;
    let w;
    switch (p) {
      case "null":
        return (0, r._)`${E} ${_} null`;
      case "array":
        w = (0, r._)`Array.isArray(${E})`;
        break;
      case "object":
        w = (0, r._)`${E} && typeof ${E} == "object" && !Array.isArray(${E})`;
        break;
      case "integer":
        w = R((0, r._)`!(${E} % 1) && !isNaN(${E})`);
        break;
      case "number":
        w = R();
        break;
      default:
        return (0, r._)`typeof ${E} ${_} ${p}`;
    }
    return S === n.Correct ? w : (0, r.not)(w);
    function R(P = r.nil) {
      return (0, r.and)((0, r._)`typeof ${E} == "number"`, P, $ ? (0, r._)`isFinite(${E})` : r.nil);
    }
  }
  rt.checkDataType = m;
  function g(p, E, $, S) {
    if (p.length === 1)
      return m(p[0], E, $, S);
    let _;
    const w = (0, c.toHash)(p);
    if (w.array && w.object) {
      const R = (0, r._)`typeof ${E} != "object"`;
      _ = w.null ? R : (0, r._)`!${E} || ${R}`, delete w.null, delete w.array, delete w.object;
    } else
      _ = r.nil;
    w.number && delete w.integer;
    for (const R in w)
      _ = (0, r.and)(_, m(R, E, $, S));
    return _;
  }
  rt.checkDataTypes = g;
  const v = {
    message: ({ schema: p }) => `must be ${p}`,
    params: ({ schema: p, schemaValue: E }) => typeof p == "string" ? (0, r._)`{type: ${p}}` : (0, r._)`{type: ${E}}`
  };
  function h(p) {
    const E = y(p);
    (0, o.reportError)(E, v);
  }
  rt.reportTypeError = h;
  function y(p) {
    const { gen: E, data: $, schema: S } = p, _ = (0, c.schemaRefOrVal)(p, S, "type");
    return {
      gen: E,
      keyword: "type",
      data: $,
      schema: S.type,
      schemaCode: _,
      schemaValue: _,
      parentSchema: S,
      params: {},
      it: p
    };
  }
  return rt;
}
var ln = {}, Kf;
function ME() {
  if (Kf) return ln;
  Kf = 1, Object.defineProperty(ln, "__esModule", { value: !0 }), ln.assignDefaults = void 0;
  const e = Ie(), t = Ue();
  function o(c, n) {
    const { properties: s, items: l } = c.schema;
    if (n === "object" && s)
      for (const a in s)
        r(c, a, s[a].default);
    else n === "array" && Array.isArray(l) && l.forEach((a, u) => r(c, u, a.default));
  }
  ln.assignDefaults = o;
  function r(c, n, s) {
    const { gen: l, compositeRule: a, data: u, opts: i } = c;
    if (s === void 0)
      return;
    const f = (0, e._)`${u}${(0, e.getProperty)(n)}`;
    if (a) {
      (0, t.checkStrictMode)(c, `default is ignored for: ${f}`);
      return;
    }
    let d = (0, e._)`${f} === undefined`;
    i.useDefaults === "empty" && (d = (0, e._)`${d} || ${f} === null || ${f} === ""`), l.if(d, (0, e._)`${f} = ${(0, e.stringify)(s)}`);
  }
  return ln;
}
var Nt = {}, Ve = {}, Xf;
function kt() {
  if (Xf) return Ve;
  Xf = 1, Object.defineProperty(Ve, "__esModule", { value: !0 }), Ve.validateUnion = Ve.validateArray = Ve.usePattern = Ve.callValidateCode = Ve.schemaProperties = Ve.allSchemaProperties = Ve.noPropertyInData = Ve.propertyInData = Ve.isOwnProperty = Ve.hasPropFunc = Ve.reportMissingProp = Ve.checkMissingProp = Ve.checkReportMissingProp = void 0;
  const e = Ie(), t = Ue(), o = dr(), r = Ue();
  function c(p, E) {
    const { gen: $, data: S, it: _ } = p;
    $.if(i($, S, E, _.opts.ownProperties), () => {
      p.setParams({ missingProperty: (0, e._)`${E}` }, !0), p.error();
    });
  }
  Ve.checkReportMissingProp = c;
  function n({ gen: p, data: E, it: { opts: $ } }, S, _) {
    return (0, e.or)(...S.map((w) => (0, e.and)(i(p, E, w, $.ownProperties), (0, e._)`${_} = ${w}`)));
  }
  Ve.checkMissingProp = n;
  function s(p, E) {
    p.setParams({ missingProperty: E }, !0), p.error();
  }
  Ve.reportMissingProp = s;
  function l(p) {
    return p.scopeValue("func", {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      ref: Object.prototype.hasOwnProperty,
      code: (0, e._)`Object.prototype.hasOwnProperty`
    });
  }
  Ve.hasPropFunc = l;
  function a(p, E, $) {
    return (0, e._)`${l(p)}.call(${E}, ${$})`;
  }
  Ve.isOwnProperty = a;
  function u(p, E, $, S) {
    const _ = (0, e._)`${E}${(0, e.getProperty)($)} !== undefined`;
    return S ? (0, e._)`${_} && ${a(p, E, $)}` : _;
  }
  Ve.propertyInData = u;
  function i(p, E, $, S) {
    const _ = (0, e._)`${E}${(0, e.getProperty)($)} === undefined`;
    return S ? (0, e.or)(_, (0, e.not)(a(p, E, $))) : _;
  }
  Ve.noPropertyInData = i;
  function f(p) {
    return p ? Object.keys(p).filter((E) => E !== "__proto__") : [];
  }
  Ve.allSchemaProperties = f;
  function d(p, E) {
    return f(E).filter(($) => !(0, t.alwaysValidSchema)(p, E[$]));
  }
  Ve.schemaProperties = d;
  function m({ schemaCode: p, data: E, it: { gen: $, topSchemaRef: S, schemaPath: _, errorPath: w }, it: R }, P, j, M) {
    const B = M ? (0, e._)`${p}, ${E}, ${S}${_}` : E, W = [
      [o.default.instancePath, (0, e.strConcat)(o.default.instancePath, w)],
      [o.default.parentData, R.parentData],
      [o.default.parentDataProperty, R.parentDataProperty],
      [o.default.rootData, o.default.rootData]
    ];
    R.opts.dynamicRef && W.push([o.default.dynamicAnchors, o.default.dynamicAnchors]);
    const F = (0, e._)`${B}, ${$.object(...W)}`;
    return j !== e.nil ? (0, e._)`${P}.call(${j}, ${F})` : (0, e._)`${P}(${F})`;
  }
  Ve.callValidateCode = m;
  const g = (0, e._)`new RegExp`;
  function v({ gen: p, it: { opts: E } }, $) {
    const S = E.unicodeRegExp ? "u" : "", { regExp: _ } = E.code, w = _($, S);
    return p.scopeValue("pattern", {
      key: w.toString(),
      ref: w,
      code: (0, e._)`${_.code === "new RegExp" ? g : (0, r.useFunc)(p, _)}(${$}, ${S})`
    });
  }
  Ve.usePattern = v;
  function h(p) {
    const { gen: E, data: $, keyword: S, it: _ } = p, w = E.name("valid");
    if (_.allErrors) {
      const P = E.let("valid", !0);
      return R(() => E.assign(P, !1)), P;
    }
    return E.var(w, !0), R(() => E.break()), w;
    function R(P) {
      const j = E.const("len", (0, e._)`${$}.length`);
      E.forRange("i", 0, j, (M) => {
        p.subschema({
          keyword: S,
          dataProp: M,
          dataPropType: t.Type.Num
        }, w), E.if((0, e.not)(w), P);
      });
    }
  }
  Ve.validateArray = h;
  function y(p) {
    const { gen: E, schema: $, keyword: S, it: _ } = p;
    if (!Array.isArray($))
      throw new Error("ajv implementation error");
    if ($.some((j) => (0, t.alwaysValidSchema)(_, j)) && !_.opts.unevaluated)
      return;
    const R = E.let("valid", !1), P = E.name("_valid");
    E.block(() => $.forEach((j, M) => {
      const B = p.subschema({
        keyword: S,
        schemaProp: M,
        compositeRule: !0
      }, P);
      E.assign(R, (0, e._)`${R} || ${P}`), p.mergeValidEvaluated(B, P) || E.if((0, e.not)(R));
    })), p.result(R, () => p.reset(), () => p.error(!0));
  }
  return Ve.validateUnion = y, Ve;
}
var Wf;
function xE() {
  if (Wf) return Nt;
  Wf = 1, Object.defineProperty(Nt, "__esModule", { value: !0 }), Nt.validateKeywordUsage = Nt.validSchemaType = Nt.funcKeywordCode = Nt.macroKeywordCode = void 0;
  const e = Ie(), t = dr(), o = kt(), r = ps();
  function c(d, m) {
    const { gen: g, keyword: v, schema: h, parentSchema: y, it: p } = d, E = m.macro.call(p.self, h, y, p), $ = u(g, v, E);
    p.opts.validateSchema !== !1 && p.self.validateSchema(E, !0);
    const S = g.name("valid");
    d.subschema({
      schema: E,
      schemaPath: e.nil,
      errSchemaPath: `${p.errSchemaPath}/${v}`,
      topSchemaRef: $,
      compositeRule: !0
    }, S), d.pass(S, () => d.error(!0));
  }
  Nt.macroKeywordCode = c;
  function n(d, m) {
    var g;
    const { gen: v, keyword: h, schema: y, parentSchema: p, $data: E, it: $ } = d;
    a($, m);
    const S = !E && m.compile ? m.compile.call($.self, y, p, $) : m.validate, _ = u(v, h, S), w = v.let("valid");
    d.block$data(w, R), d.ok((g = m.valid) !== null && g !== void 0 ? g : w);
    function R() {
      if (m.errors === !1)
        M(), m.modifying && s(d), B(() => d.error());
      else {
        const W = m.async ? P() : j();
        m.modifying && s(d), B(() => l(d, W));
      }
    }
    function P() {
      const W = v.let("ruleErrs", null);
      return v.try(() => M((0, e._)`await `), (F) => v.assign(w, !1).if((0, e._)`${F} instanceof ${$.ValidationError}`, () => v.assign(W, (0, e._)`${F}.errors`), () => v.throw(F))), W;
    }
    function j() {
      const W = (0, e._)`${_}.errors`;
      return v.assign(W, null), M(e.nil), W;
    }
    function M(W = m.async ? (0, e._)`await ` : e.nil) {
      const F = $.opts.passContext ? t.default.this : t.default.self, q = !("compile" in m && !E || m.schema === !1);
      v.assign(w, (0, e._)`${W}${(0, o.callValidateCode)(d, _, F, q)}`, m.modifying);
    }
    function B(W) {
      var F;
      v.if((0, e.not)((F = m.valid) !== null && F !== void 0 ? F : w), W);
    }
  }
  Nt.funcKeywordCode = n;
  function s(d) {
    const { gen: m, data: g, it: v } = d;
    m.if(v.parentData, () => m.assign(g, (0, e._)`${v.parentData}[${v.parentDataProperty}]`));
  }
  function l(d, m) {
    const { gen: g } = d;
    g.if((0, e._)`Array.isArray(${m})`, () => {
      g.assign(t.default.vErrors, (0, e._)`${t.default.vErrors} === null ? ${m} : ${t.default.vErrors}.concat(${m})`).assign(t.default.errors, (0, e._)`${t.default.vErrors}.length`), (0, r.extendErrors)(d);
    }, () => d.error());
  }
  function a({ schemaEnv: d }, m) {
    if (m.async && !d.$async)
      throw new Error("async keyword in sync schema");
  }
  function u(d, m, g) {
    if (g === void 0)
      throw new Error(`keyword "${m}" failed to compile`);
    return d.scopeValue("keyword", typeof g == "function" ? { ref: g } : { ref: g, code: (0, e.stringify)(g) });
  }
  function i(d, m, g = !1) {
    return !m.length || m.some((v) => v === "array" ? Array.isArray(d) : v === "object" ? d && typeof d == "object" && !Array.isArray(d) : typeof d == v || g && typeof d > "u");
  }
  Nt.validSchemaType = i;
  function f({ schema: d, opts: m, self: g, errSchemaPath: v }, h, y) {
    if (Array.isArray(h.keyword) ? !h.keyword.includes(y) : h.keyword !== y)
      throw new Error("ajv implementation error");
    const p = h.dependencies;
    if (p?.some((E) => !Object.prototype.hasOwnProperty.call(d, E)))
      throw new Error(`parent schema must have dependencies of ${y}: ${p.join(",")}`);
    if (h.validateSchema && !h.validateSchema(d[y])) {
      const $ = `keyword "${y}" value is invalid at path "${v}": ` + g.errorsText(h.validateSchema.errors);
      if (m.validateSchema === "log")
        g.logger.error($);
      else
        throw new Error($);
    }
  }
  return Nt.validateKeywordUsage = f, Nt;
}
var Xt = {}, Yf;
function VE() {
  if (Yf) return Xt;
  Yf = 1, Object.defineProperty(Xt, "__esModule", { value: !0 }), Xt.extendSubschemaMode = Xt.extendSubschemaData = Xt.getSubschema = void 0;
  const e = Ie(), t = Ue();
  function o(n, { keyword: s, schemaProp: l, schema: a, schemaPath: u, errSchemaPath: i, topSchemaRef: f }) {
    if (s !== void 0 && a !== void 0)
      throw new Error('both "keyword" and "schema" passed, only one allowed');
    if (s !== void 0) {
      const d = n.schema[s];
      return l === void 0 ? {
        schema: d,
        schemaPath: (0, e._)`${n.schemaPath}${(0, e.getProperty)(s)}`,
        errSchemaPath: `${n.errSchemaPath}/${s}`
      } : {
        schema: d[l],
        schemaPath: (0, e._)`${n.schemaPath}${(0, e.getProperty)(s)}${(0, e.getProperty)(l)}`,
        errSchemaPath: `${n.errSchemaPath}/${s}/${(0, t.escapeFragment)(l)}`
      };
    }
    if (a !== void 0) {
      if (u === void 0 || i === void 0 || f === void 0)
        throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
      return {
        schema: a,
        schemaPath: u,
        topSchemaRef: f,
        errSchemaPath: i
      };
    }
    throw new Error('either "keyword" or "schema" must be passed');
  }
  Xt.getSubschema = o;
  function r(n, s, { dataProp: l, dataPropType: a, data: u, dataTypes: i, propertyName: f }) {
    if (u !== void 0 && l !== void 0)
      throw new Error('both "data" and "dataProp" passed, only one allowed');
    const { gen: d } = s;
    if (l !== void 0) {
      const { errorPath: g, dataPathArr: v, opts: h } = s, y = d.let("data", (0, e._)`${s.data}${(0, e.getProperty)(l)}`, !0);
      m(y), n.errorPath = (0, e.str)`${g}${(0, t.getErrorPath)(l, a, h.jsPropertySyntax)}`, n.parentDataProperty = (0, e._)`${l}`, n.dataPathArr = [...v, n.parentDataProperty];
    }
    if (u !== void 0) {
      const g = u instanceof e.Name ? u : d.let("data", u, !0);
      m(g), f !== void 0 && (n.propertyName = f);
    }
    i && (n.dataTypes = i);
    function m(g) {
      n.data = g, n.dataLevel = s.dataLevel + 1, n.dataTypes = [], s.definedProperties = /* @__PURE__ */ new Set(), n.parentData = s.data, n.dataNames = [...s.dataNames, g];
    }
  }
  Xt.extendSubschemaData = r;
  function c(n, { jtdDiscriminator: s, jtdMetadata: l, compositeRule: a, createErrors: u, allErrors: i }) {
    a !== void 0 && (n.compositeRule = a), u !== void 0 && (n.createErrors = u), i !== void 0 && (n.allErrors = i), n.jtdDiscriminator = s, n.jtdMetadata = l;
  }
  return Xt.extendSubschemaMode = c, Xt;
}
var ut = {}, eo = { exports: {} }, Jf;
function GE() {
  if (Jf) return eo.exports;
  Jf = 1;
  var e = eo.exports = function(r, c, n) {
    typeof c == "function" && (n = c, c = {}), n = c.cb || n;
    var s = typeof n == "function" ? n : n.pre || function() {
    }, l = n.post || function() {
    };
    t(c, s, l, r, "", r);
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
  function t(r, c, n, s, l, a, u, i, f, d) {
    if (s && typeof s == "object" && !Array.isArray(s)) {
      c(s, l, a, u, i, f, d);
      for (var m in s) {
        var g = s[m];
        if (Array.isArray(g)) {
          if (m in e.arrayKeywords)
            for (var v = 0; v < g.length; v++)
              t(r, c, n, g[v], l + "/" + m + "/" + v, a, l, m, s, v);
        } else if (m in e.propsKeywords) {
          if (g && typeof g == "object")
            for (var h in g)
              t(r, c, n, g[h], l + "/" + m + "/" + o(h), a, l, m, s, h);
        } else (m in e.keywords || r.allKeys && !(m in e.skipKeywords)) && t(r, c, n, g, l + "/" + m, a, l, m, s);
      }
      n(s, l, a, u, i, f, d);
    }
  }
  function o(r) {
    return r.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  return eo.exports;
}
var Qf;
function ms() {
  if (Qf) return ut;
  Qf = 1, Object.defineProperty(ut, "__esModule", { value: !0 }), ut.getSchemaRefs = ut.resolveUrl = ut.normalizeId = ut._getFullPath = ut.getFullPath = ut.inlineRef = void 0;
  const e = Ue(), t = ls(), o = GE(), r = /* @__PURE__ */ new Set([
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
  function c(v, h = !0) {
    return typeof v == "boolean" ? !0 : h === !0 ? !s(v) : h ? l(v) <= h : !1;
  }
  ut.inlineRef = c;
  const n = /* @__PURE__ */ new Set([
    "$ref",
    "$recursiveRef",
    "$recursiveAnchor",
    "$dynamicRef",
    "$dynamicAnchor"
  ]);
  function s(v) {
    for (const h in v) {
      if (n.has(h))
        return !0;
      const y = v[h];
      if (Array.isArray(y) && y.some(s) || typeof y == "object" && s(y))
        return !0;
    }
    return !1;
  }
  function l(v) {
    let h = 0;
    for (const y in v) {
      if (y === "$ref")
        return 1 / 0;
      if (h++, !r.has(y) && (typeof v[y] == "object" && (0, e.eachItem)(v[y], (p) => h += l(p)), h === 1 / 0))
        return 1 / 0;
    }
    return h;
  }
  function a(v, h = "", y) {
    y !== !1 && (h = f(h));
    const p = v.parse(h);
    return u(v, p);
  }
  ut.getFullPath = a;
  function u(v, h) {
    return v.serialize(h).split("#")[0] + "#";
  }
  ut._getFullPath = u;
  const i = /#\/?$/;
  function f(v) {
    return v ? v.replace(i, "") : "";
  }
  ut.normalizeId = f;
  function d(v, h, y) {
    return y = f(y), v.resolve(h, y);
  }
  ut.resolveUrl = d;
  const m = /^[a-z_][-a-z0-9._]*$/i;
  function g(v, h) {
    if (typeof v == "boolean")
      return {};
    const { schemaId: y, uriResolver: p } = this.opts, E = f(v[y] || h), $ = { "": E }, S = a(p, E, !1), _ = {}, w = /* @__PURE__ */ new Set();
    return o(v, { allKeys: !0 }, (j, M, B, W) => {
      if (W === void 0)
        return;
      const F = S + M;
      let q = $[W];
      typeof j[y] == "string" && (q = J.call(this, j[y])), H.call(this, j.$anchor), H.call(this, j.$dynamicAnchor), $[M] = q;
      function J(G) {
        const Y = this.opts.uriResolver.resolve;
        if (G = f(q ? Y(q, G) : G), w.has(G))
          throw P(G);
        w.add(G);
        let k = this.refs[G];
        return typeof k == "string" && (k = this.refs[k]), typeof k == "object" ? R(j, k.schema, G) : G !== f(F) && (G[0] === "#" ? (R(j, _[G], G), _[G] = j) : this.refs[G] = F), G;
      }
      function H(G) {
        if (typeof G == "string") {
          if (!m.test(G))
            throw new Error(`invalid anchor "${G}"`);
          J.call(this, `#${G}`);
        }
      }
    }), _;
    function R(j, M, B) {
      if (M !== void 0 && !t(j, M))
        throw P(B);
    }
    function P(j) {
      return new Error(`reference "${j}" resolves to more than one schema`);
    }
  }
  return ut.getSchemaRefs = g, ut;
}
var Zf;
function ys() {
  if (Zf) return zt;
  Zf = 1, Object.defineProperty(zt, "__esModule", { value: !0 }), zt.getData = zt.KeywordCxt = zt.validateFunctionCode = void 0;
  const e = jE(), t = os(), o = p0(), r = os(), c = ME(), n = xE(), s = VE(), l = Ie(), a = dr(), u = ms(), i = Ue(), f = ps();
  function d(C) {
    if (S(C) && (w(C), $(C))) {
      h(C);
      return;
    }
    m(C, () => (0, e.topBoolOrEmptySchema)(C));
  }
  zt.validateFunctionCode = d;
  function m({ gen: C, validateName: L, schema: X, schemaEnv: Q, opts: re }, de) {
    re.code.es5 ? C.func(L, (0, l._)`${a.default.data}, ${a.default.valCxt}`, Q.$async, () => {
      C.code((0, l._)`"use strict"; ${p(X, re)}`), v(C, re), C.code(de);
    }) : C.func(L, (0, l._)`${a.default.data}, ${g(re)}`, Q.$async, () => C.code(p(X, re)).code(de));
  }
  function g(C) {
    return (0, l._)`{${a.default.instancePath}="", ${a.default.parentData}, ${a.default.parentDataProperty}, ${a.default.rootData}=${a.default.data}${C.dynamicRef ? (0, l._)`, ${a.default.dynamicAnchors}={}` : l.nil}}={}`;
  }
  function v(C, L) {
    C.if(a.default.valCxt, () => {
      C.var(a.default.instancePath, (0, l._)`${a.default.valCxt}.${a.default.instancePath}`), C.var(a.default.parentData, (0, l._)`${a.default.valCxt}.${a.default.parentData}`), C.var(a.default.parentDataProperty, (0, l._)`${a.default.valCxt}.${a.default.parentDataProperty}`), C.var(a.default.rootData, (0, l._)`${a.default.valCxt}.${a.default.rootData}`), L.dynamicRef && C.var(a.default.dynamicAnchors, (0, l._)`${a.default.valCxt}.${a.default.dynamicAnchors}`);
    }, () => {
      C.var(a.default.instancePath, (0, l._)`""`), C.var(a.default.parentData, (0, l._)`undefined`), C.var(a.default.parentDataProperty, (0, l._)`undefined`), C.var(a.default.rootData, a.default.data), L.dynamicRef && C.var(a.default.dynamicAnchors, (0, l._)`{}`);
    });
  }
  function h(C) {
    const { schema: L, opts: X, gen: Q } = C;
    m(C, () => {
      X.$comment && L.$comment && W(C), j(C), Q.let(a.default.vErrors, null), Q.let(a.default.errors, 0), X.unevaluated && y(C), R(C), F(C);
    });
  }
  function y(C) {
    const { gen: L, validateName: X } = C;
    C.evaluated = L.const("evaluated", (0, l._)`${X}.evaluated`), L.if((0, l._)`${C.evaluated}.dynamicProps`, () => L.assign((0, l._)`${C.evaluated}.props`, (0, l._)`undefined`)), L.if((0, l._)`${C.evaluated}.dynamicItems`, () => L.assign((0, l._)`${C.evaluated}.items`, (0, l._)`undefined`));
  }
  function p(C, L) {
    const X = typeof C == "object" && C[L.schemaId];
    return X && (L.code.source || L.code.process) ? (0, l._)`/*# sourceURL=${X} */` : l.nil;
  }
  function E(C, L) {
    if (S(C) && (w(C), $(C))) {
      _(C, L);
      return;
    }
    (0, e.boolOrEmptySchema)(C, L);
  }
  function $({ schema: C, self: L }) {
    if (typeof C == "boolean")
      return !C;
    for (const X in C)
      if (L.RULES.all[X])
        return !0;
    return !1;
  }
  function S(C) {
    return typeof C.schema != "boolean";
  }
  function _(C, L) {
    const { schema: X, gen: Q, opts: re } = C;
    re.$comment && X.$comment && W(C), M(C), B(C);
    const de = Q.const("_errs", a.default.errors);
    R(C, de), Q.var(L, (0, l._)`${de} === ${a.default.errors}`);
  }
  function w(C) {
    (0, i.checkUnknownRules)(C), P(C);
  }
  function R(C, L) {
    if (C.opts.jtd)
      return J(C, [], !1, L);
    const X = (0, t.getSchemaTypes)(C.schema), Q = (0, t.coerceAndCheckDataType)(C, X);
    J(C, X, !Q, L);
  }
  function P(C) {
    const { schema: L, errSchemaPath: X, opts: Q, self: re } = C;
    L.$ref && Q.ignoreKeywordsWithRef && (0, i.schemaHasRulesButRef)(L, re.RULES) && re.logger.warn(`$ref: keywords ignored in schema at path "${X}"`);
  }
  function j(C) {
    const { schema: L, opts: X } = C;
    L.default !== void 0 && X.useDefaults && X.strictSchema && (0, i.checkStrictMode)(C, "default is ignored in the schema root");
  }
  function M(C) {
    const L = C.schema[C.opts.schemaId];
    L && (C.baseId = (0, u.resolveUrl)(C.opts.uriResolver, C.baseId, L));
  }
  function B(C) {
    if (C.schema.$async && !C.schemaEnv.$async)
      throw new Error("async schema in sync schema");
  }
  function W({ gen: C, schemaEnv: L, schema: X, errSchemaPath: Q, opts: re }) {
    const de = X.$comment;
    if (re.$comment === !0)
      C.code((0, l._)`${a.default.self}.logger.log(${de})`);
    else if (typeof re.$comment == "function") {
      const ve = (0, l.str)`${Q}/$comment`, Pe = C.scopeValue("root", { ref: L.root });
      C.code((0, l._)`${a.default.self}.opts.$comment(${de}, ${ve}, ${Pe}.schema)`);
    }
  }
  function F(C) {
    const { gen: L, schemaEnv: X, validateName: Q, ValidationError: re, opts: de } = C;
    X.$async ? L.if((0, l._)`${a.default.errors} === 0`, () => L.return(a.default.data), () => L.throw((0, l._)`new ${re}(${a.default.vErrors})`)) : (L.assign((0, l._)`${Q}.errors`, a.default.vErrors), de.unevaluated && q(C), L.return((0, l._)`${a.default.errors} === 0`));
  }
  function q({ gen: C, evaluated: L, props: X, items: Q }) {
    X instanceof l.Name && C.assign((0, l._)`${L}.props`, X), Q instanceof l.Name && C.assign((0, l._)`${L}.items`, Q);
  }
  function J(C, L, X, Q) {
    const { gen: re, schema: de, data: ve, allErrors: Pe, opts: Ce, self: Ne } = C, { RULES: be } = Ne;
    if (de.$ref && (Ce.ignoreKeywordsWithRef || !(0, i.schemaHasRulesButRef)(de, be))) {
      re.block(() => A(C, "$ref", be.all.$ref.definition));
      return;
    }
    Ce.jtd || G(C, L), re.block(() => {
      for (const te of be.rules)
        b(te);
      b(be.post);
    });
    function b(te) {
      (0, o.shouldUseGroup)(de, te) && (te.type ? (re.if((0, r.checkDataType)(te.type, ve, Ce.strictNumbers)), H(C, te), L.length === 1 && L[0] === te.type && X && (re.else(), (0, r.reportTypeError)(C)), re.endIf()) : H(C, te), Pe || re.if((0, l._)`${a.default.errors} === ${Q || 0}`));
    }
  }
  function H(C, L) {
    const { gen: X, schema: Q, opts: { useDefaults: re } } = C;
    re && (0, c.assignDefaults)(C, L.type), X.block(() => {
      for (const de of L.rules)
        (0, o.shouldUseRule)(Q, de) && A(C, de.keyword, de.definition, L.type);
    });
  }
  function G(C, L) {
    C.schemaEnv.meta || !C.opts.strictTypes || (Y(C, L), C.opts.allowUnionTypes || k(C, L), I(C, C.dataTypes));
  }
  function Y(C, L) {
    if (L.length) {
      if (!C.dataTypes.length) {
        C.dataTypes = L;
        return;
      }
      L.forEach((X) => {
        D(C.dataTypes, X) || N(C, `type "${X}" not allowed by context "${C.dataTypes.join(",")}"`);
      }), T(C, L);
    }
  }
  function k(C, L) {
    L.length > 1 && !(L.length === 2 && L.includes("null")) && N(C, "use allowUnionTypes to allow union type keyword");
  }
  function I(C, L) {
    const X = C.self.RULES.all;
    for (const Q in X) {
      const re = X[Q];
      if (typeof re == "object" && (0, o.shouldUseRule)(C.schema, re)) {
        const { type: de } = re.definition;
        de.length && !de.some((ve) => U(L, ve)) && N(C, `missing type "${de.join(",")}" for keyword "${Q}"`);
      }
    }
  }
  function U(C, L) {
    return C.includes(L) || L === "number" && C.includes("integer");
  }
  function D(C, L) {
    return C.includes(L) || L === "integer" && C.includes("number");
  }
  function T(C, L) {
    const X = [];
    for (const Q of C.dataTypes)
      D(L, Q) ? X.push(Q) : L.includes("integer") && Q === "number" && X.push("integer");
    C.dataTypes = X;
  }
  function N(C, L) {
    const X = C.schemaEnv.baseId + C.errSchemaPath;
    L += ` at "${X}" (strictTypes)`, (0, i.checkStrictMode)(C, L, C.opts.strictTypes);
  }
  class V {
    constructor(L, X, Q) {
      if ((0, n.validateKeywordUsage)(L, X, Q), this.gen = L.gen, this.allErrors = L.allErrors, this.keyword = Q, this.data = L.data, this.schema = L.schema[Q], this.$data = X.$data && L.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, i.schemaRefOrVal)(L, this.schema, Q, this.$data), this.schemaType = X.schemaType, this.parentSchema = L.schema, this.params = {}, this.it = L, this.def = X, this.$data)
        this.schemaCode = L.gen.const("vSchema", z(this.$data, L));
      else if (this.schemaCode = this.schemaValue, !(0, n.validSchemaType)(this.schema, X.schemaType, X.allowUndefined))
        throw new Error(`${Q} value must be ${JSON.stringify(X.schemaType)}`);
      ("code" in X ? X.trackErrors : X.errors !== !1) && (this.errsCount = L.gen.const("_errs", a.default.errors));
    }
    result(L, X, Q) {
      this.failResult((0, l.not)(L), X, Q);
    }
    failResult(L, X, Q) {
      this.gen.if(L), Q ? Q() : this.error(), X ? (this.gen.else(), X(), this.allErrors && this.gen.endIf()) : this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    pass(L, X) {
      this.failResult((0, l.not)(L), void 0, X);
    }
    fail(L) {
      if (L === void 0) {
        this.error(), this.allErrors || this.gen.if(!1);
        return;
      }
      this.gen.if(L), this.error(), this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    fail$data(L) {
      if (!this.$data)
        return this.fail(L);
      const { schemaCode: X } = this;
      this.fail((0, l._)`${X} !== undefined && (${(0, l.or)(this.invalid$data(), L)})`);
    }
    error(L, X, Q) {
      if (X) {
        this.setParams(X), this._error(L, Q), this.setParams({});
        return;
      }
      this._error(L, Q);
    }
    _error(L, X) {
      (L ? f.reportExtraError : f.reportError)(this, this.def.error, X);
    }
    $dataError() {
      (0, f.reportError)(this, this.def.$dataError || f.keyword$DataError);
    }
    reset() {
      if (this.errsCount === void 0)
        throw new Error('add "trackErrors" to keyword definition');
      (0, f.resetErrorsCount)(this.gen, this.errsCount);
    }
    ok(L) {
      this.allErrors || this.gen.if(L);
    }
    setParams(L, X) {
      X ? Object.assign(this.params, L) : this.params = L;
    }
    block$data(L, X, Q = l.nil) {
      this.gen.block(() => {
        this.check$data(L, Q), X();
      });
    }
    check$data(L = l.nil, X = l.nil) {
      if (!this.$data)
        return;
      const { gen: Q, schemaCode: re, schemaType: de, def: ve } = this;
      Q.if((0, l.or)((0, l._)`${re} === undefined`, X)), L !== l.nil && Q.assign(L, !0), (de.length || ve.validateSchema) && (Q.elseIf(this.invalid$data()), this.$dataError(), L !== l.nil && Q.assign(L, !1)), Q.else();
    }
    invalid$data() {
      const { gen: L, schemaCode: X, schemaType: Q, def: re, it: de } = this;
      return (0, l.or)(ve(), Pe());
      function ve() {
        if (Q.length) {
          if (!(X instanceof l.Name))
            throw new Error("ajv implementation error");
          const Ce = Array.isArray(Q) ? Q : [Q];
          return (0, l._)`${(0, r.checkDataTypes)(Ce, X, de.opts.strictNumbers, r.DataType.Wrong)}`;
        }
        return l.nil;
      }
      function Pe() {
        if (re.validateSchema) {
          const Ce = L.scopeValue("validate$data", { ref: re.validateSchema });
          return (0, l._)`!${Ce}(${X})`;
        }
        return l.nil;
      }
    }
    subschema(L, X) {
      const Q = (0, s.getSubschema)(this.it, L);
      (0, s.extendSubschemaData)(Q, this.it, L), (0, s.extendSubschemaMode)(Q, L);
      const re = { ...this.it, ...Q, items: void 0, props: void 0 };
      return E(re, X), re;
    }
    mergeEvaluated(L, X) {
      const { it: Q, gen: re } = this;
      Q.opts.unevaluated && (Q.props !== !0 && L.props !== void 0 && (Q.props = i.mergeEvaluated.props(re, L.props, Q.props, X)), Q.items !== !0 && L.items !== void 0 && (Q.items = i.mergeEvaluated.items(re, L.items, Q.items, X)));
    }
    mergeValidEvaluated(L, X) {
      const { it: Q, gen: re } = this;
      if (Q.opts.unevaluated && (Q.props !== !0 || Q.items !== !0))
        return re.if(X, () => this.mergeEvaluated(L, l.Name)), !0;
    }
  }
  zt.KeywordCxt = V;
  function A(C, L, X, Q) {
    const re = new V(C, X, L);
    "code" in X ? X.code(re, Q) : re.$data && X.validate ? (0, n.funcKeywordCode)(re, X) : "macro" in X ? (0, n.macroKeywordCode)(re, X) : (X.compile || X.validate) && (0, n.funcKeywordCode)(re, X);
  }
  const O = /^\/(?:[^~]|~0|~1)*$/, Z = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
  function z(C, { dataLevel: L, dataNames: X, dataPathArr: Q }) {
    let re, de;
    if (C === "")
      return a.default.rootData;
    if (C[0] === "/") {
      if (!O.test(C))
        throw new Error(`Invalid JSON-pointer: ${C}`);
      re = C, de = a.default.rootData;
    } else {
      const Ne = Z.exec(C);
      if (!Ne)
        throw new Error(`Invalid JSON-pointer: ${C}`);
      const be = +Ne[1];
      if (re = Ne[2], re === "#") {
        if (be >= L)
          throw new Error(Ce("property/index", be));
        return Q[L - be];
      }
      if (be > L)
        throw new Error(Ce("data", be));
      if (de = X[L - be], !re)
        return de;
    }
    let ve = de;
    const Pe = re.split("/");
    for (const Ne of Pe)
      Ne && (de = (0, l._)`${de}${(0, l.getProperty)((0, i.unescapeJsonPointer)(Ne))}`, ve = (0, l._)`${ve} && ${de}`);
    return ve;
    function Ce(Ne, be) {
      return `Cannot access ${Ne} ${be} levels up, current level is ${L}`;
    }
  }
  return zt.getData = z, zt;
}
var ra = {}, eh;
function cl() {
  if (eh) return ra;
  eh = 1, Object.defineProperty(ra, "__esModule", { value: !0 });
  class e extends Error {
    constructor(o) {
      super("validation failed"), this.errors = o, this.ajv = this.validation = !0;
    }
  }
  return ra.default = e, ra;
}
var na = {}, th;
function gs() {
  if (th) return na;
  th = 1, Object.defineProperty(na, "__esModule", { value: !0 });
  const e = ms();
  class t extends Error {
    constructor(r, c, n, s) {
      super(s || `can't resolve reference ${n} from id ${c}`), this.missingRef = (0, e.resolveUrl)(r, c, n), this.missingSchema = (0, e.normalizeId)((0, e.getFullPath)(r, this.missingRef));
    }
  }
  return na.default = t, na;
}
var gt = {}, rh;
function ll() {
  if (rh) return gt;
  rh = 1, Object.defineProperty(gt, "__esModule", { value: !0 }), gt.resolveSchema = gt.getCompilingSchema = gt.resolveRef = gt.compileSchema = gt.SchemaEnv = void 0;
  const e = Ie(), t = cl(), o = dr(), r = ms(), c = Ue(), n = ys();
  class s {
    constructor(y) {
      var p;
      this.refs = {}, this.dynamicAnchors = {};
      let E;
      typeof y.schema == "object" && (E = y.schema), this.schema = y.schema, this.schemaId = y.schemaId, this.root = y.root || this, this.baseId = (p = y.baseId) !== null && p !== void 0 ? p : (0, r.normalizeId)(E?.[y.schemaId || "$id"]), this.schemaPath = y.schemaPath, this.localRefs = y.localRefs, this.meta = y.meta, this.$async = E?.$async, this.refs = {};
    }
  }
  gt.SchemaEnv = s;
  function l(h) {
    const y = i.call(this, h);
    if (y)
      return y;
    const p = (0, r.getFullPath)(this.opts.uriResolver, h.root.baseId), { es5: E, lines: $ } = this.opts.code, { ownProperties: S } = this.opts, _ = new e.CodeGen(this.scope, { es5: E, lines: $, ownProperties: S });
    let w;
    h.$async && (w = _.scopeValue("Error", {
      ref: t.default,
      code: (0, e._)`require("ajv/dist/runtime/validation_error").default`
    }));
    const R = _.scopeName("validate");
    h.validateName = R;
    const P = {
      gen: _,
      allErrors: this.opts.allErrors,
      data: o.default.data,
      parentData: o.default.parentData,
      parentDataProperty: o.default.parentDataProperty,
      dataNames: [o.default.data],
      dataPathArr: [e.nil],
      // TODO can its length be used as dataLevel if nil is removed?
      dataLevel: 0,
      dataTypes: [],
      definedProperties: /* @__PURE__ */ new Set(),
      topSchemaRef: _.scopeValue("schema", this.opts.code.source === !0 ? { ref: h.schema, code: (0, e.stringify)(h.schema) } : { ref: h.schema }),
      validateName: R,
      ValidationError: w,
      schema: h.schema,
      schemaEnv: h,
      rootId: p,
      baseId: h.baseId || p,
      schemaPath: e.nil,
      errSchemaPath: h.schemaPath || (this.opts.jtd ? "" : "#"),
      errorPath: (0, e._)`""`,
      opts: this.opts,
      self: this
    };
    let j;
    try {
      this._compilations.add(h), (0, n.validateFunctionCode)(P), _.optimize(this.opts.code.optimize);
      const M = _.toString();
      j = `${_.scopeRefs(o.default.scope)}return ${M}`, this.opts.code.process && (j = this.opts.code.process(j, h));
      const W = new Function(`${o.default.self}`, `${o.default.scope}`, j)(this, this.scope.get());
      if (this.scope.value(R, { ref: W }), W.errors = null, W.schema = h.schema, W.schemaEnv = h, h.$async && (W.$async = !0), this.opts.code.source === !0 && (W.source = { validateName: R, validateCode: M, scopeValues: _._values }), this.opts.unevaluated) {
        const { props: F, items: q } = P;
        W.evaluated = {
          props: F instanceof e.Name ? void 0 : F,
          items: q instanceof e.Name ? void 0 : q,
          dynamicProps: F instanceof e.Name,
          dynamicItems: q instanceof e.Name
        }, W.source && (W.source.evaluated = (0, e.stringify)(W.evaluated));
      }
      return h.validate = W, h;
    } catch (M) {
      throw delete h.validate, delete h.validateName, j && this.logger.error("Error compiling schema, function code:", j), M;
    } finally {
      this._compilations.delete(h);
    }
  }
  gt.compileSchema = l;
  function a(h, y, p) {
    var E;
    p = (0, r.resolveUrl)(this.opts.uriResolver, y, p);
    const $ = h.refs[p];
    if ($)
      return $;
    let S = d.call(this, h, p);
    if (S === void 0) {
      const _ = (E = h.localRefs) === null || E === void 0 ? void 0 : E[p], { schemaId: w } = this.opts;
      _ && (S = new s({ schema: _, schemaId: w, root: h, baseId: y }));
    }
    if (S !== void 0)
      return h.refs[p] = u.call(this, S);
  }
  gt.resolveRef = a;
  function u(h) {
    return (0, r.inlineRef)(h.schema, this.opts.inlineRefs) ? h.schema : h.validate ? h : l.call(this, h);
  }
  function i(h) {
    for (const y of this._compilations)
      if (f(y, h))
        return y;
  }
  gt.getCompilingSchema = i;
  function f(h, y) {
    return h.schema === y.schema && h.root === y.root && h.baseId === y.baseId;
  }
  function d(h, y) {
    let p;
    for (; typeof (p = this.refs[y]) == "string"; )
      y = p;
    return p || this.schemas[y] || m.call(this, h, y);
  }
  function m(h, y) {
    const p = this.opts.uriResolver.parse(y), E = (0, r._getFullPath)(this.opts.uriResolver, p);
    let $ = (0, r.getFullPath)(this.opts.uriResolver, h.baseId, void 0);
    if (Object.keys(h.schema).length > 0 && E === $)
      return v.call(this, p, h);
    const S = (0, r.normalizeId)(E), _ = this.refs[S] || this.schemas[S];
    if (typeof _ == "string") {
      const w = m.call(this, h, _);
      return typeof w?.schema != "object" ? void 0 : v.call(this, p, w);
    }
    if (typeof _?.schema == "object") {
      if (_.validate || l.call(this, _), S === (0, r.normalizeId)(y)) {
        const { schema: w } = _, { schemaId: R } = this.opts, P = w[R];
        return P && ($ = (0, r.resolveUrl)(this.opts.uriResolver, $, P)), new s({ schema: w, schemaId: R, root: h, baseId: $ });
      }
      return v.call(this, p, _);
    }
  }
  gt.resolveSchema = m;
  const g = /* @__PURE__ */ new Set([
    "properties",
    "patternProperties",
    "enum",
    "dependencies",
    "definitions"
  ]);
  function v(h, { baseId: y, schema: p, root: E }) {
    var $;
    if ((($ = h.fragment) === null || $ === void 0 ? void 0 : $[0]) !== "/")
      return;
    for (const w of h.fragment.slice(1).split("/")) {
      if (typeof p == "boolean")
        return;
      const R = p[(0, c.unescapeFragment)(w)];
      if (R === void 0)
        return;
      p = R;
      const P = typeof p == "object" && p[this.opts.schemaId];
      !g.has(w) && P && (y = (0, r.resolveUrl)(this.opts.uriResolver, y, P));
    }
    let S;
    if (typeof p != "boolean" && p.$ref && !(0, c.schemaHasRulesButRef)(p, this.RULES)) {
      const w = (0, r.resolveUrl)(this.opts.uriResolver, y, p.$ref);
      S = m.call(this, E, w);
    }
    const { schemaId: _ } = this.opts;
    if (S = S || new s({ schema: p, schemaId: _, root: E, baseId: y }), S.schema !== S.root.schema)
      return S;
  }
  return gt;
}
const HE = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", BE = "Meta-schema for $data reference (JSON AnySchema extension proposal)", zE = "object", KE = ["$data"], XE = { $data: { type: "string", anyOf: [{ format: "relative-json-pointer" }, { format: "json-pointer" }] } }, WE = !1, YE = {
  $id: HE,
  description: BE,
  type: zE,
  required: KE,
  properties: XE,
  additionalProperties: WE
};
var ia = {}, nh;
function JE() {
  if (nh) return ia;
  nh = 1, Object.defineProperty(ia, "__esModule", { value: !0 });
  const e = c0();
  return e.code = 'require("ajv/dist/runtime/uri").default', ia.default = e, ia;
}
var ih;
function QE() {
  return ih || (ih = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
    var t = ys();
    Object.defineProperty(e, "KeywordCxt", { enumerable: !0, get: function() {
      return t.KeywordCxt;
    } });
    var o = Ie();
    Object.defineProperty(e, "_", { enumerable: !0, get: function() {
      return o._;
    } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
      return o.str;
    } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
      return o.stringify;
    } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
      return o.nil;
    } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
      return o.Name;
    } }), Object.defineProperty(e, "CodeGen", { enumerable: !0, get: function() {
      return o.CodeGen;
    } });
    const r = cl(), c = gs(), n = h0(), s = ll(), l = Ie(), a = ms(), u = os(), i = Ue(), f = YE, d = JE(), m = (k, I) => new RegExp(k, I);
    m.code = "new RegExp";
    const g = ["removeAdditional", "useDefaults", "coerceTypes"], v = /* @__PURE__ */ new Set([
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
    }, y = {
      ignoreKeywordsWithRef: "",
      jsPropertySyntax: "",
      unicode: '"minLength"/"maxLength" account for unicode characters by default.'
    }, p = 200;
    function E(k) {
      var I, U, D, T, N, V, A, O, Z, z, C, L, X, Q, re, de, ve, Pe, Ce, Ne, be, b, te, ie, me;
      const ae = k.strict, fe = (I = k.code) === null || I === void 0 ? void 0 : I.optimize, le = fe === !0 || fe === void 0 ? 1 : fe || 0, ye = (D = (U = k.code) === null || U === void 0 ? void 0 : U.regExp) !== null && D !== void 0 ? D : m, _e = (T = k.uriResolver) !== null && T !== void 0 ? T : d.default;
      return {
        strictSchema: (V = (N = k.strictSchema) !== null && N !== void 0 ? N : ae) !== null && V !== void 0 ? V : !0,
        strictNumbers: (O = (A = k.strictNumbers) !== null && A !== void 0 ? A : ae) !== null && O !== void 0 ? O : !0,
        strictTypes: (z = (Z = k.strictTypes) !== null && Z !== void 0 ? Z : ae) !== null && z !== void 0 ? z : "log",
        strictTuples: (L = (C = k.strictTuples) !== null && C !== void 0 ? C : ae) !== null && L !== void 0 ? L : "log",
        strictRequired: (Q = (X = k.strictRequired) !== null && X !== void 0 ? X : ae) !== null && Q !== void 0 ? Q : !1,
        code: k.code ? { ...k.code, optimize: le, regExp: ye } : { optimize: le, regExp: ye },
        loopRequired: (re = k.loopRequired) !== null && re !== void 0 ? re : p,
        loopEnum: (de = k.loopEnum) !== null && de !== void 0 ? de : p,
        meta: (ve = k.meta) !== null && ve !== void 0 ? ve : !0,
        messages: (Pe = k.messages) !== null && Pe !== void 0 ? Pe : !0,
        inlineRefs: (Ce = k.inlineRefs) !== null && Ce !== void 0 ? Ce : !0,
        schemaId: (Ne = k.schemaId) !== null && Ne !== void 0 ? Ne : "$id",
        addUsedSchema: (be = k.addUsedSchema) !== null && be !== void 0 ? be : !0,
        validateSchema: (b = k.validateSchema) !== null && b !== void 0 ? b : !0,
        validateFormats: (te = k.validateFormats) !== null && te !== void 0 ? te : !0,
        unicodeRegExp: (ie = k.unicodeRegExp) !== null && ie !== void 0 ? ie : !0,
        int32range: (me = k.int32range) !== null && me !== void 0 ? me : !0,
        uriResolver: _e
      };
    }
    class $ {
      constructor(I = {}) {
        this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), I = this.opts = { ...I, ...E(I) };
        const { es5: U, lines: D } = this.opts.code;
        this.scope = new l.ValueScope({ scope: {}, prefixes: v, es5: U, lines: D }), this.logger = B(I.logger);
        const T = I.validateFormats;
        I.validateFormats = !1, this.RULES = (0, n.getRules)(), S.call(this, h, I, "NOT SUPPORTED"), S.call(this, y, I, "DEPRECATED", "warn"), this._metaOpts = j.call(this), I.formats && R.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), I.keywords && P.call(this, I.keywords), typeof I.meta == "object" && this.addMetaSchema(I.meta), w.call(this), I.validateFormats = T;
      }
      _addVocabularies() {
        this.addKeyword("$async");
      }
      _addDefaultMetaSchema() {
        const { $data: I, meta: U, schemaId: D } = this.opts;
        let T = f;
        D === "id" && (T = { ...f }, T.id = T.$id, delete T.$id), U && I && this.addMetaSchema(T, T[D], !1);
      }
      defaultMeta() {
        const { meta: I, schemaId: U } = this.opts;
        return this.opts.defaultMeta = typeof I == "object" ? I[U] || I : void 0;
      }
      validate(I, U) {
        let D;
        if (typeof I == "string") {
          if (D = this.getSchema(I), !D)
            throw new Error(`no schema with key or ref "${I}"`);
        } else
          D = this.compile(I);
        const T = D(U);
        return "$async" in D || (this.errors = D.errors), T;
      }
      compile(I, U) {
        const D = this._addSchema(I, U);
        return D.validate || this._compileSchemaEnv(D);
      }
      compileAsync(I, U) {
        if (typeof this.opts.loadSchema != "function")
          throw new Error("options.loadSchema should be a function");
        const { loadSchema: D } = this.opts;
        return T.call(this, I, U);
        async function T(z, C) {
          await N.call(this, z.$schema);
          const L = this._addSchema(z, C);
          return L.validate || V.call(this, L);
        }
        async function N(z) {
          z && !this.getSchema(z) && await T.call(this, { $ref: z }, !0);
        }
        async function V(z) {
          try {
            return this._compileSchemaEnv(z);
          } catch (C) {
            if (!(C instanceof c.default))
              throw C;
            return A.call(this, C), await O.call(this, C.missingSchema), V.call(this, z);
          }
        }
        function A({ missingSchema: z, missingRef: C }) {
          if (this.refs[z])
            throw new Error(`AnySchema ${z} is loaded but ${C} cannot be resolved`);
        }
        async function O(z) {
          const C = await Z.call(this, z);
          this.refs[z] || await N.call(this, C.$schema), this.refs[z] || this.addSchema(C, z, U);
        }
        async function Z(z) {
          const C = this._loading[z];
          if (C)
            return C;
          try {
            return await (this._loading[z] = D(z));
          } finally {
            delete this._loading[z];
          }
        }
      }
      // Adds schema to the instance
      addSchema(I, U, D, T = this.opts.validateSchema) {
        if (Array.isArray(I)) {
          for (const V of I)
            this.addSchema(V, void 0, D, T);
          return this;
        }
        let N;
        if (typeof I == "object") {
          const { schemaId: V } = this.opts;
          if (N = I[V], N !== void 0 && typeof N != "string")
            throw new Error(`schema ${V} must be string`);
        }
        return U = (0, a.normalizeId)(U || N), this._checkUnique(U), this.schemas[U] = this._addSchema(I, D, U, T, !0), this;
      }
      // Add schema that will be used to validate other schemas
      // options in META_IGNORE_OPTIONS are alway set to false
      addMetaSchema(I, U, D = this.opts.validateSchema) {
        return this.addSchema(I, U, !0, D), this;
      }
      //  Validate schema against its meta-schema
      validateSchema(I, U) {
        if (typeof I == "boolean")
          return !0;
        let D;
        if (D = I.$schema, D !== void 0 && typeof D != "string")
          throw new Error("$schema must be a string");
        if (D = D || this.opts.defaultMeta || this.defaultMeta(), !D)
          return this.logger.warn("meta-schema not available"), this.errors = null, !0;
        const T = this.validate(D, I);
        if (!T && U) {
          const N = "schema is invalid: " + this.errorsText();
          if (this.opts.validateSchema === "log")
            this.logger.error(N);
          else
            throw new Error(N);
        }
        return T;
      }
      // Get compiled schema by `key` or `ref`.
      // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
      getSchema(I) {
        let U;
        for (; typeof (U = _.call(this, I)) == "string"; )
          I = U;
        if (U === void 0) {
          const { schemaId: D } = this.opts, T = new s.SchemaEnv({ schema: {}, schemaId: D });
          if (U = s.resolveSchema.call(this, T, I), !U)
            return;
          this.refs[I] = U;
        }
        return U.validate || this._compileSchemaEnv(U);
      }
      // Remove cached schema(s).
      // If no parameter is passed all schemas but meta-schemas are removed.
      // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
      // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
      removeSchema(I) {
        if (I instanceof RegExp)
          return this._removeAllSchemas(this.schemas, I), this._removeAllSchemas(this.refs, I), this;
        switch (typeof I) {
          case "undefined":
            return this._removeAllSchemas(this.schemas), this._removeAllSchemas(this.refs), this._cache.clear(), this;
          case "string": {
            const U = _.call(this, I);
            return typeof U == "object" && this._cache.delete(U.schema), delete this.schemas[I], delete this.refs[I], this;
          }
          case "object": {
            const U = I;
            this._cache.delete(U);
            let D = I[this.opts.schemaId];
            return D && (D = (0, a.normalizeId)(D), delete this.schemas[D], delete this.refs[D]), this;
          }
          default:
            throw new Error("ajv.removeSchema: invalid parameter");
        }
      }
      // add "vocabulary" - a collection of keywords
      addVocabulary(I) {
        for (const U of I)
          this.addKeyword(U);
        return this;
      }
      addKeyword(I, U) {
        let D;
        if (typeof I == "string")
          D = I, typeof U == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), U.keyword = D);
        else if (typeof I == "object" && U === void 0) {
          if (U = I, D = U.keyword, Array.isArray(D) && !D.length)
            throw new Error("addKeywords: keyword must be string or non-empty array");
        } else
          throw new Error("invalid addKeywords parameters");
        if (F.call(this, D, U), !U)
          return (0, i.eachItem)(D, (N) => q.call(this, N)), this;
        H.call(this, U);
        const T = {
          ...U,
          type: (0, u.getJSONTypes)(U.type),
          schemaType: (0, u.getJSONTypes)(U.schemaType)
        };
        return (0, i.eachItem)(D, T.type.length === 0 ? (N) => q.call(this, N, T) : (N) => T.type.forEach((V) => q.call(this, N, T, V))), this;
      }
      getKeyword(I) {
        const U = this.RULES.all[I];
        return typeof U == "object" ? U.definition : !!U;
      }
      // Remove keyword
      removeKeyword(I) {
        const { RULES: U } = this;
        delete U.keywords[I], delete U.all[I];
        for (const D of U.rules) {
          const T = D.rules.findIndex((N) => N.keyword === I);
          T >= 0 && D.rules.splice(T, 1);
        }
        return this;
      }
      // Add format
      addFormat(I, U) {
        return typeof U == "string" && (U = new RegExp(U)), this.formats[I] = U, this;
      }
      errorsText(I = this.errors, { separator: U = ", ", dataVar: D = "data" } = {}) {
        return !I || I.length === 0 ? "No errors" : I.map((T) => `${D}${T.instancePath} ${T.message}`).reduce((T, N) => T + U + N);
      }
      $dataMetaSchema(I, U) {
        const D = this.RULES.all;
        I = JSON.parse(JSON.stringify(I));
        for (const T of U) {
          const N = T.split("/").slice(1);
          let V = I;
          for (const A of N)
            V = V[A];
          for (const A in D) {
            const O = D[A];
            if (typeof O != "object")
              continue;
            const { $data: Z } = O.definition, z = V[A];
            Z && z && (V[A] = Y(z));
          }
        }
        return I;
      }
      _removeAllSchemas(I, U) {
        for (const D in I) {
          const T = I[D];
          (!U || U.test(D)) && (typeof T == "string" ? delete I[D] : T && !T.meta && (this._cache.delete(T.schema), delete I[D]));
        }
      }
      _addSchema(I, U, D, T = this.opts.validateSchema, N = this.opts.addUsedSchema) {
        let V;
        const { schemaId: A } = this.opts;
        if (typeof I == "object")
          V = I[A];
        else {
          if (this.opts.jtd)
            throw new Error("schema must be object");
          if (typeof I != "boolean")
            throw new Error("schema must be object or boolean");
        }
        let O = this._cache.get(I);
        if (O !== void 0)
          return O;
        D = (0, a.normalizeId)(V || D);
        const Z = a.getSchemaRefs.call(this, I, D);
        return O = new s.SchemaEnv({ schema: I, schemaId: A, meta: U, baseId: D, localRefs: Z }), this._cache.set(O.schema, O), N && !D.startsWith("#") && (D && this._checkUnique(D), this.refs[D] = O), T && this.validateSchema(I, !0), O;
      }
      _checkUnique(I) {
        if (this.schemas[I] || this.refs[I])
          throw new Error(`schema with key or id "${I}" already exists`);
      }
      _compileSchemaEnv(I) {
        if (I.meta ? this._compileMetaSchema(I) : s.compileSchema.call(this, I), !I.validate)
          throw new Error("ajv implementation error");
        return I.validate;
      }
      _compileMetaSchema(I) {
        const U = this.opts;
        this.opts = this._metaOpts;
        try {
          s.compileSchema.call(this, I);
        } finally {
          this.opts = U;
        }
      }
    }
    $.ValidationError = r.default, $.MissingRefError = c.default, e.default = $;
    function S(k, I, U, D = "error") {
      for (const T in k) {
        const N = T;
        N in I && this.logger[D](`${U}: option ${T}. ${k[N]}`);
      }
    }
    function _(k) {
      return k = (0, a.normalizeId)(k), this.schemas[k] || this.refs[k];
    }
    function w() {
      const k = this.opts.schemas;
      if (k)
        if (Array.isArray(k))
          this.addSchema(k);
        else
          for (const I in k)
            this.addSchema(k[I], I);
    }
    function R() {
      for (const k in this.opts.formats) {
        const I = this.opts.formats[k];
        I && this.addFormat(k, I);
      }
    }
    function P(k) {
      if (Array.isArray(k)) {
        this.addVocabulary(k);
        return;
      }
      this.logger.warn("keywords option as map is deprecated, pass array");
      for (const I in k) {
        const U = k[I];
        U.keyword || (U.keyword = I), this.addKeyword(U);
      }
    }
    function j() {
      const k = { ...this.opts };
      for (const I of g)
        delete k[I];
      return k;
    }
    const M = { log() {
    }, warn() {
    }, error() {
    } };
    function B(k) {
      if (k === !1)
        return M;
      if (k === void 0)
        return console;
      if (k.log && k.warn && k.error)
        return k;
      throw new Error("logger must implement log, warn and error methods");
    }
    const W = /^[a-z_$][a-z0-9_$:-]*$/i;
    function F(k, I) {
      const { RULES: U } = this;
      if ((0, i.eachItem)(k, (D) => {
        if (U.keywords[D])
          throw new Error(`Keyword ${D} is already defined`);
        if (!W.test(D))
          throw new Error(`Keyword ${D} has invalid name`);
      }), !!I && I.$data && !("code" in I || "validate" in I))
        throw new Error('$data keyword must have "code" or "validate" function');
    }
    function q(k, I, U) {
      var D;
      const T = I?.post;
      if (U && T)
        throw new Error('keyword with "post" flag cannot have "type"');
      const { RULES: N } = this;
      let V = T ? N.post : N.rules.find(({ type: O }) => O === U);
      if (V || (V = { type: U, rules: [] }, N.rules.push(V)), N.keywords[k] = !0, !I)
        return;
      const A = {
        keyword: k,
        definition: {
          ...I,
          type: (0, u.getJSONTypes)(I.type),
          schemaType: (0, u.getJSONTypes)(I.schemaType)
        }
      };
      I.before ? J.call(this, V, A, I.before) : V.rules.push(A), N.all[k] = A, (D = I.implements) === null || D === void 0 || D.forEach((O) => this.addKeyword(O));
    }
    function J(k, I, U) {
      const D = k.rules.findIndex((T) => T.keyword === U);
      D >= 0 ? k.rules.splice(D, 0, I) : (k.rules.push(I), this.logger.warn(`rule ${U} is not defined`));
    }
    function H(k) {
      let { metaSchema: I } = k;
      I !== void 0 && (k.$data && this.opts.$data && (I = Y(I)), k.validateSchema = this.compile(I, !0));
    }
    const G = {
      $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
    };
    function Y(k) {
      return { anyOf: [k, G] };
    }
  })(Ws)), Ws;
}
var aa = {}, sa = {}, oa = {}, ah;
function ZE() {
  if (ah) return oa;
  ah = 1, Object.defineProperty(oa, "__esModule", { value: !0 });
  const e = {
    keyword: "id",
    code() {
      throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
    }
  };
  return oa.default = e, oa;
}
var rr = {}, sh;
function ew() {
  if (sh) return rr;
  sh = 1, Object.defineProperty(rr, "__esModule", { value: !0 }), rr.callRef = rr.getValidate = void 0;
  const e = gs(), t = kt(), o = Ie(), r = dr(), c = ll(), n = Ue(), s = {
    keyword: "$ref",
    schemaType: "string",
    code(u) {
      const { gen: i, schema: f, it: d } = u, { baseId: m, schemaEnv: g, validateName: v, opts: h, self: y } = d, { root: p } = g;
      if ((f === "#" || f === "#/") && m === p.baseId)
        return $();
      const E = c.resolveRef.call(y, p, m, f);
      if (E === void 0)
        throw new e.default(d.opts.uriResolver, m, f);
      if (E instanceof c.SchemaEnv)
        return S(E);
      return _(E);
      function $() {
        if (g === p)
          return a(u, v, g, g.$async);
        const w = i.scopeValue("root", { ref: p });
        return a(u, (0, o._)`${w}.validate`, p, p.$async);
      }
      function S(w) {
        const R = l(u, w);
        a(u, R, w, w.$async);
      }
      function _(w) {
        const R = i.scopeValue("schema", h.code.source === !0 ? { ref: w, code: (0, o.stringify)(w) } : { ref: w }), P = i.name("valid"), j = u.subschema({
          schema: w,
          dataTypes: [],
          schemaPath: o.nil,
          topSchemaRef: R,
          errSchemaPath: f
        }, P);
        u.mergeEvaluated(j), u.ok(P);
      }
    }
  };
  function l(u, i) {
    const { gen: f } = u;
    return i.validate ? f.scopeValue("validate", { ref: i.validate }) : (0, o._)`${f.scopeValue("wrapper", { ref: i })}.validate`;
  }
  rr.getValidate = l;
  function a(u, i, f, d) {
    const { gen: m, it: g } = u, { allErrors: v, schemaEnv: h, opts: y } = g, p = y.passContext ? r.default.this : o.nil;
    d ? E() : $();
    function E() {
      if (!h.$async)
        throw new Error("async schema referenced by sync schema");
      const w = m.let("valid");
      m.try(() => {
        m.code((0, o._)`await ${(0, t.callValidateCode)(u, i, p)}`), _(i), v || m.assign(w, !0);
      }, (R) => {
        m.if((0, o._)`!(${R} instanceof ${g.ValidationError})`, () => m.throw(R)), S(R), v || m.assign(w, !1);
      }), u.ok(w);
    }
    function $() {
      u.result((0, t.callValidateCode)(u, i, p), () => _(i), () => S(i));
    }
    function S(w) {
      const R = (0, o._)`${w}.errors`;
      m.assign(r.default.vErrors, (0, o._)`${r.default.vErrors} === null ? ${R} : ${r.default.vErrors}.concat(${R})`), m.assign(r.default.errors, (0, o._)`${r.default.vErrors}.length`);
    }
    function _(w) {
      var R;
      if (!g.opts.unevaluated)
        return;
      const P = (R = f?.validate) === null || R === void 0 ? void 0 : R.evaluated;
      if (g.props !== !0)
        if (P && !P.dynamicProps)
          P.props !== void 0 && (g.props = n.mergeEvaluated.props(m, P.props, g.props));
        else {
          const j = m.var("props", (0, o._)`${w}.evaluated.props`);
          g.props = n.mergeEvaluated.props(m, j, g.props, o.Name);
        }
      if (g.items !== !0)
        if (P && !P.dynamicItems)
          P.items !== void 0 && (g.items = n.mergeEvaluated.items(m, P.items, g.items));
        else {
          const j = m.var("items", (0, o._)`${w}.evaluated.items`);
          g.items = n.mergeEvaluated.items(m, j, g.items, o.Name);
        }
    }
  }
  return rr.callRef = a, rr.default = s, rr;
}
var oh;
function tw() {
  if (oh) return sa;
  oh = 1, Object.defineProperty(sa, "__esModule", { value: !0 });
  const e = ZE(), t = ew(), o = [
    "$schema",
    "$id",
    "$defs",
    "$vocabulary",
    { keyword: "$comment" },
    "definitions",
    e.default,
    t.default
  ];
  return sa.default = o, sa;
}
var ua = {}, ca = {}, uh;
function rw() {
  if (uh) return ca;
  uh = 1, Object.defineProperty(ca, "__esModule", { value: !0 });
  const e = Ie(), t = e.operators, o = {
    maximum: { okStr: "<=", ok: t.LTE, fail: t.GT },
    minimum: { okStr: ">=", ok: t.GTE, fail: t.LT },
    exclusiveMaximum: { okStr: "<", ok: t.LT, fail: t.GTE },
    exclusiveMinimum: { okStr: ">", ok: t.GT, fail: t.LTE }
  }, r = {
    message: ({ keyword: n, schemaCode: s }) => (0, e.str)`must be ${o[n].okStr} ${s}`,
    params: ({ keyword: n, schemaCode: s }) => (0, e._)`{comparison: ${o[n].okStr}, limit: ${s}}`
  }, c = {
    keyword: Object.keys(o),
    type: "number",
    schemaType: "number",
    $data: !0,
    error: r,
    code(n) {
      const { keyword: s, data: l, schemaCode: a } = n;
      n.fail$data((0, e._)`${l} ${o[s].fail} ${a} || isNaN(${l})`);
    }
  };
  return ca.default = c, ca;
}
var la = {}, ch;
function nw() {
  if (ch) return la;
  ch = 1, Object.defineProperty(la, "__esModule", { value: !0 });
  const e = Ie(), o = {
    keyword: "multipleOf",
    type: "number",
    schemaType: "number",
    $data: !0,
    error: {
      message: ({ schemaCode: r }) => (0, e.str)`must be multiple of ${r}`,
      params: ({ schemaCode: r }) => (0, e._)`{multipleOf: ${r}}`
    },
    code(r) {
      const { gen: c, data: n, schemaCode: s, it: l } = r, a = l.opts.multipleOfPrecision, u = c.let("res"), i = a ? (0, e._)`Math.abs(Math.round(${u}) - ${u}) > 1e-${a}` : (0, e._)`${u} !== parseInt(${u})`;
      r.fail$data((0, e._)`(${s} === 0 || (${u} = ${n}/${s}, ${i}))`);
    }
  };
  return la.default = o, la;
}
var da = {}, fa = {}, lh;
function iw() {
  if (lh) return fa;
  lh = 1, Object.defineProperty(fa, "__esModule", { value: !0 });
  function e(t) {
    const o = t.length;
    let r = 0, c = 0, n;
    for (; c < o; )
      r++, n = t.charCodeAt(c++), n >= 55296 && n <= 56319 && c < o && (n = t.charCodeAt(c), (n & 64512) === 56320 && c++);
    return r;
  }
  return fa.default = e, e.code = 'require("ajv/dist/runtime/ucs2length").default', fa;
}
var dh;
function aw() {
  if (dh) return da;
  dh = 1, Object.defineProperty(da, "__esModule", { value: !0 });
  const e = Ie(), t = Ue(), o = iw(), c = {
    keyword: ["maxLength", "minLength"],
    type: "string",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: n, schemaCode: s }) {
        const l = n === "maxLength" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${l} than ${s} characters`;
      },
      params: ({ schemaCode: n }) => (0, e._)`{limit: ${n}}`
    },
    code(n) {
      const { keyword: s, data: l, schemaCode: a, it: u } = n, i = s === "maxLength" ? e.operators.GT : e.operators.LT, f = u.opts.unicode === !1 ? (0, e._)`${l}.length` : (0, e._)`${(0, t.useFunc)(n.gen, o.default)}(${l})`;
      n.fail$data((0, e._)`${f} ${i} ${a}`);
    }
  };
  return da.default = c, da;
}
var ha = {}, fh;
function sw() {
  if (fh) return ha;
  fh = 1, Object.defineProperty(ha, "__esModule", { value: !0 });
  const e = kt(), t = Ie(), r = {
    keyword: "pattern",
    type: "string",
    schemaType: "string",
    $data: !0,
    error: {
      message: ({ schemaCode: c }) => (0, t.str)`must match pattern "${c}"`,
      params: ({ schemaCode: c }) => (0, t._)`{pattern: ${c}}`
    },
    code(c) {
      const { data: n, $data: s, schema: l, schemaCode: a, it: u } = c, i = u.opts.unicodeRegExp ? "u" : "", f = s ? (0, t._)`(new RegExp(${a}, ${i}))` : (0, e.usePattern)(c, l);
      c.fail$data((0, t._)`!${f}.test(${n})`);
    }
  };
  return ha.default = r, ha;
}
var pa = {}, hh;
function ow() {
  if (hh) return pa;
  hh = 1, Object.defineProperty(pa, "__esModule", { value: !0 });
  const e = Ie(), o = {
    keyword: ["maxProperties", "minProperties"],
    type: "object",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: r, schemaCode: c }) {
        const n = r === "maxProperties" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${n} than ${c} properties`;
      },
      params: ({ schemaCode: r }) => (0, e._)`{limit: ${r}}`
    },
    code(r) {
      const { keyword: c, data: n, schemaCode: s } = r, l = c === "maxProperties" ? e.operators.GT : e.operators.LT;
      r.fail$data((0, e._)`Object.keys(${n}).length ${l} ${s}`);
    }
  };
  return pa.default = o, pa;
}
var ma = {}, ph;
function uw() {
  if (ph) return ma;
  ph = 1, Object.defineProperty(ma, "__esModule", { value: !0 });
  const e = kt(), t = Ie(), o = Ue(), c = {
    keyword: "required",
    type: "object",
    schemaType: "array",
    $data: !0,
    error: {
      message: ({ params: { missingProperty: n } }) => (0, t.str)`must have required property '${n}'`,
      params: ({ params: { missingProperty: n } }) => (0, t._)`{missingProperty: ${n}}`
    },
    code(n) {
      const { gen: s, schema: l, schemaCode: a, data: u, $data: i, it: f } = n, { opts: d } = f;
      if (!i && l.length === 0)
        return;
      const m = l.length >= d.loopRequired;
      if (f.allErrors ? g() : v(), d.strictRequired) {
        const p = n.parentSchema.properties, { definedProperties: E } = n.it;
        for (const $ of l)
          if (p?.[$] === void 0 && !E.has($)) {
            const S = f.schemaEnv.baseId + f.errSchemaPath, _ = `required property "${$}" is not defined at "${S}" (strictRequired)`;
            (0, o.checkStrictMode)(f, _, f.opts.strictRequired);
          }
      }
      function g() {
        if (m || i)
          n.block$data(t.nil, h);
        else
          for (const p of l)
            (0, e.checkReportMissingProp)(n, p);
      }
      function v() {
        const p = s.let("missing");
        if (m || i) {
          const E = s.let("valid", !0);
          n.block$data(E, () => y(p, E)), n.ok(E);
        } else
          s.if((0, e.checkMissingProp)(n, l, p)), (0, e.reportMissingProp)(n, p), s.else();
      }
      function h() {
        s.forOf("prop", a, (p) => {
          n.setParams({ missingProperty: p }), s.if((0, e.noPropertyInData)(s, u, p, d.ownProperties), () => n.error());
        });
      }
      function y(p, E) {
        n.setParams({ missingProperty: p }), s.forOf(p, a, () => {
          s.assign(E, (0, e.propertyInData)(s, u, p, d.ownProperties)), s.if((0, t.not)(E), () => {
            n.error(), s.break();
          });
        }, t.nil);
      }
    }
  };
  return ma.default = c, ma;
}
var ya = {}, mh;
function cw() {
  if (mh) return ya;
  mh = 1, Object.defineProperty(ya, "__esModule", { value: !0 });
  const e = Ie(), o = {
    keyword: ["maxItems", "minItems"],
    type: "array",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: r, schemaCode: c }) {
        const n = r === "maxItems" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${n} than ${c} items`;
      },
      params: ({ schemaCode: r }) => (0, e._)`{limit: ${r}}`
    },
    code(r) {
      const { keyword: c, data: n, schemaCode: s } = r, l = c === "maxItems" ? e.operators.GT : e.operators.LT;
      r.fail$data((0, e._)`${n}.length ${l} ${s}`);
    }
  };
  return ya.default = o, ya;
}
var ga = {}, va = {}, yh;
function dl() {
  if (yh) return va;
  yh = 1, Object.defineProperty(va, "__esModule", { value: !0 });
  const e = ls();
  return e.code = 'require("ajv/dist/runtime/equal").default', va.default = e, va;
}
var gh;
function lw() {
  if (gh) return ga;
  gh = 1, Object.defineProperty(ga, "__esModule", { value: !0 });
  const e = os(), t = Ie(), o = Ue(), r = dl(), n = {
    keyword: "uniqueItems",
    type: "array",
    schemaType: "boolean",
    $data: !0,
    error: {
      message: ({ params: { i: s, j: l } }) => (0, t.str)`must NOT have duplicate items (items ## ${l} and ${s} are identical)`,
      params: ({ params: { i: s, j: l } }) => (0, t._)`{i: ${s}, j: ${l}}`
    },
    code(s) {
      const { gen: l, data: a, $data: u, schema: i, parentSchema: f, schemaCode: d, it: m } = s;
      if (!u && !i)
        return;
      const g = l.let("valid"), v = f.items ? (0, e.getSchemaTypes)(f.items) : [];
      s.block$data(g, h, (0, t._)`${d} === false`), s.ok(g);
      function h() {
        const $ = l.let("i", (0, t._)`${a}.length`), S = l.let("j");
        s.setParams({ i: $, j: S }), l.assign(g, !0), l.if((0, t._)`${$} > 1`, () => (y() ? p : E)($, S));
      }
      function y() {
        return v.length > 0 && !v.some(($) => $ === "object" || $ === "array");
      }
      function p($, S) {
        const _ = l.name("item"), w = (0, e.checkDataTypes)(v, _, m.opts.strictNumbers, e.DataType.Wrong), R = l.const("indices", (0, t._)`{}`);
        l.for((0, t._)`;${$}--;`, () => {
          l.let(_, (0, t._)`${a}[${$}]`), l.if(w, (0, t._)`continue`), v.length > 1 && l.if((0, t._)`typeof ${_} == "string"`, (0, t._)`${_} += "_"`), l.if((0, t._)`typeof ${R}[${_}] == "number"`, () => {
            l.assign(S, (0, t._)`${R}[${_}]`), s.error(), l.assign(g, !1).break();
          }).code((0, t._)`${R}[${_}] = ${$}`);
        });
      }
      function E($, S) {
        const _ = (0, o.useFunc)(l, r.default), w = l.name("outer");
        l.label(w).for((0, t._)`;${$}--;`, () => l.for((0, t._)`${S} = ${$}; ${S}--;`, () => l.if((0, t._)`${_}(${a}[${$}], ${a}[${S}])`, () => {
          s.error(), l.assign(g, !1).break(w);
        })));
      }
    }
  };
  return ga.default = n, ga;
}
var _a = {}, vh;
function dw() {
  if (vh) return _a;
  vh = 1, Object.defineProperty(_a, "__esModule", { value: !0 });
  const e = Ie(), t = Ue(), o = dl(), c = {
    keyword: "const",
    $data: !0,
    error: {
      message: "must be equal to constant",
      params: ({ schemaCode: n }) => (0, e._)`{allowedValue: ${n}}`
    },
    code(n) {
      const { gen: s, data: l, $data: a, schemaCode: u, schema: i } = n;
      a || i && typeof i == "object" ? n.fail$data((0, e._)`!${(0, t.useFunc)(s, o.default)}(${l}, ${u})`) : n.fail((0, e._)`${i} !== ${l}`);
    }
  };
  return _a.default = c, _a;
}
var Ea = {}, _h;
function fw() {
  if (_h) return Ea;
  _h = 1, Object.defineProperty(Ea, "__esModule", { value: !0 });
  const e = Ie(), t = Ue(), o = dl(), c = {
    keyword: "enum",
    schemaType: "array",
    $data: !0,
    error: {
      message: "must be equal to one of the allowed values",
      params: ({ schemaCode: n }) => (0, e._)`{allowedValues: ${n}}`
    },
    code(n) {
      const { gen: s, data: l, $data: a, schema: u, schemaCode: i, it: f } = n;
      if (!a && u.length === 0)
        throw new Error("enum must have non-empty array");
      const d = u.length >= f.opts.loopEnum;
      let m;
      const g = () => m ?? (m = (0, t.useFunc)(s, o.default));
      let v;
      if (d || a)
        v = s.let("valid"), n.block$data(v, h);
      else {
        if (!Array.isArray(u))
          throw new Error("ajv implementation error");
        const p = s.const("vSchema", i);
        v = (0, e.or)(...u.map((E, $) => y(p, $)));
      }
      n.pass(v);
      function h() {
        s.assign(v, !1), s.forOf("v", i, (p) => s.if((0, e._)`${g()}(${l}, ${p})`, () => s.assign(v, !0).break()));
      }
      function y(p, E) {
        const $ = u[E];
        return typeof $ == "object" && $ !== null ? (0, e._)`${g()}(${l}, ${p}[${E}])` : (0, e._)`${l} === ${$}`;
      }
    }
  };
  return Ea.default = c, Ea;
}
var Eh;
function hw() {
  if (Eh) return ua;
  Eh = 1, Object.defineProperty(ua, "__esModule", { value: !0 });
  const e = rw(), t = nw(), o = aw(), r = sw(), c = ow(), n = uw(), s = cw(), l = lw(), a = dw(), u = fw(), i = [
    // number
    e.default,
    t.default,
    // string
    o.default,
    r.default,
    // object
    c.default,
    n.default,
    // array
    s.default,
    l.default,
    // any
    { keyword: "type", schemaType: ["string", "array"] },
    { keyword: "nullable", schemaType: "boolean" },
    a.default,
    u.default
  ];
  return ua.default = i, ua;
}
var wa = {}, jr = {}, wh;
function m0() {
  if (wh) return jr;
  wh = 1, Object.defineProperty(jr, "__esModule", { value: !0 }), jr.validateAdditionalItems = void 0;
  const e = Ie(), t = Ue(), r = {
    keyword: "additionalItems",
    type: "array",
    schemaType: ["boolean", "object"],
    before: "uniqueItems",
    error: {
      message: ({ params: { len: n } }) => (0, e.str)`must NOT have more than ${n} items`,
      params: ({ params: { len: n } }) => (0, e._)`{limit: ${n}}`
    },
    code(n) {
      const { parentSchema: s, it: l } = n, { items: a } = s;
      if (!Array.isArray(a)) {
        (0, t.checkStrictMode)(l, '"additionalItems" is ignored when "items" is not an array of schemas');
        return;
      }
      c(n, a);
    }
  };
  function c(n, s) {
    const { gen: l, schema: a, data: u, keyword: i, it: f } = n;
    f.items = !0;
    const d = l.const("len", (0, e._)`${u}.length`);
    if (a === !1)
      n.setParams({ len: s.length }), n.pass((0, e._)`${d} <= ${s.length}`);
    else if (typeof a == "object" && !(0, t.alwaysValidSchema)(f, a)) {
      const g = l.var("valid", (0, e._)`${d} <= ${s.length}`);
      l.if((0, e.not)(g), () => m(g)), n.ok(g);
    }
    function m(g) {
      l.forRange("i", s.length, d, (v) => {
        n.subschema({ keyword: i, dataProp: v, dataPropType: t.Type.Num }, g), f.allErrors || l.if((0, e.not)(g), () => l.break());
      });
    }
  }
  return jr.validateAdditionalItems = c, jr.default = r, jr;
}
var Sa = {}, Mr = {}, Sh;
function y0() {
  if (Sh) return Mr;
  Sh = 1, Object.defineProperty(Mr, "__esModule", { value: !0 }), Mr.validateTuple = void 0;
  const e = Ie(), t = Ue(), o = kt(), r = {
    keyword: "items",
    type: "array",
    schemaType: ["object", "array", "boolean"],
    before: "uniqueItems",
    code(n) {
      const { schema: s, it: l } = n;
      if (Array.isArray(s))
        return c(n, "additionalItems", s);
      l.items = !0, !(0, t.alwaysValidSchema)(l, s) && n.ok((0, o.validateArray)(n));
    }
  };
  function c(n, s, l = n.schema) {
    const { gen: a, parentSchema: u, data: i, keyword: f, it: d } = n;
    v(u), d.opts.unevaluated && l.length && d.items !== !0 && (d.items = t.mergeEvaluated.items(a, l.length, d.items));
    const m = a.name("valid"), g = a.const("len", (0, e._)`${i}.length`);
    l.forEach((h, y) => {
      (0, t.alwaysValidSchema)(d, h) || (a.if((0, e._)`${g} > ${y}`, () => n.subschema({
        keyword: f,
        schemaProp: y,
        dataProp: y
      }, m)), n.ok(m));
    });
    function v(h) {
      const { opts: y, errSchemaPath: p } = d, E = l.length, $ = E === h.minItems && (E === h.maxItems || h[s] === !1);
      if (y.strictTuples && !$) {
        const S = `"${f}" is ${E}-tuple, but minItems or maxItems/${s} are not specified or different at path "${p}"`;
        (0, t.checkStrictMode)(d, S, y.strictTuples);
      }
    }
  }
  return Mr.validateTuple = c, Mr.default = r, Mr;
}
var $h;
function pw() {
  if ($h) return Sa;
  $h = 1, Object.defineProperty(Sa, "__esModule", { value: !0 });
  const e = y0(), t = {
    keyword: "prefixItems",
    type: "array",
    schemaType: ["array"],
    before: "uniqueItems",
    code: (o) => (0, e.validateTuple)(o, "items")
  };
  return Sa.default = t, Sa;
}
var $a = {}, bh;
function mw() {
  if (bh) return $a;
  bh = 1, Object.defineProperty($a, "__esModule", { value: !0 });
  const e = Ie(), t = Ue(), o = kt(), r = m0(), n = {
    keyword: "items",
    type: "array",
    schemaType: ["object", "boolean"],
    before: "uniqueItems",
    error: {
      message: ({ params: { len: s } }) => (0, e.str)`must NOT have more than ${s} items`,
      params: ({ params: { len: s } }) => (0, e._)`{limit: ${s}}`
    },
    code(s) {
      const { schema: l, parentSchema: a, it: u } = s, { prefixItems: i } = a;
      u.items = !0, !(0, t.alwaysValidSchema)(u, l) && (i ? (0, r.validateAdditionalItems)(s, i) : s.ok((0, o.validateArray)(s)));
    }
  };
  return $a.default = n, $a;
}
var ba = {}, Th;
function yw() {
  if (Th) return ba;
  Th = 1, Object.defineProperty(ba, "__esModule", { value: !0 });
  const e = Ie(), t = Ue(), r = {
    keyword: "contains",
    type: "array",
    schemaType: ["object", "boolean"],
    before: "uniqueItems",
    trackErrors: !0,
    error: {
      message: ({ params: { min: c, max: n } }) => n === void 0 ? (0, e.str)`must contain at least ${c} valid item(s)` : (0, e.str)`must contain at least ${c} and no more than ${n} valid item(s)`,
      params: ({ params: { min: c, max: n } }) => n === void 0 ? (0, e._)`{minContains: ${c}}` : (0, e._)`{minContains: ${c}, maxContains: ${n}}`
    },
    code(c) {
      const { gen: n, schema: s, parentSchema: l, data: a, it: u } = c;
      let i, f;
      const { minContains: d, maxContains: m } = l;
      u.opts.next ? (i = d === void 0 ? 1 : d, f = m) : i = 1;
      const g = n.const("len", (0, e._)`${a}.length`);
      if (c.setParams({ min: i, max: f }), f === void 0 && i === 0) {
        (0, t.checkStrictMode)(u, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
        return;
      }
      if (f !== void 0 && i > f) {
        (0, t.checkStrictMode)(u, '"minContains" > "maxContains" is always invalid'), c.fail();
        return;
      }
      if ((0, t.alwaysValidSchema)(u, s)) {
        let E = (0, e._)`${g} >= ${i}`;
        f !== void 0 && (E = (0, e._)`${E} && ${g} <= ${f}`), c.pass(E);
        return;
      }
      u.items = !0;
      const v = n.name("valid");
      f === void 0 && i === 1 ? y(v, () => n.if(v, () => n.break())) : i === 0 ? (n.let(v, !0), f !== void 0 && n.if((0, e._)`${a}.length > 0`, h)) : (n.let(v, !1), h()), c.result(v, () => c.reset());
      function h() {
        const E = n.name("_valid"), $ = n.let("count", 0);
        y(E, () => n.if(E, () => p($)));
      }
      function y(E, $) {
        n.forRange("i", 0, g, (S) => {
          c.subschema({
            keyword: "contains",
            dataProp: S,
            dataPropType: t.Type.Num,
            compositeRule: !0
          }, E), $();
        });
      }
      function p(E) {
        n.code((0, e._)`${E}++`), f === void 0 ? n.if((0, e._)`${E} >= ${i}`, () => n.assign(v, !0).break()) : (n.if((0, e._)`${E} > ${f}`, () => n.assign(v, !1).break()), i === 1 ? n.assign(v, !0) : n.if((0, e._)`${E} >= ${i}`, () => n.assign(v, !0)));
      }
    }
  };
  return ba.default = r, ba;
}
var to = {}, Rh;
function gw() {
  return Rh || (Rh = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.validateSchemaDeps = e.validatePropertyDeps = e.error = void 0;
    const t = Ie(), o = Ue(), r = kt();
    e.error = {
      message: ({ params: { property: a, depsCount: u, deps: i } }) => {
        const f = u === 1 ? "property" : "properties";
        return (0, t.str)`must have ${f} ${i} when property ${a} is present`;
      },
      params: ({ params: { property: a, depsCount: u, deps: i, missingProperty: f } }) => (0, t._)`{property: ${a},
    missingProperty: ${f},
    depsCount: ${u},
    deps: ${i}}`
      // TODO change to reference
    };
    const c = {
      keyword: "dependencies",
      type: "object",
      schemaType: "object",
      error: e.error,
      code(a) {
        const [u, i] = n(a);
        s(a, u), l(a, i);
      }
    };
    function n({ schema: a }) {
      const u = {}, i = {};
      for (const f in a) {
        if (f === "__proto__")
          continue;
        const d = Array.isArray(a[f]) ? u : i;
        d[f] = a[f];
      }
      return [u, i];
    }
    function s(a, u = a.schema) {
      const { gen: i, data: f, it: d } = a;
      if (Object.keys(u).length === 0)
        return;
      const m = i.let("missing");
      for (const g in u) {
        const v = u[g];
        if (v.length === 0)
          continue;
        const h = (0, r.propertyInData)(i, f, g, d.opts.ownProperties);
        a.setParams({
          property: g,
          depsCount: v.length,
          deps: v.join(", ")
        }), d.allErrors ? i.if(h, () => {
          for (const y of v)
            (0, r.checkReportMissingProp)(a, y);
        }) : (i.if((0, t._)`${h} && (${(0, r.checkMissingProp)(a, v, m)})`), (0, r.reportMissingProp)(a, m), i.else());
      }
    }
    e.validatePropertyDeps = s;
    function l(a, u = a.schema) {
      const { gen: i, data: f, keyword: d, it: m } = a, g = i.name("valid");
      for (const v in u)
        (0, o.alwaysValidSchema)(m, u[v]) || (i.if(
          (0, r.propertyInData)(i, f, v, m.opts.ownProperties),
          () => {
            const h = a.subschema({ keyword: d, schemaProp: v }, g);
            a.mergeValidEvaluated(h, g);
          },
          () => i.var(g, !0)
          // TODO var
        ), a.ok(g));
    }
    e.validateSchemaDeps = l, e.default = c;
  })(to)), to;
}
var Ta = {}, Ph;
function vw() {
  if (Ph) return Ta;
  Ph = 1, Object.defineProperty(Ta, "__esModule", { value: !0 });
  const e = Ie(), t = Ue(), r = {
    keyword: "propertyNames",
    type: "object",
    schemaType: ["object", "boolean"],
    error: {
      message: "property name must be valid",
      params: ({ params: c }) => (0, e._)`{propertyName: ${c.propertyName}}`
    },
    code(c) {
      const { gen: n, schema: s, data: l, it: a } = c;
      if ((0, t.alwaysValidSchema)(a, s))
        return;
      const u = n.name("valid");
      n.forIn("key", l, (i) => {
        c.setParams({ propertyName: i }), c.subschema({
          keyword: "propertyNames",
          data: i,
          dataTypes: ["string"],
          propertyName: i,
          compositeRule: !0
        }, u), n.if((0, e.not)(u), () => {
          c.error(!0), a.allErrors || n.break();
        });
      }), c.ok(u);
    }
  };
  return Ta.default = r, Ta;
}
var Ra = {}, Nh;
function g0() {
  if (Nh) return Ra;
  Nh = 1, Object.defineProperty(Ra, "__esModule", { value: !0 });
  const e = kt(), t = Ie(), o = dr(), r = Ue(), n = {
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
      const { gen: l, schema: a, parentSchema: u, data: i, errsCount: f, it: d } = s;
      if (!f)
        throw new Error("ajv implementation error");
      const { allErrors: m, opts: g } = d;
      if (d.props = !0, g.removeAdditional !== "all" && (0, r.alwaysValidSchema)(d, a))
        return;
      const v = (0, e.allSchemaProperties)(u.properties), h = (0, e.allSchemaProperties)(u.patternProperties);
      y(), s.ok((0, t._)`${f} === ${o.default.errors}`);
      function y() {
        l.forIn("key", i, (_) => {
          !v.length && !h.length ? $(_) : l.if(p(_), () => $(_));
        });
      }
      function p(_) {
        let w;
        if (v.length > 8) {
          const R = (0, r.schemaRefOrVal)(d, u.properties, "properties");
          w = (0, e.isOwnProperty)(l, R, _);
        } else v.length ? w = (0, t.or)(...v.map((R) => (0, t._)`${_} === ${R}`)) : w = t.nil;
        return h.length && (w = (0, t.or)(w, ...h.map((R) => (0, t._)`${(0, e.usePattern)(s, R)}.test(${_})`))), (0, t.not)(w);
      }
      function E(_) {
        l.code((0, t._)`delete ${i}[${_}]`);
      }
      function $(_) {
        if (g.removeAdditional === "all" || g.removeAdditional && a === !1) {
          E(_);
          return;
        }
        if (a === !1) {
          s.setParams({ additionalProperty: _ }), s.error(), m || l.break();
          return;
        }
        if (typeof a == "object" && !(0, r.alwaysValidSchema)(d, a)) {
          const w = l.name("valid");
          g.removeAdditional === "failing" ? (S(_, w, !1), l.if((0, t.not)(w), () => {
            s.reset(), E(_);
          })) : (S(_, w), m || l.if((0, t.not)(w), () => l.break()));
        }
      }
      function S(_, w, R) {
        const P = {
          keyword: "additionalProperties",
          dataProp: _,
          dataPropType: r.Type.Str
        };
        R === !1 && Object.assign(P, {
          compositeRule: !0,
          createErrors: !1,
          allErrors: !1
        }), s.subschema(P, w);
      }
    }
  };
  return Ra.default = n, Ra;
}
var Pa = {}, Oh;
function _w() {
  if (Oh) return Pa;
  Oh = 1, Object.defineProperty(Pa, "__esModule", { value: !0 });
  const e = ys(), t = kt(), o = Ue(), r = g0(), c = {
    keyword: "properties",
    type: "object",
    schemaType: "object",
    code(n) {
      const { gen: s, schema: l, parentSchema: a, data: u, it: i } = n;
      i.opts.removeAdditional === "all" && a.additionalProperties === void 0 && r.default.code(new e.KeywordCxt(i, r.default, "additionalProperties"));
      const f = (0, t.allSchemaProperties)(l);
      for (const h of f)
        i.definedProperties.add(h);
      i.opts.unevaluated && f.length && i.props !== !0 && (i.props = o.mergeEvaluated.props(s, (0, o.toHash)(f), i.props));
      const d = f.filter((h) => !(0, o.alwaysValidSchema)(i, l[h]));
      if (d.length === 0)
        return;
      const m = s.name("valid");
      for (const h of d)
        g(h) ? v(h) : (s.if((0, t.propertyInData)(s, u, h, i.opts.ownProperties)), v(h), i.allErrors || s.else().var(m, !0), s.endIf()), n.it.definedProperties.add(h), n.ok(m);
      function g(h) {
        return i.opts.useDefaults && !i.compositeRule && l[h].default !== void 0;
      }
      function v(h) {
        n.subschema({
          keyword: "properties",
          schemaProp: h,
          dataProp: h
        }, m);
      }
    }
  };
  return Pa.default = c, Pa;
}
var Na = {}, Ah;
function Ew() {
  if (Ah) return Na;
  Ah = 1, Object.defineProperty(Na, "__esModule", { value: !0 });
  const e = kt(), t = Ie(), o = Ue(), r = Ue(), c = {
    keyword: "patternProperties",
    type: "object",
    schemaType: "object",
    code(n) {
      const { gen: s, schema: l, data: a, parentSchema: u, it: i } = n, { opts: f } = i, d = (0, e.allSchemaProperties)(l), m = d.filter(($) => (0, o.alwaysValidSchema)(i, l[$]));
      if (d.length === 0 || m.length === d.length && (!i.opts.unevaluated || i.props === !0))
        return;
      const g = f.strictSchema && !f.allowMatchingProperties && u.properties, v = s.name("valid");
      i.props !== !0 && !(i.props instanceof t.Name) && (i.props = (0, r.evaluatedPropsToName)(s, i.props));
      const { props: h } = i;
      y();
      function y() {
        for (const $ of d)
          g && p($), i.allErrors ? E($) : (s.var(v, !0), E($), s.if(v));
      }
      function p($) {
        for (const S in g)
          new RegExp($).test(S) && (0, o.checkStrictMode)(i, `property ${S} matches pattern ${$} (use allowMatchingProperties)`);
      }
      function E($) {
        s.forIn("key", a, (S) => {
          s.if((0, t._)`${(0, e.usePattern)(n, $)}.test(${S})`, () => {
            const _ = m.includes($);
            _ || n.subschema({
              keyword: "patternProperties",
              schemaProp: $,
              dataProp: S,
              dataPropType: r.Type.Str
            }, v), i.opts.unevaluated && h !== !0 ? s.assign((0, t._)`${h}[${S}]`, !0) : !_ && !i.allErrors && s.if((0, t.not)(v), () => s.break());
          });
        });
      }
    }
  };
  return Na.default = c, Na;
}
var Oa = {}, Ih;
function ww() {
  if (Ih) return Oa;
  Ih = 1, Object.defineProperty(Oa, "__esModule", { value: !0 });
  const e = Ue(), t = {
    keyword: "not",
    schemaType: ["object", "boolean"],
    trackErrors: !0,
    code(o) {
      const { gen: r, schema: c, it: n } = o;
      if ((0, e.alwaysValidSchema)(n, c)) {
        o.fail();
        return;
      }
      const s = r.name("valid");
      o.subschema({
        keyword: "not",
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }, s), o.failResult(s, () => o.reset(), () => o.error());
    },
    error: { message: "must NOT be valid" }
  };
  return Oa.default = t, Oa;
}
var Aa = {}, Ch;
function Sw() {
  if (Ch) return Aa;
  Ch = 1, Object.defineProperty(Aa, "__esModule", { value: !0 });
  const t = {
    keyword: "anyOf",
    schemaType: "array",
    trackErrors: !0,
    code: kt().validateUnion,
    error: { message: "must match a schema in anyOf" }
  };
  return Aa.default = t, Aa;
}
var Ia = {}, Dh;
function $w() {
  if (Dh) return Ia;
  Dh = 1, Object.defineProperty(Ia, "__esModule", { value: !0 });
  const e = Ie(), t = Ue(), r = {
    keyword: "oneOf",
    schemaType: "array",
    trackErrors: !0,
    error: {
      message: "must match exactly one schema in oneOf",
      params: ({ params: c }) => (0, e._)`{passingSchemas: ${c.passing}}`
    },
    code(c) {
      const { gen: n, schema: s, parentSchema: l, it: a } = c;
      if (!Array.isArray(s))
        throw new Error("ajv implementation error");
      if (a.opts.discriminator && l.discriminator)
        return;
      const u = s, i = n.let("valid", !1), f = n.let("passing", null), d = n.name("_valid");
      c.setParams({ passing: f }), n.block(m), c.result(i, () => c.reset(), () => c.error(!0));
      function m() {
        u.forEach((g, v) => {
          let h;
          (0, t.alwaysValidSchema)(a, g) ? n.var(d, !0) : h = c.subschema({
            keyword: "oneOf",
            schemaProp: v,
            compositeRule: !0
          }, d), v > 0 && n.if((0, e._)`${d} && ${i}`).assign(i, !1).assign(f, (0, e._)`[${f}, ${v}]`).else(), n.if(d, () => {
            n.assign(i, !0), n.assign(f, v), h && c.mergeEvaluated(h, e.Name);
          });
        });
      }
    }
  };
  return Ia.default = r, Ia;
}
var Ca = {}, kh;
function bw() {
  if (kh) return Ca;
  kh = 1, Object.defineProperty(Ca, "__esModule", { value: !0 });
  const e = Ue(), t = {
    keyword: "allOf",
    schemaType: "array",
    code(o) {
      const { gen: r, schema: c, it: n } = o;
      if (!Array.isArray(c))
        throw new Error("ajv implementation error");
      const s = r.name("valid");
      c.forEach((l, a) => {
        if ((0, e.alwaysValidSchema)(n, l))
          return;
        const u = o.subschema({ keyword: "allOf", schemaProp: a }, s);
        o.ok(s), o.mergeEvaluated(u);
      });
    }
  };
  return Ca.default = t, Ca;
}
var Da = {}, Lh;
function Tw() {
  if (Lh) return Da;
  Lh = 1, Object.defineProperty(Da, "__esModule", { value: !0 });
  const e = Ie(), t = Ue(), r = {
    keyword: "if",
    schemaType: ["object", "boolean"],
    trackErrors: !0,
    error: {
      message: ({ params: n }) => (0, e.str)`must match "${n.ifClause}" schema`,
      params: ({ params: n }) => (0, e._)`{failingKeyword: ${n.ifClause}}`
    },
    code(n) {
      const { gen: s, parentSchema: l, it: a } = n;
      l.then === void 0 && l.else === void 0 && (0, t.checkStrictMode)(a, '"if" without "then" and "else" is ignored');
      const u = c(a, "then"), i = c(a, "else");
      if (!u && !i)
        return;
      const f = s.let("valid", !0), d = s.name("_valid");
      if (m(), n.reset(), u && i) {
        const v = s.let("ifClause");
        n.setParams({ ifClause: v }), s.if(d, g("then", v), g("else", v));
      } else u ? s.if(d, g("then")) : s.if((0, e.not)(d), g("else"));
      n.pass(f, () => n.error(!0));
      function m() {
        const v = n.subschema({
          keyword: "if",
          compositeRule: !0,
          createErrors: !1,
          allErrors: !1
        }, d);
        n.mergeEvaluated(v);
      }
      function g(v, h) {
        return () => {
          const y = n.subschema({ keyword: v }, d);
          s.assign(f, d), n.mergeValidEvaluated(y, f), h ? s.assign(h, (0, e._)`${v}`) : n.setParams({ ifClause: v });
        };
      }
    }
  };
  function c(n, s) {
    const l = n.schema[s];
    return l !== void 0 && !(0, t.alwaysValidSchema)(n, l);
  }
  return Da.default = r, Da;
}
var ka = {}, Fh;
function Rw() {
  if (Fh) return ka;
  Fh = 1, Object.defineProperty(ka, "__esModule", { value: !0 });
  const e = Ue(), t = {
    keyword: ["then", "else"],
    schemaType: ["object", "boolean"],
    code({ keyword: o, parentSchema: r, it: c }) {
      r.if === void 0 && (0, e.checkStrictMode)(c, `"${o}" without "if" is ignored`);
    }
  };
  return ka.default = t, ka;
}
var qh;
function Pw() {
  if (qh) return wa;
  qh = 1, Object.defineProperty(wa, "__esModule", { value: !0 });
  const e = m0(), t = pw(), o = y0(), r = mw(), c = yw(), n = gw(), s = vw(), l = g0(), a = _w(), u = Ew(), i = ww(), f = Sw(), d = $w(), m = bw(), g = Tw(), v = Rw();
  function h(y = !1) {
    const p = [
      // any
      i.default,
      f.default,
      d.default,
      m.default,
      g.default,
      v.default,
      // object
      s.default,
      l.default,
      n.default,
      a.default,
      u.default
    ];
    return y ? p.push(t.default, r.default) : p.push(e.default, o.default), p.push(c.default), p;
  }
  return wa.default = h, wa;
}
var La = {}, Fa = {}, Uh;
function Nw() {
  if (Uh) return Fa;
  Uh = 1, Object.defineProperty(Fa, "__esModule", { value: !0 });
  const e = Ie(), o = {
    keyword: "format",
    type: ["number", "string"],
    schemaType: "string",
    $data: !0,
    error: {
      message: ({ schemaCode: r }) => (0, e.str)`must match format "${r}"`,
      params: ({ schemaCode: r }) => (0, e._)`{format: ${r}}`
    },
    code(r, c) {
      const { gen: n, data: s, $data: l, schema: a, schemaCode: u, it: i } = r, { opts: f, errSchemaPath: d, schemaEnv: m, self: g } = i;
      if (!f.validateFormats)
        return;
      l ? v() : h();
      function v() {
        const y = n.scopeValue("formats", {
          ref: g.formats,
          code: f.code.formats
        }), p = n.const("fDef", (0, e._)`${y}[${u}]`), E = n.let("fType"), $ = n.let("format");
        n.if((0, e._)`typeof ${p} == "object" && !(${p} instanceof RegExp)`, () => n.assign(E, (0, e._)`${p}.type || "string"`).assign($, (0, e._)`${p}.validate`), () => n.assign(E, (0, e._)`"string"`).assign($, p)), r.fail$data((0, e.or)(S(), _()));
        function S() {
          return f.strictSchema === !1 ? e.nil : (0, e._)`${u} && !${$}`;
        }
        function _() {
          const w = m.$async ? (0, e._)`(${p}.async ? await ${$}(${s}) : ${$}(${s}))` : (0, e._)`${$}(${s})`, R = (0, e._)`(typeof ${$} == "function" ? ${w} : ${$}.test(${s}))`;
          return (0, e._)`${$} && ${$} !== true && ${E} === ${c} && !${R}`;
        }
      }
      function h() {
        const y = g.formats[a];
        if (!y) {
          S();
          return;
        }
        if (y === !0)
          return;
        const [p, E, $] = _(y);
        p === c && r.pass(w());
        function S() {
          if (f.strictSchema === !1) {
            g.logger.warn(R());
            return;
          }
          throw new Error(R());
          function R() {
            return `unknown format "${a}" ignored in schema at path "${d}"`;
          }
        }
        function _(R) {
          const P = R instanceof RegExp ? (0, e.regexpCode)(R) : f.code.formats ? (0, e._)`${f.code.formats}${(0, e.getProperty)(a)}` : void 0, j = n.scopeValue("formats", { key: a, ref: R, code: P });
          return typeof R == "object" && !(R instanceof RegExp) ? [R.type || "string", R.validate, (0, e._)`${j}.validate`] : ["string", R, j];
        }
        function w() {
          if (typeof y == "object" && !(y instanceof RegExp) && y.async) {
            if (!m.$async)
              throw new Error("async format in sync schema");
            return (0, e._)`await ${$}(${s})`;
          }
          return typeof E == "function" ? (0, e._)`${$}(${s})` : (0, e._)`${$}.test(${s})`;
        }
      }
    }
  };
  return Fa.default = o, Fa;
}
var jh;
function Ow() {
  if (jh) return La;
  jh = 1, Object.defineProperty(La, "__esModule", { value: !0 });
  const t = [Nw().default];
  return La.default = t, La;
}
var Tr = {}, Mh;
function Aw() {
  return Mh || (Mh = 1, Object.defineProperty(Tr, "__esModule", { value: !0 }), Tr.contentVocabulary = Tr.metadataVocabulary = void 0, Tr.metadataVocabulary = [
    "title",
    "description",
    "default",
    "deprecated",
    "readOnly",
    "writeOnly",
    "examples"
  ], Tr.contentVocabulary = [
    "contentMediaType",
    "contentEncoding",
    "contentSchema"
  ]), Tr;
}
var xh;
function Iw() {
  if (xh) return aa;
  xh = 1, Object.defineProperty(aa, "__esModule", { value: !0 });
  const e = tw(), t = hw(), o = Pw(), r = Ow(), c = Aw(), n = [
    e.default,
    t.default,
    (0, o.default)(),
    r.default,
    c.metadataVocabulary,
    c.contentVocabulary
  ];
  return aa.default = n, aa;
}
var qa = {}, dn = {}, Vh;
function Cw() {
  if (Vh) return dn;
  Vh = 1, Object.defineProperty(dn, "__esModule", { value: !0 }), dn.DiscrError = void 0;
  var e;
  return (function(t) {
    t.Tag = "tag", t.Mapping = "mapping";
  })(e || (dn.DiscrError = e = {})), dn;
}
var Gh;
function Dw() {
  if (Gh) return qa;
  Gh = 1, Object.defineProperty(qa, "__esModule", { value: !0 });
  const e = Ie(), t = Cw(), o = ll(), r = gs(), c = Ue(), s = {
    keyword: "discriminator",
    type: "object",
    schemaType: "object",
    error: {
      message: ({ params: { discrError: l, tagName: a } }) => l === t.DiscrError.Tag ? `tag "${a}" must be string` : `value of tag "${a}" must be in oneOf`,
      params: ({ params: { discrError: l, tag: a, tagName: u } }) => (0, e._)`{error: ${l}, tag: ${u}, tagValue: ${a}}`
    },
    code(l) {
      const { gen: a, data: u, schema: i, parentSchema: f, it: d } = l, { oneOf: m } = f;
      if (!d.opts.discriminator)
        throw new Error("discriminator: requires discriminator option");
      const g = i.propertyName;
      if (typeof g != "string")
        throw new Error("discriminator: requires propertyName");
      if (i.mapping)
        throw new Error("discriminator: mapping is not supported");
      if (!m)
        throw new Error("discriminator: requires oneOf keyword");
      const v = a.let("valid", !1), h = a.const("tag", (0, e._)`${u}${(0, e.getProperty)(g)}`);
      a.if((0, e._)`typeof ${h} == "string"`, () => y(), () => l.error(!1, { discrError: t.DiscrError.Tag, tag: h, tagName: g })), l.ok(v);
      function y() {
        const $ = E();
        a.if(!1);
        for (const S in $)
          a.elseIf((0, e._)`${h} === ${S}`), a.assign(v, p($[S]));
        a.else(), l.error(!1, { discrError: t.DiscrError.Mapping, tag: h, tagName: g }), a.endIf();
      }
      function p($) {
        const S = a.name("valid"), _ = l.subschema({ keyword: "oneOf", schemaProp: $ }, S);
        return l.mergeEvaluated(_, e.Name), S;
      }
      function E() {
        var $;
        const S = {}, _ = R(f);
        let w = !0;
        for (let M = 0; M < m.length; M++) {
          let B = m[M];
          if (B?.$ref && !(0, c.schemaHasRulesButRef)(B, d.self.RULES)) {
            const F = B.$ref;
            if (B = o.resolveRef.call(d.self, d.schemaEnv.root, d.baseId, F), B instanceof o.SchemaEnv && (B = B.schema), B === void 0)
              throw new r.default(d.opts.uriResolver, d.baseId, F);
          }
          const W = ($ = B?.properties) === null || $ === void 0 ? void 0 : $[g];
          if (typeof W != "object")
            throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${g}"`);
          w = w && (_ || R(B)), P(W, M);
        }
        if (!w)
          throw new Error(`discriminator: "${g}" must be required`);
        return S;
        function R({ required: M }) {
          return Array.isArray(M) && M.includes(g);
        }
        function P(M, B) {
          if (M.const)
            j(M.const, B);
          else if (M.enum)
            for (const W of M.enum)
              j(W, B);
          else
            throw new Error(`discriminator: "properties/${g}" must have "const" or "enum"`);
        }
        function j(M, B) {
          if (typeof M != "string" || M in S)
            throw new Error(`discriminator: "${g}" values must be unique strings`);
          S[M] = B;
        }
      }
    }
  };
  return qa.default = s, qa;
}
const kw = "http://json-schema.org/draft-07/schema#", Lw = "http://json-schema.org/draft-07/schema#", Fw = "Core schema meta-schema", qw = { schemaArray: { type: "array", minItems: 1, items: { $ref: "#" } }, nonNegativeInteger: { type: "integer", minimum: 0 }, nonNegativeIntegerDefault0: { allOf: [{ $ref: "#/definitions/nonNegativeInteger" }, { default: 0 }] }, simpleTypes: { enum: ["array", "boolean", "integer", "null", "number", "object", "string"] }, stringArray: { type: "array", items: { type: "string" }, uniqueItems: !0, default: [] } }, Uw = ["object", "boolean"], jw = { $id: { type: "string", format: "uri-reference" }, $schema: { type: "string", format: "uri" }, $ref: { type: "string", format: "uri-reference" }, $comment: { type: "string" }, title: { type: "string" }, description: { type: "string" }, default: !0, readOnly: { type: "boolean", default: !1 }, examples: { type: "array", items: !0 }, multipleOf: { type: "number", exclusiveMinimum: 0 }, maximum: { type: "number" }, exclusiveMaximum: { type: "number" }, minimum: { type: "number" }, exclusiveMinimum: { type: "number" }, maxLength: { $ref: "#/definitions/nonNegativeInteger" }, minLength: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, pattern: { type: "string", format: "regex" }, additionalItems: { $ref: "#" }, items: { anyOf: [{ $ref: "#" }, { $ref: "#/definitions/schemaArray" }], default: !0 }, maxItems: { $ref: "#/definitions/nonNegativeInteger" }, minItems: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, uniqueItems: { type: "boolean", default: !1 }, contains: { $ref: "#" }, maxProperties: { $ref: "#/definitions/nonNegativeInteger" }, minProperties: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, required: { $ref: "#/definitions/stringArray" }, additionalProperties: { $ref: "#" }, definitions: { type: "object", additionalProperties: { $ref: "#" }, default: {} }, properties: { type: "object", additionalProperties: { $ref: "#" }, default: {} }, patternProperties: { type: "object", additionalProperties: { $ref: "#" }, propertyNames: { format: "regex" }, default: {} }, dependencies: { type: "object", additionalProperties: { anyOf: [{ $ref: "#" }, { $ref: "#/definitions/stringArray" }] } }, propertyNames: { $ref: "#" }, const: !0, enum: { type: "array", items: !0, minItems: 1, uniqueItems: !0 }, type: { anyOf: [{ $ref: "#/definitions/simpleTypes" }, { type: "array", items: { $ref: "#/definitions/simpleTypes" }, minItems: 1, uniqueItems: !0 }] }, format: { type: "string" }, contentMediaType: { type: "string" }, contentEncoding: { type: "string" }, if: { $ref: "#" }, then: { $ref: "#" }, else: { $ref: "#" }, allOf: { $ref: "#/definitions/schemaArray" }, anyOf: { $ref: "#/definitions/schemaArray" }, oneOf: { $ref: "#/definitions/schemaArray" }, not: { $ref: "#" } }, Mw = {
  $schema: kw,
  $id: Lw,
  title: Fw,
  definitions: qw,
  type: Uw,
  properties: jw,
  default: !0
};
var Hh;
function xw() {
  return Hh || (Hh = 1, (function(e, t) {
    Object.defineProperty(t, "__esModule", { value: !0 }), t.MissingRefError = t.ValidationError = t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = t.Ajv = void 0;
    const o = QE(), r = Iw(), c = Dw(), n = Mw, s = ["/properties"], l = "http://json-schema.org/draft-07/schema";
    class a extends o.default {
      _addVocabularies() {
        super._addVocabularies(), r.default.forEach((g) => this.addVocabulary(g)), this.opts.discriminator && this.addKeyword(c.default);
      }
      _addDefaultMetaSchema() {
        if (super._addDefaultMetaSchema(), !this.opts.meta)
          return;
        const g = this.opts.$data ? this.$dataMetaSchema(n, s) : n;
        this.addMetaSchema(g, l, !1), this.refs["http://json-schema.org/schema"] = l;
      }
      defaultMeta() {
        return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(l) ? l : void 0);
      }
    }
    t.Ajv = a, e.exports = t = a, e.exports.Ajv = a, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = a;
    var u = ys();
    Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
      return u.KeywordCxt;
    } });
    var i = Ie();
    Object.defineProperty(t, "_", { enumerable: !0, get: function() {
      return i._;
    } }), Object.defineProperty(t, "str", { enumerable: !0, get: function() {
      return i.str;
    } }), Object.defineProperty(t, "stringify", { enumerable: !0, get: function() {
      return i.stringify;
    } }), Object.defineProperty(t, "nil", { enumerable: !0, get: function() {
      return i.nil;
    } }), Object.defineProperty(t, "Name", { enumerable: !0, get: function() {
      return i.Name;
    } }), Object.defineProperty(t, "CodeGen", { enumerable: !0, get: function() {
      return i.CodeGen;
    } });
    var f = cl();
    Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
      return f.default;
    } });
    var d = gs();
    Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
      return d.default;
    } });
  })(ea, ea.exports)), ea.exports;
}
var Bh;
function Vw() {
  return Bh || (Bh = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.formatLimitDefinition = void 0;
    const t = xw(), o = Ie(), r = o.operators, c = {
      formatMaximum: { okStr: "<=", ok: r.LTE, fail: r.GT },
      formatMinimum: { okStr: ">=", ok: r.GTE, fail: r.LT },
      formatExclusiveMaximum: { okStr: "<", ok: r.LT, fail: r.GTE },
      formatExclusiveMinimum: { okStr: ">", ok: r.GT, fail: r.LTE }
    }, n = {
      message: ({ keyword: l, schemaCode: a }) => o.str`should be ${c[l].okStr} ${a}`,
      params: ({ keyword: l, schemaCode: a }) => o._`{comparison: ${c[l].okStr}, limit: ${a}}`
    };
    e.formatLimitDefinition = {
      keyword: Object.keys(c),
      type: "string",
      schemaType: "string",
      $data: !0,
      error: n,
      code(l) {
        const { gen: a, data: u, schemaCode: i, keyword: f, it: d } = l, { opts: m, self: g } = d;
        if (!m.validateFormats)
          return;
        const v = new t.KeywordCxt(d, g.RULES.all.format.definition, "format");
        v.$data ? h() : y();
        function h() {
          const E = a.scopeValue("formats", {
            ref: g.formats,
            code: m.code.formats
          }), $ = a.const("fmt", o._`${E}[${v.schemaCode}]`);
          l.fail$data(o.or(o._`typeof ${$} != "object"`, o._`${$} instanceof RegExp`, o._`typeof ${$}.compare != "function"`, p($)));
        }
        function y() {
          const E = v.schema, $ = g.formats[E];
          if (!$ || $ === !0)
            return;
          if (typeof $ != "object" || $ instanceof RegExp || typeof $.compare != "function")
            throw new Error(`"${f}": format "${E}" does not define "compare" function`);
          const S = a.scopeValue("formats", {
            key: E,
            ref: $,
            code: m.code.formats ? o._`${m.code.formats}${o.getProperty(E)}` : void 0
          });
          l.fail$data(p(S));
        }
        function p(E) {
          return o._`${E}.compare(${u}, ${i}) ${c[f].fail} 0`;
        }
      },
      dependencies: ["format"]
    };
    const s = (l) => (l.addKeyword(e.formatLimitDefinition), l);
    e.default = s;
  })(Xs)), Xs;
}
var zh;
function Gw() {
  return zh || (zh = 1, (function(e, t) {
    Object.defineProperty(t, "__esModule", { value: !0 });
    const o = UE(), r = Vw(), c = Ie(), n = new c.Name("fullFormats"), s = new c.Name("fastFormats"), l = (u, i = { keywords: !0 }) => {
      if (Array.isArray(i))
        return a(u, i, o.fullFormats, n), u;
      const [f, d] = i.mode === "fast" ? [o.fastFormats, s] : [o.fullFormats, n], m = i.formats || o.formatNames;
      return a(u, m, f, d), i.keywords && r.default(u), u;
    };
    l.get = (u, i = "full") => {
      const d = (i === "fast" ? o.fastFormats : o.fullFormats)[u];
      if (!d)
        throw new Error(`Unknown format "${u}"`);
      return d;
    };
    function a(u, i, f, d) {
      var m, g;
      (m = (g = u.opts.code).formats) !== null && m !== void 0 || (g.formats = c._`require("ajv-formats/dist/formats").${d}`);
      for (const v of i)
        u.addFormat(v, f[v]);
    }
    e.exports = t = l, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = l;
  })(Zi, Zi.exports)), Zi.exports;
}
var ro, Kh;
function Hw() {
  if (Kh) return ro;
  Kh = 1;
  const e = (a, u, i, f) => {
    if (i === "length" || i === "prototype" || i === "arguments" || i === "caller")
      return;
    const d = Object.getOwnPropertyDescriptor(a, i), m = Object.getOwnPropertyDescriptor(u, i);
    !t(d, m) && f || Object.defineProperty(a, i, m);
  }, t = function(a, u) {
    return a === void 0 || a.configurable || a.writable === u.writable && a.enumerable === u.enumerable && a.configurable === u.configurable && (a.writable || a.value === u.value);
  }, o = (a, u) => {
    const i = Object.getPrototypeOf(u);
    i !== Object.getPrototypeOf(a) && Object.setPrototypeOf(a, i);
  }, r = (a, u) => `/* Wrapped ${a}*/
${u}`, c = Object.getOwnPropertyDescriptor(Function.prototype, "toString"), n = Object.getOwnPropertyDescriptor(Function.prototype.toString, "name"), s = (a, u, i) => {
    const f = i === "" ? "" : `with ${i.trim()}() `, d = r.bind(null, f, u.toString());
    Object.defineProperty(d, "name", n), Object.defineProperty(a, "toString", { ...c, value: d });
  };
  return ro = (a, u, { ignoreNonConfigurable: i = !1 } = {}) => {
    const { name: f } = a;
    for (const d of Reflect.ownKeys(u))
      e(a, u, d, i);
    return o(a, u), s(a, u, f), a;
  }, ro;
}
var no, Xh;
function Bw() {
  if (Xh) return no;
  Xh = 1;
  const e = Hw();
  return no = (t, o = {}) => {
    if (typeof t != "function")
      throw new TypeError(`Expected the first argument to be a function, got \`${typeof t}\``);
    const {
      wait: r = 0,
      before: c = !1,
      after: n = !0
    } = o;
    if (!c && !n)
      throw new Error("Both `before` and `after` are false, function wouldn't be called.");
    let s, l;
    const a = function(...u) {
      const i = this, f = () => {
        s = void 0, n && (l = t.apply(i, u));
      }, d = c && !s;
      return clearTimeout(s), s = setTimeout(f, r), d && (l = t.apply(i, u)), l;
    };
    return e(a, t), a.cancel = () => {
      s && (clearTimeout(s), s = void 0);
    }, a;
  }, no;
}
var Ua = { exports: {} }, io, Wh;
function vs() {
  if (Wh) return io;
  Wh = 1;
  const e = "2.0.0", t = 256, o = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
  9007199254740991, r = 16, c = t - 6;
  return io = {
    MAX_LENGTH: t,
    MAX_SAFE_COMPONENT_LENGTH: r,
    MAX_SAFE_BUILD_LENGTH: c,
    MAX_SAFE_INTEGER: o,
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
  }, io;
}
var ao, Yh;
function _s() {
  return Yh || (Yh = 1, ao = typeof process == "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...t) => console.error("SEMVER", ...t) : () => {
  }), ao;
}
var Jh;
function zn() {
  return Jh || (Jh = 1, (function(e, t) {
    const {
      MAX_SAFE_COMPONENT_LENGTH: o,
      MAX_SAFE_BUILD_LENGTH: r,
      MAX_LENGTH: c
    } = vs(), n = _s();
    t = e.exports = {};
    const s = t.re = [], l = t.safeRe = [], a = t.src = [], u = t.safeSrc = [], i = t.t = {};
    let f = 0;
    const d = "[a-zA-Z0-9-]", m = [
      ["\\s", 1],
      ["\\d", c],
      [d, r]
    ], g = (h) => {
      for (const [y, p] of m)
        h = h.split(`${y}*`).join(`${y}{0,${p}}`).split(`${y}+`).join(`${y}{1,${p}}`);
      return h;
    }, v = (h, y, p) => {
      const E = g(y), $ = f++;
      n(h, $, y), i[h] = $, a[$] = y, u[$] = E, s[$] = new RegExp(y, p ? "g" : void 0), l[$] = new RegExp(E, p ? "g" : void 0);
    };
    v("NUMERICIDENTIFIER", "0|[1-9]\\d*"), v("NUMERICIDENTIFIERLOOSE", "\\d+"), v("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${d}*`), v("MAINVERSION", `(${a[i.NUMERICIDENTIFIER]})\\.(${a[i.NUMERICIDENTIFIER]})\\.(${a[i.NUMERICIDENTIFIER]})`), v("MAINVERSIONLOOSE", `(${a[i.NUMERICIDENTIFIERLOOSE]})\\.(${a[i.NUMERICIDENTIFIERLOOSE]})\\.(${a[i.NUMERICIDENTIFIERLOOSE]})`), v("PRERELEASEIDENTIFIER", `(?:${a[i.NONNUMERICIDENTIFIER]}|${a[i.NUMERICIDENTIFIER]})`), v("PRERELEASEIDENTIFIERLOOSE", `(?:${a[i.NONNUMERICIDENTIFIER]}|${a[i.NUMERICIDENTIFIERLOOSE]})`), v("PRERELEASE", `(?:-(${a[i.PRERELEASEIDENTIFIER]}(?:\\.${a[i.PRERELEASEIDENTIFIER]})*))`), v("PRERELEASELOOSE", `(?:-?(${a[i.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${a[i.PRERELEASEIDENTIFIERLOOSE]})*))`), v("BUILDIDENTIFIER", `${d}+`), v("BUILD", `(?:\\+(${a[i.BUILDIDENTIFIER]}(?:\\.${a[i.BUILDIDENTIFIER]})*))`), v("FULLPLAIN", `v?${a[i.MAINVERSION]}${a[i.PRERELEASE]}?${a[i.BUILD]}?`), v("FULL", `^${a[i.FULLPLAIN]}$`), v("LOOSEPLAIN", `[v=\\s]*${a[i.MAINVERSIONLOOSE]}${a[i.PRERELEASELOOSE]}?${a[i.BUILD]}?`), v("LOOSE", `^${a[i.LOOSEPLAIN]}$`), v("GTLT", "((?:<|>)?=?)"), v("XRANGEIDENTIFIERLOOSE", `${a[i.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`), v("XRANGEIDENTIFIER", `${a[i.NUMERICIDENTIFIER]}|x|X|\\*`), v("XRANGEPLAIN", `[v=\\s]*(${a[i.XRANGEIDENTIFIER]})(?:\\.(${a[i.XRANGEIDENTIFIER]})(?:\\.(${a[i.XRANGEIDENTIFIER]})(?:${a[i.PRERELEASE]})?${a[i.BUILD]}?)?)?`), v("XRANGEPLAINLOOSE", `[v=\\s]*(${a[i.XRANGEIDENTIFIERLOOSE]})(?:\\.(${a[i.XRANGEIDENTIFIERLOOSE]})(?:\\.(${a[i.XRANGEIDENTIFIERLOOSE]})(?:${a[i.PRERELEASELOOSE]})?${a[i.BUILD]}?)?)?`), v("XRANGE", `^${a[i.GTLT]}\\s*${a[i.XRANGEPLAIN]}$`), v("XRANGELOOSE", `^${a[i.GTLT]}\\s*${a[i.XRANGEPLAINLOOSE]}$`), v("COERCEPLAIN", `(^|[^\\d])(\\d{1,${o}})(?:\\.(\\d{1,${o}}))?(?:\\.(\\d{1,${o}}))?`), v("COERCE", `${a[i.COERCEPLAIN]}(?:$|[^\\d])`), v("COERCEFULL", a[i.COERCEPLAIN] + `(?:${a[i.PRERELEASE]})?(?:${a[i.BUILD]})?(?:$|[^\\d])`), v("COERCERTL", a[i.COERCE], !0), v("COERCERTLFULL", a[i.COERCEFULL], !0), v("LONETILDE", "(?:~>?)"), v("TILDETRIM", `(\\s*)${a[i.LONETILDE]}\\s+`, !0), t.tildeTrimReplace = "$1~", v("TILDE", `^${a[i.LONETILDE]}${a[i.XRANGEPLAIN]}$`), v("TILDELOOSE", `^${a[i.LONETILDE]}${a[i.XRANGEPLAINLOOSE]}$`), v("LONECARET", "(?:\\^)"), v("CARETTRIM", `(\\s*)${a[i.LONECARET]}\\s+`, !0), t.caretTrimReplace = "$1^", v("CARET", `^${a[i.LONECARET]}${a[i.XRANGEPLAIN]}$`), v("CARETLOOSE", `^${a[i.LONECARET]}${a[i.XRANGEPLAINLOOSE]}$`), v("COMPARATORLOOSE", `^${a[i.GTLT]}\\s*(${a[i.LOOSEPLAIN]})$|^$`), v("COMPARATOR", `^${a[i.GTLT]}\\s*(${a[i.FULLPLAIN]})$|^$`), v("COMPARATORTRIM", `(\\s*)${a[i.GTLT]}\\s*(${a[i.LOOSEPLAIN]}|${a[i.XRANGEPLAIN]})`, !0), t.comparatorTrimReplace = "$1$2$3", v("HYPHENRANGE", `^\\s*(${a[i.XRANGEPLAIN]})\\s+-\\s+(${a[i.XRANGEPLAIN]})\\s*$`), v("HYPHENRANGELOOSE", `^\\s*(${a[i.XRANGEPLAINLOOSE]})\\s+-\\s+(${a[i.XRANGEPLAINLOOSE]})\\s*$`), v("STAR", "(<|>)?=?\\s*\\*"), v("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"), v("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
  })(Ua, Ua.exports)), Ua.exports;
}
var so, Qh;
function fl() {
  if (Qh) return so;
  Qh = 1;
  const e = Object.freeze({ loose: !0 }), t = Object.freeze({});
  return so = (r) => r ? typeof r != "object" ? e : r : t, so;
}
var oo, Zh;
function v0() {
  if (Zh) return oo;
  Zh = 1;
  const e = /^[0-9]+$/, t = (r, c) => {
    if (typeof r == "number" && typeof c == "number")
      return r === c ? 0 : r < c ? -1 : 1;
    const n = e.test(r), s = e.test(c);
    return n && s && (r = +r, c = +c), r === c ? 0 : n && !s ? -1 : s && !n ? 1 : r < c ? -1 : 1;
  };
  return oo = {
    compareIdentifiers: t,
    rcompareIdentifiers: (r, c) => t(c, r)
  }, oo;
}
var uo, ep;
function ct() {
  if (ep) return uo;
  ep = 1;
  const e = _s(), { MAX_LENGTH: t, MAX_SAFE_INTEGER: o } = vs(), { safeRe: r, t: c } = zn(), n = fl(), { compareIdentifiers: s } = v0();
  class l {
    constructor(u, i) {
      if (i = n(i), u instanceof l) {
        if (u.loose === !!i.loose && u.includePrerelease === !!i.includePrerelease)
          return u;
        u = u.version;
      } else if (typeof u != "string")
        throw new TypeError(`Invalid version. Must be a string. Got type "${typeof u}".`);
      if (u.length > t)
        throw new TypeError(
          `version is longer than ${t} characters`
        );
      e("SemVer", u, i), this.options = i, this.loose = !!i.loose, this.includePrerelease = !!i.includePrerelease;
      const f = u.trim().match(i.loose ? r[c.LOOSE] : r[c.FULL]);
      if (!f)
        throw new TypeError(`Invalid Version: ${u}`);
      if (this.raw = u, this.major = +f[1], this.minor = +f[2], this.patch = +f[3], this.major > o || this.major < 0)
        throw new TypeError("Invalid major version");
      if (this.minor > o || this.minor < 0)
        throw new TypeError("Invalid minor version");
      if (this.patch > o || this.patch < 0)
        throw new TypeError("Invalid patch version");
      f[4] ? this.prerelease = f[4].split(".").map((d) => {
        if (/^[0-9]+$/.test(d)) {
          const m = +d;
          if (m >= 0 && m < o)
            return m;
        }
        return d;
      }) : this.prerelease = [], this.build = f[5] ? f[5].split(".") : [], this.format();
    }
    format() {
      return this.version = `${this.major}.${this.minor}.${this.patch}`, this.prerelease.length && (this.version += `-${this.prerelease.join(".")}`), this.version;
    }
    toString() {
      return this.version;
    }
    compare(u) {
      if (e("SemVer.compare", this.version, this.options, u), !(u instanceof l)) {
        if (typeof u == "string" && u === this.version)
          return 0;
        u = new l(u, this.options);
      }
      return u.version === this.version ? 0 : this.compareMain(u) || this.comparePre(u);
    }
    compareMain(u) {
      return u instanceof l || (u = new l(u, this.options)), this.major < u.major ? -1 : this.major > u.major ? 1 : this.minor < u.minor ? -1 : this.minor > u.minor ? 1 : this.patch < u.patch ? -1 : this.patch > u.patch ? 1 : 0;
    }
    comparePre(u) {
      if (u instanceof l || (u = new l(u, this.options)), this.prerelease.length && !u.prerelease.length)
        return -1;
      if (!this.prerelease.length && u.prerelease.length)
        return 1;
      if (!this.prerelease.length && !u.prerelease.length)
        return 0;
      let i = 0;
      do {
        const f = this.prerelease[i], d = u.prerelease[i];
        if (e("prerelease compare", i, f, d), f === void 0 && d === void 0)
          return 0;
        if (d === void 0)
          return 1;
        if (f === void 0)
          return -1;
        if (f === d)
          continue;
        return s(f, d);
      } while (++i);
    }
    compareBuild(u) {
      u instanceof l || (u = new l(u, this.options));
      let i = 0;
      do {
        const f = this.build[i], d = u.build[i];
        if (e("build compare", i, f, d), f === void 0 && d === void 0)
          return 0;
        if (d === void 0)
          return 1;
        if (f === void 0)
          return -1;
        if (f === d)
          continue;
        return s(f, d);
      } while (++i);
    }
    // preminor will bump the version up to the next minor release, and immediately
    // down to pre-release. premajor and prepatch work the same way.
    inc(u, i, f) {
      if (u.startsWith("pre")) {
        if (!i && f === !1)
          throw new Error("invalid increment argument: identifier is empty");
        if (i) {
          const d = `-${i}`.match(this.options.loose ? r[c.PRERELEASELOOSE] : r[c.PRERELEASE]);
          if (!d || d[1] !== i)
            throw new Error(`invalid identifier: ${i}`);
        }
      }
      switch (u) {
        case "premajor":
          this.prerelease.length = 0, this.patch = 0, this.minor = 0, this.major++, this.inc("pre", i, f);
          break;
        case "preminor":
          this.prerelease.length = 0, this.patch = 0, this.minor++, this.inc("pre", i, f);
          break;
        case "prepatch":
          this.prerelease.length = 0, this.inc("patch", i, f), this.inc("pre", i, f);
          break;
        // If the input is a non-prerelease version, this acts the same as
        // prepatch.
        case "prerelease":
          this.prerelease.length === 0 && this.inc("patch", i, f), this.inc("pre", i, f);
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
          const d = Number(f) ? 1 : 0;
          if (this.prerelease.length === 0)
            this.prerelease = [d];
          else {
            let m = this.prerelease.length;
            for (; --m >= 0; )
              typeof this.prerelease[m] == "number" && (this.prerelease[m]++, m = -2);
            if (m === -1) {
              if (i === this.prerelease.join(".") && f === !1)
                throw new Error("invalid increment argument: identifier already exists");
              this.prerelease.push(d);
            }
          }
          if (i) {
            let m = [i, d];
            f === !1 && (m = [i]), s(this.prerelease[0], i) === 0 ? isNaN(this.prerelease[1]) && (this.prerelease = m) : this.prerelease = m;
          }
          break;
        }
        default:
          throw new Error(`invalid increment argument: ${u}`);
      }
      return this.raw = this.format(), this.build.length && (this.raw += `+${this.build.join(".")}`), this;
    }
  }
  return uo = l, uo;
}
var co, tp;
function Qr() {
  if (tp) return co;
  tp = 1;
  const e = ct();
  return co = (o, r, c = !1) => {
    if (o instanceof e)
      return o;
    try {
      return new e(o, r);
    } catch (n) {
      if (!c)
        return null;
      throw n;
    }
  }, co;
}
var lo, rp;
function zw() {
  if (rp) return lo;
  rp = 1;
  const e = Qr();
  return lo = (o, r) => {
    const c = e(o, r);
    return c ? c.version : null;
  }, lo;
}
var fo, np;
function Kw() {
  if (np) return fo;
  np = 1;
  const e = Qr();
  return fo = (o, r) => {
    const c = e(o.trim().replace(/^[=v]+/, ""), r);
    return c ? c.version : null;
  }, fo;
}
var ho, ip;
function Xw() {
  if (ip) return ho;
  ip = 1;
  const e = ct();
  return ho = (o, r, c, n, s) => {
    typeof c == "string" && (s = n, n = c, c = void 0);
    try {
      return new e(
        o instanceof e ? o.version : o,
        c
      ).inc(r, n, s).version;
    } catch {
      return null;
    }
  }, ho;
}
var po, ap;
function Ww() {
  if (ap) return po;
  ap = 1;
  const e = Qr();
  return po = (o, r) => {
    const c = e(o, null, !0), n = e(r, null, !0), s = c.compare(n);
    if (s === 0)
      return null;
    const l = s > 0, a = l ? c : n, u = l ? n : c, i = !!a.prerelease.length;
    if (!!u.prerelease.length && !i) {
      if (!u.patch && !u.minor)
        return "major";
      if (u.compareMain(a) === 0)
        return u.minor && !u.patch ? "minor" : "patch";
    }
    const d = i ? "pre" : "";
    return c.major !== n.major ? d + "major" : c.minor !== n.minor ? d + "minor" : c.patch !== n.patch ? d + "patch" : "prerelease";
  }, po;
}
var mo, sp;
function Yw() {
  if (sp) return mo;
  sp = 1;
  const e = ct();
  return mo = (o, r) => new e(o, r).major, mo;
}
var yo, op;
function Jw() {
  if (op) return yo;
  op = 1;
  const e = ct();
  return yo = (o, r) => new e(o, r).minor, yo;
}
var go, up;
function Qw() {
  if (up) return go;
  up = 1;
  const e = ct();
  return go = (o, r) => new e(o, r).patch, go;
}
var vo, cp;
function Zw() {
  if (cp) return vo;
  cp = 1;
  const e = Qr();
  return vo = (o, r) => {
    const c = e(o, r);
    return c && c.prerelease.length ? c.prerelease : null;
  }, vo;
}
var _o, lp;
function Lt() {
  if (lp) return _o;
  lp = 1;
  const e = ct();
  return _o = (o, r, c) => new e(o, c).compare(new e(r, c)), _o;
}
var Eo, dp;
function eS() {
  if (dp) return Eo;
  dp = 1;
  const e = Lt();
  return Eo = (o, r, c) => e(r, o, c), Eo;
}
var wo, fp;
function tS() {
  if (fp) return wo;
  fp = 1;
  const e = Lt();
  return wo = (o, r) => e(o, r, !0), wo;
}
var So, hp;
function hl() {
  if (hp) return So;
  hp = 1;
  const e = ct();
  return So = (o, r, c) => {
    const n = new e(o, c), s = new e(r, c);
    return n.compare(s) || n.compareBuild(s);
  }, So;
}
var $o, pp;
function rS() {
  if (pp) return $o;
  pp = 1;
  const e = hl();
  return $o = (o, r) => o.sort((c, n) => e(c, n, r)), $o;
}
var bo, mp;
function nS() {
  if (mp) return bo;
  mp = 1;
  const e = hl();
  return bo = (o, r) => o.sort((c, n) => e(n, c, r)), bo;
}
var To, yp;
function Es() {
  if (yp) return To;
  yp = 1;
  const e = Lt();
  return To = (o, r, c) => e(o, r, c) > 0, To;
}
var Ro, gp;
function pl() {
  if (gp) return Ro;
  gp = 1;
  const e = Lt();
  return Ro = (o, r, c) => e(o, r, c) < 0, Ro;
}
var Po, vp;
function _0() {
  if (vp) return Po;
  vp = 1;
  const e = Lt();
  return Po = (o, r, c) => e(o, r, c) === 0, Po;
}
var No, _p;
function E0() {
  if (_p) return No;
  _p = 1;
  const e = Lt();
  return No = (o, r, c) => e(o, r, c) !== 0, No;
}
var Oo, Ep;
function ml() {
  if (Ep) return Oo;
  Ep = 1;
  const e = Lt();
  return Oo = (o, r, c) => e(o, r, c) >= 0, Oo;
}
var Ao, wp;
function yl() {
  if (wp) return Ao;
  wp = 1;
  const e = Lt();
  return Ao = (o, r, c) => e(o, r, c) <= 0, Ao;
}
var Io, Sp;
function w0() {
  if (Sp) return Io;
  Sp = 1;
  const e = _0(), t = E0(), o = Es(), r = ml(), c = pl(), n = yl();
  return Io = (l, a, u, i) => {
    switch (a) {
      case "===":
        return typeof l == "object" && (l = l.version), typeof u == "object" && (u = u.version), l === u;
      case "!==":
        return typeof l == "object" && (l = l.version), typeof u == "object" && (u = u.version), l !== u;
      case "":
      case "=":
      case "==":
        return e(l, u, i);
      case "!=":
        return t(l, u, i);
      case ">":
        return o(l, u, i);
      case ">=":
        return r(l, u, i);
      case "<":
        return c(l, u, i);
      case "<=":
        return n(l, u, i);
      default:
        throw new TypeError(`Invalid operator: ${a}`);
    }
  }, Io;
}
var Co, $p;
function iS() {
  if ($p) return Co;
  $p = 1;
  const e = ct(), t = Qr(), { safeRe: o, t: r } = zn();
  return Co = (n, s) => {
    if (n instanceof e)
      return n;
    if (typeof n == "number" && (n = String(n)), typeof n != "string")
      return null;
    s = s || {};
    let l = null;
    if (!s.rtl)
      l = n.match(s.includePrerelease ? o[r.COERCEFULL] : o[r.COERCE]);
    else {
      const m = s.includePrerelease ? o[r.COERCERTLFULL] : o[r.COERCERTL];
      let g;
      for (; (g = m.exec(n)) && (!l || l.index + l[0].length !== n.length); )
        (!l || g.index + g[0].length !== l.index + l[0].length) && (l = g), m.lastIndex = g.index + g[1].length + g[2].length;
      m.lastIndex = -1;
    }
    if (l === null)
      return null;
    const a = l[2], u = l[3] || "0", i = l[4] || "0", f = s.includePrerelease && l[5] ? `-${l[5]}` : "", d = s.includePrerelease && l[6] ? `+${l[6]}` : "";
    return t(`${a}.${u}.${i}${f}${d}`, s);
  }, Co;
}
var Do, bp;
function aS() {
  if (bp) return Do;
  bp = 1;
  class e {
    constructor() {
      this.max = 1e3, this.map = /* @__PURE__ */ new Map();
    }
    get(o) {
      const r = this.map.get(o);
      if (r !== void 0)
        return this.map.delete(o), this.map.set(o, r), r;
    }
    delete(o) {
      return this.map.delete(o);
    }
    set(o, r) {
      if (!this.delete(o) && r !== void 0) {
        if (this.map.size >= this.max) {
          const n = this.map.keys().next().value;
          this.delete(n);
        }
        this.map.set(o, r);
      }
      return this;
    }
  }
  return Do = e, Do;
}
var ko, Tp;
function Ft() {
  if (Tp) return ko;
  Tp = 1;
  const e = /\s+/g;
  class t {
    constructor(q, J) {
      if (J = c(J), q instanceof t)
        return q.loose === !!J.loose && q.includePrerelease === !!J.includePrerelease ? q : new t(q.raw, J);
      if (q instanceof n)
        return this.raw = q.value, this.set = [[q]], this.formatted = void 0, this;
      if (this.options = J, this.loose = !!J.loose, this.includePrerelease = !!J.includePrerelease, this.raw = q.trim().replace(e, " "), this.set = this.raw.split("||").map((H) => this.parseRange(H.trim())).filter((H) => H.length), !this.set.length)
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      if (this.set.length > 1) {
        const H = this.set[0];
        if (this.set = this.set.filter((G) => !v(G[0])), this.set.length === 0)
          this.set = [H];
        else if (this.set.length > 1) {
          for (const G of this.set)
            if (G.length === 1 && h(G[0])) {
              this.set = [G];
              break;
            }
        }
      }
      this.formatted = void 0;
    }
    get range() {
      if (this.formatted === void 0) {
        this.formatted = "";
        for (let q = 0; q < this.set.length; q++) {
          q > 0 && (this.formatted += "||");
          const J = this.set[q];
          for (let H = 0; H < J.length; H++)
            H > 0 && (this.formatted += " "), this.formatted += J[H].toString().trim();
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
    parseRange(q) {
      const H = ((this.options.includePrerelease && m) | (this.options.loose && g)) + ":" + q, G = r.get(H);
      if (G)
        return G;
      const Y = this.options.loose, k = Y ? a[u.HYPHENRANGELOOSE] : a[u.HYPHENRANGE];
      q = q.replace(k, B(this.options.includePrerelease)), s("hyphen replace", q), q = q.replace(a[u.COMPARATORTRIM], i), s("comparator trim", q), q = q.replace(a[u.TILDETRIM], f), s("tilde trim", q), q = q.replace(a[u.CARETTRIM], d), s("caret trim", q);
      let I = q.split(" ").map((N) => p(N, this.options)).join(" ").split(/\s+/).map((N) => M(N, this.options));
      Y && (I = I.filter((N) => (s("loose invalid filter", N, this.options), !!N.match(a[u.COMPARATORLOOSE])))), s("range list", I);
      const U = /* @__PURE__ */ new Map(), D = I.map((N) => new n(N, this.options));
      for (const N of D) {
        if (v(N))
          return [N];
        U.set(N.value, N);
      }
      U.size > 1 && U.has("") && U.delete("");
      const T = [...U.values()];
      return r.set(H, T), T;
    }
    intersects(q, J) {
      if (!(q instanceof t))
        throw new TypeError("a Range is required");
      return this.set.some((H) => y(H, J) && q.set.some((G) => y(G, J) && H.every((Y) => G.every((k) => Y.intersects(k, J)))));
    }
    // if ANY of the sets match ALL of its comparators, then pass
    test(q) {
      if (!q)
        return !1;
      if (typeof q == "string")
        try {
          q = new l(q, this.options);
        } catch {
          return !1;
        }
      for (let J = 0; J < this.set.length; J++)
        if (W(this.set[J], q, this.options))
          return !0;
      return !1;
    }
  }
  ko = t;
  const o = aS(), r = new o(), c = fl(), n = ws(), s = _s(), l = ct(), {
    safeRe: a,
    t: u,
    comparatorTrimReplace: i,
    tildeTrimReplace: f,
    caretTrimReplace: d
  } = zn(), { FLAG_INCLUDE_PRERELEASE: m, FLAG_LOOSE: g } = vs(), v = (F) => F.value === "<0.0.0-0", h = (F) => F.value === "", y = (F, q) => {
    let J = !0;
    const H = F.slice();
    let G = H.pop();
    for (; J && H.length; )
      J = H.every((Y) => G.intersects(Y, q)), G = H.pop();
    return J;
  }, p = (F, q) => (F = F.replace(a[u.BUILD], ""), s("comp", F, q), F = _(F, q), s("caret", F), F = $(F, q), s("tildes", F), F = R(F, q), s("xrange", F), F = j(F, q), s("stars", F), F), E = (F) => !F || F.toLowerCase() === "x" || F === "*", $ = (F, q) => F.trim().split(/\s+/).map((J) => S(J, q)).join(" "), S = (F, q) => {
    const J = q.loose ? a[u.TILDELOOSE] : a[u.TILDE];
    return F.replace(J, (H, G, Y, k, I) => {
      s("tilde", F, H, G, Y, k, I);
      let U;
      return E(G) ? U = "" : E(Y) ? U = `>=${G}.0.0 <${+G + 1}.0.0-0` : E(k) ? U = `>=${G}.${Y}.0 <${G}.${+Y + 1}.0-0` : I ? (s("replaceTilde pr", I), U = `>=${G}.${Y}.${k}-${I} <${G}.${+Y + 1}.0-0`) : U = `>=${G}.${Y}.${k} <${G}.${+Y + 1}.0-0`, s("tilde return", U), U;
    });
  }, _ = (F, q) => F.trim().split(/\s+/).map((J) => w(J, q)).join(" "), w = (F, q) => {
    s("caret", F, q);
    const J = q.loose ? a[u.CARETLOOSE] : a[u.CARET], H = q.includePrerelease ? "-0" : "";
    return F.replace(J, (G, Y, k, I, U) => {
      s("caret", F, G, Y, k, I, U);
      let D;
      return E(Y) ? D = "" : E(k) ? D = `>=${Y}.0.0${H} <${+Y + 1}.0.0-0` : E(I) ? Y === "0" ? D = `>=${Y}.${k}.0${H} <${Y}.${+k + 1}.0-0` : D = `>=${Y}.${k}.0${H} <${+Y + 1}.0.0-0` : U ? (s("replaceCaret pr", U), Y === "0" ? k === "0" ? D = `>=${Y}.${k}.${I}-${U} <${Y}.${k}.${+I + 1}-0` : D = `>=${Y}.${k}.${I}-${U} <${Y}.${+k + 1}.0-0` : D = `>=${Y}.${k}.${I}-${U} <${+Y + 1}.0.0-0`) : (s("no pr"), Y === "0" ? k === "0" ? D = `>=${Y}.${k}.${I}${H} <${Y}.${k}.${+I + 1}-0` : D = `>=${Y}.${k}.${I}${H} <${Y}.${+k + 1}.0-0` : D = `>=${Y}.${k}.${I} <${+Y + 1}.0.0-0`), s("caret return", D), D;
    });
  }, R = (F, q) => (s("replaceXRanges", F, q), F.split(/\s+/).map((J) => P(J, q)).join(" ")), P = (F, q) => {
    F = F.trim();
    const J = q.loose ? a[u.XRANGELOOSE] : a[u.XRANGE];
    return F.replace(J, (H, G, Y, k, I, U) => {
      s("xRange", F, H, G, Y, k, I, U);
      const D = E(Y), T = D || E(k), N = T || E(I), V = N;
      return G === "=" && V && (G = ""), U = q.includePrerelease ? "-0" : "", D ? G === ">" || G === "<" ? H = "<0.0.0-0" : H = "*" : G && V ? (T && (k = 0), I = 0, G === ">" ? (G = ">=", T ? (Y = +Y + 1, k = 0, I = 0) : (k = +k + 1, I = 0)) : G === "<=" && (G = "<", T ? Y = +Y + 1 : k = +k + 1), G === "<" && (U = "-0"), H = `${G + Y}.${k}.${I}${U}`) : T ? H = `>=${Y}.0.0${U} <${+Y + 1}.0.0-0` : N && (H = `>=${Y}.${k}.0${U} <${Y}.${+k + 1}.0-0`), s("xRange return", H), H;
    });
  }, j = (F, q) => (s("replaceStars", F, q), F.trim().replace(a[u.STAR], "")), M = (F, q) => (s("replaceGTE0", F, q), F.trim().replace(a[q.includePrerelease ? u.GTE0PRE : u.GTE0], "")), B = (F) => (q, J, H, G, Y, k, I, U, D, T, N, V) => (E(H) ? J = "" : E(G) ? J = `>=${H}.0.0${F ? "-0" : ""}` : E(Y) ? J = `>=${H}.${G}.0${F ? "-0" : ""}` : k ? J = `>=${J}` : J = `>=${J}${F ? "-0" : ""}`, E(D) ? U = "" : E(T) ? U = `<${+D + 1}.0.0-0` : E(N) ? U = `<${D}.${+T + 1}.0-0` : V ? U = `<=${D}.${T}.${N}-${V}` : F ? U = `<${D}.${T}.${+N + 1}-0` : U = `<=${U}`, `${J} ${U}`.trim()), W = (F, q, J) => {
    for (let H = 0; H < F.length; H++)
      if (!F[H].test(q))
        return !1;
    if (q.prerelease.length && !J.includePrerelease) {
      for (let H = 0; H < F.length; H++)
        if (s(F[H].semver), F[H].semver !== n.ANY && F[H].semver.prerelease.length > 0) {
          const G = F[H].semver;
          if (G.major === q.major && G.minor === q.minor && G.patch === q.patch)
            return !0;
        }
      return !1;
    }
    return !0;
  };
  return ko;
}
var Lo, Rp;
function ws() {
  if (Rp) return Lo;
  Rp = 1;
  const e = Symbol("SemVer ANY");
  class t {
    static get ANY() {
      return e;
    }
    constructor(i, f) {
      if (f = o(f), i instanceof t) {
        if (i.loose === !!f.loose)
          return i;
        i = i.value;
      }
      i = i.trim().split(/\s+/).join(" "), s("comparator", i, f), this.options = f, this.loose = !!f.loose, this.parse(i), this.semver === e ? this.value = "" : this.value = this.operator + this.semver.version, s("comp", this);
    }
    parse(i) {
      const f = this.options.loose ? r[c.COMPARATORLOOSE] : r[c.COMPARATOR], d = i.match(f);
      if (!d)
        throw new TypeError(`Invalid comparator: ${i}`);
      this.operator = d[1] !== void 0 ? d[1] : "", this.operator === "=" && (this.operator = ""), d[2] ? this.semver = new l(d[2], this.options.loose) : this.semver = e;
    }
    toString() {
      return this.value;
    }
    test(i) {
      if (s("Comparator.test", i, this.options.loose), this.semver === e || i === e)
        return !0;
      if (typeof i == "string")
        try {
          i = new l(i, this.options);
        } catch {
          return !1;
        }
      return n(i, this.operator, this.semver, this.options);
    }
    intersects(i, f) {
      if (!(i instanceof t))
        throw new TypeError("a Comparator is required");
      return this.operator === "" ? this.value === "" ? !0 : new a(i.value, f).test(this.value) : i.operator === "" ? i.value === "" ? !0 : new a(this.value, f).test(i.semver) : (f = o(f), f.includePrerelease && (this.value === "<0.0.0-0" || i.value === "<0.0.0-0") || !f.includePrerelease && (this.value.startsWith("<0.0.0") || i.value.startsWith("<0.0.0")) ? !1 : !!(this.operator.startsWith(">") && i.operator.startsWith(">") || this.operator.startsWith("<") && i.operator.startsWith("<") || this.semver.version === i.semver.version && this.operator.includes("=") && i.operator.includes("=") || n(this.semver, "<", i.semver, f) && this.operator.startsWith(">") && i.operator.startsWith("<") || n(this.semver, ">", i.semver, f) && this.operator.startsWith("<") && i.operator.startsWith(">")));
    }
  }
  Lo = t;
  const o = fl(), { safeRe: r, t: c } = zn(), n = w0(), s = _s(), l = ct(), a = Ft();
  return Lo;
}
var Fo, Pp;
function Ss() {
  if (Pp) return Fo;
  Pp = 1;
  const e = Ft();
  return Fo = (o, r, c) => {
    try {
      r = new e(r, c);
    } catch {
      return !1;
    }
    return r.test(o);
  }, Fo;
}
var qo, Np;
function sS() {
  if (Np) return qo;
  Np = 1;
  const e = Ft();
  return qo = (o, r) => new e(o, r).set.map((c) => c.map((n) => n.value).join(" ").trim().split(" ")), qo;
}
var Uo, Op;
function oS() {
  if (Op) return Uo;
  Op = 1;
  const e = ct(), t = Ft();
  return Uo = (r, c, n) => {
    let s = null, l = null, a = null;
    try {
      a = new t(c, n);
    } catch {
      return null;
    }
    return r.forEach((u) => {
      a.test(u) && (!s || l.compare(u) === -1) && (s = u, l = new e(s, n));
    }), s;
  }, Uo;
}
var jo, Ap;
function uS() {
  if (Ap) return jo;
  Ap = 1;
  const e = ct(), t = Ft();
  return jo = (r, c, n) => {
    let s = null, l = null, a = null;
    try {
      a = new t(c, n);
    } catch {
      return null;
    }
    return r.forEach((u) => {
      a.test(u) && (!s || l.compare(u) === 1) && (s = u, l = new e(s, n));
    }), s;
  }, jo;
}
var Mo, Ip;
function cS() {
  if (Ip) return Mo;
  Ip = 1;
  const e = ct(), t = Ft(), o = Es();
  return Mo = (c, n) => {
    c = new t(c, n);
    let s = new e("0.0.0");
    if (c.test(s) || (s = new e("0.0.0-0"), c.test(s)))
      return s;
    s = null;
    for (let l = 0; l < c.set.length; ++l) {
      const a = c.set[l];
      let u = null;
      a.forEach((i) => {
        const f = new e(i.semver.version);
        switch (i.operator) {
          case ">":
            f.prerelease.length === 0 ? f.patch++ : f.prerelease.push(0), f.raw = f.format();
          /* fallthrough */
          case "":
          case ">=":
            (!u || o(f, u)) && (u = f);
            break;
          case "<":
          case "<=":
            break;
          /* istanbul ignore next */
          default:
            throw new Error(`Unexpected operation: ${i.operator}`);
        }
      }), u && (!s || o(s, u)) && (s = u);
    }
    return s && c.test(s) ? s : null;
  }, Mo;
}
var xo, Cp;
function lS() {
  if (Cp) return xo;
  Cp = 1;
  const e = Ft();
  return xo = (o, r) => {
    try {
      return new e(o, r).range || "*";
    } catch {
      return null;
    }
  }, xo;
}
var Vo, Dp;
function gl() {
  if (Dp) return Vo;
  Dp = 1;
  const e = ct(), t = ws(), { ANY: o } = t, r = Ft(), c = Ss(), n = Es(), s = pl(), l = yl(), a = ml();
  return Vo = (i, f, d, m) => {
    i = new e(i, m), f = new r(f, m);
    let g, v, h, y, p;
    switch (d) {
      case ">":
        g = n, v = l, h = s, y = ">", p = ">=";
        break;
      case "<":
        g = s, v = a, h = n, y = "<", p = "<=";
        break;
      default:
        throw new TypeError('Must provide a hilo val of "<" or ">"');
    }
    if (c(i, f, m))
      return !1;
    for (let E = 0; E < f.set.length; ++E) {
      const $ = f.set[E];
      let S = null, _ = null;
      if ($.forEach((w) => {
        w.semver === o && (w = new t(">=0.0.0")), S = S || w, _ = _ || w, g(w.semver, S.semver, m) ? S = w : h(w.semver, _.semver, m) && (_ = w);
      }), S.operator === y || S.operator === p || (!_.operator || _.operator === y) && v(i, _.semver))
        return !1;
      if (_.operator === p && h(i, _.semver))
        return !1;
    }
    return !0;
  }, Vo;
}
var Go, kp;
function dS() {
  if (kp) return Go;
  kp = 1;
  const e = gl();
  return Go = (o, r, c) => e(o, r, ">", c), Go;
}
var Ho, Lp;
function fS() {
  if (Lp) return Ho;
  Lp = 1;
  const e = gl();
  return Ho = (o, r, c) => e(o, r, "<", c), Ho;
}
var Bo, Fp;
function hS() {
  if (Fp) return Bo;
  Fp = 1;
  const e = Ft();
  return Bo = (o, r, c) => (o = new e(o, c), r = new e(r, c), o.intersects(r, c)), Bo;
}
var zo, qp;
function pS() {
  if (qp) return zo;
  qp = 1;
  const e = Ss(), t = Lt();
  return zo = (o, r, c) => {
    const n = [];
    let s = null, l = null;
    const a = o.sort((d, m) => t(d, m, c));
    for (const d of a)
      e(d, r, c) ? (l = d, s || (s = d)) : (l && n.push([s, l]), l = null, s = null);
    s && n.push([s, null]);
    const u = [];
    for (const [d, m] of n)
      d === m ? u.push(d) : !m && d === a[0] ? u.push("*") : m ? d === a[0] ? u.push(`<=${m}`) : u.push(`${d} - ${m}`) : u.push(`>=${d}`);
    const i = u.join(" || "), f = typeof r.raw == "string" ? r.raw : String(r);
    return i.length < f.length ? i : r;
  }, zo;
}
var Ko, Up;
function mS() {
  if (Up) return Ko;
  Up = 1;
  const e = Ft(), t = ws(), { ANY: o } = t, r = Ss(), c = Lt(), n = (f, d, m = {}) => {
    if (f === d)
      return !0;
    f = new e(f, m), d = new e(d, m);
    let g = !1;
    e: for (const v of f.set) {
      for (const h of d.set) {
        const y = a(v, h, m);
        if (g = g || y !== null, y)
          continue e;
      }
      if (g)
        return !1;
    }
    return !0;
  }, s = [new t(">=0.0.0-0")], l = [new t(">=0.0.0")], a = (f, d, m) => {
    if (f === d)
      return !0;
    if (f.length === 1 && f[0].semver === o) {
      if (d.length === 1 && d[0].semver === o)
        return !0;
      m.includePrerelease ? f = s : f = l;
    }
    if (d.length === 1 && d[0].semver === o) {
      if (m.includePrerelease)
        return !0;
      d = l;
    }
    const g = /* @__PURE__ */ new Set();
    let v, h;
    for (const R of f)
      R.operator === ">" || R.operator === ">=" ? v = u(v, R, m) : R.operator === "<" || R.operator === "<=" ? h = i(h, R, m) : g.add(R.semver);
    if (g.size > 1)
      return null;
    let y;
    if (v && h) {
      if (y = c(v.semver, h.semver, m), y > 0)
        return null;
      if (y === 0 && (v.operator !== ">=" || h.operator !== "<="))
        return null;
    }
    for (const R of g) {
      if (v && !r(R, String(v), m) || h && !r(R, String(h), m))
        return null;
      for (const P of d)
        if (!r(R, String(P), m))
          return !1;
      return !0;
    }
    let p, E, $, S, _ = h && !m.includePrerelease && h.semver.prerelease.length ? h.semver : !1, w = v && !m.includePrerelease && v.semver.prerelease.length ? v.semver : !1;
    _ && _.prerelease.length === 1 && h.operator === "<" && _.prerelease[0] === 0 && (_ = !1);
    for (const R of d) {
      if (S = S || R.operator === ">" || R.operator === ">=", $ = $ || R.operator === "<" || R.operator === "<=", v) {
        if (w && R.semver.prerelease && R.semver.prerelease.length && R.semver.major === w.major && R.semver.minor === w.minor && R.semver.patch === w.patch && (w = !1), R.operator === ">" || R.operator === ">=") {
          if (p = u(v, R, m), p === R && p !== v)
            return !1;
        } else if (v.operator === ">=" && !r(v.semver, String(R), m))
          return !1;
      }
      if (h) {
        if (_ && R.semver.prerelease && R.semver.prerelease.length && R.semver.major === _.major && R.semver.minor === _.minor && R.semver.patch === _.patch && (_ = !1), R.operator === "<" || R.operator === "<=") {
          if (E = i(h, R, m), E === R && E !== h)
            return !1;
        } else if (h.operator === "<=" && !r(h.semver, String(R), m))
          return !1;
      }
      if (!R.operator && (h || v) && y !== 0)
        return !1;
    }
    return !(v && $ && !h && y !== 0 || h && S && !v && y !== 0 || w || _);
  }, u = (f, d, m) => {
    if (!f)
      return d;
    const g = c(f.semver, d.semver, m);
    return g > 0 ? f : g < 0 || d.operator === ">" && f.operator === ">=" ? d : f;
  }, i = (f, d, m) => {
    if (!f)
      return d;
    const g = c(f.semver, d.semver, m);
    return g < 0 ? f : g > 0 || d.operator === "<" && f.operator === "<=" ? d : f;
  };
  return Ko = n, Ko;
}
var Xo, jp;
function yS() {
  if (jp) return Xo;
  jp = 1;
  const e = zn(), t = vs(), o = ct(), r = v0(), c = Qr(), n = zw(), s = Kw(), l = Xw(), a = Ww(), u = Yw(), i = Jw(), f = Qw(), d = Zw(), m = Lt(), g = eS(), v = tS(), h = hl(), y = rS(), p = nS(), E = Es(), $ = pl(), S = _0(), _ = E0(), w = ml(), R = yl(), P = w0(), j = iS(), M = ws(), B = Ft(), W = Ss(), F = sS(), q = oS(), J = uS(), H = cS(), G = lS(), Y = gl(), k = dS(), I = fS(), U = hS(), D = pS(), T = mS();
  return Xo = {
    parse: c,
    valid: n,
    clean: s,
    inc: l,
    diff: a,
    major: u,
    minor: i,
    patch: f,
    prerelease: d,
    compare: m,
    rcompare: g,
    compareLoose: v,
    compareBuild: h,
    sort: y,
    rsort: p,
    gt: E,
    lt: $,
    eq: S,
    neq: _,
    gte: w,
    lte: R,
    cmp: P,
    coerce: j,
    Comparator: M,
    Range: B,
    satisfies: W,
    toComparators: F,
    maxSatisfying: q,
    minSatisfying: J,
    minVersion: H,
    validRange: G,
    outside: Y,
    gtr: k,
    ltr: I,
    intersects: U,
    simplifyRange: D,
    subset: T,
    SemVer: o,
    re: e.re,
    src: e.src,
    tokens: e.t,
    SEMVER_SPEC_VERSION: t.SEMVER_SPEC_VERSION,
    RELEASE_TYPES: t.RELEASE_TYPES,
    compareIdentifiers: r.compareIdentifiers,
    rcompareIdentifiers: r.rcompareIdentifiers
  }, Xo;
}
var fn = { exports: {} }, ja = { exports: {} }, Mp;
function gS() {
  if (Mp) return ja.exports;
  Mp = 1;
  const e = (t, o) => {
    for (const r of Reflect.ownKeys(o))
      Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(o, r));
    return t;
  };
  return ja.exports = e, ja.exports.default = e, ja.exports;
}
var xp;
function vS() {
  if (xp) return fn.exports;
  xp = 1;
  const e = gS(), t = /* @__PURE__ */ new WeakMap(), o = (r, c = {}) => {
    if (typeof r != "function")
      throw new TypeError("Expected a function");
    let n, s = 0;
    const l = r.displayName || r.name || "<anonymous>", a = function(...u) {
      if (t.set(a, ++s), s === 1)
        n = r.apply(this, u), r = null;
      else if (c.throw === !0)
        throw new Error(`Function \`${l}\` can only be called once`);
      return n;
    };
    return e(a, r), t.set(a, s), a;
  };
  return fn.exports = o, fn.exports.default = o, fn.exports.callCount = (r) => {
    if (!t.has(r))
      throw new Error(`The given function \`${r.name}\` is not wrapped by the \`onetime\` package`);
    return t.get(r);
  }, fn.exports;
}
var Ma = qn.exports, Vp;
function _S() {
  return Vp || (Vp = 1, (function(e, t) {
    var o = Ma && Ma.__classPrivateFieldSet || function(H, G, Y, k, I) {
      if (k === "m") throw new TypeError("Private method is not writable");
      if (k === "a" && !I) throw new TypeError("Private accessor was defined without a setter");
      if (typeof G == "function" ? H !== G || !I : !G.has(H)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
      return k === "a" ? I.call(H, Y) : I ? I.value = Y : G.set(H, Y), Y;
    }, r = Ma && Ma.__classPrivateFieldGet || function(H, G, Y, k) {
      if (Y === "a" && !k) throw new TypeError("Private accessor was defined without a getter");
      if (typeof G == "function" ? H !== G || !k : !G.has(H)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
      return Y === "m" ? k : Y === "a" ? k.call(H) : k ? k.value : G.get(H);
    }, c, n, s, l, a, u;
    Object.defineProperty(t, "__esModule", { value: !0 });
    const i = Vn, f = Ct, d = Me, m = Yr, g = rl, v = nl, h = g_(), y = b_(), p = T_(), E = D_(), $ = qE(), S = Gw(), _ = Bw(), w = yS(), R = vS(), P = "aes-256-cbc", j = () => /* @__PURE__ */ Object.create(null), M = (H) => H != null;
    let B = "";
    try {
      delete require.cache[__filename], B = d.dirname((n = (c = e.parent) === null || c === void 0 ? void 0 : c.filename) !== null && n !== void 0 ? n : ".");
    } catch {
    }
    const W = (H, G) => {
      const Y = /* @__PURE__ */ new Set([
        "undefined",
        "symbol",
        "function"
      ]), k = typeof G;
      if (Y.has(k))
        throw new TypeError(`Setting a value of type \`${k}\` for key \`${H}\` is not allowed as it's not supported by JSON`);
    }, F = "__internal__", q = `${F}.migrations.version`;
    class J {
      constructor(G = {}) {
        var Y;
        s.set(this, void 0), l.set(this, void 0), a.set(this, void 0), u.set(this, {}), this._deserialize = (N) => JSON.parse(N), this._serialize = (N) => JSON.stringify(N, void 0, "	");
        const k = {
          configName: "config",
          fileExtension: "json",
          projectSuffix: "nodejs",
          clearInvalidConfig: !1,
          accessPropertiesByDotNotation: !0,
          configFileMode: 438,
          ...G
        }, I = R(() => {
          const N = y.sync({ cwd: B }), V = N && JSON.parse(f.readFileSync(N, "utf8"));
          return V ?? {};
        });
        if (!k.cwd) {
          if (k.projectName || (k.projectName = I().name), !k.projectName)
            throw new Error("Project name could not be inferred. Please specify the `projectName` option.");
          k.cwd = p(k.projectName, { suffix: k.projectSuffix }).config;
        }
        if (o(this, a, k, "f"), k.schema) {
          if (typeof k.schema != "object")
            throw new TypeError("The `schema` option must be an object.");
          const N = new $.default({
            allErrors: !0,
            useDefaults: !0
          });
          (0, S.default)(N);
          const V = {
            type: "object",
            properties: k.schema
          };
          o(this, s, N.compile(V), "f");
          for (const [A, O] of Object.entries(k.schema))
            O?.default && (r(this, u, "f")[A] = O.default);
        }
        k.defaults && o(this, u, {
          ...r(this, u, "f"),
          ...k.defaults
        }, "f"), k.serialize && (this._serialize = k.serialize), k.deserialize && (this._deserialize = k.deserialize), this.events = new v.EventEmitter(), o(this, l, k.encryptionKey, "f");
        const U = k.fileExtension ? `.${k.fileExtension}` : "";
        this.path = d.resolve(k.cwd, `${(Y = k.configName) !== null && Y !== void 0 ? Y : "config"}${U}`);
        const D = this.store, T = Object.assign(j(), k.defaults, D);
        this._validate(T);
        try {
          g.deepEqual(D, T);
        } catch {
          this.store = T;
        }
        if (k.watch && this._watch(), k.migrations) {
          if (k.projectVersion || (k.projectVersion = I().version), !k.projectVersion)
            throw new Error("Project version could not be inferred. Please specify the `projectVersion` option.");
          this._migrate(k.migrations, k.projectVersion, k.beforeEachMigration);
        }
      }
      get(G, Y) {
        if (r(this, a, "f").accessPropertiesByDotNotation)
          return this._get(G, Y);
        const { store: k } = this;
        return G in k ? k[G] : Y;
      }
      set(G, Y) {
        if (typeof G != "string" && typeof G != "object")
          throw new TypeError(`Expected \`key\` to be of type \`string\` or \`object\`, got ${typeof G}`);
        if (typeof G != "object" && Y === void 0)
          throw new TypeError("Use `delete()` to clear values");
        if (this._containsReservedKey(G))
          throw new TypeError(`Please don't use the ${F} key, as it's used to manage this module internal operations.`);
        const { store: k } = this, I = (U, D) => {
          W(U, D), r(this, a, "f").accessPropertiesByDotNotation ? h.set(k, U, D) : k[U] = D;
        };
        if (typeof G == "object") {
          const U = G;
          for (const [D, T] of Object.entries(U))
            I(D, T);
        } else
          I(G, Y);
        this.store = k;
      }
      /**
          Check if an item exists.
      
          @param key - The key of the item to check.
          */
      has(G) {
        return r(this, a, "f").accessPropertiesByDotNotation ? h.has(this.store, G) : G in this.store;
      }
      /**
          Reset items to their default values, as defined by the `defaults` or `schema` option.
      
          @see `clear()` to reset all items.
      
          @param keys - The keys of the items to reset.
          */
      reset(...G) {
        for (const Y of G)
          M(r(this, u, "f")[Y]) && this.set(Y, r(this, u, "f")[Y]);
      }
      /**
          Delete an item.
      
          @param key - The key of the item to delete.
          */
      delete(G) {
        const { store: Y } = this;
        r(this, a, "f").accessPropertiesByDotNotation ? h.delete(Y, G) : delete Y[G], this.store = Y;
      }
      /**
          Delete all items.
      
          This resets known items to their default values, if defined by the `defaults` or `schema` option.
          */
      clear() {
        this.store = j();
        for (const G of Object.keys(r(this, u, "f")))
          this.reset(G);
      }
      /**
          Watches the given `key`, calling `callback` on any changes.
      
          @param key - The key wo watch.
          @param callback - A callback function that is called on any changes. When a `key` is first set `oldValue` will be `undefined`, and when a key is deleted `newValue` will be `undefined`.
          @returns A function, that when called, will unsubscribe.
          */
      onDidChange(G, Y) {
        if (typeof G != "string")
          throw new TypeError(`Expected \`key\` to be of type \`string\`, got ${typeof G}`);
        if (typeof Y != "function")
          throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof Y}`);
        return this._handleChange(() => this.get(G), Y);
      }
      /**
          Watches the whole config object, calling `callback` on any changes.
      
          @param callback - A callback function that is called on any changes. When a `key` is first set `oldValue` will be `undefined`, and when a key is deleted `newValue` will be `undefined`.
          @returns A function, that when called, will unsubscribe.
          */
      onDidAnyChange(G) {
        if (typeof G != "function")
          throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof G}`);
        return this._handleChange(() => this.store, G);
      }
      get size() {
        return Object.keys(this.store).length;
      }
      get store() {
        try {
          const G = f.readFileSync(this.path, r(this, l, "f") ? null : "utf8"), Y = this._encryptData(G), k = this._deserialize(Y);
          return this._validate(k), Object.assign(j(), k);
        } catch (G) {
          if (G?.code === "ENOENT")
            return this._ensureDirectory(), j();
          if (r(this, a, "f").clearInvalidConfig && G.name === "SyntaxError")
            return j();
          throw G;
        }
      }
      set store(G) {
        this._ensureDirectory(), this._validate(G), this._write(G), this.events.emit("change");
      }
      *[(s = /* @__PURE__ */ new WeakMap(), l = /* @__PURE__ */ new WeakMap(), a = /* @__PURE__ */ new WeakMap(), u = /* @__PURE__ */ new WeakMap(), Symbol.iterator)]() {
        for (const [G, Y] of Object.entries(this.store))
          yield [G, Y];
      }
      _encryptData(G) {
        if (!r(this, l, "f"))
          return G.toString();
        try {
          if (r(this, l, "f"))
            try {
              if (G.slice(16, 17).toString() === ":") {
                const Y = G.slice(0, 16), k = m.pbkdf2Sync(r(this, l, "f"), Y.toString(), 1e4, 32, "sha512"), I = m.createDecipheriv(P, k, Y);
                G = Buffer.concat([I.update(Buffer.from(G.slice(17))), I.final()]).toString("utf8");
              } else {
                const Y = m.createDecipher(P, r(this, l, "f"));
                G = Buffer.concat([Y.update(Buffer.from(G)), Y.final()]).toString("utf8");
              }
            } catch {
            }
        } catch {
        }
        return G.toString();
      }
      _handleChange(G, Y) {
        let k = G();
        const I = () => {
          const U = k, D = G();
          (0, i.isDeepStrictEqual)(D, U) || (k = D, Y.call(this, D, U));
        };
        return this.events.on("change", I), () => this.events.removeListener("change", I);
      }
      _validate(G) {
        if (!r(this, s, "f") || r(this, s, "f").call(this, G) || !r(this, s, "f").errors)
          return;
        const k = r(this, s, "f").errors.map(({ instancePath: I, message: U = "" }) => `\`${I.slice(1)}\` ${U}`);
        throw new Error("Config schema violation: " + k.join("; "));
      }
      _ensureDirectory() {
        f.mkdirSync(d.dirname(this.path), { recursive: !0 });
      }
      _write(G) {
        let Y = this._serialize(G);
        if (r(this, l, "f")) {
          const k = m.randomBytes(16), I = m.pbkdf2Sync(r(this, l, "f"), k.toString(), 1e4, 32, "sha512"), U = m.createCipheriv(P, I, k);
          Y = Buffer.concat([k, Buffer.from(":"), U.update(Buffer.from(Y)), U.final()]);
        }
        if (process.env.SNAP)
          f.writeFileSync(this.path, Y, { mode: r(this, a, "f").configFileMode });
        else
          try {
            E.writeFileSync(this.path, Y, { mode: r(this, a, "f").configFileMode });
          } catch (k) {
            if (k?.code === "EXDEV") {
              f.writeFileSync(this.path, Y, { mode: r(this, a, "f").configFileMode });
              return;
            }
            throw k;
          }
      }
      _watch() {
        this._ensureDirectory(), f.existsSync(this.path) || this._write(j()), process.platform === "win32" ? f.watch(this.path, { persistent: !1 }, _(() => {
          this.events.emit("change");
        }, { wait: 100 })) : f.watchFile(this.path, { persistent: !1 }, _(() => {
          this.events.emit("change");
        }, { wait: 5e3 }));
      }
      _migrate(G, Y, k) {
        let I = this._get(q, "0.0.0");
        const U = Object.keys(G).filter((T) => this._shouldPerformMigration(T, I, Y));
        let D = { ...this.store };
        for (const T of U)
          try {
            k && k(this, {
              fromVersion: I,
              toVersion: T,
              finalVersion: Y,
              versions: U
            });
            const N = G[T];
            N(this), this._set(q, T), I = T, D = { ...this.store };
          } catch (N) {
            throw this.store = D, new Error(`Something went wrong during the migration! Changes applied to the store until this failed migration will be restored. ${N}`);
          }
        (this._isVersionInRangeFormat(I) || !w.eq(I, Y)) && this._set(q, Y);
      }
      _containsReservedKey(G) {
        return typeof G == "object" && Object.keys(G)[0] === F ? !0 : typeof G != "string" ? !1 : r(this, a, "f").accessPropertiesByDotNotation ? !!G.startsWith(`${F}.`) : !1;
      }
      _isVersionInRangeFormat(G) {
        return w.clean(G) === null;
      }
      _shouldPerformMigration(G, Y, k) {
        return this._isVersionInRangeFormat(G) ? Y !== "0.0.0" && w.satisfies(Y, G) ? !1 : w.satisfies(k, G) : !(w.lte(G, Y) || w.gt(G, k));
      }
      _get(G, Y) {
        return h.get(this.store, G, Y);
      }
      _set(G, Y) {
        const { store: k } = this;
        h.set(k, G, Y), this.store = k;
      }
    }
    t.default = J, e.exports = J, e.exports.default = J;
  })(qn, qn.exports)), qn.exports;
}
var Wo, Gp;
function ES() {
  if (Gp) return Wo;
  Gp = 1;
  const e = Me, { app: t, ipcMain: o, ipcRenderer: r, shell: c } = ur, n = _S();
  let s = !1;
  const l = () => {
    if (!o || !t)
      throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
    const u = {
      defaultCwd: t.getPath("userData"),
      appVersion: t.getVersion()
    };
    return s || (o.on("electron-store-get-data", (i) => {
      i.returnValue = u;
    }), s = !0), u;
  };
  class a extends n {
    constructor(i) {
      let f, d;
      if (r) {
        const m = r.sendSync("electron-store-get-data");
        if (!m)
          throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
        ({ defaultCwd: f, appVersion: d } = m);
      } else o && t && ({ defaultCwd: f, appVersion: d } = l());
      i = {
        name: "config",
        ...i
      }, i.projectVersion || (i.projectVersion = d), i.cwd ? i.cwd = e.isAbsolute(i.cwd) ? i.cwd : e.join(f, i.cwd) : i.cwd = f, i.configName = i.name, delete i.name, super(i);
    }
    static initRenderer() {
      l();
    }
    async openInEditor() {
      const i = await c.openPath(this.path);
      if (i)
        throw new Error(i);
    }
  }
  return Wo = a, Wo;
}
var wS = /* @__PURE__ */ ES();
const vl = /* @__PURE__ */ m_(wS);
function SS() {
  const { app: e } = require("electron");
  return e.isPackaged ? ht.join(process.resourcesPath, "build", "icon.png") : ht.join(__dirname, "..", "build", "icon.png");
}
function Ot(e) {
  if (!Ql.isSupported())
    return console.warn("Notifications are not supported on this system"), null;
  const t = new Ql({
    title: e.title,
    body: e.body,
    silent: e.silent ?? !1,
    icon: SS(),
    urgency: e.urgency ?? "normal",
    timeoutType: e.timeoutType ?? "default",
    actions: e.actions
  });
  return t.on("click", () => {
    e.onClick?.();
  }), t.on("action", (o, r) => {
    e.onAction?.(r);
  }), t.show(), t;
}
const hn = {
  pomodoroComplete: (e) => Ot({
    title: "🍅 ¡Pomodoro Completado!",
    body: "¡Excelente trabajo! Es hora de tomar un descanso.",
    urgency: "normal",
    onClick: () => {
      e.show(), e.focus();
    }
  }),
  shortBreakComplete: (e) => Ot({
    title: "☕ Descanso Terminado",
    body: "Es hora de volver al trabajo. ¡Tú puedes!",
    urgency: "normal",
    onClick: () => {
      e.show(), e.focus();
    }
  }),
  longBreakComplete: (e) => Ot({
    title: "🌿 Descanso Largo Terminado",
    body: "¡Recargado! Es hora de empezar una nueva sesión.",
    urgency: "normal",
    onClick: () => {
      e.show(), e.focus();
    }
  }),
  taskDue: (e, t) => Ot({
    title: "⏰ Tarea Vencida",
    body: `La tarea "${t}" ha vencido.`,
    urgency: "critical",
    onClick: () => {
      e.show(), e.focus(), e.webContents.send("notification-action", "task:view-overdue");
    }
  }),
  taskReminder: (e, t, o) => Ot({
    title: "📋 Recordatorio de Tarea",
    body: `"${t}" vence ${o}.`,
    urgency: "normal",
    onClick: () => {
      e.show(), e.focus();
    }
  }),
  syncComplete: () => Ot({
    title: "✅ Sincronización Completada",
    body: "Todos los cambios han sido sincronizados.",
    urgency: "low",
    silent: !0
  }),
  syncError: (e) => Ot({
    title: "❌ Error de Sincronización",
    body: "No se pudieron sincronizar los cambios. Reintentar.",
    urgency: "critical",
    onClick: () => {
      e.show(), e.focus();
    }
  }),
  achievementUnlocked: (e) => Ot({
    title: "🏆 ¡Logro Desbloqueado!",
    body: e,
    urgency: "normal"
  }),
  streakMilestone: (e) => Ot({
    title: "🔥 ¡Racha de Productividad!",
    body: `¡Has mantenido tu racha por ${e} días consecutivos!`,
    urgency: "normal"
  }),
  custom: (e, t, o) => Ot({
    title: e,
    body: t,
    ...o
  })
}, Yo = 1, $S = `
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
let vt = null;
function bS() {
  const e = ke.getPath("userData");
  return ht.join(e, "ordo-todo.db");
}
function S0() {
  if (vt) return vt;
  const e = bS();
  console.log("[Database] Initializing database at:", e);
  const t = ht.dirname(e);
  return Zl.existsSync(t) || Zl.mkdirSync(t, { recursive: !0 }), vt = new n_(e, {
    // Enable WAL mode for better concurrent read performance
    // verbose: console.log // Uncomment for debugging
  }), vt.pragma("journal_mode = WAL"), vt.pragma("foreign_keys = ON"), vt.pragma("synchronous = NORMAL"), TS(vt), console.log("[Database] Database initialized successfully"), vt;
}
function TS(e) {
  e.exec($S);
  const t = e.prepare(`
    SELECT value FROM sync_metadata WHERE key = 'schema_version'
  `).get(), o = t ? parseInt(t.value, 10) : 0;
  o < Yo && (console.log(`[Database] Migrating from version ${o} to ${Yo}`), e.prepare(`
      INSERT OR REPLACE INTO sync_metadata (key, value, updated_at)
      VALUES ('schema_version', ?, ?)
    `).run(Yo.toString(), Date.now()), console.log("[Database] Migration completed"));
}
function Be() {
  return vt || S0();
}
function RS() {
  vt && (vt.close(), vt = null, console.log("[Database] Database connection closed"));
}
function $s() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (e) => {
    const t = Math.random() * 16 | 0;
    return (e === "x" ? t : t & 3 | 8).toString(16);
  });
}
function jt() {
  return Date.now();
}
function PS(e) {
  const t = Be(), o = jt(), r = $s(), c = {
    ...e,
    id: r,
    created_at: o,
    updated_at: o,
    local_updated_at: o,
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
  `).run(c), Zr("task", r, "create", c), c;
}
function NS(e, t) {
  const o = Be(), r = jt(), c = Object.keys(t).filter((s) => !["id", "created_at"].includes(s)).map((s) => `${s} = @${s}`).join(", ");
  if (!c) return Qc(e);
  o.prepare(`
    UPDATE tasks 
    SET ${c}, updated_at = @updated_at, local_updated_at = @local_updated_at, 
        is_synced = 0, sync_status = 'pending'
    WHERE id = @id AND is_deleted = 0
  `).run({
    ...t,
    id: e,
    updated_at: r,
    local_updated_at: r
  });
  const n = Qc(e);
  return n && Zr("task", e, "update", n), n;
}
function OS(e, t = !0) {
  const o = Be(), r = jt();
  return t ? o.prepare(`
      UPDATE tasks 
      SET is_deleted = 1, sync_status = 'deleted', local_updated_at = ?, is_synced = 0
      WHERE id = ?
    `).run(r, e) : o.prepare("DELETE FROM tasks WHERE id = ?").run(e), Zr("task", e, "delete", { id: e }), !0;
}
function Qc(e) {
  return Be().prepare(`
    SELECT * FROM tasks WHERE id = ? AND is_deleted = 0
  `).get(e);
}
function AS(e) {
  return Be().prepare(`
    SELECT * FROM tasks 
    WHERE workspace_id = ? AND is_deleted = 0
    ORDER BY position ASC, created_at DESC
  `).all(e);
}
function IS(e) {
  return Be().prepare(`
    SELECT * FROM tasks 
    WHERE project_id = ? AND is_deleted = 0
    ORDER BY position ASC, created_at DESC
  `).all(e);
}
function CS(e) {
  return Be().prepare(`
    SELECT * FROM tasks 
    WHERE workspace_id = ? AND status = 'pending' AND is_deleted = 0
    ORDER BY priority DESC, due_date ASC, position ASC
  `).all(e);
}
function DS() {
  return Be().prepare(`
    SELECT * FROM tasks WHERE is_synced = 0
  `).all();
}
function kS(e) {
  const t = Be(), o = jt(), r = $s(), c = {
    ...e,
    id: r,
    created_at: o,
    updated_at: o,
    local_updated_at: o,
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
  `).run(c), Zr("workspace", r, "create", c), c;
}
function LS() {
  return Be().prepare(`
    SELECT * FROM workspaces WHERE is_deleted = 0 ORDER BY name ASC
  `).all();
}
function FS(e) {
  return Be().prepare(`
    SELECT * FROM workspaces WHERE id = ? AND is_deleted = 0
  `).get(e);
}
function qS(e) {
  const t = Be(), o = jt(), r = $s(), c = {
    ...e,
    id: r,
    created_at: o,
    updated_at: o,
    local_updated_at: o,
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
  `).run(c), Zr("project", r, "create", c), c;
}
function US(e) {
  return Be().prepare(`
    SELECT * FROM projects 
    WHERE workspace_id = ? AND is_deleted = 0
    ORDER BY name ASC
  `).all(e);
}
function jS(e) {
  const t = Be(), o = jt(), r = $s(), c = {
    ...e,
    id: r,
    created_at: o,
    local_updated_at: o,
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
  `).run(c), Zr("pomodoro_session", r, "create", c), c;
}
function MS(e, t, o) {
  const r = Be();
  let c = "SELECT * FROM pomodoro_sessions WHERE workspace_id = ? AND is_deleted = 0";
  const n = [e];
  return t && (c += " AND started_at >= ?", n.push(t)), o && (c += " AND started_at <= ?", n.push(o)), c += " ORDER BY started_at DESC", r.prepare(c).all(...n);
}
function Zr(e, t, o, r) {
  const c = Be(), n = c.prepare(`
    SELECT id, operation FROM sync_queue 
    WHERE entity_type = ? AND entity_id = ? AND status = 'pending'
    ORDER BY created_at DESC LIMIT 1
  `).get(e, t);
  if (n) {
    if (n.operation === "create" && o === "update") {
      c.prepare(`
        UPDATE sync_queue SET payload = ? WHERE id = ?
      `).run(JSON.stringify(r), n.id);
      return;
    }
    if (n.operation === "create" && o === "delete") {
      c.prepare("DELETE FROM sync_queue WHERE id = ?").run(n.id);
      return;
    }
    if (n.operation === "update" && o === "delete") {
      c.prepare(`
        UPDATE sync_queue SET operation = 'delete', payload = ? WHERE id = ?
      `).run(JSON.stringify(r), n.id);
      return;
    }
    if (n.operation === "update" && o === "update") {
      c.prepare(`
        UPDATE sync_queue SET payload = ? WHERE id = ?
      `).run(JSON.stringify(r), n.id);
      return;
    }
  }
  c.prepare(`
    INSERT INTO sync_queue (entity_type, entity_id, operation, payload, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(e, t, o, JSON.stringify(r), jt());
}
function xS(e = 50) {
  return Be().prepare(`
    SELECT * FROM sync_queue 
    WHERE status = 'pending' 
    ORDER BY created_at ASC
    LIMIT ?
  `).all(e);
}
function VS(e) {
  Be().prepare(`
    UPDATE sync_queue SET status = 'processing', last_attempt_at = ? WHERE id = ?
  `).run(jt(), e);
}
function GS(e) {
  Be().prepare("DELETE FROM sync_queue WHERE id = ?").run(e);
}
function HS(e, t) {
  Be().prepare(`
    UPDATE sync_queue 
    SET status = CASE WHEN attempts >= 5 THEN 'failed' ELSE 'pending' END,
        attempts = attempts + 1, 
        error = ?,
        last_attempt_at = ?
    WHERE id = ?
  `).run(t, jt(), e);
}
function $0() {
  return Be().prepare(`
    SELECT 
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
      COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
      COUNT(*) as total
    FROM sync_queue
  `).get();
}
function BS(e) {
  return Be().prepare(`
    SELECT value FROM sync_metadata WHERE key = ?
  `).get(e)?.value ?? null;
}
function zS(e, t) {
  Be().prepare(`
    INSERT OR REPLACE INTO sync_metadata (key, value, updated_at)
    VALUES (?, ?, ?)
  `).run(e, t, jt());
}
function KS() {
  const e = BS("last_sync_time");
  return e ? parseInt(e, 10) : null;
}
function XS(e) {
  zS("last_sync_time", e.toString());
}
function WS(e, t) {
  const o = Be(), r = _l(e);
  r && o.prepare(`
    UPDATE ${r} SET sync_status = 'conflict' WHERE id = ?
  `).run(t);
}
function _l(e) {
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
function YS(e, t) {
  const o = Be(), r = _l(e);
  if (!r || t.length === 0) return;
  o.transaction(() => {
    for (const n of t) {
      const s = o.prepare(`SELECT id, local_updated_at FROM ${r} WHERE id = ?`).get(n.id);
      if (s)
        if (s.local_updated_at > n.updated_at)
          WS(e, n.id);
        else {
          const l = Object.keys(n).filter((a) => a !== "id").map((a) => `${a} = @${a}`).join(", ");
          o.prepare(`
            UPDATE ${r} 
            SET ${l}, is_synced = 1, sync_status = 'synced', server_updated_at = @updated_at
            WHERE id = @id
          `).run(n);
        }
      else {
        const l = Object.keys(n).join(", "), a = Object.keys(n).map((u) => `@${u}`).join(", ");
        o.prepare(`
          INSERT INTO ${r} (${l}, is_synced, sync_status, local_updated_at, server_updated_at)
          VALUES (${a}, 1, 'synced', @updated_at, @updated_at)
        `).run(n);
      }
    }
  })();
}
function JS(e, t, o) {
  const r = Be(), c = _l(e);
  c && r.prepare(`
    UPDATE ${c} 
    SET is_synced = 1, sync_status = 'synced', server_updated_at = ?
    WHERE id = ?
  `).run(o, t);
}
const Qe = {
  status: "idle",
  lastSyncTime: null,
  pendingChanges: 0,
  failedChanges: 0,
  isOnline: !0
};
let Kr = null, jn = null, Mn = "http://localhost:3001/api/v1", Ir = null;
function QS(e, t) {
  jn = e, Mn = t, Qe.lastSyncTime = KS(), T0(), console.log("[SyncEngine] Initialized");
}
function ZS(e) {
  Ir = e, console.log("[SyncEngine] Auth token updated");
}
function e$(e = 3e4) {
  Kr && clearInterval(Kr), Kr = setInterval(() => {
    Qe.isOnline && Ir && El();
  }, e), console.log(`[SyncEngine] Auto-sync started with interval ${e}ms`);
}
function b0() {
  Kr && (clearInterval(Kr), Kr = null), console.log("[SyncEngine] Auto-sync stopped");
}
function T0() {
  const e = $0();
  Qe.pendingChanges = e.pending, Qe.failedChanges = e.failed, Wr();
}
function Wr() {
  jn && !jn.isDestroyed() && jn.webContents.send("sync-state-changed", Qe);
}
function t$(e) {
  const t = !Qe.isOnline;
  Qe.isOnline = e, Qe.status = e ? "idle" : "offline", t && e && Ir && El(), Wr(), console.log(`[SyncEngine] Online status: ${e}`);
}
function Hp() {
  return { ...Qe };
}
async function El() {
  if (Qe.status === "syncing") {
    console.log("[SyncEngine] Sync already in progress");
    return;
  }
  if (!Ir) {
    console.log("[SyncEngine] No auth token, skipping sync");
    return;
  }
  if (!Qe.isOnline) {
    console.log("[SyncEngine] Offline, skipping sync");
    return;
  }
  try {
    Qe.status = "syncing", Qe.error = void 0, Wr(), console.log("[SyncEngine] Starting sync..."), await r$(), await i$();
    const e = Date.now();
    XS(e), Qe.lastSyncTime = e, Qe.status = "idle", T0(), console.log("[SyncEngine] Sync completed successfully");
  } catch (e) {
    console.error("[SyncEngine] Sync failed:", e), Qe.status = "error", Qe.error = e instanceof Error ? e.message : "Unknown error", Wr();
  }
}
async function r$() {
  const e = xS(50);
  if (e.length === 0) {
    console.log("[SyncEngine] No pending changes to push");
    return;
  }
  console.log(`[SyncEngine] Pushing ${e.length} changes...`);
  for (const t of e)
    try {
      VS(t.id), Qe.currentOperation = `Syncing ${t.entity_type} ${t.operation}`, Wr(), await n$(t) && GS(t.id);
    } catch (o) {
      const r = o instanceof Error ? o.message : "Unknown error";
      console.error(`[SyncEngine] Failed to push ${t.entity_type}:${t.entity_id}:`, r), HS(t.id, r);
    }
  Qe.currentOperation = void 0;
}
async function n$(e) {
  const t = R0(e.entity_type);
  if (!t)
    return console.warn(`[SyncEngine] Unknown entity type: ${e.entity_type}`), !1;
  const o = e.payload ? JSON.parse(e.payload) : null;
  let r;
  switch (e.operation) {
    case "create":
      r = await fetch(`${Mn}${t}`, {
        method: "POST",
        headers: ts(),
        body: JSON.stringify(Bp(e.entity_type, o))
      });
      break;
    case "update":
      r = await fetch(`${Mn}${t}/${e.entity_id}`, {
        method: "PATCH",
        headers: ts(),
        body: JSON.stringify(Bp(e.entity_type, o))
      });
      break;
    case "delete":
      r = await fetch(`${Mn}${t}/${e.entity_id}`, {
        method: "DELETE",
        headers: ts()
      });
      break;
    default:
      return console.warn(`[SyncEngine] Unknown operation: ${e.operation}`), !1;
  }
  if (!r.ok) {
    const c = await r.text();
    throw new Error(`API error ${r.status}: ${c}`);
  }
  if (e.operation === "create" || e.operation === "update") {
    const c = await r.json();
    JS(e.entity_type, e.entity_id, c.updatedAt ? new Date(c.updatedAt).getTime() : Date.now());
  }
  return !0;
}
async function i$() {
  console.log("[SyncEngine] Pulling server changes...");
  const e = Qe.lastSyncTime, t = e ? new Date(e).toISOString() : void 0;
  await xa("workspace", t), await xa("project", t), await xa("task", t), await xa("pomodoro_session", t);
}
async function xa(e, t) {
  const o = R0(e);
  if (o)
    try {
      Qe.currentOperation = `Fetching ${e}s`, Wr();
      let r = `${Mn}${o}`;
      t && (r += `?updatedSince=${t}`);
      const c = await fetch(r, {
        method: "GET",
        headers: ts()
      });
      if (!c.ok)
        throw new Error(`Failed to fetch ${e}s: ${c.status}`);
      const n = await c.json(), s = Array.isArray(n) ? n : n.data || n.items || [];
      if (s.length > 0) {
        console.log(`[SyncEngine] Received ${s.length} ${e}s from server`);
        const l = s.map((a) => a$(e, a));
        YS(e, l);
      }
    } catch (r) {
      console.error(`[SyncEngine] Failed to pull ${e}s:`, r);
    }
}
function R0(e) {
  return {
    workspace: "/workspaces",
    project: "/projects",
    task: "/tasks",
    tag: "/tags",
    pomodoro_session: "/pomodoro-sessions"
  }[e] ?? null;
}
function ts() {
  const e = {
    "Content-Type": "application/json"
  };
  return Ir && (e.Authorization = `Bearer ${Ir}`), e;
}
function Bp(e, t) {
  const { is_synced: o, sync_status: r, local_updated_at: c, server_updated_at: n, is_deleted: s, ...l } = t, a = {};
  for (const [u, i] of Object.entries(l))
    u.endsWith("_at") || u.endsWith("_date") ? a[zp(u)] = i ? new Date(i).toISOString() : null : u.includes("_") ? a[zp(u)] = i : a[u] = i;
  return a;
}
function a$(e, t) {
  const o = {};
  for (const [r, c] of Object.entries(t)) {
    const n = s$(r);
    n.endsWith("_at") || n.endsWith("_date") ? o[n] = c ? new Date(c).getTime() : null : o[n] = c;
  }
  return o;
}
function zp(e) {
  return e.replace(/_([a-z])/g, (t, o) => o.toUpperCase());
}
function s$(e) {
  return e.replace(/[A-Z]/g, (t) => `_${t.toLowerCase()}`);
}
function o$() {
  return El();
}
function u$() {
  b0(), jn = null, Ir = null, console.log("[SyncEngine] Cleaned up");
}
const ar = new vl({
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
      shortcuts: Br
    },
    theme: "system",
    locale: "es"
  }
});
function c$(e) {
  try {
    S0(), QS(e, process.env.VITE_API_URL || "http://localhost:3001/api/v1"), console.log("[IPC] Database and Sync Engine initialized");
  } catch (t) {
    console.error("[IPC] Failed to initialize database:", t);
  }
  he.handle("minimize-window", () => {
    e.minimize();
  }), he.handle("maximize-window", () => {
    e.isMaximized() ? e.unmaximize() : e.maximize();
  }), he.handle("close-window", () => {
    ar.get("settings.minimizeToTray", !0) ? e.hide() : e.close();
  }), he.handle("is-maximized", () => e.isMaximized()), he.handle("window:setAlwaysOnTop", (t, o) => (e.setAlwaysOnTop(o), ar.set("settings.alwaysOnTop", o), o)), he.handle("window:isAlwaysOnTop", () => e.isAlwaysOnTop()), he.handle("window:show", () => {
    e.show(), e.focus();
  }), he.handle("window:hide", () => {
    e.hide();
  }), he.handle("tray:update", (t, o) => {
    ed(e, o);
  }), he.handle("notification:show", (t, o) => Ot(o) !== null), he.handle("notification:pomodoroComplete", () => {
    hn.pomodoroComplete(e);
  }), he.handle("notification:shortBreakComplete", () => {
    hn.shortBreakComplete(e);
  }), he.handle("notification:longBreakComplete", () => {
    hn.longBreakComplete(e);
  }), he.handle("notification:taskDue", (t, o) => {
    hn.taskDue(e, o);
  }), he.handle("notification:taskReminder", (t, o, r) => {
    hn.taskReminder(e, o, r);
  }), he.handle("shortcuts:getAll", () => f_()), he.handle("shortcuts:getDefaults", () => Br), he.handle("shortcuts:update", (t, o, r) => h_(e, o, r)), he.handle("shortcuts:reset", () => (n0(e, Br), ar.set("settings.shortcuts", Br), Br)), he.handle("store:get", (t, o) => ar.get(o)), he.handle("store:set", (t, o, r) => (ar.set(o, r), !0)), he.handle("store:delete", (t, o) => (ar.delete(o), !0)), he.handle("store:clear", () => (ar.clear(), !0)), he.handle("app:getVersion", () => ke.getVersion()), he.handle("app:getName", () => ke.getName()), he.handle("app:getPath", (t, o) => ke.getPath(o)), he.handle("app:isPackaged", () => ke.isPackaged), he.on("timer:stateUpdate", (t, o) => {
    ed(e, o);
  }), he.handle("db:task:create", (t, o) => PS(o)), he.handle("db:task:update", (t, o, r) => NS(o, r)), he.handle("db:task:delete", (t, o, r) => OS(o, r !== !1)), he.handle("db:task:getById", (t, o) => Qc(o)), he.handle("db:task:getByWorkspace", (t, o) => AS(o)), he.handle("db:task:getByProject", (t, o) => IS(o)), he.handle("db:task:getPending", (t, o) => CS(o)), he.handle("db:task:getUnsynced", () => DS()), he.handle("db:workspace:create", (t, o) => kS(o)), he.handle("db:workspace:getAll", () => LS()), he.handle("db:workspace:getById", (t, o) => FS(o)), he.handle("db:project:create", (t, o) => qS(o)), he.handle("db:project:getByWorkspace", (t, o) => US(o)), he.handle("db:session:create", (t, o) => jS(o)), he.handle("db:session:getByWorkspace", (t, o, r, c) => MS(o, r, c)), he.handle("sync:setAuthToken", (t, o) => (ZS(o), !0)), he.handle("sync:startAuto", (t, o) => (e$(o), !0)), he.handle("sync:stopAuto", () => (b0(), !0)), he.handle("sync:setOnlineStatus", (t, o) => (t$(o), !0)), he.handle("sync:getState", () => Hp()), he.handle("sync:force", async () => (await o$(), Hp())), he.handle("sync:getQueueStats", () => $0());
}
function Kp() {
  return ar;
}
function l$() {
  he.removeAllListeners(), al(), u$(), RS();
}
const rs = new vl({
  defaults: {
    windowState: {
      width: 1200,
      height: 800,
      isMaximized: !1
    }
  }
});
function d$() {
  const e = rs.get("windowState");
  return e.x !== void 0 && e.y !== void 0 && !Qg.getAllDisplays().some((r) => {
    const c = r.bounds;
    return e.x >= c.x && e.x < c.x + c.width && e.y >= c.y && e.y < c.y + c.height;
  }) ? {
    width: e.width,
    height: e.height,
    isMaximized: e.isMaximized
  } : e;
}
function pn(e) {
  if (!e) return;
  if (e.isMaximized()) {
    const o = rs.get("windowState");
    rs.set("windowState", {
      ...o,
      isMaximized: !0
    });
  } else {
    const o = e.getBounds();
    rs.set("windowState", {
      x: o.x,
      y: o.y,
      width: o.width,
      height: o.height,
      isMaximized: !1
    });
  }
}
function f$(e) {
  let t = null;
  e.on("resize", () => {
    t && clearTimeout(t), t = setTimeout(() => {
      pn(e);
    }, 500);
  });
  let o = null;
  e.on("move", () => {
    o && clearTimeout(o), o = setTimeout(() => {
      pn(e);
    }, 500);
  }), e.on("maximize", () => {
    pn(e);
  }), e.on("unmaximize", () => {
    pn(e);
  }), e.on("close", () => {
    pn(e);
  });
}
let Ke = null, sr = null;
const P0 = 280, h$ = 120;
function p$() {
  const e = Qg.getPrimaryDisplay(), { width: t, height: o } = e.workAreaSize;
  return {
    x: t - P0 - 20,
    y: 20
  };
}
function m$(e) {
  sr = e;
  const { x: t, y: o } = p$();
  Ke = new tl({
    width: P0,
    height: h$,
    x: t,
    y: o,
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
      preload: ht.join(__dirname, "preload.js"),
      nodeIntegration: !1,
      contextIsolation: !0
    }
  });
  const r = process.env.VITE_DEV_SERVER_URL;
  return r ? Ke.loadURL(`${r}#/timer-floating`) : Ke.loadFile(ht.join(process.env.DIST, "index.html"), {
    hash: "/timer-floating"
  }), Ke.on("close", (c) => {
    ke.isQuitting || (c.preventDefault(), Ke?.hide());
  }), Ke;
}
function y$() {
  Ke && Ke.show();
}
function Xp() {
  Ke && Ke.hide();
}
function g$() {
  Ke && (Ke.isVisible() ? Ke.hide() : Ke.show());
}
function Wp() {
  return Ke?.isVisible() ?? !1;
}
function v$() {
  Ke && (Ke.destroy(), Ke = null);
}
function _$(e) {
  Ke && !Ke.isDestroyed() && Ke.webContents.send("timer-window:state-update", e);
}
function E$(e, t) {
  Ke && Ke.setPosition(e, t);
}
function w$() {
  if (Ke) {
    const [e, t] = Ke.getPosition();
    return { x: e, y: t };
  }
  return null;
}
function S$() {
  he.handle("timer-window:show", () => {
    y$();
  }), he.handle("timer-window:hide", () => {
    Xp();
  }), he.handle("timer-window:toggle", () => (g$(), Wp())), he.handle("timer-window:isVisible", () => Wp()), he.handle("timer-window:setPosition", (e, t, o) => {
    E$(t, o);
  }), he.handle("timer-window:getPosition", () => w$()), he.handle("timer-window:action", (e, t) => {
    sr && !sr.isDestroyed() && sr.webContents.send("timer-window:action", t);
  }), he.handle("timer-window:expand", () => {
    sr && !sr.isDestroyed() && (sr.show(), sr.focus()), Xp();
  }), he.on("timer:stateUpdate", (e, t) => {
    _$(t);
  });
}
function $$() {
  he.removeHandler("timer-window:show"), he.removeHandler("timer-window:hide"), he.removeHandler("timer-window:toggle"), he.removeHandler("timer-window:isVisible"), he.removeHandler("timer-window:setPosition"), he.removeHandler("timer-window:getPosition"), he.removeHandler("timer-window:action"), he.removeHandler("timer-window:expand");
}
const Jt = "ordo";
let St = null, xn = null;
function b$(e) {
  try {
    const o = e.replace(`${Jt}://`, "").split("/"), [r, c, n] = o, s = {};
    if (c?.includes("?")) {
      const [l, a] = c.split("?");
      return new URLSearchParams(a).forEach((i, f) => {
        s[f] = i;
      }), {
        type: Yp(r),
        id: l,
        action: n,
        params: Object.keys(s).length > 0 ? s : void 0
      };
    }
    return {
      type: Yp(r),
      id: c || void 0,
      action: n || void 0,
      params: Object.keys(s).length > 0 ? s : void 0
    };
  } catch (t) {
    return console.error("[DeepLinks] Failed to parse URL:", e, t), { type: "unknown" };
  }
}
function Yp(e) {
  return ["task", "project", "workspace", "timer", "settings"].includes(e) ? e : "unknown";
}
function Zc(e) {
  if (console.log("[DeepLinks] Handling URL:", e), !St || St.isDestroyed()) {
    xn = e;
    return;
  }
  const t = b$(e);
  console.log("[DeepLinks] Parsed data:", t), St.isMinimized() && St.restore(), St.show(), St.focus(), St.webContents.send("deep-link", t);
}
function T$() {
  xn && (Zc(xn), xn = null);
}
function R$(e) {
  if (St = e, process.defaultApp ? process.argv.length >= 2 && ke.setAsDefaultProtocolClient(Jt, process.execPath, [process.argv[1]]) : ke.setAsDefaultProtocolClient(Jt), !ke.requestSingleInstanceLock()) {
    ke.quit();
    return;
  }
  ke.on("second-instance", (r, c) => {
    St && (St.isMinimized() && St.restore(), St.focus());
    const n = c.find((s) => s.startsWith(`${Jt}://`));
    n && Zc(n);
  }), ke.on("open-url", (r, c) => {
    r.preventDefault(), Zc(c);
  });
  const o = process.argv.find((r) => r.startsWith(`${Jt}://`));
  o && (xn = o), console.log(`[DeepLinks] Protocol "${Jt}://" registered`);
}
function P$() {
  process.defaultApp ? process.argv.length >= 2 && ke.removeAsDefaultProtocolClient(Jt, process.execPath, [process.argv[1]]) : ke.removeAsDefaultProtocolClient(Jt), console.log(`[DeepLinks] Protocol "${Jt}://" unregistered`);
}
var Rr = {}, Jo = {}, Va = {}, Jp;
function _t() {
  return Jp || (Jp = 1, Va.fromCallback = function(e) {
    return Object.defineProperty(function(...t) {
      if (typeof t[t.length - 1] == "function") e.apply(this, t);
      else
        return new Promise((o, r) => {
          t.push((c, n) => c != null ? r(c) : o(n)), e.apply(this, t);
        });
    }, "name", { value: e.name });
  }, Va.fromPromise = function(e) {
    return Object.defineProperty(function(...t) {
      const o = t[t.length - 1];
      if (typeof o != "function") return e.apply(this, t);
      t.pop(), e.apply(this, t).then((r) => o(null, r), o);
    }, "name", { value: e.name });
  }), Va;
}
var Qo, Qp;
function N$() {
  if (Qp) return Qo;
  Qp = 1;
  var e = i_, t = process.cwd, o = null, r = process.env.GRACEFUL_FS_PLATFORM || process.platform;
  process.cwd = function() {
    return o || (o = t.call(process)), o;
  };
  try {
    process.cwd();
  } catch {
  }
  if (typeof process.chdir == "function") {
    var c = process.chdir;
    process.chdir = function(s) {
      o = null, c.call(process, s);
    }, Object.setPrototypeOf && Object.setPrototypeOf(process.chdir, c);
  }
  Qo = n;
  function n(s) {
    e.hasOwnProperty("O_SYMLINK") && process.version.match(/^v0\.6\.[0-2]|^v0\.5\./) && l(s), s.lutimes || a(s), s.chown = f(s.chown), s.fchown = f(s.fchown), s.lchown = f(s.lchown), s.chmod = u(s.chmod), s.fchmod = u(s.fchmod), s.lchmod = u(s.lchmod), s.chownSync = d(s.chownSync), s.fchownSync = d(s.fchownSync), s.lchownSync = d(s.lchownSync), s.chmodSync = i(s.chmodSync), s.fchmodSync = i(s.fchmodSync), s.lchmodSync = i(s.lchmodSync), s.stat = m(s.stat), s.fstat = m(s.fstat), s.lstat = m(s.lstat), s.statSync = g(s.statSync), s.fstatSync = g(s.fstatSync), s.lstatSync = g(s.lstatSync), s.chmod && !s.lchmod && (s.lchmod = function(h, y, p) {
      p && process.nextTick(p);
    }, s.lchmodSync = function() {
    }), s.chown && !s.lchown && (s.lchown = function(h, y, p, E) {
      E && process.nextTick(E);
    }, s.lchownSync = function() {
    }), r === "win32" && (s.rename = typeof s.rename != "function" ? s.rename : (function(h) {
      function y(p, E, $) {
        var S = Date.now(), _ = 0;
        h(p, E, function w(R) {
          if (R && (R.code === "EACCES" || R.code === "EPERM" || R.code === "EBUSY") && Date.now() - S < 6e4) {
            setTimeout(function() {
              s.stat(E, function(P, j) {
                P && P.code === "ENOENT" ? h(p, E, w) : $(R);
              });
            }, _), _ < 100 && (_ += 10);
            return;
          }
          $ && $(R);
        });
      }
      return Object.setPrototypeOf && Object.setPrototypeOf(y, h), y;
    })(s.rename)), s.read = typeof s.read != "function" ? s.read : (function(h) {
      function y(p, E, $, S, _, w) {
        var R;
        if (w && typeof w == "function") {
          var P = 0;
          R = function(j, M, B) {
            if (j && j.code === "EAGAIN" && P < 10)
              return P++, h.call(s, p, E, $, S, _, R);
            w.apply(this, arguments);
          };
        }
        return h.call(s, p, E, $, S, _, R);
      }
      return Object.setPrototypeOf && Object.setPrototypeOf(y, h), y;
    })(s.read), s.readSync = typeof s.readSync != "function" ? s.readSync : /* @__PURE__ */ (function(h) {
      return function(y, p, E, $, S) {
        for (var _ = 0; ; )
          try {
            return h.call(s, y, p, E, $, S);
          } catch (w) {
            if (w.code === "EAGAIN" && _ < 10) {
              _++;
              continue;
            }
            throw w;
          }
      };
    })(s.readSync);
    function l(h) {
      h.lchmod = function(y, p, E) {
        h.open(
          y,
          e.O_WRONLY | e.O_SYMLINK,
          p,
          function($, S) {
            if ($) {
              E && E($);
              return;
            }
            h.fchmod(S, p, function(_) {
              h.close(S, function(w) {
                E && E(_ || w);
              });
            });
          }
        );
      }, h.lchmodSync = function(y, p) {
        var E = h.openSync(y, e.O_WRONLY | e.O_SYMLINK, p), $ = !0, S;
        try {
          S = h.fchmodSync(E, p), $ = !1;
        } finally {
          if ($)
            try {
              h.closeSync(E);
            } catch {
            }
          else
            h.closeSync(E);
        }
        return S;
      };
    }
    function a(h) {
      e.hasOwnProperty("O_SYMLINK") && h.futimes ? (h.lutimes = function(y, p, E, $) {
        h.open(y, e.O_SYMLINK, function(S, _) {
          if (S) {
            $ && $(S);
            return;
          }
          h.futimes(_, p, E, function(w) {
            h.close(_, function(R) {
              $ && $(w || R);
            });
          });
        });
      }, h.lutimesSync = function(y, p, E) {
        var $ = h.openSync(y, e.O_SYMLINK), S, _ = !0;
        try {
          S = h.futimesSync($, p, E), _ = !1;
        } finally {
          if (_)
            try {
              h.closeSync($);
            } catch {
            }
          else
            h.closeSync($);
        }
        return S;
      }) : h.futimes && (h.lutimes = function(y, p, E, $) {
        $ && process.nextTick($);
      }, h.lutimesSync = function() {
      });
    }
    function u(h) {
      return h && function(y, p, E) {
        return h.call(s, y, p, function($) {
          v($) && ($ = null), E && E.apply(this, arguments);
        });
      };
    }
    function i(h) {
      return h && function(y, p) {
        try {
          return h.call(s, y, p);
        } catch (E) {
          if (!v(E)) throw E;
        }
      };
    }
    function f(h) {
      return h && function(y, p, E, $) {
        return h.call(s, y, p, E, function(S) {
          v(S) && (S = null), $ && $.apply(this, arguments);
        });
      };
    }
    function d(h) {
      return h && function(y, p, E) {
        try {
          return h.call(s, y, p, E);
        } catch ($) {
          if (!v($)) throw $;
        }
      };
    }
    function m(h) {
      return h && function(y, p, E) {
        typeof p == "function" && (E = p, p = null);
        function $(S, _) {
          _ && (_.uid < 0 && (_.uid += 4294967296), _.gid < 0 && (_.gid += 4294967296)), E && E.apply(this, arguments);
        }
        return p ? h.call(s, y, p, $) : h.call(s, y, $);
      };
    }
    function g(h) {
      return h && function(y, p) {
        var E = p ? h.call(s, y, p) : h.call(s, y);
        return E && (E.uid < 0 && (E.uid += 4294967296), E.gid < 0 && (E.gid += 4294967296)), E;
      };
    }
    function v(h) {
      if (!h || h.code === "ENOSYS")
        return !0;
      var y = !process.getuid || process.getuid() !== 0;
      return !!(y && (h.code === "EINVAL" || h.code === "EPERM"));
    }
  }
  return Qo;
}
var Zo, Zp;
function O$() {
  if (Zp) return Zo;
  Zp = 1;
  var e = Hn.Stream;
  Zo = t;
  function t(o) {
    return {
      ReadStream: r,
      WriteStream: c
    };
    function r(n, s) {
      if (!(this instanceof r)) return new r(n, s);
      e.call(this);
      var l = this;
      this.path = n, this.fd = null, this.readable = !0, this.paused = !1, this.flags = "r", this.mode = 438, this.bufferSize = 64 * 1024, s = s || {};
      for (var a = Object.keys(s), u = 0, i = a.length; u < i; u++) {
        var f = a[u];
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
          l._read();
        });
        return;
      }
      o.open(this.path, this.flags, this.mode, function(d, m) {
        if (d) {
          l.emit("error", d), l.readable = !1;
          return;
        }
        l.fd = m, l.emit("open", m), l._read();
      });
    }
    function c(n, s) {
      if (!(this instanceof c)) return new c(n, s);
      e.call(this), this.path = n, this.fd = null, this.writable = !0, this.flags = "w", this.encoding = "binary", this.mode = 438, this.bytesWritten = 0, s = s || {};
      for (var l = Object.keys(s), a = 0, u = l.length; a < u; a++) {
        var i = l[a];
        this[i] = s[i];
      }
      if (this.start !== void 0) {
        if (typeof this.start != "number")
          throw TypeError("start must be a Number");
        if (this.start < 0)
          throw new Error("start must be >= zero");
        this.pos = this.start;
      }
      this.busy = !1, this._queue = [], this.fd === null && (this._open = o.open, this._queue.push([this._open, this.path, this.flags, this.mode, void 0]), this.flush());
    }
  }
  return Zo;
}
var eu, em;
function A$() {
  if (em) return eu;
  em = 1, eu = t;
  var e = Object.getPrototypeOf || function(o) {
    return o.__proto__;
  };
  function t(o) {
    if (o === null || typeof o != "object")
      return o;
    if (o instanceof Object)
      var r = { __proto__: e(o) };
    else
      var r = /* @__PURE__ */ Object.create(null);
    return Object.getOwnPropertyNames(o).forEach(function(c) {
      Object.defineProperty(r, c, Object.getOwnPropertyDescriptor(o, c));
    }), r;
  }
  return eu;
}
var Ga, tm;
function pt() {
  if (tm) return Ga;
  tm = 1;
  var e = Ct, t = N$(), o = O$(), r = A$(), c = Vn, n, s;
  typeof Symbol == "function" && typeof Symbol.for == "function" ? (n = Symbol.for("graceful-fs.queue"), s = Symbol.for("graceful-fs.previous")) : (n = "___graceful-fs.queue", s = "___graceful-fs.previous");
  function l() {
  }
  function a(h, y) {
    Object.defineProperty(h, n, {
      get: function() {
        return y;
      }
    });
  }
  var u = l;
  if (c.debuglog ? u = c.debuglog("gfs4") : /\bgfs4\b/i.test(process.env.NODE_DEBUG || "") && (u = function() {
    var h = c.format.apply(c, arguments);
    h = "GFS4: " + h.split(/\n/).join(`
GFS4: `), console.error(h);
  }), !e[n]) {
    var i = It[n] || [];
    a(e, i), e.close = (function(h) {
      function y(p, E) {
        return h.call(e, p, function($) {
          $ || g(), typeof E == "function" && E.apply(this, arguments);
        });
      }
      return Object.defineProperty(y, s, {
        value: h
      }), y;
    })(e.close), e.closeSync = (function(h) {
      function y(p) {
        h.apply(e, arguments), g();
      }
      return Object.defineProperty(y, s, {
        value: h
      }), y;
    })(e.closeSync), /\bgfs4\b/i.test(process.env.NODE_DEBUG || "") && process.on("exit", function() {
      u(e[n]), rl.equal(e[n].length, 0);
    });
  }
  It[n] || a(It, e[n]), Ga = f(r(e)), process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !e.__patched && (Ga = f(e), e.__patched = !0);
  function f(h) {
    t(h), h.gracefulify = f, h.createReadStream = I, h.createWriteStream = U;
    var y = h.readFile;
    h.readFile = p;
    function p(N, V, A) {
      return typeof V == "function" && (A = V, V = null), O(N, V, A);
      function O(Z, z, C, L) {
        return y(Z, z, function(X) {
          X && (X.code === "EMFILE" || X.code === "ENFILE") ? d([O, [Z, z, C], X, L || Date.now(), Date.now()]) : typeof C == "function" && C.apply(this, arguments);
        });
      }
    }
    var E = h.writeFile;
    h.writeFile = $;
    function $(N, V, A, O) {
      return typeof A == "function" && (O = A, A = null), Z(N, V, A, O);
      function Z(z, C, L, X, Q) {
        return E(z, C, L, function(re) {
          re && (re.code === "EMFILE" || re.code === "ENFILE") ? d([Z, [z, C, L, X], re, Q || Date.now(), Date.now()]) : typeof X == "function" && X.apply(this, arguments);
        });
      }
    }
    var S = h.appendFile;
    S && (h.appendFile = _);
    function _(N, V, A, O) {
      return typeof A == "function" && (O = A, A = null), Z(N, V, A, O);
      function Z(z, C, L, X, Q) {
        return S(z, C, L, function(re) {
          re && (re.code === "EMFILE" || re.code === "ENFILE") ? d([Z, [z, C, L, X], re, Q || Date.now(), Date.now()]) : typeof X == "function" && X.apply(this, arguments);
        });
      }
    }
    var w = h.copyFile;
    w && (h.copyFile = R);
    function R(N, V, A, O) {
      return typeof A == "function" && (O = A, A = 0), Z(N, V, A, O);
      function Z(z, C, L, X, Q) {
        return w(z, C, L, function(re) {
          re && (re.code === "EMFILE" || re.code === "ENFILE") ? d([Z, [z, C, L, X], re, Q || Date.now(), Date.now()]) : typeof X == "function" && X.apply(this, arguments);
        });
      }
    }
    var P = h.readdir;
    h.readdir = M;
    var j = /^v[0-5]\./;
    function M(N, V, A) {
      typeof V == "function" && (A = V, V = null);
      var O = j.test(process.version) ? function(C, L, X, Q) {
        return P(C, Z(
          C,
          L,
          X,
          Q
        ));
      } : function(C, L, X, Q) {
        return P(C, L, Z(
          C,
          L,
          X,
          Q
        ));
      };
      return O(N, V, A);
      function Z(z, C, L, X) {
        return function(Q, re) {
          Q && (Q.code === "EMFILE" || Q.code === "ENFILE") ? d([
            O,
            [z, C, L],
            Q,
            X || Date.now(),
            Date.now()
          ]) : (re && re.sort && re.sort(), typeof L == "function" && L.call(this, Q, re));
        };
      }
    }
    if (process.version.substr(0, 4) === "v0.8") {
      var B = o(h);
      H = B.ReadStream, Y = B.WriteStream;
    }
    var W = h.ReadStream;
    W && (H.prototype = Object.create(W.prototype), H.prototype.open = G);
    var F = h.WriteStream;
    F && (Y.prototype = Object.create(F.prototype), Y.prototype.open = k), Object.defineProperty(h, "ReadStream", {
      get: function() {
        return H;
      },
      set: function(N) {
        H = N;
      },
      enumerable: !0,
      configurable: !0
    }), Object.defineProperty(h, "WriteStream", {
      get: function() {
        return Y;
      },
      set: function(N) {
        Y = N;
      },
      enumerable: !0,
      configurable: !0
    });
    var q = H;
    Object.defineProperty(h, "FileReadStream", {
      get: function() {
        return q;
      },
      set: function(N) {
        q = N;
      },
      enumerable: !0,
      configurable: !0
    });
    var J = Y;
    Object.defineProperty(h, "FileWriteStream", {
      get: function() {
        return J;
      },
      set: function(N) {
        J = N;
      },
      enumerable: !0,
      configurable: !0
    });
    function H(N, V) {
      return this instanceof H ? (W.apply(this, arguments), this) : H.apply(Object.create(H.prototype), arguments);
    }
    function G() {
      var N = this;
      T(N.path, N.flags, N.mode, function(V, A) {
        V ? (N.autoClose && N.destroy(), N.emit("error", V)) : (N.fd = A, N.emit("open", A), N.read());
      });
    }
    function Y(N, V) {
      return this instanceof Y ? (F.apply(this, arguments), this) : Y.apply(Object.create(Y.prototype), arguments);
    }
    function k() {
      var N = this;
      T(N.path, N.flags, N.mode, function(V, A) {
        V ? (N.destroy(), N.emit("error", V)) : (N.fd = A, N.emit("open", A));
      });
    }
    function I(N, V) {
      return new h.ReadStream(N, V);
    }
    function U(N, V) {
      return new h.WriteStream(N, V);
    }
    var D = h.open;
    h.open = T;
    function T(N, V, A, O) {
      return typeof A == "function" && (O = A, A = null), Z(N, V, A, O);
      function Z(z, C, L, X, Q) {
        return D(z, C, L, function(re, de) {
          re && (re.code === "EMFILE" || re.code === "ENFILE") ? d([Z, [z, C, L, X], re, Q || Date.now(), Date.now()]) : typeof X == "function" && X.apply(this, arguments);
        });
      }
    }
    return h;
  }
  function d(h) {
    u("ENQUEUE", h[0].name, h[1]), e[n].push(h), v();
  }
  var m;
  function g() {
    for (var h = Date.now(), y = 0; y < e[n].length; ++y)
      e[n][y].length > 2 && (e[n][y][3] = h, e[n][y][4] = h);
    v();
  }
  function v() {
    if (clearTimeout(m), m = void 0, e[n].length !== 0) {
      var h = e[n].shift(), y = h[0], p = h[1], E = h[2], $ = h[3], S = h[4];
      if ($ === void 0)
        u("RETRY", y.name, p), y.apply(null, p);
      else if (Date.now() - $ >= 6e4) {
        u("TIMEOUT", y.name, p);
        var _ = p.pop();
        typeof _ == "function" && _.call(null, E);
      } else {
        var w = Date.now() - S, R = Math.max(S - $, 1), P = Math.min(R * 1.2, 100);
        w >= P ? (u("RETRY", y.name, p), y.apply(null, p.concat([$]))) : e[n].push(h);
      }
      m === void 0 && (m = setTimeout(v, 0));
    }
  }
  return Ga;
}
var rm;
function en() {
  return rm || (rm = 1, (function(e) {
    const t = _t().fromCallback, o = pt(), r = [
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
    ].filter((c) => typeof o[c] == "function");
    Object.assign(e, o), r.forEach((c) => {
      e[c] = t(o[c]);
    }), e.exists = function(c, n) {
      return typeof n == "function" ? o.exists(c, n) : new Promise((s) => o.exists(c, s));
    }, e.read = function(c, n, s, l, a, u) {
      return typeof u == "function" ? o.read(c, n, s, l, a, u) : new Promise((i, f) => {
        o.read(c, n, s, l, a, (d, m, g) => {
          if (d) return f(d);
          i({ bytesRead: m, buffer: g });
        });
      });
    }, e.write = function(c, n, ...s) {
      return typeof s[s.length - 1] == "function" ? o.write(c, n, ...s) : new Promise((l, a) => {
        o.write(c, n, ...s, (u, i, f) => {
          if (u) return a(u);
          l({ bytesWritten: i, buffer: f });
        });
      });
    }, typeof o.writev == "function" && (e.writev = function(c, n, ...s) {
      return typeof s[s.length - 1] == "function" ? o.writev(c, n, ...s) : new Promise((l, a) => {
        o.writev(c, n, ...s, (u, i, f) => {
          if (u) return a(u);
          l({ bytesWritten: i, buffers: f });
        });
      });
    }), typeof o.realpath.native == "function" ? e.realpath.native = t(o.realpath.native) : process.emitWarning(
      "fs.realpath.native is not a function. Is fs being monkey-patched?",
      "Warning",
      "fs-extra-WARN0003"
    );
  })(Jo)), Jo;
}
var Ha = {}, tu = {}, nm;
function I$() {
  if (nm) return tu;
  nm = 1;
  const e = Me;
  return tu.checkPath = function(o) {
    if (process.platform === "win32" && /[<>:"|?*]/.test(o.replace(e.parse(o).root, ""))) {
      const c = new Error(`Path contains invalid characters: ${o}`);
      throw c.code = "EINVAL", c;
    }
  }, tu;
}
var im;
function C$() {
  if (im) return Ha;
  im = 1;
  const e = /* @__PURE__ */ en(), { checkPath: t } = /* @__PURE__ */ I$(), o = (r) => {
    const c = { mode: 511 };
    return typeof r == "number" ? r : { ...c, ...r }.mode;
  };
  return Ha.makeDir = async (r, c) => (t(r), e.mkdir(r, {
    mode: o(c),
    recursive: !0
  })), Ha.makeDirSync = (r, c) => (t(r), e.mkdirSync(r, {
    mode: o(c),
    recursive: !0
  })), Ha;
}
var ru, am;
function Mt() {
  if (am) return ru;
  am = 1;
  const e = _t().fromPromise, { makeDir: t, makeDirSync: o } = /* @__PURE__ */ C$(), r = e(t);
  return ru = {
    mkdirs: r,
    mkdirsSync: o,
    // alias
    mkdirp: r,
    mkdirpSync: o,
    ensureDir: r,
    ensureDirSync: o
  }, ru;
}
var nu, sm;
function Cr() {
  if (sm) return nu;
  sm = 1;
  const e = _t().fromPromise, t = /* @__PURE__ */ en();
  function o(r) {
    return t.access(r).then(() => !0).catch(() => !1);
  }
  return nu = {
    pathExists: e(o),
    pathExistsSync: t.existsSync
  }, nu;
}
var iu, om;
function N0() {
  if (om) return iu;
  om = 1;
  const e = pt();
  function t(r, c, n, s) {
    e.open(r, "r+", (l, a) => {
      if (l) return s(l);
      e.futimes(a, c, n, (u) => {
        e.close(a, (i) => {
          s && s(u || i);
        });
      });
    });
  }
  function o(r, c, n) {
    const s = e.openSync(r, "r+");
    return e.futimesSync(s, c, n), e.closeSync(s);
  }
  return iu = {
    utimesMillis: t,
    utimesMillisSync: o
  }, iu;
}
var au, um;
function tn() {
  if (um) return au;
  um = 1;
  const e = /* @__PURE__ */ en(), t = Me, o = Vn;
  function r(d, m, g) {
    const v = g.dereference ? (h) => e.stat(h, { bigint: !0 }) : (h) => e.lstat(h, { bigint: !0 });
    return Promise.all([
      v(d),
      v(m).catch((h) => {
        if (h.code === "ENOENT") return null;
        throw h;
      })
    ]).then(([h, y]) => ({ srcStat: h, destStat: y }));
  }
  function c(d, m, g) {
    let v;
    const h = g.dereference ? (p) => e.statSync(p, { bigint: !0 }) : (p) => e.lstatSync(p, { bigint: !0 }), y = h(d);
    try {
      v = h(m);
    } catch (p) {
      if (p.code === "ENOENT") return { srcStat: y, destStat: null };
      throw p;
    }
    return { srcStat: y, destStat: v };
  }
  function n(d, m, g, v, h) {
    o.callbackify(r)(d, m, v, (y, p) => {
      if (y) return h(y);
      const { srcStat: E, destStat: $ } = p;
      if ($) {
        if (u(E, $)) {
          const S = t.basename(d), _ = t.basename(m);
          return g === "move" && S !== _ && S.toLowerCase() === _.toLowerCase() ? h(null, { srcStat: E, destStat: $, isChangingCase: !0 }) : h(new Error("Source and destination must not be the same."));
        }
        if (E.isDirectory() && !$.isDirectory())
          return h(new Error(`Cannot overwrite non-directory '${m}' with directory '${d}'.`));
        if (!E.isDirectory() && $.isDirectory())
          return h(new Error(`Cannot overwrite directory '${m}' with non-directory '${d}'.`));
      }
      return E.isDirectory() && i(d, m) ? h(new Error(f(d, m, g))) : h(null, { srcStat: E, destStat: $ });
    });
  }
  function s(d, m, g, v) {
    const { srcStat: h, destStat: y } = c(d, m, v);
    if (y) {
      if (u(h, y)) {
        const p = t.basename(d), E = t.basename(m);
        if (g === "move" && p !== E && p.toLowerCase() === E.toLowerCase())
          return { srcStat: h, destStat: y, isChangingCase: !0 };
        throw new Error("Source and destination must not be the same.");
      }
      if (h.isDirectory() && !y.isDirectory())
        throw new Error(`Cannot overwrite non-directory '${m}' with directory '${d}'.`);
      if (!h.isDirectory() && y.isDirectory())
        throw new Error(`Cannot overwrite directory '${m}' with non-directory '${d}'.`);
    }
    if (h.isDirectory() && i(d, m))
      throw new Error(f(d, m, g));
    return { srcStat: h, destStat: y };
  }
  function l(d, m, g, v, h) {
    const y = t.resolve(t.dirname(d)), p = t.resolve(t.dirname(g));
    if (p === y || p === t.parse(p).root) return h();
    e.stat(p, { bigint: !0 }, (E, $) => E ? E.code === "ENOENT" ? h() : h(E) : u(m, $) ? h(new Error(f(d, g, v))) : l(d, m, p, v, h));
  }
  function a(d, m, g, v) {
    const h = t.resolve(t.dirname(d)), y = t.resolve(t.dirname(g));
    if (y === h || y === t.parse(y).root) return;
    let p;
    try {
      p = e.statSync(y, { bigint: !0 });
    } catch (E) {
      if (E.code === "ENOENT") return;
      throw E;
    }
    if (u(m, p))
      throw new Error(f(d, g, v));
    return a(d, m, y, v);
  }
  function u(d, m) {
    return m.ino && m.dev && m.ino === d.ino && m.dev === d.dev;
  }
  function i(d, m) {
    const g = t.resolve(d).split(t.sep).filter((h) => h), v = t.resolve(m).split(t.sep).filter((h) => h);
    return g.reduce((h, y, p) => h && v[p] === y, !0);
  }
  function f(d, m, g) {
    return `Cannot ${g} '${d}' to a subdirectory of itself, '${m}'.`;
  }
  return au = {
    checkPaths: n,
    checkPathsSync: s,
    checkParentPaths: l,
    checkParentPathsSync: a,
    isSrcSubdir: i,
    areIdentical: u
  }, au;
}
var su, cm;
function D$() {
  if (cm) return su;
  cm = 1;
  const e = pt(), t = Me, o = Mt().mkdirs, r = Cr().pathExists, c = N0().utimesMillis, n = /* @__PURE__ */ tn();
  function s(M, B, W, F) {
    typeof W == "function" && !F ? (F = W, W = {}) : typeof W == "function" && (W = { filter: W }), F = F || function() {
    }, W = W || {}, W.clobber = "clobber" in W ? !!W.clobber : !0, W.overwrite = "overwrite" in W ? !!W.overwrite : W.clobber, W.preserveTimestamps && process.arch === "ia32" && process.emitWarning(
      `Using the preserveTimestamps option in 32-bit node is not recommended;

	see https://github.com/jprichardson/node-fs-extra/issues/269`,
      "Warning",
      "fs-extra-WARN0001"
    ), n.checkPaths(M, B, "copy", W, (q, J) => {
      if (q) return F(q);
      const { srcStat: H, destStat: G } = J;
      n.checkParentPaths(M, H, B, "copy", (Y) => Y ? F(Y) : W.filter ? a(l, G, M, B, W, F) : l(G, M, B, W, F));
    });
  }
  function l(M, B, W, F, q) {
    const J = t.dirname(W);
    r(J, (H, G) => {
      if (H) return q(H);
      if (G) return i(M, B, W, F, q);
      o(J, (Y) => Y ? q(Y) : i(M, B, W, F, q));
    });
  }
  function a(M, B, W, F, q, J) {
    Promise.resolve(q.filter(W, F)).then((H) => H ? M(B, W, F, q, J) : J(), (H) => J(H));
  }
  function u(M, B, W, F, q) {
    return F.filter ? a(i, M, B, W, F, q) : i(M, B, W, F, q);
  }
  function i(M, B, W, F, q) {
    (F.dereference ? e.stat : e.lstat)(B, (H, G) => H ? q(H) : G.isDirectory() ? $(G, M, B, W, F, q) : G.isFile() || G.isCharacterDevice() || G.isBlockDevice() ? f(G, M, B, W, F, q) : G.isSymbolicLink() ? P(M, B, W, F, q) : G.isSocket() ? q(new Error(`Cannot copy a socket file: ${B}`)) : G.isFIFO() ? q(new Error(`Cannot copy a FIFO pipe: ${B}`)) : q(new Error(`Unknown file: ${B}`)));
  }
  function f(M, B, W, F, q, J) {
    return B ? d(M, W, F, q, J) : m(M, W, F, q, J);
  }
  function d(M, B, W, F, q) {
    if (F.overwrite)
      e.unlink(W, (J) => J ? q(J) : m(M, B, W, F, q));
    else return F.errorOnExist ? q(new Error(`'${W}' already exists`)) : q();
  }
  function m(M, B, W, F, q) {
    e.copyFile(B, W, (J) => J ? q(J) : F.preserveTimestamps ? g(M.mode, B, W, q) : p(W, M.mode, q));
  }
  function g(M, B, W, F) {
    return v(M) ? h(W, M, (q) => q ? F(q) : y(M, B, W, F)) : y(M, B, W, F);
  }
  function v(M) {
    return (M & 128) === 0;
  }
  function h(M, B, W) {
    return p(M, B | 128, W);
  }
  function y(M, B, W, F) {
    E(B, W, (q) => q ? F(q) : p(W, M, F));
  }
  function p(M, B, W) {
    return e.chmod(M, B, W);
  }
  function E(M, B, W) {
    e.stat(M, (F, q) => F ? W(F) : c(B, q.atime, q.mtime, W));
  }
  function $(M, B, W, F, q, J) {
    return B ? _(W, F, q, J) : S(M.mode, W, F, q, J);
  }
  function S(M, B, W, F, q) {
    e.mkdir(W, (J) => {
      if (J) return q(J);
      _(B, W, F, (H) => H ? q(H) : p(W, M, q));
    });
  }
  function _(M, B, W, F) {
    e.readdir(M, (q, J) => q ? F(q) : w(J, M, B, W, F));
  }
  function w(M, B, W, F, q) {
    const J = M.pop();
    return J ? R(M, J, B, W, F, q) : q();
  }
  function R(M, B, W, F, q, J) {
    const H = t.join(W, B), G = t.join(F, B);
    n.checkPaths(H, G, "copy", q, (Y, k) => {
      if (Y) return J(Y);
      const { destStat: I } = k;
      u(I, H, G, q, (U) => U ? J(U) : w(M, W, F, q, J));
    });
  }
  function P(M, B, W, F, q) {
    e.readlink(B, (J, H) => {
      if (J) return q(J);
      if (F.dereference && (H = t.resolve(process.cwd(), H)), M)
        e.readlink(W, (G, Y) => G ? G.code === "EINVAL" || G.code === "UNKNOWN" ? e.symlink(H, W, q) : q(G) : (F.dereference && (Y = t.resolve(process.cwd(), Y)), n.isSrcSubdir(H, Y) ? q(new Error(`Cannot copy '${H}' to a subdirectory of itself, '${Y}'.`)) : M.isDirectory() && n.isSrcSubdir(Y, H) ? q(new Error(`Cannot overwrite '${Y}' with '${H}'.`)) : j(H, W, q)));
      else
        return e.symlink(H, W, q);
    });
  }
  function j(M, B, W) {
    e.unlink(B, (F) => F ? W(F) : e.symlink(M, B, W));
  }
  return su = s, su;
}
var ou, lm;
function k$() {
  if (lm) return ou;
  lm = 1;
  const e = pt(), t = Me, o = Mt().mkdirsSync, r = N0().utimesMillisSync, c = /* @__PURE__ */ tn();
  function n(w, R, P) {
    typeof P == "function" && (P = { filter: P }), P = P || {}, P.clobber = "clobber" in P ? !!P.clobber : !0, P.overwrite = "overwrite" in P ? !!P.overwrite : P.clobber, P.preserveTimestamps && process.arch === "ia32" && process.emitWarning(
      `Using the preserveTimestamps option in 32-bit node is not recommended;

	see https://github.com/jprichardson/node-fs-extra/issues/269`,
      "Warning",
      "fs-extra-WARN0002"
    );
    const { srcStat: j, destStat: M } = c.checkPathsSync(w, R, "copy", P);
    return c.checkParentPathsSync(w, j, R, "copy"), s(M, w, R, P);
  }
  function s(w, R, P, j) {
    if (j.filter && !j.filter(R, P)) return;
    const M = t.dirname(P);
    return e.existsSync(M) || o(M), a(w, R, P, j);
  }
  function l(w, R, P, j) {
    if (!(j.filter && !j.filter(R, P)))
      return a(w, R, P, j);
  }
  function a(w, R, P, j) {
    const B = (j.dereference ? e.statSync : e.lstatSync)(R);
    if (B.isDirectory()) return y(B, w, R, P, j);
    if (B.isFile() || B.isCharacterDevice() || B.isBlockDevice()) return u(B, w, R, P, j);
    if (B.isSymbolicLink()) return S(w, R, P, j);
    throw B.isSocket() ? new Error(`Cannot copy a socket file: ${R}`) : B.isFIFO() ? new Error(`Cannot copy a FIFO pipe: ${R}`) : new Error(`Unknown file: ${R}`);
  }
  function u(w, R, P, j, M) {
    return R ? i(w, P, j, M) : f(w, P, j, M);
  }
  function i(w, R, P, j) {
    if (j.overwrite)
      return e.unlinkSync(P), f(w, R, P, j);
    if (j.errorOnExist)
      throw new Error(`'${P}' already exists`);
  }
  function f(w, R, P, j) {
    return e.copyFileSync(R, P), j.preserveTimestamps && d(w.mode, R, P), v(P, w.mode);
  }
  function d(w, R, P) {
    return m(w) && g(P, w), h(R, P);
  }
  function m(w) {
    return (w & 128) === 0;
  }
  function g(w, R) {
    return v(w, R | 128);
  }
  function v(w, R) {
    return e.chmodSync(w, R);
  }
  function h(w, R) {
    const P = e.statSync(w);
    return r(R, P.atime, P.mtime);
  }
  function y(w, R, P, j, M) {
    return R ? E(P, j, M) : p(w.mode, P, j, M);
  }
  function p(w, R, P, j) {
    return e.mkdirSync(P), E(R, P, j), v(P, w);
  }
  function E(w, R, P) {
    e.readdirSync(w).forEach((j) => $(j, w, R, P));
  }
  function $(w, R, P, j) {
    const M = t.join(R, w), B = t.join(P, w), { destStat: W } = c.checkPathsSync(M, B, "copy", j);
    return l(W, M, B, j);
  }
  function S(w, R, P, j) {
    let M = e.readlinkSync(R);
    if (j.dereference && (M = t.resolve(process.cwd(), M)), w) {
      let B;
      try {
        B = e.readlinkSync(P);
      } catch (W) {
        if (W.code === "EINVAL" || W.code === "UNKNOWN") return e.symlinkSync(M, P);
        throw W;
      }
      if (j.dereference && (B = t.resolve(process.cwd(), B)), c.isSrcSubdir(M, B))
        throw new Error(`Cannot copy '${M}' to a subdirectory of itself, '${B}'.`);
      if (e.statSync(P).isDirectory() && c.isSrcSubdir(B, M))
        throw new Error(`Cannot overwrite '${B}' with '${M}'.`);
      return _(M, P);
    } else
      return e.symlinkSync(M, P);
  }
  function _(w, R) {
    return e.unlinkSync(R), e.symlinkSync(w, R);
  }
  return ou = n, ou;
}
var uu, dm;
function wl() {
  if (dm) return uu;
  dm = 1;
  const e = _t().fromCallback;
  return uu = {
    copy: e(/* @__PURE__ */ D$()),
    copySync: /* @__PURE__ */ k$()
  }, uu;
}
var cu, fm;
function L$() {
  if (fm) return cu;
  fm = 1;
  const e = pt(), t = Me, o = rl, r = process.platform === "win32";
  function c(g) {
    [
      "unlink",
      "chmod",
      "stat",
      "lstat",
      "rmdir",
      "readdir"
    ].forEach((h) => {
      g[h] = g[h] || e[h], h = h + "Sync", g[h] = g[h] || e[h];
    }), g.maxBusyTries = g.maxBusyTries || 3;
  }
  function n(g, v, h) {
    let y = 0;
    typeof v == "function" && (h = v, v = {}), o(g, "rimraf: missing path"), o.strictEqual(typeof g, "string", "rimraf: path should be a string"), o.strictEqual(typeof h, "function", "rimraf: callback function required"), o(v, "rimraf: invalid options argument provided"), o.strictEqual(typeof v, "object", "rimraf: options should be object"), c(v), s(g, v, function p(E) {
      if (E) {
        if ((E.code === "EBUSY" || E.code === "ENOTEMPTY" || E.code === "EPERM") && y < v.maxBusyTries) {
          y++;
          const $ = y * 100;
          return setTimeout(() => s(g, v, p), $);
        }
        E.code === "ENOENT" && (E = null);
      }
      h(E);
    });
  }
  function s(g, v, h) {
    o(g), o(v), o(typeof h == "function"), v.lstat(g, (y, p) => {
      if (y && y.code === "ENOENT")
        return h(null);
      if (y && y.code === "EPERM" && r)
        return l(g, v, y, h);
      if (p && p.isDirectory())
        return u(g, v, y, h);
      v.unlink(g, (E) => {
        if (E) {
          if (E.code === "ENOENT")
            return h(null);
          if (E.code === "EPERM")
            return r ? l(g, v, E, h) : u(g, v, E, h);
          if (E.code === "EISDIR")
            return u(g, v, E, h);
        }
        return h(E);
      });
    });
  }
  function l(g, v, h, y) {
    o(g), o(v), o(typeof y == "function"), v.chmod(g, 438, (p) => {
      p ? y(p.code === "ENOENT" ? null : h) : v.stat(g, (E, $) => {
        E ? y(E.code === "ENOENT" ? null : h) : $.isDirectory() ? u(g, v, h, y) : v.unlink(g, y);
      });
    });
  }
  function a(g, v, h) {
    let y;
    o(g), o(v);
    try {
      v.chmodSync(g, 438);
    } catch (p) {
      if (p.code === "ENOENT")
        return;
      throw h;
    }
    try {
      y = v.statSync(g);
    } catch (p) {
      if (p.code === "ENOENT")
        return;
      throw h;
    }
    y.isDirectory() ? d(g, v, h) : v.unlinkSync(g);
  }
  function u(g, v, h, y) {
    o(g), o(v), o(typeof y == "function"), v.rmdir(g, (p) => {
      p && (p.code === "ENOTEMPTY" || p.code === "EEXIST" || p.code === "EPERM") ? i(g, v, y) : p && p.code === "ENOTDIR" ? y(h) : y(p);
    });
  }
  function i(g, v, h) {
    o(g), o(v), o(typeof h == "function"), v.readdir(g, (y, p) => {
      if (y) return h(y);
      let E = p.length, $;
      if (E === 0) return v.rmdir(g, h);
      p.forEach((S) => {
        n(t.join(g, S), v, (_) => {
          if (!$) {
            if (_) return h($ = _);
            --E === 0 && v.rmdir(g, h);
          }
        });
      });
    });
  }
  function f(g, v) {
    let h;
    v = v || {}, c(v), o(g, "rimraf: missing path"), o.strictEqual(typeof g, "string", "rimraf: path should be a string"), o(v, "rimraf: missing options"), o.strictEqual(typeof v, "object", "rimraf: options should be object");
    try {
      h = v.lstatSync(g);
    } catch (y) {
      if (y.code === "ENOENT")
        return;
      y.code === "EPERM" && r && a(g, v, y);
    }
    try {
      h && h.isDirectory() ? d(g, v, null) : v.unlinkSync(g);
    } catch (y) {
      if (y.code === "ENOENT")
        return;
      if (y.code === "EPERM")
        return r ? a(g, v, y) : d(g, v, y);
      if (y.code !== "EISDIR")
        throw y;
      d(g, v, y);
    }
  }
  function d(g, v, h) {
    o(g), o(v);
    try {
      v.rmdirSync(g);
    } catch (y) {
      if (y.code === "ENOTDIR")
        throw h;
      if (y.code === "ENOTEMPTY" || y.code === "EEXIST" || y.code === "EPERM")
        m(g, v);
      else if (y.code !== "ENOENT")
        throw y;
    }
  }
  function m(g, v) {
    if (o(g), o(v), v.readdirSync(g).forEach((h) => f(t.join(g, h), v)), r) {
      const h = Date.now();
      do
        try {
          return v.rmdirSync(g, v);
        } catch {
        }
      while (Date.now() - h < 500);
    } else
      return v.rmdirSync(g, v);
  }
  return cu = n, n.sync = f, cu;
}
var lu, hm;
function bs() {
  if (hm) return lu;
  hm = 1;
  const e = pt(), t = _t().fromCallback, o = /* @__PURE__ */ L$();
  function r(n, s) {
    if (e.rm) return e.rm(n, { recursive: !0, force: !0 }, s);
    o(n, s);
  }
  function c(n) {
    if (e.rmSync) return e.rmSync(n, { recursive: !0, force: !0 });
    o.sync(n);
  }
  return lu = {
    remove: t(r),
    removeSync: c
  }, lu;
}
var du, pm;
function F$() {
  if (pm) return du;
  pm = 1;
  const e = _t().fromPromise, t = /* @__PURE__ */ en(), o = Me, r = /* @__PURE__ */ Mt(), c = /* @__PURE__ */ bs(), n = e(async function(a) {
    let u;
    try {
      u = await t.readdir(a);
    } catch {
      return r.mkdirs(a);
    }
    return Promise.all(u.map((i) => c.remove(o.join(a, i))));
  });
  function s(l) {
    let a;
    try {
      a = t.readdirSync(l);
    } catch {
      return r.mkdirsSync(l);
    }
    a.forEach((u) => {
      u = o.join(l, u), c.removeSync(u);
    });
  }
  return du = {
    emptyDirSync: s,
    emptydirSync: s,
    emptyDir: n,
    emptydir: n
  }, du;
}
var fu, mm;
function q$() {
  if (mm) return fu;
  mm = 1;
  const e = _t().fromCallback, t = Me, o = pt(), r = /* @__PURE__ */ Mt();
  function c(s, l) {
    function a() {
      o.writeFile(s, "", (u) => {
        if (u) return l(u);
        l();
      });
    }
    o.stat(s, (u, i) => {
      if (!u && i.isFile()) return l();
      const f = t.dirname(s);
      o.stat(f, (d, m) => {
        if (d)
          return d.code === "ENOENT" ? r.mkdirs(f, (g) => {
            if (g) return l(g);
            a();
          }) : l(d);
        m.isDirectory() ? a() : o.readdir(f, (g) => {
          if (g) return l(g);
        });
      });
    });
  }
  function n(s) {
    let l;
    try {
      l = o.statSync(s);
    } catch {
    }
    if (l && l.isFile()) return;
    const a = t.dirname(s);
    try {
      o.statSync(a).isDirectory() || o.readdirSync(a);
    } catch (u) {
      if (u && u.code === "ENOENT") r.mkdirsSync(a);
      else throw u;
    }
    o.writeFileSync(s, "");
  }
  return fu = {
    createFile: e(c),
    createFileSync: n
  }, fu;
}
var hu, ym;
function U$() {
  if (ym) return hu;
  ym = 1;
  const e = _t().fromCallback, t = Me, o = pt(), r = /* @__PURE__ */ Mt(), c = Cr().pathExists, { areIdentical: n } = /* @__PURE__ */ tn();
  function s(a, u, i) {
    function f(d, m) {
      o.link(d, m, (g) => {
        if (g) return i(g);
        i(null);
      });
    }
    o.lstat(u, (d, m) => {
      o.lstat(a, (g, v) => {
        if (g)
          return g.message = g.message.replace("lstat", "ensureLink"), i(g);
        if (m && n(v, m)) return i(null);
        const h = t.dirname(u);
        c(h, (y, p) => {
          if (y) return i(y);
          if (p) return f(a, u);
          r.mkdirs(h, (E) => {
            if (E) return i(E);
            f(a, u);
          });
        });
      });
    });
  }
  function l(a, u) {
    let i;
    try {
      i = o.lstatSync(u);
    } catch {
    }
    try {
      const m = o.lstatSync(a);
      if (i && n(m, i)) return;
    } catch (m) {
      throw m.message = m.message.replace("lstat", "ensureLink"), m;
    }
    const f = t.dirname(u);
    return o.existsSync(f) || r.mkdirsSync(f), o.linkSync(a, u);
  }
  return hu = {
    createLink: e(s),
    createLinkSync: l
  }, hu;
}
var pu, gm;
function j$() {
  if (gm) return pu;
  gm = 1;
  const e = Me, t = pt(), o = Cr().pathExists;
  function r(n, s, l) {
    if (e.isAbsolute(n))
      return t.lstat(n, (a) => a ? (a.message = a.message.replace("lstat", "ensureSymlink"), l(a)) : l(null, {
        toCwd: n,
        toDst: n
      }));
    {
      const a = e.dirname(s), u = e.join(a, n);
      return o(u, (i, f) => i ? l(i) : f ? l(null, {
        toCwd: u,
        toDst: n
      }) : t.lstat(n, (d) => d ? (d.message = d.message.replace("lstat", "ensureSymlink"), l(d)) : l(null, {
        toCwd: n,
        toDst: e.relative(a, n)
      })));
    }
  }
  function c(n, s) {
    let l;
    if (e.isAbsolute(n)) {
      if (l = t.existsSync(n), !l) throw new Error("absolute srcpath does not exist");
      return {
        toCwd: n,
        toDst: n
      };
    } else {
      const a = e.dirname(s), u = e.join(a, n);
      if (l = t.existsSync(u), l)
        return {
          toCwd: u,
          toDst: n
        };
      if (l = t.existsSync(n), !l) throw new Error("relative srcpath does not exist");
      return {
        toCwd: n,
        toDst: e.relative(a, n)
      };
    }
  }
  return pu = {
    symlinkPaths: r,
    symlinkPathsSync: c
  }, pu;
}
var mu, vm;
function M$() {
  if (vm) return mu;
  vm = 1;
  const e = pt();
  function t(r, c, n) {
    if (n = typeof c == "function" ? c : n, c = typeof c == "function" ? !1 : c, c) return n(null, c);
    e.lstat(r, (s, l) => {
      if (s) return n(null, "file");
      c = l && l.isDirectory() ? "dir" : "file", n(null, c);
    });
  }
  function o(r, c) {
    let n;
    if (c) return c;
    try {
      n = e.lstatSync(r);
    } catch {
      return "file";
    }
    return n && n.isDirectory() ? "dir" : "file";
  }
  return mu = {
    symlinkType: t,
    symlinkTypeSync: o
  }, mu;
}
var yu, _m;
function x$() {
  if (_m) return yu;
  _m = 1;
  const e = _t().fromCallback, t = Me, o = /* @__PURE__ */ en(), r = /* @__PURE__ */ Mt(), c = r.mkdirs, n = r.mkdirsSync, s = /* @__PURE__ */ j$(), l = s.symlinkPaths, a = s.symlinkPathsSync, u = /* @__PURE__ */ M$(), i = u.symlinkType, f = u.symlinkTypeSync, d = Cr().pathExists, { areIdentical: m } = /* @__PURE__ */ tn();
  function g(y, p, E, $) {
    $ = typeof E == "function" ? E : $, E = typeof E == "function" ? !1 : E, o.lstat(p, (S, _) => {
      !S && _.isSymbolicLink() ? Promise.all([
        o.stat(y),
        o.stat(p)
      ]).then(([w, R]) => {
        if (m(w, R)) return $(null);
        v(y, p, E, $);
      }) : v(y, p, E, $);
    });
  }
  function v(y, p, E, $) {
    l(y, p, (S, _) => {
      if (S) return $(S);
      y = _.toDst, i(_.toCwd, E, (w, R) => {
        if (w) return $(w);
        const P = t.dirname(p);
        d(P, (j, M) => {
          if (j) return $(j);
          if (M) return o.symlink(y, p, R, $);
          c(P, (B) => {
            if (B) return $(B);
            o.symlink(y, p, R, $);
          });
        });
      });
    });
  }
  function h(y, p, E) {
    let $;
    try {
      $ = o.lstatSync(p);
    } catch {
    }
    if ($ && $.isSymbolicLink()) {
      const R = o.statSync(y), P = o.statSync(p);
      if (m(R, P)) return;
    }
    const S = a(y, p);
    y = S.toDst, E = f(S.toCwd, E);
    const _ = t.dirname(p);
    return o.existsSync(_) || n(_), o.symlinkSync(y, p, E);
  }
  return yu = {
    createSymlink: e(g),
    createSymlinkSync: h
  }, yu;
}
var gu, Em;
function V$() {
  if (Em) return gu;
  Em = 1;
  const { createFile: e, createFileSync: t } = /* @__PURE__ */ q$(), { createLink: o, createLinkSync: r } = /* @__PURE__ */ U$(), { createSymlink: c, createSymlinkSync: n } = /* @__PURE__ */ x$();
  return gu = {
    // file
    createFile: e,
    createFileSync: t,
    ensureFile: e,
    ensureFileSync: t,
    // link
    createLink: o,
    createLinkSync: r,
    ensureLink: o,
    ensureLinkSync: r,
    // symlink
    createSymlink: c,
    createSymlinkSync: n,
    ensureSymlink: c,
    ensureSymlinkSync: n
  }, gu;
}
var vu, wm;
function Sl() {
  if (wm) return vu;
  wm = 1;
  function e(o, { EOL: r = `
`, finalEOL: c = !0, replacer: n = null, spaces: s } = {}) {
    const l = c ? r : "";
    return JSON.stringify(o, n, s).replace(/\n/g, r) + l;
  }
  function t(o) {
    return Buffer.isBuffer(o) && (o = o.toString("utf8")), o.replace(/^\uFEFF/, "");
  }
  return vu = { stringify: e, stripBom: t }, vu;
}
var _u, Sm;
function G$() {
  if (Sm) return _u;
  Sm = 1;
  let e;
  try {
    e = pt();
  } catch {
    e = Ct;
  }
  const t = _t(), { stringify: o, stripBom: r } = Sl();
  async function c(i, f = {}) {
    typeof f == "string" && (f = { encoding: f });
    const d = f.fs || e, m = "throws" in f ? f.throws : !0;
    let g = await t.fromCallback(d.readFile)(i, f);
    g = r(g);
    let v;
    try {
      v = JSON.parse(g, f ? f.reviver : null);
    } catch (h) {
      if (m)
        throw h.message = `${i}: ${h.message}`, h;
      return null;
    }
    return v;
  }
  const n = t.fromPromise(c);
  function s(i, f = {}) {
    typeof f == "string" && (f = { encoding: f });
    const d = f.fs || e, m = "throws" in f ? f.throws : !0;
    try {
      let g = d.readFileSync(i, f);
      return g = r(g), JSON.parse(g, f.reviver);
    } catch (g) {
      if (m)
        throw g.message = `${i}: ${g.message}`, g;
      return null;
    }
  }
  async function l(i, f, d = {}) {
    const m = d.fs || e, g = o(f, d);
    await t.fromCallback(m.writeFile)(i, g, d);
  }
  const a = t.fromPromise(l);
  function u(i, f, d = {}) {
    const m = d.fs || e, g = o(f, d);
    return m.writeFileSync(i, g, d);
  }
  return _u = {
    readFile: n,
    readFileSync: s,
    writeFile: a,
    writeFileSync: u
  }, _u;
}
var Eu, $m;
function H$() {
  if ($m) return Eu;
  $m = 1;
  const e = G$();
  return Eu = {
    // jsonfile exports
    readJson: e.readFile,
    readJsonSync: e.readFileSync,
    writeJson: e.writeFile,
    writeJsonSync: e.writeFileSync
  }, Eu;
}
var wu, bm;
function $l() {
  if (bm) return wu;
  bm = 1;
  const e = _t().fromCallback, t = pt(), o = Me, r = /* @__PURE__ */ Mt(), c = Cr().pathExists;
  function n(l, a, u, i) {
    typeof u == "function" && (i = u, u = "utf8");
    const f = o.dirname(l);
    c(f, (d, m) => {
      if (d) return i(d);
      if (m) return t.writeFile(l, a, u, i);
      r.mkdirs(f, (g) => {
        if (g) return i(g);
        t.writeFile(l, a, u, i);
      });
    });
  }
  function s(l, ...a) {
    const u = o.dirname(l);
    if (t.existsSync(u))
      return t.writeFileSync(l, ...a);
    r.mkdirsSync(u), t.writeFileSync(l, ...a);
  }
  return wu = {
    outputFile: e(n),
    outputFileSync: s
  }, wu;
}
var Su, Tm;
function B$() {
  if (Tm) return Su;
  Tm = 1;
  const { stringify: e } = Sl(), { outputFile: t } = /* @__PURE__ */ $l();
  async function o(r, c, n = {}) {
    const s = e(c, n);
    await t(r, s, n);
  }
  return Su = o, Su;
}
var $u, Rm;
function z$() {
  if (Rm) return $u;
  Rm = 1;
  const { stringify: e } = Sl(), { outputFileSync: t } = /* @__PURE__ */ $l();
  function o(r, c, n) {
    const s = e(c, n);
    t(r, s, n);
  }
  return $u = o, $u;
}
var bu, Pm;
function K$() {
  if (Pm) return bu;
  Pm = 1;
  const e = _t().fromPromise, t = /* @__PURE__ */ H$();
  return t.outputJson = e(/* @__PURE__ */ B$()), t.outputJsonSync = /* @__PURE__ */ z$(), t.outputJSON = t.outputJson, t.outputJSONSync = t.outputJsonSync, t.writeJSON = t.writeJson, t.writeJSONSync = t.writeJsonSync, t.readJSON = t.readJson, t.readJSONSync = t.readJsonSync, bu = t, bu;
}
var Tu, Nm;
function X$() {
  if (Nm) return Tu;
  Nm = 1;
  const e = pt(), t = Me, o = wl().copy, r = bs().remove, c = Mt().mkdirp, n = Cr().pathExists, s = /* @__PURE__ */ tn();
  function l(d, m, g, v) {
    typeof g == "function" && (v = g, g = {}), g = g || {};
    const h = g.overwrite || g.clobber || !1;
    s.checkPaths(d, m, "move", g, (y, p) => {
      if (y) return v(y);
      const { srcStat: E, isChangingCase: $ = !1 } = p;
      s.checkParentPaths(d, E, m, "move", (S) => {
        if (S) return v(S);
        if (a(m)) return u(d, m, h, $, v);
        c(t.dirname(m), (_) => _ ? v(_) : u(d, m, h, $, v));
      });
    });
  }
  function a(d) {
    const m = t.dirname(d);
    return t.parse(m).root === m;
  }
  function u(d, m, g, v, h) {
    if (v) return i(d, m, g, h);
    if (g)
      return r(m, (y) => y ? h(y) : i(d, m, g, h));
    n(m, (y, p) => y ? h(y) : p ? h(new Error("dest already exists.")) : i(d, m, g, h));
  }
  function i(d, m, g, v) {
    e.rename(d, m, (h) => h ? h.code !== "EXDEV" ? v(h) : f(d, m, g, v) : v());
  }
  function f(d, m, g, v) {
    o(d, m, {
      overwrite: g,
      errorOnExist: !0
    }, (y) => y ? v(y) : r(d, v));
  }
  return Tu = l, Tu;
}
var Ru, Om;
function W$() {
  if (Om) return Ru;
  Om = 1;
  const e = pt(), t = Me, o = wl().copySync, r = bs().removeSync, c = Mt().mkdirpSync, n = /* @__PURE__ */ tn();
  function s(f, d, m) {
    m = m || {};
    const g = m.overwrite || m.clobber || !1, { srcStat: v, isChangingCase: h = !1 } = n.checkPathsSync(f, d, "move", m);
    return n.checkParentPathsSync(f, v, d, "move"), l(d) || c(t.dirname(d)), a(f, d, g, h);
  }
  function l(f) {
    const d = t.dirname(f);
    return t.parse(d).root === d;
  }
  function a(f, d, m, g) {
    if (g) return u(f, d, m);
    if (m)
      return r(d), u(f, d, m);
    if (e.existsSync(d)) throw new Error("dest already exists.");
    return u(f, d, m);
  }
  function u(f, d, m) {
    try {
      e.renameSync(f, d);
    } catch (g) {
      if (g.code !== "EXDEV") throw g;
      return i(f, d, m);
    }
  }
  function i(f, d, m) {
    return o(f, d, {
      overwrite: m,
      errorOnExist: !0
    }), r(f);
  }
  return Ru = s, Ru;
}
var Pu, Am;
function Y$() {
  if (Am) return Pu;
  Am = 1;
  const e = _t().fromCallback;
  return Pu = {
    move: e(/* @__PURE__ */ X$()),
    moveSync: /* @__PURE__ */ W$()
  }, Pu;
}
var Nu, Im;
function fr() {
  return Im || (Im = 1, Nu = {
    // Export promiseified graceful-fs:
    .../* @__PURE__ */ en(),
    // Export extra methods:
    .../* @__PURE__ */ wl(),
    .../* @__PURE__ */ F$(),
    .../* @__PURE__ */ V$(),
    .../* @__PURE__ */ K$(),
    .../* @__PURE__ */ Mt(),
    .../* @__PURE__ */ Y$(),
    .../* @__PURE__ */ $l(),
    .../* @__PURE__ */ Cr(),
    .../* @__PURE__ */ bs()
  }), Nu;
}
var mn = {}, Pr = {}, Ou = {}, Nr = {}, Cm;
function bl() {
  if (Cm) return Nr;
  Cm = 1, Object.defineProperty(Nr, "__esModule", { value: !0 }), Nr.CancellationError = Nr.CancellationToken = void 0;
  const e = nl;
  let t = class extends e.EventEmitter {
    get cancelled() {
      return this._cancelled || this._parent != null && this._parent.cancelled;
    }
    set parent(c) {
      this.removeParentCancelHandler(), this._parent = c, this.parentCancelHandler = () => this.cancel(), this._parent.onCancel(this.parentCancelHandler);
    }
    // babel cannot compile ... correctly for super calls
    constructor(c) {
      super(), this.parentCancelHandler = null, this._parent = null, this._cancelled = !1, c != null && (this.parent = c);
    }
    cancel() {
      this._cancelled = !0, this.emit("cancel");
    }
    onCancel(c) {
      this.cancelled ? c() : this.once("cancel", c);
    }
    createPromise(c) {
      if (this.cancelled)
        return Promise.reject(new o());
      const n = () => {
        if (s != null)
          try {
            this.removeListener("cancel", s), s = null;
          } catch {
          }
      };
      let s = null;
      return new Promise((l, a) => {
        let u = null;
        if (s = () => {
          try {
            u != null && (u(), u = null);
          } finally {
            a(new o());
          }
        }, this.cancelled) {
          s();
          return;
        }
        this.onCancel(s), c(l, a, (i) => {
          u = i;
        });
      }).then((l) => (n(), l)).catch((l) => {
        throw n(), l;
      });
    }
    removeParentCancelHandler() {
      const c = this._parent;
      c != null && this.parentCancelHandler != null && (c.removeListener("cancel", this.parentCancelHandler), this.parentCancelHandler = null);
    }
    dispose() {
      try {
        this.removeParentCancelHandler();
      } finally {
        this.removeAllListeners(), this._parent = null;
      }
    }
  };
  Nr.CancellationToken = t;
  class o extends Error {
    constructor() {
      super("cancelled");
    }
  }
  return Nr.CancellationError = o, Nr;
}
var Ba = {}, Dm;
function Ts() {
  if (Dm) return Ba;
  Dm = 1, Object.defineProperty(Ba, "__esModule", { value: !0 }), Ba.newError = e;
  function e(t, o) {
    const r = new Error(t);
    return r.code = o, r;
  }
  return Ba;
}
var at = {}, za = { exports: {} }, Ka = { exports: {} }, Au, km;
function J$() {
  if (km) return Au;
  km = 1;
  var e = 1e3, t = e * 60, o = t * 60, r = o * 24, c = r * 7, n = r * 365.25;
  Au = function(i, f) {
    f = f || {};
    var d = typeof i;
    if (d === "string" && i.length > 0)
      return s(i);
    if (d === "number" && isFinite(i))
      return f.long ? a(i) : l(i);
    throw new Error(
      "val is not a non-empty string or a valid number. val=" + JSON.stringify(i)
    );
  };
  function s(i) {
    if (i = String(i), !(i.length > 100)) {
      var f = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        i
      );
      if (f) {
        var d = parseFloat(f[1]), m = (f[2] || "ms").toLowerCase();
        switch (m) {
          case "years":
          case "year":
          case "yrs":
          case "yr":
          case "y":
            return d * n;
          case "weeks":
          case "week":
          case "w":
            return d * c;
          case "days":
          case "day":
          case "d":
            return d * r;
          case "hours":
          case "hour":
          case "hrs":
          case "hr":
          case "h":
            return d * o;
          case "minutes":
          case "minute":
          case "mins":
          case "min":
          case "m":
            return d * t;
          case "seconds":
          case "second":
          case "secs":
          case "sec":
          case "s":
            return d * e;
          case "milliseconds":
          case "millisecond":
          case "msecs":
          case "msec":
          case "ms":
            return d;
          default:
            return;
        }
      }
    }
  }
  function l(i) {
    var f = Math.abs(i);
    return f >= r ? Math.round(i / r) + "d" : f >= o ? Math.round(i / o) + "h" : f >= t ? Math.round(i / t) + "m" : f >= e ? Math.round(i / e) + "s" : i + "ms";
  }
  function a(i) {
    var f = Math.abs(i);
    return f >= r ? u(i, f, r, "day") : f >= o ? u(i, f, o, "hour") : f >= t ? u(i, f, t, "minute") : f >= e ? u(i, f, e, "second") : i + " ms";
  }
  function u(i, f, d, m) {
    var g = f >= d * 1.5;
    return Math.round(i / d) + " " + m + (g ? "s" : "");
  }
  return Au;
}
var Iu, Lm;
function O0() {
  if (Lm) return Iu;
  Lm = 1;
  function e(t) {
    r.debug = r, r.default = r, r.coerce = u, r.disable = l, r.enable = n, r.enabled = a, r.humanize = J$(), r.destroy = i, Object.keys(t).forEach((f) => {
      r[f] = t[f];
    }), r.names = [], r.skips = [], r.formatters = {};
    function o(f) {
      let d = 0;
      for (let m = 0; m < f.length; m++)
        d = (d << 5) - d + f.charCodeAt(m), d |= 0;
      return r.colors[Math.abs(d) % r.colors.length];
    }
    r.selectColor = o;
    function r(f) {
      let d, m = null, g, v;
      function h(...y) {
        if (!h.enabled)
          return;
        const p = h, E = Number(/* @__PURE__ */ new Date()), $ = E - (d || E);
        p.diff = $, p.prev = d, p.curr = E, d = E, y[0] = r.coerce(y[0]), typeof y[0] != "string" && y.unshift("%O");
        let S = 0;
        y[0] = y[0].replace(/%([a-zA-Z%])/g, (w, R) => {
          if (w === "%%")
            return "%";
          S++;
          const P = r.formatters[R];
          if (typeof P == "function") {
            const j = y[S];
            w = P.call(p, j), y.splice(S, 1), S--;
          }
          return w;
        }), r.formatArgs.call(p, y), (p.log || r.log).apply(p, y);
      }
      return h.namespace = f, h.useColors = r.useColors(), h.color = r.selectColor(f), h.extend = c, h.destroy = r.destroy, Object.defineProperty(h, "enabled", {
        enumerable: !0,
        configurable: !1,
        get: () => m !== null ? m : (g !== r.namespaces && (g = r.namespaces, v = r.enabled(f)), v),
        set: (y) => {
          m = y;
        }
      }), typeof r.init == "function" && r.init(h), h;
    }
    function c(f, d) {
      const m = r(this.namespace + (typeof d > "u" ? ":" : d) + f);
      return m.log = this.log, m;
    }
    function n(f) {
      r.save(f), r.namespaces = f, r.names = [], r.skips = [];
      const d = (typeof f == "string" ? f : "").trim().replace(/\s+/g, ",").split(",").filter(Boolean);
      for (const m of d)
        m[0] === "-" ? r.skips.push(m.slice(1)) : r.names.push(m);
    }
    function s(f, d) {
      let m = 0, g = 0, v = -1, h = 0;
      for (; m < f.length; )
        if (g < d.length && (d[g] === f[m] || d[g] === "*"))
          d[g] === "*" ? (v = g, h = m, g++) : (m++, g++);
        else if (v !== -1)
          g = v + 1, h++, m = h;
        else
          return !1;
      for (; g < d.length && d[g] === "*"; )
        g++;
      return g === d.length;
    }
    function l() {
      const f = [
        ...r.names,
        ...r.skips.map((d) => "-" + d)
      ].join(",");
      return r.enable(""), f;
    }
    function a(f) {
      for (const d of r.skips)
        if (s(f, d))
          return !1;
      for (const d of r.names)
        if (s(f, d))
          return !0;
      return !1;
    }
    function u(f) {
      return f instanceof Error ? f.stack || f.message : f;
    }
    function i() {
      console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
    }
    return r.enable(r.load()), r;
  }
  return Iu = e, Iu;
}
var Fm;
function Q$() {
  return Fm || (Fm = 1, (function(e, t) {
    t.formatArgs = r, t.save = c, t.load = n, t.useColors = o, t.storage = s(), t.destroy = /* @__PURE__ */ (() => {
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
    function o() {
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
      const u = "color: " + this.color;
      a.splice(1, 0, u, "color: inherit");
      let i = 0, f = 0;
      a[0].replace(/%[a-zA-Z%]/g, (d) => {
        d !== "%%" && (i++, d === "%c" && (f = i));
      }), a.splice(f, 0, u);
    }
    t.log = console.debug || console.log || (() => {
    });
    function c(a) {
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
    e.exports = O0()(t);
    const { formatters: l } = e.exports;
    l.j = function(a) {
      try {
        return JSON.stringify(a);
      } catch (u) {
        return "[UnexpectedJSONParseError]: " + u.message;
      }
    };
  })(Ka, Ka.exports)), Ka.exports;
}
var Xa = { exports: {} }, Cu, qm;
function Z$() {
  return qm || (qm = 1, Cu = (e, t = process.argv) => {
    const o = e.startsWith("-") ? "" : e.length === 1 ? "-" : "--", r = t.indexOf(o + e), c = t.indexOf("--");
    return r !== -1 && (c === -1 || r < c);
  }), Cu;
}
var Du, Um;
function eb() {
  if (Um) return Du;
  Um = 1;
  const e = Gn, t = Zg, o = Z$(), { env: r } = process;
  let c;
  o("no-color") || o("no-colors") || o("color=false") || o("color=never") ? c = 0 : (o("color") || o("colors") || o("color=true") || o("color=always")) && (c = 1);
  function n() {
    if ("FORCE_COLOR" in r)
      return r.FORCE_COLOR === "true" ? 1 : r.FORCE_COLOR === "false" ? 0 : r.FORCE_COLOR.length === 0 ? 1 : Math.min(Number.parseInt(r.FORCE_COLOR, 10), 3);
  }
  function s(u) {
    return u === 0 ? !1 : {
      level: u,
      hasBasic: !0,
      has256: u >= 2,
      has16m: u >= 3
    };
  }
  function l(u, { streamIsTTY: i, sniffFlags: f = !0 } = {}) {
    const d = n();
    d !== void 0 && (c = d);
    const m = f ? c : d;
    if (m === 0)
      return 0;
    if (f) {
      if (o("color=16m") || o("color=full") || o("color=truecolor"))
        return 3;
      if (o("color=256"))
        return 2;
    }
    if (u && !i && m === void 0)
      return 0;
    const g = m || 0;
    if (r.TERM === "dumb")
      return g;
    if (process.platform === "win32") {
      const v = e.release().split(".");
      return Number(v[0]) >= 10 && Number(v[2]) >= 10586 ? Number(v[2]) >= 14931 ? 3 : 2 : 1;
    }
    if ("CI" in r)
      return ["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI", "GITHUB_ACTIONS", "BUILDKITE", "DRONE"].some((v) => v in r) || r.CI_NAME === "codeship" ? 1 : g;
    if ("TEAMCITY_VERSION" in r)
      return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(r.TEAMCITY_VERSION) ? 1 : 0;
    if (r.COLORTERM === "truecolor")
      return 3;
    if ("TERM_PROGRAM" in r) {
      const v = Number.parseInt((r.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
      switch (r.TERM_PROGRAM) {
        case "iTerm.app":
          return v >= 3 ? 3 : 2;
        case "Apple_Terminal":
          return 2;
      }
    }
    return /-256(color)?$/i.test(r.TERM) ? 2 : /^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(r.TERM) || "COLORTERM" in r ? 1 : g;
  }
  function a(u, i = {}) {
    const f = l(u, {
      streamIsTTY: u && u.isTTY,
      ...i
    });
    return s(f);
  }
  return Du = {
    supportsColor: a,
    stdout: a({ isTTY: t.isatty(1) }),
    stderr: a({ isTTY: t.isatty(2) })
  }, Du;
}
var jm;
function tb() {
  return jm || (jm = 1, (function(e, t) {
    const o = Zg, r = Vn;
    t.init = i, t.log = l, t.formatArgs = n, t.save = a, t.load = u, t.useColors = c, t.destroy = r.deprecate(
      () => {
      },
      "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."
    ), t.colors = [6, 2, 3, 4, 5, 1];
    try {
      const d = eb();
      d && (d.stderr || d).level >= 2 && (t.colors = [
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
    t.inspectOpts = Object.keys(process.env).filter((d) => /^debug_/i.test(d)).reduce((d, m) => {
      const g = m.substring(6).toLowerCase().replace(/_([a-z])/g, (h, y) => y.toUpperCase());
      let v = process.env[m];
      return /^(yes|on|true|enabled)$/i.test(v) ? v = !0 : /^(no|off|false|disabled)$/i.test(v) ? v = !1 : v === "null" ? v = null : v = Number(v), d[g] = v, d;
    }, {});
    function c() {
      return "colors" in t.inspectOpts ? !!t.inspectOpts.colors : o.isatty(process.stderr.fd);
    }
    function n(d) {
      const { namespace: m, useColors: g } = this;
      if (g) {
        const v = this.color, h = "\x1B[3" + (v < 8 ? v : "8;5;" + v), y = `  ${h};1m${m} \x1B[0m`;
        d[0] = y + d[0].split(`
`).join(`
` + y), d.push(h + "m+" + e.exports.humanize(this.diff) + "\x1B[0m");
      } else
        d[0] = s() + m + " " + d[0];
    }
    function s() {
      return t.inspectOpts.hideDate ? "" : (/* @__PURE__ */ new Date()).toISOString() + " ";
    }
    function l(...d) {
      return process.stderr.write(r.formatWithOptions(t.inspectOpts, ...d) + `
`);
    }
    function a(d) {
      d ? process.env.DEBUG = d : delete process.env.DEBUG;
    }
    function u() {
      return process.env.DEBUG;
    }
    function i(d) {
      d.inspectOpts = {};
      const m = Object.keys(t.inspectOpts);
      for (let g = 0; g < m.length; g++)
        d.inspectOpts[m[g]] = t.inspectOpts[m[g]];
    }
    e.exports = O0()(t);
    const { formatters: f } = e.exports;
    f.o = function(d) {
      return this.inspectOpts.colors = this.useColors, r.inspect(d, this.inspectOpts).split(`
`).map((m) => m.trim()).join(" ");
    }, f.O = function(d) {
      return this.inspectOpts.colors = this.useColors, r.inspect(d, this.inspectOpts);
    };
  })(Xa, Xa.exports)), Xa.exports;
}
var Mm;
function rb() {
  return Mm || (Mm = 1, typeof process > "u" || process.type === "renderer" || process.browser === !0 || process.__nwjs ? za.exports = Q$() : za.exports = tb()), za.exports;
}
var yn = {}, xm;
function A0() {
  if (xm) return yn;
  xm = 1, Object.defineProperty(yn, "__esModule", { value: !0 }), yn.ProgressCallbackTransform = void 0;
  const e = Hn;
  let t = class extends e.Transform {
    constructor(r, c, n) {
      super(), this.total = r, this.cancellationToken = c, this.onProgress = n, this.start = Date.now(), this.transferred = 0, this.delta = 0, this.nextUpdate = this.start + 1e3;
    }
    _transform(r, c, n) {
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
  return yn.ProgressCallbackTransform = t, yn;
}
var Vm;
function nb() {
  if (Vm) return at;
  Vm = 1, Object.defineProperty(at, "__esModule", { value: !0 }), at.DigestTransform = at.HttpExecutor = at.HttpError = void 0, at.createHttpError = u, at.parseJson = d, at.configureRequestOptionsFromUrl = g, at.configureRequestUrl = v, at.safeGetHeader = p, at.configureRequestOptions = $, at.safeStringifyJson = S;
  const e = Yr, t = rb(), o = Ct, r = Hn, c = Jr, n = bl(), s = Ts(), l = A0(), a = (0, t.default)("electron-builder");
  function u(_, w = null) {
    return new f(_.statusCode || -1, `${_.statusCode} ${_.statusMessage}` + (w == null ? "" : `
` + JSON.stringify(w, null, "  ")) + `
Headers: ` + S(_.headers), w);
  }
  const i = /* @__PURE__ */ new Map([
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
    constructor(w, R = `HTTP error: ${i.get(w) || w}`, P = null) {
      super(R), this.statusCode = w, this.description = P, this.name = "HttpError", this.code = `HTTP_ERROR_${w}`;
    }
    isServerError() {
      return this.statusCode >= 500 && this.statusCode <= 599;
    }
  }
  at.HttpError = f;
  function d(_) {
    return _.then((w) => w == null || w.length === 0 ? null : JSON.parse(w));
  }
  class m {
    constructor() {
      this.maxRedirects = 10;
    }
    request(w, R = new n.CancellationToken(), P) {
      $(w);
      const j = P == null ? void 0 : JSON.stringify(P), M = j ? Buffer.from(j) : void 0;
      if (M != null) {
        a(j);
        const { headers: B, ...W } = w;
        w = {
          method: "post",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": M.length,
            ...B
          },
          ...W
        };
      }
      return this.doApiRequest(w, R, (B) => B.end(M));
    }
    doApiRequest(w, R, P, j = 0) {
      return a.enabled && a(`Request: ${S(w)}`), R.createPromise((M, B, W) => {
        const F = this.createRequest(w, (q) => {
          try {
            this.handleResponse(q, w, R, M, B, j, P);
          } catch (J) {
            B(J);
          }
        });
        this.addErrorAndTimeoutHandlers(F, B, w.timeout), this.addRedirectHandlers(F, w, B, j, (q) => {
          this.doApiRequest(q, R, P, j).then(M).catch(B);
        }), P(F, B), W(() => F.abort());
      });
    }
    // noinspection JSUnusedLocalSymbols
    // eslint-disable-next-line
    addRedirectHandlers(w, R, P, j, M) {
    }
    addErrorAndTimeoutHandlers(w, R, P = 60 * 1e3) {
      this.addTimeOutHandler(w, R, P), w.on("error", R), w.on("aborted", () => {
        R(new Error("Request has been aborted by the server"));
      });
    }
    handleResponse(w, R, P, j, M, B, W) {
      var F;
      if (a.enabled && a(`Response: ${w.statusCode} ${w.statusMessage}, request options: ${S(R)}`), w.statusCode === 404) {
        M(u(w, `method: ${R.method || "GET"} url: ${R.protocol || "https:"}//${R.hostname}${R.port ? `:${R.port}` : ""}${R.path}

Please double check that your authentication token is correct. Due to security reasons, actual status maybe not reported, but 404.
`));
        return;
      } else if (w.statusCode === 204) {
        j();
        return;
      }
      const q = (F = w.statusCode) !== null && F !== void 0 ? F : 0, J = q >= 300 && q < 400, H = p(w, "location");
      if (J && H != null) {
        if (B > this.maxRedirects) {
          M(this.createMaxRedirectError());
          return;
        }
        this.doApiRequest(m.prepareRedirectUrlOptions(H, R), P, W, B).then(j).catch(M);
        return;
      }
      w.setEncoding("utf8");
      let G = "";
      w.on("error", M), w.on("data", (Y) => G += Y), w.on("end", () => {
        try {
          if (w.statusCode != null && w.statusCode >= 400) {
            const Y = p(w, "content-type"), k = Y != null && (Array.isArray(Y) ? Y.find((I) => I.includes("json")) != null : Y.includes("json"));
            M(u(w, `method: ${R.method || "GET"} url: ${R.protocol || "https:"}//${R.hostname}${R.port ? `:${R.port}` : ""}${R.path}

          Data:
          ${k ? JSON.stringify(JSON.parse(G)) : G}
          `));
          } else
            j(G.length === 0 ? null : G);
        } catch (Y) {
          M(Y);
        }
      });
    }
    async downloadToBuffer(w, R) {
      return await R.cancellationToken.createPromise((P, j, M) => {
        const B = [], W = {
          headers: R.headers || void 0,
          // because PrivateGitHubProvider requires HttpExecutor.prepareRedirectUrlOptions logic, so, we need to redirect manually
          redirect: "manual"
        };
        v(w, W), $(W), this.doDownload(W, {
          destination: null,
          options: R,
          onCancel: M,
          callback: (F) => {
            F == null ? P(Buffer.concat(B)) : j(F);
          },
          responseHandler: (F, q) => {
            let J = 0;
            F.on("data", (H) => {
              if (J += H.length, J > 524288e3) {
                q(new Error("Maximum allowed size is 500 MB"));
                return;
              }
              B.push(H);
            }), F.on("end", () => {
              q(null);
            });
          }
        }, 0);
      });
    }
    doDownload(w, R, P) {
      const j = this.createRequest(w, (M) => {
        if (M.statusCode >= 400) {
          R.callback(new Error(`Cannot download "${w.protocol || "https:"}//${w.hostname}${w.path}", status ${M.statusCode}: ${M.statusMessage}`));
          return;
        }
        M.on("error", R.callback);
        const B = p(M, "location");
        if (B != null) {
          P < this.maxRedirects ? this.doDownload(m.prepareRedirectUrlOptions(B, w), R, P++) : R.callback(this.createMaxRedirectError());
          return;
        }
        R.responseHandler == null ? E(R, M) : R.responseHandler(M, R.callback);
      });
      this.addErrorAndTimeoutHandlers(j, R.callback, w.timeout), this.addRedirectHandlers(j, w, R.callback, P, (M) => {
        this.doDownload(M, R, P++);
      }), j.end();
    }
    createMaxRedirectError() {
      return new Error(`Too many redirects (> ${this.maxRedirects})`);
    }
    addTimeOutHandler(w, R, P) {
      w.on("socket", (j) => {
        j.setTimeout(P, () => {
          w.abort(), R(new Error("Request timed out"));
        });
      });
    }
    static prepareRedirectUrlOptions(w, R) {
      const P = g(w, { ...R }), j = P.headers;
      if (j?.authorization) {
        const M = new c.URL(w);
        (M.hostname.endsWith(".amazonaws.com") || M.searchParams.has("X-Amz-Credential")) && delete j.authorization;
      }
      return P;
    }
    static retryOnServerError(w, R = 3) {
      for (let P = 0; ; P++)
        try {
          return w();
        } catch (j) {
          if (P < R && (j instanceof f && j.isServerError() || j.code === "EPIPE"))
            continue;
          throw j;
        }
    }
  }
  at.HttpExecutor = m;
  function g(_, w) {
    const R = $(w);
    return v(new c.URL(_), R), R;
  }
  function v(_, w) {
    w.protocol = _.protocol, w.hostname = _.hostname, _.port ? w.port = _.port : w.port && delete w.port, w.path = _.pathname + _.search;
  }
  class h extends r.Transform {
    // noinspection JSUnusedGlobalSymbols
    get actual() {
      return this._actual;
    }
    constructor(w, R = "sha512", P = "base64") {
      super(), this.expected = w, this.algorithm = R, this.encoding = P, this._actual = null, this.isValidateOnEnd = !0, this.digester = (0, e.createHash)(R);
    }
    // noinspection JSUnusedGlobalSymbols
    _transform(w, R, P) {
      this.digester.update(w), P(null, w);
    }
    // noinspection JSUnusedGlobalSymbols
    _flush(w) {
      if (this._actual = this.digester.digest(this.encoding), this.isValidateOnEnd)
        try {
          this.validate();
        } catch (R) {
          w(R);
          return;
        }
      w(null);
    }
    validate() {
      if (this._actual == null)
        throw (0, s.newError)("Not finished yet", "ERR_STREAM_NOT_FINISHED");
      if (this._actual !== this.expected)
        throw (0, s.newError)(`${this.algorithm} checksum mismatch, expected ${this.expected}, got ${this._actual}`, "ERR_CHECKSUM_MISMATCH");
      return null;
    }
  }
  at.DigestTransform = h;
  function y(_, w, R) {
    return _ != null && w != null && _ !== w ? (R(new Error(`checksum mismatch: expected ${w} but got ${_} (X-Checksum-Sha2 header)`)), !1) : !0;
  }
  function p(_, w) {
    const R = _.headers[w];
    return R == null ? null : Array.isArray(R) ? R.length === 0 ? null : R[R.length - 1] : R;
  }
  function E(_, w) {
    if (!y(p(w, "X-Checksum-Sha2"), _.options.sha2, _.callback))
      return;
    const R = [];
    if (_.options.onProgress != null) {
      const B = p(w, "content-length");
      B != null && R.push(new l.ProgressCallbackTransform(parseInt(B, 10), _.options.cancellationToken, _.options.onProgress));
    }
    const P = _.options.sha512;
    P != null ? R.push(new h(P, "sha512", P.length === 128 && !P.includes("+") && !P.includes("Z") && !P.includes("=") ? "hex" : "base64")) : _.options.sha2 != null && R.push(new h(_.options.sha2, "sha256", "hex"));
    const j = (0, o.createWriteStream)(_.destination);
    R.push(j);
    let M = w;
    for (const B of R)
      B.on("error", (W) => {
        j.close(), _.options.cancellationToken.cancelled || _.callback(W);
      }), M = M.pipe(B);
    j.on("finish", () => {
      j.close(_.callback);
    });
  }
  function $(_, w, R) {
    R != null && (_.method = R), _.headers = { ..._.headers };
    const P = _.headers;
    return w != null && (P.authorization = w.startsWith("Basic") || w.startsWith("Bearer") ? w : `token ${w}`), P["User-Agent"] == null && (P["User-Agent"] = "electron-builder"), (R == null || R === "GET" || P["Cache-Control"] == null) && (P["Cache-Control"] = "no-cache"), _.protocol == null && process.versions.electron != null && (_.protocol = "https:"), _;
  }
  function S(_, w) {
    return JSON.stringify(_, (R, P) => R.endsWith("Authorization") || R.endsWith("authorization") || R.endsWith("Password") || R.endsWith("PASSWORD") || R.endsWith("Token") || R.includes("password") || R.includes("token") || w != null && w.has(R) ? "<stripped sensitive data>" : P, 2);
  }
  return at;
}
var gn = {}, Gm;
function ib() {
  if (Gm) return gn;
  Gm = 1, Object.defineProperty(gn, "__esModule", { value: !0 }), gn.MemoLazy = void 0;
  let e = class {
    constructor(r, c) {
      this.selector = r, this.creator = c, this.selected = void 0, this._value = void 0;
    }
    get hasValue() {
      return this._value !== void 0;
    }
    get value() {
      const r = this.selector();
      if (this._value !== void 0 && t(this.selected, r))
        return this._value;
      this.selected = r;
      const c = this.creator(r);
      return this.value = c, c;
    }
    set value(r) {
      this._value = r;
    }
  };
  gn.MemoLazy = e;
  function t(o, r) {
    if (typeof o == "object" && o !== null && (typeof r == "object" && r !== null)) {
      const s = Object.keys(o), l = Object.keys(r);
      return s.length === l.length && s.every((a) => t(o[a], r[a]));
    }
    return o === r;
  }
  return gn;
}
var vn = {}, Hm;
function ab() {
  if (Hm) return vn;
  Hm = 1, Object.defineProperty(vn, "__esModule", { value: !0 }), vn.githubUrl = e, vn.getS3LikeProviderBaseUrl = t;
  function e(n, s = "github.com") {
    return `${n.protocol || "https"}://${n.host || s}`;
  }
  function t(n) {
    const s = n.provider;
    if (s === "s3")
      return o(n);
    if (s === "spaces")
      return c(n);
    throw new Error(`Not supported provider: ${s}`);
  }
  function o(n) {
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
  function c(n) {
    if (n.name == null)
      throw new Error("name is missing");
    if (n.region == null)
      throw new Error("region is missing");
    return r(`https://${n.name}.${n.region}.digitaloceanspaces.com`, n.path);
  }
  return vn;
}
var Wa = {}, Bm;
function sb() {
  if (Bm) return Wa;
  Bm = 1, Object.defineProperty(Wa, "__esModule", { value: !0 }), Wa.retry = t;
  const e = bl();
  async function t(o, r, c, n = 0, s = 0, l) {
    var a;
    const u = new e.CancellationToken();
    try {
      return await o();
    } catch (i) {
      if ((!((a = l?.(i)) !== null && a !== void 0) || a) && r > 0 && !u.cancelled)
        return await new Promise((f) => setTimeout(f, c + n * s)), await t(o, r - 1, c, n, s + 1, l);
      throw i;
    }
  }
  return Wa;
}
var Ya = {}, zm;
function ob() {
  if (zm) return Ya;
  zm = 1, Object.defineProperty(Ya, "__esModule", { value: !0 }), Ya.parseDn = e;
  function e(t) {
    let o = !1, r = null, c = "", n = 0;
    t = t.trim();
    const s = /* @__PURE__ */ new Map();
    for (let l = 0; l <= t.length; l++) {
      if (l === t.length) {
        r !== null && s.set(r, c);
        break;
      }
      const a = t[l];
      if (o) {
        if (a === '"') {
          o = !1;
          continue;
        }
      } else {
        if (a === '"') {
          o = !0;
          continue;
        }
        if (a === "\\") {
          l++;
          const u = parseInt(t.slice(l, l + 2), 16);
          Number.isNaN(u) ? c += t[l] : (l++, c += String.fromCharCode(u));
          continue;
        }
        if (r === null && a === "=") {
          r = c, c = "";
          continue;
        }
        if (a === "," || a === ";" || a === "+") {
          r !== null && s.set(r, c), r = null, c = "";
          continue;
        }
      }
      if (a === " " && !o) {
        if (c.length === 0)
          continue;
        if (l > n) {
          let u = l;
          for (; t[u] === " "; )
            u++;
          n = u;
        }
        if (n >= t.length || t[n] === "," || t[n] === ";" || r === null && t[n] === "=" || r !== null && t[n] === "+") {
          l = n - 1;
          continue;
        }
      }
      c += a;
    }
    return s;
  }
  return Ya;
}
var Or = {}, Km;
function ub() {
  if (Km) return Or;
  Km = 1, Object.defineProperty(Or, "__esModule", { value: !0 }), Or.nil = Or.UUID = void 0;
  const e = Yr, t = Ts(), o = "options.name must be either a string or a Buffer", r = (0, e.randomBytes)(16);
  r[0] = r[0] | 1;
  const c = {}, n = [];
  for (let f = 0; f < 256; f++) {
    const d = (f + 256).toString(16).substr(1);
    c[d] = f, n[f] = d;
  }
  class s {
    constructor(d) {
      this.ascii = null, this.binary = null;
      const m = s.check(d);
      if (!m)
        throw new Error("not a UUID");
      this.version = m.version, m.format === "ascii" ? this.ascii = d : this.binary = d;
    }
    static v5(d, m) {
      return u(d, "sha1", 80, m);
    }
    toString() {
      return this.ascii == null && (this.ascii = i(this.binary)), this.ascii;
    }
    inspect() {
      return `UUID v${this.version} ${this.toString()}`;
    }
    static check(d, m = 0) {
      if (typeof d == "string")
        return d = d.toLowerCase(), /^[a-f0-9]{8}(-[a-f0-9]{4}){3}-([a-f0-9]{12})$/.test(d) ? d === "00000000-0000-0000-0000-000000000000" ? { version: void 0, variant: "nil", format: "ascii" } : {
          version: (c[d[14] + d[15]] & 240) >> 4,
          variant: l((c[d[19] + d[20]] & 224) >> 5),
          format: "ascii"
        } : !1;
      if (Buffer.isBuffer(d)) {
        if (d.length < m + 16)
          return !1;
        let g = 0;
        for (; g < 16 && d[m + g] === 0; g++)
          ;
        return g === 16 ? { version: void 0, variant: "nil", format: "binary" } : {
          version: (d[m + 6] & 240) >> 4,
          variant: l((d[m + 8] & 224) >> 5),
          format: "binary"
        };
      }
      throw (0, t.newError)("Unknown type of uuid", "ERR_UNKNOWN_UUID_TYPE");
    }
    // read stringified uuid into a Buffer
    static parse(d) {
      const m = Buffer.allocUnsafe(16);
      let g = 0;
      for (let v = 0; v < 16; v++)
        m[v] = c[d[g++] + d[g++]], (v === 3 || v === 5 || v === 7 || v === 9) && (g += 1);
      return m;
    }
  }
  Or.UUID = s, s.OID = s.parse("6ba7b812-9dad-11d1-80b4-00c04fd430c8");
  function l(f) {
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
  function u(f, d, m, g, v = a.ASCII) {
    const h = (0, e.createHash)(d);
    if (typeof f != "string" && !Buffer.isBuffer(f))
      throw (0, t.newError)(o, "ERR_INVALID_UUID_NAME");
    h.update(g), h.update(f);
    const p = h.digest();
    let E;
    switch (v) {
      case a.BINARY:
        p[6] = p[6] & 15 | m, p[8] = p[8] & 63 | 128, E = p;
        break;
      case a.OBJECT:
        p[6] = p[6] & 15 | m, p[8] = p[8] & 63 | 128, E = new s(p);
        break;
      default:
        E = n[p[0]] + n[p[1]] + n[p[2]] + n[p[3]] + "-" + n[p[4]] + n[p[5]] + "-" + n[p[6] & 15 | m] + n[p[7]] + "-" + n[p[8] & 63 | 128] + n[p[9]] + "-" + n[p[10]] + n[p[11]] + n[p[12]] + n[p[13]] + n[p[14]] + n[p[15]];
        break;
    }
    return E;
  }
  function i(f) {
    return n[f[0]] + n[f[1]] + n[f[2]] + n[f[3]] + "-" + n[f[4]] + n[f[5]] + "-" + n[f[6]] + n[f[7]] + "-" + n[f[8]] + n[f[9]] + "-" + n[f[10]] + n[f[11]] + n[f[12]] + n[f[13]] + n[f[14]] + n[f[15]];
  }
  return Or.nil = new s("00000000-0000-0000-0000-000000000000"), Or;
}
var xr = {}, ku = {}, Xm;
function cb() {
  return Xm || (Xm = 1, (function(e) {
    (function(t) {
      t.parser = function(A, O) {
        return new r(A, O);
      }, t.SAXParser = r, t.SAXStream = i, t.createStream = u, t.MAX_BUFFER_LENGTH = 64 * 1024;
      var o = [
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
      function r(A, O) {
        if (!(this instanceof r))
          return new r(A, O);
        var Z = this;
        n(Z), Z.q = Z.c = "", Z.bufferCheckPosition = t.MAX_BUFFER_LENGTH, Z.opt = O || {}, Z.opt.lowercase = Z.opt.lowercase || Z.opt.lowercasetags, Z.looseCase = Z.opt.lowercase ? "toLowerCase" : "toUpperCase", Z.tags = [], Z.closed = Z.closedRoot = Z.sawRoot = !1, Z.tag = Z.error = null, Z.strict = !!A, Z.noscript = !!(A || Z.opt.noscript), Z.state = P.BEGIN, Z.strictEntities = Z.opt.strictEntities, Z.ENTITIES = Z.strictEntities ? Object.create(t.XML_ENTITIES) : Object.create(t.ENTITIES), Z.attribList = [], Z.opt.xmlns && (Z.ns = Object.create(v)), Z.opt.unquotedAttributeValues === void 0 && (Z.opt.unquotedAttributeValues = !A), Z.trackPosition = Z.opt.position !== !1, Z.trackPosition && (Z.position = Z.line = Z.column = 0), M(Z, "onready");
      }
      Object.create || (Object.create = function(A) {
        function O() {
        }
        O.prototype = A;
        var Z = new O();
        return Z;
      }), Object.keys || (Object.keys = function(A) {
        var O = [];
        for (var Z in A) A.hasOwnProperty(Z) && O.push(Z);
        return O;
      });
      function c(A) {
        for (var O = Math.max(t.MAX_BUFFER_LENGTH, 10), Z = 0, z = 0, C = o.length; z < C; z++) {
          var L = A[o[z]].length;
          if (L > O)
            switch (o[z]) {
              case "textNode":
                W(A);
                break;
              case "cdata":
                B(A, "oncdata", A.cdata), A.cdata = "";
                break;
              case "script":
                B(A, "onscript", A.script), A.script = "";
                break;
              default:
                q(A, "Max buffer length exceeded: " + o[z]);
            }
          Z = Math.max(Z, L);
        }
        var X = t.MAX_BUFFER_LENGTH - Z;
        A.bufferCheckPosition = X + A.position;
      }
      function n(A) {
        for (var O = 0, Z = o.length; O < Z; O++)
          A[o[O]] = "";
      }
      function s(A) {
        W(A), A.cdata !== "" && (B(A, "oncdata", A.cdata), A.cdata = ""), A.script !== "" && (B(A, "onscript", A.script), A.script = "");
      }
      r.prototype = {
        end: function() {
          J(this);
        },
        write: V,
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
      var l;
      try {
        l = require("stream").Stream;
      } catch {
        l = function() {
        };
      }
      l || (l = function() {
      });
      var a = t.EVENTS.filter(function(A) {
        return A !== "error" && A !== "end";
      });
      function u(A, O) {
        return new i(A, O);
      }
      function i(A, O) {
        if (!(this instanceof i))
          return new i(A, O);
        l.apply(this), this._parser = new r(A, O), this.writable = !0, this.readable = !0;
        var Z = this;
        this._parser.onend = function() {
          Z.emit("end");
        }, this._parser.onerror = function(z) {
          Z.emit("error", z), Z._parser.error = null;
        }, this._decoder = null, a.forEach(function(z) {
          Object.defineProperty(Z, "on" + z, {
            get: function() {
              return Z._parser["on" + z];
            },
            set: function(C) {
              if (!C)
                return Z.removeAllListeners(z), Z._parser["on" + z] = C, C;
              Z.on(z, C);
            },
            enumerable: !0,
            configurable: !1
          });
        });
      }
      i.prototype = Object.create(l.prototype, {
        constructor: {
          value: i
        }
      }), i.prototype.write = function(A) {
        if (typeof Buffer == "function" && typeof Buffer.isBuffer == "function" && Buffer.isBuffer(A)) {
          if (!this._decoder) {
            var O = a_.StringDecoder;
            this._decoder = new O("utf8");
          }
          A = this._decoder.write(A);
        }
        return this._parser.write(A.toString()), this.emit("data", A), !0;
      }, i.prototype.end = function(A) {
        return A && A.length && this.write(A), this._parser.end(), !0;
      }, i.prototype.on = function(A, O) {
        var Z = this;
        return !Z._parser["on" + A] && a.indexOf(A) !== -1 && (Z._parser["on" + A] = function() {
          var z = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);
          z.splice(0, 0, A), Z.emit.apply(Z, z);
        }), l.prototype.on.call(Z, A, O);
      };
      var f = "[CDATA[", d = "DOCTYPE", m = "http://www.w3.org/XML/1998/namespace", g = "http://www.w3.org/2000/xmlns/", v = { xml: m, xmlns: g }, h = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, y = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/, p = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, E = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
      function $(A) {
        return A === " " || A === `
` || A === "\r" || A === "	";
      }
      function S(A) {
        return A === '"' || A === "'";
      }
      function _(A) {
        return A === ">" || $(A);
      }
      function w(A, O) {
        return A.test(O);
      }
      function R(A, O) {
        return !w(A, O);
      }
      var P = 0;
      t.STATE = {
        BEGIN: P++,
        // leading byte order mark or whitespace
        BEGIN_WHITESPACE: P++,
        // leading whitespace
        TEXT: P++,
        // general stuff
        TEXT_ENTITY: P++,
        // &amp and such.
        OPEN_WAKA: P++,
        // <
        SGML_DECL: P++,
        // <!BLARG
        SGML_DECL_QUOTED: P++,
        // <!BLARG foo "bar
        DOCTYPE: P++,
        // <!DOCTYPE
        DOCTYPE_QUOTED: P++,
        // <!DOCTYPE "//blah
        DOCTYPE_DTD: P++,
        // <!DOCTYPE "//blah" [ ...
        DOCTYPE_DTD_QUOTED: P++,
        // <!DOCTYPE "//blah" [ "foo
        COMMENT_STARTING: P++,
        // <!-
        COMMENT: P++,
        // <!--
        COMMENT_ENDING: P++,
        // <!-- blah -
        COMMENT_ENDED: P++,
        // <!-- blah --
        CDATA: P++,
        // <![CDATA[ something
        CDATA_ENDING: P++,
        // ]
        CDATA_ENDING_2: P++,
        // ]]
        PROC_INST: P++,
        // <?hi
        PROC_INST_BODY: P++,
        // <?hi there
        PROC_INST_ENDING: P++,
        // <?hi "there" ?
        OPEN_TAG: P++,
        // <strong
        OPEN_TAG_SLASH: P++,
        // <strong /
        ATTRIB: P++,
        // <a
        ATTRIB_NAME: P++,
        // <a foo
        ATTRIB_NAME_SAW_WHITE: P++,
        // <a foo _
        ATTRIB_VALUE: P++,
        // <a foo=
        ATTRIB_VALUE_QUOTED: P++,
        // <a foo="bar
        ATTRIB_VALUE_CLOSED: P++,
        // <a foo="bar"
        ATTRIB_VALUE_UNQUOTED: P++,
        // <a foo=bar
        ATTRIB_VALUE_ENTITY_Q: P++,
        // <foo bar="&quot;"
        ATTRIB_VALUE_ENTITY_U: P++,
        // <foo bar=&quot
        CLOSE_TAG: P++,
        // </a
        CLOSE_TAG_SAW_WHITE: P++,
        // </a   >
        SCRIPT: P++,
        // <script> ...
        SCRIPT_ENDING: P++
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
      }, Object.keys(t.ENTITIES).forEach(function(A) {
        var O = t.ENTITIES[A], Z = typeof O == "number" ? String.fromCharCode(O) : O;
        t.ENTITIES[A] = Z;
      });
      for (var j in t.STATE)
        t.STATE[t.STATE[j]] = j;
      P = t.STATE;
      function M(A, O, Z) {
        A[O] && A[O](Z);
      }
      function B(A, O, Z) {
        A.textNode && W(A), M(A, O, Z);
      }
      function W(A) {
        A.textNode = F(A.opt, A.textNode), A.textNode && M(A, "ontext", A.textNode), A.textNode = "";
      }
      function F(A, O) {
        return A.trim && (O = O.trim()), A.normalize && (O = O.replace(/\s+/g, " ")), O;
      }
      function q(A, O) {
        return W(A), A.trackPosition && (O += `
Line: ` + A.line + `
Column: ` + A.column + `
Char: ` + A.c), O = new Error(O), A.error = O, M(A, "onerror", O), A;
      }
      function J(A) {
        return A.sawRoot && !A.closedRoot && H(A, "Unclosed root tag"), A.state !== P.BEGIN && A.state !== P.BEGIN_WHITESPACE && A.state !== P.TEXT && q(A, "Unexpected end"), W(A), A.c = "", A.closed = !0, M(A, "onend"), r.call(A, A.strict, A.opt), A;
      }
      function H(A, O) {
        if (typeof A != "object" || !(A instanceof r))
          throw new Error("bad call to strictFail");
        A.strict && q(A, O);
      }
      function G(A) {
        A.strict || (A.tagName = A.tagName[A.looseCase]());
        var O = A.tags[A.tags.length - 1] || A, Z = A.tag = { name: A.tagName, attributes: {} };
        A.opt.xmlns && (Z.ns = O.ns), A.attribList.length = 0, B(A, "onopentagstart", Z);
      }
      function Y(A, O) {
        var Z = A.indexOf(":"), z = Z < 0 ? ["", A] : A.split(":"), C = z[0], L = z[1];
        return O && A === "xmlns" && (C = "xmlns", L = ""), { prefix: C, local: L };
      }
      function k(A) {
        if (A.strict || (A.attribName = A.attribName[A.looseCase]()), A.attribList.indexOf(A.attribName) !== -1 || A.tag.attributes.hasOwnProperty(A.attribName)) {
          A.attribName = A.attribValue = "";
          return;
        }
        if (A.opt.xmlns) {
          var O = Y(A.attribName, !0), Z = O.prefix, z = O.local;
          if (Z === "xmlns")
            if (z === "xml" && A.attribValue !== m)
              H(
                A,
                "xml: prefix must be bound to " + m + `
Actual: ` + A.attribValue
              );
            else if (z === "xmlns" && A.attribValue !== g)
              H(
                A,
                "xmlns: prefix must be bound to " + g + `
Actual: ` + A.attribValue
              );
            else {
              var C = A.tag, L = A.tags[A.tags.length - 1] || A;
              C.ns === L.ns && (C.ns = Object.create(L.ns)), C.ns[z] = A.attribValue;
            }
          A.attribList.push([A.attribName, A.attribValue]);
        } else
          A.tag.attributes[A.attribName] = A.attribValue, B(A, "onattribute", {
            name: A.attribName,
            value: A.attribValue
          });
        A.attribName = A.attribValue = "";
      }
      function I(A, O) {
        if (A.opt.xmlns) {
          var Z = A.tag, z = Y(A.tagName);
          Z.prefix = z.prefix, Z.local = z.local, Z.uri = Z.ns[z.prefix] || "", Z.prefix && !Z.uri && (H(
            A,
            "Unbound namespace prefix: " + JSON.stringify(A.tagName)
          ), Z.uri = z.prefix);
          var C = A.tags[A.tags.length - 1] || A;
          Z.ns && C.ns !== Z.ns && Object.keys(Z.ns).forEach(function(b) {
            B(A, "onopennamespace", {
              prefix: b,
              uri: Z.ns[b]
            });
          });
          for (var L = 0, X = A.attribList.length; L < X; L++) {
            var Q = A.attribList[L], re = Q[0], de = Q[1], ve = Y(re, !0), Pe = ve.prefix, Ce = ve.local, Ne = Pe === "" ? "" : Z.ns[Pe] || "", be = {
              name: re,
              value: de,
              prefix: Pe,
              local: Ce,
              uri: Ne
            };
            Pe && Pe !== "xmlns" && !Ne && (H(
              A,
              "Unbound namespace prefix: " + JSON.stringify(Pe)
            ), be.uri = Pe), A.tag.attributes[re] = be, B(A, "onattribute", be);
          }
          A.attribList.length = 0;
        }
        A.tag.isSelfClosing = !!O, A.sawRoot = !0, A.tags.push(A.tag), B(A, "onopentag", A.tag), O || (!A.noscript && A.tagName.toLowerCase() === "script" ? A.state = P.SCRIPT : A.state = P.TEXT, A.tag = null, A.tagName = ""), A.attribName = A.attribValue = "", A.attribList.length = 0;
      }
      function U(A) {
        if (!A.tagName) {
          H(A, "Weird empty close tag."), A.textNode += "</>", A.state = P.TEXT;
          return;
        }
        if (A.script) {
          if (A.tagName !== "script") {
            A.script += "</" + A.tagName + ">", A.tagName = "", A.state = P.SCRIPT;
            return;
          }
          B(A, "onscript", A.script), A.script = "";
        }
        var O = A.tags.length, Z = A.tagName;
        A.strict || (Z = Z[A.looseCase]());
        for (var z = Z; O--; ) {
          var C = A.tags[O];
          if (C.name !== z)
            H(A, "Unexpected close tag");
          else
            break;
        }
        if (O < 0) {
          H(A, "Unmatched closing tag: " + A.tagName), A.textNode += "</" + A.tagName + ">", A.state = P.TEXT;
          return;
        }
        A.tagName = Z;
        for (var L = A.tags.length; L-- > O; ) {
          var X = A.tag = A.tags.pop();
          A.tagName = A.tag.name, B(A, "onclosetag", A.tagName);
          var Q = {};
          for (var re in X.ns)
            Q[re] = X.ns[re];
          var de = A.tags[A.tags.length - 1] || A;
          A.opt.xmlns && X.ns !== de.ns && Object.keys(X.ns).forEach(function(ve) {
            var Pe = X.ns[ve];
            B(A, "onclosenamespace", { prefix: ve, uri: Pe });
          });
        }
        O === 0 && (A.closedRoot = !0), A.tagName = A.attribValue = A.attribName = "", A.attribList.length = 0, A.state = P.TEXT;
      }
      function D(A) {
        var O = A.entity, Z = O.toLowerCase(), z, C = "";
        return A.ENTITIES[O] ? A.ENTITIES[O] : A.ENTITIES[Z] ? A.ENTITIES[Z] : (O = Z, O.charAt(0) === "#" && (O.charAt(1) === "x" ? (O = O.slice(2), z = parseInt(O, 16), C = z.toString(16)) : (O = O.slice(1), z = parseInt(O, 10), C = z.toString(10))), O = O.replace(/^0+/, ""), isNaN(z) || C.toLowerCase() !== O || z < 0 || z > 1114111 ? (H(A, "Invalid character entity"), "&" + A.entity + ";") : String.fromCodePoint(z));
      }
      function T(A, O) {
        O === "<" ? (A.state = P.OPEN_WAKA, A.startTagPosition = A.position) : $(O) || (H(A, "Non-whitespace before first tag."), A.textNode = O, A.state = P.TEXT);
      }
      function N(A, O) {
        var Z = "";
        return O < A.length && (Z = A.charAt(O)), Z;
      }
      function V(A) {
        var O = this;
        if (this.error)
          throw this.error;
        if (O.closed)
          return q(
            O,
            "Cannot write after close. Assign an onready handler."
          );
        if (A === null)
          return J(O);
        typeof A == "object" && (A = A.toString());
        for (var Z = 0, z = ""; z = N(A, Z++), O.c = z, !!z; )
          switch (O.trackPosition && (O.position++, z === `
` ? (O.line++, O.column = 0) : O.column++), O.state) {
            case P.BEGIN:
              if (O.state = P.BEGIN_WHITESPACE, z === "\uFEFF")
                continue;
              T(O, z);
              continue;
            case P.BEGIN_WHITESPACE:
              T(O, z);
              continue;
            case P.TEXT:
              if (O.sawRoot && !O.closedRoot) {
                for (var L = Z - 1; z && z !== "<" && z !== "&"; )
                  z = N(A, Z++), z && O.trackPosition && (O.position++, z === `
` ? (O.line++, O.column = 0) : O.column++);
                O.textNode += A.substring(L, Z - 1);
              }
              z === "<" && !(O.sawRoot && O.closedRoot && !O.strict) ? (O.state = P.OPEN_WAKA, O.startTagPosition = O.position) : (!$(z) && (!O.sawRoot || O.closedRoot) && H(O, "Text data outside of root node."), z === "&" ? O.state = P.TEXT_ENTITY : O.textNode += z);
              continue;
            case P.SCRIPT:
              z === "<" ? O.state = P.SCRIPT_ENDING : O.script += z;
              continue;
            case P.SCRIPT_ENDING:
              z === "/" ? O.state = P.CLOSE_TAG : (O.script += "<" + z, O.state = P.SCRIPT);
              continue;
            case P.OPEN_WAKA:
              if (z === "!")
                O.state = P.SGML_DECL, O.sgmlDecl = "";
              else if (!$(z)) if (w(h, z))
                O.state = P.OPEN_TAG, O.tagName = z;
              else if (z === "/")
                O.state = P.CLOSE_TAG, O.tagName = "";
              else if (z === "?")
                O.state = P.PROC_INST, O.procInstName = O.procInstBody = "";
              else {
                if (H(O, "Unencoded <"), O.startTagPosition + 1 < O.position) {
                  var C = O.position - O.startTagPosition;
                  z = new Array(C).join(" ") + z;
                }
                O.textNode += "<" + z, O.state = P.TEXT;
              }
              continue;
            case P.SGML_DECL:
              if (O.sgmlDecl + z === "--") {
                O.state = P.COMMENT, O.comment = "", O.sgmlDecl = "";
                continue;
              }
              O.doctype && O.doctype !== !0 && O.sgmlDecl ? (O.state = P.DOCTYPE_DTD, O.doctype += "<!" + O.sgmlDecl + z, O.sgmlDecl = "") : (O.sgmlDecl + z).toUpperCase() === f ? (B(O, "onopencdata"), O.state = P.CDATA, O.sgmlDecl = "", O.cdata = "") : (O.sgmlDecl + z).toUpperCase() === d ? (O.state = P.DOCTYPE, (O.doctype || O.sawRoot) && H(
                O,
                "Inappropriately located doctype declaration"
              ), O.doctype = "", O.sgmlDecl = "") : z === ">" ? (B(O, "onsgmldeclaration", O.sgmlDecl), O.sgmlDecl = "", O.state = P.TEXT) : (S(z) && (O.state = P.SGML_DECL_QUOTED), O.sgmlDecl += z);
              continue;
            case P.SGML_DECL_QUOTED:
              z === O.q && (O.state = P.SGML_DECL, O.q = ""), O.sgmlDecl += z;
              continue;
            case P.DOCTYPE:
              z === ">" ? (O.state = P.TEXT, B(O, "ondoctype", O.doctype), O.doctype = !0) : (O.doctype += z, z === "[" ? O.state = P.DOCTYPE_DTD : S(z) && (O.state = P.DOCTYPE_QUOTED, O.q = z));
              continue;
            case P.DOCTYPE_QUOTED:
              O.doctype += z, z === O.q && (O.q = "", O.state = P.DOCTYPE);
              continue;
            case P.DOCTYPE_DTD:
              z === "]" ? (O.doctype += z, O.state = P.DOCTYPE) : z === "<" ? (O.state = P.OPEN_WAKA, O.startTagPosition = O.position) : S(z) ? (O.doctype += z, O.state = P.DOCTYPE_DTD_QUOTED, O.q = z) : O.doctype += z;
              continue;
            case P.DOCTYPE_DTD_QUOTED:
              O.doctype += z, z === O.q && (O.state = P.DOCTYPE_DTD, O.q = "");
              continue;
            case P.COMMENT:
              z === "-" ? O.state = P.COMMENT_ENDING : O.comment += z;
              continue;
            case P.COMMENT_ENDING:
              z === "-" ? (O.state = P.COMMENT_ENDED, O.comment = F(O.opt, O.comment), O.comment && B(O, "oncomment", O.comment), O.comment = "") : (O.comment += "-" + z, O.state = P.COMMENT);
              continue;
            case P.COMMENT_ENDED:
              z !== ">" ? (H(O, "Malformed comment"), O.comment += "--" + z, O.state = P.COMMENT) : O.doctype && O.doctype !== !0 ? O.state = P.DOCTYPE_DTD : O.state = P.TEXT;
              continue;
            case P.CDATA:
              for (var L = Z - 1; z && z !== "]"; )
                z = N(A, Z++), z && O.trackPosition && (O.position++, z === `
` ? (O.line++, O.column = 0) : O.column++);
              O.cdata += A.substring(L, Z - 1), z === "]" && (O.state = P.CDATA_ENDING);
              continue;
            case P.CDATA_ENDING:
              z === "]" ? O.state = P.CDATA_ENDING_2 : (O.cdata += "]" + z, O.state = P.CDATA);
              continue;
            case P.CDATA_ENDING_2:
              z === ">" ? (O.cdata && B(O, "oncdata", O.cdata), B(O, "onclosecdata"), O.cdata = "", O.state = P.TEXT) : z === "]" ? O.cdata += "]" : (O.cdata += "]]" + z, O.state = P.CDATA);
              continue;
            case P.PROC_INST:
              z === "?" ? O.state = P.PROC_INST_ENDING : $(z) ? O.state = P.PROC_INST_BODY : O.procInstName += z;
              continue;
            case P.PROC_INST_BODY:
              if (!O.procInstBody && $(z))
                continue;
              z === "?" ? O.state = P.PROC_INST_ENDING : O.procInstBody += z;
              continue;
            case P.PROC_INST_ENDING:
              z === ">" ? (B(O, "onprocessinginstruction", {
                name: O.procInstName,
                body: O.procInstBody
              }), O.procInstName = O.procInstBody = "", O.state = P.TEXT) : (O.procInstBody += "?" + z, O.state = P.PROC_INST_BODY);
              continue;
            case P.OPEN_TAG:
              w(y, z) ? O.tagName += z : (G(O), z === ">" ? I(O) : z === "/" ? O.state = P.OPEN_TAG_SLASH : ($(z) || H(O, "Invalid character in tag name"), O.state = P.ATTRIB));
              continue;
            case P.OPEN_TAG_SLASH:
              z === ">" ? (I(O, !0), U(O)) : (H(
                O,
                "Forward-slash in opening tag not followed by >"
              ), O.state = P.ATTRIB);
              continue;
            case P.ATTRIB:
              if ($(z))
                continue;
              z === ">" ? I(O) : z === "/" ? O.state = P.OPEN_TAG_SLASH : w(h, z) ? (O.attribName = z, O.attribValue = "", O.state = P.ATTRIB_NAME) : H(O, "Invalid attribute name");
              continue;
            case P.ATTRIB_NAME:
              z === "=" ? O.state = P.ATTRIB_VALUE : z === ">" ? (H(O, "Attribute without value"), O.attribValue = O.attribName, k(O), I(O)) : $(z) ? O.state = P.ATTRIB_NAME_SAW_WHITE : w(y, z) ? O.attribName += z : H(O, "Invalid attribute name");
              continue;
            case P.ATTRIB_NAME_SAW_WHITE:
              if (z === "=")
                O.state = P.ATTRIB_VALUE;
              else {
                if ($(z))
                  continue;
                H(O, "Attribute without value"), O.tag.attributes[O.attribName] = "", O.attribValue = "", B(O, "onattribute", {
                  name: O.attribName,
                  value: ""
                }), O.attribName = "", z === ">" ? I(O) : w(h, z) ? (O.attribName = z, O.state = P.ATTRIB_NAME) : (H(O, "Invalid attribute name"), O.state = P.ATTRIB);
              }
              continue;
            case P.ATTRIB_VALUE:
              if ($(z))
                continue;
              S(z) ? (O.q = z, O.state = P.ATTRIB_VALUE_QUOTED) : (O.opt.unquotedAttributeValues || q(O, "Unquoted attribute value"), O.state = P.ATTRIB_VALUE_UNQUOTED, O.attribValue = z);
              continue;
            case P.ATTRIB_VALUE_QUOTED:
              if (z !== O.q) {
                z === "&" ? O.state = P.ATTRIB_VALUE_ENTITY_Q : O.attribValue += z;
                continue;
              }
              k(O), O.q = "", O.state = P.ATTRIB_VALUE_CLOSED;
              continue;
            case P.ATTRIB_VALUE_CLOSED:
              $(z) ? O.state = P.ATTRIB : z === ">" ? I(O) : z === "/" ? O.state = P.OPEN_TAG_SLASH : w(h, z) ? (H(O, "No whitespace between attributes"), O.attribName = z, O.attribValue = "", O.state = P.ATTRIB_NAME) : H(O, "Invalid attribute name");
              continue;
            case P.ATTRIB_VALUE_UNQUOTED:
              if (!_(z)) {
                z === "&" ? O.state = P.ATTRIB_VALUE_ENTITY_U : O.attribValue += z;
                continue;
              }
              k(O), z === ">" ? I(O) : O.state = P.ATTRIB;
              continue;
            case P.CLOSE_TAG:
              if (O.tagName)
                z === ">" ? U(O) : w(y, z) ? O.tagName += z : O.script ? (O.script += "</" + O.tagName, O.tagName = "", O.state = P.SCRIPT) : ($(z) || H(O, "Invalid tagname in closing tag"), O.state = P.CLOSE_TAG_SAW_WHITE);
              else {
                if ($(z))
                  continue;
                R(h, z) ? O.script ? (O.script += "</" + z, O.state = P.SCRIPT) : H(O, "Invalid tagname in closing tag.") : O.tagName = z;
              }
              continue;
            case P.CLOSE_TAG_SAW_WHITE:
              if ($(z))
                continue;
              z === ">" ? U(O) : H(O, "Invalid characters in closing tag");
              continue;
            case P.TEXT_ENTITY:
            case P.ATTRIB_VALUE_ENTITY_Q:
            case P.ATTRIB_VALUE_ENTITY_U:
              var X, Q;
              switch (O.state) {
                case P.TEXT_ENTITY:
                  X = P.TEXT, Q = "textNode";
                  break;
                case P.ATTRIB_VALUE_ENTITY_Q:
                  X = P.ATTRIB_VALUE_QUOTED, Q = "attribValue";
                  break;
                case P.ATTRIB_VALUE_ENTITY_U:
                  X = P.ATTRIB_VALUE_UNQUOTED, Q = "attribValue";
                  break;
              }
              if (z === ";") {
                var re = D(O);
                O.opt.unparsedEntities && !Object.values(t.XML_ENTITIES).includes(re) ? (O.entity = "", O.state = X, O.write(re)) : (O[Q] += re, O.entity = "", O.state = X);
              } else w(O.entity.length ? E : p, z) ? O.entity += z : (H(O, "Invalid character in entity name"), O[Q] += "&" + O.entity + z, O.entity = "", O.state = X);
              continue;
            default:
              throw new Error(O, "Unknown state: " + O.state);
          }
        return O.position >= O.bufferCheckPosition && c(O), O;
      }
      String.fromCodePoint || (function() {
        var A = String.fromCharCode, O = Math.floor, Z = function() {
          var z = 16384, C = [], L, X, Q = -1, re = arguments.length;
          if (!re)
            return "";
          for (var de = ""; ++Q < re; ) {
            var ve = Number(arguments[Q]);
            if (!isFinite(ve) || // `NaN`, `+Infinity`, or `-Infinity`
            ve < 0 || // not a valid Unicode code point
            ve > 1114111 || // not a valid Unicode code point
            O(ve) !== ve)
              throw RangeError("Invalid code point: " + ve);
            ve <= 65535 ? C.push(ve) : (ve -= 65536, L = (ve >> 10) + 55296, X = ve % 1024 + 56320, C.push(L, X)), (Q + 1 === re || C.length > z) && (de += A.apply(null, C), C.length = 0);
          }
          return de;
        };
        Object.defineProperty ? Object.defineProperty(String, "fromCodePoint", {
          value: Z,
          configurable: !0,
          writable: !0
        }) : String.fromCodePoint = Z;
      })();
    })(e);
  })(ku)), ku;
}
var Wm;
function lb() {
  if (Wm) return xr;
  Wm = 1, Object.defineProperty(xr, "__esModule", { value: !0 }), xr.XElement = void 0, xr.parseXml = s;
  const e = cb(), t = Ts();
  class o {
    constructor(a) {
      if (this.name = a, this.value = "", this.attributes = null, this.isCData = !1, this.elements = null, !a)
        throw (0, t.newError)("Element name cannot be empty", "ERR_XML_ELEMENT_NAME_EMPTY");
      if (!c(a))
        throw (0, t.newError)(`Invalid element name: ${a}`, "ERR_XML_ELEMENT_INVALID_NAME");
    }
    attribute(a) {
      const u = this.attributes === null ? null : this.attributes[a];
      if (u == null)
        throw (0, t.newError)(`No attribute "${a}"`, "ERR_XML_MISSED_ATTRIBUTE");
      return u;
    }
    removeAttribute(a) {
      this.attributes !== null && delete this.attributes[a];
    }
    element(a, u = !1, i = null) {
      const f = this.elementOrNull(a, u);
      if (f === null)
        throw (0, t.newError)(i || `No element "${a}"`, "ERR_XML_MISSED_ELEMENT");
      return f;
    }
    elementOrNull(a, u = !1) {
      if (this.elements === null)
        return null;
      for (const i of this.elements)
        if (n(i, a, u))
          return i;
      return null;
    }
    getElements(a, u = !1) {
      return this.elements === null ? [] : this.elements.filter((i) => n(i, a, u));
    }
    elementValueOrEmpty(a, u = !1) {
      const i = this.elementOrNull(a, u);
      return i === null ? "" : i.value;
    }
  }
  xr.XElement = o;
  const r = new RegExp(/^[A-Za-z_][:A-Za-z0-9_-]*$/i);
  function c(l) {
    return r.test(l);
  }
  function n(l, a, u) {
    const i = l.name;
    return i === a || u === !0 && i.length === a.length && i.toLowerCase() === a.toLowerCase();
  }
  function s(l) {
    let a = null;
    const u = e.parser(!0, {}), i = [];
    return u.onopentag = (f) => {
      const d = new o(f.name);
      if (d.attributes = f.attributes, a === null)
        a = d;
      else {
        const m = i[i.length - 1];
        m.elements == null && (m.elements = []), m.elements.push(d);
      }
      i.push(d);
    }, u.onclosetag = () => {
      i.pop();
    }, u.ontext = (f) => {
      i.length > 0 && (i[i.length - 1].value = f);
    }, u.oncdata = (f) => {
      const d = i[i.length - 1];
      d.value = f, d.isCData = !0;
    }, u.onerror = (f) => {
      throw f;
    }, u.write(l), a;
  }
  return xr;
}
var Ym;
function nt() {
  return Ym || (Ym = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.CURRENT_APP_PACKAGE_FILE_NAME = e.CURRENT_APP_INSTALLER_FILE_NAME = e.XElement = e.parseXml = e.UUID = e.parseDn = e.retry = e.githubUrl = e.getS3LikeProviderBaseUrl = e.ProgressCallbackTransform = e.MemoLazy = e.safeStringifyJson = e.safeGetHeader = e.parseJson = e.HttpExecutor = e.HttpError = e.DigestTransform = e.createHttpError = e.configureRequestUrl = e.configureRequestOptionsFromUrl = e.configureRequestOptions = e.newError = e.CancellationToken = e.CancellationError = void 0, e.asArray = f;
    var t = bl();
    Object.defineProperty(e, "CancellationError", { enumerable: !0, get: function() {
      return t.CancellationError;
    } }), Object.defineProperty(e, "CancellationToken", { enumerable: !0, get: function() {
      return t.CancellationToken;
    } });
    var o = Ts();
    Object.defineProperty(e, "newError", { enumerable: !0, get: function() {
      return o.newError;
    } });
    var r = nb();
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
    var c = ib();
    Object.defineProperty(e, "MemoLazy", { enumerable: !0, get: function() {
      return c.MemoLazy;
    } });
    var n = A0();
    Object.defineProperty(e, "ProgressCallbackTransform", { enumerable: !0, get: function() {
      return n.ProgressCallbackTransform;
    } });
    var s = ab();
    Object.defineProperty(e, "getS3LikeProviderBaseUrl", { enumerable: !0, get: function() {
      return s.getS3LikeProviderBaseUrl;
    } }), Object.defineProperty(e, "githubUrl", { enumerable: !0, get: function() {
      return s.githubUrl;
    } });
    var l = sb();
    Object.defineProperty(e, "retry", { enumerable: !0, get: function() {
      return l.retry;
    } });
    var a = ob();
    Object.defineProperty(e, "parseDn", { enumerable: !0, get: function() {
      return a.parseDn;
    } });
    var u = ub();
    Object.defineProperty(e, "UUID", { enumerable: !0, get: function() {
      return u.UUID;
    } });
    var i = lb();
    Object.defineProperty(e, "parseXml", { enumerable: !0, get: function() {
      return i.parseXml;
    } }), Object.defineProperty(e, "XElement", { enumerable: !0, get: function() {
      return i.XElement;
    } }), e.CURRENT_APP_INSTALLER_FILE_NAME = "installer.exe", e.CURRENT_APP_PACKAGE_FILE_NAME = "package.7z";
    function f(d) {
      return d == null ? [] : Array.isArray(d) ? d : [d];
    }
  })(Ou)), Ou;
}
var st = {}, Ja = {}, nr = {}, Jm;
function Kn() {
  if (Jm) return nr;
  Jm = 1;
  function e(s) {
    return typeof s > "u" || s === null;
  }
  function t(s) {
    return typeof s == "object" && s !== null;
  }
  function o(s) {
    return Array.isArray(s) ? s : e(s) ? [] : [s];
  }
  function r(s, l) {
    var a, u, i, f;
    if (l)
      for (f = Object.keys(l), a = 0, u = f.length; a < u; a += 1)
        i = f[a], s[i] = l[i];
    return s;
  }
  function c(s, l) {
    var a = "", u;
    for (u = 0; u < l; u += 1)
      a += s;
    return a;
  }
  function n(s) {
    return s === 0 && Number.NEGATIVE_INFINITY === 1 / s;
  }
  return nr.isNothing = e, nr.isObject = t, nr.toArray = o, nr.repeat = c, nr.isNegativeZero = n, nr.extend = r, nr;
}
var Lu, Qm;
function Xn() {
  if (Qm) return Lu;
  Qm = 1;
  function e(o, r) {
    var c = "", n = o.reason || "(unknown reason)";
    return o.mark ? (o.mark.name && (c += 'in "' + o.mark.name + '" '), c += "(" + (o.mark.line + 1) + ":" + (o.mark.column + 1) + ")", !r && o.mark.snippet && (c += `

` + o.mark.snippet), n + " " + c) : n;
  }
  function t(o, r) {
    Error.call(this), this.name = "YAMLException", this.reason = o, this.mark = r, this.message = e(this, !1), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error().stack || "";
  }
  return t.prototype = Object.create(Error.prototype), t.prototype.constructor = t, t.prototype.toString = function(r) {
    return this.name + ": " + e(this, r);
  }, Lu = t, Lu;
}
var Fu, Zm;
function db() {
  if (Zm) return Fu;
  Zm = 1;
  var e = Kn();
  function t(c, n, s, l, a) {
    var u = "", i = "", f = Math.floor(a / 2) - 1;
    return l - n > f && (u = " ... ", n = l - f + u.length), s - l > f && (i = " ...", s = l + f - i.length), {
      str: u + c.slice(n, s).replace(/\t/g, "→") + i,
      pos: l - n + u.length
      // relative position
    };
  }
  function o(c, n) {
    return e.repeat(" ", n - c.length) + c;
  }
  function r(c, n) {
    if (n = Object.create(n || null), !c.buffer) return null;
    n.maxLength || (n.maxLength = 79), typeof n.indent != "number" && (n.indent = 1), typeof n.linesBefore != "number" && (n.linesBefore = 3), typeof n.linesAfter != "number" && (n.linesAfter = 2);
    for (var s = /\r?\n|\r|\0/g, l = [0], a = [], u, i = -1; u = s.exec(c.buffer); )
      a.push(u.index), l.push(u.index + u[0].length), c.position <= u.index && i < 0 && (i = l.length - 2);
    i < 0 && (i = l.length - 1);
    var f = "", d, m, g = Math.min(c.line + n.linesAfter, a.length).toString().length, v = n.maxLength - (n.indent + g + 3);
    for (d = 1; d <= n.linesBefore && !(i - d < 0); d++)
      m = t(
        c.buffer,
        l[i - d],
        a[i - d],
        c.position - (l[i] - l[i - d]),
        v
      ), f = e.repeat(" ", n.indent) + o((c.line - d + 1).toString(), g) + " | " + m.str + `
` + f;
    for (m = t(c.buffer, l[i], a[i], c.position, v), f += e.repeat(" ", n.indent) + o((c.line + 1).toString(), g) + " | " + m.str + `
`, f += e.repeat("-", n.indent + g + 3 + m.pos) + `^
`, d = 1; d <= n.linesAfter && !(i + d >= a.length); d++)
      m = t(
        c.buffer,
        l[i + d],
        a[i + d],
        c.position - (l[i] - l[i + d]),
        v
      ), f += e.repeat(" ", n.indent) + o((c.line + d + 1).toString(), g) + " | " + m.str + `
`;
    return f.replace(/\n$/, "");
  }
  return Fu = r, Fu;
}
var qu, ey;
function lt() {
  if (ey) return qu;
  ey = 1;
  var e = Xn(), t = [
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
  ], o = [
    "scalar",
    "sequence",
    "mapping"
  ];
  function r(n) {
    var s = {};
    return n !== null && Object.keys(n).forEach(function(l) {
      n[l].forEach(function(a) {
        s[String(a)] = l;
      });
    }), s;
  }
  function c(n, s) {
    if (s = s || {}, Object.keys(s).forEach(function(l) {
      if (t.indexOf(l) === -1)
        throw new e('Unknown option "' + l + '" is met in definition of "' + n + '" YAML type.');
    }), this.options = s, this.tag = n, this.kind = s.kind || null, this.resolve = s.resolve || function() {
      return !0;
    }, this.construct = s.construct || function(l) {
      return l;
    }, this.instanceOf = s.instanceOf || null, this.predicate = s.predicate || null, this.represent = s.represent || null, this.representName = s.representName || null, this.defaultStyle = s.defaultStyle || null, this.multi = s.multi || !1, this.styleAliases = r(s.styleAliases || null), o.indexOf(this.kind) === -1)
      throw new e('Unknown kind "' + this.kind + '" is specified for "' + n + '" YAML type.');
  }
  return qu = c, qu;
}
var Uu, ty;
function I0() {
  if (ty) return Uu;
  ty = 1;
  var e = Xn(), t = lt();
  function o(n, s) {
    var l = [];
    return n[s].forEach(function(a) {
      var u = l.length;
      l.forEach(function(i, f) {
        i.tag === a.tag && i.kind === a.kind && i.multi === a.multi && (u = f);
      }), l[u] = a;
    }), l;
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
    }, s, l;
    function a(u) {
      u.multi ? (n.multi[u.kind].push(u), n.multi.fallback.push(u)) : n[u.kind][u.tag] = n.fallback[u.tag] = u;
    }
    for (s = 0, l = arguments.length; s < l; s += 1)
      arguments[s].forEach(a);
    return n;
  }
  function c(n) {
    return this.extend(n);
  }
  return c.prototype.extend = function(s) {
    var l = [], a = [];
    if (s instanceof t)
      a.push(s);
    else if (Array.isArray(s))
      a = a.concat(s);
    else if (s && (Array.isArray(s.implicit) || Array.isArray(s.explicit)))
      s.implicit && (l = l.concat(s.implicit)), s.explicit && (a = a.concat(s.explicit));
    else
      throw new e("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");
    l.forEach(function(i) {
      if (!(i instanceof t))
        throw new e("Specified list of YAML types (or a single Type object) contains a non-Type object.");
      if (i.loadKind && i.loadKind !== "scalar")
        throw new e("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
      if (i.multi)
        throw new e("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.");
    }), a.forEach(function(i) {
      if (!(i instanceof t))
        throw new e("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    });
    var u = Object.create(c.prototype);
    return u.implicit = (this.implicit || []).concat(l), u.explicit = (this.explicit || []).concat(a), u.compiledImplicit = o(u, "implicit"), u.compiledExplicit = o(u, "explicit"), u.compiledTypeMap = r(u.compiledImplicit, u.compiledExplicit), u;
  }, Uu = c, Uu;
}
var ju, ry;
function C0() {
  if (ry) return ju;
  ry = 1;
  var e = lt();
  return ju = new e("tag:yaml.org,2002:str", {
    kind: "scalar",
    construct: function(t) {
      return t !== null ? t : "";
    }
  }), ju;
}
var Mu, ny;
function D0() {
  if (ny) return Mu;
  ny = 1;
  var e = lt();
  return Mu = new e("tag:yaml.org,2002:seq", {
    kind: "sequence",
    construct: function(t) {
      return t !== null ? t : [];
    }
  }), Mu;
}
var xu, iy;
function k0() {
  if (iy) return xu;
  iy = 1;
  var e = lt();
  return xu = new e("tag:yaml.org,2002:map", {
    kind: "mapping",
    construct: function(t) {
      return t !== null ? t : {};
    }
  }), xu;
}
var Vu, ay;
function L0() {
  if (ay) return Vu;
  ay = 1;
  var e = I0();
  return Vu = new e({
    explicit: [
      C0(),
      D0(),
      k0()
    ]
  }), Vu;
}
var Gu, sy;
function F0() {
  if (sy) return Gu;
  sy = 1;
  var e = lt();
  function t(c) {
    if (c === null) return !0;
    var n = c.length;
    return n === 1 && c === "~" || n === 4 && (c === "null" || c === "Null" || c === "NULL");
  }
  function o() {
    return null;
  }
  function r(c) {
    return c === null;
  }
  return Gu = new e("tag:yaml.org,2002:null", {
    kind: "scalar",
    resolve: t,
    construct: o,
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
  }), Gu;
}
var Hu, oy;
function q0() {
  if (oy) return Hu;
  oy = 1;
  var e = lt();
  function t(c) {
    if (c === null) return !1;
    var n = c.length;
    return n === 4 && (c === "true" || c === "True" || c === "TRUE") || n === 5 && (c === "false" || c === "False" || c === "FALSE");
  }
  function o(c) {
    return c === "true" || c === "True" || c === "TRUE";
  }
  function r(c) {
    return Object.prototype.toString.call(c) === "[object Boolean]";
  }
  return Hu = new e("tag:yaml.org,2002:bool", {
    kind: "scalar",
    resolve: t,
    construct: o,
    predicate: r,
    represent: {
      lowercase: function(c) {
        return c ? "true" : "false";
      },
      uppercase: function(c) {
        return c ? "TRUE" : "FALSE";
      },
      camelcase: function(c) {
        return c ? "True" : "False";
      }
    },
    defaultStyle: "lowercase"
  }), Hu;
}
var Bu, uy;
function U0() {
  if (uy) return Bu;
  uy = 1;
  var e = Kn(), t = lt();
  function o(a) {
    return 48 <= a && a <= 57 || 65 <= a && a <= 70 || 97 <= a && a <= 102;
  }
  function r(a) {
    return 48 <= a && a <= 55;
  }
  function c(a) {
    return 48 <= a && a <= 57;
  }
  function n(a) {
    if (a === null) return !1;
    var u = a.length, i = 0, f = !1, d;
    if (!u) return !1;
    if (d = a[i], (d === "-" || d === "+") && (d = a[++i]), d === "0") {
      if (i + 1 === u) return !0;
      if (d = a[++i], d === "b") {
        for (i++; i < u; i++)
          if (d = a[i], d !== "_") {
            if (d !== "0" && d !== "1") return !1;
            f = !0;
          }
        return f && d !== "_";
      }
      if (d === "x") {
        for (i++; i < u; i++)
          if (d = a[i], d !== "_") {
            if (!o(a.charCodeAt(i))) return !1;
            f = !0;
          }
        return f && d !== "_";
      }
      if (d === "o") {
        for (i++; i < u; i++)
          if (d = a[i], d !== "_") {
            if (!r(a.charCodeAt(i))) return !1;
            f = !0;
          }
        return f && d !== "_";
      }
    }
    if (d === "_") return !1;
    for (; i < u; i++)
      if (d = a[i], d !== "_") {
        if (!c(a.charCodeAt(i)))
          return !1;
        f = !0;
      }
    return !(!f || d === "_");
  }
  function s(a) {
    var u = a, i = 1, f;
    if (u.indexOf("_") !== -1 && (u = u.replace(/_/g, "")), f = u[0], (f === "-" || f === "+") && (f === "-" && (i = -1), u = u.slice(1), f = u[0]), u === "0") return 0;
    if (f === "0") {
      if (u[1] === "b") return i * parseInt(u.slice(2), 2);
      if (u[1] === "x") return i * parseInt(u.slice(2), 16);
      if (u[1] === "o") return i * parseInt(u.slice(2), 8);
    }
    return i * parseInt(u, 10);
  }
  function l(a) {
    return Object.prototype.toString.call(a) === "[object Number]" && a % 1 === 0 && !e.isNegativeZero(a);
  }
  return Bu = new t("tag:yaml.org,2002:int", {
    kind: "scalar",
    resolve: n,
    construct: s,
    predicate: l,
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
  }), Bu;
}
var zu, cy;
function j0() {
  if (cy) return zu;
  cy = 1;
  var e = Kn(), t = lt(), o = new RegExp(
    // 2.5e4, 2.5 and integers
    "^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$"
  );
  function r(a) {
    return !(a === null || !o.test(a) || // Quick hack to not allow integers end with `_`
    // Probably should update regexp & check speed
    a[a.length - 1] === "_");
  }
  function c(a) {
    var u, i;
    return u = a.replace(/_/g, "").toLowerCase(), i = u[0] === "-" ? -1 : 1, "+-".indexOf(u[0]) >= 0 && (u = u.slice(1)), u === ".inf" ? i === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY : u === ".nan" ? NaN : i * parseFloat(u, 10);
  }
  var n = /^[-+]?[0-9]+e/;
  function s(a, u) {
    var i;
    if (isNaN(a))
      switch (u) {
        case "lowercase":
          return ".nan";
        case "uppercase":
          return ".NAN";
        case "camelcase":
          return ".NaN";
      }
    else if (Number.POSITIVE_INFINITY === a)
      switch (u) {
        case "lowercase":
          return ".inf";
        case "uppercase":
          return ".INF";
        case "camelcase":
          return ".Inf";
      }
    else if (Number.NEGATIVE_INFINITY === a)
      switch (u) {
        case "lowercase":
          return "-.inf";
        case "uppercase":
          return "-.INF";
        case "camelcase":
          return "-.Inf";
      }
    else if (e.isNegativeZero(a))
      return "-0.0";
    return i = a.toString(10), n.test(i) ? i.replace("e", ".e") : i;
  }
  function l(a) {
    return Object.prototype.toString.call(a) === "[object Number]" && (a % 1 !== 0 || e.isNegativeZero(a));
  }
  return zu = new t("tag:yaml.org,2002:float", {
    kind: "scalar",
    resolve: r,
    construct: c,
    predicate: l,
    represent: s,
    defaultStyle: "lowercase"
  }), zu;
}
var Ku, ly;
function M0() {
  return ly || (ly = 1, Ku = L0().extend({
    implicit: [
      F0(),
      q0(),
      U0(),
      j0()
    ]
  })), Ku;
}
var Xu, dy;
function x0() {
  return dy || (dy = 1, Xu = M0()), Xu;
}
var Wu, fy;
function V0() {
  if (fy) return Wu;
  fy = 1;
  var e = lt(), t = new RegExp(
    "^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"
  ), o = new RegExp(
    "^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$"
  );
  function r(s) {
    return s === null ? !1 : t.exec(s) !== null || o.exec(s) !== null;
  }
  function c(s) {
    var l, a, u, i, f, d, m, g = 0, v = null, h, y, p;
    if (l = t.exec(s), l === null && (l = o.exec(s)), l === null) throw new Error("Date resolve error");
    if (a = +l[1], u = +l[2] - 1, i = +l[3], !l[4])
      return new Date(Date.UTC(a, u, i));
    if (f = +l[4], d = +l[5], m = +l[6], l[7]) {
      for (g = l[7].slice(0, 3); g.length < 3; )
        g += "0";
      g = +g;
    }
    return l[9] && (h = +l[10], y = +(l[11] || 0), v = (h * 60 + y) * 6e4, l[9] === "-" && (v = -v)), p = new Date(Date.UTC(a, u, i, f, d, m, g)), v && p.setTime(p.getTime() - v), p;
  }
  function n(s) {
    return s.toISOString();
  }
  return Wu = new e("tag:yaml.org,2002:timestamp", {
    kind: "scalar",
    resolve: r,
    construct: c,
    instanceOf: Date,
    represent: n
  }), Wu;
}
var Yu, hy;
function G0() {
  if (hy) return Yu;
  hy = 1;
  var e = lt();
  function t(o) {
    return o === "<<" || o === null;
  }
  return Yu = new e("tag:yaml.org,2002:merge", {
    kind: "scalar",
    resolve: t
  }), Yu;
}
var Ju, py;
function H0() {
  if (py) return Ju;
  py = 1;
  var e = lt(), t = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;
  function o(s) {
    if (s === null) return !1;
    var l, a, u = 0, i = s.length, f = t;
    for (a = 0; a < i; a++)
      if (l = f.indexOf(s.charAt(a)), !(l > 64)) {
        if (l < 0) return !1;
        u += 6;
      }
    return u % 8 === 0;
  }
  function r(s) {
    var l, a, u = s.replace(/[\r\n=]/g, ""), i = u.length, f = t, d = 0, m = [];
    for (l = 0; l < i; l++)
      l % 4 === 0 && l && (m.push(d >> 16 & 255), m.push(d >> 8 & 255), m.push(d & 255)), d = d << 6 | f.indexOf(u.charAt(l));
    return a = i % 4 * 6, a === 0 ? (m.push(d >> 16 & 255), m.push(d >> 8 & 255), m.push(d & 255)) : a === 18 ? (m.push(d >> 10 & 255), m.push(d >> 2 & 255)) : a === 12 && m.push(d >> 4 & 255), new Uint8Array(m);
  }
  function c(s) {
    var l = "", a = 0, u, i, f = s.length, d = t;
    for (u = 0; u < f; u++)
      u % 3 === 0 && u && (l += d[a >> 18 & 63], l += d[a >> 12 & 63], l += d[a >> 6 & 63], l += d[a & 63]), a = (a << 8) + s[u];
    return i = f % 3, i === 0 ? (l += d[a >> 18 & 63], l += d[a >> 12 & 63], l += d[a >> 6 & 63], l += d[a & 63]) : i === 2 ? (l += d[a >> 10 & 63], l += d[a >> 4 & 63], l += d[a << 2 & 63], l += d[64]) : i === 1 && (l += d[a >> 2 & 63], l += d[a << 4 & 63], l += d[64], l += d[64]), l;
  }
  function n(s) {
    return Object.prototype.toString.call(s) === "[object Uint8Array]";
  }
  return Ju = new e("tag:yaml.org,2002:binary", {
    kind: "scalar",
    resolve: o,
    construct: r,
    predicate: n,
    represent: c
  }), Ju;
}
var Qu, my;
function B0() {
  if (my) return Qu;
  my = 1;
  var e = lt(), t = Object.prototype.hasOwnProperty, o = Object.prototype.toString;
  function r(n) {
    if (n === null) return !0;
    var s = [], l, a, u, i, f, d = n;
    for (l = 0, a = d.length; l < a; l += 1) {
      if (u = d[l], f = !1, o.call(u) !== "[object Object]") return !1;
      for (i in u)
        if (t.call(u, i))
          if (!f) f = !0;
          else return !1;
      if (!f) return !1;
      if (s.indexOf(i) === -1) s.push(i);
      else return !1;
    }
    return !0;
  }
  function c(n) {
    return n !== null ? n : [];
  }
  return Qu = new e("tag:yaml.org,2002:omap", {
    kind: "sequence",
    resolve: r,
    construct: c
  }), Qu;
}
var Zu, yy;
function z0() {
  if (yy) return Zu;
  yy = 1;
  var e = lt(), t = Object.prototype.toString;
  function o(c) {
    if (c === null) return !0;
    var n, s, l, a, u, i = c;
    for (u = new Array(i.length), n = 0, s = i.length; n < s; n += 1) {
      if (l = i[n], t.call(l) !== "[object Object]" || (a = Object.keys(l), a.length !== 1)) return !1;
      u[n] = [a[0], l[a[0]]];
    }
    return !0;
  }
  function r(c) {
    if (c === null) return [];
    var n, s, l, a, u, i = c;
    for (u = new Array(i.length), n = 0, s = i.length; n < s; n += 1)
      l = i[n], a = Object.keys(l), u[n] = [a[0], l[a[0]]];
    return u;
  }
  return Zu = new e("tag:yaml.org,2002:pairs", {
    kind: "sequence",
    resolve: o,
    construct: r
  }), Zu;
}
var ec, gy;
function K0() {
  if (gy) return ec;
  gy = 1;
  var e = lt(), t = Object.prototype.hasOwnProperty;
  function o(c) {
    if (c === null) return !0;
    var n, s = c;
    for (n in s)
      if (t.call(s, n) && s[n] !== null)
        return !1;
    return !0;
  }
  function r(c) {
    return c !== null ? c : {};
  }
  return ec = new e("tag:yaml.org,2002:set", {
    kind: "mapping",
    resolve: o,
    construct: r
  }), ec;
}
var tc, vy;
function Tl() {
  return vy || (vy = 1, tc = x0().extend({
    implicit: [
      V0(),
      G0()
    ],
    explicit: [
      H0(),
      B0(),
      z0(),
      K0()
    ]
  })), tc;
}
var _y;
function fb() {
  if (_y) return Ja;
  _y = 1;
  var e = Kn(), t = Xn(), o = db(), r = Tl(), c = Object.prototype.hasOwnProperty, n = 1, s = 2, l = 3, a = 4, u = 1, i = 2, f = 3, d = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/, m = /[\x85\u2028\u2029]/, g = /[,\[\]\{\}]/, v = /^(?:!|!!|![a-z\-]+!)$/i, h = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
  function y(b) {
    return Object.prototype.toString.call(b);
  }
  function p(b) {
    return b === 10 || b === 13;
  }
  function E(b) {
    return b === 9 || b === 32;
  }
  function $(b) {
    return b === 9 || b === 32 || b === 10 || b === 13;
  }
  function S(b) {
    return b === 44 || b === 91 || b === 93 || b === 123 || b === 125;
  }
  function _(b) {
    var te;
    return 48 <= b && b <= 57 ? b - 48 : (te = b | 32, 97 <= te && te <= 102 ? te - 97 + 10 : -1);
  }
  function w(b) {
    return b === 120 ? 2 : b === 117 ? 4 : b === 85 ? 8 : 0;
  }
  function R(b) {
    return 48 <= b && b <= 57 ? b - 48 : -1;
  }
  function P(b) {
    return b === 48 ? "\0" : b === 97 ? "\x07" : b === 98 ? "\b" : b === 116 || b === 9 ? "	" : b === 110 ? `
` : b === 118 ? "\v" : b === 102 ? "\f" : b === 114 ? "\r" : b === 101 ? "\x1B" : b === 32 ? " " : b === 34 ? '"' : b === 47 ? "/" : b === 92 ? "\\" : b === 78 ? "" : b === 95 ? " " : b === 76 ? "\u2028" : b === 80 ? "\u2029" : "";
  }
  function j(b) {
    return b <= 65535 ? String.fromCharCode(b) : String.fromCharCode(
      (b - 65536 >> 10) + 55296,
      (b - 65536 & 1023) + 56320
    );
  }
  function M(b, te, ie) {
    te === "__proto__" ? Object.defineProperty(b, te, {
      configurable: !0,
      enumerable: !0,
      writable: !0,
      value: ie
    }) : b[te] = ie;
  }
  for (var B = new Array(256), W = new Array(256), F = 0; F < 256; F++)
    B[F] = P(F) ? 1 : 0, W[F] = P(F);
  function q(b, te) {
    this.input = b, this.filename = te.filename || null, this.schema = te.schema || r, this.onWarning = te.onWarning || null, this.legacy = te.legacy || !1, this.json = te.json || !1, this.listener = te.listener || null, this.implicitTypes = this.schema.compiledImplicit, this.typeMap = this.schema.compiledTypeMap, this.length = b.length, this.position = 0, this.line = 0, this.lineStart = 0, this.lineIndent = 0, this.firstTabInLine = -1, this.documents = [];
  }
  function J(b, te) {
    var ie = {
      name: b.filename,
      buffer: b.input.slice(0, -1),
      // omit trailing \0
      position: b.position,
      line: b.line,
      column: b.position - b.lineStart
    };
    return ie.snippet = o(ie), new t(te, ie);
  }
  function H(b, te) {
    throw J(b, te);
  }
  function G(b, te) {
    b.onWarning && b.onWarning.call(null, J(b, te));
  }
  var Y = {
    YAML: function(te, ie, me) {
      var ae, fe, le;
      te.version !== null && H(te, "duplication of %YAML directive"), me.length !== 1 && H(te, "YAML directive accepts exactly one argument"), ae = /^([0-9]+)\.([0-9]+)$/.exec(me[0]), ae === null && H(te, "ill-formed argument of the YAML directive"), fe = parseInt(ae[1], 10), le = parseInt(ae[2], 10), fe !== 1 && H(te, "unacceptable YAML version of the document"), te.version = me[0], te.checkLineBreaks = le < 2, le !== 1 && le !== 2 && G(te, "unsupported YAML version of the document");
    },
    TAG: function(te, ie, me) {
      var ae, fe;
      me.length !== 2 && H(te, "TAG directive accepts exactly two arguments"), ae = me[0], fe = me[1], v.test(ae) || H(te, "ill-formed tag handle (first argument) of the TAG directive"), c.call(te.tagMap, ae) && H(te, 'there is a previously declared suffix for "' + ae + '" tag handle'), h.test(fe) || H(te, "ill-formed tag prefix (second argument) of the TAG directive");
      try {
        fe = decodeURIComponent(fe);
      } catch {
        H(te, "tag prefix is malformed: " + fe);
      }
      te.tagMap[ae] = fe;
    }
  };
  function k(b, te, ie, me) {
    var ae, fe, le, ye;
    if (te < ie) {
      if (ye = b.input.slice(te, ie), me)
        for (ae = 0, fe = ye.length; ae < fe; ae += 1)
          le = ye.charCodeAt(ae), le === 9 || 32 <= le && le <= 1114111 || H(b, "expected valid JSON character");
      else d.test(ye) && H(b, "the stream contains non-printable characters");
      b.result += ye;
    }
  }
  function I(b, te, ie, me) {
    var ae, fe, le, ye;
    for (e.isObject(ie) || H(b, "cannot merge mappings; the provided source object is unacceptable"), ae = Object.keys(ie), le = 0, ye = ae.length; le < ye; le += 1)
      fe = ae[le], c.call(te, fe) || (M(te, fe, ie[fe]), me[fe] = !0);
  }
  function U(b, te, ie, me, ae, fe, le, ye, _e) {
    var Le, Fe;
    if (Array.isArray(ae))
      for (ae = Array.prototype.slice.call(ae), Le = 0, Fe = ae.length; Le < Fe; Le += 1)
        Array.isArray(ae[Le]) && H(b, "nested arrays are not supported inside keys"), typeof ae == "object" && y(ae[Le]) === "[object Object]" && (ae[Le] = "[object Object]");
    if (typeof ae == "object" && y(ae) === "[object Object]" && (ae = "[object Object]"), ae = String(ae), te === null && (te = {}), me === "tag:yaml.org,2002:merge")
      if (Array.isArray(fe))
        for (Le = 0, Fe = fe.length; Le < Fe; Le += 1)
          I(b, te, fe[Le], ie);
      else
        I(b, te, fe, ie);
    else
      !b.json && !c.call(ie, ae) && c.call(te, ae) && (b.line = le || b.line, b.lineStart = ye || b.lineStart, b.position = _e || b.position, H(b, "duplicated mapping key")), M(te, ae, fe), delete ie[ae];
    return te;
  }
  function D(b) {
    var te;
    te = b.input.charCodeAt(b.position), te === 10 ? b.position++ : te === 13 ? (b.position++, b.input.charCodeAt(b.position) === 10 && b.position++) : H(b, "a line break is expected"), b.line += 1, b.lineStart = b.position, b.firstTabInLine = -1;
  }
  function T(b, te, ie) {
    for (var me = 0, ae = b.input.charCodeAt(b.position); ae !== 0; ) {
      for (; E(ae); )
        ae === 9 && b.firstTabInLine === -1 && (b.firstTabInLine = b.position), ae = b.input.charCodeAt(++b.position);
      if (te && ae === 35)
        do
          ae = b.input.charCodeAt(++b.position);
        while (ae !== 10 && ae !== 13 && ae !== 0);
      if (p(ae))
        for (D(b), ae = b.input.charCodeAt(b.position), me++, b.lineIndent = 0; ae === 32; )
          b.lineIndent++, ae = b.input.charCodeAt(++b.position);
      else
        break;
    }
    return ie !== -1 && me !== 0 && b.lineIndent < ie && G(b, "deficient indentation"), me;
  }
  function N(b) {
    var te = b.position, ie;
    return ie = b.input.charCodeAt(te), !!((ie === 45 || ie === 46) && ie === b.input.charCodeAt(te + 1) && ie === b.input.charCodeAt(te + 2) && (te += 3, ie = b.input.charCodeAt(te), ie === 0 || $(ie)));
  }
  function V(b, te) {
    te === 1 ? b.result += " " : te > 1 && (b.result += e.repeat(`
`, te - 1));
  }
  function A(b, te, ie) {
    var me, ae, fe, le, ye, _e, Le, Fe, $e = b.kind, x = b.result, ne;
    if (ne = b.input.charCodeAt(b.position), $(ne) || S(ne) || ne === 35 || ne === 38 || ne === 42 || ne === 33 || ne === 124 || ne === 62 || ne === 39 || ne === 34 || ne === 37 || ne === 64 || ne === 96 || (ne === 63 || ne === 45) && (ae = b.input.charCodeAt(b.position + 1), $(ae) || ie && S(ae)))
      return !1;
    for (b.kind = "scalar", b.result = "", fe = le = b.position, ye = !1; ne !== 0; ) {
      if (ne === 58) {
        if (ae = b.input.charCodeAt(b.position + 1), $(ae) || ie && S(ae))
          break;
      } else if (ne === 35) {
        if (me = b.input.charCodeAt(b.position - 1), $(me))
          break;
      } else {
        if (b.position === b.lineStart && N(b) || ie && S(ne))
          break;
        if (p(ne))
          if (_e = b.line, Le = b.lineStart, Fe = b.lineIndent, T(b, !1, -1), b.lineIndent >= te) {
            ye = !0, ne = b.input.charCodeAt(b.position);
            continue;
          } else {
            b.position = le, b.line = _e, b.lineStart = Le, b.lineIndent = Fe;
            break;
          }
      }
      ye && (k(b, fe, le, !1), V(b, b.line - _e), fe = le = b.position, ye = !1), E(ne) || (le = b.position + 1), ne = b.input.charCodeAt(++b.position);
    }
    return k(b, fe, le, !1), b.result ? !0 : (b.kind = $e, b.result = x, !1);
  }
  function O(b, te) {
    var ie, me, ae;
    if (ie = b.input.charCodeAt(b.position), ie !== 39)
      return !1;
    for (b.kind = "scalar", b.result = "", b.position++, me = ae = b.position; (ie = b.input.charCodeAt(b.position)) !== 0; )
      if (ie === 39)
        if (k(b, me, b.position, !0), ie = b.input.charCodeAt(++b.position), ie === 39)
          me = b.position, b.position++, ae = b.position;
        else
          return !0;
      else p(ie) ? (k(b, me, ae, !0), V(b, T(b, !1, te)), me = ae = b.position) : b.position === b.lineStart && N(b) ? H(b, "unexpected end of the document within a single quoted scalar") : (b.position++, ae = b.position);
    H(b, "unexpected end of the stream within a single quoted scalar");
  }
  function Z(b, te) {
    var ie, me, ae, fe, le, ye;
    if (ye = b.input.charCodeAt(b.position), ye !== 34)
      return !1;
    for (b.kind = "scalar", b.result = "", b.position++, ie = me = b.position; (ye = b.input.charCodeAt(b.position)) !== 0; ) {
      if (ye === 34)
        return k(b, ie, b.position, !0), b.position++, !0;
      if (ye === 92) {
        if (k(b, ie, b.position, !0), ye = b.input.charCodeAt(++b.position), p(ye))
          T(b, !1, te);
        else if (ye < 256 && B[ye])
          b.result += W[ye], b.position++;
        else if ((le = w(ye)) > 0) {
          for (ae = le, fe = 0; ae > 0; ae--)
            ye = b.input.charCodeAt(++b.position), (le = _(ye)) >= 0 ? fe = (fe << 4) + le : H(b, "expected hexadecimal character");
          b.result += j(fe), b.position++;
        } else
          H(b, "unknown escape sequence");
        ie = me = b.position;
      } else p(ye) ? (k(b, ie, me, !0), V(b, T(b, !1, te)), ie = me = b.position) : b.position === b.lineStart && N(b) ? H(b, "unexpected end of the document within a double quoted scalar") : (b.position++, me = b.position);
    }
    H(b, "unexpected end of the stream within a double quoted scalar");
  }
  function z(b, te) {
    var ie = !0, me, ae, fe, le = b.tag, ye, _e = b.anchor, Le, Fe, $e, x, ne, se = /* @__PURE__ */ Object.create(null), oe, ue, ge, pe;
    if (pe = b.input.charCodeAt(b.position), pe === 91)
      Fe = 93, ne = !1, ye = [];
    else if (pe === 123)
      Fe = 125, ne = !0, ye = {};
    else
      return !1;
    for (b.anchor !== null && (b.anchorMap[b.anchor] = ye), pe = b.input.charCodeAt(++b.position); pe !== 0; ) {
      if (T(b, !0, te), pe = b.input.charCodeAt(b.position), pe === Fe)
        return b.position++, b.tag = le, b.anchor = _e, b.kind = ne ? "mapping" : "sequence", b.result = ye, !0;
      ie ? pe === 44 && H(b, "expected the node content, but found ','") : H(b, "missed comma between flow collection entries"), ue = oe = ge = null, $e = x = !1, pe === 63 && (Le = b.input.charCodeAt(b.position + 1), $(Le) && ($e = x = !0, b.position++, T(b, !0, te))), me = b.line, ae = b.lineStart, fe = b.position, ve(b, te, n, !1, !0), ue = b.tag, oe = b.result, T(b, !0, te), pe = b.input.charCodeAt(b.position), (x || b.line === me) && pe === 58 && ($e = !0, pe = b.input.charCodeAt(++b.position), T(b, !0, te), ve(b, te, n, !1, !0), ge = b.result), ne ? U(b, ye, se, ue, oe, ge, me, ae, fe) : $e ? ye.push(U(b, null, se, ue, oe, ge, me, ae, fe)) : ye.push(oe), T(b, !0, te), pe = b.input.charCodeAt(b.position), pe === 44 ? (ie = !0, pe = b.input.charCodeAt(++b.position)) : ie = !1;
    }
    H(b, "unexpected end of the stream within a flow collection");
  }
  function C(b, te) {
    var ie, me, ae = u, fe = !1, le = !1, ye = te, _e = 0, Le = !1, Fe, $e;
    if ($e = b.input.charCodeAt(b.position), $e === 124)
      me = !1;
    else if ($e === 62)
      me = !0;
    else
      return !1;
    for (b.kind = "scalar", b.result = ""; $e !== 0; )
      if ($e = b.input.charCodeAt(++b.position), $e === 43 || $e === 45)
        u === ae ? ae = $e === 43 ? f : i : H(b, "repeat of a chomping mode identifier");
      else if ((Fe = R($e)) >= 0)
        Fe === 0 ? H(b, "bad explicit indentation width of a block scalar; it cannot be less than one") : le ? H(b, "repeat of an indentation width identifier") : (ye = te + Fe - 1, le = !0);
      else
        break;
    if (E($e)) {
      do
        $e = b.input.charCodeAt(++b.position);
      while (E($e));
      if ($e === 35)
        do
          $e = b.input.charCodeAt(++b.position);
        while (!p($e) && $e !== 0);
    }
    for (; $e !== 0; ) {
      for (D(b), b.lineIndent = 0, $e = b.input.charCodeAt(b.position); (!le || b.lineIndent < ye) && $e === 32; )
        b.lineIndent++, $e = b.input.charCodeAt(++b.position);
      if (!le && b.lineIndent > ye && (ye = b.lineIndent), p($e)) {
        _e++;
        continue;
      }
      if (b.lineIndent < ye) {
        ae === f ? b.result += e.repeat(`
`, fe ? 1 + _e : _e) : ae === u && fe && (b.result += `
`);
        break;
      }
      for (me ? E($e) ? (Le = !0, b.result += e.repeat(`
`, fe ? 1 + _e : _e)) : Le ? (Le = !1, b.result += e.repeat(`
`, _e + 1)) : _e === 0 ? fe && (b.result += " ") : b.result += e.repeat(`
`, _e) : b.result += e.repeat(`
`, fe ? 1 + _e : _e), fe = !0, le = !0, _e = 0, ie = b.position; !p($e) && $e !== 0; )
        $e = b.input.charCodeAt(++b.position);
      k(b, ie, b.position, !1);
    }
    return !0;
  }
  function L(b, te) {
    var ie, me = b.tag, ae = b.anchor, fe = [], le, ye = !1, _e;
    if (b.firstTabInLine !== -1) return !1;
    for (b.anchor !== null && (b.anchorMap[b.anchor] = fe), _e = b.input.charCodeAt(b.position); _e !== 0 && (b.firstTabInLine !== -1 && (b.position = b.firstTabInLine, H(b, "tab characters must not be used in indentation")), !(_e !== 45 || (le = b.input.charCodeAt(b.position + 1), !$(le)))); ) {
      if (ye = !0, b.position++, T(b, !0, -1) && b.lineIndent <= te) {
        fe.push(null), _e = b.input.charCodeAt(b.position);
        continue;
      }
      if (ie = b.line, ve(b, te, l, !1, !0), fe.push(b.result), T(b, !0, -1), _e = b.input.charCodeAt(b.position), (b.line === ie || b.lineIndent > te) && _e !== 0)
        H(b, "bad indentation of a sequence entry");
      else if (b.lineIndent < te)
        break;
    }
    return ye ? (b.tag = me, b.anchor = ae, b.kind = "sequence", b.result = fe, !0) : !1;
  }
  function X(b, te, ie) {
    var me, ae, fe, le, ye, _e, Le = b.tag, Fe = b.anchor, $e = {}, x = /* @__PURE__ */ Object.create(null), ne = null, se = null, oe = null, ue = !1, ge = !1, pe;
    if (b.firstTabInLine !== -1) return !1;
    for (b.anchor !== null && (b.anchorMap[b.anchor] = $e), pe = b.input.charCodeAt(b.position); pe !== 0; ) {
      if (!ue && b.firstTabInLine !== -1 && (b.position = b.firstTabInLine, H(b, "tab characters must not be used in indentation")), me = b.input.charCodeAt(b.position + 1), fe = b.line, (pe === 63 || pe === 58) && $(me))
        pe === 63 ? (ue && (U(b, $e, x, ne, se, null, le, ye, _e), ne = se = oe = null), ge = !0, ue = !0, ae = !0) : ue ? (ue = !1, ae = !0) : H(b, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"), b.position += 1, pe = me;
      else {
        if (le = b.line, ye = b.lineStart, _e = b.position, !ve(b, ie, s, !1, !0))
          break;
        if (b.line === fe) {
          for (pe = b.input.charCodeAt(b.position); E(pe); )
            pe = b.input.charCodeAt(++b.position);
          if (pe === 58)
            pe = b.input.charCodeAt(++b.position), $(pe) || H(b, "a whitespace character is expected after the key-value separator within a block mapping"), ue && (U(b, $e, x, ne, se, null, le, ye, _e), ne = se = oe = null), ge = !0, ue = !1, ae = !1, ne = b.tag, se = b.result;
          else if (ge)
            H(b, "can not read an implicit mapping pair; a colon is missed");
          else
            return b.tag = Le, b.anchor = Fe, !0;
        } else if (ge)
          H(b, "can not read a block mapping entry; a multiline key may not be an implicit key");
        else
          return b.tag = Le, b.anchor = Fe, !0;
      }
      if ((b.line === fe || b.lineIndent > te) && (ue && (le = b.line, ye = b.lineStart, _e = b.position), ve(b, te, a, !0, ae) && (ue ? se = b.result : oe = b.result), ue || (U(b, $e, x, ne, se, oe, le, ye, _e), ne = se = oe = null), T(b, !0, -1), pe = b.input.charCodeAt(b.position)), (b.line === fe || b.lineIndent > te) && pe !== 0)
        H(b, "bad indentation of a mapping entry");
      else if (b.lineIndent < te)
        break;
    }
    return ue && U(b, $e, x, ne, se, null, le, ye, _e), ge && (b.tag = Le, b.anchor = Fe, b.kind = "mapping", b.result = $e), ge;
  }
  function Q(b) {
    var te, ie = !1, me = !1, ae, fe, le;
    if (le = b.input.charCodeAt(b.position), le !== 33) return !1;
    if (b.tag !== null && H(b, "duplication of a tag property"), le = b.input.charCodeAt(++b.position), le === 60 ? (ie = !0, le = b.input.charCodeAt(++b.position)) : le === 33 ? (me = !0, ae = "!!", le = b.input.charCodeAt(++b.position)) : ae = "!", te = b.position, ie) {
      do
        le = b.input.charCodeAt(++b.position);
      while (le !== 0 && le !== 62);
      b.position < b.length ? (fe = b.input.slice(te, b.position), le = b.input.charCodeAt(++b.position)) : H(b, "unexpected end of the stream within a verbatim tag");
    } else {
      for (; le !== 0 && !$(le); )
        le === 33 && (me ? H(b, "tag suffix cannot contain exclamation marks") : (ae = b.input.slice(te - 1, b.position + 1), v.test(ae) || H(b, "named tag handle cannot contain such characters"), me = !0, te = b.position + 1)), le = b.input.charCodeAt(++b.position);
      fe = b.input.slice(te, b.position), g.test(fe) && H(b, "tag suffix cannot contain flow indicator characters");
    }
    fe && !h.test(fe) && H(b, "tag name cannot contain such characters: " + fe);
    try {
      fe = decodeURIComponent(fe);
    } catch {
      H(b, "tag name is malformed: " + fe);
    }
    return ie ? b.tag = fe : c.call(b.tagMap, ae) ? b.tag = b.tagMap[ae] + fe : ae === "!" ? b.tag = "!" + fe : ae === "!!" ? b.tag = "tag:yaml.org,2002:" + fe : H(b, 'undeclared tag handle "' + ae + '"'), !0;
  }
  function re(b) {
    var te, ie;
    if (ie = b.input.charCodeAt(b.position), ie !== 38) return !1;
    for (b.anchor !== null && H(b, "duplication of an anchor property"), ie = b.input.charCodeAt(++b.position), te = b.position; ie !== 0 && !$(ie) && !S(ie); )
      ie = b.input.charCodeAt(++b.position);
    return b.position === te && H(b, "name of an anchor node must contain at least one character"), b.anchor = b.input.slice(te, b.position), !0;
  }
  function de(b) {
    var te, ie, me;
    if (me = b.input.charCodeAt(b.position), me !== 42) return !1;
    for (me = b.input.charCodeAt(++b.position), te = b.position; me !== 0 && !$(me) && !S(me); )
      me = b.input.charCodeAt(++b.position);
    return b.position === te && H(b, "name of an alias node must contain at least one character"), ie = b.input.slice(te, b.position), c.call(b.anchorMap, ie) || H(b, 'unidentified alias "' + ie + '"'), b.result = b.anchorMap[ie], T(b, !0, -1), !0;
  }
  function ve(b, te, ie, me, ae) {
    var fe, le, ye, _e = 1, Le = !1, Fe = !1, $e, x, ne, se, oe, ue;
    if (b.listener !== null && b.listener("open", b), b.tag = null, b.anchor = null, b.kind = null, b.result = null, fe = le = ye = a === ie || l === ie, me && T(b, !0, -1) && (Le = !0, b.lineIndent > te ? _e = 1 : b.lineIndent === te ? _e = 0 : b.lineIndent < te && (_e = -1)), _e === 1)
      for (; Q(b) || re(b); )
        T(b, !0, -1) ? (Le = !0, ye = fe, b.lineIndent > te ? _e = 1 : b.lineIndent === te ? _e = 0 : b.lineIndent < te && (_e = -1)) : ye = !1;
    if (ye && (ye = Le || ae), (_e === 1 || a === ie) && (n === ie || s === ie ? oe = te : oe = te + 1, ue = b.position - b.lineStart, _e === 1 ? ye && (L(b, ue) || X(b, ue, oe)) || z(b, oe) ? Fe = !0 : (le && C(b, oe) || O(b, oe) || Z(b, oe) ? Fe = !0 : de(b) ? (Fe = !0, (b.tag !== null || b.anchor !== null) && H(b, "alias node should not have any properties")) : A(b, oe, n === ie) && (Fe = !0, b.tag === null && (b.tag = "?")), b.anchor !== null && (b.anchorMap[b.anchor] = b.result)) : _e === 0 && (Fe = ye && L(b, ue))), b.tag === null)
      b.anchor !== null && (b.anchorMap[b.anchor] = b.result);
    else if (b.tag === "?") {
      for (b.result !== null && b.kind !== "scalar" && H(b, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + b.kind + '"'), $e = 0, x = b.implicitTypes.length; $e < x; $e += 1)
        if (se = b.implicitTypes[$e], se.resolve(b.result)) {
          b.result = se.construct(b.result), b.tag = se.tag, b.anchor !== null && (b.anchorMap[b.anchor] = b.result);
          break;
        }
    } else if (b.tag !== "!") {
      if (c.call(b.typeMap[b.kind || "fallback"], b.tag))
        se = b.typeMap[b.kind || "fallback"][b.tag];
      else
        for (se = null, ne = b.typeMap.multi[b.kind || "fallback"], $e = 0, x = ne.length; $e < x; $e += 1)
          if (b.tag.slice(0, ne[$e].tag.length) === ne[$e].tag) {
            se = ne[$e];
            break;
          }
      se || H(b, "unknown tag !<" + b.tag + ">"), b.result !== null && se.kind !== b.kind && H(b, "unacceptable node kind for !<" + b.tag + '> tag; it should be "' + se.kind + '", not "' + b.kind + '"'), se.resolve(b.result, b.tag) ? (b.result = se.construct(b.result, b.tag), b.anchor !== null && (b.anchorMap[b.anchor] = b.result)) : H(b, "cannot resolve a node with !<" + b.tag + "> explicit tag");
    }
    return b.listener !== null && b.listener("close", b), b.tag !== null || b.anchor !== null || Fe;
  }
  function Pe(b) {
    var te = b.position, ie, me, ae, fe = !1, le;
    for (b.version = null, b.checkLineBreaks = b.legacy, b.tagMap = /* @__PURE__ */ Object.create(null), b.anchorMap = /* @__PURE__ */ Object.create(null); (le = b.input.charCodeAt(b.position)) !== 0 && (T(b, !0, -1), le = b.input.charCodeAt(b.position), !(b.lineIndent > 0 || le !== 37)); ) {
      for (fe = !0, le = b.input.charCodeAt(++b.position), ie = b.position; le !== 0 && !$(le); )
        le = b.input.charCodeAt(++b.position);
      for (me = b.input.slice(ie, b.position), ae = [], me.length < 1 && H(b, "directive name must not be less than one character in length"); le !== 0; ) {
        for (; E(le); )
          le = b.input.charCodeAt(++b.position);
        if (le === 35) {
          do
            le = b.input.charCodeAt(++b.position);
          while (le !== 0 && !p(le));
          break;
        }
        if (p(le)) break;
        for (ie = b.position; le !== 0 && !$(le); )
          le = b.input.charCodeAt(++b.position);
        ae.push(b.input.slice(ie, b.position));
      }
      le !== 0 && D(b), c.call(Y, me) ? Y[me](b, me, ae) : G(b, 'unknown document directive "' + me + '"');
    }
    if (T(b, !0, -1), b.lineIndent === 0 && b.input.charCodeAt(b.position) === 45 && b.input.charCodeAt(b.position + 1) === 45 && b.input.charCodeAt(b.position + 2) === 45 ? (b.position += 3, T(b, !0, -1)) : fe && H(b, "directives end mark is expected"), ve(b, b.lineIndent - 1, a, !1, !0), T(b, !0, -1), b.checkLineBreaks && m.test(b.input.slice(te, b.position)) && G(b, "non-ASCII line breaks are interpreted as content"), b.documents.push(b.result), b.position === b.lineStart && N(b)) {
      b.input.charCodeAt(b.position) === 46 && (b.position += 3, T(b, !0, -1));
      return;
    }
    if (b.position < b.length - 1)
      H(b, "end of the stream or a document separator is expected");
    else
      return;
  }
  function Ce(b, te) {
    b = String(b), te = te || {}, b.length !== 0 && (b.charCodeAt(b.length - 1) !== 10 && b.charCodeAt(b.length - 1) !== 13 && (b += `
`), b.charCodeAt(0) === 65279 && (b = b.slice(1)));
    var ie = new q(b, te), me = b.indexOf("\0");
    for (me !== -1 && (ie.position = me, H(ie, "null byte is not allowed in input")), ie.input += "\0"; ie.input.charCodeAt(ie.position) === 32; )
      ie.lineIndent += 1, ie.position += 1;
    for (; ie.position < ie.length - 1; )
      Pe(ie);
    return ie.documents;
  }
  function Ne(b, te, ie) {
    te !== null && typeof te == "object" && typeof ie > "u" && (ie = te, te = null);
    var me = Ce(b, ie);
    if (typeof te != "function")
      return me;
    for (var ae = 0, fe = me.length; ae < fe; ae += 1)
      te(me[ae]);
  }
  function be(b, te) {
    var ie = Ce(b, te);
    if (ie.length !== 0) {
      if (ie.length === 1)
        return ie[0];
      throw new t("expected a single document in the stream, but found more");
    }
  }
  return Ja.loadAll = Ne, Ja.load = be, Ja;
}
var rc = {}, Ey;
function hb() {
  if (Ey) return rc;
  Ey = 1;
  var e = Kn(), t = Xn(), o = Tl(), r = Object.prototype.toString, c = Object.prototype.hasOwnProperty, n = 65279, s = 9, l = 10, a = 13, u = 32, i = 33, f = 34, d = 35, m = 37, g = 38, v = 39, h = 42, y = 44, p = 45, E = 58, $ = 61, S = 62, _ = 63, w = 64, R = 91, P = 93, j = 96, M = 123, B = 124, W = 125, F = {};
  F[0] = "\\0", F[7] = "\\a", F[8] = "\\b", F[9] = "\\t", F[10] = "\\n", F[11] = "\\v", F[12] = "\\f", F[13] = "\\r", F[27] = "\\e", F[34] = '\\"', F[92] = "\\\\", F[133] = "\\N", F[160] = "\\_", F[8232] = "\\L", F[8233] = "\\P";
  var q = [
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
  ], J = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;
  function H(x, ne) {
    var se, oe, ue, ge, pe, Ee, Se;
    if (ne === null) return {};
    for (se = {}, oe = Object.keys(ne), ue = 0, ge = oe.length; ue < ge; ue += 1)
      pe = oe[ue], Ee = String(ne[pe]), pe.slice(0, 2) === "!!" && (pe = "tag:yaml.org,2002:" + pe.slice(2)), Se = x.compiledTypeMap.fallback[pe], Se && c.call(Se.styleAliases, Ee) && (Ee = Se.styleAliases[Ee]), se[pe] = Ee;
    return se;
  }
  function G(x) {
    var ne, se, oe;
    if (ne = x.toString(16).toUpperCase(), x <= 255)
      se = "x", oe = 2;
    else if (x <= 65535)
      se = "u", oe = 4;
    else if (x <= 4294967295)
      se = "U", oe = 8;
    else
      throw new t("code point within a string may not be greater than 0xFFFFFFFF");
    return "\\" + se + e.repeat("0", oe - ne.length) + ne;
  }
  var Y = 1, k = 2;
  function I(x) {
    this.schema = x.schema || o, this.indent = Math.max(1, x.indent || 2), this.noArrayIndent = x.noArrayIndent || !1, this.skipInvalid = x.skipInvalid || !1, this.flowLevel = e.isNothing(x.flowLevel) ? -1 : x.flowLevel, this.styleMap = H(this.schema, x.styles || null), this.sortKeys = x.sortKeys || !1, this.lineWidth = x.lineWidth || 80, this.noRefs = x.noRefs || !1, this.noCompatMode = x.noCompatMode || !1, this.condenseFlow = x.condenseFlow || !1, this.quotingType = x.quotingType === '"' ? k : Y, this.forceQuotes = x.forceQuotes || !1, this.replacer = typeof x.replacer == "function" ? x.replacer : null, this.implicitTypes = this.schema.compiledImplicit, this.explicitTypes = this.schema.compiledExplicit, this.tag = null, this.result = "", this.duplicates = [], this.usedDuplicates = null;
  }
  function U(x, ne) {
    for (var se = e.repeat(" ", ne), oe = 0, ue = -1, ge = "", pe, Ee = x.length; oe < Ee; )
      ue = x.indexOf(`
`, oe), ue === -1 ? (pe = x.slice(oe), oe = Ee) : (pe = x.slice(oe, ue + 1), oe = ue + 1), pe.length && pe !== `
` && (ge += se), ge += pe;
    return ge;
  }
  function D(x, ne) {
    return `
` + e.repeat(" ", x.indent * ne);
  }
  function T(x, ne) {
    var se, oe, ue;
    for (se = 0, oe = x.implicitTypes.length; se < oe; se += 1)
      if (ue = x.implicitTypes[se], ue.resolve(ne))
        return !0;
    return !1;
  }
  function N(x) {
    return x === u || x === s;
  }
  function V(x) {
    return 32 <= x && x <= 126 || 161 <= x && x <= 55295 && x !== 8232 && x !== 8233 || 57344 <= x && x <= 65533 && x !== n || 65536 <= x && x <= 1114111;
  }
  function A(x) {
    return V(x) && x !== n && x !== a && x !== l;
  }
  function O(x, ne, se) {
    var oe = A(x), ue = oe && !N(x);
    return (
      // ns-plain-safe
      (se ? (
        // c = flow-in
        oe
      ) : oe && x !== y && x !== R && x !== P && x !== M && x !== W) && x !== d && !(ne === E && !ue) || A(ne) && !N(ne) && x === d || ne === E && ue
    );
  }
  function Z(x) {
    return V(x) && x !== n && !N(x) && x !== p && x !== _ && x !== E && x !== y && x !== R && x !== P && x !== M && x !== W && x !== d && x !== g && x !== h && x !== i && x !== B && x !== $ && x !== S && x !== v && x !== f && x !== m && x !== w && x !== j;
  }
  function z(x) {
    return !N(x) && x !== E;
  }
  function C(x, ne) {
    var se = x.charCodeAt(ne), oe;
    return se >= 55296 && se <= 56319 && ne + 1 < x.length && (oe = x.charCodeAt(ne + 1), oe >= 56320 && oe <= 57343) ? (se - 55296) * 1024 + oe - 56320 + 65536 : se;
  }
  function L(x) {
    var ne = /^\n* /;
    return ne.test(x);
  }
  var X = 1, Q = 2, re = 3, de = 4, ve = 5;
  function Pe(x, ne, se, oe, ue, ge, pe, Ee) {
    var Se, Te = 0, He = null, We = !1, je = !1, Lr = oe !== -1, bt = -1, hr = Z(C(x, 0)) && z(C(x, x.length - 1));
    if (ne || pe)
      for (Se = 0; Se < x.length; Te >= 65536 ? Se += 2 : Se++) {
        if (Te = C(x, Se), !V(Te))
          return ve;
        hr = hr && O(Te, He, Ee), He = Te;
      }
    else {
      for (Se = 0; Se < x.length; Te >= 65536 ? Se += 2 : Se++) {
        if (Te = C(x, Se), Te === l)
          We = !0, Lr && (je = je || // Foldable line = too long, and not more-indented.
          Se - bt - 1 > oe && x[bt + 1] !== " ", bt = Se);
        else if (!V(Te))
          return ve;
        hr = hr && O(Te, He, Ee), He = Te;
      }
      je = je || Lr && Se - bt - 1 > oe && x[bt + 1] !== " ";
    }
    return !We && !je ? hr && !pe && !ue(x) ? X : ge === k ? ve : Q : se > 9 && L(x) ? ve : pe ? ge === k ? ve : Q : je ? de : re;
  }
  function Ce(x, ne, se, oe, ue) {
    x.dump = (function() {
      if (ne.length === 0)
        return x.quotingType === k ? '""' : "''";
      if (!x.noCompatMode && (q.indexOf(ne) !== -1 || J.test(ne)))
        return x.quotingType === k ? '"' + ne + '"' : "'" + ne + "'";
      var ge = x.indent * Math.max(1, se), pe = x.lineWidth === -1 ? -1 : Math.max(Math.min(x.lineWidth, 40), x.lineWidth - ge), Ee = oe || x.flowLevel > -1 && se >= x.flowLevel;
      function Se(Te) {
        return T(x, Te);
      }
      switch (Pe(
        ne,
        Ee,
        x.indent,
        pe,
        Se,
        x.quotingType,
        x.forceQuotes && !oe,
        ue
      )) {
        case X:
          return ne;
        case Q:
          return "'" + ne.replace(/'/g, "''") + "'";
        case re:
          return "|" + Ne(ne, x.indent) + be(U(ne, ge));
        case de:
          return ">" + Ne(ne, x.indent) + be(U(b(ne, pe), ge));
        case ve:
          return '"' + ie(ne) + '"';
        default:
          throw new t("impossible error: invalid scalar style");
      }
    })();
  }
  function Ne(x, ne) {
    var se = L(x) ? String(ne) : "", oe = x[x.length - 1] === `
`, ue = oe && (x[x.length - 2] === `
` || x === `
`), ge = ue ? "+" : oe ? "" : "-";
    return se + ge + `
`;
  }
  function be(x) {
    return x[x.length - 1] === `
` ? x.slice(0, -1) : x;
  }
  function b(x, ne) {
    for (var se = /(\n+)([^\n]*)/g, oe = (function() {
      var Te = x.indexOf(`
`);
      return Te = Te !== -1 ? Te : x.length, se.lastIndex = Te, te(x.slice(0, Te), ne);
    })(), ue = x[0] === `
` || x[0] === " ", ge, pe; pe = se.exec(x); ) {
      var Ee = pe[1], Se = pe[2];
      ge = Se[0] === " ", oe += Ee + (!ue && !ge && Se !== "" ? `
` : "") + te(Se, ne), ue = ge;
    }
    return oe;
  }
  function te(x, ne) {
    if (x === "" || x[0] === " ") return x;
    for (var se = / [^ ]/g, oe, ue = 0, ge, pe = 0, Ee = 0, Se = ""; oe = se.exec(x); )
      Ee = oe.index, Ee - ue > ne && (ge = pe > ue ? pe : Ee, Se += `
` + x.slice(ue, ge), ue = ge + 1), pe = Ee;
    return Se += `
`, x.length - ue > ne && pe > ue ? Se += x.slice(ue, pe) + `
` + x.slice(pe + 1) : Se += x.slice(ue), Se.slice(1);
  }
  function ie(x) {
    for (var ne = "", se = 0, oe, ue = 0; ue < x.length; se >= 65536 ? ue += 2 : ue++)
      se = C(x, ue), oe = F[se], !oe && V(se) ? (ne += x[ue], se >= 65536 && (ne += x[ue + 1])) : ne += oe || G(se);
    return ne;
  }
  function me(x, ne, se) {
    var oe = "", ue = x.tag, ge, pe, Ee;
    for (ge = 0, pe = se.length; ge < pe; ge += 1)
      Ee = se[ge], x.replacer && (Ee = x.replacer.call(se, String(ge), Ee)), (_e(x, ne, Ee, !1, !1) || typeof Ee > "u" && _e(x, ne, null, !1, !1)) && (oe !== "" && (oe += "," + (x.condenseFlow ? "" : " ")), oe += x.dump);
    x.tag = ue, x.dump = "[" + oe + "]";
  }
  function ae(x, ne, se, oe) {
    var ue = "", ge = x.tag, pe, Ee, Se;
    for (pe = 0, Ee = se.length; pe < Ee; pe += 1)
      Se = se[pe], x.replacer && (Se = x.replacer.call(se, String(pe), Se)), (_e(x, ne + 1, Se, !0, !0, !1, !0) || typeof Se > "u" && _e(x, ne + 1, null, !0, !0, !1, !0)) && ((!oe || ue !== "") && (ue += D(x, ne)), x.dump && l === x.dump.charCodeAt(0) ? ue += "-" : ue += "- ", ue += x.dump);
    x.tag = ge, x.dump = ue || "[]";
  }
  function fe(x, ne, se) {
    var oe = "", ue = x.tag, ge = Object.keys(se), pe, Ee, Se, Te, He;
    for (pe = 0, Ee = ge.length; pe < Ee; pe += 1)
      He = "", oe !== "" && (He += ", "), x.condenseFlow && (He += '"'), Se = ge[pe], Te = se[Se], x.replacer && (Te = x.replacer.call(se, Se, Te)), _e(x, ne, Se, !1, !1) && (x.dump.length > 1024 && (He += "? "), He += x.dump + (x.condenseFlow ? '"' : "") + ":" + (x.condenseFlow ? "" : " "), _e(x, ne, Te, !1, !1) && (He += x.dump, oe += He));
    x.tag = ue, x.dump = "{" + oe + "}";
  }
  function le(x, ne, se, oe) {
    var ue = "", ge = x.tag, pe = Object.keys(se), Ee, Se, Te, He, We, je;
    if (x.sortKeys === !0)
      pe.sort();
    else if (typeof x.sortKeys == "function")
      pe.sort(x.sortKeys);
    else if (x.sortKeys)
      throw new t("sortKeys must be a boolean or a function");
    for (Ee = 0, Se = pe.length; Ee < Se; Ee += 1)
      je = "", (!oe || ue !== "") && (je += D(x, ne)), Te = pe[Ee], He = se[Te], x.replacer && (He = x.replacer.call(se, Te, He)), _e(x, ne + 1, Te, !0, !0, !0) && (We = x.tag !== null && x.tag !== "?" || x.dump && x.dump.length > 1024, We && (x.dump && l === x.dump.charCodeAt(0) ? je += "?" : je += "? "), je += x.dump, We && (je += D(x, ne)), _e(x, ne + 1, He, !0, We) && (x.dump && l === x.dump.charCodeAt(0) ? je += ":" : je += ": ", je += x.dump, ue += je));
    x.tag = ge, x.dump = ue || "{}";
  }
  function ye(x, ne, se) {
    var oe, ue, ge, pe, Ee, Se;
    for (ue = se ? x.explicitTypes : x.implicitTypes, ge = 0, pe = ue.length; ge < pe; ge += 1)
      if (Ee = ue[ge], (Ee.instanceOf || Ee.predicate) && (!Ee.instanceOf || typeof ne == "object" && ne instanceof Ee.instanceOf) && (!Ee.predicate || Ee.predicate(ne))) {
        if (se ? Ee.multi && Ee.representName ? x.tag = Ee.representName(ne) : x.tag = Ee.tag : x.tag = "?", Ee.represent) {
          if (Se = x.styleMap[Ee.tag] || Ee.defaultStyle, r.call(Ee.represent) === "[object Function]")
            oe = Ee.represent(ne, Se);
          else if (c.call(Ee.represent, Se))
            oe = Ee.represent[Se](ne, Se);
          else
            throw new t("!<" + Ee.tag + '> tag resolver accepts not "' + Se + '" style');
          x.dump = oe;
        }
        return !0;
      }
    return !1;
  }
  function _e(x, ne, se, oe, ue, ge, pe) {
    x.tag = null, x.dump = se, ye(x, se, !1) || ye(x, se, !0);
    var Ee = r.call(x.dump), Se = oe, Te;
    oe && (oe = x.flowLevel < 0 || x.flowLevel > ne);
    var He = Ee === "[object Object]" || Ee === "[object Array]", We, je;
    if (He && (We = x.duplicates.indexOf(se), je = We !== -1), (x.tag !== null && x.tag !== "?" || je || x.indent !== 2 && ne > 0) && (ue = !1), je && x.usedDuplicates[We])
      x.dump = "*ref_" + We;
    else {
      if (He && je && !x.usedDuplicates[We] && (x.usedDuplicates[We] = !0), Ee === "[object Object]")
        oe && Object.keys(x.dump).length !== 0 ? (le(x, ne, x.dump, ue), je && (x.dump = "&ref_" + We + x.dump)) : (fe(x, ne, x.dump), je && (x.dump = "&ref_" + We + " " + x.dump));
      else if (Ee === "[object Array]")
        oe && x.dump.length !== 0 ? (x.noArrayIndent && !pe && ne > 0 ? ae(x, ne - 1, x.dump, ue) : ae(x, ne, x.dump, ue), je && (x.dump = "&ref_" + We + x.dump)) : (me(x, ne, x.dump), je && (x.dump = "&ref_" + We + " " + x.dump));
      else if (Ee === "[object String]")
        x.tag !== "?" && Ce(x, x.dump, ne, ge, Se);
      else {
        if (Ee === "[object Undefined]")
          return !1;
        if (x.skipInvalid) return !1;
        throw new t("unacceptable kind of an object to dump " + Ee);
      }
      x.tag !== null && x.tag !== "?" && (Te = encodeURI(
        x.tag[0] === "!" ? x.tag.slice(1) : x.tag
      ).replace(/!/g, "%21"), x.tag[0] === "!" ? Te = "!" + Te : Te.slice(0, 18) === "tag:yaml.org,2002:" ? Te = "!!" + Te.slice(18) : Te = "!<" + Te + ">", x.dump = Te + " " + x.dump);
    }
    return !0;
  }
  function Le(x, ne) {
    var se = [], oe = [], ue, ge;
    for (Fe(x, se, oe), ue = 0, ge = oe.length; ue < ge; ue += 1)
      ne.duplicates.push(se[oe[ue]]);
    ne.usedDuplicates = new Array(ge);
  }
  function Fe(x, ne, se) {
    var oe, ue, ge;
    if (x !== null && typeof x == "object")
      if (ue = ne.indexOf(x), ue !== -1)
        se.indexOf(ue) === -1 && se.push(ue);
      else if (ne.push(x), Array.isArray(x))
        for (ue = 0, ge = x.length; ue < ge; ue += 1)
          Fe(x[ue], ne, se);
      else
        for (oe = Object.keys(x), ue = 0, ge = oe.length; ue < ge; ue += 1)
          Fe(x[oe[ue]], ne, se);
  }
  function $e(x, ne) {
    ne = ne || {};
    var se = new I(ne);
    se.noRefs || Le(x, se);
    var oe = x;
    return se.replacer && (oe = se.replacer.call({ "": oe }, "", oe)), _e(se, 0, oe, !0, !0) ? se.dump + `
` : "";
  }
  return rc.dump = $e, rc;
}
var wy;
function Rl() {
  if (wy) return st;
  wy = 1;
  var e = fb(), t = hb();
  function o(r, c) {
    return function() {
      throw new Error("Function yaml." + r + " is removed in js-yaml 4. Use yaml." + c + " instead, which is now safe by default.");
    };
  }
  return st.Type = lt(), st.Schema = I0(), st.FAILSAFE_SCHEMA = L0(), st.JSON_SCHEMA = M0(), st.CORE_SCHEMA = x0(), st.DEFAULT_SCHEMA = Tl(), st.load = e.load, st.loadAll = e.loadAll, st.dump = t.dump, st.YAMLException = Xn(), st.types = {
    binary: H0(),
    float: j0(),
    map: k0(),
    null: F0(),
    pairs: z0(),
    set: K0(),
    timestamp: V0(),
    bool: q0(),
    int: U0(),
    merge: G0(),
    omap: B0(),
    seq: D0(),
    str: C0()
  }, st.safeLoad = o("safeLoad", "load"), st.safeLoadAll = o("safeLoadAll", "loadAll"), st.safeDump = o("safeDump", "dump"), st;
}
var _n = {}, Sy;
function pb() {
  if (Sy) return _n;
  Sy = 1, Object.defineProperty(_n, "__esModule", { value: !0 }), _n.Lazy = void 0;
  class e {
    constructor(o) {
      this._value = null, this.creator = o;
    }
    get hasValue() {
      return this.creator == null;
    }
    get value() {
      if (this.creator == null)
        return this._value;
      const o = this.creator();
      return this.value = o, o;
    }
    set value(o) {
      this._value = o, this.creator = null;
    }
  }
  return _n.Lazy = e, _n;
}
var Qa = { exports: {} }, nc, $y;
function Rs() {
  if ($y) return nc;
  $y = 1;
  const e = "2.0.0", t = 256, o = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
  9007199254740991, r = 16, c = t - 6;
  return nc = {
    MAX_LENGTH: t,
    MAX_SAFE_COMPONENT_LENGTH: r,
    MAX_SAFE_BUILD_LENGTH: c,
    MAX_SAFE_INTEGER: o,
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
  }, nc;
}
var ic, by;
function Ps() {
  return by || (by = 1, ic = typeof process == "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...t) => console.error("SEMVER", ...t) : () => {
  }), ic;
}
var Ty;
function Wn() {
  return Ty || (Ty = 1, (function(e, t) {
    const {
      MAX_SAFE_COMPONENT_LENGTH: o,
      MAX_SAFE_BUILD_LENGTH: r,
      MAX_LENGTH: c
    } = Rs(), n = Ps();
    t = e.exports = {};
    const s = t.re = [], l = t.safeRe = [], a = t.src = [], u = t.safeSrc = [], i = t.t = {};
    let f = 0;
    const d = "[a-zA-Z0-9-]", m = [
      ["\\s", 1],
      ["\\d", c],
      [d, r]
    ], g = (h) => {
      for (const [y, p] of m)
        h = h.split(`${y}*`).join(`${y}{0,${p}}`).split(`${y}+`).join(`${y}{1,${p}}`);
      return h;
    }, v = (h, y, p) => {
      const E = g(y), $ = f++;
      n(h, $, y), i[h] = $, a[$] = y, u[$] = E, s[$] = new RegExp(y, p ? "g" : void 0), l[$] = new RegExp(E, p ? "g" : void 0);
    };
    v("NUMERICIDENTIFIER", "0|[1-9]\\d*"), v("NUMERICIDENTIFIERLOOSE", "\\d+"), v("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${d}*`), v("MAINVERSION", `(${a[i.NUMERICIDENTIFIER]})\\.(${a[i.NUMERICIDENTIFIER]})\\.(${a[i.NUMERICIDENTIFIER]})`), v("MAINVERSIONLOOSE", `(${a[i.NUMERICIDENTIFIERLOOSE]})\\.(${a[i.NUMERICIDENTIFIERLOOSE]})\\.(${a[i.NUMERICIDENTIFIERLOOSE]})`), v("PRERELEASEIDENTIFIER", `(?:${a[i.NONNUMERICIDENTIFIER]}|${a[i.NUMERICIDENTIFIER]})`), v("PRERELEASEIDENTIFIERLOOSE", `(?:${a[i.NONNUMERICIDENTIFIER]}|${a[i.NUMERICIDENTIFIERLOOSE]})`), v("PRERELEASE", `(?:-(${a[i.PRERELEASEIDENTIFIER]}(?:\\.${a[i.PRERELEASEIDENTIFIER]})*))`), v("PRERELEASELOOSE", `(?:-?(${a[i.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${a[i.PRERELEASEIDENTIFIERLOOSE]})*))`), v("BUILDIDENTIFIER", `${d}+`), v("BUILD", `(?:\\+(${a[i.BUILDIDENTIFIER]}(?:\\.${a[i.BUILDIDENTIFIER]})*))`), v("FULLPLAIN", `v?${a[i.MAINVERSION]}${a[i.PRERELEASE]}?${a[i.BUILD]}?`), v("FULL", `^${a[i.FULLPLAIN]}$`), v("LOOSEPLAIN", `[v=\\s]*${a[i.MAINVERSIONLOOSE]}${a[i.PRERELEASELOOSE]}?${a[i.BUILD]}?`), v("LOOSE", `^${a[i.LOOSEPLAIN]}$`), v("GTLT", "((?:<|>)?=?)"), v("XRANGEIDENTIFIERLOOSE", `${a[i.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`), v("XRANGEIDENTIFIER", `${a[i.NUMERICIDENTIFIER]}|x|X|\\*`), v("XRANGEPLAIN", `[v=\\s]*(${a[i.XRANGEIDENTIFIER]})(?:\\.(${a[i.XRANGEIDENTIFIER]})(?:\\.(${a[i.XRANGEIDENTIFIER]})(?:${a[i.PRERELEASE]})?${a[i.BUILD]}?)?)?`), v("XRANGEPLAINLOOSE", `[v=\\s]*(${a[i.XRANGEIDENTIFIERLOOSE]})(?:\\.(${a[i.XRANGEIDENTIFIERLOOSE]})(?:\\.(${a[i.XRANGEIDENTIFIERLOOSE]})(?:${a[i.PRERELEASELOOSE]})?${a[i.BUILD]}?)?)?`), v("XRANGE", `^${a[i.GTLT]}\\s*${a[i.XRANGEPLAIN]}$`), v("XRANGELOOSE", `^${a[i.GTLT]}\\s*${a[i.XRANGEPLAINLOOSE]}$`), v("COERCEPLAIN", `(^|[^\\d])(\\d{1,${o}})(?:\\.(\\d{1,${o}}))?(?:\\.(\\d{1,${o}}))?`), v("COERCE", `${a[i.COERCEPLAIN]}(?:$|[^\\d])`), v("COERCEFULL", a[i.COERCEPLAIN] + `(?:${a[i.PRERELEASE]})?(?:${a[i.BUILD]})?(?:$|[^\\d])`), v("COERCERTL", a[i.COERCE], !0), v("COERCERTLFULL", a[i.COERCEFULL], !0), v("LONETILDE", "(?:~>?)"), v("TILDETRIM", `(\\s*)${a[i.LONETILDE]}\\s+`, !0), t.tildeTrimReplace = "$1~", v("TILDE", `^${a[i.LONETILDE]}${a[i.XRANGEPLAIN]}$`), v("TILDELOOSE", `^${a[i.LONETILDE]}${a[i.XRANGEPLAINLOOSE]}$`), v("LONECARET", "(?:\\^)"), v("CARETTRIM", `(\\s*)${a[i.LONECARET]}\\s+`, !0), t.caretTrimReplace = "$1^", v("CARET", `^${a[i.LONECARET]}${a[i.XRANGEPLAIN]}$`), v("CARETLOOSE", `^${a[i.LONECARET]}${a[i.XRANGEPLAINLOOSE]}$`), v("COMPARATORLOOSE", `^${a[i.GTLT]}\\s*(${a[i.LOOSEPLAIN]})$|^$`), v("COMPARATOR", `^${a[i.GTLT]}\\s*(${a[i.FULLPLAIN]})$|^$`), v("COMPARATORTRIM", `(\\s*)${a[i.GTLT]}\\s*(${a[i.LOOSEPLAIN]}|${a[i.XRANGEPLAIN]})`, !0), t.comparatorTrimReplace = "$1$2$3", v("HYPHENRANGE", `^\\s*(${a[i.XRANGEPLAIN]})\\s+-\\s+(${a[i.XRANGEPLAIN]})\\s*$`), v("HYPHENRANGELOOSE", `^\\s*(${a[i.XRANGEPLAINLOOSE]})\\s+-\\s+(${a[i.XRANGEPLAINLOOSE]})\\s*$`), v("STAR", "(<|>)?=?\\s*\\*"), v("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"), v("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
  })(Qa, Qa.exports)), Qa.exports;
}
var ac, Ry;
function Pl() {
  if (Ry) return ac;
  Ry = 1;
  const e = Object.freeze({ loose: !0 }), t = Object.freeze({});
  return ac = (r) => r ? typeof r != "object" ? e : r : t, ac;
}
var sc, Py;
function X0() {
  if (Py) return sc;
  Py = 1;
  const e = /^[0-9]+$/, t = (r, c) => {
    if (typeof r == "number" && typeof c == "number")
      return r === c ? 0 : r < c ? -1 : 1;
    const n = e.test(r), s = e.test(c);
    return n && s && (r = +r, c = +c), r === c ? 0 : n && !s ? -1 : s && !n ? 1 : r < c ? -1 : 1;
  };
  return sc = {
    compareIdentifiers: t,
    rcompareIdentifiers: (r, c) => t(c, r)
  }, sc;
}
var oc, Ny;
function dt() {
  if (Ny) return oc;
  Ny = 1;
  const e = Ps(), { MAX_LENGTH: t, MAX_SAFE_INTEGER: o } = Rs(), { safeRe: r, t: c } = Wn(), n = Pl(), { compareIdentifiers: s } = X0();
  class l {
    constructor(u, i) {
      if (i = n(i), u instanceof l) {
        if (u.loose === !!i.loose && u.includePrerelease === !!i.includePrerelease)
          return u;
        u = u.version;
      } else if (typeof u != "string")
        throw new TypeError(`Invalid version. Must be a string. Got type "${typeof u}".`);
      if (u.length > t)
        throw new TypeError(
          `version is longer than ${t} characters`
        );
      e("SemVer", u, i), this.options = i, this.loose = !!i.loose, this.includePrerelease = !!i.includePrerelease;
      const f = u.trim().match(i.loose ? r[c.LOOSE] : r[c.FULL]);
      if (!f)
        throw new TypeError(`Invalid Version: ${u}`);
      if (this.raw = u, this.major = +f[1], this.minor = +f[2], this.patch = +f[3], this.major > o || this.major < 0)
        throw new TypeError("Invalid major version");
      if (this.minor > o || this.minor < 0)
        throw new TypeError("Invalid minor version");
      if (this.patch > o || this.patch < 0)
        throw new TypeError("Invalid patch version");
      f[4] ? this.prerelease = f[4].split(".").map((d) => {
        if (/^[0-9]+$/.test(d)) {
          const m = +d;
          if (m >= 0 && m < o)
            return m;
        }
        return d;
      }) : this.prerelease = [], this.build = f[5] ? f[5].split(".") : [], this.format();
    }
    format() {
      return this.version = `${this.major}.${this.minor}.${this.patch}`, this.prerelease.length && (this.version += `-${this.prerelease.join(".")}`), this.version;
    }
    toString() {
      return this.version;
    }
    compare(u) {
      if (e("SemVer.compare", this.version, this.options, u), !(u instanceof l)) {
        if (typeof u == "string" && u === this.version)
          return 0;
        u = new l(u, this.options);
      }
      return u.version === this.version ? 0 : this.compareMain(u) || this.comparePre(u);
    }
    compareMain(u) {
      return u instanceof l || (u = new l(u, this.options)), this.major < u.major ? -1 : this.major > u.major ? 1 : this.minor < u.minor ? -1 : this.minor > u.minor ? 1 : this.patch < u.patch ? -1 : this.patch > u.patch ? 1 : 0;
    }
    comparePre(u) {
      if (u instanceof l || (u = new l(u, this.options)), this.prerelease.length && !u.prerelease.length)
        return -1;
      if (!this.prerelease.length && u.prerelease.length)
        return 1;
      if (!this.prerelease.length && !u.prerelease.length)
        return 0;
      let i = 0;
      do {
        const f = this.prerelease[i], d = u.prerelease[i];
        if (e("prerelease compare", i, f, d), f === void 0 && d === void 0)
          return 0;
        if (d === void 0)
          return 1;
        if (f === void 0)
          return -1;
        if (f === d)
          continue;
        return s(f, d);
      } while (++i);
    }
    compareBuild(u) {
      u instanceof l || (u = new l(u, this.options));
      let i = 0;
      do {
        const f = this.build[i], d = u.build[i];
        if (e("build compare", i, f, d), f === void 0 && d === void 0)
          return 0;
        if (d === void 0)
          return 1;
        if (f === void 0)
          return -1;
        if (f === d)
          continue;
        return s(f, d);
      } while (++i);
    }
    // preminor will bump the version up to the next minor release, and immediately
    // down to pre-release. premajor and prepatch work the same way.
    inc(u, i, f) {
      if (u.startsWith("pre")) {
        if (!i && f === !1)
          throw new Error("invalid increment argument: identifier is empty");
        if (i) {
          const d = `-${i}`.match(this.options.loose ? r[c.PRERELEASELOOSE] : r[c.PRERELEASE]);
          if (!d || d[1] !== i)
            throw new Error(`invalid identifier: ${i}`);
        }
      }
      switch (u) {
        case "premajor":
          this.prerelease.length = 0, this.patch = 0, this.minor = 0, this.major++, this.inc("pre", i, f);
          break;
        case "preminor":
          this.prerelease.length = 0, this.patch = 0, this.minor++, this.inc("pre", i, f);
          break;
        case "prepatch":
          this.prerelease.length = 0, this.inc("patch", i, f), this.inc("pre", i, f);
          break;
        // If the input is a non-prerelease version, this acts the same as
        // prepatch.
        case "prerelease":
          this.prerelease.length === 0 && this.inc("patch", i, f), this.inc("pre", i, f);
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
          const d = Number(f) ? 1 : 0;
          if (this.prerelease.length === 0)
            this.prerelease = [d];
          else {
            let m = this.prerelease.length;
            for (; --m >= 0; )
              typeof this.prerelease[m] == "number" && (this.prerelease[m]++, m = -2);
            if (m === -1) {
              if (i === this.prerelease.join(".") && f === !1)
                throw new Error("invalid increment argument: identifier already exists");
              this.prerelease.push(d);
            }
          }
          if (i) {
            let m = [i, d];
            f === !1 && (m = [i]), s(this.prerelease[0], i) === 0 ? isNaN(this.prerelease[1]) && (this.prerelease = m) : this.prerelease = m;
          }
          break;
        }
        default:
          throw new Error(`invalid increment argument: ${u}`);
      }
      return this.raw = this.format(), this.build.length && (this.raw += `+${this.build.join(".")}`), this;
    }
  }
  return oc = l, oc;
}
var uc, Oy;
function rn() {
  if (Oy) return uc;
  Oy = 1;
  const e = dt();
  return uc = (o, r, c = !1) => {
    if (o instanceof e)
      return o;
    try {
      return new e(o, r);
    } catch (n) {
      if (!c)
        return null;
      throw n;
    }
  }, uc;
}
var cc, Ay;
function mb() {
  if (Ay) return cc;
  Ay = 1;
  const e = rn();
  return cc = (o, r) => {
    const c = e(o, r);
    return c ? c.version : null;
  }, cc;
}
var lc, Iy;
function yb() {
  if (Iy) return lc;
  Iy = 1;
  const e = rn();
  return lc = (o, r) => {
    const c = e(o.trim().replace(/^[=v]+/, ""), r);
    return c ? c.version : null;
  }, lc;
}
var dc, Cy;
function gb() {
  if (Cy) return dc;
  Cy = 1;
  const e = dt();
  return dc = (o, r, c, n, s) => {
    typeof c == "string" && (s = n, n = c, c = void 0);
    try {
      return new e(
        o instanceof e ? o.version : o,
        c
      ).inc(r, n, s).version;
    } catch {
      return null;
    }
  }, dc;
}
var fc, Dy;
function vb() {
  if (Dy) return fc;
  Dy = 1;
  const e = rn();
  return fc = (o, r) => {
    const c = e(o, null, !0), n = e(r, null, !0), s = c.compare(n);
    if (s === 0)
      return null;
    const l = s > 0, a = l ? c : n, u = l ? n : c, i = !!a.prerelease.length;
    if (!!u.prerelease.length && !i) {
      if (!u.patch && !u.minor)
        return "major";
      if (u.compareMain(a) === 0)
        return u.minor && !u.patch ? "minor" : "patch";
    }
    const d = i ? "pre" : "";
    return c.major !== n.major ? d + "major" : c.minor !== n.minor ? d + "minor" : c.patch !== n.patch ? d + "patch" : "prerelease";
  }, fc;
}
var hc, ky;
function _b() {
  if (ky) return hc;
  ky = 1;
  const e = dt();
  return hc = (o, r) => new e(o, r).major, hc;
}
var pc, Ly;
function Eb() {
  if (Ly) return pc;
  Ly = 1;
  const e = dt();
  return pc = (o, r) => new e(o, r).minor, pc;
}
var mc, Fy;
function wb() {
  if (Fy) return mc;
  Fy = 1;
  const e = dt();
  return mc = (o, r) => new e(o, r).patch, mc;
}
var yc, qy;
function Sb() {
  if (qy) return yc;
  qy = 1;
  const e = rn();
  return yc = (o, r) => {
    const c = e(o, r);
    return c && c.prerelease.length ? c.prerelease : null;
  }, yc;
}
var gc, Uy;
function qt() {
  if (Uy) return gc;
  Uy = 1;
  const e = dt();
  return gc = (o, r, c) => new e(o, c).compare(new e(r, c)), gc;
}
var vc, jy;
function $b() {
  if (jy) return vc;
  jy = 1;
  const e = qt();
  return vc = (o, r, c) => e(r, o, c), vc;
}
var _c, My;
function bb() {
  if (My) return _c;
  My = 1;
  const e = qt();
  return _c = (o, r) => e(o, r, !0), _c;
}
var Ec, xy;
function Nl() {
  if (xy) return Ec;
  xy = 1;
  const e = dt();
  return Ec = (o, r, c) => {
    const n = new e(o, c), s = new e(r, c);
    return n.compare(s) || n.compareBuild(s);
  }, Ec;
}
var wc, Vy;
function Tb() {
  if (Vy) return wc;
  Vy = 1;
  const e = Nl();
  return wc = (o, r) => o.sort((c, n) => e(c, n, r)), wc;
}
var Sc, Gy;
function Rb() {
  if (Gy) return Sc;
  Gy = 1;
  const e = Nl();
  return Sc = (o, r) => o.sort((c, n) => e(n, c, r)), Sc;
}
var $c, Hy;
function Ns() {
  if (Hy) return $c;
  Hy = 1;
  const e = qt();
  return $c = (o, r, c) => e(o, r, c) > 0, $c;
}
var bc, By;
function Ol() {
  if (By) return bc;
  By = 1;
  const e = qt();
  return bc = (o, r, c) => e(o, r, c) < 0, bc;
}
var Tc, zy;
function W0() {
  if (zy) return Tc;
  zy = 1;
  const e = qt();
  return Tc = (o, r, c) => e(o, r, c) === 0, Tc;
}
var Rc, Ky;
function Y0() {
  if (Ky) return Rc;
  Ky = 1;
  const e = qt();
  return Rc = (o, r, c) => e(o, r, c) !== 0, Rc;
}
var Pc, Xy;
function Al() {
  if (Xy) return Pc;
  Xy = 1;
  const e = qt();
  return Pc = (o, r, c) => e(o, r, c) >= 0, Pc;
}
var Nc, Wy;
function Il() {
  if (Wy) return Nc;
  Wy = 1;
  const e = qt();
  return Nc = (o, r, c) => e(o, r, c) <= 0, Nc;
}
var Oc, Yy;
function J0() {
  if (Yy) return Oc;
  Yy = 1;
  const e = W0(), t = Y0(), o = Ns(), r = Al(), c = Ol(), n = Il();
  return Oc = (l, a, u, i) => {
    switch (a) {
      case "===":
        return typeof l == "object" && (l = l.version), typeof u == "object" && (u = u.version), l === u;
      case "!==":
        return typeof l == "object" && (l = l.version), typeof u == "object" && (u = u.version), l !== u;
      case "":
      case "=":
      case "==":
        return e(l, u, i);
      case "!=":
        return t(l, u, i);
      case ">":
        return o(l, u, i);
      case ">=":
        return r(l, u, i);
      case "<":
        return c(l, u, i);
      case "<=":
        return n(l, u, i);
      default:
        throw new TypeError(`Invalid operator: ${a}`);
    }
  }, Oc;
}
var Ac, Jy;
function Pb() {
  if (Jy) return Ac;
  Jy = 1;
  const e = dt(), t = rn(), { safeRe: o, t: r } = Wn();
  return Ac = (n, s) => {
    if (n instanceof e)
      return n;
    if (typeof n == "number" && (n = String(n)), typeof n != "string")
      return null;
    s = s || {};
    let l = null;
    if (!s.rtl)
      l = n.match(s.includePrerelease ? o[r.COERCEFULL] : o[r.COERCE]);
    else {
      const m = s.includePrerelease ? o[r.COERCERTLFULL] : o[r.COERCERTL];
      let g;
      for (; (g = m.exec(n)) && (!l || l.index + l[0].length !== n.length); )
        (!l || g.index + g[0].length !== l.index + l[0].length) && (l = g), m.lastIndex = g.index + g[1].length + g[2].length;
      m.lastIndex = -1;
    }
    if (l === null)
      return null;
    const a = l[2], u = l[3] || "0", i = l[4] || "0", f = s.includePrerelease && l[5] ? `-${l[5]}` : "", d = s.includePrerelease && l[6] ? `+${l[6]}` : "";
    return t(`${a}.${u}.${i}${f}${d}`, s);
  }, Ac;
}
var Ic, Qy;
function Nb() {
  if (Qy) return Ic;
  Qy = 1;
  class e {
    constructor() {
      this.max = 1e3, this.map = /* @__PURE__ */ new Map();
    }
    get(o) {
      const r = this.map.get(o);
      if (r !== void 0)
        return this.map.delete(o), this.map.set(o, r), r;
    }
    delete(o) {
      return this.map.delete(o);
    }
    set(o, r) {
      if (!this.delete(o) && r !== void 0) {
        if (this.map.size >= this.max) {
          const n = this.map.keys().next().value;
          this.delete(n);
        }
        this.map.set(o, r);
      }
      return this;
    }
  }
  return Ic = e, Ic;
}
var Cc, Zy;
function Ut() {
  if (Zy) return Cc;
  Zy = 1;
  const e = /\s+/g;
  class t {
    constructor(q, J) {
      if (J = c(J), q instanceof t)
        return q.loose === !!J.loose && q.includePrerelease === !!J.includePrerelease ? q : new t(q.raw, J);
      if (q instanceof n)
        return this.raw = q.value, this.set = [[q]], this.formatted = void 0, this;
      if (this.options = J, this.loose = !!J.loose, this.includePrerelease = !!J.includePrerelease, this.raw = q.trim().replace(e, " "), this.set = this.raw.split("||").map((H) => this.parseRange(H.trim())).filter((H) => H.length), !this.set.length)
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      if (this.set.length > 1) {
        const H = this.set[0];
        if (this.set = this.set.filter((G) => !v(G[0])), this.set.length === 0)
          this.set = [H];
        else if (this.set.length > 1) {
          for (const G of this.set)
            if (G.length === 1 && h(G[0])) {
              this.set = [G];
              break;
            }
        }
      }
      this.formatted = void 0;
    }
    get range() {
      if (this.formatted === void 0) {
        this.formatted = "";
        for (let q = 0; q < this.set.length; q++) {
          q > 0 && (this.formatted += "||");
          const J = this.set[q];
          for (let H = 0; H < J.length; H++)
            H > 0 && (this.formatted += " "), this.formatted += J[H].toString().trim();
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
    parseRange(q) {
      const H = ((this.options.includePrerelease && m) | (this.options.loose && g)) + ":" + q, G = r.get(H);
      if (G)
        return G;
      const Y = this.options.loose, k = Y ? a[u.HYPHENRANGELOOSE] : a[u.HYPHENRANGE];
      q = q.replace(k, B(this.options.includePrerelease)), s("hyphen replace", q), q = q.replace(a[u.COMPARATORTRIM], i), s("comparator trim", q), q = q.replace(a[u.TILDETRIM], f), s("tilde trim", q), q = q.replace(a[u.CARETTRIM], d), s("caret trim", q);
      let I = q.split(" ").map((N) => p(N, this.options)).join(" ").split(/\s+/).map((N) => M(N, this.options));
      Y && (I = I.filter((N) => (s("loose invalid filter", N, this.options), !!N.match(a[u.COMPARATORLOOSE])))), s("range list", I);
      const U = /* @__PURE__ */ new Map(), D = I.map((N) => new n(N, this.options));
      for (const N of D) {
        if (v(N))
          return [N];
        U.set(N.value, N);
      }
      U.size > 1 && U.has("") && U.delete("");
      const T = [...U.values()];
      return r.set(H, T), T;
    }
    intersects(q, J) {
      if (!(q instanceof t))
        throw new TypeError("a Range is required");
      return this.set.some((H) => y(H, J) && q.set.some((G) => y(G, J) && H.every((Y) => G.every((k) => Y.intersects(k, J)))));
    }
    // if ANY of the sets match ALL of its comparators, then pass
    test(q) {
      if (!q)
        return !1;
      if (typeof q == "string")
        try {
          q = new l(q, this.options);
        } catch {
          return !1;
        }
      for (let J = 0; J < this.set.length; J++)
        if (W(this.set[J], q, this.options))
          return !0;
      return !1;
    }
  }
  Cc = t;
  const o = Nb(), r = new o(), c = Pl(), n = Os(), s = Ps(), l = dt(), {
    safeRe: a,
    t: u,
    comparatorTrimReplace: i,
    tildeTrimReplace: f,
    caretTrimReplace: d
  } = Wn(), { FLAG_INCLUDE_PRERELEASE: m, FLAG_LOOSE: g } = Rs(), v = (F) => F.value === "<0.0.0-0", h = (F) => F.value === "", y = (F, q) => {
    let J = !0;
    const H = F.slice();
    let G = H.pop();
    for (; J && H.length; )
      J = H.every((Y) => G.intersects(Y, q)), G = H.pop();
    return J;
  }, p = (F, q) => (F = F.replace(a[u.BUILD], ""), s("comp", F, q), F = _(F, q), s("caret", F), F = $(F, q), s("tildes", F), F = R(F, q), s("xrange", F), F = j(F, q), s("stars", F), F), E = (F) => !F || F.toLowerCase() === "x" || F === "*", $ = (F, q) => F.trim().split(/\s+/).map((J) => S(J, q)).join(" "), S = (F, q) => {
    const J = q.loose ? a[u.TILDELOOSE] : a[u.TILDE];
    return F.replace(J, (H, G, Y, k, I) => {
      s("tilde", F, H, G, Y, k, I);
      let U;
      return E(G) ? U = "" : E(Y) ? U = `>=${G}.0.0 <${+G + 1}.0.0-0` : E(k) ? U = `>=${G}.${Y}.0 <${G}.${+Y + 1}.0-0` : I ? (s("replaceTilde pr", I), U = `>=${G}.${Y}.${k}-${I} <${G}.${+Y + 1}.0-0`) : U = `>=${G}.${Y}.${k} <${G}.${+Y + 1}.0-0`, s("tilde return", U), U;
    });
  }, _ = (F, q) => F.trim().split(/\s+/).map((J) => w(J, q)).join(" "), w = (F, q) => {
    s("caret", F, q);
    const J = q.loose ? a[u.CARETLOOSE] : a[u.CARET], H = q.includePrerelease ? "-0" : "";
    return F.replace(J, (G, Y, k, I, U) => {
      s("caret", F, G, Y, k, I, U);
      let D;
      return E(Y) ? D = "" : E(k) ? D = `>=${Y}.0.0${H} <${+Y + 1}.0.0-0` : E(I) ? Y === "0" ? D = `>=${Y}.${k}.0${H} <${Y}.${+k + 1}.0-0` : D = `>=${Y}.${k}.0${H} <${+Y + 1}.0.0-0` : U ? (s("replaceCaret pr", U), Y === "0" ? k === "0" ? D = `>=${Y}.${k}.${I}-${U} <${Y}.${k}.${+I + 1}-0` : D = `>=${Y}.${k}.${I}-${U} <${Y}.${+k + 1}.0-0` : D = `>=${Y}.${k}.${I}-${U} <${+Y + 1}.0.0-0`) : (s("no pr"), Y === "0" ? k === "0" ? D = `>=${Y}.${k}.${I}${H} <${Y}.${k}.${+I + 1}-0` : D = `>=${Y}.${k}.${I}${H} <${Y}.${+k + 1}.0-0` : D = `>=${Y}.${k}.${I} <${+Y + 1}.0.0-0`), s("caret return", D), D;
    });
  }, R = (F, q) => (s("replaceXRanges", F, q), F.split(/\s+/).map((J) => P(J, q)).join(" ")), P = (F, q) => {
    F = F.trim();
    const J = q.loose ? a[u.XRANGELOOSE] : a[u.XRANGE];
    return F.replace(J, (H, G, Y, k, I, U) => {
      s("xRange", F, H, G, Y, k, I, U);
      const D = E(Y), T = D || E(k), N = T || E(I), V = N;
      return G === "=" && V && (G = ""), U = q.includePrerelease ? "-0" : "", D ? G === ">" || G === "<" ? H = "<0.0.0-0" : H = "*" : G && V ? (T && (k = 0), I = 0, G === ">" ? (G = ">=", T ? (Y = +Y + 1, k = 0, I = 0) : (k = +k + 1, I = 0)) : G === "<=" && (G = "<", T ? Y = +Y + 1 : k = +k + 1), G === "<" && (U = "-0"), H = `${G + Y}.${k}.${I}${U}`) : T ? H = `>=${Y}.0.0${U} <${+Y + 1}.0.0-0` : N && (H = `>=${Y}.${k}.0${U} <${Y}.${+k + 1}.0-0`), s("xRange return", H), H;
    });
  }, j = (F, q) => (s("replaceStars", F, q), F.trim().replace(a[u.STAR], "")), M = (F, q) => (s("replaceGTE0", F, q), F.trim().replace(a[q.includePrerelease ? u.GTE0PRE : u.GTE0], "")), B = (F) => (q, J, H, G, Y, k, I, U, D, T, N, V) => (E(H) ? J = "" : E(G) ? J = `>=${H}.0.0${F ? "-0" : ""}` : E(Y) ? J = `>=${H}.${G}.0${F ? "-0" : ""}` : k ? J = `>=${J}` : J = `>=${J}${F ? "-0" : ""}`, E(D) ? U = "" : E(T) ? U = `<${+D + 1}.0.0-0` : E(N) ? U = `<${D}.${+T + 1}.0-0` : V ? U = `<=${D}.${T}.${N}-${V}` : F ? U = `<${D}.${T}.${+N + 1}-0` : U = `<=${U}`, `${J} ${U}`.trim()), W = (F, q, J) => {
    for (let H = 0; H < F.length; H++)
      if (!F[H].test(q))
        return !1;
    if (q.prerelease.length && !J.includePrerelease) {
      for (let H = 0; H < F.length; H++)
        if (s(F[H].semver), F[H].semver !== n.ANY && F[H].semver.prerelease.length > 0) {
          const G = F[H].semver;
          if (G.major === q.major && G.minor === q.minor && G.patch === q.patch)
            return !0;
        }
      return !1;
    }
    return !0;
  };
  return Cc;
}
var Dc, eg;
function Os() {
  if (eg) return Dc;
  eg = 1;
  const e = Symbol("SemVer ANY");
  class t {
    static get ANY() {
      return e;
    }
    constructor(i, f) {
      if (f = o(f), i instanceof t) {
        if (i.loose === !!f.loose)
          return i;
        i = i.value;
      }
      i = i.trim().split(/\s+/).join(" "), s("comparator", i, f), this.options = f, this.loose = !!f.loose, this.parse(i), this.semver === e ? this.value = "" : this.value = this.operator + this.semver.version, s("comp", this);
    }
    parse(i) {
      const f = this.options.loose ? r[c.COMPARATORLOOSE] : r[c.COMPARATOR], d = i.match(f);
      if (!d)
        throw new TypeError(`Invalid comparator: ${i}`);
      this.operator = d[1] !== void 0 ? d[1] : "", this.operator === "=" && (this.operator = ""), d[2] ? this.semver = new l(d[2], this.options.loose) : this.semver = e;
    }
    toString() {
      return this.value;
    }
    test(i) {
      if (s("Comparator.test", i, this.options.loose), this.semver === e || i === e)
        return !0;
      if (typeof i == "string")
        try {
          i = new l(i, this.options);
        } catch {
          return !1;
        }
      return n(i, this.operator, this.semver, this.options);
    }
    intersects(i, f) {
      if (!(i instanceof t))
        throw new TypeError("a Comparator is required");
      return this.operator === "" ? this.value === "" ? !0 : new a(i.value, f).test(this.value) : i.operator === "" ? i.value === "" ? !0 : new a(this.value, f).test(i.semver) : (f = o(f), f.includePrerelease && (this.value === "<0.0.0-0" || i.value === "<0.0.0-0") || !f.includePrerelease && (this.value.startsWith("<0.0.0") || i.value.startsWith("<0.0.0")) ? !1 : !!(this.operator.startsWith(">") && i.operator.startsWith(">") || this.operator.startsWith("<") && i.operator.startsWith("<") || this.semver.version === i.semver.version && this.operator.includes("=") && i.operator.includes("=") || n(this.semver, "<", i.semver, f) && this.operator.startsWith(">") && i.operator.startsWith("<") || n(this.semver, ">", i.semver, f) && this.operator.startsWith("<") && i.operator.startsWith(">")));
    }
  }
  Dc = t;
  const o = Pl(), { safeRe: r, t: c } = Wn(), n = J0(), s = Ps(), l = dt(), a = Ut();
  return Dc;
}
var kc, tg;
function As() {
  if (tg) return kc;
  tg = 1;
  const e = Ut();
  return kc = (o, r, c) => {
    try {
      r = new e(r, c);
    } catch {
      return !1;
    }
    return r.test(o);
  }, kc;
}
var Lc, rg;
function Ob() {
  if (rg) return Lc;
  rg = 1;
  const e = Ut();
  return Lc = (o, r) => new e(o, r).set.map((c) => c.map((n) => n.value).join(" ").trim().split(" ")), Lc;
}
var Fc, ng;
function Ab() {
  if (ng) return Fc;
  ng = 1;
  const e = dt(), t = Ut();
  return Fc = (r, c, n) => {
    let s = null, l = null, a = null;
    try {
      a = new t(c, n);
    } catch {
      return null;
    }
    return r.forEach((u) => {
      a.test(u) && (!s || l.compare(u) === -1) && (s = u, l = new e(s, n));
    }), s;
  }, Fc;
}
var qc, ig;
function Ib() {
  if (ig) return qc;
  ig = 1;
  const e = dt(), t = Ut();
  return qc = (r, c, n) => {
    let s = null, l = null, a = null;
    try {
      a = new t(c, n);
    } catch {
      return null;
    }
    return r.forEach((u) => {
      a.test(u) && (!s || l.compare(u) === 1) && (s = u, l = new e(s, n));
    }), s;
  }, qc;
}
var Uc, ag;
function Cb() {
  if (ag) return Uc;
  ag = 1;
  const e = dt(), t = Ut(), o = Ns();
  return Uc = (c, n) => {
    c = new t(c, n);
    let s = new e("0.0.0");
    if (c.test(s) || (s = new e("0.0.0-0"), c.test(s)))
      return s;
    s = null;
    for (let l = 0; l < c.set.length; ++l) {
      const a = c.set[l];
      let u = null;
      a.forEach((i) => {
        const f = new e(i.semver.version);
        switch (i.operator) {
          case ">":
            f.prerelease.length === 0 ? f.patch++ : f.prerelease.push(0), f.raw = f.format();
          /* fallthrough */
          case "":
          case ">=":
            (!u || o(f, u)) && (u = f);
            break;
          case "<":
          case "<=":
            break;
          /* istanbul ignore next */
          default:
            throw new Error(`Unexpected operation: ${i.operator}`);
        }
      }), u && (!s || o(s, u)) && (s = u);
    }
    return s && c.test(s) ? s : null;
  }, Uc;
}
var jc, sg;
function Db() {
  if (sg) return jc;
  sg = 1;
  const e = Ut();
  return jc = (o, r) => {
    try {
      return new e(o, r).range || "*";
    } catch {
      return null;
    }
  }, jc;
}
var Mc, og;
function Cl() {
  if (og) return Mc;
  og = 1;
  const e = dt(), t = Os(), { ANY: o } = t, r = Ut(), c = As(), n = Ns(), s = Ol(), l = Il(), a = Al();
  return Mc = (i, f, d, m) => {
    i = new e(i, m), f = new r(f, m);
    let g, v, h, y, p;
    switch (d) {
      case ">":
        g = n, v = l, h = s, y = ">", p = ">=";
        break;
      case "<":
        g = s, v = a, h = n, y = "<", p = "<=";
        break;
      default:
        throw new TypeError('Must provide a hilo val of "<" or ">"');
    }
    if (c(i, f, m))
      return !1;
    for (let E = 0; E < f.set.length; ++E) {
      const $ = f.set[E];
      let S = null, _ = null;
      if ($.forEach((w) => {
        w.semver === o && (w = new t(">=0.0.0")), S = S || w, _ = _ || w, g(w.semver, S.semver, m) ? S = w : h(w.semver, _.semver, m) && (_ = w);
      }), S.operator === y || S.operator === p || (!_.operator || _.operator === y) && v(i, _.semver))
        return !1;
      if (_.operator === p && h(i, _.semver))
        return !1;
    }
    return !0;
  }, Mc;
}
var xc, ug;
function kb() {
  if (ug) return xc;
  ug = 1;
  const e = Cl();
  return xc = (o, r, c) => e(o, r, ">", c), xc;
}
var Vc, cg;
function Lb() {
  if (cg) return Vc;
  cg = 1;
  const e = Cl();
  return Vc = (o, r, c) => e(o, r, "<", c), Vc;
}
var Gc, lg;
function Fb() {
  if (lg) return Gc;
  lg = 1;
  const e = Ut();
  return Gc = (o, r, c) => (o = new e(o, c), r = new e(r, c), o.intersects(r, c)), Gc;
}
var Hc, dg;
function qb() {
  if (dg) return Hc;
  dg = 1;
  const e = As(), t = qt();
  return Hc = (o, r, c) => {
    const n = [];
    let s = null, l = null;
    const a = o.sort((d, m) => t(d, m, c));
    for (const d of a)
      e(d, r, c) ? (l = d, s || (s = d)) : (l && n.push([s, l]), l = null, s = null);
    s && n.push([s, null]);
    const u = [];
    for (const [d, m] of n)
      d === m ? u.push(d) : !m && d === a[0] ? u.push("*") : m ? d === a[0] ? u.push(`<=${m}`) : u.push(`${d} - ${m}`) : u.push(`>=${d}`);
    const i = u.join(" || "), f = typeof r.raw == "string" ? r.raw : String(r);
    return i.length < f.length ? i : r;
  }, Hc;
}
var Bc, fg;
function Ub() {
  if (fg) return Bc;
  fg = 1;
  const e = Ut(), t = Os(), { ANY: o } = t, r = As(), c = qt(), n = (f, d, m = {}) => {
    if (f === d)
      return !0;
    f = new e(f, m), d = new e(d, m);
    let g = !1;
    e: for (const v of f.set) {
      for (const h of d.set) {
        const y = a(v, h, m);
        if (g = g || y !== null, y)
          continue e;
      }
      if (g)
        return !1;
    }
    return !0;
  }, s = [new t(">=0.0.0-0")], l = [new t(">=0.0.0")], a = (f, d, m) => {
    if (f === d)
      return !0;
    if (f.length === 1 && f[0].semver === o) {
      if (d.length === 1 && d[0].semver === o)
        return !0;
      m.includePrerelease ? f = s : f = l;
    }
    if (d.length === 1 && d[0].semver === o) {
      if (m.includePrerelease)
        return !0;
      d = l;
    }
    const g = /* @__PURE__ */ new Set();
    let v, h;
    for (const R of f)
      R.operator === ">" || R.operator === ">=" ? v = u(v, R, m) : R.operator === "<" || R.operator === "<=" ? h = i(h, R, m) : g.add(R.semver);
    if (g.size > 1)
      return null;
    let y;
    if (v && h) {
      if (y = c(v.semver, h.semver, m), y > 0)
        return null;
      if (y === 0 && (v.operator !== ">=" || h.operator !== "<="))
        return null;
    }
    for (const R of g) {
      if (v && !r(R, String(v), m) || h && !r(R, String(h), m))
        return null;
      for (const P of d)
        if (!r(R, String(P), m))
          return !1;
      return !0;
    }
    let p, E, $, S, _ = h && !m.includePrerelease && h.semver.prerelease.length ? h.semver : !1, w = v && !m.includePrerelease && v.semver.prerelease.length ? v.semver : !1;
    _ && _.prerelease.length === 1 && h.operator === "<" && _.prerelease[0] === 0 && (_ = !1);
    for (const R of d) {
      if (S = S || R.operator === ">" || R.operator === ">=", $ = $ || R.operator === "<" || R.operator === "<=", v) {
        if (w && R.semver.prerelease && R.semver.prerelease.length && R.semver.major === w.major && R.semver.minor === w.minor && R.semver.patch === w.patch && (w = !1), R.operator === ">" || R.operator === ">=") {
          if (p = u(v, R, m), p === R && p !== v)
            return !1;
        } else if (v.operator === ">=" && !r(v.semver, String(R), m))
          return !1;
      }
      if (h) {
        if (_ && R.semver.prerelease && R.semver.prerelease.length && R.semver.major === _.major && R.semver.minor === _.minor && R.semver.patch === _.patch && (_ = !1), R.operator === "<" || R.operator === "<=") {
          if (E = i(h, R, m), E === R && E !== h)
            return !1;
        } else if (h.operator === "<=" && !r(h.semver, String(R), m))
          return !1;
      }
      if (!R.operator && (h || v) && y !== 0)
        return !1;
    }
    return !(v && $ && !h && y !== 0 || h && S && !v && y !== 0 || w || _);
  }, u = (f, d, m) => {
    if (!f)
      return d;
    const g = c(f.semver, d.semver, m);
    return g > 0 ? f : g < 0 || d.operator === ">" && f.operator === ">=" ? d : f;
  }, i = (f, d, m) => {
    if (!f)
      return d;
    const g = c(f.semver, d.semver, m);
    return g < 0 ? f : g > 0 || d.operator === "<" && f.operator === "<=" ? d : f;
  };
  return Bc = n, Bc;
}
var zc, hg;
function Q0() {
  if (hg) return zc;
  hg = 1;
  const e = Wn(), t = Rs(), o = dt(), r = X0(), c = rn(), n = mb(), s = yb(), l = gb(), a = vb(), u = _b(), i = Eb(), f = wb(), d = Sb(), m = qt(), g = $b(), v = bb(), h = Nl(), y = Tb(), p = Rb(), E = Ns(), $ = Ol(), S = W0(), _ = Y0(), w = Al(), R = Il(), P = J0(), j = Pb(), M = Os(), B = Ut(), W = As(), F = Ob(), q = Ab(), J = Ib(), H = Cb(), G = Db(), Y = Cl(), k = kb(), I = Lb(), U = Fb(), D = qb(), T = Ub();
  return zc = {
    parse: c,
    valid: n,
    clean: s,
    inc: l,
    diff: a,
    major: u,
    minor: i,
    patch: f,
    prerelease: d,
    compare: m,
    rcompare: g,
    compareLoose: v,
    compareBuild: h,
    sort: y,
    rsort: p,
    gt: E,
    lt: $,
    eq: S,
    neq: _,
    gte: w,
    lte: R,
    cmp: P,
    coerce: j,
    Comparator: M,
    Range: B,
    satisfies: W,
    toComparators: F,
    maxSatisfying: q,
    minSatisfying: J,
    minVersion: H,
    validRange: G,
    outside: Y,
    gtr: k,
    ltr: I,
    intersects: U,
    simplifyRange: D,
    subset: T,
    SemVer: o,
    re: e.re,
    src: e.src,
    tokens: e.t,
    SEMVER_SPEC_VERSION: t.SEMVER_SPEC_VERSION,
    RELEASE_TYPES: t.RELEASE_TYPES,
    compareIdentifiers: r.compareIdentifiers,
    rcompareIdentifiers: r.rcompareIdentifiers
  }, zc;
}
var Vr = {}, Un = { exports: {} };
Un.exports;
var pg;
function jb() {
  return pg || (pg = 1, (function(e, t) {
    var o = 200, r = "__lodash_hash_undefined__", c = 1, n = 2, s = 9007199254740991, l = "[object Arguments]", a = "[object Array]", u = "[object AsyncFunction]", i = "[object Boolean]", f = "[object Date]", d = "[object Error]", m = "[object Function]", g = "[object GeneratorFunction]", v = "[object Map]", h = "[object Number]", y = "[object Null]", p = "[object Object]", E = "[object Promise]", $ = "[object Proxy]", S = "[object RegExp]", _ = "[object Set]", w = "[object String]", R = "[object Symbol]", P = "[object Undefined]", j = "[object WeakMap]", M = "[object ArrayBuffer]", B = "[object DataView]", W = "[object Float32Array]", F = "[object Float64Array]", q = "[object Int8Array]", J = "[object Int16Array]", H = "[object Int32Array]", G = "[object Uint8Array]", Y = "[object Uint8ClampedArray]", k = "[object Uint16Array]", I = "[object Uint32Array]", U = /[\\^$.*+?()[\]{}|]/g, D = /^\[object .+?Constructor\]$/, T = /^(?:0|[1-9]\d*)$/, N = {};
    N[W] = N[F] = N[q] = N[J] = N[H] = N[G] = N[Y] = N[k] = N[I] = !0, N[l] = N[a] = N[M] = N[i] = N[B] = N[f] = N[d] = N[m] = N[v] = N[h] = N[p] = N[S] = N[_] = N[w] = N[j] = !1;
    var V = typeof It == "object" && It && It.Object === Object && It, A = typeof self == "object" && self && self.Object === Object && self, O = V || A || Function("return this")(), Z = t && !t.nodeType && t, z = Z && !0 && e && !e.nodeType && e, C = z && z.exports === Z, L = C && V.process, X = (function() {
      try {
        return L && L.binding && L.binding("util");
      } catch {
      }
    })(), Q = X && X.isTypedArray;
    function re(K, ee) {
      for (var ce = -1, we = K == null ? 0 : K.length, ze = 0, Re = []; ++ce < we; ) {
        var Ye = K[ce];
        ee(Ye, ce, K) && (Re[ze++] = Ye);
      }
      return Re;
    }
    function de(K, ee) {
      for (var ce = -1, we = ee.length, ze = K.length; ++ce < we; )
        K[ze + ce] = ee[ce];
      return K;
    }
    function ve(K, ee) {
      for (var ce = -1, we = K == null ? 0 : K.length; ++ce < we; )
        if (ee(K[ce], ce, K))
          return !0;
      return !1;
    }
    function Pe(K, ee) {
      for (var ce = -1, we = Array(K); ++ce < K; )
        we[ce] = ee(ce);
      return we;
    }
    function Ce(K) {
      return function(ee) {
        return K(ee);
      };
    }
    function Ne(K, ee) {
      return K.has(ee);
    }
    function be(K, ee) {
      return K?.[ee];
    }
    function b(K) {
      var ee = -1, ce = Array(K.size);
      return K.forEach(function(we, ze) {
        ce[++ee] = [ze, we];
      }), ce;
    }
    function te(K, ee) {
      return function(ce) {
        return K(ee(ce));
      };
    }
    function ie(K) {
      var ee = -1, ce = Array(K.size);
      return K.forEach(function(we) {
        ce[++ee] = we;
      }), ce;
    }
    var me = Array.prototype, ae = Function.prototype, fe = Object.prototype, le = O["__core-js_shared__"], ye = ae.toString, _e = fe.hasOwnProperty, Le = (function() {
      var K = /[^.]+$/.exec(le && le.keys && le.keys.IE_PROTO || "");
      return K ? "Symbol(src)_1." + K : "";
    })(), Fe = fe.toString, $e = RegExp(
      "^" + ye.call(_e).replace(U, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
    ), x = C ? O.Buffer : void 0, ne = O.Symbol, se = O.Uint8Array, oe = fe.propertyIsEnumerable, ue = me.splice, ge = ne ? ne.toStringTag : void 0, pe = Object.getOwnPropertySymbols, Ee = x ? x.isBuffer : void 0, Se = te(Object.keys, Object), Te = Fr(O, "DataView"), He = Fr(O, "Map"), We = Fr(O, "Promise"), je = Fr(O, "Set"), Lr = Fr(O, "WeakMap"), bt = Fr(Object, "create"), hr = yr(Te), cv = yr(He), lv = yr(We), dv = yr(je), fv = yr(Lr), jl = ne ? ne.prototype : void 0, Is = jl ? jl.valueOf : void 0;
    function pr(K) {
      var ee = -1, ce = K == null ? 0 : K.length;
      for (this.clear(); ++ee < ce; ) {
        var we = K[ee];
        this.set(we[0], we[1]);
      }
    }
    function hv() {
      this.__data__ = bt ? bt(null) : {}, this.size = 0;
    }
    function pv(K) {
      var ee = this.has(K) && delete this.__data__[K];
      return this.size -= ee ? 1 : 0, ee;
    }
    function mv(K) {
      var ee = this.__data__;
      if (bt) {
        var ce = ee[K];
        return ce === r ? void 0 : ce;
      }
      return _e.call(ee, K) ? ee[K] : void 0;
    }
    function yv(K) {
      var ee = this.__data__;
      return bt ? ee[K] !== void 0 : _e.call(ee, K);
    }
    function gv(K, ee) {
      var ce = this.__data__;
      return this.size += this.has(K) ? 0 : 1, ce[K] = bt && ee === void 0 ? r : ee, this;
    }
    pr.prototype.clear = hv, pr.prototype.delete = pv, pr.prototype.get = mv, pr.prototype.has = yv, pr.prototype.set = gv;
    function xt(K) {
      var ee = -1, ce = K == null ? 0 : K.length;
      for (this.clear(); ++ee < ce; ) {
        var we = K[ee];
        this.set(we[0], we[1]);
      }
    }
    function vv() {
      this.__data__ = [], this.size = 0;
    }
    function _v(K) {
      var ee = this.__data__, ce = Jn(ee, K);
      if (ce < 0)
        return !1;
      var we = ee.length - 1;
      return ce == we ? ee.pop() : ue.call(ee, ce, 1), --this.size, !0;
    }
    function Ev(K) {
      var ee = this.__data__, ce = Jn(ee, K);
      return ce < 0 ? void 0 : ee[ce][1];
    }
    function wv(K) {
      return Jn(this.__data__, K) > -1;
    }
    function Sv(K, ee) {
      var ce = this.__data__, we = Jn(ce, K);
      return we < 0 ? (++this.size, ce.push([K, ee])) : ce[we][1] = ee, this;
    }
    xt.prototype.clear = vv, xt.prototype.delete = _v, xt.prototype.get = Ev, xt.prototype.has = wv, xt.prototype.set = Sv;
    function mr(K) {
      var ee = -1, ce = K == null ? 0 : K.length;
      for (this.clear(); ++ee < ce; ) {
        var we = K[ee];
        this.set(we[0], we[1]);
      }
    }
    function $v() {
      this.size = 0, this.__data__ = {
        hash: new pr(),
        map: new (He || xt)(),
        string: new pr()
      };
    }
    function bv(K) {
      var ee = Qn(this, K).delete(K);
      return this.size -= ee ? 1 : 0, ee;
    }
    function Tv(K) {
      return Qn(this, K).get(K);
    }
    function Rv(K) {
      return Qn(this, K).has(K);
    }
    function Pv(K, ee) {
      var ce = Qn(this, K), we = ce.size;
      return ce.set(K, ee), this.size += ce.size == we ? 0 : 1, this;
    }
    mr.prototype.clear = $v, mr.prototype.delete = bv, mr.prototype.get = Tv, mr.prototype.has = Rv, mr.prototype.set = Pv;
    function Yn(K) {
      var ee = -1, ce = K == null ? 0 : K.length;
      for (this.__data__ = new mr(); ++ee < ce; )
        this.add(K[ee]);
    }
    function Nv(K) {
      return this.__data__.set(K, r), this;
    }
    function Ov(K) {
      return this.__data__.has(K);
    }
    Yn.prototype.add = Yn.prototype.push = Nv, Yn.prototype.has = Ov;
    function Qt(K) {
      var ee = this.__data__ = new xt(K);
      this.size = ee.size;
    }
    function Av() {
      this.__data__ = new xt(), this.size = 0;
    }
    function Iv(K) {
      var ee = this.__data__, ce = ee.delete(K);
      return this.size = ee.size, ce;
    }
    function Cv(K) {
      return this.__data__.get(K);
    }
    function Dv(K) {
      return this.__data__.has(K);
    }
    function kv(K, ee) {
      var ce = this.__data__;
      if (ce instanceof xt) {
        var we = ce.__data__;
        if (!He || we.length < o - 1)
          return we.push([K, ee]), this.size = ++ce.size, this;
        ce = this.__data__ = new mr(we);
      }
      return ce.set(K, ee), this.size = ce.size, this;
    }
    Qt.prototype.clear = Av, Qt.prototype.delete = Iv, Qt.prototype.get = Cv, Qt.prototype.has = Dv, Qt.prototype.set = kv;
    function Lv(K, ee) {
      var ce = Zn(K), we = !ce && Yv(K), ze = !ce && !we && Cs(K), Re = !ce && !we && !ze && Xl(K), Ye = ce || we || ze || Re, Ze = Ye ? Pe(K.length, String) : [], et = Ze.length;
      for (var Xe in K)
        _e.call(K, Xe) && !(Ye && // Safari 9 has enumerable `arguments.length` in strict mode.
        (Xe == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
        ze && (Xe == "offset" || Xe == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
        Re && (Xe == "buffer" || Xe == "byteLength" || Xe == "byteOffset") || // Skip index properties.
        Bv(Xe, et))) && Ze.push(Xe);
      return Ze;
    }
    function Jn(K, ee) {
      for (var ce = K.length; ce--; )
        if (Hl(K[ce][0], ee))
          return ce;
      return -1;
    }
    function Fv(K, ee, ce) {
      var we = ee(K);
      return Zn(K) ? we : de(we, ce(K));
    }
    function an(K) {
      return K == null ? K === void 0 ? P : y : ge && ge in Object(K) ? Gv(K) : Wv(K);
    }
    function Ml(K) {
      return sn(K) && an(K) == l;
    }
    function xl(K, ee, ce, we, ze) {
      return K === ee ? !0 : K == null || ee == null || !sn(K) && !sn(ee) ? K !== K && ee !== ee : qv(K, ee, ce, we, xl, ze);
    }
    function qv(K, ee, ce, we, ze, Re) {
      var Ye = Zn(K), Ze = Zn(ee), et = Ye ? a : Zt(K), Xe = Ze ? a : Zt(ee);
      et = et == l ? p : et, Xe = Xe == l ? p : Xe;
      var mt = et == p, Tt = Xe == p, it = et == Xe;
      if (it && Cs(K)) {
        if (!Cs(ee))
          return !1;
        Ye = !0, mt = !1;
      }
      if (it && !mt)
        return Re || (Re = new Qt()), Ye || Xl(K) ? Vl(K, ee, ce, we, ze, Re) : xv(K, ee, et, ce, we, ze, Re);
      if (!(ce & c)) {
        var Et = mt && _e.call(K, "__wrapped__"), wt = Tt && _e.call(ee, "__wrapped__");
        if (Et || wt) {
          var er = Et ? K.value() : K, Vt = wt ? ee.value() : ee;
          return Re || (Re = new Qt()), ze(er, Vt, ce, we, Re);
        }
      }
      return it ? (Re || (Re = new Qt()), Vv(K, ee, ce, we, ze, Re)) : !1;
    }
    function Uv(K) {
      if (!Kl(K) || Kv(K))
        return !1;
      var ee = Bl(K) ? $e : D;
      return ee.test(yr(K));
    }
    function jv(K) {
      return sn(K) && zl(K.length) && !!N[an(K)];
    }
    function Mv(K) {
      if (!Xv(K))
        return Se(K);
      var ee = [];
      for (var ce in Object(K))
        _e.call(K, ce) && ce != "constructor" && ee.push(ce);
      return ee;
    }
    function Vl(K, ee, ce, we, ze, Re) {
      var Ye = ce & c, Ze = K.length, et = ee.length;
      if (Ze != et && !(Ye && et > Ze))
        return !1;
      var Xe = Re.get(K);
      if (Xe && Re.get(ee))
        return Xe == ee;
      var mt = -1, Tt = !0, it = ce & n ? new Yn() : void 0;
      for (Re.set(K, ee), Re.set(ee, K); ++mt < Ze; ) {
        var Et = K[mt], wt = ee[mt];
        if (we)
          var er = Ye ? we(wt, Et, mt, ee, K, Re) : we(Et, wt, mt, K, ee, Re);
        if (er !== void 0) {
          if (er)
            continue;
          Tt = !1;
          break;
        }
        if (it) {
          if (!ve(ee, function(Vt, gr) {
            if (!Ne(it, gr) && (Et === Vt || ze(Et, Vt, ce, we, Re)))
              return it.push(gr);
          })) {
            Tt = !1;
            break;
          }
        } else if (!(Et === wt || ze(Et, wt, ce, we, Re))) {
          Tt = !1;
          break;
        }
      }
      return Re.delete(K), Re.delete(ee), Tt;
    }
    function xv(K, ee, ce, we, ze, Re, Ye) {
      switch (ce) {
        case B:
          if (K.byteLength != ee.byteLength || K.byteOffset != ee.byteOffset)
            return !1;
          K = K.buffer, ee = ee.buffer;
        case M:
          return !(K.byteLength != ee.byteLength || !Re(new se(K), new se(ee)));
        case i:
        case f:
        case h:
          return Hl(+K, +ee);
        case d:
          return K.name == ee.name && K.message == ee.message;
        case S:
        case w:
          return K == ee + "";
        case v:
          var Ze = b;
        case _:
          var et = we & c;
          if (Ze || (Ze = ie), K.size != ee.size && !et)
            return !1;
          var Xe = Ye.get(K);
          if (Xe)
            return Xe == ee;
          we |= n, Ye.set(K, ee);
          var mt = Vl(Ze(K), Ze(ee), we, ze, Re, Ye);
          return Ye.delete(K), mt;
        case R:
          if (Is)
            return Is.call(K) == Is.call(ee);
      }
      return !1;
    }
    function Vv(K, ee, ce, we, ze, Re) {
      var Ye = ce & c, Ze = Gl(K), et = Ze.length, Xe = Gl(ee), mt = Xe.length;
      if (et != mt && !Ye)
        return !1;
      for (var Tt = et; Tt--; ) {
        var it = Ze[Tt];
        if (!(Ye ? it in ee : _e.call(ee, it)))
          return !1;
      }
      var Et = Re.get(K);
      if (Et && Re.get(ee))
        return Et == ee;
      var wt = !0;
      Re.set(K, ee), Re.set(ee, K);
      for (var er = Ye; ++Tt < et; ) {
        it = Ze[Tt];
        var Vt = K[it], gr = ee[it];
        if (we)
          var Wl = Ye ? we(gr, Vt, it, ee, K, Re) : we(Vt, gr, it, K, ee, Re);
        if (!(Wl === void 0 ? Vt === gr || ze(Vt, gr, ce, we, Re) : Wl)) {
          wt = !1;
          break;
        }
        er || (er = it == "constructor");
      }
      if (wt && !er) {
        var ei = K.constructor, ti = ee.constructor;
        ei != ti && "constructor" in K && "constructor" in ee && !(typeof ei == "function" && ei instanceof ei && typeof ti == "function" && ti instanceof ti) && (wt = !1);
      }
      return Re.delete(K), Re.delete(ee), wt;
    }
    function Gl(K) {
      return Fv(K, Zv, Hv);
    }
    function Qn(K, ee) {
      var ce = K.__data__;
      return zv(ee) ? ce[typeof ee == "string" ? "string" : "hash"] : ce.map;
    }
    function Fr(K, ee) {
      var ce = be(K, ee);
      return Uv(ce) ? ce : void 0;
    }
    function Gv(K) {
      var ee = _e.call(K, ge), ce = K[ge];
      try {
        K[ge] = void 0;
        var we = !0;
      } catch {
      }
      var ze = Fe.call(K);
      return we && (ee ? K[ge] = ce : delete K[ge]), ze;
    }
    var Hv = pe ? function(K) {
      return K == null ? [] : (K = Object(K), re(pe(K), function(ee) {
        return oe.call(K, ee);
      }));
    } : e_, Zt = an;
    (Te && Zt(new Te(new ArrayBuffer(1))) != B || He && Zt(new He()) != v || We && Zt(We.resolve()) != E || je && Zt(new je()) != _ || Lr && Zt(new Lr()) != j) && (Zt = function(K) {
      var ee = an(K), ce = ee == p ? K.constructor : void 0, we = ce ? yr(ce) : "";
      if (we)
        switch (we) {
          case hr:
            return B;
          case cv:
            return v;
          case lv:
            return E;
          case dv:
            return _;
          case fv:
            return j;
        }
      return ee;
    });
    function Bv(K, ee) {
      return ee = ee ?? s, !!ee && (typeof K == "number" || T.test(K)) && K > -1 && K % 1 == 0 && K < ee;
    }
    function zv(K) {
      var ee = typeof K;
      return ee == "string" || ee == "number" || ee == "symbol" || ee == "boolean" ? K !== "__proto__" : K === null;
    }
    function Kv(K) {
      return !!Le && Le in K;
    }
    function Xv(K) {
      var ee = K && K.constructor, ce = typeof ee == "function" && ee.prototype || fe;
      return K === ce;
    }
    function Wv(K) {
      return Fe.call(K);
    }
    function yr(K) {
      if (K != null) {
        try {
          return ye.call(K);
        } catch {
        }
        try {
          return K + "";
        } catch {
        }
      }
      return "";
    }
    function Hl(K, ee) {
      return K === ee || K !== K && ee !== ee;
    }
    var Yv = Ml(/* @__PURE__ */ (function() {
      return arguments;
    })()) ? Ml : function(K) {
      return sn(K) && _e.call(K, "callee") && !oe.call(K, "callee");
    }, Zn = Array.isArray;
    function Jv(K) {
      return K != null && zl(K.length) && !Bl(K);
    }
    var Cs = Ee || t_;
    function Qv(K, ee) {
      return xl(K, ee);
    }
    function Bl(K) {
      if (!Kl(K))
        return !1;
      var ee = an(K);
      return ee == m || ee == g || ee == u || ee == $;
    }
    function zl(K) {
      return typeof K == "number" && K > -1 && K % 1 == 0 && K <= s;
    }
    function Kl(K) {
      var ee = typeof K;
      return K != null && (ee == "object" || ee == "function");
    }
    function sn(K) {
      return K != null && typeof K == "object";
    }
    var Xl = Q ? Ce(Q) : jv;
    function Zv(K) {
      return Jv(K) ? Lv(K) : Mv(K);
    }
    function e_() {
      return [];
    }
    function t_() {
      return !1;
    }
    e.exports = Qv;
  })(Un, Un.exports)), Un.exports;
}
var mg;
function Mb() {
  if (mg) return Vr;
  mg = 1, Object.defineProperty(Vr, "__esModule", { value: !0 }), Vr.DownloadedUpdateHelper = void 0, Vr.createTempUpdateFile = l;
  const e = Yr, t = Ct, o = jb(), r = /* @__PURE__ */ fr(), c = Me;
  let n = class {
    constructor(u) {
      this.cacheDir = u, this._file = null, this._packageFile = null, this.versionInfo = null, this.fileInfo = null, this._downloadedFileInfo = null;
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
      return c.join(this.cacheDir, "pending");
    }
    async validateDownloadedPath(u, i, f, d) {
      if (this.versionInfo != null && this.file === u && this.fileInfo != null)
        return o(this.versionInfo, i) && o(this.fileInfo.info, f.info) && await (0, r.pathExists)(u) ? u : null;
      const m = await this.getValidCachedUpdateFile(f, d);
      return m === null ? null : (d.info(`Update has already been downloaded to ${u}).`), this._file = m, m);
    }
    async setDownloadedFile(u, i, f, d, m, g) {
      this._file = u, this._packageFile = i, this.versionInfo = f, this.fileInfo = d, this._downloadedFileInfo = {
        fileName: m,
        sha512: d.info.sha512,
        isAdminRightsRequired: d.info.isAdminRightsRequired === !0
      }, g && await (0, r.outputJson)(this.getUpdateInfoFile(), this._downloadedFileInfo);
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
    async getValidCachedUpdateFile(u, i) {
      const f = this.getUpdateInfoFile();
      if (!await (0, r.pathExists)(f))
        return null;
      let m;
      try {
        m = await (0, r.readJson)(f);
      } catch (y) {
        let p = "No cached update info available";
        return y.code !== "ENOENT" && (await this.cleanCacheDirForPendingUpdate(), p += ` (error on read: ${y.message})`), i.info(p), null;
      }
      if (!(m?.fileName !== null))
        return i.warn("Cached update info is corrupted: no fileName, directory for cached update will be cleaned"), await this.cleanCacheDirForPendingUpdate(), null;
      if (u.info.sha512 !== m.sha512)
        return i.info(`Cached update sha512 checksum doesn't match the latest available update. New update must be downloaded. Cached: ${m.sha512}, expected: ${u.info.sha512}. Directory for cached update will be cleaned`), await this.cleanCacheDirForPendingUpdate(), null;
      const v = c.join(this.cacheDirForPendingUpdate, m.fileName);
      if (!await (0, r.pathExists)(v))
        return i.info("Cached update file doesn't exist"), null;
      const h = await s(v);
      return u.info.sha512 !== h ? (i.warn(`Sha512 checksum doesn't match the latest available update. New update must be downloaded. Cached: ${h}, expected: ${u.info.sha512}`), await this.cleanCacheDirForPendingUpdate(), null) : (this._downloadedFileInfo = m, v);
    }
    getUpdateInfoFile() {
      return c.join(this.cacheDirForPendingUpdate, "update-info.json");
    }
  };
  Vr.DownloadedUpdateHelper = n;
  function s(a, u = "sha512", i = "base64", f) {
    return new Promise((d, m) => {
      const g = (0, e.createHash)(u);
      g.on("error", m).setEncoding(i), (0, t.createReadStream)(a, {
        ...f,
        highWaterMark: 1024 * 1024
        /* better to use more memory but hash faster */
      }).on("error", m).on("end", () => {
        g.end(), d(g.read());
      }).pipe(g, { end: !1 });
    });
  }
  async function l(a, u, i) {
    let f = 0, d = c.join(u, a);
    for (let m = 0; m < 3; m++)
      try {
        return await (0, r.unlink)(d), d;
      } catch (g) {
        if (g.code === "ENOENT")
          return d;
        i.warn(`Error on remove temp update file: ${g}`), d = c.join(u, `${f++}-${a}`);
      }
    return d;
  }
  return Vr;
}
var En = {}, Za = {}, yg;
function xb() {
  if (yg) return Za;
  yg = 1, Object.defineProperty(Za, "__esModule", { value: !0 }), Za.getAppCacheDir = o;
  const e = Me, t = Gn;
  function o() {
    const r = (0, t.homedir)();
    let c;
    return process.platform === "win32" ? c = process.env.LOCALAPPDATA || e.join(r, "AppData", "Local") : process.platform === "darwin" ? c = e.join(r, "Library", "Caches") : c = process.env.XDG_CACHE_HOME || e.join(r, ".cache"), c;
  }
  return Za;
}
var gg;
function Vb() {
  if (gg) return En;
  gg = 1, Object.defineProperty(En, "__esModule", { value: !0 }), En.ElectronAppAdapter = void 0;
  const e = Me, t = xb();
  let o = class {
    constructor(c = ur.app) {
      this.app = c;
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
    onQuit(c) {
      this.app.once("quit", (n, s) => c(s));
    }
  };
  return En.ElectronAppAdapter = o, En;
}
var Kc = {}, vg;
function Gb() {
  return vg || (vg = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.ElectronHttpExecutor = e.NET_SESSION_NAME = void 0, e.getNetSession = o;
    const t = nt();
    e.NET_SESSION_NAME = "electron-updater";
    function o() {
      return ur.session.fromPartition(e.NET_SESSION_NAME, {
        cache: !1
      });
    }
    class r extends t.HttpExecutor {
      constructor(n) {
        super(), this.proxyLoginCallback = n, this.cachedSession = null;
      }
      async download(n, s, l) {
        return await l.cancellationToken.createPromise((a, u, i) => {
          const f = {
            headers: l.headers || void 0,
            redirect: "manual"
          };
          (0, t.configureRequestUrl)(n, f), (0, t.configureRequestOptions)(f), this.doDownload(f, {
            destination: s,
            options: l,
            onCancel: i,
            callback: (d) => {
              d == null ? a(s) : u(d);
            },
            responseHandler: null
          }, 0);
        });
      }
      createRequest(n, s) {
        n.headers && n.headers.Host && (n.host = n.headers.Host, delete n.headers.Host), this.cachedSession == null && (this.cachedSession = o());
        const l = ur.net.request({
          ...n,
          session: this.cachedSession
        });
        return l.on("response", s), this.proxyLoginCallback != null && l.on("login", this.proxyLoginCallback), l;
      }
      addRedirectHandlers(n, s, l, a, u) {
        n.on("redirect", (i, f, d) => {
          n.abort(), a > this.maxRedirects ? l(this.createMaxRedirectError()) : u(t.HttpExecutor.prepareRedirectUrlOptions(d, s));
        });
      }
    }
    e.ElectronHttpExecutor = r;
  })(Kc)), Kc;
}
var wn = {}, Ar = {}, Xc, _g;
function Hb() {
  if (_g) return Xc;
  _g = 1;
  var e = "[object Symbol]", t = /[\\^$.*+?()[\]{}|]/g, o = RegExp(t.source), r = typeof It == "object" && It && It.Object === Object && It, c = typeof self == "object" && self && self.Object === Object && self, n = r || c || Function("return this")(), s = Object.prototype, l = s.toString, a = n.Symbol, u = a ? a.prototype : void 0, i = u ? u.toString : void 0;
  function f(h) {
    if (typeof h == "string")
      return h;
    if (m(h))
      return i ? i.call(h) : "";
    var y = h + "";
    return y == "0" && 1 / h == -1 / 0 ? "-0" : y;
  }
  function d(h) {
    return !!h && typeof h == "object";
  }
  function m(h) {
    return typeof h == "symbol" || d(h) && l.call(h) == e;
  }
  function g(h) {
    return h == null ? "" : f(h);
  }
  function v(h) {
    return h = g(h), h && o.test(h) ? h.replace(t, "\\$&") : h;
  }
  return Xc = v, Xc;
}
var Eg;
function Dr() {
  if (Eg) return Ar;
  Eg = 1, Object.defineProperty(Ar, "__esModule", { value: !0 }), Ar.newBaseUrl = o, Ar.newUrlFromBase = r, Ar.getChannelFilename = c, Ar.blockmapFiles = n;
  const e = Jr, t = Hb();
  function o(s) {
    const l = new e.URL(s);
    return l.pathname.endsWith("/") || (l.pathname += "/"), l;
  }
  function r(s, l, a = !1) {
    const u = new e.URL(s, l), i = l.search;
    return i != null && i.length !== 0 ? u.search = i : a && (u.search = `noCache=${Date.now().toString(32)}`), u;
  }
  function c(s) {
    return `${s}.yml`;
  }
  function n(s, l, a) {
    const u = r(`${s.pathname}.blockmap`, s);
    return [r(`${s.pathname.replace(new RegExp(t(a), "g"), l)}.blockmap`, s), u];
  }
  return Ar;
}
var Wt = {}, wg;
function $t() {
  if (wg) return Wt;
  wg = 1, Object.defineProperty(Wt, "__esModule", { value: !0 }), Wt.Provider = void 0, Wt.findFile = c, Wt.parseUpdateInfo = n, Wt.getFileList = s, Wt.resolveFiles = l;
  const e = nt(), t = Rl(), o = Dr();
  let r = class {
    constructor(u) {
      this.runtimeOptions = u, this.requestHeaders = null, this.executor = u.executor;
    }
    get isUseMultipleRangeRequest() {
      return this.runtimeOptions.isUseMultipleRangeRequest !== !1;
    }
    getChannelFilePrefix() {
      if (this.runtimeOptions.platform === "linux") {
        const u = process.env.TEST_UPDATER_ARCH || process.arch;
        return "-linux" + (u === "x64" ? "" : `-${u}`);
      } else
        return this.runtimeOptions.platform === "darwin" ? "-mac" : "";
    }
    // due to historical reasons for windows we use channel name without platform specifier
    getDefaultChannelName() {
      return this.getCustomChannelName("latest");
    }
    getCustomChannelName(u) {
      return `${u}${this.getChannelFilePrefix()}`;
    }
    get fileExtraDownloadHeaders() {
      return null;
    }
    setRequestHeaders(u) {
      this.requestHeaders = u;
    }
    /**
     * Method to perform API request only to resolve update info, but not to download update.
     */
    httpRequest(u, i, f) {
      return this.executor.request(this.createRequestOptions(u, i), f);
    }
    createRequestOptions(u, i) {
      const f = {};
      return this.requestHeaders == null ? i != null && (f.headers = i) : f.headers = i == null ? this.requestHeaders : { ...this.requestHeaders, ...i }, (0, e.configureRequestUrl)(u, f), f;
    }
  };
  Wt.Provider = r;
  function c(a, u, i) {
    if (a.length === 0)
      throw (0, e.newError)("No files provided", "ERR_UPDATER_NO_FILES_PROVIDED");
    const f = a.find((d) => d.url.pathname.toLowerCase().endsWith(`.${u}`));
    return f ?? (i == null ? a[0] : a.find((d) => !i.some((m) => d.url.pathname.toLowerCase().endsWith(`.${m}`))));
  }
  function n(a, u, i) {
    if (a == null)
      throw (0, e.newError)(`Cannot parse update info from ${u} in the latest release artifacts (${i}): rawData: null`, "ERR_UPDATER_INVALID_UPDATE_INFO");
    let f;
    try {
      f = (0, t.load)(a);
    } catch (d) {
      throw (0, e.newError)(`Cannot parse update info from ${u} in the latest release artifacts (${i}): ${d.stack || d.message}, rawData: ${a}`, "ERR_UPDATER_INVALID_UPDATE_INFO");
    }
    return f;
  }
  function s(a) {
    const u = a.files;
    if (u != null && u.length > 0)
      return u;
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
  function l(a, u, i = (f) => f) {
    const d = s(a).map((v) => {
      if (v.sha2 == null && v.sha512 == null)
        throw (0, e.newError)(`Update info doesn't contain nor sha256 neither sha512 checksum: ${(0, e.safeStringifyJson)(v)}`, "ERR_UPDATER_NO_CHECKSUM");
      return {
        url: (0, o.newUrlFromBase)(i(v.url), u),
        info: v
      };
    }), m = a.packages, g = m == null ? null : m[process.arch] || m.ia32;
    return g != null && (d[0].packageInfo = {
      ...g,
      path: (0, o.newUrlFromBase)(i(g.path), u).href
    }), d;
  }
  return Wt;
}
var Sg;
function Z0() {
  if (Sg) return wn;
  Sg = 1, Object.defineProperty(wn, "__esModule", { value: !0 }), wn.GenericProvider = void 0;
  const e = nt(), t = Dr(), o = $t();
  let r = class extends o.Provider {
    constructor(n, s, l) {
      super(l), this.configuration = n, this.updater = s, this.baseUrl = (0, t.newBaseUrl)(this.configuration.url);
    }
    get channel() {
      const n = this.updater.channel || this.configuration.channel;
      return n == null ? this.getDefaultChannelName() : this.getCustomChannelName(n);
    }
    async getLatestVersion() {
      const n = (0, t.getChannelFilename)(this.channel), s = (0, t.newUrlFromBase)(n, this.baseUrl, this.updater.isAddNoCacheQuery);
      for (let l = 0; ; l++)
        try {
          return (0, o.parseUpdateInfo)(await this.httpRequest(s), n, s);
        } catch (a) {
          if (a instanceof e.HttpError && a.statusCode === 404)
            throw (0, e.newError)(`Cannot find channel "${n}" update info: ${a.stack || a.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
          if (a.code === "ECONNREFUSED" && l < 3) {
            await new Promise((u, i) => {
              try {
                setTimeout(u, 1e3 * l);
              } catch (f) {
                i(f);
              }
            });
            continue;
          }
          throw a;
        }
    }
    resolveFiles(n) {
      return (0, o.resolveFiles)(n, this.baseUrl);
    }
  };
  return wn.GenericProvider = r, wn;
}
var Sn = {}, $n = {}, $g;
function Bb() {
  if ($g) return $n;
  $g = 1, Object.defineProperty($n, "__esModule", { value: !0 }), $n.BitbucketProvider = void 0;
  const e = nt(), t = Dr(), o = $t();
  let r = class extends o.Provider {
    constructor(n, s, l) {
      super({
        ...l,
        isUseMultipleRangeRequest: !1
      }), this.configuration = n, this.updater = s;
      const { owner: a, slug: u } = n;
      this.baseUrl = (0, t.newBaseUrl)(`https://api.bitbucket.org/2.0/repositories/${a}/${u}/downloads`);
    }
    get channel() {
      return this.updater.channel || this.configuration.channel || "latest";
    }
    async getLatestVersion() {
      const n = new e.CancellationToken(), s = (0, t.getChannelFilename)(this.getCustomChannelName(this.channel)), l = (0, t.newUrlFromBase)(s, this.baseUrl, this.updater.isAddNoCacheQuery);
      try {
        const a = await this.httpRequest(l, void 0, n);
        return (0, o.parseUpdateInfo)(a, s, l);
      } catch (a) {
        throw (0, e.newError)(`Unable to find latest version on ${this.toString()}, please ensure release exists: ${a.stack || a.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
      }
    }
    resolveFiles(n) {
      return (0, o.resolveFiles)(n, this.baseUrl);
    }
    toString() {
      const { owner: n, slug: s } = this.configuration;
      return `Bitbucket (owner: ${n}, slug: ${s}, channel: ${this.channel})`;
    }
  };
  return $n.BitbucketProvider = r, $n;
}
var ir = {}, bg;
function ev() {
  if (bg) return ir;
  bg = 1, Object.defineProperty(ir, "__esModule", { value: !0 }), ir.GitHubProvider = ir.BaseGitHubProvider = void 0, ir.computeReleaseNotes = u;
  const e = nt(), t = Q0(), o = Jr, r = Dr(), c = $t(), n = /\/tag\/([^/]+)$/;
  class s extends c.Provider {
    constructor(f, d, m) {
      super({
        ...m,
        /* because GitHib uses S3 */
        isUseMultipleRangeRequest: !1
      }), this.options = f, this.baseUrl = (0, r.newBaseUrl)((0, e.githubUrl)(f, d));
      const g = d === "github.com" ? "api.github.com" : d;
      this.baseApiUrl = (0, r.newBaseUrl)((0, e.githubUrl)(f, g));
    }
    computeGithubBasePath(f) {
      const d = this.options.host;
      return d && !["github.com", "api.github.com"].includes(d) ? `/api/v3${f}` : f;
    }
  }
  ir.BaseGitHubProvider = s;
  let l = class extends s {
    constructor(f, d, m) {
      super(f, "github.com", m), this.options = f, this.updater = d;
    }
    get channel() {
      const f = this.updater.channel || this.options.channel;
      return f == null ? this.getDefaultChannelName() : this.getCustomChannelName(f);
    }
    async getLatestVersion() {
      var f, d, m, g, v;
      const h = new e.CancellationToken(), y = await this.httpRequest((0, r.newUrlFromBase)(`${this.basePath}.atom`, this.baseUrl), {
        accept: "application/xml, application/atom+xml, text/xml, */*"
      }, h), p = (0, e.parseXml)(y);
      let E = p.element("entry", !1, "No published versions on GitHub"), $ = null;
      try {
        if (this.updater.allowPrerelease) {
          const j = ((f = this.updater) === null || f === void 0 ? void 0 : f.channel) || ((d = t.prerelease(this.updater.currentVersion)) === null || d === void 0 ? void 0 : d[0]) || null;
          if (j === null)
            $ = n.exec(E.element("link").attribute("href"))[1];
          else
            for (const M of p.getElements("entry")) {
              const B = n.exec(M.element("link").attribute("href"));
              if (B === null)
                continue;
              const W = B[1], F = ((m = t.prerelease(W)) === null || m === void 0 ? void 0 : m[0]) || null, q = !j || ["alpha", "beta"].includes(j), J = F !== null && !["alpha", "beta"].includes(String(F));
              if (q && !J && !(j === "beta" && F === "alpha")) {
                $ = W;
                break;
              }
              if (F && F === j) {
                $ = W;
                break;
              }
            }
        } else {
          $ = await this.getLatestTagName(h);
          for (const j of p.getElements("entry"))
            if (n.exec(j.element("link").attribute("href"))[1] === $) {
              E = j;
              break;
            }
        }
      } catch (j) {
        throw (0, e.newError)(`Cannot parse releases feed: ${j.stack || j.message},
XML:
${y}`, "ERR_UPDATER_INVALID_RELEASE_FEED");
      }
      if ($ == null)
        throw (0, e.newError)("No published versions on GitHub", "ERR_UPDATER_NO_PUBLISHED_VERSIONS");
      let S, _ = "", w = "";
      const R = async (j) => {
        _ = (0, r.getChannelFilename)(j), w = (0, r.newUrlFromBase)(this.getBaseDownloadPath(String($), _), this.baseUrl);
        const M = this.createRequestOptions(w);
        try {
          return await this.executor.request(M, h);
        } catch (B) {
          throw B instanceof e.HttpError && B.statusCode === 404 ? (0, e.newError)(`Cannot find ${_} in the latest release artifacts (${w}): ${B.stack || B.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND") : B;
        }
      };
      try {
        let j = this.channel;
        this.updater.allowPrerelease && (!((g = t.prerelease($)) === null || g === void 0) && g[0]) && (j = this.getCustomChannelName(String((v = t.prerelease($)) === null || v === void 0 ? void 0 : v[0]))), S = await R(j);
      } catch (j) {
        if (this.updater.allowPrerelease)
          S = await R(this.getDefaultChannelName());
        else
          throw j;
      }
      const P = (0, c.parseUpdateInfo)(S, _, w);
      return P.releaseName == null && (P.releaseName = E.elementValueOrEmpty("title")), P.releaseNotes == null && (P.releaseNotes = u(this.updater.currentVersion, this.updater.fullChangelog, p, E)), {
        tag: $,
        ...P
      };
    }
    async getLatestTagName(f) {
      const d = this.options, m = d.host == null || d.host === "github.com" ? (0, r.newUrlFromBase)(`${this.basePath}/latest`, this.baseUrl) : new o.URL(`${this.computeGithubBasePath(`/repos/${d.owner}/${d.repo}/releases`)}/latest`, this.baseApiUrl);
      try {
        const g = await this.httpRequest(m, { Accept: "application/json" }, f);
        return g == null ? null : JSON.parse(g).tag_name;
      } catch (g) {
        throw (0, e.newError)(`Unable to find latest version on GitHub (${m}), please ensure a production release exists: ${g.stack || g.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
      }
    }
    get basePath() {
      return `/${this.options.owner}/${this.options.repo}/releases`;
    }
    resolveFiles(f) {
      return (0, c.resolveFiles)(f, this.baseUrl, (d) => this.getBaseDownloadPath(f.tag, d.replace(/ /g, "-")));
    }
    getBaseDownloadPath(f, d) {
      return `${this.basePath}/download/${f}/${d}`;
    }
  };
  ir.GitHubProvider = l;
  function a(i) {
    const f = i.elementValueOrEmpty("content");
    return f === "No content." ? "" : f;
  }
  function u(i, f, d, m) {
    if (!f)
      return a(m);
    const g = [];
    for (const v of d.getElements("entry")) {
      const h = /\/tag\/v?([^/]+)$/.exec(v.element("link").attribute("href"))[1];
      t.lt(i, h) && g.push({
        version: h,
        note: a(v)
      });
    }
    return g.sort((v, h) => t.rcompare(v.version, h.version));
  }
  return ir;
}
var bn = {}, Tg;
function zb() {
  if (Tg) return bn;
  Tg = 1, Object.defineProperty(bn, "__esModule", { value: !0 }), bn.KeygenProvider = void 0;
  const e = nt(), t = Dr(), o = $t();
  let r = class extends o.Provider {
    constructor(n, s, l) {
      super({
        ...l,
        isUseMultipleRangeRequest: !1
      }), this.configuration = n, this.updater = s, this.defaultHostname = "api.keygen.sh";
      const a = this.configuration.host || this.defaultHostname;
      this.baseUrl = (0, t.newBaseUrl)(`https://${a}/v1/accounts/${this.configuration.account}/artifacts?product=${this.configuration.product}`);
    }
    get channel() {
      return this.updater.channel || this.configuration.channel || "stable";
    }
    async getLatestVersion() {
      const n = new e.CancellationToken(), s = (0, t.getChannelFilename)(this.getCustomChannelName(this.channel)), l = (0, t.newUrlFromBase)(s, this.baseUrl, this.updater.isAddNoCacheQuery);
      try {
        const a = await this.httpRequest(l, {
          Accept: "application/vnd.api+json",
          "Keygen-Version": "1.1"
        }, n);
        return (0, o.parseUpdateInfo)(a, s, l);
      } catch (a) {
        throw (0, e.newError)(`Unable to find latest version on ${this.toString()}, please ensure release exists: ${a.stack || a.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
      }
    }
    resolveFiles(n) {
      return (0, o.resolveFiles)(n, this.baseUrl);
    }
    toString() {
      const { account: n, product: s, platform: l } = this.configuration;
      return `Keygen (account: ${n}, product: ${s}, platform: ${l}, channel: ${this.channel})`;
    }
  };
  return bn.KeygenProvider = r, bn;
}
var Tn = {}, Rg;
function Kb() {
  if (Rg) return Tn;
  Rg = 1, Object.defineProperty(Tn, "__esModule", { value: !0 }), Tn.PrivateGitHubProvider = void 0;
  const e = nt(), t = Rl(), o = Me, r = Jr, c = Dr(), n = ev(), s = $t();
  let l = class extends n.BaseGitHubProvider {
    constructor(u, i, f, d) {
      super(u, "api.github.com", d), this.updater = i, this.token = f;
    }
    createRequestOptions(u, i) {
      const f = super.createRequestOptions(u, i);
      return f.redirect = "manual", f;
    }
    async getLatestVersion() {
      const u = new e.CancellationToken(), i = (0, c.getChannelFilename)(this.getDefaultChannelName()), f = await this.getLatestVersionInfo(u), d = f.assets.find((v) => v.name === i);
      if (d == null)
        throw (0, e.newError)(`Cannot find ${i} in the release ${f.html_url || f.name}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
      const m = new r.URL(d.url);
      let g;
      try {
        g = (0, t.load)(await this.httpRequest(m, this.configureHeaders("application/octet-stream"), u));
      } catch (v) {
        throw v instanceof e.HttpError && v.statusCode === 404 ? (0, e.newError)(`Cannot find ${i} in the latest release artifacts (${m}): ${v.stack || v.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND") : v;
      }
      return g.assets = f.assets, g;
    }
    get fileExtraDownloadHeaders() {
      return this.configureHeaders("application/octet-stream");
    }
    configureHeaders(u) {
      return {
        accept: u,
        authorization: `token ${this.token}`
      };
    }
    async getLatestVersionInfo(u) {
      const i = this.updater.allowPrerelease;
      let f = this.basePath;
      i || (f = `${f}/latest`);
      const d = (0, c.newUrlFromBase)(f, this.baseUrl);
      try {
        const m = JSON.parse(await this.httpRequest(d, this.configureHeaders("application/vnd.github.v3+json"), u));
        return i ? m.find((g) => g.prerelease) || m[0] : m;
      } catch (m) {
        throw (0, e.newError)(`Unable to find latest version on GitHub (${d}), please ensure a production release exists: ${m.stack || m.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
      }
    }
    get basePath() {
      return this.computeGithubBasePath(`/repos/${this.options.owner}/${this.options.repo}/releases`);
    }
    resolveFiles(u) {
      return (0, s.getFileList)(u).map((i) => {
        const f = o.posix.basename(i.url).replace(/ /g, "-"), d = u.assets.find((m) => m != null && m.name === f);
        if (d == null)
          throw (0, e.newError)(`Cannot find asset "${f}" in: ${JSON.stringify(u.assets, null, 2)}`, "ERR_UPDATER_ASSET_NOT_FOUND");
        return {
          url: new r.URL(d.url),
          info: i
        };
      });
    }
  };
  return Tn.PrivateGitHubProvider = l, Tn;
}
var Pg;
function Xb() {
  if (Pg) return Sn;
  Pg = 1, Object.defineProperty(Sn, "__esModule", { value: !0 }), Sn.isUrlProbablySupportMultiRangeRequests = s, Sn.createClient = l;
  const e = nt(), t = Bb(), o = Z0(), r = ev(), c = zb(), n = Kb();
  function s(a) {
    return !a.includes("s3.amazonaws.com");
  }
  function l(a, u, i) {
    if (typeof a == "string")
      throw (0, e.newError)("Please pass PublishConfiguration object", "ERR_UPDATER_INVALID_PROVIDER_CONFIGURATION");
    const f = a.provider;
    switch (f) {
      case "github": {
        const d = a, m = (d.private ? process.env.GH_TOKEN || process.env.GITHUB_TOKEN : null) || d.token;
        return m == null ? new r.GitHubProvider(d, u, i) : new n.PrivateGitHubProvider(d, u, m, i);
      }
      case "bitbucket":
        return new t.BitbucketProvider(a, u, i);
      case "keygen":
        return new c.KeygenProvider(a, u, i);
      case "s3":
      case "spaces":
        return new o.GenericProvider({
          provider: "generic",
          url: (0, e.getS3LikeProviderBaseUrl)(a),
          channel: a.channel || null
        }, u, {
          ...i,
          // https://github.com/minio/minio/issues/5285#issuecomment-350428955
          isUseMultipleRangeRequest: !1
        });
      case "generic": {
        const d = a;
        return new o.GenericProvider(d, u, {
          ...i,
          isUseMultipleRangeRequest: d.useMultipleRangeRequest !== !1 && s(d.url)
        });
      }
      case "custom": {
        const d = a, m = d.updateProvider;
        if (!m)
          throw (0, e.newError)("Custom provider not specified", "ERR_UPDATER_INVALID_PROVIDER_CONFIGURATION");
        return new m(d, u, i);
      }
      default:
        throw (0, e.newError)(`Unsupported provider: ${f}`, "ERR_UPDATER_UNSUPPORTED_PROVIDER");
    }
  }
  return Sn;
}
var Rn = {}, Pn = {}, Gr = {}, Hr = {}, Ng;
function Dl() {
  if (Ng) return Hr;
  Ng = 1, Object.defineProperty(Hr, "__esModule", { value: !0 }), Hr.OperationKind = void 0, Hr.computeOperations = t;
  var e;
  (function(s) {
    s[s.COPY = 0] = "COPY", s[s.DOWNLOAD = 1] = "DOWNLOAD";
  })(e || (Hr.OperationKind = e = {}));
  function t(s, l, a) {
    const u = n(s.files), i = n(l.files);
    let f = null;
    const d = l.files[0], m = [], g = d.name, v = u.get(g);
    if (v == null)
      throw new Error(`no file ${g} in old blockmap`);
    const h = i.get(g);
    let y = 0;
    const { checksumToOffset: p, checksumToOldSize: E } = c(u.get(g), v.offset, a);
    let $ = d.offset;
    for (let S = 0; S < h.checksums.length; $ += h.sizes[S], S++) {
      const _ = h.sizes[S], w = h.checksums[S];
      let R = p.get(w);
      R != null && E.get(w) !== _ && (a.warn(`Checksum ("${w}") matches, but size differs (old: ${E.get(w)}, new: ${_})`), R = void 0), R === void 0 ? (y++, f != null && f.kind === e.DOWNLOAD && f.end === $ ? f.end += _ : (f = {
        kind: e.DOWNLOAD,
        start: $,
        end: $ + _
        // oldBlocks: null,
      }, r(f, m, w, S))) : f != null && f.kind === e.COPY && f.end === R ? f.end += _ : (f = {
        kind: e.COPY,
        start: R,
        end: R + _
        // oldBlocks: [checksum]
      }, r(f, m, w, S));
    }
    return y > 0 && a.info(`File${d.name === "file" ? "" : " " + d.name} has ${y} changed blocks`), m;
  }
  const o = process.env.DIFFERENTIAL_DOWNLOAD_PLAN_BUILDER_VALIDATE_RANGES === "true";
  function r(s, l, a, u) {
    if (o && l.length !== 0) {
      const i = l[l.length - 1];
      if (i.kind === s.kind && s.start < i.end && s.start > i.start) {
        const f = [i.start, i.end, s.start, s.end].reduce((d, m) => d < m ? d : m);
        throw new Error(`operation (block index: ${u}, checksum: ${a}, kind: ${e[s.kind]}) overlaps previous operation (checksum: ${a}):
abs: ${i.start} until ${i.end} and ${s.start} until ${s.end}
rel: ${i.start - f} until ${i.end - f} and ${s.start - f} until ${s.end - f}`);
      }
    }
    l.push(s);
  }
  function c(s, l, a) {
    const u = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map();
    let f = l;
    for (let d = 0; d < s.checksums.length; d++) {
      const m = s.checksums[d], g = s.sizes[d], v = i.get(m);
      if (v === void 0)
        u.set(m, f), i.set(m, g);
      else if (a.debug != null) {
        const h = v === g ? "(same size)" : `(size: ${v}, this size: ${g})`;
        a.debug(`${m} duplicated in blockmap ${h}, it doesn't lead to broken differential downloader, just corresponding block will be skipped)`);
      }
      f += g;
    }
    return { checksumToOffset: u, checksumToOldSize: i };
  }
  function n(s) {
    const l = /* @__PURE__ */ new Map();
    for (const a of s)
      l.set(a.name, a);
    return l;
  }
  return Hr;
}
var Og;
function tv() {
  if (Og) return Gr;
  Og = 1, Object.defineProperty(Gr, "__esModule", { value: !0 }), Gr.DataSplitter = void 0, Gr.copyData = s;
  const e = nt(), t = Ct, o = Hn, r = Dl(), c = Buffer.from(`\r
\r
`);
  var n;
  (function(a) {
    a[a.INIT = 0] = "INIT", a[a.HEADER = 1] = "HEADER", a[a.BODY = 2] = "BODY";
  })(n || (n = {}));
  function s(a, u, i, f, d) {
    const m = (0, t.createReadStream)("", {
      fd: i,
      autoClose: !1,
      start: a.start,
      // end is inclusive
      end: a.end - 1
    });
    m.on("error", f), m.once("end", d), m.pipe(u, {
      end: !1
    });
  }
  let l = class extends o.Writable {
    constructor(u, i, f, d, m, g) {
      super(), this.out = u, this.options = i, this.partIndexToTaskIndex = f, this.partIndexToLength = m, this.finishHandler = g, this.partIndex = -1, this.headerListBuffer = null, this.readState = n.INIT, this.ignoreByteCount = 0, this.remainingPartDataCount = 0, this.actualPartLength = 0, this.boundaryLength = d.length + 4, this.ignoreByteCount = this.boundaryLength - 2;
    }
    get isFinished() {
      return this.partIndex === this.partIndexToLength.length;
    }
    // noinspection JSUnusedGlobalSymbols
    _write(u, i, f) {
      if (this.isFinished) {
        console.error(`Trailing ignored data: ${u.length} bytes`);
        return;
      }
      this.handleData(u).then(f).catch(f);
    }
    async handleData(u) {
      let i = 0;
      if (this.ignoreByteCount !== 0 && this.remainingPartDataCount !== 0)
        throw (0, e.newError)("Internal error", "ERR_DATA_SPLITTER_BYTE_COUNT_MISMATCH");
      if (this.ignoreByteCount > 0) {
        const f = Math.min(this.ignoreByteCount, u.length);
        this.ignoreByteCount -= f, i = f;
      } else if (this.remainingPartDataCount > 0) {
        const f = Math.min(this.remainingPartDataCount, u.length);
        this.remainingPartDataCount -= f, await this.processPartData(u, 0, f), i = f;
      }
      if (i !== u.length) {
        if (this.readState === n.HEADER) {
          const f = this.searchHeaderListEnd(u, i);
          if (f === -1)
            return;
          i = f, this.readState = n.BODY, this.headerListBuffer = null;
        }
        for (; ; ) {
          if (this.readState === n.BODY)
            this.readState = n.INIT;
          else {
            this.partIndex++;
            let g = this.partIndexToTaskIndex.get(this.partIndex);
            if (g == null)
              if (this.isFinished)
                g = this.options.end;
              else
                throw (0, e.newError)("taskIndex is null", "ERR_DATA_SPLITTER_TASK_INDEX_IS_NULL");
            const v = this.partIndex === 0 ? this.options.start : this.partIndexToTaskIndex.get(this.partIndex - 1) + 1;
            if (v < g)
              await this.copyExistingData(v, g);
            else if (v > g)
              throw (0, e.newError)("prevTaskIndex must be < taskIndex", "ERR_DATA_SPLITTER_TASK_INDEX_ASSERT_FAILED");
            if (this.isFinished) {
              this.onPartEnd(), this.finishHandler();
              return;
            }
            if (i = this.searchHeaderListEnd(u, i), i === -1) {
              this.readState = n.HEADER;
              return;
            }
          }
          const f = this.partIndexToLength[this.partIndex], d = i + f, m = Math.min(d, u.length);
          if (await this.processPartStarted(u, i, m), this.remainingPartDataCount = f - (m - i), this.remainingPartDataCount > 0)
            return;
          if (i = d + this.boundaryLength, i >= u.length) {
            this.ignoreByteCount = this.boundaryLength - (u.length - d);
            return;
          }
        }
      }
    }
    copyExistingData(u, i) {
      return new Promise((f, d) => {
        const m = () => {
          if (u === i) {
            f();
            return;
          }
          const g = this.options.tasks[u];
          if (g.kind !== r.OperationKind.COPY) {
            d(new Error("Task kind must be COPY"));
            return;
          }
          s(g, this.out, this.options.oldFileFd, d, () => {
            u++, m();
          });
        };
        m();
      });
    }
    searchHeaderListEnd(u, i) {
      const f = u.indexOf(c, i);
      if (f !== -1)
        return f + c.length;
      const d = i === 0 ? u : u.slice(i);
      return this.headerListBuffer == null ? this.headerListBuffer = d : this.headerListBuffer = Buffer.concat([this.headerListBuffer, d]), -1;
    }
    onPartEnd() {
      const u = this.partIndexToLength[this.partIndex - 1];
      if (this.actualPartLength !== u)
        throw (0, e.newError)(`Expected length: ${u} differs from actual: ${this.actualPartLength}`, "ERR_DATA_SPLITTER_LENGTH_MISMATCH");
      this.actualPartLength = 0;
    }
    processPartStarted(u, i, f) {
      return this.partIndex !== 0 && this.onPartEnd(), this.processPartData(u, i, f);
    }
    processPartData(u, i, f) {
      this.actualPartLength += f - i;
      const d = this.out;
      return d.write(i === 0 && u.length === f ? u : u.slice(i, f)) ? Promise.resolve() : new Promise((m, g) => {
        d.on("error", g), d.once("drain", () => {
          d.removeListener("error", g), m();
        });
      });
    }
  };
  return Gr.DataSplitter = l, Gr;
}
var Nn = {}, Ag;
function Wb() {
  if (Ag) return Nn;
  Ag = 1, Object.defineProperty(Nn, "__esModule", { value: !0 }), Nn.executeTasksUsingMultipleRangeRequests = r, Nn.checkIsRangesSupported = n;
  const e = nt(), t = tv(), o = Dl();
  function r(s, l, a, u, i) {
    const f = (d) => {
      if (d >= l.length) {
        s.fileMetadataBuffer != null && a.write(s.fileMetadataBuffer), a.end();
        return;
      }
      const m = d + 1e3;
      c(s, {
        tasks: l,
        start: d,
        end: Math.min(l.length, m),
        oldFileFd: u
      }, a, () => f(m), i);
    };
    return f;
  }
  function c(s, l, a, u, i) {
    let f = "bytes=", d = 0;
    const m = /* @__PURE__ */ new Map(), g = [];
    for (let y = l.start; y < l.end; y++) {
      const p = l.tasks[y];
      p.kind === o.OperationKind.DOWNLOAD && (f += `${p.start}-${p.end - 1}, `, m.set(d, y), d++, g.push(p.end - p.start));
    }
    if (d <= 1) {
      const y = (p) => {
        if (p >= l.end) {
          u();
          return;
        }
        const E = l.tasks[p++];
        if (E.kind === o.OperationKind.COPY)
          (0, t.copyData)(E, a, l.oldFileFd, i, () => y(p));
        else {
          const $ = s.createRequestOptions();
          $.headers.Range = `bytes=${E.start}-${E.end - 1}`;
          const S = s.httpExecutor.createRequest($, (_) => {
            n(_, i) && (_.pipe(a, {
              end: !1
            }), _.once("end", () => y(p)));
          });
          s.httpExecutor.addErrorAndTimeoutHandlers(S, i), S.end();
        }
      };
      y(l.start);
      return;
    }
    const v = s.createRequestOptions();
    v.headers.Range = f.substring(0, f.length - 2);
    const h = s.httpExecutor.createRequest(v, (y) => {
      if (!n(y, i))
        return;
      const p = (0, e.safeGetHeader)(y, "content-type"), E = /^multipart\/.+?(?:; boundary=(?:(?:"(.+)")|(?:([^\s]+))))$/i.exec(p);
      if (E == null) {
        i(new Error(`Content-Type "multipart/byteranges" is expected, but got "${p}"`));
        return;
      }
      const $ = new t.DataSplitter(a, l, m, E[1] || E[2], g, u);
      $.on("error", i), y.pipe($), y.on("end", () => {
        setTimeout(() => {
          h.abort(), i(new Error("Response ends without calling any handlers"));
        }, 1e4);
      });
    });
    s.httpExecutor.addErrorAndTimeoutHandlers(h, i), h.end();
  }
  function n(s, l) {
    if (s.statusCode >= 400)
      return l((0, e.createHttpError)(s)), !1;
    if (s.statusCode !== 206) {
      const a = (0, e.safeGetHeader)(s, "accept-ranges");
      if (a == null || a === "none")
        return l(new Error(`Server doesn't support Accept-Ranges (response code ${s.statusCode})`)), !1;
    }
    return !0;
  }
  return Nn;
}
var On = {}, Ig;
function Yb() {
  if (Ig) return On;
  Ig = 1, Object.defineProperty(On, "__esModule", { value: !0 }), On.ProgressDifferentialDownloadCallbackTransform = void 0;
  const e = Hn;
  var t;
  (function(r) {
    r[r.COPY = 0] = "COPY", r[r.DOWNLOAD = 1] = "DOWNLOAD";
  })(t || (t = {}));
  let o = class extends e.Transform {
    constructor(c, n, s) {
      super(), this.progressDifferentialDownloadInfo = c, this.cancellationToken = n, this.onProgress = s, this.start = Date.now(), this.transferred = 0, this.delta = 0, this.expectedBytes = 0, this.index = 0, this.operationType = t.COPY, this.nextUpdate = this.start + 1e3;
    }
    _transform(c, n, s) {
      if (this.cancellationToken.cancelled) {
        s(new Error("cancelled"), null);
        return;
      }
      if (this.operationType == t.COPY) {
        s(null, c);
        return;
      }
      this.transferred += c.length, this.delta += c.length;
      const l = Date.now();
      l >= this.nextUpdate && this.transferred !== this.expectedBytes && this.transferred !== this.progressDifferentialDownloadInfo.grandTotal && (this.nextUpdate = l + 1e3, this.onProgress({
        total: this.progressDifferentialDownloadInfo.grandTotal,
        delta: this.delta,
        transferred: this.transferred,
        percent: this.transferred / this.progressDifferentialDownloadInfo.grandTotal * 100,
        bytesPerSecond: Math.round(this.transferred / ((l - this.start) / 1e3))
      }), this.delta = 0), s(null, c);
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
    _flush(c) {
      if (this.cancellationToken.cancelled) {
        c(new Error("cancelled"));
        return;
      }
      this.onProgress({
        total: this.progressDifferentialDownloadInfo.grandTotal,
        delta: this.delta,
        transferred: this.transferred,
        percent: 100,
        bytesPerSecond: Math.round(this.transferred / ((Date.now() - this.start) / 1e3))
      }), this.delta = 0, this.transferred = 0, c(null);
    }
  };
  return On.ProgressDifferentialDownloadCallbackTransform = o, On;
}
var Cg;
function rv() {
  if (Cg) return Pn;
  Cg = 1, Object.defineProperty(Pn, "__esModule", { value: !0 }), Pn.DifferentialDownloader = void 0;
  const e = nt(), t = /* @__PURE__ */ fr(), o = Ct, r = tv(), c = Jr, n = Dl(), s = Wb(), l = Yb();
  let a = class {
    // noinspection TypeScriptAbstractClassConstructorCanBeMadeProtected
    constructor(d, m, g) {
      this.blockAwareFileInfo = d, this.httpExecutor = m, this.options = g, this.fileMetadataBuffer = null, this.logger = g.logger;
    }
    createRequestOptions() {
      const d = {
        headers: {
          ...this.options.requestHeaders,
          accept: "*/*"
        }
      };
      return (0, e.configureRequestUrl)(this.options.newUrl, d), (0, e.configureRequestOptions)(d), d;
    }
    doDownload(d, m) {
      if (d.version !== m.version)
        throw new Error(`version is different (${d.version} - ${m.version}), full download is required`);
      const g = this.logger, v = (0, n.computeOperations)(d, m, g);
      g.debug != null && g.debug(JSON.stringify(v, null, 2));
      let h = 0, y = 0;
      for (const E of v) {
        const $ = E.end - E.start;
        E.kind === n.OperationKind.DOWNLOAD ? h += $ : y += $;
      }
      const p = this.blockAwareFileInfo.size;
      if (h + y + (this.fileMetadataBuffer == null ? 0 : this.fileMetadataBuffer.length) !== p)
        throw new Error(`Internal error, size mismatch: downloadSize: ${h}, copySize: ${y}, newSize: ${p}`);
      return g.info(`Full: ${u(p)}, To download: ${u(h)} (${Math.round(h / (p / 100))}%)`), this.downloadFile(v);
    }
    downloadFile(d) {
      const m = [], g = () => Promise.all(m.map((v) => (0, t.close)(v.descriptor).catch((h) => {
        this.logger.error(`cannot close file "${v.path}": ${h}`);
      })));
      return this.doDownloadFile(d, m).then(g).catch((v) => g().catch((h) => {
        try {
          this.logger.error(`cannot close files: ${h}`);
        } catch (y) {
          try {
            console.error(y);
          } catch {
          }
        }
        throw v;
      }).then(() => {
        throw v;
      }));
    }
    async doDownloadFile(d, m) {
      const g = await (0, t.open)(this.options.oldFile, "r");
      m.push({ descriptor: g, path: this.options.oldFile });
      const v = await (0, t.open)(this.options.newFile, "w");
      m.push({ descriptor: v, path: this.options.newFile });
      const h = (0, o.createWriteStream)(this.options.newFile, { fd: v });
      await new Promise((y, p) => {
        const E = [];
        let $;
        if (!this.options.isUseMultipleRangeRequest && this.options.onProgress) {
          const B = [];
          let W = 0;
          for (const q of d)
            q.kind === n.OperationKind.DOWNLOAD && (B.push(q.end - q.start), W += q.end - q.start);
          const F = {
            expectedByteCounts: B,
            grandTotal: W
          };
          $ = new l.ProgressDifferentialDownloadCallbackTransform(F, this.options.cancellationToken, this.options.onProgress), E.push($);
        }
        const S = new e.DigestTransform(this.blockAwareFileInfo.sha512);
        S.isValidateOnEnd = !1, E.push(S), h.on("finish", () => {
          h.close(() => {
            m.splice(1, 1);
            try {
              S.validate();
            } catch (B) {
              p(B);
              return;
            }
            y(void 0);
          });
        }), E.push(h);
        let _ = null;
        for (const B of E)
          B.on("error", p), _ == null ? _ = B : _ = _.pipe(B);
        const w = E[0];
        let R;
        if (this.options.isUseMultipleRangeRequest) {
          R = (0, s.executeTasksUsingMultipleRangeRequests)(this, d, w, g, p), R(0);
          return;
        }
        let P = 0, j = null;
        this.logger.info(`Differential download: ${this.options.newUrl}`);
        const M = this.createRequestOptions();
        M.redirect = "manual", R = (B) => {
          var W, F;
          if (B >= d.length) {
            this.fileMetadataBuffer != null && w.write(this.fileMetadataBuffer), w.end();
            return;
          }
          const q = d[B++];
          if (q.kind === n.OperationKind.COPY) {
            $ && $.beginFileCopy(), (0, r.copyData)(q, w, g, p, () => R(B));
            return;
          }
          const J = `bytes=${q.start}-${q.end - 1}`;
          M.headers.range = J, (F = (W = this.logger) === null || W === void 0 ? void 0 : W.debug) === null || F === void 0 || F.call(W, `download range: ${J}`), $ && $.beginRangeDownload();
          const H = this.httpExecutor.createRequest(M, (G) => {
            G.on("error", p), G.on("aborted", () => {
              p(new Error("response has been aborted by the server"));
            }), G.statusCode >= 400 && p((0, e.createHttpError)(G)), G.pipe(w, {
              end: !1
            }), G.once("end", () => {
              $ && $.endRangeDownload(), ++P === 100 ? (P = 0, setTimeout(() => R(B), 1e3)) : R(B);
            });
          });
          H.on("redirect", (G, Y, k) => {
            this.logger.info(`Redirect to ${i(k)}`), j = k, (0, e.configureRequestUrl)(new c.URL(j), M), H.followRedirect();
          }), this.httpExecutor.addErrorAndTimeoutHandlers(H, p), H.end();
        }, R(0);
      });
    }
    async readRemoteBytes(d, m) {
      const g = Buffer.allocUnsafe(m + 1 - d), v = this.createRequestOptions();
      v.headers.range = `bytes=${d}-${m}`;
      let h = 0;
      if (await this.request(v, (y) => {
        y.copy(g, h), h += y.length;
      }), h !== g.length)
        throw new Error(`Received data length ${h} is not equal to expected ${g.length}`);
      return g;
    }
    request(d, m) {
      return new Promise((g, v) => {
        const h = this.httpExecutor.createRequest(d, (y) => {
          (0, s.checkIsRangesSupported)(y, v) && (y.on("error", v), y.on("aborted", () => {
            v(new Error("response has been aborted by the server"));
          }), y.on("data", m), y.on("end", () => g()));
        });
        this.httpExecutor.addErrorAndTimeoutHandlers(h, v), h.end();
      });
    }
  };
  Pn.DifferentialDownloader = a;
  function u(f, d = " KB") {
    return new Intl.NumberFormat("en").format((f / 1024).toFixed(2)) + d;
  }
  function i(f) {
    const d = f.indexOf("?");
    return d < 0 ? f : f.substring(0, d);
  }
  return Pn;
}
var Dg;
function Jb() {
  if (Dg) return Rn;
  Dg = 1, Object.defineProperty(Rn, "__esModule", { value: !0 }), Rn.GenericDifferentialDownloader = void 0;
  const e = rv();
  let t = class extends e.DifferentialDownloader {
    download(r, c) {
      return this.doDownload(r, c);
    }
  };
  return Rn.GenericDifferentialDownloader = t, Rn;
}
var Wc = {}, kg;
function kr() {
  return kg || (kg = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.UpdaterSignal = e.UPDATE_DOWNLOADED = e.DOWNLOAD_PROGRESS = e.CancellationToken = void 0, e.addHandler = r;
    const t = nt();
    Object.defineProperty(e, "CancellationToken", { enumerable: !0, get: function() {
      return t.CancellationToken;
    } }), e.DOWNLOAD_PROGRESS = "download-progress", e.UPDATE_DOWNLOADED = "update-downloaded";
    class o {
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
    e.UpdaterSignal = o;
    function r(c, n, s) {
      c.on(n, s);
    }
  })(Wc)), Wc;
}
var Lg;
function kl() {
  if (Lg) return Pr;
  Lg = 1, Object.defineProperty(Pr, "__esModule", { value: !0 }), Pr.NoOpLogger = Pr.AppUpdater = void 0;
  const e = nt(), t = Yr, o = Gn, r = nl, c = /* @__PURE__ */ fr(), n = Rl(), s = pb(), l = Me, a = Q0(), u = Mb(), i = Vb(), f = Gb(), d = Z0(), m = Xb(), g = e0, v = Dr(), h = Jb(), y = kr();
  let p = class nv extends r.EventEmitter {
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
      this._logger = _ ?? new $();
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * test only
     * @private
     */
    set updateConfigPath(_) {
      this.clientPromise = null, this._appUpdateConfigPath = _, this.configOnDisk = new s.Lazy(() => this.loadUpdateConfig());
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
    constructor(_, w) {
      super(), this.autoDownload = !0, this.autoInstallOnAppQuit = !0, this.autoRunAppAfterInstall = !0, this.allowPrerelease = !1, this.fullChangelog = !1, this.allowDowngrade = !1, this.disableWebInstaller = !1, this.disableDifferentialDownload = !1, this.forceDevUpdateConfig = !1, this._channel = null, this.downloadedUpdateHelper = null, this.requestHeaders = null, this._logger = console, this.signals = new y.UpdaterSignal(this), this._appUpdateConfigPath = null, this._isUpdateSupported = (j) => this.checkIfUpdateSupported(j), this.clientPromise = null, this.stagingUserIdPromise = new s.Lazy(() => this.getOrCreateStagingUserId()), this.configOnDisk = new s.Lazy(() => this.loadUpdateConfig()), this.checkForUpdatesPromise = null, this.downloadPromise = null, this.updateInfoAndProvider = null, this._testOnlyOptions = null, this.on("error", (j) => {
        this._logger.error(`Error: ${j.stack || j.message}`);
      }), w == null ? (this.app = new i.ElectronAppAdapter(), this.httpExecutor = new f.ElectronHttpExecutor((j, M) => this.emit("login", j, M))) : (this.app = w, this.httpExecutor = null);
      const R = this.app.version, P = (0, a.parse)(R);
      if (P == null)
        throw (0, e.newError)(`App version is not a valid semver version: "${R}"`, "ERR_UPDATER_INVALID_VERSION");
      this.currentVersion = P, this.allowPrerelease = E(P), _ != null && (this.setFeedURL(_), typeof _ != "string" && _.requestHeaders && (this.requestHeaders = _.requestHeaders));
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
      const w = this.createProviderRuntimeOptions();
      let R;
      typeof _ == "string" ? R = new d.GenericProvider({ provider: "generic", url: _ }, this, {
        ...w,
        isUseMultipleRangeRequest: (0, m.isUrlProbablySupportMultiRangeRequests)(_)
      }) : R = (0, m.createClient)(_, this, w), this.clientPromise = Promise.resolve(R);
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
      const w = () => this.checkForUpdatesPromise = null;
      return this._logger.info("Checking for update"), _ = this.doCheckForUpdates().then((R) => (w(), R)).catch((R) => {
        throw w(), this.emit("error", R, `Cannot check for updates: ${(R.stack || R).toString()}`), R;
      }), this.checkForUpdatesPromise = _, _;
    }
    isUpdaterActive() {
      return this.app.isPackaged || this.forceDevUpdateConfig ? !0 : (this._logger.info("Skip checkForUpdates because application is not packed and dev update config is not forced"), !1);
    }
    // noinspection JSUnusedGlobalSymbols
    checkForUpdatesAndNotify(_) {
      return this.checkForUpdates().then((w) => w?.downloadPromise ? (w.downloadPromise.then(() => {
        const R = nv.formatDownloadNotification(w.updateInfo.version, this.app.name, _);
        new ur.Notification(R).show();
      }), w) : (this._logger.debug != null && this._logger.debug("checkForUpdatesAndNotify called, downloadPromise is null"), w));
    }
    static formatDownloadNotification(_, w, R) {
      return R == null && (R = {
        title: "A new update is ready to install",
        body: "{appName} version {version} has been downloaded and will be automatically installed on exit"
      }), R = {
        title: R.title.replace("{appName}", w).replace("{version}", _),
        body: R.body.replace("{appName}", w).replace("{version}", _)
      }, R;
    }
    async isStagingMatch(_) {
      const w = _.stagingPercentage;
      let R = w;
      if (R == null)
        return !0;
      if (R = parseInt(R, 10), isNaN(R))
        return this._logger.warn(`Staging percentage is NaN: ${w}`), !0;
      R = R / 100;
      const P = await this.stagingUserIdPromise.value, M = e.UUID.parse(P).readUInt32BE(12) / 4294967295;
      return this._logger.info(`Staging percentage: ${R}, percentage: ${M}, user id: ${P}`), M < R;
    }
    computeFinalHeaders(_) {
      return this.requestHeaders != null && Object.assign(_, this.requestHeaders), _;
    }
    async isUpdateAvailable(_) {
      const w = (0, a.parse)(_.version);
      if (w == null)
        throw (0, e.newError)(`This file could not be downloaded, or the latest version (from update server) does not have a valid semver version: "${_.version}"`, "ERR_UPDATER_INVALID_VERSION");
      const R = this.currentVersion;
      if ((0, a.eq)(w, R) || !await Promise.resolve(this.isUpdateSupported(_)) || !await this.isStagingMatch(_))
        return !1;
      const j = (0, a.gt)(w, R), M = (0, a.lt)(w, R);
      return j ? !0 : this.allowDowngrade && M;
    }
    checkIfUpdateSupported(_) {
      const w = _?.minimumSystemVersion, R = (0, o.release)();
      if (w)
        try {
          if ((0, a.lt)(R, w))
            return this._logger.info(`Current OS version ${R} is less than the minimum OS version required ${w} for version ${R}`), !1;
        } catch (P) {
          this._logger.warn(`Failed to compare current OS version(${R}) with minimum OS version(${w}): ${(P.message || P).toString()}`);
        }
      return !0;
    }
    async getUpdateInfoAndProvider() {
      await this.app.whenReady(), this.clientPromise == null && (this.clientPromise = this.configOnDisk.value.then((R) => (0, m.createClient)(R, this, this.createProviderRuntimeOptions())));
      const _ = await this.clientPromise, w = await this.stagingUserIdPromise.value;
      return _.setRequestHeaders(this.computeFinalHeaders({ "x-user-staging-id": w })), {
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
      const _ = await this.getUpdateInfoAndProvider(), w = _.info;
      if (!await this.isUpdateAvailable(w))
        return this._logger.info(`Update for version ${this.currentVersion.format()} is not available (latest version: ${w.version}, downgrade is ${this.allowDowngrade ? "allowed" : "disallowed"}).`), this.emit("update-not-available", w), {
          isUpdateAvailable: !1,
          versionInfo: w,
          updateInfo: w
        };
      this.updateInfoAndProvider = _, this.onUpdateAvailable(w);
      const R = new e.CancellationToken();
      return {
        isUpdateAvailable: !0,
        versionInfo: w,
        updateInfo: w,
        cancellationToken: R,
        downloadPromise: this.autoDownload ? this.downloadUpdate(R) : null
      };
    }
    onUpdateAvailable(_) {
      this._logger.info(`Found version ${_.version} (url: ${(0, e.asArray)(_.files).map((w) => w.url).join(", ")})`), this.emit("update-available", _);
    }
    /**
     * Start downloading update manually. You can use this method if `autoDownload` option is set to `false`.
     * @returns {Promise<Array<string>>} Paths to downloaded files.
     */
    downloadUpdate(_ = new e.CancellationToken()) {
      const w = this.updateInfoAndProvider;
      if (w == null) {
        const P = new Error("Please check update first");
        return this.dispatchError(P), Promise.reject(P);
      }
      if (this.downloadPromise != null)
        return this._logger.info("Downloading update (already in progress)"), this.downloadPromise;
      this._logger.info(`Downloading update from ${(0, e.asArray)(w.info.files).map((P) => P.url).join(", ")}`);
      const R = (P) => {
        if (!(P instanceof e.CancellationError))
          try {
            this.dispatchError(P);
          } catch (j) {
            this._logger.warn(`Cannot dispatch error event: ${j.stack || j}`);
          }
        return P;
      };
      return this.downloadPromise = this.doDownloadUpdate({
        updateInfoAndProvider: w,
        requestHeaders: this.computeRequestHeaders(w.provider),
        cancellationToken: _,
        disableWebInstaller: this.disableWebInstaller,
        disableDifferentialDownload: this.disableDifferentialDownload
      }).catch((P) => {
        throw R(P);
      }).finally(() => {
        this.downloadPromise = null;
      }), this.downloadPromise;
    }
    dispatchError(_) {
      this.emit("error", _, (_.stack || _).toString());
    }
    dispatchUpdateDownloaded(_) {
      this.emit(y.UPDATE_DOWNLOADED, _);
    }
    async loadUpdateConfig() {
      return this._appUpdateConfigPath == null && (this._appUpdateConfigPath = this.app.appUpdateConfigPath), (0, n.load)(await (0, c.readFile)(this._appUpdateConfigPath, "utf-8"));
    }
    computeRequestHeaders(_) {
      const w = _.fileExtraDownloadHeaders;
      if (w != null) {
        const R = this.requestHeaders;
        return R == null ? w : {
          ...w,
          ...R
        };
      }
      return this.computeFinalHeaders({ accept: "*/*" });
    }
    async getOrCreateStagingUserId() {
      const _ = l.join(this.app.userDataPath, ".updaterId");
      try {
        const R = await (0, c.readFile)(_, "utf-8");
        if (e.UUID.check(R))
          return R;
        this._logger.warn(`Staging user id file exists, but content was invalid: ${R}`);
      } catch (R) {
        R.code !== "ENOENT" && this._logger.warn(`Couldn't read staging user ID, creating a blank one: ${R}`);
      }
      const w = e.UUID.v5((0, t.randomBytes)(4096), e.UUID.OID);
      this._logger.info(`Generated new staging user ID: ${w}`);
      try {
        await (0, c.outputFile)(_, w);
      } catch (R) {
        this._logger.warn(`Couldn't write out staging user ID: ${R}`);
      }
      return w;
    }
    /** @internal */
    get isAddNoCacheQuery() {
      const _ = this.requestHeaders;
      if (_ == null)
        return !0;
      for (const w of Object.keys(_)) {
        const R = w.toLowerCase();
        if (R === "authorization" || R === "private-token")
          return !1;
      }
      return !0;
    }
    async getOrCreateDownloadHelper() {
      let _ = this.downloadedUpdateHelper;
      if (_ == null) {
        const w = (await this.configOnDisk.value).updaterCacheDirName, R = this._logger;
        w == null && R.error("updaterCacheDirName is not specified in app-update.yml Was app build using at least electron-builder 20.34.0?");
        const P = l.join(this.app.baseCachePath, w || this.app.name);
        R.debug != null && R.debug(`updater cache dir: ${P}`), _ = new u.DownloadedUpdateHelper(P), this.downloadedUpdateHelper = _;
      }
      return _;
    }
    async executeDownload(_) {
      const w = _.fileInfo, R = {
        headers: _.downloadUpdateOptions.requestHeaders,
        cancellationToken: _.downloadUpdateOptions.cancellationToken,
        sha2: w.info.sha2,
        sha512: w.info.sha512
      };
      this.listenerCount(y.DOWNLOAD_PROGRESS) > 0 && (R.onProgress = (D) => this.emit(y.DOWNLOAD_PROGRESS, D));
      const P = _.downloadUpdateOptions.updateInfoAndProvider.info, j = P.version, M = w.packageInfo;
      function B() {
        const D = decodeURIComponent(_.fileInfo.url.pathname);
        return D.endsWith(`.${_.fileExtension}`) ? l.basename(D) : _.fileInfo.info.url;
      }
      const W = await this.getOrCreateDownloadHelper(), F = W.cacheDirForPendingUpdate;
      await (0, c.mkdir)(F, { recursive: !0 });
      const q = B();
      let J = l.join(F, q);
      const H = M == null ? null : l.join(F, `package-${j}${l.extname(M.path) || ".7z"}`), G = async (D) => (await W.setDownloadedFile(J, H, P, w, q, D), await _.done({
        ...P,
        downloadedFile: J
      }), H == null ? [J] : [J, H]), Y = this._logger, k = await W.validateDownloadedPath(J, P, w, Y);
      if (k != null)
        return J = k, await G(!1);
      const I = async () => (await W.clear().catch(() => {
      }), await (0, c.unlink)(J).catch(() => {
      })), U = await (0, u.createTempUpdateFile)(`temp-${q}`, F, Y);
      try {
        await _.task(U, R, H, I), await (0, e.retry)(() => (0, c.rename)(U, J), 60, 500, 0, 0, (D) => D instanceof Error && /^EBUSY:/.test(D.message));
      } catch (D) {
        throw await I(), D instanceof e.CancellationError && (Y.info("cancelled"), this.emit("update-cancelled", P)), D;
      }
      return Y.info(`New version ${j} has been downloaded to ${J}`), await G(!0);
    }
    async differentialDownloadInstaller(_, w, R, P, j) {
      try {
        if (this._testOnlyOptions != null && !this._testOnlyOptions.isUseDifferentialDownload)
          return !0;
        const M = (0, v.blockmapFiles)(_.url, this.app.version, w.updateInfoAndProvider.info.version);
        this._logger.info(`Download block maps (old: "${M[0]}", new: ${M[1]})`);
        const B = async (q) => {
          const J = await this.httpExecutor.downloadToBuffer(q, {
            headers: w.requestHeaders,
            cancellationToken: w.cancellationToken
          });
          if (J == null || J.length === 0)
            throw new Error(`Blockmap "${q.href}" is empty`);
          try {
            return JSON.parse((0, g.gunzipSync)(J).toString());
          } catch (H) {
            throw new Error(`Cannot parse blockmap "${q.href}", error: ${H}`);
          }
        }, W = {
          newUrl: _.url,
          oldFile: l.join(this.downloadedUpdateHelper.cacheDir, j),
          logger: this._logger,
          newFile: R,
          isUseMultipleRangeRequest: P.isUseMultipleRangeRequest,
          requestHeaders: w.requestHeaders,
          cancellationToken: w.cancellationToken
        };
        this.listenerCount(y.DOWNLOAD_PROGRESS) > 0 && (W.onProgress = (q) => this.emit(y.DOWNLOAD_PROGRESS, q));
        const F = await Promise.all(M.map((q) => B(q)));
        return await new h.GenericDifferentialDownloader(_.info, this.httpExecutor, W).download(F[0], F[1]), !1;
      } catch (M) {
        if (this._logger.error(`Cannot download differentially, fallback to full download: ${M.stack || M}`), this._testOnlyOptions != null)
          throw M;
        return !0;
      }
    }
  };
  Pr.AppUpdater = p;
  function E(S) {
    const _ = (0, a.prerelease)(S);
    return _ != null && _.length > 0;
  }
  class $ {
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
  return Pr.NoOpLogger = $, Pr;
}
var Fg;
function nn() {
  if (Fg) return mn;
  Fg = 1, Object.defineProperty(mn, "__esModule", { value: !0 }), mn.BaseUpdater = void 0;
  const e = us, t = kl();
  let o = class extends t.AppUpdater {
    constructor(c, n) {
      super(c, n), this.quitAndInstallCalled = !1, this.quitHandlerAdded = !1;
    }
    quitAndInstall(c = !1, n = !1) {
      this._logger.info("Install on explicit quitAndInstall"), this.install(c, c ? n : this.autoRunAppAfterInstall) ? setImmediate(() => {
        ur.autoUpdater.emit("before-quit-for-update"), this.app.quit();
      }) : this.quitAndInstallCalled = !1;
    }
    executeDownload(c) {
      return super.executeDownload({
        ...c,
        done: (n) => (this.dispatchUpdateDownloaded(n), this.addQuitHandler(), Promise.resolve())
      });
    }
    get installerPath() {
      return this.downloadedUpdateHelper == null ? null : this.downloadedUpdateHelper.file;
    }
    // must be sync (because quit even handler is not async)
    install(c = !1, n = !1) {
      if (this.quitAndInstallCalled)
        return this._logger.warn("install call ignored: quitAndInstallCalled is set to true"), !1;
      const s = this.downloadedUpdateHelper, l = this.installerPath, a = s == null ? null : s.downloadedFileInfo;
      if (l == null || a == null)
        return this.dispatchError(new Error("No valid update available, can't quit and install")), !1;
      this.quitAndInstallCalled = !0;
      try {
        return this._logger.info(`Install: isSilent: ${c}, isForceRunAfter: ${n}`), this.doInstall({
          isSilent: c,
          isForceRunAfter: n,
          isAdminRightsRequired: a.isAdminRightsRequired
        });
      } catch (u) {
        return this.dispatchError(u), !1;
      }
    }
    addQuitHandler() {
      this.quitHandlerAdded || !this.autoInstallOnAppQuit || (this.quitHandlerAdded = !0, this.app.onQuit((c) => {
        if (this.quitAndInstallCalled) {
          this._logger.info("Update installer has already been triggered. Quitting application.");
          return;
        }
        if (!this.autoInstallOnAppQuit) {
          this._logger.info("Update will not be installed on quit because autoInstallOnAppQuit is set to false.");
          return;
        }
        if (c !== 0) {
          this._logger.info(`Update will be not installed on quit because application is quitting with exit code ${c}`);
          return;
        }
        this._logger.info("Auto install update on quit"), this.install(!0, !1);
      }));
    }
    wrapSudo() {
      const { name: c } = this.app, n = `"${c} would like to update"`, s = this.spawnSyncLog("which gksudo || which kdesudo || which pkexec || which beesu"), l = [s];
      return /kdesudo/i.test(s) ? (l.push("--comment", n), l.push("-c")) : /gksudo/i.test(s) ? l.push("--message", n) : /pkexec/i.test(s) && l.push("--disable-internal-agent"), l.join(" ");
    }
    spawnSyncLog(c, n = [], s = {}) {
      this._logger.info(`Executing: ${c} with args: ${n}`);
      const l = (0, e.spawnSync)(c, n, {
        env: { ...process.env, ...s },
        encoding: "utf-8",
        shell: !0
      }), { error: a, status: u, stdout: i, stderr: f } = l;
      if (a != null)
        throw this._logger.error(f), a;
      if (u != null && u !== 0)
        throw this._logger.error(f), new Error(`Command ${c} exited with code ${u}`);
      return i.trim();
    }
    /**
     * This handles both node 8 and node 10 way of emitting error when spawning a process
     *   - node 8: Throws the error
     *   - node 10: Emit the error(Need to listen with on)
     */
    // https://github.com/electron-userland/electron-builder/issues/1129
    // Node 8 sends errors: https://nodejs.org/dist/latest-v8.x/docs/api/errors.html#errors_common_system_errors
    async spawnLog(c, n = [], s = void 0, l = "ignore") {
      return this._logger.info(`Executing: ${c} with args: ${n}`), new Promise((a, u) => {
        try {
          const i = { stdio: l, env: s, detached: !0 }, f = (0, e.spawn)(c, n, i);
          f.on("error", (d) => {
            u(d);
          }), f.unref(), f.pid !== void 0 && a(!0);
        } catch (i) {
          u(i);
        }
      });
    }
  };
  return mn.BaseUpdater = o, mn;
}
var An = {}, In = {}, qg;
function iv() {
  if (qg) return In;
  qg = 1, Object.defineProperty(In, "__esModule", { value: !0 }), In.FileWithEmbeddedBlockMapDifferentialDownloader = void 0;
  const e = /* @__PURE__ */ fr(), t = rv(), o = e0;
  let r = class extends t.DifferentialDownloader {
    async download() {
      const l = this.blockAwareFileInfo, a = l.size, u = a - (l.blockMapSize + 4);
      this.fileMetadataBuffer = await this.readRemoteBytes(u, a - 1);
      const i = c(this.fileMetadataBuffer.slice(0, this.fileMetadataBuffer.length - 4));
      await this.doDownload(await n(this.options.oldFile), i);
    }
  };
  In.FileWithEmbeddedBlockMapDifferentialDownloader = r;
  function c(s) {
    return JSON.parse((0, o.inflateRawSync)(s).toString());
  }
  async function n(s) {
    const l = await (0, e.open)(s, "r");
    try {
      const a = (await (0, e.fstat)(l)).size, u = Buffer.allocUnsafe(4);
      await (0, e.read)(l, u, 0, u.length, a - u.length);
      const i = Buffer.allocUnsafe(u.readUInt32BE(0));
      return await (0, e.read)(l, i, 0, i.length, a - u.length - i.length), await (0, e.close)(l), c(i);
    } catch (a) {
      throw await (0, e.close)(l), a;
    }
  }
  return In;
}
var Ug;
function jg() {
  if (Ug) return An;
  Ug = 1, Object.defineProperty(An, "__esModule", { value: !0 }), An.AppImageUpdater = void 0;
  const e = nt(), t = us, o = /* @__PURE__ */ fr(), r = Ct, c = Me, n = nn(), s = iv(), l = $t(), a = kr();
  let u = class extends n.BaseUpdater {
    constructor(f, d) {
      super(f, d);
    }
    isUpdaterActive() {
      return process.env.APPIMAGE == null ? (process.env.SNAP == null ? this._logger.warn("APPIMAGE env is not defined, current application is not an AppImage") : this._logger.info("SNAP env is defined, updater is disabled"), !1) : super.isUpdaterActive();
    }
    /*** @private */
    doDownloadUpdate(f) {
      const d = f.updateInfoAndProvider.provider, m = (0, l.findFile)(d.resolveFiles(f.updateInfoAndProvider.info), "AppImage", ["rpm", "deb", "pacman"]);
      return this.executeDownload({
        fileExtension: "AppImage",
        fileInfo: m,
        downloadUpdateOptions: f,
        task: async (g, v) => {
          const h = process.env.APPIMAGE;
          if (h == null)
            throw (0, e.newError)("APPIMAGE env is not defined", "ERR_UPDATER_OLD_FILE_NOT_FOUND");
          (f.disableDifferentialDownload || await this.downloadDifferential(m, h, g, d, f)) && await this.httpExecutor.download(m.url, g, v), await (0, o.chmod)(g, 493);
        }
      });
    }
    async downloadDifferential(f, d, m, g, v) {
      try {
        const h = {
          newUrl: f.url,
          oldFile: d,
          logger: this._logger,
          newFile: m,
          isUseMultipleRangeRequest: g.isUseMultipleRangeRequest,
          requestHeaders: v.requestHeaders,
          cancellationToken: v.cancellationToken
        };
        return this.listenerCount(a.DOWNLOAD_PROGRESS) > 0 && (h.onProgress = (y) => this.emit(a.DOWNLOAD_PROGRESS, y)), await new s.FileWithEmbeddedBlockMapDifferentialDownloader(f.info, this.httpExecutor, h).download(), !1;
      } catch (h) {
        return this._logger.error(`Cannot download differentially, fallback to full download: ${h.stack || h}`), process.platform === "linux";
      }
    }
    doInstall(f) {
      const d = process.env.APPIMAGE;
      if (d == null)
        throw (0, e.newError)("APPIMAGE env is not defined", "ERR_UPDATER_OLD_FILE_NOT_FOUND");
      (0, r.unlinkSync)(d);
      let m;
      const g = c.basename(d), v = this.installerPath;
      if (v == null)
        return this.dispatchError(new Error("No valid update available, can't quit and install")), !1;
      c.basename(v) === g || !/\d+\.\d+\.\d+/.test(g) ? m = d : m = c.join(c.dirname(d), c.basename(v)), (0, t.execFileSync)("mv", ["-f", v, m]), m !== d && this.emit("appimage-filename-updated", m);
      const h = {
        ...process.env,
        APPIMAGE_SILENT_INSTALL: "true"
      };
      return f.isForceRunAfter ? this.spawnLog(m, [], h) : (h.APPIMAGE_EXIT_AFTER_INSTALL = "true", (0, t.execFileSync)(m, [], { env: h })), !0;
    }
  };
  return An.AppImageUpdater = u, An;
}
var Cn = {}, Mg;
function xg() {
  if (Mg) return Cn;
  Mg = 1, Object.defineProperty(Cn, "__esModule", { value: !0 }), Cn.DebUpdater = void 0;
  const e = nn(), t = $t(), o = kr();
  let r = class extends e.BaseUpdater {
    constructor(n, s) {
      super(n, s);
    }
    /*** @private */
    doDownloadUpdate(n) {
      const s = n.updateInfoAndProvider.provider, l = (0, t.findFile)(s.resolveFiles(n.updateInfoAndProvider.info), "deb", ["AppImage", "rpm", "pacman"]);
      return this.executeDownload({
        fileExtension: "deb",
        fileInfo: l,
        downloadUpdateOptions: n,
        task: async (a, u) => {
          this.listenerCount(o.DOWNLOAD_PROGRESS) > 0 && (u.onProgress = (i) => this.emit(o.DOWNLOAD_PROGRESS, i)), await this.httpExecutor.download(l.url, a, u);
        }
      });
    }
    get installerPath() {
      var n, s;
      return (s = (n = super.installerPath) === null || n === void 0 ? void 0 : n.replace(/ /g, "\\ ")) !== null && s !== void 0 ? s : null;
    }
    doInstall(n) {
      const s = this.wrapSudo(), l = /pkexec/i.test(s) ? "" : '"', a = this.installerPath;
      if (a == null)
        return this.dispatchError(new Error("No valid update available, can't quit and install")), !1;
      const u = ["dpkg", "-i", a, "||", "apt-get", "install", "-f", "-y"];
      return this.spawnSyncLog(s, [`${l}/bin/bash`, "-c", `'${u.join(" ")}'${l}`]), n.isForceRunAfter && this.app.relaunch(), !0;
    }
  };
  return Cn.DebUpdater = r, Cn;
}
var Dn = {}, Vg;
function Gg() {
  if (Vg) return Dn;
  Vg = 1, Object.defineProperty(Dn, "__esModule", { value: !0 }), Dn.PacmanUpdater = void 0;
  const e = nn(), t = kr(), o = $t();
  let r = class extends e.BaseUpdater {
    constructor(n, s) {
      super(n, s);
    }
    /*** @private */
    doDownloadUpdate(n) {
      const s = n.updateInfoAndProvider.provider, l = (0, o.findFile)(s.resolveFiles(n.updateInfoAndProvider.info), "pacman", ["AppImage", "deb", "rpm"]);
      return this.executeDownload({
        fileExtension: "pacman",
        fileInfo: l,
        downloadUpdateOptions: n,
        task: async (a, u) => {
          this.listenerCount(t.DOWNLOAD_PROGRESS) > 0 && (u.onProgress = (i) => this.emit(t.DOWNLOAD_PROGRESS, i)), await this.httpExecutor.download(l.url, a, u);
        }
      });
    }
    get installerPath() {
      var n, s;
      return (s = (n = super.installerPath) === null || n === void 0 ? void 0 : n.replace(/ /g, "\\ ")) !== null && s !== void 0 ? s : null;
    }
    doInstall(n) {
      const s = this.wrapSudo(), l = /pkexec/i.test(s) ? "" : '"', a = this.installerPath;
      if (a == null)
        return this.dispatchError(new Error("No valid update available, can't quit and install")), !1;
      const u = ["pacman", "-U", "--noconfirm", a];
      return this.spawnSyncLog(s, [`${l}/bin/bash`, "-c", `'${u.join(" ")}'${l}`]), n.isForceRunAfter && this.app.relaunch(), !0;
    }
  };
  return Dn.PacmanUpdater = r, Dn;
}
var kn = {}, Hg;
function Bg() {
  if (Hg) return kn;
  Hg = 1, Object.defineProperty(kn, "__esModule", { value: !0 }), kn.RpmUpdater = void 0;
  const e = nn(), t = kr(), o = $t();
  let r = class extends e.BaseUpdater {
    constructor(n, s) {
      super(n, s);
    }
    /*** @private */
    doDownloadUpdate(n) {
      const s = n.updateInfoAndProvider.provider, l = (0, o.findFile)(s.resolveFiles(n.updateInfoAndProvider.info), "rpm", ["AppImage", "deb", "pacman"]);
      return this.executeDownload({
        fileExtension: "rpm",
        fileInfo: l,
        downloadUpdateOptions: n,
        task: async (a, u) => {
          this.listenerCount(t.DOWNLOAD_PROGRESS) > 0 && (u.onProgress = (i) => this.emit(t.DOWNLOAD_PROGRESS, i)), await this.httpExecutor.download(l.url, a, u);
        }
      });
    }
    get installerPath() {
      var n, s;
      return (s = (n = super.installerPath) === null || n === void 0 ? void 0 : n.replace(/ /g, "\\ ")) !== null && s !== void 0 ? s : null;
    }
    doInstall(n) {
      const s = this.wrapSudo(), l = /pkexec/i.test(s) ? "" : '"', a = this.spawnSyncLog("which zypper"), u = this.installerPath;
      if (u == null)
        return this.dispatchError(new Error("No valid update available, can't quit and install")), !1;
      let i;
      return a ? i = [a, "--no-refresh", "install", "--allow-unsigned-rpm", "-y", "-f", u] : i = [this.spawnSyncLog("which dnf || which yum"), "-y", "install", u], this.spawnSyncLog(s, [`${l}/bin/bash`, "-c", `'${i.join(" ")}'${l}`]), n.isForceRunAfter && this.app.relaunch(), !0;
    }
  };
  return kn.RpmUpdater = r, kn;
}
var Ln = {}, zg;
function Kg() {
  if (zg) return Ln;
  zg = 1, Object.defineProperty(Ln, "__esModule", { value: !0 }), Ln.MacUpdater = void 0;
  const e = nt(), t = /* @__PURE__ */ fr(), o = Ct, r = Me, c = s_, n = kl(), s = $t(), l = us, a = Yr;
  let u = class extends n.AppUpdater {
    constructor(f, d) {
      super(f, d), this.nativeUpdater = ur.autoUpdater, this.squirrelDownloadedUpdate = !1, this.nativeUpdater.on("error", (m) => {
        this._logger.warn(m), this.emit("error", m);
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
      let d = f.updateInfoAndProvider.provider.resolveFiles(f.updateInfoAndProvider.info);
      const m = this._logger, g = "sysctl.proc_translated";
      let v = !1;
      try {
        this.debug("Checking for macOS Rosetta environment"), v = (0, l.execFileSync)("sysctl", [g], { encoding: "utf8" }).includes(`${g}: 1`), m.info(`Checked for macOS Rosetta environment (isRosetta=${v})`);
      } catch (S) {
        m.warn(`sysctl shell command to check for macOS Rosetta environment failed: ${S}`);
      }
      let h = !1;
      try {
        this.debug("Checking for arm64 in uname");
        const _ = (0, l.execFileSync)("uname", ["-a"], { encoding: "utf8" }).includes("ARM");
        m.info(`Checked 'uname -a': arm64=${_}`), h = h || _;
      } catch (S) {
        m.warn(`uname shell command to check for arm64 failed: ${S}`);
      }
      h = h || process.arch === "arm64" || v;
      const y = (S) => {
        var _;
        return S.url.pathname.includes("arm64") || ((_ = S.info.url) === null || _ === void 0 ? void 0 : _.includes("arm64"));
      };
      h && d.some(y) ? d = d.filter((S) => h === y(S)) : d = d.filter((S) => !y(S));
      const p = (0, s.findFile)(d, "zip", ["pkg", "dmg"]);
      if (p == null)
        throw (0, e.newError)(`ZIP file not provided: ${(0, e.safeStringifyJson)(d)}`, "ERR_UPDATER_ZIP_FILE_NOT_FOUND");
      const E = f.updateInfoAndProvider.provider, $ = "update.zip";
      return this.executeDownload({
        fileExtension: "zip",
        fileInfo: p,
        downloadUpdateOptions: f,
        task: async (S, _) => {
          const w = r.join(this.downloadedUpdateHelper.cacheDir, $), R = () => (0, t.pathExistsSync)(w) ? !f.disableDifferentialDownload : (m.info("Unable to locate previous update.zip for differential download (is this first install?), falling back to full download"), !1);
          let P = !0;
          R() && (P = await this.differentialDownloadInstaller(p, f, S, E, $)), P && await this.httpExecutor.download(p.url, S, _);
        },
        done: async (S) => {
          if (!f.disableDifferentialDownload)
            try {
              const _ = r.join(this.downloadedUpdateHelper.cacheDir, $);
              await (0, t.copyFile)(S.downloadedFile, _);
            } catch (_) {
              this._logger.warn(`Unable to copy file for caching for future differential downloads: ${_.message}`);
            }
          return this.updateDownloaded(p, S);
        }
      });
    }
    async updateDownloaded(f, d) {
      var m;
      const g = d.downloadedFile, v = (m = f.info.size) !== null && m !== void 0 ? m : (await (0, t.stat)(g)).size, h = this._logger, y = `fileToProxy=${f.url.href}`;
      this.closeServerIfExists(), this.debug(`Creating proxy server for native Squirrel.Mac (${y})`), this.server = (0, c.createServer)(), this.debug(`Proxy server for native Squirrel.Mac is created (${y})`), this.server.on("close", () => {
        h.info(`Proxy server for native Squirrel.Mac is closed (${y})`);
      });
      const p = (E) => {
        const $ = E.address();
        return typeof $ == "string" ? $ : `http://127.0.0.1:${$?.port}`;
      };
      return await new Promise((E, $) => {
        const S = (0, a.randomBytes)(64).toString("base64").replace(/\//g, "_").replace(/\+/g, "-"), _ = Buffer.from(`autoupdater:${S}`, "ascii"), w = `/${(0, a.randomBytes)(64).toString("hex")}.zip`;
        this.server.on("request", (R, P) => {
          const j = R.url;
          if (h.info(`${j} requested`), j === "/") {
            if (!R.headers.authorization || R.headers.authorization.indexOf("Basic ") === -1) {
              P.statusCode = 401, P.statusMessage = "Invalid Authentication Credentials", P.end(), h.warn("No authenthication info");
              return;
            }
            const W = R.headers.authorization.split(" ")[1], F = Buffer.from(W, "base64").toString("ascii"), [q, J] = F.split(":");
            if (q !== "autoupdater" || J !== S) {
              P.statusCode = 401, P.statusMessage = "Invalid Authentication Credentials", P.end(), h.warn("Invalid authenthication credentials");
              return;
            }
            const H = Buffer.from(`{ "url": "${p(this.server)}${w}" }`);
            P.writeHead(200, { "Content-Type": "application/json", "Content-Length": H.length }), P.end(H);
            return;
          }
          if (!j.startsWith(w)) {
            h.warn(`${j} requested, but not supported`), P.writeHead(404), P.end();
            return;
          }
          h.info(`${w} requested by Squirrel.Mac, pipe ${g}`);
          let M = !1;
          P.on("finish", () => {
            M || (this.nativeUpdater.removeListener("error", $), E([]));
          });
          const B = (0, o.createReadStream)(g);
          B.on("error", (W) => {
            try {
              P.end();
            } catch (F) {
              h.warn(`cannot end response: ${F}`);
            }
            M = !0, this.nativeUpdater.removeListener("error", $), $(new Error(`Cannot pipe "${g}": ${W}`));
          }), P.writeHead(200, {
            "Content-Type": "application/zip",
            "Content-Length": v
          }), B.pipe(P);
        }), this.debug(`Proxy server for native Squirrel.Mac is starting to listen (${y})`), this.server.listen(0, "127.0.0.1", () => {
          this.debug(`Proxy server for native Squirrel.Mac is listening (address=${p(this.server)}, ${y})`), this.nativeUpdater.setFeedURL({
            url: p(this.server),
            headers: {
              "Cache-Control": "no-cache",
              Authorization: `Basic ${_.toString("base64")}`
            }
          }), this.dispatchUpdateDownloaded(d), this.autoInstallOnAppQuit ? (this.nativeUpdater.once("error", $), this.nativeUpdater.checkForUpdates()) : E([]);
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
  return Ln.MacUpdater = u, Ln;
}
var Fn = {}, es = {}, Xg;
function Qb() {
  if (Xg) return es;
  Xg = 1, Object.defineProperty(es, "__esModule", { value: !0 }), es.verifySignature = c;
  const e = nt(), t = us, o = Gn, r = Me;
  function c(a, u, i) {
    return new Promise((f, d) => {
      const m = u.replace(/'/g, "''");
      i.info(`Verifying signature ${m}`), (0, t.execFile)('set "PSModulePath=" & chcp 65001 >NUL & powershell.exe', ["-NoProfile", "-NonInteractive", "-InputFormat", "None", "-Command", `"Get-AuthenticodeSignature -LiteralPath '${m}' | ConvertTo-Json -Compress"`], {
        shell: !0,
        timeout: 20 * 1e3
      }, (g, v, h) => {
        var y;
        try {
          if (g != null || h) {
            s(i, g, h, d), f(null);
            return;
          }
          const p = n(v);
          if (p.Status === 0) {
            try {
              const _ = r.normalize(p.Path), w = r.normalize(u);
              if (i.info(`LiteralPath: ${_}. Update Path: ${w}`), _ !== w) {
                s(i, new Error(`LiteralPath of ${_} is different than ${w}`), h, d), f(null);
                return;
              }
            } catch (_) {
              i.warn(`Unable to verify LiteralPath of update asset due to missing data.Path. Skipping this step of validation. Message: ${(y = _.message) !== null && y !== void 0 ? y : _.stack}`);
            }
            const $ = (0, e.parseDn)(p.SignerCertificate.Subject);
            let S = !1;
            for (const _ of a) {
              const w = (0, e.parseDn)(_);
              if (w.size ? S = Array.from(w.keys()).every((P) => w.get(P) === $.get(P)) : _ === $.get("CN") && (i.warn(`Signature validated using only CN ${_}. Please add your full Distinguished Name (DN) to publisherNames configuration`), S = !0), S) {
                f(null);
                return;
              }
            }
          }
          const E = `publisherNames: ${a.join(" | ")}, raw info: ` + JSON.stringify(p, ($, S) => $ === "RawData" ? void 0 : S, 2);
          i.warn(`Sign verification failed, installer signed with incorrect certificate: ${E}`), f(E);
        } catch (p) {
          s(i, p, null, d), f(null);
          return;
        }
      });
    });
  }
  function n(a) {
    const u = JSON.parse(a);
    delete u.PrivateKey, delete u.IsOSBinary, delete u.SignatureType;
    const i = u.SignerCertificate;
    return i != null && (delete i.Archived, delete i.Extensions, delete i.Handle, delete i.HasPrivateKey, delete i.SubjectName), u;
  }
  function s(a, u, i, f) {
    if (l()) {
      a.warn(`Cannot execute Get-AuthenticodeSignature: ${u || i}. Ignoring signature validation due to unsupported powershell version. Please upgrade to powershell 3 or higher.`);
      return;
    }
    try {
      (0, t.execFileSync)("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", "ConvertTo-Json test"], { timeout: 10 * 1e3 });
    } catch (d) {
      a.warn(`Cannot execute ConvertTo-Json: ${d.message}. Ignoring signature validation due to unsupported powershell version. Please upgrade to powershell 3 or higher.`);
      return;
    }
    u != null && f(u), i && f(new Error(`Cannot execute Get-AuthenticodeSignature, stderr: ${i}. Failing signature validation due to unknown stderr.`));
  }
  function l() {
    const a = o.release();
    return a.startsWith("6.") && !a.startsWith("6.3");
  }
  return es;
}
var Wg;
function Yg() {
  if (Wg) return Fn;
  Wg = 1, Object.defineProperty(Fn, "__esModule", { value: !0 }), Fn.NsisUpdater = void 0;
  const e = nt(), t = Me, o = nn(), r = iv(), c = kr(), n = $t(), s = /* @__PURE__ */ fr(), l = Qb(), a = Jr;
  let u = class extends o.BaseUpdater {
    constructor(f, d) {
      super(f, d), this._verifyUpdateCodeSignature = (m, g) => (0, l.verifySignature)(m, g, this._logger);
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
      const d = f.updateInfoAndProvider.provider, m = (0, n.findFile)(d.resolveFiles(f.updateInfoAndProvider.info), "exe");
      return this.executeDownload({
        fileExtension: "exe",
        downloadUpdateOptions: f,
        fileInfo: m,
        task: async (g, v, h, y) => {
          const p = m.packageInfo, E = p != null && h != null;
          if (E && f.disableWebInstaller)
            throw (0, e.newError)(`Unable to download new version ${f.updateInfoAndProvider.info.version}. Web Installers are disabled`, "ERR_UPDATER_WEB_INSTALLER_DISABLED");
          !E && !f.disableWebInstaller && this._logger.warn("disableWebInstaller is set to false, you should set it to true if you do not plan on using a web installer. This will default to true in a future version."), (E || f.disableDifferentialDownload || await this.differentialDownloadInstaller(m, f, g, d, e.CURRENT_APP_INSTALLER_FILE_NAME)) && await this.httpExecutor.download(m.url, g, v);
          const $ = await this.verifySignature(g);
          if ($ != null)
            throw await y(), (0, e.newError)(`New version ${f.updateInfoAndProvider.info.version} is not signed by the application owner: ${$}`, "ERR_UPDATER_INVALID_SIGNATURE");
          if (E && await this.differentialDownloadWebPackage(f, p, h, d))
            try {
              await this.httpExecutor.download(new a.URL(p.path), h, {
                headers: f.requestHeaders,
                cancellationToken: f.cancellationToken,
                sha512: p.sha512
              });
            } catch (S) {
              try {
                await (0, s.unlink)(h);
              } catch {
              }
              throw S;
            }
        }
      });
    }
    // $certificateInfo = (Get-AuthenticodeSignature 'xxx\yyy.exe'
    // | where {$_.Status.Equals([System.Management.Automation.SignatureStatus]::Valid) -and $_.SignerCertificate.Subject.Contains("CN=siemens.com")})
    // | Out-String ; if ($certificateInfo) { exit 0 } else { exit 1 }
    async verifySignature(f) {
      let d;
      try {
        if (d = (await this.configOnDisk.value).publisherName, d == null)
          return null;
      } catch (m) {
        if (m.code === "ENOENT")
          return null;
        throw m;
      }
      return await this._verifyUpdateCodeSignature(Array.isArray(d) ? d : [d], f);
    }
    doInstall(f) {
      const d = this.installerPath;
      if (d == null)
        return this.dispatchError(new Error("No valid update available, can't quit and install")), !1;
      const m = ["--updated"];
      f.isSilent && m.push("/S"), f.isForceRunAfter && m.push("--force-run"), this.installDirectory && m.push(`/D=${this.installDirectory}`);
      const g = this.downloadedUpdateHelper == null ? null : this.downloadedUpdateHelper.packageFile;
      g != null && m.push(`--package-file=${g}`);
      const v = () => {
        this.spawnLog(t.join(process.resourcesPath, "elevate.exe"), [d].concat(m)).catch((h) => this.dispatchError(h));
      };
      return f.isAdminRightsRequired ? (this._logger.info("isAdminRightsRequired is set to true, run installer using elevate.exe"), v(), !0) : (this.spawnLog(d, m).catch((h) => {
        const y = h.code;
        this._logger.info(`Cannot run installer: error code: ${y}, error message: "${h.message}", will be executed again using elevate if EACCES, and will try to use electron.shell.openItem if ENOENT`), y === "UNKNOWN" || y === "EACCES" ? v() : y === "ENOENT" ? ur.shell.openPath(d).catch((p) => this.dispatchError(p)) : this.dispatchError(h);
      }), !0);
    }
    async differentialDownloadWebPackage(f, d, m, g) {
      if (d.blockMapSize == null)
        return !0;
      try {
        const v = {
          newUrl: new a.URL(d.path),
          oldFile: t.join(this.downloadedUpdateHelper.cacheDir, e.CURRENT_APP_PACKAGE_FILE_NAME),
          logger: this._logger,
          newFile: m,
          requestHeaders: this.requestHeaders,
          isUseMultipleRangeRequest: g.isUseMultipleRangeRequest,
          cancellationToken: f.cancellationToken
        };
        this.listenerCount(c.DOWNLOAD_PROGRESS) > 0 && (v.onProgress = (h) => this.emit(c.DOWNLOAD_PROGRESS, h)), await new r.FileWithEmbeddedBlockMapDifferentialDownloader(d, this.httpExecutor, v).download();
      } catch (v) {
        return this._logger.error(`Cannot download differentially, fallback to full download: ${v.stack || v}`), process.platform === "win32";
      }
      return !1;
    }
  };
  return Fn.NsisUpdater = u, Fn;
}
var Jg;
function Zb() {
  return Jg || (Jg = 1, (function(e) {
    var t = Rr && Rr.__createBinding || (Object.create ? (function(h, y, p, E) {
      E === void 0 && (E = p);
      var $ = Object.getOwnPropertyDescriptor(y, p);
      (!$ || ("get" in $ ? !y.__esModule : $.writable || $.configurable)) && ($ = { enumerable: !0, get: function() {
        return y[p];
      } }), Object.defineProperty(h, E, $);
    }) : (function(h, y, p, E) {
      E === void 0 && (E = p), h[E] = y[p];
    })), o = Rr && Rr.__exportStar || function(h, y) {
      for (var p in h) p !== "default" && !Object.prototype.hasOwnProperty.call(y, p) && t(y, h, p);
    };
    Object.defineProperty(e, "__esModule", { value: !0 }), e.NsisUpdater = e.MacUpdater = e.RpmUpdater = e.PacmanUpdater = e.DebUpdater = e.AppImageUpdater = e.Provider = e.NoOpLogger = e.AppUpdater = e.BaseUpdater = void 0;
    const r = /* @__PURE__ */ fr(), c = Me;
    var n = nn();
    Object.defineProperty(e, "BaseUpdater", { enumerable: !0, get: function() {
      return n.BaseUpdater;
    } });
    var s = kl();
    Object.defineProperty(e, "AppUpdater", { enumerable: !0, get: function() {
      return s.AppUpdater;
    } }), Object.defineProperty(e, "NoOpLogger", { enumerable: !0, get: function() {
      return s.NoOpLogger;
    } });
    var l = $t();
    Object.defineProperty(e, "Provider", { enumerable: !0, get: function() {
      return l.Provider;
    } });
    var a = jg();
    Object.defineProperty(e, "AppImageUpdater", { enumerable: !0, get: function() {
      return a.AppImageUpdater;
    } });
    var u = xg();
    Object.defineProperty(e, "DebUpdater", { enumerable: !0, get: function() {
      return u.DebUpdater;
    } });
    var i = Gg();
    Object.defineProperty(e, "PacmanUpdater", { enumerable: !0, get: function() {
      return i.PacmanUpdater;
    } });
    var f = Bg();
    Object.defineProperty(e, "RpmUpdater", { enumerable: !0, get: function() {
      return f.RpmUpdater;
    } });
    var d = Kg();
    Object.defineProperty(e, "MacUpdater", { enumerable: !0, get: function() {
      return d.MacUpdater;
    } });
    var m = Yg();
    Object.defineProperty(e, "NsisUpdater", { enumerable: !0, get: function() {
      return m.NsisUpdater;
    } }), o(kr(), e);
    let g;
    function v() {
      if (process.platform === "win32")
        g = new (Yg()).NsisUpdater();
      else if (process.platform === "darwin")
        g = new (Kg()).MacUpdater();
      else {
        g = new (jg()).AppImageUpdater();
        try {
          const h = c.join(process.resourcesPath, "package-type");
          if (!(0, r.existsSync)(h))
            return g;
          console.info("Checking for beta autoupdate feature for deb/rpm distributions");
          const y = (0, r.readFileSync)(h).toString().trim();
          switch (console.info("Found package-type:", y), y) {
            case "deb":
              g = new (xg()).DebUpdater();
              break;
            case "rpm":
              g = new (Bg()).RpmUpdater();
              break;
            case "pacman":
              g = new (Gg()).PacmanUpdater();
              break;
            default:
              break;
          }
        } catch (h) {
          console.warn("Unable to detect 'package-type' for autoUpdater (beta rpm/deb support). If you'd like to expand support, please consider contributing to electron-builder", h.message);
        }
      }
      return g;
    }
    Object.defineProperty(e, "autoUpdater", {
      enumerable: !0,
      get: () => g || v()
    });
  })(Rr)), Rr;
}
var ft = Zb();
let or = null, Xr = { status: "idle" };
function Yt(e) {
  Xr = { ...Xr, ...e }, eT();
}
function eT() {
  or && !or.isDestroyed() && or.webContents.send("auto-update:state", Xr);
}
function tT(e) {
  or = e, ft.autoUpdater.autoDownload = !1, ft.autoUpdater.autoInstallOnAppQuit = !0, ft.autoUpdater.autoRunAppAfterInstall = !0, ft.autoUpdater.allowPrerelease = !1, ft.autoUpdater.logger = {
    info: (t) => console.log("[AutoUpdater]", t),
    warn: (t) => console.warn("[AutoUpdater]", t),
    error: (t) => console.error("[AutoUpdater]", t),
    debug: (t) => console.log("[AutoUpdater DEBUG]", t)
  }, ft.autoUpdater.on("checking-for-update", () => {
    console.log("[AutoUpdater] Checking for updates..."), Yt({ status: "checking" });
  }), ft.autoUpdater.on("update-available", (t) => {
    console.log("[AutoUpdater] Update available:", t.version), Yt({
      status: "available",
      version: t.version,
      releaseNotes: typeof t.releaseNotes == "string" ? t.releaseNotes : Array.isArray(t.releaseNotes) ? t.releaseNotes.map((o) => o.note).join(`
`) : void 0
    });
  }), ft.autoUpdater.on("update-not-available", (t) => {
    console.log("[AutoUpdater] No updates available. Current:", t.version), Yt({
      status: "not-available",
      version: t.version
    });
  }), ft.autoUpdater.on("download-progress", (t) => {
    console.log(`[AutoUpdater] Download progress: ${t.percent.toFixed(1)}%`), Yt({
      status: "downloading",
      progress: t.percent,
      bytesPerSecond: t.bytesPerSecond,
      downloadedBytes: t.transferred,
      totalBytes: t.total
    });
  }), ft.autoUpdater.on("update-downloaded", (t) => {
    console.log("[AutoUpdater] Update downloaded:", t.version), Yt({
      status: "downloaded",
      version: t.version,
      releaseNotes: typeof t.releaseNotes == "string" ? t.releaseNotes : Array.isArray(t.releaseNotes) ? t.releaseNotes.map((o) => o.note).join(`
`) : void 0
    }), nT(t.version);
  }), ft.autoUpdater.on("error", (t) => {
    console.error("[AutoUpdater] Error:", t.message), Yt({
      status: "error",
      error: t.message
    });
  }), iT(), ke.isPackaged && (setTimeout(() => {
    el(!1);
  }, 1e4), setInterval(() => {
    el(!1);
  }, 14400 * 1e3)), console.log("[AutoUpdater] Initialized");
}
async function el(e = !0) {
  try {
    return ke.isPackaged ? await ft.autoUpdater.checkForUpdates() : (console.log("[AutoUpdater] Skipping update check in development mode"), e || Yt({
      status: "not-available",
      version: ke.getVersion()
    }), null);
  } catch (t) {
    const o = t instanceof Error ? t.message : "Unknown error";
    return console.error("[AutoUpdater] Check failed:", o), e || Yt({
      status: "error",
      error: o
    }), null;
  }
}
async function rT() {
  try {
    await ft.autoUpdater.downloadUpdate();
  } catch (e) {
    const t = e instanceof Error ? e.message : "Download failed";
    console.error("[AutoUpdater] Download failed:", t), Yt({
      status: "error",
      error: t
    });
  }
}
function av() {
  console.log("[AutoUpdater] Installing update and restarting..."), ft.autoUpdater.quitAndInstall(!1, !0);
}
async function nT(e) {
  if (!or || or.isDestroyed()) return;
  const { response: t } = await r_.showMessageBox(or, {
    type: "info",
    title: "Actualización Lista",
    message: `Una nueva versión (${e}) está lista para instalar.`,
    detail: "La aplicación se reiniciará para aplicar la actualización.",
    buttons: ["Reiniciar Ahora", "Más Tarde"],
    defaultId: 0,
    cancelId: 1
  });
  t === 0 && av();
}
function iT() {
  he.handle("auto-update:check", async (e, t) => (await el(t ?? !0), Xr)), he.handle("auto-update:download", async () => (await rT(), Xr)), he.handle("auto-update:install", () => {
    av();
  }), he.handle("auto-update:getState", () => Xr), he.handle("auto-update:getVersion", () => ke.getVersion());
}
function aT() {
  he.removeHandler("auto-update:check"), he.removeHandler("auto-update:download"), he.removeHandler("auto-update:install"), he.removeHandler("auto-update:getState"), he.removeHandler("auto-update:getVersion"), or = null;
}
const cr = new vl({
  name: "auto-launch-settings",
  defaults: {
    autoLaunch: {
      enabled: !1,
      minimized: !0
      // Start minimized by default
    }
  }
});
function Ll() {
  return cr.get("autoLaunch.enabled", !1);
}
function sT() {
  return cr.get("autoLaunch.minimized", !0);
}
function oT() {
  return cr.get("autoLaunch");
}
function Fl(e = !0) {
  try {
    const t = ql();
    return ke.setLoginItemSettings({
      openAtLogin: !0,
      openAsHidden: e,
      // Windows specific
      args: e ? ["--hidden"] : [],
      // macOS/Linux path
      path: process.execPath
    }), cr.set("autoLaunch", {
      enabled: !0,
      minimized: e
    }), console.log("[AutoLaunch] Enabled:", { minimized: e }), !0;
  } catch (t) {
    return console.error("[AutoLaunch] Failed to enable:", t), !1;
  }
}
function sv() {
  try {
    return ke.setLoginItemSettings({
      openAtLogin: !1,
      openAsHidden: !1
    }), cr.set("autoLaunch.enabled", !1), console.log("[AutoLaunch] Disabled"), !0;
  } catch (e) {
    return console.error("[AutoLaunch] Failed to disable:", e), !1;
  }
}
function uT() {
  const e = Ll();
  return e ? sv() : Fl(sT()), !e;
}
function cT(e) {
  cr.set("autoLaunch.minimized", e), Ll() && Fl(e);
}
function ql() {
  return ke.getLoginItemSettings();
}
function Ul() {
  const e = process.argv.includes("--hidden"), o = ql().wasOpenedAsHidden ?? !1;
  return e || o;
}
function lT() {
  const e = ql(), t = cr.get("autoLaunch.enabled", !1);
  e.openAtLogin !== t && cr.set("autoLaunch.enabled", e.openAtLogin), dT(), console.log("[AutoLaunch] Initialized:", {
    enabled: e.openAtLogin,
    wasOpenedAtLogin: Ul()
  });
}
function dT() {
  he.handle("auto-launch:isEnabled", () => Ll()), he.handle("auto-launch:getSettings", () => oT()), he.handle("auto-launch:enable", (e, t) => Fl(t ?? !0)), he.handle("auto-launch:disable", () => sv()), he.handle("auto-launch:toggle", () => uT()), he.handle("auto-launch:setStartMinimized", (e, t) => (cT(t), !0)), he.handle("auto-launch:wasStartedAtLogin", () => Ul());
}
function fT() {
  he.removeHandler("auto-launch:isEnabled"), he.removeHandler("auto-launch:getSettings"), he.removeHandler("auto-launch:enable"), he.removeHandler("auto-launch:disable"), he.removeHandler("auto-launch:toggle"), he.removeHandler("auto-launch:setStartMinimized"), he.removeHandler("auto-launch:wasStartedAtLogin");
}
const ov = ke;
process.env.DIST = ht.join(__dirname, "../dist");
process.env.VITE_PUBLIC = ke.isPackaged ? process.env.DIST : ht.join(process.env.DIST, "../public");
let Je = null;
const Yc = process.env.VITE_DEV_SERVER_URL;
function hT() {
  return ke.isPackaged ? ht.join(process.resourcesPath, "build", "icon.png") : ht.join(process.env.VITE_PUBLIC, "icon.png");
}
function uv() {
  const e = d$(), t = Ul();
  if (Je = new tl({
    icon: hT(),
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
      preload: ht.join(__dirname, "preload.js"),
      nodeIntegration: !1,
      contextIsolation: !0
    }
  }), f$(Je), e.isMaximized && Je.maximize(), c$(Je), p_(Je), l_(Je), m$(Je), S$(), R$(Je), tT(Je), lT(), n0(Je), Je.on("close", (o) => {
    Kp().get("settings.minimizeToTray", !0) && !ov.isQuitting && (o.preventDefault(), Je?.hide());
  }), Je.webContents.on("did-finish-load", () => {
    Je?.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString()), il(Je, {
      timerActive: !1,
      isPaused: !1,
      timeRemaining: "25:00",
      currentTask: null,
      mode: "IDLE"
    });
  }), Yc)
    console.log("Loading URL:", Yc), Je.loadURL(Yc);
  else {
    const o = ht.join(process.env.DIST, "index.html");
    console.log("Loading file:", o), Je.loadFile(o);
  }
  Je.once("ready-to-show", () => {
    !Kp().get("settings.startMinimized", !1) && !t && Je?.show(), T$();
  }), ke.isPackaged || Je.webContents.openDevTools();
}
ke.on("before-quit", () => {
  ov.isQuitting = !0;
});
ke.whenReady().then(uv);
ke.on("will-quit", () => {
  al(), d_(), v$(), $$(), l$(), aT(), fT(), P$();
});
ke.on("window-all-closed", () => {
  process.platform !== "darwin" && ke.quit();
});
ke.on("activate", () => {
  tl.getAllWindows().length === 0 ? uv() : Je?.show();
});
