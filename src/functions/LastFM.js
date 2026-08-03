import { IsEmpty } from './Utils';

const cache = new Map();


async function getMetadata(artist, track) {
  if (IsEmpty(artist) || IsEmpty(track))
    return null;

  const cleanTrack = track
    ?.replace(/(\[.*?\]|\(.*?\))/g, '')
    ?.replace(/ft\..*|feat\..*/i, '')
    ?.trim();

  const cleanArtist = artist.split('/')?.[0]?.split(',')?.[0]?.trim();

  const params = new URLSearchParams({
    method: 'track.getInfo',
    artist: cleanArtist,
    track: cleanTrack,
    api_key: import.meta.env.VITE_LASTFM_API_KEY,
    format: 'json'
  });

  try {
    const response = await fetch(
      `https://ws.audioscrobbler.com/2.0/?${params}`
    );

    if (!response.ok)
      return null;

    const data = await response.json();
    const info = data?.track;

    if (!info)
      return null;

    const images = info?.album?.image ?? [];
    const albumCover =
      images.find(i => i.size === 'mega')?.['#text'] ||
      images.find(i => i.size === 'extralarge')?.['#text'] ||
      images.find(i => i.size === 'large')?.['#text'] ||
      null;

    return {
      title: info?.name || '',
      artist: info?.artist?.name || '',
      // album: info?.album?.title || '',
      albumCover,
    }
  } catch {
    return null
  }
}


export async function getCachedMetadata(artist, title) {
  if (IsEmpty(artist) || IsEmpty(title))
    return null;

  const key = `${artist}|${title}`
    .toLowerCase()
    .trim();

  if (cache.has(key))
    return cache.get(key);

  const data = await getMetadata(
    artist,
    title
  );

  if (data)
    cache.set(key, data);

  return data
}