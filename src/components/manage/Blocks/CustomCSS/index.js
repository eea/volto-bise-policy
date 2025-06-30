import codeSVG from '@plone/volto/icons/code.svg';
import CustomCSSView from './CustomCSSView';
import CustomCSSEdit from './CustomCSSEdit';

const config = (config) => {
  config.blocks.blocksConfig.biseCustomCSS = {
    id: 'biseCustomCSS',
    title: 'Custom CSS',
    icon: codeSVG,
    group: 'custom_addons',
    view: CustomCSSView,
    edit: CustomCSSEdit,
    restricted: false,
    mostUsed: false,
    blockHasOwnFocusManagement: false,
    sidebarTab: 1,
    security: {
      addPermission: [],
      view: [],
    },
  };

  return config;
};

export default config;
