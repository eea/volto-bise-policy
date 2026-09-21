import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import FeatureDisplay from './FeatureDisplay';

describe('FeatureDisplay Component', () => {
  it('renders correctly with feature data', () => {
    const feature = {
      title: 'Sample Feature',
      path: 'https://example.com/sample-feature',
      image: 'https://example.com/preview.jpg',
      measures_implemented: [
        { path: 'https://example.com/nwrm-1', title: 'NWRM 1' },
        { path: 'https://example.com/nwrm-2', title: 'NWRM 2' },
      ],
      typology_of_measures: ['Sector 1', 'Sector 2'],
    };

    const { getByRole } = render(<FeatureDisplay feature={feature} />);

    const titleLink = getByRole('link', { name: 'Sample Feature' });
    expect(titleLink).toHaveAttribute(
      'href',
      'https://example.com/sample-feature',
    );
    expect(getByRole('img')).toHaveAttribute(
      'src',
      'https://example.com/preview.jpg',
    );
  });

  it('does not render an image when the feature has none', () => {
    const { queryByRole, getByRole } = render(
      <FeatureDisplay feature={{ title: 'No image', path: '/no-image' }} />,
    );

    expect(queryByRole('img')).not.toBeInTheDocument();
    expect(getByRole('link', { name: 'No image' })).toHaveAttribute(
      'href',
      '/no-image',
    );
  });

  it('renders nothing when feature is null', () => {
    const { container } = render(<FeatureDisplay feature={null} />);
    expect(container.firstChild).toBeNull();
  });
});
