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

import InfoOverlay from './InfoOverlay';
import FeatureInteraction from './FeatureInteraction';
import CaseStudyList from './CaseStudyListing';

import { centerAndResetMapZoom, getFeatures, scrollToElement } from './utils';

const styleCache = {};
const MapContextGateway = ({ setMap }) => {
  const { map } = useMapContext();
  React.useEffect(() => {
    setMap(map);
  }, [map, setMap]);
  return null;
};

function CaseStudyMap(props) {
  const {
    items,
    activeItems,
    hideFilters,
    selectedCase,
    onSelectedCase,
    searchInput,
    map,
    setMap,
    ol,
  } = props;
  const features = getFeatures({ cases: items, ol });
  const [resetMapButtonClass, setResetMapButtonClass] =
    React.useState('inactive');

  const [tileWMSSources] = React.useState([
    new ol.source.TileWMS({
      url: 'https://gisco-services.ec.europa.eu/maps/service',
      params: {
        // LAYERS: 'OSMBlossomComposite', OSMCartoComposite, OSMPositronComposite
        LAYERS: 'OSMPositronComposite',
        TILED: true,
      },
      serverType: 'geoserver',
      transition: 0,
    }),
  ]);
  const [pointsSource] = React.useState(
    new ol.source.Vector({
      features,
    }),
  );

  const [clusterSource] = React.useState(
    new ol.source.Cluster({
      distance: 19,
      source: pointsSource,
    }),
  );

  React.useEffect(() => {
    if (activeItems) {
      pointsSource.clear();
      pointsSource.addFeatures(getFeatures({ cases: activeItems, ol }));
    }
  }, [activeItems, pointsSource, ol]);

  React.useEffect(() => {
    if (!map) return null;

    const moveendListener = (e) => {
      // console.log('map.getView()', map.getView());
      // console.log('selectedCase', selectedCase);
      const mapZoom = Math.round(map.getView().getZoom() * 10) / 10;
      const mapCenter = map.getView().getCenter();

      if (selectedCase) {
        const coords = selectedCase.geometry.flatCoordinates;
        const pixel = map.getPixelFromCoordinate(coords);
        map.getInteractions().array_[9].getFeatures().clear();
        map
          .getInteractions()
          .array_[9].getFeatures()
          .push(map.getFeaturesAtPixel(pixel)[0]);
      } else {
        map.getInteractions().array_[9].getFeatures().clear();
      }

      if (
        mapZoom === 4 &&
        JSON.stringify(mapCenter) ===
          JSON.stringify(ol.proj.transform([10, 49], 'EPSG:4326', 'EPSG:3857'))
      ) {
        setResetMapButtonClass('inactive');
      } else {
        setResetMapButtonClass('active');
      }
    };

    map.on('moveend', moveendListener);

    return () => {
      map.un('moveend', moveendListener);
    };
  }, [map, selectedCase, resetMapButtonClass, setResetMapButtonClass, ol]);

  const clusterStyle = React.useMemo(
    () => selectedClusterStyle({ selectedCase, ol }),
    [selectedCase, ol],
  );

  const MapWithSelection = React.useMemo(() => Map, []);
  // console.log('render');

  return features.length > 0 ? (
    <div id="ol-map-container">
      <MapWithSelection
        view={{
          center: ol.proj.fromLonLat([10, 49]),
          showFullExtent: true,
          zoom: 4,
        }}
        pixelRatio={1}
        // controls={ol.control.defaults({ attribution: false })}
      >
        <Controls attribution={false} />
        <Layers>
          {hideFilters ? null : (
            <button
              className={cx(
                'reset-map-button ui button secondary',
                String(resetMapButtonClass),
              )}
              onClick={() => {
                scrollToElement('search-input');
                onSelectedCase(null);
                centerAndResetMapZoom({ map, ol });
                map.getInteractions().array_[9].getFeatures().clear();
              }}
            >
              <span className="result-info-title">Reset map</span>
              <i className="icon ri-map-2-line"></i>
            </button>
          )}
          <InfoOverlay
            selectedFeature={selectedCase}
            onFeatureSelect={onSelectedCase}
            layerId={tileWMSSources[0]}
            hideFilters={hideFilters}
          />
          <FeatureInteraction
            onFeatureSelect={onSelectedCase}
            hideFilters={hideFilters}
            selectedCase={selectedCase}
          />
          <Layer.Tile source={tileWMSSources[0]} zIndex={0} />
          <Layer.Vector
            style={clusterStyle}
            source={clusterSource}
            zIndex={1}
          />
          <MapContextGateway setMap={setMap} />
        </Layers>
      </MapWithSelection>
      {hideFilters ? null : (
        <CaseStudyList
          map={map}
          activeItems={activeItems}
          selectedCase={selectedCase}
          onSelectedCase={onSelectedCase}
          pointsSource={pointsSource}
          searchInput={searchInput}
        />
      )}
    </div>
  ) : null;
}

const selectedClusterStyle = ({ selectedFeature, ol }) => {
  function _clusterStyle(feature) {
    const size = feature.get('features').length;
    let style = styleCache[size];

    if (!style) {
      style = new ol.style.Style({
        image: new ol.style.Circle({
          radius: 12 + Math.min(Math.floor(size / 3), 10),
          stroke: new ol.style.Stroke({
            color: '#fff',
          }),
          fill: new ol.style.Fill({
            color: '#007B6C', // #006BB8 #309ebc
          }),
        }),
        text: new ol.style.Text({
          text: size.toString(),
          fill: new ol.style.Fill({
            color: '#fff',
          }),
        }),
      });
      styleCache[size] = style;
    }

    if (size === 1) {
      // let color = feature.values_.features[0].values_['color'];
      let color = '#289588'; // #0083E0 #50B0A4

      return new ol.style.Style({
        image: new ol.style.Circle({
          radius: 6,
          fill: new ol.style.Fill({
            color: '#fff',
          }),
          stroke: new ol.style.Stroke({
            color: color,
            width: 6,
          }),
        }),
      });
    } else {
      return style;
    }
  }
  return _clusterStyle;
};

export default withOpenLayers(CaseStudyMap);
