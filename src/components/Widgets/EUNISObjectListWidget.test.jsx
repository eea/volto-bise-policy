import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from 'react-intl';

import {
  EUNISMSFDView,
  EUNISCodeView,
  EUNISHDView,
  EUNISEuropeanRedListView,
  EUNISLinksToFinerEUNISHabitatsView,
  EUNISCountryCodeView,
  EUNISRegionalSeaConventionValueView,
  EUNISEuropeanRedListWidget,
  EUNISMSFDWidget,
  EUNISHDWidget,
  EUNISLinksToFinerEUNISHabitatsWidget,
  EUNISRegionalSeaConventionValueWidget,
  EUNISCountryCodeWidget,
} from './EUNISObjectListWidget';

// Mock the heavy @plone/volto building blocks used by BaseObjectListWidget so
// that we can render the widget without mounting react-beautiful-dnd, the
// ObjectWidget editor or the full FormFieldWrapper machinery.
jest.mock('@plone/volto/components/manage/DragDropList/DragDropList', () => ({
  __esModule: true,
  default: ({ childList, onMoveItem, children }) => (
    <div data-testid="dragdrop-list">
      {childList.map((childEntry, index) =>
        children({
          child: childEntry[1],
          childId: childEntry[0],
          index,
          draginfo: {
            innerRef: jest.fn(),
            draggableProps: {},
            dragHandleProps: {},
          },
        }),
      )}
    </div>
  ),
}));

jest.mock('@plone/volto/components/manage/Widgets/FormFieldWrapper', () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="form-wrapper">{children}</div>,
}));

jest.mock('@plone/volto/components/manage/Widgets/ObjectWidget', () => ({
  __esModule: true,
  default: () => <div data-testid="object-widget" />,
}));

jest.mock('@plone/volto/components/theme/Icon/Icon', () => ({
  __esModule: true,
  default: () => <span data-testid="icon" />,
}));

// Mock the volto helpers too: the real `Blocks.js` requires `uuid`, which
// cannot always be resolved from within node_modules in the jest environment
// (and the repository already mocks @plone/volto/helpers in other suites).
// The schemas used here have no `default`s, so `applySchemaDefaults` is
// faithfully reproduced by returning the input data.
jest.mock('@plone/volto/helpers/Blocks/Blocks', () => ({
  __esModule: true,
  applySchemaDefaults: jest.fn(({ data }) => data),
}));

jest.mock('@plone/volto/helpers/Utils/Utils', () => ({
  __esModule: true,
  reorderArray: jest.fn((array) => array),
}));

// EUNISCodeView reads the current content data from the Redux store. Expose a
// mutable slice so each test can control what useSelector returns.
let mockContentData = {};
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector) => selector({ content: { data: mockContentData } }),
}));

const renderView = (Component, props) => render(<Component {...props} />);

describe('EUNISMSFDView', () => {
  it('renders nothing when value is empty', () => {
    const { container } = renderView(EUNISMSFDView, { value: '' });
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing on invalid JSON', () => {
    const { container } = renderView(EUNISMSFDView, { value: 'not json' });
    expect(container.firstChild).toBeNull();
  });

  it('renders relation and value for each item', () => {
    const value = JSON.stringify([
      { '@id': '/1', relation: '=', value: 'V1' },
      { '@id': '/2', relation: '#', value: 'V2' },
    ]);

    const { container } = renderView(EUNISMSFDView, { value });

    const view = container.querySelector('.eunis-widget-view');
    expect(view).toBeInTheDocument();

    const items = view.querySelectorAll('.eunis-widget-item');
    expect(items).toHaveLength(2);
    expect(items[0].textContent).toContain('=');
    expect(items[0].textContent).toContain('V1');
    expect(items[1].textContent).toContain('#');
    expect(items[1].textContent).toContain('V2');
  });

  it('supports an object value with a value array', () => {
    const value = { value: [{ '@id': '/1', relation: '=', value: 'V' }] };
    const { container } = renderView(EUNISMSFDView, { value });
    expect(container.querySelector('.eunis-widget-view')).toBeInTheDocument();
  });
});

describe('EUNISHDView', () => {
  it('renders nothing when value is empty', () => {
    const { container } = renderView(EUNISHDView, { value: [] });
    expect(container.firstChild).toBeNull();
  });

  it('renders the item.link href when present', () => {
    const value = JSON.stringify([
      { '@id': '/1', relation: '=', value: 'V', link: 'http://x/1' },
    ]);

    const { container } = renderView(EUNISHDView, { value });

    const a = container.querySelector('.eunis-widget-item a');
    expect(a).toHaveAttribute('href', 'http://x/1');
    expect(a).toHaveTextContent('V');
    expect(
      container.querySelector('.eunis-widget-item span'),
    ).toHaveTextContent('=');
  });

  it('renders the Annex I URL when no link is present', () => {
    const value = JSON.stringify([{ '@id': '/1', relation: '>', value: 'A1' }]);

    const { container } = renderView(EUNISHDView, { value });

    const a = container.querySelector('.eunis-widget-item a');
    expect(a).toHaveAttribute('href', '/habitats/ANNEX1_A1');
    expect(a).toHaveAttribute('target', '_blank');
    expect(a).toHaveAttribute('rel', 'noopener');
    expect(a).toHaveTextContent('A1');
  });
});

describe('EUNISEuropeanRedListView', () => {
  it('renders the item.link href when present', () => {
    const value = JSON.stringify([
      { '@id': '/1', relation: '=', value: 'V', link: 'http://x/2' },
    ]);

    const { container } = renderView(EUNISEuropeanRedListView, { value });

    expect(container.querySelector('.eunis-widget-item a')).toHaveAttribute(
      'href',
      'http://x/2',
    );
  });

  it('builds the Red List URL from the code part of the value', () => {
    const value = JSON.stringify([
      { '@id': '/1', relation: '=', value: 'Kelp communities - BAL1' },
    ]);

    const { container } = renderView(EUNISEuropeanRedListView, { value });

    const a = container.querySelector('.eunis-widget-item a');
    expect(a).toHaveAttribute('href', '/habitats_rl/REDLIST_BAL1');
    expect(a).toHaveAttribute('target', '_blank');
    expect(a).toHaveTextContent('Kelp communities - BAL1');
  });
});

describe('EUNISLinksToFinerEUNISHabitatsView', () => {
  it('renders the item.link href when present', () => {
    const value = JSON.stringify([
      { '@id': '/1', value: 'E1', link: 'http://x/3' },
    ]);

    const { container } = renderView(EUNISLinksToFinerEUNISHabitatsView, {
      value,
    });

    expect(container.querySelector('.eunis-widget-item a')).toHaveAttribute(
      'href',
      'http://x/3',
    );
  });

  it('builds the EUNIS revised URL when no link is present', () => {
    const value = JSON.stringify([{ '@id': '/1', value: 'E1' }]);

    const { container } = renderView(EUNISLinksToFinerEUNISHabitatsView, {
      value,
    });

    const a = container.querySelector('.eunis-widget-item a');
    expect(a).toHaveAttribute('href', '/habitats_eunis_revised/EUNISrev_E1');
    expect(a).toHaveAttribute('target', '_blank');
    expect(a).toHaveTextContent('E1');
  });
});

describe('EUNISCountryCodeView', () => {
  it('renders nothing when value is empty', () => {
    const { container } = renderView(EUNISCountryCodeView, { value: '' });
    expect(container.firstChild).toBeNull();
  });

  it('renders countries and their national items', () => {
    const value = JSON.stringify([
      {
        '@id': '/cc1',
        countryCode: ['BE', 'NL'],
        national: [{ '@id': '/n1', relation: '=', value: 'V1' }],
      },
    ]);

    const { container } = renderView(EUNISCountryCodeView, { value });

    expect(container.querySelector('.country-item')).toHaveTextContent(
      'BE, NL',
    );

    const items = container.querySelectorAll('.eunis-widget-item');
    expect(items).toHaveLength(1);
    expect(items[0].textContent).toContain('=');
    expect(items[0].textContent).toContain('V1');
  });
});

describe('EUNISRegionalSeaConventionValueView', () => {
  it('behaves like the MSFD view', () => {
    const value = JSON.stringify([{ '@id': '/1', relation: '=', value: 'V' }]);

    const { container } = renderView(EUNISRegionalSeaConventionValueView, {
      value,
    });

    expect(container.querySelector('.eunis-widget-view')).toBeInTheDocument();
  });
});

describe('EUNISCodeView', () => {
  beforeEach(() => {
    mockContentData = {};
  });

  it('builds the default EUNIS revised href', () => {
    const { container } = renderView(EUNISCodeView, { value: 'E123' });

    const a = container.querySelector('a');
    expect(a).toHaveAttribute('href', '/habitats_eunis_revised/EUNISrev_E123');
    expect(a).toHaveAttribute('target', '_blank');
    expect(a).toHaveAttribute('rel', 'noopener');
    expect(a).toHaveTextContent('E123');
  });

  it('uses the trimmed eunis_code_alt_url from the store when present', () => {
    mockContentData = { eunis_code_alt_url: '  http://alt/1  ' };
    const { container } = renderView(EUNISCodeView, { value: 'E123' });

    expect(container.querySelector('a')).toHaveAttribute(
      'href',
      'http://alt/1',
    );
  });

  it('prefers the content prop over the store', () => {
    mockContentData = { eunis_code_alt_url: 'http://store/1' };
    const { container } = renderView(EUNISCodeView, {
      value: 'E123',
      content: { eunis_code_alt_url: 'http://content/2' },
    });

    expect(container.querySelector('a')).toHaveAttribute(
      'href',
      'http://content/2',
    );
  });

  it('returns the value unchanged when no value is provided', () => {
    const { container } = renderView(EUNISCodeView, { value: null });
    expect(container.firstChild).toBeNull();
  });
});

const renderWidget = (Widget, props) =>
  render(
    <IntlProvider locale="en" messages={{}}>
      <Widget
        id="w"
        value={{ value: [] }}
        fieldSet="default"
        block={{}}
        {...props}
      />
    </IntlProvider>,
  );

describe('BaseObjectListWidget (via the named widget wrappers)', () => {
  it.each([
    ['MSFD', EUNISMSFDWidget, 'Add MSFD'],
    ['HD (Annex I)', EUNISHDWidget, 'Add HD (Annex I)'],
    ['European Red List', EUNISEuropeanRedListWidget, 'Add European Red List'],
    [
      'Links to finer EUNIS habitats',
      EUNISLinksToFinerEUNISHabitatsWidget,
      'Add Links to finer EUNIS habitats',
    ],
    [
      'Regional Sea Convention Value',
      EUNISRegionalSeaConventionValueWidget,
      'Add Regional Sea Convention Value',
    ],
    ['Country Code', EUNISCountryCodeWidget, 'Add Country Code'],
  ])('renders the add button for %s', (title, Widget, label) => {
    const { getByRole } = renderWidget(Widget, { onChange: jest.fn() });
    expect(getByRole('button', { name: label })).toBeInTheDocument();
  });

  it('renders the empty-state input when there are no items', () => {
    const { container } = renderWidget(EUNISMSFDWidget, {
      onChange: jest.fn(),
    });

    const hidden = container.querySelector('input[type="hidden"]');
    expect(hidden).toHaveValue('Empty object list');
  });

  it('adds a new item when the add button is clicked', () => {
    const onChange = jest.fn();
    const { getByRole } = renderWidget(EUNISMSFDWidget, { onChange });

    fireEvent.click(getByRole('button', { name: 'Add MSFD' }));

    expect(onChange).toHaveBeenCalledWith('w', {
      value: expect.arrayContaining([
        expect.objectContaining({ '@id': expect.any(String) }),
      ]),
    });
  });

  it('removes an item when the remove button is clicked', () => {
    const onChange = jest.fn();
    const value = {
      value: [{ '@id': '/1', relation: '=', value: 'V' }],
    };

    const { getByRole } = render(
      <IntlProvider locale="en" messages={{}}>
        <EUNISMSFDWidget
          id="w"
          value={value}
          fieldSet="default"
          block={{}}
          onChange={onChange}
        />
      </IntlProvider>,
    );

    fireEvent.click(getByRole('button', { name: 'Remove item #1' }));

    expect(onChange).toHaveBeenCalledWith('w', { value: [] });
  });
});
