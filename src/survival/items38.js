export const ITEMS38={wallLadder:{name:'Приставная лестница',icon:'wall'},woodenFence:{name:'Деревянный забор',icon:'wall'},compoundGate:{name:'Дворовые ворота',icon:'door'},barbedFence:{name:'Усиленный забор',icon:'wall'},weaponsLocker:{name:'Оружейный шкаф',icon:'storage'},reinforcedCrate:{name:'Усиленный сундук',icon:'storage'}};
export const DEPLOY38=Object.keys(ITEMS38);
export const STORAGE38=['weaponsLocker','reinforcedCrate'];
export const FENCES38=['woodenFence','barbedFence','compoundGate'];
export const RECIPES38={
 wallLadder:{name:ITEMS38.wallLadder.name,category:'build',cost:{wood:70,rope:2},description:'Вертикальная лестница 3.6 м. Прицелься в стену: ставится и на чужой дом БЕЗ авторизации. W / вперёд — вверх, S — вниз. Можно продолжить следующей секцией.'},
 woodenFence:{name:ITEMS38.woodenFence.name,category:'build',cost:{wood:100,rope:1},description:'Отдельная секция частокола 3 × 2.7 м. На земле, без фундамента. Поворот R; соседние секции стыкуются.'},
 compoundGate:{name:ITEMS38.compoundGate.name,category:'build',cost:{wood:160,metal:40,gears:2},description:'Отдельные дворовые ворота шириной 3 м. E — открыть. Чужие ворота надо вскрыть либо получить авторизацию.'},
 barbedFence:{name:ITEMS38.barbedFence.name,category:'build',station:'workbench',cost:{wood:60,metalSheet:3,metal:25},description:'Забор с листовой обшивкой и проволокой. Вдвое прочнее деревянного; проволока визуальная, не невидимая ловушка.'},
 weaponsLocker:{name:ITEMS38.weaponsLocker.name,category:'build',station:'workbench',cost:{metal:100,metalSheet:4,gears:1},description:'Устанавливаемое хранилище на 24 стопки. Оружие, патроны и любые вещи; E — открыть. Без бесплатного содержимого.'},
 reinforcedCrate:{name:ITEMS38.reinforcedCrate.name,category:'build',cost:{wood:100,metal:30,metalSheet:2},description:'Усиленный сундук на 42 стопки. Настоящие петли, обвязка и замок. Содержимое сохраняется и выпадает при разрушении.'}
};
export const isDoor38=kind=>kind==='door'||kind==='compoundGate';
