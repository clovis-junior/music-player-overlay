import { useState } from 'react'
import { browserURL, Success } from './Platform'
import { RequestCode, RequestToken } from '../functions/YoutubeMusic'

import Alert from '../components/Alert'
import AsyncImage from '../components/AsyncImage'

import styles from '../assets/scss/dashboard.module.scss'

import YouTubeMusicLogo from '../assets/images/ytm-logo.png'

function ShowAlert({ response, loading, step }) {
    if (loading && step === 'requesting-code') {
        return (
            <Alert type="info">
                <p>Requesting an authorization code from YouTube Music Desktop...</p>
            </Alert>
        );
    }

    if (loading && step === 'sending-notification') {
        return (
            <Alert type="info">
                <p>Authorization code received.</p>
                <p>Sending the notification to YouTube Music Desktop...</p>
                {response?.code && (
                    <p>Your auth code: <strong>{response.code}</strong></p>
                )}
            </Alert>
        );
    }

    if (response?.code && !response?.token) {
        return (
            <Alert type="info">
                <p>Check YouTube Music Desktop and allow the connection.</p>
                <p>Your auth code: <strong>{response.code}</strong></p>
            </Alert>
        );
    }

    if (response?.statusCode) {
        return (
            <Alert type="error">
                {response?.message}
            </Alert>
        );
    }

    return null;
}

function Auth({ response, setResponse }) {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState('');

    async function RequestAccessCode() {
        try {
            setLoading(true);
            setStep('requesting-code');

            const codeResponse = await RequestCode();
            setResponse(codeResponse);

            if (codeResponse?.code) {
                setStep('sending-notification');

                const tokenResponse = await RequestToken(codeResponse.code);
                setResponse(tokenResponse);
            }
        } catch (error) {
            setResponse({
                statusCode: 500,
                message: error?.message || 'Could not connect to YouTube Music Desktop.'
            });
        } finally {
            setLoading(false);
            setStep('');
        }
    }

    return (
        <>
            {(response || loading) && (
                <div className={styles.panel_content}>
                    <ShowAlert response={response} loading={loading} step={step} />
                </div>
            )}

            <footer className={`${styles.btns} ${styles.column} ${styles.centered}`}>
                <button
                    type="button"
                    className={`${styles.btn} ${styles.ytm}`}
                    onClick={RequestAccessCode}
                    disabled={loading}
                >
                    {loading ? 'Connecting...' : 'Connect to YouTube Music Desktop'}
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
    )
}

function Instructions() {
    return (
        <div className={styles.panel_content}>
            <p>
                You need to download YouTube Music Desktop,
                <a rel="noopener noreferrer" href="https://ytmdesktop.app/" target="_blank">click here</a>.
            </p>
            <p>After downloading it, follow these instructions:</p>
            <ul>
                <li>Open <b>YouTube Music Desktop</b></li>
                <li>
                    Go to <b>Settings &gt; Integrations &gt; Companion Server</b> and enable a Companion.
                    Make sure the following options are turned on:
                    <ol>
                        <li><b>Companion Server</b></li>
                        <li><b>Allow browser communication</b></li>
                        <li><b>Enable companion authorization</b></li>
                    </ol>
                </li>
                <li>Click the button below to connect.</li>
            </ul>
        </div>
    )
}

export default function YouTubeMusic() {
    const [response, setResponse] = useState(null);

    return (
        <main className={styles.panel}>
            <figure>
                <AsyncImage
                    className={styles.platform_logo}
                    src={YouTubeMusicLogo}
                    alt="YouTube Music Logo"
                />
            </figure>

            {response?.token ? (
                <Success url={`${browserURL}player?platform=youtube-music&token=${response.token}`} />
            ) : (
                <>
                    <Instructions />
                    <Auth response={response} setResponse={setResponse} />
                </>
            )}
        </main>
    )
}