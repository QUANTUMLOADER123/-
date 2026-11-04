/** Plain settings schema; importing the main menu must not load Three/WebGL. */
export const GRAPHICS28={
 renderScale28:{label:'Разрешение рендера',options:[[.5,'50%'],[.67,'67%'],[.85,'85%'],[1,'100%'],[1.25,'125%']]},
 textureDivisor28:{label:'Текстуры · уменьшение сторон',restart:true,options:[[1,'Исходные'],[2,'В 2 раза · ¼ пикселей'],[4,'В 4 раза · ¹⁄₁₆ пикселей'],[8,'В 8 раз · ¹⁄₆₄ пикселей']]},
 anisotropy28:{label:'Фильтрация текстур',options:[[1,'1×'],[2,'2×'],[4,'4×'],[8,'8×']]},
 shadowSize28:{label:'Карта теней',options:[[0,'Выключены'],[512,'512'],[1024,'1024'],[2048,'2048']]},
 shadowFps28:{label:'Частота обновления теней',options:[[5,'5 Гц'],[10,'10 Гц'],[15,'15 Гц'],[30,'30 Гц']]},
 reflection28:{label:'Отражения воды',options:[[0,'Выключены · небо остаётся'],[256,'256'],[512,'512'],[1024,'1024']]},
 reflectionFps28:{label:'Частота отражений',options:[[2,'2 Гц'],[5,'5 Гц'],[10,'10 Гц']]},
 grass28:{label:'Трава · плотность и дальность',options:[['off','Выключена'],['low','Низкая · 56 м'],['medium','Средняя · 82 м'],['high','Высокая · 108 м']]},
 understory28:{label:'Декоративный подлесок',options:[[0,'Скрыт'],[1,'Включён']]},
 detailMaps28:{label:'Детали материалов',options:[[0,'Без normal/AO/roughness-карт'],[1,'Полные PBR-карты']]},
 particles28:{label:'Дождь и брызги',options:[[0,'Выключены'],[1,'Мало'],[2,'Полные']]},
 fpsLimit28:{label:'Ограничение частоты кадров',options:[[30,'30'],[45,'45'],[60,'60'],[90,'90'],[0,'Без лимита']]}
};
export const PRESETS28={
 low:{renderScale28:.5,textureDivisor28:8,anisotropy28:1,shadowSize28:0,shadowFps28:5,reflection28:0,reflectionFps28:2,grass28:'low',understory28:0,detailMaps28:0,particles28:1,fpsLimit28:30,antialias:'fxaa',viewDistance16:'near'},
 medium:{renderScale28:.85,textureDivisor28:2,anisotropy28:4,shadowSize28:1024,shadowFps28:10,reflection28:0,reflectionFps28:5,grass28:'medium',understory28:1,detailMaps28:1,particles28:1,fpsLimit28:60,antialias:'fxaa',viewDistance16:'balanced'},
 high:{renderScale28:1,textureDivisor28:1,anisotropy28:8,shadowSize28:2048,shadowFps28:15,reflection28:512,reflectionFps28:5,grass28:'high',understory28:1,detailMaps28:1,particles28:2,fpsLimit28:60,antialias:'smaa',viewDistance16:'far'}
};
export const AA28=['off','fxaa','smaa','msaa2','msaa4','maximum'];
export function normalizeGraphics28(s){const p=PRESETS28[s.quality]||PRESETS28.medium,out={};for(const [key,def]of Object.entries(GRAPHICS28))out[key]=def.options.some(([v])=>v===s[key])?s[key]:p[key];out.antialias=AA28.includes(s.antialias)?s.antialias:s.antialias==='standard'?'msaa2':p.antialias;return out;}
export function graphicsControls28(){return Object.entries(GRAPHICS28).map(([key,d])=>`<label class="antialias-setting">${d.label}${d.restart?' *':''}<select data-graphics28="${key}">${d.options.map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select></label>`).join('');}
