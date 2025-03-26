import { useSearchParams } from 'react-router-dom';
import { GetAccessToken } from './platforms/Spotify';
import { Player } from './Player';
import './player.css';

export default function App() {
    const [params] = useSearchParams();

    if(params.has('code')) {
        async function GetSpotifyAccess() {
            return await GetAccessToken(params.get('code'));
        }

        const SpotifyAccess = GetSpotifyAccess();

        if(SpotifyAccess)
            setInterval(()=> window.location.href = `${window.location.protocol}//${window.location.host}/?platform=spotify`, 1000);
        
        return (
            <div className='container'>
                <h3>Connecting...</h3>
            </div>
        )
    }

    const options = new URLSearchParams(atob(params.get('options')));

    return (
        <div className='music-player-container'>
            <Player 
                platform={params.get('platform') || 'youtube'}
                compact={options.has('compact')}
                textCentered={options.has('textCentered')}
                sleepAfter={options.get('sleepAfter') || 10}
                showWaves={parseInt(options.get('showWaves')) || 0}
                dinamicWaves={options.has('dinamicWaves')}
                progressBarWithColor={options.has('progressBarWithColor')}
                hideProgress={options.has('hideProgress')}
                remainingTime={options.has('remainingTime')}
                squareLayout={options.has('squareLayout')}
                noShadow={options.has('noShadow')}
                showAlbum={!options.has('hideAlbum')}
                solidColor={options.has('solidColor')}
            />
        </div>
    )
}