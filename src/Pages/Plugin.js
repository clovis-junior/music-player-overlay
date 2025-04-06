import { Player } from '../components/Player';
import styles from '../scss/player.module.scss';

export default function Plugin() {
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const options = new URLSearchParams(atob(params.get('options')));

    return (
        <div className={styles.container}>
            <Player
                platform={params.get('platform') || 'youtube'}
                sleepAfter={options.get('sleepAfter') || 10}
                compact={options.has('compact')}
                squareLayout={options.has('squareLayout')}
                noShadow={options.has('noShadow')}
                showAlbum={!options.has('hideAlbum')}
                solidColor={options.has('solidColor')}
                textCentered={options.has('textCentered')}
                showWaves={parseInt(options.get('showWaves')) || 0}
                hideProgress={options.has('hideProgress')}
                hideProgressBar={options.has('hideProgressBar')}
                remainingTime={options.has('remainingTime')}
            />
        </div>
    )
}