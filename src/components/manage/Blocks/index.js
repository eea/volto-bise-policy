import installBodyClass from './BodyClass';
import installRedirect from './Redirect';
import installFactsheetsListing from './FactsheetsListing';
import installKeyFacts from './KeyFacts';
import installMaesViewer from './MaesViewer';
import installNavigation from './Navigation';
import installNewsletter from './NewsletterSignup';

export default (config) => {
  return [
    installBodyClass,
    installRedirect,
    installFactsheetsListing,
    installKeyFacts,
    installMaesViewer,
    installNavigation,
    installNewsletter,
  ].reduce((acc, apply) => apply(acc), config);
};
