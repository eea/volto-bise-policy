import React from 'react';
import { useIntl } from 'react-intl';
import cx from 'classnames';
import Image from '@plone/volto/components/theme/Image/Image';

import messages from './messages';
import {
  asValues,
  getArticleInfo,
  getFacetValues,
  valueLabel,
} from './filters';
import { getStatusColor } from './utils';

const MAX_ECOSYSTEMS = 2;

const STATUS_LABELS = {
  planned: messages.statusPlanned,
  ongoing: messages.statusOngoing,
  completed: messages.statusCompleted,
};

function StatusBadge({ status }) {
  const intl = useIntl();
  const label = STATUS_LABELS[status];

  return (
    <span className="cse-card-status">
      <span
        className="cse-card-status-dot"
        style={{ backgroundColor: getStatusColor(status) }}
        aria-hidden="true"
      />
      <span className="cse-card-status-label">
        {label ? intl.formatMessage(label) : status}
      </span>
    </span>
  );
}

function EcosystemChips({ ecosystems }) {
  const intl = useIntl();
  const visible = ecosystems.slice(0, MAX_ECOSYSTEMS);
  const hidden = ecosystems.length - visible.length;

  if (!ecosystems.length) return null;

  return (
    <ul className="cse-card-ecosystems">
      {visible.map((ecosystem) => (
        <li className="cse-card-chip" key={ecosystem}>
          {ecosystem}
        </li>
      ))}
      {hidden > 0 ? (
        <li className="cse-card-chip cse-card-chip-more">
          {intl.formatMessage(messages.moreEcosystems, { count: hidden })}
        </li>
      ) : null}
    </ul>
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
