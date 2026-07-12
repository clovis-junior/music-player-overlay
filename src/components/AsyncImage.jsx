import { useEffect, useRef, useState } from 'react';

export default function AsyncImage(props) {
  const {
    src,
    alt = '',
    animation,
    className = '',
    ...inline
  } = props;

  const imageRef = useRef(null);

  const [displaySrc, setDisplaySrc] = useState(src || '');
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    if (!src || src === displaySrc)
      return;

    const image = new Image();

    function handleLoad() {
      setDisplaySrc(src);

      if (animation)
        setAnimationClass(`animate__animated animate__${animation}`);
    }

    image.addEventListener('load', handleLoad);
    image.src = src;

    return () => {
      image.removeEventListener('load', handleLoad);
    };
  }, [src, displaySrc, animation]);

  useEffect(() => {
    const img = imageRef.current;

    if (!img || !animationClass)
      return;

    function handleAnimationEnd() {
      setAnimationClass('');
    }

    img.addEventListener('animationend', handleAnimationEnd);

    return () => {
      img.removeEventListener('animationend', handleAnimationEnd);
    };
  }, [animationClass]);

  if (!displaySrc)
    return null;

  return (
    <img
      ref={imageRef}
      src={displaySrc}
      alt={alt}
      className={[className, animationClass].filter(Boolean).join(' ')}
      {...inline}
    />
  );
}
