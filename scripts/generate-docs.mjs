import { readFileSync, writeFileSync } from 'node:fs';

const manifest = JSON.parse(readFileSync('docs.manifest.json', 'utf8'));
const pages = new Map(manifest.pages.map((page) => [page.route, page]));
const themeNames = Object.keys(manifest.site.themes);
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
    strict: false,
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
      href: `${manifest.site.siteUrl}/#pricing`,
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
    .map(([name, value]) => `  --bf-${cssVariableName(name)}: ${value};`)
    .join('\n');

  return `${selector} {\n${variables}\n}`;
}

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
}`,
  '',
  themeBlock(`:root, html[data-bf-docs-theme="${themeNames[0]}"]`, manifest.site.themes[themeNames[0]]),
  ...themeNames
    .slice(1)
    .map((name) => themeBlock(`html[data-bf-docs-theme="${name}"]`, manifest.site.themes[name])),
  `html[data-bf-docs-theme="paper"] {
  color-scheme: light;
}`,
  `html[data-bf-docs-theme="ink"] {
  color-scheme: dark;
}`,
  '',
]
  .filter(Boolean)
  .join('\n\n');

const themeJs = `(() => {
  const themes = ${JSON.stringify(themeNames)};
  const labels = ${JSON.stringify(Object.fromEntries(themeNames.map((name) => [name, name[0].toUpperCase() + name.slice(1)])))};
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
      button.setAttribute('aria-label', \`Switch docs theme. Current theme: \${labels[activeTheme]}.\`);
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
  '## Public API surface',
  '',
  '- `@bitfield/runtime-kit`: `sendRequestToBitfieldTarget(...)`',
  '- `@bitfield/runtime-kit/react`: `useBitfieldData(...)`',
  '',
  '## Benchmark boundary',
  '',
  '- `0.68ns` is a warm local H0 read category.',
  '- `0.59ns` is a batched engine write ceiling category.',
  '- Cold storage, network trips, and managed database requests are different categories.',
  '',
);

writeFileSync('docs.json', `${JSON.stringify(docsJson, null, 2)}\n`);
writeFileSync('llms.txt', `${llmsLines.join('\n')}\n`);
writeFileSync('theme.css', `${themeCss}\n`);
writeFileSync('theme.js', themeJs);
