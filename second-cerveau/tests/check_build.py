"""Build exactly the Pages artifact and parse/check every executable inline script."""
from html.parser import HTMLParser
from pathlib import Path
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[2]

class Scripts(HTMLParser):
    def __init__(self):
        super().__init__()
        self.active = False
        self.blocks = []
        self.buffer = []
    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if tag == 'script':
            self.active = not values.get('src') and values.get('type', '') in ('', 'module', 'text/javascript')
            self.buffer = []
    def handle_data(self, value):
        if self.active:
            self.buffer.append(value)
    def handle_endtag(self, tag):
        if tag == 'script' and self.active:
            self.blocks.append(''.join(self.buffer))
            self.active = False

with tempfile.TemporaryDirectory(prefix='second-cerveau-v53-') as output:
    subprocess.run(['node', str(ROOT / 'second-cerveau/build_site.cjs'), output], check=True)
    page = Path(output, 'index.html').read_text()
    reader = Scripts()
    reader.feed(page)
    assert len(reader.blocks) >= 7, 'Missing app module'
    assert page.count("window.SecondBrainDriveV53=") == 1, 'Drive module must be included once'
    assert page.count("const KEY = 'spiritual-ladder-local-v1'") == 1
    assert page.count("const STORE = 'second-brain-40days-focus-v1'") == 1
    assert 'https://www.googleapis.com/auth/drive.appdata' in page
    assert 'https://www.googleapis.com/auth/drive.file' not in page
    assert 'https://www.googleapis.com/auth/drive\'' not in page
    for i, block in enumerate(reader.blocks):
        script = Path(output, f'inline-{i}.js')
        script.write_text(block)
        subprocess.run(['node', '--check', str(script)], check=True)
    print(f'PASS: complete Pages build and syntax of {len(reader.blocks)} inline scripts')
