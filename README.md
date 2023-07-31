# volto-bise-policy

[![Releases](https://img.shields.io/github/v/release/eea/volto-bise-policy)](https://github.com/eea/volto-bise-policy/releases)

[![Pipeline](https://ci.eionet.europa.eu/buildStatus/icon?job=volto-addons%2Fvolto-bise-policy%2Fmaster&subject=master)](https://ci.eionet.europa.eu/view/Github/job/volto-addons/job/volto-bise-policy/job/master/display/redirect)
[![Lines of Code](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-bise-policy-master&metric=ncloc)](https://sonarqube.eea.europa.eu/dashboard?id=volto-bise-policy-master)
[![Coverage](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-bise-policy-master&metric=coverage)](https://sonarqube.eea.europa.eu/dashboard?id=volto-bise-policy-master)
[![Bugs](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-bise-policy-master&metric=bugs)](https://sonarqube.eea.europa.eu/dashboard?id=volto-bise-policy-master)
[![Duplicated Lines (%)](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-bise-policy-master&metric=duplicated_lines_density)](https://sonarqube.eea.europa.eu/dashboard?id=volto-bise-policy-master)

[![Pipeline](https://ci.eionet.europa.eu/buildStatus/icon?job=volto-addons%2Fvolto-bise-policy%2Fdevelop&subject=develop)](https://ci.eionet.europa.eu/view/Github/job/volto-addons/job/volto-bise-policy/job/develop/display/redirect)
[![Lines of Code](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-bise-policy-develop&metric=ncloc)](https://sonarqube.eea.europa.eu/dashboard?id=volto-bise-policy-develop)
[![Coverage](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-bise-policy-develop&metric=coverage)](https://sonarqube.eea.europa.eu/dashboard?id=volto-bise-policy-develop)
[![Bugs](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-bise-policy-develop&metric=bugs)](https://sonarqube.eea.europa.eu/dashboard?id=volto-bise-policy-develop)
[![Duplicated Lines (%)](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-bise-policy-develop&metric=duplicated_lines_density)](https://sonarqube.eea.europa.eu/dashboard?id=volto-bise-policy-develop)

[Volto](https://github.com/plone/volto) add-on

## Features

Demo GIF

## Getting started

### Try volto-bise-policy with Docker

      git clone https://github.com/eea/volto-bise-policy.git
      cd volto-bise-policy
      make
      make start

Go to http://localhost:3000

### Add volto-bise-policy to your Volto project

1. Make sure you have a [Plone backend](https://plone.org/download) up-and-running at http://localhost:8080/Plone

   ```Bash
   docker compose up backend
   ```

1. Start Volto frontend

- If you already have a volto project, just update `package.json`:

  ```JSON
  "addons": [
      "@eeacms/volto-bise-policy"
  ],

  "dependencies": {
      "@eeacms/volto-bise-policy": "*"
  }
  ```

- If not, create one:

  ```
  npm install -g yo @plone/generator-volto
  yo @plone/volto my-volto-project --canary --addon @eeacms/volto-bise-policy
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

See [RELEASE.md](https://github.com/eea/volto-bise-policy/blob/master/RELEASE.md).

## How to contribute

See [DEVELOP.md](https://github.com/eea/volto-bise-policy/blob/master/DEVELOP.md).

## Copyright and license

The Initial Owner of the Original Code is European Environment Agency (EEA).
All Rights Reserved.

See [LICENSE.md](https://github.com/eea/volto-bise-policy/blob/master/LICENSE.md) for details.

## Funding

[European Environment Agency (EU)](http://eea.europa.eu)
don-template/blob/master/LICENSE.md) for details.

## Funding

[European Environment Agency (EU)](http://eea.europa.eu)
