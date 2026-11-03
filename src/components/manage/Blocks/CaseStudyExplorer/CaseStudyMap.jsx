import React from 'react';
import cx from 'classnames';

import {
  Map,
  Layer,
  Layers,
  Controls,
  useMapContext,
} from '@eeacms/volto-openlayers-map/api';
import { withOpenLayers } from '@eeacms/volto-openlayers-map';
import { GISCO_OSM_ATTRIBUTION } from '@eeacms/volto-bise-policy/constants';

import { useIntl } from 'react-intl';

import messages from './messages';
import {
  CLUSTER_COLOR,
  STATUS_COLORS,
  centerAndResetMapZoom,
  getFeatures,
} from './utils';

const styleCache = {};

const MapContextGateway = ({ setMap }) => {
  const { map } = useMapContext();

  React.useEffect(() => {
    setMap(map);
  }, [map, setMap]);

  return null;
};

const LEGEND = [
  { status: 'planned', label: messages.statusPlanned },
  { status: 'ongoing', label: messages.statusOngoing },
  { status: 'completed', label: messages.statusCompleted },
];

function getFeaturePath(feature) {
  return feature?.get?.('path');
}

/**
 * Case study map. Pins are coloured by current status and clustered when
 * they overlap; clicking a pin selects its case study (highlight + scroll in
 * the results list), clicking empty map space clears the selection. There is
 * no popup: the card is the detail surface.
 */
function CaseStudyMap({
  items = [],
  selectedPath,
  onSelect,
  setMap,
  map,
  focusRequest,
  resetRequest,
  ol,
}) {
  const intl = useIntl();
  const features = React.useMemo(
    () => getFeatures({ cases: items, ol }),
    [items, ol],
  );
  const [resetMapButtonClass, setResetMapButtonClass] =
    React.useState('inactive');
  const [mapReady, setMapReady] = React.useState(false);
  const containerRef = React.useRef(null);

  const [tileWMSSources] = React.useState([
    new ol.source.TileWMS({
      url: 'https://gisco-services.ec.europa.eu/maps/service',
      attributions: GISCO_OSM_ATTRIBUTION,
      params: {
        LAYERS: 'OSMPositronComposite',
        TILED: true,
      },
      serverType: 'geoserver',
      transition: 0,
    }),
  ]);
  const [pointsSource] = React.useState(new ol.source.Vector());
  const [clusterSource] = React.useState(
    new ol.source.Cluster({
      distance: 19,
      source: pointsSource,
    }),
  );

  // `ol` is a fresh object literal on every render (see withOpenLayers), so
  // effects must not depend on it.
  const olRef = React.useRef(ol);
  olRef.current = ol;

  React.useEffect(() => {
    pointsSource.clear();
    pointsSource.addFeatures(features);
  }, [features, pointsSource]);

  const clusterStyle = React.useMemo(() => clusterStyleFor({ ol }), [ol]);

  React.useEffect(() => {
    if (!map) return undefined;

    const onMapClick = (event) => {
      const feature = map.forEachFeatureAtPixel(event.pixel, (hit) => hit);

      if (!feature) {
        onSelect?.(null);
        return;
      }

      const members = feature.get('features') || [];
      if (members.length === 1) {
        onSelect?.(getFeaturePath(members[0]));
        return;
      }

      // A cluster: let the visitor zoom into it rather than guess a pin.
      onSelect?.(null);
      const extent = olRef.current.extent.createEmpty();
      members.forEach((member) => {
        olRef.current.extent.extend(extent, member.getGeometry().getExtent());
      });
      map.getView().fit(extent, { duration: 500, padding: [40, 40, 40, 40] });
    };

    const onPointerMove = (event) => {
      const hit = map.hasFeatureAtPixel(map.getEventPixel(event.originalEvent));
      map.getViewport().style.cursor = hit ? 'pointer' : '';
    };

    map.on('click', onMapClick);
    map.on('pointermove', onPointerMove);

    return () => {
      map.un('click', onMapClick);
      map.un('pointermove', onPointerMove);
    };
  }, [map, onSelect]);

  // The container is sized by CSS (a square that follows the column width),
  // so OpenLayers has to be told whenever that box changes size. Without this
  // the canvas keeps the height it measured at mount and leaves the bottom of
  // the square blank.
  React.useEffect(() => {
    if (!map) return undefined;

    const container = containerRef.current;
    if (!container) return undefined;

    const syncSize = () => map.updateSize();
    syncSize();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', syncSize);
      return () => window.removeEventListener('resize', syncSize);
    }

    const observer = new ResizeObserver(syncSize);
    observer.observe(container);
    return () => observer.disconnect();
  }, [map]);

  // The map instance exists before its first frame is painted: keep the
  // loader up until OpenLayers reports that everything (tiles included) has
  // finished rendering.
  React.useEffect(() => {
    if (!map || mapReady) return undefined;

    const markReady = () => setMapReady(true);
    map.on('rendercomplete', markReady);
    // Never leave the loader up forever: a failing tile source or a hidden
    // tab should not hide the map.
    const fallback = window.setTimeout(markReady, 10000);

    return () => {
      map.un('rendercomplete', markReady);
      window.clearTimeout(fallback);
    };
  }, [map, mapReady]);

  React.useEffect(() => {
    if (!map) return undefined;

    const onMoveEnd = () => {
      const zoom = Math.round(map.getView().getZoom() * 10) / 10;
      const center = map.getView().getCenter();
      const atHome =
        zoom === 4.3 &&
        JSON.stringify(center) ===
          JSON.stringify(
            olRef.current.proj.transform([8, 55], 'EPSG:4326', 'EPSG:3857'),
          );

      setResetMapButtonClass(atHome ? 'inactive' : 'active');
    };

    map.on('moveend', onMoveEnd);

    return () => {
      map.un('moveend', onMoveEnd);
    };
  }, [map]);

  // "Show on map" on a card: fly to that case study without touching the
  // current selection.
  React.useEffect(() => {
    if (!map || !focusRequest?.path) return;

    const target = items.find(
      (item) => item.properties?.path === focusRequest.path,
    );
    const coordinates = target?.geometry?.coordinates;
    if (!coordinates) return;

    map.getView().animate({
      center: olRef.current.proj.fromLonLat(coordinates),
      zoom: 8,
      duration: 700,
    });
    // focusRequest.nonce changes on every request, even for the same case.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusRequest?.nonce]);

  // "Reset map" on an already selected card: go back to the European extent.
  React.useEffect(() => {
    if (!map || !resetRequest?.nonce) return;

    centerAndResetMapZoom({ map, ol: olRef.current });
    // resetRequest.nonce changes on every request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetRequest?.nonce]);

  if (!features.length) return null;

  return (
    <div className="cse-map" id="cse-map-container" ref={containerRef}>
      <Map
        view={{
          center: ol.proj.fromLonLat([8, 55]),
          showFullExtent: true,
          zoom: 4.3,
        }}
        pixelRatio={1}
      >
        <Controls attribution attributionOptions={{ collapsible: false }} />
        <Layers>
          <Layer.Tile source={tileWMSSources[0]} zIndex={0} />
          <Layer.Vector
            style={clusterStyle}
            source={clusterSource}
            zIndex={1}
          />
          <MapContextGateway setMap={setMap} />
        </Layers>
      </Map>

      {!mapReady && (
        <div className="cse-map-loading" role="status" aria-live="polite">
          <span className="cse-loading-spinner" aria-hidden="true" />
          {intl.formatMessage(messages.loadingMap)}
        </div>
      )}

      <button
        type="button"
        className={cx('cse-map-reset', String(resetMapButtonClass))}
        onClick={() => {
          onSelect?.(null);
          centerAndResetMapZoom({ map, ol });
        }}
      >
        <i className="icon ri-map-2-line" aria-hidden="true" />
        {intl.formatMessage(messages.resetMap, {})}
      </button>

      <div
        className="cse-map-legend"
        aria-label={intl.formatMessage(messages.mapLegend)}
      >
        <span className="cse-map-legend-title">
          {intl.formatMessage(messages.facetStatus)}
        </span>
        <ul className="cse-map-legend-items">
          {LEGEND.map(({ status, label }) => (
            <li key={status} className="cse-map-legend-item">
              <span
                className="cse-map-legend-dot"
                style={{ backgroundColor: STATUS_COLORS[status] }}
                aria-hidden="true"
              />
              {intl.formatMessage(label)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/**
 * Cluster style: coloured ring per status for a single case study, a numbered
 * bubble for a cluster.
 */
const clusterStyleFor = ({ ol }) => {
  const styleFor = (size) => {
    if (styleCache[size]) return styleCache[size];

    styleCache[size] = new ol.style.Style({
      image: new ol.style.Circle({
        radius: 12 + Math.min(Math.floor(size / 3), 10),
        stroke: new ol.style.Stroke({ color: '#FFFFFF', width: 2 }),
        fill: new ol.style.Fill({ color: CLUSTER_COLOR }),
      }),
      text: new ol.style.Text({
        text: size.toString(),
        fill: new ol.style.Fill({ color: '#FFFFFF' }),
      }),
    });

    return styleCache[size];
  };

  return (feature) => {
    const members = feature.get('features') || [];

    if (members.length !== 1) return styleFor(members.length);

    const color = members[0].get('color');

    return new ol.style.Style({
      image: new ol.style.Circle({
        radius: 7,
        fill: new ol.style.Fill({ color: '#FFFFFF' }),
        stroke: new ol.style.Stroke({ color, width: 5 }),
      }),
    });
  };
};

export default withOpenLayers(CaseStudyMap);
