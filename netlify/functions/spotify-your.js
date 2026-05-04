import { Buffer } from 'node:buffer';
import fetch from 'node-fetch';

var accessToken;

export async function handler(request) {
  if (!request?.body)
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify('Not found')
    };

  try {
    const { clientID, clientSecret, refreshToken } = JSON.parse(request.body);

    if (!clientID || !clientSecret || !refreshToken)
      return { statusCode: 400, body: 'Missing the client credencials or refresh token.' };

    return await GetCurrentPlaying(clientID, clientSecret, refreshToken);
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify(err.message) };
  }
}

async function GetAccessToken(clientID, clientSecret, refreshToken) {
  if (!clientID || !clientSecret || !refreshToken)
    return { statusCode: 400, body: 'Missing the client credencials or refresh token.' };

  try {
    const auth = Buffer.from(`${clientID}:${clientSecret}`).toString('base64');
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'grant_type': 'refresh_token',
        'refresh_token': refreshToken
      })
    });

    if (!response)
      return {
        statusCode: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify(`An error ocurred trying to get token. Status Code: ${response?.status}`)
      };

    const data = await response.json();

    accessToken = data.access_token;

    return await GetCurrentPlaying(clientID, clientSecret, refreshToken);
  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify(err?.message)
    }
  }
}

async function GetCurrentPlaying(clientID, clientSecret, refreshToken) {
  if (!accessToken)
    return await GetAccessToken(clientID, clientSecret, refreshToken);

  try {
    const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 204)
      return { statusCode: 200, body: JSON.stringify({ is_playing: false }) };

    if (response.status === 401)
      return await GetAccessToken(clientID, clientSecret, refreshToken);

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify(data)
    }
  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify(err?.message)
    }
  }
}
