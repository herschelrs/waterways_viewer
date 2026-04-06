import maplibregl from 'maplibre-gl';
import type { StyleSpecification, LayerSpecification } from 'maplibre-gl';
import {
  BASE_STYLE_URL,
  OSM_WATER_MAX_ZOOM,
  SERVICE_ROAD_MIN_ZOOM,
  SERVICE_ROAD_COLOR,
  SERVICE_ROAD_CASING_COLOR,
  BACKGROUND_OPACITY,
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
} from './config';
import {
  applyLayers,
  relief,
  nhdFill,
  nhdLines,
  buildContourLayer,
} from './layers';
import type { LayerDefinition } from './layers';

const WATER_TERMS = [
  'water', 'ocean', 'sea', 'lake', 'river', 'waterway', 'swimming', 'ferry',
];

/** Cap OSM water layers at a max zoom so NHD takes over */
function capWaterLayers(style: StyleSpecification): void {
  for (const layer of style.layers) {
    const id = (layer.id || '').toLowerCase();
    const sl = ('source-layer' in layer ? (layer['source-layer'] || '') : '').toLowerCase();
    if (WATER_TERMS.some((t) => id.includes(t) || sl.includes(t))) {
      layer.maxzoom = OSM_WATER_MAX_ZOOM;
    }
  }
}

/** Boost track/service roads: earlier visibility, wider, tan color */
function boostServiceRoads(style: StyleSpecification): void {
  for (const layer of style.layers) {
    const id = (layer.id || '').toLowerCase();
    if (!id.includes('service_track') && !id.includes('service-track')) continue;

    const paint = ((layer as LayerSpecification & { paint?: Record<string, unknown> }).paint ??= {});
    if (id.includes('casing')) {
      paint['line-color'] = SERVICE_ROAD_CASING_COLOR;
      paint['line-width'] = { stops: [[12, 0.5], [14, 2], [18, 6]] };
      paint['line-opacity'] = { stops: [[12, 0], [12.5, 0.7]] };
    } else {
      paint['line-color'] = SERVICE_ROAD_COLOR;
      paint['line-width'] = { stops: [[12, 0.3], [14, 1.5], [18, 4]] };
      paint['line-opacity'] = { stops: [[12, 0], [12.5, 1]] };
    }
    if ('minzoom' in layer && layer.minzoom !== undefined && layer.minzoom > SERVICE_ROAD_MIN_ZOOM) {
      layer.minzoom = SERVICE_ROAD_MIN_ZOOM;
    }
  }
}

/** Make background semi-transparent for relief to show through */
function dimBackground(style: StyleSpecification): void {
  for (const layer of style.layers) {
    if (layer.type === 'background') {
      const bg = layer as LayerSpecification & { paint?: Record<string, unknown> };
      (bg.paint ??= {})['background-opacity'] = BACKGROUND_OPACITY;
    }
  }
}

/**
 * Fetch the base style, apply OSM tweaks, register data layers,
 * and create the MapLibre map instance.
 */
export async function createMap(container: string): Promise<maplibregl.Map> {
  const style: StyleSpecification = await (await fetch(BASE_STYLE_URL)).json();

  // Tweak the base OSM style
  capWaterLayers(style);
  boostServiceRoads(style);
  dimBackground(style);

  // Collect layer definitions
  const layers: LayerDefinition[] = [relief, nhdFill, nhdLines];
  const contours = buildContourLayer();
  if (contours) layers.splice(2, 0, contours); // contours before nhd-fill

  applyLayers(style, layers);

  const map = new maplibregl.Map({
    container,
    style,
    center: DEFAULT_CENTER,
    zoom: DEFAULT_ZOOM,
    hash: true,
  });

  map.addControl(new maplibregl.NavigationControl());
  map.addControl(new maplibregl.ScaleControl());

  return map;
}
