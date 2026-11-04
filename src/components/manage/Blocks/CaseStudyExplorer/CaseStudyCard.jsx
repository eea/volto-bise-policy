import React from 'react';
import { useIntl } from 'react-intl';
import cx from 'classnames';
import Image from '@plone/volto/components/theme/Image/Image';

import messages from './messages';
import {
  asValues,
  // getArticleInfo,
  getFacetValues,
  valueLabel,
} from './filters';
import { getStatusColor, visibleChipCount } from './utils';

/** Rows of chips a card shows before collapsing the rest into "+N". */
const ECOSYSTEM_ROWS = 2;
const CHIP_GAP_FALLBACK = 8;

// Measure before the browser paints where possible, without warning on the
// server-rendered first pass.
const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;

// const STATUS_LABELS = {
//   planned: messages.statusPlanned,
//   ongoing: messages.statusOngoing,
//   completed: messages.statusCompleted,
// };

function StatusBadge({ status }) {
  // const intl = useIntl();
  // const label = STATUS_LABELS[status];

  return (
    <span className="cse-card-status">
      <span
        className="cse-card-status-dot"
        style={{ backgroundColor: getStatusColor(status) }}
        aria-hidden="true"
      />
      {/* <span className="cse-card-status-label">
        {label ? intl.formatMessage(label) : status}
      </span> */}
    </span>
  );
}

/**
 * Ecosystem chips, wrapped over at most two rows. How many fit depends on the
 * card width, so the full list is mirrored into a hidden, absolutely
 * positioned list that is measured with real layout; the chips that overflow
 * two rows collapse into a "+N" trigger that opens a popup listing exactly the
 * hidden values.
 *
 * Without a layout engine (jsdom, SSR) nothing can be measured, so every chip
 * is rendered and no trigger appears.
 */
function EcosystemChips({ ecosystems }) {
  const intl = useIntl();
  const [visibleCount, setVisibleCount] = React.useState(ecosystems.length);
  const [open, setOpen] = React.useState(false);
  const measureRef = React.useRef(null);
  const triggerRef = React.useRef(null);
  const panelRef = React.useRef(null);
  const panelId = React.useId();

  const measure = React.useCallback(() => {
    const list = measureRef.current;
    if (!list) return;

    const chips = Array.from(list.querySelectorAll('.cse-card-chip'));
    const width = list.clientWidth;

    // `visibility: hidden` boxes still measure, but jsdom reports 0 for all of
    // them: keep every chip visible instead of guessing.
    if (!width) {
      setVisibleCount(ecosystems.length);
      return;
    }

    const gap =
      parseFloat(window.getComputedStyle(list).columnGap) || CHIP_GAP_FALLBACK;
    const tops = chips.map((chip) => chip.offsetTop);
    const rows = [...new Set(tops)].sort((a, b) => a - b);
    const moreChip = list.querySelector('.cse-card-chip-more-measure');

    setVisibleCount(
      visibleChipCount(
        chips.map((chip, index) => ({
          row: rows.indexOf(tops[index]),
          right: chip.offsetLeft + chip.offsetWidth,
        })),
        {
          rows: ECOSYSTEM_ROWS,
          gap,
          moreWidth: moreChip?.offsetWidth || 0,
          width,
        },
      ),
    );
  }, [ecosystems.length]);

  useIsomorphicLayoutEffect(() => {
    measure();

    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(measure);
    if (measureRef.current) observer.observe(measureRef.current);

    return () => observer.disconnect();
  }, [measure]);

  React.useEffect(() => {
    if (!open) return undefined;

    const onDocumentClick = (event) => {
      if (!panelRef.current?.parentElement?.contains(event.target)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener('click', onDocumentClick);
    document.addEventListener('keydown', onKeyDown);
    panelRef.current?.focus();

    return () => {
      document.removeEventListener('click', onDocumentClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  if (!ecosystems.length) return null;

  const shown = Math.min(visibleCount, ecosystems.length);
  const hidden = ecosystems.length - shown;

  return (
    <div className="cse-card-ecosystems-wrap">
      <ul className="cse-card-ecosystems">
        {ecosystems.slice(0, shown).map((ecosystem, index) => (
          <li className="cse-card-chip" key={`${ecosystem}-${index}`}>
            {ecosystem}
          </li>
        ))}
        {hidden > 0 ? (
          <li className="cse-card-chip cse-card-chip-more">
            <button
              type="button"
              ref={triggerRef}
              className="cse-card-chip-more-trigger"
              aria-expanded={open}
              aria-controls={panelId}
              aria-haspopup="dialog"
              onClick={() => setOpen((wasOpen) => !wasOpen)}
            >
              {intl.formatMessage(messages.moreEcosystems, { count: hidden })}
              <span className="cse-visually-hidden">
                {' '}
                {intl.formatMessage(messages.hiddenEcosystems)}
              </span>
            </button>
          </li>
        ) : null}
      </ul>

      {hidden > 0 && open ? (
        <div
          ref={panelRef}
          id={panelId}
          className="cse-card-ecosystems-panel"
          role="dialog"
          aria-label={intl.formatMessage(messages.hiddenEcosystems)}
          tabIndex={-1}
        >
          <ul className="cse-card-ecosystems cse-card-ecosystems-panel-list">
            {ecosystems.slice(shown).map((ecosystem, index) => (
              <li className="cse-card-chip" key={`${ecosystem}-${index}`}>
                {ecosystem}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <ul
        ref={measureRef}
        className="cse-card-ecosystems cse-card-ecosystems-measure"
        aria-hidden="true"
      >
        {ecosystems.map((ecosystem, index) => (
          <li className="cse-card-chip" key={`${ecosystem}-${index}`}>
            {ecosystem}
          </li>
        ))}
        <li className="cse-card-chip cse-card-chip-more-measure">
          {intl.formatMessage(messages.moreEcosystems, {
            count: ecosystems.length,
          })}
        </li>
      </ul>
    </div>
  );
}

/**
 * Related measures, collapsed behind a full-width disclosure bar. The bar
 * owns the count; the panel stays mounted so its height can animate, and is
 * `inert` while collapsed so its links stay out of the tab order. Nothing is
 * rendered at all for a case study without measures.
 */
function RelatedMeasures({ measures }) {
  const intl = useIntl();
  const panelId = React.useId();
  const [open, setOpen] = React.useState(false);

  if (!measures.length) return null;

  return (
    <div className="cse-card-measures">
      <button
        type="button"
        className="cse-card-measures-toggle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="cse-card-measures-count">
          {intl.formatNumber(measures.length)}
        </span>
        <span className="cse-card-measures-title">
          {intl.formatMessage(messages.relatedMeasures)}
        </span>
        <span className="cse-card-measures-chevron">
          <i className="icon ri-arrow-down-s-line" aria-hidden="true" />
        </span>
      </button>
      <div
        id={panelId}
        className="cse-card-measures-panel"
        data-open={open ? 'true' : 'false'}
        inert={open ? undefined : ''}
      >
        <div className="cse-card-measures-panel-inner">
          <ul className="cse-card-measures-list">
            {measures.map((measure) => (
              <li key={measure.id || measure.path || measure.title}>
                <a
                  className="cse-card-measure-link"
                  href={measure.path}
                  title={measure.title}
                >
                  <i className="icon ri-file-list-3-line" aria-hidden="true" />
                  <span className="cse-card-measure-title">
                    {measure.title}
                  </span>
                  <i
                    className="icon ri-arrow-right-s-line"
                    aria-hidden="true"
                  />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/**
 * One result, laid out as image | main content, with a full-width related
 * measures disclosure bar underneath. The title, the image and the footer's
 * corner icon are all "open in a new tab" affordances; selecting a card (from
 * a map pin) only highlights it, while "Show on map" is the reverse link to
 * the map. Once the card is the selected one, that same button reads "Reset
 * map" and clears the selection again.
 */
function CaseStudyCard({ item, selected = false, onShowOnMap, onResetMap }) {
  const intl = useIntl();
  const properties = React.useMemo(() => item?.properties || {}, [item]);
  // const { directives } = React.useMemo(
  //   () => getArticleInfo(properties),
  //   [properties],
  // );
  const ecosystems = React.useMemo(
    () => getFacetValues(properties, 'ecosystem').map(valueLabel),
    [properties],
  );
  const measures = React.useMemo(
    () => asValues(properties.measures),
    [properties],
  );

  return (
    <article
      className={cx('cse-card', { selected })}
      id={`cse-card-${encodeURIComponent(properties.path || '')}`}
      data-selected={selected ? 'true' : undefined}
    >
      <a
        className="cse-card-media"
        href={properties.path}
        tabIndex={-1}
        aria-hidden="true"
      >
        {properties.image ? (
          <Image src={properties.image} alt="" loading="lazy" />
        ) : (
          <span className="cse-card-media-placeholder" />
        )}
      </a>

      <div className="cse-card-content">
        <div className="cse-card-head">
          <h3 className="cse-card-title">
            <StatusBadge status={properties.current_status} />
            <a
              href={properties.path}
              target="_blank"
              rel="noopener noreferrer"
              title={properties.title}
            >
              {properties.title}
              <span className="cse-visually-hidden">
                {' '}
                {intl.formatMessage(messages.opensInNewTab)}
              </span>
            </a>
          </h3>
          <a
            className="cse-card-open"
            href={properties.path}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={intl.formatMessage(messages.openCaseStudy)}
            title={intl.formatMessage(messages.openCaseStudy)}
          >
            <i className="icon ri-external-link-line" aria-hidden="true" />
            <span className="cse-visually-hidden">
              {intl.formatMessage(messages.opensInNewTab)}
            </span>
          </a>
        </div>

        <div className="cse-card-meta">
          <StatusBadge status={properties.current_status} />
          {/* {directives.length ? (
            <>
              <span className="cse-card-separator" aria-hidden="true">
                ·
              </span>
              <span className="cse-card-directives">
                {directives.map((directive) => (
                  <span className="cse-card-chip" key={directive}>
                    {directive}
                  </span>
                ))}
              </span>
            </>
          ) : null} */}
          <button
            type="button"
            className="cse-card-show-on-map"
            onClick={() =>
              selected ? onResetMap?.(item) : onShowOnMap?.(item)
            }
          >
            <i
              className={cx(
                'icon',
                selected ? 'ri-map-2-line' : 'ri-map-pin-line',
              )}
              aria-hidden="true"
            />
            {intl.formatMessage(
              selected ? messages.resetMap : messages.showOnMap,
            )}
          </button>
        </div>

        <EcosystemChips ecosystems={ecosystems} />
      </div>

      <RelatedMeasures measures={measures} />
    </article>
  );
}

export default React.memo(CaseStudyCard);
