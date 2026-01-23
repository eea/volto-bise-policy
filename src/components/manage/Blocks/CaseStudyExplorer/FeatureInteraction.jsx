import React from 'react';
import { withOpenLayers } from '@eeacms/volto-openlayers-map';
import { useMapContext } from '@eeacms/volto-openlayers-map/api';
import { scrollToElement, zoomMapToFeatures } from './utils';

export const useStyles = ({ ol }) => {
  const selected = React.useMemo(
    () =>
      new ol.style.Style({
        image: new ol.style.Circle({
          radius: 12,
          fill: new ol.style.Fill({
            color: '#ccc',
          }),
          stroke: new ol.style.Stroke({
            color: '#fff',
            width: 0,
          }),
        }),
      }),
    [ol],
  );

  const selectStyle = React.useCallback(
    (feature) => {
      // const color = feature.values_.features[0].values_['color'] || '#ccc';
      const color = '#0A99FF'; // #004B7F #309ebc #0A99FF
      // console.log(color);
      selected.image_.getFill().setColor(color);
      return selected;
    },
    [selected],
  );

  return { selected, selectStyle };
};

function FeatureInteraction({
  onFeatureSelect,
  hideFilters,
  selectedCase,
  ol,
}) {
  // console.log('featureinteraction', selectedCase);
  const { map } = useMapContext();
  const { selectStyle } = useStyles({ ol });

  const select = new ol.interaction.Select({
    condition: ol.condition.click,
    style: hideFilters ? null : selectStyle,
  });

  React.useEffect(() => {
    if (!map) return;

    select.on('select', function (e) {
      const features = e.target.getFeatures().getArray();

      features.forEach((feature) => {
        const subfeatures = feature.values_.features;
        if (subfeatures.length === 1) {
          const selectedFeature = subfeatures[0].values_;
          if (hideFilters) {
            const url = window.location.origin + selectedFeature.path;
            // window.open(url);
            window.location.href = url;
          }
          onFeatureSelect(selectedFeature);
          scrollToElement('ol-map-container');
          // map.getView().animate({
          //   duration: 10,
          //   center: selectedFeature.geometry.flatCoordinates,
          // });
        } else {
          onFeatureSelect(null);
          zoomMapToFeatures({ map, features: subfeatures, ol });
        }
      });

      return null;
    });

    map.addInteraction(select);

    map.on('pointermove', (e) => {
      const pixel = map.getEventPixel(e.originalEvent);
      const hit = map.hasFeatureAtPixel(pixel);
      map.getViewport().style.cursor = hit ? 'pointer' : '';
    });

    return () => map.removeInteraction(select);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, selectStyle, onFeatureSelect, hideFilters]);

  return null;
}

export default withOpenLayers(FeatureInteraction);
