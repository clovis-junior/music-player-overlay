// import songData from'../Apple.test.json';
import { io } from 'socket.io-client';
import { URLValidade } from '../Utils';

const baseURL = 'http://localhost:10767';

function GetAlbumCover(url, size) {
    if (URLValidade(url))
        return '';

    const cover = url.replace('{w}', size)
        .replace('{h}', size);

    return cover
}

export function UpdatePlayerData(data) {
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

    return { isPlaying, title, artist, duration, albumCover }
}

export function GetData() {
    const socket = io(`${baseURL}`, {
        'transports': ['websocket']
    });

    socket.on('connect', () => console.debug('Connected to Cider'));
    socket.on('disconnect', () => {
        console.debug('Disconnected to Cider... Reconnecting...');
        setTimeout(() => GetData(), 5000)
    });

    return socket
}