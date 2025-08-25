// import songData from'../Apple.test.json';
import { io } from 'socket.io-client';
import { IsEmpty } from '../Utils.js';

const baseURL = 'http://127.0.0.1:10767';

function GetAlbumCover(url = '', size = 600) {
    if (IsEmpty(url))
        return '';

    let cover = url.replace('{w}', size);
    cover = cover.replace('{h}', size);

    return cover
}

export function UpdatePlayerTimeData(data = {}, result) {
    result = result || {};

    if (!IsEmpty(data)) {
        result.isPlaying = data?.isPlaying || false;
        result.duration = {
            elapsed: data?.currentPlaybackTime || 0,
            remaining: data?.currentPlaybackTimeRemaining || 0,
            total: data?.currentPlaybackDuration || 0
        };
    }

    return result;
}

export function UpdatePlayerMusicData(data = {}, result) {
    result = result || {};

    if (!IsEmpty(data)) {
        result.title = data?.name || result?.title;
        result.artist = data?.artistName || result?.artist;
        result.albumCover = GetAlbumCover(data?.artwork?.url ||  result.albumCover, (data?.artwork?.width || 300));
    }

    return result;
}

export function UpdatePlayerStateData(data = {}, result) {
    result = result || {};

    if (data?.state === 'playing') {
        result.isPlaying = true;
        return UpdatePlayerMusicData(data?.attributes, result);
    } else if (data?.state === 'paused' || data?.state === 'stopped')
        result.isPlaying = false;

    return result;
}

export function GetData() {
    try {
        const socket = io(`${baseURL}`, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 5000
        });

        socket?.on('connect', () => console.log('Connected to Cider'));
        socket?.on('disconnect', () => console.log('Disconnected to Cider... Reconnecting...'));
        socket?.on('connect_error', err => console.error('Connection error:', err.message));
        // socket?.onAny((event, ...args) => {
        //     console.debug(`${event}`, args);
        // });

        return socket
    } catch (e) {
        console.error(e.message);

        return { error: JSON.stringify(e.message) }
    }
}
