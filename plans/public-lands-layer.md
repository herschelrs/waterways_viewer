# Plan: Public Lands / Land Ownership Layer

## Goal

Add a layer showing federal and state public land boundaries (BLM, USFS, NPS,
FWS, state lands) so users can see land ownership alongside waterways.

## Data source

**PAD-US (Protected Areas Database of the United States)** — hosted by USGS.
Free, no API key, same ArcGIS MapServer pattern as NHD.

- **Fee ownership (primary):**
  `https://maps.usgs.gov/arcgis/rest/services/padus3/PADUSFee/MapServer`
  Color-coded by managing agency. This is the main one.

- **Designation (optional):**
  `https://maps.usgs.gov/arcgis/rest/services/padus3/PADUSDesignation/MapServer`
  Shows by type (Wilderness, National Forest, etc.)

Export URL pattern (same as NHD):
```
https://maps.usgs.gov/arcgis/rest/services/padus3/PADUSFee/MapServer/export?
  bbox={bbox-epsg-3857}&bboxSR=3857&imageSR=3857&size=512,512
  &format=png32&transparent=true&layers=show:0&f=image
```

## Implementation sketch

After the module refactor, this is just a new layer file:

```ts
// src/layers/public-lands.ts
import { LayerDefinition } from './types';

export const publicLands: LayerDefinition = {
  id: 'public-lands',
  sources: {
    'pad-us': {
      type: 'raster',
      tiles: [
        'https://maps.usgs.gov/arcgis/rest/services/padus3/PADUSFee/MapServer/export?' +
        'bbox={bbox-epsg-3857}&bboxSR=3857&imageSR=3857&size=512,512' +
        '&format=png32&transparent=true&layers=show:0&f=image'
      ],
      tileSize: 512,
      attribution: '<a href="https://www.usgs.gov/programs/gap-analysis-project/science/pad-us-data-overview">USGS PAD-US</a>'
    }
  },
  layers: [
    {
      id: 'public-lands',
      type: 'raster',
      source: 'pad-us',
      paint: { 'raster-opacity': 0.4 }
    }
  ],
  zOrder: 'bottom'  // below waterways
};
```

## Open questions

- **Opacity**: PAD-US default rendering is colorful. Need to tune opacity so it
  doesn't compete with waterways — probably 0.3-0.5 range.
- **Which sublayers**: The Fee MapServer has multiple layers. Layer 0 is the
  overview. May want to use specific sublayers at different zooms.
- **Caching**: Add PAD-US tile domain to service worker's `TILE_DOMAINS` list
  and to the offline cache tile URL generator.
- **Interaction**: Eventually might want click-to-identify (query the MapServer
  for parcel info at a clicked point). Not needed initially.

## Dependencies

- Requires the module refactor (see `plans/refactor-to-modules.md`) — or at
  least the layer definition pattern. Without it, this is more inline style
  wiring in the monolith.
- Verify the PAD-US MapServer URLs are still live before implementing.

## Layer controls tie-in

This is the second layer type beyond waterways, which is the natural trigger
for adding layer toggle UI. When this gets built, also build the layer controls
panel (see roadmap in CLAUDE.md).
