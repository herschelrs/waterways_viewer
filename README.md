# US Waterways Viewer

> This project was 100% vibecoded with [Claude Code](https://claude.ai/claude-code) (Claude Opus). This README was also written by Claude.

A single-page web map for exploring US waterways using USGS hydrography data, built because every existing viewer for this data is either broken, proprietary, or bad.

**[Live demo](https://herschelrs.github.io/waterways_viewer/)**

## What it does

Overlays USGS National Hydrography Dataset (NHD) stream and waterbody data on an OpenStreetMap basemap with terrain context. The goal is a viewer that's actually useful for someone in the field trying to identify streams, distinguish permanent from intermittent water, and navigate with topographic context.

## Data sources

| Layer | Source | How it's loaded |
|-------|--------|----------------|
| Basemap | [OpenFreeMap](https://openfreemap.org/) (OSM vector tiles) | Vector tiles, water layers stripped at zoom 10+ |
| Waterways | [USGS NHD MapServer](https://hydro.nationalmap.gov/arcgis/rest/services/nhd/MapServer) | Raster tile export with `dynamicLayers` for custom symbology |
| Waterbodies | Same NHD MapServer | Raster tile export (layers 7-12: areas + waterbodies) |
| Terrain shading | [USGS Shaded Relief](https://basemap.nationalmap.gov/arcgis/rest/services/USGSShadedReliefOnly/MapServer) | Raster tiles at 35% opacity under the basemap |
| Contour lines | [AWS Terrain Tiles](https://registry.opendata.aws/terrain-tiles/) via [maplibre-contour](https://github.com/onthegomap/maplibre-contour) | Client-side contour generation from DEM raster tiles |

All data sources are free and require no API keys.

## Design choices

**Why NHD instead of 3DHP?** We initially built against the newer USGS 3DHP (3D Hydrography Program) service, but it turns out 3DHP has no flow permanence attribute — there's no way to distinguish intermittent from perennial streams. The older NHD has `FCode` which encodes this. Since distinguishing stream permanence was a core requirement, we switched back to NHD.

**Why not just use OSM water data?** OSM's NHD import was stopped in 2012 due to quality issues. Coverage is patchy and frozen. NHD is the authoritative dataset for US hydrography.

**Why strip OSM water and replace it?** To avoid rendering two conflicting water datasets. OSM water layers are kept at low zoom (< 10) so you can see oceans and large lakes for orientation, then hidden once NHD data takes over.

**Why `dynamicLayers` on the NHD export?** The NHD server's default rendering uses brown for ephemeral streams, which clashed with our road styling and was hard to read. We override the flowline renderer to make all streams blue, using line style to distinguish permanence:
- Solid blue: perennial
- Dashed blue: intermittent (FCode 46003)
- Dotted blue: ephemeral (FCode 46007)

**Why boosted track/service roads?** Forest service roads are critical for backcountry navigation but the default OSM style renders them as thin, nearly invisible white lines that don't appear until zoom ~15. We restyle them in muted red, visible from zoom 12.

**Why client-side contours?** Pre-generated contour vector tiles would require hosting 100+ GB. The maplibre-contour plugin generates them on the fly from DEM elevation tiles in a web worker. This adds some CPU cost on mobile but avoids any server-side infrastructure.

## Stack

This is a single HTML file. No build step, no framework, no bundler.

- [MapLibre GL JS](https://maplibre.org/) — map rendering (vector + raster)
- [maplibre-contour](https://github.com/onthegomap/maplibre-contour) — client-side contour generation
- OpenFreeMap — free OSM vector tiles (no API key)
- USGS ArcGIS Server — NHD and shaded relief tile services (public, free)
- AWS Open Data — Terrarium DEM tiles (public, free)

## Features

- Perennial / intermittent / ephemeral stream distinction
- Contour lines with elevation labels (zoom 10-15)
- Shaded relief terrain
- Forest service road emphasis
- "Go to" button: paste a Google Maps URL or `lat,lng` to fly there and drop a pin
- URL hash preserves your map position for bookmarking/sharing
- Mobile-friendly (MapLibre handles touch gestures natively)

## Running locally

Open `index.html` in a browser. If the style fetch gets CORS-blocked from `file://`:

```
python3 -m http.server
# then open http://localhost:8000
```

## Deploying to GitHub Pages

Push to GitHub, then in repo settings enable Pages from the main branch root. The `index.html` at the repo root is all that's needed.
