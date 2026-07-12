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

  const [loaded, setLoaded] = useState(null);
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    if (!src) {
      setLoaded(null);
      setAnimationClass('');
      return;
    }

    const image = new Image();

    function handleLoad() {
      setLoaded(src);

      if (animation) {
        setAnimationClass(`animate__animated animate__${animation}`);
      }
    }

    image.addEventListener('load', handleLoad);
    image.src = src;

    return () => {
      image.removeEventListener('load', handleLoad);
    };
  }, [src, animation]);

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

  if (loaded !== src)
    return null;

  return (
    <img
      ref={imageRef}
      src={src}
      alt={alt}
      className={[className, animationClass].filter(Boolean).join(' ')}
      {...inline}
    />
  );
}
