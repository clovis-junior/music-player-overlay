function cleanMetadata(value = '') {
  return value
    .replace(/\[.*?\]|\(.*?\)/g, ' ')
    .replace(/\b(?:ft|feat)\.?\s+.*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalize(value = '') {
  return value
    .normalize('NFKC')
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, '');
}

function getScore(result, artist, track) {
  const expectedTrack = normalize(track);
  const expectedArtist = normalize(artist);
  const actualTrack = normalize(result.title || '');
  const actualArtist = normalize(result.artist?.name || '');

  let score = 0;

  if (actualTrack === expectedTrack) score += 10;
  else if (actualTrack.includes(expectedTrack)) score += 5;
  else if (expectedTrack.includes(actualTrack)) score += 2;

  if (actualArtist === expectedArtist) score += 10;
  else if (actualArtist.includes(expectedArtist)) score += 5;
  else if (expectedArtist.includes(actualArtist)) score += 2;

  if (
    expectedTrack.length > 0 &&
    !actualTrack.includes(expectedTrack) &&
    !expectedTrack.includes(actualTrack)
  )
    score -= 10;

  if (
    expectedArtist.length > 0 &&
    !actualArtist.includes(expectedArtist) &&
    !expectedArtist.includes(actualArtist)
  )
    score -= 10;

  return score
}

export async function handler(event) {
  const params = new URLSearchParams(event.queryStringParameters || {});

  const artist = params.get('artist')?.trim();
  const track = params.get('track')?.trim();
  const album = params.get('album')?.trim() || '';

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  };

  if (!artist || !track) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Missing metadata' })
    };
  }

  const cleanArtist = cleanMetadata(
    artist.split('/')[0].split(',')[0]
  );

  const cleanTrack = cleanMetadata(track);
  const cleanAlbum = cleanMetadata(album);

  const searchTerms = [
    `${cleanArtist} ${cleanTrack}`,
    `${artist} ${track}`
  ];

  if (cleanAlbum) {
    searchTerms.unshift(
      `${cleanArtist} ${cleanTrack} ${cleanAlbum}`
    );
  }

  const uniqueTerms = [...new Set(searchTerms.filter(Boolean))];

  try {
    let results = [];

    for (const term of uniqueTerms) {
      const query = new URLSearchParams({
        q: term,
        limit: '25'
      });

      const response = await fetch(
        `https://api.deezer.com/search?${query.toString()}`
      );

      if (!response.ok) continue;

      const data = await response.json();

      if (data?.error) continue;

      results = data?.data || [];

      if (results.length > 0) break;
    }

    if (results.length === 0) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(null)
      }
    }

    const rankedResults = results
      .map(result => ({
        result,
        score: getScore(result, cleanArtist, cleanTrack)
      }))
      .sort((a, b) => b.score - a.score);

    const bestMatch = rankedResults[0];

    if (!bestMatch || bestMatch.score < 10) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(null)
      }
    }

    const result = bestMatch.result;

    const contributors = result.contributors
      ?.map(contributor => contributor?.name)
      .filter(Boolean);

    const artists = contributors?.length
      ? contributors.join(', ')
      : result.artist?.name || cleanArtist;

    const albumCover =
      result.album?.cover_xl ||
      result.album?.cover_big ||
      result.album?.cover_medium ||
      result.album?.cover ||
      '';

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        title: result.title,
        artist: artists,
        album: result.album?.title || '',
        albumCover,
        source: 'deezer'
      })
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error.message
      })
    }
  }
}
