import React from 'react';
import { useIntl } from 'react-intl';

import CaseStudyCard from './CaseStudyCard';
import Pagination from './Pagination';
import messages from './messages';

export const SORT_OPTIONS = [
  { value: 'title', label: messages.sortTitle },
  { value: 'newest', label: messages.sortNewest },
];

export const PER_PAGE_OPTIONS = [4, 8, 16];

/**
 * Results pane: count line, sort and page-size controls, the cards and the
 * pagination. Slicing happens here, filtering and ordering do not.
 */
export default function CaseStudyResults({
  items = [],
  selectedPath,
  onShowOnMap,
  onResetMap,
  sortBy = 'title',
  onSortChange,
  perPage = 4,
  onPerPageChange,
  page = 1,
  onPageChange,
  onResetFilters,
}) {
  const intl = useIntl();
  const pageCount = Math.max(1, Math.ceil(items.length / perPage));
  const currentPage = Math.min(page, pageCount);
  const visible = items.slice(
    perPage * (currentPage - 1),
    perPage * currentPage,
  );

  return (
    <div className="cse-results">
      <h2 className="cse-visually-hidden">
        {intl.formatMessage(messages.resultsHeading)}
      </h2>

      <div className="cse-results-header">
        <p className="cse-results-count" role="status">
          {items.length === 1
            ? intl.formatMessage(messages.resultsShowingOne)
            : intl.formatMessage(messages.resultsShowing, {
                count: items.length,
              })}
        </p>

        <div className="cse-results-controls">
          <label className="cse-results-control">
            <span className="cse-results-control-label">
              {intl.formatMessage(messages.sortBy)}
            </span>
            <select
              value={sortBy}
              onChange={(event) => onSortChange(event.target.value)}
            >
              {SORT_OPTIONS.map((option) => (
                <option value={option.value} key={option.value}>
                  {intl.formatMessage(option.label)}
                </option>
              ))}
            </select>
          </label>

          <label className="cse-results-control">
            <span className="cse-results-control-label">
              {intl.formatMessage(messages.perPage)}
            </span>
            <select
              value={perPage}
              onChange={(event) => onPerPageChange(Number(event.target.value))}
            >
              {PER_PAGE_OPTIONS.map((option) => (
                <option value={option} key={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="cse-results-empty">
          <h3>{intl.formatMessage(messages.noResultsTitle)}</h3>
          <p>{intl.formatMessage(messages.noResultsHint)}</p>
          {onResetFilters ? (
            <button
              type="button"
              className="cse-reset-filters"
              onClick={onResetFilters}
            >
              {intl.formatMessage(messages.resetFilters)}
            </button>
          ) : null}
        </div>
      ) : (
        <ul className="cse-results-list">
          {visible.map((item) => (
            <li key={item.properties?.path || item.properties?.url}>
              <CaseStudyCard
                item={item}
                selected={selectedPath === item.properties?.path}
                onShowOnMap={onShowOnMap}
                onResetMap={onResetMap}
              />
            </li>
          ))}
        </ul>
      )}

      {visible.length > 0 ? (
        <Pagination
          page={currentPage}
          pageCount={pageCount}
          onPageChange={onPageChange}
        />
      ) : null}
    </div>
  );
}
