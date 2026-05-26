import './mockJsdom';
import React from 'react';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';

import {
  CaseStudyFilters,
  ActiveFilters,
  SearchBox,
  CaseStudyFilter,
} from './CaseStudyFilters';
import { createMockFilters } from './testUtils';

jest.mock('@eeacms/volto-openlayers-map', () => ({
  openlayers: {
    proj: {
      transform: jest.fn().mockReturnValue([0, 0]),
    },
  },
  withOpenLayers: (Component) => (props) => (
    <Component
      {...props}
      ol={{
        proj: {
          transform: jest.fn().mockReturnValue([0, 0]),
        },
      }}
    />
  ),
}));

window.URL.createObjectURL = function () {};
global.URL.createObjectURL = jest.fn();

const mockFilters = createMockFilters();
const mockSetActiveFilters = jest.fn();

describe('CaseStudyFilters', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <CaseStudyFilters
        filters={mockFilters}
        activeFilters={{ measures_implemented: [], typology_of_measures: [] }}
        setActiveFilters={mockSetActiveFilters}
      />,
    );

    expect(container).toBeTruthy();
  });
});

describe('ActiveFilters', () => {
  it('renders without crashing', () => {
    render(
      <ActiveFilters
        filters={mockFilters}
        activeFilters={{ measures_implemented: [], typology_of_measures: [] }}
        setActiveFilters={mockSetActiveFilters}
      />,
    );
  });
});

describe('SearchBox', () => {
  it('renders without crashing', () => {
    render(
      <SearchBox
        filters={mockFilters}
        activeFilters={{ measures_implemented: [], typology_of_measures: [] }}
        setActiveFilters={mockSetActiveFilters}
        searchInput="bise"
        setSearchInput={jest.fn()}
      />,
    );
  });
});

describe('CaseStudyFilter', () => {
  it('renders without crashing', () => {
    render(
      <CaseStudyFilter
        filterTitle="Case study filter"
        filters={mockFilters}
        activeFilters={{ measures_implemented: [], typology_of_measures: [] }}
        setActiveFilters={mockSetActiveFilters}
        filterName="measures_implemented"
      />,
    );
  });
});
