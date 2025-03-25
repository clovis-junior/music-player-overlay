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

    return (
        <div className='container'>
            <Player 
                platform={params.get('platform') || 'youtube'}
                sleepAfter={params.get('sleepAfter') || 10}
                showWaves={parseInt(params.get('showWaves')) || 0}
                dinamicWaves={params.has('dinamicWaves')}
                progressBarWithColor={params.has('progressBarWithColor')}
                hideProgress={params.has('hideProgress')}
                remainingTime={params.has('remainingTime')}
                squareLayout={params.has('squareLayout')}
                noShadow={params.has('noShadow')}
                showAlbum={!params.has('hideAlbum')}
                solidColor={params.has('solidColor')}
            />
        </div>
    )
}