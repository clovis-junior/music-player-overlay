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

    const result = { duration };

    if (typeof data?.isPlaying === 'boolean')
      result.isPlaying = data.isPlaying;

    return result
  }

  return {}
}

function UpdateMusicData(data) {
  if (IsEmpty(data)) return {};

  const title = data?.name || data?.title || '';
  const artist = data?.artistName || data?.artist || '';
  const albumCover = GetAlbumCover(
    data?.artwork?.url,
    data?.artwork?.width || 600
  );

  return { title, artist, albumCover };
}

function UpdatePlaybackState(data) {
  if (IsEmpty(data)) return { isPlaying: false };

  const rawState = data?.state ?? data?.status ?? data;
  const stateStr = String(rawState).toLowerCase().trim();
  const isPlaying = stateStr === 'playing' || stateStr === '2' || rawState === true;
  const targetData = data?.attributes || (data?.name ? data : null);

  return targetData
    ? { isPlaying, ...UpdateMusicData(targetData) }
    : { isPlaying };
}

async function FetchInitialState(onData) {
  try {
    const [nowPlayingRes, statusRes] = await Promise.allSettled([
      fetch(`${baseURL}/api/v1/playback/now-playing`),
      fetch(`${baseURL}/api/v1/playback/active`)
    ]);

    let initialData = {};

    if (nowPlayingRes.status === 'fulfilled' && nowPlayingRes.value.ok) {
      const nowPlaying = await nowPlayingRes.value.json();
      const track = nowPlaying?.info || nowPlaying;

      initialData = { ...initialData, ...UpdateMusicData(track) };
    }

    if (statusRes.status === 'fulfilled' && statusRes.value.ok) {
      const status = await statusRes.value.json();
      const isPlaying = status?.isConnecting || status?.status === 'playing' || status === true;

      initialData = { ...initialData, isPlaying };
    }

    if (Object.keys(initialData).length > 0)
      onData?.(current => ({ ...current, ...initialData }));

    console.log(initialData);

  } catch (err) {
    console.warn('Failed to get initial state:', err.message);
  }
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

    const handleConnect = () => {
      onConnect?.();
      FetchInitialState(onData)
    };
    const handleDisconnect = () => onDisconnect?.();
    const handleStateUpdate = ({ data, type }) => {
      console.log('[Cider Event]', type, data);
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