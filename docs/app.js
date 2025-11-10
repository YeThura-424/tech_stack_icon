function sanitizeSVG(svgText) {
  return svgText
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<!-- Code injected by live-server -->/g, "");
}

let currentSVGText = null;

function renderSVG(text) {
  const cleaned = sanitizeSVG(text);
  const parser = new DOMParser();
  const doc = parser.parseFromString(cleaned, "image/svg+xml");
  const svg = doc.querySelector("svg");
  if (!svg) return;
  const prev = document.getElementById("preview");
  prev.replaceChildren(svg);
}

async function loadManifest() {
  if (window.ICON_MANIFEST) return window.ICON_MANIFEST;
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "manifest.js";
    s.onload = () =>
      window.ICON_MANIFEST ? resolve(window.ICON_MANIFEST) : reject("manifest loaded but no data");
    s.onerror = () => reject("Failed to load manifest.js");
    document.head.appendChild(s);
  });
}

async function mount() {
  const categoryInput = document.getElementById("categorySearch");
  const categoryList = document.getElementById("categoryList");
  const categoryValue = document.getElementById("categoryValue");

  const iconInput = document.getElementById("iconSearch");
  const iconList = document.getElementById("iconList");
  const iconValue = document.getElementById("iconValue");

  const copyBtn = document.getElementById("copyBtn");
  const downloadBtn = document.getElementById("downloadBtn");
  const cdnSnippetEl = document.getElementById("cdnSnippet");
  const copyUsageBtn = document.getElementById("copyUsageBtn");

  let manifest = await loadManifest();
  let categories = Object.keys(manifest).sort();

  function showCategoryList(list) {
    categoryList.innerHTML = "";
    if (!list || list.length === 0) {
      categoryList.classList.add("hidden");
      return;
    }
    list.forEach((cat) => {
      const div = document.createElement("div");
      div.className = "px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer";
      div.textContent = cat;
      div.dataset.value = cat;
      div.addEventListener("click", () => {
        categoryInput.value = cat;
        categoryValue.value = cat;
        categoryList.classList.add("hidden");
        // enable and populate icons
        iconInput.disabled = false;
        iconInput.value = "";
        iconValue.value = "";
        currentSVGText = null;
        copyBtn.disabled = true;
        downloadBtn.disabled = true;
        document.getElementById("preview").innerHTML = `<p class=\"text-gray-500\">Choose an icon to preview</p>`;
        showIconList(manifest[cat].map(i => ({ name: i.name, path: i.path, filename: i.filename || i.name })), "");
      });
      categoryList.appendChild(div);
    });
    categoryList.classList.remove("hidden");
  }

  function showIconList(list, filter = "") {
    iconList.innerHTML = "";
    if (!list || list.length === 0) {
      iconList.classList.add("hidden");
      return;
    }
    const filtered = list.filter(i => i.name.toLowerCase().includes(filter.toLowerCase()));
    filtered.forEach((i) => {
      const div = document.createElement("div");
      div.className = "px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer flex justify-between items-center";
      div.textContent = i.name;
      div.dataset.path = i.path;
      div.dataset.filename = i.filename;
      div.addEventListener("click", async () => {
        iconInput.value = i.name;
        iconValue.value = i.path;
        iconList.classList.add("hidden");
        // fetch and render
        try {
          const r = await fetch(i.path);
          currentSVGText = await r.text();
          renderSVG(currentSVGText);
          copyBtn.disabled = false;
          downloadBtn.disabled = false;

          // Build CDN snippet using jsDelivr for this repository
          try {
            const filename = i.filename;
            if (filename) {
              const owner = 'YeThura-424';
              const repo = 'img_data';
              const branch = 'main';
              const cdnUrl = `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${branch}/${filename}`;
              if (cdnSnippetEl) cdnSnippetEl.value = cdnUrl;
              if (copyUsageBtn) copyUsageBtn.disabled = false;
            }
          } catch (e) {
            console.warn('Failed to build CDN snippet', e);
          }

        } catch (err) {
          console.error('Failed to fetch icon', err);
        }
      });
      iconList.appendChild(div);
    });
    iconList.classList.remove("hidden");
  }

  // initial category population
  showCategoryList(categories);

  categoryInput.addEventListener("input", () => {
    const val = categoryInput.value.trim();
    if (!val) {
      showCategoryList(categories);
      return;
    }
    const filtered = categories.filter(c => c.toLowerCase().includes(val.toLowerCase()));
    showCategoryList(filtered);
  });

  iconInput.addEventListener("input", () => {
    const cat = categoryValue.value;
    if (!cat || !manifest[cat]) return;
    const list = manifest[cat].map(i => ({ name: i.name, path: i.path, filename: i.filename || i.name }));
    showIconList(list, iconInput.value);
  });

  // hide lists when clicking outside
  document.addEventListener('click', (e) => {
    const target = e.target;
    if (!categoryList.contains(target) && target !== categoryInput) categoryList.classList.add('hidden');
    if (!iconList.contains(target) && target !== iconInput) iconList.classList.add('hidden');
  });

  copyBtn.addEventListener("click", async () => {
    let cleaned = sanitizeSVG(currentSVGText);
    await navigator.clipboard.writeText(cleaned);
    copyBtn.textContent = "Copied!";
    setTimeout(() => (copyBtn.textContent = "Copy SVG"), 800);
  });

  if (copyUsageBtn) {
    copyUsageBtn.addEventListener('click', async () => {
      const text = cdnSnippetEl?.value || '';
      if (!text) return;
      await navigator.clipboard.writeText(text);
      const prev = copyUsageBtn.textContent;
      copyUsageBtn.textContent = 'Copied!';
      setTimeout(() => (copyUsageBtn.textContent = prev), 800);
    });
  }

  downloadBtn.addEventListener("click", () => {
    let cleaned = sanitizeSVG(currentSVGText);
    const blob = new Blob([cleaned], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    // try to get filename from iconValue path or use iconInput name
    const filenameFromValue = iconValue.value ? (iconValue.value.split('/').pop() || 'icon.svg') : null;
    a.download = filenameFromValue || (iconInput.value ? `${iconInput.value}.svg` : "icon.svg");
    a.click();
  });
}

mount();
