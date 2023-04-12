const path = require('path');
const plugins = (defaultPlugins) => {
  return defaultPlugins;
};
const modify = (config, { target, dev }, webpack) => {
  const themeConfigPath = `${__dirname}/theme/theme.config`;
  config.resolve.alias['../../theme.config$'] = themeConfigPath;
  config.resolve.alias['../../theme.config'] = themeConfigPath;
  config.resolve.alias['../../theme'] = `${__dirname}/theme`;
  const projectRootPath = path.resolve('.');
  const themeLessPath = `${projectRootPath}/node_modules/@eeacms/volto-spotlight/theme`;

  config.resolve.alias['volto-spotlight-theme'] = dev
    ? `${projectRootPath}/src/addons/volto-spotlight/theme/themes/spotlight`
    : `${themeLessPath}/themes/spotlight`;

  const semanticLessPath = `${projectRootPath}/node_modules/semantic-ui-less`;
  const hasDesignSystemInstalled =
    config.resolve.alias['volto-spotlight-themes'];
  config.resolve.alias[
    'volto-spotlight-theme-folder'
  ] = hasDesignSystemInstalled ? themeLessPath : semanticLessPath;

  return config;
};

module.exports = {
  plugins,
  modify,
};
