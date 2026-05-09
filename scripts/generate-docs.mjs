import { readFileSync, writeFileSync } from 'node:fs';

const manifest = JSON.parse(readFileSync('docs.manifest.json', 'utf8'));
const claimLedger = JSON.parse(readFileSync('claim-ledger.json', 'utf8'));
const sourceMap = JSON.parse(readFileSync('source-map.json', 'utf8'));
const pages = new Map(manifest.pages.map((page) => [page.route, page]));
const seo = manifest.site.seo;
const themeNames = Object.keys(manifest.site.themes);
const defaultThemeName = themeNames.includes('paper') ? 'paper' : themeNames[0];
const themePickerSwatchColors = [
  '#e05a5a',
  '#f5cc42',
  '#22c0ba',
  '#9060ee',
  '#f5a03a',
  '#35be7a',
  '#3d7ced',
  '#e0609a',
];
const themePickerPhaseOffsets = [0, 3, 6, 1, 5, 2, 7, 4];
const regularFont = manifest.site.typography.fontFaces.find((font) => font.weight === 400);
const headingFont =
  manifest.site.typography.fontFaces.find((font) => font.weight === 600) ?? regularFont;

function requirePage(route) {
  const page = pages.get(route);
  if (!page) {
    throw new Error(`Navigation references missing page: ${route}`);
  }
  return route;
}

const navigation = {
  tabs: manifest.navigation.map((tab) => ({
    tab: tab.tab,
    groups: tab.groups.map((group) => ({
      group: group.group,
      pages: group.pages.map(requirePage),
    })),
  })),
};

const docsJson = {
  $schema: 'https://mintlify.com/docs.json',
  theme: 'mint',
  name: manifest.site.name,
  description: manifest.site.description,
  colors: {
    primary: manifest.site.rendererFallbackColors.primary,
    light: manifest.site.rendererFallbackColors.light,
    dark: manifest.site.rendererFallbackColors.dark,
  },
  appearance: {
    default: 'light',
    strict: true,
  },
  metadata: {
    timestamp: true,
  },
  search: {
    prompt: seo.searchPrompt,
  },
  seo: {
    indexing: seo.indexing,
    metatags: {
      canonical: seo.canonicalUrl,
      description: seo.social.description,
      keywords: seo.keywords.join(', '),
      robots: 'index, follow',
      googlebot: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
      'application-name': manifest.site.name,
      'apple-mobile-web-app-title': manifest.site.name,
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
      'format-detection': 'telephone=no',
      'og:site_name': seo.social.siteName,
      'og:type': 'website',
      'og:url': seo.canonicalUrl,
      'og:title': seo.social.title,
      'og:description': seo.social.description,
      'og:image': seo.social.image,
      'og:image:width': '1200',
      'og:image:height': '630',
      'og:image:type': 'image/png',
      'og:image:alt': seo.social.imageAlt,
      'twitter:card': 'summary_large_image',
      'twitter:title': seo.social.title,
      'twitter:description': seo.social.description,
      'twitter:image': seo.social.twitterImage,
      'twitter:image:alt': seo.social.imageAlt,
    },
  },
  favicon: '/favicon.svg',
  logo: {
    light: '/logo/light.svg',
    dark: '/logo/dark.svg',
  },
  fonts: {
    heading: {
      family: headingFont.family,
      source: headingFont.source,
      format: headingFont.format,
      weight: headingFont.weight,
    },
    body: {
      family: regularFont.family,
      source: regularFont.source,
      format: regularFont.format,
      weight: regularFont.weight,
    },
  },
  navigation,
  navbar: {
    links: [
      {
        label: 'Bitfield',
        href: manifest.site.siteUrl,
      },
      {
        label: 'Support',
        href: `mailto:${manifest.site.supportEmail}`,
      },
    ],
    primary: {
      type: 'button',
      label: 'Get My Key',
      href: manifest.site.accountUrl,
    },
  },
  contextual: {
    options: ['copy', 'view', 'chatgpt', 'claude', 'perplexity', 'cursor', 'vscode'],
  },
};

function cssVariableName(name) {
  return name.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}

function themeBlock(selector, tokens) {
  const variables = Object.entries(tokens)
    .filter(([name]) => name !== 'label')
    .map(([name, value]) => `  --bf-${cssVariableName(name)}: ${value};`)
    .join('\n');

  return `${selector} {\n${variables}\n  --docs-active-color: color-mix(in srgb, var(--bf-swatch-secondary, var(--bf-accent-tertiary)) 58%, var(--text-primary) 42%);\n}`;
}

function themeLabel(name) {
  return manifest.site.themes[name].label ?? name
    .split('-')
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ');
}

function isLightTheme(name) {
  return name === 'paper' || name.endsWith('-light');
}

function trimPercent(value) {
  return value.toFixed(3).replace(/\.?0+$/, '');
}

function themePickerDiscoCss() {
  return themePickerSwatchColors
    .map((_, cellIndex) => {
      const phaseOffset = themePickerPhaseOffsets[cellIndex] ?? 0;
      const stepSize = 100 / themePickerSwatchColors.length;
      const stops = themePickerSwatchColors
        .map((__, stepIndex) => {
          const color =
            themePickerSwatchColors[
              (stepIndex + phaseOffset) % themePickerSwatchColors.length
            ];
          const start = trimPercent(stepIndex * stepSize);
          const end = trimPercent((stepIndex + 1) * stepSize - 0.001);
          return `  ${start}%, ${end}% { --theme-picker-swatch-color: ${color}; }`;
        })
        .join('\n');

      return `.theme-picker-swatch-icon__bit[data-disco-index="${cellIndex}"] {
  animation-name: bf-docs-theme-disco-${cellIndex};
}

@keyframes bf-docs-theme-disco-${cellIndex} {
${stops}
}`;
    })
    .join('\n\n');
}

const themeMeta = themeNames.map((name) => ({
  name,
  label: themeLabel(name),
  mode: isLightTheme(name) ? 'light' : 'dark',
  primary: manifest.site.themes[name].swatchPrimary,
  secondary: manifest.site.themes[name].swatchSecondary,
}));
const searchSuggestions = manifest.site.searchSuggestions ?? [];

const themeCss = [
  '/* Generated from docs.manifest.json. Run npm run docs:generate. */',
  ...manifest.site.typography.fontFaces.map(
    (font) => `@font-face {
  font-family: "${font.family}";
  src: url("${font.source}") format("${font.format}");
  font-style: ${font.style};
  font-weight: ${font.weight};
  font-display: swap;
}`,
  ),
  `:root {
  --bf-font-display: ${manifest.site.typography.display};
  --bf-font-body: ${manifest.site.typography.body};
  --bf-red: #FB6A5F;
  --bf-orange: #FF9B5F;
  --bf-yellow: #FFD767;
  --bf-green: #85F0B5;
  --bf-blue: #4F62FF;
  --bf-purple: #A77BFF;
  --bf-cyan: #85D8FF;
  --black-pure: var(--bf-surface);
  --black-rich: var(--bf-surface-raised);
  --surface-base: var(--bf-surface);
  --cta-hardware-text: rgba(255,255,255,0.92);
  --cta-hardware-bg:
    linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0)),
    linear-gradient(180deg, #171922, #0c0d12);
  --cta-hardware-edge:
    linear-gradient(180deg, rgba(255,255,255,0.3), rgba(255,255,255,0.03) 42%, rgba(0,0,0,0.18) 100%);
  --landing-canvas-bg: color-mix(in srgb, var(--surface-base) 94%, #fbfaf6 6%);
  --docs-page-bg: var(--landing-canvas-bg);
  --glass-bg-primary: var(--bf-surface-raised);
  --glass-bg-secondary: color-mix(in srgb, var(--bf-text) 5%, transparent);
  --glass-bg-tertiary: color-mix(in srgb, var(--bf-text) 8%, transparent);
  --glass-bg-popover: var(--bf-surface-raised);
  --glass-bg-hover: color-mix(in srgb, var(--bf-text) 10%, transparent);
  --glass-bg-active: color-mix(in srgb, var(--bf-text) 15%, transparent);
  --glass-bg-subtle: color-mix(in srgb, var(--bf-text) 5%, transparent);
  --button-primary-bg: var(--bf-text);
  --button-primary-text: var(--bf-surface);
  --text-primary: var(--bf-text);
  --text-secondary: var(--bf-muted);
  --text-tertiary: color-mix(in srgb, var(--bf-muted) 82%, transparent);
  --text-muted: color-mix(in srgb, var(--bf-muted) 58%, transparent);
  --border-primary: var(--bf-border);
  --border-secondary: var(--bf-border-strong);
  --border-focus: color-mix(in srgb, var(--bf-text) 30%, transparent);
  --color-success: var(--bf-success);
  --color-warning: var(--bf-warning);
  --color-error: var(--bf-error);
  --color-info: var(--bf-info);
  --accent-blue: var(--bf-accent);
  --accent-purple: var(--bf-accent-secondary);
  --accent-emerald: var(--bf-accent-tertiary);
}`,
  '',
  themePickerDiscoCss(),
  '',
  themeBlock(
    `:root, html[data-bf-docs-theme="${defaultThemeName}"]`,
    manifest.site.themes[defaultThemeName],
  ),
  ...themeNames
    .filter((name) => name !== defaultThemeName)
    .map((name) => themeBlock(`html[data-bf-docs-theme="${name}"]`, manifest.site.themes[name])),
  ...themeNames
    .filter(isLightTheme)
    .map((name) => `html[data-bf-docs-theme="${name}"] {
  color-scheme: light;
}`),
  ...themeNames
    .filter((name) => !isLightTheme(name))
    .map((name) => `html[data-bf-docs-theme="${name}"] {
  color-scheme: dark;
}`),
  '',
]
  .filter(Boolean)
  .join('\n\n');

const themeJs = `(() => {
  const themes = ${JSON.stringify(themeMeta)};
  const themeNames = themes.map((theme) => theme.name);
  const labels = Object.fromEntries(themes.map((theme) => [theme.name, theme.label]));
  const modes = Object.fromEntries(themes.map((theme) => [theme.name, theme.mode]));
  const swatches = Object.fromEntries(themes.map((theme) => [theme.name, [theme.primary, theme.secondary]]));
  const defaultTheme = ${JSON.stringify(defaultThemeName)};
  const storageKey = 'bitfield-docs-theme';
  const accountUrl = ${JSON.stringify(manifest.site.accountUrl)};
  const searchSuggestions = ${JSON.stringify(searchSuggestions)};
  const swatchColors = ${JSON.stringify(themePickerSwatchColors)};
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
      trigger.setAttribute('aria-label', \`Theme. Current theme: \${labels[activeTheme]}.\`);
    }
    document.querySelectorAll('[data-bf-theme-option]').forEach((option) => {
      const selected = option.getAttribute('data-bf-theme-option') === activeTheme;
      option.classList.toggle('is-active', selected);
      option.setAttribute('aria-selected', selected ? 'true' : 'false');
    });
  }

  function isAccountHref(link) {
    try {
      const href = new URL(link.getAttribute('href') || '', window.location.href);
      const target = new URL(accountUrl, window.location.href);
      return href.origin === target.origin && href.pathname.replace(/\\/$/, '') === target.pathname.replace(/\\/$/, '');
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
    return \`<span class="theme-picker-swatch-icon" aria-hidden="true">\${swatchColors.map((color, index) => {
      const timing = swatchTiming[index] ?? swatchTiming[0];
      return \`<span class="theme-picker-swatch-icon__bit" data-disco-index="\${index}" style="--theme-picker-swatch-color: \${color}; animation-delay: \${timing.delay + (index % 5) * 0.11}s; animation-duration: \${timing.duration}s;"></span>\`;
    }).join('')}</span>\`;
  }

  function themeOption(theme) {
    const [primary, secondary] = swatches[theme.name] ?? [theme.primary, theme.secondary];
    const selected = theme.name === activeTheme();
    const option = document.createElement('button');
    option.type = 'button';
    option.className = \`bf-docs-theme-option\${selected ? ' is-active' : ''}\`;
    option.dataset.bfThemeOption = theme.name;
    option.setAttribute('role', 'option');
    option.setAttribute('aria-selected', selected ? 'true' : 'false');
    option.innerHTML = \`
      <span class="bf-docs-theme-option__swatch" aria-hidden="true">
        <span style="background: \${primary};"></span>
        <span style="background: \${secondary};"></span>
      </span>
      <span class="bf-docs-theme-option__label">\${theme.label}</span>
      <span class="bf-docs-theme-option__check" aria-hidden="true">✓</span>
    \`;
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
      const linkPath = url.pathname.replace(/\\/$/, '');
      const currentPath = window.location.pathname.replace(/\\/$/, '');
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
    return searchText(node).replace(/\\s+/g, ' ').trim();
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
      .querySelectorAll('button, [role="button"], [role="menuitem"], a[href]')
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
      trigger.innerHTML = \`<span class="button-flat-floor" aria-hidden="true"></span><span class="button-flat-face">\${swatchIcon()}</span>\`;
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      mountPicker();
      scheduleTocScrollSpy();
      markSearchChrome();
      markCopyPageControls();
    }, { once: true });
  } else {
    mountPicker();
    scheduleTocScrollSpy();
    markSearchChrome();
    markCopyPageControls();
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
    applyTheme(readStoredTheme() || root.dataset.bfDocsTheme || defaultTheme);
    mountPicker();
    markSearchChrome();
    markCopyPageControls();
  });
})();
`;

const llmsLines = [
  '# Bitfield Docs',
  '',
  `> ${manifest.site.description}`,
  '',
  'These pages are public customer documentation. They describe the public product, public Runtime Kit surface, active-device language, and benchmark claim categories.',
  '',
  '## Pages',
  '',
];

for (const page of manifest.pages) {
  llmsLines.push(`- [${page.title}](${page.route}): ${page.summary}`);
}

llmsLines.push(
  '',
  '## Public source categories',
  '',
);

for (const source of sourceMap.sources) {
  llmsLines.push(`- ${source.id}: ${source.publicUse} Freshness rule: ${source.freshness}.`);
}

llmsLines.push(
  '',
  '## Public API surface',
  '',
  '- `@bitfield/runtime-kit`: `sendRequestToBitfieldTarget(...)`',
  '- `@bitfield/runtime-kit/react`: `useBitfieldData(...)`',
  '',
  '## Benchmark boundary',
  '',
);

for (const claim of claimLedger.claims) {
  llmsLines.push(
    `- ${claim.publicLabel}: ${claim.category}. ${claim.mechanism} Not claiming: ${claim.notClaiming.join(' ')}`,
  );
}

llmsLines.push(
  '',
  'Cold storage, network trips, and managed database requests are different categories from warm local reads.',
  '',
);

writeFileSync('docs.json', `${JSON.stringify(docsJson, null, 2)}\n`);
writeFileSync('llms.txt', `${llmsLines.join('\n')}\n`);
writeFileSync('theme.css', `${themeCss}\n`);
writeFileSync('theme.js', themeJs);
