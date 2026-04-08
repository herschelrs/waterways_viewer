# US Waterways Viewer

A MapLibre-based web map for exploring USGS National Hydrography Dataset (NHD)
waterways, with shaded relief, contour lines, and offline tile caching.

## Architecture

Vite + TypeScript. No framework — vanilla DOM for UI, imperative MapLibre API.

```
src/
  main.ts              — entry point
  config.ts            — tile URLs, zoom thresholds, colors, constants
  map-setup.ts         — fetch base style, apply OSM tweaks, create map
  markers.ts           — pin + location marker
  geocoding.ts         — coordinate parser (Google Maps URLs, lat/lng)
  cache.ts             — offline tile caching + tile math
  ui.ts                — modal, toast, buttons, wires everything together
  style.css            — all CSS
  layers/
    types.ts           — LayerDefinition interface
    layer-manager.ts   — registers layers into MapLibre style by z-order
    relief.ts          — USGS shaded relief
    nhd-fill.ts        — NHD areas + waterbodies
    nhd-lines.ts       — NHD flowlines (perennial/intermittent/ephemeral)
    contours.ts        — DEM-based contour lines + labels
public/
  sw.js                — service worker for tile caching (unbundled)
```

Key dependencies:
- **MapLibre GL JS** — map rendering
- **maplibre-contour** — client-side contour generation from DEM tiles
- **OpenFreeMap** — OSM vector tile basemap
- **USGS services** — NHD waterways, shaded relief (ArcGIS MapServer, free/keyless)
- **AWS terrain tiles** — DEM data for contours

Deployed on **GitHub Pages**. Build with `npm run build`, output goes to `dist/`.

## Roadmap

### ~~1. Refactor to Vite + TypeScript modules~~ (done)
- **Plan**: [`plans/refactor-to-modules.md`](plans/refactor-to-modules.md)

### ~~2. Public lands layer (PAD-US)~~ (done)
Added BLM, National Forest, NPS, state land boundaries via the USGS PAD-US
Fee service. Renders as a raster overlay with agency color-coding.
- **Plan**: [`plans/public-lands-layer.md`](plans/public-lands-layer.md)

### ~~3. Layer controls~~ (done)
Layer toggle panel accessible via a "Layers" button. Each data layer
can be toggled on/off. Uses `map.setLayoutProperty()` on all MapLibre
layers within a `LayerDefinition`.

### 4. Cell coverage layers
Two separate layers for evaluating connectivity in the backcountry:

**T-Mobile coverage map** — T-Mobile publishes raster coverage tiles
broken out by technology (2G/3G/LTE/5G). Add as separate toggleable
sub-layers so users can see where each generation of service reaches.
Useful for planning trips where satellite communicators may be needed.

**FCC Broadband Map** — The FCC's National Broadband Map
(`broadbandmap.fcc.gov`) provides carrier-reported coverage data for
all carriers. Could be used as a more authoritative / multi-carrier
alternative. Investigate whether they expose a tile service or if
scraping/proxying is needed.

### 5. Multiple pins / saved locations
Expand the marker system to support multiple named pins, possibly with
local storage persistence and export/share.

### 6. Mobile improvements
Responsive layout, larger touch targets, better modal UX on small screens.
Mostly CSS + touch event work, orthogonal to the module structure.

## Conventions

- No React/framework — vanilla DOM for UI, imperative MapLibre API for map
- Each map data layer is a self-contained module in `src/layers/` exporting a `LayerDefinition`
- All external service URLs and magic numbers live in `src/config.ts`
- Service worker stays unbundled in `public/sw.js`
- To add a new layer: create `src/layers/foo.ts`, export a `LayerDefinition`, import in `map-setup.ts`
