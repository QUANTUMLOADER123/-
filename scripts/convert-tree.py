"""Convert BabylonJS CC-BY-4.0 broadleaf LODs into standard glTF binary; retain full mesh and UVs."""
import json,struct,pathlib,subprocess,hashlib
root=pathlib.Path(__file__).resolve().parents[1]
src=root/'.artifacts/source-assets/rawtrees.babylon'
if not src.exists():
 src.parent.mkdir(parents=True,exist_ok=True)
 with src.open('wb') as f:subprocess.run(['gh','api','repos/BabylonJS/Assets/contents/meshes/Trees/rawtrees.babylon','-H','Accept: application/vnd.github.raw+json'],stdout=f,check=True)
j=json.loads(src.read_text())
for lod in [0,1,2]:
 m=next(m for m in j['meshes'] if m['name']==f'Tree1_LOD{lod}')
 buf=bytearray();views=[];accessors=[]
 def acc(vals,typ,component,fmt,n):
  while len(buf)%4:buf.append(0)
  start=len(buf);buf.extend(struct.pack('<'+fmt*len(vals),*vals));views.append(dict(buffer=0,byteOffset=start,byteLength=len(buf)-start))
  a=dict(bufferView=len(views)-1,componentType=component,count=len(vals)//n,type=typ)
  if typ=='VEC3':a['min']=[min(vals[i::3]) for i in range(3)];a['max']=[max(vals[i::3]) for i in range(3)]
  accessors.append(a);return len(accessors)-1
 pos=m['positions'][:];nor=m['normals'][:];uv=m['uvs'][:]
 for i in range(2,len(pos),3):pos[i]*=-1;nor[i]*=-1
 # Babylon atlas uses the same UV orientation as these explicitly unflipped glTF images.
 for i in range(1,len(uv),2):uv[i]=1-uv[i]
 pi=acc(pos,'VEC3',5126,'f',3);ni=acc(nor,'VEC3',5126,'f',3);ui=acc(uv,'VEC2',5126,'f',2)
 primitives=[]
 for sub in m['subMeshes']:
  inds=m['indices'][sub['indexStart']:sub['indexStart']+sub['indexCount']]
  for i in range(0,len(inds),3):inds[i+1],inds[i+2]=inds[i+2],inds[i+1]
  ii=acc(inds,'SCALAR',5123,'H',1)
  # Bark submeshes 1 and 3; other slots are alpha-clipped leaves.
  mat=1 if sub['materialIndex'] in [1,3] else 0
  primitives.append(dict(attributes={'POSITION':pi,'NORMAL':ni,'TEXCOORD_0':ui},indices=ii,material=mat))
 data={'asset':{'version':'2.0','generator':'OSKOL converter; BabylonJS Assets CC-BY-4.0'},'scene':0,'scenes':[{'nodes':[0]}],'nodes':[{'mesh':0}],'meshes':[{'primitives':primitives}],
 'materials':[{'name':'Oak foliage','pbrMetallicRoughness':{'baseColorTexture':{'index':0},'metallicFactor':0,'roughnessFactor':.9},'alphaMode':'MASK','alphaCutoff':.4,'doubleSided':True,'normalTexture':{'index':2,'scale':.5}},{'name':'Oak bark','pbrMetallicRoughness':{'baseColorTexture':{'index':1},'metallicFactor':0,'roughnessFactor':1},'normalTexture':{'index':3,'scale':.7}}],
 'images':[{'uri':'../textures/'+s} for s in ['Broadleaf_Desktop_Atlas.png','BroadleafBark.jpg','Broadleaf_Desktop_Atlas_Normal.png','BroadleafBark_Normal.png']],
 'textures':[{'source':i,'sampler':0} for i in range(4)],'samplers':[{'magFilter':9729,'minFilter':9987,'wrapS':10497,'wrapT':10497}],
 'accessors':accessors,'bufferViews':views,'buffers':[{'byteLength':len(buf)}]}
 text=json.dumps(data,separators=(',',':')).encode()
 while len(text)%4:text+=b' '
 while len(buf)%4:buf.append(0)
 out=struct.pack('<III',0x46546c67,2,12+8+len(text)+8+len(buf))+struct.pack('<II',len(text),0x4e4f534a)+text+struct.pack('<II',len(buf),0x004e4942)+buf
 (root/f'web/assets/models/Oak_LOD{lod}.glb').write_bytes(out)
 print('LOD',lod,len(out),'bytes')
