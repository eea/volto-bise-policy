import React from 'react';
import { useIntl } from 'react-intl';
import cx from 'classnames';

import messages from './messages';

const normalize = (value) => String(value).trim().toLowerCase();

export function filterOptions(options, search) {
  const needle = normalize(search);
  if (!needle) return options;

  return options.filter((option) =>
    normalize(
      `${option.label} ${option.value} ${option.family || ''}`,
    ).includes(needle),
  );
}

function selectedLabel(groups, filters) {
  const selected = groups.flatMap((group) =>
    group.options.filter((option) =>
      (filters[group.facet] || []).includes(option.value),
    ),
  );

  if (!selected.length) return null;
  if (selected.length === 1) return selected[0].label;

  return null;
}

/**
 * Trigger + panel holding checkbox groups, one group per facet. Used both for
 * the combined measure/typology control and for the single-facet dropdowns.
 * Ticking a box calls `onToggle`, which applies the change immediately.
 */
export default function FacetPopover({
  id,
  label,
  groups,
  filters = {},
  onToggle,
  className,
}) {
  const intl = useIntl();
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const wrapperRef = React.useRef(null);
  const triggerRef = React.useRef(null);
  const searchRef = React.useRef(null);

  const close = React.useCallback(() => {
    setOpen(false);
    setSearch('');
  }, []);

  React.useEffect(() => {
    if (!open) return undefined;

    const onDocumentClick = (event) => {
      if (!wrapperRef.current?.contains(event.target)) close();
    };
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      close();
      triggerRef.current?.focus();
    };

    document.addEventListener('click', onDocumentClick);
    document.addEventListener('keydown', onKeyDown);
    searchRef.current?.focus();

    return () => {
      document.removeEventListener('click', onDocumentClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [close, open]);

  const totalOptions = groups.reduce(
    (total, group) => total + group.options.length,
    0,
  );
  const selectedCount = groups.reduce(
    (total, group) => total + (filters[group.facet] || []).length,
    0,
  );
  const singleLabel = selectedLabel(groups, filters);
  const summary =
    selectedCount === 1 && singleLabel
      ? singleLabel
      : selectedCount > 1
        ? intl.formatMessage(messages.selectedCount, {
            label,
            count: selectedCount,
          })
        : label;

  const visibleGroups = groups.map((group) => ({
    ...group,
    visible: filterOptions(group.options, search),
  }));
  const hasMatches = visibleGroups.some((group) => group.visible.length > 0);

  return (
    <div className={cx('facet-popover', className)} ref={wrapperRef}>
      <button
        type="button"
        ref={triggerRef}
        className={cx('facet-trigger', { active: selectedCount > 0 })}
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        onClick={() => setOpen((wasOpen) => !wasOpen)}
      >
        <span className="facet-trigger-label" title={summary}>
          {summary}
        </span>
        <i aria-hidden="true" className="icon angle down" />
      </button>

      {open ? (
        <div
          className="facet-panel"
          id={`${id}-panel`}
          role="group"
          aria-label={label}
        >
          {totalOptions > 7 ? (
            <input
              ref={searchRef}
              type="search"
              className="facet-search"
              value={search}
              placeholder={intl.formatMessage(messages.searchValues)}
              aria-label={intl.formatMessage(messages.searchValues)}
              onChange={(event) => setSearch(event.target.value)}
            />
          ) : null}

          {hasMatches ? (
            visibleGroups.map((group) =>
              group.visible.length === 0 ? null : (
                <fieldset className="facet-group" key={group.facet}>
                  {group.title ? <legend>{group.title}</legend> : null}
                  <div className="facet-options">
                    {group.visible.map((option) => (
                      <label className="facet-option" key={option.value}>
                        <input
                          type="checkbox"
                          value={option.value}
                          checked={(filters[group.facet] || []).includes(
                            option.value,
                          )}
                          onChange={() => onToggle(group.facet, option.value)}
                        />
                        <span className="facet-option-label">
                          {option.label}
                        </span>
                        <span className="facet-option-count">
                          {' '}
                          ({option.count})
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              ),
            )
          ) : (
            <p className="facet-empty">
              {totalOptions === 0
                ? intl.formatMessage(messages.noOptionsAvailable)
                : intl.formatMessage(messages.noMatchingOptions)}
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
