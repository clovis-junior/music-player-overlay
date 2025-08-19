import { GetURLParams, IsEmpty } from '../Utils.js';

const params = GetURLParams();
const clientID = localStorage.getItem('spotifyAppClientID') || params.get('clientID') || '';
const clientSecret = localStorage.getItem('spotifyAppClientSecret') || params.get('clientSecret') || '';

var refreshToken = params.get('refreshToken') || '';
var accessToken;

export async function GetAccessToken() {
    try {
        const redirectURI = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;

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
            return { error: '' }
    
        return await response.json();
    } catch(e) {
        console.error(e.message.toString());
        return { error: e.message.toString() }
    }
}

async function RefreshAccessToken() {
    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${btoa(`${clientID}:${clientSecret}`)}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                'grant_type': 'refresh_token',
                'refresh_token': refreshToken
            })
        });
    
        if(response.status !== 200)
            return { error: response.text }
    
        const data = await response.json();

        // if (data.refresh_token)
        //     refreshToken = data.refresh_token;

        accessToken = data.access_token;
    
        return await GetData()
    } catch(e) {
        console.error(e.message.toString());

        return { error: e.message.toString() }
    }
}

export function UpdatePlayerData(data) {
    const isPlaying = data?.is_playing || false;
    const title = data.currently_playing_type !== 'unknown' ? data.item?.name : '';
    const artist = data.currently_playing_type !== 'unknown' ? data.item?.artists.map((artist) => artist.name).join(', ') : '';
    const albumCover = data.currently_playing_type !== 'unknown' ? data.item?.album.images[0].url : '';
    const duration = {
        elapsed: (data?.progress_ms / 1000) || 0,
        remaining: ((data.item?.duration_ms - data?.progress_ms) / 1000) || 0,
        total: (data.item?.duration_ms / 1000) || 0
    };
  
    return {isPlaying, title, artist, duration, albumCover};
}

export async function GetData() {
    if(IsEmpty(accessToken))
        return await RefreshAccessToken();
    
    try {
        const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if(!response || response.status === 429)
            return setTimeout(GetData(), 5000);
    
        if(response.status === 400 || response.status === 401)
            return await RefreshAccessToken();
    
        return await response.json()
    } catch(error) {
        console.log(error?.message?.toString());

        return { error: 'An error ocurred on trying to get player data.' }
    }
}