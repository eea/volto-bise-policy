import './mockJsdom';
import '@testing-library/jest-dom';
import {
  FALLBACK_STATUS_COLOR,
  getFeatures,
  getStatusColor,
  filterCases,
  getFilters,
} from './utils';

describe('utils.js', () => {
  test('maps exact statuses and unknown statuses to colors', () => {
    expect(getStatusColor('planned')).toBe('#1976D2');
    expect(getStatusColor('ongoing')).toBe('#F57C00');
    expect(getStatusColor('completed')).toBe('#388E3C');
    expect(getStatusColor('Planned')).toBe(FALLBACK_STATUS_COLOR);
    expect(getStatusColor('future')).toBe(FALLBACK_STATUS_COLOR);
  });

  const mockCases = [
    {
      geometry: { coordinates: [0, 0] },
      properties: {
        title: 'test case study',
        image: '',
        nwrm_type: 'light',
        measures: [{ id: 'test-measure1', title: 'test measure 1' }],
        description: 'test',
        typology_of_measures: ['testsector'],
        path: '/test-case-study',
        url: 'localhost.com/test-case-study',
      },
    },
    {
      geometry: { coordinates: [0, 0] },
      properties: {
        title: 'case study 2',
        image: '',
        nwrm_type: 'light',
        measures: [{ id: 'test-measure1', title: 'test measure 1' }],
        description: 'test',
        typology_of_measures: ['testsector'],
        path: '/test-case-study',
        url: 'localhost.com/test-case-study',
      },
    },
  ];

  test('getFeatures', () => {
    const mockFeature = {
      setId: jest.fn(),
      setProperties: jest.fn(),
    };

    const ol = {
      ol: {
        Feature: jest.fn().mockImplementation(() => mockFeature),
      },
      geom: {
        Point: jest.fn().mockImplementation(() => ({})),
      },
      proj: {
        fromLonLat: jest.fn().mockReturnValue([0, 0]),
      },
    };

    expect(() => {
      getFeatures({ cases: mockCases, ol });
    }).not.toThrowError();
  });

  test('filterCases', () => {
    const mockActiveFilters = {
      measures_implemented: ['test measure 1'],
      typology_of_measures: ['testsector'],
    };
    const mockCaseStudiesIds = ['test-case-study'];
    const mockCasesFiltered = filterCases(
      mockCases,
      mockActiveFilters,
      mockCaseStudiesIds,
      'test',
    );
    expect(mockCasesFiltered).toStrictEqual([]);
  });

  test('filters new scalar and multi-value fields', () => {
    const cases = [
      {
        geometry: { coordinates: [0, 0] },
        properties: {
          title: 'planned river case',
          description: '',
          url: '/planned-river-case',
          current_status: 'planned',
          ecosystem_typology: ['River', 'Wetland'],
          nrr_article: [{ id: 'article-1', title: 'Article 1' }],
          scale_of_planning: 'Regional',
        },
      },
      {
        geometry: { coordinates: [0, 0] },
        properties: {
          title: 'future case',
          description: '',
          url: '/future-case',
          current_status: 'Future',
          ecosystem_typology: ['Forest'],
          nrr_article: ['article-2'],
          scale_of_planning: 'National',
        },
      },
    ];

    expect(
      filterCases(cases, {
        measures_implemented: [],
        typology_of_measures: [],
        current_status: ['planned'],
        habitat_ecosystem_type: ['River'],
        nrr_article: ['article-1'],
        scale_of_planning: ['Regional'],
      }),
    ).toHaveLength(1);
    expect(getFilters(cases).nrr_article).toEqual({
      'article-1': 'Article 1',
      'article-2': 'article-2',
    });
  });

  test('getFilters', () => {
    const mockCasesObject = mockCases.reduce((acc, item, index) => {
      acc[index] = item;
      return acc;
    }, {});
    const mockFilters = getFilters(mockCasesObject);
    expect(mockFilters).toStrictEqual({
      measures_implemented: {
        'test-measure1': 'test measure 1',
      },
      typology_of_measures: {
        testsector: 'testsector',
      },
      current_status: {},
      habitat_ecosystem_type: {},
      nrr_article: {},
      scale_of_planning: {},
    });
  });
});
