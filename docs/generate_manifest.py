"""
Generate docs/manifest.js and docs/svg-data.js from the source SVG files.
The SVG data bundle lets the docs export icons offline without fetching files.

Run:
  python docs/generate_manifest.py
  python docs/generate_manifest.py --check

The generated file exposes `window.ICON_MANIFEST` which the client can use.
"""
import os
import json
import argparse
from pathlib import Path

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DOCS = os.path.join(ROOT, 'docs')


def taxonomy():
    source = Path(DOCS) / 'categories.json'
    return json.loads(source.read_text(encoding='utf-8')) if source.exists() else {}

def collect():
    variant_root = Path(ROOT) / 'variants'
    light = {p.name: p for p in (variant_root / 'light').glob('*.svg')}
    dark = {p.name: p for p in (variant_root / 'dark').glob('*.svg')}
    if not light or light.keys() != dark.keys():
        raise ValueError('Every icon needs matching light and dark SVG files: ' +
                         ', '.join(sorted(light.keys() ^ dark.keys())))
    manifest = {'icons': []}
    for filename in sorted(light):
        variants = {
            mode: {'filename': f'variants/{mode}/{filename}', 'path': f'../variants/{mode}/{filename}'}
            for mode in ('light', 'dark')
        }
        manifest['icons'].append({'name': Path(filename).stem, **variants['light'], 'variants': variants})
    classification = taxonomy()
    if not classification:
        return manifest
    by_path = {icon['filename']: icon for icons in manifest.values() for icon in icons}
    categorized = {}
    seen = set()
    for category, details in classification.items():
        categorized[category] = []
        for filename in details['icons']:
            if filename not in by_path:
                raise ValueError(f'Category {category} references missing SVG: {filename}')
            if filename in seen:
                raise ValueError(f'SVG appears in multiple categories: {filename}')
            seen.add(filename)
            categorized[category].append(by_path[filename])
        categorized[category].sort(key=lambda icon: (icon['name'].lower(), icon['filename']))
    missing = set(by_path) - seen
    if missing:
        raise ValueError('Add these icons to docs/categories.json: ' + ', '.join(sorted(missing)))
    return {category: icons for category, icons in categorized.items() if icons}

def manifest_text(manifest):
    return ('// Auto-generated icon manifest. Do not edit by hand.\n'
            'window.ICON_MANIFEST = ' +
            json.dumps(manifest, indent=2, ensure_ascii=False) + ';\n' +
            'window.ICON_CATEGORIES = ' + json.dumps({
                category: taxonomy().get(category, {}).get('label', category.title())
                for category in manifest
            }, indent=2, ensure_ascii=False) + ';\n')


def svg_data_text(manifest):
    sources = {
        asset['filename']: (Path(ROOT) / asset['filename']).read_text(encoding='utf-8').strip()
        for icons in manifest.values() for icon in icons
        for asset in icon['variants'].values()
    }
    return ('// Auto-generated SVG data for offline exports. Do not edit by hand.\n'
            'window.ICON_SVG_DATA = ' +
            json.dumps(sources, ensure_ascii=True, separators=(',', ':')) + ';\n')


def write_manifest(manifest):
    os.makedirs(DOCS, exist_ok=True)
    out = os.path.join(DOCS, 'manifest.js')
    with open(out, 'w', encoding='utf-8') as f:
        f.write(manifest_text(manifest))
    (Path(DOCS) / 'svg-data.js').write_text(svg_data_text(manifest), encoding='utf-8')
    print(f'Wrote manifest with {len(manifest)} categories to {out}')

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true',
                        help='Check that the manifest is current without writing files.')
    args = parser.parse_args()
    m = collect()
    if args.check:
        output = Path(DOCS) / 'manifest.js'
        if not output.exists() or output.read_text(encoding='utf-8') != manifest_text(m):
            parser.exit(1, 'Manifest is out of date. Run: python docs/generate_manifest.py\n')
        bundle = Path(DOCS) / 'svg-data.js'
        if not bundle.exists() or bundle.read_text(encoding='utf-8') != svg_data_text(m):
            parser.exit(1, 'SVG data is out of date. Run: python docs/generate_manifest.py\n')
        print(f'Manifest is current: {sum(map(len, m.values()))} icons in {len(m)} categories.')
    else:
        write_manifest(m)
