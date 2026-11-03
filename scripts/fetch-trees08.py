"""Offline CC0 tree asset preparation; pinned originals, not a game/test runner."""
from pathlib import Path
import json,subprocess,base64,hashlib
root=Path(__file__).resolve().parents[1]
for entry in json.loads((root/'web/assets/licenses/Trees-DEV08.json').read_text()):
 data=base64.b64decode(subprocess.check_output(['gh','api','repos/trebeljahr/quaternius-showcase/git/blobs/'+entry['blob'],'--jq','.content']))
 if hashlib.sha256(data).hexdigest()!=entry['sha256']:raise ValueError('Original asset SHA-256 mismatch')
 dest=root/entry['file'];dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(data)
 print('Prepared CC0 tree:',dest.name)
