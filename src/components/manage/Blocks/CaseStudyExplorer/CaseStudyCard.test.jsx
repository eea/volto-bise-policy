import './mockJsdom';
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, within, fireEvent } from '@testing-library/react';
import { IntlProvider } from 'react-intl';

import CaseStudyCard from './CaseStudyCard';

const item = {
  geometry: { type: 'Point', coordinates: [14.4, 50.1] },
  properties: {
    title: 'Restored peatlands in the Bohemian Forest',
    path: '/catalogue/peatlands-bohemian-forest',
    image: 'https://example.com/image.jpg',
    current_status: 'ongoing',
    nrr_legislation: [
      'Article 4 - Restoration of terrestrial ecosystems',
      'Article 11 - Restoration of agricultural ecosystems',
      'Habitats Directive (HD)',
    ],
    habitat_ecosystem_type: [
      'Inland wetlands',
      'Forest and woodland',
      'Grassland (pastures, semi-natural and natural grasslands)',
    ],
    measures: [
      {
        id: 'measure-a',
        title: 'Restore degraded peatlands',
        path: '/catalogue/measures/restore-degraded-peatlands',
      },
      {
        id: 'measure-b',
        title: 'Rewetting of drained soils',
        path: '/catalogue/measures/re-wetting',
      },
      {
        id: 'measure-c',
        title: 'Restore rivers and floodplains',
        path: '/catalogue/measures/restore-rivers',
      },
    ],
  },
};

const renderCard = (props = {}) =>
  render(
    <IntlProvider locale="en">
      <CaseStudyCard item={item} {...props} />
    </IntlProvider>,
  );

describe('CaseStudyCard', () => {
  test('renders the title as a link to the case study, opening a new tab', () => {
    renderCard();

    const link = screen.getByRole('link', {
      name: /Restored peatlands in the Bohemian Forest/,
    });

    expect(link).toHaveAttribute('href', item.properties.path);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('renders the image with an empty alt (the title carries the meaning)', () => {
    renderCard();
    expect(screen.getByRole('img', { hidden: true })).toHaveAttribute(
      'alt',
      '',
    );
  });

  test('renders the status as a dot plus a readable label', () => {
    renderCard();

    expect(screen.getByText('Ongoing')).toBeInTheDocument();
    expect(document.querySelector('.cse-card-status-dot')).toHaveStyle({
      backgroundColor: '#ff9933',
    });
  });

  test('does not render the measure count in the meta row', () => {
    renderCard();

    expect(screen.getByText('Ongoing')).toBeInTheDocument();
    expect(screen.getByText('Habitats Directive (HD)')).toBeInTheDocument();
    expect(
      within(document.querySelector('.cse-card-meta')).queryByText(
        /NRR measures?$/,
      ),
    ).toBeNull();
    expect(screen.getAllByText('3', { exact: true })).toHaveLength(1);
  });

  test('truncates ecosystems and counts the hidden ones', () => {
    renderCard();

    expect(screen.getByText('Inland wetlands')).toBeInTheDocument();
    expect(screen.getByText('Forest and woodland')).toBeInTheDocument();
    expect(screen.queryByText(/^Grassland/)).toBeNull();
    expect(screen.getByText('+1')).toBeInTheDocument();
  });

  test('collapses the related measures behind a bar owning the count', () => {
    renderCard();

    const toggle = screen.getByRole('button', {
      name: /Related NRR measure(s)/,
    });

    expect(toggle).toHaveTextContent('Related NRR measure(s)');
    expect(toggle).toHaveTextContent('3');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('keeps the collapsed measures panel inert and out of the tab order', () => {
    renderCard();

    const toggle = screen.getByRole('button', {
      name: /Related NRR measure(s)/,
    });
    const panel = document.getElementById(toggle.getAttribute('aria-controls'));

    expect(panel).toHaveAttribute('inert');
    expect(panel).toHaveAttribute('data-open', 'false');
  });

  test('expands to every related measure, with no truncation', () => {
    renderCard();

    const toggle = screen.getByRole('button', {
      name: /Related NRR measure(s)/,
    });

    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(
      document.getElementById(toggle.getAttribute('aria-controls')),
    ).not.toHaveAttribute('inert');

    item.properties.measures.forEach((measure) => {
      expect(
        screen.getByRole('link', { name: new RegExp(measure.title) }),
      ).toHaveAttribute('href', measure.path);
    });
    expect(screen.queryByText(/\+\d+ more/)).toBeNull();
  });

  test('collapses again on a second click', () => {
    renderCard();

    const toggle = screen.getByRole('button', {
      name: /Related NRR measure(s)/,
    });

    fireEvent.click(toggle);
    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(
      document.getElementById(toggle.getAttribute('aria-controls')),
    ).toHaveAttribute('inert');
  });

  test('renders the open-in-new-tab affordance next to the title', () => {
    renderCard();

    const open = screen.getByRole('link', { name: 'Open the case study' });

    expect(open).toHaveAttribute('href', item.properties.path);
    expect(open.closest('.cse-card-head')).not.toBeNull();
    expect(
      open.closest('.cse-card-head').querySelector('.cse-card-title'),
    ).not.toBeNull();
  });

  test('marks the card as selected', () => {
    renderCard({ selected: true });

    expect(screen.getByRole('article')).toHaveAttribute(
      'data-selected',
      'true',
    );
  });

  test('asks the map to show the case study', () => {
    const onShowOnMap = jest.fn();
    renderCard({ onShowOnMap });

    fireEvent.click(screen.getByRole('button', { name: 'Show on map' }));

    expect(onShowOnMap).toHaveBeenCalledWith(item);
  });

  test('offers to reset the map once the card is the selected one', () => {
    const onShowOnMap = jest.fn();
    const onResetMap = jest.fn();
    renderCard({ selected: true, onShowOnMap, onResetMap });

    expect(screen.queryByRole('button', { name: 'Show on map' })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Reset map' }));

    expect(onResetMap).toHaveBeenCalledWith(item);
    expect(onShowOnMap).not.toHaveBeenCalled();
  });

  test('survives a case study with no measures, ecosystems or legislation', () => {
    const bare = {
      geometry: { type: 'Point', coordinates: [0, 0] },
      properties: { title: 'Bare case', path: '/bare' },
    };

    render(
      <IntlProvider locale="en">
        <CaseStudyCard item={bare} />
      </IntlProvider>,
    );

    expect(screen.getByText('Bare case')).toBeInTheDocument();
    expect(
      within(document.querySelector('.cse-card-meta')).queryByText(
        /NRR measures?$/,
      ),
    ).toBeNull();
    expect(
      within(screen.getByRole('article')).queryByRole('button', {
        name: /Related NRR measure(s)/,
      }),
    ).toBeNull();
  });
});
