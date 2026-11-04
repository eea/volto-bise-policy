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
    zoom: 4.5,
    duration: prefersReducedMotion() ? 0 : 1000,
    center: ol.proj.transform([8, 55], 'EPSG:4326', 'EPSG:3857'),
  });
}

/**
 * How many wrapping chips to keep visible before a trailing "+N" trigger has
 * to stand in for the rest.
 *
 * `chips` are the measured boxes of every chip in render order: `right` is the
 * chip's right edge measured from the left edge of the list and `row` its
 * 0-based row index in the full, untruncated layout. The trigger takes the
 * place right after the last visible chip, so dropping a chip may let the
 * trigger fit on a row it did not fit on before; the scan goes from the full
 * list downwards and stops at the first count whose last chip plus the trigger
 * still fit in `rows` rows.
 *
 * Returns the number of chips to show (0 for an empty list).
 */
export function visibleChipCount(
  chips,
  { rows = 2, gap = 0, moreWidth = 0, width = 0 } = {},
) {
  const total = chips.length;
  if (!total) return 0;

  const maxRow = rows - 1;

  // Everything already fits: nothing is hidden, so no trigger is needed.
  if (chips[total - 1].row <= maxRow) return total;

  for (let count = total - 1; count > 0; count -= 1) {
    const last = chips[count - 1];
    const triggerRow =
      last.right + gap + moreWidth <= width ? last.row : last.row + 1;

    if (triggerRow <= maxRow) return count;
  }

  // Too narrow for any chip next to the trigger: keep one rather than hide
  // everything behind a bare "+N".
  return 1;
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
