import { UniversalLink } from '@plone/volto/components';
import { Button, Popup } from 'semantic-ui-react';
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
    <div className="eunis-widget-view">
      <span>
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
    </div>
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
    <div className="eunis-widget-viewZ">
      <span>
        <b>NRR Article: </b>
      </span>
      {items.map((item) => (
        <span key={item['@id']}>
          {item.title.split(' - ')[0].split(' ')[1]}
          {items.indexOf(item) < items.length - 1 ? ', ' : ''}
        </span>
      ))}
    </div>
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
    <div className="eunis-widget-viewZ">
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
    </div>
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
    <div className="eunis-widget-viewZ">
      <ul>
        {items.map((item, index) => (
          <li key={item['@id'] ?? index}>
            <UniversalLink href={item['@id']}>{item.title}</UniversalLink>
          </li>
        ))}
      </ul>
    </div>
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
    <div className="eunis-widget-view">
      <span>
        <b>Ecosystem type: </b>
      </span>
      {items.map((item) => (
        <span key={item['@id']}>
          {item.title}
          {items.indexOf(item) < items.length - 1 ? ', ' : ''}
        </span>
      ))}
    </div>
  );
};
