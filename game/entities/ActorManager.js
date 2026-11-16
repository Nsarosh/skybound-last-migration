import { angleTo, circlesTouch, clamp, distance, normalize } from '../engine/SpatialPhysics.js';

const COLORS = { drone:'#24e8ff', elite:'#ff36c8', shard:'#ffcf4a', player:'#e9fbff', boss:'#ff36c8' };
export class ActorManager {
  constructor(rng, width, height) { this.rng=rng; this.width=width; this.height=height; this.reset(); }
  reset() { this.player={x:this.width/2,y:this.height/2,radius:13,hp:120,maxHp:120,speed:280,fire:0,dash:0,invuln:0,damage:16,shots:1,magnet:115,angle:0}; this.enemies=[];this.bullets=[];this.shards=[];this.particles=[];this.texts=[];this.boss=null; }
  resize(width,height) { this.width=width;this.height=height; this.player.x=clamp(this.player.x,22,width-22);this.player.y=clamp(this.player.y,82,height-50); }
  spawnEnemy(kind='drone') { const side=this.rng.int(0,3), pad=35; let x,y; if(side===0){x=this.rng.range(0,this.width);y=-pad;} else if(side===1){x=this.width+pad;y=this.rng.range(0,this.height);} else if(side===2){x=this.rng.range(0,this.width);y=this.height+pad;}else{x=-pad;y=this.rng.range(0,this.height);} const elite=kind==='elite'; this.enemies.push({x,y,radius:elite?20:11,hp:elite?150:38,maxHp:elite?150:38,speed:elite?48:72+this.rng.range(0,22),damage:elite?18:9,kind,phase:this.rng.next()*6,spin:this.rng.sign(),value:elite?480:65,color:elite?COLORS.elite:COLORS.drone}); }
  spawnBoss() { this.boss={x:this.width/2,y:-120,radius:78,hp:3400,maxHp:3400,phase:0,arrived:false,fire:1.4,value:12000}; }
  fire() { const p=this.player; if(p.fire>0) return; p.fire=Math.max(.075,.22-(p.shots-1)*.018); let nearest=this.boss || this.enemies.reduce((best,e)=>!best||distance(p,e)<distance(p,best)?e:best,null); if(!nearest)return; p.angle=angleTo(p,nearest); const spread=.14; for(let i=0;i<p.shots;i++){const a=p.angle+(i-(p.shots-1)/2)*spread;this.bullets.push({x:p.x,y:p.y,vx:Math.cos(a)*550,vy:Math.sin(a)*550,radius:4,damage:p.damage,life:1.35,critical:this.rng.next()<.14});} }
  updatePlayer(dt,input) { const p=this.player; const motion=normalize(input.x,input.y); if(input.x||input.y){p.x=clamp(p.x+motion.x*p.speed*dt,20,this.width-20);p.y=clamp(p.y+motion.y*p.speed*dt,76,this.height-35);} p.fire-=dt;p.dash-=dt;p.invuln-=dt; if(input.dash&&p.dash<=0){p.dash=2.2;p.invuln=.34;p.x=clamp(p.x+motion.x*85,20,this.width-20);p.y=clamp(p.y+motion.y*85,76,this.height-35);return true;} return false; }
  update(dt,events) {
    const p=this.player; this.fire();
    for(const bullet of this.bullets){bullet.x+=bullet.vx*dt;bullet.y+=bullet.vy*dt;bullet.life-=dt;} this.bullets=this.bullets.filter(b=>b.life>0);
    for(const e of this.enemies){const n=normalize(p.x-e.x,p.y-e.y); e.phase+=dt*(e.kind==='elite'?3:2); e.x+=(n.x*e.speed+Math.cos(e.phase)*18)*dt;e.y+=(n.y*e.speed+Math.sin(e.phase)*18)*dt;}
    if(this.boss){const b=this.boss,targetY=Math.max(96,Math.min(this.height*.23,150));b.phase+=dt;b.y+=(targetY-b.y)*dt*2.1;if(!b.arrived&&b.y>=targetY-2){b.y=targetY;b.arrived=true;b.fire=.45;}b.x=this.width/2+Math.sin(b.phase*.42)*this.width*.19;b.fire-=dt;if(b.arrived&&b.fire<0){b.fire=.72;for(let i=0;i<8;i++){const a=i*Math.PI/4+b.phase;this.bullets.push({x:b.x,y:b.y,vx:Math.cos(a)*-120,vy:Math.sin(a)*-120,radius:5,damage:12,enemy:true,life:4});}}}
    this.collide(events); this.updateEffects(dt);
  }
  collide(events) { const p=this.player;
    for(const bullet of this.bullets){if(bullet.enemy){if(p.invuln<=0&&circlesTouch(p,bullet)){bullet.life=0;this.hurt(bullet.damage,events);}continue;} const targets=[...this.enemies,...(this.boss?[this.boss]:[])];for(const e of targets){if(bullet.life>0&&circlesTouch(bullet,e)){bullet.life=0;const damage=bullet.damage*(bullet.critical?2:1);e.hp-=damage;this.burst(e.x,e.y,bullet.critical?'#ffcf4a':'#24e8ff',bullet.critical?8:3);events.hit(bullet.critical,e);if(e.hp<=0)this.kill(e,events);}}}
    for(const e of this.enemies){if(p.invuln<=0&&circlesTouch(p,e)){e.hp=0;this.hurt(e.damage,events);}}
    this.enemies=this.enemies.filter(e=>e.hp>0); for(const s of this.shards){const d=distance(p,s);if(d<p.magnet){const n=normalize(p.x-s.x,p.y-s.y);s.x+=n.x*(95+(p.magnet-d)*5)*.016;s.y+=n.y*(95+(p.magnet-d)*5)*.016;}if(d<18){s.dead=true;events.shard(s.value);this.burst(s.x,s.y,COLORS.shard,6);}} this.shards=this.shards.filter(s=>!s.dead);
  }
  hurt(amount,events){const p=this.player;p.hp-=amount;p.invuln=.48;this.texts.push({x:p.x,y:p.y-30,text:'SHIELD HIT',color:'#ff36c8',life:.75});this.burst(p.x,p.y,'#ff36c8',16);events.hurt();}
  kill(e,events){if(e===this.boss){this.boss=null;events.bossDown(e.value);return;} e.hp=0;events.kill(e.value,e.kind==='elite');this.texts.push({x:e.x,y:e.y-12,text:e.kind==='elite'?'+480 CRIT!':'+65',color:e.kind==='elite'?'#ffcf4a':'#e9fbff',life:1});this.burst(e.x,e.y,e.color,e.kind==='elite'?24:11);const count=e.kind==='elite'?8:2;for(let i=0;i<count;i++)this.shards.push({x:e.x+this.rng.range(-8,8),y:e.y+this.rng.range(-8,8),radius:4,value:e.kind==='elite'?8:3,phase:this.rng.next()*7});}
  burst(x,y,color,count){for(let i=0;i<count;i++){const a=this.rng.range(0,Math.PI*2),v=this.rng.range(35,190);this.particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,color,life:this.rng.range(.2,.7),size:this.rng.range(1,4)});}}
  updateEffects(dt){for(const a of this.particles){a.x+=a.vx*dt;a.y+=a.vy*dt;a.vx*=.94;a.vy*=.94;a.life-=dt;}this.particles=this.particles.filter(a=>a.life>0);for(const t of this.texts){t.y-=28*dt;t.life-=dt;}this.texts=this.texts.filter(t=>t.life>0);}
  upgrade(type){const p=this.player;if(type==='damage')p.damage+=7;if(type==='shots')p.shots=Math.min(5,p.shots+1);if(type==='magnet')p.magnet+=58;if(type==='shield'){p.maxHp+=35;p.hp=Math.min(p.maxHp,p.hp+55);} }
}
