import { useState, useEffect, useLayoutEffect, useRef, useMemo } from 'react';
import {
  GetData as YouTubeMusicData,
  UpdatePlayerData as UpdatePlayerDataFromYTM
} from '../platforms/YouTubeMusic.js';
import {
  GetData as AppleMusicData,
  UpdatePlayerTimeData as UpdateTimeDataFromApple,
  UpdatePlayerMusicData as UpdateMusicDataFromApple,
  UpdatePlayerStateData as UpdatePlayerStateFromApple
} from '../platforms/AppleMusic.js';
// import {
//   GetData as SpotifyData,
//   UpdatePlayerData as UpdatePlayerDataFromSpotify
// } from '../platforms/Spotify.js';
import {
  GetData as SpotifyCustomData,
  UpdatePlayerData as UpdatePlayerDataFromSpotifyCustom
} from '../platforms/SpotifyCustom.js';
import { ConvertTime, IsEmpty } from '../Utils.js';
import styles from '../scss/player.module.scss';
import AsyncImage from '../components/AsyncImage.js';
import appleIcon from '../images/apple-music-icon.svg';
import spotifyLogo from '../images/spotify-logo.png';
import ytmLogo from '../images/ytm-logo.png';

function DrawWaveForms({ number = 8 }) {
  let waves = [];

  for (let i = 0; i < number; i++)
    waves.push(i);

  return (
    <div className={`${styles.music_waveforms}`}>
      {waves.map(index => (
        <div key={index} className={styles.waveform} />
      ))}
    </div>
  )
}

function UpdatePercentage(elapsed = 0, total = 0) {
  return (elapsed * 100) / total;
}

function addPlayerClass(name = '', classes = []) {
  if (classes?.indexOf(name) < 0)
    classes?.push(name);
}

function removePlayerClass(name = '', classes = []) {
  if (classes?.indexOf(name) > -1)
    classes?.splice(classes?.indexOf(name), 1);
}

export function Player(props) {
  const [platformLogo, setPlatformLogo] = useState('');
  const [result, setResult] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const platformHasSpotify = props?.platform.includes('spotify');

  const [playerClasses] = useState([]);
  const [albumArtImage, setAlbumArtImage] = useState(null);
  const [musicProgress, setMusicProgress] = useState(0);

  const webSocket = useRef(null);

  const [musicNameScrolled, setMusicNameScrolled] = useState(false);
  const [artistNameScrolled, setArtistNameScrolled] = useState(false);

  const musicNameComponent = useRef(null);
  const artistNameComponent = useRef(null);

  const musicData = useMemo(() => {
    if (!result) return;

    const title = result?.title;
    const artist = result?.artist;

    document.title = title ? `${title} - ${artist}` : 'Paused';

    return { title, artist };
  }, [result]);

  useEffect(() => {
    if (platformHasSpotify) return;

    switch (props?.platform) {
      case 'apple':
        webSocket.current = AppleMusicData();
        webSocket.current?.on('API:Playback', ({ data, type }) => {
          switch (type) {
            case 'playbackStatus.nowPlayingItemDidChange':
              setResult(UpdateMusicDataFromApple(data, result));
              break;
            case 'playbackStatus.playbackTimeDidChange':
              setResult(UpdateTimeDataFromApple(data, result));
              break;
            case 'playbackStatus.playbackStateDidChange':
              setResult(UpdatePlayerStateFromApple(data, result));
              break;
            default:
              console.debug(type, data);
          }
        });
        break;
      case 'youtube':
      default:
        webSocket.current = YouTubeMusicData();
        webSocket.current?.on('state-update', state => {
          setResult(UpdatePlayerDataFromYTM(state));
        });
    }

    return () => {
      if (webSocket.current?.readyState === 1)
        webSocket.current?.disconnect();
    }
  }, [props, result, platformHasSpotify]);

  useEffect(() => {
    if (!platformHasSpotify) return;

    async function Update() {
      var data;

      // if(props.platform === 'spotify') {
      //   data = await SpotifyData();
      //   setResult(UpdatePlayerDataFromSpotify(data));
      // } else if (props.platform === 'spotify-custom') {
      data = await SpotifyCustomData();
      setResult(UpdatePlayerDataFromSpotifyCustom(data));
      // }
    }

    if (loaded) {
      const check = setInterval(async () => await Update(), 2000);

      if (!result || result?.title === '') {
        removePlayerClass(styles.show, playerClasses);
      } else addPlayerClass(styles.show, playerClasses);

      if (result?.isPlaying) {
        const refresh = setTimeout(async () => await Update(), result?.duration?.remaining);
        const update = setInterval(() => {
          result.duration.elapsed++;
          result.duration.remaining--;
        }, 1000);

        return () => {
          clearInterval(update);
          clearTimeout(refresh);
          clearInterval(check);
        }
      }

      return () => clearInterval(check);
    }
  }, [loaded, result, props, playerClasses, platformHasSpotify]);

  useEffect(() => {
    if (!platformHasSpotify) return;

    async function GetResult() {
      var data;

      // if(props.platform === 'spotify') {
      //   data = await SpotifyData();
      //   setResult(UpdatePlayerDataFromSpotify(data));
      // } else if (props.platform === 'spotify-custom') {
      data = await SpotifyCustomData();
      setResult(UpdatePlayerDataFromSpotifyCustom(data));
      // }
    }

    if (!loaded) {
      console.log('Trying to get Spotify data...');
      const check = setInterval(async () => await GetResult(), 3000);
      return () => clearInterval(check);
    } else if (loaded && result?.error) {
      console.log('Trying to get Spotify data... Again...');
      const check = setTimeout(async () => await GetResult(), 5000);
      return () => clearTimeout(check);
    }

  }, [loaded, result, props, platformHasSpotify]);

  useLayoutEffect(() => {
    if (!loaded) return;

    if (result?.isPlaying && albumArtImage !== result?.albumCover)
      setAlbumArtImage(result?.albumCover);

    if (result?.isPlaying) {
      addPlayerClass(styles.show, playerClasses);
      removePlayerClass(styles.paused, playerClasses);
      setMusicProgress(UpdatePercentage(result?.duration?.elapsed, result?.duration?.total));
    } else {
      addPlayerClass(styles.paused, playerClasses);

      const waiting = setTimeout(() => {
        removePlayerClass(styles.show, playerClasses);
      }, (props?.sleepAfter * 1000));

      return () => clearTimeout(waiting);
    }
  }, [loaded, props, result, albumArtImage, playerClasses]);

  useLayoutEffect(() => {
    const musicNameScroll = setInterval(() => setMusicNameScrolled(!musicNameScrolled), 6000);

    return () => clearInterval(musicNameScroll);
  }, [musicNameScrolled]);

  useLayoutEffect(() => {
    const artistNameScroll = setInterval(() => setArtistNameScrolled(!artistNameScrolled), 8000);

    return () => clearInterval(artistNameScroll);
  }, [artistNameScrolled]);

  useLayoutEffect(() => {
    if (loaded) {
      switch (props?.platform) {
        case 'apple':
          setPlatformLogo(appleIcon);
          break;
        case 'youtube':
          setPlatformLogo(ytmLogo);
          break;
        default:
          setPlatformLogo(spotifyLogo);
      }
    }
  }, [loaded, props]);

  useLayoutEffect(() => {
    if (props?.platform === 'apple' || platformHasSpotify) {
      setLoaded(!IsEmpty(result?.title));
    } else
      setLoaded(!IsEmpty(result));

  }, [props, result, platformHasSpotify]);

  if (!loaded) {
    console.log('Loading...');
    return (<></>);
  }

  if (result?.error) {
    console.error(result?.error);
    setLoaded(false);

    return (<>{result?.error}</>);
  }

  if (props?.noShadow) addPlayerClass(styles.no_shadow, playerClasses);
  if (props?.squareLayout) addPlayerClass(styles.square, playerClasses);

  if (props.compact) {
    addPlayerClass(styles.music_player_compact, playerClasses);

    return (
      <main className={playerClasses.join(' ')}>
        {(props?.showPlatform) ? (
          <div className={styles.music_platform_icon}>
            <figure>
              <AsyncImage src={platformLogo} />
            </figure>
          </div>
        ) : (<></>)}
        {(!props.solidColor) ? (
          <div className={styles.music_album_blur_container}>
            <div className={styles.music_album_art} style={{ 'backgroundImage': `url(${albumArtImage})` }}></div>
          </div>
        ) : (<></>)}
        {(!props.hideProgressBar) ? (
          <div className={styles.music_progress_bar}>
            <div id='music-progress-bar' style={{ 'width': `${musicProgress}%` }} />
          </div>
        ) : (<></>)}
        <div className={props?.textCentered ? `${styles.music_infos} ${styles.centered}` : styles.music_infos}>
          <div className={styles.music_info_mask}>
            <span ref={musicNameComponent} id={styles.music_title} style={{
              'transform': (!musicNameScrolled)
                ? `translateX(-${(musicNameComponent.current?.scrollWidth - musicNameComponent.current?.offsetWidth)}px)`
                : `translateX(0)`
            }}>{musicData?.title}</span>
          </div>
          <div className={styles.music_info_mask}>
            <span ref={artistNameComponent} id={styles.music_artist} style={{
              'transform': (!artistNameScrolled)
                ? `translateX(-${(artistNameComponent.current?.scrollWidth - artistNameComponent.current?.offsetWidth)}px)`
                : `translateX(0)`
            }}>{musicData?.artist}</span>
          </div>
        </div>
      </main>
    )
  }

  addPlayerClass(styles.music_player, playerClasses);

  return (
    <main className={playerClasses.join(' ')}>
      {(props.showAlbum) ? (
        <div className={styles.music_album_art}>
          {(props.showAlbum && props?.showPlatform) ? (
            <div className={styles.music_platform_icon}>
              <figure>
                <AsyncImage src={platformLogo} />
              </figure>
            </div>
          ) : (<></>)}
          <figure>
            <img id={styles.music_album_art} src={albumArtImage} alt={result?.title} />
          </figure>
        </div>
      ) : (<></>)}
      <aside className={styles.music_infos}>
        {(!props.showAlbum && props?.showPlatform) ? (
          <div className={styles.music_platform_icon}>
            <figure>
              <AsyncImage src={platformLogo} />
            </figure>
          </div>
        ) : (<></>)}
        {(!props.solidColor) ? (
          <div className={styles.music_album_blur_container}>
            <div className={styles.music_album_art} style={{ 'backgroundImage': `url(${albumArtImage})` }}></div>
          </div>
        ) : (<></>)}
        <div className={styles.music_info_mask}>
          <span ref={musicNameComponent} id={styles.music_title} style={{
            'transform': (!musicNameScrolled)
              ? `translateX(-${(musicNameComponent.current?.scrollWidth - musicNameComponent.current?.offsetWidth)}px)`
              : `translateX(0)`
          }}>{musicData?.title}</span>
        </div>
        <div className={styles.music_info_mask}>
          <span ref={artistNameComponent} id={styles.music_artist} style={{
            'transform': (!artistNameScrolled)
              ? `translateX(-${(artistNameComponent.current?.scrollWidth - artistNameComponent.current?.offsetWidth)}px)`
              : `translateX(0)`
          }}>{musicData?.artist}</span>
        </div>
        {(props.hideProgressBar && props.hideProgress) ?
          (props?.showWaves > 0) ? (<DrawWaveForms number={props?.showWaves} />) : (<></>) : (
            <footer className={styles.music_progress}>
              <div className={styles.music_progress_values}>
                {!props.hideProgress ? (<span id={styles.music_time_elapsed}>{ConvertTime(result.duration?.elapsed)}</span>) : (<></>)}
                {(props?.showWaves > 0) ? (<DrawWaveForms number={props?.showWaves} />) : (<></>)}
                {!props.hideProgress ? (
                  <span id={styles.music_time_total}>{props?.remainingTime ? ConvertTime(result.duration?.remaining) : ConvertTime(result.duration?.total)}</span>)
                  : (<></>)}
              </div>
              {(!props.hideProgressBar) ? (
                <div className={styles.music_progress_bar}>
                  <div style={{ 'width': `${musicProgress}%` }} />
                </div>
              ) : (<></>)}
            </footer>
          )}
      </aside>
    </main>
  )
}
