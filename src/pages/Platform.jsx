import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CopyToClipboard, URLValidade } from '../functions/Utils'

import Alert from '../components/Alert'
import AppleMusic from './AppleMusic'
import Spotify from './Spotify'
import YouTubeMusic from './YouTubeMusic'

import styles from '../assets/scss/dashboard.module.scss'

export const browserURL = `${window.location.protocol}//${window.location.host}/`;

export function PlayerGenerated({ url }) {
    const navigate = useNavigate();

    return (
        <>
            <div className={styles?.panel_content}>
                <Alert type="success">Your player has succefully generated.</Alert>
                <p>Now, you need to copy this URL and use it on you streaming software:</p>
                <input type="text" name="result" className={`${styles?.input_text} ${styles?.full}`} value={url} readOnly />
                <b>Enjoy!</b>
            </div>
            <footer className={styles?.btns}>
                <button type="button" className={`${styles?.btn} ${styles.success}`} onClick={()=> CopyToClipboard(url)}>Copy URL</button>
                <button type="button" className={styles?.btn} onClick={() => navigate(`/customize?url=${encodeURIComponent(url)}`)}>Costumize Player</button>
                <button type="button" className={styles?.btn} onClick={() => window.history.back()}>Back</button>
            </footer>
        </>
    )
}

export function Success({ url }) {
    if (!URLValidade(url))
        return (<></>);

    return (<PlayerGenerated url={url} />)
}

export default function Platform() {
    const { platform } = useParams();

    const PlatformComponent = useMemo(()=>{
        switch(platform) {
            case 'apple':
            case 'apple-music':
                return AppleMusic;
            case 'spotify':
                return Spotify;
            case 'youtube':
            case 'youtube-music':
            default:
                return YouTubeMusic
        }
    }, [platform]);

    return (
        <div className={styles?.dashboard_page}>
            <div className={styles?.container}>
                <div className={styles?.middle}>
                    <PlatformComponent />
                </div>
            </div>
        </div>
    );
}