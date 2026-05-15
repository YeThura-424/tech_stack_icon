# Free Tech Stack SVG Icons for Developers

A searchable collection of 390+ high-quality SVG icons for popular developer
tools, frontend frameworks, backend technologies, databases, cloud platforms,
DevOps tools, AI products, design apps, editors, CLIs, and documentation sites.

Browse the live icon playground: https://tech-icon.netlify.app/docs/

Use these free tech icons in documentation, blogs, dashboards, portfolios,
GitHub READMEs, landing pages, and static sites. Icons are organized by category
and can be copied as raw SVG, downloaded, or embedded through jsDelivr CDN.

---

## Included Icon Categories

- `frontend/` - SVG icons for UI frameworks, JavaScript libraries, CSS tools,
  and design systems.
- `backend/` - SVG icons for server frameworks, programming languages,
  runtimes, and backend tools.
- `database/` - SVG icons for relational databases, NoSQL databases, caches,
  and storage tools.
- `cloud/` - SVG icons for cloud providers, hosting platforms, and cloud
  services.
- `devops/` - SVG icons for containers, CI/CD tools, infrastructure, monitoring,
  and deployment platforms.
- `ai/` - SVG icons for AI platforms, LLM tools, model providers, and AI
  developer products.
- `design/` - SVG icons for design tools, creative apps, and product design
  workflows.
- `tools/` - SVG icons for editors, CLIs, utilities, package managers, and
  developer productivity tools.
- `other/` - SVG icons that do not fit cleanly into the categories above.

Example icon names include `react.svg`, `vuejs.svg`, `nodejs.svg`,
`postgresql.svg`, `aws.svg`, `docker.svg`, `figma.svg`, and AI-related icons.

---

## How To Use The SVG Icons

Replace `<category-folder>` and `<icon-name>.svg` with the icon you want.

### jsDelivr CDN

```html
<img
  src="https://cdn.jsdelivr.net/gh/YeThura-424/img_data@main/<category-folder>/<icon-name>.svg"
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
  background-image: url("/frontend/react.svg");
  background-size: contain;
  background-repeat: no-repeat;
}
```

---

## Why Use This Icon Library?

- Free SVG tech icons for developer projects and documentation.
- Categorized folders for frontend, backend, database, cloud, DevOps, AI,
  design, tools, and other icons.
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

Contributions are welcome.

1. Fork the repository.
2. Add or update icons using the existing category and naming conventions.
3. Optimize SVG files with `svgo` when possible.
4. Regenerate the icon manifest.
5. Submit a pull request describing the icons you added or changed.

After adding or updating icons, run this command from the repository root:

```sh
python .\docs\generate_manifest.py
```

This updates the manifest used by the docs site and icon playground. Include the
updated manifest in your pull request.

---

## Keywords

SVG icons, tech stack icons, developer icons, programming icons, framework
icons, frontend icons, backend icons, database icons, cloud icons, DevOps icons,
AI icons, design tool icons, free SVG icon library, jsDelivr icons, GitHub Pages
icons, documentation icons.
