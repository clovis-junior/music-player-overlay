//import fetch from 'node-fetch';

export async function handler(event) {
  const { clientID, clientSecret, refreshToken } = JSON.parse(event.body);

  if (!clientID || !clientSecret || !refreshToken)
    return { statusCode: 400, body: 'Missing the client credencials or refresh token.' };

  try {
    const token_response = await fetch('https://accounts.spotify.com/api/token', {
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

    if (!token_response)
      return { statusCode: 401, body: `Response status: ${token_response?.status}` };

    const token_data = await token_response.json();
    const accessToken = token_data?.access_token;

    const playing_response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await playing_response.json();

    return { statusCode: 200, body: JSON.stringify(data) }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify(err?.message?.toString()) }
  }
}
