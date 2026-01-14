import React from 'react';
import { useMapContext } from '@eeacms/volto-openlayers-map/api';
import { withOpenLayers } from '@eeacms/volto-openlayers-map';
import FeatureDisplay from './FeatureDisplay';
import { usePrevious } from '@plone/volto/helpers/Utils/usePrevious';

function InfoOverlay({
  selectedFeature,
  onFeatureSelect,
  layerId,
  hideFilters,
  ol,
}) {
  const { map } = useMapContext();
  const [tooltip, setTooltipRef] = React.useState();
  const [showTooltip, setShowTooltip] = React.useState();

  const prevLayerId = usePrevious(layerId);

  React.useEffect(() => {
    if (prevLayerId && layerId !== prevLayerId) {
      setShowTooltip(false);
    }
  }, [layerId, prevLayerId]);

  React.useEffect(() => {
    if (!(map && tooltip)) return;

    const overlay = new ol.Overlay({
      element: document.getElementById('popup-overlay'),
      positioning: 'bottom-center',
      offset: [0, -10],
      stopEvent: false,
    });
    map.addOverlay(overlay);

    function handler(evt) {
      const { pixel, target } = evt;
      const features = target.getFeaturesAtPixel(pixel);
      const popupOverlay = overlay.element; // document.getElementById('popup-overlay');

      if (
        features.length &&
        !hideFilters // && !isCluster(features)
      ) {
        setShowTooltip(true);
      } else {
        // handle a click in an overlay popup
        if (evt.originalEvent.target.tagName === 'A') return;
        setShowTooltip(false);
        popupOverlay.style.display = 'none';
        onFeatureSelect(null);
      }
    }

    map.on('click', handler);

    return () => {
      map.un('click', handler);
      map.removeOverlay(overlay);
    };
  }, [map, tooltip, onFeatureSelect, hideFilters, ol]); //

  const [isClient, setIsClient] = React.useState(false);
  React.useEffect(() => setIsClient(true), []);

  return isClient ? (
    <div
      id="popup-overlay"
      style={{
        position: 'absolute',
        zIndex: 1,
        visibility: showTooltip ? 'visible' : 'hidden',
      }}
      ref={setTooltipRef}
    >
      {selectedFeature ? <FeatureDisplay feature={selectedFeature} /> : null}
    </div>
  ) : null;
}

export default withOpenLayers(InfoOverlay);
