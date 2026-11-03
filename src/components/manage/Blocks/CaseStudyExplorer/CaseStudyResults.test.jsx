import './mockJsdom';
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { IntlProvider } from 'react-intl';

import CaseStudyResults from './CaseStudyResults';
import Pagination, { paginationItems } from './Pagination';

const makeItem = (index) => ({
  geometry: { type: 'Point', coordinates: [0, 0] },
  properties: {
    title: `Case ${index}`,
    path: `/case-${index}`,
    current_status: 'ongoing',
    measures: [],
  },
});

const items = Array.from({ length: 12 }, (_, index) => makeItem(index + 1));

const renderResults = (props = {}) =>
  render(
    <IntlProvider locale="en">
      <CaseStudyResults
        items={items}
        sortBy="title"
        onSortChange={jest.fn()}
        perPage={10}
        onPerPageChange={jest.fn()}
        page={1}
        onPageChange={jest.fn()}
        {...props}
      />
    </IntlProvider>,
  );

describe('CaseStudyResults', () => {
  test('reports the total result count, not the page size', () => {
    renderResults();
    expect(screen.getByText('Showing 12 case studies')).toBeInTheDocument();
  });

  test('uses the singular form for one result', () => {
    renderResults({ items: items.slice(0, 1) });
    expect(screen.getByText('Showing 1 case study')).toBeInTheDocument();
  });

  test('renders only the current page of cards', () => {
    renderResults();
    expect(screen.getAllByRole('article')).toHaveLength(10);
  });

  test('renders the second page', () => {
    renderResults({ page: 2 });
    expect(screen.getAllByRole('article')).toHaveLength(2);
  });

  test('changes sort and page size', () => {
    const onSortChange = jest.fn();
    const onPerPageChange = jest.fn();
    renderResults({ onSortChange, onPerPageChange });

    fireEvent.change(screen.getByLabelText('Sort by'), {
      target: { value: 'newest' },
    });
    fireEvent.change(screen.getByLabelText('per page'), {
      target: { value: '24' },
    });

    expect(onSortChange).toHaveBeenCalledWith('newest');
    expect(onPerPageChange).toHaveBeenCalledWith(24);
  });

  test('shows an empty state with a reset action', () => {
    const onResetFilters = jest.fn();
    renderResults({ items: [], onResetFilters });

    expect(
      screen.getByText('No case studies match your filters'),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reset filters' }));

    expect(onResetFilters).toHaveBeenCalled();
  });

  test('marks the selected card', () => {
    renderResults({ selectedPath: '/case-3' });

    expect(
      screen
        .getAllByRole('article')
        .filter((card) => card.dataset.selected === 'true'),
    ).toHaveLength(1);
  });
});

describe('Pagination', () => {
  test('shows every page when the list is short', () => {
    expect(paginationItems(1, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  test('windows long lists with ellipsis markers', () => {
    expect(paginationItems(1, 20)).toEqual([1, 2, 'end-ellipsis', 20]);
    expect(paginationItems(10, 20)).toEqual([
      1,
      'start-ellipsis',
      9,
      10,
      11,
      'end-ellipsis',
      20,
    ]);
  });

  test('renders the current page and pages through', () => {
    const onPageChange = jest.fn();
    render(
      <IntlProvider locale="en">
        <Pagination page={2} pageCount={3} onPageChange={onPageChange} />
      </IntlProvider>,
    );

    expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute(
      'aria-current',
      'page',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  test('renders nothing for a single page', () => {
    const { container } = render(
      <IntlProvider locale="en">
        <Pagination page={1} pageCount={1} onPageChange={jest.fn()} />
      </IntlProvider>,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
