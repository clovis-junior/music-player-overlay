import { useEffect, useState } from 'react';

import styles from '../assets/scss/player.module.scss';

export default function AsyncImage({
  src,
  alt = '',
  className = '',
  duration = 400,
  ...props
}) {
  const [currentSrc, setCurrentSrc] = useState(src || '');
  const [nextSrc, setNextSrc] = useState(null);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    if (!src || src === currentSrc)
      return;

    const image = new Image();

    image.onload = () => {
      setNextSrc(src);
      setTransitioning(true)
    };

    image.src = src;

    return () => image.onload = null;
  }, [src, currentSrc]);

  useEffect(() => {
    if (!transitioning)
      return;

    const timer = setTimeout(() => {
      setCurrentSrc(nextSrc);
      setNextSrc(null);
      setTransitioning(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [transitioning, nextSrc, duration]);

  if (!currentSrc && !nextSrc)
    return null;

  return (
    <>
      {currentSrc && (
        <img
          src={currentSrc}
          alt={alt}
          className={[
            className,
            nextSrc ? styles?.old : ''
          ].filter(Boolean).join(' ')}
          {...props}
        />
      )}
      {nextSrc && (
        <img
          src={nextSrc}
          alt={alt}
          className={[
            className,
            styles?.new
          ].filter(Boolean).join(' ')}
          {...props}
        />
      )}
    </>
  );
}
