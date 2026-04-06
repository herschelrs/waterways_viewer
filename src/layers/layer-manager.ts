import type { StyleSpecification } from 'maplibre-gl';
import type { LayerDefinition } from './types';

/**
 * Apply layer definitions to a MapLibre style object (mutates it in place).
 *
 * - 'bottom' layers are unshifted to the beginning of the layer stack.
 * - 'below-labels' layers are spliced in just before the first symbol layer.
 */
export function applyLayers(
  style: StyleSpecification,
  definitions: LayerDefinition[],
): void {
  const bottomLayers: LayerDefinition[] = [];
  const belowLabelLayers: LayerDefinition[] = [];

  for (const def of definitions) {
    // Register sources
    for (const [key, source] of Object.entries(def.sources)) {
      style.sources[key] = source;
    }

    if (def.zOrder === 'bottom') {
      bottomLayers.push(def);
    } else {
      belowLabelLayers.push(def);
    }
  }

  // Insert 'bottom' layers at the start
  for (const def of bottomLayers) {
    style.layers.unshift(...def.layers);
  }

  // Insert 'below-labels' layers just before the first symbol layer
  const firstSymbol = style.layers.findIndex((l) => l.type === 'symbol');
  const insertIdx = firstSymbol >= 0 ? firstSymbol : style.layers.length;
  const belowLabelStyles = belowLabelLayers.flatMap((def) => def.layers);
  style.layers.splice(insertIdx, 0, ...belowLabelStyles);
}
