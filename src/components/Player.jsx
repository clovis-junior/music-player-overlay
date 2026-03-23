import { useState, useEffect, useRef } from 'react'
import { Vibrant } from 'node-vibrant/browser'
import { GetURLParams, ConvertTime } from '../functions/Utils'
import { useMusicPlatform } from '../hooks/MusicPlatform.js'
import styles from '../assets/scss/player.module.scss'

import AsyncImage from './AsyncImage.jsx'

const params = GetURLParams();

function UpdatePercentage(elapsed = 0, total = 0) {
    elapsed = Number(elapsed) || 0;
    total = Number(total) || 0;

    if (total <= 0) return 0;

    return Math.min(100, Math.max(0, (elapsed * 100) / total));
}

function DrawWaveForms({ number = 8 }) {
    let waves = [];

    if (number > 40)
        number = 40;

    if (number < 4)
        number = 4;

    for (let i = 0; i < number; i++)
        waves.push(i);

    return (
        <div className={styles?.music_waveforms}>
            {waves.map(index => (
                <div key={index} className={styles?.waveform} />
            ))}
        </div>
    )
}

function Scroll(props) {
    const { children, timer, ...inline } = props;

    const [scrolled, setScrolled] = useState(false);
    const [scroll, setScroll] = useState(0);

    const element = useRef(null);

    useEffect(() => {
        if (!element?.current) return;

        const interval = setInterval(() => setScrolled(prev => !prev), timer * 1000);

        if (scrolled) {
            const overflow = element?.current?.scrollWidth - element?.current?.offsetWidth;

            return () => {
                setScroll(overflow);
                clearInterval(interval);
            }
        }

        return () => {
            setScroll(0);
            clearInterval(interval);
        }
    }, [timer, scrolled]);

    return (
        <span ref={element} {...inline} style={{
            'transform': !scrolled
                ? `translateX(-${(scroll)}px)`
                : `translateX(0)`
        }}>
            {children}
        </span>
    )
}

export default function Player({
    sleepAfter = 10,
    showWaves = 0,
    compact = false,
    showPlatform = false,
    showAlbumArt = true,
    remainingTime = false,
    hideProgress = false,
    hideProgressBar = false,
    textCentered = false,
    noShadow = false,
    squareLayout = false,
    solidColor = false,
    lightTheme = false,
    albumArtTheme = false
}) {
    const platform = params.get('platform') || 'youtube-music';

    const [sleeping, setSleeping] = useState(false);

    const player = useRef(null);

    const {
        platformIcon,
        isConnected,
        hasReceivedData,
        music
    } = useMusicPlatform(platform);

    useEffect(() => {
        if (!player?.current) return;

        let cancelled = false;

        if (!albumArtTheme || !music?.albumCover) {
            player.current?.style.removeProperty('--background-color');
            player.current?.style.removeProperty('--text-color');
            return;
        }

        Vibrant.from(music?.albumCover)
            .getPalette().then(palette => {
                if (cancelled) return;

                const swatch = palette?.DarkVibrant ||
                    palette?.LightVibrant || palette?.Vibrant ||
                    palette?.Muted;

                if (!swatch) return;

                const [r, g, b] = swatch.rgb;

                player.current?.style.setProperty('--background-color', `${r},${g},${b}`);

                const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

                player.current?.style.setProperty('--text-color',
                    luminance > .6 ? '0,0,0' : '255,255,255'
                )
            }).catch(error => {
                if (!cancelled)
                    console.error(error);
            });

        return () => cancelled = true;
    }, [music?.albumCover, albumArtTheme]);

    useEffect(() => {
        if (music?.isPlaying) {
            setSleeping(false);
            return
        }

        const timer = setTimeout(() => {
            console.log('Sleeping...');
            setSleeping(true);
        }, sleepAfter * 1000);

        return () => clearTimeout(timer);
    }, [music?.isPlaying, sleepAfter]);

    if (!isConnected)
        return null;

    if (!hasReceivedData) {
        console.log('Waiting to receive data....');
        return null;
    }

    const playerClasses = [
        compact ? styles?.music_player_compact : styles?.music_player,
        sleeping ? '' : styles?.show,
        music?.isPlaying ? '' : styles?.paused,
        albumArtTheme ? styles?.album_art_theme : '',
        noShadow ? styles?.no_shadow : '',
        solidColor && lightTheme ? styles?.light : '',
        albumArtTheme ? styles?.vibrant : '',
        squareLayout ? styles?.square : ''
    ].filter(Boolean).join(' ');

    const progress = UpdatePercentage(music?.duration?.elapsed, music?.duration?.total);

    if (compact) {
        return (
            <main ref={player} className={playerClasses}>
                {(!solidColor && !albumArtTheme) && (
                    <div className={styles?.music_album_blur_container}>
                        <div key={music?.albumCover} className={styles?.music_album_art} style={{ backgroundImage: `url(${music?.albumCover})` }}></div>
                    </div>
                )}
                {!hideProgressBar && (
                    <div className={styles?.music_progress_bar}>
                        <div style={{ width: `${progress}%` }} />
                    </div>
                )}
                <div className={textCentered ? 'music_infos centered' : styles?.music_infos}>
                    {showPlatform && (
                        <div className={styles?.music_platform_icon}>
                            <figure>
                                <AsyncImage src={platformIcon} />
                            </figure>
                        </div>
                    )}
                    <div className={styles?.music_info_mask}>
                        <Scroll key={music?.title} id={styles?.music_title} timer={6}>
                            {music?.title}
                        </Scroll>
                    </div>
                    <div className={styles?.music_info_mask}>
                        <Scroll key={music?.artist} id={styles?.music_artist} timer={8}>
                            {music?.artist}
                        </Scroll>
                    </div>
                </div>
            </main>
        )
    }

    return (
        <main ref={player} className={playerClasses}>
            {showAlbumArt && (
                <div className={styles?.music_album_art}>
                    {showPlatform && (
                        <div className={styles?.music_platform_icon}>
                            <figure>
                                <AsyncImage src={platformIcon} />
                            </figure>
                        </div>
                    )}
                    <figure>
                        <AsyncImage src={music?.albumCover} alt={music?.title} />
                    </figure>
                </div>
            )}
            <aside className={styles?.music_infos}>
                {(!solidColor && !albumArtTheme) && (
                    <div className={styles?.music_album_blur_container}>
                        <div key={music?.albumCover} className={styles?.music_album_art} style={{ backgroundImage: `url(${music?.albumCover})` }}></div>
                    </div>
                )}
                {(!showAlbumArt && showPlatform) && (
                    <div className={styles?.music_platform_icon}>
                        <figure>
                            <AsyncImage src={platformIcon} />
                        </figure>
                    </div>
                )}
                <div className={styles?.music_info_mask}>
                    <Scroll key={music?.title} id={styles?.music_title} timer={6}>
                        {music?.title}
                    </Scroll>
                </div>
                <div className={styles?.music_info_mask}>
                    <Scroll key={music?.artist} id={styles?.music_artist} timer={8}>
                        {music?.artist}
                    </Scroll>
                </div>
                <footer className={styles?.music_progress}>
                    {!hideProgress && (
                        <div className={styles?.music_progress_values}>
                            <span id={styles?.music_time_elapsed}>{ConvertTime(music?.duration?.elapsed)}</span>
                            {showWaves > 0 && (<DrawWaveForms number={showWaves} />)}
                            <span id={styles?.music_time_total}>{ConvertTime(remainingTime ? music?.duration?.remaining : music?.duration?.total)}</span>
                        </div>
                    )}
                    {hideProgress && showWaves > 0 && (
                        <div className={styles?.music_progress_values}>
                            {showWaves > 0 && (<DrawWaveForms number={showWaves} />)}
                        </div>
                    )}
                    {!hideProgressBar && (
                        <div className={styles?.music_progress_bar}>
                            <div style={{ width: `${progress}%` }} />
                        </div>
                    )}
                </footer>
            </aside>
        </main>
    )
}