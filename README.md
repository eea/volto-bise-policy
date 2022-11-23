# volto-bise-theme

[![Releases](https://img.shields.io/github/v/release/eea/volto-bise-theme)](https://github.com/eea/volto-bise-theme/releases)

[![Pipeline](https://ci.eionet.europa.eu/buildStatus/icon?job=volto-addons%2Fvolto-bise-theme%2Fmaster&subject=master)](https://ci.eionet.europa.eu/view/Github/job/volto-addons/job/volto-bise-theme/job/master/display/redirect)
[![Lines of Code](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-bise-theme-master&metric=ncloc)](https://sonarqube.eea.europa.eu/dashboard?id=volto-bise-theme-master)
[![Coverage](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-bise-theme-master&metric=coverage)](https://sonarqube.eea.europa.eu/dashboard?id=volto-bise-theme-master)
[![Bugs](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-bise-theme-master&metric=bugs)](https://sonarqube.eea.europa.eu/dashboard?id=volto-bise-theme-master)
[![Duplicated Lines (%)](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-bise-theme-master&metric=duplicated_lines_density)](https://sonarqube.eea.europa.eu/dashboard?id=volto-bise-theme-master)

[![Pipeline](https://ci.eionet.europa.eu/buildStatus/icon?job=volto-addons%2Fvolto-bise-theme%2Fdevelop&subject=develop)](https://ci.eionet.europa.eu/view/Github/job/volto-addons/job/volto-bise-theme/job/develop/display/redirect)
[![Lines of Code](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-bise-theme-develop&metric=ncloc)](https://sonarqube.eea.europa.eu/dashboard?id=volto-bise-theme-develop)
[![Coverage](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-bise-theme-develop&metric=coverage)](https://sonarqube.eea.europa.eu/dashboard?id=volto-bise-theme-develop)
[![Bugs](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-bise-theme-develop&metric=bugs)](https://sonarqube.eea.europa.eu/dashboard?id=volto-bise-theme-develop)
[![Duplicated Lines (%)](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-bise-theme-develop&metric=duplicated_lines_density)](https://sonarqube.eea.europa.eu/dashboard?id=volto-bise-theme-develop)


[Volto](https://github.com/plone/volto) add-on

## Features

Demo GIF

## Getting started

### Add volto-bise-theme to your Volto project

1. Make sure you have a [Plone backend](https://plone.org/download) up-and-running at http://localhost:8080/Plone

1. Start Volto frontend

* If you already have a volto project, just update `package.json`:

   ```JSON
   "addons": [
       "@eeacms/volto-bise-theme"
   ],

   "dependencies": {
       "@eeacms/volto-bise-theme": "*"
   }
   ```

* If not, create one:

   ```
   npm install -g yo @plone/generator-volto
   yo @plone/volto my-volto-project --canary --addon @eeacms/volto-bise-theme
   cd my-volto-project
   ```

1. Install new add-ons and restart Volto:

   ```
   yarn
   yarn start
   ```

1. Go to http://localhost:3000

1. Happy editing!

## Release

See [RELEASE.md](https://github.com/eea/volto-bise-theme/blob/master/RELEASE.md).

## How to contribute

See [DEVELOP.md](https://github.com/eea/volto-bise-theme/blob/master/DEVELOP.md).

## Copyright and license

The Initial Owner of the Original Code is European Environment Agency (EEA).
All Rights Reserved.

See [LICENSE.md](https://github.com/eea/volto-bise-theme/blob/master/LICENSE.md) for details.

## Funding

[European Environment Agency (EU)](http://eea.europa.eu)
don-template/blob/master/LICENSE.md) for details.

## Funding

[European Environment Agency (EU)](http://eea.europa.eu)
