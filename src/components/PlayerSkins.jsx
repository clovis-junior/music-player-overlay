import { DrawWaveForms, MusicAlbumArt, MusicAlbumBackground, MusicInfo, PlayerInfos, ProgressBar, Scroll, Streaming } from './PlayerComponents'
import { GetURLParams, ConvertTime } from '../functions/Utils'
import styles from '../assets/scss/player.module.scss'

function ProgressAndWaves({
  hideProgressBar = false,
  remainingTime = false,
  hideProgress = false,
  duration = {},
  showWaves = 0,
}) {
  return (
    <footer className={styles?.music_progress}>
      {!hideProgress && (
        <div className={styles?.music_progress_values}>
          <span id={styles?.music_time_elapsed}>{ConvertTime(duration?.elapsed)}</span>
          {showWaves > 0 && (<DrawWaveForms number={showWaves} />)}
          <span id={styles?.music_time_total}>{ConvertTime(remainingTime ? duration?.remaining : duration?.total)}</span>
        </div>
      )}
      {hideProgress && showWaves > 0 && (
        <div className={styles?.music_progress_values}>
          {showWaves > 0 && (<DrawWaveForms number={showWaves} />)}
        </div>
      )}
      {!hideProgressBar && (
        <ProgressBar duration={duration} />
      )}
    </footer>
  )
}

export function CompactSkin(props) {
  const { options, ultra, sleeping, music, ...inline } = props;

  const playerClasses = [
    styles?.music_player_compact,
    ultra ? styles?.ultra : '',
    sleeping ? '' : styles?.show,
    music?.displayIsPlaying ? '' : styles?.paused,
    options?.albumArtTheme ? styles?.album_art_theme : '',
    options?.noShadow ? styles?.no_shadow : '',
    options?.transparentTheme ? styles?.transparent_theme : '',
    options?.solidColor ? options?.lightTheme ? styles?.light : '' : '',
    options?.albumArtTheme ? styles?.vibrant : '',
    options?.squareLayout ? styles?.square : ''
  ].filter(Boolean).join(' ');

  return (
    <main {...inline} className={playerClasses}>
      {(!options?.solidColor && !options?.albumArtTheme) && (
        <MusicAlbumBackground albumImage={music?.albumCover} altText={music?.title} />
      )}
      {!options?.hideProgressBar && (
        <ProgressBar duration={music?.duration} />
      )}
      {options?.showPlatform && (
        <Streaming pathIcon={options?.platformIcon} />
      )}
      <PlayerInfos centered={options?.textCentered}>
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
  const { options, sleeping, music, ...inline } = props;

  const playerClasses = [
    styles?.music_player,
    styles?.vertical,
    sleeping ? '' : styles?.show,
    music?.displayIsPlaying ? '' : styles?.paused,
    options?.albumArtTheme ? styles?.album_art_theme : '',
    options?.noShadow ? styles?.no_shadow : '',
    options?.transparentTheme ? styles?.transparent_theme : '',
    options?.solidColor ? options?.lightTheme ? styles?.light : '' : '',
    options?.albumArtTheme ? styles?.vibrant : '',
    options?.squareLayout ? styles?.square : ''
  ].filter(Boolean).join(' ');

  return (
    <main {...inline} className={playerClasses}>
      {(!options?.solidColor && !options?.albumArtTheme) && (
        <MusicAlbumBackground albumImage={music?.albumCover} altText={music?.title} />
      )}
      <MusicAlbumArt
        showPlatform={options?.showPlatform}
        platformIcon={options?.platformIcon}
        albumImage={music?.albumCover} />
      <PlayerInfos centered={options?.textCentered}>
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
        <ProgressAndWaves
          duration={music?.duration}
          showWaves={options?.showWaves}
          remainingTime={options?.remainingTime}
          hideProgress={options?.hideProgress}
          hideProgressBar={options?.hideProgressBar} />
      </PlayerInfos>
    </main>
  )
}

export function AlternativeSkin(props) {
  const { options, sleeping, music, ...inline } = props;

  const playerClasses = [
    styles?.music_player,
    styles?.alternative,
    sleeping ? '' : styles?.show,
    music?.displayIsPlaying ? '' : styles?.paused,
    options?.albumArtTheme ? styles?.album_art_theme : '',
    options?.noShadow ? styles?.no_shadow : '',
    options?.transparentTheme ? styles?.transparent_theme : '',
    options?.solidColor ? options?.lightTheme ? styles?.light : '' : '',
    options?.albumArtTheme ? styles?.vibrant : '',
    options?.squareLayout ? styles?.square : ''
  ].filter(Boolean).join(' ');

  return (
    <main {...inline} className={playerClasses}>
      {(!options?.solidColor && !options?.albumArtTheme) && (
        <MusicAlbumBackground albumImage={music?.albumCover} altText={music?.title} />
      )}
      {options?.showAlbumArt && (
        <MusicAlbumArt albumImage={music?.albumCover} />
      )}
      <PlayerInfos centered={options?.textCentered}>
        {options?.showPlatform && (
          <Streaming pathIcon={options?.platformIcon} />
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
        <ProgressAndWaves
          duration={music?.duration}
          showWaves={options?.showWaves}
          remainingTime={options?.remainingTime}
          hideProgress={options?.hideProgress}
          hideProgressBar={options?.hideProgressBar} />
      </PlayerInfos>
    </main>
  )
}

export function DefaultSkin(props) {
  const { options, sleeping, music, ...inline } = props;

  const playerClasses = [
    styles?.music_player,
    sleeping ? '' : styles?.show,
    music?.displayIsPlaying ? '' : styles?.paused,
    options?.albumArtTheme ? styles?.album_art_theme : '',
    options?.noShadow ? styles?.no_shadow : '',
    options?.transparentTheme ? styles?.transparent_theme : '',
    options?.solidColor ? options?.lightTheme ? styles?.light : '' : '',
    options?.albumArtTheme ? styles?.vibrant : '',
    options?.squareLayout ? styles?.square : ''
  ].filter(Boolean).join(' ');

  return (
    <main {...inline} className={playerClasses}>
      {options?.showAlbumArt && (
        <MusicAlbumArt
          showPlatform={options?.showPlatform}
          platformIcon={options?.platformIcon}
          albumImage={music?.albumCover} />
      )}
      <PlayerInfos centered={options?.textCentered}>
        {(!options?.solidColor && !options?.albumArtTheme) && (
          <MusicAlbumBackground albumImage={music?.albumCover} altText={music?.title} />
        )}
        {(!options?.showAlbumArt && options?.showPlatform) && (
          <Streaming pathIcon={options?.platformIcon} />
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
        <ProgressAndWaves
          duration={music?.duration}
          showWaves={options?.showWaves}
          remainingTime={options?.remainingTime}
          hideProgress={options?.hideProgress}
          hideProgressBar={options?.hideProgressBar} />
      </PlayerInfos>
    </main>
  )
}