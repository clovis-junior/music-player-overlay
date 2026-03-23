
import Player from '../components/Player'
import { GetURLParams } from '../functions/Utils'
import style from '../assets/scss/player.module.scss'

export default function Plugin() {
    const params = GetURLParams();
    const options = new URLSearchParams(atob(params?.get('options')));

    return (
        <div className={style?.music_player_page}>
            <Player
                sleepAfter={Number(options?.get('sleepAfter')) || 10}
                showWaves={Number(options?.get('showWaves')) || 0}
                compact={options?.has('compact')}
                showPlatform={options?.has('showPlatform')}
                showAlbumArt={!options?.has('hideAlbum')}
                remainingTime={options?.has('remainingTime')}
                hideProgress={options?.has('hideProgress')}
                hideProgressBar={options?.has('hideProgressBar')}
                textCentered={options?.has('textCentered')}
                noShadow={options?.has('noShadow')}
                squareLayout={options?.has('squareLayout')}
                solidColor={options?.has('solidColor')}
                lightTheme={options?.has('light')}
                albumArtTheme={options?.has('vibrant')}
            />
        </div>
    )
}