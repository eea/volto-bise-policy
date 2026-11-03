import './mockJsdom';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from 'react-intl';

import CaseStudyMap from './CaseStudyMap';
import { centerAndResetMapZoom, getFeatures } from './utils';
import { createMockMap, createMockOl } from './testUtils';

jest.mock('@eeacms/volto-openlayers-map', () => ({
  withOpenLayers: (Component) => Component,
}));

const mockMap = createMockMap();

jest.mock('@eeacms/volto-openlayers-map/api', () => ({
  Map: ({ children }) => <div data-testid="mock-map">{children}</div>,
  Layer: {
    Tile: () => <div data-testid="mock-tile-layer" />,
    Vector: () => <div data-testid="mock-vector-layer" />,
  },
  Layers: ({ children }) => <div data-testid="mock-layers">{children}</div>,
  Controls: () => <div data-testid="mock-controls" />,
  useMapContext: () => ({ map: mockMap }),
}));

jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  centerAndResetMapZoom: jest.fn(),
  getFeatures: jest.fn(),
}));

const mockOl = {
  ...createMockOl(),
  extent: {
    createEmpty: () => [Infinity, Infinity, -Infinity, -Infinity],
    extend: jest.fn(),
  },
};

const items = [
  {
    geometry: { type: 'Point', coordinates: [14.4, 50.1] },
    properties: {
      title: 'Peatlands',
      path: '/case-peatlands',
      current_status: 'ongoing',
    },
  },
  {
    geometry: { type: 'Point', coordinates: [10.4, 51.1] },
    properties: {
      title: 'Rivers',
      path: '/case-rivers',
      current_status: 'completed',
    },
  },
];

const renderMap = (props = {}) =>
  render(
    <IntlProvider locale="en">
      <CaseStudyMap
        items={items}
        setMap={jest.fn()}
        map={mockMap}
        ol={mockOl}
        onSelect={jest.fn()}
        {...props}
      />
    </IntlProvider>,
  );

const mapClickHandler = () => {
  const calls = mockMap.on.mock.calls.filter(([event]) => event === 'click');
  return calls[calls.length - 1][1];
};

describe('CaseStudyMap', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getFeatures.mockReturnValue([{ id: 1 }]);
  });

  test('renders nothing without features', () => {
    getFeatures.mockReturnValueOnce([]);
    const { container } = renderMap({ items: [] });

    expect(container.firstChild).toBeNull();
  });

  test('renders the map, layers and the status legend', () => {
    renderMap();

    expect(screen.getByTestId('mock-map')).toBeInTheDocument();
    expect(screen.getByTestId('mock-tile-layer')).toBeInTheDocument();
    expect(screen.getByTestId('mock-vector-layer')).toBeInTheDocument();
    expect(screen.getByText('Planned')).toBeInTheDocument();
    expect(screen.getByText('Ongoing')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  test('selects a case study when its pin is clicked', () => {
    const onSelect = jest.fn();
    renderMap({ onSelect });

    const member = {
      get: (key) => (key === 'path' ? '/case-peatlands' : null),
    };
    const cluster = { get: (key) => (key === 'features' ? [member] : null) };
    mockMap.forEachFeatureAtPixel = jest.fn(() => cluster);

    mapClickHandler()({ pixel: [10, 20] });

    expect(onSelect).toHaveBeenCalledWith('/case-peatlands');
  });

  test('zooms instead of guessing when a cluster is clicked', () => {
    const onSelect = jest.fn();
    renderMap({ onSelect });

    const member = {
      getGeometry: () => ({ getExtent: () => [0, 0, 1, 1] }),
    };
    const cluster = {
      get: (key) => (key === 'features' ? [member, member] : null),
    };
    mockMap.forEachFeatureAtPixel = jest.fn(() => cluster);

    mapClickHandler()({ pixel: [10, 20] });

    expect(onSelect).toHaveBeenCalledWith(null);
    expect(mockMap.getView().fit).toHaveBeenCalled();
  });

  test('clears the selection when empty map space is clicked', () => {
    const onSelect = jest.fn();
    renderMap({ onSelect });

    mockMap.forEachFeatureAtPixel = jest.fn(() => null);
    mapClickHandler()({ pixel: [10, 20] });

    expect(onSelect).toHaveBeenCalledWith(null);
  });

  test('keeps the loader up until OpenLayers finishes rendering', () => {
    renderMap();

    expect(screen.getByRole('status')).toHaveTextContent('Loading map');

    const renderComplete = mockMap.on.mock.calls
      .filter(([event]) => event === 'rendercomplete')
      .pop()[1];
    act(() => renderComplete());

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  test('removes the render listener once the map is ready', () => {
    renderMap();

    const renderComplete = mockMap.on.mock.calls
      .filter(([event]) => event === 'rendercomplete')
      .pop()[1];
    act(() => renderComplete());

    expect(mockMap.un).toHaveBeenCalledWith('rendercomplete', renderComplete);
  });

  test('resets the map and clears the selection', () => {
    const onSelect = jest.fn();
    renderMap({ onSelect });

    fireEvent.click(screen.getByRole('button', { name: /Reset map/ }));

    expect(onSelect).toHaveBeenCalledWith(null);
    expect(centerAndResetMapZoom).toHaveBeenCalled();
  });
});
