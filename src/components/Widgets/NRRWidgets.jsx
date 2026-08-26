import UniversalLink from '@plone/volto/components/manage/UniversalLink/UniversalLink';
import { Popup } from 'semantic-ui-react';

/**
 * Normalize a relation/array field value into a plain array.
 * Handles a JSON-encoded string, a raw array, or an object with a `value` array.
 * Returns [] when the value can't be parsed or is empty.
 */
const parseItems = (value) => {
  let parsedValue = value;

  if (typeof value === 'string') {
    try {
      parsedValue = JSON.parse(value);
    } catch (e) {
      return [];
    }
  }

  return Array.isArray(parsedValue) ? parsedValue : parsedValue?.value || [];
};

const Label = ({ label, secondary = false }) =>
  label ? (
    <span className={secondary ? 'secondary' : undefined}>
      <b>{label}: </b>
    </span>
  ) : null;

/** Renders a labeled list of items separated by commas. */
const InlineList = ({ label, secondary, items, render }) => (
  <p>
    <Label label={label} secondary={secondary} />
    {items.map((item, index) => (
      <span key={item['@id'] ?? index}>
        {render(item)}
        {index < items.length - 1 ? ', ' : ''}
      </span>
    ))}
  </p>
);

/** Renders a labeled <ul> of items. */
const LinkedList = ({ label, secondary, items, render }) => (
  <div className="nrr-linked-list">
    <Label label={label} secondary={secondary} />
    <ul>
      {items.map((item, index) => (
        <li key={item['@id'] ?? index}>{render(item)}</li>
      ))}
    </ul>
  </div>
);

export const NRRTypologyOfMeasuresView = ({ value }) => {
  const items = parseItems(value);
  if (items.length === 0) return null;

  return (
    <LinkedList
      label="Related typology of measures"
      secondary
      items={items}
      render={(item) => {
        const parts = item.title.split(' - ');
        const code = parts.slice(0, 2).join(' - ');
        const description = parts[parts.length - 1];
        return <Popup content={description} trigger={<b>{code}</b>} />;
      }}
    />
  );
};

export const NRRArticleView = ({ value }) => {
  const items = parseItems(value);
  if (items.length === 0) return null;

  return (
    <InlineList
      label="NRR Article"
      secondary
      items={items}
      render={(item) => item.title.split(' - ')[0].split(' ')[1]}
    />
  );
};

export const NRRrelatedCaseStudiesView = ({ value }) => {
  const items = parseItems(value);
  if (items.length === 0) return null;

  return (
    <LinkedList
      label="Related Case Studies"
      items={items}
      render={(item) => (
        <UniversalLink href={item['@id']}>{item.title}</UniversalLink>
      )}
    />
  );
};

export const NRRMeasuresImplementedView = ({ value }) => {
  const items = parseItems(value);
  if (items.length === 0) return null;

  return (
    <LinkedList
      items={items}
      render={(item) => (
        <UniversalLink href={item['@id']}>{item.title}</UniversalLink>
      )}
    />
  );
};

export const NRREcosystemTypologyView = ({ value }) => {
  const items = parseItems(value);
  if (items.length === 0) return null;

  return (
    <InlineList
      label="Ecosystem type"
      items={items}
      render={(item) => item.title}
    />
  );
};

export const NRRHabitatEcosystemTypeView = ({ value }) => {
  const items = parseItems(value);
  if (items.length === 0) return null;

  return (
    <InlineList
      label="Habitat/Ecosystem type"
      secondary
      items={items}
      render={(item) => item.title}
    />
  );
};

export const NRRScaleOfPlanningView = ({ value }) => {
  const items = parseItems(value);
  if (items.length === 0) return null;

  return (
    <InlineList
      label="Scale of planning"
      secondary
      items={items}
      render={(item) => item.title}
    />
  );
};

export const NRRCurrentStatusView = ({ value }) => {
  let parsedValue = value;

  if (typeof value === 'string') {
    try {
      parsedValue = JSON.parse(value);
    } catch (e) {
      // Not JSON — keep the raw string value.
    }
  }

  // Choice field: value is a single token, not an array.
  if (!parsedValue) return null;

  const text =
    typeof parsedValue === 'string'
      ? parsedValue
      : parsedValue?.title || parsedValue?.token || parsedValue?.value;

  if (!text) return null;

  return (
    <p>
      <Label label="Current status" secondary />
      {text}
    </p>
  );
};
