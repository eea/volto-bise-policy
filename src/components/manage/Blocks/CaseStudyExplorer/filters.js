/**
 * Case study facet model.
 *
 * Pure functions behind the explorer's filter panel: normalising payload
 * values, free-text search over measures and typology, building facet options
 * with counts, applying a set of filters and ordering the results. Kept free of React and of the map so the behaviour
 * can be tested without a browser.
 *
 * See docs/adr/0002-case-study-explorer-filter-model.md.
 */

/**
 * Facets offered as dropdowns. The measures and the typology of measures are
 * not facets any more: they are searched as free text (`query`), see
 * `caseMatchesQuery`.
 */
export const FACET_NAMES = [
  'legislation',
  'ecosystem',
  'bioregion',
  'scale',
  'status',
];

export const EMPTY_FILTERS = Object.freeze({
  ...FACET_NAMES.reduce((accumulator, name) => {
    accumulator[name] = [];
    return accumulator;
  }, {}),
  query: '',
});

// The backend renamed several fields over time: the ecosystem facet was
// serialised as `ecosystem_typology`, later as `nrr_habitat_ecosystem_type`,
// and the map endpoint currently emits `habitat_ecosystem_type`. Accept all of
// them so the card and the facet do not silently render empty.
const FIELD_ALIASES = {
  ecosystem: [
    'habitat_ecosystem_type',
    'nrr_habitat_ecosystem_type',
    'ecosystem_typology',
  ],
  scale: ['scale_of_planning', 'nrr_scale_of_planning'],
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
      value.id ??
        value.code ??
        value.value ??
        value.token ??
        value.title ??
        value,
    );
  }

  return String(value);
}

export function valueLabel(value) {
  if (value && typeof value === 'object') {
    return String(
      value.title ??
        value.name ??
        value.label ??
        value.code ??
        value.value ??
        value,
    );
  }

  return String(value);
}

const MEASURE_CODE_PREFIX = /^([A-Za-z]+)/;

/**
 * Turn a typology choice label ("NRPM_001 - MA01 - Prevent conversion ...")
 * into its structured parts. The backend sends `typology` already split; this
 * is the fallback for payloads that only carry the legacy string list.
 */
export function toTypologyEntry(label) {
  const text = String(label ?? '').trim();
  const parts = text.split(' - ', 3).map((part) => part.trim());

  if (parts.length < 2 || !(parts[0] && parts[1])) {
    return { code: text, family: '', title: text };
  }

  const [code, measureCode] = parts;
  const title = parts.length === 3 && parts[2] ? parts[2] : text;
  const family = MEASURE_CODE_PREFIX.exec(measureCode);

  return { code, family: family ? family[1] : '', title };
}

/**
 * Raw values of one facet for one case study's properties. Returns the
 * payload values (strings or objects), never codes or labels.
 */
export function getFacetValues(properties, facetName) {
  const data = properties || {};

  switch (facetName) {
    case 'measures':
      return asValues(data.measures);
    case 'typology':
      return asValues(data.typology)?.length
        ? asValues(data.typology)
        : asValues(data.typology_of_measures).map(toTypologyEntry);
    case 'legislation':
      return asValues(data.nrr_legislation);
    case 'ecosystem':
      return asValues(getCaseProperty(data, 'ecosystem'));
    case 'bioregion':
      return asValues(data.nrr_biogeographical_region);
    case 'scale':
      return asValues(getCaseProperty(data, 'scale'));
    case 'status':
      return asValues(data.current_status);
    default:
      return [];
  }
}

const normalizeSearch = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase();

/**
 * Everything a free-text search may match on: the case study's implemented
 * measures (title, id, path) and its typology of measures (title, code,
 * family). Rendered as one lower-cased haystack so a query can mix both.
 */
export function getSearchText(properties) {
  const measures = getFacetValues(properties, 'measures').flatMap((measure) =>
    measure && typeof measure === 'object'
      ? [measure.title, measure.id, measure.path]
      : [measure],
  );
  const typology = getFacetValues(properties, 'typology').flatMap((entry) => [
    valueLabel(entry),
    valueCode(entry),
    entry?.family,
    entry?.title,
  ]);

  return [measures, typology].flat().filter(Boolean).join(' ').toLowerCase();
}

/**
 * Free-text filter over the measures implemented and the typology of
 * measures. Whitespace separates terms and every term has to appear, so
 * "restore rivers" finds a case whose measure title contains both words.
 */
export function caseMatchesQuery(properties, query) {
  const terms = normalizeSearch(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return true;

  const haystack = getSearchText(properties);

  return terms.every((term) => haystack.includes(term));
}

export function caseMatchesFacet(properties, facetName, selected) {
  if (!selected?.length) return true;

  const values = getFacetValues(properties, facetName).map(valueCode);

  return selected.some((choice) => values.includes(String(choice)));
}

export function filterCasesByPath(cases, filterPath) {
  const path = filterPath?.trim();
  if (!path) return cases;

  return cases.filter((item) =>
    String(item.properties?.path || '').includes(path),
  );
}

/**
 * Apply the free-text query and every facet (OR inside a facet, AND between
 * facets), optionally narrowed to a path or to the case studies implementing
 * one measure.
 */
export function filterCases(cases, filters, options = {}) {
  const { filterPath, measureId } = options || {};
  const active = filters || EMPTY_FILTERS;

  return filterCasesByPath(cases, filterPath).filter((item) => {
    const properties = item.properties || {};

    if (measureId) {
      const measures = getFacetValues(properties, 'measures').map(valueCode);
      if (!measures.includes(String(measureId))) return false;
    }

    if (!caseMatchesQuery(properties, active.query)) return false;

    return FACET_NAMES.every((facetName) =>
      caseMatchesFacet(properties, facetName, active[facetName]),
    );
  });
}

/**
 * How many cases each value of a facet would match, given the *other* facets
 * currently selected. A facet does not narrow itself, otherwise a value would
 * always read as its own selection count.
 */
export function countFacetValues(cases, filters, facetName, options = {}) {
  const otherFilters = FACET_NAMES.reduce((accumulator, name) => {
    accumulator[name] = name === facetName ? [] : filters?.[name] || [];
    return accumulator;
  }, {});
  otherFilters.query = filters?.query || '';

  const visible = filterCases(cases, otherFilters, options);

  return visible.reduce((counts, item) => {
    getFacetValues(item.properties, facetName).forEach((value) => {
      const code = valueCode(value);
      counts[code] = (counts[code] || 0) + 1;
    });

    return counts;
  }, {});
}

function collectFacetIndex(cases, facetName) {
  const index = new Map();

  (cases || []).forEach((item) => {
    getFacetValues(item.properties, facetName).forEach((value) => {
      const code = valueCode(value);
      if (index.has(code)) return;

      index.set(code, {
        value: code,
        label: valueLabel(value),
        ...(facetName === 'typology' && value?.family
          ? { family: value.family }
          : {}),
      });
    });
  });

  return index;
}

/**
 * Facet options (label, count, typology family) for every facet, ordered by
 * label. Only values present in the data are offered: the typology facet
 * alone has 162 possible codes.
 */
export function buildFacets(cases, filters = EMPTY_FILTERS, options = {}) {
  return FACET_NAMES.reduce((facets, facetName) => {
    const index = collectFacetIndex(cases, facetName);
    const counts = countFacetValues(cases, filters, facetName, options);

    facets[facetName] = Object.entries(counts)
      .map(([value, count]) => ({
        value,
        label: index.get(value)?.label ?? value,
        ...(index.get(value)?.family
          ? { family: index.get(value).family }
          : {}),
        count,
      }))
      .sort((first, second) => first.label.localeCompare(second.label));

    return facets;
  }, {});
}

export function hasActiveFilters(filters) {
  return (
    Boolean(filters?.query?.trim()) ||
    FACET_NAMES.some((name) => (filters?.[name] || []).length > 0)
  );
}

export function clearFilters() {
  return {
    ...FACET_NAMES.reduce((cleared, name) => {
      cleared[name] = [];
      return cleared;
    }, {}),
    query: '',
  };
}

function effectiveTime(item) {
  const time = Date.parse(item.properties?.effective ?? '');
  return Number.isNaN(time) ? null : time;
}

export function sortCases(cases, sortBy = 'title') {
  const sorted = [...(cases || [])];

  if (sortBy === 'newest') {
    return sorted.sort((first, second) => {
      const firstTime = effectiveTime(first);
      const secondTime = effectiveTime(second);
      if (firstTime === null && secondTime === null) return 0;
      if (firstTime === null) return 1;
      if (secondTime === null) return -1;
      return secondTime - firstTime;
    });
  }

  return sorted.sort((first, second) =>
    String(first.properties?.title || '').localeCompare(
      String(second.properties?.title || ''),
    ),
  );
}

const NRR_ARTICLE_PREFIX = /^article\b/i;

/**
 * The card shows how many NRR articles a case study cites. The payload stores
 * them in `nrr_legislation`, mixed with directives (Habitats, Birds), which
 * are not NRR articles and are shown separately.
 */
export function getArticleInfo(properties) {
  const legislation = asValues(properties?.nrr_legislation).map(String);

  return {
    articles: legislation.filter((value) => NRR_ARTICLE_PREFIX.test(value)),
    directives: legislation.filter((value) => !NRR_ARTICLE_PREFIX.test(value)),
    count: legislation.filter((value) => NRR_ARTICLE_PREFIX.test(value)).length,
  };
}
