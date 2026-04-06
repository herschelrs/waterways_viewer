import maplibregl from 'maplibre-gl';
import { PIN_STYLE } from './config';

let pin: maplibregl.Marker | null = null;
let locMarker: maplibregl.Marker | null = null;

export function dropPin(map: maplibregl.Map, lat: number, lng: number): void {
  if (pin) pin.remove();
  const el = document.createElement('div');
  el.style.cssText = PIN_STYLE;
  pin = new maplibregl.Marker({ element: el, anchor: 'bottom-left' })
    .setLngLat([lng, lat])
    .addTo(map);
}

export function showLocationMarker(
  map: maplibregl.Map,
  lat: number,
  lng: number,
): void {
  if (locMarker) locMarker.remove();
  const el = document.createElement('div');
  el.className = 'loc-marker';
  locMarker = new maplibregl.Marker({ element: el })
    .setLngLat([lng, lat])
    .addTo(map);
}
