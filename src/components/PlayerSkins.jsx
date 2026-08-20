import { Equalizer, MusicAlbumArt, MusicAlbumBackground, MusicInfo, MusicTimes, MusicTimesWithEqualizer, MusicTimesWithProgressBar, PlayerInfos, ProgressBar, Scroll, Streaming, Vinyl } from './PlayerComponents'
import { GetURLParams, ConvertTime } from '../functions/Utils'
import styles from '../assets/scss/player.module.scss'

function universalClasses(options) {
  if (!options) return [];

  return [
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

export function MusicArt({
  showPlatform = false,
  platformIcon = null,
  music = {},
  vinylStopped = false,
  vinyl = false
}) {
  if (vinyl) {
    return (
      <Vinyl key={music?.albumCover}
        alwaysStopped={vinylStopped}
        isPlaying={music?.displayIsPlaying}
        albumImage={music?.albumCover} />
    )
  }

  return (
    <MusicAlbumArt
      showPlatform={showPlatform}
      platformIcon={platformIcon}
      albumImage={music?.albumCover} />
  )
}

function PlayerContent({ platformIcon = null, options = {}, music = {} }) {
  const contentClasses = [
    styles?.player_content,
    options?.invertContent && styles?.inverted
  ].filter(Boolean).join(' ')

  return (
    <div className={contentClasses}>
      {(options?.skin === 'default' && options?.theme === 'default') && (
        <MusicAlbumBackground
          noBlur={options?.albumArtNoBlur}
          albumImage={music?.albumCover}
          altText={music?.title} />
      )}
      <PlayerInfos inverted={options?.invertInfos} align={options?.musicInfosAlign}>
        {((options?.removeAlbumArt || options?.showVinyl) && options?.showPlatformIcon) && (
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
      <DefaultFooter options={options} music={music} />
    </div>
  )
}

function DefaultFooter({
  options = {},
  music = {}
}) {
  const progressBarComponent = !options?.hideProgressBar ? (
    <ProgressBar
      isPaused={!music?.displayIsPlaying}
      showPointer={options?.showBarPointer}
      duration={music?.duration}
    />
  ) : null

  const musicTimes = options?.swapProgressBar ? (
    <MusicTimesWithProgressBar
      align={options?.musicTimesAlign}
      duration={music?.duration}
      hideTimes={options?.removeMusicTimes}
      progressBar={progressBarComponent}
      remainingTime={options?.timeMode === 'remaining'} />
  ) : (
    <MusicTimesWithEqualizer
      align={options?.musicTimesAlign}
      duration={music?.duration}
      hideTimes={options?.removeMusicTimes}
      equalizer={<Equalizer size={options?.equalizer} />}
      remainingTime={options?.timeMode === 'remaining'} />
  )

  const classes = [
    styles?.player_features,
    options?.invertFooterContent && styles?.inverted
  ].filter(Boolean).join(' ');

  return (
    <footer className={classes}>
      {musicTimes}
      <div className={styles?.feature}>
        {options?.swapProgressBar ? (<Equalizer size={options?.equalizer} />) : progressBarComponent}
      </div>
    </footer>
  )
}

export function AlbumArtCardSkin(props) {
  const { options, platformIcon, music, inline, playerClasses } = usePlayerProps(props, [
    styles?.music_player,
    styles?.card
  ]);

  return (
    <main {...inline} className={playerClasses}>
      <div className={styles?.aspect}>
        <MusicArt
          music={music}
          vinyl={options?.showVinyl}
          vinylStopped={options?.notRollVinyl} />
        {options?.showPlatformIcon && (
          <Streaming pathIcon={platformIcon} />
        )}
        {(options?.showVinyl && !options?.hideProgressBar) && (
          <ProgressBar
            isCircular={true}
            isPaused={!music?.displayIsPlaying}
            showPointer={options?.showBarPointer}
            duration={music?.duration} />
        )}
        {(!options?.removeContent && !options?.showVinyl) && (
          <div className={styles?.player_content}>
            {!options?.hideProgressBar && (
              <ProgressBar
                isPaused={!music?.displayIsPlaying}
                showPointer={options?.showBarPointer}
                duration={music?.duration} />
            )}
            <PlayerInfos inverted={options?.invertInfos} align={options?.musicInfosAlign}>
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
            <Equalizer size={options?.equalizer} />
          </div>
        )}
      </div>
    </main>
  )
}

export function CompactSkin(props) {
  const { options, platformIcon, music, inline, playerClasses } = usePlayerProps(props, [
    styles?.music_player_compact,
    props.ultraMode ? styles?.ultra : ''
  ])

  const infos = (
    <PlayerInfos inverted={options?.invertInfos} align={options?.musicInfosAlign}>
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
  )

  return (
    <main {...inline} className={playerClasses}>
      {(options?.theme === 'default') && (
        <MusicAlbumBackground
          noBlur={options?.albumArtNoBlur}
          albumImage={music?.albumCover}
          altText={music?.title} />
      )}
      {!options?.hideProgressBar && (
        <ProgressBar
          onBackground={true}
          isPaused={!music?.displayIsPlaying}
          showPointer={options?.showBarPointer}
          duration={music?.duration}>
          {infos}
        </ProgressBar>
      )}
      {options?.showPlatformIcon && (
        <Streaming pathIcon={platformIcon} />
      )}
      {infos}
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
        <MusicAlbumBackground
          noBlur={options?.albumArtNoBlur}
          albumImage={music?.albumCover}
          altText={music?.title} />
      )}
      {!options?.removeAlbumArt && (
        <MusicArt
          music={music}
          vinyl={options?.showVinyl}
          vinylStopped={options?.notRollVinyl}
          showPlatform={options?.showPlatformIcon}
          platformIcon={platformIcon} />
      )}
      {!options?.removeContent && (
        <PlayerContent platformIcon={platformIcon} options={options} music={music} />
      )}
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
        <MusicAlbumBackground
          noBlur={options?.albumArtNoBlur}
          albumImage={music?.albumCover}
          altText={music?.title} />
      )}
      {!options?.removeAlbumArt && (
        <MusicArt
          music={music}
          vinyl={options?.showVinyl}
          vinylStopped={options?.notRollVinyl}
          showPlatform={options?.showPlatformIcon}
          platformIcon={platformIcon} />
      )}
      {!options?.removeContent && (
        <PlayerContent platformIcon={platformIcon} options={options} music={music} />
      )}
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
        <MusicArt
          music={music}
          vinyl={options?.showVinyl}
          vinylStopped={options?.notRollVinyl}
          showPlatform={options?.showPlatformIcon}
          platformIcon={platformIcon} />
      )}
      {!options?.removeContent && (
        <PlayerContent platformIcon={platformIcon} options={options} music={music} />
      )}
    </main>
  )
}
