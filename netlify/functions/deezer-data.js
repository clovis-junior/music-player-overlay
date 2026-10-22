export async function handler(event) {
  const params = new URLSearchParams(event.queryStringParameters);

  const artist = params.get('artist');
  const track = params.get('track');

  if (!artist || !track) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Missing metadata'
      })
    }
  }

  const cleanTrack = track
    ?.replace(/(\[.*?\]|\(.*?\))/g, '')
    ?.replace(/ft\..*|feat\..*/i, '')
    ?.trim();

  const cleanArtist = artist.split('/')?.[0]?.split(',')?.[0]?.trim();

  try {
    const query = encodeURIComponent(
      `${cleanArtist} ${cleanTrack}`
    );

    const response = await fetch(
      `https://api.deezer.com/search?q=${query}`
    );

    const data = await response.json();
    const results = data?.data || [];

    if (results.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify(null)
      }
    }

    const bestMatch = results.reduce((best, current) => {
      let currentScore = 0;
      
      if (current.title?.toLowerCase().includes(cleanTrack.toLowerCase())) currentScore += 5;
      if (current.artist?.name?.toLowerCase().includes(cleanArtist.toLowerCase())) currentScore += 4;

      current.score = currentScore;
      return (!best || currentScore > best.score) ? current : best
    }, null);

    if (!bestMatch || bestMatch.score === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify(null)
      }
    }

    const result = bestMatch;

    const artists = result?.contributors
      ?.map(artist => artist?.name)
      ?.filter(Boolean)?.join(', ') 
      || result?.artist?.name;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: result.title,
        artist: artists,
        album: result.album?.title,
        albumCover: result.album?.cover_xl
      })
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message
      })
    }
  }
}
