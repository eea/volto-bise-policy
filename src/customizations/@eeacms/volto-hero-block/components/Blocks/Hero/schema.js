import { addStyling } from '@plone/volto/helpers';
import config from '@plone/volto/registry';

import alignTopSVG from '@plone/volto/icons/move-up.svg';
import alignCenterSVG from '@plone/volto/icons/row.svg';
import alignBottomSVG from '@plone/volto/icons/move-down.svg';
import clearSVG from '@plone/volto/icons/clear.svg';

const ALIGN_INFO_MAP = {
  top: [alignTopSVG, 'Top'],
  center: [alignCenterSVG, 'Center'],
  bottom: [alignBottomSVG, 'Bottom'],
  '': [clearSVG, 'None'],
};

export const HeroBlockSchema = ({ data }) => {
  return {
    title: 'Hero',
    fieldsets: [
      {
        id: 'default',
        title: 'Default',
        fields: [
          'fullWidth',
          'fullHeight',
          ...(!data?.fullHeight ? ['height'] : []),
          'quoted',
          'spaced',
          'inverted',
          'buttonLabel',
          'buttonLink',
          'overlay',
          'image',
        ],
      },
      {
        id: 'copyright',
        title: 'Copyright',
        fields: ['copyright', 'copyrightIcon', 'copyrightPosition'],
      },
    ],
    properties: {
      fullWidth: {
        title: 'Full width',
        type: 'boolean',
        defaultValue: true,
      },
      fullHeight: {
        title: 'Full height',
        type: 'boolean',
        defaultValue: true,
      },
      quoted: {
        title: 'Quoted',
        type: 'boolean',
        defaultValue: false,
      },
      spaced: {
        title: 'Spaced',
        type: 'boolean',
        defaultValue: false,
      },
      inverted: {
        title: 'Inverted',
        type: 'boolean',
        defaultValue: true,
      },
      buttonLabel: {
        title: 'Button label',
        widget: 'textarea',
      },
      buttonLink: {
        title: 'Button link',
        widget: 'url',
      },
      overlay: {
        title: 'Image darken overlay',
        type: 'boolean',
        defaultValue: true,
      },
      image: {
        title: 'Image',
        widget: 'attachedimage',
      },
      copyright: {
        title: 'Text',
      },
      copyrightIcon: {
        title: 'Icon',
        description: (
          <>
            Ex. ri-copyright-line. See{' '}
            <a target="_blank" rel="noopener" href="https://remixicon.com/">
              Remix Icon set
            </a>
          </>
        ),
        default: 'ri-copyright-line',
      },
      copyrightPosition: {
        title: 'Align',
        widget: 'align',
        actions: ['left', 'right'],
        default: 'left',
      },
      height: {
        title: 'Height',
        description:
          'Use CSS numeric dimmension (ex: 100px or 20vh). ' +
          'Images cannnot be made smaller than min-height.',
      },
    },
    required: [],
  };
};

export const stylingSchema = (props) => {
  const schema = addStyling(props);
  schema.properties.styles.schema = {
    title: 'Hero style',
    block: 'hero',
    fieldsets: [
      {
        id: 'default',
        title: 'Default',
        fields: [
          'backgroundVariant',
          'bg',
          'alignContent',
          'textAlign',
          'textVariant',
          'buttonVariant',
          'buttonAlign',
        ],
      },
    ],
    properties: {
      bg: {
        title: 'Image position',
        widget: 'align',
        actions: Object.keys(ALIGN_INFO_MAP),
        actionsInfoMap: ALIGN_INFO_MAP,
        default: 'has--bg--center',
      },
      backgroundVariant: {
        title: 'Background theme',
        widget: 'theme_picker',
        colors: [
          ...(config.settings && config.settings.themeColors
            ? config.settings.themeColors.map(({ value, title }) => ({
                name: value,
                label: title,
              }))
            : []),
          //and add extra ones here
        ],
      },
      alignContent: {
        title: 'Content align',
        choices: [
          ['start', 'Top'],
          ['center', 'Center'],
          ['end', 'Bottom'],
        ],
        default: 'center',
      },
      textAlign: {
        title: 'Text align',
        widget: 'align',
        actions: ['left', 'center', 'right'],
        default: 'left',
      },
      textVariant: {
        title: 'Text theme',
        widget: 'theme_picker',
        colors: [
          ...(config.settings && config.settings.themeColors
            ? config.settings.themeColors.map(({ value, title }) => ({
                name: value,
                label: title,
              }))
            : []),
          //and add extra ones here
        ],
      },
      buttonVariant: {
        title: 'Button theme',
        widget: 'theme_picker',
        colors: [
          ...(config.settings && config.settings.themeColors
            ? config.settings.themeColors.map(({ value, title }) => ({
                name: value,
                label: title,
              }))
            : []),
          //and add extra ones here
        ],
      },
      buttonAlign: {
        title: 'Button align',
        widget: 'align',
        actions: ['left', 'center', 'right'],
        default: 'left',
      },
    },
    required: [],
  };
  return schema;
};
