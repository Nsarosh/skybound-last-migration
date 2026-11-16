export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export const normalize = (x, y) => { const length = Math.hypot(x, y) || 1; return { x: x / length, y: y / length }; };
export const angleTo = (a, b) => Math.atan2(b.y - a.y, b.x - a.x);
export function circlesTouch(a, b) { const rr = a.radius + b.radius; return (a.x-b.x)**2 + (a.y-b.y)**2 < rr * rr; }
export class TraumaCamera {
  constructor() { this.power = 0; this.x = 0; this.y = 0; }
  hit(amount) { this.power = clamp(this.power + amount, 0, 18); }
  update(dt, rng) { this.power = Math.max(0, this.power - dt * 26); this.x = rng.range(-this.power, this.power); this.y = rng.range(-this.power, this.power); }
}
