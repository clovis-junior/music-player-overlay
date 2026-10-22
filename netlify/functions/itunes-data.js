const REGIONS = ['US', 'GB', 'JP', 'KR', 'BR', 'DE', 'FR'];
const ASIAN_CHARS_REGEX = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uffef\u4e00-\u9faf\u3400-\u4dbf\uac00-\ud7af]/;

export async function handler(event) {
  const params = new URLSearchParams(event.queryStringParameters);

  const artist = params.get('artist');
  const track = params.get('track');
  const album = params.get('album');

  if (!artist || !track) {
    return {
      statusCode: 400,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Missing metadata' })
    }
  }

  const activeRegions = [...REGIONS];
  if (ASIAN_CHARS_REGEX.test(artist + track)) {
    ['KR', 'JP'].forEach(country => {
      const index = activeRegions.indexOf(country);
      if (index > -1) {
        activeRegions.splice(index, 1);
        activeRegions.unshift(country);
      }
    })
  }

  const cleanTrack = track?.replace(/(\[.*?\]|\(.*?\))/g, '')?.replace(/ft\..*|feat\..*/i, '')?.trim();
  const cleanArtist = artist.split('/')?.[0]?.split(',')?.[0]?.trim();
  const cleanAlbum = album ? album.replace(/(\[.*?\]|\(.*?\))/g, '')?.replace(/Deluxe|Remastered|Special|Edition/i, '')?.trim() : '';

  async function searchAcrossRegions(term, regions) {
    const promises = regions.map(async (country) => {
      const query = new URLSearchParams({ term, country, entity: 'song', limit: 3 });
      try {
        const res = await fetch(`https://itunes.apple.com/search?${query.toString()}`);

        if (!res.ok) return [];

        const data = await res.json();
        return data?.results || []
      } catch {
        return []
      }
    });

    const responses = await Promise.all(promises);
    return responses.flat()
  }

  try {
    let results = [];

    if (cleanAlbum) {
      const strictTerm = `${cleanArtist} ${cleanTrack} ${cleanAlbum}`;
      results = await searchAcrossRegions(strictTerm, activeRegions);
    }

    if (results.length === 0) {
      const focusedTerm = `${cleanArtist} ${cleanTrack}`;
      results = await searchAcrossRegions(focusedTerm, activeRegions);
    }

    if (results.length === 0)
      results = await searchAcrossRegions(cleanTrack, activeRegions);

    if (results.length === 0) {
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify(null)
      }
    }

    const bestMatch = results.reduce((best, current) => {
      let currentScore = 0;
      
      if (current.trackName?.toLowerCase().includes(cleanTrack.toLowerCase())) currentScore += 5;
      if (current.artistName?.toLowerCase().includes(cleanArtist.toLowerCase())) currentScore += 4;
      if (cleanAlbum && current.collectionName?.toLowerCase().includes(cleanAlbum.toLowerCase())) currentScore += 3;

      current.score = currentScore;
      return (!best || currentScore > best.score) ? current : best;
    }, null);

    if (!bestMatch || bestMatch.score === 0) {
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify(null)
      }
    }

    const rawCover = bestMatch?.artworkUrl100 || '';
    const hdCover = rawCover.replace('100x100bb', '1200x1200bb');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        title: bestMatch?.trackName,
        artist: bestMatch?.artistName,
        album: bestMatch?.collectionName,
        albumCover: hdCover
      })
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message })
    }
  }
}
