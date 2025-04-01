import { Player } from '../components/Player';
import '../scss/player.scss';

export default function Plugin() {
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
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