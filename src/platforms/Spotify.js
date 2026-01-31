import { GetURLParams } from '../Utils.js';

const params = GetURLParams();
const clientID = localStorage?.getItem('spotifyAppClientID') || params.get('clientID');
const clientSecret = localStorage?.getItem('spotifyAppClientSecret') || params.get('clientSecret');
const refreshToken = params.get('refreshToken');

export async function GetAccessToken() {
    try {
        const redirectURI = `${window.location.protocol}//${window.location.host}/`;

        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${btoa(`${clientID}:${clientSecret}`)}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                'grant_type': 'authorization_code',
                'code': params.get('code') || '',
                'redirect_uri': encodeURI(redirectURI),
                'client_id': clientID,
                'client_secret': clientSecret
            })
        });

        if(response.status !== 200)
            return { error: response?.text }
    
        return await response.json();
    } catch(ex) {
        console.error(ex?.message.toString());
        return { error: ex?.message.toString() }
    }
}

export function UpdatePlayerData(data) {
    if (data?.error) return data;

    const isPlaying = (data?.currently_playing_type === 'unknown') ? false : data?.is_playing || false;
    const title = data?.item?.name || '';
    const artist = data?.item?.artists.map((artist) => artist?.name).join(', ') || '';
    const albumCover = data?.item?.album.images[0].url || '';
    const duration = {
        elapsed: (data?.progress_ms / 1000) || 0,
        remaining: ((data?.item?.duration_ms - data?.progress_ms) / 1000) || 0,
        total: (data?.item?.duration_ms / 1000) || 0
    };

    return { isPlaying, title, artist, duration, albumCover };
}

export async function GetData() {
  const response = await fetch('/.netlify/functions/spotify-your', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientID, clientSecret, refreshToken }),
  });

  const data = await response.json();

  switch (response?.status) {
    case 401:
        return setTimeout(async () => await GetData(), 5000);
    case 200:
        return data;
    case 400:
    case 404:
    default:
        return { error: JSON.stringify(data) };
  }
}
