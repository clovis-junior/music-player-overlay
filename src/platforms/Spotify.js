// import songData from'../Spotify.test.json';
const inDevelopment = ((window.location.host === 'localhost' || 
    (!process.env.REACT_APP_ENV || process.env.REACT_APP_ENV)) === 'development');

const params = new URLSearchParams(window.location.hash.split('?')[1]);

const baseURL = inDevelopment ? 'http://localhost' : 'https://music-player-spotify-web-api.onrender.com';

const token = params.get('token');

export function UpdatePlayerData(data) {
    if (data.error) return data;

    if(data.currently_playing_type !== 'unknown') {
        const isPlaying = data?.is_playing;
        const title = data.item?.name;
        const artist = data.item?.artists.map((artist) => artist.name).join(', ');
        const albumCover = data.item?.album.images[0].url;
        const duration = {
            elapsed: (data?.progress_ms / 1000) || 0,
            remaining: ((data.item?.duration_ms - data?.progress_ms) / 1000) || 0,
            total: (data.item?.duration_ms / 1000) || 0
        };

        return { isPlaying, title, artist, duration, albumCover };
    }
}

export async function GetData() {
    try {
        const response = await fetch(`${baseURL}/player`, {
            method: 'GET',
            headers: {
                'user_token': token,
                'Content-Type': 'application/json'
            }
        });

        return await response.json()
    } catch (e) {
        console.error(e.message.toString());
        setTimeout(async () => await GetData(), 3000);

        return { error: e.message.toString() }
    }
}
