import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GetURLParams, IsEmpty, URLValidade } from '../Utils.js';
import styles from '../scss/customize.module.scss';

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
                <label className={!attr?.disabled ? `${styles?.player_customize_option}` : `${styles?.player_customize_option} ${styles?.disabled}`}
                    htmlFor={`${id || name} ${options[0]}`}>
                    <input id={`${id || name} ${options[0]}`} type='radio' name={name || id} value='on' defaultChecked={value === 'on'} {...attr} />
                    <span className={styles?.player_customize_option_radio}></span>
                    <span className={styles?.player_customize_option_name}>{options[0]}</span>
                </label>
                <label className={!attr?.disabled ? `${styles?.player_customize_option}` : `${styles?.player_customize_option} ${styles?.disabled}`}
                    htmlFor={`${id || name} ${options[1]}`}>
                    <input id={`${id || name} ${options[1]}`} type='radio' name={name || id} value='off' defaultChecked={value === 'off'} {...attr} />
                    <span className={styles?.player_customize_option_radio}></span>
                    <span className={styles?.player_customize_option_name}>{options[1]}</span>
                </label>
            </>
        )
    }

    return (
        <label className={!attr?.disabled ? `${styles?.player_customize_option}` : `${styles?.player_customize_option} ${styles?.disabled}`}
            htmlFor={id || name}>
            <input id={id || name} type='checkbox' name={name || id} defaultChecked={value || false} {...attr} />
            <span className={styles?.player_customize_option_check}></span>
            {children}
        </label>
    )
}

export default function CustomURL() {
    const navigate = useNavigate();
    const params = GetURLParams();

    const urlValue = params.has('url') ? decodeURIComponent(params.get('url')) : '';

    const [compactMode, setCompactMode] = useState('off');
    const [playerOptions, setPlayerOptions] = useState({});
    const [disableOptions, setDisableOptions] = useState(!IsEmpty(urlValue) ? false : true);

    const url = useRef(null);
    const preview = useRef(null);
    const result = useRef(null);

    function changePlayerLayout(e) {
        if (!e.target) return false;

        setCompactMode(e.target?.value);

        return changePlayerOptions(e);
    }

    function checkOptions(element) {
        if (!IsEmpty(element?.value) && !URLValidade(element?.value))
            console.error('URL is not valid.');

        if (IsEmpty(element?.value) || !URLValidade(element?.value)) {
            setDisableOptions(true);
            return false;
        }

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
            } else if (target?.type === 'number' && parseInt(value) > 0) {
                result[name] = parseInt(value);
                target.value = parseInt(value);
            } else if (!IsEmpty(value)) {
                result[name] = value;
                target.value = value;
            }

        });

        setDisableOptions(false);
        setPlayerOptions({ ...result });
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
                (type === 'radio' && value === 'off') ||
                (type === 'number' && parseInt(value) <= 0) ||
                (type === 'text' && IsEmpty(value)))
                delete playerOptions[name];
        }

        if ((type === 'checkbox' && checked) || (type === 'radio' && value === 'on'))
            playerOptions[name] = '';
        else if (type === 'number' && parseInt(value) > 0)
            playerOptions[name] = parseInt(value);
        else if (type === 'text' && !IsEmpty(value))
            playerOptions[name] = value.toString();

        setPlayerOptions({ ...playerOptions });

        return false;
    }

    useEffect(() => {
        if (!preview.current)
            return;

        preview.current.src = result.current?.value;

    }, [result.current?.value]);

    useLayoutEffect(() => {
        if (!document.body?.classList?.contains(styles?.dashboard))
            document.body?.classList?.add(styles?.dashboard);
    });

    useLayoutEffect(() => {
        let urlBase = url?.current?.value?.split('?')[0];

        if (!IsEmpty(urlBase)) {
            let params = GetURLParams(url?.current?.value);
            params?.delete('options');

            result.current.value = `${urlBase}?${URIDecodeOptions(params?.list())}`;

            if (Object.keys(playerOptions).length > 0)
                result.current.value = `${result.current.value}&options=${encodeOptions(URIDecodeOptions(playerOptions))}`
        }

        console.debug(url?.current?.value, result.current.value, playerOptions, URIDecodeOptions(playerOptions));

    }, [playerOptions]);

    return (
        <div className={styles?.container}>
            <aside className={styles?.customize_panel}>
                <header className={styles?.customize_panel_header}>
                    <h2>Costumize your player</h2>
                    <input ref={url} id='url' type='text' className={`${styles?.input_text} ${styles?.full}`}
                        defaultValue={urlValue} readOnly={params.has('url') ? true : false}
                        placeholder='Your Player URL' onChange={e => checkOptions(e.target)}
                    />
                </header>
                <div className={styles?.player_customize_options}>
                    <PlayerOption type='radio' id='compact' name='compact' value={compactMode} options={['Player Compact', 'Player Full Size']}
                        onChange={e => changePlayerLayout(e)} disabled={disableOptions}
                    />
                    <div className={!disableOptions ? `${styles?.player_customize_option}` : `${styles?.player_customize_option} ${styles?.disabled}`}>
                        <span className={styles?.player_customize_option_name}>Sleep After (in secs):</span>
                        <input id='sleepAfter' type='number' className={`${styles?.input_text} ${styles?.compact} ${styles?.centered}`} name='sleepAfter'
                            min={0} defaultValue={playerOptions['sleepAfter'] || 10} max={60}
                            onChange={e => changePlayerOptions(e)} disabled={disableOptions}
                        />
                    </div>
                    {compactMode === 'off' ? (
                        <div className={!disableOptions ? `${styles?.player_customize_option}` : `${styles?.player_customize_option} ${styles?.disabled}`}>
                            <span className={styles?.player_customize_option_name}>Sound Waves</span>
                            <input id='showWaves' type='number' className={`${styles?.input_text} ${styles?.compact} ${styles?.centered}`} name='showWaves'
                                min={0} defaultValue={playerOptions['showWaves'] || 0} max={96}
                                onChange={e => changePlayerOptions(e)} disabled={disableOptions}
                            />
                        </div>
                    ) : (<></>)}
                </div>
                <div className={`${styles?.customize_panel_content} ${styles?.overflow}`}>
                    <div className={styles?.player_customize_options}>
                        {'solidColor' in playerOptions ? (
                            <>
                                <PlayerOption type='checkbox' id='vibrant' name='vibrant' value={('vibrant' in playerOptions)}
                                    onChange={e => changePlayerOptions(e)} disabled={disableOptions}>
                                    <span className={styles?.player_customize_option_name}>Vibrant Theme</span>
                                </PlayerOption>
                                {'vibrant' in playerOptions ? (<></>) : (
                                    <PlayerOption type='radio' id='player_theme' name='light'
                                        value={'light' in playerOptions ? 'on' : 'off'}
                                        options={['Light Theme', 'Dark Theme']} 
                                        onChange={e => changePlayerOptions(e)} disabled={disableOptions} />
                                )}
                            </>
                        ) : (<></>)}
                        {compactMode === 'off' ? (
                            <>
                                <PlayerOption type='checkbox' id='hide_progress' name='hideProgress' value={('hideProgress' in playerOptions)}
                                    onChange={e => changePlayerOptions(e)} disabled={disableOptions}>
                                    <span className={styles?.player_customize_option_name}>Hide Music Times Progress</span>
                                </PlayerOption>
                                {'hideProgress' in playerOptions ? (<></>) : (
                                    <PlayerOption type='radio' id='time_mode' name='remainingTime'
                                        value={'remainingTime' in playerOptions ? 'on' : 'off'}
                                        options={['Show Remaining Music Time', 'Show Duration Music Time']} 
                                        onChange={e => changePlayerOptions(e)} disabled={disableOptions} />
                                )}
                                <PlayerOption type='checkbox' id='album_art' name='hideAlbum' value={('hideAlbum' in playerOptions)}
                                    onChange={e => changePlayerOptions(e)} disabled={disableOptions}>
                                    <span className={styles?.player_customize_option_name}>Remove Music Album Art</span>
                                </PlayerOption>
                            </>
                        ) : (<></>)}
                        {compactMode === 'on' ? (
                            <PlayerOption id='text_centered' className={styles?.player_customize_option} name='textCentered'
                                value={('textCentered' in playerOptions)} onChange={e => changePlayerOptions(e)}>
                                <span className={styles?.player_customize_option_name}>Align Center Music Infos</span>
                            </PlayerOption>) : (<></>)}
                        <PlayerOption type='checkbox' id='square' name='squareLayout' value={('squareLayout' in playerOptions)}
                            onChange={e => changePlayerOptions(e)} disabled={disableOptions}>
                            <span className={styles?.player_customize_option_name}>Player with Square Borders</span>
                        </PlayerOption>
                        <PlayerOption type='checkbox' id='shadow' name='noShadow' value={('noShadow' in playerOptions)}
                            onChange={e => changePlayerOptions(e)} disabled={disableOptions}>
                            <span className={styles?.player_customize_option_name}>Remove Drop Shadow</span>
                        </PlayerOption>
                        <PlayerOption type='checkbox' id='solid_color' name='solidColor' value={'solidColor' in playerOptions}
                            onChange={e => changePlayerOptions(e)} disabled={disableOptions}>
                            <span className={styles?.player_customize_option_name}>Background with Solid Color</span>
                        </PlayerOption>
                        <PlayerOption type='checkbox' id='hide_progressbar' name='hideProgressBar' value={('hideProgressBar' in playerOptions)}
                            onChange={e => changePlayerOptions(e)} disabled={disableOptions}>
                            <span className={styles?.player_customize_option_name}>Remove Music Progress Bar</span>
                        </PlayerOption>
                        <PlayerOption type='checkbox' id='show_platform_icon' name='showPlatform' value={('showPlatform' in playerOptions)}
                            onChange={e => changePlayerOptions(e)} disabled={disableOptions}>
                            <span className={styles?.player_customize_option_name}>Show Platform Logo</span>
                        </PlayerOption>
                    </div>
                </div>
                <footer className={styles?.customize_panel_footer}>
                    <p>Copy this URL and use it on you streaming software:</p>
                    <input ref={result} id='result' title='URL Personalized' type='text' className={`${styles?.input_text} ${styles?.full}`}
                        readOnly disabled={disableOptions} />
                    <footer className={styles?.btns}>
                        <button type='button' className={styles?.btn}
                            disabled={result?.current?.value.length <= 0 ? true : false}
                            onClick={() => Clipboard(result?.current?.value, result?.current)}>
                            Copy New URL
                        </button>
                        <button type='button' className={styles?.btn} onClick={() => navigate('/')}>Back to Homepage</button>
                    </footer>
                </footer>
            </aside>
            <div className={styles?.player_preview}>
                <iframe title="preview" ref={preview} />
            </div>
        </div>
    )
}
