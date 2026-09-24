import { useEffect, useState } from 'react'
import ReactPlayer from 'react-player'
import styles from '../assets/scss/player.module.scss'

export default function AsyncVideo({
  src = null,
  className = null,
  duration = 220,
  loop = true,
  muted = true,
  playsinline = true,
  playing = true,
  altText = ''
}) {
  const [currentSrc, setCurrentSrc] = useState(src || '');
  const [nextSrc, setNextSrc] = useState(null);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    if (!src) {
      setCurrentSrc(null);
      setNextSrc(null);
      setTransitioning(false);
      return
    }

    if (src === currentSrc) return;

    setNextSrc(src)
  }, [src, currentSrc]);

  const handleNextReady = () => {
    if (!nextSrc) return;
    setTransitioning(true)
  };

  useEffect(() => {
    if (!transitioning) return;

    const timer = setTimeout(() => {
      setCurrentSrc(nextSrc);
      setNextSrc(null);
      setTransitioning(false);
    }, duration);

    return () => clearTimeout(timer)
  }, [transitioning, nextSrc, duration]);

  if (!currentSrc && !nextSrc) return null;

  return (
    <>
      {currentSrc && (
        <ReactPlayer
          key={currentSrc}
          className={[
            className,
            nextSrc && transitioning ? styles?.old : ''
          ].filter(Boolean).join(' ')}
          url={currentSrc}
          title={altText}
          playing={playing}
          muted={muted}
          loop={loop}
          playsinline={playsinline} />
      )}

      {nextSrc && (
        <ReactPlayer
          key={nextSrc}
          className={[
            className,
            styles?.new
          ].filter(Boolean).join(' ')}
          url={nextSrc}
          title={altText}
          playing={playing}
          muted={muted}
          loop={loop}
          playsinline={playsinline}
          onReady={handleNextReady} />
      )}
    </>
  );
}
