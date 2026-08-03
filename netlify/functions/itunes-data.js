export async function handler(event) {
  const params = new URLSearchParams(event.queryStringParameters);

  const artist = params.get('artist');
  const track = params.get('track');

  if (!artist || !track) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing metadata' })
    };
  }

  const cleanTrack = track
    ?.replace(/(\[.*?\]|\(.*?\))/g, '')
    ?.replace(/ft\..*|feat\..*/i, '')
    ?.trim();

  const cleanArtist = artist.split('/')?.[0]?.split(',')?.[0]?.trim();

  try {
    const query = encodeURIComponent(`${cleanArtist} ${cleanTrack}`);

    let response = await fetch(`https://itunes.apple.com/search?term=${query}&entity=song&limit=10`);
    let data = await response.json();
    let results = data?.results || [];

    if (results.length === 0) {
      response = await fetch(`https://itunes.apple.com/search?term=${query}&entity=song&country=JP&limit=10`);
      data = await response.json();
      results = data?.results || [];
    }

    if (results.length === 0) {
      const trackQuery = encodeURIComponent(cleanTrack);
      response = await fetch(`https://itunes.apple.com/search?term=${trackQuery}&entity=song&country=JP&limit=10`);
      data = await response.json();
      results = data?.results || [];
    }

    if (results.length === 0)
      return { statusCode: 200, body: JSON.stringify(null) };

    const bestMatch = results[0];

    const rawCover = bestMatch.artworkUrl100 || '';
    const hdCover = rawCover.replace('100x100bb', '1000x1000bb');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        title: bestMatch.trackName,
        artist: bestMatch.artistName,
        album: bestMatch.collectionName,
        albumCover: hdCover
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}