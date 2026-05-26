import React from 'react';
import BodyClass from '@plone/volto/helpers/BodyClass/BodyClass';

const View = (props) => {
  return (
    <>
      <BodyClass className={props.data.class || ''} />
    </>
  );
};

export default View;
