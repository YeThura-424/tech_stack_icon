const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const context = { window: {} };
const source = 'docs/catalog.js';
if (fs.existsSync(source)) vm.runInNewContext(fs.readFileSync(source, 'utf8'), context);
const icons = [
  { name: 'react', category: 'frontend', filename: 'variants/light/react.svg' },
  { name: 'reactnative', category: 'mobile', filename: 'variants/light/reactnative.svg' },
  { name: 'nodejs', category: 'backend', filename: 'variants/light/nodejs.svg' },
];

test('search works across categories and tolerates spaces and case', () => {
  assert.ok(context.window.IconCatalog, 'catalog search is available');
  const result = context.window.IconCatalog.filterIcons(icons, '  REACT  ', 'all');
  assert.equal(result.length, 2);
  assert.equal(context.window.IconCatalog.filterIcons(icons, 'react', 'frontend').length, 1);
  assert.equal(context.window.IconCatalog.filterIcons(icons, 'missing', 'all').length, 0);
});

test('copy formats produce usable HTML, Markdown and encoded CDN URLs', () => {
  assert.ok(context.window.IconCatalog, 'snippet generator is available');
  const { snippet } = context.window.IconCatalog;
  const url = 'https://cdn.jsdelivr.net/gh/YeThura-424/tech_stack_icon@main/variants/light/react.svg';
  assert.equal(snippet(icons[0], 'url', 32), url);
  assert.equal(snippet(icons[0], 'html', 32), `<img src="${url}" alt="React" width="32" height="32" />`);
  assert.equal(snippet(icons[0], 'markdown', 32), `![React](${url})`);
  assert.match(snippet({ name: 'a', filename: 'variants/light/a b.svg' }, 'url', 32), /a%20b\.svg$/);
});

test('embed formats use the chosen SVG variant path', () => {
  const icon = { name: 'github', filename: 'variants/light/github.svg', variants: {
    light: { filename: 'variants/light/github.svg', path: '../variants/light/github.svg' },
    dark: { filename: 'variants/dark/github.svg', path: '../variants/dark/github.svg' },
  } };
  const { snippet } = context.window.IconCatalog;
  assert.equal(snippet(icon, 'url', 32, 'dark'), 'https://cdn.jsdelivr.net/gh/YeThura-424/tech_stack_icon@main/variants/dark/github.svg');
  assert.match(snippet(icon, 'html', 32, 'light'), /variants\/light\/github\.svg/);
  assert.match(snippet(icon, 'markdown', 32, 'dark'), /variants\/dark\/github\.svg/);
});
