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
    [ol.style],
  );

  const selectStyle = React.useCallback(() => {
    selected.image_.getFill().setColor('#0A99FF');
    return selected;
  }, [selected]);

  return { selected, selectStyle };
};

function FeatureInteraction({ onFeatureSelect, hideFilters, ol }) {
  const { map } = useMapContext();
  const { selectStyle } = useStyles({ ol });

  // Keep callbacks current without recreating the OpenLayers interaction.
  const onFeatureSelectRef = React.useRef(onFeatureSelect);
  onFeatureSelectRef.current = onFeatureSelect;
  const hideFiltersRef = React.useRef(hideFilters);
  hideFiltersRef.current = hideFilters;
  const olRef = React.useRef(ol);
  olRef.current = ol;

  // Select stores the selected rendered cluster feature and applies its style
  // directly to that feature. Recreating it after selectedCase changes clears
  // that collection and restores the feature's original style.
  const selectRef = React.useRef(null);
  if (!selectRef.current) {
    selectRef.current = new ol.interaction.Select({
      condition: ol.condition.click,
      style: hideFilters ? null : selectStyle,
    });
  }
  const select = selectRef.current;

  React.useEffect(() => {
    if (!map) return;

    const onSelect = (e) => {
      const features = e.target.getFeatures().getArray();

      features.forEach((feature) => {
        const subfeatures = feature.values_.features;
        if (subfeatures.length === 1) {
          const selectedFeature = subfeatures[0].values_;
          if (hideFiltersRef.current) {
            const url = window.location.origin + selectedFeature.path;
            // window.open(url);
            window.location.href = url;
          }
          onFeatureSelectRef.current(selectedFeature);
          scrollToElement('ol-map-container');
        } else {
          onFeatureSelectRef.current(null);
          zoomMapToFeatures({ map, features: subfeatures, ol: olRef.current });
        }
      });
    };

    select.on('select', onSelect);
    map.addInteraction(select);

    const onPointerMove = (e) => {
      const pixel = map.getEventPixel(e.originalEvent);
      const hit = map.hasFeatureAtPixel(pixel);
      map.getViewport().style.cursor = hit ? 'pointer' : '';
    };
    map.on('pointermove', onPointerMove);

    return () => {
      select.un('select', onSelect);
      map.un('pointermove', onPointerMove);
      map.removeInteraction(select);
    };
  }, [map, select]);

  return null;
}

export default withOpenLayers(FeatureInteraction);
