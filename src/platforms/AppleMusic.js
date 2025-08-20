// import songData from'../Apple.test.json';
import { io } from 'socket.io-client';
import { URLValidade } from '../Utils.js';

const baseURL = 'http://127.0.0.1:10767';

function GetAlbumCover(url, size) {
    if (URLValidade(url))
        return '';

    const cover = url.replace('{w}', size)
        .replace('{h}', size);

    return cover
}

export function UpdatePlayerData(data) {
    if(data.error) return data;
    
    const isPlaying = !data.info?.isPlaying;
    const title = data.info?.name;
    const artist = data.info?.artistName;
    const albumCover = GetAlbumCover(data.info?.artwork.url, (data.info?.artwork.width || 300));
    const duration = {
        elapsed: (data.info?.currentPlaybackTime) || 0,
        remaining: ((data.info?.durationInMillis * 100) - data.info?.currentPlaybackTime),
        total: (data.info?.durationInMillis / 1000) || 0
    };

    return { isPlaying, title, artist, duration, albumCover }
}

export function GetData() {
    try {
        const socket = io(`${baseURL}`, {
            'transports': ['websocket']
        });
    
        socket.on('connect', () => console.log('Connected to Cider'));
        socket.on('disconnect', () => {
            console.log('Disconnected to Cider... Reconnecting...');
            setTimeout(() => GetData(), 5000)
        });
    
        return socket
    } catch(e) {
        console.error(e.message.toString());

        setTimeout(()=> GetData(), 3000);

        return { error: e.message.toString() }
    }
}