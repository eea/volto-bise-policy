/**
 * Header component.
 * @module components/theme/Header/Header
 */

import React, { useCallback, useMemo, useState } from 'react';
import { Dropdown, Image, Sticky } from 'semantic-ui-react';
import { connect, useDispatch, useSelector } from 'react-redux';
import Cookies from 'universal-cookie';

import { withRouter } from 'react-router-dom';
import { UniversalLink } from '@plone/volto/components';
import {
  getBaseUrl,
  hasApiExpander,
  flattenToAppURL,
} from '@plone/volto/helpers';
import { getNavigation } from '@plone/volto/actions';
import { Header, Logo } from '@eeacms/volto-eea-design-system/ui';
import { usePrevious } from '@eeacms/volto-eea-design-system/helpers';
import globeIcon from '@eeacms/volto-eea-design-system/../theme/themes/eea/assets/images/Header/global-line.svg';
import eeaFlag from '@eeacms/volto-eea-design-system/../theme/themes/eea/assets/images/Header/eea.png';

import config from '@plone/volto/registry';
import { compose } from 'recompose';
import { BodyClass } from '@plone/volto/helpers';

import cx from 'classnames';

function removeTrailingSlash(path) {
  return path.replace(/\/+$/, '');
}

function getLanguage() {
  if (__SERVER__) {
    return config.settings.eea.defaultLanguage;
  }
  const cookies = new Cookies();

  if (!cookies.get('LANGUAGE')) {
    cookies.set('LANGUAGE', config.settings.eea.defaultLanguage || '');
  }

  return cookies.get('LANGUAGE');
}

/**
 * EEA Specific Header component.
 */
const EEAHeader = ({ token, history, subsite, content, ...props }) => {
  const dispatch = useDispatch();
  const [language, setLanguage] = useState(getLanguage());
  const previousToken = usePrevious(token);
  const { items } = props;
  const { eea } = config.settings;
  const { headerOpts } = eea || {};
  const { logo, logoWhite } = headerOpts || {};

  const width = useSelector((state) => state.screen?.width);

  const router_pathname = useSelector(
    (state) => removeTrailingSlash(state.router?.location?.pathname) || '',
  );
  let pathname = router_pathname;

  const content_pathname = useMemo(
    () => flattenToAppURL(content.data?.['@id']),
    [content],
  );

  const isSubsite = subsite?.['@type'] === 'Subsite';

  if (content.get.loading && content_pathname !== router_pathname) {
    pathname = content_pathname;
  }

  const isHomePageInverse = ['', '/', '/edit', '/edit/'].includes(pathname);

  const isMultilingual =
    config.settings.isMultilingual || (isSubsite && subsite.isMultilingual);

  const changeLanguage = useCallback(
    (lang) => {
      setLanguage(lang);
      const cookies = new Cookies();
      cookies.set('LANGUAGE', lang);
    },
    [setLanguage],
  );

  const getSubsiteItems = useCallback(() => {
    if (!subsite) return [];
    const subsiteData = items.filter((item) => item.url === subsite['@id'])[0];
    const subsiteItems = subsiteData?.items || [];
    if (subsite.isMultilingual) {
      const subsiteMultilingualData = subsiteItems.filter(
        (item) => item.url === `${subsite['@id']}/${language}`,
      )[0];
      return subsiteMultilingualData?.items || [];
    }

    return subsiteItems;
  }, [items, language, subsite]);

  React.useEffect(() => {
    const { settings } = config;
    const base_url = getBaseUrl(pathname);
    if (!hasApiExpander('navigation', base_url)) {
      dispatch(getNavigation(base_url, settings.navDepth));
    }
  }, [pathname, dispatch]);

  React.useEffect(() => {
    if (token !== previousToken) {
      const { settings } = config;
      const base = getBaseUrl(pathname);
      if (!hasApiExpander('navigation', base)) {
        dispatch(getNavigation(base, settings.navDepth));
      }
    }
  }, [token, dispatch, pathname, previousToken]);

  return (
    <Header menuItems={items}>
      {isHomePageInverse && <BodyClass className="homepage homepage-inverse" />}
      <Header.TopHeader>
        <Header.TopItem className="official-union">
          <Image src={eeaFlag} alt="eea flag"></Image>
          <Header.TopDropdownMenu
            text="An official website of the European Union | How do you know?"
            tabletText="EEA information systems"
            mobileText=" "
            icon="chevron down"
            aria-label="dropdown"
            className=""
            viewportWidth={width}
          >
            {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
            <div
              className="content"
              onClick={(evt) => evt.stopPropagation()}
              onKeyDown={(evt) => evt.stopPropagation()}
            >
              <p>
                All official European Union website addresses are in the{' '}
                <b>europa.eu</b> domain.
              </p>
              <a
                href="https://europa.eu/european-union/contact/institutions-bodies_en"
                target="_blank"
                rel="noreferrer"
                onKeyDown={(evt) => evt.stopPropagation()}
              >
                See all EU institutions and bodies
              </a>
            </div>
          </Header.TopDropdownMenu>
        </Header.TopItem>

        {!!headerOpts.partnerLinks && (
          <Header.TopItem>
            <Header.TopDropdownMenu
              id="theme-sites"
              text={headerOpts.partnerLinks.title}
              viewportWidth={width}
            >
              <div className="wrapper">
                <Dropdown.Item>
                  <UniversalLink
                    href={`/natura2000/${language}`}
                    className="site"
                    target="_self"
                    rel="noreferrer"
                  >
                    Natura 2000
                  </UniversalLink>
                </Dropdown.Item>
                {headerOpts.partnerLinks.links.map((item, index) => (
                  <Dropdown.Item key={index}>
                    <a
                      href={item.href}
                      className="site"
                      target="_blank"
                      rel="noreferrer"
                      onKeyDown={(evt) => evt.stopPropagation()}
                    >
                      {item.title}
                    </a>
                  </Dropdown.Item>
                ))}
              </div>
            </Header.TopDropdownMenu>
          </Header.TopItem>
        )}

        {isMultilingual && (
          <Header.TopItem>
            <Header.TopDropdownMenu
              id="language-switcher"
              className="item"
              text={`${language.toUpperCase()}`}
              mobileText={`${language.toUpperCase()}`}
              hasLanguageDropdown={true}
              icon={
                <Image
                  src={globeIcon}
                  alt="language dropdown globe icon"
                ></Image>
              }
              viewportWidth={width}
            >
              <ul
                className="wrapper language-list"
                role="listbox"
                aria-label="language switcher"
              >
                {eea.languages.map((item, index) => (
                  <Dropdown.Item
                    as="li"
                    key={index}
                    text={
                      <span>
                        {item.name}
                        <span className="country-code">
                          {item.code.toUpperCase()}
                        </span>
                      </span>
                    }
                    onClick={() => {
                      if (isSubsite && subsite.isMultilingual) {
                        for (const language of eea.languages) {
                          const multilingualSubsiteRe = new RegExp(
                            `^(${subsite['@id']})(/${language.code}($|/))(.*)`,
                            'g',
                          );
                          const matches = [
                            ...router_pathname.matchAll(multilingualSubsiteRe),
                          ][0];
                          if (matches && matches[2] !== `/${item.code}/`) {
                            changeLanguage(item.code);
                            history.push(
                              `${matches[1]}/${item.code}${
                                matches[4] ? '/' + matches[4] : ''
                              }`,
                            );
                            break;
                          }
                        }
                      }
                    }}
                  ></Dropdown.Item>
                ))}
              </ul>
            </Header.TopDropdownMenu>
          </Header.TopItem>
        )}
      </Header.TopHeader>
      <Sticky
        active={isSubsite && subsite['@id'] === '/natura2000'}
        context={__CLIENT__ && document.querySelector('.content-area')}
      >
        <Header.Main
          pathname={router_pathname}
          inverted={isHomePageInverse ? true : false}
          transparency={isHomePageInverse ? true : false}
          hideSearch={isSubsite}
          logo={
            <Logo
              src={isHomePageInverse ? logoWhite : logo}
              title={eea.websiteTitle}
              alt={eea.organisationName}
              url={eea.logoTargetUrl}
            />
          }
          menuItems={
            isSubsite && !subsite.isRoot
              ? getSubsiteItems()
              : items.filter((item) => item.url !== '/natura2000')
          }
          renderGlobalMenuItem={(item, { onClick }) => (
            <a
              href={item.url || '/'}
              title={item.title}
              onClick={(e) => {
                e.preventDefault();
                onClick(e, item);
              }}
            >
              {item.title}
            </a>
          )}
          renderMenuItem={(item, options, props) => (
            <UniversalLink
              href={item.url || '/'}
              title={item.nav_title || item.title}
              {...(options || {})}
              className={cx(options?.className, {
                active: item.url === router_pathname,
              })}
            >
              {props?.iconPosition !== 'right' && props?.children}
              <span>{item.nav_title || item.title}</span>
              {props?.iconPosition === 'right' && props?.children}
            </UniversalLink>
          )}
        />
      </Sticky>
    </Header>
  );
};

export default compose(
  withRouter,
  connect(
    (state) => ({
      token: state.userSession.token,
      items: state.navigation.items,
      subsite: state.subsite.data,
      content: state.content,
    }),
    { getNavigation },
  ),
)(EEAHeader);
