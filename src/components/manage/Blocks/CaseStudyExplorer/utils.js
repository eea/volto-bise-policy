// EEA design system tokens: link-default, warning, secondary.
export const STATUS_COLORS = {
  planned: '#006BB8',
  ongoing: '#FF9933',
  completed: '#007B6C',
};

export const FALLBACK_STATUS_COLOR = '#6B7280';
export const CLUSTER_COLOR = '#007B6C';

export function getStatusColor(status) {
  return STATUS_COLORS[status] || FALLBACK_STATUS_COLOR;
}

export function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function centerAndResetMapZoom({ map, ol }) {
  map?.getView().animate({
    zoom: 4.3,
    duration: prefersReducedMotion() ? 0 : 1000,
    center: ol.proj.transform([8, 55], 'EPSG:4326', 'EPSG:3857'),
  });
}

export function scrollToElement(elementId) {
  const element = document.getElementById(elementId);
  element?.scrollIntoView({
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
  });
}

/**
 * GeoJSON features -> OpenLayers point features carrying the properties the
 * map style and the map/list coupling need.
 */
export function getFeatures({ cases, ol }) {
  const Feature = ol.ol.Feature;

  return cases.map((item, index) => {
    const point = new Feature(
      new ol.geom.Point(ol.proj.fromLonLat(item.geometry.coordinates)),
    );
    const properties = item.properties || {};
    const status = properties.current_status;

    point.setId(index);
    point.setProperties(
      {
        title: properties.title,
        image: properties.image,
        path: properties.path,
        current_status: status,
        color: getStatusColor(status),
        index,
      },
      false,
    );

    return point;
  });
}
