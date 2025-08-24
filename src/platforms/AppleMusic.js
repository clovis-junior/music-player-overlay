// import songData from'../Apple.test.json';
import { io } from 'socket.io-client';
import { IsEmpty } from '../Utils.js';

const baseURL = 'http://127.0.0.1:10767';

function GetAlbumCover(url, size) {
    if (IsEmpty(url))
        return '';

    let cover = url.replace('{w}', size);
    cover = cover.replace('{h}', size);

    return cover
}

export function UpdatePlayerTimeData(data, result) {
    result = result || SetPlayerData();

    result.isPlaying = data?.isPlaying || result?.isPlaying || false;
    result.duration = {
        elapsed: data?.currentPlaybackTime || 0,
        remaining: data?.currentPlaybackTimeRemaining || 0,
        total: data?.currentPlaybackDuration || 0
    };

    return result;
}

export function UpdatePlayerMusicData(data, result) {
    result = result || SetPlayerData();

    if (!IsEmpty(data)) {
        result.title = data?.name || '';
        result.artist = data?.artistName || '';
        result.albumCover = GetAlbumCover(data?.artwork?.url, (data?.artwork?.width || 300));
    }

    return result;
}

export function SetPlayerData() {
    return {
        isPlaying: false,
        title: '',
        artist: '',
        duration: { elapsed: 0, remaining: 0, total: 0 },
        albumCover: ''
    }
}

export function GetData() {
    try {
        const socket = io(`${baseURL}`, {
            'transports': ['websocket']
        });

        socket.on('connect', () => console.log('Connected to Cider'));
        socket.on('disconnect', () => {
            console.log('Disconnected to Cider... Reconnecting...');
        });
        // socket.onAny((event, ...args) => {
        //     console.debug(`${event}`, args);
        // });

        return socket
    } catch (e) {
        console.error(e.message.toString());

        setTimeout(() => GetData(), 3000);

        return { error: e.message.toString() }
    }
}