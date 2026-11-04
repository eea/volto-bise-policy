import './mockJsdom';
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { IntlProvider } from 'react-intl';

import CaseStudyExplorerView from './CaseStudyExplorerView';
import { useCases } from './hooks';

global.__SERVER__ = false;

jest.mock('./hooks', () => ({
  useCases: jest.fn(),
}));

// The real map needs OpenLayers: stand in for it with one button per item so
// tests can select a case study the way a map click would.
jest.mock('./CaseStudyMapLazy', () => ({ items, onSelect }) => (
  <div data-testid="case-study-map">
    {items.map((item) => (
      <button
        type="button"
        key={item.properties.path}
        onClick={() => onSelect(item.properties.path)}
      >
        {`Map pin: ${item.properties.title}`}
      </button>
    ))}
  </div>
));

const cases = [
  {
    geometry: { type: 'Point', coordinates: [14.4, 50.1] },
    properties: {
      title: 'Peatland rewetting',
      path: '/case-peatland',
      current_status: 'ongoing',
      nrr_legislation: ['Article 4 - Terrestrial'],
      typology: [{ code: 'NRPM_001', family: 'MA', title: 'Rewetting' }],
      habitat_ecosystem_type: ['Inland wetlands'],
      measures: [{ id: 'm-a', title: 'Restore peatlands', path: '/m/a' }],
      effective: '2026-02-11T09:36:06+00:00',
    },
  },
  {
    geometry: { type: 'Point', coordinates: [10.4, 51.1] },
    properties: {
      title: 'River connectivity',
      path: '/case-rivers',
      current_status: 'completed',
      nrr_legislation: ['Article 9 - Rivers'],
      habitat_ecosystem_type: ['Rivers and canals'],
      measures: [{ id: 'm-b', title: 'Restore rivers', path: '/m/b' }],
      effective: '2026-01-02T00:00:00+00:00',
    },
  },
];

const renderView = (props = {}) =>
  render(
    <IntlProvider locale="en">
      <CaseStudyExplorerView {...props} />
    </IntlProvider>,
  );

describe('CaseStudyExplorerView', () => {
  beforeEach(() => {
    useCases.mockReturnValue({ cases, loading: false, error: false });
  });

  test('shows a loader while the case studies are being fetched', () => {
    useCases.mockReturnValue({ cases: [], loading: true, error: false });

    renderView();

    expect(screen.getByRole('status')).toHaveTextContent(
      'Loading case studies',
    );
    expect(screen.queryByTestId('case-study-map')).not.toBeInTheDocument();
    expect(
      screen.queryByText(/No case studies match your filters/),
    ).not.toBeInTheDocument();
  });

  test('offers a retry when the case studies cannot be loaded', () => {
    const reload = jest.fn();
    useCases.mockReturnValue({
      cases: [],
      loading: false,
      error: true,
      reload,
    });

    renderView();

    expect(screen.getByRole('alert')).toHaveTextContent(
      'The case studies could not be loaded.',
    );

    fireEvent.click(screen.getByRole('button', { name: /Try again/ }));
    expect(reload).toHaveBeenCalled();
  });

  test('renders the filter panel, the map and both results', () => {
    renderView();

    expect(screen.getByText('Filter and explore')).toBeInTheDocument();
    expect(screen.getByTestId('case-study-map')).toBeInTheDocument();
    expect(screen.getByText('Showing 2 case studies')).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(2);
  });

  test('applies a filter as soon as it is toggled', () => {
    renderView();

    expect(screen.getByText('Showing 2 case studies')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Ongoing/ }));

    expect(screen.getByText('Showing 1 case study')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ongoing/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  test('searches the measures and the typology as free text', () => {
    renderView();
    const search = screen.getByRole('searchbox', {
      name: /Search measures and typology/i,
    });

    fireEvent.change(search, { target: { value: 'restore rivers' } });
    expect(screen.getByText('Showing 1 case study')).toBeInTheDocument();
    expect(screen.getByText('River connectivity')).toBeInTheDocument();

    fireEvent.change(search, { target: { value: 'nrpm_001' } });
    expect(screen.getByText('Showing 1 case study')).toBeInTheDocument();
    expect(screen.getByText('Peatland rewetting')).toBeInTheDocument();

    fireEvent.change(search, { target: { value: 'nothing matches this' } });
    expect(
      screen.getByText('No case studies match your filters'),
    ).toBeInTheDocument();
  });

  test('resets the filters', () => {
    renderView();

    fireEvent.click(screen.getByRole('button', { name: /Ongoing/ }));
    expect(screen.getByText('Showing 1 case study')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Reset filters/ }));

    expect(screen.getByText('Showing 2 case studies')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ongoing/ })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  test('turns "Show on map" into "Reset map" on the selected card', () => {
    renderView();

    const [card] = screen.getAllByRole('article');
    fireEvent.click(within(card).getByRole('button', { name: 'Show on map' }));

    expect(card).toHaveAttribute('data-selected', 'true');
    expect(
      within(card).queryByRole('button', { name: 'Show on map' }),
    ).toBeNull();

    fireEvent.click(within(card).getByRole('button', { name: 'Reset map' }));

    expect(card).not.toHaveAttribute('data-selected');
    expect(
      within(card).getByRole('button', { name: 'Show on map' }),
    ).toBeInTheDocument();
  });

  test('jumps to the page that holds a case study selected on the map', () => {
    const withTitle = (title, path) => ({
      geometry: { type: 'Point', coordinates: [14.4, 50.1] },
      properties: { title, path, current_status: 'ongoing' },
    });
    useCases.mockReturnValue({
      cases: [
        withTitle('Alpine meadows', '/case-alpine'),
        withTitle('Boreal forest', '/case-boreal'),
        withTitle('Coastal dunes', '/case-coastal'),
        withTitle('Peatland rewetting', '/case-peatland'),
        withTitle('River connectivity', '/case-rivers'),
      ],
      loading: false,
      error: false,
    });

    renderView();

    // Four cards per page: the last case study is on page 2.
    expect(screen.queryByText('River connectivity')).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: 'Map pin: River connectivity' }),
    );

    expect(screen.getByText('River connectivity')).toBeInTheDocument();
    expect(screen.getByRole('article')).toHaveAttribute(
      'data-selected',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  test('sorts by newest using the effective date', () => {
    renderView();

    fireEvent.change(screen.getByLabelText('Sort by'), {
      target: { value: 'newest' },
    });

    const cards = screen.getAllByRole('article');
    expect(
      within(cards[0]).getByText('Peatland rewetting'),
    ).toBeInTheDocument();
  });

  test('narrows the results to the case studies of one measure', () => {
    renderView({ data: { filter_path: '/case-rivers' } });

    expect(screen.getByText('Showing 1 case study')).toBeInTheDocument();
  });
});
