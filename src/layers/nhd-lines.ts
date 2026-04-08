import {
  NHD_BASE_URL,
  NHD_FLOWLINE_LAYER_IDS,
  NHD_LINES_OPACITY,
  STREAM_COLOR,
  FCODE_INTERMITTENT,
  FCODE_EPHEMERAL,
} from '../config';
import type { LayerDefinition } from './types';

// ArcGIS dynamic layer rendering spec for flowlines
const dynamicLayers = NHD_FLOWLINE_LAYER_IDS.map((id) => ({
  id,
  source: { type: 'mapLayer' as const, mapLayerId: id },
  drawingInfo: {
    renderer: {
      type: 'uniqueValue' as const,
      field1: 'fcode',
      defaultSymbol: {
        type: 'esriSLS' as const,
        style: 'esriSLSSolid' as const,
        color: STREAM_COLOR,
        width: 1.3,
      },
      uniqueValueInfos: [
        {
          value: FCODE_INTERMITTENT,
          symbol: {
            type: 'esriSLS' as const,
            style: 'esriSLSDash' as const,
            color: STREAM_COLOR,
            width: 1.2,
          },
        },
        {
          value: FCODE_EPHEMERAL,
          symbol: {
            type: 'esriSLS' as const,
            style: 'esriSLSDot' as const,
            color: STREAM_COLOR,
            width: 1,
          },
        },
      ],
    },
  },
}));

const dynParam = encodeURIComponent(JSON.stringify(dynamicLayers));

const tileUrl =
  `${NHD_BASE_URL}?` +
  'bbox={bbox-epsg-3857}&bboxSR=3857&imageSR=3857&size=512,512' +
  `&dpi=96&format=png32&transparent=true&dynamicLayers=${dynParam}&f=image`;

export const nhdLines: LayerDefinition = {
  id: 'nhd-lines',
  label: 'Streams',
  sources: {
    'nhd-lines': {
      type: 'raster',
      tiles: [tileUrl],
      tileSize: 512,
    },
  },
  layers: [
    {
      id: 'nhd-lines',
      type: 'raster',
      source: 'nhd-lines',
      paint: { 'raster-opacity': NHD_LINES_OPACITY },
    },
  ],
  zOrder: 'below-labels',
};

/** The encoded dynamic layers param, needed by the cache module for URL generation */
export const nhdDynParam = dynParam;
