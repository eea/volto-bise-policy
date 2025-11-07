import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Accordion, Button, Segment } from 'semantic-ui-react';
import { DragDropList, FormFieldWrapper, Icon } from '@plone/volto/components';
import { applySchemaDefaults, reorderArray } from '@plone/volto/helpers';
import ObjectWidget from '@plone/volto/components/manage/Widgets/ObjectWidget';

import upSVG from '@plone/volto/icons/up-key.svg';
import downSVG from '@plone/volto/icons/down-key.svg';
import deleteSVG from '@plone/volto/icons/delete.svg';
import addSVG from '@plone/volto/icons/add.svg';
import dragSVG from '@plone/volto/icons/drag.svg';
import { v4 as uuid } from 'uuid';

import { EuropeanRedListVocab, countryCodesVocab } from './vocabularies';
import './styles.less';
// import ObjectListWidget from '@plone/volto/components/manage/Widgets/ObjectListWidget';

const messages = defineMessages({
  labelRemoveItem: {
    id: 'Remove item',
    defaultMessage: 'Remove item',
  },
  labelCollapseItem: {
    id: 'Collapse item',
    defaultMessage: 'Collapse item',
  },
  labelShowItem: {
    id: 'Show item',
    defaultMessage: 'Show item',
  },
  emptyObjectList: {
    id: 'Empty object list',
    defaultMessage: 'Empty object list',
  },
  add: {
    id: 'Add (object list)',
    defaultMessage: 'Add',
  },
});

const BaseObjectListWidget = (props) => {
  const { block, fieldSet, id, schema, onChange, schemaExtender } = props;
  const value = props.value?.value || props.value || [];
  const [localActiveObject, setLocalActiveObject] = React.useState(
    props.activeObject ?? value.length - 1,
  );

  let activeObject, setActiveObject;
  if (
    (props.activeObject || props.activeObject === 0) &&
    props.setActiveObject
  ) {
    activeObject = props.activeObject;
    setActiveObject = props.setActiveObject;
  } else {
    activeObject = localActiveObject;
    setActiveObject = setLocalActiveObject;
  }

  const intl = useIntl();

  function handleChangeActiveObject(e, blockProps) {
    const { index } = blockProps;
    const newIndex = activeObject === index ? -1 : index;

    setActiveObject(newIndex);
  }
  const objectSchema = typeof schema === 'function' ? schema(props) : schema;

  const topLayerShadow = '0 1px 1px rgba(0,0,0,0.15)';
  const secondLayer = ', 0 10px 0 -5px #eee, 0 10px 1px -4px rgba(0,0,0,0.15)';
  const thirdLayer = ', 0 20px 0 -10px #eee, 0 20px 1px -9px rgba(0,0,0,0.15)';

  return (
    <div className="bise-objectlist-widget">
      <FormFieldWrapper {...props} noForInFieldLabel className="objectlist">
        <div className="add-item-button-wrapper">
          <Button
            compact
            icon
            aria-label={
              objectSchema.addMessage ||
              `${intl.formatMessage(messages.add)} ${objectSchema.title}`
            }
            onClick={(e) => {
              e.preventDefault();
              const data = {
                '@id': uuid(),
              };
              const objSchema = schemaExtender
                ? schemaExtender(schema, data, intl)
                : objectSchema;
              const dataWithDefaults = applySchemaDefaults({
                data,
                schema: objSchema,
                intl,
              });

              onChange(id, { value: [...value, dataWithDefaults] });
              setActiveObject(value.length);
            }}
          >
            <Icon name={addSVG} size="18px" />
            &nbsp;
            {/* Custom addMessage in schema, else default to English */}
            {objectSchema.addMessage ||
              `${intl.formatMessage(messages.add)} ${objectSchema.title}`}
          </Button>
        </div>
        {value.length === 0 && (
          <input
            aria-labelledby={`fieldset-${
              fieldSet || 'default'
            }-field-label-${id}`}
            type="hidden"
            value={intl.formatMessage(messages.emptyObjectList)}
          />
        )}
      </FormFieldWrapper>
      <DragDropList
        style={{
          boxShadow: `${topLayerShadow}${value.length > 1 ? secondLayer : ''}${
            value.length > 2 ? thirdLayer : ''
          }`,
        }}
        forwardedAriaLabelledBy={`fieldset-${
          fieldSet || 'default'
        }-field-label-${id}`}
        childList={value.map((o) => [o['@id'] || uuid(), o])}
        onMoveItem={(result) => {
          const { source, destination } = result;
          if (!destination) {
            return;
          }
          const newValue = reorderArray(value, source.index, destination.index);
          onChange(id, { value: newValue });
          return true;
        }}
      >
        {({ child, childId, index, draginfo }) => {
          return (
            <div
              ref={draginfo.innerRef}
              {...draginfo.draggableProps}
              key={childId}
            >
              <Accordion key={index} fluid styled>
                <Accordion.Title
                  active={activeObject === index}
                  index={index}
                  onClick={handleChangeActiveObject}
                  aria-label={`${
                    activeObject === index
                      ? intl.formatMessage(messages.labelCollapseItem)
                      : intl.formatMessage(messages.labelShowItem)
                  } #${index + 1}`}
                >
                  <button
                    style={{
                      visibility: 'visible',
                      display: 'inline-block',
                    }}
                    {...draginfo.dragHandleProps}
                    className="drag handle"
                  >
                    <Icon name={dragSVG} size="18px" />
                  </button>

                  <div className="accordion-title-wrapper">
                    {`${objectSchema.title} #${index + 1}`}
                  </div>
                  <div className="accordion-tools">
                    <button
                      aria-label={`${intl.formatMessage(
                        messages.labelRemoveItem,
                      )} #${index + 1}`}
                      onClick={() => {
                        onChange(id, {
                          value: value.filter((v, i) => i !== index),
                        });
                      }}
                    >
                      <Icon name={deleteSVG} size="20px" color="#e40166" />
                    </button>
                    {activeObject === index ? (
                      <Icon name={upSVG} size="20px" />
                    ) : (
                      <Icon name={downSVG} size="20px" />
                    )}
                  </div>
                </Accordion.Title>
                <Accordion.Content active={activeObject === index}>
                  <Segment>
                    <ObjectWidget
                      id={`${id}-${index}`}
                      key={`ow-${id}-${index}`}
                      block={block}
                      schema={
                        schemaExtender
                          ? schemaExtender(schema, child, intl)
                          : objectSchema
                      }
                      value={child}
                      onChange={(fi, fv) => {
                        const newvalue = value.map((v, i) =>
                          i !== index ? v : fv,
                        );
                        onChange(id, { value: newvalue });
                      }}
                    />
                  </Segment>
                </Accordion.Content>
              </Accordion>
            </div>
          );
        }}
      </DragDropList>
    </div>
  );
};

export const EUNISMSFDView = ({ value }) => {
  let parsedValue = value;

  if (typeof value === 'string') {
    try {
      parsedValue = JSON.parse(value);
    } catch (e) {
      return null;
    }
  }

  const items = Array.isArray(parsedValue)
    ? parsedValue
    : parsedValue?.value || [];

  if (!items || items.length === 0) return null;

  return (
    <div className="eunis-widget-view">
      {items.map((item) => (
        <div key={item['@id']} className="msfd-item">
          <div>
            {item.relation}
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
};

export const EUNISCodeView = ({ value }) => {
  if (!value) return value;

  return (
    <span>
      <a
        href={`/habitats_eunis_revised/EUNISrev_${value}`}
        target="_blank"
        rel="noopener"
      >
        {value}
      </a>
    </span>
  );
};

export const EUNISHDView = ({ value }) => {
  let parsedValue = value;

  if (typeof value === 'string') {
    try {
      parsedValue = JSON.parse(value);
    } catch (e) {
      return null;
    }
  }

  const items = Array.isArray(parsedValue)
    ? parsedValue
    : parsedValue?.value || [];

  if (!items || items.length === 0) return null;

  return (
    <div className="eunis-widget-view">
      {items.map((item) => (
        <div key={item['@id']} className="msfd-item">
          <div>
            {item.link ? (
              <>
                <span>{item.relation}</span>
                <a href={item.link}>{item.value}</a>
              </>
            ) : (
              <>
                <span>{item.relation}</span>
                <a
                  href={`/habitats/ANNEX1_${item.value}`}
                  target="_blank"
                  rel="noopener"
                >
                  {item.value}
                </a>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export const EUNISEuropeanRedListView = ({ value }) => {
  let parsedValue = value;

  if (typeof value === 'string') {
    try {
      parsedValue = JSON.parse(value);
    } catch (e) {
      return null;
    }
  }

  const items = Array.isArray(parsedValue)
    ? parsedValue
    : parsedValue?.value || [];

  if (!items || items.length === 0) return null;

  return (
    <div className="eunis-widget-view">
      {items.map((item) => (
        <div key={item['@id']} className="msfd-item">
          <div>
            {item.link ? (
              <>
                <span>{item.relation}</span>
                <a href={item.link}>{item.value}</a>
              </>
            ) : (
              <>
                <span>{item.relation}</span>
                <a
                  href={`/habitats_rl/REDLIST_${item.value.split(' - ')[1]}`}
                  target="_blank"
                  rel="noopener"
                >
                  {item.value}
                </a>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export const EUNISLinksToFinerEUNISHabitatsView = ({ value }) => {
  let parsedValue = value;

  if (typeof value === 'string') {
    try {
      parsedValue = JSON.parse(value);
    } catch (e) {
      return null;
    }
  }

  const items = Array.isArray(parsedValue)
    ? parsedValue
    : parsedValue?.value || [];

  if (!items || items.length === 0) return null;

  return (
    <div className="eunis-widget-view">
      {items.map((item) => (
        <div key={item['@id']} className="msfd-item">
          <div>
            {item.link ? (
              <>
                <a href={item.link}>{item.value}</a>
              </>
            ) : (
              <>
                <a
                  href={`/habitats_eunis_revised/EUNISrev_${item.value}`}
                  target="_blank"
                  rel="noopener"
                >
                  {item.value}
                </a>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export const EUNISCountryCodeView = ({ value }) => {
  let parsedValue = value;

  if (typeof value === 'string') {
    try {
      parsedValue = JSON.parse(value);
    } catch (e) {
      return null;
    }
  }

  const items = Array.isArray(parsedValue)
    ? parsedValue
    : parsedValue?.value || [];

  if (!items || items.length === 0) return null;

  return items.map((country) => (
    <div>
      <div key={country['@id']} className="country-item">
        {country.countryCode?.join(', ')}
      </div>
      <div className="eunis-widget-view">
        {country.national.map((item) => (
          <div key={item['@id']} className="msfd-item">
            <div>
              {item.relation}
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  ));
};

export const EUNISRegionalSeaConventionValueView = EUNISMSFDView;

const msfdSchema = {
  title: 'MSFD',
  fieldsets: [
    {
      id: 'default',
      title: 'default',
      fields: ['relation', 'value'],
    },
  ],
  properties: {
    relation: {
      title: 'Relation',
      choices: [
        ['=', '= equal to'],
        ['#', '# overlaps'],
        ['<', '< included in'],
        ['>', '> including'],
      ],
      required: true,
    },
    value: {
      title: 'Value',
      required: true,
    },
  },
  required: [],
};

const hdSchema = {
  title: 'HD (Annex I)',
  fieldsets: [
    {
      id: 'default',
      title: 'default',
      fields: ['relation', 'value'],
    },
  ],
  properties: {
    relation: {
      title: 'Relation',
      choices: [
        ['=', '= equal to'],
        ['#', '# overlaps'],
        ['<', '< included in'],
        ['>', '> including'],
      ],
      required: true,
    },
    value: {
      title: 'Value',
      required: true,
    },
    link: {
      title: 'Link',
      required: true,
    },
  },
  required: [],
};

const europeanRedlistSchema = {
  title: 'European Red List',
  fieldsets: [
    {
      id: 'default',
      title: 'default',
      fields: ['relation', 'value'],
    },
  ],
  properties: {
    relation: {
      title: 'Relation',
      choices: [
        ['=', '= equal to'],
        ['#', '# overlaps'],
        ['<', '< included in'],
        ['>', '> including'],
      ],
      required: true,
    },
    value: {
      title: 'Value',
      choices: EuropeanRedListVocab,
      required: true,
    },
    link: {
      title: 'Link',
      required: true,
    },
  },
  required: [],
};

const linksToFinerEUNISHabitatsSchema = {
  title: 'Links to finer EUNIS habitats',
  fieldsets: [
    {
      id: 'default',
      title: 'default',
      fields: ['value'],
    },
  ],
  properties: {
    value: {
      title: 'Value',
      required: true,
    },
    link: {
      title: 'Link',
      required: true,
    },
  },
  required: [],
};

const regionalSeaConventionValueSchema = {
  title: 'Regional Sea Convention Value',
  fieldsets: [
    {
      id: 'default',
      title: 'default',
      fields: ['relation', 'value'],
    },
  ],
  properties: {
    relation: {
      title: 'Relation',
      choices: [
        ['=', '= equal to'],
        ['#', '# overlaps'],
        ['<', '< included in'],
        ['>', '> including'],
      ],

      required: true,
    },
    value: {
      title: 'Value',
      required: true,
    },
  },
  required: [],
};

const nationalSchema = {
  title: 'National',
  fieldsets: [
    {
      id: 'default',
      title: 'default',
      fields: ['relation', 'value'],
    },
  ],
  properties: {
    relation: {
      title: 'Relation',
      choices: [
        ['=', '= equal to'],
        ['#', '# overlaps'],
        ['<', '< included in'],
        ['>', '> including'],
      ],
      required: true,
    },
    value: {
      title: 'Value',
      required: true,
    },
  },
  required: [],
};

const countryCodeSchema = {
  title: 'Country Code',
  fieldsets: [
    {
      id: 'default',
      title: 'default',
      fields: ['countryCode', 'national'],
    },
  ],
  properties: {
    countryCode: {
      title: 'Country Code',
      type: 'array',
      choices: countryCodesVocab,
    },
    national: {
      title: 'National',
      schema: nationalSchema,
      widget: 'object_list',
    },
  },
  required: [],
};

// const EUNIScountryCodeSchema = {
//   title: 'Country Codes',
//   fieldsets: [
//     {
//       id: 'default',
//       title: 'default',
//       fields: ['countries'],
//     },
//   ],
//   properties: {
//     countries: {
//       title: 'Countries',
//       schema: countryCodeSchema,
//       widget: 'object_list',
//     },
//   },
//   required: [],
// };

export const EUNISEuropeanRedListWidget = (props) => (
  <BaseObjectListWidget {...props} schema={europeanRedlistSchema} />
);

export const EUNISMSFDWidget = (props) => (
  <BaseObjectListWidget {...props} schema={msfdSchema} />
);

export const EUNISHDWidget = (props) => (
  <BaseObjectListWidget {...props} schema={hdSchema} />
);

export const EUNISLinksToFinerEUNISHabitatsWidget = (props) => (
  <BaseObjectListWidget {...props} schema={linksToFinerEUNISHabitatsSchema} />
);

export const EUNISRegionalSeaConventionValueWidget = (props) => (
  <BaseObjectListWidget {...props} schema={regionalSeaConventionValueSchema} />
);

export const EUNISCountryCodeWidget = (props) => (
  <BaseObjectListWidget {...props} schema={countryCodeSchema} />
);

export default BaseObjectListWidget;
