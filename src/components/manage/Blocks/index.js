import installBodyClass from './BodyClass';
import installFactsheetsListing from './FactsheetsListing';
import installKeyFacts from './KeyFacts';
import installMaesViewer from './MaesViewer';
import installNavigation from './Navigation';

export default (config) => {
  return [
    installBodyClass,
    installFactsheetsListing,
    installKeyFacts,
    installMaesViewer,
    installNavigation,
  ].reduce((acc, apply) => apply(acc), config);
};
