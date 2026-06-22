import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CaseStudyMap from './CaseStudyMap';
import { getFeatures, centerAndResetMapZoom, scrollToElement } from './utils';
import { createMockMap, createMockOl } from './testUtils';

jest.mock('@eeacms/volto-openlayers-map', () => ({
  withOpenLayers: (Comp) => Comp,
}));

jest.mock('@eeacms/volto-openlayers-map/api', () => ({
  Map: ({ children }) => <div data-testid="mock-map">{children}</div>,
  Layer: {
    Tile: ({ source }) => <div data-testid="mock-tile-layer" />,
    Vector: ({ source }) => <div data-testid="mock-vector-layer" />,
  },
  Layers: ({ children }) => <div data-testid="mock-layers">{children}</div>,
  Controls: () => <div data-testid="mock-controls" />,
  useMapContext: () => ({ map: mockMap }),
}));

// Mock child components so we don't render full DOM
jest.mock('./InfoOverlay', () => () => <div data-testid="mock-info-overlay" />);
jest.mock('./FeatureInteraction', () => () => (
  <div data-testid="mock-feature-interaction" />
));
jest.mock('./CaseStudyListing', () => () => (
  <div data-testid="mock-case-study-list" />
));

jest.mock('./utils', () => ({
  getFeatures: jest.fn(),
  centerAndResetMapZoom: jest.fn(),
  scrollToElement: jest.fn(),
}));

const mockOl = createMockOl();
const mockMap = createMockMap();

describe('CaseStudyMap', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when no features', () => {
    getFeatures.mockReturnValueOnce([]);
    const { container } = render(
      <CaseStudyMap items={[]} ol={mockOl} setMap={jest.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders map and layers when features exist', () => {
    getFeatures.mockReturnValueOnce([{ id: 1 }]);
    render(
      <CaseStudyMap
        items={[{ id: 1 }]}
        ol={mockOl}
        setMap={jest.fn()}
        map={mockMap}
        onSelectedCase={jest.fn()}
      />,
    );
    expect(screen.getByTestId('mock-map')).toBeInTheDocument();
    expect(screen.getByTestId('mock-tile-layer')).toBeInTheDocument();
    expect(screen.getByTestId('mock-vector-layer')).toBeInTheDocument();
    expect(screen.getByTestId('mock-case-study-list')).toBeInTheDocument();
  });

  it('does not render CaseStudyList when hideFilters is true', () => {
    getFeatures.mockReturnValueOnce([{ id: 1 }]);
    render(
      <CaseStudyMap
        items={[{ id: 1 }]}
        ol={mockOl}
        hideFilters
        setMap={jest.fn()}
        map={mockMap}
        onSelectedCase={jest.fn()}
      />,
    );
    expect(
      screen.queryByTestId('mock-case-study-list'),
    ).not.toBeInTheDocument();
  });

  it('clicking Reset map calls utils and clears features', () => {
    getFeatures.mockReturnValueOnce([{ id: 1 }]);
    const onSelectedCase = jest.fn();
    render(
      <CaseStudyMap
        items={[{ id: 1 }]}
        ol={mockOl}
        setMap={jest.fn()}
        map={mockMap}
        onSelectedCase={onSelectedCase}
      />,
    );

    fireEvent.click(screen.getByText('Reset map'));
    expect(scrollToElement).toHaveBeenCalledWith('search-input');
    expect(onSelectedCase).toHaveBeenCalledWith(null);
    expect(centerAndResetMapZoom).toHaveBeenCalledWith({
      map: mockMap,
      ol: mockOl,
    });
  });

  it('map moveend listener toggles resetMapButtonClass', () => {
    getFeatures.mockReturnValueOnce([{ id: 1 }]);
    render(
      <CaseStudyMap
        items={[{ id: 1 }]}
        ol={mockOl}
        setMap={jest.fn()}
        map={mockMap}
        onSelectedCase={jest.fn()}
      />,
    );

    const moveendCb = mockMap.on.mock.calls.find((c) => c[0] === 'moveend')[1];

    moveendCb();

    expect(mockMap.getView).toHaveBeenCalled();
  });
});
