import React from 'react';
import { render } from '@testing-library/react';
import FeatureInteraction from './FeatureInteraction';
import { scrollToElement, zoomMapToFeatures } from './utils';

jest.mock('@eeacms/volto-openlayers-map', () => ({
  withOpenLayers: (Comp) => Comp,
}));

const addInteraction = jest.fn();
const removeInteraction = jest.fn();
const onMap = jest.fn();
const getEventPixel = jest.fn(() => [10, 20]);
const hasFeatureAtPixel = jest.fn(() => true);
const getViewport = jest.fn(() => ({ style: {} }));

jest.mock('@eeacms/volto-openlayers-map/api', () => ({
  useMapContext: () => ({
    map: mockMap,
  }),
}));

jest.mock('./utils', () => ({
  scrollToElement: jest.fn(),
  zoomMapToFeatures: jest.fn(),
}));

const mockOl = {
  style: {
    Style: jest.fn(() => ({
      image_: { getFill: () => ({ setColor: jest.fn() }) },
    })),
    Circle: jest.fn(() => ({})),
    Fill: jest.fn(() => ({})),
    Stroke: jest.fn(() => ({})),
  },
  interaction: {
    Select: jest.fn(() => ({
      on: jest.fn((evt, cb) => {
        if (evt === 'select') {
          mockSelectCb = cb;
        }
      }),
    })),
  },
  condition: {
    click: jest.fn(),
  },
};

let mockSelectCb;
const mockMap = {
  addInteraction,
  removeInteraction,
  on: onMap,
  getEventPixel,
  hasFeatureAtPixel,
  getViewport,
};

function triggerSelectEvent(subfeatures) {
  const feature = { values_: { features: subfeatures } };
  const mockE = {
    target: {
      getFeatures: () => ({
        getArray: () => [feature],
      }),
    },
  };
  mockSelectCb(mockE);
}

describe('FeatureInteraction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSelectCb = null;
  });

  it('selects a single feature and calls onFeatureSelect + scrollToElement (hideFilters=false)', () => {
    const onFeatureSelect = jest.fn();
    const singleFeature = {
      values_: { path: '/path1', geometry: {}, foo: 'bar' },
    };

    render(
      <FeatureInteraction
        onFeatureSelect={onFeatureSelect}
        hideFilters={false}
        selectedCase={null}
        ol={mockOl}
      />,
    );

    triggerSelectEvent([singleFeature]);

    expect(onFeatureSelect).toHaveBeenCalledWith(singleFeature.values_);
    expect(scrollToElement).toHaveBeenCalledWith('ol-map-container');
  });

  it('selects a single feature and changes window.location when hideFilters=true', () => {
    const onFeatureSelect = jest.fn();
    const singleFeature = { values_: { path: '/go-here', geometry: {} } };
    delete window.location;
    window.location = { href: '' };

    render(
      <FeatureInteraction
        onFeatureSelect={onFeatureSelect}
        hideFilters={true}
        selectedCase={null}
        ol={mockOl}
      />,
    );

    triggerSelectEvent([singleFeature]);

    expect(window.location.href).toContain('/go-here');
  });

  it('selects multiple features and calls zoomMapToFeatures', () => {
    const onFeatureSelect = jest.fn();
    const subfeatures = [
      { values_: { path: '/f1' } },
      { values_: { path: '/f2' } },
    ];

    render(
      <FeatureInteraction
        onFeatureSelect={onFeatureSelect}
        hideFilters={false}
        selectedCase={null}
        ol={mockOl}
      />,
    );

    triggerSelectEvent(subfeatures);

    expect(onFeatureSelect).toHaveBeenCalledWith(null);
    expect(zoomMapToFeatures).toHaveBeenCalledWith({
      map: mockMap,
      features: subfeatures,
      ol: mockOl,
    });
  });

  it('adds and removes interaction on mount/unmount', () => {
    const { unmount } = render(
      <FeatureInteraction
        onFeatureSelect={jest.fn()}
        hideFilters={false}
        selectedCase={null}
        ol={mockOl}
      />,
    );

    expect(addInteraction).toHaveBeenCalled();
    unmount();
    expect(removeInteraction).toHaveBeenCalled();
  });
});
