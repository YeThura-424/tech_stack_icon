const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const context = { window: {} };
if (fs.existsSync('docs/assets.js')) vm.runInNewContext(fs.readFileSync('docs/assets.js', 'utf8'), context);

test('Live Server reload scripts are removed before SVG validation and export', () => {
  assert.ok(context.window.IconAssets, 'SVG export helpers exist');
  const svg = '<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0L1 1"/></svg>';
  const injection = '<!-- Code injected by live-server --><script>if (a < b && c) reload();</script>';
  assert.equal(context.window.IconAssets.cleanSVG(svg.replace('</svg>', injection + '</svg>')), svg);
  assert.equal(context.window.IconAssets.cleanSVG(svg + injection), svg);
  assert.equal(context.window.IconAssets.cleanSVG(svg), svg);
});

test('copy falls back when Clipboard API is absent or permission is denied', async () => {
  assert.ok(context.window.IconAssets, 'SVG export helpers exist');
  const { copyText } = context.window.IconAssets;
  let copied = '';
  const legacy = text => { copied = text; return true; };
  assert.equal(await copyText('<svg/>', null, legacy), true);
  assert.equal(copied, '<svg/>');
  copied = '';
  assert.equal(await copyText('snippet', { writeText: async () => { throw new Error('Denied'); } }, legacy), true);
  assert.equal(copied, 'snippet');
  assert.equal(await copyText('snippet', null, () => false), false);
});
