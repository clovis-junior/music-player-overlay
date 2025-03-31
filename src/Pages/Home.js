import { useState } from 'react';
import { RequestToken } from '../platforms/YouTubeMusic';
import '../scss/configure.scss';

export default function Home() {
    const [output, setOutput] = useState('');
    const browserURL = `${window.location.protocol}//${window.location.host}${window.location.pathname.substring(0, -1)}`;

    async function RequestAccess() {
        const request = await RequestToken();

        setOutput(await request);
    }

    return (
        <div className='container'>
            <main className='content'>
                {output.statusCode ? (
                    <div className='alert error'>
                        <p><b>{output?.statusCode}</b> {output?.message}</p>
                    </div>) : (<></>)}
                {output.token ? (
                    <>
                        <input type='text' value={`${browserURL}/player?platform=youtube&token=${output.token}`} readOnly />
                        <button type='button' className='btn success' onClick={()=> {
                        navigator.clipboard.writeText(`${browserURL}/player?platform=youtube&token=${output.token}`)
                        }}>Copy URL</button>
                    </>
                    ) : (
                    <>
                        <button type='button' className='btn ytm' onClick={()=> RequestAccess()}>Send Authorization Code</button>
                        <button type='button' className='btn' onClick={null}>Back</button>
                    </>
                )}
            </main>
        </div>
    )
}