import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { GetDataFromSpotify } from './platforms/Spotify';
import { GetDataFromAppleMusic } from './platforms/AppleMusic';
import { GetDataFromYouTubeMusic } from './platforms/YouTubeMusic';
import { ConvertTime } from './Utils';

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
    const [result, setResult] = useState({});
    const [loaded, setLoaded] = useState(false);
    const [sleeping, setSleeping] = useState(false);
    
    const musicName = useRef(null);
    const artistName = useRef(null);
  
    const [musicNameScrolled, setMusicNameScrolled] = useState(false);
    const [artistNameScrolled, setArtistNameScrolled] = useState(false);

    const playerClasses = [];
  
    useEffect(()=> {
      if(!loaded) return;
  
      async function getResult() {
        switch(props.platform) {
          case 'spotify':
            setResult(await GetDataFromSpotify());
            break;
          case 'applemusic':
          case 'apple':
            setResult(await GetDataFromAppleMusic());
            break;
          case 'youtubemusic':
          case 'youtube':
          default:
            setResult(await GetDataFromYouTubeMusic());
        }
      }
  
      getResult()
    });
    
    useLayoutEffect(()=> {
        const musicNameScroll = setInterval(()=> setMusicNameScrolled(!musicNameScrolled), 7000);
        const artistNameScroll = setInterval(()=> setArtistNameScrolled(!artistNameScrolled), 14000);
  
        return ()=> {
          clearInterval(musicNameScroll);
          clearInterval(artistNameScroll)
        }
    }, [musicNameScrolled, artistNameScrolled]);
  
    useLayoutEffect(()=> {
      if(!result?.isPlaying) {
        const playerSleep = setInterval(()=> setSleeping(true), (props.sleepAfter * 1000) || 0);
  
        return ()=> clearInterval(playerSleep)
      } else if(result?.isPlaying && sleeping)
        setSleeping(false);
  
    }, [result?.isPlaying, props?.sleepAfter, sleeping, setSleeping]);

    useLayoutEffect(()=> setLoaded(!result?.error), [result, loaded]);
  
    if(result?.error)
      return (<>{result?.error}</>);

    if(!loaded)
      return (<>{'Loading...'}</>);

    playerClasses.push('music-player');
  
    if(!sleeping || !result?.isPlaying) playerClasses.push('show');
    if(!result?.isPlaying) playerClasses.push('paused');
    if(props?.wavesDinamic) playerClasses.push('dinamic');
    if(props?.noShadow) playerClasses.push('no-shadow');
    if(props?.squareLayout) playerClasses.push('square');
  
    return (
      <main className={playerClasses.join(' ')}>
        {(props.showAlbum) ? (
          <div className='music-cover'>
            <figure>
              <img id='music-cover' src={result?.albumCover} alt={result?.title} />
            </figure>
          </div>
          ) : (<></>)}
          <aside className='music-infos'>
            {(!props?.solidColor) ? (
              <div className='music-cover-blur' style={{'backgroundImage': `url(${result?.albumCover})`}}></div>
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
                <span id='music-time-elapsed'>{ConvertTime(result?.duration?.elapsed)}</span>
                {(props?.showWaves > 0) ? (<WaveForms number={props?.showWaves} />) : (<></>)}
                <span id='music-time-total'>{props?.remainingTime ? ConvertTime(result?.duration?.remaining) : ConvertTime(result?.duration?.total)}</span>
              </div>
              <div className={props?.progressBarColored ? `music-progress-bar ${props?.platform}` : 'music-progress-bar'}>
                <div id='music-progress-bar' style={{'width': `${result?.duration?.percentage}%`}} />
              </div>
            </footer>
            ) : (<></>)}
          </aside>
      </main>
    )
}