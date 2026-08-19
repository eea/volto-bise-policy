import React from 'react';
import SidebarPortal from '@plone/volto/components/manage/Sidebar/SidebarPortal';
import InlineForm from '@plone/volto/components/manage/Form/InlineForm';
import CaseStudyExplorerView from './CaseStudyExplorerView';
import schema from './schema';

export default function CaseStudyExplorerEdit(props) {
  return (
    <>
      <CaseStudyExplorerView {...props} mode="edit" />
      <SidebarPortal selected={props.selected}>
        <InlineForm
          schema={schema}
          title={schema.title}
          onChangeField={(id, value) => {
            props.onChangeBlock(props.block, {
              ...props.data,
              [id]: value,
            });
          }}
          formData={props.data}
        />
      </SidebarPortal>
    </>
  );
}
