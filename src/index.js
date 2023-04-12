import installLink from '@plone/volto-slate/editor/plugins/AdvancedLink';
import { addStylingFieldsetSchemaEnhancer } from '@eeacms/volto-bise-policy/components/manage/Blocks/schema';

import installBlocks from './components/manage/Blocks';
import installStyles from './components/manage/Styles';

import biseLogo from '@eeacms/volto-bise-policy/../theme//assets/images/Header/bise-logo.svg';
import biseWhiteLogo from '@eeacms/volto-bise-policy/../theme//assets/images/Header/bise-logo-white.svg';

const applyConfig = (config) => {
  // Volto specific settings
  config.settings = {
    ...config.settings,
    navDepth: 3,
  };

  // Multi-lingual
  config.settings.isMultilingual = false;
  config.settings.defaultLanguage =
    config.settings.eea?.defaultLanguage || 'en';

  // EEA customizations
  config.settings.eea = {
    ...(config.settings.eea || {}),
    headerOpts: {
      ...(config.settings.eea?.headerOpts || {}),
      logo: biseLogo,
      logoWhite: biseWhiteLogo,
    },
    headerSearchBox: [
      {
        isDefault: true,
        path: '/advanced-search',
        placeholder: 'Search...',
      },
      {
        path: 'datahub',
        placeholder: 'Search Datahub...',
        description:
          'Looking for more information? Try searching the full EEA website content',
        buttonTitle: 'Go to full site search',
      },
    ],
    logoTargetUrl: '/',
  };

  // BISE config
  config.settings.bise = {
    subsites: [
      {
        '@id': '/natura2000',
        '@type': 'Subsite',
        title: 'Natura 2000',
        subsite_css_class: {
          token: 'natura2000',
        },
      },
    ],
    multilingualSubsites: ['/natura2000'],
  };

  config.settings.apiExpanders.push({
    match: '/',
    GET_CONTENT: ['translations'],
  });

  config.blocks.requiredBlocks = [];

  config.blocks.blocksConfig.html.restricted = false;

  // Install advanced link
  config = installLink(config);
  const toolbarButtons = config.settings.slate.toolbarButtons || [];
  const linkIndex = toolbarButtons.indexOf('link');
  const advancedLinkIndex = toolbarButtons.indexOf('a');
  toolbarButtons.splice(linkIndex, 1, 'a');
  toolbarButtons.splice(advancedLinkIndex, 1);

  // Customizations
  // Group
  if (config.blocks.blocksConfig.group) {
    config.blocks.blocksConfig.group.schemaEnhancer = addStylingFieldsetSchemaEnhancer;
  }

  // Columns
  if (config.blocks.blocksConfig.columnsBlock) {
    config.blocks.blocksConfig.columnsBlock.mostUsed = true;
    config.blocks.blocksConfig.columnsBlock.schemaEnhancer = addStylingFieldsetSchemaEnhancer;
  }

  // Listing
  if (config.blocks.blocksConfig.listing) {
    config.blocks.blocksConfig.listing.title = 'Listing (Content)';
    config.blocks.blocksConfig.listing.schemaEnhancer = addStylingFieldsetSchemaEnhancer;
  }

  // Hero image left
  if (config.blocks.blocksConfig.hero_image_left) {
    config.blocks.blocksConfig.hero_image_left.schemaEnhancer = addStylingFieldsetSchemaEnhancer;
  }

  return [installBlocks, installStyles].reduce(
    (acc, apply) => apply(acc),
    config,
  );
};

export default applyConfig;
