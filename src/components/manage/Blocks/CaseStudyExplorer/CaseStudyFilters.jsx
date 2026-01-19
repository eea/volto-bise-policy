import React from 'react';

import { centerAndResetMapZoom, scrollToElement } from './utils';
import { withOpenLayers } from '@eeacms/volto-openlayers-map';

const normalizeSearchInput = (searchInput) => {
  let normInput = searchInput
    .toLowerCase()
    .replace('(', '')
    .replace(')', '')
    .replace('?', '.')
    .replace('*', '[^\\s]+');

  return '\\b' + normInput + '\\b';
};

export function CaseStudyFilter(props) {
  const {
    filterTitle,
    filters,
    activeFilters,
    setActiveFilters,
    filterName,
    map,
    ol,
  } = props;

  const showInputs = (event) => {
    event.currentTarget.parentElement.classList.add('active');
  };

  return (
    <div className="filter-wrapper">
      <button
        className="ui basic button facet-btn"
        onClick={(e) => showInputs(e)}
      >
        <span>
          {filterTitle}
          <i aria-hidden="true" className="icon angle down"></i>
        </span>
      </button>
      <div className="filter-inputs-wrapper">
        {Object.entries(filters?.[filterName] || {}).length > 7 ? (
          <input
            type="text"
            className="filterInputText"
            onKeyUp={(e) => {
              const filterValue = e.currentTarget.value.toUpperCase();
              const inputs = e.currentTarget.nextSibling.children;

              for (let i = 0; i < inputs.length; i++) {
                let inputValue = inputs[i].textContent || inputs[i].innerText;
                if (inputValue.toUpperCase().indexOf(filterValue) > -1) {
                  inputs[i].style.display = 'block';
                } else {
                  inputs[i].style.display = 'none';
                }
              }
            }}
            placeholder="Quick search"
            title="Type in a name"
          />
        ) : (
          ''
        )}

        <div className="filter-inputs">
          {Object.entries(filters?.[filterName] || {})
            .sort((item1, item2) => item1[1].localeCompare(item2[1]))
            .map(([value, label], index) => (
              <label
                htmlFor={label + index}
                className="filter-input"
                key={index}
              >
                <input
                  value={value}
                  type="checkbox"
                  id={label + index}
                  onChange={(e) => {
                    const temp = JSON.parse(JSON.stringify(activeFilters));
                    if (e.target.checked) {
                      temp[filterName].push(e.target.value);
                    } else {
                      temp[filterName] = temp[filterName].filter((value) => {
                        if (value !== e.target.value) return value;
                        return null;
                      });
                    }
                    setActiveFilters(temp);
                    scrollToElement('search-input');
                    centerAndResetMapZoom({ map, ol });
                  }}
                />
                <span>{label}</span>
              </label>
            ))}
        </div>
      </div>
    </div>
  );
}

function CaseStudyFiltersComponent(props) {
  const { filters, activeFilters, setActiveFilters, map, ol } = props;

  React.useEffect(() => {
    window.addEventListener('click', (event) => {
      const filters = document.getElementsByClassName('filter-wrapper');

      for (let i = 0; i < filters.length; i++) {
        if (!filters[i].contains(event.target)) {
          filters[i].classList.remove('active');
        }
      }
    });
  }, []);

  return (
    <>
      {/* <CaseStudyFilter
        filterTitle="Sectors"
        filterName="sectors"
        filters={filters}
        activeFilters={activeFilters}
        setActiveFilters={setActiveFilters}
        map={map}
        ol={ol}
      />

      <CaseStudyFilter
        filterTitle="NWRMs implemented"
        filterName="nwrms_implemented"
        filters={filters}
        activeFilters={activeFilters}
        setActiveFilters={setActiveFilters}
        map={map}
        ol={ol}
      /> */}
    </>
  );
}

function SearchBoxComponent(props) {
  const { setSearchInput, map, ol } = props;
  const [showClearButton, setShowClearButton] = React.useState(false);

  return (
    <div className="header-content">
      <div className="sui-search-box">
        <div className="search-input">
          <div className="terms-box">
            <input
              id="search-input"
              placeholder="Search with a keyword..."
              onChange={(event) => {
                const _showClearButton = event.target.value ? true : false;
                setShowClearButton(_showClearButton);
              }}
              onKeyDown={(event) => {
                if (event.code !== 'Enter') {
                  return;
                }
                let searchInput = normalizeSearchInput(event.target.value);

                setSearchInput(searchInput);
                scrollToElement('search-input');
                centerAndResetMapZoom({ map, ol });
              }}
            ></input>
            <div className="terms-box-left">
              <div className="input-controls">
                {showClearButton ? (
                  <div className="ui button basic clear-button">
                    <i
                      aria-hidden="true"
                      className="close icon"
                      role="button"
                      onClick={() => {
                        const searchInputElement =
                          document.getElementById('search-input');
                        searchInputElement.value = '';
                        setSearchInput('');
                        setShowClearButton(false);
                        scrollToElement('search-input');
                        centerAndResetMapZoom({ map, ol });
                      }}
                    ></i>
                  </div>
                ) : (
                  ''
                )}
              </div>
              <div
                className="search-icon"
                role="button"
                onClick={() => {
                  const searchInputElement =
                    document.getElementById('search-input');
                  const searchInputVal = normalizeSearchInput(
                    searchInputElement.value,
                  );

                  setSearchInput(searchInputVal);
                  scrollToElement('search-input');
                  centerAndResetMapZoom({ map, ol });
                }}
                onKeyDown={() => {}}
                tabIndex="0"
              >
                <svg viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg">
                  <path d="M37.3757 34.3789L30.2003 27.2246C32.5154 24.2751 33.7716 20.633 33.7669 16.8835C33.7669 13.5442 32.7767 10.28 30.9215 7.50351C29.0663 4.72705 26.4295 2.56305 23.3445 1.28518C20.2594 0.00731515 16.8647 -0.327033 13.5897 0.324418C10.3146 0.97587 7.30625 2.58386 4.94506 4.94506C2.58386 7.30625 0.97587 10.3146 0.324418 13.5897C-0.327033 16.8647 0.00731528 20.2594 1.28518 23.3445C2.56305 26.4295 4.72705 29.0664 7.50351 30.9215C10.28 32.7767 13.5442 33.7669 16.8835 33.7669C20.633 33.7716 24.2751 32.5154 27.2246 30.2003L34.3789 37.3757C34.5751 37.5735 34.8085 37.7306 35.0657 37.8377C35.3229 37.9448 35.5987 38 35.8773 38C36.1559 38 36.4318 37.9448 36.689 37.8377C36.9461 37.7306 37.1795 37.5735 37.3757 37.3757C37.5735 37.1795 37.7305 36.9461 37.8377 36.689C37.9448 36.4318 38 36.1559 38 35.8773C38 35.5987 37.9448 35.3229 37.8377 35.0657C37.7305 34.8085 37.5735 34.5751 37.3757 34.3789ZM4.22087 16.8835C4.22087 14.379 4.96352 11.9309 6.3549 9.8485C7.74628 7.76615 9.72391 6.14315 12.0377 5.18475C14.3515 4.22635 16.8975 3.97559 19.3538 4.46418C21.8101 4.95277 24.0664 6.15876 25.8373 7.92966C27.6081 9.70055 28.8141 11.9568 29.3027 14.4131C29.7913 16.8694 29.5406 19.4154 28.5822 21.7292C27.6238 24.043 26.0008 26.0206 23.9184 27.412C21.8361 28.8034 19.3879 29.546 16.8835 29.546C13.5251 29.546 10.3043 28.2119 7.92966 25.8373C5.55496 23.4626 4.22087 20.2418 4.22087 16.8835Z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActiveFiltersComponent(props) {
  const { filters, activeFilters, setActiveFilters } = props;
  const hasActiveFilters = Object.entries(activeFilters).some(
    ([filterName, filterList]) => {
      if (filterList.length > 0) {
        return true;
      }
      return false;
    },
  );

  const clearFilters = () => {
    const filterInputs = document.querySelectorAll(
      '#cse-filter .filter-input input',
    );
    for (let i = 0; i < filterInputs.length; i++) {
      filterInputs[i].checked = false;
    }
    setActiveFilters({ nwrms_implemented: [], sectors: [] });
    scrollToElement('search-input');
  };

  const removeFilter = (filterName, filterCode) => {
    const temp = JSON.parse(JSON.stringify(activeFilters));
    temp[filterName] = temp[filterName].filter((value) => {
      if (value !== filterCode) return value;
      return null;
    });

    const filterInputs = document.querySelectorAll(
      '#cse-filter .filter-input input',
    );

    for (let i = 0; i < filterInputs.length; i++) {
      if (filterInputs[i].value === filterCode) {
        filterInputs[i].checked = false;
      }
    }

    setActiveFilters(temp);
  };

  return hasActiveFilters ? (
    <div className="ui segment active-filter-list">
      <div className="filter-list-header">
        <h4 className="filter-list-title">Active filters</h4>
        <button
          onClick={clearFilters}
          className="ui mini basic compact button clear-btn"
        >
          clear all
        </button>
      </div>
      <div className="filter-list-content">
        <div className="filter">
          {activeFilters.nwrms_implemented.length > 0 ? (
            <div className="filter-wrapper">
              <div className="filter-label">NWRMs implemented:</div>
              {activeFilters.nwrms_implemented.map((filterCode) => {
                const filterLabel = filters.nwrms_implemented[filterCode];
                return (
                  <div className="ui basic label filter-value">
                    <span>{filterLabel}</span>
                    <i
                      tabIndex="0"
                      onKeyPress={() => {}}
                      onClick={() => {
                        removeFilter('nwrms_implemented', filterCode);
                        scrollToElement('search-input');
                      }}
                      role="button"
                      className="close icon"
                    ></i>
                  </div>
                );
              })}
            </div>
          ) : (
            ''
          )}
          {activeFilters.sectors.length > 0 ? (
            <div className="filter-wrapper">
              <div className="filter-label">Sector:</div>
              {activeFilters.sectors.map((filterCode) => {
                const filterLabel = filters.sectors[filterCode];
                return (
                  <div className="ui basic label filter-value">
                    <span>{filterLabel}</span>
                    <i
                      tabIndex="0"
                      onKeyPress={() => {}}
                      onClick={() => {
                        removeFilter('sectors', filterCode);
                        scrollToElement('search-input');
                      }}
                      role="button"
                      className="close icon"
                    ></i>
                  </div>
                );
              })}
            </div>
          ) : (
            ''
          )}
        </div>
      </div>
    </div>
  ) : (
    ''
  );
}

export const CaseStudyFilters = withOpenLayers(CaseStudyFiltersComponent);
export const SearchBox = withOpenLayers(SearchBoxComponent);
export const ActiveFilters = withOpenLayers(ActiveFiltersComponent);
