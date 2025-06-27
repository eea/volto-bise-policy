import { TextareaWidget } from '@plone/volto/components';

const CustomJSBlockEdit = ({ data, onChangeBlock, block }) => {
  return (
    <TextareaWidget
      id="jsCode"
      title="Inline JavaScript"
      value={data.jsCode}
      onChange={(id, value) => onChangeBlock(block, { ...data, jsCode: value })}
    />
  );
};

export default CustomJSBlockEdit;
