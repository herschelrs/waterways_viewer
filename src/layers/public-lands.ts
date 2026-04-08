import { SMA_BASE_URL, SMA_ATTRIBUTION, SMA_OPACITY } from '../config';
import type { LayerDefinition } from './types';

const tileUrl =
  `${SMA_BASE_URL}?` +
  'bbox={bbox-epsg-3857}&bboxSR=3857&imageSR=3857&size=512,512' +
  '&format=png32&transparent=true&f=image';

export const publicLands: LayerDefinition = {
  id: 'public-lands',
  label: 'Public Lands (BLM/FS)',
  sources: {
    'blm-sma': {
      type: 'raster',
      tiles: [tileUrl],
      tileSize: 512,
      attribution: SMA_ATTRIBUTION,
    },
  },
  layers: [
    {
      id: 'public-lands',
      type: 'raster',
      source: 'blm-sma',
      paint: { 'raster-opacity': SMA_OPACITY },
    },
  ],
  zOrder: 'below-labels',
};
