import React from 'react';
import superagent from 'superagent';

// const cases_url = '@@case-studies-map.arcgis.json';

/**
 * Fetch the case studies from the backend. The fetch is slow enough on a
 * cold load that the explorer has to say so: `loading` drives the initial
 * spinner and `error` (with `reload`) drives the retry state.
 */
export function useCases(url) {
  const [state, setState] = React.useState({
    cases: [],
    loading: true,
    error: false,
  });
  const [attempt, setAttempt] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;
    setState({ cases: [], loading: true, error: false });

    superagent
      .get(url)
      .set('accept', 'json')
      .then((resp) => {
        if (cancelled) return;
        const res = JSON.parse(resp.text);
        setState({ cases: res.features || [], loading: false, error: false });
      })
      .catch(() => {
        if (cancelled) return;
        setState({ cases: [], loading: false, error: true });
      });

    return () => {
      cancelled = true;
    };
  }, [url, attempt]);

  const reload = React.useCallback(() => setAttempt((count) => count + 1), []);

  return { ...state, reload };
}
