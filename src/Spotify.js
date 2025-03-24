// import songData from'./Spotify.test.json';
import { GetURLParams } from './Utils';

const client_id = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const client_secret = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET;

var request = null;

async function GetAccessToken() {
    const params = GetURLParams();

    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${btoa(`${client_id}:${client_secret}`)}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            'grant_type': 'authorization_code',
            'redirect_uri': 'http://localhost',
            'code': params.code
        })
    });

    return await response.json()
}

export async function GetDataFromSpotify() {
    if(!request)
        request = await GetAccessToken();

    const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: {
            'Authorization': `Bearer ${request.access_token}`
        }
    });

    if(!response || response.status !== 200)
        return { error: 'Access denied or invalid' };

    const data = await response.json() /*songData*/;

    console.log(data.item);

    const isPlaying = data.item.isPlaying;
    const title = data.item.name;
    const artist = data.item.artists.map((artist) => artist.name).join(', ');
    const duration = {
        elapsed: Math.round(data.progress_ms / 1000) || 0,
        percentage: (data.progress_ms * 100) / data.item.duration_ms || 0,
        remaining: Math.round((data.item.duration_ms - data.progress_ms) / 1000) || 0,
        total: Math.round(data.item.duration_ms / 1000) || 0
    };
    const albumCover = data.item.album.images[0].url;

    return {isPlaying, title, artist, duration, albumCover}
}