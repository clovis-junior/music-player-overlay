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
    const { id, name, type, value, options, children, ...attr } = props;

    if (type === 'radio') {
        return (
            <>
                <label className={styles?.player_customize_option} htmlFor={`${id || name}_on`}>
                    <input id={`${id || name}_on`} type='radio' name={name || id} value='on' defaultChecked={value === 'on'} {...attr} />
                    <span className={styles?.player_customize_option_radio}></span>
                    <span className={styles?.player_customize_option_name}>{options[0]}</span>
                </label>
                <label className={styles?.player_customize_option} htmlFor={`${id || name}_off`}>
                    <input id={`${id || name}_off`} type='radio' name={name || id} value='off' defaultChecked={value === 'off'} {...attr} />
                    <span className={styles?.player_customize_option_radio}></span>
                    <span className={styles?.player_customize_option_name}>{options[1]}</span>
                </label>
            </>
        )
    }

    return (
        <label className={styles?.player_customize_option} htmlFor={id || name}>
            <input id={id || name} type='checkbox' name={name || id} defaultChecked={value || false} {...attr} />
            <span className={styles?.player_customize_option_check}></span>
            {children}
        </label>
    )
}

export default function CustomURL() {
    const params = GetURLParams();

    const navigate = useNavigate();

    const [compactMode, setCompactMode] = useState('off');
    const [playerOptions, setPlayerOptions] = useState({});

    const url = useRef(null);
    const result = useRef(null);

    const urlValue = params.has('url') ? decodeURIComponent(params.get('url')) : '';


    function changePlayerLayout(e) {
        if (!e.target) return false;

        setCompactMode(e.target?.value);

        return changePlayerOptions(e);
    }

    function checkOptions(element) {
        if (!element) return false;

        const result = {};

        let params = GetURLParams(element?.value);

        let options = atob(params.get('options'));
        options = options?.split('&');

        options.forEach((key) => {
            let name = key?.indexOf('=') > 0 ? key?.split('=')[0] : key;
            let value = key?.indexOf('=') > 0 ? key?.split('=')[1] : '';

            let target = document.querySelector(`[name="${name}"]`);

            if (target?.type === 'checkbox' || target?.type === 'radio') {
                result[name] = '';
                target.checked = !target.checked ? true : target.checked;
            } else if (!IsEmpty(value)) {
                result[name] = value;
                target.value = value;
            }

        });

        setPlayerOptions({...result});
    }

    function encodeOptions(string) {
        if (IsEmpty(string)) return '';
        
        string = btoa(string.toString());
        string = string.replace(/\+/g, '-');
        string = string.replace(/\//g, '_');
        string = string.replace(/=+$/, '');

        return string;
    }

    function URIDecodeOptions(object) {
        let result = '';

        Object.entries(object).forEach(function ([key, value]) {
            result += (result.length > 0) ? '&' : '';
            result += (IsEmpty(value)) ? `${key}` : `${key}=${value}`
        });

        return result
    }

    function changePlayerOptions(e) {
        if (!e.target) return false;
        
        let name = e.target?.name;
        let value = e.target?.value;
        let checked = e.target?.checked;
        let type = e.target?.type;

        if (name in playerOptions) {
            if ((type === 'checkbox' && !checked) || 
            ((type === 'radio') && (value === 'off')) || IsEmpty(value)))
                delete playerOptions[name];
        } else {
            if ((type === 'checkbox' && checked ) || (type === 'radio' && value === 'on'))
                playerOptions[name] = '';
            else playerOptions[name] = value;
        }

        setPlayerOptions({...playerOptions});

        return false;
    }

    useLayoutEffect(() => {
        if (!document.body?.classList?.contains(styles?.dashboard))
            document.body?.classList?.add(styles?.dashboard);
    });

    useLayoutEffect(() => {
        checkOptions(url?.current)
    }, [url]);

    useLayoutEffect(() => {
        // console.debug(playerOptions);
        
        let urlBase = url?.current?.value?.split('?')[0];

        if (!IsEmpty(urlBase)) {
            let params = GetURLParams(url?.current?.value);
            params?.delete('options');

            result.current.value = `${urlBase}?${URIDecodeOptions(params?.list())}`;

            if (Object.keys(playerOptions).length > 0)
                result.current.value = `${result.current.value}&options=${encodeOptions(URIDecodeOptions(playerOptions))}`          
        }
            
    }, [playerOptions]);

    return (
        <div className={styles?.container}>
            <div className={styles?.middle}>
                <div className={styles?.panel}>
                    <div className={`${styles?.panel_content} ${styles?.centered}`}>
                        <h2>Costumize your player</h2>
                        <input ref={url} id='url' type='text' className={`${styles?.input_text} ${styles?.full}`} defaultValue={urlValue} 
                        onChange={e => checkOptions(e.target)} readOnly={params.has('url') ? true : false} placeholder='Your Player URL' />
                        <div className={styles?.player_customize_options}>
                            <PlayerOption type='radio' id='compact' name='compact' value={compactMode} options={['Player Compact', 'Player Full Size']} 
                            onChange={e => changePlayerLayout(e)} />
                        </div>
                        <div className={styles?.player_customize_options}>
                            <PlayerOption type='checkbox' id='square' name='squareLayout' value={('squareLayout' in playerOptions)}
                            onChange={e => changePlayerOptions(e)}>
                                <span className={styles?.player_customize_option_name}>Player with Square Borders</span>
                            </PlayerOption>
                            <PlayerOption type='checkbox' id='shadow' name='noShadow' value={('noShadow' in playerOptions)}
                            onChange={e => changePlayerOptions(e)}>
                                <span className={styles?.player_customize_option_name}>Remove Drop Shadow</span>
                            </PlayerOption>
                            <PlayerOption type='checkbox' id='solid_color' name='solidColor' value={'solidColor' in playerOptions}
                            onChange={e => changePlayerOptions(e)}>
                                <span className={styles?.player_customize_option_name}>Background with Solid Color</span>
                            </PlayerOption>
                            <PlayerOption type='checkbox' id='hide_progressbar' name='hideProgressBar' value={('hideProgressBar' in playerOptions)}
                            onChange={e => changePlayerOptions(e)}>
                                <span className={styles?.player_customize_option_name}>Remove Music Progress Bar</span>
                            </PlayerOption>
                            <PlayerOption type='checkbox' id='show_platform_icon' name='showPlatform' value={('showPlatform' in playerOptions)}
                            onChange={e => changePlayerOptions(e)}>
                                <span className={styles?.player_customize_option_name}>Show Platform Logo</span>
                            </PlayerOption>
                            {compactMode === 'on' ? (
                                <PlayerOption id='text_centered' className={styles?.player_customize_option} name='textCentered' 
                                value={('textCentered' in playerOptions)} onChange={e => changePlayerOptions(e)}>
                                    <span className={styles?.player_customize_option_name}>Align Center Music Infos</span>
                                </PlayerOption>) : (
                                <div className={styles?.player_customize_options}>
                                    <PlayerOption type='checkbox' id='album_art' name='hideAlbum' value={('hideAlbum' in playerOptions)} onChange={e => changePlayerOptions(e)}>
                                        <span className={styles?.player_customize_option_name}>Remove Music Album Art</span>
                                    </PlayerOption>
                                    <PlayerOption type='checkbox' id='hide_progress' name='hideProgress' value={('hideProgress' in playerOptions)} onChange={e => changePlayerOptions(e)}>
                                        <span className={styles?.player_customize_option_name}>Hide Music Times Progress</span>
                                    </PlayerOption>
                                    {!('hideProgress' in playerOptions) ? (
                                        <PlayerOption type='radio' id='remaining_time' name='remainingTime' 
                                        value={(!('hideProgress' in playerOptions) && playerOptions['remainingTime']) ? 'on' : 'off'} 
                                        options={['Show Remaining Music Time', 'Show Duration Music Time']} onChange={e => changePlayerOptions(e)} />
                                    ) : (<></>)}
                                </div>
                            )}
                        </div>
                        <div className={styles?.player_customize_options}>
                            <div className={styles?.player_customize_option}>
                                <span className={styles?.player_customize_option_name}>Sleep After (in secs):</span>
                                <input id='sleepAfter' type='number' className={`${styles?.input_text} ${styles?.compact} ${styles?.centered}`}  name='sleepAfter' min={0} 
                                value={playerOptions['sleepAfter']} defaultValue={10} max={60} onChange={e => changePlayerOptions(e)} />
                            </div>
                            {compactMode === 'off' ? (
                                <div className={styles?.player_customize_option}>
                                    <span className={styles?.player_customize_option_name}>Sound Waves</span>
                                    <input id='showWaves' type='number' className={`${styles?.input_text} ${styles?.compact} ${styles?.centered}`} name='showWaves' min={0} 
                                    defaultValue={0} max={96} onChange={e => changePlayerOptions(e)} />
                                </div>
                            ) : (<></>)}
                        </div>
                        <p>Copy this URL and use it on you streaming software:</p>
                        <input ref={result} id='result' title='URL Personalized' type='text' className={`${styles?.input_text} ${styles?.full}`} defaultValue={urlValue} readOnly />
                        <b>Enjoy!</b>
                        <footer className={styles?.btns}>
                            <button type='button' className={styles?.btn} onClick={() => Clipboard(result?.current?.value, result?.current)}>Copy New URL</button>
                            <button type='button' className={styles?.btn} onClick={() => navigate('/')}>Back to Homepage</button>
                        </footer>
                    </div>
                </div>
            </div>
        </div>
    )
}
