import './mockJsdom';
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { IntlProvider } from 'react-intl';

import FilterPanel from './FilterPanel';
import { EMPTY_FILTERS } from './filters';

const facets = {
  legislation: [
    {
      value: 'Article 4 - Terrestrial',
      label: 'Article 4 - Terrestrial',
      count: 20,
    },
  ],
  ecosystem: [{ value: 'Grassland', label: 'Grassland', count: 18 }],
  bioregion: [{ value: 'Atlantic', label: 'Atlantic', count: 30 }],
  scale: [{ value: 'National Scale', label: 'National Scale', count: 25 }],
  status: [
    { value: 'planned', label: 'planned', count: 12 },
    { value: 'ongoing', label: 'ongoing', count: 74 },
    { value: 'completed', label: 'completed', count: 42 },
  ],
};

const renderPanel = (props = {}) =>
  render(
    <IntlProvider locale="en">
      <FilterPanel
        facets={facets}
        filters={EMPTY_FILTERS}
        onToggle={jest.fn()}
        onQueryChange={jest.fn()}
        onReset={jest.fn()}
        {...props}
      />
    </IntlProvider>,
  );

describe('FilterPanel', () => {
  test('renders the title, the search field and every facet', () => {
    renderPanel();

    expect(screen.getByText('Filter and explore')).toBeInTheDocument();
    expect(
      screen.getByRole('searchbox', { name: /Search measures and typology/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Measure or typology/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Legislation/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Habitat\/ecosystem/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Biogeographical region/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Scale of planning/i }),
    ).toBeInTheDocument();
  });

  test('renders no Apply button - changes take effect immediately', () => {
    renderPanel();

    expect(
      screen.queryByRole('button', { name: /Apply filters/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Filters changed/)).not.toBeInTheDocument();
  });

  test('renders the three status toggles with counts, nothing pressed', () => {
    renderPanel();

    expect(screen.getByRole('button', { name: /Planned/ })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(screen.getByRole('button', { name: /Ongoing/ })).toHaveTextContent(
      '74',
    );
    expect(
      screen.getByRole('button', { name: /Completed/ }),
    ).toBeInTheDocument();
  });

  test('reports free-text searches through onQueryChange', () => {
    const onQueryChange = jest.fn();
    renderPanel({ onQueryChange });

    fireEvent.change(
      screen.getByRole('searchbox', { name: /Search measures and typology/i }),
      { target: { value: 'restore rivers' } },
    );

    expect(onQueryChange).toHaveBeenCalledWith('restore rivers');
  });

  test('offers a clear button only while the search has a value', () => {
    const onQueryChange = jest.fn();
    const { rerender } = renderPanel();
    expect(
      screen.queryByRole('button', { name: 'Clear the search' }),
    ).not.toBeInTheDocument();

    rerender(
      <IntlProvider locale="en">
        <FilterPanel
          facets={facets}
          filters={{ ...EMPTY_FILTERS, query: 'peat' }}
          onToggle={jest.fn()}
          onQueryChange={onQueryChange}
          onReset={jest.fn()}
        />
      </IntlProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Clear the search' }));

    expect(onQueryChange).toHaveBeenCalledWith('');
  });

  test('toggles a status filter through onToggle', () => {
    const onToggle = jest.fn();
    renderPanel({ onToggle });

    fireEvent.click(screen.getByRole('button', { name: /Planned/ }));

    expect(onToggle).toHaveBeenCalledWith('status', 'planned');
  });

  test('marks a selected status as pressed', () => {
    renderPanel({ filters: { ...EMPTY_FILTERS, status: ['ongoing'] } });

    expect(screen.getByRole('button', { name: /Ongoing/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  test('opens a dropdown and toggles an option', () => {
    const onToggle = jest.fn();
    renderPanel({ onToggle });

    fireEvent.click(screen.getByRole('button', { name: /Legislation/i }));
    fireEvent.click(screen.getByLabelText(/Article 4 - Terrestrial/));

    expect(onToggle).toHaveBeenCalledWith(
      'legislation',
      'Article 4 - Terrestrial',
    );
  });

  test('disables Reset when no filter is selected', () => {
    renderPanel();
    expect(
      screen.getByRole('button', { name: /Reset filters/ }),
    ).toBeDisabled();
  });

  test('enables Reset as soon as one filter is selected', () => {
    renderPanel({ filters: { ...EMPTY_FILTERS, status: ['planned'] } });
    expect(screen.getByRole('button', { name: /Reset filters/ })).toBeEnabled();
  });

  test('calls onReset', () => {
    const onReset = jest.fn();
    renderPanel({
      filters: { ...EMPTY_FILTERS, status: ['planned'] },
      onReset,
    });

    fireEvent.click(screen.getByRole('button', { name: /Reset filters/ }));

    expect(onReset).toHaveBeenCalled();
  });
});
