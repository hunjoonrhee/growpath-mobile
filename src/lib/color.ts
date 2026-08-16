/** Adds alpha to a `#rrggbb` theme color - for translucent chip/badge backgrounds that need to react to the live theme instead of a color hardcoded at a fixed opacity. */
export function withAlpha(hexColor: string, alpha: number): string {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
