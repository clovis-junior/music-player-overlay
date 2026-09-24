import { useEffect, useState } from 'react'
import ReactPlayer from 'react-player'
import styles from '../assets/scss/player.module.scss'

export default function AsyncVideo({
  src = null,
  className = null,
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
      return
    }

    if (src === currentSrc) return;

    setNextSrc(src)
  }, [src, currentSrc]);

  const handleNextReady = () => {
    setCurrentSrc(nextSrc);
    setNextSrc(null)
  };

  if (!currentSrc && !nextSrc) return null;

  return (
    <>
      {currentSrc && (
        <ReactPlayer
          key={currentSrc} src={currentSrc}
          className={className}
          title={altText}
          playing={playing}
          muted={muted} loop={loop}
          playsinline={playsinline} />
      )}
      {nextSrc && (
        <ReactPlayer
          key={nextSrc} src={nextSrc}
          className={className}
          title={altText}
          playing={playing}
          muted={muted} loop={loop}
          playsinline={playsinline}
          onReady={handleNextReady} />
      )}
    </>
  );
}
