import { useEffect, useRef, useState } from 'react';
// import { inDevelopment } from '../App';
import { GetAccessToken } from '../platforms/SpotifyCustom.js';
import { IsEmpty } from '../Utils'
import { RequestCode, RequestToken } from '../platforms/YouTubeMusic.js';

import AsyncImage from '../components/AsyncImage.js';
import appleIcon from '../images/apple-music-icon.svg';
import spotifyLogo from '../images/spotify-logo.png';
import ytmLogo from '../images/ytm-logo.png';
import styles from '../scss/dashboard.module.scss';

const browserURL = `${window.location.protocol}//${window.location.host}${window.location.pathname || ''}`;

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

function PlayerGenerated(props) {
    const input = useRef(null);

    return (
        <>
            <div className={styles.panel_content}>
                <p>Now, you need to copy this URL and use it on you streaming software:</p>
                <input ref={input} type='text' className={styles.input_text} value={props.playerURL} readOnly />
                <b>Enjoy!</b>
            </div>
            <footer className={styles.btns}>
                <button type='button' className={`${styles.btn} ${styles.success}`} onClick={() => Clipboard(props.playerURL, input?.current)}>Copy URL</button>
                <button type='button' className={styles.btn} disabled>Costumize Player</button>
                <button type='button' className={styles.btn} onClick={() => window.history.back(-1)}>Back</button>
            </footer>
        </>
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
        const playerURL = `${browserURL}#player?platform=youtube&token=${props?.token}`;

        return (<PlayerGenerated playerURL={playerURL} />)
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
    const [playerURLCreated, setPlayerURLCreated] = useState(false);
    const [playerParams, setPlayerParams] = useState(null);

    function Success(props) {
        // const playerURL = `${browserURL}#player?platform=spotify&token=${props?.token}`;
        const playerURL = `${browserURL}#player?platform=spotify-custom&${props?.playerParams}`;

        return (<PlayerGenerated playerURL={playerURL} />)
    }

    function YourOwnApp() {
        const clientID = useRef(null);
        const clientSecret = useRef(null);

        function GetSpotifyAuthURL(e) {
            e.target.disabled = true;

            if (IsEmpty(clientID?.current.value) || IsEmpty(clientSecret?.current.value)) {
                alert('Please, fill the Client ID and Cliend secret!');

                clientID?.current?.focus();

                e.target.disabled = false;
                return false
            }

            localStorage.setItem('spotifyAppClientID', clientID?.current?.value);
            localStorage.setItem('spotifyAppClientSecret', clientSecret?.current?.value);

            const baseURL = 'https://accounts.spotify.com/pt-BR/authorize';
            const scopes = 'user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private';
            const urlParams = new URLSearchParams({
                'client_id': clientID?.current?.value,
                'response_type': 'code',
                'show_dialog': true
            });

            return window.location.href = `${baseURL}?${urlParams}&redirect_uri=${browserURL}&scopes=${scopes.replace(/\s/g, '%20')}`
        }

        function Instructions() {
            return (
                <div className={styles.panel_content}>
                    <p>You need to create an app in your Spotify dashboard, <a rel='noopener noreferrer' href='https://developer.spotify.com/dashboard' target='_blank'>clicking here</a>.</p>
                    <p>Follow the instructions:</p>
                    <ul>
                        <li>Click in <b>Create App</b></li>
                        <li>
                            Fill in the following details:
                            <ol>
                                <li><b>Redirect URIs</b> - "{browserURL}"</li>
                                <li><b>Which API/SDKs are you planning to use?</b> - Check Web API</li>
                            </ol>
                            The <b>App name</b> and <b>App description</b> can be whatever you want.
                        </li>
                        <li>
                            Click in <b>Settings</b>.
                            <ol>
                                <li>Click in <b>View client secret</b></li>
                                <li>Copy your <b>Client ID</b> and <b>Client secret</b></li>
                            </ol>
                        </li>
                        <li>Fill your Client ID and Client Secret.</li>
                    </ul>
                    <p>After this, click on <b>Authenticate</b> button below!</p>
                </div>
            )
        }

        return (
            <>
                <Instructions />
                <footer className={`${styles.btns} ${styles.column} ${styles.centered}`}>
                    <input ref={clientID} type='text' className={styles.input_text} placeholder='Your Client ID' />
                    <input ref={clientSecret} type='password' className={styles.input_text} placeholder='Your Client secret' />
                    <button type='button' className={`${styles.btn} ${styles.spotify}`} onClick={(e) => GetSpotifyAuthURL(e)}>Authenticate</button>
                    <button type='button' className={styles.btn} onClick={() => window.history.back(-1)}>Back</button>
                </footer>
            </>
        )
    }

    // function OurOwnApp() {
    //     function GetSpotifyAuthURL(e) {
    //         const baseURL = inDevelopment ? 'http://localhost' : 'https://music-player-spotify-web-api.onrender.com';
    //         e.target.disabled = true;

    //         return window.location.href = `${baseURL}/login`
    //     }

    //     return (
    //         <footer className={`${styles.btns} ${styles.column} ${styles.centered}`}>
    //             <button type='button' className={`${styles.btn} ${styles.spotify}`} onClick={(e) => GetSpotifyAuthURL(e)}>Authenticate on Spotify now</button>
    //             <button type='button' className={styles.btn} onClick={() => window.history.back(-1)}>Back</button>
    //         </footer>
    //     )
    // }

    // function Auth() {
    //     return (
    //         <></>
    //     )
    // }

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const clientID = localStorage.getItem('spotifyAppClientID') || '';
        const clientSecret = localStorage.getItem('spotifyAppClientSecret') || '';

        async function GetData() {
            const data = await GetAccessToken();

            console.log(data);

            if (data.refresh_token) {
                setPlayerParams(new URLSearchParams({
                    'clientID': clientID,
                    'clientSecret': clientSecret,
                    'refreshToken': data.refresh_token
                }));
                setPlayerURLCreated(true)
            }
        }

        if (params.has('spotifyToken') && (!IsEmpty(clientID) || !IsEmpty(clientSecret))) {
            setPlayerParams(new URLSearchParams({
                'token': params.get('spotifyToken')
            }));

            setPlayerURLCreated(true)
        }

        if (params.has('code') && (!IsEmpty(clientID) || !IsEmpty(clientSecret)))
            GetData();

    }, [setPlayerURLCreated])

    return (
        <main className={styles.panel}>
            <figure>
                <AsyncImage className={styles.platform_logo} src={spotifyLogo} alt={'Spotify Logo'} />
            </figure>
            {playerURLCreated ? (<Success playerParams={playerParams} />) : (<YourOwnApp />)}
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
                <footer className={`${styles.btns} ${styles.column} ${styles.centered}`}>
                    <button type='button' className={`${styles.btn} ${styles.apple}`} onClick={() => setSession('url')}>Generate a Browser URL</button>
                    <button type='button' className={styles.btn} onClick={() => window.history.back(-1)}>Back</button>
                </footer>
            </>
        )
    }

    function Success() {
        const playerURL = `${browserURL}#player?platform=apple`;

        return (<PlayerGenerated playerURL={playerURL} />)
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
            case 'spotify-custom':
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
