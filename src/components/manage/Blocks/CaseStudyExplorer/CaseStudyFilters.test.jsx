import './mockJsdom';
import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render } from '@testing-library/react';

import {
  CaseStudyFilters,
  ActiveFilters,
  SearchBox,
  CaseStudyFilter,
} from './CaseStudyFilters';

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

describe('CaseStudyFilters', () => {
  const mockSetActiveFilters = jest.fn();
  window.URL.createObjectURL = function () {};
  global.URL.createObjectURL = jest.fn();

  const mockFilters = {
    sectors: { sector1: 'Sector 1', sector2: 'Sector 2' },
  };

  it('renders without crashing', () => {
    const { container } = render(
      <CaseStudyFilters
        filters={mockFilters}
        activeFilters={{ sectors: [] }}
        setActiveFilters={mockSetActiveFilters}
      />,
    );

    // CaseStudyFilters component returns empty content (commented out filters)
    // Just verify it renders without error
    expect(container).toBeTruthy();
  });
});

describe('ActiveFilters', () => {
  const mockSetActiveFilters = jest.fn();
  const mockFilters = {
    sectors: { sector1: 'Sector 1', sector2: 'Sector 2' },
  };

  it('renders without crashing', () => {
    render(
      <ActiveFilters
        filters={mockFilters}
        activeFilters={{ sectors: [] }}
        setActiveFilters={mockSetActiveFilters}
      />,
    );
  });
});

describe('SearchBox', () => {
  const mockSetActiveFilters = jest.fn();
  const mockFilters = {
    sectors: { sector1: 'Sector 1', sector2: 'Sector 2' },
  };

  const mockSetSearchInput = jest.fn();
  const mockSearchInput = 'bise';

  it('renders without crashing', () => {
    render(
      <SearchBox
        filters={mockFilters}
        activeFilters={{ sectors: [] }}
        setActiveFilters={mockSetActiveFilters}
        searchInput={mockSearchInput}
        setSearchInput={mockSetSearchInput}
      />,
    );
  });
});

describe('CaseStudyFilter', () => {
  const mockSetActiveFilters = jest.fn();
  const mockFilters = {
    sectors: { sector1: 'Sector 1', sector2: 'Sector 2' },
  };

  it('renders without crashing', () => {
    render(
      <CaseStudyFilter
        filterTitle={'Case study filter'}
        filters={mockFilters}
        activeFilters={{ sectors: [] }}
        setActiveFilters={mockSetActiveFilters}
        filterName={'Filter name'}
      />,
    );
  });
});
