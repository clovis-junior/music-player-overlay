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
    };
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
    const result = data?.data?.[0];

    if (!result) {
      return {
        statusCode: 200,
        body: JSON.stringify(null)
      };
    }

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
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message
      })
    };
  }
}