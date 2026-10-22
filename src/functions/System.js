import { GetURLParams, NormalizeMetadata } from './Utils';
import { io } from 'socket.io-client';

import { GetAlbumCoverAnimated } from './ResolveMetadata';

const params = GetURLParams();

const host = params?.get('host') || 'localhost';
const port = params?.get('port') || 1997;

const baseURL = `http://${host}:${port}`;

export function IsValidCover(url) {
  if (IsEmpty(url)) return false;
  if (typeof url !== 'string') return false;

  const value = url.trim().toLowerCase();

  if (!value) return false;

  const invalidKeywords = [
    'placeholder',
    'default',
    'no_image',
    'nocover',
    'transparent',
    'blank',
    '2a96cbd8b46e442fc41c2b86b821562f'
  ];

  if (invalidKeywords.some(keyword => value.includes(keyword)))
    return false;

  return /^https?:\/\/.+/i.test(value);
}

async function UpdatePlayerData(data, onMetadataUpdate) {
  if (data.error) return {};

  const track = data?.track;
  const source = data?.source;
  const meta = NormalizeMetadata(track?.artist, track?.name);

  
  const isPlaying = data.is_playing || false;
  const title = meta?.track || track?.title || '';
  const artist = meta?.artist || track?.artist || '';
  const album = track?.album?.name || '';
  const albumCover = track?.thumbnails?.at(-1)?.url || null;
  const duration = {
    elapsed: Number(data?.progress) || 0,
    remaining: Math.max(0, (track?.duration || 0) - (data?.progress || 0)),
    total: Number(track?.duration) || 0
  };
  const trackId = track?.id || `${source}|${title}` || null;

  const current = {
    _id: trackId,
    isPlaying, duration,
    title, artist,
    album, albumCover,
    albumAnimatedCover: null
  };

  if (!current.albumAnimatedCover) {
    GetAlbumCoverAnimated(title, artist, album)
      .then(response => {
        if (response?.animated)
          onMetadataUpdate?.({
            _id: trackId,
            albumAnimatedCover: response.animated
          })
      })
  }

  return current
}

function GetData(debug = false) {
  try {
    const socket = io(baseURL, {
      transports: ['websocket'],
      auth: { 'token': token },
      autoConnect: false
    });

    socket?.on('connect', () => console.log('Connected to Ornidget Listener'));
    socket?.on('reconnect', attempt => console.log(`Successfully reconnected after ${attempt} attempts.`));
    socket?.on('disconnect', () => console.log('Disconnected to Ornidget Listener... Reconnecting...'));
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
  id: 'universal',
  icon: null,

  connect({ onConnect, onDisconnect, onData }) {
    const socket = GetData();

    const handleConnect = () => onConnect?.();
    const handleDisconnect = () => onDisconnect?.();
    const handleStateUpdate = async state => {
      const data = await UpdatePlayerData(state, metadata => {
        onData?.(current => {
          return {
            ...current,
            albumAnimatedCover: metadata.albumAnimatedCover
          }
        })
      });

      if (!data || data?.error) return;

      onData?.(current => {
        const isNewTrack = current?._id !== data?._id;

        const next = {
          ...current, ...data,
          albumAnimatedCover: isNewTrack ? null : current?.albumAnimatedCover
        };

        const sameMetadata =
          current?.title === next?.title &&
          current?.artist === next?.artist &&
          current?.album === next?.album &&
          current?.albumCover === next?.albumCover &&
          current?.albumAnimatedCover === next?.albumAnimatedCover;

        const samePlaybackState =
          current?.isPlaying === next?.isPlaying &&
          current?.duration?.elapsed === next?.duration?.elapsed &&
          current?.duration?.remaining === next?.duration?.remaining &&
          current?.duration?.total === next?.duration?.total;

        return (sameMetadata && samePlaybackState) ? current : next
      })
    };

    socket?.on('connect', handleConnect);
    socket?.on('disconnect', handleDisconnect);
    socket?.on('state-update', handleStateUpdate);
    socket?.connect();

    return () => {
      socket?.off('connect', handleConnect);
      socket?.off('disconnect', handleDisconnect);
      socket?.off('state-update', handleStateUpdate);

      if (socket?.connected)
        socket?.disconnect();
    }
  }
}
