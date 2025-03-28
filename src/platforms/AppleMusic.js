// import songData from'../Apple.test.json';
import { URLValidade } from '../Utils';
const url = '//127.0.0.1:10767';

function GetAlbumCover(url, size) {
    if(URLValidade(url))
        return '';

    const cover = url.replace('{w}', size)
    .replace('{h}', size);

    return cover
}

export async function GetDataFromAppleMusic() {
    try {
        const response = await fetch(`${url}/currentPlayingSong`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if(response.status !== 200)
            return { error: 'Access denied or invalid' };

        const data = await response.json() /*songData*/;

        const isPlaying = !data.info?.isPlaying;
        const title = data.info?.name;
        const artist = data.info?.artistName;
        const albumCover = GetAlbumCover(data.info?.artwork.url, (data.info?.artwork.width || 300));
        const duration = {
            elapsed: parseInt(data.info?.currentPlaybackTime) || 0,
            percentage: (data.info?.currentPlaybackProgress * 100),
            remaining: parseInt((data.info?.durationInMillis * 100) - data.info?.currentPlaybackTime),
            total: parseInt(data.info?.durationInMillis / 1000) || 0
        };

        return {isPlaying, title, artist, duration, albumCover}
    } catch(error) {
        return { error: error.message.toString() }
    }
}
