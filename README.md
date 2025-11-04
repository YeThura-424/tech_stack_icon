# High‑quality Tech Stack SVG Icons

Collection of high-quality SVG icons for popular developer tools,
frameworks, cloud providers and design apps. This repository organizes icons by
category (frontend, backend, database, cloud, devops, ai, design, tools, other)
and is intended to be used in documentation sites, blogs, dashboards, or
GitHub Pages.

---

## Goals
- Provide a ready-to-use, categorized collection of SVG tech icons.
- Make it trivial to use icons in static sites (GitHub Pages) and docs.
- Provide guidelines for accessibility, optimization and contribution.


---

## How to use
Below are common consumption patterns. Replace `<category-folder>` and `<iconname.svg>` with your needs.


1) GitHub Pages URL:

```html
<img src="https://yethura-424.github.io/tech_stack_icon/<category-folder>/<icon-name.svg>" alt="React logo">
```

3) Inline SVG (recommended for styling and accessibility):

Copy the `.svg` contents and paste inline in HTML. This allows changing color
with CSS and adding accessible text.

```html
<svg role="img" aria-labelledby="reactTitle" width="32" height="32" viewBox="...">
  <title id="reactTitle">React</title>
  <!-- rest of svg -->
</svg>
```

4) CSS background-image:

```css
.icon-react { background-image: url('/frontend/react.svg'); width: 32px; height: 32px; }
```

---

## Naming conventions and categories
Files are named with short, lowercase names (no spaces). Examples:
- `react.svg`, `vuejs.svg`, `nodejs.svg`, `postgresql.svg`, `aws.svg`, `figma.svg`.

Top-level category folders and their intended contents:
- `frontend/` — UI frameworks, libraries, CSS, design systems
- `backend/` — server frameworks, languages, runtimes
- `database/` — relational & NoSQL DB logos
- `cloud/` — cloud providers and platforms
- `devops/` — container, CI/CD, infra tooling
- `ai/` — LLM / AI platform logos and models
- `design/` — design tools and creative apps
- `tools/` — CLIs, editors, utilities
- `other/` — uncategorized or ambiguous icons

If an icon is miss-categorized, open an issue or submit a PR. You can also
suggest category changes.

---

## Contributing
Contributions are welcome. A minimal CONTRIBUTING workflow:
1. Fork the repo.
2. Add or update icons, following the naming and folder conventions.
3. Optimize SVGs (optional but recommended) with `svgo`.
4. Submit a PR describing which icons you added/changed and why.

---
