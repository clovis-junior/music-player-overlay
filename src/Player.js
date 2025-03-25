import { useState, useEffect, useRef } from 'react';
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
  
    useEffect(()=> setLoaded(!result?.error || false), [result, loaded]);
  
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
    
    useEffect(()=> {
        const musicNameScroll = setInterval(()=> {
            musicName.current.style.transform = (!musicNameScrolled) 
            ? `translateX(-${(musicName.current?.scrollWidth - musicName.current?.offsetWidth)}px)`
            : `translateX(0)`;
  
            setMusicNameScrolled(!musicNameScrolled);
        }, 5000);
  
        const artistNameScroll = setInterval(()=> {
            artistName.current.style.transform = (!artistNameScrolled) 
            ? `translateX(-${(artistName.current?.scrollWidth - artistName.current?.offsetWidth)}px)`
            : `translateX(0)`;
  
            setArtistNameScrolled(!artistNameScrolled);
        }, 5000);
  
        return ()=> {
            clearInterval(musicNameScroll);
            clearInterval(artistNameScroll)
        }
    }, [musicNameScrolled, artistNameScrolled]);
  
    useEffect(()=> {
      if(!result?.isPlaying) {
        const playerSleep = setInterval(()=> setSleeping(true), (props.sleepAfter * 1000) || 0);
  
        return ()=> clearInterval(playerSleep)
      } else if(result?.isPlaying && sleeping)
        setSleeping(false);
  
    }, [result.isPlaying, props.sleepAfter, sleeping, setSleeping]);
  
    playerClasses.push('music-player');
  
    if((!sleeping || !result?.isPlaying) && loaded) playerClasses.push('show');
    if(!result?.isPlaying) playerClasses.push('paused');
    if(props.wavesDinamic) playerClasses.push('dinamic');
    if(props.noShadow) playerClasses.push('no-shadow');
    if(props.squareLayout) playerClasses.push('square');
  
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
            {(!props.solidColor) ? (
                <div className='music-cover-blur' style={{'backgroundImage': `url(${result?.albumCover})`}}></div>
            ) : (<></>)}
            <div className='music-info-mask'>
                <span ref={musicName} id='music-title'>{result?.title}</span>
            </div>
            <div className='music-info-mask'>
                <span ref={artistName} id='music-artist'>{result?.artist}</span>
            </div>
            {(props.showWaves > 0) ? (<WaveForms number={props.showWaves} />) : (<></>)}
            {(!props.hideProgress || props.showWaves <= 0) ? (
            <footer className='music-progress'>
                <span id='music-time-elapsed'>{ConvertTime(result?.duration?.elapsed)}</span>
                <div className={props.progressBarColored ? `music-progress-bar ${props.platform}` : 'music-progress-bar'}>
                    <div id='music-progress-bar' style={{'width': `${result?.duration?.percentage}%`}} />
                </div>
                <span id='music-time-total'>{props.remainingTime ? ConvertTime(result?.duration?.remaining) : ConvertTime(result?.duration?.total)}</span>
            </footer>
            ) : (<></>)}
        </aside>
    </main>
    )
}