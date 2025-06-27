import { useEffect } from 'react';

const CustomJSBlockView = ({ data }) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.innerHTML = data?.jsCode || '';
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [data]);

  return null;
};

export default CustomJSBlockView;
