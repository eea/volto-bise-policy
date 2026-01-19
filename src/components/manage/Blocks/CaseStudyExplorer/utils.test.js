import './mockJsdom';
import '@testing-library/jest-dom/extend-expect';
import { getFeatures, filterCases, getFilters } from './utils';

describe('utils.js', () => {
  const mockCases = [
    {
      geometry: { coordinates: [0, 0] },
      properties: {
        title: 'test case study',
        image: '',
        nwrm_type: 'light',
        measures: [{ id: 'test-measure1', title: 'test measure 1' }],
        description: 'test',
        sectors: ['testsector'],
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
        sectors: ['testsector'],
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
      nwrms_implemented: ['test measure 1'],
      sectors: ['testsector'],
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

  test('getFilters', () => {
    const mockCasesObject = mockCases.reduce((acc, item, index) => {
      acc[index] = item;
      return acc;
    }, {});

    const mockFilters = getFilters(mockCasesObject);
    expect(mockFilters).toStrictEqual({
      nwrms_implemented: {},
      sectors: {},
    });
  });
});
