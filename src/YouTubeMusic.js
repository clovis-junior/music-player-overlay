export async function GetDataFromYouTubeMusic() {
    const response = await fetch('http://192.168.15.152:9863/query', {
      method: 'GET'
    });
  
    if(!response || response.status !== 200)
      return { error: 'Access denied or invalid' };
  
    const data = await response.json();
    const isPlaying = !data.player.isPaused;
    const title = data.track.title;
    const artist = data.track.author;
    const duration = {
      elapsed: Math.round(data.player.seekbarCurrentPosition) || 0,
      percentage: (data.player.seekbarCurrentPosition * 100) / data.track.duration,
      remaining: Math.round(data.track.duration - data.player.seekbarCurrentPosition),
      total: Math.round(data.track.duration) || 0
    };
    const albumCover = data.track.cover;
  
    return {isPlaying, title, artist, duration, albumCover}
}