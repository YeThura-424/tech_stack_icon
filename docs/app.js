function sanitizeSVG(svgText) {
  return svgText
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<!-- Code injected by live-server -->/g, "")
}

let currentSVGText = null;

function renderSVG(text) {
  const cleaned = sanitizeSVG(text);
  const parser = new DOMParser();
  const doc = parser.parseFromString(cleaned, "image/svg+xml");
  const svg = doc.querySelector("svg");
  if (!svg) return;
  document.getElementById("preview").replaceChildren(svg);
}

async function loadManifest() {
  if (window.ICON_MANIFEST) return window.ICON_MANIFEST;
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "manifest.js";
    s.onload = () =>
      window.ICON_MANIFEST
        ? resolve(window.ICON_MANIFEST)
        : reject("manifest loaded but no data");
    s.onerror = () => reject("Failed to load manifest.js");
    document.head.appendChild(s);
  });
}

async function mount() {
  const catSel = document.getElementById("category");
  const iconSel = document.getElementById("icon");
  const catSearch = document.getElementById("categorySearch");
  const iconSearch = document.getElementById("iconSearch");
  const copyBtn = document.getElementById("copyBtn");
  const downloadBtn = document.getElementById("downloadBtn");
  const cdnSnippetEl = document.getElementById("cdnSnippet");
  const copyUsageBtn = document.getElementById("copyUsageBtn");

  let manifest = await loadManifest();
  let categories = Object.keys(manifest).sort();

  function populateCategories(list) {
    catSel.innerHTML = `<option value="">Select category</option>`;
    list.forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat;
      option.textContent = cat;
      catSel.appendChild(option);
    });
  }
  populateCategories(categories);

  function populateIcons(cat, filter = "") {
    iconSel.innerHTML = `<option value="">Select icon</option>`;
    if (!cat) return;

    manifest[cat]
      .filter((i) => i.name.toLowerCase().includes(filter.toLowerCase()))
      .forEach((i) => {
        const opt = document.createElement("option");
        opt.value = i.path;
        opt.textContent = i.name;
        opt.dataset.filename = i.filename || i.name;
        iconSel.appendChild(opt);
      });

    iconSel.disabled = false;
  }

  catSearch.addEventListener("input", () =>
    populateCategories(
      categories.filter((c) =>
        c.toLowerCase().includes(catSearch.value.toLowerCase())
      )
    )
  );

  catSel.addEventListener("change", () => {
    populateIcons(catSel.value);
    currentSVGText = null;
    copyBtn.disabled = true;
    downloadBtn.disabled = true;
    document.getElementById(
      "preview"
    ).innerHTML = `<p class="text-gray-500">Select icon</p>`;
  });

  iconSearch.addEventListener("input", () =>
    populateIcons(catSel.value, iconSearch.value)
  );

  iconSel.addEventListener("change", async () => {
    if (!iconSel.value) return;

    const r = await fetch(iconSel.value);
    currentSVGText = await r.text();
    renderSVG(currentSVGText);
    copyBtn.disabled = false;
    downloadBtn.disabled = false;

    // Build CDN snippet using jsDelivr for this repository
    try {
      const filename = iconSel.selectedOptions[0]?.dataset.filename;
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
  });

  copyBtn.addEventListener("click", async () => {
    let cleaned = sanitizeSVG(currentSVGText)
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
    let cleaned = sanitizeSVG(currentSVGText)
    const blob = new Blob([cleaned], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = iconSel.selectedOptions[0]?.dataset.filename || "icon.svg";
    a.click();
  });
}

mount();
