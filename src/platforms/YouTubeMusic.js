import { GetURLParams } from '../Utils.js';
import { io } from 'socket.io-client';

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

export function UpdatePlayerData(data) {
  if (data.error) return data;

  const player = data?.player;
  const song = data?.video;

  const isPlaying = (player?.trackState === 1);
  const title = song?.title;
  const artist = song?.author;
  const albumCover = song?.thumbnails[song.thumbnails.length - 1].url;
  const duration = {
    elapsed: player?.videoProgress || 0,
    remaining: (song?.durationSeconds - player?.videoProgress) || 0,
    total: song?.durationSeconds || 0
  };

  return { isPlaying, title, artist, duration, albumCover };
}

export function GetData(debug = false) {
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
