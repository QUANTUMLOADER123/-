"""Original DEV16 item surfaces and four inventory illustrations.
Asset authoring only; never imports or runs the game. Pillow + resvg-py required.
All textures tile periodically; normal and ORM maps are linear data.
"""
from pathlib import Path
import math, random, json, hashlib
from PIL import Image
import resvg_py
R=Path(__file__).resolve().parents[1]
OUT=R/'web/assets/items16'; OUT.mkdir(parents=True,exist_ok=True)
colors={'steel':(91,101,106),'wood':(137,83,43),'polymer':(49,55,52),'cloth':(171,161,133),'rust':(124,69,39),'paint':(84,100,65),'rubber':(36,38,37),'brass':(165,119,49),'organic':(218,213,197)}
manifest={'provenance':'Original procedural surfaces and vector illustrations authored for Oskol. No third-party weapon/car assets.','size':256,'surfaces':{}}
n=256
for name,base in colors.items():
    rng=random.Random('oskol-item16-'+name); heights=[]
    for y in range(n):
        row=[]
        for x in range(n):
            u=x/n*math.tau;v=y/n*math.tau
            grain=rng.uniform(-.035,.035)
            if name=='wood':h=.5+.17*math.sin(u*14+math.sin(v*2)*1.3)+.065*math.sin(u*47+math.sin(v*3))
            elif name=='cloth':h=.5+.12*math.sin(u*32)*math.sin(v*32)+.055*math.sin(u*64)
            elif name=='rubber':h=.5+.06*math.sin(u*18)*math.sin(v*18)
            elif name in ['rust','paint']:h=.5+.12*math.sin(u*7+math.sin(v*4))*.6+.07*math.cos(v*13+math.sin(u*6))
            else:h=.5+.03*math.sin(u*45)+.016*math.cos(v*17)
            row.append(h+grain)
        heights.append(row)
    color=Image.new('RGB',(n,n));normal=color.copy();orm=color.copy();cp=color.load();np=normal.load();op=orm.load()
    metal=220 if name in ['steel','brass'] else 35 if name=='rust' else 0
    rough={'steel':145,'wood':190,'polymer':185,'cloth':245,'rust':230,'paint':195,'rubber':232,'brass':128,'organic':222}[name]
    for y in range(n):
        for x in range(n):
            h=heights[y][x];t=(h-.5)*.42
            cp[x,y]=tuple(max(0,min(255,round(c*(1+t)))) for c in base)
            dx=(heights[y][(x+1)%n]-heights[y][(x-1)%n])*.85;dy=(heights[(y+1)%n][x]-heights[(y-1)%n][x])*.85
            length=math.sqrt(1+dx*dx+dy*dy)
            np[x,y]=tuple(round((a/length*.5+.5)*255) for a in [-dx,-dy,1])
            op[x,y]=(round(235+20*h),max(0,min(255,round(rough+(h-.5)*32))),metal)
    files=[]
    for suffix,img in [('color',color),('normal',normal),('orm',orm)]:
        path=OUT/f'{name}-{suffix}.webp';img.save(path,lossless=True);files.append({'file':path.name,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
    manifest['surfaces'][name]=files
# Original, individually colored vectors, not generated thumbnails of game geometry.
def svg(body):
 return '''<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><defs><linearGradient id="steel" x2="0.3" y2="1"><stop stop-color="#afbab8"/><stop offset=".5" stop-color="#56636a"/><stop offset="1" stop-color="#293438"/></linearGradient><linearGradient id="wood" x2=".2" y2="1"><stop stop-color="#c18643"/><stop offset="1" stop-color="#69412c"/></linearGradient><linearGradient id="red"><stop stop-color="#c75e47"/><stop offset="1" stop-color="#7f332d"/></linearGradient><linearGradient id="cloth"><stop stop-color="#d4c7a4"/><stop offset="1" stop-color="#8b9274"/></linearGradient></defs><g stroke="#243238" stroke-width="3" stroke-linejoin="round">'''+body+'</g></svg>'
icons={
'akRifle': '<g transform="rotate(-29 128 128)"><path d="M19 105L63 101L72 114L62 139L18 136Z" fill="url(#wood)"/><path d="M65 104H149L164 115L147 133H65Z" fill="url(#steel)"/><path d="M147 108H193V126H149Z" fill="url(#wood)"/><path d="M192 112H231V120H192Z" fill="url(#steel)"/><path d="M110 132L138 131Q143 161 161 177L142 191Q115 166 110 132Z" fill="#394445"/><path d="M85 131H103L98 161H81Z" fill="url(#wood)"/><path d="M152 104V98H198V106M217 113V96H225V113" fill="none"/><path d="M72 109H143M125 140Q130 165 146 180" stroke="#abb3a2" stroke-width="2"/><path d="M94 133Q115 158 122 132" fill="none"/></g>',
'compactSmg':'<g transform="rotate(-27 128 128)"><path d="M19 106H68V119H29V142H19Z" fill="url(#steel)"/><path d="M67 97H179L196 108V130H68Z" fill="url(#steel)"/><path d="M173 112H230V125H173Z" fill="#3c494b"/><path d="M106 130H130V191H109Z" fill="#46534b"/><path d="M75 128H98L91 164H72Z" fill="#53594b"/><path d="M143 124H174V144H142Z" fill="#606a58"/><path d="M72 103H173M118 140V180M188 118H225" stroke="#a4b0a2" stroke-width="2"/><path d="M94 132Q104 152 111 131" fill="none"/></g>',
'antiseptic':'<path d="M100 29H158V60H100Z" fill="#627975"/><path d="M91 58H167L187 84V215Q126 235 71 215V85Z" fill="#b68a48"/><path d="M76 114H181V183H76Z" fill="url(#cloth)"/><path d="M117 123H142V141H160V165H142V181H117V165H99V141H117Z" fill="url(#red)"/><path d="M96 86V104M96 192V207" stroke="#e1c696" stroke-width="6"/>',
'traumaKit':'<path d="M77 60V36H180V60H164V50H93V60Z" fill="#47564a"/><rect x="27" y="60" width="204" height="156" rx="25" fill="url(#cloth)"/><path d="M31 93H227M31 182H227" fill="none" stroke="#6e765d" stroke-width="6"/><path d="M107 99H151V121H174V161H151V185H107V161H84V121H107Z" fill="url(#red)"/><path d="M52 75V201M206 75V201" stroke="#c0b995" stroke-dasharray="4 5" fill="none"/><rect x="44" y="81" width="17" height="24" rx="3" fill="url(#steel)"/>'
}
for id,body in icons.items():
    text=svg(body);(OUT/f'{id}.svg').write_text(text)
    png=resvg_py.svg_to_bytes(svg_string=text);import io
    Image.open(io.BytesIO(png)).save(OUT/f'{id}.webp',lossless=True)
manifest['icons']=list(icons)
(OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print('Authored',len(colors),'PBR sets and',len(icons),'colored icons; game not imported or executed.')
