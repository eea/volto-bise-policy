import { TextareaWidget } from '@plone/volto/components';

const CustomCSSBlockEdit = ({ data, onChangeBlock, block }) => {
  return (
    <TextareaWidget
      id="cssCode"
      title="Inline CSS"
      value={data.cssCode}
      onChange={(id, value) => onChangeBlock(block, { ...data, cssCode: value })}
    />
  );
};

export default CustomCSSBlockEdit;
