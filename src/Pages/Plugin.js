// import { GetAccessToken } from '../platforms/Spotify';
import { Player } from '../components/Player';
import '../scss/player.scss';

export default function Plugin() {
    const params = new URLSearchParams(window.location.hash.split('?')[1]);

    // if(params.has('code')) {
    //     async function GetSpotifyAccess() {
    //         const SpotifyAccess = await GetAccessToken(params.get('code'));

    //         const redirectParams = [];
    //         redirectParams.push(`platform=spotify`);
    //         redirectParams.push(`refreshToken=${SpotifyAccess.refresh || ''}`);
    //         redirectParams.push(`accessToken=${SpotifyAccess.access || ''}`);

    //         setInterval(()=> window.location.href = `${window.location.protocol}//${window.location.host}/?${redirectParams.join('&')}`, 1000);
    //     }

    //     GetSpotifyAccess();

    //     return (<span className='loading'>Connecting</span>)
    // }

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
                progressBarWithColor={options.has('progressBarWithColor')}
                hideProgress={options.has('hideProgress')}
                hideProgressBar={options.has('hideProgressBar')}
                remainingTime={options.has('remainingTime')}
                squareLayout={options.has('squareLayout')}
                noShadow={options.has('noShadow')}
                showAlbum={!options.has('hideAlbum')}
                solidColor={options.has('solidColor')}
            />
        </div>
    )
}