import { useEffect } from 'react';

const CustomCSSBlockView = ({ data }) => {
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = data?.cssCode || '';
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [data]);

  return null;
};

export default CustomCSSBlockView;
