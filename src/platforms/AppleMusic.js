import { GetURLParams } from '../Utils.js';
import { io } from 'socket.io-client';
import { IsEmpty } from '../Utils.js';

const params = GetURLParams();

const host = params?.get('host') || 'localhost';
const port = params?.get('port') || 10767;

const baseURL = `http://${host}:${port}`;

function GetAlbumCover(url = '', size = 600) {
    if (IsEmpty(url))
        return '';

    let cover = url.replace('{w}', size || 600);
    cover = cover.replace('{h}', size || 600);

    return cover
}

export function UpdateMusicTime(data) {
    if (!IsEmpty(data)) {
        const isPlaying = data?.isPlaying || false;
        const duration = {
            elapsed: data?.currentPlaybackTime || 0,
            remaining: data?.currentPlaybackTimeRemaining || 0,
            total: data?.currentPlaybackDuration || 0
        };

        return { isPlaying, duration };
    }

    return {};
}

export function UpdateMusicData(data) {
    if (!IsEmpty(data)) {
        const title = data?.name || '';
        const artist = data?.artistName || '';
        const albumCover = GetAlbumCover(data?.artwork?.url, data?.artwork?.width || 600);

        return { title, artist, albumCover }
    }

    return {};
}

export function UpdatePlaybackState(data) {
    let isPlaying;

    switch (data?.state) {
        case 'paused':
        case 'stopped':
        default:
            isPlaying = false;
            break;
        case 'playing':
            isPlaying = true;
            break;
    }

    return data?.attributes ? { isPlaying, ...UpdateMusicData(data?.attributes) } : { isPlaying }
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
