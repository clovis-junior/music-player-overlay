import { useState } from 'react';
import { IsEmpty } from '../Utils';
import { authCode, RequestToken } from '../platforms/YouTubeMusic';
import { GetAuthURL } from '../platforms/Spotify';
import ytmLogo from '../images/ytm-logo.png';
import spotifyLogo from '../images/spotify-logo.png';
import '../scss/configure.scss';

const browserURL = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;

function YouTubeMusic() {
    const [response, setResponse] = useState('');

    async function RequestAccess() {
        const request = await RequestToken();
    
        setResponse(await request);
    }

    function Instructions() {
        return (
            <>
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
            </>
        )
    }

    function Auth({ props }) {
        return (
            <footer className='btns centered'>
                <button type='button' className='btn ytm' onClick={props?.requestFunction}>Connect to YouTube Music Desktop</button>
            </footer>
        )
    }

    function Success({ props }) {
        return (
            <>
                <input type='text' className='input-text' value={`${browserURL}#player?platform=youtube&token=${props?.token}`} readOnly />
                <footer className='btns centered'>
                    <button type='button' className='btn success' onClick={()=> {
                        navigator.clipboard?.writeText(`${browserURL}#player?platform=youtube&token=${props?.token}`)
                    }}>Copy URL</button>
                </footer>
            </>
        )
    }

    function Alerts({ props }) {
        if(!props?.message)
            return;

        return (
            <div className={`alert ${props?.type}`}>
                <p><strong>{props.message?.statusCode}</strong>: {props.message?.message}</p>
            </div>
        )
    }

    return (
        <main className='panel'>
            <figure>
                <img className='platform-logo' src={ytmLogo} alt={'YouTube Music Logo'} />
            </figure>
            <div className='panel-content'>
                <Instructions />    
            </div>
            {response.token ? (<Success token={response.token} />) : (<Auth requestFunction={()=> RequestAccess()} />)}
            <Alerts type='info' message={response} />
        </main>
    )
}

function Spotify() {
    function GetSpotifyAuthURL(e) {
        e.target.disabled = true;

        return window.location.href = GetAuthURL(browserURL, ['user-read-currently-playing'])
    }

    return (
        <main className='panel'>
            <figure>
                <img className='platform-logo' src={spotifyLogo} alt={'Spotify Logo'} />
            </figure>
            <div className='panel-content'></div>
            <footer className='btns centered'>
                <button type='button' className='btn spotify' onClick={e=> GetSpotifyAuthURL(e)}>Authenticate on Spotify now</button>
            </footer>
        </main>
    )
}

export default function Home() {
    const params = new URLSearchParams(window.location.search);

    function Platform() {
        switch(params.get('platform')) {
            case 'spotify':
                return (<Spotify />)
            case 'ytm':
            case 'youtube':
            case 'youtube-music':
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