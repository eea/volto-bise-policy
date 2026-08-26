import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import {
  NRRTypologyOfMeasuresView,
  NRRArticleView,
  NRRrelatedCaseStudiesView,
  NRRMeasuresImplementedView,
  NRREcosystemTypologyView,
  NRRHabitatEcosystemTypeView,
  NRRScaleOfPlanningView,
  NRRCurrentStatusView,
} from './NRRWidgets';

// Mock the heavy @plone/volto UniversalLink for the linked-list views so that
// we only assert on the rendered markup without having to mount a Router.
jest.mock('@plone/volto/components/manage/UniversalLink/UniversalLink', () => ({
  __esModule: true,
  default: ({ href, children }) => <a href={href}>{children}</a>,
}));

// Render the semantic-ui-react Popup inline (instead of via a portal) so the
// trigger and content are directly assertable. The mock factory uses
// jest.requireActual to avoid the TDZ hoisting issue of referencing a const.
jest.mock('semantic-ui-react', () => {
  const actual = jest.requireActual('semantic-ui-react');
  return {
    ...actual,
    Popup: ({ content, trigger }) => (
      <div className="popup">
        <div className="trigger">{trigger}</div>
        <div className="content">{content}</div>
      </div>
    ),
  };
});

describe('NRRTypologyOfMeasuresView', () => {
  it('renders nothing when value is empty', () => {
    const { container } = render(<NRRTypologyOfMeasuresView value="" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when value is invalid JSON', () => {
    const { container } = render(
      <NRRTypologyOfMeasuresView value="not json" />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders a labeled linked list and splits title into code/description', () => {
    const value = JSON.stringify([
      { '@id': '/1', title: '001 - Sector A - Description one' },
      { '@id': '/2', title: '002 - Sector B - Description two' },
    ]);

    const { container } = render(<NRRTypologyOfMeasuresView value={value} />);

    const list = container.querySelector('.nrr-linked-list');
    expect(list).toBeInTheDocument();
    expect(list.textContent).toContain('Related typology of measures: ');

    const popups = list.querySelectorAll('.popup');
    expect(popups).toHaveLength(2);

    // code = first two parts joined, description = last part
    expect(popups[0].querySelector('.trigger')).toHaveTextContent(
      '001 - Sector A',
    );
    expect(popups[0].querySelector('.content')).toHaveTextContent(
      'Description one',
    );
    expect(popups[1].querySelector('.trigger')).toHaveTextContent(
      '002 - Sector B',
    );
    expect(popups[1].querySelector('.content')).toHaveTextContent(
      'Description two',
    );
  });
});

describe('NRRArticleView', () => {
  it('renders nothing when value is empty', () => {
    const { container } = render(<NRRArticleView value={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('extracts the article number from the title and renders an inline list', () => {
    const value = JSON.stringify([
      { '@id': '/1', title: 'Article 5 - xxx' },
      { '@id': '/2', title: 'Article 7 - yyy' },
    ]);

    const { container } = render(<NRRArticleView value={value} />);

    const p = container.querySelector('p');
    expect(p).toBeInTheDocument();
    expect(p.textContent).toContain('NRR Article: ');
    // render = title.split(' - ')[0].split(' ')[1]
    expect(p.textContent).toContain('5');
    expect(p.textContent).toContain('7');
    // one label span plus one span per item
    expect(p.querySelectorAll('span').length).toBe(3);
  });
});

describe('NRRrelatedCaseStudiesView', () => {
  it('renders nothing when value is empty', () => {
    const { container } = render(<NRRrelatedCaseStudiesView value={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders links to each related case study', () => {
    const value = JSON.stringify([
      { '@id': '/c1', title: 'Case One' },
      { '@id': '/c2', title: 'Case Two' },
    ]);

    const { container } = render(<NRRrelatedCaseStudiesView value={value} />);

    const list = container.querySelector('.nrr-linked-list');
    expect(list.textContent).toContain('Related Case Studies: ');

    const links = list.querySelectorAll('a');
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute('href', '/c1');
    expect(links[0]).toHaveTextContent('Case One');
    expect(links[1]).toHaveAttribute('href', '/c2');
    expect(links[1]).toHaveTextContent('Case Two');
  });
});

describe('NRRMeasuresImplementedView', () => {
  it('renders nothing when value is empty', () => {
    const { container } = render(<NRRMeasuresImplementedView value="" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders measures as links without a leading label', () => {
    const value = [
      { '@id': '/m1', title: 'Measure One' },
      { '@id': '/m2', title: 'Measure Two' },
    ];

    const { container } = render(<NRRMeasuresImplementedView value={value} />);

    const list = container.querySelector('.nrr-linked-list');
    expect(list).toBeInTheDocument();

    // no label rendered for this view
    expect(list.querySelector('b')).toBeNull();

    const links = list.querySelectorAll('a');
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute('href', '/m1');
    expect(links[0]).toHaveTextContent('Measure One');
    expect(links[1]).toHaveAttribute('href', '/m2');
    expect(links[1]).toHaveTextContent('Measure Two');
  });
});

describe('NRREcosystemTypologyView', () => {
  it('renders nothing when value is empty', () => {
    const { container } = render(<NRREcosystemTypologyView value={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the ecosystem types as an inline list of titles', () => {
    const value = JSON.stringify([
      { '@id': '/1', title: 'Grassland' },
      { '@id': '/2', title: 'Wetland' },
    ]);

    const { container } = render(<NRREcosystemTypologyView value={value} />);

    const p = container.querySelector('p');
    expect(p.textContent).toContain('Ecosystem type: ');
    expect(p.textContent).toContain('Grassland');
    expect(p.textContent).toContain('Wetland');
  });
});

describe('NRRHabitatEcosystemTypeView', () => {
  it('renders a labeled inline list of habitat/ecosystem types', () => {
    const value = [
      { '@id': '/1', title: 'Forest' },
      { '@id': '/2', title: 'Heathland' },
    ];

    const { container } = render(<NRRHabitatEcosystemTypeView value={value} />);

    const p = container.querySelector('p');
    expect(p.textContent).toContain('Habitat/Ecosystem type: ');
    expect(p.textContent).toContain('Forest');
    expect(p.textContent).toContain('Heathland');
    // the label span of a "secondary" view carries the secondary class
    expect(container.querySelector('p span.secondary')).toBeInTheDocument();
  });
});

describe('NRRScaleOfPlanningView', () => {
  it('renders a labeled inline list of planning scales', () => {
    const value = JSON.stringify([
      { '@id': '/1', title: 'National' },
      { '@id': '/2', title: 'Regional' },
    ]);

    const { container } = render(<NRRScaleOfPlanningView value={value} />);

    const p = container.querySelector('p');
    expect(p.textContent).toContain('Scale of planning: ');
    expect(p.textContent).toContain('National');
    expect(p.textContent).toContain('Regional');
    expect(container.querySelector('p span.secondary')).toBeInTheDocument();
  });
});

describe('NRRCurrentStatusView', () => {
  it('renders nothing when value is empty', () => {
    const { container } = render(<NRRCurrentStatusView value="" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing for undefined or null', () => {
    const { container } = render(<NRRCurrentStatusView value={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the raw string value when it is not JSON', () => {
    const { container } = render(<NRRCurrentStatusView value="Ongoing" />);
    expect(container.textContent).toContain('Current status: ');
    expect(container.textContent).toContain('Ongoing');
  });

  it('renders the title of an object value', () => {
    const value = JSON.stringify({ title: 'Active' });
    const { container } = render(<NRRCurrentStatusView value={value} />);
    expect(container.textContent).toContain('Active');
  });

  it('falls back to token then value for object values', () => {
    const { container } = render(
      <NRRCurrentStatusView value={{ token: 't1', value: 'raw' }} />,
    );
    expect(container.textContent).toContain('t1');
  });

  it('renders nothing for an array value', () => {
    const { container } = render(
      <NRRCurrentStatusView value={JSON.stringify(['a', 'b'])} />,
    );
    expect(container.firstChild).toBeNull();
  });
});
