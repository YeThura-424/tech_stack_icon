"""Validate catalog freshness checks against a temporary repository."""
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
import json


class ManifestTests(unittest.TestCase):
    def test_pairs_variants_and_bundles_both_sources(self):
        script = Path(__file__).resolve().parents[1] / 'docs' / 'generate_manifest.py'
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / 'docs').mkdir()
            local_script = root / 'docs' / script.name
            local_script.write_text(script.read_text(encoding='utf-8'), encoding='utf-8')
            for variant, color in [('light', 'black'), ('dark', 'white')]:
                folder = root / 'variants' / variant
                folder.mkdir(parents=True)
                (folder / 'example.svg').write_text(f'<svg fill="{color}"/>', encoding='utf-8')
            (root / 'docs' / 'categories.json').write_text(json.dumps({
                'tools': {'label': 'Tools', 'icons': ['variants/light/example.svg']}
            }), encoding='utf-8')
            result = subprocess.run([sys.executable, str(local_script)], capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stderr)
            bundle = (root / 'docs' / 'svg-data.js').read_text(encoding='utf-8')
            data = json.loads(bundle.split('window.ICON_SVG_DATA = ', 1)[1].strip().rstrip(';'))
            self.assertEqual(data['variants/light/example.svg'], '<svg fill="black"/>')
            self.assertEqual(data['variants/dark/example.svg'], '<svg fill="white"/>')
            (root / 'variants' / 'dark' / 'example.svg').unlink()
            result = subprocess.run([sys.executable, str(local_script)], capture_output=True, text=True)
            self.assertNotEqual(result.returncode, 0, 'Missing variant must fail generation')

    def test_check_detects_new_and_removed_icons_without_writing(self):
        script = Path(__file__).resolve().parents[1] / 'docs' / 'generate_manifest.py'
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / 'docs').mkdir()
            (root / 'variants' / 'light').mkdir(parents=True)
            (root / 'variants' / 'dark').mkdir(parents=True)
            for mode in ['light', 'dark']:
                (root / 'variants' / mode / 'keep.svg').write_text('<svg/>', encoding='utf-8')
            local_script = root / 'docs' / script.name
            local_script.write_text(script.read_text(encoding='utf-8'), encoding='utf-8')
            icon = root / 'variants' / 'light' / 'example.svg'
            dark_icon = root / 'variants' / 'dark' / 'example.svg'
            dark_icon.write_text('<svg/>', encoding='utf-8')
            icon.write_text('<svg xmlns="http://www.w3.org/2000/svg"/>', encoding='utf-8')
            def run(*args):
                return subprocess.run([sys.executable, str(local_script), *args], capture_output=True, text=True)
            self.assertEqual(run().returncode, 0)
            self.assertEqual(run('--check').returncode, 0)
            manifest = root / 'docs' / 'manifest.js'
            icon.write_text('<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0L1 1"/></svg>', encoding='utf-8')
            self.assertEqual(run('--check').returncode, 1, 'Changing SVG contents must invalidate the offline bundle')
            self.assertEqual(run().returncode, 0)
            self.assertEqual(run('--check').returncode, 0)
            original = manifest.read_bytes()
            icon.unlink()
            dark_icon.unlink()
            self.assertEqual(run('--check').returncode, 1)
            self.assertEqual(manifest.read_bytes(), original)
            self.assertEqual(run().returncode, 0)
            self.assertEqual(run('--check').returncode, 0)
            icon.write_text('<svg/>', encoding='utf-8')
            self.assertEqual(run('--check').returncode, 1)

    def test_catalog_categories_preserve_existing_asset_urls(self):
        script = Path(__file__).resolve().parents[1] / 'docs' / 'generate_manifest.py'
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / 'docs').mkdir()
            (root / 'variants' / 'light').mkdir(parents=True)
            (root / 'variants' / 'dark').mkdir(parents=True)
            local_script = root / 'docs' / script.name
            local_script.write_text(script.read_text(encoding='utf-8'), encoding='utf-8')
            for mode in ['light', 'dark']:
                (root / 'variants' / mode / 'python.svg').write_text('<svg/>', encoding='utf-8')
            (root / 'docs' / 'categories.json').write_text(json.dumps({
                'languages': {'label': 'Languages', 'icons': ['variants/light/python.svg']}
            }), encoding='utf-8')
            result = subprocess.run([sys.executable, str(local_script)], capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stderr)
            output = (root / 'docs' / 'manifest.js').read_text(encoding='utf-8')
            self.assertIn('"languages": [', output)
            self.assertIn('"filename": "variants/light/python.svg"', output)
            self.assertIn('"path": "../variants/light/python.svg"', output)


if __name__ == '__main__':
    unittest.main()
