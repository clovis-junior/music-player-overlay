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

    const urlValue = params.has('url') ? decodeURIComponent(params.get('url')) : '';

    useLayoutEffect(() => {
        if (!document.body?.classList?.contains(styles?.dashboard))
            document.body?.classList?.add(styles?.dashboard);
    });

    useLayoutEffect(() => {
        checkOptions(url?.current)
    });

    function changeCompactOptions(e) {
        setCompactChecked(e.target?.checked);

        return changePlayerOptions(e);
    }

    function checkOptions(element) {
        if (!element) return false;

        let params = GetURLParams(element?.value);

        let options = atob(params.get('options'));
        options = options?.split('&');

        options.forEach((key)=> {
            let name = key?.indexOf('=') > 0 ? key?.split('=')[0] : key;
            let value = key?.indexOf('=') > 0 ? key?.split('=')[1] : '';

            let target = document.querySelector(`[name="${name}"]`);

            if ((target?.type === 'text' || target?.type === 'number') && !IsEmpty(value))
                target.value = value;
            else if((target?.type === 'checkbox' || target?.type === 'radio'))
                target.checked = !target.checked ? true : target.checked;

            changePlayerOptions({target: target});
        })
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
            result += (IsEmpty(value)) ? `${key}` : `${key}=${value}`
        });

        return result
    }

    function changePlayerOptions(e) {
        if (IsEmpty(url?.current?.value)) return false;

        let name = e.target?.name;
        let value = e.target?.value;
        let checked = e.target?.checked || null;
        let type = e.target?.type || 'text';
        let urlBase = url?.current?.value?.split('?')[0];
        let params = GetURLParams(url?.current?.value);

        params.delete('options');

        if (name in playerOptions)
            delete playerOptions[name];
        
        if((type === 'text' || type === 'number') && !IsEmpty(value))
            playerOptions[name] = value;
        else if((type === 'checkbox' || type === 'radio') && !IsEmpty(checked))
            playerOptions[name] = '';

        result.current.value = `${urlBase}${URIDecodeOptions(params.list())}&options=${encodeOptions(URIDecodeOptions(playerOptions))}`;

        return false;
    }

    return (
        <div className={styles.container}>
            <div className={styles.middle}>
                <div className={styles.panel}>
                    <div className={`${styles.panel_content} ${styles.centered}`}>
                        <h2>Costumize your player</h2>
                        <input ref={url} id='url' type='text' className={styles.input_text} defaultValue={urlValue} onChange={(e)=> checkOptions(e.target)} readOnly={params.has('url') ? true : false} placeholder='Your Player URL' />
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
                        <input ref={result} id='result' type='text' className={styles.input_text} defaultValue={urlValue} readOnly />
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
