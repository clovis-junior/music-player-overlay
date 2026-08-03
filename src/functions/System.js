import { getCachedAlbumCover } from './LastFM';
import { GetURLParams } from './Utils';
import { io } from 'socket.io-client';

const params = GetURLParams();

const host = params?.get('host') || 'localhost';
const port = params?.get('port') || 10767;

const baseURL = `http://${host}:${port}`;

function NormalizeMetadata(author, title) {
  let artist = author
    ?.replace(/\s*-\s*Topic$/i, '')
    ?.trim();

  let track = title
    ?.replace(/\s*\(Official.*?\)/gi, '')
    ?.replace(/\s*\[Official.*?\]/gi, '')
    ?.replace(/\s*Official Audio/gi, '')
    ?.replace(/\s*Official Video/gi, '')
    ?.trim();

  if (artist && track) {
    const escapedArtist = artist.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const regex = new RegExp(`^${escapedArtist}\\s*-\\s*`, 'i');

    if (regex.test(track)) {
      track = track.replace(regex, '').trim();
    }
  }

  return {
    artist,
    track
  };
}

async function UpdatePlayerData(data) {
  if (data.error) return data;

  const player = data?.player;
  const song = data?.video;
  const meta = NormalizeMetadata(song?.author, song?.title);

  const isPlaying = (player?.trackState === 1);
  const title = meta?.track || song?.title;
  const artist = meta?.artist || song?.author;
  const albumCover = await getCachedAlbumCover(artist, title) || song?.thumbnails[song.thumbnails.length - 1].url || '';
  const duration = {
    elapsed: Number(player?.videoProgress) || 0,
    remaining: Math.max(0, song?.durationSeconds - player?.videoProgress),
    total: Number(song?.durationSeconds) || 0
  };

  return { isPlaying, title, artist, duration, albumCover };
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
      const data = await UpdatePlayerData(state);

      if (!data || data?.error) return;

      onData?.(current => {
        const next = data;

        const sameMetadata =
          current?.title === next?.title &&
          current?.artist === next?.artist &&
          current?.albumCover === next?.albumCover;

        const samePlaybackState =
          current?.isPlaying === next?.isPlaying &&
          current?.duration?.elapsed === next?.duration?.elapsed &&
          current?.duration?.remaining === next?.duration?.remaining &&
          current?.duration?.total === next?.duration?.total;

        return (sameMetadata && samePlaybackState) ? current : next;
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