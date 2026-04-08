import { RELIEF_TILE_URL, RELIEF_MAX_ZOOM, RELIEF_OPACITY } from '../config';
import type { LayerDefinition } from './types';

export const relief: LayerDefinition = {
  id: 'relief',
  label: 'Shaded Relief',
  sources: {
    relief: {
      type: 'raster',
      tiles: [RELIEF_TILE_URL],
      tileSize: 256,
      maxzoom: RELIEF_MAX_ZOOM,
    },
  },
  layers: [
    {
      id: 'relief',
      type: 'raster',
      source: 'relief',
      paint: { 'raster-opacity': RELIEF_OPACITY },
    },
  ],
  zOrder: 'bottom',
};
