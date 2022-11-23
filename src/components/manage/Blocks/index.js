import installBodyClass from './BodyClass';
// import installConnectedMap from './ConnectedMap';
// import installDataCatalogue from './DataCatalogue';
import installFactsheetsListing from './FactsheetsListing';
import installKeyFacts from './KeyFacts';
import installMaesViewer from './MaesViewer';
import installNavigation from './Navigation';

export default (config) => {
  return [
    installBodyClass,
    // installConnectedMap,
    // installDataCatalogue,
    installFactsheetsListing,
    installKeyFacts,
    installMaesViewer,
    installNavigation,
  ].reduce((acc, apply) => apply(acc), config);
};
