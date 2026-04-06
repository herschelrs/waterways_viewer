# US Waterways Viewer

A MapLibre-based web map for exploring USGS National Hydrography Dataset (NHD)
waterways, with shaded relief, contour lines, and offline tile caching.

## Architecture

Currently a single `index.html` monolith (~415 lines) with vanilla JS. Pending
refactor to Vite + TypeScript modules — see roadmap below.

Key dependencies (all CDN, no build step yet):
- **MapLibre GL JS v4** — map rendering
- **maplibre-contour v0.1.0** — client-side contour generation from DEM tiles
- **OpenFreeMap** — OSM vector tile basemap
- **USGS services** — NHD waterways, shaded relief (ArcGIS MapServer, free/keyless)
- **AWS terrain tiles** — DEM data for contours

Service worker (`sw.js`) handles tile caching for offline use.

Deployed on **GitHub Pages** from the repo root.

## Roadmap

### 1. Refactor to Vite + TypeScript modules
Split the monolith into typed modules with a layer abstraction that makes
adding features easy. This is the prerequisite for everything else.
- **Plan**: [`plans/refactor-to-modules.md`](plans/refactor-to-modules.md)

### 2. Public lands layer (PAD-US)
Add BLM, National Forest, NPS, state land boundaries via the USGS PAD-US
service. First non-waterway layer, and the trigger for layer controls.
- **Plan**: [`plans/public-lands-layer.md`](plans/public-lands-layer.md)

### 3. Layer controls
Once there are multiple toggleable layers, add a sidebar/panel for
visibility toggling and opacity adjustment. The layer manager from the
refactor is designed to support this — each layer is a discrete object
that can be toggled via `map.setLayoutProperty()`.

### 4. Multiple pins / saved locations
Expand the marker system to support multiple named pins, possibly with
local storage persistence and export/share.

### 5. Mobile improvements
Responsive layout, larger touch targets, better modal UX on small screens.
Mostly CSS + touch event work, orthogonal to the module structure.

## Conventions

- No React/framework — vanilla DOM for UI, imperative MapLibre API for map
- Each map data layer is a self-contained module in `src/layers/` (post-refactor)
- All external service URLs and magic numbers live in `src/config.ts` (post-refactor)
- Service worker stays unbundled (`sw.js` at repo root)
