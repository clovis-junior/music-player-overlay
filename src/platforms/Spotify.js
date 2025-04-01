// import songData from'../Spotify.test.json';

const clientID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const clientSecret = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET;

const params = new URLSearchParams(window.location.search);

const refreshToken = localStorage.getItem('SpotifyRefreshToken') || params.get('refreshToken');
const accessToken = localStorage.getItem('SpotifyAccessToken') || params.get('accessToken');

export function GetAuthURL(uri = '', scopes = '', state = '') {
    const base = 'https://accounts.spotify.com/pt-BR/authorize';
    const params = new URLSearchParams({
        'response_type': 'code',
        'client_id': clientID,
        'redirect_uri': uri,
        'state': state,
        'show_dialog': true
    });

    return `${base}?${params}&scope=${encodeURIComponent(scopes)}`;
}

export async function GetAccessToken(code) {
    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${btoa(`${clientID}:${clientSecret}`)}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                'grant_type': 'authorization_code',
                'redirect_uri': 'http://localhost/',
                'code': code
            })
        });
    
        const data = await response.json();

        if(response.status === 200) {
            localStorage.setItem('SpotifyAccessToken', data.access_token);
            localStorage.setItem('SpotifyRefreshToken', data.refresh_token);
        }

        return data
    } catch(e) {
        console.error(e.message.toString());
        return { error: '?', error_description: e.message.toString()}
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
    
        return await GetDataFromSpotify(data.access_token)
    } catch(e) {
        console.error(e.message.toString());
        return false
    }
}

export function UpdatePlayerData(data) {
    const isPlaying = data?.is_playing;
    const title = data.item?.name;
    const artist = data.item?.artists.map((artist) => artist.name).join(', ');
    const albumCover = data.item?.album.images[data.item?.album.images.length - 1].url;
    const duration = {
        elapsed: (data?.progress_ms / 1000) || 0,
        percentage: (data?.progress_ms * 100) / data.item?.duration_ms || 0,
        remaining: ((data.item?.duration_ms - data?.progress_ms) / 1000) || 0,
        total: (data.item?.duration_ms / 1000) || 0
    };
  
    return {isPlaying, title, artist, duration, albumCover};
}

export async function GetDataFromSpotify() {
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
            return setTimeout(GetDataFromSpotify(), 5000);

        return await response.json()
    } catch(error) {
        console.log(error.message.toString());
    }
}
