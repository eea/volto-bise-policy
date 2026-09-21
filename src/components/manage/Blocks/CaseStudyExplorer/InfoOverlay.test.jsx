import React from 'react';
import { render } from '@testing-library/react';
import InfoOverlay from './InfoOverlay';
import '@testing-library/jest-dom';

jest.mock('@eeacms/volto-openlayers-map', () => ({
  withOpenLayers: (Comp) => Comp,
}));

const onMap = jest.fn();
const unMap = jest.fn();
const addOverlay = jest.fn();
const removeOverlay = jest.fn();
jest.mock('@eeacms/volto-openlayers-map/api', () => ({
  useMapContext: () => ({
    map: mockMap,
  }),
}));

jest.mock('./FeatureDisplay', () => () => (
  <div data-testid="feature-display" />
));

const mockAddOverlayInstance = {};
jest.mock('ol/Overlay', () => {
  return jest.fn().mockImplementation((config) => {
    return { ...mockAddOverlayInstance, element: config.element };
  });
});

const mockOl = {
  Overlay: jest.fn((config) => ({
    element: config.element,
    setPosition: jest.fn(),
  })),
};

const mockMap = {
  on: onMap,
  un: unMap,
  addOverlay,
  removeOverlay,
};

jest.mock('@plone/volto/helpers/Utils/usePrevious', () => ({
  usePrevious: (val) => undefined,
}));

const defaultProps = {
  layerId: 'layer1',
  hideFilters: false,
  ol: mockOl,
  onFeatureSelect: jest.fn(),
};

describe('InfoOverlay', () => {
  let overlayElement;
  beforeEach(() => {
    jest.clearAllMocks();
    overlayElement = document.createElement('div');
    overlayElement.id = 'popup-overlay';
    document.body.appendChild(overlayElement);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders FeatureDisplay when selectedFeature is provided', () => {
    const { getByTestId } = render(
      <InfoOverlay {...defaultProps} selectedFeature={{ id: 1 }} />,
    );
    expect(getByTestId('feature-display')).toBeInTheDocument();
  });

  it('does not render FeatureDisplay when selectedFeature is null', () => {
    const { queryByTestId } = render(
      <InfoOverlay {...defaultProps} selectedFeature={null} />,
    );
    expect(queryByTestId('feature-display')).toBeNull();
  });

  it('attaches and detaches click handler on map', () => {
    const { unmount } = render(
      <InfoOverlay {...defaultProps} selectedFeature={null} />,
    );
    expect(addOverlay).toHaveBeenCalled();
    expect(onMap).toHaveBeenCalledWith('click', expect.any(Function));

    unmount();
    expect(unMap).toHaveBeenCalledWith('click', expect.any(Function));
    expect(removeOverlay).toHaveBeenCalled();
  });

  it('click handler hides tooltip when no features found', () => {
    const onFeatureSelect = jest.fn();
    render(
      <InfoOverlay
        {...defaultProps}
        selectedFeature={{}}
        onFeatureSelect={onFeatureSelect}
      />,
    );

    const handler = onMap.mock.calls.find(([event]) => event === 'click')[1];

    const evt = {
      pixel: [0, 0],
      target: { getFeaturesAtPixel: () => [] },
      originalEvent: { target: { tagName: 'DIV' } },
    };
    handler(evt);

    expect(onFeatureSelect).toHaveBeenCalledWith(null);
    const overlay = mockOl.Overlay.mock.results[0].value;
    expect(overlay.element.style.display).toBe('none');
  });

  it('ignores click when target is a link (A tag)', () => {
    const onFeatureSelect = jest.fn();
    render(
      <InfoOverlay
        {...defaultProps}
        selectedFeature={{}}
        onFeatureSelect={onFeatureSelect}
      />,
    );

    const handler = onMap.mock.calls.find(([event]) => event === 'click')[1];

    const evt = {
      pixel: [0, 0],
      target: { getFeaturesAtPixel: () => [] },
      originalEvent: { target: { tagName: 'A' } },
    };
    handler(evt);

    expect(onFeatureSelect).not.toHaveBeenCalled();
  });

  it('positions the overlay over the selected feature', () => {
    render(
      <InfoOverlay
        {...defaultProps}
        selectedFeature={{ geometry: { flatCoordinates: [10, 20] } }}
      />,
    );

    const overlay = mockOl.Overlay.mock.results[0].value;
    expect(overlay.setPosition).toHaveBeenCalledWith([10, 20]);
  });

  it('clears the overlay position when no feature is selected', () => {
    render(<InfoOverlay {...defaultProps} selectedFeature={null} />);

    const overlay = mockOl.Overlay.mock.results[0].value;
    expect(overlay.setPosition).toHaveBeenCalledWith(undefined);
  });
});
