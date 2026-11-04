"""Author missing colored item illustrations and package the entire live catalog.
Asset preparation, NOT a game/test runner. Requires Pillow + resvg-py; builds don't.
Keeps existing individually AI-illustrated assets unchanged. New artwork is original
vector illustration, rendered offline to transparent lossless 256px WebP.
Usage: .venv-art/bin/python scripts/complete-item-art.py
"""
from pathlib import Path
import hashlib, io, json, math, subprocess, zipfile
import resvg_py
from PIL import Image, ImageDraw, ImageFont
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'web/assets/items'; SOURCES=OUT/'vectors'; WORK=ROOT/'.artifacts/item-art'; MASTERS=WORK/'transparent'
for p in [OUT,SOURCES,WORK,MASTERS]:p.mkdir(parents=True,exist_ok=True)
CAT=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {ITEMS} from './src/survival/state.js';console.log(JSON.stringify(ITEMS))"],cwd=ROOT))
manifest=json.loads((OUT/'manifest.json').read_text()); existing=manifest['items']
INK='#263237'
def path(d,fill='steel',stroke=INK,sw=2,extra=''):
    color=f'url(#{fill})' if fill in ['steel','dark','wood','brass','olive','red','blue','stone','copper','paper'] else fill
    return f'<path d="{d}" fill="{color}" stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round" stroke-linecap="round" {extra}/>'
def rect(x,y,w,h,fill='steel',r=2,stroke=INK,sw=2):
    return path(f'M{x+r} {y}h{w-r*2}q{r} 0 {r} {r}v{h-r*2}q0 {r} {-r} {r}h{-w+r*2}q{-r} 0 {-r} {-r}v{-h+r*2}q0 {-r} {r} {-r}Z',fill,stroke,sw)
def ellipse(x,y,rx,ry,fill='steel',stroke=INK,sw=2):
    color=f'url(#{fill})' if fill in ['steel','dark','wood','brass','olive','red','blue','stone','copper','paper'] else fill
    return f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="{color}" stroke="{stroke}" stroke-width="{sw}"/>'
def line(x1,y1,x2,y2,color='#bbcbc8',sw=2):return path(f'M{x1} {y1}L{x2} {y2}','none',color,sw)
def group(body,transform):return f'<g transform="{transform}">{body}</g>'
def iso(x,y,w,h,d=24,front='wood',top='#bea17c',side='#665440'):
    return path(f'M{x} {y}l{d} {-d*.55}h{w}l{-d} {d*.55}Z',top)+path(f'M{x+w} {y}l{d} {-d*.55}v{h}l{-d} {d*.55}Z',side)+rect(x,y,w,h,front,1)
def rivet(x,y,color='#b3b9ae'):return ellipse(x,y,2,2,color,INK,1)
def flame(x=125,y=110,s=1):
    return group(path('M0 50C-38 32-18 6-16-12C-8-2-7 3-7 3C5-12 13-33 11-47C45-17 34 4 29 10C51 7 38 45 0 50Z','#e87125','#754727',2)+path('M0 42C-22 24-8 12-3-2C-1 14 11 9 12-9C31 15 22 39 0 42Z','#ffd96a','none',0),f'translate({x} {y}) scale({s})')
def weapon(id):
    if id=='rocketLauncher':
        b=rect(25,93,207,49,'olive',18)+ellipse(228,117,10,24,'dark')+ellipse(227,117,5,16,'#161e20')+rect(45,91,12,53,'dark')+rect(196,91,12,53,'steel')+path('M103 140h27l-5 41h-24Z','dark')+rect(143,137,33,15,'wood')+rect(143,75,45,13,'steel')+path('M166 75V59h26v23','none',INK,5)+rect(63,83,22,9,'dark')+line(37,103,185,103,'#acbb8b',3)
        return group(b,'rotate(-27 128 128)')
    short=id in ['pistol','heavyPistol','revolver']
    if short:
        b=path('M105 125h43l-11 69h-47l12-57-26-8Z','wood' if id=='revolver' else 'dark')
        b+=path('M105 140q36 32 48-7','none','#74827c',6)+line(118,144,121,159,'#59665e',5)
        if id=='revolver':
            b+=rect(76,93,90,42,'steel')+rect(151,98,77,21,'steel')+rect(214,94,18,28,'dark')+ellipse(116,113,25,27,'dark')
            for x in [99,113,127]:b+=rect(x,92,6,40,'steel',3)
            b+=path('M81 95l-11-18 15-3 15 22Z','steel')+rect(204,88,12,9,'dark')
        else:
            b+=path('M63 96h151l9 17-9 18H95l-26-10Z','steel' if id=='heavyPistol' else 'dark')+rect(62,81,156,28,'steel' if id=='heavyPistol' else 'dark')+rect(209,83,14,25,'dark')+ellipse(220,96,4,9,'#151c20')+rect(144,84,35,14,'#34434a')+rect(184,75,9,8,'dark')+rect(73,74,10,8,'dark')
            for x in range(75,107,6):b+=line(x,86,x-5,104,'#9ba8a7',2)
            if id=='heavyPistol':b+=rect(156,120,44,7,'dark')+line(75,87,140,87,'#e3e7e1',2)
        for y in range(151,188,8):b+=line(103,y,128,y-3,'#6b6958',2)
        return group(b,'rotate(-23 128 128)')
    wood=id in ['shotgun','boltRifle']; shotgun=id in ['shotgun','combatShotgun']
    b=path('M21 120l42-22 33 8 4 21-43 12-4 21-27 5Z','wood' if wood else 'dark')+rect(20,124,8,43,'dark')
    b+=path('M90 98h77l14 8-10 27h-43l-9 38-23-5 8-38-22-5Z','steel' if id=='semiRifle' else 'dark')
    b+=rect(162,103,70,9,'steel')+rect(224,99,17,16,'dark')+rect(166,119,59,5,'dark')
    b+=path('M116 132q28 34 40-1','none','#798782',4)+line(129,136,130,148,'#8c968e',3)
    if shotgun:
        b+=rect(151,108,52,24,'wood' if wood else 'dark',6)+rect(198,107,29,8,'steel')
        for x in range(159,197,7):b+=line(x,113,x-2,128,'#534e3c',2)
        if id=='combatShotgun':b+=rect(116,91,65,6,'steel')+rect(144,126,18,35,'dark')
    elif id=='boltRifle':
        b+=path('M86 118l107-7-3 16-91 7Z','wood')+rect(106,83,65,15,'dark',6)+ellipse(108,90,6,11,'steel')+ellipse(168,90,8,12,'dark')+rect(120,98,7,8,'steel')+rect(151,98,7,8,'steel')+path('M113 106l12 8v16','none','#c4ccca',4)+ellipse(125,130,5,5,'dark')
    else:
        if id=='machineGun':
            b+=iso(114,132,41,34,12,'olive','#8b986f','#3d4a38')+path('M199 126l-15 43m17-44 18 40','none',INK,5)
            for j in range(5):b+=rect(103-j*7,127+j*3,7,13,'brass')
        else:b+=path('M132 130h24q1 32 15 52l-28 7q-16-31-11-59Z','dark')
        b+=rect(162,109,39,18,'olive' if id=='assaultRifle' else 'dark')
        for x in range(168,200,7):b+=rect(x,112,3,10,'#1d292d',0,INK,0)
        if id=='smg':b+=rect(164,82,7,23,'steel')+path('M66 112L43 89H22v31','none',INK,7)
        if id=='semiRifle':b+=rect(94,111,58,7,'steel')+rect(174,91,11,12,'dark')
        if id=='assaultRifle':b+=path('M78 116l-18-29H25v30','none','#56676b',6)+rect(107,87,59,8,'steel')
    b+=rect(218,94,7,9,'dark')+line(93,103,159,103,'#b0bbb6',2)+rivet(111,118)+rivet(158,120)
    return group(b,'rotate(-27 128 128)')
def structure(id):
    if id in ['foundation','roof','triangleFoundation','triangleRoof']:
        triangle=id.startswith('triangle');roof='Roof' in id or id=='roof';basey=118 if roof else 127
        b=''
        if not roof:
            for x,y in [(46,153),(164,111),(180,165)]:b+=iso(x,y,13,53,8,'wood','#b29468','#66513c')
        shape=f'M29 {basey}L151 {basey-57}L230 {basey-13}L108 {basey+48}Z' if not triangle else f'M34 {basey+9}L196 {basey-59}L191 {basey+68}Z'
        b+=path(shape,'wood')
        for j in range(1,9):
            if triangle:b+=line(35+j*17,basey+9-j*7,191,basey+68-j*14,'#6f533b',2)
            else:b+=line(29+j*13.4,basey-j*6.3,108+j*13.4,basey+48-j*6.8,'#6c5036',2)
        b+=path(f'M29 {basey}v14l79 49 122-60v-16l-122 61Z' if not triangle else f'M34 {basey+9}v13l157 66v-20Z','#765a3d')
        if roof:b+=path('M51 183l52 30 103-51','none','#b39c77',7)
        return b
    if id in ['wall','halfWall','doorway','door']:
        h=72 if id=='halfWall' else 151;y=214-h
        if id=='doorway':
            b=path(f'M43 214V{y}l140-25v151l-40 8V{y+24}l-62 12v171Z','wood')+path('M183 38l24 16v151l-24 9Z','#5d503c')
            b+=line(50,66,178,43,'#cab18c',4)
            return b
        b=path(f'M43 214V{y}l140-25v{h}Z','wood')+path(f'M183 {y-25}l22 14v{h}l-22 11Z','#5b4938')
        for j in range(1,9):b+=line(43+j*15.5,y-j*2.75,43+j*15.5,214-j*2.75,'#6e523b',2)
        for yy in [y+19,197]:b+=path(f'M46 {yy}l134-24v10l-134 24Z','#9e815e')
        if id=='door':
            b+=path('M57 208V75l111-20v132Z','none','#4b3a2d',5)+rect(138,132,12,19,'dark')+ellipse(143,140,4,4,'brass')
            for yy in [92,178]:b+=path(f'M52 {yy}l24-4v10l-24 4Z','steel')
        return b
    if id=='stairs':
        b=''
        for j in range(7):b+=iso(29+j*18,200-j*19,57,12,54,'wood','#bda27d','#65503b')
        return b+path('M30 218l151-154','none','#60513f',8)
    if id in ['roofSlope','ramp']:
        low=188 if id=='ramp' else 158
        b=path(f'M28 {low}L168 59l66 37-140 128Z','wood')+path(f'M94 224v-13L234 84v12Z','#65533e')
        for j in range(1,10):b+=line(28+j*14,low+(59-low)*j/10,94+j*14,224+(96-224)*j/10,'#73563a',2)
        b+=path(f'M29 {low}l66 36M168 59l66 37','none','#b8a27d',5)
        if id=='roofSlope':b+=path('M37 170v37l55 31v-31','none','#6b5b42',6)
        return b
    raise ValueError(id)
def artwork(id):
    if id in ['pistol','revolver','smg','shotgun','assaultRifle','boltRifle','semiRifle','heavyPistol','combatShotgun','machineGun','rocketLauncher']:return weapon(id)
    if id in ['foundation','wall','roof','triangleFoundation','triangleRoof','halfWall','doorway','door','stairs','ramp','roofSlope']:return structure(id)
    if id=='rock':return path('M52 173l-17-51 35-58 62-22 65 28 24 68-39 53-78 18Z','stone')+path('M70 64l49 34-14 61-53 14-17-51Z','#65767b')+path('M119 98l78-28 24 68-75 28-41-7Z','#aeb8b4')+path('M104 209l1-50 41 7 36 25Z','#536168')+line(90,69,129,55,'#dce1d5',5)
    if id=='torch':return group(path('M112 227l10-143h21l-6 143Z','wood')+rect(115,81,36,48,'dark',5)+''.join(line(117,88+j*8,149,97+j*8,'#bfa784',5) for j in range(4))+flame(132,66,.8),'rotate(22 128 128)')
    if id in ['storage','largeStorage']:
        large=id=='largeStorage';x=30 if large else 49;y=108;w=166 if large else 132;h=96 if large else 79;d=28 if large else 25
        b=iso(x,y,w,h,d)
        for j in range(1,5):b+=line(x+1,y+j*h/5,x+w-1,y+j*h/5,'#6e5138',2)
        for xx in [x+20,x+w-27]:b+=path(f'M{xx} {y}l{d} {-d*.55}h12l{-d} {d*.55}v{h}h-12Z','steel' if large else '#d1af79')+rivet(xx+6,y+15)+rivet(xx+6,y+h-10)
        b+=rect(x+w/2-10,y+23,20,24,'dark')+rect(x+w/2-6,y+17,12,10,'brass')
        return b
    if id=='cupboard':
        b=iso(64,57,111,161,25,'wood','#bca17b','#5f4d3a')+rect(74,66,91,141,'wood')+line(121,65,121,208,'#473c30',4)
        for yy in [78,190]:
            for xx in [74,155]:b+=rect(xx,yy,10,12,'steel')
        for xx in [111,130]:b+=ellipse(xx,140,3,5,'brass')
        return b+rect(92,85,58,22,'olive')+line(103,96,140,96,'#c5cda7',3)
    if id in ['workbench','repairBench','recycler']:
        b=''
        for xx,yy in [(44,129),(171,129),(82,108),(207,108)]:b+=iso(xx,yy,10,83,7,'dark','#a3aca3','#454e4a')
        b+=iso(32,118,174,16,28,'wood','#c2a37b','#6c553c')
        if id=='workbench':
            b+=iso(53,91,43,26,19,'steel','#bfc9c5','#54666b')+rect(67,68,31,24,'dark')+line(52,102,40,102,INK,5)+line(40,95,40,111,INK,4)+rect(137,90,50,9,'wood')+path('M166 89l13-29 16 6-13 30Z','steel')
        elif id=='repairBench':
            b+=rect(61,84,76,13,'dark')+path('M75 86l-5-17h36l7 17Z','steel')+path('M151 104l35-41m-4-4 12 11','none','#aababc',7)+ellipse(162,77,13,9,'steel')+ellipse(162,77,6,4,'#333f43')
        else:
            b+=iso(96,53,78,67,24,'olive','#a1ae89','#405747')+ellipse(137,89,25,24,'dark')+ellipse(137,89,15,15,'steel')+path('M57 81l26-13 21 18-29 22Z','steel')+rect(162,73,8,9,'red')+rect(102,111,72,11,'dark')
        return b
    if id=='campfire':
        b=''
        for x,y in [(64,190),(174,193),(128,205),(44,169),(203,173)]:b+=ellipse(x,y,23,15,'stone')
        b+=group(rect(58,163,143,25,'wood',10),'rotate(21 128 175)')+group(rect(51,168,145,24,'wood',10),'rotate(-29 128 175)')+flame(127,125,1.1)
        return b
    if id=='furnace':
        b=ellipse(126,211,78,19,'dark')+path('M53 197l9-74 30-48 12-32h48l11 33 29 48 9 73q-67 33-148 0Z','stone')+ellipse(128,44,26,9,'dark')
        for y,lo,hi in [(84,82,171),(119,64,190),(159,58,196),(191,54,199)]:b+=path(f'M{lo} {y}q55 12 {hi-lo} 0','none','#59676a',4)
        for x,y in [(95,88),(149,88),(120,121),(80,162),(173,160),(126,194)]:b+=line(x,y,x-5,y+25,'#677679',3)
        return b+path('M91 195v-42q35-38 71 0v42Z','#202b2d')+flame(126,178,.39)+ellipse(128,196,40,5,'#bc6934',INK,1)
    if id=='battery':return iso(59,91,126,115,24,'olive','#54645d','#303e37')+iso(55,82,132,21,24,'dark','#71817c','#273a36')+rect(76,67,23,17,'red')+rect(151,61,22,16,'steel')+rect(77,125,86,51,'#cfba7d')+path('M121 132l-18 21h16l-7 17 26-25h-16l6-13Z','#4f5d50')+line(91,199,91,177,'#86957a',4)+line(165,199,165,177,'#86957a',4)
    if id=='plan':
        b=path('M50 51l61 12 45-19 51 17-14 150-49-15-48 18-61-16Z','blue')
        for x1,y1,x2,y2 in [(111,63,96,214),(156,44,144,196)]:b+=line(x1,y1,x2,y2,'#6ca0bb',2)
        b+=path('M69 92l93-17 18 19-6 78-94 17-17-12Z','none','#d7e5df',3)+path('M113 86l-6 91m5-42 64-12M70 142l37-7','none','#d7e5df',2)+path('M86 182v-18h20m25-74 2 18 20-4','none','#a7cbd5',2)
        return b
    if id in ['pistolAmmo','shells']:
        b=''
        for j,(x,y) in enumerate([(76,78),(121,61),(165,83)]):
            if id=='shells':b+=rect(x,y,27,115,'red' if j!=1 else 'blue',4)+rect(x,y+91,27,24,'brass')+ellipse(x+13.5,y,13.5,7,'#d9bf8b')+ellipse(x+13.5,y+112,13,5,'brass')
            else:b+=rect(x,y+31,25,81,'brass')+path(f'M{x} {y+31}q0-24 12-34q13 11 13 34Z','copper')+rect(x-2,y+100,29,10,'brass')+line(x+5,y+38,x+5,y+96,'#f2d496',3)
        return group(b,'rotate(20 128 128)')
    if id=='syringe':
        b=rect(108,64,34,109,'paper',5)+rect(105,81,40,10,'red')+rect(112,126,26,36,'#ba6d51')+rect(98,66,54,8,'steel')+rect(120,36,10,30,'steel')+rect(105,31,39,9,'red')+path('M116 173h18l-5 23h-9Z','steel')+line(124,194,124,235,'#a2b8bc',2)
        for y in range(96,156,10):b+=line(110,y,119,y,'#596c70',2)
        return group(b,'rotate(34 128 128)')
    if id=='medkit':return rect(46,83,162,123,'red',18)+path('M96 85V67q32-22 63 0v18','none','#654437',12)+rect(44,99,166,18,'#ae4d39',5)+rect(109,119,31,69,'paper',3)+rect(89,138,72,30,'paper',3)+rect(58,111,9,17,'brass')+line(61,192,193,192,'#de9c7c',2)
    if id=='cannedFood':return rect(70,66,116,144,'steel',10)+ellipse(128,67,58,19,'steel')+rect(70,104,116,78,'red',0)+ellipse(128,210,58,15,'steel')+ellipse(128,65,48,12,'#879693')+ellipse(128,62,13,6,'steel')+ellipse(128,146,32,25,'paper')+path('M108 153q-11-21 5-26q26-3 35 17q-6 21-25 20Z','olive')+line(72,193,183,193,'#e0e1d3',3)
    if id=='lowFuel':return path('M65 91l22-22V48h62v21h27l19 24v112H65Z','olive')+path('M99 71V58h36v13Z','#1d2e29')+path('M67 96l124-4m-112 17 95 79m-95 0 95-79','none','#9daa7e',6)+rect(76,35,30,20,'red')+rect(91,116,73,62,'#c8b16e')+path('M127 125q-7 17-16 29q-9 25 17 25q28-2 17-25Z','#4d5b3a')
    if id=='rope':
        b=''
        for j in range(8):b+=ellipse(128,123+j*7,68-j*1.7,31,'#a18c61','#5a513a',4)+ellipse(128,117+j*7,41-j*1.5,14,'#b5a578','#655b43',3)
        b+=path('M178 171q30 15 3 43q-12 12-18 3','none','#b5a376',12)+path('M178 171q30 15 3 43','none','#6d6045',2)
        return b
    if id=='spring':
        b=''
        for j in range(10):b+=ellipse(127,65+j*14,45,20,'none','#334146',10)+path(f'M82 {65+j*14}q0 23 90 0','none','#afc1be',7)
        return group(b,'rotate(22 128 128)')
    if id=='gears':
        def cog(x,y,r,teeth):
            pts=[]
            for j in range(teeth*4):
                a=j/(teeth*4)*math.pi*2;rr=r if j%4 in (1,2) else r*.79;pts.append(f'{x+math.cos(a)*rr:.2f} {y+math.sin(a)*rr:.2f}')
            return path('M'+'L'.join(pts)+'Z','steel')+ellipse(x,y,r*.34,r*.34,'#29393c')+ellipse(x,y,r*.16,r*.16,'#abc0bb')+''.join(ellipse(x+math.cos(j*2.094)*r*.56,y+math.sin(j*2.094)*r*.56,r*.1,r*.1,'#56676a') for j in range(3))
        return cog(91,143,65,10)+cog(171,89,47,9)
    if id=='sewingKit':return group(rect(49,89,58,113,'wood',5)+ellipse(78,91,39,12,'wood')+ellipse(78,197,39,12,'wood')+rect(51,104,55,78,'#c9b98d')+''.join(line(52,y,104,y-3,'#a7946a',2) for y in range(108,180,5))+path('M105 129q49-52 69-13q22 46-24 56','none','#d7c9a1',3)+path('M171 53l-4 137','none','#c3d2ce',5)+ellipse(170,65,3,10,'#33494a')+path('M168 190l-3 28 8-28Z','steel'),'rotate(11 128 128)')
    if id=='metalPipe':return group(rect(90,54,62,156,'steel',1)+ellipse(121,209,31,15,'steel')+ellipse(121,54,31,18,'steel')+ellipse(121,54,23,11,'#293a40')+ellipse(121,53,13,6,'#151f25')+line(101,76,101,190,'#c9d5cb',6)+path('M146 90v35m-4 40v27','none','#9b7356',5),'rotate(34 128 128)')
    if id=='metalCylinder':return rect(79,76,95,135,'olive',25)+ellipse(127,209,45,10,'dark')+rect(105,49,45,26,'steel')+rect(115,33,23,18,'brass')+line(101,31,155,31,'#c28350',8)+rect(92,111,67,36,'#c3be8e')+line(94,159,94,190,'#a0b18a',5)+line(90,90,159,90,'#4a6149',3)
    if id in ['rifleBody','smgBody','semiBody']:
        b=path('M37 93h133l40 18v39l-62 10-16 40-30-6 5-42-70-9Z','steel')+rect(39,88,124,13,'dark')+rect(56,110,56,20,'#253941')+path('M135 164q34 30 46-12','none','#5a6d6a',5)
        if id=='rifleBody':b+=rect(162,117,56,16,'dark')+path('M146 156l4 33 25-3-8-33Z','olive')+rect(68,77,59,11,'steel')
        elif id=='smgBody':b+=path('M153 153h29l5 53h-27Z','dark')+rect(181,110,41,10,'steel')+path('M47 90V64h48v23','none',INK,5)
        else:b+=rect(156,105,66,10,'steel')+path('M64 144l-31 13-7-23 24-15Z','wood')+ellipse(166,137,7,7,'dark')
        return group(b,'rotate(-19 128 128)')
    if id=='metalBlade':return group(path('M67 42l24-4 99 142-10 38-33-5-14-23-3-17-15-6-1-16-16-5-3-17-15-8-1-16-15-8Z','steel')+ellipse(80,61,7,7,'#273f43')+line(92,66,171,181,'#e1e7db',4)+path('M160 198l19 6','none','#a87550',4),'rotate(10 128 128)')
    if id=='metalSheet':
        b=''
        for j in range(3):
            b+=path(f'M{38+j*8} {100-j*12}l118-48 60 82-117 57Z','steel')
            for k in range(5):b+=line(48+j*8+k*21,97-j*12-k*8,93+j*8+k*21,173-j*12-k*9,'#809490',3)
        return b+path('M54 97l28-10 14 15-27 12Z','#9b7656',INK,1)
    if id=='techParts':
        b=path('M43 80l132-28 38 125-133 28Z','#49745c')+path('M50 89l123-26 30 105-121 28Z','none','#88a67c',2)
        for x,y in [(77,101),(150,84),(110,159),(175,153)]:b+=path(f'M{x} {y}h18v27h19','none','#bfa35e',3)
        b+=rect(99,100,56,58,'dark',4)
        for j in range(7):b+=rect(95+j*9,91,4,9,'brass',0)+rect(95+j*9,158,4,9,'brass',0)
        for x,y in [(73,121),(165,111),(89,170)]:b+=rect(x,y,11,23,'steel')
        return b+ellipse(63,86,5,5,'brass')+ellipse(192,164,5,5,'brass')
    if id=='tarp':
        b=''
        for j in range(4):b+=path(f'M43 {99+j*20}l100-41 64 52-100 42Z','olive')+path(f'M107 {152+j*20}l100-42v10l-100 42Z','#435b48')
        return b+path('M50 109l60 53 87-38','none','#a0b18c',2)+ellipse(66,114,6,4,'brass')+ellipse(161,74,6,4,'brass')+line(95,104,119,123,'#546c4e',3)
    if id=='ductTape':return path('M64 89v76q60 65 126 0V89Z','olive')+ellipse(127,87,65,37,'olive')+ellipse(127,86,38,22,'#c3ad7a')+ellipse(127,88,27,15,'#253d35')+path('M188 111l39 55-41 27-36-40Z','#66816b')+path('M186 117l30 46-29 17','none','#9aac90',3)
    if id=='highMetal':
        b=''
        for x,y in [(35,165),(113,147),(72,117)]:b+=path(f'M{x} {y}l21-30 72-8 20 29-19 29-77 8Z','steel')+line(x+23,y-25,x+87,y-32,'#dbe9dd',4)+path(f'M{x} {y}l17 28 77-8 19-29-92 9Z','#6c929b')
        return b
    if id=='highMetalOre':return path('M37 170l12-71 57-55 79 24 38 85-54 53-84 5Z','stone')+path('M49 99l57-55 28 73-49 94-48-41Z','#637f86')+path('M134 117l51-49 38 85-54 53Z','#94b8ba')+path('M59 151l47-40 14 20 30-35 18 4-43 57-18-13-33 29Z','steel')+path('M149 181l24-42 17 10-25 45Z','#cee3df')+path('M91 73l15-13 9 31Z','#dce8d9')
    if id in ['rocket','hvRocket','incendiaryRocket']:
        c='red' if id=='incendiaryRocket' else 'steel' if id=='hvRocket' else 'olive'
        b=path('M107 74l21-49 22 49Z','dark' if id=='rocket' else c)+rect(108,74,41,121,c,6)+rect(106,102,45,15,'#c9af6f' if id=='rocket' else '#5e8590' if id=='hvRocket' else '#efb46b')+path('M108 173l-24 39 28-6 5-27m30-6 24 39-28-6-5-27Z','steel')+rect(116,193,25,23,'dark')+line(116,79,116,99,'#d5d9ba',3)
        return group(b,'rotate(29 128 128)')
    if id=='explosives':return iso(58,94,131,104,22,'#b7a78a','#d1c5a3','#7a715b')+path('M63 105l119 75M72 179l108-73','none','#7f745a',12)+rect(89,111,69,58,'olive')+path('M102 148l22-28 23 28Z','#d8c586')+line(124,132,124,140,'#685b42',4)+ellipse(124,145,2,2,'#685b42',INK,0)
    if id=='timedCharge':return iso(51,92,150,103,17,'olive','#8c9c79','#3b4a3b')+rect(69,84,13,118,'dark')+rect(167,84,13,118,'dark')+iso(98,99,54,53,10,'dark','#7c8b85','#293835')+rect(107,112,35,16,'#ad644e')+ellipse(123,144,6,6,'brass')+path('M91 102q-30-39 27-42q74-5 55 41','none','#a55e48',4)+path('M93 112q-42-21-15-57','none','#c0b58c',3)
    if id=='f1Grenade':
        b=path('M95 84q-27 16-31 68q-1 57 63 61q65-4 61-61q-6-51-31-68Z','olive')
        for y in [109,133,158,184]:b+=path(f'M72 {y}q54 16 106 0','none','#344c36',5)
        for x in [101,128,153]:b+=path(f'M{x} 91q-10 58 0 112','none','#3a5138',4)
        return b+rect(105,65,43,24,'steel')+path('M113 65h44l35 75-10 5-39-65h-30Z','steel')+ellipse(91,67,22,18,'none','#b8c4b8',5)+line(103,68,119,74,'#aebcb5',4)
    if id=='beancan':return rect(79,91,102,112,'steel',8)+ellipse(130,92,51,16,'steel')+ellipse(130,203,51,13,'dark')+rect(79,121,102,57,'#936c43')+path('M93 132l27 9 31-7 18 27-28 6-42-8Z','#bb9a62')+path('M125 89q22-23 6-40','none','#7f7354',5)+path('M134 54l8-17m-5 14 21-2','none','#d5a458',3)+path('M88 188l26 6','none','#a87248',5)
    if id=='mushroom':
        b=''
        for x,y,s in [(72,133,.85),(170,125,.82),(126,101,1.05)]:b+=group(path('M-11 0l-8 69q17 14 36-1L10 0Z','paper')+path('M-43 3q-7-40 43-43q45 3 44 43q-38 24-87 0Z','wood')+path('M-33 2q34 15 66-1','none','#d1b799',3),f'translate({x} {y}) scale({s})')
        return b
    if id=='pumpkin':
        b=ellipse(127,149,83,65,'#b06e30')
        for x,rx in [(87,32),(109,35),(148,35),(169,32),(129,31)]:b+=ellipse(x,146,rx,65,'copper','#9c642f',2)
        return b+path('M118 88l-3-34 21-12 9 9-10 37Z','olive')+path('M137 72q40-22 56-6q-4 20-45 20Z','#5d7b43')+line(122,107,116,176,'#ecc379',4)
    if id=='corn':
        b=ellipse(130,116,34,83,'brass')
        for j in range(11):
            for k in range(4):b+=ellipse(108+k*13,49+j*13,6,7,'#e4bb54','#a58642',1)
        b+=path('M127 215Q53 183 49 107q68 11 78 108Z','olive')+path('M129 217q-8-79 79-127q-2 99-79 127Z','#6e8d4e')+path('M128 213Q107 153 62 120m69 90q32-65 64-98','none','#acbb70',3)
        return group(b,'rotate(13 128 128)')
    if id in ['meat','cookedMeat']:
        raw=id=='meat';b=path('M48 143q-20-72 45-89q43-14 55 21q17 33 47 33q43 11 23 63q-17 46-77 41q-54-6-93-69Z','red' if raw else 'wood')+path('M58 144q-20-61 37-78q37-9 45 21q21 35 52 35q30 8 16 42q-15 30-60 30q-49-7-90-50Z','#b65b52' if raw else '#815735')
        if raw:b+=path('M102 66q-22 25-7 57l36 7 14 62m-49-69-38 20m66-15 32-18m-21 38 54 24','none','#e0af97',5)+ellipse(171,151,18,22,'paper')+ellipse(171,151,8,11,'#c28f76')
        else:
            for x,y in [(79,98),(103,115),(127,132),(150,151)]:b+=path(f'M{x} {y}l-8 32','none','#413c2c',7)
            b+=path('M77 174q56 31 102 3','none','#c39758',3)
        return group(b,'rotate(-12 128 128)')
    raise ValueError('No authored illustration for catalog item '+id)
DEFS=''
for name,a,b,c in [('steel','#e0e5d8','#93a6a5','#455e69'),('dark','#758783','#37484d','#172a30'),('wood','#d2b58a','#a38660','#68523b'),('brass','#fae3a0','#cba95f','#806a3e'),('olive','#abb68c','#748b62','#3d5844'),('red','#e2a18a','#b65c47','#793c32'),('blue','#88bacf','#467b9b','#294c71'),('stone','#d2d9cc','#96a8a7','#5f737c'),('copper','#e9b77c','#c38b4b','#8d5934'),('paper','#f1ebce','#d3d7c0','#a6b8b5')]:
    DEFS+=f'<linearGradient id="{name}" x1="0" y1="0" x2="0.9" y2="1"><stop stop-color="{a}"/><stop offset="0.46" stop-color="{b}"/><stop offset="1" stop-color="{c}"/></linearGradient>'
new=[]
for id,info in CAT.items():
    if id in existing and (OUT/existing[id]['file']).exists():
        existing[id].setdefault('method','individual-ai-illustration')
        continue
    shadow=ellipse(128,221,79,8,"#182324","none",0).replace("/>",' opacity="0.16"/>')
    svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><title>{info["name"]}</title><defs>{DEFS}</defs>{shadow}{artwork(id)}</svg>'
    source=SOURCES/(id+'.svg');source.write_text(svg)
    png=resvg_py.svg_to_bytes(svg_string=svg,width=1024,height=1024)
    im=Image.open(io.BytesIO(png)).convert('RGBA');im.save(MASTERS/(id+'.png'),optimize=True)
    target=OUT/(id+'.webp');im.resize((256,256),Image.Resampling.LANCZOS).save(target,'WEBP',lossless=True,method=6,exact=True)
    existing[id]={'file':target.name,'width':256,'height':256,'alpha':True,'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'sourceSha256':hashlib.sha256(svg.encode()).hexdigest(),'method':'original-vector-illustration','source':'vectors/'+source.name}
    new.append(id)
manifest.update(schema=2,source='Mixed provenance: preserved individual AI illustrations + original authored vector illustrations. No third-party game art.',catalogCount=len(CAT))
manifest['items']={id:existing[id] for id in CAT}
(OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
(ROOT/'src/survival/item-art.js').write_text('// Generated from the complete live catalog by scripts/complete-item-art.py.\n// Individual local colored assets; no runtime 3D thumbnail or glyph needed for items.\nexport const ITEM_ART=Object.freeze('+json.dumps({id:'assets/items/'+v['file']+'?v='+v['sha256'][:10] for id,v in manifest['items'].items()},indent=2)+');\n')
font='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';cols=8;cell=200;rows=math.ceil(len(CAT)/cols)
sheet=Image.new('RGB',(cols*cell,90+rows*210),'#20272c');d=ImageDraw.Draw(sheet)
d.text((22,18),f'ОСКОЛ · {len(CAT)} / {len(CAT)} цветных предметных иконок',fill='#eee9dc',font=ImageFont.truetype(font,26))
d.text((23,55),'Прозрачный WebP · отдельный файл на предмет · без общих заглушек',fill='#acb7ae',font=ImageFont.truetype(font,14))
for n,(id,info) in enumerate(CAT.items()):
    x=n%cols*cell;y=90+n//cols*210;d.rounded_rectangle((x+5,y+4,x+195,y+204),6,fill='#343e43')
    im=Image.open(OUT/manifest['items'][id]['file']).convert('RGBA');im.thumbnail((163,163));sheet.paste(im,(x+(cell-im.width)//2,y+6),im)
    size=13
    while d.textbbox((0,0),info['name'],font=ImageFont.truetype(font,size))[2]>184 and size>9:size-=1
    f=ImageFont.truetype(font,size);w=d.textbbox((0,0),info['name'],font=f)[2]
    d.text((x+(cell-w)/2,y+170),info['name'],font=f,fill='#eee9db');d.text((x+10,y+189),id,font=ImageFont.truetype(font,9),fill='#94a9ab')
sheet.save(WORK/'preview-complete-88.png')
ai=sum(v['method']=='individual-ai-illustration' for v in manifest['items'].values());vector=len(CAT)-ai
readme=f'''# ОСКОЛ · все предметные иконки\n\n**Готово {len(CAT)} / {len(CAT)} предметов актуального каталога.**\n\nКаждому предмету соответствует собственный файл, а не алиас общей иконки «винтовка», «металлолом» или «стена». Все — цветной прозрачный lossless WebP 256×256, загружаемый локально. Сохранены {ai} ранее отдельно AI-сгенерированных иллюстраций. Остальные {vector} — авторские векторные иллюстрации с индивидуальной геометрией, цветом, градиентами и деталями; SVG-оригиналы в `vectors/`, не белые контурные пиктограммы. Это смешанный набор, не {len(CAT)} AI-генераций и не ассеты Rust/Facepunch.\n\nРегистрация: `src/survival/item-art.js`; SHA-256 и происхождение каждого файла: `manifest.json`. Предметная иконка общая для рюкзака, пояса, рецептов, требований, лута, печи, шкафа и торговли. Персонаж и управляющие кнопки не являются предметами и сохраняют своё оформление.\n\nПодготовка отсутствующих иконок и упаковка без запуска игры/тестов:\n```sh\npython -m venv --system-site-packages .venv-art\n.venv-art/bin/pip install resvg_py Pillow\n.venv-art/bin/python scripts/complete-item-art.py\n```\nНовые предметы без описанной иллюстрации вызывают явную ошибку подготовки, а не автоматически получают общую картинку. Обычная сборка не требует Python/resvg-py. Ранее использованный `process-item-art.py` остаётся для будущих отдельно AI-сгенерированных изображений.\n\n## Каталог\n'''
readme+=''.join(f'- [x] `{id}` — {info["name"]} · {manifest["items"][id]["method"]}\n' for id,info in CAT.items())
(OUT/'README.md').write_text(readme)
archive=WORK/f'Oskol-all-{len(CAT)}-item-icons.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
    for id in CAT:
        z.write(OUT/manifest['items'][id]['file'],'Game-WebP-256/'+id+'.webp')
        master=MASTERS/(id+'.png')
        if master.exists():z.write(master,'PNG-1024/'+id+'.png')
        source=OUT/manifest['items'][id].get('source','vectors/'+id+'.svg')
        if source.exists():z.write(source,'SVG-sources/'+id+'.svg')
    for f in ['manifest.json','README.md']:z.write(OUT/f,f)
    z.write(WORK/'preview-complete-88.png','preview-all.png')
print(f'Prepared {len(new)} new illustrations; complete catalog {len(CAT)}/{len(CAT)} ({ai} preserved AI + {vector} vector).')
print(archive,archive.stat().st_size,'bytes')
