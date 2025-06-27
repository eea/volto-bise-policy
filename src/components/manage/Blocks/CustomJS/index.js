import codeSVG from '@plone/volto/icons/code.svg';
import CustomJSView from './CustomJSView';
import CustomJSEdit from './CustomJSEdit';

const config = (config) => {
  config.blocks.blocksConfig.biseCustomJS = {
    id: 'biseCustomJS',
    title: 'Custom JS',
    icon: codeSVG,
    group: 'custom_addons',
    view: CustomJSView,
    edit: CustomJSEdit,
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
