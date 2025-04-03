// import songData from'../Spotify.test.json';
import { GetURLParams, GenerateRandomString } from "../Utils";

const clientID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const clientSecret = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET;

const params = GetURLParams();

var refreshToken = params.get('refreshToken');
var accessToken = null;

export function GetAuthURL(uri = '', scopes = '', state = GenerateRandomString()) {
    const base = 'https://accounts.spotify.com/pt-BR/authorize';
    const params = new URLSearchParams({
        'response_type': 'code',
        'client_id': clientID,
        'redirect_uri': uri,
        'show_dialog': true,
        //'state': state,
    });

    return `${base}?${params}&scope=${encodeURIComponent(scopes)}`;
}

export async function GetAccessToken(uri = '', code) {
    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${btoa(`${clientID}:${clientSecret}`)}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                'grant_type': 'authorization_code',
                'code': code,
                'redirect_uri': uri,
                'client_id': clientID,
                'client_secret': clientSecret
            })
        });
    
        const data = await response.json();

        if(!refreshToken)
            refreshToken = data.refresh_token;

        return data
    } catch(e) {
        console.error(e.message.toString());
        return { error: '?', error_description: e.message.toString() }
    }
}

async function RefreshAccessToken() {
    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                'grant_type': 'refresh_token',
                'refresh_token': refreshToken,
                'client_id': clientID
            })
        });
    
        if(response.status !== 200)
            return false;
    
        const data = await response.json();

        // refreshToken = data.refresh_token;
        accessToken = data.access_token;

        console.log(accessToken);
    
        return await GetData()
    } catch(e) {
        console.error(e.message.toString());
        return false
    }
}

export function UpdatePlayerData(data) {
    const isPlaying = data?.is_playing;
    const title = data.item?.name;
    const artist = data.item?.artists.map((artist) => artist.name).join(', ');
    const albumCover = data.item?.album.images[0].url;
    const duration = {
        elapsed: (data?.progress_ms / 1000) || 0,
        remaining: ((data.item?.duration_ms - data?.progress_ms) / 1000) || 0,
        total: (data.item?.duration_ms / 1000) || 0
    };
  
    return {isPlaying, title, artist, duration, albumCover};
}

export async function GetData() {
    try {
        const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
    
        if(response.status === 401)
            return await RefreshAccessToken();
    
        if(response.status === 429)
            return setTimeout(()=> GetData(), 5000);

        return await response.json()
    } catch(e) {
        console.error(e.message.toString());

        setTimeout(()=> GetData(), 3000);

        return { error: e.message.toString() }
    }
}
