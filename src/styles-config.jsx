import Icon from '@plone/volto/components/theme/Icon/Icon';
import contentBoxSVG from '@eeacms/volto-bise-policy/icons/content-box.svg';

const config = (config) => {
  const colors = [
    '#005248', // primary color
    '#00A390', // secondary color
    '#3D5265', // tertiary color
    '#FAC50D', // brand color
    // EEA brand colors
    '#F9F9F9',
    '#004B7F',
    '#007B6C',
    '#B83230', // error state
    '#FF9933', // warning state
    // green shade
    '#00CCB4',
    '#00F5D8',
    '#85FFF1',
    '#C8FFF8',
    // blue grey
    '#2E3E4C',
    '#4C677F',
    '#6989A5',
    '#8EA6C2',
    '#ACCAE5',
    '#DAE8F4',
    // yellow shade
    '#C35527',
    '#FDAF20',
    '#FAD936',
    '#FBEC9B',
    '#FEF6CD',
    // red shade
    '#5C1918',
    '#C65B59',
    '#D78890',
    '#E7B2C0',
    '#F6DDF0',
    '#FBEEF8',
    // blue shade
    '#003052',
    '#006BB8',
    '#0083E0',
    '#0A99FF',
    '#47B3FF',
    '#A0D7FF',
    // grey shade
    '#000000',
    '#323232',
    '#747678',
    '#BCBEC0',
    '#E6E7E8',
    '#FEFEFE',
    // Habitat group colors
    '#CDE6F7',
    '#DCEED6',
    '#FEE2D5',
    '#D6D7D9',
    '#E8A7C1',
    // white
    '#FFFFFF',
  ];
  config.settings.available_colors = [...new Set(colors)];

  config.blocks.blocksConfig.columnsBlock =
    config.blocks.blocksConfig.columnsBlock || {};
  config.blocks.blocksConfig.columnsBlock.available_colors = [
    ...config.settings.available_colors,
  ];

  config.settings.slate = config.settings.slate || {};
  config.settings.slate.styleMenu = config.settings.slate.styleMenu || {};
  config.settings.slate.styleMenu.inlineStyles = [
    ...(config.settings.slate.styleMenu?.inlineStyles || []),
    { cssClass: 'primary-big-text', label: 'Big text' },
    { cssClass: 'medium-text', label: 'Medium text' },
    { cssClass: 'small-text', label: 'Small text' },
    { cssClass: 'white-text', label: 'White text' },
    { cssClass: 'primary-text', label: 'Primary text' },
    { cssClass: 'secondary-text', label: 'Secondary text' },
    { cssClass: 'tertiary-text', label: 'Tertiary text' },
    { cssClass: 'dark-green-text', label: 'Dark green text' },
    { cssClass: 'blue-text', label: 'Blue text' },
    { cssClass: 'red-text', label: 'Red text' },
    { cssClass: 'yellow-text', label: 'Yellow text' },
    { cssClass: 'grey-text', label: 'Grey text' },
  ];
  config.settings.slate.toolbarButtons = [
    'italic',
    ...(config.settings.slate.toolbarButtons || []),
  ];

  config.settings.pluggableStyles = [
    ...(config.settings.pluggableStyles || []),
    {
      id: 'content-box-light-green',
      title: 'Light green',
      previewComponent: () => (
        <Icon name={contentBoxSVG} size="88px" className="light-green" />
      ),
      viewComponent: (props) => {
        return (
          <div className="content-box light-green">
            <div className="content-box-inner">{props.children}</div>
          </div>
        );
      },
    },
    {
      id: 'borderBlock',
      title: 'Border',
      cssClass: 'border-block',
    },
    {
      id: 'horizontalLine',
      title: 'Horizontal line',
      cssClass: 'horizontal-line',
    },
    {
      id: 'dividedBlock',
      title: 'Divided',
      cssClass: 'divided-block',
    },
    {
      id: 'shadedBlock',
      title: 'Shaded & Divided',
      cssClass: 'shaded-block',
    },
    {
      id: 'padded',
      title: 'Padded',
      cssClass: 'padded',
    },
    {
      id: 'marginless',
      title: 'Marginless',
      cssClass: 'marginless',
    },
    {
      id: 'roundedBlock',
      title: 'Rounded image',
      cssClass: 'rounded-block',
    },
    {
      id: 'mobileReversed',
      title: 'Mobile reversed',
      cssClass: 'mobile-reversed',
    },
    {
      id: 'relevantLink',
      title: 'Relevant link',
      cssClass: 'relevant-link',
    },
    {
      id: 'n2kList',
      title: 'N2k list',
      cssClass: 'n2k-list',
    },
    {
      id: 'n2kGreenBorder',
      title: 'N2k green border',
      cssClass: 'n2k-green-border',
    },
    {
      id: 'n2kCircle',
      title: 'N2k circle',
      cssClass: 'n2k-circle',
    },
  ];

  // Plotly bise color
  config.settings.plotlyCustomColors = [
    {
      title: 'A2',
      colorscale: [
        '#3D2201',
        '#603808',
        '#8B5E34',
        '#BC8A5F',
        '#E7BC91',
        '#FFEDD8',
        '#FFF6EC',
      ],
    },
    {
      title: 'A1',
      colorscale: ['#12957D', '#F9EA8A', '#DD552B', '#AEB0B3'],
    },
  ];

  return config;
};

export default config;
