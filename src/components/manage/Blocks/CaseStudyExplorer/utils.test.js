import './mockJsdom';
import '@testing-library/jest-dom';
import {
  FALLBACK_STATUS_COLOR,
  STATUS_COLORS,
  centerAndResetMapZoom,
  getFeatures,
  getStatusColor,
  scrollToElement,
  visibleChipCount,
} from './utils';

describe('utils.js', () => {
  test('maps exact statuses to design system colours, unknown to fallback', () => {
    expect(getStatusColor('planned')).toBe('#006BB8');
    expect(getStatusColor('ongoing')).toBe('#FF9933');
    expect(getStatusColor('completed')).toBe('#007B6C');
    expect(getStatusColor('Planned')).toBe(FALLBACK_STATUS_COLOR);
    expect(getStatusColor('future')).toBe(FALLBACK_STATUS_COLOR);
    expect(STATUS_COLORS.completed).toBe('#007B6C');
  });

  test('getFeatures carries the properties needed by map and list', () => {
    const feature = {
      setId: jest.fn(),
      setProperties: jest.fn(),
      props: null,
    };
    feature.setProperties.mockImplementation((properties) => {
      feature.props = properties;
    });

    const ol = {
      ol: { Feature: jest.fn(() => feature) },
      geom: { Point: jest.fn(() => ({})) },
      proj: { fromLonLat: jest.fn(() => [1, 2]) },
    };

    const features = getFeatures({
      cases: [
        {
          geometry: { coordinates: [14.4, 50.1] },
          properties: {
            title: 'Peatlands',
            path: '/case-peatlands',
            image: 'image.jpg',
            current_status: 'ongoing',
          },
        },
      ],
      ol,
    });

    expect(features).toHaveLength(1);
    expect(feature.setId).toHaveBeenCalledWith(0);
    expect(feature.props).toMatchObject({
      title: 'Peatlands',
      path: '/case-peatlands',
      current_status: 'ongoing',
      color: '#FF9933',
    });
  });

  test('centerAndResetMapZoom returns to the European extent', () => {
    const map = { getView: () => ({ animate: jest.fn() }) };
    const ol = { proj: { transform: jest.fn(() => [111, 222]) } };

    centerAndResetMapZoom({ map, ol });

    expect(map.getView().animate).toBeDefined();
    expect(ol.proj.transform).toHaveBeenCalledWith(
      [8, 55],
      'EPSG:4326',
      'EPSG:3857',
    );
  });

  test('scrollToElement tolerates missing elements', () => {
    expect(() => scrollToElement('does-not-exist')).not.toThrow();
  });

  describe('visibleChipCount', () => {
    const CHIP = 90;
    const GAP = 8;
    const WIDTH = 300;
    // Three chips per row: x = 0, 98, 196 and the fourth wraps.
    const layout = (rows) =>
      rows.flatMap((aRow) =>
        [0, 1, 2].map((column) => ({
          row: aRow,
          right: column * (CHIP + GAP) + CHIP,
        })),
      );
    const options = { rows: 2, gap: GAP, moreWidth: 40, width: WIDTH };

    test('returns 0 for an empty list', () => {
      expect(visibleChipCount([], options)).toBe(0);
    });

    test('keeps every chip when they all fit in two rows', () => {
      expect(visibleChipCount(layout([0, 1]), options)).toBe(6);
      expect(visibleChipCount(layout([0]), options)).toBe(3);
    });

    test('drops a chip so the trigger fits on the second row', () => {
      // 6 chips fill two rows, but the trigger no longer fits next to the 6th.
      expect(visibleChipCount(layout([0, 1, 2]), options)).toBe(5);
    });

    test('keeps one chip rather than hiding everything behind a trigger', () => {
      const chips = [
        { row: 0, right: 300 },
        { row: 1, right: 50 },
      ];
      expect(
        visibleChipCount(chips, {
          rows: 1,
          gap: GAP,
          moreWidth: 200,
          width: 60,
        }),
      ).toBe(1);
    });
  });
});
