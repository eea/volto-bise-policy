import React from 'react';

import CaseStudyMap from './CaseStudyMap';

const ROOT_MARGIN = '600px';

/**
 * True once the element is within `ROOT_MARGIN` of the viewport. Stays true
 * afterwards so scrolling away does not tear the map down.
 *
 * `enabled` delays observing until the element is actually rendered (the
 * explorer renders nothing while its data is still loading).
 */
export const useNearViewport = (elementRef, enabled = true) => {
  const [near, setNear] = React.useState(false);

  React.useEffect(() => {
    if (!enabled || near) return undefined;

    const element = elementRef.current;
    if (!element) return undefined;

    if (typeof IntersectionObserver === 'undefined') {
      setNear(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: ROOT_MARGIN },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [elementRef, enabled, near]);

  return near;
};

/**
 * OpenLayers is roughly 1MB of JavaScript and the explorer usually sits far
 * below the fold, so `<CaseStudyMap>` (and with it the OpenLayers chunk) is
 * only mounted once the visitor is about to reach it. The slot keeps the
 * map's height so deferring does not move the rest of the page.
 */
export default function CaseStudyMapLazy(props) {
  const slotRef = React.useRef(null);
  const hasItems = (props.items || []).length > 0;
  const near = useNearViewport(slotRef, hasItems);

  if (!hasItems) return null;

  return (
    <div className="cse-map-slot" ref={slotRef}>
      {near ? <CaseStudyMap {...props} /> : null}
    </div>
  );
}
