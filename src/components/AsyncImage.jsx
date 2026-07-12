import { useEffect, useRef, useState } from 'react'

import styles from '../assets/scss/player.module.scss'

export default function AsyncImage({
  src,
  alt = '',
  className = '',
  ...props
}) {
  const currentSrc = useRef(src || '');
  const [displaySrc, setDisplaySrc] = useState(src || '');
  const [fade, setFade] = useState(false);

  useEffect(() => {
    if (!src || src === currentSrc.current)
      return;

    const image = new Image();

    image.onload = () => {
      currentSrc.current = src;

      setDisplaySrc(src);
      setFade(true);
    };

    image.src = src;

    return () => {
      image.onload = null;
    };
  }, [src]);

  useEffect(() => {
    if (!fade)
      return;

    const timer = setTimeout(() => {
      setFade(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [fade]);

  if (!displaySrc)
    return null;

  return (
    <img
      src={displaySrc}
      alt={alt}
      className={[
        className,
        fade ? styles?.smooth_transition : ''
      ].filter(Boolean).join(' ')}
      {...props}
    />
  );
}
