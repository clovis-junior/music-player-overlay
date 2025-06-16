import { useState, useEffect, useLayoutEffect, useRef, useMemo } from 'react';
import {
  GetData as YouTubeMusicData,
  UpdatePlayerData as UpdatePlayerDataFromYTM
} from '../platforms/YouTubeMusic';
import {
  GetData as AppleMusicData,
  UpdatePlayerData as UpdatePlayerDataFromApple
} from '../platforms/AppleMusic';
import {
  GetData as SpotifyData,
  UpdatePlayerData as UpdatePlayerDataFromSpotify
} from '../platforms/Spotify';
import {
  GetData as SpotifyCustomData,
  UpdatePlayerData as UpdatePlayerDataFromSpotifyCustom
} from '../platforms/SpotifyCustom';
import { ConvertTime } from '../Utils';
import styles from '../scss/player.module.scss';

function DrawWaveForms({ number = 8 }) {
  let waves = [];

  for (let i = 0; i < number; i++)
    waves.push(i);

  return (
    <div className={styles.music_waveforms}>
      {waves.map(index => (
        <div key={index} className={styles.waveform} />
      ))}
    </div>
  )
}

function UpdatePercentage(elapsed, total) {
  return (elapsed * 100) / total;
}

function addPlayerClass(name, classes) {
  if (classes.indexOf(name) < 0)
    classes.push(name);
}

function removePlayerClass(name, classes) {
  if (classes.indexOf(name) > -1)
    classes.splice(classes.indexOf(name), 1);
}

export function Player(props) {
  const [result, setResult] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const platformHasSpotify = (['spotify', 'spotify-custom'].includes(props.platform));

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

    return { title, artist };
  }, [result]);

  useEffect(() => {
    if (platformHasSpotify) return;

    switch (props?.platform) {
      case 'apple':
        webSocket.current = AppleMusicData();

        webSocket.current?.on('API:Playback', ({ data, type }) => {
          if (type === 'playbackStatus.playbackStateDidChange')
            setResult(UpdatePlayerDataFromApple(data));
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
      if (webSocket.current?.connected)
        webSocket.current?.disconnect();
    }
  }, [props, platformHasSpotify]);

  useEffect(() => {
    if (!platformHasSpotify) return;

    async function Update() {
      var data;

      if(props.platform === 'spotify')
        data = await SpotifyData();
      else if (props.platform === 'spotify-custom')
        data = await SpotifyCustomData();

      setResult(()=>{
        if(props.platform === 'spotify')
          UpdatePlayerDataFromSpotify(data)
        else if (props.platform === 'spotify-custom')
          UpdatePlayerDataFromSpotifyCustom(data)
      })
    }

    if (loaded && result) {
      if (result?.isPlaying) {
        const check = setInterval(async () => await Update(), 3000);
        const refresh = setTimeout(async () => await Update(), (result.duration?.remaining || 0));

        const update = setInterval(() => {
          result.duration.elapsed++;
          result.duration.remaining--;
        }, 1000);

        return () => {
          clearInterval(update);
          clearInterval(check);
          clearTimeout(refresh);
        }
      }
    }

  }, [loaded, result, props, platformHasSpotify]);

  useEffect(() => {
    if (!result || !result?.isPlaying) return;

    setMusicProgress(UpdatePercentage(result.duration?.elapsed, result.duration?.total));
  }, [result]);

  useEffect(() => {
    if (result?.albumCover !== albumArtImage)
      setAlbumArtImage(result?.albumCover);

  }, [result, albumArtImage]);

  useLayoutEffect(() => {
    if (!platformHasSpotify) return;

    async function GetResult() {
      var data;

      if(props.platform === 'spotify')
        data = await SpotifyData();
      else if (props.platform === 'spotify-custom')
        data = await SpotifyCustomData();

      setResult(()=>{
        if(props.platform === 'spotify')
          UpdatePlayerDataFromSpotify(data)
        else if (props.platform === 'spotify-custom')
          UpdatePlayerDataFromSpotifyCustom(data)
      })
    }

    if (!loaded) return () => GetResult();
  }, [loaded, result, props, platformHasSpotify]);

  useLayoutEffect(() => {
    if (!loaded) return;

    if (!result?.isPlaying) {
      const waiting = setTimeout(() => {
        removePlayerClass(styles.show, playerClasses);
      }, (props?.sleepAfter * 1000));

      return () => clearTimeout(waiting);
    } else
      addPlayerClass(styles.show, playerClasses);

  }, [loaded, result, props, playerClasses]);

  useLayoutEffect(() => {
    if (!result?.isPlaying)
      addPlayerClass(styles.paused, playerClasses);
    else if (result?.isPlaying)
      removePlayerClass(styles.paused, playerClasses);

  }, [result, playerClasses]);

  useLayoutEffect(() => {
    const musicNameScroll = window.setInterval(() => setMusicNameScrolled(!musicNameScrolled), 6000);

    return () => window.clearInterval(musicNameScroll);
  }, [musicNameScrolled]);

  useLayoutEffect(() => {
    const artistNameScroll = window.setInterval(() => setArtistNameScrolled(!artistNameScrolled), 8000);

    return () => window.clearInterval(artistNameScroll);
  }, [artistNameScrolled]);

  useLayoutEffect(() => setLoaded(result !== null), [result]);

  if (!loaded) {
    console.warn('Loading...');
    return (<></>);
  }

  if (result.error)
    console.error(result.toString());

  if (props?.noShadow) addPlayerClass(styles.no_shadow, playerClasses);
  if (props?.squareLayout) addPlayerClass(styles.square, playerClasses);

  if (props.compact) {
    addPlayerClass(styles.music_player_compact, playerClasses);

    return (
      <main className={playerClasses.join(' ')}>
        {(!props.solidColor) ? (
          <div className={styles.music_album_blur_container}>
            <div className={styles.music_album_art} style={{ 'backgroundImage': `url(${albumArtImage})` }}></div>
          </div>
        ) : (<></>)}
        {(!props.hideProgress) ? (
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
          <figure>
            <img id={styles.music_album_art} src={albumArtImage} alt={result?.title} />
          </figure>
        </div>
      ) : (<></>)}
      <aside className={styles.music_infos}>
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
          }}>{musicData.title}</span>
        </div>
        <div className={styles.music_info_mask}>
          <span ref={artistNameComponent} id={styles.music_artist} style={{
            'transform': (!artistNameScrolled)
              ? `translateX(-${(artistNameComponent.current?.scrollWidth - artistNameComponent.current?.offsetWidth)}px)`
              : `translateX(0)`
          }}>{musicData.artist}</span>
        </div>
        {(props.hideProgress && props?.showWaves > 0) ? (<DrawWaveForms number={props?.showWaves} />) : (<></>)}
        {(!props.hideProgress) ? (
          <footer className={styles.music_progress}>
            <div className={styles.music_progress_values}>
              <span id={styles.music_time_elapsed}>{ConvertTime(result.duration?.elapsed)}</span>
              {(props?.showWaves > 0) ? (<DrawWaveForms number={props?.showWaves} />) : (<></>)}
              <span id={styles.music_time_total}>{props?.remainingTime ? ConvertTime(result.duration?.remaining) : ConvertTime(result.duration?.total)}</span>
            </div>
            {(!props.hideProgressBar) ? (
              <div className={styles.music_progress_bar}>
                <div style={{ 'width': `${musicProgress}%` }} />
              </div>
            ) : (<></>)}
          </footer>
        ) : (<></>)}
      </aside>
    </main>
  )
}
