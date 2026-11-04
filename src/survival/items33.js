export const ITEMS33={
 oatBar:{name:'Овсяный батончик',icon:'food'},fruitTin:{name:'Фруктовые консервы',icon:'food'},waterPouch:{name:'Пакет питьевой воды',icon:'water'},driedFish:{name:'Вяленая рыба',icon:'food'},berryJuice:{name:'Ягодный морс',icon:'water'},medicalGauze:{name:'Медицинская марля',icon:'health'},fieldDressing:{name:'Полевая перевязка',icon:'health'},salineBottle:{name:'Флакон физраствора',icon:'health'},copperWire:{name:'Медная проволока',icon:'scrap'},bearingSet:{name:'Комплект подшипников',icon:'scrap'},
};
export const USE33={oatBar:{hunger:22,thirst:-3},fruitTin:{hunger:20,thirst:8},waterPouch:{thirst:35},driedFish:{hunger:26,thirst:-4},berryJuice:{hunger:8,thirst:22,health:2},medicalGauze:{health:12,medical:true},fieldDressing:{health:35,medical:true},salineBottle:{health:10,thirst:20,medical:true}};
const recipe=(id,cost,description,station)=>({name:ITEMS33[id].name,category:USE33[id]?'tools':'process',cost,description,...station?{station}:{}});
export const RECIPES33={
 oatBar:recipe('oatBar',{corn:2,berries:1},'Компактная еда: +22 сытости, −3 воды.'),fruitTin:recipe('fruitTin',{pumpkin:1,berries:2,metal:2},'+20 сытости, +8 воды.'),waterPouch:recipe('waterPouch',{water:1,tarp:1},'Порция чистой воды: +35 жажды.'),driedFish:recipe('driedFish',{cookedMeat:1,fiber:2},'Копчёная полевая еда: +26 сытости, −4 воды.'),berryJuice:recipe('berryJuice',{berries:3,water:1},'+22 воды, +8 сытости и +2 HP.'),medicalGauze:recipe('medicalGauze',{fiber:6},'Чистая перевязочная марля: +12 HP.'),fieldDressing:recipe('fieldDressing',{medicalGauze:2,antiseptic:1},'Плотная полевая повязка: +35 HP.'),salineBottle:recipe('salineBottle',{water:1,lowFuel:2,fiber:2},'Очищенная полевая жидкость: +10 HP, +20 воды. Не укол.'),copperWire:recipe('copperWire',{metal:8,scrap:2},'Проводка для электроники и переработки.','workbench'),bearingSet:recipe('bearingSet',{metal:12,lowFuel:2},'Подшипники механизмов и переработка.','workbench')};
export const RECYCLE33={copperWire:{scrap:1,metal:3},bearingSet:{scrap:2,metal:5}};
export const LOOT33={normal:{oatBar:1,waterPouch:1,medicalGauze:1},tool:{copperWire:1,bearingSet:1,fieldDressing:1},military:{driedFish:1,salineBottle:1},elite:{fruitTin:1,berryJuice:1,fieldDressing:1}};

// Fish is found in supply crates/shops; generic cooked meat is not transformed into fish.
delete RECIPES33.driedFish;
