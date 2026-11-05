import {ITEMS33,RECIPES33} from './supplies37.js';
import {GUNS29} from './weapon-profiles29.js';
import {MOD_ITEMS25,MOD_RECIPES25,capacityBonus25} from './attachments25.js';
import {STRUCTURAL,COMPONENTS,NEW_WEAPONS,GUN_COMPONENT_COSTS} from './expansion.js';
/** Original weapon balance and construction costs; shared without state-module cycles. */
export const WEAPONS={rifle:{name:'Охотничья снайперская В-6',ammo:'ammo',capacity:6,damage:54,interval:.85,range:210},pistol:{name:'Пистолет П-9',ammo:'pistolAmmo',capacity:12,damage:26,interval:.22,range:55},revolver:{name:'Револьвер Р-6',ammo:'pistolAmmo',capacity:6,damage:38,interval:.42,range:65},smg:{name:'Пистолет-пулемёт МП-24',ammo:'pistolAmmo',capacity:24,damage:20,interval:.1,range:65,automatic:true},shotgun:{name:'Помповое ружьё',ammo:'shells',capacity:5,damage:90,interval:.85,range:26},assaultRifle:{name:'Автомат АР-30',ammo:'ammo',capacity:30,damage:32,interval:.13,range:110,automatic:true},boltRifle:{name:'Кустарная снайперская БВ-5',ammo:'ammo',capacity:5,damage:80,interval:1.15,range:300}};
Object.assign(WEAPONS,NEW_WEAPONS,{akRifle:{name:'Автомат АК-47',ammo:'ammo',capacity:30,damage:38,interval:.15,range:125,automatic:true,reload:2.9},compactSmg:{name:'Компактный ПП-32',ammo:'pistolAmmo',capacity:32,damage:18,interval:.078,range:60,automatic:true,reload:2.4}});for(const w of Object.values(WEAPONS))w.reload??=w.capacity>20?2.8:w.capacity>6?2:2.4;
// DEV17: faster cadence; signed yaw follows Three's YXZ convention:
// negative yaw moves the aim right, positive yaw left. Pitch positive is up.
for(const[id,w]of Object.entries(WEAPONS)){
 w.interval=GUNS29[id]?.interval??Number(Math.max(.055,w.interval*.78).toFixed(4));
 const rifle=['carbine26','rifle','semiRifle','assaultRifle','akRifle','boltRifle','machineGun'].includes(id),pistol=['pistol','heavyPistol','revolver'].includes(id);
 w.recoil17={up:w.projectile?.028:['shotgun','combatShotgun'].includes(id)?.033:w.automatic?.010:.019,side:rifle?-.005:pistol?0:.004};
}
export const isGun=id=>Object.hasOwn(WEAPONS,id);
export const magazine=(s,id=s.selected)=>id==='rifle'?s.magazine:(s.magazines?.[id]||0);
export function setMagazine(s,id,n){if(id==='rifle')s.magazine=n;else{ s.magazines??={};s.magazines[id]=n;}}
export const BUILD_COSTS=Object.fromEntries(Object.entries(STRUCTURAL).map(([k,v])=>[k,{wood:v.wood}]));
export const EXTRA_ITEMS={cactusFlesh:{name:'Мякоть кактуса',icon:'food'},sleepingBag:{name:'Спальный мешок',icon:'armor'},...Object.fromEntries(Object.entries(WEAPONS).filter(([id])=>id!=='rifle').map(([id,w])=>[id,{name:w.name,icon:'rifle'}])),plan:{name:'Строительный план',icon:'plan'},storage:{name:'Деревянный ящик',icon:'storage'},largeStorage:{name:'Большой ящик',icon:'storage'},pistolAmmo:{name:'Пистолетные патроны',icon:'ammo'},shells:{name:'Картечь',icon:'ammo'},syringe:{name:'Медицинский шприц',icon:'health'},medkit:{name:'Аптечка',icon:'health'},cannedFood:{name:'Консервы',icon:'food'},lowFuel:{name:'Топливо низкого качества',icon:'fuel'},rope:{name:'Верёвка',icon:'fiber'},gears:{name:'Шестерни',icon:'scrap'},spring:{name:'Пружина',icon:'scrap'},sewingKit:{name:'Швейный набор',icon:'fiber'}};
export const EXTRA_RECIPES={sleepingBag:{name:'Спальный мешок',category:'build',cost:{fiber:40,sewingKit:1},description:'Установи на ровном грунте или своём перекрытии. E — выбрать точкой возрождения. Выбор на экране смерти. Уничтоженный спальник не работает; максимум 8.'},plan:{name:'Строительный план',category:'tools',cost:{wood:10,fiber:2},description:'Возьми в руки. B — выбор элемента; ресурсы списываются при установке, отдельно стены не крафтятся.'},storage:{name:'Деревянный ящик · 12 слотов',category:'build',cost:{wood:40},description:'Постоянное хранилище. Пустым не исчезает.'},largeStorage:{name:'Большой ящик · 30 слотов',category:'build',station:'workbench',cost:{wood:100,metal:10},description:'Постоянное хранилище на 30 стопок.'},pistolAmmo:{name:'Пистолетные патроны ×12',category:'process',cost:{metal:3,gunpowder:4},output:12,description:'Для пистолета, револьвера и ПП.'},shells:{name:'Картечь ×6',category:'process',cost:{metal:3,gunpowder:4},output:6,description:'Для помпового ружья.'},syringe:{name:'Медицинский шприц',category:'tools',cost:{fiber:12,lowFuel:5},description:'Восстанавливает 25 HP.'},medkit:{name:'Аптечка',category:'tools',station:'workbench',cost:{fiber:25,syringe:2},description:'Восстанавливает 65 HP.'},rope:{name:'Верёвка',category:'tools',cost:{fiber:10},description:'Материал для снаряжения.'},...Object.fromEntries(Object.entries(WEAPONS).filter(([id])=>id!=='rifle').map(([id,w],i)=>[id,{name:w.name,category:'tools',station:'workbench',cost:{wood:20,metal:20+i*8,scrap:8+i*3},description:`Магазин ${w.capacity}. Боеприпасы: ${w.ammo==='ammo'?'винтовочные':w.ammo==='rocket'?'ракеты':w.ammo==='shells'?'картечь':'пистолетные'}.` }]))};

Object.assign(EXTRA_ITEMS,Object.fromEntries(Object.entries(COMPONENTS).map(([id,name])=>[id,{name,icon:id.includes('Metal')?'ore':id.includes('rocket')||id==='rocket'?'ammo':['cupboard','recycler','repairBench'].includes(id)?'storage':'scrap'}])),Object.fromEntries(Object.entries(STRUCTURAL).map(([id,v])=>[id,{name:v.name,icon:id.toLowerCase().includes('foundation')?'foundation':id.toLowerCase().includes('roof')?'roof':'wall'}])));
Object.assign(EXTRA_RECIPES,{
 cupboard:{name:'Шкаф обслуживания',category:'build',cost:{wood:120,metal:15},description:'Поставь на фундамент. Дерево, камень и металл внутри оплачивают обслуживание только соответствующих частей связанного дома.'},
 door:{name:'Деревянная дверь',category:'build',cost:{wood:50,metal:5},description:'Крафтится отдельно. Установи в дверной проём строительного плана.'},
 recycler:{name:'Переработчик компонентов',category:'build',station:'workbench',cost:{wood:80,metal:50,gears:3},description:'Шесть входных и шесть выходных слотов. Включи машину: один компонент за 2,5 секунды. Содержимое сохраняется.'},
 repairBench:{name:'Ремонтный стол',category:'build',cost:{wood:60,metal:25},description:'Ремонт огнестрела за металл. Оружие постепенно изнашивается при стрельбе.'},
 metalPipe:{name:'Металлическая труба',category:'process',station:'workbench',cost:{metal:15,scrap:4},description:'Обязательный компонент огнестрела.'},
 metalCylinder:{name:'Металлический баллон',category:'process',station:'workbench',cost:{metal:20,scrap:5},description:'Компонент револьвера, дробовика и ракетницы.'},
 spring:{name:'Пружина',category:'process',station:'workbench',cost:{metal:12,scrap:5},description:'Механизм автоматического оружия.'},
 explosives:{name:'Взрывчатое вещество',category:'process',station:'workbench',cost:{gunpowder:20,sulfur:10,lowFuel:5},description:'Игровой компонент мощных зарядов.'},
 rocket:{name:'Ракета',category:'process',station:'workbench',cost:{metalPipe:2,explosives:4,gunpowder:30},description:'Боеприпас ракетницы. Взрывается при попадании, повреждает постройки.'},
 hvRocket:{name:'Скоростная ракета',category:'process',station:'workbench',cost:{rocket:1,metal:10},description:'Выбор боеприпаса ракетницы в рюкзаке: выше скорость, меньше радиус.'},
 incendiaryRocket:{name:'Зажигательная ракета',category:'process',station:'workbench',cost:{rocket:1,lowFuel:20},description:'Оставляет временную горящую область.'},
 timedCharge:{name:'Подрывной заряд',category:'tools',station:'workbench',cost:{explosives:8,techParts:2,fiber:15},description:'Игровой заряд: задержка 4 секунды, большой урон постройкам.'},
 f1Grenade:{name:'Осколочная граната',category:'tools',station:'workbench',cost:{metal:15,gunpowder:20},description:'Бросок, трёхсекундный запал и урон в радиусе.'},
 beancan:{name:'Самодельная граната',category:'tools',cost:{metal:8,gunpowder:12},description:'Небольшой метательный заряд.'},
 cookedMeat:{name:'Жареное мясо',category:'process',station:'campfire',cost:{meat:1,wood:2},description:'Приготовь рядом с установленным костром. Восстанавливает сытость.'}
});
for(const[id,w]of Object.entries(WEAPONS)){EXTRA_RECIPES[id]??={name:w.name,category:'tools',station:'workbench',cost:{wood:25,metal:45,scrap:20},description:`${w.capacity} патронов. Компоненты обязательны.`};Object.assign(EXTRA_RECIPES[id].cost,GUN_COMPONENT_COSTS[id]);}

// DEV16 additions: explicit component costs, no alternative uncosted firearm recipes.
Object.assign(EXTRA_ITEMS,{antiseptic:{name:'Антисептик',icon:'health'},traumaKit:{name:'Травматологический набор',icon:'health'}});
Object.assign(EXTRA_RECIPES,{
 akRifle:{name:WEAPONS.akRifle.name,category:'tools',station:'workbench',cost:{wood:35,metal:140,highMetal:8,rifleBody:1,spring:2,metalPipe:2},description:'30 винтовочных патронов. Мощнее АР-30, но стреляет медленнее. Двуручный хват, сменный изогнутый магазин.'},
 compactSmg:{name:WEAPONS.compactSmg.name,category:'tools',station:'workbench',cost:{metal:90,scrap:35,smgBody:1,spring:2,metalPipe:1},description:'32 пистолетных патрона, высокая скорострельность. Низкий урон и небольшая эффективная дальность.'},
 antiseptic:{name:'Антисептик',category:'tools',cost:{fiber:10,lowFuel:3},description:'Восстанавливает 45 HP. Улучшенная полевая перевязка.'},
 traumaKit:{name:'Травматологический набор',category:'tools',station:'workbench',cost:{medkit:1,antiseptic:2,sewingKit:1},description:'Восстанавливает 90 HP. Не воскрешает и не увеличивает максимум здоровья.'}
});
export const MEDICAL16={bandage:35,syringe:25,medkit:65,antiseptic:45,traumaKit:90};

Object.assign(EXTRA_ITEMS,MOD_ITEMS25);Object.assign(EXTRA_RECIPES,MOD_RECIPES25);
export const weaponCapacity25=(s,id=s.selected)=>Math.ceil((WEAPONS[id]?.capacity||0)*capacityBonus25(s,id));

Object.assign(EXTRA_ITEMS,ITEMS33);Object.assign(EXTRA_RECIPES,RECIPES33);
EXTRA_RECIPES.recycler.cost.bearingSet=2;
for(const id of ["holoSight","laserSight"])if(EXTRA_RECIPES[id])EXTRA_RECIPES[id].cost.copperWire=1;
