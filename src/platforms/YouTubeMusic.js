const appID = 'music-player-overlay-by-clovis-junior';
const appName = 'Music Player Overlay (By Clovis Junior)';
const appVersion = '1.0.0';

const baseURL = 'http://localhost:9863/api/v1';
const params = new URLSearchParams(window.location.search);

const token = localStorage.getItem('YouTubeMusicDesktopToken') || params.get('token');

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

    return await response.json();
  } catch(e) {
    console.error(`Error on Request Code: ${e.message}`);
  }
}

export async function RequestToken() {
  const request = await RequestCode();
  const code = request.code || '';

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

    return await data;
  } catch(e) {
    console.error(`Error on Request Token: ${e.message}`);
  }
}

export async function GetDataFromYouTubeMusic() {
  try {
    const response = await fetch(`${baseURL}/state`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if(response.status !== 200)
        return { error: 'Access denied' };

    const data = await response.json();

    const isPlaying = (data.player?.trackState === 1);
    const title = data.video?.title;
    const artist = data.video?.author;
    const albumCover = data.queue?.items.thumbnails[data.queue?.items.thumbnails.length - 1].url;
    const duration = {
        elapsed: parseInt(data.player?.videoProgress / 1000) || 0,
        percentage: (data.player?.videoProgress * 100) / data.video?.durationSeconds || 0,
        remaining: parseInt((data.video?.durationSeconds - data.player?.videoProgress) / 1000) || 0,
        total: parseInt(data.video?.durationSeconds / 1000) || 0
    };

    return {isPlaying, title, artist, duration, albumCover}
  } catch(error) {
      return { error: error.message.toString() };
  }
}