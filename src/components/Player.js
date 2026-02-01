import { useState, useEffect, useLayoutEffect, useRef, useMemo } from 'react';
import { Vibrant } from 'node-vibrant/browser';

import {
  GetData as YouTubeMusicData,
  UpdatePlayerData as UpdatePlayerDataFromYTM
} from '../platforms/YouTubeMusic.js';

import {
  GetData as AppleMusicData,
  UpdateMusicTime as UpdateMusicTimeFromCider,
  UpdateMusicData as UpdateMusicDataFromCider,
  UpdatePlaybackState as UpdatePlaybackStateFromCider
} from '../platforms/AppleMusic.js';

import {
  GetData as SpotifyData,
  UpdatePlayerData as UpdatePlayerDataFromSpotify
} from '../platforms/Spotify.js';

import { ConvertTime, IsEmpty } from '../Utils.js';
import styles from '../scss/player.module.scss';

import AsyncImage from '../components/AsyncImage.js';

import appleIcon from '../images/apple-music-icon.svg';
import spotifyLogo from '../images/spotify-logo.png';
import ytmLogo from '../images/ytm-logo.png';

const defaultTitle = document.title;

function DrawWaveForms({ number = 8 }) {
  let waves = [];

  for (let i = 0; i < number; i++)
    waves.push(i);

  return (
    <div className={`${styles?.music_waveforms}`}>
      {waves.map(index => (
        <div key={index} className={styles?.waveform} />
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
  const [result, setResult] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [sleeping, setSleeping] = useState(false);

  const [playerClasses] = useState([]);

  const [albumArtImage, setAlbumArtImage] = useState(null);
  const [musicProgress, setMusicProgress] = useState(0);

  const [musicNameScrolled, setMusicNameScrolled] = useState(false);
  const [artistNameScrolled, setArtistNameScrolled] = useState(false);

  const webSocket = useRef(null);

  const playerComponent = useRef(null);
  const musicNameComponent = useRef(null);
  const artistNameComponent = useRef(null);

  const musicData = useMemo(() => {
    if (IsEmpty(result?.title) || IsEmpty(result?.artist))
      return null;

    const title = result?.title;
    const artist = result?.artist;

    document.title = title ? `${title} - ${artist}` : defaultTitle;

    return { title, artist };
  }, [result?.title, result?.artist]);

  //---------------- Apple Music and YouTube Music Connections --------------------//
  useEffect(() => {
    let socket;

    if (props?.platform === 'apple') {
      socket = AppleMusicData();

      socket?.on('API:Playback', ({ data, type }) => {
        switch (type) {
          case 'playbackStatus.playbackStateDidChange':
            setResult(current => ({...current, ...UpdatePlaybackStateFromCider(data)}));
            break;
          case 'playbackStatus.nowPlayingItemDidChange':
            setResult(current => ({...current, ...UpdateMusicDataFromCider(data)}));
            break;
          case 'playbackStatus.playbackTimeDidChange':
            setResult(current => ({...current, ...UpdateMusicTimeFromCider(data)}));
            break;
          default:
            console.debug(type, data);
        }
      });
    } else if (props?.platform === 'youtube') {
      socket = YouTubeMusicData();

      socket?.on('state-update', state => {
        setResult(UpdatePlayerDataFromYTM(state));
      });
    }

    webSocket.current = socket;
    webSocket.current?.connect();

    return () => {
      if (props?.platform === 'apple')
        webSocket.current?.off('API:Playback');
      else if (props?.platform === 'youtube')
        webSocket.current?.off('state-update');

      if (webSocket.current?.connected)
        webSocket.current?.disconnect();

      webSocket.current = null;
    }
  }, [props?.platform]);

  //---------------- Spotify Connection --------------------//
  useEffect(() => {
    if (props?.platform === 'spotify') {
      async function GetResult() {
        let data = await SpotifyData();
        setResult(UpdatePlayerDataFromSpotify(data));
      }

      const check = setInterval(async () => await GetResult(), 2000);

      if (!loaded) {
        console.log('Connecting to Spotify API...');
        return () => clearInterval(check);
      }

      if (result?.error) {
        console.log('Trying to get Spotify data...');
        return () => clearInterval(check);
      }

      if (result?.type !== 'track')
        removePlayerClass(styles?.show, playerClasses);
      else
        addPlayerClass(styles?.show, playerClasses);

      if (result?.isPlaying) {
        const refresh = setTimeout(async () => await GetResult(), result?.duration?.remaining);
        const update = setInterval(() => {
          result.duration.elapsed++;
          result.duration.remaining--;
        }, 1000);

        return () => {
          clearInterval(check);
          clearInterval(update);
          clearTimeout(refresh);
        }
      }

      console.log('Connecting to Spotify API...');
      return () => clearInterval(check);
    }
  }, [loaded, result, playerClasses, props?.platform]);

  //---------------- Player Functions --------------------//
  useEffect(() => {
    if (result?.isPlaying) {
      const percentage = UpdatePercentage(result?.duration?.elapsed, result?.duration?.total);

      return () => setMusicProgress(percentage);
    }

  }, [result?.isPlaying, result?.duration?.elapsed, result?.duration?.total]);

  useEffect(() => {
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
  }, [props?.platform]);

  useLayoutEffect(() => {
    setAlbumArtImage(result?.albumCover)
  }, [result?.albumCover, albumArtImage]);

  useLayoutEffect(() => {
    const musicNameScroll = setInterval(() => setMusicNameScrolled(!musicNameScrolled), 6000);

    return () => clearInterval(musicNameScroll);
  }, [musicNameScrolled]);

  useLayoutEffect(() => {
    const artistNameScroll = setInterval(() => setArtistNameScrolled(!artistNameScrolled), 8000);

    return () => clearInterval(artistNameScroll);
  }, [artistNameScrolled]);

  useLayoutEffect(() => {
    if (result?.isPlaying && sleeping)
      return () => setSleeping(false);
    
    if (!result?.isPlaying && !sleeping) {
      const timer = setTimeout(() => {
        console.log('Sleeping...');
        setSleeping(true);
      }, (props?.sleepAfter * 1000));

      return () => clearTimeout(timer);
    }
  }, [result?.isPlaying, sleeping, props?.sleepAfter]);

  useLayoutEffect(() => {
    if (sleeping)
      removePlayerClass(styles?.show, playerClasses);
    else
      addPlayerClass(styles?.show, playerClasses);

    if (result?.isPlaying)
      removePlayerClass(styles?.paused, playerClasses);
    else
      addPlayerClass(styles?.paused, playerClasses);

  }, [result?.isPlaying, sleeping, playerClasses]);

  useLayoutEffect(() => {
    if (!IsEmpty(albumArtImage) && !IsEmpty(musicData))
      setLoaded(true);

  }, [albumArtImage, musicData]);

  useEffect(() => {
    if (!albumArtImage || !props?.albumArtTheme) return;

    Vibrant.from(albumArtImage)
    .getPalette().then(palette => {
      const swatch = palette?.DarkVibrant || 
      palette?.LightVibrant || palette?.Vibrant || 
      palette?.Muted;

      if (!swatch) return;

      const [r, g, b] = swatch?.rgb;

      playerComponent?.current.style?.setProperty('--background-color', `${r},${g},${b}`);

      const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

      playerComponent?.current.style?.setProperty('--text-color',
        luminance > .6 ? '0,0,0' : '255,255,255'
      )
    }).catch(console.error);

  }, [albumArtImage, props?.albumArtTheme, playerClasses]);

  if (!loaded) {
    console.log('Loading...');
    return (<></>);
  }

  if (result?.error) {
    console.error(result?.error);
    setLoaded(false);

    return (<>{result?.error}</>);
  }

  if (props?.albumArtTheme) addPlayerClass(styles?.album_art_theme, playerClasses);
  if (props?.lightTheme) addPlayerClass(styles?.light, playerClasses);
  if (props?.noShadow) addPlayerClass(styles?.no_shadow, playerClasses);
  if (props?.squareLayout) addPlayerClass(styles?.square, playerClasses);
  if (props.compact) {
    addPlayerClass(styles?.music_player_compact, playerClasses);

    return (
      <main ref={playerComponent} className={playerClasses.join(' ')}>
        {(props?.showPlatform) ? (
          <div className={styles?.music_platform_icon}>
            <figure>
              <AsyncImage src={platformLogo} />
            </figure>
          </div>
        ) : (<></>)}
        {(!props.solidColor) ? (
          <div className={styles?.music_album_blur_container}>
            <div className={styles?.music_album_art} style={{ 'backgroundImage': `url(${albumArtImage})` }}></div>
          </div>
        ) : (<></>)}
        {(!props.hideProgressBar) ? (
          <div className={styles?.music_progress_bar}>
            <div id='music-progress-bar' style={{ 'width': `${musicProgress}%` }} />
          </div>
        ) : (<></>)}
        <div className={props?.textCentered ? `${styles?.music_infos} ${styles?.centered}` : styles?.music_infos}>
          <div className={styles?.music_info_mask}>
            <span ref={musicNameComponent} id={styles?.music_title} style={{
              'transform': (!musicNameScrolled)
                ? `translateX(-${(musicNameComponent.current?.scrollWidth - musicNameComponent.current?.offsetWidth)}px)`
                : `translateX(0)`
            }}>{musicData?.title}</span>
          </div>
          <div className={styles?.music_info_mask}>
            <span ref={artistNameComponent} id={styles?.music_artist} style={{
              'transform': (!artistNameScrolled)
                ? `translateX(-${(artistNameComponent.current?.scrollWidth - artistNameComponent.current?.offsetWidth)}px)`
                : `translateX(0)`
            }}>{musicData?.artist}</span>
          </div>
        </div>
      </main>
    )
  }

  addPlayerClass(styles?.music_player, playerClasses);

  return (
    <main ref={playerComponent} className={playerClasses.join(' ')}>
      {(props.showAlbum) ? (
        <div className={styles?.music_album_art}>
          {(props.showAlbum && props?.showPlatform) ? (
            <div className={styles?.music_platform_icon}>
              <figure>
                <AsyncImage src={platformLogo} />
              </figure>
            </div>
          ) : (<></>)}
          <figure>
            <img id={styles?.music_album_art} src={albumArtImage} alt={musicData?.title} />
          </figure>
        </div>
      ) : (<></>)}
      <aside className={styles?.music_infos}>
        {(!props.showAlbum && props?.showPlatform) ? (
          <div className={styles?.music_platform_icon}>
            <figure>
              <AsyncImage src={platformLogo} />
            </figure>
          </div>
        ) : (<></>)}
        {(!props.solidColor) ? (
          <div className={styles?.music_album_blur_container}>
            <div className={styles?.music_album_art} style={{ 'backgroundImage': `url(${albumArtImage || 'null'})` }}></div>
          </div>
        ) : (<></>)}
        <div className={styles?.music_info_mask}>
          <span ref={musicNameComponent} id={styles?.music_title} style={{
            'transform': (!musicNameScrolled)
              ? `translateX(-${(musicNameComponent.current?.scrollWidth - musicNameComponent.current?.offsetWidth)}px)`
              : `translateX(0)`
          }}>{musicData?.title}</span>
        </div>
        <div className={styles?.music_info_mask}>
          <span ref={artistNameComponent} id={styles?.music_artist} style={{
            'transform': (!artistNameScrolled)
              ? `translateX(-${(artistNameComponent.current?.scrollWidth - artistNameComponent.current?.offsetWidth)}px)`
              : `translateX(0)`
          }}>{musicData?.artist}</span>
        </div>
        {(props.hideProgressBar && props.hideProgress) ?
          (props?.showWaves > 0) ? (<DrawWaveForms number={props?.showWaves} />) : (<></>) : (
            <footer className={styles?.music_progress}>
              <div className={styles?.music_progress_values}>
                {!props.hideProgress ? (<span id={styles?.music_time_elapsed}>{ConvertTime(result.duration?.elapsed)}</span>) : (<></>)}
                {(props?.showWaves > 0) ? (<DrawWaveForms number={props?.showWaves} />) : (<></>)}
                {!props.hideProgress ? (
                  <span id={styles?.music_time_total}>{props?.remainingTime ? ConvertTime(result.duration?.remaining) : ConvertTime(result.duration?.total)}</span>)
                  : (<></>)}
              </div>
              {(!props.hideProgressBar) ? (
                <div className={styles?.music_progress_bar}>
                  <div style={{ 'width': `${musicProgress}%` }} />
                </div>
              ) : (<></>)}
            </footer>
          )}
      </aside>
    </main>
  )
}
