// import songData from'../Spotify.test.json';

const clientID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const clientSecret = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET;

const params = new URLSearchParams(window.location.search);

const refreshToken = localStorage.getItem('SpotifyRefreshToken') || params.get('refreshToken');
const accessToken = localStorage.getItem('SpotifyAccessToken') || params.get('accessToken');

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
                'redirect_uri': 'http://localhost',
                'code': code
            })
        });
    
        if(response.status !== 200)
            return {};
    
        const data = await response.json();

        localStorage.setItem('SpotifyAccessToken', data.access_token);
        localStorage.setItem('SpotifyRefreshToken', data.refresh_token);

        const tokens = {
            'access': data.access_token, 
            'refresh': data.refresh_token
        };

        return tokens
    } catch(err) {
        console.error(err.message.toString());
        return {}
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
            return;
    
        const data = await response.json();
    
        return await GetDataFromSpotify(data.access_token)
    } catch(err) {
        console.error(err.message.toString());
        return false
    }
}

export async function GetDataFromSpotify() {
    try {
        const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
    
        if(response.status === 401)
            return await RefreshAccessToken();
    
        if(response.status !== 200)
            return { error: 'Access denied' };
    
        const data = await response.json() /*songData*/;
    
        const isPlaying = data.is_playing;
        const title = data.item?.name;
        const artist = data.item?.artists.map((artist) => artist.name).join(', ');
        const albumCover = data.item?.album.images[0].url;
        const duration = {
            elapsed: parseInt(data.progress_ms / 1000) || 0,
            percentage: (data.progress_ms * 100) / data.item?.duration_ms || 0,
            remaining: parseInt((data.item.duration_ms - data.progress_ms) / 1000) || 0,
            total: parseInt(data.item?.duration_ms / 1000) || 0
        };
    
        return {isPlaying, title, artist, duration, albumCover}
    } catch(error) {
        return { error: error.message.toString() };
    }
}
