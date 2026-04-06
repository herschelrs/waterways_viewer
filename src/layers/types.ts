import type {
  SourceSpecification,
  LayerSpecification,
} from 'maplibre-gl';

export interface LayerDefinition {
  /** Unique identifier for this layer group */
  id: string;
  /** MapLibre sources to register */
  sources: Record<string, SourceSpecification>;
  /** MapLibre style layers (rendered in order) */
  layers: LayerSpecification[];
  /** Where to insert in the layer stack */
  zOrder: 'bottom' | 'below-labels';
}
