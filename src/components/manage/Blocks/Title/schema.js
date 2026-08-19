import CountryFlagSchema from '@eeacms/volto-datablocks/components/manage/Blocks/CountryFlag/schema';
import countryNames from '@eeacms/volto-datablocks/components/manage/Blocks/CountryFlag/data/countries';

export const countryProfileSchemaEnhancer = ({ schema, intl }) => {
  const cfSchema = CountryFlagSchema(intl);

  cfSchema.properties.country_name.choices = Object.keys(countryNames).map(
    (k) => [k, countryNames[k]],
  );

  schema.fieldsets.push(
    {
      id: 'countryFlag',
      title: 'Country flag',
      fields: [
        'country_name',
        'show_name',
        'show_flag',
        'show_dropdown',
        'render_as',
      ],
    },
    {
      id: 'dropdownItems',
      title: 'Dropdown items',
      fields: ['querystring', 'exclude'],
    },
  );

  schema.properties = {
    ...schema.properties,
    country_name: cfSchema.properties.country_name,
    show_name: cfSchema.properties.show_name,
    show_flag: cfSchema.properties.show_flag,
    show_dropdown: cfSchema.properties.show_dropdown,
    render_as: cfSchema.properties.render_as,
    querystring: cfSchema.properties.querystring,
    exclude: cfSchema.properties.exclude,
  };

  return schema;
};
