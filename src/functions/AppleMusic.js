import { GetURLParams, IsEmpty } from './Utils';
import { io } from 'socket.io-client';

import icon from '../assets/images/apple-music-icon.svg';

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

function UpdateMusicTime(data) {
    if (!IsEmpty(data)) {
        const duration = {
            elapsed: Number(data?.currentPlaybackTime) || 0,
            remaining: Number(data?.currentPlaybackTimeRemaining) || 0,
            total: Number(data?.currentPlaybackDuration) || 0
        };

        return { duration }
    }

    return {};
}

function UpdateMusicData(data) {
    if (!IsEmpty(data)) {
        const title = data?.name || '';
        const artist = data?.artistName || '';
        const albumCover = GetAlbumCover(data?.artwork?.url, data?.artwork?.width || 600);

        return { title, artist, albumCover }
    }

    return {};
}

function UpdatePlaybackState(data) {
    let isPlaying = false;

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

function GetData(debug = false) {
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

export default {
    id: 'apple-music',
    icon,

    connect({ onConnect, onDisconnect, onData }) {
        const socket = GetData();

        const handleConnect = () => onConnect?.();
        const handleDisconnect = () => onDisconnect?.();
        const handleStateUpdate = ({ data, type }) => {
            switch (type) {
                case 'playbackStatus.playbackStateDidChange':
                    onData?.(current => ({ ...current, ...UpdatePlaybackState(data) }));
                    break;
                case 'playbackStatus.nowPlayingItemDidChange':
                    onData?.(current => ({ ...current, ...UpdateMusicData(data) }));
                    break;
                case 'playbackStatus.playbackTimeDidChange':
                    onData?.(current => ({ ...current, ...UpdateMusicTime(data) }));
                    break;
                default:
                    console.debug(type, data);
            }
        }

        socket?.on('connect', handleConnect);
        socket?.on('disconnect', handleDisconnect);
        socket?.on('API:Playback', handleStateUpdate);
        socket?.connect();

        return () => {
            socket?.off('connect', handleConnect);
            socket?.off('disconnect', handleDisconnect);
            socket?.off('API:Playback', handleStateUpdate);

            if (socket?.connected)
                socket?.disconnect();
        }
    }
}