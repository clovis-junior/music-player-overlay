import { useEffect, useState } from 'react'
import { browserURL, Success } from './Platform'
import { GetAccessToken } from '../functions/Spotify'
import { IsEmpty } from '../functions/Utils'

import Alert from '../components/Alert'
import AsyncImage from '../components/AsyncImage'

import SpotifyIcon from '../assets/images/spotify-logo.png'
import styles from '../assets/scss/dashboard.module.scss'

function ShowAlert({ alert, loading, step }) {
    if (loading && step === 'authenticating') {
        return (
            <Alert type="info">
                <p>Authenticating with Spotify...</p>
            </Alert>
        );
    }

    if (loading && step === 'creating-player-url') {
        return (
            <Alert type="info">
                <p>Authentication completed.</p>
                <p>Generating your player URL...</p>
            </Alert>
        );
    }

    if (alert) {
        return (
            <Alert type={alert.type}>
                {alert.content}
            </Alert>
        );
    }

    return null;
}

function Instructions() {
    return (
        <div className={styles.panel_content}>
            <p>
                You need to create an app in your Spotify dashboard,{' '}
                <a
                    rel="noopener noreferrer"
                    href="https://developer.spotify.com/dashboard"
                    target="_blank"
                >
                    click here
                </a>.
            </p>

            <p>Follow the instructions:</p>

            <ul>
                <li>Click <b>Create App</b></li>
                <li>
                    Fill in the following details:
                    <ol>
                        <li>
                            <b>Redirect URIs</b> —{' '}
                            "<span className={styles.user_select_valid}>{browserURL}</span>"
                        </li>
                        <li>
                            <b>Which API/SDKs are you planning to use?</b> — check Web API
                        </li>
                    </ol>
                    The <b>App name</b> and <b>App description</b> can be whatever you want.
                </li>
                <li>
                    Click <b>Settings</b>.
                    <ol>
                        <li>Click <b>View client secret</b></li>
                        <li>Copy your <b>Client ID</b> and <b>Client Secret</b></li>
                    </ol>
                </li>
                <li>Fill in your Client ID and Client Secret.</li>
                <li>Click the <b>Authenticate</b> button below.</li>
            </ul>
        </div>
    );
}

function Auth({
    clientID,
    clientSecret,
    setClientID,
    setClientSecret,
    setAlert,
    setPlayerURLCreated,
    setPlayerParams
}) {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState('');

    function GetSpotifyAuthURL() {
        if (IsEmpty(clientID) || IsEmpty(clientSecret)) {
            setAlert({
                type: 'error',
                content: <p>Please fill in the Client ID and Client Secret.</p>
            });
            return;
        }

        localStorage.setItem('spotifyAppClientID', clientID);
        localStorage.setItem('spotifyAppClientSecret', clientSecret);

        const baseURL = 'https://accounts.spotify.com/pt-BR/authorize';
        const scopes = [
            'user-read-private',
            'user-read-email',
            'user-modify-playback-state',
            'user-read-playback-position',
            'user-library-read',
            'streaming',
            'user-read-playback-state',
            'user-read-recently-played',
            'playlist-read-private'
        ].join(' ');

        const urlParams = new URLSearchParams({
            client_id: clientID,
            scope: scopes,
            redirect_uri: browserURL,
            response_type: 'code',
            show_dialog: true
        });

        window.location.href = `${baseURL}?${urlParams.toString()}`;
    }

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const savedClientID = localStorage.getItem('spotifyAppClientID') || '';
        const savedClientSecret = localStorage.getItem('spotifyAppClientSecret') || '';

        async function authenticate() {
            try {
                setLoading(true);
                setStep('authenticating');

                const data = await GetAccessToken();

                if (data?.error) {
                    setAlert({
                        type: 'error',
                        content: <p>{data.error}</p>
                    });
                    return;
                }

                if (data?.refresh_token) {
                    setStep('creating-player-url');

                    const nextParams = new URLSearchParams({
                        clientID: savedClientID,
                        clientSecret: savedClientSecret,
                        refreshToken: data.refresh_token
                    });

                    setPlayerParams(nextParams.toString());
                    setPlayerURLCreated(true);
                }
            } catch (error) {
                setAlert({
                    type: 'error',
                    content: <p>{error?.message || 'Could not authenticate with Spotify.'}</p>
                });
            } finally {
                setLoading(false);
                setStep('');
            }
        }

        if (
            params.has('spotifyToken') &&
            !IsEmpty(savedClientID) &&
            !IsEmpty(savedClientSecret)
        ) {
            const nextParams = new URLSearchParams({
                token: params.get('spotifyToken')
            });

            setPlayerParams(nextParams.toString());
            setPlayerURLCreated(true);
            return;
        }

        if (
            params.has('code') &&
            !IsEmpty(savedClientID) &&
            !IsEmpty(savedClientSecret)
        ) {
            authenticate();
        }
    }, [setAlert, setPlayerParams, setPlayerURLCreated]);

    return (
        <>
            {(loading) && (
                <div className={styles.panel_content}>
                    <ShowAlert loading={loading} step={step} />
                </div>
            )}

            <footer className={`${styles.btns} ${styles.column} ${styles.centered}`}>
                <input
                    type="text"
                    className={`${styles.input_text} ${styles.full}`}
                    placeholder="Your Client ID"
                    value={clientID}
                    onChange={(e) => setClientID(e.target.value)}
                    disabled={loading}
                />

                <input
                    type="password"
                    className={`${styles.input_text} ${styles.full}`}
                    placeholder="Your Client Secret"
                    value={clientSecret}
                    onChange={(e) => setClientSecret(e.target.value)}
                    disabled={loading}
                />

                <button
                    type="button"
                    className={`${styles.btn} ${styles.spotify}`}
                    onClick={GetSpotifyAuthURL}
                    disabled={loading}
                >
                    {loading ? 'Authenticating...' : 'Authenticate'}
                </button>

                <button
                    type="button"
                    className={styles.btn}
                    onClick={() => window.history.back()}
                    disabled={loading}
                >
                    {loading ? 'Please wait...' : 'Back'}
                </button>
            </footer>
        </>
    );
}

export default function Spotify() {
    const [alert, setAlert] = useState(null);
    const [playerURLCreated, setPlayerURLCreated] = useState(false);
    const [playerParams, setPlayerParams] = useState('');
    const [clientID, setClientID] = useState(localStorage.getItem('spotifyAppClientID') || '');
    const [clientSecret, setClientSecret] = useState(localStorage.getItem('spotifyAppClientSecret') || '');

    return (
        <main className={styles.panel}>
            <figure>
                <AsyncImage
                    className={styles.platform_logo}
                    src={SpotifyIcon}
                    alt="Spotify Logo"
                />
            </figure>

            {playerURLCreated ? (
                <Success url={`${browserURL}player?platform=spotify&${playerParams}`} />
            ) : (
                <>
                    <Instructions />

                    {alert && (
                        <div className={styles.panel_content}>
                            <ShowAlert alert={alert} />
                        </div>
                    )}

                    <Auth
                        clientID={clientID}
                        clientSecret={clientSecret}
                        setClientID={setClientID}
                        setClientSecret={setClientSecret}
                        setAlert={setAlert}
                        setPlayerURLCreated={setPlayerURLCreated}
                        setPlayerParams={setPlayerParams}
                    />
                </>
            )}
        </main>
    );
}