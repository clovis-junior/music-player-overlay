import { getURLParams } from '../Utils';

const params = getURLParams();
const clientID = params.get('clientID');

var refreshToken;
var accessToken;

refreshToken = refreshToken || params.get('refreshToken');
accessToken =  accessToken || params.get('accessToken');

export async function GetAccessToken(uri = '', id = '', secret = '', code = '') {
    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${btoa(`${id}:${secret}`)}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                'grant_type': 'authorization_code',
                'code': code,
                'redirect_uri': uri,
                'client_id': id,
                'client_secret': secret
            })
        });
    
        const data = await response.json();

        if(response.status === 200) {
            accessToken = data.access_token;
            refreshToken = data.refresh_token;
        }

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
            return { error: '' }
    
        const data = await response.json();

        accessToken = data.access_token;
        refreshToken = data.refresh_token;
    
        return await GetData(accessToken)
    } catch(e) {
        console.error(e.message.toString());

        return { error: e.message.toString() }
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
            return setTimeout(GetData(), 5000);

        return await response.json()
    } catch(error) {
        console.log(error.message.toString());

        return { error: error.message.toString() }
    }
}