"""Reproducible licensed upstream assets. Uses GitHub API, no scraped/paid game content."""
import subprocess, pathlib, json, hashlib, time
ROOT=pathlib.Path(__file__).resolve().parents[1]
assets=[]
def fetch(repo,path,dest):
 out=ROOT/dest;out.parent.mkdir(parents=True,exist_ok=True)
 if not out.exists() or out.stat().st_size<20 or (out.suffix=='.glb' and out.read_bytes()[:4]!=b'glTF'):
  temp=out.with_suffix(out.suffix+'.partial')
  for attempt in range(3):
   try:
    with temp.open('wb') as f: subprocess.run(['gh','api',f'repos/{repo}/contents/{path}','-H','Accept: application/vnd.github.raw+json'],stdout=f,check=True)
    if out.suffix=='.glb' and temp.read_bytes()[:4]!=b'glTF': raise ValueError('Upstream returned a non-GLB response')
    temp.replace(out);break
   except (subprocess.CalledProcessError,ValueError):
    if attempt==2: raise
    time.sleep(attempt+1)
 assets.append(dict(file=dest,source=f'https://github.com/{repo}/blob/HEAD/{path}',sha256=hashlib.sha256(out.read_bytes()).hexdigest()))
bab='BabylonJS/Assets';q='trebeljahr/quaternius-showcase'
for name in ['BroadleafBark.jpg','BroadleafBark_Normal.png','Broadleaf_Desktop_Atlas.png','Broadleaf_Desktop_Atlas_Normal.png']:
 fetch(bab,'meshes/Trees/'+name,'web/assets/textures/'+name)
for name in ['ground.jpg','sand.jpg','rock.png','rockn.png','wood.jpg','grassn.png','valleygrass.png','rockyGround_basecolor.png','rockyGround_normal.png']:
 fetch(bab,'textures/'+name,'web/assets/textures/'+name)
for pack,names in [('survival_pack',['Axe','Axe_Small','Tent','Bonfire','WoodLog','Backpack','Radio','WaterBottle_1','FirstAidKit','Can_Closed','Raft','Raft_Paddle']),('medieval_village_pack',['Crate','Barrel']),('animals_pack',['Wolf']),('modular_men',['Adventurer','Swat']),('survival_pack',['Shotgun_1','Pistol_1','PropaneTank']),('nature_pack',['Rock_1','Rock_2','Rock_3','Plant_1','BushBerries_1','Grass','PineTree_1','PineTree_Snow_1','CommonTree_Dead_1','Cactus_1'])]:
 for name in names: fetch(q,f'public/glb/{pack}/{name}.glb',f'web/assets/models/{name}.glb')
fetch(q,'public/glb/survival_pack/Knife.glb','web/assets/models/Knife.glb')
fetch(bab,'LICENSE','web/assets/licenses/Babylon-CC-BY-4.0.txt')
fetch(q,'LICENSES.md','web/assets/licenses/Quaternius-sources.md')
fetch('mrdoob/three.js','LICENSE','web/assets/licenses/Three-MIT.txt')
(ROOT/'web/assets/manifest.json').write_text(json.dumps(assets,ensure_ascii=False,indent=2)+'\n')
print('Fetched',len(assets),'files;',round(sum((ROOT/a['file']).stat().st_size for a in assets)/1024/1024,2),'MiB')
