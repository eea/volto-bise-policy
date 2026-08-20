import CountryProfileView from './CountryProfileView';
import { countryProfileSchemaEnhancer } from './schema';

export default function installTitleVariations(config) {
  const titleBlock = config.blocks.blocksConfig.title;
  if (!titleBlock) return config;

  titleBlock.variations = [
    ...(titleBlock.variations || []),
    {
      id: 'countryProfile',
      title: 'Country Profile',
      view: CountryProfileView,
      schemaEnhancer: countryProfileSchemaEnhancer,
    },
  ];

  return config;
}
