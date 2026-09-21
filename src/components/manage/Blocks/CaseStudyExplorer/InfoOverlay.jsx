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
  const overlayRef = React.useRef(null);

  // `ol` is a fresh object literal on every render (see withOpenLayers) and
  // `onFeatureSelect`/`hideFilters` can change identity; keep them in refs so
  // the overlay and its map handler are created only once per mount.
  const olRef = React.useRef(ol);
  olRef.current = ol;
  const onFeatureSelectRef = React.useRef(onFeatureSelect);
  onFeatureSelectRef.current = onFeatureSelect;
  const hideFiltersRef = React.useRef(hideFilters);
  hideFiltersRef.current = hideFilters;

  const prevLayerId = usePrevious(layerId);

  React.useEffect(() => {
    if (prevLayerId && layerId !== prevLayerId) {
      setShowTooltip(false);
    }
  }, [layerId, prevLayerId]);

  React.useEffect(() => {
    if (!(map && tooltip)) return;

    const overlay = new olRef.current.Overlay({
      element: tooltip,
      positioning: 'bottom-center',
      offset: [0, -10],
      stopEvent: false,
    });
    overlayRef.current = overlay;
    map.addOverlay(overlay);

    function handler(evt) {
      const { pixel, target } = evt;
      const features = target.getFeaturesAtPixel(pixel);
      const popupOverlay = overlay.element; // document.getElementById('popup-overlay');

      if (
        features.length &&
        !hideFiltersRef.current // && !isCluster(features)
      ) {
        setShowTooltip(true);
      } else {
        // handle a click in an overlay popup
        if (evt.originalEvent.target.tagName === 'A') return;
        setShowTooltip(false);
        popupOverlay.style.display = 'none';
        onFeatureSelectRef.current(null);
      }
    }

    map.on('click', handler);

    return () => {
      map.un('click', handler);
      map.removeOverlay(overlay);
      overlayRef.current = null;
    };
  }, [map, tooltip]);

  // Anchor the popup to the selected case study and show it above the marker.
  // Selecting a cluster (null feature) or clicking the map clears the popup.
  React.useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    const coordinates = selectedFeature?.geometry?.flatCoordinates;
    if (coordinates) {
      overlay.setPosition(coordinates);
      setShowTooltip(true);
    } else {
      overlay.setPosition(undefined);
      setShowTooltip(false);
    }
  }, [selectedFeature, tooltip]);

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
