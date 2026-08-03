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

  try {
    const query = encodeURIComponent(
      `${artist} ${track}`
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

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: result.title,
        artist: result.artist?.name,
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