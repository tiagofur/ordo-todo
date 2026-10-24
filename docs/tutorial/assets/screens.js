/* Catálogo de pantallas del tutorial de Ordo.
   Un solo lugar para añadir, reordenar o renombrar pantallas:
   el sidebar, el índice y los enlaces anterior/siguiente se generan de aquí. */
(function () {
  "use strict";

  // Iconos (trazos estilo lucide, 24×24, stroke currentColor)
  var I = {
    login: '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/>',
    home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    bot: '<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>',
    tasks: '<path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
    calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
    plan: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/>',
    sunrise: '<path d="M12 2v8"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="m19.07 10.93-1.41 1.41"/><path d="M22 22H2"/><path d="m8 6 4-4 4 4"/><path d="M16 18a4 4 0 0 0-8 0"/>',
    projects: '<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/><path d="M8 10v4"/><path d="M12 10v2"/><path d="M16 10v6"/>',
    habits: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>',
    goals: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    notes: '<path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11l5-5V5a2 2 0 0 0-2-2Z"/><path d="M15 21v-4a2 2 0 0 1 2-2h4"/>',
    workspaces: '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>',
    workload: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    eisenhower: '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
    meetings: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    timer: '<line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/>',
    focus: '<circle cx="12" cy="12" r="3"/><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/>',
    insights: '<path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
    wellbeing: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    tags: '<path d="m15 5 6.3 6.3a2.4 2.4 0 0 1 0 3.4L17 19"/><path d="M9.586 5.586A2 2 0 0 0 8.172 5H3a1 1 0 0 0-1 1v5.172a2 2 0 0 0 .586 1.414L8.29 18.29a2.426 2.426 0 0 0 3.42 0l3.58-3.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="6.5" cy="9.5" r=".5" fill="currentColor"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    keyboard: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="M6 8h.01"/><path d="M10 8h.01"/><path d="M14 8h.01"/><path d="M18 8h.01"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/><path d="M7 16h10"/>'
  };

  // Colores de sección de la app (packages/ui Sidebar)
  var C = {
    cyan: "#06b6d4",
    blue: "#3b82f6",
    purple: "#8b5cf6",
    orange: "#f97316",
    pink: "#ec4899",
    emerald: "#10b981",
    yellow: "#eab308",
    green: "#22c55e",
    red: "#ef4444",
    indigo: "#6366f1"
  };

  function s(id, title, file, color, icon, desc, route) {
    return { id: id, title: title, file: file, color: C[color] || color, icon: icon, desc: desc, route: route || "" };
  }

  window.ORDO_TUTORIAL = {
    icons: I,
    colors: C,
    groups: [
      {
        label: "Empezar",
        items: [
          s("primeros-pasos", "Primeros pasos", "primeros-pasos.html", "indigo", "login",
            "Crear tu cuenta con código de invitación e iniciar sesión.", "/login"),
          s("hoy", "Hoy (Dashboard)", "hoy.html", "cyan", "home",
            "Tu centro de mando diario: métricas, tareas de hoy y accesos rápidos.", "/dashboard")
        ]
      },
      {
        label: "Tu día",
        items: [
          s("ai-chat", "AI Chat", "ai-chat.html", "blue", "bot",
            "Habla con el asistente para planificar, priorizar y decidir.", "/ai-chat"),
          s("tareas", "Tareas", "tareas.html", "purple", "tasks",
            "Crear, filtrar y completar tareas; la vista central de Ordo.", "/tasks"),
          s("calendario", "Calendario", "calendario.html", "blue", "calendar",
            "Programa tus tareas en el tiempo arrastrándolas al calendario.", "/calendar"),
          s("mi-plan", "Mi plan de hoy", "mi-plan.html", "cyan", "plan",
            "Revisa la propuesta de bloques de tiempo y acepta o ajusta el plan.", "/plan"),
          s("ritual", "Ritual diario", "ritual.html", "orange", "sunrise",
            "Abre el día con tu top-3 y ciérralo dejando todo en orden.", "/ritual")
        ]
      },
      {
        label: "Planificar",
        items: [
          s("proyectos", "Proyectos", "proyectos.html", "pink", "projects",
            "Agrupa tareas en proyectos con color, progreso y tablero.", "/projects"),
          s("habitos", "Hábitos", "habitos.html", "emerald", "habits",
            "Rutinas diarias con rachas, XP y celebraciones.", "/habits"),
          s("objetivos", "Objetivos (OKRs)", "objetivos.html", "orange", "goals",
            "Metas grandes medidas con resultados clave.", "/goals"),
          s("notas", "Notas", "notas.html", "yellow", "notes",
            "Post-its digitales para capturar ideas al vuelo.", "/notes")
        ]
      },
      {
        label: "Equipo",
        items: [
          s("workspaces", "Espacios de trabajo", "workspaces.html", "orange", "workspaces",
            "Contenedores para colaborar: miembros, roles y actividad.", "/workspaces"),
          s("carga-trabajo", "Carga de trabajo", "carga-trabajo.html", "purple", "workload",
            "Quién está sobrecargado y cómo repartir mejor.", "/workload"),
          s("eisenhower", "Matriz de Eisenhower", "eisenhower.html", "purple", "eisenhower",
            "Prioriza por urgencia e importancia arrastrando entre cuadrantes.", "/eisenhower"),
          s("reuniones", "Reuniones", "reuniones.html", "purple", "meetings",
            "Pega una transcripción y conviértela en tareas con IA.", "/meetings")
        ]
      },
      {
        label: "Foco y tiempo",
        items: [
          s("temporizador", "Temporizador (Pomodoro)", "temporizador.html", "red", "timer",
            "Sesiones de foco 25/5 vinculadas a tareas, con historial.", "/timer"),
          s("modo-enfoque", "Modo Enfoque", "modo-enfoque.html", "blue", "focus",
            "Pantalla completa para ejecutar una sola tarea sin distracciones.", "/focus")
        ]
      },
      {
        label: "Rendimiento",
        items: [
          s("insights", "Insights", "insights.html", "cyan", "insights",
            "Analíticas en vivo y reportes generados por IA.", "/insights"),
          s("bienestar", "Bienestar", "bienestar.html", "pink", "wellbeing",
            "Prevención de burnout y equilibrio vida-trabajo.", "/wellbeing"),
          s("etiquetas", "Etiquetas", "etiquetas.html", "green", "tags",
            "El catálogo de etiquetas para clasificar tus tareas.", "/tags"),
          s("papelera", "Papelera", "papelera.html", "red", "trash",
            "Recupera lo borrado; purga definitiva a los 30 días.", "/trash")
        ]
      },
      {
        label: "Tu cuenta",
        items: [
          s("notificaciones", "Notificaciones", "notificaciones.html", "pink", "bell",
            "Actividad de tu equipo y de tus tareas, leídas y no leídas.", "/notifications"),
          s("configuracion", "Configuración", "configuracion.html", "indigo", "settings",
            "Apariencia, idioma, timer, sonido, IA y seguridad.", "/settings"),
          s("perfil", "Perfil", "perfil.html", "indigo", "user",
            "Tu identidad, preferencias de IA, suscripción y cuenta.", "/profile"),
          s("atajos", "Atajos y paleta", "atajos.html", "purple", "keyboard",
            "Atajos de teclado y paleta de comandos para volar.", "global")
        ]
      },
      {
        label: "Administración",
        items: [
          s("administracion", "Administración", "administracion.html", "purple", "shield",
            "Panel de plataforma, usuarios y códigos de invitación (solo admins).", "/admin")
        ]
      }
    ]
  };

  // Lista plana en orden de lectura
  window.ORDO_TUTORIAL.flat = [];
  window.ORDO_TUTORIAL.groups.forEach(function (g) {
    g.items.forEach(function (it) { window.ORDO_TUTORIAL.flat.push(it); });
  });
})();
