/* ─── LOADING SCREEN ───────────────────────────────── */
  (function () {
    function dismissLoader() {
      var loader = document.getElementById('app-loading');
      if (!loader) return;
      loader.classList.add('hidden');
      setTimeout(function () { loader.remove(); }, 600);
    }
    var start = Date.now();
    window.addEventListener('load', function () {
      var elapsed = Date.now() - start;
      var remaining = Math.max(3000 - elapsed, 0);
      setTimeout(dismissLoader, remaining);
    });
    // safety net in case 'load' already fired or never fires as expected
    setTimeout(dismissLoader, 4000);
  })();

  /* ─── THEME ────────────────────────────────────────── */
  (function initTheme() {
    var saved = localStorage.getItem('enotas-guide-theme');
    if (saved) document.documentElement.setAttribute('data-theme', saved);
  })();
  function toggleTheme() {
    var current = document.documentElement.getAttribute('data-theme');
    var isDark = current === 'dark';
    var next = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('enotas-guide-theme', next);
  }

  /* ─── SIDEBAR NAV ──────────────────────────────────── */
  var sideNavBtns = document.querySelectorAll('#side-nav .side-nav-btn');
  var contentPanel = document.querySelector('.content-panel');
  sideNavBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      sideNavBtns.forEach(function (b) { b.classList.remove('active'); });
      document.querySelectorAll('main > .section').forEach(function (s) { s.classList.remove('active'); });
      btn.classList.add('active');
      var target = document.getElementById(btn.dataset.target);
      if (target) target.classList.add('active');
      history.replaceState(null, '', '#' + btn.dataset.target);
      if (contentPanel) contentPanel.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    });
  });
  (function openFromHash() {
    var hash = location.hash.replace('#', '');
    if (!hash) return;
    var btn = document.querySelector('#side-nav .side-nav-btn[data-target="' + hash + '"]');
    if (btn) btn.click();
  })();

  /* ─── GENERIC SUB-TAB GROUPS (endpoint tabs + scenarios) ─── */
  function wireTabGroup(triggerSelector, panelAttr) {
    document.querySelectorAll(triggerSelector).forEach(function (group) {
      var buttons = group.querySelectorAll('[data-panel]');
      buttons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var panel = document.getElementById(btn.dataset.panel);
          if (!panel) return;
          var groupValue = panel.getAttribute(panelAttr);
          buttons.forEach(function (b) { b.classList.remove('active'); });
          btn.classList.add('active');
          document.querySelectorAll('[' + panelAttr + '="' + groupValue + '"]').forEach(function (p) { p.classList.remove('active'); });
          panel.classList.add('active');
        });
      });
    });
  }
  wireTabGroup('.endpoint-tabs', 'data-group-panel');
  wireTabGroup('.scenario-bar', 'data-group-panel');
  wireTabGroup('.lang-tabs', 'data-group-panel');

  /* ─── ACCORDION ────────────────────────────────────── */
  function toggleAcc(el) {
    var body = el.querySelector('.accordion-body');
    var open = el.classList.toggle('open');
    body.classList.toggle('open', open);
  }

  /* ─── COPY TO CLIPBOARD ────────────────────────────── */
  function copyCode(btn) {
    var block = btn.closest('.code-block');
    var codeEl = block.querySelector('pre code');
    var text = codeEl.textContent;
    var done = function () {
      var original = btn.innerHTML;
      btn.classList.add('copied');
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="20 6 9 17 4 12"/></svg>Copiado';
      setTimeout(function () { btn.classList.remove('copied'); btn.innerHTML = original; }, 1600);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () { fallbackCopy(text, done); });
    } else {
      fallbackCopy(text, done);
    }
  }
  function fallbackCopy(text, cb) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.focus(); ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
    cb();
  }

  /* ─── JSON SYNTAX HIGHLIGHT ────────────────────────── */
  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function highlightJSON(raw) {
    var escaped = escapeHtml(raw);
    return escaped.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false)\b|\bnull\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
      function (match) {
        var cls = 'json-number';
        if (/^"/.test(match)) { cls = /:$/.test(match) ? 'json-key' : 'json-string'; }
        else if (/true|false/.test(match)) { cls = 'json-bool'; }
        else if (/null/.test(match)) { cls = 'json-null'; }
        return '<span class="' + cls + '">' + match + '</span>';
      }
    );
  }
  document.querySelectorAll('code.code-json').forEach(function (el) {
    el.innerHTML = highlightJSON(el.textContent);
  });