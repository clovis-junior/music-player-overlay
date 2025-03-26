const url = '//192.168.15.152:9863';

export async function GetDataFromYouTubeMusic() {
  try {
    const response = await fetch(`${url}/query`);

    if(response.status !== 200)
      return { error: 'Access denied or invalid' };

    const data = await response.json();
    const isPlaying = !data.player.isPaused;
    const title = data.track.title;
    const artist = data.track.author;
    const duration = {
      elapsed: parseInt(data.player.seekbarCurrentPosition) || 0,
      percentage: (data.player.seekbarCurrentPosition * 100) / data.track.duration,
      remaining: parseInt(data.track.duration - data.player.seekbarCurrentPosition),
      total: parseInt(data.track.duration) || 0
    };
    const albumCover = data.track.cover;
  
    return {isPlaying, title, artist, duration, albumCover}
  } catch(error) {
    return { error: error.message.toString() };
  }
}