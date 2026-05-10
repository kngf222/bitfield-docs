(() => {
  const themes = [{"name":"midnight","label":"Midnight","mode":"dark","primary":"#1a1a1a","secondary":"#b3b3b3"},{"name":"abyss","label":"Abyss","mode":"dark","primary":"#020202","secondary":"#444444"},{"name":"paper","label":"Paper","mode":"light","primary":"#fafafa","secondary":"#333333"},{"name":"ocean","label":"Ocean","mode":"dark","primary":"#40e0d0","secondary":"#00d9b8"},{"name":"forest","label":"Forest","mode":"dark","primary":"#22c55e","secondary":"#10b981"},{"name":"sunset","label":"Sunset","mode":"dark","primary":"#fb923c","secondary":"#ea580c"},{"name":"lavender","label":"Lavender","mode":"dark","primary":"#a855f7","secondary":"#818cf8"},{"name":"rose","label":"Rose","mode":"dark","primary":"#fb7185","secondary":"#ec4899"},{"name":"amber","label":"Amber","mode":"dark","primary":"#fbbf24","secondary":"#f59e0b"},{"name":"slate","label":"Slate","mode":"dark","primary":"#94a3b8","secondary":"#64748b"},{"name":"cyan","label":"Cyan","mode":"dark","primary":"#22d3ee","secondary":"#06b6d4"},{"name":"crimson","label":"Crimson","mode":"dark","primary":"#dc2626","secondary":"#ef4444"},{"name":"monet","label":"Monet","mode":"dark","primary":"#162828","secondary":"#5bab8a"},{"name":"monet-light","label":"Monet Light","mode":"light","primary":"#f5f0e8","secondary":"#2d8a65"},{"name":"midnight-light","label":"Midnight Light","mode":"light","primary":"#f5f5f5","secondary":"#333333"},{"name":"abyss-light","label":"Abyss Light","mode":"light","primary":"#fafafa","secondary":"#555555"},{"name":"ocean-light","label":"Ocean Light","mode":"light","primary":"#f0fafa","secondary":"#009990"},{"name":"forest-light","label":"Forest Light","mode":"light","primary":"#f0faf4","secondary":"#0d9960"},{"name":"sunset-light","label":"Sunset Light","mode":"light","primary":"#fdf5f0","secondary":"#cc5500"},{"name":"lavender-light","label":"Lavender Light","mode":"light","primary":"#f5f0fa","secondary":"#7040cc"},{"name":"rose-light","label":"Rose Light","mode":"light","primary":"#fdf0f2","secondary":"#cc3355"},{"name":"amber-light","label":"Amber Light","mode":"light","primary":"#fdf8f0","secondary":"#cc8800"},{"name":"slate-light","label":"Slate Light","mode":"light","primary":"#f5f6f8","secondary":"#556677"},{"name":"cyan-light","label":"Cyan Light","mode":"light","primary":"#f0fafc","secondary":"#0099bb"},{"name":"crimson-light","label":"Crimson Light","mode":"light","primary":"#fdf0f0","secondary":"#bb2222"}];
  const themeNames = themes.map((theme) => theme.name);
  const labels = Object.fromEntries(themes.map((theme) => [theme.name, theme.label]));
  const modes = Object.fromEntries(themes.map((theme) => [theme.name, theme.mode]));
  const swatches = Object.fromEntries(themes.map((theme) => [theme.name, [theme.primary, theme.secondary]]));
  const defaultTheme = "paper";
  const storageKey = 'bitfield-docs-theme';
  const accountUrl = "https://account.bitfield.so";
  const searchSuggestions = [{"eyebrow":"Start","label":"Quickstart","href":"/start/quickstart","description":"Get your key and make your first call."},{"eyebrow":"Concepts","label":"What is Bitfield?","href":"/concepts/what-is-bitfield","description":"Understand the runtime and database."},{"eyebrow":"Runtime Kit","label":"Build without tangled code","href":"/runtime-kit/build-without-tangled-code","description":"Translate normal app code into Bitfield boundaries."},{"eyebrow":"Account","label":"Get your key","href":"/start/get-your-key","description":"Create the account and activate devices."},{"eyebrow":"Proof","label":"How Bitfield is this fast","href":"/proof/how-bitfield-is-fast","description":"Read the speed mechanism and claim boundary."}];
  const swatchColors = ["#e05a5a","#f5cc42","#22c0ba","#9060ee","#f5a03a","#35be7a","#3d7ced","#e0609a"];
  const swatchTiming = [
    { delay: 0.1, duration: 7.3 },
    { delay: 1.25, duration: 8.9 },
    { delay: 0.68, duration: 6.8 },
    { delay: 1.9, duration: 9.6 },
    { delay: 0.42, duration: 8.1 },
    { delay: 1.55, duration: 7.7 },
    { delay: 0.95, duration: 9.2 },
    { delay: 2.22, duration: 7.0 },
  ];
  const root = document.documentElement;
  let picker;
  let trigger;
  let panel;
  let accountCta;
  let tocCleanup;
  let tocSetupFrame = 0;

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
    return themeNames.includes(theme) ? theme : defaultTheme;
  }

  function activeTheme() {
    return safeTheme(root.dataset.bfDocsTheme || readStoredTheme());
  }

  function setPanelOpen(open) {
    if (!picker || !trigger || !panel) return;
    picker.dataset.open = open ? 'true' : 'false';
    trigger.dataset.state = open ? 'open' : 'closed';
    trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    panel.hidden = !open;
  }

  function applyTheme(theme, persist = false) {
    const activeTheme = safeTheme(theme);
    const mode = modes[activeTheme] === 'dark' ? 'dark' : 'light';
    root.dataset.bfDocsTheme = activeTheme;
    root.setAttribute('data-theme', activeTheme);
    root.classList.toggle('dark', mode === 'dark');
    root.style.colorScheme = mode;
    if (persist) {
      writeStoredTheme(activeTheme);
    }
    if (trigger) {
      trigger.setAttribute('aria-label', `Theme. Current theme: ${labels[activeTheme]}.`);
    }
    document.querySelectorAll('[data-bf-theme-option]').forEach((option) => {
      const selected = option.getAttribute('data-bf-theme-option') === activeTheme;
      option.classList.toggle('is-active', selected);
      option.setAttribute('aria-selected', selected ? 'true' : 'false');
    });
  }

  function markReady() {
    root.dataset.bfDocsReady = 'true';
  }

  function isAccountHref(link) {
    try {
      const href = new URL(link.getAttribute('href') || '', window.location.href);
      const target = new URL(accountUrl, window.location.href);
      return href.origin === target.origin && href.pathname.replace(/\/$/, '') === target.pathname.replace(/\/$/, '');
    } catch {
      return false;
    }
  }

  function nativeAccountLinks() {
    return Array.from(document.querySelectorAll('header a[href], #navbar a[href], nav a[href]'))
      .filter((link) => link.id !== 'bf-docs-account-cta' && isAccountHref(link));
  }

  function makeAccountCta() {
    const link = document.createElement('a');
    link.id = 'bf-docs-account-cta';
    link.href = accountUrl;
    link.innerHTML = '<span>Get My Key</span><span aria-hidden="true">›</span>';
    return link;
  }

  function normalizeAccountCta() {
    const nativeLinks = nativeAccountLinks();
    const nativePrimary = nativeLinks[0];
    const nativeShell = nativePrimary?.closest('li') || nativePrimary?.parentElement;
    const target = nativeShell?.parentElement;

    nativeLinks.forEach((link) => {
      link.dataset.bfNativeAccountLink = 'true';
      link.setAttribute('aria-hidden', 'true');
      link.tabIndex = -1;
    });

    if (!target) return accountCta?.parentElement ? accountCta : null;

    if (!accountCta) {
      accountCta = makeAccountCta();
    }

    if (accountCta.parentElement !== target || accountCta.previousElementSibling !== nativeShell) {
      nativeShell?.insertAdjacentElement('afterend', accountCta);
    }

    return accountCta;
  }

  function navbarMountPoint() {
    const normalizedCta = normalizeAccountCta();
    if (normalizedCta?.parentElement) {
      return { target: normalizedCta.parentElement, before: null };
    }

    const candidates = [
      '#navbar',
      'header nav',
      'header',
      'nav',
    ];

    for (const selector of candidates) {
      const target = document.querySelector(selector);
      if (target) return { target, before: null };
    }

    return null;
  }

  function swatchIcon() {
    return `<span class="theme-picker-swatch-icon" aria-hidden="true">${swatchColors.map((color, index) => {
      const timing = swatchTiming[index] ?? swatchTiming[0];
      return `<span class="theme-picker-swatch-icon__bit" data-disco-index="${index}" style="--theme-picker-swatch-color: ${color}; animation-delay: ${timing.delay + (index % 5) * 0.11}s; animation-duration: ${timing.duration}s;"></span>`;
    }).join('')}</span>`;
  }

  function themeOption(theme) {
    const [primary, secondary] = swatches[theme.name] ?? [theme.primary, theme.secondary];
    const selected = theme.name === activeTheme();
    const option = document.createElement('button');
    option.type = 'button';
    option.className = `bf-docs-theme-option${selected ? ' is-active' : ''}`;
    option.dataset.bfThemeOption = theme.name;
    option.setAttribute('role', 'option');
    option.setAttribute('aria-selected', selected ? 'true' : 'false');
    option.innerHTML = `
      <span class="bf-docs-theme-option__swatch" aria-hidden="true">
        <span style="background: ${primary};"></span>
        <span style="background: ${secondary};"></span>
      </span>
      <span class="bf-docs-theme-option__label">${theme.label}</span>
      <span class="bf-docs-theme-option__check" aria-hidden="true">✓</span>
    `;
    option.addEventListener('click', () => {
      applyTheme(theme.name, true);
      setPanelOpen(false);
      trigger?.focus();
    });
    return option;
  }

  function samePageHeadingId(href) {
    try {
      const url = new URL(href, window.location.href);
      const linkPath = url.pathname.replace(/\/$/, '');
      const currentPath = window.location.pathname.replace(/\/$/, '');
      if (!url.hash || linkPath !== currentPath) {
        return null;
      }
      return decodeURIComponent(url.hash.slice(1));
    } catch {
      return null;
    }
  }

  function setupTocScrollSpy() {
    if (tocCleanup) {
      tocCleanup();
      tocCleanup = null;
    }

    const toc = document.querySelector('#table-of-contents');
    if (!toc) return;

    const entries = Array.from(toc.querySelectorAll('a[href*="#"]'))
      .map((link) => {
        const id = samePageHeadingId(link.getAttribute('href') || '');
        const heading = id ? document.getElementById(id) : null;
        return heading ? { id, link, heading } : null;
      })
      .filter(Boolean);

    if (!entries.length) return;

    let activeId = '';
    let frame = 0;

    const setActive = (nextId) => {
      if (nextId === activeId) return;
      activeId = nextId;
      entries.forEach(({ id, link }) => {
        link.toggleAttribute('data-bf-toc-active', id === activeId);
      });
    };

    const update = () => {
      const viewportLine = window.scrollY + Math.min(180, window.innerHeight * 0.24);
      let next = entries[0]?.id || '';
      for (const entry of entries) {
        const top = entry.heading.getBoundingClientRect().top + window.scrollY;
        if (top <= viewportLine) {
          next = entry.id;
        }
      }
      setActive(next);
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    };

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    window.addEventListener('hashchange', requestUpdate);
    tocCleanup = () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
      window.removeEventListener('hashchange', requestUpdate);
      entries.forEach(({ link }) => link.removeAttribute('data-bf-toc-active'));
    };

    update();
  }

  function scheduleTocScrollSpy() {
    if (tocSetupFrame) {
      window.cancelAnimationFrame(tocSetupFrame);
    }
    tocSetupFrame = window.requestAnimationFrame(() => {
      tocSetupFrame = 0;
      setupTocScrollSpy();
    });
  }

  function searchText(node) {
    return [
      node.getAttribute?.('aria-label') || '',
      node.getAttribute?.('placeholder') || '',
      node.textContent || '',
    ].join(' ').toLowerCase();
  }

  function isSearchNode(node) {
    return searchText(node).includes('search');
  }

  function normalizedControlText(node) {
    return searchText(node).replace(/\s+/g, ' ').trim();
  }

  function isCopyPageNode(node) {
    return normalizedControlText(node).includes('copy page');
  }

  function copyMenuScore(node) {
    const text = normalizedControlText(node);
    return [
      'view as markdown',
      'open in chatgpt',
      'open in claude',
      'open in perplexity',
      'connect to cursor',
      'connect to vs code',
    ].filter((label) => text.includes(label)).length;
  }

  function copyPageShell(node) {
    let shell = node;
    let current = node;
    for (let depth = 0; depth < 4 && current.parentElement; depth += 1) {
      const parent = current.parentElement;
      if (parent.matches('header, #navbar, nav')) break;
      const controls = parent.querySelectorAll('button, [role="button"], a[href]');
      if (controls.length > 3) break;
      if (!isCopyPageNode(parent) && !Array.from(controls).some(isCopyPageNode)) break;
      shell = parent;
      if (parent.id === 'page-context-menu') break;
      current = parent;
    }
    return shell;
  }

  function copyPageMenuShell(node) {
    let shell = null;
    let current = node;
    for (let depth = 0; depth < 8 && current.parentElement; depth += 1) {
      const parent = current.parentElement;
      if (parent.matches('main, article, #content-area, header, #navbar, nav')) break;
      const controls = parent.querySelectorAll('button, [role="button"], [role="menuitem"], a[href]');
      if (copyMenuScore(parent) >= 2 && controls.length >= 2 && controls.length <= 16) {
        shell = parent;
      }
      current = parent;
    }
    return shell;
  }

  function markCopyPageMenuItems(menu) {
    menu
      .querySelectorAll('button, [role="button"], [role="menuitem"], a[href]')
      .forEach((item) => {
        if (!isCopyPageNode(item) && copyMenuScore(item) === 0) return;
        item.setAttribute('data-bf-docs-copy-menu-item', 'true');
      });
  }

  function markCopyPageControls() {
    document
      .querySelectorAll('main button, article button, #content-area button, main [role="button"], article [role="button"], #content-area [role="button"]')
      .forEach((node) => {
        if (!isCopyPageNode(node)) return;
        const shell = copyPageShell(node);
        shell.setAttribute('data-bf-docs-copy-page', 'true');
        shell
          .querySelectorAll('button, [role="button"], a[href]')
          .forEach((part) => {
            part.setAttribute('data-bf-docs-copy-page-part', 'true');
            if (!isCopyPageNode(part)) {
              part.setAttribute('data-bf-docs-copy-page-arrow', 'true');
            }
          });
      });

    document
      .querySelectorAll('button, [role="button"], [role="menuitem"], a[href], [role="menu"], [data-radix-popper-content-wrapper], body > div')
      .forEach((node) => {
        if (copyMenuScore(node) === 0) return;
        const menu = copyPageMenuShell(node);
        if (!menu) return;
        menu.setAttribute('data-bf-docs-copy-menu', 'true');
        markCopyPageMenuItems(menu);
      });
  }

  function searchSuggestionCard(item) {
    const link = document.createElement('a');
    link.className = 'bf-docs-search-defaults__item';
    link.href = item.href;

    const eyebrow = document.createElement('span');
    eyebrow.className = 'bf-docs-search-defaults__eyebrow';
    eyebrow.textContent = item.eyebrow;

    const label = document.createElement('strong');
    label.textContent = item.label;

    const description = document.createElement('span');
    description.textContent = item.description;

    link.append(eyebrow, label, description);
    return link;
  }

  function decorateSearchDialog(dialog) {
    if (!searchSuggestions.length || dialog.querySelector('.bf-docs-search-defaults')) {
      return;
    }

    const input = dialog.querySelector('input');
    if (!input || !isSearchNode(input)) return;

    const defaults = document.createElement('section');
    defaults.className = 'bf-docs-search-defaults';
    defaults.setAttribute('aria-label', 'Suggested docs');

    const label = document.createElement('div');
    label.className = 'bf-docs-search-defaults__label';
    label.textContent = 'Start here';

    const list = document.createElement('div');
    list.className = 'bf-docs-search-defaults__list';
    searchSuggestions.forEach((item) => list.append(searchSuggestionCard(item)));

    defaults.append(label, list);

    const searchField = input.closest('form') || input.parentElement;
    searchField?.setAttribute('data-bf-docs-search-field', 'true');
    (searchField || dialog).insertAdjacentElement('afterend', defaults);

    const sync = () => {
      defaults.hidden = Boolean(input.value?.trim());
    };
    input.addEventListener('input', sync);
    sync();
  }

  function markSearchChrome() {
    document.querySelectorAll('header button, #navbar button, header [role="button"], #navbar [role="button"], header input, #navbar input, header form, #navbar form')
      .forEach((node) => {
        if (isSearchNode(node)) {
          node.setAttribute('data-bf-docs-search-trigger', 'true');
        }
      });

    document.querySelectorAll('input')
      .forEach((input) => {
        if (!isSearchNode(input)) return;
        const dialog = input.closest('[role="dialog"], dialog, [data-radix-dialog-content], [cmdk-dialog], [cmdk-root]');
        if (!dialog || dialog.closest('header, #navbar, nav')) return;
        dialog.setAttribute('data-bf-docs-search-dialog', 'true');
        decorateSearchDialog(dialog);
      });
  }

  function mountPicker() {
    if (!document.body) return false;

    const mountPoint = navbarMountPoint();
    if (!mountPoint) return false;

    if (!picker) {
      picker = document.createElement('div');
      picker.className = 'bf-docs-theme-picker';
      picker.dataset.open = 'false';

      trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'bf-docs-theme-trigger theme-picker-trigger button-flat-surface';
      trigger.setAttribute('aria-haspopup', 'listbox');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.setAttribute('aria-controls', 'bf-docs-theme-panel');
      trigger.innerHTML = `<span class="button-flat-floor" aria-hidden="true"></span><span class="button-flat-face">${swatchIcon()}</span>`;
      trigger.addEventListener('click', (event) => {
        event.stopPropagation();
        setPanelOpen(picker.dataset.open !== 'true');
      });

      panel = document.createElement('div');
      panel.id = 'bf-docs-theme-panel';
      panel.className = 'bf-docs-theme-panel';
      panel.setAttribute('role', 'listbox');
      panel.setAttribute('aria-label', 'Select theme');
      panel.hidden = true;

      const header = document.createElement('div');
      header.className = 'bf-docs-theme-panel__header';
      header.textContent = 'Select Theme';
      panel.append(header, ...themes.map(themeOption));

      picker.append(trigger, panel);
    }

    if (picker.parentElement !== mountPoint.target || picker.nextSibling !== mountPoint.before) {
      mountPoint.target.insertBefore(picker, mountPoint.before);
    }

    applyTheme(root.dataset.bfDocsTheme || readStoredTheme() || defaultTheme);
    return true;
  }

  applyTheme(readStoredTheme() || defaultTheme);

  function bootChrome() {
    try {
      mountPicker();
      scheduleTocScrollSpy();
      markSearchChrome();
      markCopyPageControls();
    } finally {
      markReady();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootChrome, { once: true });
  } else {
    bootChrome();
  }

  const observer = new MutationObserver(() => {
    mountPicker();
    scheduleTocScrollSpy();
    markSearchChrome();
    markCopyPageControls();
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });

  document.addEventListener('click', (event) => {
    if (picker && !picker.contains(event.target)) {
      setPanelOpen(false);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setPanelOpen(false);
      trigger?.focus();
    }
  });

  window.addEventListener('pageshow', () => {
    try {
      applyTheme(readStoredTheme() || root.dataset.bfDocsTheme || defaultTheme);
      mountPicker();
      markSearchChrome();
      markCopyPageControls();
    } finally {
      markReady();
    }
  });
})();
