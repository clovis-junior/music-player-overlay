import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { GetDataFromSpotify } from './Spotify';
import { GetDataFromYouTubeMusic } from './YouTubeMusic';
import { ConvertTime } from './Utils';
import './player.css';

/*
cd C:\Projetos\stream-your-player | sass --watch scss/main.scss:src/player.css --style compressed -->
cd C:\Projetos\stream-your-player | npm start --port 80 -->
*/

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

    var promises;

    switch(props.platform) {
      case 'spotify':
        promises = [GetDataFromSpotify()];
      break;
      case 'youtube':
      default:
        promises = [GetDataFromYouTubeMusic()];
    }

    Promise.all(promises)
    .then(results => {
      setResult(results[0])
    })
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

  return (
    <main className={`music-player ${loaded ? 'show' : ''} ${!result?.isPlaying ? 'paused' : ''}`}>
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
        waves={parseInt(params.get('waves')) || 0}
        progress={!params.has('hideProgress')}
        remainingTime={params.has('remainingTime')}
        showAlbum={!params.has('hideAlbum')}
        solidColor={params.has('solidColor')}
      />
    </div>
  )
}

export default App;