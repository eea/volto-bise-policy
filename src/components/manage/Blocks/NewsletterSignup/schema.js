export default {
  title: 'Newsletter signup',

  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: ['hasImage', 'imgSrc'],
    },
  ],

  properties: {
    hasImage: {
      title: 'Has image',
      type: 'boolean',
      default: true,
    },
    imgSrc: {
      title: 'Image',
      widget: 'attachedimage',
    },
  },

  required: [],
};
