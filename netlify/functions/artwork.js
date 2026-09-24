export async function handler(event) {
  const params = new URLSearchParams(event.queryStringParameters);

  const artist = params.get('artist');
  const track = params.get('track');
  const album = params.get('album');

  if (!artist || !track || !album) {
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

    if (!result || result.error)
      return { statusCode: 200, body: JSON.stringify(null) };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(result)
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    }
  }
}