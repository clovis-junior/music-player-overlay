const url = 'http://localhost:9863';

export async function GetDataFromYouTubeMusic() {
  try {
    const response = await fetch(`${url}/query`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
    });

    if(response.status !== 200)
      return { error: 'Access denied or invalid' };

    const data = await response.json();
    const isPlaying = !data.player.isPaused;
    const title = data.track?.title;
    const artist = data.track?.author;
    const albumCover = data.track?.cover;
    const duration = {
      elapsed: parseInt(data.player?.seekbarCurrentPosition) || 0,
      percentage: (data.player?.seekbarCurrentPosition * 100) / data.track?.duration,
      remaining: parseInt(data.track?.duration - data.player?.seekbarCurrentPosition),
      total: parseInt(data.track?.duration) || 0
    };
    
    return {isPlaying, title, artist, duration, albumCover}
  } catch(error) {
    return { error: error.message.toString() };
  }
}
