import React from 'react';
import config from '@plone/volto/registry';

const CountryProfileView = (props) => {
  const defaultVariation = (
    config.blocks.blocksConfig.title.variations || []
  ).find((v) => v.isDefault);
  const DefaultTemplate = defaultVariation?.view;
  const CountryFlagView = config.blocks.blocksConfig?.countryFlag?.view;

  if (!DefaultTemplate) return null;

  const banner = CountryFlagView
    ? {
        ...(props.banner || {}),
        title: {
          view: <CountryFlagView {...props} path={props.path || props.pathname} />,
        },
      }
    : props.banner;

  return <DefaultTemplate {...props} banner={banner} />;
};

export default CountryProfileView;
