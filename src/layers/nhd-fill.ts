import {
  NHD_BASE_URL,
  NHD_FILL_LAYER_IDS,
  NHD_ATTRIBUTION,
  NHD_FILL_OPACITY,
} from '../config';
import type { LayerDefinition } from './types';

const tileUrl =
  `${NHD_BASE_URL}?` +
  'bbox={bbox-epsg-3857}&bboxSR=3857&imageSR=3857&size=512,512' +
  `&dpi=96&format=png32&transparent=true&layers=show:${NHD_FILL_LAYER_IDS.join(',')}&f=image`;

export const nhdFill: LayerDefinition = {
  id: 'nhd-fill',
  sources: {
    'nhd-fill': {
      type: 'raster',
      tiles: [tileUrl],
      tileSize: 512,
      attribution: NHD_ATTRIBUTION,
    },
  },
  layers: [
    {
      id: 'nhd-fill',
      type: 'raster',
      source: 'nhd-fill',
      paint: { 'raster-opacity': NHD_FILL_OPACITY },
    },
  ],
  zOrder: 'below-labels',
};
