import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { GetData as YTMData, UpdatePlayerData as UpdatePlayerDataFromYTM } from '../platforms/YouTubeMusic';
import { GetData as AppleData, UpdatePlayerData as UpdatePlayerDataFromApple } from '../platforms/AppleMusic';
import { ConvertTime } from '../Utils';

function WaveForms({ number = 8} ) {
  let waves = [];

  for(let i=0;i<number;i++)
    waves.push(i);

  return (
    <div className='music-waveforms'>
      {waves.map(index => (
        <div key={index} className='waveform' />
      ))}
    </div>
  )
}

export function Player(props) {
    const [result, setResult] = useState(null);
    const [loaded, setLoaded] = useState(false);
    const [sleeping, setSleeping] = useState(false);
    
    const webSocket = useRef(null);
    const musicName = useRef(null);
    const artistName = useRef(null);
  
    const [musicNameScrolled, setMusicNameScrolled] = useState(false);
    const [artistNameScrolled, setArtistNameScrolled] = useState(false);

    const playerClasses = [];
  
    useEffect(()=> {
      if(props.platform !== 'youtube' || props.platform !== 'apple') return;

      if (!webSocket.current || !webSocket.current.connected)
        webSocket.current = props.platform === 'youtube' ? YTMData : AppleData;

      const webSocketCurrent = webSocket.current;

      return ()=> {
        if (webSocketCurrent && webSocketCurrent.connected)
          webSocketCurrent.close();
      }
    }, [props, setResult]);

    useEffect(()=> {
      if(!webSocket.current) return;

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
      
    }, [props.platform, result]);
  
    useLayoutEffect(()=> {
      if(!result?.isPlaying && !sleeping) {
        const playerSleep = window.setInterval(()=> setSleeping(true), ((props?.sleepAfter || 0) * 1000));
  
        return ()=> window.clearInterval(playerSleep)
      } else if(result.isPlaying && sleeping)
        setSleeping(false);
  
    }, [result, props, sleeping]);

    useLayoutEffect(()=> {
      const musicNameScroll = window.setInterval(()=> setMusicNameScrolled(!musicNameScrolled), 6000);
  
      return ()=> window.clearInterval(musicNameScroll);
    }, [musicNameScrolled]);

    useLayoutEffect(()=> {
      const artistNameScroll = window.setInterval(()=> setArtistNameScrolled(!artistNameScrolled), 8000);
  
      return ()=> window.clearInterval(artistNameScroll);
    }, [artistNameScrolled]);

		useLayoutEffect(()=> {
      setLoaded(result)
    }, [result]);

    if(!loaded)
      return (<span className='loading'>Loading</span>);

    if(result.error)
      return (<>{result.error}</>);

    if(!sleeping || !result?.isPlaying) playerClasses.push('show');
    if(props?.noShadow) playerClasses.push('no-shadow');
    if(props?.squareLayout) playerClasses.push('square');

    if(props.compact) {
      playerClasses.push('music-player-compact');

      return (
        <main className={playerClasses.join(' ')}>
          {(!props?.solidColor) ? (
            <div className='music-album-blur-container'>
              <div className='music-album-art' style={{'backgroundImage': `url(${result?.albumCover})`}}></div>
            </div>
          ) : (<></>)}
          {(!props?.hideProgress) ? (
            <div className={props?.progressBarWithColor ? `music-progress-bar ${props?.platform}` : 'music-progress-bar'}>
              <div id='music-progress-bar' style={{'width': `${result?.duration?.percentage}%`}} />
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
  
    if(!result?.isPlaying) playerClasses.push('paused');
    if(props?.dinamicWaves) playerClasses.push('dinamic');
  
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
                <div className='music-album-art' style={{'backgroundImage': `url(${result?.albumCover})`}}></div>
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
              <div className={props?.progressBarWithColor ? `music-progress-bar ${props?.platform}` : 'music-progress-bar'}>
                <div id='music-progress-bar' style={{'width': `${result.duration?.percentage}%`}} />
              </div>
              ) : (<></>)}
            </footer>
            ) : (<></>)}
          </aside>
      </main>
    )
}
