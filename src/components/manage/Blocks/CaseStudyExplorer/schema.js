const schema = {
  title: 'NRR Case Study Explorer',
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: ['filter_path'],
    },
  ],
  properties: {
    filter_path: {
      title: 'Filter path',
      type: 'string',
    },
  },
  required: [],
};

export default schema;
