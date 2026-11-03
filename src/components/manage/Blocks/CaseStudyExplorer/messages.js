import { defineMessages } from 'react-intl';

/**
 * Every user-visible string of the case study explorer. Ids are the English
 * source text, so the existing i18n extraction keeps working.
 */
export default defineMessages({
  filterPanelTitle: {
    id: 'Filter and explore',
    defaultMessage: 'Filter and explore',
  },
  filterPanelHint: {
    id: 'Find case studies and measures',
    defaultMessage: 'Find case studies and measures',
  },
  resetFilters: {
    id: 'Reset filters',
    defaultMessage: 'Reset filters',
  },
  searchValues: {
    id: 'Search values…',
    defaultMessage: 'Search values…',
  },
  noOptionsAvailable: {
    id: 'No options available',
    defaultMessage: 'No options available',
  },
  noMatchingOptions: {
    id: 'No matching values',
    defaultMessage: 'No matching values',
  },
  searchMeasuresLabel: {
    id: 'Search measures and typology',
    defaultMessage: 'Search measures and typology',
  },
  searchMeasuresPlaceholder: {
    id: 'Type a measure or typology of measures…',
    defaultMessage: 'Type a measure or typology of measures…',
  },
  clearSearch: {
    id: 'Clear the search',
    defaultMessage: 'Clear the search',
  },
  facetLegislation: {
    id: 'Legislation',
    defaultMessage: 'Legislation',
  },
  facetEcosystem: {
    id: 'Habitat/ecosystem',
    defaultMessage: 'Habitat/ecosystem',
  },
  facetBioregion: {
    id: 'Biogeographical region',
    defaultMessage: 'Biogeographical region',
  },
  facetScale: {
    id: 'Scale of planning',
    defaultMessage: 'Scale of planning',
  },
  facetStatus: {
    id: 'Current status',
    defaultMessage: 'Current status',
  },
  statusPlanned: { id: 'Planned', defaultMessage: 'Planned' },
  statusOngoing: { id: 'Ongoing', defaultMessage: 'Ongoing' },
  statusCompleted: { id: 'Completed', defaultMessage: 'Completed' },
  resultsShowing: {
    id: 'Found {count} case studies',
    defaultMessage: 'Found {count} case studies',
  },
  resultsShowingOne: {
    id: 'Found 1 case study',
    defaultMessage: 'Found 1 case study',
  },
  sortBy: { id: 'Sort by', defaultMessage: 'Sort by' },
  sortTitle: { id: 'A to Z', defaultMessage: 'A to Z' },
  sortNewest: { id: 'Newest', defaultMessage: 'Newest' },
  perPage: { id: 'per page', defaultMessage: 'per page' },
  noResultsTitle: {
    id: 'No case studies match your filters',
    defaultMessage: 'No case studies match your filters',
  },
  noResultsHint: {
    id: 'Try removing a filter or resetting the filters.',
    defaultMessage: 'Try removing a filter or resetting the filters.',
  },
  relatedMeasures: {
    id: 'Related NRR measure(s)',
    defaultMessage: 'Related NRR measure(s)',
  },
  moreEcosystems: {
    id: '+{count}',
    defaultMessage: '+{count}',
  },
  resetMap: { id: 'Reset map', defaultMessage: 'Reset map' },
  loadingCaseStudies: {
    id: 'Loading case studies…',
    defaultMessage: 'Loading case studies…',
  },
  loadingMap: {
    id: 'Loading map…',
    defaultMessage: 'Loading map…',
  },
  errorCaseStudies: {
    id: 'The case studies could not be loaded.',
    defaultMessage: 'The case studies could not be loaded.',
  },
  retry: { id: 'Try again', defaultMessage: 'Try again' },
  mapLegend: {
    id: 'Map legend',
    defaultMessage: 'Map legend',
  },
  showOnMap: { id: 'Show on map', defaultMessage: 'Show on map' },
  opensInNewTab: {
    id: '(opens in a new tab)',
    defaultMessage: '(opens in a new tab)',
  },
  openCaseStudy: {
    id: 'Open the case study',
    defaultMessage: 'Open the case study',
  },
  pagination: { id: 'Pagination', defaultMessage: 'Pagination' },
  resultsHeading: {
    id: 'Case studies',
    defaultMessage: 'Case studies',
  },
  previousPage: { id: 'Previous page', defaultMessage: 'Previous page' },
  nextPage: { id: 'Next page', defaultMessage: 'Next page' },
  pageNumber: { id: 'Page {page}', defaultMessage: 'Page {page}' },
  selectedCount: {
    id: '{label} ({count} selected)',
    defaultMessage: '{label} ({count} selected)',
  },
});
