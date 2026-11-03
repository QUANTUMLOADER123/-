/** Reproducible perception: no radius-based knowledge through walls. */
export function seesPlayer({distance,facingDot,visible,difficulty,daylight=1,provoked=false}){const range=(difficulty==='hard'?35:24)*(daylight<.2?.55:1);return visible&&distance<range&&(provoked||facingDot>.38);}
export function hitProbability(distance,moving,difficulty){return Math.max(.07,Math.min(.6,(difficulty==='hard'?.58:.35)-distance*.008-(moving?.14:0)));}
