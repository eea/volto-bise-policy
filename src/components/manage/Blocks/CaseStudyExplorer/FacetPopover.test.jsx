import './mockJsdom';
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { IntlProvider } from 'react-intl';

import FacetPopover, { filterOptions } from './FacetPopover';

const manyOptions = Array.from({ length: 9 }, (_, index) => ({
  value: `value-${index}`,
  label: `Option ${index}`,
  count: index,
}));

const renderPopover = (props = {}) =>
  render(
    <IntlProvider locale="en">
      <FacetPopover
        id="test"
        label="Legislation"
        groups={[{ facet: 'legislation', options: manyOptions }]}
        filters={{ legislation: [] }}
        onToggle={jest.fn()}
        {...props}
      />
    </IntlProvider>,
  );

describe('FacetPopover', () => {
  test('shows the facet label when nothing is selected', () => {
    renderPopover();
    expect(screen.getByRole('button')).toHaveTextContent('Legislation');
  });

  test('shows the single selected label', () => {
    renderPopover({ filters: { legislation: ['value-3'] } });
    expect(screen.getByRole('button')).toHaveTextContent('Option 3');
  });

  test('shows a count when several values are selected', () => {
    renderPopover({ filters: { legislation: ['value-1', 'value-2'] } });
    expect(screen.getByRole('button')).toHaveTextContent(
      'Legislation (2 selected)',
    );
  });

  test('is closed until the trigger is clicked', () => {
    renderPopover();
    expect(screen.queryByRole('group', { name: 'Legislation' })).toBeNull();

    fireEvent.click(screen.getByRole('button'));

    expect(
      screen.getByRole('group', { name: 'Legislation' }),
    ).toBeInTheDocument();
  });

  test('renders options with their counts and toggles them', () => {
    const onToggle = jest.fn();
    renderPopover({ onToggle });

    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByLabelText(/Option 0\b/)).toBeInTheDocument();
    expect(
      screen.getByText('(0)', { selector: '.facet-option-count' }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/Option 4\b/));

    expect(onToggle).toHaveBeenCalledWith('legislation', 'value-4');
  });

  test('filters options with the search box when there are many', () => {
    renderPopover();
    fireEvent.click(screen.getByRole('button'));
    fireEvent.change(screen.getByRole('searchbox'), {
      target: { value: 'option 7' },
    });

    expect(screen.getByLabelText(/Option 7\b/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Option 1\b/)).toBeNull();
  });

  test('shows the empty state when nothing matches', () => {
    renderPopover();
    fireEvent.click(screen.getByRole('button'));
    fireEvent.change(screen.getByRole('searchbox'), {
      target: { value: 'zzz' },
    });

    expect(screen.getByText('No matching values')).toBeInTheDocument();
  });

  test('hides the search box for short option lists', () => {
    renderPopover({
      groups: [{ facet: 'legislation', options: manyOptions.slice(0, 3) }],
    });
    fireEvent.click(screen.getByRole('button'));

    expect(screen.queryByRole('searchbox')).toBeNull();
  });

  test('closes on Escape and on an outside click', () => {
    renderPopover();
    fireEvent.click(screen.getByRole('button'));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('group', { name: 'Legislation' })).toBeNull();

    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(document.body);
    expect(screen.queryByRole('group', { name: 'Legislation' })).toBeNull();
  });

  test('filterOptions matches label, value and family', () => {
    const options = [
      { value: 'NRPM_001', label: 'Prevent conversion', family: 'MA' },
      { value: 'NRPM_020', label: 'Restore forest', family: 'MB' },
    ];

    expect(filterOptions(options, '')).toHaveLength(2);
    expect(filterOptions(options, 'ma')).toEqual([options[0]]);
    expect(filterOptions(options, 'nrpm_020')).toEqual([options[1]]);
    expect(filterOptions(options, 'forest')).toEqual([options[1]]);
  });
});
