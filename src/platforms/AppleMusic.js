// import songData from'../Apple.test.json';
import { URLValidade } from '../Utils';
const url = 'http://localhost:10767';

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
            method: 'GET',
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
            elapsed: (data.info?.currentPlaybackTime) || 0,
            percentage: (data.info?.currentPlaybackProgress * 100),
            remaining: ((data.info?.durationInMillis * 100) - data.info?.currentPlaybackTime),
            total: (data.info?.durationInMillis / 1000) || 0
        };

        return {isPlaying, title, artist, duration, albumCover}
    } catch(error) {
        return { error: error.message.toString() }
    }
}
