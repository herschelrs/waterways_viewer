export interface ParsedCoords {
  lat: number;
  lng: number;
  zoom?: number;
}

/**
 * Parse coordinates from a Google Maps URL or plain "lat, lng" string.
 * Returns null if the input can't be parsed.
 */
export function parseCoords(str: string): ParsedCoords | null {
  str = str.trim();

  // Google Maps: @LAT,LNG,Zz
  let m = str.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*),(\d+\.?\d*)z/);
  if (m) return { lat: +m[1], lng: +m[2], zoom: +m[3] };

  // Google Maps: /place/LAT,LNG/
  m = str.match(/place\/(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (m) return { lat: +m[1], lng: +m[2] };

  // Google Maps: !3dLAT!4dLNG
  m = str.match(/!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/);
  if (m) return { lat: +m[1], lng: +m[2] };

  // Plain "lat, lng" or "lat lng"
  m = str.match(/^(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)$/);
  if (m) return { lat: +m[1], lng: +m[2] };

  return null;
}
