import {
  EMPTY_FILTERS,
  asValues,
  valueCode,
  valueLabel,
  getFacetValues,
  filterCases,
  filterCasesByPath,
  countFacetValues,
  buildFacets,
  getSearchText,
  caseMatchesQuery,
  hasActiveFilters,
  clearFilters,
  sortCases,
  getArticleInfo,
  toTypologyEntry,
} from './filters';

const typology = (code, family, title) => ({ code, family, title });

const caseStudy = (id, properties = {}) => ({
  geometry: { type: 'Point', coordinates: [0, 0] },
  properties: {
    title: `Case ${id}`,
    url: `https://example.com/case-${id}`,
    path: `/case-${id}`,
    ...properties,
  },
});

const cases = [
  caseStudy(1, {
    title: 'Peatland rewetting in Bohemia',
    current_status: 'ongoing',
    measures: [
      { id: 'measure-a', title: 'Restore degraded peatlands', path: '/m/a' },
    ],
    typology: [
      typology('NRPM_001', 'MA', 'Prevent conversion of habitats'),
      typology('NRPM_020', 'MB', 'Restore forest habitats'),
    ],
    nrr_legislation: ['Article 4 - Terrestrial', 'Birds Directive (BD)'],
    nrr_habitat_ecosystem_type: ['Inland wetlands'],
    nrr_biogeographical_region: ['Continental'],
    nrr_scale_of_planning: ['National Scale'],
    effective: '2026-02-11T09:36:06+00:00',
  }),
  caseStudy(2, {
    title: 'River connectivity in Germany',
    current_status: 'completed',
    measures: [
      {
        id: 'measure-b',
        title: 'Restore rivers and floodplains',
        path: '/m/b',
      },
    ],
    typology: [typology('NRPM_020', 'MB', 'Restore forest habitats')],
    nrr_legislation: ['Article 9 - Rivers'],
    nrr_habitat_ecosystem_type: ['Rivers and canals', 'Lakes and reservoirs'],
    nrr_biogeographical_region: ['Atlantic'],
    nrr_scale_of_planning: ['Regional Scale (NUTS 2 / NUTS 3)'],
    effective: '2026-01-02T00:00:00+00:00',
  }),
  caseStudy(3, {
    title: 'Pollinator grasslands in France',
    current_status: 'planned',
    measures: [],
    typology: [],
    nrr_legislation: [],
    nrr_habitat_ecosystem_type: [
      'Grassland (pastures, semi-natural and natural grasslands)',
    ],
    nrr_biogeographical_region: ['Atlantic', 'Continental'],
    nrr_scale_of_planning: [],
  }),
];

describe('facet values', () => {
  test('asValues normalizes scalars, null and lists', () => {
    expect(asValues(undefined)).toEqual([]);
    expect(asValues(null)).toEqual([]);
    expect(asValues('')).toEqual([]);
    expect(asValues('planned')).toEqual(['planned']);
    expect(asValues(['a', 'b'])).toEqual(['a', 'b']);
  });

  test('valueCode/valueLabel read strings and objects', () => {
    expect(valueCode('planned')).toBe('planned');
    expect(valueCode({ id: 'measure-a', title: 'Measure A' })).toBe(
      'measure-a',
    );
    expect(valueCode(typology('NRPM_001', 'MA', 'Title'))).toBe('NRPM_001');
    expect(valueLabel({ id: 'measure-a', title: 'Measure A' })).toBe(
      'Measure A',
    );
    expect(valueLabel(typology('NRPM_001', 'MA', 'Title'))).toBe('Title');
  });

  test('toTypologyEntry parses legacy label strings', () => {
    expect(toTypologyEntry('NRPM_001 - MA01 - Prevent conversion')).toEqual({
      code: 'NRPM_001',
      family: 'MA',
      title: 'Prevent conversion',
    });
    expect(toTypologyEntry('something else')).toEqual({
      code: 'something else',
      family: '',
      title: 'something else',
    });
  });

  test('getFacetValues maps every facet to its payload field', () => {
    const properties = cases[0].properties;
    expect(getFacetValues(properties, 'measures')).toHaveLength(1);
    expect(getFacetValues(properties, 'typology')).toHaveLength(2);
    expect(getFacetValues(properties, 'legislation')).toHaveLength(2);
    expect(getFacetValues(properties, 'ecosystem')).toEqual([
      'Inland wetlands',
    ]);
    expect(getFacetValues(properties, 'bioregion')).toEqual(['Continental']);
    expect(getFacetValues(properties, 'scale')).toEqual(['National Scale']);
    expect(getFacetValues(properties, 'status')).toEqual(['ongoing']);
    expect(getFacetValues(properties, 'unknown-facet')).toEqual([]);
  });

  test('getFacetValues falls back to legacy typology_of_measures strings', () => {
    expect(
      getFacetValues(
        { typology_of_measures: ['NRPM_001 - MA01 - Title'] },
        'typology',
      ),
    ).toEqual([typology('NRPM_001', 'MA', 'Title')]);
  });

  test('getFacetValues reads the habitat_ecosystem_type the map API emits', () => {
    expect(
      getFacetValues(
        { habitat_ecosystem_type: ['Rivers and canals'] },
        'ecosystem',
      ),
    ).toEqual(['Rivers and canals']);
  });

  test('getFacetValues reads the legacy ecosystem_typology alias', () => {
    expect(
      getFacetValues({ ecosystem_typology: ['Forest'] }, 'ecosystem'),
    ).toEqual(['Forest']);
  });

  test('getFacetValues reads the scale_of_planning the map API emits', () => {
    expect(
      getFacetValues({ scale_of_planning: ['Regional Scale'] }, 'scale'),
    ).toEqual(['Regional Scale']);
  });
});

describe('filterCases', () => {
  test('no filters keeps every case', () => {
    expect(filterCases(cases, EMPTY_FILTERS)).toHaveLength(3);
    expect(filterCases(cases, undefined)).toHaveLength(3);
  });

  test('a facet with no selection never filters', () => {
    expect(
      filterCases(cases, { ...EMPTY_FILTERS, ecosystem: [] }),
    ).toHaveLength(3);
  });

  test('filters OR within one facet and AND across facets', () => {
    expect(
      filterCases(cases, { ...EMPTY_FILTERS, status: ['ongoing', 'planned'] }),
    ).toHaveLength(2);

    expect(
      filterCases(cases, {
        ...EMPTY_FILTERS,
        status: ['ongoing', 'planned'],
        bioregion: ['Continental'],
      }),
    ).toHaveLength(2);

    expect(
      filterCases(cases, {
        ...EMPTY_FILTERS,
        status: ['ongoing'],
        bioregion: ['Atlantic'],
      }),
    ).toHaveLength(0);
  });

  test('filters multi-valued facets', () => {
    expect(
      filterCases(cases, {
        ...EMPTY_FILTERS,
        ecosystem: ['Lakes and reservoirs'],
      }),
    ).toEqual([cases[1]]);
  });

  test('narrows by filter path', () => {
    expect(filterCasesByPath(cases, '/case-2')).toEqual([cases[1]]);
    expect(filterCasesByPath(cases, '  ')).toEqual(cases);
    expect(
      filterCases(cases, EMPTY_FILTERS, { filterPath: '/case-2' }),
    ).toEqual([cases[1]]);
  });

  test('narrows to the case studies of one measure', () => {
    expect(
      filterCases(cases, EMPTY_FILTERS, { measureId: 'measure-a' }),
    ).toEqual([cases[0]]);
  });

  test('free text narrows by implemented measures and by typology', () => {
    expect(filterCases(cases, { ...EMPTY_FILTERS, query: 'rivers' })).toEqual([
      cases[1],
    ]);
    expect(filterCases(cases, { ...EMPTY_FILTERS, query: 'nrpm_020' })).toEqual(
      [cases[0], cases[1]],
    );
    // `MA` matches the typology family of the first case only.
    expect(filterCases(cases, { ...EMPTY_FILTERS, query: 'MA' })).toEqual([
      cases[0],
    ]);
  });

  test('free text requires every term and combines with facets', () => {
    expect(
      filterCases(cases, { ...EMPTY_FILTERS, query: 'restore wetlands' }),
    ).toHaveLength(0);

    expect(
      filterCases(cases, {
        ...EMPTY_FILTERS,
        query: 'restore',
        status: ['completed'],
      }),
    ).toEqual([cases[1]]);
  });

  test('an empty or blank query never filters', () => {
    expect(filterCases(cases, { ...EMPTY_FILTERS, query: '' })).toHaveLength(3);
    expect(filterCases(cases, { ...EMPTY_FILTERS, query: '   ' })).toHaveLength(
      3,
    );
  });

  test('ignores unknown facet names', () => {
    expect(
      filterCases(cases, { ...EMPTY_FILTERS, unknown: ['x'] }),
    ).toHaveLength(3);
  });
});

describe('search text', () => {
  test('getSearchText concatenates measure and typology values', () => {
    const text = getSearchText(cases[0].properties);

    expect(text).toContain('restore degraded peatlands');
    expect(text).toContain('/m/a');
    expect(text).toContain('prevent conversion of habitats');
    expect(text).toContain('nrpm_001');
    expect(text).toContain('mb');
  });

  test('caseMatchesQuery is case-insensitive and term-based', () => {
    expect(caseMatchesQuery(cases[0].properties, 'PEATLANDS')).toBe(true);
    expect(caseMatchesQuery(cases[0].properties, 'peatlands forest')).toBe(
      true,
    );
    expect(caseMatchesQuery(cases[0].properties, 'peatlands rivers')).toBe(
      false,
    );
    expect(caseMatchesQuery(cases[0].properties, '')).toBe(true);
  });
});

describe('facet counts', () => {
  test('counts values present in the data', () => {
    expect(countFacetValues(cases, EMPTY_FILTERS, 'status')).toEqual({
      ongoing: 1,
      completed: 1,
      planned: 1,
    });
    expect(countFacetValues(cases, EMPTY_FILTERS, 'ecosystem')).toEqual({
      'Inland wetlands': 1,
      'Rivers and canals': 1,
      'Lakes and reservoirs': 1,
      'Grassland (pastures, semi-natural and natural grasslands)': 1,
    });
  });

  test('a facet does not narrow itself', () => {
    const filters = { ...EMPTY_FILTERS, status: ['ongoing'] };

    expect(countFacetValues(cases, filters, 'status')).toEqual({
      ongoing: 1,
      completed: 1,
      planned: 1,
    });
    // ...but the other facets do narrow it
    expect(countFacetValues(cases, filters, 'bioregion')).toEqual({
      Continental: 1,
    });
  });

  test('buildFacets returns sorted options with labels and counts', () => {
    const facets = buildFacets(cases, EMPTY_FILTERS);

    expect(facets.status).toEqual([
      { value: 'completed', label: 'completed', count: 1 },
      { value: 'ongoing', label: 'ongoing', count: 1 },
      { value: 'planned', label: 'planned', count: 1 },
    ]);
    // Measures and typology are searched as free text, not offered as facets.
    expect(facets.measures).toBeUndefined();
    expect(facets.typology).toBeUndefined();
  });

  test('buildFacets filters options by counts when other facets change', () => {
    const facets = buildFacets(cases, {
      ...EMPTY_FILTERS,
      status: ['planned'],
    });

    expect(facets.ecosystem.map((option) => option.value)).toEqual([
      'Grassland (pastures, semi-natural and natural grasslands)',
    ]);
    expect(facets.status.map((option) => option.value)).toEqual([
      'completed',
      'ongoing',
      'planned',
    ]);
  });
});

describe('hasActiveFilters', () => {
  test('ignores empty selections', () => {
    expect(hasActiveFilters(EMPTY_FILTERS)).toBe(false);
    expect(hasActiveFilters({ ...EMPTY_FILTERS, status: ['planned'] })).toBe(
      true,
    );
    expect(hasActiveFilters({ ...EMPTY_FILTERS, query: 'peat' })).toBe(true);
    expect(hasActiveFilters({ ...EMPTY_FILTERS, query: '   ' })).toBe(false);
    expect(hasActiveFilters(undefined)).toBe(false);
  });

  test('clearFilters empties the facets and the query', () => {
    expect(clearFilters()).toEqual(EMPTY_FILTERS);
  });
});

describe('sortCases', () => {
  test('sorts by title A-Z', () => {
    expect(
      sortCases(cases, 'title').map((item) => item.properties.title),
    ).toEqual([
      'Peatland rewetting in Bohemia',
      'Pollinator grasslands in France',
      'River connectivity in Germany',
    ]);
  });

  test('sorts by newest effective date, undated last', () => {
    expect(
      sortCases(cases, 'newest').map((item) => item.properties.title),
    ).toEqual([
      'Peatland rewetting in Bohemia',
      'River connectivity in Germany',
      'Pollinator grasslands in France',
    ]);
  });

  test('does not mutate the input', () => {
    const input = [...cases];
    sortCases(input, 'title');
    expect(input).toEqual(cases);
  });
});

describe('getArticleInfo', () => {
  test('separates NRR articles from directives', () => {
    expect(getArticleInfo(cases[0].properties)).toEqual({
      count: 1,
      articles: ['Article 4 - Terrestrial'],
      directives: ['Birds Directive (BD)'],
    });
  });

  test('handles missing legislation', () => {
    expect(getArticleInfo({})).toEqual({
      count: 0,
      articles: [],
      directives: [],
    });
  });
});
