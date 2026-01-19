import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import FeatureDisplay from './FeatureDisplay';

describe('FeatureDisplay Component', () => {
  it('renders correctly with feature data', () => {
    const feature = {
      title: 'Sample Feature',
      path: 'https://example.com/sample-feature',
      nwrms_implemented: [
        { path: 'https://example.com/nwrm-1', title: 'NWRM 1' },
        { path: 'https://example.com/nwrm-2', title: 'NWRM 2' },
      ],
      sectors: ['Sector 1', 'Sector 2'],
    };

    const { getByRole } = render(<FeatureDisplay feature={feature} />);

    const titleLink = getByRole('link', { name: 'Sample Feature' });
    expect(titleLink).toHaveAttribute(
      'href',
      'https://example.com/sample-feature',
    );
  });

  it('renders nothing when feature is null', () => {
    const { container } = render(<FeatureDisplay feature={null} />);
    expect(container.firstChild).toBeNull();
  });
});
