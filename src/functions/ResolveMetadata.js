import { getCachedMetadata as iTunesData } from './Itunes';
import { getCachedMetadata as deezerData } from './Deezer';
import { getCachedMetadata as lastFmData } from './LastFM';
import { IsEmpty } from './Utils';

const cache = new Map();
const providers = [iTunesData, deezerData, lastFmData];

export async function ResolveMetadata(artist, track, album) {
  for (const fetchMetadata of providers) {
    try {
      const data = await fetchMetadata(artist, track, album);

      if (data) {
        return {
          title: data?.title,
          artist: data?.artist,
          album: data?.album,
          albumCover: data?.albumCover
        }
      }
    } catch {
      continue
    }
  }

  return null
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
