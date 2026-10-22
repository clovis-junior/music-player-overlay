import { GetAlbumCoverAnimated, ResolveMetadata } from './ResolveMetadata';
import { IsEmpty, GetURLParams, NormalizeMetadata } from './Utils';
import { io } from 'socket.io-client';

const params = GetURLParams();

const host = params?.get('host') || 'localhost';
const port = params?.get('port') || 1997;

const baseURL = `http://${host}:${port}`;

function IsValidTrack(data) {
  return Boolean(data?.title && data?.artist)
}

export function IsValidCover(url) {
  if (IsEmpty(url)) return false;

  if (typeof url !== 'string')
    return false;

  const value = url.trim().toLowerCase();

  if (!value)
    return false;

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

  return /^https?:\/\/.+/i.test(value)
}

async function UpdatePlayerData(data, onMetadataUpdate) {
  if (data.error) return {};

  const player = data?.player;
  const song = data?.video;
  const meta = NormalizeMetadata(song?.author, song?.title);

  const songId = song?.id || `${song?.author || ''}|${song?.title || ''}`.toLowerCase().trim();
  const isPlaying = player?.trackState === 1;
  const title = meta?.track || song?.title || '';
  const artist = meta?.artist || song?.author || '';
  const album = song?.album || '';
  const albumCover = song?.thumbnails?.at(-1)?.url || null;
  const duration = {
    elapsed: Number(player?.videoProgress) || 0,
    remaining: Math.max(0, (song?.durationSeconds || 0) - (player?.videoProgress || 0)),
    total: Number(song?.durationSeconds) || 0
  };

  const current = {
    _id: songId,
    isPlaying, duration,
    title, artist,
    album, albumCover,
    albumAnimatedCover: null
  };

  if (title && artist) {
    GetAlbumCoverAnimated(title, artist, album)
      .then(response => {
        if (response?.animated) {
          onMetadataUpdate?.({
            _id: songId,
            albumAnimatedCover: response.animated
          })
        }
      })
  }

  if (meta?.artist && meta?.track) {
    ResolveMetadata(meta.artist, meta.track, album)
      .then(async (metadata) => {
        if (!metadata) return;

        onMetadataUpdate?.({
          _id: songId,
          title: metadata.title || title,
          artist: metadata.artist || artist,
          albumCover: IsValidCover(metadata.albumCover) ? metadata.albumCover : albumCover,
        })
      })
  }

  return current
}

function GetData(debug = false) {
  try {
    const socket = io(`${baseURL}`, {
      transports: ['websocket'],
      autoConnect: false
    });

    socket?.on('connect', () => console.log('Connected to System Media'));
    socket?.on('reconnect', attempt => console.log(`Successfully reconnected after ${attempt} attempts.`));
    socket?.on('disconnect', () => console.log('Disconnected to System Media... Reconnecting...'));
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
          if (current?._id && metadata?._id && current._id !== metadata._id)
            return current;

          return { ...current, ...metadata }
        })
      });

      if (!data || data?.error || !IsValidTrack(data)) return;

      onData?.(current => {
        const isNewTrack = current?._id !== data?._id;

        const next = {
          ...current, ...data,
          albumCover: data?.albumCover || current?.albumCover || '',
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

        return (sameMetadata && samePlaybackState) ? current : next;
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
