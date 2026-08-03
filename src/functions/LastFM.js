import { IsEmpty } from './Utils';

const coverCache = new Map();

async function getAlbumCover(artist, track) {
  const params = new URLSearchParams({
    method: 'track.getInfo',
    artist, track,
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

    const images = data?.track?.album?.image ?? [];

    return (
      images.find(i => i.size === 'mega')?.['#text'] ||
      images.find(i => i.size === 'extralarge')?.['#text'] ||
      images.find(i => i.size === 'large')?.['#text'] ||
      null
    )
  } catch {
    return null
  }
}

export async function getCachedAlbumCover(artist, title) {
  if (IsEmpty(artist) || IsEmpty(title))
    return null;

  const key = `${artist}|${title}`
    .toLowerCase()
    .trim();
    
  if (coverCache.has(key))
    return coverCache.get(key);

  const cover = await getAlbumCover(artist, title);
  coverCache.set(key, cover);

  return cover
}