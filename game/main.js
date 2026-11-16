import { DeterministicRNG } from './engine/DeterministicRNG.js';
import { TraumaCamera } from './engine/SpatialPhysics.js';
import { ProceduralSynth } from './audio/ProceduralSynth.js';
import { ActorManager } from './entities/ActorManager.js';
import { WaveDirector } from './combat/WaveDirector.js';
import { NeonVFXRenderer } from './rendering/NeonVFXRenderer.js';

const $ = id => document.getElementById(id);
const modal=$('modal'), flash=$('flash'), fmt=n=>Math.round(n).toLocaleString('en-US').padStart(6,'0');
class SkyboundGame {
  constructor(){
    this.canvas=$('arena');this.renderer=new NeonVFXRenderer(this.canvas);this.synth=new ProceduralSynth();this.input={x:0,y:0,dash:false};this.keys=new Set();this.seed=0x7ab1e;this.high=Number(localStorage.getItem('skyboundBest')||0);this.state='briefing';this.last=0;this.time=0;this.score=0;this.combo=1;this.comboTimer=0;this.choices=[];this.bind();this.resize();this.reset();this.applyShowcase();requestAnimationFrame(t=>this.frame(t));
  }
  bind(){
    addEventListener('resize',()=>this.resize());
    addEventListener('keydown',e=>{this.keys.add(e.key.toLowerCase());if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(e.key.toLowerCase()))e.preventDefault();if(e.key.toLowerCase()==='r')this.start();if(this.state==='draft'&&['1','2','3'].includes(e.key))this.choose(Number(e.key)-1);});
    addEventListener('keyup',e=>this.keys.delete(e.key.toLowerCase()));
    this.canvas.addEventListener('pointerdown',()=>{this.synth.unlock();if(this.state==='briefing'||this.state==='end')this.start();});
    $('soundButton').onclick=e=>{this.synth.unlock();const on=this.synth.toggle();e.currentTarget.textContent=`◖ SOUND: ${on?'ON':'OFF'}`;};
  }
  resize(){this.renderer.resize();if(this.actors)this.actors.resize(innerWidth,innerHeight);}
  reset(){this.rng=new DeterministicRNG(this.seed);this.actors=new ActorManager(this.rng,innerWidth,innerHeight);this.waves=new WaveDirector(this.rng);this.camera=new TraumaCamera();this.score=0;this.combo=1;this.comboTimer=0;this.time=0;this.updateHUD();}
  applyShowcase(){const show=new URLSearchParams(location.search).get('showcase');if(!show)return this.showBriefing();if(show==='brief')return this.showBriefing();this.start();if(show==='combat'){this.seedCombat();}if(show==='draft'){this.seedCombat();this.openDraft();}if(show==='boss'){this.seedCombat();this.waves.elapsed=60;this.triggerBoss();}if(show==='victory'){this.seedCombat();this.finish(true);}}
  showBriefing(){this.state='briefing';modal.className='modal visible';modal.innerHTML=`<div class="panel"><div class="eyebrow">// NEONET DEFENSE COMMAND //</div><h1>PROJECT: <b>SKYBOUND</b></h1><div class="eyebrow">THE LAST MIGRATION</div><p>Hold the relay through the evacuation window. Harvest resonance shards, evolve your interceptor, and erase the <b>Dreadnought</b when it breaches the grid at 01:00.</p><div class="objective"><span>◈ SURVIVE <b>60 SECONDS</b></span><span>◈ DEFEAT THE DREADNOUGHT</span><span>◈ PROTECT THE MIGRATION</span></div><button id="launch">LAUNCH INTERCEPTOR&nbsp; ↗</button><p class="eyebrow">WASD / ARROWS TO MOVE · SPACE TO CHRONO DASH</p></div>`;$('launch').onclick=()=>this.start();}
  start(){this.synth.unlock();this.reset();this.state='play';modal.className='modal';modal.innerHTML='';$('bossHud').classList.add('hidden');this.synth.beep('dash');}
  seedCombat(){
    this.waves.elapsed=34;this.waves.xp=10;this.waves.nextXp=90;this.score=12480;this.combo=5.4;this.comboTimer=3;
    const p=this.actors.player;p.hp=92;p.damage=18;p.shots=2;p.magnet=55;
    for(let i=0;i<22;i++){
      this.actors.spawnEnemy(i%5===0?'elite':'drone');
      const a=i*Math.PI*2/22+.12,r=168+(i%4)*34,e=this.actors.enemies[this.actors.enemies.length-1];
      e.x=Math.max(48,Math.min(innerWidth-48,p.x+Math.cos(a)*r));
      e.y=Math.max(100,Math.min(innerHeight-88,p.y+Math.sin(a)*r));
    }
    for(let i=0;i<35;i++)this.actors.shards.push({x:this.rng.range(80,innerWidth-80),y:this.rng.range(100,innerHeight-100),radius:4,value:1,phase:this.rng.next()*6});
    this.actors.burst(p.x-44,p.y-38,'#24e8ff',26);this.actors.burst(p.x+54,p.y+28,'#ff36c8',18);
    this.actors.texts.push({x:p.x+110,y:p.y-74,text:'+320 CRIT!',color:'#ffcf4a',life:3.1});
    this.actors.texts.push({x:p.x-104,y:p.y+66,text:'+65',color:'#e9fbff',life:2.4});
    this.updateHUD();
  }
  collectInput(){this.input.x=(this.keys.has('d')||this.keys.has('arrowright')?1:0)-(this.keys.has('a')||this.keys.has('arrowleft')?1:0);this.input.y=(this.keys.has('s')||this.keys.has('arrowdown')?1:0)-(this.keys.has('w')||this.keys.has('arrowup')?1:0);this.input.dash=this.keys.has(' ');}
  update(dt){
    this.time+=dt;this.collectInput();if(this.state==='play'){
      if(this.actors.updatePlayer(dt,this.input)){this.camera.hit(6);this.synth.beep('dash');this.actors.burst(this.actors.player.x,this.actors.player.y,'#24e8ff',24);}
      this.waves.update(dt,this.actors,()=>this.openDraft(),()=>this.triggerBoss());
      this.actors.update(dt,{hit:(crit)=>{this.camera.hit(crit?2:1);this.synth.beep(crit?'pickup':'hit');},hurt:()=>{this.camera.hit(12);this.synth.beep('hit');this.pulseFlash(.6);},shard:v=>{this.waves.gain(v,()=>this.openDraft());this.score+=v*3;this.synth.beep('pickup');},kill:(value,elite)=>{this.score+=Math.round(value*this.combo);this.combo=Math.min(12,this.combo+(elite?.7:.18));this.comboTimer=3;this.camera.hit(elite?5:1);if(elite)this.synth.beep('pickup');},bossDown:value=>{this.score+=value;this.finish(true);}});
      if(this.actors.player.hp<=0)this.finish(false);
      this.comboTimer-=dt;if(this.comboTimer<=0)this.combo=Math.max(1,this.combo-dt*.45);
    }
    this.camera.update(dt,this.rng);this.updateHUD();
  }
  triggerBoss(){if(this.actors.boss)return;this.actors.spawnBoss();this.camera.hit(17);this.pulseFlash(.85);this.synth.beep('boss');$('bossHud').classList.remove('hidden');modal.className='modal visible';modal.innerHTML=`<div class="panel warning"><div class="eyebrow">⚠ TRANSMISSION BREACH ⚠</div><h2>DREADNOUGHT INBOUND</h2><p>HELIX-NULL has entered the relay perimeter. Its core is vulnerable to your phase lattice.</p><button id="engage">ENGAGE THREAT</button></div>`;$('engage').onclick=()=>{modal.className='modal';};setTimeout(()=>{if(this.state==='play')modal.className='modal';},2100);}
  openDraft(){if(this.state!=='play')return;this.state='draft';this.choices=this.waves.options();modal.className='modal visible';modal.innerHTML=`<div class="panel draft"><div class="eyebrow">RESONANCE SYNCHRONIZED // LEVEL ${this.waves.level}</div><h2>CHOOSE YOUR EVOLUTION</h2><div class="cards">${this.choices.map((u,i)=>`<button class="card" style="--c:${u.color}" data-pick="${i}"><span class="rarity">${u.rarity} · [ ${i+1} ]</span><h3>${u.title}</h3><p>${u.text}</p></button>`).join('')}</div><p class="eyebrow">TIME FRACTURE ACTIVE · SELECT WITH 1 / 2 / 3</p></div>`;modal.querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>this.choose(Number(b.dataset.pick)));this.synth.beep('pickup');}
  choose(index){const u=this.choices[index];if(!u)return;this.actors.upgrade(u.key);this.state='play';modal.className='modal';this.actors.burst(this.actors.player.x,this.actors.player.y,u.color,34);this.synth.beep('win');}
  finish(won){if(this.state==='end')return;this.state='end';this.high=Math.max(this.high,this.score);localStorage.setItem('skyboundBest',String(this.high));this.pulseFlash(won?1:.3);if(won)this.synth.beep('win');$('bossHud').classList.add('hidden');modal.className='modal visible';const title=won?'MIGRATION SECURED':'SIGNAL LOST';const copy=won?'The Dreadnought core ruptured. Every civilian ark crossed the relay before its final pulse.':'Aurora-7 dissolved in the swarm. The relay can still be saved on the next intercept.';modal.innerHTML=`<div class="panel ${won?'':'warning'}"><div class="eyebrow">// MISSION DEBRIEF //</div><h1>${title}</h1><p>${copy}</p><div class="objective"><span>SIGNAL SCORE <b>${fmt(this.score)}</b></span><span>BEST <b>${fmt(this.high)}</b></span><span>LEVEL <b>${this.waves.level}</b></span></div><button id="restart">REDEPLOY INTERCEPTOR&nbsp; ↻</button><p class="eyebrow">PRESS R TO RESTART · THE GRID REMEMBERS</p></div>`;$('restart').onclick=()=>this.start();}
  pulseFlash(amount){flash.style.opacity=amount;setTimeout(()=>flash.style.opacity='0',70);}
  updateHUD(){const p=this.actors.player, w=this.waves, remaining=Math.max(0,Math.ceil(60-w.elapsed)), minutes=Math.floor(remaining/60), seconds=remaining%60; $('timer').textContent=w.bossCalled?'DREAD':`${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;$('timerFill').style.width=`${Math.max(0,100-w.elapsed/60*100)}%`;$('score').textContent=fmt(this.score);$('highScore').textContent=`BEST ${fmt(this.high)}`;$('level').textContent=`LVL ${String(w.level).padStart(2,'0')}`;$('hpFill').style.width=`${Math.max(0,p.hp/p.maxHp*100)}%`;$('hpText').textContent=`${Math.max(0,Math.ceil(p.hp))} / ${p.maxHp} INTEGRITY`;$('xpText').textContent=`${Math.floor(w.xp)} / ${w.nextXp}`;$('xpFill').style.width=`${w.xp/w.nextXp*100}%`;$('combo').textContent=`x${this.combo.toFixed(1)}`;$('comboPips').style.opacity=Math.min(1,(this.combo-1)/5+.15);$('threat').textContent=this.actors.boss?'THREAT // CATASTROPHIC':w.elapsed>42?'THREAT // CRITICAL':'THREAT // RISING';if(this.actors.boss){$('bossHp').textContent=`${Math.max(0,Math.ceil(this.actors.boss.hp/this.actors.boss.maxHp*100))}%`;$('bossFill').style.width=`${Math.max(0,this.actors.boss.hp/this.actors.boss.maxHp*100)}%`;}}
  frame(now){const dt=Math.min(.033,(now-this.last)/1000||0);this.last=now;this.update(dt);this.renderer.render(this.actors,this.camera,this.time);requestAnimationFrame(t=>this.frame(t));}
}
new SkyboundGame();
