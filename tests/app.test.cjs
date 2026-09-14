// DOM and browser APIs are boundary fakes; the real app's registered handlers
// are exercised to verify selection, copy payloads, and downloaded Blob bytes.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

async function mount(response, options = {}) {
  const nodes = new Map();
  const downloads = [];
  let copied;
  let fetchCalls = 0;
  class Element {
    constructor(tag = 'DIV') { this.tagName = tag; this.children = []; this.dataset = {}; this.handlers = {}; this.value = ''; this.classList = { add() {}, remove() {} }; }
    setAttribute(key, value) { this[key] = value; }
    append(...children) { this.children.push(...children); }
    replaceChildren(...children) { this.children = children; }
    addEventListener(name, handler) { this.handlers[name] = handler; }
    focus() { document.activeElement = this; }
    showModal() { this.open = true; }
    close() { this.open = false; this.handlers.close?.(); }
    remove() {}
    select() {}
    click() { if (this.tagName === 'A') downloads.push(this); else return this.handlers.click?.(); }
  }
  const html = fs.readFileSync('docs/index.html', 'utf8');
  for (const [, id] of html.matchAll(/id="([^"]+)"/g)) nodes.set(id, new Element());
  const document = {
    getElementById: id => nodes.get(id),
    createElement: tag => new Element(tag.toUpperCase()),
    createDocumentFragment: () => new Element(),
    querySelectorAll: selector => {
      const descendants = element => [element, ...element.children.flatMap(descendants)];
      const elements = [...nodes.values()].flatMap(descendants);
      if (selector === 'img[data-themed-icon]') return elements.filter(element => element.dataset.themedIcon);
      if (selector === '.icon-card') return elements.filter(element => element.className === 'icon-card');
      return [];
    },
    addEventListener() {},
    body: new Element('BODY'),
    documentElement: new Element('HTML'),
    activeElement: new Element('BODY'),
  };
  nodes.get('size').value = '64';
  nodes.get('format').value = 'html';
  const preferences = new Map();
  if (options.theme) preferences.set('icon-theme', options.theme);
  if (options.exportVariant) preferences.set('icon-export-variant', options.exportVariant);
  const context = {
    window: {}, document, location: { protocol: options.protocol || 'http:' }, Blob, URL,
    navigator: { clipboard: { async writeText(text) { copied = text; } } },
    localStorage: { getItem(key) { return preferences.get(key) || null; }, setItem(key, value) { preferences.set(key, value); } },
    matchMedia: () => ({ matches: false }),
    setTimeout() {}, clearTimeout() {},
    fetch: async () => {
      fetchCalls++;
      if (options.protocol === 'file:') throw new Error('Local file fetch blocked');
      return response;
    },
    DOMParser: class {
      parseFromString(text) {
        assert.doesNotMatch(text, /<script\b|Code injected by live-server/);
        return { querySelector: () => null, documentElement: { localName: 'svg' } };
      }
    },
  };
  vm.createContext(context);
  const scripts = ['catalog', 'assets', 'manifest'];
  if (options.bundled && fs.existsSync('docs/svg-data.js')) scripts.push('svg-data');
  for (const name of [...scripts, 'app']) vm.runInContext(fs.readFileSync(`docs/${name}.js`, 'utf8'), context);
  await new Promise(resolve => setImmediate(resolve));
  return { nodes, downloads, document, copied: () => copied, fetchCalls: () => fetchCalls };
}

test('opening docs directly exports bundled SVG without fetching local files', async () => {
  // The generated bundle uses consistent LF newlines on every platform.
  const svg = fs.readFileSync('variants/light/react.svg', 'utf8').replace(/\r\n/g, '\n').trim();
  const page = await mount(null, { protocol: 'file:', bundled: true });
  page.nodes.get('format').value = 'svg';
  page.nodes.get('format').handlers.change();
  assert.equal(page.nodes.get('copyCode').disabled, false);
  assert.equal(page.nodes.get('downloadSvg').disabled, false);
  assert.equal(page.fetchCalls(), 0);
  await page.nodes.get('copyCode').click();
  assert.equal(page.copied(), svg);
  page.nodes.get('downloadSvg').click();
  assert.equal(await (await fetch(page.downloads[0].href)).text(), svg);
  URL.revokeObjectURL(page.downloads[0].href);
});

test('selecting an SVG with live-reload injection enables copy and downloads clean SVG bytes', async () => {
  const svg = fs.readFileSync('variants/light/react.svg', 'utf8').trim();
  const injected = svg.replace('</svg>', '<!-- Code injected by live-server --><script>if (a < b && c) reload();</script></svg>');
  const page = await mount({ ok: true, text: async () => injected });
  page.nodes.get('format').value = 'svg';
  page.nodes.get('format').handlers.change();
  assert.equal(page.nodes.get('copyCode').disabled, false);
  assert.equal(page.nodes.get('downloadSvg').disabled, false);
  await page.nodes.get('copyCode').click();
  assert.equal(page.copied(), svg);
  page.nodes.get('downloadSvg').click();
  assert.equal(page.downloads.length, 1);
  assert.equal(page.downloads[0].download, 'react-light.svg');
  assert.equal(await (await fetch(page.downloads[0].href)).text(), svg);
  URL.revokeObjectURL(page.downloads[0].href);
});

test('failed SVG requests show a visible error and do not enable broken exports', async () => {
  const page = await mount({ ok: false });
  page.nodes.get('format').value = 'svg';
  page.nodes.get('format').handlers.change();
  assert.equal(page.nodes.get('copyCode').disabled, true);
  assert.equal(page.nodes.get('downloadSvg').disabled, true);
  assert.match(page.nodes.get('assetStatus').textContent, /This icon could not be loaded/);
});

test('app theme and export variant remain independent across previews, copies, downloads and embeds', async () => {
  const page = await mount(null, { protocol: 'file:', bundled: true, theme: 'light' });
  const githubCard = page.document.querySelectorAll('.icon-card').find(card => card.dataset.filename === 'variants/light/github.svg');
  await githubCard.click();
  const galleryImage = () => page.document.querySelectorAll('img[data-themed-icon]').find(image => image.dataset.themedIcon === 'github');
  assert.equal(galleryImage().src, '../variants/light/github.svg');
  page.nodes.get('exportVariant').value = 'dark';
  await page.nodes.get('exportVariant').handlers.change();
  assert.equal(page.nodes.get('quickstartVariant').value, 'dark');
  assert.equal(page.nodes.get('previewImage').src, '../variants/dark/github.svg');
  assert.equal(galleryImage().src, '../variants/light/github.svg');
  const darkSVG = fs.readFileSync('variants/dark/github.svg', 'utf8').replace(/\r\n/g, '\n').trim();
  page.nodes.get('format').value = 'svg';
  page.nodes.get('format').handlers.change();
  await page.nodes.get('copyCode').click();
  assert.equal(page.copied(), darkSVG);
  page.nodes.get('downloadSvg').click();
  assert.equal(page.downloads[0].download, 'github-dark.svg');
  assert.equal(await (await fetch(page.downloads[0].href)).text(), darkSVG);
  URL.revokeObjectURL(page.downloads[0].href);
  for (const format of ['html', 'url', 'markdown']) {
    page.nodes.get('format').value = format;
    page.nodes.get('format').handlers.change();
    assert.match(page.nodes.get('code').value, /variants\/dark\/github\.svg/);
  }
  page.nodes.get('themeToggle').click();
  assert.equal(galleryImage().src, '../variants/dark/github.svg');
  assert.equal(page.nodes.get('exportVariant').value, 'dark');
  page.nodes.get('quickstartVariant').value = 'light';
  await page.nodes.get('quickstartVariant').handlers.change();
  assert.equal(page.nodes.get('exportVariant').value, 'light');
  assert.equal(page.nodes.get('previewImage').src, '../variants/light/github.svg');
  assert.match(page.nodes.get('code').value, /variants\/light\/github\.svg/);
  assert.equal(galleryImage().src, '../variants/dark/github.svg');
  page.nodes.get('themeToggle').click();
  assert.equal(page.nodes.get('exportVariant').value, 'light');
  assert.equal(galleryImage().src, '../variants/light/github.svg');
});

test('saved dark app theme does not override the independently saved light export', async () => {
  const page = await mount(null, { protocol: 'file:', bundled: true, theme: 'dark', exportVariant: 'light' });
  assert.equal(page.document.documentElement.dataset.theme, 'dark');
  assert.equal(page.nodes.get('exportVariant').value, 'light');
  assert.equal(page.nodes.get('previewImage').src, '../variants/light/react.svg');
});

test('disclaimer opens as a modal and closing restores focus to its button', async () => {
  const page = await mount(null, { protocol: 'file:', bundled: true });
  assert.ok(page.nodes.get('disclaimerButton'), 'Disclaimer button is available');
  page.nodes.get('disclaimerButton').click();
  assert.equal(page.nodes.get('disclaimerDialog').open, true);
  page.nodes.get('closeDisclaimer').click();
  assert.equal(page.nodes.get('disclaimerDialog').open, false);
  assert.equal(page.document.activeElement, page.nodes.get('disclaimerButton'));
});
