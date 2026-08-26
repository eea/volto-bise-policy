import UniversalLink from '@plone/volto/components/manage/UniversalLink/UniversalLink';
import { Popup } from 'semantic-ui-react';

export const NRRTypologyOfMeasuresView = ({ value }) => {
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
    <p>
      <span className="secondary">
        <b>Related typology of measures: </b>
      </span>
      <ul>
        {items.map((item) => {
          const description = item.title.split(' - ')?.pop();
          const code = item.title.split(' - ').slice(0, 2).join(' - ');
          return (
            <li key={item['@id']}>
              <Popup content={description} trigger={<b>{code}</b>} />
            </li>
          );
        })}
      </ul>
    </p>
  );
};

export const NRRArticleView = ({ value }) => {
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
    <p>
      <span className="secondary">
        <b>NRR Article: </b>
      </span>
      {items.map((item) => (
        <span key={item['@id']}>
          {item.title.split(' - ')[0].split(' ')[1]}
          {items.indexOf(item) < items.length - 1 ? ', ' : ''}
        </span>
      ))}
    </p>
  );
};

export const NRRrelatedCaseStudiesView = ({ value }) => {
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
    <p>
      <span>
        <b>Related Case Studies: </b>
      </span>
      <ul>
        {items.map((item, index) => (
          <li key={item['@id'] ?? index}>
            <UniversalLink href={item['@id']}>{item.title}</UniversalLink>
          </li>
        ))}
      </ul>
    </p>
  );
};

export const NRRMeasuresImplementedView = ({ value }) => {
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
    <p>
      <ul>
        {items.map((item, index) => (
          <li key={item['@id'] ?? index}>
            <UniversalLink href={item['@id']}>{item.title}</UniversalLink>
          </li>
        ))}
      </ul>
    </p>
  );
};

export const NRREcosystemTypologyView = ({ value }) => {
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
    <p>
      <span>
        <b>Ecosystem type: </b>
      </span>
      {items.map((item) => (
        <span key={item['@id']}>
          {item.title}
          {items.indexOf(item) < items.length - 1 ? ', ' : ''}
        </span>
      ))}
    </p>
  );
};

export const NRRHabitatEcosystemTypeView = ({ value }) => {
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
    <p>
      <span className="secondary">
        <b>Habitat/Ecosystem type: </b>
      </span>
      {items.map((item) => (
        <span key={item['@id']}>
          {item.title}
          {items.indexOf(item) < items.length - 1 ? ', ' : ''}
        </span>
      ))}
    </p>
  );
};

export const NRRScaleOfPlanningView = ({ value }) => {
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
    <p>
      <span className="secondary">
        <b>Scale of planning: </b>
      </span>
      {items.map((item) => (
        <span key={item['@id']}>
          {item.title}
          {items.indexOf(item) < items.length - 1 ? ', ' : ''}
        </span>
      ))}
    </p>
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
      <span className="secondary">
        <b>Current status: </b>
      </span>
      {text}
    </p>
  );
};
