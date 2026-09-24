import { IsEmpty } from './Utils';

const cache = new Map();

async function getMetadata(artist, track, album) {
  if (IsEmpty(artist) || IsEmpty(track))
    return null;

  const params = new URLSearchParams({
    artist, track, album
  });

  try {
    const response = await fetch(
      `/.netlify/functions/itunes-data?${params}`
    );

    if (!response.ok)
      return null;

    return await response.json()
  } catch {
    return null
  }
}

export function getCachedMetadata(artist, title, album) {
  if (IsEmpty(artist) || IsEmpty(title))
    return Promise.resolve(null);

  const key = `${artist}|${title}`
    .toLowerCase()
    .trim();

  if (cache.has(key))
    return cache.get(key);

  const promise = getMetadata(
    artist,
    title,
    album
  );
  cache.set(key, promise);
  return promise
}