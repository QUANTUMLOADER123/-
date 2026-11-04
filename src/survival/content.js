import {buildSites17} from './sites17.js';
import {roads08} from './roads08.js';
import {makeSettlements} from './world04.js';
import {pbrMaterial12} from './materials12.js';
import {BOT_BASES} from './map-data.js';
import * as THREE from 'three';
export const LOOT_TABLES={supplies:{wood:12,fiber:5,water:1,berries:3,bandage:1,cannedFood:1,sewingKit:1},industrial:{scrap:5,metalOre:9,sulfurOre:6,metal:3,lowFuel:6,gears:1,spring:1},military:{scrap:7,metal:5,ammo:8,gunpowder:4,syringe:1,rope:1},ore:{stone:16,metalOre:12,sulfurOre:10},road:{scrap:2,fiber:2,metalOre:3},barrel:{scrap:3,wood:5,metalOre:4}};
/** DEV17 fully replaces the DEV03/04/08 RT builders and their overlay details.
 * Saved site/loot IDs and terrain stay stable; no duplicate structures/colliders. */
export function addIslandContent(w){
 w.distantGroups=[];w.staticStructures=[];w.bases=BOT_BASES;w.walkFloors=[];
 buildSites17(w);
 const road=pbrMaterial12(w,'asphalt',{polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}),paint=new THREE.MeshBasicMaterial({color:0xb9b79e,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
 roads08(w,road,paint,w.constructionMaterials.metal,w.constructionMaterials.concrete);w.roadTexture=road.map;makeSettlements(w);
}
