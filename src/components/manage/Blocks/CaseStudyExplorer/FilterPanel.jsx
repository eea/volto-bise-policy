import React from 'react';
import { useIntl } from 'react-intl';
import cx from 'classnames';

import FacetPopover from './FacetPopover';
import messages from './messages';
import { STATUS_COLORS } from './utils';
import { hasActiveFilters } from './filters';

const DROPDOWN_FACETS = [
  { facet: 'legislation', label: messages.facetLegislation },
  { facet: 'ecosystem', label: messages.facetEcosystem },
  { facet: 'bioregion', label: messages.facetBioregion },
  { facet: 'scale', label: messages.facetScale },
];

const STATUSES = [
  { value: 'planned', label: messages.statusPlanned },
  { value: 'ongoing', label: messages.statusOngoing },
  { value: 'completed', label: messages.statusCompleted },
];

function StatusFacet({ facets = [], filters, onToggle }) {
  const intl = useIntl();
  const selected = filters.status || [];
  const counts = facets.reduce((accumulator, option) => {
    accumulator[option.value] = option.count;
    return accumulator;
  }, {});

  return (
    <div className="facet-status">
      <span className="facet-status-label" id="cse-status-label">
        {intl.formatMessage(messages.facetStatus)}
      </span>
      <div
        className="facet-status-buttons"
        role="group"
        aria-labelledby="cse-status-label"
      >
        {STATUSES.map((status) => {
          const isSelected = selected.includes(status.value);

          return (
            <button
              type="button"
              key={status.value}
              className={cx('facet-status-button', { active: isSelected })}
              aria-pressed={isSelected}
              onClick={() => onToggle('status', status.value)}
            >
              <span
                className="facet-status-dot"
                style={{ backgroundColor: STATUS_COLORS[status.value] }}
                aria-hidden="true"
              />
              <span className="facet-status-text">
                {intl.formatMessage(status.label)}
              </span>
              <span className="facet-status-count">
                ({counts[status.value] || 0})
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SearchMeasures({ value = '', onChange }) {
  const intl = useIntl();

  return (
    <div className="cse-search">
      <label className="cse-search-label" htmlFor="cse-search-input">
        {intl.formatMessage(messages.searchMeasuresLabel)}
      </label>
      <div className="cse-search-field">
        <i className="icon ri-search-line" aria-hidden="true" />
        <input
          id="cse-search-input"
          type="search"
          className="cse-search-input"
          value={value}
          placeholder={intl.formatMessage(messages.searchMeasuresPlaceholder)}
          onChange={(event) => onChange(event.target.value)}
        />
        {value ? (
          <button
            type="button"
            className="cse-search-clear"
            aria-label={intl.formatMessage(messages.clearSearch)}
            onClick={() => onChange('')}
          >
            <i className="icon ri-close-line" aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Filter panel: a free-text search over the measures implemented and the
 * typology of measures, four single-facet dropdowns and the current-status
 * toggles. Every change is applied immediately - `onQueryChange` and
 * `onToggle` update the filters the map and the list read from - so there is
 * no Apply button and no staged draft.
 */
export default function FilterPanel({
  facets = {},
  filters = {},
  onToggle,
  onQueryChange,
  onReset,
}) {
  const intl = useIntl();
  const canReset = hasActiveFilters(filters);

  return (
    <section className="cse-filter-panel" aria-labelledby="cse-filter-title">
      <header className="cse-filter-header">
        <div className="cse-filter-heading">
          <span className="cse-filter-icon" aria-hidden="true">
            <i className="icon ri-filter-3-line" />
          </span>
          <h2 className="cse-filter-title" id="cse-filter-title">
            {intl.formatMessage(messages.filterPanelTitle)}
          </h2>
          {/* <span className="cse-filter-subtitle">
            {intl.formatMessage(messages.filterPanelHint)}
          </span> */}
        </div>
        <div className="cse-filter-actions">
          <button
            type="button"
            className="cse-reset-filters"
            onClick={onReset}
            disabled={!canReset}
          >
            <i className="icon ri-refresh-line" aria-hidden="true" />
            {intl.formatMessage(messages.resetFilters)}
          </button>
        </div>
      </header>

      <div className="cse-filter-row cse-filter-row-primary">
        <SearchMeasures value={filters.query} onChange={onQueryChange} />
      </div>

      <div className="cse-filter-row cse-filter-row-secondary">
        {DROPDOWN_FACETS.map(({ facet, label }) => (
          <FacetPopover
            key={facet}
            id={facet}
            label={intl.formatMessage(label)}
            filters={filters}
            onToggle={onToggle}
            groups={[{ facet, options: facets[facet] || [] }]}
          />
        ))}
        <StatusFacet
          facets={facets.status}
          filters={filters}
          onToggle={onToggle}
        />
      </div>
    </section>
  );
}
