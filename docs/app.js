(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const disclaimer = $('disclaimerDialog');
  $('disclaimerButton').addEventListener('click', () => disclaimer.showModal());
  $('closeDisclaimer').addEventListener('click', () => disclaimer.close());
  disclaimer.addEventListener('close', () => $('disclaimerButton').focus());
  const { displayName, filterIcons, snippet, variantAsset } = window.IconCatalog;
  const { cleanSVG, copyText } = window.IconAssets;
  const manifest = window.ICON_MANIFEST;
  if (!manifest) {
    $('resultCount').textContent = 'The icon catalog could not load. Please refresh to try again.';
    return;
  }
  const categories = Object.keys(manifest).sort();
  const icons = categories.flatMap(category => manifest[category].map(icon => ({ ...icon, category })))
    .sort((a, b) => a.name.localeCompare(b.name));
  let category = 'all';
  let selected = null;
  let svgText = null;
  let request = 0;
  let toastTimer;
  const categoryNames = window.ICON_CATEGORIES || {};
  const iconsByName = new Map(icons.map(icon => [icon.name, icon]));
  let exportMode = 'light';
  try { exportMode = localStorage.getItem('icon-export-variant') === 'dark' ? 'dark' : 'light'; } catch { /* Use light exports by default. */ }

  function notify(message) {
    $('toast').textContent = message;
    $('toast').classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 3500);
  }
  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    $('themeToggle').setAttribute('aria-pressed', String(theme === 'dark'));
    $('themeToggle').textContent = theme === 'dark' ? '☀ Light' : '◐ Dark';
    document.querySelectorAll('img[data-themed-icon]').forEach(image => {
      const icon = iconsByName.get(image.dataset.themedIcon);
      if (icon) image.src = variantAsset(icon, theme).path;
    });
    try { localStorage.setItem('icon-theme', theme); } catch { /* Storage is optional. */ }
  }
  let theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  try { theme = localStorage.getItem('icon-theme') || theme; } catch { /* Use system preference. */ }
  setTheme(theme === 'dark' ? 'dark' : 'light');
  $('themeToggle').addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));

  function renderCategories() {
    $('categories').replaceChildren();
    for (const value of ['all', ...categories]) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'category-button';
      button.setAttribute('aria-pressed', String(category === value));
      const label = document.createElement('span');
      label.textContent = value === 'all' ? 'All icons' : categoryNames[value] || displayName(value);
      const count = document.createElement('span');
      count.className = 'category-count';
      count.textContent = value === 'all' ? icons.length : manifest[value].length;
      button.append(label, count);
      button.addEventListener('click', () => {
        category = value;
        [...$('categories').children].forEach((item, index) => item.setAttribute('aria-pressed', String(['all', ...categories][index] === value)));
        renderGrid();
      });
      $('categories').append(button);
    }
  }
  function renderGrid() {
    const results = filterIcons(icons, $('search').value, category);
    $('resultCount').textContent = `${results.length} icon${results.length === 1 ? '' : 's'}`;
    $('collectionTitle').textContent = category === 'all' ? 'All icons' : categoryNames[category] || displayName(category);
    $('emptyState').hidden = results.length > 0;
    $('clearSearch').hidden = !$('search').value;
    const fragment = document.createDocumentFragment();
    for (const icon of results) {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'icon-card';
      card.dataset.filename = icon.filename;
      card.setAttribute('aria-label', `Preview ${displayName(icon.name)} (${categoryNames[icon.category] || icon.category})`);
      card.setAttribute('aria-pressed', String(selected?.filename === icon.filename));
      const img = document.createElement('img');
      img.dataset.themedIcon = icon.name;
      img.src = variantAsset(icon, document.documentElement.dataset.theme).path;
      img.alt = ''; img.width = 36; img.height = 36; img.loading = 'lazy';
      const name = document.createElement('span');
      name.textContent = displayName(icon.name);
      const stage = document.createElement('span');
      stage.className = 'icon-stage';
      stage.append(img);
      card.append(stage, name);
      card.addEventListener('click', () => selectIcon(icon, true));
      fragment.append(card);
    }
    $('iconGrid').replaceChildren(fragment);
  }
  function updateSnippet() {
    if (!selected) return;
    const isSVG = $('format').value === 'svg';
    $('code').value = isSVG ? (svgText || '') : snippet(selected, $('format').value, Number($('size').value), exportMode);
    $('copyCode').disabled = !$('code').value;
    $('copyCode').textContent = isSVG ? 'Copy SVG ⧉' : 'Copy snippet ⧉';
    $('previewImage').width = Number($('size').value);
    $('previewImage').height = Number($('size').value);
    $('previewDimensions').textContent = `${$('size').value} × ${$('size').value} px`;
  }
  async function selectIcon(icon, moveFocus = false) {
    selected = icon; svgText = null;
    const currentRequest = ++request;
    const asset = variantAsset(icon, exportMode);
    $('downloadSvg').disabled = true;
    $('assetStatus').textContent = 'Loading SVG…';
    $('selectedName').textContent = displayName(icon.name);
    $('selectedCategory').textContent = categoryNames[icon.category] || icon.category;
    $('selectedPath').textContent = asset.filename;
    $('preview').dataset.variant = exportMode;
    $('previewImage').src = asset.path;
    $('previewImage').alt = `${displayName(icon.name)} logo for ${exportMode} backgrounds`;
    $('previewImage').onerror = () => { $('assetStatus').textContent = 'Preview unavailable. Try another icon.'; };
    document.querySelectorAll('.icon-card').forEach(card => card.setAttribute('aria-pressed', String(card.dataset.filename === icon.filename)));
    updateSnippet();
    if (moveFocus && matchMedia('(max-width: 1100px)').matches) $('selectedName').focus({ preventScroll: false });
    try {
      let source = window.ICON_SVG_DATA?.[asset.filename];
      if (typeof source !== 'string') {
        const response = await fetch(asset.path);
        if (!response.ok) throw new Error('Icon request failed');
        source = await response.text();
      }
      const text = cleanSVG(source);
      const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
      if (doc.querySelector('parsererror') || doc.documentElement.localName !== 'svg') throw new Error('Invalid SVG');
      if (currentRequest !== request) return;
      svgText = text;
      $('downloadSvg').disabled = false;
      updateSnippet();
      $('assetStatus').textContent = `${exportMode === 'dark' ? 'Dark' : 'Light'} variant · SVG · Scales to any size`;
    } catch {
      if (currentRequest === request) {
        $('assetStatus').textContent = 'This icon could not be loaded. Please select it again or refresh the page.';
      }
    }
  }
  async function copy(text, message) {
    if (!text) return;
    const copied = await copyText(text, navigator.clipboard, value => {
      const field = document.createElement('textarea');
      const previousFocus = document.activeElement;
      field.value = value;
      field.setAttribute('aria-label', 'Copy text');
      field.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;';
      document.body.append(field);
      field.focus(); field.select();
      try { return document.execCommand('copy'); }
      finally { field.remove(); previousFocus?.focus({ preventScroll: true }); }
    });
    if (copied) notify(message);
    else {
      $('code').value = text; $('code').focus(); $('code').select();
      notify('Clipboard unavailable. Copy the selected text with Ctrl+C or ⌘C.');
    }
  }
  $('copyCode').addEventListener('click', () => copy($('code').value, $('format').value === 'svg' ? 'SVG copied to clipboard' : 'Snippet copied to clipboard'));
  $('downloadSvg').addEventListener('click', () => {
    if (!svgText || !selected) return;
    const url = URL.createObjectURL(new Blob([svgText], { type: 'image/svg+xml' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selected.name}-${exportMode}.svg`;
    document.body.append(link); link.click(); link.remove();
    // Give browsers time to hand off the Blob to their download manager.
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    notify('SVG download started');
  });
  $('search').addEventListener('input', renderGrid);
  $('clearSearch').addEventListener('click', () => { $('search').value = ''; renderGrid(); $('search').focus(); });
  $('resetFilters').addEventListener('click', () => { category = 'all'; $('search').value = ''; renderCategories(); renderGrid(); $('search').focus(); });
  $('format').addEventListener('change', updateSnippet);
  $('size').addEventListener('change', updateSnippet);
  async function setExportMode(value) {
    exportMode = value === 'dark' ? 'dark' : 'light';
    $('exportVariant').value = exportMode;
    $('quickstartVariant').value = exportMode;
    try { localStorage.setItem('icon-export-variant', exportMode); } catch { /* Preference storage is optional. */ }
    if (selected) await selectIcon(selected);
  }
  $('exportVariant').addEventListener('change', () => setExportMode($('exportVariant').value));
  $('quickstartVariant').addEventListener('change', () => setExportMode($('quickstartVariant').value));
  setExportMode(exportMode);
  document.addEventListener('keydown', event => {
    const editing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
    if ((event.key === '/' && !editing) || ((event.ctrlKey || event.metaKey) && event.key === 'k')) { event.preventDefault(); $('search').focus(); }
    if (event.key === 'Escape' && document.activeElement === $('search')) { $('search').value = ''; renderGrid(); }
  });
  $('totalIcons').textContent = icons.length;
  $('totalCategories').textContent = categories.length;
  renderCategories(); renderGrid();
  if (icons.length) selectIcon(icons.find(icon => icon.name === 'react') || icons[0]);
})();
