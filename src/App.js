import { useSearchParams } from 'react-router-dom';
import { GetAccessToken } from './platforms/Spotify';
import { Player } from './components/Player';
import './player.css';

export default function App() {
    const [params] = useSearchParams();

    if(params.has('code')) {
        async function GetSpotifyAccess() {
            const SpotifyAccess = await GetAccessToken(params.get('code'));

            const redirectParams = [];
            redirectParams.push(`platform=spotify`);
            redirectParams.push(`refreshToken=${SpotifyAccess.refresh || ''}`);
            redirectParams.push(`accessToken=${SpotifyAccess.access || ''}`);

            setInterval(()=> window.location.href = `${window.location.protocol}//${window.location.host}/?${redirectParams.join('&')}`, 1000);
        }

        GetSpotifyAccess();

        return (<>Connecting...</>)
    }

    const options = new URLSearchParams(atob(params.get('options')));

    return (
        <div className='music-player-container'>
            <Player 
                platform={params.get('platform') || 'youtube'}
                compact={options.has('compact')}
                noPulse={options.has('noPulse')}
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