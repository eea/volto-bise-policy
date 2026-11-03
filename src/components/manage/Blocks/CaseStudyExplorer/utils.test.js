import './mockJsdom';
import '@testing-library/jest-dom';
import {
  FALLBACK_STATUS_COLOR,
  STATUS_COLORS,
  centerAndResetMapZoom,
  getFeatures,
  getStatusColor,
  scrollToElement,
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
});
