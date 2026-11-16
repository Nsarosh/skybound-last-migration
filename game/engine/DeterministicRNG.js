/** A small seeded PRNG: every encounter is repeatable for a given run seed. */
export class DeterministicRNG {
  constructor(seed = 0x51ab07d) { this.seed = seed >>> 0; }
  next() { let t = (this.seed += 0x6D2B79F5); t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
  range(min, max) { return min + (max - min) * this.next(); }
  int(min, max) { return Math.floor(this.range(min, max + 1)); }
  pick(items) { return items[Math.floor(this.next() * items.length)]; }
  sign() { return this.next() < .5 ? -1 : 1; }
}
