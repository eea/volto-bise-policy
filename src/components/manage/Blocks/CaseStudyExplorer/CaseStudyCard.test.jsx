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

/**
 * jsdom does not lay anything out: fake a 300px wide list where 90px chips
 * wrap every three per row and the "+N" trigger is 40px wide, so the two-row
 * fit has something real to measure.
 */
function mockChipLayout({
  width = 300,
  chipWidth = 90,
  moreWidth = 40,
  perRow = 3,
  gap = 8,
  rowHeight = 24,
} = {}) {
  const indexOf = (element) =>
    Array.prototype.indexOf.call(element.parentNode.children, element);
  const descriptors = {
    clientWidth: { get: () => width },
    offsetWidth: {
      get() {
        if (!this.classList?.contains('cse-card-chip')) return 0;
        return this.textContent.startsWith('+') ? moreWidth : chipWidth;
      },
    },
    offsetTop: {
      get() {
        return Math.floor(indexOf(this) / perRow) * rowHeight;
      },
    },
    offsetLeft: {
      get() {
        return (indexOf(this) % perRow) * (chipWidth + gap);
      },
    },
  };
  const original = {};

  Object.entries(descriptors).forEach(([property, descriptor]) => {
    original[property] = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      property,
    );
    Object.defineProperty(HTMLElement.prototype, property, {
      configurable: true,
      ...descriptor,
    });
  });

  return () => {
    Object.entries(original).forEach(([property, descriptor]) => {
      if (descriptor) {
        Object.defineProperty(HTMLElement.prototype, property, descriptor);
      } else {
        delete HTMLElement.prototype[property];
      }
    });
  };
}

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
    const { container } = renderCard();

    const image = container.querySelector('.cse-card-media img');

    expect(image).toHaveAttribute('src', item.properties.image);
    expect(image).toHaveAttribute('alt', '');
    // An empty alt makes the image decorative, so it is not exposed as an image
    // in the accessibility tree: the title carries the meaning instead.
    expect(screen.queryByRole('img')).toBeNull();
  });

  test('renders the status as a colored dot next to the title', () => {
    renderCard();

    const dot = document.querySelector('.cse-card-status-dot');

    expect(dot).toHaveStyle({ backgroundColor: '#ff9933' });
    expect(dot.closest('.cse-card-title')).not.toBeNull();
  });

  test('does not render the measure count in the meta row', () => {
    renderCard();

    expect(
      screen.getByRole('button', { name: 'Show on map' }),
    ).toBeInTheDocument();
    expect(
      within(document.querySelector('.cse-card-meta')).queryByText(
        /NRR measures?$/,
      ),
    ).toBeNull();
    expect(screen.getAllByText('3', { exact: true })).toHaveLength(1);
  });

  test('shows every ecosystem when the card cannot be measured', () => {
    renderCard();

    const list = document.querySelector(
      '.cse-card-ecosystems:not(.cse-card-ecosystems-measure)',
    );

    item.properties.habitat_ecosystem_type.forEach((ecosystem) => {
      expect(within(list).getByText(ecosystem)).toBeInTheDocument();
    });
    expect(within(list).queryByText(/^\+\d+$/)).toBeNull();
  });

  test('collapses the ecosystems that overflow two rows into a +N popup', () => {
    const restore = mockChipLayout();
    const ecosystems = [
      'Coastal beaches, dunes and wetlands',
      'Cropland',
      'Forest and woodland',
      'Grassland',
      'Heathland and shrub',
      'Inland wetlands',
      'Rivers and lakes',
      'Sparsely vegetated habitats',
    ];

    try {
      render(
        <IntlProvider locale="en">
          <CaseStudyCard
            item={{
              ...item,
              properties: {
                ...item.properties,
                habitat_ecosystem_type: ecosystems,
              },
            }}
          />
        </IntlProvider>,
      );

      const list = document.querySelector(
        '.cse-card-ecosystems:not(.cse-card-ecosystems-measure)',
      );
      const visible = [...list.querySelectorAll('.cse-card-chip')].map(
        (chip) => chip.textContent,
      );

      // Five chips plus the trigger still fit in two rows of three.
      expect(visible.slice(0, 5)).toEqual(ecosystems.slice(0, 5));
      expect(visible[5]).toMatch(/^\+3/);
      expect(list.querySelectorAll('.cse-card-chip')).toHaveLength(6);

      const trigger = screen.getByRole('button', { name: /^\+3/ });
      expect(trigger).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(trigger);

      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      const dialog = screen.getByRole('dialog', {
        name: 'More habitat/ecosystem values',
      });
      // Only the hidden values: the visible chips already speak for themselves.
      ecosystems.slice(0, 5).forEach((ecosystem) => {
        expect(within(dialog).queryByText(ecosystem)).toBeNull();
      });
      ecosystems.slice(5).forEach((ecosystem) => {
        expect(within(dialog).getByText(ecosystem)).toBeInTheDocument();
      });
      expect(dialog.querySelectorAll('.cse-card-chip')).toHaveLength(3);

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.queryByRole('dialog')).toBeNull();
    } finally {
      restore();
    }
  });

  test('collapses the related measures behind a bar owning the count', () => {
    renderCard();

    const toggle = screen.getByRole('button', {
      name: /Related NRR measure\(s\)/,
    });

    expect(toggle).toHaveTextContent('Related NRR measure(s)');
    expect(toggle).toHaveTextContent('3');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('keeps the collapsed measures panel inert and out of the tab order', () => {
    renderCard();

    const toggle = screen.getByRole('button', {
      name: /Related NRR measure\(s\)/,
    });
    const panel = document.getElementById(toggle.getAttribute('aria-controls'));

    expect(panel).toHaveAttribute('inert');
    expect(panel).toHaveAttribute('data-open', 'false');
  });

  test('expands to every related measure, with no truncation', () => {
    renderCard();

    const toggle = screen.getByRole('button', {
      name: /Related NRR measure\(s\)/,
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
      name: /Related NRR measure\(s\)/,
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
        name: /Related NRR measure\(s\)/,
      }),
    ).toBeNull();
  });
});
