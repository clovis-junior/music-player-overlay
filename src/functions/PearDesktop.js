import { GetURLParams, NormalizeMetadata } from './Utils';

import icon from '../assets/images/ytm-logo.png';

const appID = 'music-player-overlay';

const params = GetURLParams();

const host = params?.get('host') || 'localhost';
const port = params?.get('port') || 26538;
const token = params?.get('token');

const baseURL = `http://${host}:${port}`;

export async function RequestToken() {
  try {
    const response = await fetch(`${baseURL}/auth/${encodeURIComponent(appID)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: appID })
    });

    const data = await response.json();

    if (data.accessToken)
      return { token: data.accessToken };

    return data
  } catch (e) {
    console.error(`Error on Request Token: ${e.message}`);
    return { statusCode: '?', message: e.message };
  }
}

function UpdatePlayerData(data, currentData) {
  if (!data || data.error) return data;

  if (data.type === 'PLAYER_STATE_CHANGED') {
    const isPlaying = Boolean(data.isPlaying);
    const elapsed = Number(data.position ?? currentData?.duration?.elapsed ?? 0);
    const total = Number(currentData?.duration?.total ?? 0);

    return {
      ...currentData,
      isPlaying,
      duration: {
        elapsed,
        remaining: Math.max(0, total - elapsed),
        total
      }
    }
  }

  if (data.type === 'POSITION_CHANGED' || (data.position !== undefined && !data.song)) {
    const elapsed = Number(data.position ?? 0);
    const total = Number(currentData?.duration?.total ?? 0);

    return {
      ...currentData,
      duration: {
        elapsed,
        remaining: Math.max(0, total - elapsed),
        total
      }
    }
  }

  const song = data?.song || {};
  const meta = NormalizeMetadata(song?.artist, song?.title);

  const isPlaying = data?.isPlaying !== undefined 
    ? Boolean(data.isPlaying && !song?.isPaused) 
    : !song?.isPaused;

  const title = meta?.track || song?.title || '';
  const artist = meta?.artist || song?.artist || '';
  const albumCover = song?.imageSrc || null;

  const elapsed = Number(data?.position ?? song?.elapsedSeconds ?? 0);
  const total = Number(song?.songDuration ?? 0);

  const duration = {
    elapsed,
    remaining: Math.max(0, total - elapsed),
    total
  }

  return { isPlaying, title, artist, duration, albumCover }
}

export default {
  id: 'pear-desktop',
  icon,

  connect({ onConnect, onDisconnect, onData }) {
    let ws = null;
    let reconnectTimeout = null;
    let isIntentionallyClosed = false;
    let lastState = null;

    const connectWebSocket = () => {
      const wsUrl = `ws://${host}:${port}/api/v1/ws?token=${encodeURIComponent(token || '')}`;

      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log(`Connected to Pear Desktop WS on port ${port}`);
          onConnect?.()
        };

        ws.onmessage = (event) => {
          try {
            const parsedData = JSON.parse(event.data);

            console.log('[Pear Desktop WS Payload]:', parsedData);

            const data = UpdatePlayerData(parsedData, lastState);

            if (!data || data?.error) return;

            lastState = data;

            onData?.(current => {
              const next = data;

              const sameMetadata =
                current?.title === next?.title &&
                current?.artist === next?.artist &&
                current?.albumCover === next?.albumCover;

              const samePlaybackState =
                current?.isPlaying === next?.isPlaying &&
                current?.duration?.elapsed === next?.duration?.elapsed &&
                current?.duration?.remaining === next?.duration?.remaining &&
                current?.duration?.total === next?.duration?.total;

              return (sameMetadata && samePlaybackState) ? current : next
            });
          } catch (err) {
            console.error('[Pear Desktop] Error parsing WS payload:', err)
          }
        };

        ws.onerror = (err) => {
          console.error('[Pear Desktop] Connection error:', err.message || err);
        };

        ws.onclose = () => {
          console.log('Disconnected to Pear Desktop... Reconnecting...');
          onDisconnect?.();

          if (!isIntentionallyClosed)
            reconnectTimeout = setTimeout(connectWebSocket, 3000);
        }
      } catch (e) {
        console.error(e.message);
        if (!isIntentionallyClosed) {
          reconnectTimeout = setTimeout(connectWebSocket, 3000);
        }
      }
    };

    connectWebSocket();

    return () => {
      isIntentionallyClosed = true;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    }
  }
}