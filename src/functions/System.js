import { ResolveMetadata } from './ResolveMetadata';
import { GetURLParams, NormalizeMetadata } from './Utils';
import { io } from 'socket.io-client';

const params = GetURLParams();

const host = params?.get('host') || 'localhost';
const port = params?.get('port') || 10767;

const baseURL = `http://${host}:${port}`;

function IsValidTrack(data) {
  return Boolean(data?.title && data?.artist)
}

async function UpdatePlayerData(data, onMetadataUpdate) {
  if (data.error) return data;

  const player = data?.player;
  const song = data?.video;

  const meta = NormalizeMetadata(
    song?.author,
    song?.title
  );

  const currentData = {
    isPlaying: player?.trackState === 1,
    title: meta?.track || song?.title || '',
    artist: meta?.artist || song?.author || '',
    albumCover: song?.thumbnails?.at(-1)?.url || '',
    duration: {
      elapsed: Number(player?.videoProgress) || 0,
      remaining: Math.max(0, song?.durationSeconds - player?.videoProgress),
      total: Number(song?.durationSeconds) || 0
    }
  };

  if (meta?.artist && meta?.track) {
    ResolveMetadata(meta.artist, meta.track).then(metadata => {
      if (!metadata) return;

      onMetadataUpdate?.({
        title: metadata.title,
        artist: metadata.artist,
        albumCover: metadata.albumCover
      })
    })
  }

  return currentData
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
      const data = await UpdatePlayerData(
        state,
        metadata => {
          onData?.(current => ({
            ...current,
            ...metadata
          }));
        }
      );

      if (!data || data?.error)
        return;

      if (!IsValidTrack(data))
        return;

      onData?.(current => {
        const next = {
          ...current,
          ...data
        };

        const sameMetadata =
          current?.title === next?.title &&
          current?.artist === next?.artist &&
          current?.albumCover === next?.albumCover;

        const samePlaybackState =
          current?.isPlaying === next?.isPlaying &&
          current?.duration?.elapsed === next?.duration?.elapsed &&
          current?.duration?.remaining === next?.duration?.remaining &&
          current?.duration?.total === next?.duration?.total;

        return (
          sameMetadata &&
          samePlaybackState
        ) ? current : next
      });
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