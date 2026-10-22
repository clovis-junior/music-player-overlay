
import { IsEmpty } from './Utils';

const cache = new Map();
const pending = new Map();

const CACHE_TTL = 5 * 60 * 1000;
const MAX_CACHE_SIZE = 300;

function cleanMetadata(value = '') {
  return value
    .replace(/\[.*?\]|\(.*?\)/g, ' ')
    .replace(/\b(?:ft|feat)\.?\s+.*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalize(value = '') {
  return value
    .normalize('NFKC')
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, '');
}

function getAlbumCover(images = []) {
  const preferredSizes = ['mega', 'extralarge', 'large', 'medium'];

  for (const size of preferredSizes) {
    const image = images.find(
      item => item?.size === size && item?.['#text']?.trim()
    );

    if (image) return image['#text'].trim();
  }

  const lastImage = [...images]
    .reverse()
    .find(item => item?.['#text']?.trim());

  return lastImage?.['#text']?.trim() || null;
}

async function getMetadata(artist, track) {
  if (IsEmpty(artist) || IsEmpty(track)) return null;

  const cleanArtist = cleanMetadata(
    artist.split('/')[0].split(',')[0]
  );

  const cleanTrack = cleanMetadata(track);

  if (!cleanArtist || !cleanTrack) return null;

  const apiKey = import.meta.env.VITE_LASTFM_API_KEY;

  if (!apiKey) {
    console.warn('Last.fm: VITE_LASTFM_API_KEY não está configurada.');
    return null;
  }

  const searchAttempts = [
    { artist: cleanArtist, track: cleanTrack },
    { artist: artist.trim(), track: track.trim() }
  ];

  const uniqueAttempts = [
    ...new Map(
      searchAttempts.map(item => [
        `${normalize(item.artist)}|${normalize(item.track)}`,
        item
      ])
    ).values()
  ];

  for (const attempt of uniqueAttempts) {
    const params = new URLSearchParams({
      method: 'track.getInfo',
      artist: attempt.artist,
      track: attempt.track,
      api_key: apiKey,
      autocorrect: '1',
      format: 'json'
    });

    try {
      const response = await fetch(
        `https://ws.audioscrobbler.com/2.0/?${params.toString()}`
      );

      if (!response.ok) continue;

      const data = await response.json();
      const info = data?.track;

      if (!info || data?.error) continue;

      const title = info?.name?.trim() || track.trim();
      const resolvedArtist =
        info?.artist?.name?.trim() || artist.trim();
      const album = info?.album?.title?.trim() || '';
      const albumCover = getAlbumCover(info?.album?.image || []);

      return {
        title,
        artist: resolvedArtist,
        album,
        albumCover
      };
    } catch {
      // Tenta a próxima variante de pesquisa.
    }
  }

  return null;
}

export function getCachedMetadata(artist, title) {
  if (IsEmpty(artist) || IsEmpty(title)) {
    return Promise.resolve(null);
  }

  const key = `${normalize(artist)}|${normalize(title)}`;
  const cached = cache.get(key);

  if (cached && cached.expiresAt > Date.now()) {
    cache.delete(key);
    cache.set(key, cached);
    return Promise.resolve(cached.value);
  }

  if (cached) cache.delete(key);

  if (pending.has(key)) {
    return pending.get(key);
  }

  const promise = getMetadata(artist, title)
    .then(data => {
      if (!data) return null;

      cache.delete(key);
      cache.set(key, {
        value: data,
        expiresAt: Date.now() + CACHE_TTL
      });

      while (cache.size > MAX_CACHE_SIZE) {
        cache.delete(cache.keys().next().value);
      }

      return data;
    })
    .catch(() => null)
    .finally(() => {
      pending.delete(key);
    });

  pending.set(key, promise);
  return promise;
}
