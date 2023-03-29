import { withBlockExtensions } from '@plone/volto/helpers';

const View = (props) => {
  const Renderer = props.variation.render;

  return (
    <>
      <Renderer {...props} />
    </>
  );
};

export default withBlockExtensions(View);
