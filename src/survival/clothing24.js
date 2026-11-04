/** Original clothing catalog. No renderer/state imports: safe for saves and loot. */
export const WEAR_SLOTS24=[
 {id:'head',name:'Голова',weight:.14},{id:'face',name:'Лицо',weight:.06},
 {id:'torso',name:'Тело',weight:.26},{id:'outer',name:'Верх / броня',weight:.24},
 {id:'legs',name:'Ноги',weight:.16},{id:'hands',name:'Кисти',weight:.05},
 {id:'feet',name:'Ступни',weight:.09}
];
// id, name, grade, silhouette, colour, ballistic / bite / blast protection of covered area.
const rows=[
 ['head',[
  ['clothCap','Тканевая кепка',1,'cap','#827762',.03,.10,.02],
  ['woolHat','Вязаная шапка',2,'beanie','#6b7050',.04,.14,.03],
  ['furHat','Меховая ушанка',3,'fur','#695445',.08,.24,.06],
  ['leatherHelmet','Кожаный шлем',3,'helmet','#79563e',.18,.38,.12],
  ['salvageHelmet','Каска из лома',4,'helmet','#999183',.38,.55,.26],
  ['riotHelmet','Шлем штурмовика',5,'visor','#383f46',.55,.67,.40],
  ['kevlarHelmet','Кевларовый шлем',6,'helmet','#727954',.72,.64,.46],
  ['ceramicHelmet','Композитный шлем',7,'visor','#424d5e',.80,.72,.57]
 ]],
 ['face',[
  ['clothBandana','Тканевая бандана',1,'bandana','#927054',.02,.08,.02],
  ['desertScarf','Пустынный шарф',2,'scarf','#baa479',.04,.15,.03],
  ['balaclava','Балаклава',2,'balaclava','#444b48',.05,.17,.04],
  ['snowMask','Северная маска',3,'mask','#b8c4c1',.07,.24,.07],
  ['leatherMask','Кожаная полумаска',3,'mask','#70563f',.15,.35,.12],
  ['weldMask','Сварочная маска',4,'weld','#806c4f',.32,.56,.24],
  ['kevlarMask','Кевларовая маска',6,'mask','#505b45',.50,.55,.36],
  ['steelMask','Стальная лицевая пластина',7,'weld','#798183',.60,.70,.46]
 ]],
 ['torso',[
  ['ragShirt','Лоскутная рубаха',1,'shirt','#8d836f',.03,.11,.02],
  ['cottonShirt','Хлопковая футболка',1,'tee','#a7aaa0',.04,.12,.03],
  ['stripedShirt','Морская тельняшка',2,'stripe','#768c9b',.05,.16,.04],
  ['workShirt','Рабочая рубашка',2,'shirt','#8d6552',.07,.20,.05],
  ['hoodie','Толстовка с капюшоном',3,'hoodie','#69705c',.10,.27,.08],
  ['fleeceShirt','Плотная флисовая кофта',3,'shirt','#637589',.12,.29,.09],
  ['combatShirt','Боевая рубашка',4,'combat','#606d50',.21,.37,.15],
  ['paddedShirt','Стёганый поддоспешник',5,'padded','#665f53',.32,.48,.24]
 ]],
 ['outer',[
  ['rainPoncho','Брезентовый пончо',2,'poncho','#9e914b',.04,.17,.05],
  ['travelCloak','Плащ странника',2,'cloak','#6d7a5a',.05,.22,.06],
  ['winterCoat','Меховой плащ',3,'furcoat','#817d6d',.12,.32,.10],
  ['armor','Кожаная броня',3,'vest','#79543b',.30,.47,.20],
  ['scrapVest','Нагрудник из лома',4,'plate','#969383',.48,.64,.33],
  ['riotVest','Противоударный жилет',5,'vest','#39444c',.52,.74,.42],
  ['kevlarVest','Кевларовый бронежилет',6,'kevlar','#707950',.76,.64,.53],
  ['ceramicVest','Керамический плитник',7,'plate','#4f5e68',.84,.72,.64]
 ]],
 ['legs',[
  ['ragPants','Лоскутные штаны',1,'pants','#887f69',.03,.11,.02],
  ['linenPants','Льняные брюки',1,'pants','#aca18a',.04,.14,.03],
  ['jeans','Плотные джинсы',2,'jeans','#516b83',.08,.23,.05],
  ['cargoPants','Брюки карго',3,'cargo','#697452',.12,.30,.09],
  ['winterPants','Зимние штаны',3,'padded','#a0aaa7',.15,.33,.12],
  ['leatherPants','Кожаные поножи',4,'pants','#6f503c',.27,.47,.19],
  ['riotPants','Штурмовые поножи',5,'armored','#444c53',.46,.66,.33],
  ['kevlarPants','Кевларовые поножи',6,'armored','#63704e',.65,.61,.44]
 ]],
 ['hands',[
  ['clothWraps','Тканевые обмотки',1,'wraps','#9e957e',.02,.12,.02],
  ['knitGloves','Вязаные перчатки',2,'gloves','#827264',.04,.18,.03],
  ['workGloves','Рабочие перчатки',2,'gloves','#a38a53',.08,.32,.05],
  ['leatherGloves','Кожаные перчатки',3,'gloves','#6f4c37',.14,.43,.10],
  ['winterGloves','Зимние рукавицы',3,'mittens','#b1b9ad',.12,.30,.09],
  ['tacticalGloves','Тактические перчатки',4,'knuckles','#4b5346',.21,.46,.16],
  ['kevlarGloves','Кевларовые перчатки',6,'knuckles','#747b50',.35,.54,.25],
  ['steelGauntlets','Стальные наручи',7,'gauntlet','#8b9291',.48,.72,.36]
 ]],
 ['feet',[
  ['clothShoes','Тканевые тапки',1,'shoes','#92856f',.02,.12,.02],
  ['sandals','Кожаные сандалии',2,'sandals','#8d623f',.04,.16,.03],
  ['sneakers','Старые кеды',2,'shoes','#707b80',.06,.22,.04],
  ['workBoots','Рабочие ботинки',3,'boots','#997b4d',.16,.40,.10],
  ['leatherBoots','Кожаные сапоги',3,'boots','#644b38',.18,.43,.12],
  ['snowBoots','Северные унты',4,'furboots','#a7afa5',.18,.38,.14],
  ['combatBoots','Армейские берцы',5,'boots','#454d41',.28,.50,.22],
  ['armoredBoots','Бронированные ботинки',7,'armored','#798483',.48,.65,.36]
 ]]
];
export const CLOTHING24=Object.freeze(Object.fromEntries(rows.flatMap(([slot,items],index)=>items.map(([id,name,grade,shape,color,bullet,melee,blast])=>[id,Object.freeze({id,name,slot,index,grade,shape,color,bullet,melee,blast})]))));
export const isClothing24=id=>Object.hasOwn(CLOTHING24,id);
export const CLOTHING_ITEMS24=Object.fromEntries(Object.values(CLOTHING24).map(c=>[c.id,{name:c.name,icon:'armor'}]));
export function wearStats24(state){const out={bullet:0,melee:0,blast:0};for(let i=0;i<7;i++){const c=CLOTHING24[state.wear24?.[i]];if(c?.index===i)for(const k of Object.keys(out))out[k]+=c[k]*WEAR_SLOTS24[i].weight;}for(const k of Object.keys(out))out[k]=Math.min(.70,out[k]);return out;}
export const wearValid24=a=>Array.isArray(a)&&a.length===7&&a.every((id,i)=>id===null||typeof id==='string'&&CLOTHING24[id]?.index===i);
export function clothingDescription24(id){const c=CLOTHING24[id];if(!c)return'';const weight=WEAR_SLOTS24[c.index].weight;return `${WEAR_SLOTS24[c.index].name}. Вклад в общую защиту: пули ${Math.round(c.bullet*weight*100)}%, укусы ${Math.round(c.melee*weight*100)}%, взрыв ${Math.round(c.blast*weight*100)}%. Защищает только при надевании, не в рюкзаке.`;}
export const CLOTHING_RECIPES24=Object.fromEntries(Object.values(CLOTHING24).map(c=>{
 const cost=c.grade===1?{fiber:18}:c.grade===2?{fiber:30,rope:1}:c.grade===3?{fiber:40,sewingKit:1}:c.grade===4?{fiber:40,metal:25,sewingKit:1}:c.grade===5?{fiber:50,metalSheet:2,ductTape:2}:c.grade===6?{fiber:65,highMetal:6,sewingKit:2,ductTape:2}:{fiber:70,highMetal:12,metalSheet:3,techParts:1,sewingKit:2};
 if(['poncho','cloak','furcoat'].includes(c.shape))cost.tarp=2;
 return[c.id,{name:c.name,category:'clothing',...(c.grade>=4?{station:'workbench'}:{}),cost:c.id==='armor'?{fiber:30,scrap:10}:cost,description:clothingDescription24(c.id)}];
}));
/** Independent deterministic rolls. Only used while creating NEW loot containers. */
export function clothingLoot24(id,seed,tier){let h=seed>>>0;for(const c of id+'clothing24')h=Math.imul(h^c.charCodeAt(0),16777619);const r=()=>{h=(Math.imul(h,1664525)+1013904223)>>>0;return h/4294967296;};const out={},chance=tier==='elite'?1:tier==='military'?.92:tier==='tool'?.75:.65;if(r()>chance)return out;const pool=Object.values(CLOTHING24).filter(c=>tier==='elite'?c.grade>=5:tier==='military'?c.grade>=4&&c.grade<=6:tier==='tool'?c.grade>=2&&c.grade<=4:c.grade<=3),count=tier==='elite'||r()<.30?2:1;for(let i=0;i<count;i++){const c=pool[Math.floor(r()*pool.length)];out[c.id]=1;}return out;}
export function damageMultiplier24(state,source){const stats=wearStats24(state),type=source==='bot'?'bullet':source==='wolf'?'melee':source==='explosion'?'blast':null;return type?1-stats[type]:1;}
