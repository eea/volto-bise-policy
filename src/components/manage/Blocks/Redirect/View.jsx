import { useEffect } from 'react';
import { flattenToAppURL } from '@plone/volto/helpers';

const View = (props) => {
  useEffect(() => {
    props.history.push(flattenToAppURL(props.data.url));
    /* eslint-disable-next-line */
  }, []);

  return null;
};

export default View;
