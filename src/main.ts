import 'maplibre-gl/dist/maplibre-gl.css';
import './style.css';
import { createMap } from './map-setup';
import { registerServiceWorker } from './cache';
import { initUI } from './ui';

async function main(): Promise<void> {
  registerServiceWorker();
  const { map, layerDefs } = await createMap('map');
  const style = map.getStyle();
  initUI(map, style, layerDefs);
}

main();
