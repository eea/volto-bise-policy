import React from 'react';
import { Grid } from 'semantic-ui-react'; // Dropdown,
import { addAppURL } from '@plone/volto/helpers/Url/Url';
// import config from '@plone/volto/registry';
import CaseStudyMap from './CaseStudyMap';
import { ActiveFilters, CaseStudyFilters, SearchBox } from './CaseStudyFilters';
// import CaseStudyList from './CaseStudyListing';

import { filterCases, filterCasesByPath, getFilters } from './utils';
import { useCases } from './hooks';

import './styles.less';

export default function CaseStudyExplorerView(props) {
  const cases_url = '/@@case-studies-map.arcgis.json';
  let cases = useCases(addAppURL(cases_url));
  const { caseStudiesIds, data } = props; // case studies from measure view
  const { filter_path } = data || {};
  const [selectedCase, onSelectedCase] = React.useState(null);
  const [searchInput, setSearchInput] = React.useState('');
  const hideFilters = caseStudiesIds ? true : false;

  const [activeFilters, setActiveFilters] = React.useState({
    measures_implemented: [],
    typology_of_measures: [],
    current_status: [],
    habitat_ecosystem_type: [],
    nrr_article: [],
    scale_of_planning: [],
  });

  const [activeItems, setActiveItems] = React.useState(cases);
  const [filters, setFilters] = React.useState([]);
  const [map, setMap] = React.useState();
  const pathFilteredCases = React.useMemo(
    () => filterCasesByPath(cases, filter_path),
    [cases, filter_path],
  );

  React.useEffect(() => {
    const _filters = getFilters(pathFilteredCases);
    setFilters(_filters);
  }, [pathFilteredCases, activeFilters, activeItems.length]);

  React.useEffect(() => {
    let activeItems = filterCases(
      cases,
      activeFilters,
      caseStudiesIds,
      searchInput,
      filter_path,
    );

    setActiveItems(activeItems);
  }, [caseStudiesIds, activeFilters, cases, searchInput, filter_path]);

  if (__SERVER__) return '';

  return (
    <div className="searchlib-block">
      <Grid.Row>
        {hideFilters ? null : (
          <SearchBox
            filters={filters}
            activeFilters={activeFilters}
            setActiveFilters={setActiveFilters}
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            map={map}
          />
        )}
      </Grid.Row>
      <Grid.Row>
        {hideFilters ? null : (
          <ActiveFilters
            filters={filters}
            activeFilters={activeFilters}
            setActiveFilters={setActiveFilters}
          />
        )}
      </Grid.Row>
      <Grid.Row stretched={true} id="cse-filter">
        {hideFilters ? null : (
          <CaseStudyFilters
            filters={filters}
            activeFilters={activeFilters}
            setActiveFilters={setActiveFilters}
            map={map}
          />
        )}
      </Grid.Row>
      <Grid.Row>
        {pathFilteredCases.length ? (
          <Grid columns={12}>
            <Grid.Column mobile={12} tablet={12} computer={12}>
              <CaseStudyMap
                items={pathFilteredCases}
                activeItems={activeItems}
                hideFilters={hideFilters}
                selectedCase={selectedCase}
                onSelectedCase={onSelectedCase}
                searchInput={searchInput}
                map={map}
                setMap={setMap}
              />
            </Grid.Column>
          </Grid>
        ) : null}
      </Grid.Row>
    </div>
  );
}
