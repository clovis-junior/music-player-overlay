import { getCachedMetadata as iTunesData } from './Itunes';
import { getCachedMetadata as deezerData } from './Deezer';
import { getCachedMetadata as lastFmData } from './LastFM';

const providers = [iTunesData, deezerData, lastFmData];

export async function ResolveMetadata(artist, track) {
  for (const fetchMetadata of providers) {
    try {
      const data = await fetchMetadata(artist, track);

      if (data) {
        return {
          title: data.title,
          artist: data.artist,
          album: data.album,
          albumCover: data.albumCover
        }
      }
    } catch {
      continue
    }
  }

  return null
}