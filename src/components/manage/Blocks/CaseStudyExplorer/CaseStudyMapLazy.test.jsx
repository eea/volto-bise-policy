import './mockJsdom';
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';

import CaseStudyMapLazy from './CaseStudyMapLazy';

jest.mock('./CaseStudyMap', () => () => <div data-testid="case-study-map" />);

const items = [
  {
    geometry: { type: 'Point', coordinates: [14.4, 50.1] },
    properties: { title: 'Peatlands', path: '/case-peatlands' },
  },
];

const installIntersectionObserver = () => {
  const observers = [];
  class MockIntersectionObserver {
    constructor(callback) {
      this.callback = callback;
      this.observe = jest.fn();
      this.disconnect = jest.fn();
      observers.push(this);
    }
  }
  global.IntersectionObserver = MockIntersectionObserver;
  return observers;
};

describe('CaseStudyMapLazy', () => {
  const originalObserver = global.IntersectionObserver;

  afterEach(() => {
    global.IntersectionObserver = originalObserver;
    jest.clearAllMocks();
  });

  test('renders nothing without case studies', () => {
    const { container } = render(<CaseStudyMapLazy items={[]} />);

    expect(container.firstChild).toBeNull();
  });

  test('defers the map until it is near the viewport', () => {
    const observers = installIntersectionObserver();
    const { container } = render(<CaseStudyMapLazy items={items} />);

    expect(container.querySelector('.cse-map-slot')).toBeInTheDocument();
    expect(screen.queryByTestId('case-study-map')).not.toBeInTheDocument();
    expect(observers[0].observe).toHaveBeenCalledWith(
      container.querySelector('.cse-map-slot'),
    );
  });

  test('mounts the map once the slot scrolls into view', () => {
    const observers = installIntersectionObserver();
    render(<CaseStudyMapLazy items={items} />);

    act(() => {
      observers[0].callback([{ isIntersecting: true }]);
    });

    expect(screen.getByTestId('case-study-map')).toBeInTheDocument();
    expect(observers[0].disconnect).toHaveBeenCalled();
  });

  test('mounts the map immediately without IntersectionObserver support', () => {
    delete global.IntersectionObserver;
    render(<CaseStudyMapLazy items={items} />);

    expect(screen.getByTestId('case-study-map')).toBeInTheDocument();
  });
});
