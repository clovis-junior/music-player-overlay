import { IsEmpty } from './Utils';

const cache = new Map();

async function getMetadata(artist, track) {
  if (IsEmpty(artist) || IsEmpty(track))
    return null;

  const params = new URLSearchParams({
    method: 'track.getInfo',
    artist: artist.trim(),
    track: track.trim(),
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
      images[images.length - 1]?.['#text'] || null;

    const validCover = (albumCover && albumCover.trim() !== '') ? albumCover : null;

    return {
      title: info?.name || track,
      artist: info?.artist?.name || artist,
      album: info?.album?.title || '',
      albumCover: validCover
    };

  } catch {
    return null;
  }
}

export function getCachedMetadata(artist, title) {
  if (IsEmpty(artist) || IsEmpty(title))
    return Promise.resolve(null);

  const key = `${artist}|${title}`
    .toLowerCase()
    .trim();

  if (cache.has(key))
    return cache.get(key);

  const promise = getMetadata(artist, title);
  cache.set(key, promise);

  return promise
}