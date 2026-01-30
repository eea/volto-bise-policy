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
        {items.map((item, index) => (
          <li key={item['@id'] ?? index}>
            <p>{item.title}</p>
          </li>
        ))}
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
