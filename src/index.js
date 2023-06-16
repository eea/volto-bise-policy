import { getBlocks } from '@plone/volto/helpers';
import installLink from '@plone/volto-slate/editor/plugins/AdvancedLink';
import { addStylingFieldsetSchemaEnhancer } from '@eeacms/volto-bise-policy/components/manage/Blocks/schema';

import installBlocks from './components/manage/Blocks';
import installStyles from './styles-config';

import biseLogo from '@eeacms/volto-bise-policy/../theme/assets/images/Header/bise-logo.svg';
import biseWhiteLogo from '@eeacms/volto-bise-policy/../theme/assets/images/Header/bise-logo-white.svg';
import ecLogo from '@eeacms/volto-bise-policy/../theme/assets/logos/logo-ec-inverse.svg';

const restrictedBlocks = ['imagecards', 'embed_eea_tableau_block'];

const customBlocks = [
  'html',
  'countryFlag',
  'tableau_block',
  'body_classname',
  'redirect',
  'navigationBlock',
];

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
        // to replace search path change path to whatever you want and match with the page in volto website
        path: '/advanced-search',
        placeholder: 'Search BISE...',
        description:
          'Looking for more information? Try searching the full EEA website content',
        buttonTitle: 'Go to advanced search',
        buttonUrl: 'https://www.eea.europa.eu/en/advanced-search',
      },
    ],
    logoTargetUrl: '/',
  };

  config.settings.eea.footerOpts.logosHeader = 'Managed by';
  config.settings.eea.footerOpts.managedBy[1] = {
    url: 'https://commission.europa.eu',
    src: ecLogo,
    alt: 'European commission Logo',
    className: 'commission logo',
    columnSize: {
      mobile: 6,
      tablet: 12,
      computer: 4,
    },
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
    config.blocks.blocksConfig.columnsBlock.tocEntry = undefined;
    config.blocks.blocksConfig.columnsBlock.tocEntries = (
      block = {},
      tocData,
    ) => {
      // integration with volto-block-toc
      const headlines = tocData.levels || ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
      let entries = [];
      const sorted_column_blocks = getBlocks(block?.data || {});
      sorted_column_blocks.forEach((column_block) => {
        const sorted_blocks = getBlocks(column_block[1]);
        sorted_blocks.forEach((block) => {
          const { value, plaintext } = block[1];
          const type = value?.[0]?.type;
          if (headlines.includes(type)) {
            entries.push([parseInt(type.slice(1)), plaintext, block[0]]);
          }
        });
      });
      return entries;
    };
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

  config = [installBlocks, installStyles].reduce(
    (acc, apply) => apply(acc),
    config,
  );

  // Disable some blocks
  restrictedBlocks.forEach((block) => {
    if (config.blocks.blocksConfig[block]) {
      config.blocks.blocksConfig[block].restricted = true;
    }
  });

  // Set custom blocks
  config.blocks.groupBlocksOrder = [
    ...config.blocks.groupBlocksOrder,
    { id: 'custom_blocks', title: 'Custom blocks' },
  ];
  customBlocks.forEach((block) => {
    if (config.blocks.blocksConfig[block]) {
      config.blocks.blocksConfig[block].group = 'custom_blocks';
    }
  });

  return config;
};

export default applyConfig;
