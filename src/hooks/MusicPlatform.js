import { useState, useEffect } from 'react';

// const defaultTitle = document?.title;
const PLAYBACK_STATE_DELAY = 1500;

async function loadPlatformModule(platform) {
  switch (platform) {
    case 'spotify':
      return import('../functions/Spotify.js');
    case 'apple':
    case 'apple-music':
      return import('../functions/AppleMusic.js');
    case 'youtube':
    case 'youtube-music':
    default:
      return import('../functions/YoutubeMusic.js');
  }
}

export function useMusicPlatform(platform) {
  const [platformIcon, setPlatformIcon] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [music, setMusic] = useState({});
  const [displayIsPlaying, setDisplayIsPlaying] = useState(false);

  useEffect(() => {
    let disconnect = null;
    let cancelled = false;

    async function setupPlatform() {
      const mod = await loadPlatformModule(platform);
      const adapter = mod.default;

      if (cancelled) return;

      setPlatformIcon(adapter.icon || '');

      disconnect = adapter.connect({
        onConnect: () => setIsConnected(true),
        onDisconnect: () => setIsConnected(false),
        onData: (updater) => {
          setMusic(current => {
            return typeof updater === 'function'
              ? updater(current)
              : updater;
          });
        }
      });
    }

    setupPlatform();

    return () => {
      cancelled = true;

      if (typeof disconnect === 'function')
        disconnect();
    };
  }, [platform]);

  useEffect(() => {
    let timer;

    if (music?.isPlaying) {
      requestAnimationFrame(() => {
        setDisplayIsPlaying(true);
      })
    } else {
      timer = setTimeout(() => {
        setDisplayIsPlaying(false);
      }, PLAYBACK_STATE_DELAY)
    }

    return () => {
      if (timer) clearTimeout(timer);
    }
  }, [music?.isPlaying]);

  useEffect(() => {
    if (platform !== 'spotify') return;
    if (!music?.isPlaying || !music?.duration?.total) return;

    const update = setInterval(() => {
      setMusic(current => {
        if (!current?.isPlaying) return current;
        if (current.duration.elapsed >= current.duration.total) return current;

        const elapsed = current.duration.elapsed + 1;

        return {
          ...current,
          duration: {
            ...current.duration,
            elapsed,
            remaining: Math.max(0, current.duration.total - elapsed)
          }
        };
      });
    }, 1250);

    return () => clearInterval(update);
  }, [platform, music?.isPlaying, music?.duration?.total]);

  const hasReceivedData = !!(
    music?.title ||
    music?.artist ||
    music?.albumCover
  );

  return {
    platformIcon,
    isConnected,
    hasReceivedData,
    music: {
      ...music,
      displayIsPlaying
    }
  };
}
