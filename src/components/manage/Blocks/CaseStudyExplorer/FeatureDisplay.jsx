import React from 'react';
import Image from '@plone/volto/components/theme/Image/Image';

export default function FeatureDisplay({ feature }) {
  return feature ? (
    <div id="csepopup">
      {feature.image ? (
        <Image
          className="csepopup-image"
          src={feature.image}
          alt={feature.title || ''}
        />
      ) : null}
      <h3>
        <strong>
          <a target="_blank" rel="noopener noreferrer" href={feature.path}>
            {feature.title}
            <i class="ri-external-link-line"></i>
          </a>
        </strong>
      </h3>
    </div>
  ) : null;
}
