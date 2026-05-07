(() => {
  const themes = ["paper","ink"];
  const labels = {"paper":"Paper","ink":"Ink"};
  const defaultTheme = themes[0];
  const storageKey = 'bitfield-docs-theme';
  const root = document.documentElement;
  let button;

  function readStoredTheme() {
    try {
      return localStorage.getItem(storageKey);
    } catch {
      return null;
    }
  }

  function writeStoredTheme(theme) {
    try {
      localStorage.setItem(storageKey, theme);
    } catch {
      /* Storage can be unavailable in strict browser modes. */
    }
  }

  function safeTheme(theme) {
    return themes.includes(theme) ? theme : defaultTheme;
  }

  function applyTheme(theme, persist = false) {
    const activeTheme = safeTheme(theme);
    root.dataset.bfDocsTheme = activeTheme;
    if (persist) {
      writeStoredTheme(activeTheme);
    }
    if (button) {
      button.textContent = labels[activeTheme];
      button.setAttribute('aria-label', `Switch docs theme. Current theme: ${labels[activeTheme]}.`);
    }
  }

  function mountButton() {
    if (!document.body || document.querySelector('.bf-theme-toggle')) {
      return;
    }

    button = document.createElement('button');
    button.type = 'button';
    button.className = 'bf-theme-toggle';
    button.addEventListener('click', () => {
      const currentIndex = themes.indexOf(safeTheme(root.dataset.bfDocsTheme));
      const nextTheme = themes[(currentIndex + 1) % themes.length];
      applyTheme(nextTheme, true);
    });

    document.body.append(button);
    applyTheme(root.dataset.bfDocsTheme || readStoredTheme() || defaultTheme);
  }

  applyTheme(readStoredTheme() || defaultTheme);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountButton, { once: true });
  } else {
    mountButton();
  }

  window.addEventListener('pageshow', () => {
    applyTheme(readStoredTheme() || root.dataset.bfDocsTheme || defaultTheme);
    mountButton();
  });
})();
