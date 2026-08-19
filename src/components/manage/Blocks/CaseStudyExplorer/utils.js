export const STATUS_COLORS = {
  planned: '#006bb8',
  ongoing: '#ff9933',
  completed: '#00a390',
};

export const FALLBACK_STATUS_COLOR = '#6B7280';
export const CLUSTER_COLOR = '#007B6C';

const FIELD_ALIASES = {
  habitat_ecosystem_type: ['habitat_ecosystem_type', 'ecosystem_typology'],
};

export function getCaseProperty(properties, fieldName) {
  if (properties?.[fieldName] !== undefined) return properties[fieldName];
  return (FIELD_ALIASES[fieldName] || [])
    .map((field) => properties?.[field])
    .find((value) => value !== undefined);
}

export function asValues(value) {
  if (value === undefined || value === null || value === '') return [];
  return Array.isArray(value) ? value : [value];
}

export function valueCode(value) {
  if (value && typeof value === 'object') {
    return String(
      value.id ?? value.value ?? value.token ?? value.title ?? value,
    );
  }
  return String(value);
}

export function valueLabel(value) {
  if (value && typeof value === 'object') {
    return String(
      value.title ?? value.name ?? value.label ?? value.value ?? value.id,
    );
  }
  return String(value);
}

export function getStatusColor(status) {
  return STATUS_COLORS[status] || FALLBACK_STATUS_COLOR;
}

export function centerAndResetMapZoom({ map, ol }) {
  map.getView().animate({
    zoom: 4,
    duration: 1000,
    center: ol.proj.transform([10, 49], 'EPSG:4326', 'EPSG:3857'),
  });
}

export function scrollToElement(elementId) {
  const element = document.getElementById(elementId);
  element?.scrollIntoView({ behavior: 'smooth' });
}

export function getSelectInteraction(map) {
  const interactions = map?.getInteractions?.();
  const interactionArray =
    interactions?.getArray?.() || interactions?.array_ || [];

  return interactionArray.find(
    (interaction) => typeof interaction?.getFeatures === 'function',
  );
}

export function getExtentOfFeatures({ features, ol }) {
  const points = features.map((f) => f.getGeometry().flatCoordinates);
  const point = new ol.geom.MultiPoint(points);
  return point.getExtent();
}

export function zoomMapToFeatures({ map, features, threshold = 500, ol }) {
  const extent = getExtentOfFeatures({ features, ol });
  let extentBuffer = (extent[3] - extent[1] + extent[2] - extent[0]) / 4;
  extentBuffer = extentBuffer < threshold ? threshold : extentBuffer;
  const paddedExtent = ol.extent.buffer(extent, extentBuffer);
  map.getView().fit(paddedExtent, { ...map.getSize(), duration: 1000 });
}

export function getFeatures({ cases, ol }) {
  const Feature = ol.ol.Feature;

  return cases.map((c, index) => {
    const point = new Feature(
      new ol.geom.Point(ol.proj.fromLonLat(c.geometry.coordinates)),
    );
    const properties = c.properties || {};
    const status = properties.current_status;
    point.setId(index);
    point.setProperties(
      {
        title: properties.title,
        image: properties.image,
        nwrm_type: properties.nwrm_type,
        measures_implemented: properties.measures,
        typology_of_measures: properties.typology_of_measures,
        current_status: status,
        habitat_ecosystem_type: getCaseProperty(
          properties,
          'habitat_ecosystem_type',
        ),
        nrr_article: properties.nrr_article,
        scale_of_planning: properties.scale_of_planning,
        description: properties.description,
        index,
        path: properties.path,
        color: getStatusColor(status),
      },
      false,
    );
    return point;
  });
}

// Escape a string so it can be embedded in a RegExp pattern as a literal.
// Prevents user-provided input from being interpreted as regex syntax
// (avoids ReDoS via crafted patterns and SyntaxError from malformed ones).
export function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const WORD_CHAR = /[A-Za-z0-9_]/;

// Case-insensitive whole-word substring match implemented without regular
// expressions, so the needle is always treated as literal text. Equivalent
// to /\bneedle\b/i but runs in linear time (indexOf) and is immune to
// catastrophic backtracking.
function hasWholeWord(text, needle) {
  let index = text.indexOf(needle);
  while (index !== -1) {
    const before = index === 0 ? '' : text[index - 1];
    const after =
      index + needle.length >= text.length ? '' : text[index + needle.length];
    if (!WORD_CHAR.test(before) && !WORD_CHAR.test(after)) return true;
    index = text.indexOf(needle, index + 1);
  }
  return false;
}

const FILTER_FIELDS = [
  'measures_implemented',
  'typology_of_measures',
  'current_status',
  'habitat_ecosystem_type',
  'nrr_article',
  'scale_of_planning',
];

export function filterCasesByPath(cases, filterPath) {
  const path = filterPath?.trim();
  if (!path) return cases;

  return cases.filter((_case) =>
    String(_case.properties?.path || '').includes(path),
  );
}

export function filterCases(
  cases,
  activeFilters,
  caseStudiesIds,
  searchInput,
  filterPath,
) {
  return filterCasesByPath(cases, filterPath).filter((_case) => {
    const properties = _case.properties || {};
    const flagCase = caseStudiesIds
      ? caseStudiesIds.includes(properties.url?.split('/').pop())
      : true;
    const searchable = `${properties.title || ''} ${
      properties.description || ''
    }`;
    const flagSearch =
      !searchInput ||
      hasWholeWord(searchable.toLowerCase(), searchInput.toLowerCase());

    const matchesFilters = FILTER_FIELDS.every((filterName) => {
      const selected = activeFilters[filterName] || [];
      if (!selected.length) return true;
      const values =
        filterName === 'measures_implemented'
          ? asValues(properties.measures).map((item) => valueCode(item))
          : filterName === 'typology_of_measures'
            ? asValues(properties.typology_of_measures).map((item) =>
                valueCode(item),
              )
            : asValues(getCaseProperty(properties, filterName)).map((item) =>
                valueCode(item),
              );
      return selected.some((filter) => values.includes(String(filter)));
    });

    return flagCase && flagSearch && matchesFilters;
  });
}

export function getFilters(cases) {
  const filters = Object.fromEntries(FILTER_FIELDS.map((field) => [field, {}]));

  Object.values(cases || {}).forEach((_case) => {
    const properties = _case.properties || {};
    FILTER_FIELDS.forEach((field) => {
      const source =
        field === 'measures_implemented'
          ? properties.measures
          : field === 'typology_of_measures'
            ? properties.typology_of_measures
            : getCaseProperty(properties, field);
      asValues(source).forEach((item) => {
        const code = valueCode(item);
        if (!filters[field][code]) filters[field][code] = valueLabel(item);
      });
    });
  });

  return filters;
}
