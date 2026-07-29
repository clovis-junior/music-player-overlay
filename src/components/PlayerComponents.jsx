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
  onBackground = false,
  showPointer = false,
  isPaused = false,
  duration = {
    elapsed: 0,
    total: 0
  },
  children = null
}) {
  const currentElapsed = Number(duration?.elapsed) || 0;
  const currentTotal = Number(duration?.total) || 0;
  const oficialProgress = UpdatePercentage(currentElapsed, currentTotal);

  const [displayProgress, setDisplayProgress] = useState(oficialProgress);

  const stateRef = useRef({
    elapsed: currentElapsed,
    total: currentTotal,
    lastUpdate: performance.now(),
  });
  
  useEffect(() => {
    stateRef.current = {
      elapsed: currentElapsed,
      total: currentTotal,
      lastUpdate: performance.now(),
    };

    setDisplayProgress(oficialProgress);
  }, [currentElapsed, currentTotal, oficialProgress]);

  useEffect(() => {
    if (isPaused) {
      setDisplayProgress(UpdatePercentage(stateRef.current.elapsed, stateRef.current.total));
      return;
    }

    let animationFrameId;

    const tick = () => {
      const now = performance.now();
      const state = stateRef.current;

      if (state.total > 0 && state.elapsed < state.total && state.lastUpdate > 0) {
        const timePassedSinceUpdate = (now - state.lastUpdate) / 1000;
        const interpolatedElapsed = state.elapsed + timePassedSinceUpdate;

        setDisplayProgress(UpdatePercentage(interpolatedElapsed, state.total));
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused]);

  const baseClasses = [
    styles?.music_progress_bar,
    onBackground && styles?.on_background
  ].filter(Boolean).join(' ');

  const fillClasses = [
    styles?.music_progress_bar_fill,
    showPointer && styles?.with_pointer
  ].filter(Boolean).join(' ');

  return (
    <div className={baseClasses}>
      <div className={fillClasses} style={{ width: `${displayProgress}%` }}>
        {children}
      </div>
    </div>
  );
}

export function Equalizer({ size = 0 }) {
  let waves = [];

  if (size <= 0)
    return null;

  if (size > 40)
    size = 40;

  if (size < 4)
    size = 4;

  for (let i = 0; i < size; i++)
    waves.push(i);


  return (
    <div className={styles?.player_equalizer}>
      {waves.map(index => (
        <div key={index} className={styles?.waveform} />
      ))}
    </div>
  )
}

export function MusicTimes({
  align = 'default',
  remainingTime = false,
  duration = {
    remaining: 0,
    elapsed: 0,
    total: 0
  },
  children = null
}) {
  const classes = [
    styles?.music_time_values,
    align === 'left' && styles?.left,
    align === 'right' && styles?.right,
    align === 'center' && styles?.centered
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <span id={styles?.music_time_elapsed}>{ConvertTime(duration?.elapsed)}</span>
      {children}
      <span id={styles?.music_time_total}>{ConvertTime(remainingTime ? duration?.remaining : duration?.total)}</span>
    </div>
  )
}

export function MusicTimesWithEqualizer({ hideTimes = false, equalizer = null, ...props }) {
  const { align = 'default' } = props;

  const halfEqualizerSize = Math.round(equalizer?.props?.size / 2);

  if (hideTimes)
    return (
      <div className={styles?.feature}>
        {equalizer}
      </div>
    );

  return (
    <div className={styles?.feature}>
      {align === 'right' && equalizer}
      {align === 'center' && (<Equalizer size={halfEqualizerSize} />)}
      <MusicTimes {...props}>
        {align === 'default' && equalizer}
      </MusicTimes>
      {align === 'left' && equalizer}
      {isCenterAlign && (<Equalizer size={halfEqualizerSize} />)}
    </div>
  )
}

export function MusicTimesWithProgressBar({ hideTimes = false, progressBar = null, ...props }) {
  const {
    align = 'default'
  } = props;

  const containerRef = useRef(null);
  const [featureWidth, setFeatureWidth] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries)
        setFeatureWidth(entry.contentRect.width);
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  if (align === 'center') {
    const musicTimesComponent = !hideTimes && (
      <MusicTimes {...props} />
    )

    return progressBar ? (
      <div ref={containerRef} className={styles?.feature} style={{ '--feature-width': `${featureWidth}px` }}>
        {musicTimesComponent}
        <ProgressBar onBackground={true} {...progressBar?.props}>
          {musicTimesComponent}
        </ProgressBar>
      </div>
    ) : (
      <div className={styles?.feature}>
        {musicTimesComponent}
      </div>
    )
  }

  if (hideTimes)
    return (
      <div className={styles?.feature}>
        {progressBar}
      </div>
    );

  return (
    <div className={styles?.feature}>
      {align === 'right' && progressBar}
      <MusicTimes {...props}>
        {align === 'default' && progressBar}
      </MusicTimes>
      {align === 'left' && progressBar}
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

export function PlayerInfos({ children, inverted = false, centered = false }) {
  const style = [
    styles?.music_infos,
    inverted && styles?.inverted,
    centered && styles?.centered
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
    <div className={styles?.music_album_art}>
      {showPlatform && (
        <Streaming pathIcon={platformIcon} />
      )}
      <figure>
        <AsyncImage src={albumImage} alt={altText} />
      </figure>
    </div>
  )
}

export function Vinyl(props) {
  const {
    isPlaying = false,
    albumImage = null,
    altText = '',
    ...inline
  } = props;

  if (!albumImage)
    return null;

  const style = [
    styles?.vinyl,
    isPlaying && styles?.playing
  ].filter(Boolean).join(' ');

  return (
    <div {...inline} className={style}>
      <div className={styles?.vinyl_body}>
        <div className={styles?.vinyl_grooves} />
        <div className={styles?.vinyl_label}>
          <AsyncImage src={albumImage} alt={altText} />
          <div className={styles?.vinyl_center_hole} />
        </div>
      </div>
    </div>
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
