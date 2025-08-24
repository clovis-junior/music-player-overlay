import { GetURLParams } from '../Utils.js';
import { io } from 'socket.io-client';

const appID = 'music-player-overlay';
const appName = 'Music Player Overlay (By Clovis Junior)';
const appVersion = '1.0.0';

const baseURL = 'http://127.0.0.1:9863/api/v1';
const params = GetURLParams();

const token = params.get('token');

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

    if(data.statusCode)
      return { statusCode: data.statusCode, message: data.message };

    return data;
  } catch(e) {
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

    if(data.statusCode)
      return { statusCode: data.statusCode, message: data.message };

    return data;
  } catch(e) {
    console.error(`Error on Request Token: ${e.message}`);
    return { statusCode: '?', message: e.message };
  }
}

export function UpdatePlayerData(data) {
  if(data.error) return data;

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

  return {isPlaying, title, artist, duration, albumCover};
}

export function GetData() {
  try {
    const socket = io(`${baseURL}/realtime`, {
      'transports': ['websocket'],
      'auth': { 'token': token }
    });
  
    socket?.on('connect', ()=> {
      console.log('Connected to YTMDesktop');
    });
    socket?.on('disconnect', ()=> console.log('Disconnected to YTMDesktop... Reconnecting...'));

    return socket;
  } catch(e) {
    console.error(e.message.toString());

    return { error: e.message.toString() }
  }
}