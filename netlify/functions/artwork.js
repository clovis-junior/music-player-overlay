export async function handler(event) {
  const params = new URLSearchParams(event.queryStringParameters);

  const artist = params.get('artist');
  const track = params.get('track');
  const album = params.get('album');

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
    const query = new URLSearchParams({
      s: cleanTrack,
      a: cleanArtist,
      al: album
    });

    const response = await fetch(`https://artwork.boidu.dev/?${query}`);
    const data = await response.json();
    const result = data;

    if (!result)
      return { statusCode: 200, body: JSON.stringify(null) };

    console.log(album);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        title: result?.name,
        artist: result?.artist,
        albumCover: result?.static,
        albumAnimatedCover: result?.animated || null
      })
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    }
  }
}