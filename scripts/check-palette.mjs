import { globSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import githubDark from '@shikijs/themes/github-dark';

const root = process.argv[2] ?? '.';
const installed = (path) => readFileSync(fileURLToPath(new URL(`../node_modules/${path}`, import.meta.url)), 'utf8');
const css = readFileSync(join(root, 'app/global.css'), 'utf8');
const tailwind = installed('tailwindcss/theme.css');
const fumadocsShiki = installed('fumadocs-ui/css/lib/shiki.css');
const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const problems = [];

function block(text, opening) {
  const start = text.indexOf(opening);
  if (start === -1) return undefined;
  let depth = 0;
  for (let at = start + opening.length - 1; at < text.length; at++) {
    if (text[at] === '{') depth++;
    if (text[at] === '}' && --depth === 0) return text.slice(start + opening.length, at);
  }
  return undefined;
}
const declared = (text, name) => text?.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1].trim();
const sameScale = (text, from) => steps.every((step) => declared(text, `color-zinc-${step}`) === declared(tailwind, `color-${from}-${step}`));

const rgbOfHsl = (triplet) => {
  const [h, s, l] = triplet.split(/\s+/).map(parseFloat);
  const a = (s / 100) * Math.min(l / 100, 1 - l / 100);
  const channel = (n) => {
    const k = (n + h / 30) % 12;
    return l / 100 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return [channel(0), channel(8), channel(4)];
};
const rgbOfHex = (hex) => [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16) / 255);
const over = (color, alpha, under) => color.map((channel, at) => channel * alpha + under[at] * (1 - alpha));
const luminance = (rgb) => {
  const [r, g, b] = rgb.map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
};
const expect = (label, ratio) => {
  if (!(ratio >= 4.5)) problems.push(`${label} is ${ratio.toFixed(2)}:1, under 4.5:1`);
};

const footer = readFileSync(join(root, 'components/layout/footer.tsx'), 'utf8');
if (!footer.includes('aria-label="Site footer"')) problems.push('footer.tsx lost aria-label="Site footer", which global.css scopes the real zinc to');
if (!sameScale(block(css, "footer[aria-label='Site footer'] {"), 'zinc')) {
  problems.push("global.css: footer[aria-label='Site footer'] no longer re-declares the 11 --color-zinc-* of tailwindcss/theme.css");
}

const theme = block(css, '@theme {');
if (steps.some((step) => declared(block(css, '@theme inline {'), `color-zinc-${step}`))) {
  problems.push('global.css: the zinc override moved to @theme inline, which the footer cannot override');
}
if (!sameScale(theme, 'slate')) problems.push("global.css: the @theme zinc override no longer matches Tailwind's slate");

const spanRule = block(css, 'figure.shiki:not(.not-fumadocs-codeblock *) code span {');
if (!spanRule?.includes('color: var(--shiki-dark)')) problems.push('global.css: the figure.shiki rule putting code spans on --shiki-dark is gone');
if (!/^\.shiki:not\(\.not-fumadocs-codeblock \*\) \{\s[^]*?code span \{\s*color: var\(--shiki-light\);/m.test(fumadocsShiki)) {
  problems.push('fumadocs-ui css/lib/shiki.css changed the code span selector that the figure.shiki rule outranks');
}

const codeCard = rgbOfHsl(declared(block(css, 'figure.shiki {'), 'fd-card') ?? '0 0% 100%');
const commentOverride = css.match(/--shiki-dark:#6A737D' i\] \{\s*color: (#[0-9a-f]{6});/i)?.[1];
const tokens = [{ scope: 'editor', foreground: githubDark.colors['editor.foreground'] }];
for (const { scope, settings } of githubDark.tokenColors) if (settings.foreground) tokens.push({ scope, ...settings });
// Entries paired with a background (carriage return, diff and git markup) pick their foreground for it; Shiki drops
// token backgrounds, and no content block uses those grammars.
for (const { scope, foreground, background } of tokens) {
  if (background) continue;
  const shown = foreground.toLowerCase() === '#6a737d' && commentOverride ? commentOverride : foreground;
  expect(`GitHub Dark ${[scope].flat()[0]} ${shown}`, contrast(rgbOfHex(shown), codeCard));
}

const sidebar = readFileSync(join(root, 'components/layout/sidebar-nav.tsx'), 'utf8');
const active = sidebar.match(/'bg-([\w-]+)\/(\d+) font-medium text-([\w-]+) dark:bg-([\w-]+)\/(\d+) dark:text-([\w-]+)'/);
if (!active) problems.push('sidebar-nav.tsx: active item classes not found, update the check');
const color = (name) => rgbOfHex(declared(theme, `color-${name}`) ?? '#000000');

for (const [mode, selector] of [
  ['light', ':root {'],
  ['dark', '.dark {'],
]) {
  const tokensOf = block(css, selector);
  const surface = (name) => rgbOfHsl(declared(tokensOf, name));
  for (const name of ['background', 'card', 'muted']) {
    expect(`${mode} muted-foreground on ${name}`, contrast(surface('muted-foreground'), surface(name)));
  }
  if (active) {
    const [tint, alpha, text] = mode === 'light' ? active.slice(1, 4) : active.slice(4, 7);
    const behind = over(color(tint), alpha / 100, surface('background'));
    expect(`${mode} sidebar active text ${text} on ${tint}/${alpha}`, contrast(color(text), behind));
  }
}

const shellBorder = /(?:^|[\s'"`:])((?:border(?:-[trblxy])?|divide(?:-[xy])?)-(?:zinc-100|zinc-500\/5|white\/6))(?![\w./])/g;
for (const file of globSync('{app,components}/**/*.tsx', { cwd: root })) {
  for (const [, border] of readFileSync(join(root, file), 'utf8').matchAll(shellBorder)) {
    problems.push(`${file}: ${border}, too faint on the tinted palette`);
  }
}

if (problems.length) {
  console.error(`${problems.length} palette problems:\n${problems.join('\n')}`);
  process.exit(1);
}
console.log('ok: footer zinc, slate override, dark code tokens, muted text and sidebar contrast, shell borders');
