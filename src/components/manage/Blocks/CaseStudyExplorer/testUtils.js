export const createMockMap = (additionalProps = {}) => ({
  on: jest.fn(),
  un: jest.fn(),
  addInteraction: jest.fn(),
  removeInteraction: jest.fn(),
  getView: jest.fn(() => ({
    getZoom: () => 4,
    getCenter: () => [111, 222],
  })),
  getInteractions: jest.fn(() => ({
    array_: [
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {
        getFeatures: jest.fn(() => ({
          clear: jest.fn(),
          push: jest.fn(),
        })),
      },
    ],
  })),
  getEventPixel: jest.fn(() => [10, 20]),
  hasFeatureAtPixel: jest.fn(() => true),
  getViewport: jest.fn(() => ({ style: {} })),
  getPixelFromCoordinate: jest.fn(() => [100, 200]),
  getFeaturesAtPixel: jest.fn(() => ['mockFeature']),
  addOverlay: jest.fn(),
  removeOverlay: jest.fn(),
  ...additionalProps,
});

export const createMockOl = (additionalProps = {}) => ({
  source: {
    TileWMS: jest.fn(() => ({ type: 'TileWMS' })),
    Vector: jest.fn(() => ({
      clear: jest.fn(),
      addFeatures: jest.fn(),
    })),
    Cluster: jest.fn(() => ({})),
  },
  style: {
    Style: jest.fn(() => ({
      image_: { getFill: () => ({ setColor: jest.fn() }) },
    })),
    Circle: jest.fn(() => ({})),
    Fill: jest.fn(() => ({})),
    Stroke: jest.fn(() => ({})),
    Text: jest.fn(() => ({})),
  },
  interaction: {
    Select: jest.fn(() => ({
      on: jest.fn(),
    })),
  },
  condition: {
    click: jest.fn(),
  },
  proj: {
    transform: jest.fn(() => [111, 222]),
    fromLonLat: jest.fn(() => [333, 444]),
  },
  Overlay: jest.fn((config) => ({
    element: config.element,
  })),
  ...additionalProps,
});

export const createMockPointsSource = (features = []) => ({
  getFeatures: () => features,
  clear: jest.fn(),
  addFeatures: jest.fn(),
});

export const createMockFilters = () => ({
  measures_implemented: { m1: 'Measure 1', m2: 'Measure 2' },
  typology_of_measures: { sector1: 'Sector 1', sector2: 'Sector 2' },
});
