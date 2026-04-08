import type maplibregl from 'maplibre-gl';
import { FLY_TO_ZOOM } from './config';
import { parseCoords } from './geocoding';
import { dropPin, showLocationMarker } from './markers';
import { cacheViewport } from './cache';
import type { StyleSpecification } from 'maplibre-gl';
import type { LayerDefinition } from './layers';

// --- Toast ---

let toastTimer: ReturnType<typeof setTimeout> | undefined;

export function showToast(msg: string, duration = 3000): void {
  const t = document.getElementById('toast')!;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), duration);
}

// --- Go-to modal ---

function setupGoTo(map: maplibregl.Map): void {
  const modal = document.getElementById('modal')!;
  const input = modal.querySelector('input')!;

  document.getElementById('go-btn')!.addEventListener('click', () => {
    modal.classList.add('open');
    input.focus();
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
  });

  document.addEventListener('keydown', (e) => {
    if (
      e.key === 'g' &&
      !modal.classList.contains('open') &&
      document.activeElement === document.body
    ) {
      e.preventDefault();
      modal.classList.add('open');
      input.focus();
    }
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      modal.classList.remove('open');
      return;
    }
    if (e.key !== 'Enter') return;
    const c = parseCoords(input.value);
    if (c) {
      map.flyTo({ center: [c.lng, c.lat], zoom: c.zoom ?? FLY_TO_ZOOM });
      dropPin(map, c.lat, c.lng);
      input.value = '';
      modal.classList.remove('open');
    }
  });
}

// --- Locate button ---

function setupLocate(map: maplibregl.Map): void {
  document.getElementById('locate-btn')!.addEventListener('click', () => {
    if (!navigator.geolocation) {
      showToast('Geolocation not supported');
      return;
    }
    showToast('Getting location...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        map.flyTo({
          center: [lng, lat],
          zoom: Math.max(map.getZoom(), FLY_TO_ZOOM),
        });
        showLocationMarker(map, lat, lng);
        showToast(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      },
      (err) => {
        const msgs: Record<number, string> = {
          1: 'Location permission denied',
          2: 'Location unavailable',
          3: 'Location request timed out',
        };
        showToast(msgs[err.code] || 'Location error');
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  });
}

// --- Cache button ---

function setupCache(map: maplibregl.Map, style: StyleSpecification): void {
  const progress = document.getElementById('cache-progress')!;
  let caching = false;

  document.getElementById('cache-btn')!.addEventListener('click', async () => {
    if (caching) return;
    caching = true;
    progress.style.display = 'block';

    await cacheViewport(map, style, (msg, done) => {
      progress.textContent = msg;
      if (done) {
        setTimeout(() => {
          progress.style.display = 'none';
        }, 4000);
        caching = false;
      }
    });
  });
}

// --- Layer controls ---

function setupLayerControls(map: maplibregl.Map, layerDefs: LayerDefinition[]): void {
  const btn = document.getElementById('layers-btn')!;
  const panel = document.getElementById('layers-panel')!;

  // Build checkboxes
  for (const def of layerDefs) {
    const label = document.createElement('label');
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = true;
    cb.addEventListener('change', () => {
      const vis = cb.checked ? 'visible' : 'none';
      for (const layer of def.layers) {
        map.setLayoutProperty(layer.id, 'visibility', vis);
      }
    });
    label.appendChild(cb);
    label.appendChild(document.createTextNode(def.label));
    panel.appendChild(label);
  }

  btn.addEventListener('click', () => panel.classList.toggle('open'));

  // Close panel when clicking outside
  document.addEventListener('click', (e) => {
    if (!panel.contains(e.target as Node) && e.target !== btn) {
      panel.classList.remove('open');
    }
  });
}

// --- Init all UI ---

export function initUI(map: maplibregl.Map, style: StyleSpecification, layerDefs: LayerDefinition[]): void {
  setupGoTo(map);
  setupLocate(map);
  setupCache(map, style);
  setupLayerControls(map, layerDefs);
}
