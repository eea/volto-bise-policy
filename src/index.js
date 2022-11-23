import installLink from '@plone/volto-slate/editor/plugins/AdvancedLink';

import installBlocks from './components/manage/Blocks';
import installStyles from './components/manage/Styles';

import biseLogo from '@eeacms/volto-bise-theme/../theme//assets/images/Header/bise-logo.svg';
import biseWhiteLogo from '@eeacms/volto-bise-theme/../theme//assets/images/Header/bise-logo-white.svg';

const applyConfig = (config) => {
  // Volto specific settings
  config.settings = {
    ...config.settings,
    navDepth: 2,
  };

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
  };

  console.log('HERE', config.blocks.blocksConfig);

  config.blocks.requiredBlocks = [];

  config = installLink(config);

  const toolbarButtons = config.settings.slate.toolbarButtons || [];

  const linkIndex = toolbarButtons.indexOf('link');
  const advancedLinkIndex = toolbarButtons.indexOf('a');
  toolbarButtons.splice(linkIndex, 1, 'a');
  toolbarButtons.splice(advancedLinkIndex, 1);

  return [installBlocks, installStyles].reduce(
    (acc, apply) => apply(acc),
    config,
  );
};

export default applyConfig;
