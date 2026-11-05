/**
 * Single code-split entry point for OpenLayers.
 *
 * `@eeacms/volto-openlayers-map` registers one lazy loadable per `ol/*`
 * namespace (17 of them). Webpack emits a separate async chunk for each
 * `import()`, so the first map on a page costs 17 extra script requests.
 *
 * Every loadable is pointed at this module instead (see `src/index.js`), so
 * webpack emits a single chunk that they all share. Keeping the namespaces in
 * one module preserves the module shape the add-on's components expect
 * (`withOpenLayers` reads `ol.*`, `olOverlay.default`, etc.).
 */
import * as ol from 'ol';
import * as control from 'ol/control';
import * as coordinate from 'ol/coordinate';
import * as extent from 'ol/extent';
import * as format from 'ol/format';
import * as geom from 'ol/geom';
import * as interaction from 'ol/interaction';
import * as layer from 'ol/layer';
import * as loadingstrategy from 'ol/loadingstrategy';
import * as proj from 'ol/proj';
import * as source from 'ol/source';
import * as style from 'ol/style';
import * as tilegrid from 'ol/tilegrid';
import Overlay from 'ol/Overlay';
import * as events from 'ol/events';
import * as condition from 'ol/events/condition';
import * as render from 'ol/render';

export const bundles = {
  ol,
  control,
  coordinate,
  extent,
  format,
  geom,
  interaction,
  layer,
  loadingstrategy,
  proj,
  source,
  style,
  tilegrid,
  // `withOpenLayers` reads `loaded.olOverlay.default`, so keep the ES module
  // shape the `import('ol/Overlay')` loadable used to provide.
  overlay: { default: Overlay },
  events,
  condition,
  render,
};
