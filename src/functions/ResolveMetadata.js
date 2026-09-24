import { getCachedMetadata as iTunesData } from './Itunes';
import { getCachedMetadata as deezerData } from './Deezer';
import { getCachedMetadata as lastFmData } from './LastFM';
import { IsEmpty } from './Utils';

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
  if (IsEmpty(track) || IsEmpty(artist))
    return null;

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

  return await response.json()
}