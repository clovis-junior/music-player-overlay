import { useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GetURLParams, IsEmpty } from '../Utils.js';
import styles from '../scss/dashboard.module.scss';

function Clipboard(text, element) {
    element?.select();

    try {
        window.navigator?.clipboard?.writeText(text);

    } catch {
        document?.execCommand('copy');
    }

    return setTimeout(() => window.alert('URL has copied!'), 500)
}

function PlayerOption(props) {
    const { id, name, checked, children, ...attr } = props;

    return (
        <label className={styles.player_customize_option} htmlFor={id || name}>
            <input id={id || name} type='checkbox' name={name || id} defaultChecked={checked || false} {...attr} />
            <span className={styles.player_customize_option_check}></span>
            {children}
        </label>
    )
}

function PlayerOptions(props) {
    const { playerCompact, showGeneral, ...attr } = props;

    function GeneralOptions() {
        return (
            <>
                <PlayerOption id='square' name='squareLayout' {...attr}>
                    <span className={styles.player_customize_option_name}>Square Borders</span>
                </PlayerOption>
                <PlayerOption id='shadow' name='noShadow' {...attr}>
                    <span className={styles.player_customize_option_name}>No Shadow</span>
                </PlayerOption>
                <PlayerOption id='solid_color' name='solidColor' {...attr}>
                    <span className={styles.player_customize_option_name}>Solid Color</span>
                </PlayerOption>
                <PlayerOption id='hide_progressbar' name='hideProgressBar' {...attr}>
                    <span className={styles.player_customize_option_name}>Hide Progress Bar</span>
                </PlayerOption>
            </>
        )
    }

    function PlayerCompactOptions() {
        return (
            <>
                <PlayerOption id='text_centered' name='textCentered' {...attr}>
                    <span className={styles.player_customize_option_name}>Text Centered</span>
                </PlayerOption>
            </>
        )
    }

    function PlayerFullOptions() {
        return (
            <>
                <PlayerOption id='album_art' name='hideAlbum' {...attr}>
                    <span className={styles.player_customize_option_name}>Hide Album Art</span>
                </PlayerOption>
                <PlayerOption id='hide_progress' name='hideProgress' {...attr}>
                    <span className={styles.player_customize_option_name}>Hide Time Progress</span>
                </PlayerOption>
                <PlayerOption id='remaining_time' name='remainingTime' {...attr}>
                    <span className={styles.player_customize_option_name}>Show remaining Music time</span>
                </PlayerOption>
            </>
        )
    }

    return (
        <div className={styles.player_customize_options}>
            {showGeneral ? (<GeneralOptions />) :
                (playerCompact ? (<PlayerCompactOptions />) : (<PlayerFullOptions />))}
        </div>
    )
}

export default function CustomURL() {
    const params = GetURLParams();

    const navigate = useNavigate();

    const [compactChecked, setCompactChecked] = useState(false);
    const [playerOptions] = useState({});

    const url = useRef(null);
    const result = useRef(null);

    const urlValue = decodeURIComponent(params.get('url'));

    useLayoutEffect(() => {
        if (!document.body?.classList?.contains(styles?.dashboard))
            document.body?.classList?.add(styles?.dashboard);
    });

    function changeCompactOptions(e) {
        setCompactChecked(e.target?.checked);

        return changePlayerOptions(e);
    }

    function encodeOptions(string) {
        string = btoa(string);
        string = string.replace(/\+/g, '-');
        string = string.replace(/\//g, '_');
        string = string.replace(/=+$/, '');

        return string;
    }

    function URIDecodeOptions(object) {
        let result = '';

        Object.entries(object).forEach(function([key, value]) {
            result += (result.length <= 0) ? '?' : '&';
            result += `${key}=${value}`;
        });

        return result
    }

    function changePlayerOptions(e) {
        if (IsEmpty(url?.current?.value)) {
            e.preventDefault();
            return false
        }

        let name = e.target?.name;
        let value = e.target?.value;
        let urlBase = url?.current?.value?.split('?')[0];
        let params = GetURLParams(url?.current?.value);

        params.delete('options');

        if(name in playerOptions)
            delete playerOptions[name];

        playerOptions[name] = value;

        result.current.value = `${urlBase}${params.list()}&options=${encodeOptions(URIDecodeOptions(playerOptions))}`;

        return false;
    }

    return (
        <div className={styles.container}>
            <div className={styles.middle}>
                <div className={styles.panel}>
                    <div className={`${styles.panel_content} ${styles.centered}`}>
                        <h2>Costumize your player</h2>
                        <input ref={url} type='text' className={styles.input_text} defaultValue={urlValue} placeholder='Your Player URL' />
                        <div className={styles.player_customize_options}>
                            <PlayerOption id='compact' onChange={changeCompactOptions}>
                                <span className={styles.player_customize_option_name}>Compact Player</span>
                            </PlayerOption>
                        </div>
                        <PlayerOptions showGeneral={true} onChange={changePlayerOptions} />
                        <PlayerOptions playerCompact={compactChecked} onChange={changePlayerOptions} />
                        {!compactChecked ? (
                            <div className={styles.player_customize_options}>
                                <div className={`${styles.player_customize_option} ${styles.full}`}>
                                    <span className={styles.player_customize_option_name}>Number of Waves</span>
                                    <input type='number' className={styles.input_text} name='showWaves' min={0} defaultValue={0} max={96} onChange={changePlayerOptions} />
                                </div>
                                <div className={`${styles.player_customize_option} ${styles.full}`}>
                                    <span className={styles.player_customize_option_name}>Sleep Player After (In secs):</span>
                                    <input type='number' className={styles.input_text} name='sleepAfter' min={0} defaultValue={10} max={60} onChange={changePlayerOptions} />
                                </div>
                            </div>
                        ) : (<></>)}

                        <p>Copy this URL and use it on you streaming software:</p>
                        <input ref={result} type='text' className={styles.input_text} defaultValue={urlValue} readOnly />
                        <b>Enjoy!</b>
                        <footer className={styles.btns}>
                            <button type='button' className={styles.btn} onClick={() => Clipboard(result?.current?.value, result?.current)}>Copy New URL</button>
                            <button type='button' className={styles.btn} onClick={() => navigate('/')}>Back to Homepage</button>
                        </footer>
                    </div>
                </div>
            </div>
        </div>
    )
}
