import { useState } from 'react'
import { browserURL, Success } from './Platform'

import AsyncImage from '../components/AsyncImage'
import styles from '../assets/scss/dashboard.module.scss'

import AppleMusicIcon from '../assets/images/apple-music-icon.svg'

function Instructions({ onGenerate }) {
    return (
        <>
            <div className={styles?.panel_content}>
                <p>You need download Cider (Version 2+), <a rel="noopener noreferrer" href="https://cider.sh/downloads/client" target="_blank">clicking here</a>. <small>Which costs U$3,49</small></p>
                <p>After downloaded, follow the instructions:</p>
                <ul>
                    <li>Open <b>Cider</b></li>
                    <li>Go to <b>Settings &gt; Connectivity &gt; Websockets API</b> and activate it</li>
                    <li>Click on the button below to generate a url.</li>
                </ul>
            </div>
            <footer className={`${styles?.btns} ${styles?.column} ${styles?.centered}`}>
                <button type="button" className={`${styles?.btn} ${styles?.apple}`} onClick={onGenerate}>Generate a Browser URL</button>
                <button type="submit" className={styles?.btn} onClick={() => window.history.back()}>Back</button>
            </footer>
        </>
    )
}

export default function AppleMusic() {
    const [generated, setGenerated] = useState(false);

    const playerURL = `${browserURL}player?platform=apple`;

    return (
        <main className={styles?.panel}>
            <figure>
                <AsyncImage className={styles?.platform_logo} src={AppleMusicIcon} alt={'Apple Music Icon'} />
            </figure>
            {generated ? (
                <Success url={playerURL} />
            ) : (
                <Instructions
                    onGenerate={() => setGenerated(true)}
                />
            )}
        </main>
    )
}