import { io } from 'socket.io-client';
import { IsEmpty } from '../Utils.js';

const baseURL = 'http://localhost:10767';

function GetAlbumCover(url = '', size = 600) {
    if (IsEmpty(url))
        return '';

    let cover = url.replace('{w}', size || 600);
    cover = cover.replace('{h}', size || 600);

    return cover
}

export function UpdateMusicTime(data, result) {
    if (!IsEmpty(data)) {
        result.isPlaying = data?.isPlaying || result?.isPlaying || false;
        result.duration = {
            elapsed: data?.currentPlaybackTime || result?.duration?.elapsed || 0,
            remaining: data?.currentPlaybackTimeRemaining || result?.duration?.remaining || 0,
            total: data?.currentPlaybackDuration || result?.duration?.total || 0
        };
    }

    return result;
}

export function UpdateMusicData(data, result) {
    if (!IsEmpty(data)) {
        result.title = data?.name || result?.title;
        result.artist = data?.artistName || result?.artist;
        result.albumCover = GetAlbumCover(data?.artwork?.url || result.albumCover, data?.artwork?.width || 600);
    }

    return result;
}

export function UpdatePlaybackState(data, result) {
    if (IsEmpty(data)) return result;

    switch (data?.state) {
        case 'paused':
        case 'stopped':
            result.isPlaying = false;
            return result;
        case 'playing':
            result.isPlaying = true;
            return UpdateMusicData(data?.attributes, result);
        default:
            return result;
    }  
}

export function GetData(debug = false) {
    try {
        const socket = io(`${baseURL}`, {
            transports: ['websocket'],
            autoConnect: false
        });

        socket?.on('connect', () => console.log('Connected to Cider'));
        socket?.on('disconnect', () => console.warn('Disconnected to Cider... Reconnecting...'));
        socket?.on('connect_error', err => console.error('Connection error:', err.message));
        socket?.on('reconnect_failed', () => console.error('Reconnect failed!'));
        socket?.on('reconnect_attempt', attempt => console.log(`Reconnect attempt #${attempt}`));

        if (debug)
            socket?.onAny((event, ...args) => console.debug(`${event}`, args));

        return socket
    } catch (e) {
        console.error(e.message);

        return { error: JSON.stringify(e.message) }
    }
}
