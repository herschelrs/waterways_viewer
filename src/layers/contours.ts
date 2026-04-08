import mlcontour from 'maplibre-contour';
import maplibregl from 'maplibre-gl';
import {
  DEM_TILE_URL,
  CONTOUR_THRESHOLDS,
  CONTOUR_MIN_ZOOM,
  CONTOUR_MAX_ZOOM,
  CONTOUR_LABEL_MIN_ZOOM,
  CONTOUR_LINE_COLOR,
  CONTOUR_LABEL_COLOR,
  CONTOUR_HALO_COLOR,
} from '../config';
import type { LayerDefinition } from './types';

/**
 * Build the contour layer definition. Returns null if DEM initialization fails
 * (e.g. web worker not supported).
 */
export function buildContourLayer(): LayerDefinition | null {
  try {
    const demSource = new mlcontour.DemSource({
      url: DEM_TILE_URL,
      encoding: 'terrarium',
      maxzoom: 13,
      worker: true,
    });
    demSource.setupMaplibre(maplibregl);

    const contourUrl = demSource.contourProtocolUrl({
      thresholds: CONTOUR_THRESHOLDS,
      elevationKey: 'ele',
      levelKey: 'level',
      contourLayer: 'contours',
      extent: 4096,
      buffer: 1,
    });

    return {
      id: 'contours',
      label: 'Contours',
      sources: {
        contours: {
          type: 'vector',
          tiles: [contourUrl],
          maxzoom: CONTOUR_MAX_ZOOM,
        },
      },
      layers: [
        {
          id: 'contour-lines',
          type: 'line',
          source: 'contours',
          'source-layer': 'contours',
          minzoom: CONTOUR_MIN_ZOOM,
          maxzoom: CONTOUR_MAX_ZOOM,
          paint: {
            'line-color': CONTOUR_LINE_COLOR,
            'line-width': [
              'case',
              ['==', ['coalesce', ['get', 'level'], 0], 1],
              1,
              0.5,
            ],
          },
        },
        {
          id: 'contour-labels',
          type: 'symbol',
          source: 'contours',
          'source-layer': 'contours',
          minzoom: CONTOUR_LABEL_MIN_ZOOM,
          maxzoom: CONTOUR_MAX_ZOOM,
          filter: ['all', ['==', ['get', 'level'], 1], ['has', 'ele']],
          layout: {
            'symbol-placement': 'line',
            'text-field': ['concat', ['to-string', ['get', 'ele']], 'm'],
            'text-size': 10,
            'text-font': ['Noto Sans Regular'],
          },
          paint: {
            'text-color': CONTOUR_LABEL_COLOR,
            'text-halo-color': CONTOUR_HALO_COLOR,
            'text-halo-width': 1.5,
          },
        },
      ],
      zOrder: 'below-labels',
    };
  } catch (e) {
    console.error('Contour init failed:', e);
    return null;
  }
}
