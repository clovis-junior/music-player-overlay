import { io } from 'socket.io-client';

const appID = 'music-player-overlay-by';
const appName = 'Music Player Overlay (By Clovis Junior)';
const appVersion = '1.0.0';

const baseURL = 'http://192.168.15.152:9863/api/v1';
const params = new URLSearchParams(window.location.search);

const token = localStorage.getItem('YouTubeMusicDesktopToken') || params.get('token');

export var authCode;

async function RequestCode() {
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
      return { statusCode: data.statusCode, message: data?.message };

    return data;
  } catch(e) {
    console.error(`Error on Request Code: ${e.message}`);
  }
}

export async function RequestToken() {
  const request = await RequestCode();

  if(request.statusCode)
    return { statusCode: request.statusCode, message: request.message };

  authCode = request?.code;

  try {
    const response = await fetch(`${baseURL}/auth/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'appId': appID,
        'code': request?.code
      })
    });
    
    const data = await response.json();

    if(data.statusCode)
      return { statusCode: data.statusCode, message: data?.message };

    return data;
  } catch(e) {
    console.error(`Error on Request Token: ${e.message}`);
  }
}

export function UpdatePlayerData(data) {
  const player = data?.player;
  const song = data?.video;

  const isPlaying = (player?.trackState === 1);
  const title = song?.title;
  const artist = song?.author;
  const albumCover = song?.thumbnails[song.thumbnails.length - 1].url;
  const duration = {
      elapsed: player?.videoProgress || 0,
      percentage: (player?.videoProgress * 100) / song?.durationSeconds || 0,
      remaining: (song?.durationSeconds - player?.videoProgress) || 0,
      total: song?.durationSeconds || 0
  };

  return {isPlaying, title, artist, duration, albumCover};
}

export function GetDataFromYouTubeMusic() {
  const socket = io(`${baseURL}/realtime`, {
		'transports': ['websocket'],
		'auth': { 'token': token }
	});

	socket.on('disconnect', ()=> {
    setTimeout(GetDataFromYouTubeMusic(), 5000)
  });

  return socket
}