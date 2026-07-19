import { useState, useEffect, useRef } from 'react'
import styles from '../assets/scss/player.module.scss'
import AsyncImage from './AsyncImage.jsx'

function UpdatePercentage(elapsed = 0, total = 0) {
  elapsed = Number(elapsed) || 0;
  total = Number(total) || 0;

  if (total <= 0) return 0;

  return Math.min(100, Math.max(0, (elapsed * 100) / total));
}

export function ProgressBar({ duration }) {
  const progress = UpdatePercentage(duration?.elapsed, duration?.total);

  return (
    <div className={styles?.music_progress_bar}>
      <div style={{ transform: `scaleX(${progress / 100})` }} />
    </div>
  )
}

export function DrawWaveForms({ number = 8 }) {
  let waves = [];

  if (number > 40)
    number = 40;

  if (number < 4)
    number = 4;

  for (let i = 0; i < number; i++)
    waves.push(i);

  return (
    <div className={styles?.music_waveforms}>
      {waves.map(index => (
        <div key={index} className={styles?.waveform} />
      ))}
    </div>
  )
}

export function Scroll(props) {
  const { children, timer, ...inline } = props;

  const [scrolled, setScrolled] = useState(false);
  const [scroll, setScroll] = useState(0);

  const element = useRef(null);

  useEffect(() => {
    if (!element?.current) return;

    const interval = setInterval(() => setScrolled(prev => !prev), timer * 1000);

    if (scrolled) {
      const overflow = element?.current?.scrollWidth - element?.current?.offsetWidth;

      return () => {
        setScroll(overflow);
        clearInterval(interval);
      }
    }

    return () => {
      setScroll(0);
      clearInterval(interval);
    }
  }, [timer, scrolled]);

  return (
    <span ref={element} {...inline} style={{
      'transform': !scrolled
        ? `translateX(-${(scroll)}px)`
        : `translateX(0)`
    }}>
      {children}
    </span>
  )
}

export function MusicInfo({ children }) {
  return (
    <div className={styles?.music_info_mask}>
      {children}
    </div>
  )
}

export function PlayerInfos({ children, centered = false }) {
  const style = [
    styles?.music_infos,
    centered ? styles?.centered : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={style}>
      {children}
    </div>
  )
}

export function MusicAlbumArt({
  albumImage = null,
  platformIcon = null,
  showPlatform = false,
  altText = ''
}) {
  if (!albumImage)
    return null;

  return (
    <aside className={styles?.music_album_art}>
      {showPlatform && (
        <Streaming pathIcon={platformIcon} />
      )}
      <figure>
        <AsyncImage src={albumImage} alt={altText} />
      </figure>
    </aside>
  )
}

export function MusicAlbumBackground({ albumImage = null, altText = '' }) {
  return (
    <figure className={styles?.music_album_blur_container}>
      <AsyncImage className={styles?.music_album_art} src={albumImage} alt={altText} />
    </figure>
  )
}

export function Streaming({ pathIcon = null }) {
  if (!pathIcon)
    return null;

  return (
    <div className={styles?.music_platform_icon}>
      <figure>
        <AsyncImage src={pathIcon} />
      </figure>
    </div>
  )
}