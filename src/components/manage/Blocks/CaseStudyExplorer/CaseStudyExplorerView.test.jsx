import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { useCases } from './hooks';
import CaseStudyExplorerView from './CaseStudyExplorerView';

jest.mock('@plone/volto/helpers', () => ({
  addAppURL: jest.fn((url) => url),
}));

jest.mock('@plone/volto/registry', () => ({
  __esModule: true,
  default: {
    settings: { prefixPath: '' },
  },
}));

jest.mock('./CaseStudyMap', () =>
  jest.fn(() => <div id="case-study-map-mock">CaseStudyMapMock</div>),
);

jest.mock('./CaseStudyFilters', () => ({
  ActiveFilters: jest.fn(() => (
    <div id="active-filters-mock">ActiveFiltersMock</div>
  )),
  CaseStudyFilters: jest.fn(() => (
    <div id="case-study-fiters-mock">CaseStudyFiltersMock</div>
  )),
  SearchBox: jest.fn(() => <div id="search-box-mock">SearchBoxMock</div>),
}));

jest.mock('./utils', () => ({
  filterCases: jest.fn(() => [{ id: 1, title: 'Filtered Case' }]),
  getFilters: jest.fn(() => ['filter1', 'filter2']),
}));

jest.mock('./hooks', () => ({
  useCases: jest.fn(),
}));

beforeAll(() => {
  global.__SERVER__ = false;
});

describe('CaseStudyExplorerView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders filters and map when there are cases', () => {
    useCases.mockReturnValue([{ id: 1, title: 'Test Case' }]);

    const { container } = render(<CaseStudyExplorerView />);

    expect(container.querySelector('#search-box-mock')).toBeInTheDocument();
    expect(container.querySelector('#active-filters-mock')).toBeInTheDocument();
    expect(
      container.querySelector('#case-study-fiters-mock'),
    ).toBeInTheDocument();
    expect(container.querySelector('#case-study-map-mock')).toBeInTheDocument();
  });

  it('hides filters when caseStudiesIds is provided', () => {
    useCases.mockReturnValue([{ id: 1, title: 'Test Case' }]);

    const { container } = render(
      <CaseStudyExplorerView caseStudiesIds={[1, 2]} />,
    );

    expect(container.querySelector('#search-box-mock')).not.toBeInTheDocument();
    expect(
      container.querySelector('#active-filters-mock'),
    ).not.toBeInTheDocument();
    expect(
      container.querySelector('#case-study-fiters-mock'),
    ).not.toBeInTheDocument();
    expect(container.querySelector('#case-study-map-mock')).toBeInTheDocument();
  });

  it('does not render map when there are no cases', () => {
    useCases.mockReturnValue([]);

    const { container } = render(<CaseStudyExplorerView />);

    expect(
      container.querySelector('#case-study-map-mock'),
    ).not.toBeInTheDocument();
  });
});
