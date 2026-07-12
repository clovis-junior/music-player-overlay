import { useEffect, useState } from 'react';

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
      setTransitioning(true);
    };

    image.src = src;

    return () => {
      image.onload = null;
    };
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
    <figure
      className={`async-image ${className}`}
      style={{
        position: 'relative',
        display: 'block',
        overflow: 'hidden'
      }}
    >
      {currentSrc && (
        <img
          src={currentSrc}
          alt={alt}
          {...props}
          style={{
            ...props.style,
            position: nextSrc ? 'absolute' : 'relative',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: transitioning ? 0 : 1,
            transition: `opacity ${duration}ms ease`
          }}
        />
      )}

      {nextSrc && (
        <img
          src={nextSrc}
          alt={alt}
          {...props}
          style={{
            ...props.style,
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: transitioning ? 1 : 0,
            transition: `opacity ${duration}ms ease`
          }}
        />
      )}
    </figure>
  );
}
