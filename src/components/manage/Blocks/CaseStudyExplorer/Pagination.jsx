import React from 'react';
import { useIntl } from 'react-intl';

import messages from './messages';

const range = (from, to) =>
  Array.from({ length: to - from + 1 }, (_, index) => from + index);

/**
 * Page numbers to show: all of them when the list is short, otherwise first,
 * last and the neighbours of the current page, with ellipsis markers.
 */
export function paginationItems(page, pageCount) {
  if (pageCount <= 7) return range(1, pageCount);

  const items = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(pageCount - 1, page + 1);

  if (start > 2) items.push('start-ellipsis');
  items.push(...range(start, end));
  if (end < pageCount - 1) items.push('end-ellipsis');
  items.push(pageCount);

  return items;
}

export default function Pagination({ page, pageCount, onPageChange }) {
  const intl = useIntl();
  if (pageCount < 1) return null;

  return (
    <nav
      className="cse-pagination"
      aria-label={intl.formatMessage(messages.pagination)}
    >
      <button
        type="button"
        className="cse-pagination-step"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label={intl.formatMessage(messages.previousPage)}
      >
        <i className="icon ri-arrow-left-s-line" aria-hidden="true" />
      </button>

      {paginationItems(page, pageCount).map((item) =>
        typeof item === 'number' ? (
          <button
            type="button"
            key={item}
            className="cse-pagination-page"
            aria-current={item === page ? 'page' : undefined}
            aria-label={intl.formatMessage(messages.pageNumber, { page: item })}
            onClick={() => onPageChange(item)}
          >
            {item}
          </button>
        ) : (
          <span
            className="cse-pagination-ellipsis"
            key={item}
            aria-hidden="true"
          >
            …
          </span>
        ),
      )}

      <button
        type="button"
        className="cse-pagination-step"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pageCount}
        aria-label={intl.formatMessage(messages.nextPage)}
      >
        <i className="icon ri-arrow-right-s-line" aria-hidden="true" />
      </button>
    </nav>
  );
}
