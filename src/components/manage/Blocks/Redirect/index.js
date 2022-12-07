import worldSVG from '@plone/volto/icons/world.svg';
import RedirectEdit from './Edit';
import RedirectView from './View';

export default (config) => {
  config.blocks.blocksConfig.redirect = {
    id: 'redirect',
    title: 'Redirect',
    icon: worldSVG,
    group: 'common',
    edit: RedirectEdit,
    view: RedirectView,
    restricted: false,
    mostUsed: false,
    sidebarTab: 1,
    blocks: {},
    security: {
      addPermission: [],
      view: [],
    },
    blockHasOwnFocusManagement: false,
  };
  return config;
};
