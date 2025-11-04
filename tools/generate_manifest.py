"""
Generate a small JS manifest at docs/manifest.js mapping top-level folders
to their SVG files. This does NOT copy any files into docs/.

Run:
  python tools\generate_manifest.py

The generated file exposes `window.ICON_MANIFEST` which the client can use.
"""
import os
import json

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DOCS = os.path.join(ROOT, 'docs')

def is_top_level_dir(p):
    return os.path.isdir(p) and os.path.basename(p) != 'docs'

def collect():
    manifest = {}
    for name in sorted(os.listdir(ROOT)):
        path = os.path.join(ROOT, name)
        if not is_top_level_dir(path):
            continue
        # collect .svg files in this category folder (non-recursive)
        svgs = []
        for fn in sorted(os.listdir(path)):
            if fn.lower().endswith('.svg'):
                rel = f"{name}/{fn}"  # relative to repo root
                # path from docs/index.html to icon file is ../<rel>
                svgs.append({
                    'name': os.path.splitext(fn)[0],
                    'path': f'../{rel}',
                    'filename': rel
                })
        if svgs:
            manifest[name] = svgs
    return manifest

def write_manifest(manifest):
    os.makedirs(DOCS, exist_ok=True)
    out = os.path.join(DOCS, 'manifest.js')
    with open(out, 'w', encoding='utf-8') as f:
        f.write('// Auto-generated icon manifest. Do not edit by hand.\n')
        f.write('window.ICON_MANIFEST = ')
        json.dump(manifest, f, indent=2, ensure_ascii=False)
        f.write(';\n')
    print(f'Wrote manifest with {len(manifest)} categories to {out}')

if __name__ == '__main__':
    m = collect()
    write_manifest(m)
