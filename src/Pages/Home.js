import { useState } from 'react';
import { IsEmpty } from '../Utils';
import { authCode, RequestToken } from '../platforms/YouTubeMusic';
import ytmLogo from '../images/ytm-logo.png';
import '../scss/configure.scss';


export default function Home() {
    const [output, setOutput] = useState('');
    const browserURL = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;

    async function RequestAccess() {
        const request = await RequestToken();

        setOutput(await request);
    }

    return (
        <div className='container'>
            <div className='middle'>
                <main className='panel'>
                    <figure>
                        <img className='platform-logo' src={ytmLogo} alt={'YouTube Music Logo'} />
                    </figure>
                    <div className='panel-content'>
                        <ul>
                            <li>Open <b>YouTube Music Desktop</b></li>
                            <li>
                                Go to <b>Settings &gt; Integrations &gt; Companion Server</b> and activate a Companion, make sure the following options are turned on:
                                <ol>
                                    <li>Companion Server</li>
                                    <li>Allow browser communication</li>
                                    <li>Enable companion authorization</li>
                                </ol>
                            </li>
                            <li>Click on the button below to connect.</li>
                        </ul>
                    </div>
                    {(!IsEmpty(authCode) && !output.token) ? (
                        <div className='alert'>
                            <p>Código de autenticação: <b>{authCode}</b></p>
                        </div>) : (<></>)}
                    {output.token ? (
                        <>
                            <input type='text' className='input-text' value={`${browserURL}#player?platform=youtube&token=${output.token}`} readOnly />
                            <footer className='btns centered'>
                                <button type='button' className='btn success' onClick={()=> {
                                navigator.clipboard.writeText(`${browserURL}#player?platform=youtube&token=${output.token}`)
                                }}>Copy URL</button>
                            </footer>
                        </>
                        ) : (
                        <>
                            <footer className='btns centered'>
                                <button type='button' className='btn ytm' onClick={()=> RequestAccess()}>Connect to YouTube Music Desktop</button>
                            </footer>
                        </>
                    )}
                    {output.statusCode ? (
                        <div className='alert error'>
                            <p><b>{output.statusCode}</b> {output?.message}</p>
                        </div>) : (<></>)}
                </main>
            </div>
        </div>
    )
}