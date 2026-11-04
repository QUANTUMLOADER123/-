"""Original component illustrations, offline asset authoring only.
No game/catalog imports, no tests, no downloaded or Facepunch artwork.
"""
from pathlib import Path
import math,io,json,hashlib
import resvg_py
from PIL import Image
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'web/assets/components20';OUT.mkdir(parents=True,exist_ok=True)
D='''<defs><linearGradient id="steel" x2=".2" y2="1"><stop stop-color="#d4dad6"/><stop offset=".32" stop-color="#778b8f"/><stop offset=".51" stop-color="#afbab5"/><stop offset="1" stop-color="#3f4f51"/></linearGradient><linearGradient id="dark" x2=".2" y2="1"><stop stop-color="#69767a"/><stop offset="1" stop-color="#253337"/></linearGradient><linearGradient id="rust" x2=".2" y2="1"><stop stop-color="#b17f55"/><stop offset=".55" stop-color="#826f5d"/><stop offset="1" stop-color="#61493b"/></linearGradient><linearGradient id="cloth" x2=".3" y2="1"><stop stop-color="#a5b0a2"/><stop offset=".35" stop-color="#637e78"/><stop offset="1" stop-color="#354c4d"/></linearGradient><linearGradient id="gold" x2="0" y2="1"><stop stop-color="#d7bc77"/><stop offset="1" stop-color="#78603d"/></linearGradient></defs>'''
def path(d,fill='steel',stroke='#263337',sw=2):return f'<path d="{d}" fill="url(#{fill})" stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round"/>' if fill in ['steel','dark','rust','cloth','gold'] else f'<path d="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round"/>'
def line(d,c='#d6ddd2',sw=2):return path(d,'none',c,sw)
def rect(x,y,w,h,f='steel',r=3):return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="url(#{f})" stroke="#28373b" stroke-width="2"/>'
def ellipse(x,y,rx,ry,f='steel'):return f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="'+(f'url(#{f})' if f in ['steel','dark','gold','cloth'] else f)+'" stroke="#29373b" stroke-width="2"/>'
def group(s,t='rotate(-25 128 128)'):return f'<g transform="{t}">{s}</g>'
art={}
art['metalPipe']=group(path('M34 101H205V148H34Z')+ellipse(34,124,14,24)+ellipse(205,124,14,24,'dark')+ellipse(206,124,8,15,'#18282b')+line('M45 109H187M48 139H183','#c1cbc4',3))
art['metalCylinder']=group(rect(86,65,85,139,'steel',30)+ellipse(129,70,39,12)+rect(113,45,31,24,'dark')+rect(118,34,22,13)+path('M96 169H162V186H96Z','dark')+line('M99 87V149','#dce2d8',5),'rotate(18 128 128)')
art['metalSheet']=group(''.join(path(f'M{48+i*5} {75+i*8}L{178+i*5} {60+i*8}L{207+i*5} {159+i*8}L{74+i*5} {178+i*8}Z','rust' if i==2 else 'steel') for i in range(3))+''.join(line(f'M{65+i*16} 98L{93+i*16} 191','#cec1a6' if i%2 else '#5d5146',5) for i in range(8)),'rotate(-12 128 128)')
art['metalBlade']=group(path('M31 130L171 76L224 106L198 134L67 165Z','rust')+path('M31 130L67 165L199 134L193 143L62 176L24 139Z','steel')+ellipse(174,110,8,6,'dark')+line('M55 139L146 104','#d4ba8c',3))
for id,short,color in [('rifleBody',False,'dark'),('smgBody',True,'steel'),('semiBody',False,'rust')]:
 body=path('M35 102H170L209 119V146H143L132 168H104L100 146H35Z',color)+rect(54,90,112 if not short else 81,15)+rect(68,111,62,18,'dark')+line('M76 115H118','#b4c1bf',3)+path('M151 148H184L177 182H151Z','dark')+path('M104 147L101 176H139L146 148','none','#4c5d5c',6)+''.join(ellipse(x,135,3,3,'dark') for x in [48,82,155,192])
 if id=='smgBody':body+=rect(42,143,38,15,'dark')+line('M46 150H71','#b6c3bf',3)
 if id=='semiBody':body+=path('M171 101L205 85L222 101L209 119Z','steel')
 art[id]=group(body)
art['techParts']=group(path('M45 71H176V173H45Z','#3f7560')+path('M85 95H211V201H85Z','#456d61')+rect(117,123,57,45,'dark')+''.join(line(f'M{104+i*15} 110V120M{104+i*15} 175V186','#c2ad67',4) for i in range(7))+''.join(line(f'M95 {124+i*13}H113M180 {124+i*13}H199','#c2ad67',4) for i in range(4))+''.join(line(f'M{54+i*16} 88V129H80V158','#9caf74',2) for i in range(6))+rect(58,79,35,24,'dark')+''.join(ellipse(x,190,3,3,'gold') for x in [94,109,124,139,154,169,184,199]))
art['spring']=group(''.join(ellipse(54+i*14,120,17,32,'dark')+line(f'M{40+i*14} 112Q{54+i*14} 81 {69+i*14} 112','#b4c4c3',5) for i in range(11))+line('M39 137L24 151M209 98L229 86','#a9bab8',7))
def gear(x,y,r):
 pts=[]
 for i in range(48):
  a=i*math.pi/24;q=r*(1 if i%4<2 else .82);pts.append((x+math.cos(a)*q,y+math.sin(a)*q))
 return path('M'+'L'.join(f'{a:.2f} {b:.2f}' for a,b in pts)+'Z')+ellipse(x,y,r*.47,r*.47,'dark')+ellipse(x,y,r*.24,r*.24,'#213338')+''.join(ellipse(x+math.cos(i*math.pi/3)*r*.63,y+math.sin(i*math.pi/3)*r*.63,4,4,'dark') for i in range(6))
art['gears']=gear(95,136,67)+gear(174,92,43)
art['rope']=''.join(ellipse(125,126,78-i*10,52-i*7,'gold') for i in range(6))+line('M49 120C28 157 57 192 91 185C119 180 99 219 73 207','#6c5532',12)+line('M49 120C28 157 57 192 91 185C119 180 99 219 73 207','#c4a471',7)+''.join(line(f'M{55+i*8} {88+i%3*4}l4 7','#ebd398',2) for i in range(15))
art['tarp']=group(path('M46 88L171 64L211 155L84 189L39 160Z','cloth')+path('M46 88L79 163L205 139L211 155L84 189L39 160Z','cloth')+line('M63 91L92 164L187 144M51 157L83 181L202 151','#a8b7a8',3)+''.join(ellipse(x,y,4,4,'steel') for x,y in [(55,94),(174,77),(87,174),(199,147)]))
art['ductTape']=group(ellipse(128,146,67,45,'dark')+path('M61 109V149Q62 191 128 191Q195 191 195 149V109Z','dark')+ellipse(128,108,67,44)+ellipse(128,108,34,22,'gold')+ellipse(128,108,25,15,'#1b2c30')+line('M66 145Q120 175 189 143','#92a29b',3)+path('M170 140L217 168L190 204L146 174Z','dark'))
art['sewingKit']=group(rect(52,105,65,75,'cloth',14)+ellipse(84,106,36,12,'gold')+ellipse(84,178,36,12,'gold')+''.join(line(f'M56 {114+i*7}H111','#c9c4a2',2) for i in range(8))+line('M139 180L201 63','#354447',7)+line('M139 180L201 63','#bdc9c4',3)+ellipse(198,68,3,7,'dark')+line('M199 64C246 46 241 150 174 162C145 169 141 218 113 208','#c9b077',3))
art['highMetal']=group(path('M45 125L73 81H179L209 125V165H45Z')+path('M45 125H209V165H45Z','dark')+line('M75 91H173M55 132H200','#dbe5e0',4))
manifest={}
for id,body in art.items():
 svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">{D}<ellipse cx="128" cy="206" rx="83" ry="14" fill="#101b1d" opacity=".22"/>{body}</svg>'
 (OUT/(id+'.svg')).write_text(svg)
 png=resvg_py.svg_to_bytes(svg_string=svg,width=512,height=512)
 image=Image.open(io.BytesIO(png)).convert('RGBA').resize((256,256),Image.Resampling.LANCZOS);p=OUT/(id+'.webp');image.save(p,'WEBP',lossless=True)
 manifest[id]={'file':p.name,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'source':id+'.svg','provenance':'Original individually authored vector illustration, rasterized offline; not AI or Facepunch artwork.'}
(OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
p=ROOT/'src/survival/item-art.js';s=p.read_text()
import re
for id in art:s=re.sub(r'("'+id+r'":\s*)"[^"]+"',r'\1"assets/components20/'+id+'.webp?v=dev20"',s)
p.write_text(s)
print('Authored',len(art),'individual component assets. No application execution.')
