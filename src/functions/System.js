import { GetAlbumCoverAnimated, ResolveMetadata } from './ResolveMetadata';
import { IsEmpty, GetURLParams, NormalizeMetadata } from './Utils';
import { io } from 'socket.io-client';

const params = GetURLParams();

const host = params?.get('host') || 'localhost';
const port = params?.get('port') || 1997;

const baseURL = `http://${host}:${port}`;

function IsValidTrack(data) {
  return Boolean(data?.title && data?.artist);
}

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

  if (invalidKeywords.some(keyword => value.includes(keyword))) {
    return false;
  }

  return /^https?:\/\/.+/i.test(value);
}

const metadataRequests = new Map();
const MAX_METADATA_CACHE = 200;

function RememberMetadataRequest(key, promise) {
  const trackedPromise = Promise.resolve(promise)
    .then(() => true)
    .catch(error => {
      console.error(
        'Metadata enrichment error:',
        error?.message || error
      );

      return false;
    })
    .then(success => {
      if (
        !success &&
        metadataRequests.get(key) === trackedPromise
      ) {
        metadataRequests.delete(key);
      }

      return success;
    });

  metadataRequests.set(key, trackedPromise);

  while (metadataRequests.size > MAX_METADATA_CACHE) {
    const oldestKey = metadataRequests.keys().next().value;
    metadataRequests.delete(oldestKey);
  }

  return trackedPromise;
}

function UpdatePlayerData(data, onMetadataUpdate) {
  if (!data || data.error) return {};

  const player = data.player;
  const song = data.track || data.video;

  if (!song) return {};

  const rawTitle = song.name ?? song.title ?? '';
  const rawArtist = song.artist ?? song.author ?? '';
  const rawAlbum = song.album?.name ?? song.album ?? '';

  const meta = NormalizeMetadata(rawArtist, rawTitle);

  const title = meta?.track || rawTitle;
  const artist = meta?.artist || rawArtist;
  const album = rawAlbum;
  const source = data.source || '';

  const songId = data.id || [
    source,
    title.toLowerCase().trim(),
    artist.toLowerCase().trim(),
    album.toLowerCase().trim()
  ].join(':');

  const isPlaying =
    typeof data.is_playing === 'boolean'
      ? data.is_playing
      : player?.trackState === 1;

  const rawProgress = Number(
    data.progress ?? player?.videoProgress
  );

  const rawDuration = Number(
    song.duration ?? song.durationSeconds
  );

  const total = Number.isFinite(rawDuration)
    ? Math.max(0, rawDuration)
    : 0;

  const elapsed = Number.isFinite(rawProgress)
    ? Math.max(
        0,
        total > 0
          ? Math.min(Math.max(0, rawProgress), total)
          : Math.max(0, rawProgress)
      )
    : 0;

  const duration = {
    elapsed,
    remaining: Math.max(0, total - elapsed),
    total
  };

  const websocketCover =
    song.album?.image ??
    song.thumbnails?.at(-1)?.url ??
    '';

  const current = {
    _id: songId,
    source,
    isPlaying,
    duration,
    title,
    artist,
    album,

    albumCover: websocketCover || '',
    albumCoverSource: websocketCover ? 'websocket' : '',

    metadataSource: '',

    albumAnimatedCover: null
  };

  if (!IsValidTrack(current)) {
    return current;
  }

  const resolveKey = `${songId}:resolved`;

  if (
    meta?.artist &&
    meta?.track &&
    !metadataRequests.has(resolveKey)
  ) {
    RememberMetadataRequest(
      resolveKey,
      (async () => {
        const metadata = await ResolveMetadata(
          meta.artist,
          meta.track,
          album
        );

        if (!metadata) return;

        const providerCover = IsValidCover(metadata.albumCover)
          ? metadata.albumCover
          : null;

        onMetadataUpdate?.({
          _id: songId,

          title: metadata.title || title,
          artist: metadata.artist || artist,
          album: metadata.album || album,

          metadataSource: 'provider',

          ...(providerCover
            ? {
                albumCover: providerCover,
                albumCoverSource: 'provider'
              }
            : {})
        });
      })()
    );
  }

  const animatedKey = `${songId}:animated`;

  if (!metadataRequests.has(animatedKey)) {
    RememberMetadataRequest(
      animatedKey,
      (async () => {
        const response = await GetAlbumCoverAnimated(
          title,
          artist,
          album
        );

        if (response?.animated) {
          onMetadataUpdate?.({
            _id: songId,
            albumAnimatedCover: response.animated
          })
        }
      })()
    );
  }

  return current
}

function GetData(debug = false) {
  try {
    const socket = io(baseURL, {
      transports: ['websocket'],
      autoConnect: false,
      reconnection: true
    });

    const manager = socket.io;

    socket.on('connect', () => {
      console.log('Connected to System Media')
    });

    socket.on('disconnect', reason => {
      console.log('Disconnected from System Media:', reason)
    });

    socket.on('connect_error', error => {
      console.error(
        'Connection error:',
        error?.message || error
      )
    });

    manager.on('reconnect', attempt => {
      console.log(
        `Successfully reconnected after ${attempt} attempts.`
      )
    });

    manager.on('reconnect_attempt', attempt => {
      console.log(`Reconnect attempt #${attempt}`)
    });

    manager.on('reconnect_failed', () => {
      console.error('Reconnect failed!')
    });

    if (debug) {
      socket.onAny((event, ...args) => {
        console.debug(event, ...args)
      })
    }

    return socket
  } catch (error) {
    console.error(error?.message || error);

    return {
      error: String(error?.message || error)
    }
  }
}

export default {
  id: 'universal',
  icon: null,

  connect({ onConnect, onDisconnect, onData }) {
    const socket = GetData();

    if (socket?.error)
      return () => {};

    const handleConnect = () => onConnect?.();
    const handleDisconnect = () => onDisconnect?.();

    const handleStateUpdate = state => {
      const data = UpdatePlayerData(state, metadata => {
        onData?.(current => {
          if (
            current?._id &&
            metadata?._id &&
            current._id !== metadata._id
          )
            return current;

          return { ...current, ...metadata }
        });
      });

      if (!data || data.error || !IsValidTrack(data)) {
        return;
      }

      onData?.(current => {
        const isNewTrack = current?._id !== data._id;

        const hasProviderMetadata =
          !isNewTrack &&
          current?.metadataSource === 'provider';

        const title = hasProviderMetadata
          ? current.title
          : data.title;

        const artist = hasProviderMetadata
          ? current.artist
          : data.artist;

        const album = hasProviderMetadata
          ? current.album
          : data.album;

        const hasProviderCover =
          !isNewTrack &&
          current?.albumCoverSource === 'provider' &&
          current?.albumCover;

        const albumCover = hasProviderCover
          ? current.albumCover
          : data.albumCover || (
              !isNewTrack
                ? current?.albumCover
                : ''
            ) || '';

        const albumCoverSource = hasProviderCover
          ? 'provider'
          : data.albumCover
            ? data.albumCoverSource || 'websocket'
            : !isNewTrack
              ? current?.albumCoverSource || ''
              : '';

        const next = {
          ...current, ...data,
          title, artist,
          album, albumCover,
          albumCoverSource,
          metadataSource: hasProviderMetadata
            ? 'provider'
            : data.metadataSource || '',
          albumAnimatedCover: isNewTrack
            ? null
            : current?.albumAnimatedCover ?? null
        };

        const sameMetadata =
          current?._id === next._id &&
          current?.source === next.source &&
          current?.title === next.title &&
          current?.artist === next.artist &&
          current?.album === next.album &&
          current?.albumCover === next.albumCover &&
          current?.albumCoverSource === next.albumCoverSource &&
          current?.metadataSource === next.metadataSource &&
          current?.albumAnimatedCover === next.albumAnimatedCover;

        const samePlaybackState =
          current?.isPlaying === next.isPlaying &&
          current?.duration?.elapsed === next.duration.elapsed &&
          current?.duration?.remaining === next.duration.remaining &&
          current?.duration?.total === next.duration.total;

        return sameMetadata && samePlaybackState
          ? current
          : next;
      });
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('state-update', handleStateUpdate);

    socket.connect();

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('state-update', handleStateUpdate);

      socket.io.off('reconnect');
      socket.io.off('reconnect_attempt');
      socket.io.off('reconnect_failed');

      if (socket.connected)
        socket.disconnect();
    }
  }
}