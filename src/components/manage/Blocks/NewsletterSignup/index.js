import imageSVG from '@plone/volto/icons/image.svg';
import NavigationBlockView from './View';
import NavigationBlockEdit from './Edit';

export default (config) => {
  config.blocks.blocksConfig.newsletterSignup = {
    id: 'newsletterSignup',
    title: 'Newsletter signup',
    icon: imageSVG,
    group: 'common',
    view: NavigationBlockView,
    edit: NavigationBlockEdit,
    restricted: false,
    mostUsed: false,
    variations: [
      {
        id: 'default',
        title: 'Default',
        isDefault: true,
        render: (props) => {
          const { hasImage, imgSrc } = props.data;

          return (
            <>
              View mode
              {hasImage && imgSrc && (
                <img src={`${props.data.imgSrc}/@@images/image`} alt="asda" />
              )}
            </>
          );
        },
      },
      {
        id: 'enisa_newsletter',
        title: 'Enisa newsletter',
        render: () => 'is enisa newsletter',
        schemaEnhancer: ({ schema, formData, intl }) => {
          return schema;
        },
      },
    ],
    sidebarTab: 1,
    security: {
      addPermission: [],
      view: [],
    },
  };
  return config;
};
