import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import {
  GetData as YouTubeMusicData,
  UpdatePlayerData as UpdatePlayerDataFromYTM
} from '../platforms/YouTubeMusic';
import {
  GetData as AppleMusicData,
  UpdatePlayerData as UpdatePlayerDataFromApple
} from '../platforms/AppleMusic';
import {
  GetData as SpotiyData,
  UpdatePlayerData as UpdatePlayerDataFromSpotify
} from '../platforms/Spotify';
import { ConvertTime } from '../Utils';

function WaveForms({ number = 8 }) {
  let waves = [];

  for (let i = 0; i < number; i++)
    waves.push(i);

  return (
    <div className='music-waveforms'>
      {waves.map(index => (
        <div key={index} className='waveform' />
      ))}
    </div>
  )
}

function UpdatePercentage(elapsed, total) {
  return (elapsed * 100) / total;
}

export function Player(props) {
  const [result, setResult] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [sleeping, setSleeping] = useState(false);
  const [musicProgress, setMusicProgress] = useState(0);

  const webSocket = useRef(null);
  const musicName = useRef(null);
  const artistName = useRef(null);

  const [musicNameScrolled, setMusicNameScrolled] = useState(false);
  const [artistNameScrolled, setArtistNameScrolled] = useState(false);

  const playerClasses = [];

  useEffect(() => {
    if(props.platform === 'spotify') return;

    if (!webSocket.current || !webSocket.current?.connected)
      webSocket.current = props.platform === 'youtube' ? YouTubeMusicData() : AppleMusicData();

    const webSocketCurrent = webSocket.current;

    return () => {
      if (webSocketCurrent && webSocketCurrent.connected)
        webSocketCurrent.close();
    }
  });

  useEffect(() => {
    if (!webSocket.current) return;

    if(props.platform === 'youtube') {
      webSocket.current.on('state-update', state=> {
        setResult(UpdatePlayerDataFromYTM(state));
      });
    }

    if(props.platform === 'apple') {
      webSocket.current.on('API:Playback', ({ data, type })=> {
        if(type === 'playbackStatus.playbackStateDidChange')
          setResult(UpdatePlayerDataFromApple(data));
      });
    }
  });

  useEffect(()=>{
    if(!result && props.platform === 'spotify') {
      async function getDataFromSpotify() {
        const data = await SpotiyData();

        setResult(UpdatePlayerDataFromSpotify(data))
      }

      getDataFromSpotify()
    }
  });

  useEffect(() => {
    if (props.platform !== 'spotify') return;

    async function Update() {
      const data = await SpotiyData();

      setResult(UpdatePlayerDataFromSpotify(data))
    }

    if(result?.isPlaying) {
      const check = setInterval(async () => await Update(), 10000);
      const refresh = setTimeout(async () => await Update(), (result.duration?.remaining || 0));

      const update = setInterval(()=>{
        result.duration.elapsed++;
        result.duration.remaining--;
      }, 1000);
  
      return () => {
        clearInterval(update);
        clearInterval(check);
        clearTimeout(refresh);
      }
    }
  });

  useEffect(() => {
    if(!result) return;

    setMusicProgress(UpdatePercentage(result.duration?.elapsed, result.duration?.total));
  }, [result]);

  useLayoutEffect(() => {
    if (!result?.isPlaying && !sleeping) {
      const playerSleep = window.setInterval(() => setSleeping(true), ((props?.sleepAfter || 0) * 1000));

      return () => window.clearInterval(playerSleep);
    } else if (result?.isPlaying && sleeping)
      setSleeping(false);

  }, [result, props, sleeping]);

  useLayoutEffect(() => {
    const musicNameScroll = window.setInterval(() => setMusicNameScrolled(!musicNameScrolled), 6000);

    return () => window.clearInterval(musicNameScroll);
  }, [musicNameScrolled]);

  useLayoutEffect(() => {
    const artistNameScroll = window.setInterval(() => setArtistNameScrolled(!artistNameScrolled), 8000);

    return () => window.clearInterval(artistNameScroll);
  }, [artistNameScrolled]);

  useLayoutEffect(() => {
    if (result !== null)
      setLoaded(true);
    else {
      const waiting = setTimeout(() => {
        setResult({ error: 'Too loading, please, try again later...' });

        setLoaded(true)
      }, 15000)

      return () => clearTimeout(waiting);
    }

  }, [result]);

  if (!loaded)
    return (<span className='loading'>Loading</span>);

  if (result.error)
    return (<>{result.error}</>);

  if (!sleeping || !result?.isPlaying) playerClasses.push('show');
  if (props?.noShadow) playerClasses.push('no-shadow');
  if (props?.squareLayout) playerClasses.push('square');

  if (props.compact) {
    playerClasses.push('music-player-compact');

    return (
      <main className={playerClasses.join(' ')}>
        {(!props?.solidColor) ? (
          <div className='music-album-blur-container'>
            <div className='music-album-art' style={{ 'backgroundImage': `url(${result?.albumCover})` }}></div>
          </div>
        ) : (<></>)}
        {(!props?.hideProgress) ? (
          <div className={props?.progressBarWithColor ? `music-progress-bar ${props?.platform}` : 'music-progress-bar'}>
            <div id='music-progress-bar' style={{ 'width': `${musicProgress}%` }} />
          </div>
        ) : (<></>)}
        <div className={props?.textCentered ? 'music-infos centered' : 'music-infos'}>
          <div className='music-info-mask'>
            <span ref={musicName} id='music-title' style={{
              'transform': (!musicNameScrolled)
                ? `translateX(-${(musicName.current?.scrollWidth - musicName.current?.offsetWidth)}px)`
                : `translateX(0)`
            }}>{result?.title}</span>
          </div>
          <div className='music-info-mask'>
            <span ref={artistName} id='music-artist' style={{
              'transform': (!artistNameScrolled)
                ? `translateX(-${(artistName.current?.scrollWidth - artistName.current?.offsetWidth)}px)`
                : `translateX(0)`
            }}>{result?.artist}</span>
          </div>
        </div>
      </main>
    )
  }

  playerClasses.push('music-player');

  if (!result?.isPlaying) playerClasses.push('paused');
  if (props?.dinamicWaves) playerClasses.push('dinamic');

  return (
    <main className={playerClasses.join(' ')}>
      {(props.showAlbum) ? (
        <div className='music-album-art'>
          <figure>
            <img id='music-album-art' src={result?.albumCover} alt={result?.title} />
          </figure>
        </div>
      ) : (<></>)}
      <aside className='music-infos'>
        {(!props?.solidColor) ? (
          <div className='music-album-blur-container'>
            <div className='music-album-art' style={{ 'backgroundImage': `url(${result?.albumCover})` }}></div>
          </div>
        ) : (<></>)}
        <div className='music-info-mask'>
          <span ref={musicName} id='music-title' style={{
            'transform': (!musicNameScrolled)
              ? `translateX(-${(musicName.current?.scrollWidth - musicName.current?.offsetWidth)}px)`
              : `translateX(0)`
          }}>{result?.title}</span>
        </div>
        <div className='music-info-mask'>
          <span ref={artistName} id='music-artist' style={{
            'transform': (!artistNameScrolled)
              ? `translateX(-${(artistName.current?.scrollWidth - artistName.current?.offsetWidth)}px)`
              : `translateX(0)`
          }}>{result?.artist}</span>
        </div>
        {(props?.hideProgress && props?.showWaves > 0) ? (<WaveForms number={props?.showWaves} />) : (<></>)}
        {(!props?.hideProgress) ? (
          <footer className='music-progress'>
            <div className='music-progress-values'>
              <span id='music-time-elapsed'>{ConvertTime(result.duration?.elapsed)}</span>
              {(props?.showWaves > 0) ? (<WaveForms number={props?.showWaves} />) : (<></>)}
              <span id='music-time-total'>{props?.remainingTime ? ConvertTime(result.duration?.remaining) : ConvertTime(result.duration?.total)}</span>
            </div>
            {(!props?.hideProgressBar) ? (
              <div className='music-progress-bar'>
                <div id='music-progress-bar' style={{ 'width': `${musicProgress}%` }} />
              </div>
            ) : (<></>)}
          </footer>
        ) : (<></>)}
      </aside>
    </main>
  )
}
