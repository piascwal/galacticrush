export const EARTH_CITY_SPOTS: readonly (readonly [number, number])[] = [
  [62, 38], [70, 50], [58, 60], [68, 66], [52, 70], [74, 42], [66, 58], [60, 48], [78, 55], [56, 64], [72, 60], [64, 72]
];
export const CRACK_ANGLES: readonly number[] = [10, 55, 95, 140, 190, 235, 280, 320];

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  return { r: parseInt(h.substring(0, 2), 16), g: parseInt(h.substring(2, 4), 16), b: parseInt(h.substring(4, 6), 16) };
}

export function lerpColor(a: string, b: string, t: number): string {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  const r = Math.round(ca.r + (cb.r - ca.r) * t);
  const g = Math.round(ca.g + (cb.g - ca.g) * t);
  const bl = Math.round(ca.b + (cb.b - ca.b) * t);
  return `rgb(${r},${g},${bl})`;
}
