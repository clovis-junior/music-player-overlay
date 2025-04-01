import { useLayoutEffect, useRef, useState } from 'react';
import { GenerateRandomString } from '../Utils';
import { RequestCode, RequestToken } from '../platforms/YouTubeMusic';
import { GetAuthURL, GetAccessToken } from '../platforms/Spotify';
import AsyncImage from '../components/AsyncImage';
import appleIcon from '../images/apple-music-icon.svg';
import spotifyLogo from '../images/spotify-logo.png';
import ytmLogo from '../images/ytm-logo.png';

const browserURL = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;

function Alert(props) {
    if(!props.content)
        return;

    return (
        <div className={`alert ${props?.type}`}>{props?.content}</div>
    )
}

function Clipboard(text, element) {
    try {
        window.navigator.clipboard?.writeText(text);
    } catch {
        element?.select();
        document?.execCommand('copy');
    }          

    return false
}

function YouTubeMusic() {
    const [response, setResponse] = useState(null);

    function Instructions() {
        return (
            <div className='panel_content'>
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
            if(props?.response?.code) {
                // setTimeout(async ()=>{
                //     const request = await RequestToken(props?.response?.code);
        
                //     setResponse(await request); 
                // }, 1000);

                return (<Alert type='info' content={(
                    <>
                        <p>Allow the app on YouTube Desktop, click on the botton below.</p>
                        <p>Your auth code: <strong>{props?.response?.code}</strong></p>
                    </>
                )} />);
            }

            if(props?.response?.statusCode)
                return (<Alert type={props?.response?.statusCode ? 'error' : 'info'} content={props?.response?.message} />)


            return
        }

        return (
            <>
                <ShowAlert response={response} />
                <footer className='btns centered'>
                    {response?.code ? (
                        <button type='button' className='btn success' onClick={(e)=> RequestAccessToken(e)}>Send the Notification</button>
                    ) : (
                        <button type='button' className='btn ytm' onClick={(e)=> RequestAccessCode(e)}>Connect to YouTube Music Desktop</button>
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
                <div className='panel_content'>
                    <p>Now, you need to copy this URL and use it on you streaming software:</p>
                    <input ref={input} type='text' className='input_text' value={playerURL} readOnly />
                    <b>Enjoy!</b>
                </div>
                <footer className='btns centered'>
                <button type='button' className='btn success' onClick={()=> Clipboard(playerURL, input?.current)}>Copy URL</button>
                </footer>
            </>
        )
    }

    return (
        <main className='panel'>
            <figure>
                <AsyncImage className='platform_logo' src={ytmLogo} alt={'YouTube Music Logo'} />
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
        const playerURL = `${browserURL}#player?platform=spotify&refreshToken=${props?.refreshToken}&accessToken=${props?.accessToken}`;
        
        return (
            <>
                <div className='panel_content'>
                    <p>Now, you need to copy this URL and use it on you streaming software:</p>
                    <input ref={input} type='text' className='input_text' value={playerURL} readOnly />
                    <b>Enjoy!</b>
                </div>
                <footer className='btns centered'>
                    <button type='button' className='btn success' onClick={()=> Clipboard(playerURL, input?.current)}>Copy URL</button>
                </footer>
            </>
        )
    }

    function Result() {
        const [response, setResponse] = useState(null);

        useLayoutEffect(()=>{
            if(!response) {
                async function GetAccess() {
                    setResponse(await GetAccessToken(browserURL, params.get('code')));
                }
    
                GetAccess()
            }
        });

        if(!response) {
            return (
                <div className='panel_content'>
                    <Alert type='info' content={(
                    <p>Checking...</p>
                    )} />
                </div>
            )
        }

        if(response?.error) {
            return (
                <div className='panel_content'>
                <Alert type='error' content={(
                    <p>{response.error_description}</p>
                )} />
                </div>
                
            );
        }

        return (<Success refreshToken={response.refresh_token} accessToken={response.access_token} />)
    }

    function Auth() {
        function GetSpotifyAuthURL(e) {
            e.target.disabled = true;
    
            return window.location.href = GetAuthURL(browserURL, 'user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private', GenerateRandomString(16))
        }

        return (
            <footer className='btns centered'>
                <button type='button' className='btn spotify' onClick={(e)=> GetSpotifyAuthURL(e)}>Authenticate on Spotify now</button>
            </footer>
        )
    }

    return (
        <main className='panel'>
            <figure>
                <AsyncImage className='platform_logo' src={spotifyLogo} alt={'Spotify Logo'} />
            </figure>
            {params.has('code') ? (<Result />) : (<Auth />) }
        </main>
    )
}

function AppleMusic() {
    const [session, setSession] = useState(null);

    function Instructions() {
        return (
            <>
                <div className='panel_content'>
                    <p>You need download Cider (Version 2+), <a rel='noopener noreferrer' href='https://cider.sh/downloads/client' target='_blank'>clicking here</a>. <small>Which costs U$3,49</small></p>
                    <p>After downloaded, follow the instructions:</p>
                    <ul>
                        <li>Open <b>Cider</b></li>
                        <li>Go to <b>Settings &gt; Connectivity &gt; Websockets API</b> and activate it</li>
                        <li>Click on the button below to generate a url.</li>
                    </ul>
                </div>
                <footer className='btns centered'>
                    <button type='button' className='btn apple' onClick={()=> setSession('url')}>Generate a Browser URL</button>
                </footer>
            </>
        )
    }

    function Success() {
        const input = useRef(null);
        const playerURL = `${browserURL}#player?platform=apple`;

        return (
            <>
                <div className='panel_content'>
                    <p>Now, you need to copy this URL and use it on you streaming software:</p>
                    <input ref={input} type='text' className='input_text' value={playerURL} readOnly />
                    <b>Enjoy!</b>
                </div>
                <footer className='btns centered'>
                    <button type='button' className='btn success' onClick={()=> Clipboard(playerURL, input?.current)}>Copy URL</button>
                </footer>
            </>
        )
    }

    return (
        <main className='panel'>
            <figure>
                <AsyncImage className='platform_logo' src={appleIcon} alt={'Apple Music Icon'} />
            </figure>
            {session ? <Success /> : <Instructions />}
        </main>
    )
}

export default function Auth(props) {
    const params = new URLSearchParams(window.location.search);
    const platform = params.has('code') ? 'spotify' : props?.platform;

    function Platform() {
        switch(platform) {
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
        <div className='container'>
            <div className='middle'>
                <Platform />
            </div>
        </div>
    )
}