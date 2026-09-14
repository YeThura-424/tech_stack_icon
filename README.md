# Free Tech Stack SVG Icons for Developers

A searchable collection of 694 SVG icons, each with light and dark variants, for popular developer
tools, frontend frameworks, backend technologies, databases, cloud platforms,
DevOps tools, AI products, design apps, editors, CLIs, and documentation sites.

Browse the live icon playground: https://tech-icon.netlify.app/docs/

Use these free tech icons in documentation, blogs, dashboards, portfolios,
GitHub READMEs, landing pages, and static sites. Icons are organized by category
and can be copied as raw SVG, downloaded, or embedded through jsDelivr CDN.

---

## Included Icon Categories

The playground groups 694 icons by purpose. Each icon has matching files in
`variants/light/` and `variants/dark/`. Category membership is maintained in
[docs/categories.json](docs/categories.json). All current icon assets live under
`variants/`; use these paths in CDN links and embeds.

| Category | Icons |
| --- | ---: |
| AI & ML | 160 |
| Backend & APIs | 72 |
| Frontend | 92 |
| Languages & formats | 45 |
| Cloud & hosting | 26 |
| Data & databases | 39 |
| Design | 29 |
| DevOps & monitoring | 52 |
| Build & lint | 26 |
| Testing | 14 |
| Mobile & desktop | 12 |
| Browsers | 10 |
| Operating systems | 11 |
| Collaboration | 18 |
| Tech companies | 12 |
| Developer tools | 60 |
| Graphics & game dev | 16 |

Example icon names include `react.svg`, `vuejs.svg`, `nodejs.svg`,
`postgresql.svg`, `aws.svg`, `docker.svg`, `figma.svg`, and AI-related icons.

---

## How To Use The SVG Icons

Choose **Light** for a light project background or **Dark** for a dark one.
The app theme controls gallery and hero icons only. The separate **Icon variant**
selector (also available in Quick start) controls the usage preview, copied SVG,
download, and HTML/CDN/Markdown output. Both preferences are remembered independently.

Downloads include the chosen variant in their filename, such as `github-dark.svg`.
The snippet below uses the light React variant; change `light` to `dark` for its
paired source. CDN URLs require the variant files to be published to the repository.

### jsDelivr CDN

```html
<img
  src="https://cdn.jsdelivr.net/gh/YeThura-424/tech_stack_icon@main/variants/light/react.svg"
  alt="React logo"
/>
```

### Inline SVG

Inline SVG is useful when you need full styling control or accessibility labels.

```html
<svg role="img" aria-labelledby="reactTitle" width="32" height="32" viewBox="...">
  <title id="reactTitle">React</title>
  <!-- SVG paths -->
</svg>
```

### CSS Background Image

```css
.icon-react {
  width: 32px;
  height: 32px;
  background-image: url("/variants/light/react.svg");
  background-size: contain;
  background-repeat: no-repeat;
}
```

---

## Why Use This Icon Library?

- Free SVG tech icons for developer projects and documentation.
- Categorized gallery with matching light and dark SVG sets.
- Works with GitHub Pages, Netlify, static HTML, documentation sites, blogs,
  dashboards, and README files.
- Easy CDN usage with jsDelivr.
- Searchable web playground for previewing, copying, and downloading icons.

---

## Naming Conventions

Icon files use short, lowercase names with no spaces.

Good examples:

- `react.svg`
- `vuejs.svg`
- `nodejs.svg`
- `postgresql.svg`
- `aws.svg`
- `figma.svg`

If an icon is missing, duplicated, misspelled, or in the wrong category, please
open an issue or submit a pull request.

---

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for local setup,
icon guidelines, and verification steps.

1. Fork the repository.
2. Add or update both matching files in `variants/light/` and `variants/dark/`,
   and add the light path to `docs/categories.json`.
3. Optimize SVG files with `svgo` when possible.
4. Regenerate the icon manifest.
5. Submit a pull request describing the icons you added or changed.

After adding or updating icons, run this command from the repository root:

```sh
python docs/generate_manifest.py
python docs/generate_manifest.py --check
```

This updates the manifest and offline SVG data used by the docs site. Include
both `docs/manifest.js` and `docs/svg-data.js` in your pull request.

## Local Development

The docs use plain HTML, CSS, and JavaScript with no dependency installation or
build step. Download or clone the full repository and open `docs/index.html`
directly to browse, copy, and download icons offline. SVG contents are bundled
in `docs/svg-data.js`, so exports do not require a local server. Clipboard access
depends on browser permissions; if automatic copy is blocked, the app selects
the text for manual copying.

For development, you can optionally serve the repository with Python 3:

```sh
python -m http.server 8000 --bind 127.0.0.1
```

Open http://localhost:8000/docs/. Keep the server rooted here so the icon paths
resolve correctly.

The playground includes global search, category filters, light/dark themes,
independent light/dark export variants, adjustable embed sizes, and copyable SVG, HTML, Markdown, and CDN
URLs. Press `/` or `Ctrl+K` / `Cmd+K` to search. SVGs can also be copied or downloaded.

Run the dependency-free checks (Node.js 22+ for JavaScript tests):

```sh
node --test tests/catalog.test.cjs tests/assets.test.cjs tests/app.test.cjs
node --check docs/app.js
python -m unittest discover -s tests -p "test_*.py"
python docs/generate_manifest.py --check
```

---

## Keywords

SVG icons, tech stack icons, developer icons, programming icons, framework
icons, frontend icons, backend icons, database icons, cloud icons, DevOps icons,
AI icons, design tool icons, free SVG icon library, jsDelivr icons, GitHub Pages
icons, documentation icons.

## Disclaimer and removal requests

All icons, logos, trademarks, and related brand assets belong to their respective
organizations, companies, or individuals. This collection helps fellow developers
and designers make their work easier; inclusion does not imply affiliation or
endorsement.

Owners or authorized representatives can [request removal of a brand asset](https://github.com/YeThura-424/tech_stack_icon/issues/new?template=brand-removal.md).
The same notice and link are available through the website's Disclaimer button.
