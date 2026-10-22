import { getCachedMetadata as iTunesData } from './Itunes';
import { getCachedMetadata as deezerData } from './Deezer';
import { getCachedMetadata as lastFmData } from './LastFM';
import { IsEmpty } from './Utils';

const cache = new Map();
const providers = [iTunesData, deezerData, lastFmData];

export async function ResolveMetadata(artist, track, album) {
  if (IsEmpty(artist) || IsEmpty(track)) return null;

  const cleanReqTrack = track.toLowerCase().trim();
  const cleanReqArtist = artist.toLowerCase().trim();

  const promises = providers.map(async (fetchMetadata) => {
    try {
      const data = await fetchMetadata(artist, track, album);
      if (!data || !data.title || !data.artist) return null;

      const resTrack = data.title.toLowerCase().trim();
      const resArtist = data.artist.toLowerCase().trim();

      let score = 0;

      if (resTrack.includes(cleanReqTrack) || cleanReqTrack.includes(resTrack))
        score += 5;

      if (resArtist.includes(cleanReqArtist) || cleanReqArtist.includes(resArtist))
        score += 4;

      if (score < 5) return null;

      return { ...data, score }
    } catch {
      return null
    }
  });

  const results = await Promise.all(promises);
  const validResults = results.filter(Boolean);

  if (validResults.length <= 0)
    return null;

  validResults.sort((a, b) => b.score - a.score);
  const bestMatch = validResults[0];

  return {
    title: bestMatch.title,
    artist: bestMatch.artist,
    album: bestMatch.album,
    albumCover: bestMatch.albumCover
  }
}

export async function GetAlbumCoverAnimated(track, artist, album) {
  if (IsEmpty(track) || IsEmpty(artist) || IsEmpty(album))
    return null;

  const key = `${artist}|${track}|${album}`
    .toLowerCase()
    .trim();

  if (cache.has(key))
    return cache.get(key);

  const params = new URLSearchParams({
    artist: artist,
    album: album,
    track: track
  });

  const response = await fetch(
    `/.netlify/functions/artwork?${params}`
  );
  
  if (!response.ok)
    return null;

  const data = await response.json();

  cache.set(key, data);
  return data
}
