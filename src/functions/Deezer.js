import { IsEmpty } from './Utils';

const cache = new Map();

async function getData(artist, track) {
  if (!artist || !track)
    return null;

  const params = new URLSearchParams({
    artist,
    track
  });

  try {
    const response = await fetch(
      `/.netlify/functions/deezer-data?${params}`
    );

    if (!response.ok)
      return null;

    return await response.json();

  } catch {
    return null;
  }
}


export function getCachedData(artist, title) {
  if (IsEmpty(artist) || IsEmpty(title))
    return Promise.resolve(null);

  const key = `${artist}|${title}`
    .toLowerCase()
    .trim();

  if (cache.has(key))
    return cache.get(key);

  const promise = getData(
    artist,
    title
  );
  cache.set(key, promise);
  return promise
}