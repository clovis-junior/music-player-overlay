import { GetAlbumCoverAnimated, ResolveMetadata } from './ResolveMetadata';
import { IsEmpty, GetURLParams, NormalizeMetadata } from './Utils';
import { io } from 'socket.io-client';

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


function UpdatePlayerData(data) {
  if (!data || data.error) return null;

  const track = data.track;
  const source = data.source || 'unknown';

  if (!track) return null;

  const meta = NormalizeMetadata(track.artist, track.name);

  const title = meta?.track || track.title || track.name || '';
  const artist = meta?.artist || track.artist || '';

  const trackId = track.id != null
    ? `${source}|${track.id}`
    : `${source}|${artist.trim().toLowerCase()}|${title.trim().toLowerCase()}`;

  const elapsed = Number(data.progress) || 0;
  const total = Number(track.duration) || 0;

  return {
    _id: trackId,
    isPlaying: Boolean(data.is_playing),
    title, artist,
    album: track.album?.name || '',
    albumCover: track.album?.image || '',
    albumAnimatedCover: null,
    duration: {
      elapsed,
      remaining: Math.max(0, total - elapsed),
      total
    }
  }
}


function GetData(debug = false) {
  try {
    const socket = io(baseURL, {
      transports: ['websocket'],
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
  
    let activeTrackId = null;
  
    const handleConnect = () => onConnect?.();
    const handleDisconnect = () => onDisconnect?.();
  
    const handleStateUpdate = state => {
      const data = UpdatePlayerData(state);
  
      if (!data) return;
  
      const trackChanged = data._id !== activeTrackId;
  
      if (trackChanged)
        activeTrackId = data._id;
  
      const trackId = data._id;
      const stillCurrent = () => activeTrackId === trackId;
  
      onData?.(current => {
        if (!stillCurrent()) return current;
  
        const isNewTrack = current?._id !== trackId;
  
        const next = {
          ...current, ...data,
          albumCover: isNewTrack ? data?.albumCover : current?.albumCover,
          albumAnimatedCover: isNewTrack
            ? null : current?.albumAnimatedCover
        };
  
        const sameMetadata =
          current?._id === next?._id &&
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
  
        return sameMetadata && samePlaybackState
          ? current : next;
      });

      if (!trackChanged) return;
  
      const applyMetadata = update => {
        if (!stillCurrent()) return;
  
        onData?.(current => {
          if (!stillCurrent() || current?._id !== trackId)
            return current;
  
          return { ...current, ...update }
        })
      };
  
      Promise.resolve()
        .then(() => ResolveMetadata(data.artist, data.title))
        .then(metadata => {
          if (!metadata || !stillCurrent()) return;
  
          const update = {
            title: metadata?.title || data?.title,
            artist: metadata?.artist || data?.artist
          };
  
          if (IsValidCover(metadata.albumCover))
            update.albumCover = metadata?.albumCover;
  
          applyMetadata(update)
        })
        .catch(error => {
          console.error('ResolveMetadata error:', error);
        });
  
      Promise.resolve()
        .then(() =>
          GetAlbumCoverAnimated(data?.title, data?.artist, data?.album)
        )
        .then(async response => {
          if (!stillCurrent()) return;
  
          if (!response?.animated) {
            const metadata = await ResolveMetadata(
              data.artist, data.title
            );
  
            if (!stillCurrent()) return;
  
            const title = metadata?.title || data?.title;
            const artist = metadata?.artist || data?.artist;
            const album = metadata?.album || data?.album;
  
            if (title !== data.title || artist !== data.artist || 
                album !== data.album)
              response = await GetAlbumCoverAnimated(title, artist, album);
          }
  
          if (!response?.animated || !stillCurrent())
            return;
  
          applyMetadata({ albumAnimatedCover: response.animated })
        })
        .catch(error => {
          console.error('GetAlbumCoverAnimated error:', error)
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
  
      activeTrackId = null;
  
      if (socket?.connected)
        socket.disconnect();
    }
  }
}
