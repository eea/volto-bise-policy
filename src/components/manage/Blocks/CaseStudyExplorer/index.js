import worldSVG from '@plone/volto/icons/world.svg';
import CaseStudyExplorerEdit from './CaseStudyExplorerEdit';
import CaseStudyExplorerView from './CaseStudyExplorerView';

export default function installCaseStudyExplorerBlock(config) {
  config.blocks.blocksConfig.caseStudyExplorer = {
    id: 'caseStudyExplorer',
    title: 'NRR Case Study Explorer',
    icon: worldSVG,
    group: 'custom_blocks',
    edit: CaseStudyExplorerEdit,
    view: CaseStudyExplorerView,
  };

  return config;
}
