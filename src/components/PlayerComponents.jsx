import { useState, useEffect, useRef } from 'react'
import { ConvertTime } from '../functions/Utils'
import styles from '../assets/scss/player.module.scss'
import AsyncImage from './AsyncImage.jsx'

export function UpdatePercentage(elapsed = 0, total = 0) {
  elapsed = Number(elapsed) || 0;
  total = Number(total) || 0;

  if (total <= 0) return 0;

  return Math.min(100, Math.max(0, (elapsed * 100) / total));
}

export function ProgressBar({
  showPointer = false,
  duration = {
    elapsed: 0,
    total: 0
  }
}) {
  const oficialProgress = UpdatePercentage(duration?.elapsed, duration?.total);

  const [displayProgress, setDisplayProgress] = useState(oficialProgress);

  const stateRef = useRef({
    elapsed: Number(duration?.elapsed) || 0,
    total: Number(duration?.total) || 0,
    lastUpdate: 0,
    isPaused: false
  });

  const currentElapsed = Number(duration?.elapsed) || 0;
  const currentTotal = Number(duration?.total) || 0;

  if (stateRef.current.elapsed !== currentElapsed || stateRef.current.total !== currentTotal) {
    stateRef.current = {
      elapsed: currentElapsed,
      total: currentTotal,
      lastUpdate: performance.now(),
      isPaused: stateRef.current.elapsed === currentElapsed
    };
  }

  useEffect(() => {
    let animationFrameId;

    const tick = () => {
      const now = performance.now();
      const state = stateRef.current;

      if (state.total > 0 && state.elapsed < state.total && !state.isPaused && state.lastUpdate > 0) {
        const timePassedSinceUpdate = (now - state.lastUpdate) / 1000;
        const interpolatedElapsed = state.elapsed + timePassedSinceUpdate;

        setDisplayProgress(UpdatePercentage(interpolatedElapsed, state.total));
      } else
        setDisplayProgress(oficialProgress);

      animationFrameId = requestAnimationFrame(tick)
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [oficialProgress]);

  const classes = [
    styles?.music_progress_bar_fill,
    showPointer ? styles?.with_pointer : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={styles?.music_progress_bar}>
      <div className={classes} style={{ width: `${displayProgress}%` }} />
    </div>
  )
}

export function Equalizer({ size = 0, align = 'left'|'center'|'right' }) {
  let waves = [];

  if (size <= 0)
    return null;

  if (size > 40)
    size = 40;

  if (size < 4)
    size = 4;

  for (let i = 0; i < size; i++)
    waves.push(i);

  const classes = [
    styles?.player_equalizer,
    align === 'left' ? styles?.left : '',
    align === 'right' ? styles?.right : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {waves.map(index => (
        <div key={index} className={styles?.waveform} />
      ))}
    </div>
  )
}

export function MusicTimes({
  align = 'default'|'left'|'center'|'right',
  remainingTime = false,
  duration = {
    remaining: 0,
    elapsed: 0,
    total: 0
  }
}) {
  const classes = [
    styles?.music_time_values,
    align === 'left' ? styles?.left : '',
    align === 'right' ? styles?.right : '',
    align === 'center' ? styles?.centered : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <span id={styles?.music_time_elapsed}>{ConvertTime(duration?.elapsed)}</span>
      <span id={styles?.music_time_total}>{ConvertTime(remainingTime ? duration?.remaining : duration?.total)}</span>
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