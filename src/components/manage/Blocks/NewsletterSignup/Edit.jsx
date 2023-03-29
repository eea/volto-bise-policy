import React from 'react';
import { BlockDataForm, SidebarPortal } from '@plone/volto/components';
import View from './View';

import schema from './schema';

const Edit = (props) => {
  return (
    <>
      <View {...props} mode="edit" />
      <SidebarPortal selected={props.selected}>
        <BlockDataForm
          schema={schema}
          title={schema.title}
          onChangeField={(id, value) => {
            props.onChangeBlock(props.block, {
              ...props.data,
              [id]: value,
            });
          }}
          onChangeBlock={props.onChangeBlock}
          formData={props.data}
          block={props.block}
        />
      </SidebarPortal>
    </>
  );
};

export default Edit;
