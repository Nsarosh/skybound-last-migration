export const UPGRADES = [
  { key:'damage', rarity:'COMMON', color:'#24e8ff', title:'PHASE LANCE', text:'+7 plasma damage. Pierce the swarm faster.' },
  { key:'shots', rarity:'RARE', color:'#ff36c8', title:'PRISM ARRAY', text:'+1 auto-fire bolt. Wider linked fire pattern.' },
  { key:'magnet', rarity:'LEGENDARY', color:'#ffcf4a', title:'GRAVITY HARP', text:'+58 shard pull range. Feed the resonance engine.' },
  { key:'shield', rarity:'RARE', color:'#ff36c8', title:'AEGIS WEAVE', text:'+35 max integrity and restore 55 integrity.' },
];
export class WaveDirector {
  constructor(rng){this.rng=rng;this.reset();}
  reset(){this.spawnClock=.6;this.elapsed=0;this.level=1;this.xp=0;this.nextXp=28;this.bossCalled=false;this.warning=0;}
  update(dt,actors,onUpgrade,onBoss){this.elapsed+=dt;this.spawnClock-=dt;const intensity=1+this.elapsed/11;if(this.spawnClock<=0&&!this.bossCalled){this.spawnClock=Math.max(.22,.85-intensity*.043);actors.spawnEnemy(this.rng.next()<Math.min(.34,.06+this.elapsed/100)?'elite':'drone');if(intensity>4&&this.rng.next()<.22)actors.spawnEnemy('drone');}if(this.elapsed>=60&&!this.bossCalled){this.bossCalled=true;this.warning=2.4;onBoss();}if(this.warning>0)this.warning-=dt;}
  gain(value,onLevel){this.xp+=value;let leveled=false;while(this.xp>=this.nextXp){this.xp-=this.nextXp;this.level++;this.nextXp=Math.round(this.nextXp*1.36+6);leveled=true;}if(leveled)onLevel();}
  options(){const choices=[...UPGRADES];for(let i=choices.length-1;i>0;i--){const j=this.rng.int(0,i);[choices[i],choices[j]]=[choices[j],choices[i]];}return choices.slice(0,3);}
}
