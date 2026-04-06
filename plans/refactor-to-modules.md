# Refactor: Vite + TypeScript + Modules

## Goal

Move from a single `index.html` monolith to a modular TypeScript codebase with
Vite, making it easy to add features (new layers, multi-pin, layer controls)
without touching unrelated code.

## Architecture

```
src/
  main.ts              — entry point, orchestrates everything
  config.ts            — tile URLs, zoom thresholds, colors, concurrency limits
  map-setup.ts         — fetch base style, apply OSM modifications, init map
  markers.ts           — pin + location marker (future: multi-pin)
  geocoding.ts         — coordinate parser, go-to-location flow
  cache.ts             — offline tile caching + tile math utilities
  ui.ts                — modal, toast, button wiring
  layers/
    types.ts           — LayerDefinition interface
    layer-manager.ts   — registers layers, handles z-ordering, (future: toggle)
    relief.ts          — USGS shaded relief
    nhd-fill.ts        — NHD areas + waterbodies
    nhd-lines.ts       — NHD flowlines with permanence styling
    contours.ts        — DEM-based contour lines + labels
sw.js                  — service worker (stays unbundled)
index.html             — thin shell, just the DOM + CSS
```

## Layer definition shape

Each layer module exports a `LayerDefinition`:

```ts
interface LayerDefinition {
  id: string;
  sources: Record<string, maplibregl.SourceSpecification>;
  layers: maplibregl.LayerSpecification[];
  zOrder: 'below-labels' | 'bottom';  // where to insert in stack
}
```

The layer manager collects all definitions and splices them into the style in
the right order. This is the key abstraction — adding a layer means writing one
file that exports this shape.

## Steps

1. Init Vite + TypeScript (`npm create vite`, configure for vanilla-ts)
2. Move CSS to `src/style.css`
3. Create `src/config.ts` — extract all magic numbers and URLs
4. Create `src/layers/types.ts` — define `LayerDefinition` interface
5. Create individual layer modules (relief, nhd-fill, nhd-lines, contours)
6. Create `src/layers/layer-manager.ts` — style integration logic
7. Create `src/map-setup.ts` — base style fetch + OSM modifications
8. Create `src/markers.ts` — pin and location marker
9. Create `src/geocoding.ts` — coordinate parser + modal flow
10. Create `src/cache.ts` — tile caching logic
11. Create `src/ui.ts` — toast, button wiring
12. Create `src/main.ts` — glue it all together
13. Verify everything works, update GitHub Pages deploy if needed

## Non-goals

- No React/Vue/framework — vanilla DOM is fine for this UI complexity
- No state management library — closure/module scope is sufficient for now
- No major feature additions — this is a structural refactor only

## Future leverage

- **New layers**: add a file to `src/layers/`, import in layer manager
- **Layer controls**: layer manager already tracks all layers as objects;
  wire a UI to `map.setLayoutProperty()` for visibility toggling
- **Multi-pin**: expand `markers.ts` to manage a collection
- **Mobile**: CSS + touch event work, orthogonal to this structure
