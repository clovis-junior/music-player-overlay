import { useRef, useState } from 'react';
import { inDevelopment } from '../App';
import { RequestCode, RequestToken } from '../platforms/YouTubeMusic';

import AsyncImage from '../components/AsyncImage';
import appleIcon from '../images/apple-music-icon.svg';
import spotifyLogo from '../images/spotify-logo.png';
import ytmLogo from '../images/ytm-logo.png';
import styles from '../scss/dashboard.module.scss';

const browserURL = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;

function Clipboard(text, element) {
    element?.select();

    try {
        window.navigator.clipboard?.writeText(text);

    } catch {
        document?.execCommand('copy');
    }

    return setTimeout(() => window.alert('URL has copied!'), 500)
}

function Alert(props) {
    if (!props.content)
        return;

    const classType = props?.type;

    return (
        <div className={`${styles.alert} ${styles[classType]}`}>{props?.content}</div>
    )
}

function YouTubeMusic() {
    const [response, setResponse] = useState(null);

    function Instructions() {
        return (
            <div className={styles.panel_content}>
                <p>You need download the YouTube Music Desktop, <a rel='noopener noreferrer' href='https://ytmdesktop.app/' target='_blank'>clicking here</a>.</p>
                <p>After downloaded, follow the instructions:</p>
                <ul>
                    <li>Open <b>YouTube Music Desktop</b></li>
                    <li>
                        Go to <b>Settings &gt; Integrations &gt; Companion Server</b> and activate a Companion, make sure the following options are turned on:
                        <ol>
                            <li><b>Companion Server</b></li>
                            <li><b>Allow browser</b> communication</li>
                            <li><b>Enable companion authorization</b></li>
                        </ol>
                    </li>
                    <li>Click on the button below to connect.</li>
                </ul>
            </div>
        )
    }

    function Auth() {
        async function RequestAccessCode(e) {
            e.target.disabled = true;

            const request = await RequestCode();

            setResponse(await request);
        }

        async function RequestAccessToken(e) {
            e.target.disabled = true;

            const request = await RequestToken(response?.code);

            setResponse(await request);
        }

        function ShowAlert(props) {
            if (props?.response?.code) {

                return (<Alert type='info' content={(
                    <>
                        <p>Allow the app on YouTube Desktop, click on the botton below.</p>
                        <p>Your auth code: <strong>{props?.response?.code}</strong></p>
                    </>
                )} />);
            }

            if (props?.response?.statusCode)
                return (<Alert type={props?.response?.statusCode ? 'error' : 'info'} content={props?.response?.message} />)


            return
        }

        return (
            <>
                <ShowAlert response={response} />
                <footer className={`${styles.btns} ${styles.column} ${styles.centered}`}>
                    {response?.code ? (
                        <>
                            <button type='button' className={`${styles.btn} ${styles.success}`} onClick={(e) => RequestAccessToken(e)}>Send the Notification</button>
                            <button type='button' className={styles.btn} onClick={() => window.history.back(-1)}>Cancel the Authentication</button>
                        </>
                    ) : (
                        <>
                            <button type='button' className={`${styles.btn} ${styles.ytm}`} onClick={(e) => RequestAccessCode(e)}>Connect to YouTube Music Desktop</button>
                            <button type='button' className={styles.btn} onClick={() => window.history.back(-1)}>Back</button>
                        </>
                    )}
                </footer>
            </>
        )
    }

    function Success(props) {
        const input = useRef(null);
        const playerURL = `${browserURL}#player?platform=youtube&token=${props?.token}`;

        return (
            <>
                <div className={styles.panel_content}>
                    <p>Now, you need to copy this URL and use it on you streaming software:</p>
                    <input ref={input} type='text' className={styles.input_text} value={playerURL} readOnly />
                    <b>Enjoy!</b>
                </div>
                <footer className={`${styles.btns} ${styles.centered}`}>
                    <button type='button' className={`${styles.btn} ${styles.success}`} onClick={() => Clipboard(playerURL, input?.current)}>Copy URL</button>
                    <button type='button' className={styles.btn} disabled>Costumize Player</button>
                    <button type='button' className={styles.btn} onClick={() => window.history.back(-1)}>Back</button>
                </footer>
            </>
        )
    }

    return (
        <main className={styles.panel}>
            <figure>
                <AsyncImage className={styles.platform_logo} src={ytmLogo} alt={'YouTube Music Logo'} />
            </figure>
            {response?.token ? (<Success token={response?.token} />) : (
                <>
                    <Instructions />
                    <Auth response={response} />
                </>
            )}
        </main>
    )
}

function Spotify() {
    const input = useRef(null);
    const params = new URLSearchParams(window.location.search);

    function Success(props) {
        const playerURL = `${browserURL}#player?platform=spotify&token=${props?.token}`;

        return (
            <>
                <div className={styles.panel_content}>
                    <p>Now, you need to copy this URL and use it on you streaming software:</p>
                    <input ref={input} type='text' className={styles.input_text} value={playerURL} readOnly />
                    <b>Enjoy!</b>
                </div>
                <footer className={styles.btns}>
                    <button type='button' className={`${styles.btn} ${styles.success}`} onClick={() => Clipboard(playerURL, input?.current)}>Copy URL</button>
                    <button type='button' className={styles.btn} disabled>Costumize Player</button>
                    <button type='button' className={styles.btn} onClick={() => window.history.back(-1)}>Back</button>
                </footer>
            </>
        )
    }

    function Auth() {
        function GetSpotifyAuthURL(e) {
            const baseURL = inDevelopment ? 'http://localhost' : 'https://music-player-spotify-web-api.onrender.com';
            e.target.disabled = true;

            return window.location.href = `${baseURL}/login`
        }

        return (
            <footer className={`${styles.btns} ${styles.centered}`}>
                <button type='button' className={`${styles.btn} ${styles.spotify}`} onClick={(e) => GetSpotifyAuthURL(e)}>Authenticate on Spotify now</button>
            </footer>
        )
    }

    return (
        <main className={styles.panel}>
            <figure>
                <AsyncImage className={styles.platform_logo} src={spotifyLogo} alt={'Spotify Logo'} />
            </figure>
            {params.has('spotifyToken') ? (<Success token={params.get('spotifyToken')} />) : (<Auth />)}
        </main>
    )
}

function AppleMusic() {
    const [session, setSession] = useState(null);

    function Instructions() {
        return (
            <>
                <div className={styles.panel_content}>
                    <p>You need download Cider (Version 2+), <a rel='noopener noreferrer' href='https://cider.sh/downloads/client' target='_blank'>clicking here</a>. <small>Which costs U$3,49</small></p>
                    <p>After downloaded, follow the instructions:</p>
                    <ul>
                        <li>Open <b>Cider</b></li>
                        <li>Go to <b>Settings &gt; Connectivity &gt; Websockets API</b> and activate it</li>
                        <li>Click on the button below to generate a url.</li>
                    </ul>
                </div>
                <footer className={`${styles.btns} ${styles.centered}`}>
                    <button type='button' className={`${styles.btn} ${styles.apple}`} onClick={() => setSession('url')}>Generate a Browser URL</button>
                </footer>
            </>
        )
    }

    function Success() {
        const input = useRef(null);
        const playerURL = `${browserURL}#player?platform=apple`;

        return (
            <>
                <div className={styles.panel_content}>
                    <p>Now, you need to copy this URL and use it on you streaming software:</p>
                    <input ref={input} type='text' className={styles.input_text} value={playerURL} readOnly />
                    <b>Enjoy!</b>
                </div>
                <footer className={styles.btns}>
                    <button type='button' className={`${styles.btn} ${styles.success}`} onClick={() => Clipboard(playerURL, input?.current)}>Copy URL</button>
                    <button type='button' className={styles.btn} disabled>Costumize Player</button>
                    <button type='button' className={styles.btn} onClick={() => window.history.back(-1)}>Back</button>
                </footer>
            </>
        )
    }

    return (
        <main className={styles.panel}>
            <figure>
                <AsyncImage className={styles.platform_logo} src={appleIcon} alt={'Apple Music Icon'} />
            </figure>
            {session ? <Success /> : <Instructions />}
        </main>
    )
}

export default function Auth(props) {
    const platform = props?.platform;

    function Platform() {
        switch (platform) {
            case 'apple':
                return (<AppleMusic />)
            case 'spotify':
                return (<Spotify />)
            case 'youtube':
            default:
                return (<YouTubeMusic />)
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.middle}>
                <Platform />
            </div>
        </div>
    )
}
