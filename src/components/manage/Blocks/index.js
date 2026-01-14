import installBodyClass from './BodyClass';
import installCustomJS from './CustomJS';
import installCustomCSS from './CustomCSS';
import installRedirect from './Redirect';
import installFactsheetsListing from './FactsheetsListing';
import installKeyFacts from './KeyFacts';
import installMaesViewer from './MaesViewer';
import installNavigation from './Navigation';
import installCaseStudyExplorer from './CaseStudyExplorer';

const config = (config) => {
  return [
    installBodyClass,
    installCustomJS,
    installCustomCSS,
    installRedirect,
    installFactsheetsListing,
    installKeyFacts,
    installMaesViewer,
    installNavigation,
    installCaseStudyExplorer,
  ].reduce((acc, apply) => apply(acc), config);
};

export default config;
