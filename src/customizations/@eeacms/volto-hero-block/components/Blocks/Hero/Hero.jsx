import React, { useMemo } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { isInternalURL } from '@plone/volto/helpers/Url/Url';
import { isImageGif, getFieldURL } from '@eeacms/volto-hero-block/helpers';
import { Image } from '@plone/volto/components';

Hero.propTypes = {
  image: PropTypes.string,
  fullWidth: PropTypes.bool,
  fullHeight: PropTypes.bool,
  alignContent: PropTypes.string,
  textAlign: PropTypes.string,
  backgroundVariant: PropTypes.string,
  quoted: PropTypes.bool,
  spaced: PropTypes.bool,
  inverted: PropTypes.bool,
  textVariant: PropTypes.string,
};

function Hero({
  overlay = true,
  fullWidth = true,
  fullHeight = true,
  children,
  spaced = false,
  inverted = true,
  styles,
  height,
  ...props
}) {
  const image = getFieldURL(props.image);
  const isExternal = !isInternalURL(image);
  const {
    alignContent = 'center',
    bg = 'center',
    backgroundVariant = 'primary',
  } = styles || {};

  const containerCssStyles = React.useMemo(
    () => ({
      overflow: 'hidden',
      ...(height && !fullHeight ? { height } : {}),
    }),
    [height, fullHeight],
  );

  const imageUrl = useMemo(() => {
    if (isExternal) {
      return image;
    }

    if (isImageGif(image)) {
      return `${image}/@@images/image`;
    }

    return `${image}/@@images/image/huge`;
  }, [image, isExternal]);

  const imageStyle = useMemo(() => {
    return {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition: bg,
      zIndex: -1,
    };
  }, [bg]);

  return (
    <div
      className={cx(
        'eea hero-block',
        !image &&
          backgroundVariant &&
          !fullWidth &&
          `color-bg-${backgroundVariant}`,
        {
          spaced,
          inverted,
          'full-height': fullHeight,
        },
      )}
    >
      <div
        className={cx(
          'hero-block-image-wrapper',
          !image &&
            backgroundVariant &&
            fullWidth &&
            `color-bg-${backgroundVariant}`,
          {
            'full-width': fullWidth,
          },
        )}
        style={containerCssStyles}
      >
        {imageUrl && <Image src={imageUrl} alt="" style={imageStyle} />}
        {image && overlay && (
          <div className="hero-block-image-overlay dark-overlay-4"></div>
        )}
      </div>
      <div
        className={cx(
          'hero-block-inner-wrapper d-flex',
          `flex-items-${alignContent}`,
        )}
        style={containerCssStyles}
      >
        <div className="hero-block-body">{children}</div>
      </div>
    </div>
  );
}

Hero.Text = ({ children, quoted, styles }) => {
  const { textVariant = 'white', textAlign = 'left' } = styles || {};
  return (
    <div
      className={cx(
        'hero-block-text',
        `color-fg-${textVariant}`,
        `text-${textAlign}`,
        quoted ? 'quoted-wrapper' : '',
      )}
    >
      {children}
    </div>
  );
};

Hero.Meta = ({ children, styles }) => {
  const { buttonAlign = 'left' } = styles || {};
  return (
    <div className={cx('hero-block-meta', `text-${buttonAlign}`)}>
      {children}
    </div>
  );
};

export default Hero;
