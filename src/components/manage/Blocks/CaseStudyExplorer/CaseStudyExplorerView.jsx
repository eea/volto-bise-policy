import React from 'react';
import { useIntl } from 'react-intl';
import { addAppURL } from '@plone/volto/helpers/Url/Url';

import CaseStudyMap from './CaseStudyMapLazy';
import CaseStudyResults from './CaseStudyResults';
import FilterPanel from './FilterPanel';
import {
  EMPTY_FILTERS,
  buildFacets,
  clearFilters,
  filterCases,
  sortCases,
} from './filters';
import { useCases } from './hooks';
// import { prefersReducedMotion } from './utils';
import messages from './messages';

import './styles.less';

const measureIdFromLocation = () => {
  if (typeof window === 'undefined') return null;

  return new URLSearchParams(window.location.search).get('measure');
};

const withoutSelection = (filters, facet, value) => {
  const selected = filters[facet] || [];

  return {
    ...filters,
    [facet]: selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value],
  };
};

export default function CaseStudyExplorerView(props) {
  const intl = useIntl();
  // const cases_url = 'http://localhost:3000/@@case-studies-map.arcgis.json';
  const cases_url = addAppURL('/@@case-studies-map.arcgis.json');
  const { cases, loading, error, reload } = useCases(cases_url);

  const { filter_path } = props.data || {};
  const filterPath = filter_path;
  const [measureId] = React.useState(measureIdFromLocation);

  const [filters, setFilters] = React.useState(EMPTY_FILTERS);
  const [selectedPath, setSelectedPath] = React.useState(null);
  const [sortBy, setSortBy] = React.useState('title');
  const [perPage, setPerPage] = React.useState(4);
  const [page, setPage] = React.useState(1);
  const [focusRequest, setFocusRequest] = React.useState(null);
  const [resetRequest, setResetRequest] = React.useState(null);
  const [map, setMap] = React.useState();
  // The explorer only exists on the client (it fetches its own data and the map
  // needs OpenLayers), but the first client render has to match the empty
  // server output. `mounted` keeps both sides in sync: SSR and hydration
  // render nothing, the next render shows the explorer.
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const narrowing = React.useMemo(
    () => ({ filterPath, measureId }),
    [filterPath, measureId],
  );
  const facets = React.useMemo(
    () => buildFacets(cases, filters, narrowing),
    [cases, filters, narrowing],
  );
  const narrowedResults = React.useMemo(
    () => sortCases(filterCases(cases, filters, narrowing), sortBy),
    [cases, filters, narrowing, sortBy],
  );

  // Every filter change is applied immediately: there is no Apply step.
  const toggleFacet = React.useCallback((facet, value) => {
    setFilters((current) => withoutSelection(current, facet, value));
    setPage(1);
  }, []);

  const changeQuery = React.useCallback((query) => {
    setFilters((current) => ({ ...current, query }));
    setPage(1);
  }, []);

  const resetFilters = React.useCallback(() => {
    setFilters(clearFilters());
    setPage(1);
    setSelectedPath(null);
  }, []);

  // Selecting a case study on the map also brings its card into view: if it
  // lives on another page of the results, jump to that page first.
  const selectCase = React.useCallback(
    (path) => {
      setSelectedPath(path);
      if (!path) return;

      const index = narrowedResults.findIndex(
        (item) => item.properties?.path === path,
      );
      if (index === -1) return;

      setPage(Math.floor(index / perPage) + 1);

      // const card = document.getElementById(
      //   `cse-card-${encodeURIComponent(path)}`,
      // );
      // card?.scrollIntoView({
      //   behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      //   block: 'center',
      // });
    },
    [narrowedResults, perPage],
  );

  const showOnMap = React.useCallback((item) => {
    const path = item?.properties?.path;
    if (!path) return;

    setSelectedPath(path);
    setFocusRequest({ path, nonce: Date.now() });
    // scrollToElement('cse-map-container');
  }, []);

  // "Reset map" on an already selected card: drop the selection and send the
  // map back to its default extent, exactly like the map's own reset button.
  const resetMap = React.useCallback(() => {
    setSelectedPath(null);
    setResetRequest({ nonce: Date.now() });
  }, []);

  if (!mounted) return null;

  // The explorer is empty until the backend answers, so say what is going on
  // instead of flashing an empty map and a "no results" message.
  if (loading) {
    return (
      <div className="cse-explorer">
        <div className="cse-loading" role="status" aria-live="polite">
          <span className="cse-loading-spinner" aria-hidden="true" />
          {intl.formatMessage(messages.loadingCaseStudies)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cse-explorer">
        <div className="cse-loading" role="alert">
          <p className="cse-loading-message">
            {intl.formatMessage(messages.errorCaseStudies)}
          </p>
          <button type="button" className="cse-loading-retry" onClick={reload}>
            {intl.formatMessage(messages.retry)}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cse-explorer">
      <FilterPanel
        facets={facets}
        filters={filters}
        onToggle={toggleFacet}
        onQueryChange={changeQuery}
        onReset={resetFilters}
      />

      <div className="cse-layout">
        <div className="cse-layout-map">
          <CaseStudyMap
            items={narrowedResults}
            selectedPath={selectedPath}
            onSelect={selectCase}
            map={map}
            setMap={setMap}
            focusRequest={focusRequest}
            resetRequest={resetRequest}
          />
        </div>

        <div className="cse-layout-results" id="cse-results">
          <CaseStudyResults
            items={narrowedResults}
            selectedPath={selectedPath}
            onShowOnMap={showOnMap}
            onResetMap={resetMap}
            sortBy={sortBy}
            onSortChange={(value) => {
              setSortBy(value);
              setPage(1);
            }}
            perPage={perPage}
            onPerPageChange={(value) => {
              setPerPage(value);
              setPage(1);
            }}
            page={page}
            onPageChange={setPage}
            onResetFilters={resetFilters}
          />
        </div>
      </div>
    </div>
  );
}
