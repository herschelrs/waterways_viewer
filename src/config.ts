// Base map style
export const BASE_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

// Tile sources
export const RELIEF_TILE_URL =
  'https://basemap.nationalmap.gov/arcgis/rest/services/USGSShadedReliefOnly/MapServer/tile/{z}/{y}/{x}';

export const DEM_TILE_URL =
  'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png';

export const NHD_BASE_URL =
  'https://hydro.nationalmap.gov/arcgis/rest/services/nhd/MapServer/export';

export const NHD_ATTRIBUTION =
  '<a href="https://www.usgs.gov/national-hydrography">USGS NHD</a>';

// NHD feature codes for stream permanence
export const FCODE_INTERMITTENT = '46003';
export const FCODE_EPHEMERAL = '46007';

// NHD flowline layer IDs on the MapServer
export const NHD_FLOWLINE_LAYER_IDS = [4, 5, 6];
// NHD area/waterbody layer IDs
export const NHD_FILL_LAYER_IDS = [7, 8, 9, 10, 11, 12];

// Zoom thresholds
export const OSM_WATER_MAX_ZOOM = 10;
export const SERVICE_ROAD_MIN_ZOOM = 12;
export const CONTOUR_MIN_ZOOM = 10;
export const CONTOUR_MAX_ZOOM = 15;
export const CONTOUR_LABEL_MIN_ZOOM = 12;

// Relief
export const RELIEF_MAX_ZOOM = 13;
export const RELIEF_OPACITY = 0.35;
export const BACKGROUND_OPACITY = 0.55;

// NHD rendering
export const NHD_FILL_OPACITY = 0.8;
export const NHD_LINES_OPACITY = 0.9;

// Stream color (RGBA for ArcGIS dynamic layer spec)
export const STREAM_COLOR: [number, number, number, number] = [0, 90, 210, 255];

// Contour styling
export const CONTOUR_LINE_COLOR = 'rgba(139, 109, 56, 0.5)';
export const CONTOUR_LABEL_COLOR = 'rgba(139, 109, 56, 0.8)';
export const CONTOUR_HALO_COLOR = 'rgba(255, 255, 255, 0.8)';

// Contour thresholds by zoom: [minor, major] intervals in meters
export const CONTOUR_THRESHOLDS: Record<number, [number, number]> = {
  10: [200, 1000],
  11: [100, 500],
  12: [50, 200],
  13: [40, 200],
  14: [20, 100],
};

// Service road styling
export const SERVICE_ROAD_CASING_COLOR = '#9e4a4a';
export const SERVICE_ROAD_COLOR = '#c47070';

// Map defaults
export const DEFAULT_CENTER: [number, number] = [-98.5, 39.8];
export const DEFAULT_ZOOM = 4;
export const FLY_TO_ZOOM = 14;

// Offline caching
export const CACHE_CONCURRENCY = 6;
export const CACHE_ZOOM_MIN_OFFSET = 4; // current zoom - this
export const CACHE_ZOOM_MAX = 15;

// Pin styling
export const PIN_STYLE =
  'width:20px;height:20px;background:#e74c3c;border:2px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 1px 4px rgba(0,0,0,0.4);';
