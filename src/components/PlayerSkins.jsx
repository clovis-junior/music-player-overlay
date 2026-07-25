import { Equalizer, MusicAlbumArt, MusicAlbumBackground, MusicInfo, MusicTimes, MusicTimesWithEqualizer, MusicTimesWithProgressBar, PlayerInfos, ProgressBar, Scroll, Streaming } from './PlayerComponents'
import { GetURLParams, ConvertTime } from '../functions/Utils'
import styles from '../assets/scss/player.module.scss'

function universalClasses(options) {
  if (!options) return [];

  return [
    options?.preview && styles?.is_preview,
    options?.reverse && styles?.inverted,
    options?.theme === 'vibrant' && styles?.vibrant,
    options?.theme === 'light' && styles?.light,
    options?.theme === 'transparent' && styles?.transparent,
    options?.textColor === 'dark' && styles?.dark_text,
    options?.removeDropShadow && styles?.no_shadow,
    options?.squareBorder && styles?.square
  ]
}

function usePlayerProps(props, baseClasses = []) {
  const {
    platformIcon,
    options = {},
    ultraMode = false,
    sleeping = false,
    music = {},
    ...inline
  } = props;

  const playerClasses = [
    ...baseClasses,
    !sleeping && styles.show,
    !music.displayIsPlaying && styles.paused,
    ...universalClasses(options)
  ].filter(Boolean).join(' ');

  return { options, ultraMode, platformIcon, music, inline, playerClasses };
}

function MusicProgress({
  align = 'default',
  remainingTime = false,
  equalizer = 0,
  duration = {
    remaining: 0,
    elapsed: 0,
    total: 0
  },
}) {
  return (
    <MusicTimes
      align={align}
      equalizer={equalizer}
      remainingTime={remainingTime}
      duration={duration} />
  )
}

function DefaultFooter({
  options = {},
  duration = {
    remaining: 0,
    elapsed: 0,
    total: 0
  }
}) {
  const progressBarComponent = (
    <ProgressBar
      showPointer={options?.showBarPointer}
      duration={duration}
    />
  )

  const musicTime = !options?.removeMusicTimes && options?.swap ? (
    <div key="music-time-progress" className={styles?.feature}>
      <MusicTimesWithProgressBar
        align={options?.musicTimesAlign}
        duration={duration}
        progressBar={!options?.hideProgressBar ? progressBarComponent : null}
        remainingTime={options?.timeMode === 'remaining'} />
    </div>
  ) : (
    <div key="music-time-equalizer" className={styles?.feature}>
      <MusicTimesWithEqualizer
        align={options?.musicTimesAlign}
        duration={duration}
        equalizer={<Equalizer size={options?.equalizer} />}
        remainingTime={options?.timeMode === 'remaining'} />
    </div>
  )

  const classes = [
    styles?.player_features,
    options?.invertContent && styles?.inverted
  ].filter(Boolean).join(' ');

  return (
    <footer className={classes}>
      {musicTime}
      <div className={styles?.feature}>
        {options?.swap ? (
          <Equalizer size={options?.equalizer} />
        ) : !options?.hideProgressBar && progressBarComponent}
      </div>
    </footer>
  )
}

export function CompactSkin(props) {
  const { options, platformIcon, music, inline, playerClasses } = usePlayerProps(props, [
    styles?.music_player_compact,
    props.ultraMode ? styles?.ultra : ''
  ]);

  return (
    <main {...inline} className={playerClasses}>
      {(options?.theme === 'default') && (
        <MusicAlbumBackground albumImage={music?.albumCover} altText={music?.title} />
      )}
      {!options?.hideProgressBar && (
        <ProgressBar onBackground={true} showPointer={options?.showBarPointer} duration={music?.duration} />
      )}
      {options?.showPlatformIcon && (
        <Streaming pathIcon={platformIcon} />
      )}
      <PlayerInfos centered={options?.textAlignCenter}>
        <MusicInfo>
          <Scroll key={music?.title} id={styles?.music_title} timer={6}>
            {music?.title}
          </Scroll>
        </MusicInfo>
        <MusicInfo>
          <Scroll key={music?.artist} id={styles?.music_artist} timer={8}>
            {music?.artist}
          </Scroll>
        </MusicInfo>
      </PlayerInfos>
    </main>
  )
}

export function VerticalSkin(props) {
  const { options, platformIcon, music, inline, playerClasses } = usePlayerProps(props, [
    styles?.music_player,
    styles?.vertical
  ]);

  return (
    <main {...inline} className={playerClasses}>
      {(options?.theme === 'default') && (
        <MusicAlbumBackground albumImage={music?.albumCover} altText={music?.title} />
      )}
      {!options?.removeAlbumArt && (
        <MusicAlbumArt
          showPlatform={options?.showPlatformIcon}
          platformIcon={platformIcon}
          albumImage={music?.albumCover} />
      )}
      <div className={styles?.player_content}>
        <PlayerInfos centered={options?.textAlignCenter}>
          {(options?.removeAlbumArt && options?.showPlatformIcon) && (
            <Streaming pathIcon={platformIcon} />
          )}
          <MusicInfo>
            <Scroll key={music?.title} id={styles?.music_title} timer={6}>
              {music?.title}
            </Scroll>
          </MusicInfo>
          <MusicInfo>
            <Scroll key={music?.artist} id={styles?.music_artist} timer={8}>
              {music?.artist}
            </Scroll>
          </MusicInfo>
        </PlayerInfos>
        <DefaultFooter options={options} duration={music?.duration} />
      </div>
    </main>
  )
}

export function AlternativeSkin(props) {
  const { options, platformIcon, music, inline, playerClasses } = usePlayerProps(props, [
    styles?.music_player,
    styles?.alternative
  ]);

  return (
    <main {...inline} className={playerClasses}>
      {(options?.theme === 'default') && (
        <MusicAlbumBackground albumImage={music?.albumCover} altText={music?.title} />
      )}
      {!options?.removeAlbumArt && (
        <MusicAlbumArt albumImage={music?.albumCover} />
      )}
      <div className={styles?.player_content}>
        <PlayerInfos centered={options?.textAlignCenter}>
          {options?.showPlatformIcon && (
            <Streaming pathIcon={platformIcon} />
          )}
          <MusicInfo>
            <Scroll key={music?.title} id={styles?.music_title} timer={6}>
              {music?.title}
            </Scroll>
          </MusicInfo>
          <MusicInfo>
            <Scroll key={music?.artist} id={styles?.music_artist} timer={8}>
              {music?.artist}
            </Scroll>
          </MusicInfo>
        </PlayerInfos>
        <DefaultFooter options={options} duration={music?.duration} />
      </div>
    </main>
  )
}

export function DefaultSkin(props) {
  const { options, platformIcon, music, inline, playerClasses } = usePlayerProps(props, [
    styles?.music_player
  ]);

  return (
    <main {...inline} className={playerClasses}>
      {!options?.removeAlbumArt && (
        <MusicAlbumArt
          showPlatform={options?.showPlatformIcon}
          platformIcon={platformIcon}
          albumImage={music?.albumCover} />
      )}
      <div className={styles?.player_content}>
        {(options?.theme === 'default') && (
          <MusicAlbumBackground albumImage={music?.albumCover} altText={music?.title} />
        )}
        <PlayerInfos centered={options?.textAlignCenter}>
          {(options?.removeAlbumArt && options?.showPlatformIcon) && (
            <Streaming pathIcon={platformIcon} />
          )}
          <MusicInfo>
            <Scroll key={music?.title} id={styles?.music_title} timer={6}>
              {music?.title}
            </Scroll>
          </MusicInfo>
          <MusicInfo>
            <Scroll key={music?.artist} id={styles?.music_artist} timer={8}>
              {music?.artist}
            </Scroll>
          </MusicInfo>
        </PlayerInfos>
        <DefaultFooter options={options} duration={music?.duration} />
      </div>
    </main>
  )
}