// import songData from'../Apple.test.json';
const url = '//192.168.15.152:10767';

function GetAlbumCover(url, size = 300) {
  const cover = url.replace('{w}', size)
      .replace('{h}', size);

  return cover
}

export async function GetDataFromAppleMusic() {
  try {
    const response = await fetch(`${url}/currentPlayingSong`);
  
    if(response.status !== 200)
      return { error: 'Access denied or invalid' };
    
    const data = await response.json() /*songData*/;

    const isPlaying = !data.info?.isPlaying;
    const title = data.info?.name;
    const artist = data.info?.artistName;
    const duration = {
      elapsed: parseInt(data.info?.currentPlaybackTime) || 0,
      percentage: (data.info?.currentPlaybackProgress * 100),
      remaining: parseInt((data.info?.durationInMillis * 100) - data.info?.currentPlaybackTime),
      total: parseInt(data.info?.durationInMillis / 1000) || 0
    };
    const albumCover = GetAlbumCover(data.info?.artwork.url, data.info?.artwork.width) || '';
    
    return {isPlaying, title, artist, duration, albumCover}
  } catch(error) {
    return { error: error.message.toString() };
  }
}