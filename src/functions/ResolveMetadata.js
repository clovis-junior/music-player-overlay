import { getCachedMetadata as deezerData } from './Deezer';
import { getCachedMetadata as lastFmData } from './LastFM';

export async function ResolveMetadata(artist, track) {
  let data = await deezerData(
    artist,
    track
  );

  if (data) {
    return {
      title: data.title,
      artist: data.artist,
      album: data.album,
      albumCover: data.albumCover
    };
  }

  data = await lastFmData(
    artist,
    track
  );

  if (data) {
    return {
      title: data.title,
      artist: data.artist,
      album: data.album,
      albumCover: data.albumCover
    };
  }

  return null
}