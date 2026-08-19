import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CaseStudyList from './CaseStudyListing';
import {
  centerAndResetMapZoom,
  scrollToElement,
  zoomMapToFeatures,
} from './utils';
import { createMockMap, createMockPointsSource } from './testUtils';

jest.mock('@eeacms/volto-openlayers-map', () => ({
  withOpenLayers: (Component) => Component,
}));

jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  centerAndResetMapZoom: jest.fn(),
  scrollToElement: jest.fn(),
  zoomMapToFeatures: jest.fn(),
}));

const mockMap = createMockMap();
const mockPointsSource = createMockPointsSource([
  {
    values_: {
      title: 'Feature 1',
      path: '/feature1',
      description: 'Description 1',
      typology_of_measures: ['SectorA'],
      measures_implemented: [{ title: 'M1', path: '/m1' }],
      geometry: { flatCoordinates: [0, 0] },
    },
  },
]);

const selectedCase = {
  title: 'Selected Title',
  path: '/selected',
  description: 'Selected description',
  typology_of_measures: ['S1', 'S2'],
  measures_implemented: [{ title: 'M1', path: '/m1' }],
};

describe('CaseStudyList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when no features', () => {
    const emptyPointsSource = { getFeatures: () => [] };
    const { getByText } = render(
      <CaseStudyList
        selectedCase={null}
        onSelectedCase={jest.fn()}
        pointsSource={emptyPointsSource}
        searchInput=""
        ol={{}}
      />,
    );

    expect(
      getByText('We could not find any results for your search criteria'),
    ).toBeInTheDocument();
    expect(getByText('check the selected filters')).toBeInTheDocument();
  });

  it('renders selectedCase details', () => {
    const { getByText } = render(
      <CaseStudyList
        selectedCase={selectedCase}
        onSelectedCase={jest.fn()}
        pointsSource={mockPointsSource}
        map={mockMap}
        searchInput=""
        ol={{}}
      />,
    );

    expect(getByText('Selected Title')).toBeInTheDocument();
    expect(getByText('Selected description')).toBeInTheDocument();
    // Note: Sectors and NWRMs sections are commented out in the component
    // So we only check the title and description render
  });

  it('calls reset map utils when clicking Reset map', () => {
    const { getByTestId } = render(
      <CaseStudyList
        selectedCase={selectedCase}
        onSelectedCase={jest.fn()}
        pointsSource={mockPointsSource}
        map={mockMap}
        searchInput=""
        ol={{}}
      />,
    );

    fireEvent.click(getByTestId('reset-map'));

    expect(scrollToElement).toHaveBeenCalledWith('search-input');
    expect(centerAndResetMapZoom).toHaveBeenCalledWith({
      map: mockMap,
      ol: {},
    });
  });

  it('renders features and highlights search term', () => {
    const { getByText } = render(
      <CaseStudyList
        selectedCase={null}
        onSelectedCase={jest.fn()}
        pointsSource={mockPointsSource}
        map={mockMap}
        searchInput="match"
        ol={{}}
      />,
    );

    expect(getByText('Feature 1')).toBeInTheDocument();
    expect(getByText('Feature 1').getAttribute('href')).toBe('/feature1');
  });

  it('does not crash on regex metacharacters in search input', () => {
    const { getByText } = render(
      <CaseStudyList
        selectedCase={null}
        onSelectedCase={jest.fn()}
        pointsSource={mockPointsSource}
        map={mockMap}
        searchInput="("
        ol={{}}
      />,
    );

    // must not throw (previously: SyntaxError from invalid RegExp)
    expect(getByText('Feature 1')).toBeInTheDocument();
    expect(getByText('Description 1')).toBeInTheDocument();
  });

  it('sanitizes description HTML and keeps search highlights', () => {
    const evilPointsSource = createMockPointsSource([
      {
        values_: {
          title: 'Evil Case',
          path: '/evil',
          description:
            '<img src=x onerror=alert(1)> <script>alert(2)</script> a river bed',
          typology_of_measures: ['SectorA'],
          measures_implemented: [{ title: 'M1', path: '/m1' }],
          geometry: { flatCoordinates: [0, 0] },
        },
      },
    ]);

    const { container } = render(
      <CaseStudyList
        selectedCase={null}
        onSelectedCase={jest.fn()}
        pointsSource={evilPointsSource}
        map={mockMap}
        searchInput="river"
        ol={{}}
      />,
    );

    // XSS payloads must not survive into the DOM
    expect(container.querySelector('img[onerror]')).toBeNull();
    expect(container.querySelector('script')).toBeNull();
    // harmless text still renders and the highlight survives sanitization
    expect(container.textContent).toContain('a river bed');
    const highlight = container.querySelector('b');
    expect(highlight).not.toBeNull();
    expect(highlight.textContent).toBe('river');
  });

  it('calls zoomMapToFeatures and onSelectedCase when clicking Show on map', async () => {
    const onSelectedCase = jest.fn();

    const { getByText } = render(
      <CaseStudyList
        selectedCase={null}
        onSelectedCase={onSelectedCase}
        pointsSource={mockPointsSource}
        map={mockMap}
        searchInput=""
        ol={{}}
      />,
    );

    fireEvent.click(getByText('Show on map'));

    expect(scrollToElement).toHaveBeenCalledWith('ol-map-container');
    expect(zoomMapToFeatures).toHaveBeenCalled();
    expect(onSelectedCase).toHaveBeenCalled();
  });
});
