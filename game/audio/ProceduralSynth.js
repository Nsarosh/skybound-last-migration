/** Offline procedural UI/combat sound; audio is unlocked only by a player gesture. */
export class ProceduralSynth {
  constructor() { this.context = null; this.enabled = true; }
  unlock() { if (!this.context) this.context = new AudioContext(); if (this.context.state === 'suspended') this.context.resume(); }
  toggle() { this.enabled = !this.enabled; return this.enabled; }
  beep(type = 'shot') {
    if (!this.enabled || !this.context) return;
    const c = this.context, now = c.currentTime, o = c.createOscillator(), gain = c.createGain();
    const notes = { shot:[440,120,.035,'sawtooth'], hit:[160,70,.05,'square'], pickup:[680,1100,.09,'sine'], dash:[180,50,.12,'sawtooth'], boss:[60,30,.45,'sawtooth'], win:[440,880,.3,'triangle'] }[type] || [440,80,.05,'sine'];
    o.type = notes[3]; o.frequency.setValueAtTime(notes[0],now); o.frequency.exponentialRampToValueAtTime(Math.max(20,notes[1]),now+notes[2]); gain.gain.setValueAtTime(type==='boss'?.09:.035,now); gain.gain.exponentialRampToValueAtTime(.001,now+notes[2]); o.connect(gain).connect(c.destination); o.start(now); o.stop(now+notes[2]+.01);
  }
}
