import { Buffer } from 'node:buffer';
import fetch from 'node-fetch';

export async function handler(request) {
  if (!request?.body) {
    return {
      statusCode: 400,
      headers: corsHeaders(),
      body: JSON.stringify('Missing request body')
    };
  }

  try {
    const { clientID, clientSecret, refreshToken } = JSON.parse(request.body);

    if (!clientID || !clientSecret || !refreshToken) {
      return {
        statusCode: 400,
        headers: corsHeaders(),
        body: JSON.stringify('Missing credentials or refresh token.')
      };
    }

    const accessToken = await GetAccessToken(
      clientID,
      clientSecret,
      refreshToken
    );

    return await GetCurrentPlaying(accessToken);
  } catch (err) {
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify(err?.message)
    };
  }
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

async function GetAccessToken(clientID, clientSecret, refreshToken) {
  const auth = Buffer.from(
    `${clientID}:${clientSecret}`
  ).toString('base64');

  const response = await fetch(
    'https://accounts.spotify.com/api/token',
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      })
    }
  );

  if (!response.ok) {
    throw new Error(
      `Could not get access token (${response.status})`
    );
  }

  const data = await response.json();

  return data.access_token;
}

async function GetCurrentPlaying(accessToken) {
  const response = await fetch(
    'https://api.spotify.com/v1/me/player',
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );

  if (response.status === 204) {
    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({
        is_playing: false
      })
    };
  }

  if (!response.ok) {
    return {
      statusCode: response.status,
      headers: corsHeaders(),
      body: JSON.stringify(
        `Spotify API error (${response.status})`
      )
    };
  }

  const data = await response.json();

  return {
    statusCode: 200,
    headers: corsHeaders(),
    body: JSON.stringify(data)
  };
}