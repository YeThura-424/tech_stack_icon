# Contributing

Thanks for helping grow Tech Stack Icons. Small fixes, docs improvements, and new icons are welcome.

## Run the docs locally

Open `docs/index.html` directly from a full checkout to browse, copy, and download
icons offline. No server or frontend dependencies are required. The checked-in
`docs/svg-data.js` bundle provides SVG contents without local file fetches.

For development, an optional Python 3 server is convenient:

```sh
git clone https://github.com/YeThura-424/tech_stack_icon.git
cd tech_stack_icon
python -m http.server 8000 --bind 127.0.0.1
```

Open http://localhost:8000/docs/. Serve from the repository root so the docs can load icon images from their source folders. Browser clipboard permissions may require manual copying; the app selects the text when automatic copy is unavailable.

## Add or update an icon

1. Add both `variants/light/<name>.svg` and `variants/dark/<name>.svg`. Light variants must be readable on light backgrounds and dark variants on dark backgrounds. Use the actual supplied artwork for each; do not recolor it at runtime.
2. Use exactly the same filename, including case, in both folders. Check for an existing icon before adding a duplicate. Preserve existing paths because projects may link to them.
3. Use a valid SVG with a `viewBox`. Keep original brand proportions and colors. Avoid embedded scripts, event handlers, external resources, and unnecessary editor metadata.
4. Include the icon's source and any applicable usage terms in your pull request. Only contribute assets you are allowed to redistribute.
5. Add the `variants/light/<name>.svg` source path to exactly one category in `docs/categories.json`. Choose by primary purpose (for example, Python goes in Languages & formats, Cypress in Testing, and Chrome in Browsers).
6. Regenerate the catalog from the repository root:

```sh
python docs/generate_manifest.py
python docs/generate_manifest.py --check
```

Include `docs/categories.json`, `docs/manifest.js`, and `docs/svg-data.js` in your pull request. Do not edit the generated files manually. Generation rejects missing variant pairs, missing files, duplicate assignments, and uncategorized icons. Both variant sources are bundled for offline exports.

## Change the docs

- `docs/index.html`: page structure and metadata.
- `docs/styles.css`: responsive layout and theme colors.
- `docs/catalog.js`: search and snippet formatting.
- `docs/categories.json`: reviewed category assignments and display labels.
- `docs/assets.js`: Live Server SVG cleanup and clipboard compatibility.
- `docs/app.js`: browser interactions, previews, copy, and downloads.
- `docs/generate_manifest.py`: deterministic catalog and offline SVG bundle generation, with freshness checks for both.
- `docs/svg-data.js`: generated SVG source data for server-free copy and download; regenerate after changing any SVG.

Run these checks from the repository root. JavaScript tests use Node.js 22 or newer and its built-in test runner; no installation is needed.

```sh
node --test tests/catalog.test.cjs tests/assets.test.cjs tests/app.test.cjs
node --check docs/app.js
python -m unittest discover -s tests -p "test_*.py"
python docs/generate_manifest.py --check
```

In a browser, verify global search, category filters, an empty search result, keyboard navigation, both themes, and mobile layout. Select several icons rapidly, check the final preview, copy each snippet format, and download an SVG. Test app theme and export variant in all four combinations. App theme changes must only change gallery/hero icons. The Quick start and usage variant selectors must stay synchronized and update the preview, copied SVG bytes, download filename/content, and every embed URL without changing app theme. Also open `docs/index.html` directly and test copy/download with no server running.

## Pull requests

Explain what changed and why. For UI changes, include desktop and mobile screenshots. For new icons, list their source, category, and filenames. Mention the checks you ran.
