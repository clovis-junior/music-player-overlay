import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { GetDataFromSpotify } from './platforms/Spotify';
import { GetDataFromAppleMusic } from './platforms/AppleMusic';
import { GetDataFromYouTubeMusic } from './platforms/YouTubeMusic';
import { ConvertTime } from './Utils';
import './player.css';

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

function Player(props) {
  const [result, setResult] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [sleeping, setSleeping] = useState(false);
  
  const musicName = useRef(null);
  const artistName = useRef(null);

  const [musicNameScrolled, setMusicNameScrolled] = useState(false);
  const [artistNameScrolled, setArtistNameScrolled] = useState(false);

  useEffect(()=> {
    setLoaded(!result?.error || false);

  }, [result, loaded]);

  useEffect(()=> {
    if(!loaded) 
      return;

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
    };
  }, [musicNameScrolled, artistNameScrolled]);

  useEffect(()=> {
    if(!result?.isPlaying) {
      const playerSleep = setInterval(()=> setSleeping(true), (props.sleepAfter * 1000) || 0);

      return ()=> clearInterval(playerSleep)
    } else if(result?.isPlaying && sleeping)
      setSleeping(false);

  }, [result.isPlaying, props.sleepAfter, sleeping, setSleeping]);

  const playerClasses = [];

  playerClasses.push('music-player');

  if(loaded && !sleeping )
    playerClasses.push('show');

  if(!result?.isPlaying)
    playerClasses.push('paused');

  if(props.wavesDinamic)
    playerClasses.push('dinamic');

  if(props.noShadow)
    playerClasses.push('no-shadow');

  if(props.squareLayout)
    playerClasses.push('square');

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
        {(!props.solidColor) ? (<div className='music-cover-blur' style={{'backgroundImage': `url(${result?.albumCover})`}}></div>) : (<></>)}
        <div className='music-info-mask'>
          <span ref={musicName} id='music-title'>{result?.title}</span>
        </div>
        <div className='music-info-mask'>
          <span ref={artistName} id='music-artist'>{result?.artist}</span>
        </div>
        {(props.waves > 0) ? (<WaveForms number={props.waves} />) : (<></>)}
        {(props.progress) ? (
            <footer className='music-progress'>
              <span id='music-time-elapsed'>{ConvertTime(result?.duration?.elapsed)}</span>
              <div className='music-progress-bar'>
                <div id='music-progress-bar' style={{'width': `${result?.duration?.percentage}%`}} />
              </div>
              <span id='music-time-total'>{props.remainingTime ? ConvertTime(result?.duration?.remaining) : ConvertTime(result?.duration?.total)}</span>
            </footer>
          ) : (<></>)}
      </aside>
    </main>
  )
}

function App() {
  const [params] = useSearchParams();

  if(params.has('code') && (!params.has('platform') || params.get('platform') !== 'spotify'))
    return window.location.href = `${window.location.protocol}//${window.location.host}?platform=spotify&code=${params.get('code')}`;

  return (
    <div className='container'>
      <Player 
        platform={params.get('platform') || 'youtube'}
        sleepAfter={params.get('sleepAfter') || 10}
        waves={parseInt(params.get('waves')) || 0}
        wavesDinamic={params.has('wavesDinamic')}
        progress={!params.has('hideProgress')}
        remainingTime={params.has('remainingTime')}
        squareLayout={params.has('squareLayout')}
        noShadow={params.has('noShadow')}
        showAlbum={!params.has('hideAlbum')}
        solidColor={params.has('solidColor')}
      />
    </div>
  )
}

export default App;