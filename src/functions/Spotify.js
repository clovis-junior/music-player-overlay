import { GetURLParams } from './Utils.js';
import icon from '../assets/images/spotify-logo.png';

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

        if (response.status !== 200)
            return { error: response?.text.toString() }

        return await response.json();
    } catch (err) {
        console.error(err?.message.toString());
        return { error: err?.message.toString() }
    }
}

function UpdatePlayerData(data) {
    if (!data || data?.error) return data;

    const isPlaying = data?.is_playing || false;
    const type = data?.currently_playing_type;
    const title = data?.item?.name || '';
    const artist = data?.item?.artists?.map(artist => artist?.name)?.join(', ') || '';
    const albumCover = data?.item?.album?.images?.[0]?.url || '';
    const duration = {
        elapsed: (data?.progress_ms / 1000) || 0,
        remaining: ((data?.item?.duration_ms - data?.progress_ms) / 1000) || 0,
        total: (data?.item?.duration_ms / 1000) || 0
    };

    return { isPlaying, type, title, artist, duration, albumCover };
}

async function GetData() {
    try {
        const response = await fetch('/.netlify/functions/spotify-your', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clientID, clientSecret, refreshToken }),
        });

        const data = await response.json();

        switch (response?.status) {
            case 401:
                await new Promise(resolve => setTimeout(resolve, 5000));
                return GetData();
            case 200:
                return data;
            case 400:
            case 404:
            default:
                return { error: data?.error || JSON.stringify(data) };
        }
    } catch (error) {
        return { error: error?.message || 'Unknown error' }
    }
}

export default {
    id: 'spotify',
    icon,

    connect({ onConnect, onDisconnect, onData }) {
        let cancelled = false;

        async function getMusicData() {
            const data = await GetData();

            if (cancelled) return;

            if (data?.error) {
                onDisconnect?.(data);
                return;
            }

            onConnect?.();
            onData?.(current => UpdatePlayerData(data, current));
        }

        getMusicData();

        const check = setInterval(() => getMusicData(), 2250);

        return () => {
            cancelled = true;
            clearInterval(check);
        };
    }
}
