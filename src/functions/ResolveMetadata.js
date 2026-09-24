import { getCachedMetadata as iTunesData } from './Itunes';
import { getCachedMetadata as deezerData } from './Deezer';
import { getCachedMetadata as lastFmData } from './LastFM';

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
          albumCover: data?.albumCover,
          albumAnimatedCover: data?.albumAnimatedCover || null
        }
      }
    } catch {
      continue
    }
  }

  return null
}