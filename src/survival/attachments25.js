/** Original detachable modules; configuration is per weapon TYPE, like existing magazines/condition. */
export const MOD_SLOTS25=['ПРИЦЕЛ','ДУЛО','ЛАЗЕР','МАГАЗИН'];
export const MODS25={
 holoSight:{name:'Голографический прицел',slot:0,zoom:1.45,cost:{metal:35,techParts:1}},
 reflexSight:{name:'Коллиматор',slot:0,zoom:1.2,cost:{metal:20,highMetal:2}},
 scope4x:{name:'Оптический прицел ×4',slot:0,zoom:4,cost:{highMetal:8,techParts:2,metal:30}},
 suppressor:{name:'Глушитель',slot:1,cost:{metalPipe:2,highMetal:4}},
 muzzleBrake:{name:'Дульный тормоз',slot:1,cost:{metal:35,metalPipe:1}},
 flashHider:{name:'Пламегаситель',slot:1,cost:{metal:20,metalPipe:1}},
 laserSight:{name:'Лазерный целеуказатель',slot:2,cost:{techParts:1,metal:25}},
 extendedMag:{name:'Увеличенный магазин',slot:3,cost:{metal:40,spring:2,metalSheet:1}}
};
export const isAttachment25=id=>Object.hasOwn(MODS25,id);
export const modCompatible25=(gun,item)=>!!MODS25[item]&&gun!=='rocketLauncher'&&!(MODS25[item].slot===3&&['revolver','shotgun','combatShotgun','boltRifle'].includes(gun))&&!(item==='suppressor'&&['revolver','shotgun','combatShotgun'].includes(gun));
export const module25=(s,gun,slot)=>s?.attachments25?.[gun]?.[slot]||null;
export const capacityBonus25=(s,gun)=>module25(s,gun,3)==='extendedMag'?1.5:1;
export const recoilFactor25=(s,gun)=>module25(s,gun,1)==='muzzleBrake'?.74:1;
export const damageFactor25=(s,gun)=>module25(s,gun,1)==='suppressor'?.93:1;
export const spreadFactor25=(s,gun)=>module25(s,gun,2)==='laserSight'&&s.laserEnabled25!==false?.72:1;
export const MOD_ITEMS25=Object.fromEntries(Object.entries(MODS25).map(([id,m])=>[id,{name:m.name,icon:'scrap'}]));
export const MOD_RECIPES25=Object.fromEntries(Object.entries(MODS25).map(([id,m])=>[id,{name:m.name,category:'attachments',station:'workbench',cost:m.cost,description:id==='extendedMag'?'Ёмкость +50%. Не подходит к револьверу, дробовику и продольно-скользящей винтовке.':id==='laserSight'?'Видимый лазер; разброс от бедра меньше на 28%.':id==='suppressor'?'Тише выстрел и меньше вспышка; урон −7%.':id==='muzzleBrake'?'Отдача меньше на 26%.':id==='flashHider'?'Скрывает основную вспышку выстрела.':`Съёмный прицел. Увеличение ${m.zoom}×. Без установленного прицела — штатные механические.`}]));
