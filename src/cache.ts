import type maplibregl from 'maplibre-gl';
import type { StyleSpecification } from 'maplibre-gl';
import {
  RELIEF_TILE_URL,
  DEM_TILE_URL,
  NHD_BASE_URL,
  NHD_FILL_LAYER_IDS,
  CACHE_CONCURRENCY,
  CACHE_ZOOM_MIN_OFFSET,
  CACHE_ZOOM_MAX,
} from './config';
import { nhdDynParam } from './layers/nhd-lines';

// --- Tile math ---

function lngToTileX(lng: number, z: number): number {
  return Math.floor(((lng + 180) / 360) * (1 << z));
}

function latToTileY(lat: number, z: number): number {
  const r = (lat * Math.PI) / 180;
  return Math.floor(
    ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * (1 << z),
  );
}

function tileToBbox3857(x: number, y: number, z: number): string {
  const E = 20037508.342789244;
  const s = (E * 2) / (1 << z);
  return [-E + x * s, E - (y + 1) * s, -E + (x + 1) * s, E - y * s].join(',');
}

// --- URL generation for a single tile ---

function tileUrls(
  x: number,
  y: number,
  z: number,
  style: StyleSpecification,
): string[] {
  const urls: string[] = [];

  // Vector tile sources (skip custom protocol sources like contour://)
  for (const src of Object.values(style.sources)) {
    if (
      src.type === 'vector' &&
      'tiles' in src &&
      src.tiles?.[0]?.startsWith('http')
    ) {
      const maxz = ('maxzoom' in src ? src.maxzoom : undefined) ?? 14;
      const tz = Math.min(z, maxz);
      const scale = 1 << (z - tz);
      const tx = Math.floor(x / scale);
      const ty = Math.floor(y / scale);
      urls.push(
        src.tiles[0]
          .replace('{z}', String(tz))
          .replace('{x}', String(tx))
          .replace('{y}', String(ty)),
      );
    }
  }

  // Relief (256px, maxzoom 13)
  const rz = Math.min(z, 13);
  const rs = 1 << (z - rz);
  urls.push(
    RELIEF_TILE_URL.replace('{z}', String(rz))
      .replace('{y}', String(Math.floor(y / rs)))
      .replace('{x}', String(Math.floor(x / rs))),
  );

  // DEM (256px, maxzoom 13)
  urls.push(
    DEM_TILE_URL.replace('{z}', String(rz))
      .replace('{x}', String(Math.floor(x / rs)))
      .replace('{y}', String(Math.floor(y / rs))),
  );

  // NHD fill + lines (512px — tile zoom is z-1)
  const nz = Math.max(z - 1, 0);
  const nx = Math.floor(x / 2);
  const ny = Math.floor(y / 2);
  const bbox = tileToBbox3857(nx, ny, nz);
  const nhdBase =
    `${NHD_BASE_URL}?bbox=${bbox}` +
    '&bboxSR=3857&imageSR=3857&size=512,512&dpi=96&format=png32&transparent=true';
  urls.push(`${nhdBase}&layers=show:${NHD_FILL_LAYER_IDS.join(',')}&f=image`);
  urls.push(`${nhdBase}&dynamicLayers=${nhdDynParam}&f=image`);

  return urls;
}

// --- Public API ---

export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return;

  navigator.serviceWorker
    .register('sw.js')
    .catch((e) => console.warn('SW registration failed:', e));

  navigator.serviceWorker.addEventListener('message', (e) => {
    if (e.data.type === 'cache-hit')
      console.log('[cache] hit:', e.data.url.slice(0, 80));
    if (e.data.type === 'cache-store')
      console.log('[cache] stored:', e.data.url.slice(0, 80));
  });
}

/**
 * Download all tiles for the current viewport across multiple zoom levels
 * for offline use. Calls `onProgress` with status updates.
 */
export async function cacheViewport(
  map: maplibregl.Map,
  style: StyleSpecification,
  onProgress: (msg: string, done: boolean) => void,
): Promise<void> {
  const bounds = map.getBounds();
  const curZoom = Math.round(map.getZoom());
  const zMin = Math.max(10, curZoom - CACHE_ZOOM_MIN_OFFSET);
  const zMax = Math.min(CACHE_ZOOM_MAX, Math.max(curZoom + 2, CACHE_ZOOM_MAX));

  // Collect unique URLs
  const seen = new Set<string>();
  const allUrls: string[] = [];
  for (let z = zMin; z <= zMax; z++) {
    const xMin = lngToTileX(bounds.getWest(), z);
    const xMax = lngToTileX(bounds.getEast(), z);
    const yMin = latToTileY(bounds.getNorth(), z);
    const yMax = latToTileY(bounds.getSouth(), z);
    for (let x = xMin; x <= xMax; x++) {
      for (let y = yMin; y <= yMax; y++) {
        for (const url of tileUrls(x, y, z, style)) {
          if (!seen.has(url)) {
            seen.add(url);
            allUrls.push(url);
          }
        }
      }
    }
  }

  let done = 0;
  let errors = 0;
  const total = allUrls.length;

  async function fetchOne(url: string): Promise<void> {
    try {
      await fetch(url);
    } catch {
      errors++;
    }
    done++;
    onProgress(
      `Saving ${done}/${total}` + (errors ? ` (${errors} errors)` : ''),
      false,
    );
  }

  // Fetch with limited concurrency
  const queue = [...allUrls];
  const workers = Array(CACHE_CONCURRENCY)
    .fill(null)
    .map(async () => {
      while (queue.length) await fetchOne(queue.shift()!);
    });
  await Promise.all(workers);

  onProgress(
    `Saved ${done - errors} tiles for z${zMin}-${zMax}`,
    true,
  );
}
