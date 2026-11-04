import {CLOTHING24,WEAR_SLOTS24,wearStats24,clothingDescription24} from './clothing24.js';
const paths={
 head:'M26 73V55C26 12 99 10 103 55L106 80 84 88 82 66 48 66 46 88Z',
 face:'M32 38 96 38 104 69 84 102 45 102 24 69Z',
 torso:'M43 19 57 30 71 30 85 19 115 39 101 66 90 61 92 111 35 111 37 61 25 66 13 39Z',
 outer:'M43 17 60 31 69 31 86 17 108 36 100 108 79 116 49 116 27 108 20 36Z',
 legs:'M31 15 97 15 102 113 74 116 64 54 54 116 26 113Z',
 hands:'M36 112 32 78 13 55Q10 44 20 42L36 56 32 22Q33 10 43 15L49 43 47 10Q52 2 59 11L64 42 64 10Q70 2 76 12L79 45 83 22Q92 13 94 26L93 75 84 110Z',
 feet:'M40 12 91 12 86 76 108 91Q121 101 111 111L22 115Q10 113 14 98L33 69Z'
};
function garment(c){
 let path=paths[c.slot];if(c.shape==='cap')path='M25 65Q23 20 74 26L93 58 116 67 115 75 60 72 27 83Z';
 if(c.shape==='beanie')path='M25 81V58Q25 15 65 15T104 58V81L98 99H31Z';
 if(c.shape==='bandana'||c.shape==='scarf')path='M22 41 107 41 96 82 63 107 29 82Z';
 if(c.shape==='balaclava')path='M28 104V45Q28 12 64 12T100 45V104L85 116H43Z';
 if(c.shape==='poncho'||c.shape==='cloak'||c.shape==='furcoat')path='M47 12Q64 0 82 12L119 112 94 119 65 110 35 119 9 112Z';
 if(c.shape==='vest'||c.shape==='kevlar'||c.shape==='plate')path='M37 15 51 15 55 34 75 34 79 15 94 15 91 50 104 58 98 112 29 112 23 58 36 50Z';
 if(c.shape==='tee')path='M42 23 57 31 72 31 87 23 115 39 100 60 89 54 91 112H36L38 54 26 60 13 39Z';
 if(c.shape==='mittens')path='M33 111 30 72 16 58Q8 38 22 40L34 52 34 30Q35 6 61 9T91 29L95 75 83 111Z';
 const metal=['plate','armored','gauntlet','weld','visor'].includes(c.shape),cloak=['cloak','poncho','furcoat'].includes(c.shape);
 const extra=(c.slot==='head'&&['helmet','visor','fur'].includes(c.shape)?'<path d="M31 59H101M45 28Q54 21 67 22M84 33L94 48" fill="none"/><path d="M47 66H82V79H47Z" fill="#1d272c"/>':'')+
 (['mask','balaclava','weld'].includes(c.shape)?'<path d="M36 47H92V60H36Z" fill="#18252c"/><path d="M48 79H81M51 87H78" fill="none"/>':'')+
 (c.slot==='torso'||c.slot==='outer'?`<path d="M64 35V106M36 68H92" fill="none"/><path d="M39 48H56V62H39ZM73 48H90V62H73Z" fill="#000" opacity=".17"/>`:'')+
 (c.shape==='stripe'?'<path d="M37 52H92M37 66H92M37 80H92M37 94H92" fill="none" stroke="#d6dfdb" stroke-width="6"/>':'')+
 (c.slot==='legs'?'<path d="M34 28H95M64 29V49M35 51H49V68H35M79 51H94V68H79" fill="none"/>':'')+
 (c.slot==='feet'?'<path d="M44 34H78M42 45H77M40 56H77M34 74L79 78M18 104H113" fill="none" stroke-width="4"/>':'')+
 (c.slot==='hands'?'<path d="M38 82H87M40 96H85" fill="none" stroke-width="4"/>':'')+
 (metal?'<path d="M40 72 64 64 88 72 84 95 64 105 44 95Z" fill="#d5dddd" opacity=".30"/><circle cx="42" cy="79" r="2" fill="#dce4df"/><circle cx="85" cy="79" r="2" fill="#dce4df"/>':'')+
 (c.shape==='kevlar'?'<path d="M38 72H91M37 80H92M36 88H93M35 96H94" stroke="#191e15" stroke-width="4"/>':'')+
 (c.grade===6?'<path d="M83 87H98V100H83Z" fill="#a4ae68"/><path d="M87 89V98M94 89 87 94 94 98" fill="none" stroke="#3c442e" stroke-width="2"/>':'')+
 (cloak?'<path d="M52 28 33 105M76 28 95 105M64 30V106" fill="none" stroke-width="2"/><path d="M48 17Q64 39 80 17" fill="none" stroke="#bcb998" stroke-width="5"/>':'');
 return `<g fill="${c.color}" stroke="#20272b" stroke-width="3" stroke-linejoin="round"><path d="${path}"/>${extra}<path d="M36 109H89" fill="none" stroke="#e4dec0" stroke-opacity=".35" stroke-dasharray="2 3" stroke-width="1.5"/></g>`;
}
const icons=new Map();
export function clothingArt24(id){const c=CLOTHING24[id];if(!c)return'';if(!icons.has(id)){const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">${garment(c)}</svg>`;icons.set(id,`data:image/svg+xml,${encodeURIComponent(svg)}`);}return `<img class="item-art clothing-art24" src="${icons.get(id)}" alt="" draggable="false">`;}
/** The live world supplies a real 3D render; no engine is loaded by this markup. */
export function clothingPreview24(){return `<div class="player-preview28"><canvas data-player-canvas28 width="240" height="360" aria-label="3D-персонаж с надетой одеждой. Потяни, чтобы повернуть." tabindex="0"></canvas><div class="player-controls28"><button type="button" data-player-turn28="-.6" aria-label="Повернуть влево">↶</button><button type="button" data-player-turn28=".6" aria-label="Повернуть вправо">↷</button><button type="button" data-player-zoom28="-.35" aria-label="Приблизить">+</button><button type="button" data-player-zoom28=".35" aria-label="Отдалить">−</button></div><small>3D · НАДЕТОЕ · ПОТЯНИ ДЛЯ ПОВОРОТА</small></div>`;}

export function equipmentPane24(state,selected,art){const stats=wearStats24(state),candidate=CLOTHING24[selected?.item];return `<section class="wear-panel24" aria-label="Одежда — семь слотов"><div class="equipment06 wear-slots24">${WEAR_SLOTS24.map((slot,i)=>{const c=CLOTHING24[state.wear24?.[i]];return `<button type="button" data-wear-slot="${i}" class="${c?'equipped':''} ${candidate?.index===i?'wear-match24':''}" title="${c?c.name+' · нажми, чтобы снять':slot.name+' · выбери одежду в рюкзаке'}" aria-label="${slot.name}: ${c?c.name:'пусто'}">${c?art(c.id):'<span class="wear-empty24">'+['◉','◈','♧','◇','Ⅱ','♧','⌁'][i]+'</span>'}<small>${slot.name}</small></button>`;}).join('')}</div><div class="wear-stats24"><span title="Общее снижение урона от выстрелов">ПУЛИ <b>${Math.round(stats.bullet*100)}%</b></span><span title="Общее снижение урона от укусов волка">УКУСЫ <b>${Math.round(stats.melee*100)}%</b></span><span title="Общее снижение урона от взрывов">ВЗРЫВ <b>${Math.round(stats.blast*100)}%</b></span></div><p class="wear-hint24">7 слотов · нажми вещь на персонаже, чтобы снять. Выбери одежду в рюкзаке → НАДЕТЬ.</p><p class="wear-description24">${candidate?candidate.name+': '+clothingDescription24(candidate.id):'Одежда в рюкзаке не защищает. Плащи и бронежилеты занимают один общий верхний слот.'}</p></section>`;}
