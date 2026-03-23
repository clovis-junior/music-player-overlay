import { GetURLParams } from './Utils';
import { io } from 'socket.io-client';

import icon from '../assets/images/ytm-logo.png';

const appID = 'music-player-overlay';
const appName = 'Music Player Overlay (By Clovis Junior)';
const appVersion = '1.0.0';

const params = GetURLParams();

const host = params?.get('host') || 'localhost';
const port = params?.get('port') || 9863;
const token = params?.get('token');

const baseURL = `http://${host}:${port}/api/v1`;

export var authCode;

export async function RequestCode() {
  try {
    const response = await fetch(`${baseURL}/auth/requestcode`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'appId': appID,
        'appName': appName,
        'appVersion': appVersion
      })
    });

    const data = await response.json();

    if (data.statusCode)
      return { statusCode: data.statusCode, message: data.message };

    return data;
  } catch (e) {
    console.error(`Error on Request Code: ${e.message}`);
    return { statusCode: '?', message: e.message };
  }
}

export async function RequestToken(code) {
  try {
    const response = await fetch(`${baseURL}/auth/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'appId': appID,
        'code': code
      })
    });

    const data = await response.json();

    if (data.statusCode)
      return { statusCode: data.statusCode, message: data.message };

    return data;
  } catch (e) {
    console.error(`Error on Request Token: ${e.message}`);
    return { statusCode: '?', message: e.message };
  }
}

function UpdatePlayerData(data) {
  if (data.error) return data;

  const player = data?.player;
  const song = data?.video;

  const isPlaying = (player?.trackState === 1);
  const title = song?.title;
  const artist = song?.author;
  const albumCover = song?.thumbnails[song.thumbnails.length - 1].url;
  const duration = {
    elapsed: Number(player?.videoProgress) || 0,
    remaining: Math.max(0, song?.durationSeconds - player?.videoProgress),
    total: Number(song?.durationSeconds) || 0
  };

  return { isPlaying, title, artist, duration, albumCover };
}

function GetData(debug = false) {
  try {
    const socket = io(`${baseURL}/realtime`, {
      transports: ['websocket'],
      auth: { 'token': token },
      autoConnect: false
    });

    socket?.on('connect', () => console.log('Connected to YTMDesktop'));
    socket?.on('reconnect', attempt => console.log(`Successfully reconnected after ${attempt} attempts.`));
    socket?.on('disconnect', () => console.log('Disconnected to YTMDesktop... Reconnecting...'));
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
  id: 'youtube-music',
  icon,

  connect({ onConnect, onDisconnect, onData }) {
    const socket = GetData();

    const handleConnect = () => onConnect?.();
    const handleDisconnect = () => onDisconnect?.();
    const handleStateUpdate = state => {
      const data = UpdatePlayerData(state);

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