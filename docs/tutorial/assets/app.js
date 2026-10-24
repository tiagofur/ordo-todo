/* Tutorial de Ordo — comportamiento compartido
   Genera el sidebar, la navegación anterior/siguiente, el progreso
   de lectura (localStorage) y el tema claro/oscuro. Sin dependencias. */
(function () {
  "use strict";

  var DATA = window.ORDO_TUTORIAL;
  var STORE_READ = "ordo-tutorial-read";
  var STORE_THEME = "ordo-tutorial-theme";

  /* ---------- Tema ---------- */

  function applyTheme(pref) {
    var dark = pref === "dark" || (pref === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }

  var theme = "system";
  try { theme = localStorage.getItem(STORE_THEME) || "system"; } catch (e) { /* file:// sin storage */ }
  applyTheme(theme);

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () {
    if (theme === "system") applyTheme("system");
  });

  /* ---------- Progreso de lectura ---------- */

  function getRead() {
    try { return JSON.parse(localStorage.getItem(STORE_READ) || "[]"); } catch (e) { return []; }
  }

  function setRead(ids) {
    try { localStorage.setItem(STORE_READ, JSON.stringify(ids)); } catch (e) { /* sin storage */ }
  }

  function isRead(id) { return getRead().indexOf(id) !== -1; }

  /* ---------- Iconos auxiliares ---------- */

  function svg(inner) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + "</svg>";
  }

  var IC_CHECK = '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>';
  var IC_SUN = '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>';
  var IC_MOON = '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>';
  var IC_MENU = '<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>';
  var IC_SEARCH = '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>';
  var IC_X = '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>';
  var IC_LOGO = '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>';
  var IC_ROUTE = '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>';

  /* ---------- Render del sidebar ---------- */

  var current = document.body.getAttribute("data-screen") || "";

  function renderSidebar() {
    var aside = document.getElementById("sidebar");
    if (!aside) return;

    var html = "";
    html += '<a class="side-brand" href="index.html">' +
      '<span class="logo">' + svg(IC_LOGO) + "</span>" +
      "<span><b>Ordo</b><small>Tutorial pantalla por pantalla</small></span></a>";

    html += '<div class="side-search">' + svg(IC_SEARCH) +
      '<input type="search" id="sideSearch" placeholder="Buscar pantalla…" aria-label="Buscar pantalla"></div>';

    html += '<nav class="side-nav" aria-label="Pantallas del tutorial">';

    DATA.groups.forEach(function (g) {
      html += '<div class="side-group"><div class="side-label">' + g.label + "</div>";
      g.items.forEach(function (it) {
        var cls = "side-item";
        if (it.id === current) cls += " is-active";
        if (isRead(it.id)) cls += " is-read";
        html += '<a class="' + cls + '" href="' + it.file + '" data-id="' + it.id + '" style="--c:' + it.color + '" ' +
          (it.id === current ? 'aria-current="page"' : "") + ">" +
          '<span class="dot"></span><span class="ic">' + svg(DATA.icons[it.icon] || "") + "</span>" +
          '<span class="txt">' + it.title + "</span>" +
          '<span class="read">' + svg(IC_CHECK) + "</span></a>";
      });
      html += "</div>";
    });

    html += "</nav>";

    html += '<div class="side-foot"><div class="progress" style="flex:1"><span id="progTxt"></span>' +
      '<div class="progress-bar"><i id="progBar"></i></div></div>' +
      '<button class="theme-btn" id="themeBtn" aria-label="Cambiar tema claro/oscuro" title="Tema claro / oscuro">' +
      svg(theme === "dark" ? IC_MOON : IC_SUN) + "</button></div>";

    aside.innerHTML = html;

    // Botón de menú y velo, fuera del sidebar para que no viajen con él
    if (!document.getElementById("menuBtn")) {
      document.body.insertAdjacentHTML("afterbegin",
        '<button class="menu-btn" id="menuBtn" aria-label="Abrir menú de pantallas" aria-expanded="false">' + svg(IC_MENU) + "</button>" +
        '<div class="scrim" id="scrim"></div>');
    }

    // Búsqueda
    var input = document.getElementById("sideSearch");
    input.addEventListener("input", function () {
      var q = input.value.trim().toLowerCase();
      DATA.groups.forEach(function (g) {
        var groupEl = null;
        g.items.forEach(function (it) {
          var el = aside.querySelector('[data-id="' + it.id + '"]');
          if (!el) return;
          groupEl = groupEl || el.closest(".side-group");
          var hay = (it.title + " " + it.desc).toLowerCase();
          el.classList.toggle("is-hidden", q !== "" && hay.indexOf(q) === -1);
        });
        if (groupEl) {
          var anyVisible = g.items.some(function (it) {
            var el = aside.querySelector('[data-id="' + it.id + '"]');
            return el && !el.classList.contains("is-hidden");
          });
          groupEl.style.display = anyVisible ? "" : "none";
        }
      });
    });

    // Menú móvil
    var btn = document.getElementById("menuBtn");
    var scrim = document.getElementById("scrim");
    function closeNav() {
      document.body.classList.remove("nav-open");
      btn.setAttribute("aria-expanded", "false");
    }
    btn.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      btn.setAttribute("aria-expanded", String(open));
    });
    scrim.addEventListener("click", closeNav);
    aside.addEventListener("click", function (e) {
      if (e.target.closest("a") && document.body.classList.contains("nav-open")) closeNav();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });

    // Tema
    var themeBtn = document.getElementById("themeBtn");
    themeBtn.addEventListener("click", function () {
      theme = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      try { localStorage.setItem(STORE_THEME, theme); } catch (e) { /* sin storage */ }
      applyTheme(theme);
      themeBtn.innerHTML = svg(theme === "dark" ? IC_MOON : IC_SUN);
    });

    // En pantallas bajas, deja visible el item activo del menú
    var active = aside.querySelector(".is-active");
    if (active) active.scrollIntoView({ block: "nearest" });

    updateProgress();
  }

  /* En móvil, la píldora de ruta solo muestra la parte esencial */
  function splitRoutePills() {
    document.querySelectorAll(".route-pill").forEach(function (pill) {
      var nodes = Array.prototype.slice.call(pill.childNodes);
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        var at = n.nodeType === 3 ? n.textContent.indexOf("\u00b7 ") : -1;
        if (at === -1) continue;
        var extra = document.createElement("span");
        extra.className = "pill-extra";
        var tail = n.splitText(at);
        pill.replaceChild(extra, tail);
        extra.appendChild(tail);
        while (extra.nextSibling) extra.appendChild(extra.nextSibling);
        break;
      }
    });
  }

  function updateProgress() {
    var txt = document.getElementById("progTxt");
    var bar = document.getElementById("progBar");
    if (!txt || !bar) return;
    var read = getRead().filter(function (id) {
      return DATA.flat.some(function (it) { return it.id === id; });
    });
    txt.textContent = read.length + " de " + DATA.flat.length + " pantallas";
    bar.style.width = Math.round((read.length / DATA.flat.length) * 100) + "%";
  }

  /* ---------- Botón "marcar como leída" ---------- */

  function renderMarkRead() {
    var holder = document.getElementById("markRead");
    if (!holder || !current || current === "index") return;

    var item = DATA.flat.filter(function (it) { return it.id === current; })[0];
    if (!item) return;

    var btn = document.createElement("button");
    btn.className = "mark-read" + (isRead(current) ? " is-done" : "");
    btn.innerHTML = svg(IC_CHECK) + "<span>" + (isRead(current) ? "Pantalla leída" : "Marcar como leída") + "</span>";
    btn.addEventListener("click", function () {
      var read = getRead();
      if (read.indexOf(current) === -1) {
        read.push(current);
        setRead(read);
        btn.classList.add("is-done");
        btn.querySelector("span").textContent = "Pantalla leída";
        var link = document.querySelector('.side-item[data-id="' + current + '"]');
        if (link) link.classList.add("is-read");
        updateProgress();
      }
    });
    holder.appendChild(btn);
  }

  /* ---------- Anterior / siguiente ---------- */

  function renderPager() {
    var pager = document.getElementById("pager");
    if (!pager || !current || current === "index") return;

    var idx = -1;
    DATA.flat.forEach(function (it, i) { if (it.id === current) idx = i; });
    if (idx === -1) return;

    var prev = DATA.flat[idx - 1];
    var next = DATA.flat[idx + 1];
    var html = "";

    if (prev) {
      html += '<a href="' + prev.file + '" class="prev"><small>Anterior</small><b>' + prev.title + "</b></a>";
    } else {
      html += "<span style='flex:1'></span>";
    }
    if (next) {
      html += '<a href="' + next.file + '" class="next"><small>Siguiente</small><b>' + next.title + "</b></a>";
    } else {
      html += '<a href="index.html" class="next"><small>Fin del recorrido</small><b>Volver al índice</b></a>';
    }

    pager.innerHTML = html;
  }

  /* ---------- Índice: marcar leídas + progreso ---------- */

  function renderIndexState() {
    var read = getRead();
    DATA.flat.forEach(function (it) {
      var link = document.querySelector('.toc-list a[data-id="' + it.id + '"]');
      if (link && read.indexOf(it.id) !== -1) link.classList.add("is-read");
    });
    var counter = document.getElementById("indexProgress");
    if (counter) {
      var n = read.filter(function (id) {
        return DATA.flat.some(function (it) { return it.id === id; });
      }).length;
      counter.textContent = n + " de " + DATA.flat.length + " pantallas completadas";
    }
  }

  /* ---------- Cabecera: icono de página ---------- */

  function renderHeadIcon() {
    var el = document.querySelector(".head-icon");
    if (!el) return;
    var item = DATA.flat.filter(function (it) { return it.id === current; })[0];
    if (item) {
      el.style.setProperty("--c", item.color);
      el.innerHTML = svg(DATA.icons[item.icon] || "");
    }
  }

  /* ---------- Arranque ---------- */

  renderSidebar();
  splitRoutePills();
  renderHeadIcon();
  renderMarkRead();
  renderPager();
  renderIndexState();
})();
