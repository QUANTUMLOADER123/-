export const BASE_SIZE = 146;
export const BLOCK_HEIGHT = 26;
export function seededRandom(seed) {
  let n = seed >>> 0;
  return () => { n += 0x6D2B79F5; let t = n; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
export function dailySeed(date = new Date()) {
  return Number(`${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}`);
}
export class StackGame {
  constructor({seed = Date.now(), daily = false} = {}) {
    this.random = seededRandom(seed); this.daily = daily; this.score = 0; this.combo = 0; this.perfects = 0;
    this.shield = false; this.shieldEarned = false; this.over = false;
    this.blocks = [{x:0,z:0,w:BASE_SIZE,d:BASE_SIZE,y:0}]; this.spawn();
  }
  spawn() {
    const top = this.blocks.at(-1); this.axis = this.score % 2 ? 'z' : 'x';
    this.direction = this.random() > .5 ? 1 : -1;
    this.moving = {x:top.x,z:top.z,w:top.w,d:top.d,y:(this.score+1)*BLOCK_HEIGHT};
    this.moving[this.axis] = top[this.axis] - this.direction * 185;
    this.speed = Math.min(225, 112 + this.score*3.1) * (this.daily ? 1.08 : 1);
  }
  update(dt) {
    if(this.over) return;
    const axis=this.axis, center=this.blocks.at(-1)[axis];
    this.moving[axis] += this.speed * this.direction * Math.min(dt,.05);
    if (this.moving[axis]>center+185) {this.moving[axis]=center+185;this.direction=-1;}
    if (this.moving[axis]<center-185) {this.moving[axis]=center-185;this.direction=1;}
  }
  place() {
    if(this.over) return {type:'ignored'};
    const top=this.blocks.at(-1), axis=this.axis, size=axis==='x'?'w':'d';
    const block={...this.moving}, delta=block[axis]-top[axis], overlap=top[size]-Math.abs(delta);
    const tolerance=Math.min(7,top[size]*.12);
    if(overlap<=0) {
      this.combo=0;
      if(this.shield) {this.shield=false; this.spawn(); return {type:'save'};}
      this.over=true; return {type:'miss',block};
    }
    let cut=null, type='cut', restored=false;
    if(Math.abs(delta)<=tolerance) {
      block[axis]=top[axis]; this.combo++; this.perfects++; type='perfect';
      if(this.combo%3===0) {block.w=Math.min(BASE_SIZE,block.w+8);block.d=Math.min(BASE_SIZE,block.d+8);restored=true;}
      if(this.combo>=5 && !this.shieldEarned) {this.shield=true;this.shieldEarned=true;}
    } else {
      this.combo=0; block[size]=overlap; block[axis]=top[axis]+delta/2;
      cut={...this.moving};cut[size]=Math.abs(delta);
      cut[axis]=top[axis]+Math.sign(delta)*(top[size]/2+Math.abs(delta)/2);
    }
    this.blocks.push(block); this.score++; this.spawn();
    return {type,block,cut,delta,restored,combo:this.combo};
  }
}
