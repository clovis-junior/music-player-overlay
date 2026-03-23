import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GetURLParams, IsEmpty, URLValidade, CopyToClipboard } from '../functions/Utils'
import styles from '../assets/scss/dashboard.module.scss';
import Alert from '../components/Alert';

function URIDecodeOptions(object) {
  let result = '';

  Object.entries(object).forEach(function ([key, value]) {
    result += (result.length > 0) ? '&' : '';
    result += (IsEmpty(value)) ? `${key}` : `${key}=${value}`
  });

  return result
}

function encodeOptions(object = {}) {
  if (!object || Object.keys(object).length === 0) return '';

  const uri = URIDecodeOptions(object);

  return btoa(uri)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function decodeOptions(value = '') {
  if (!value) return {};

  try {
    return GetURLParams(atob(value));
  } catch {
    return {};
  }
}

function parsePlayerURL(value = '') {
  if (IsEmpty(value) || !URLValidade(value)) {
    return {
      isValid: false,
      data: {},
      options: {}
    };
  }

  const params = GetURLParams(value);
  const options = decodeOptions(params?.get('options'));

  params?.delete('options');

  const data = params?.list();

  return {
    isValid: true,
    data,
    options
  };
}

function getBasePlayerURL(rawURL = '') {
  if (IsEmpty(rawURL) || !URLValidade(rawURL)) return '';

  return rawURL.split('?')[0];
}

function buildPlayerURL(rawURL = '', data = {}, options = {}) {
  const baseURL = getBasePlayerURL(rawURL);

  if (!baseURL) return '';

  const params = new URLSearchParams();

  Object.entries(data)?.forEach(([name, value]) => params.set(name, value));

  const encodedOptions = encodeOptions(options);

  if (encodedOptions)
    params.set('options', encodedOptions);

  const query = params.toString();
  return `${baseURL}${query ? `?${query}` : ''}`;
}

function PlayerOption(props) {
  const {
    id, name, type, value,
    options, children, ...attr
  } = props;

  if (type === 'radio') {
    return (
      <>
        <label
          className={!attr?.disabled
            ? styles.player_customize_option
            : `${styles.player_customize_option} ${styles.disabled}`
          }
          htmlFor={`${id || name}-${options[0]}`}
        >
          <input
            id={`${id || name}-${options[0]}`}
            type="radio"
            name={name || id} value="on"
            checked={value === 'on'}
            {...attr}
          />
          <span className={styles.player_customize_option_radio}></span>
          <span className={styles.player_customize_option_name}>{options[0]}</span>
        </label>

        <label
          className={
            !attr?.disabled
              ? styles.player_customize_option
              : `${styles.player_customize_option} ${styles.disabled}`
          }
          htmlFor={`${id || name}-${options[1]}`}
        >
          <input
            id={`${id || name}-${options[1]}`}
            type="radio"
            name={name || id} value="off"
            checked={value === 'off'}
            {...attr}
          />
          <span className={styles.player_customize_option_radio}></span>
          <span className={styles.player_customize_option_name}>{options[1]}</span>
        </label>
      </>
    );
  }

  return (
    <label
      className={!attr?.disabled
        ? styles.player_customize_option
        : `${styles.player_customize_option} ${styles.disabled}`
      }
      htmlFor={id || name}
    >
      <input id={id || name} type="checkbox"
        name={name || id} {...attr}
      />
      <span className={styles.player_customize_option_check}></span>
      {children}
    </label>
  );
}

export default function Customize() {
  const navigate = useNavigate();
  const params = GetURLParams();

  const initialURL = params?.has('url')
    ? decodeURIComponent(params?.get('url'))
    : '';

  const parsedInitialURL = parsePlayerURL(initialURL);

  const [urlValue, setURLValue] = useState(initialURL);
  const [platformData, setPlatformData] = useState(parsedInitialURL.data);
  const [playerOptions, setPlayerOptions] = useState(parsedInitialURL.options);

  const disableOptions = useMemo(() => {
    return IsEmpty(urlValue) || !URLValidade(urlValue);
  }, [urlValue]);

  const finalURL = useMemo(() => {
    return buildPlayerURL(urlValue, platformData, playerOptions);
  }, [urlValue, platformData, playerOptions]);

  function handleURLChange(event) {
    const nextURL = event.target.value;
    setURLValue(nextURL);

    if (IsEmpty(nextURL) || !URLValidade(nextURL)) {
      setPlatformData({});
      setPlayerOptions({});
      return;
    }

    const parsed = parsePlayerURL(nextURL);

    setPlatformData(parsed.data);
    setPlayerOptions(parsed.options);
  }

  function setOption(name, nextValue) {
    setPlayerOptions(current => {
      const next = { ...current };

      if (
        nextValue === false ||
        nextValue === null ||
        nextValue === undefined ||
        (typeof nextValue === 'number' && nextValue <= 0)
      ) {
        delete next[name];
        return next;
      }

      next[name] = nextValue;
      return next;
    });
  }

  function handleCheckboxChange(event) {
    const { name, checked } = event.target;
    setOption(name, checked ? '' : false);
  }

  function handleRadioBooleanChange(event) {
    const { name, value } = event.target;
    setOption(name, (value === 'on' ? '' : false));
  }

  function handleNumberChange(event) {
    const { name, value } = event.target;
    const parsed = parseInt(value, 10);

    if (Number.isNaN(parsed) || parsed <= 0) {
      setOption(name, false);
      return;
    }

    setOption(name, parsed);
  }

  return (
    <div className={styles?.customize_page}>
      <aside className={styles?.customize_panel}>
        <header className={styles?.customize_panel_header}>
          <h2>Costumize your player</h2>
          <input id="url" type="text"
            className={`${styles?.input_text} ${styles?.full}`}
            value={urlValue} readOnly={params?.has('url')}
            placeholder="Your Player URL"
            onChange={handleURLChange}
          />
          {finalURL && (<Alert type="info">Play the song for preview works.</Alert>)}
        </header>
        <div className={styles?.player_customize_options}>
          <PlayerOption type="radio" id="compact"
            name="compact" value={'compact' in playerOptions ? 'on' : 'off'}
            options={['Player Compact', 'Player Full Size']}
            onChange={handleRadioBooleanChange} disabled={disableOptions}
          />
          {'solidColor' in playerOptions && (
            <>
              <PlayerOption type="checkbox" id="vibrant"
                name="vibrant"
                onChange={handleCheckboxChange} disabled={disableOptions}>
                <span className={styles?.player_customize_option_name}>Vibrant Theme</span>
              </PlayerOption>
              {!('vibrant' in playerOptions) && (
                <PlayerOption type="radio" id="player_theme"
                  name="light"
                  value={'light' in playerOptions ? 'on' : 'off'}
                  options={['Light Theme', 'Dark Theme']}
                  onChange={handleRadioBooleanChange} disabled={disableOptions} />
              )}
            </>
          )}
          <div className={!disableOptions ? `${styles?.player_customize_option}` : `${styles?.player_customize_option} ${styles?.disabled}`}>
            <span className={styles?.player_customize_option_name}>Sleep After (in secs):</span>
            <input id="sleepAfter" type="number"
              className={`${styles?.input_text} ${styles?.compact} ${styles?.centered}`}
              name="sleepAfter"
              min={0} defaultValue={playerOptions?.sleepAfter ?? 10} max={60}
              onChange={handleNumberChange} disabled={disableOptions}
            />
          </div>
          {!('compact' in playerOptions) && (
            <div className={!disableOptions ? `${styles?.player_customize_option}` : `${styles?.player_customize_option} ${styles?.disabled}`}>
              <span className={styles?.player_customize_option_name}>Sound Waves</span>
              <input id="showWaves" type="number"
                className={`${styles?.input_text} ${styles?.compact} ${styles?.centered}`}
                name="showWaves"
                min={0} defaultValue={playerOptions?.showWaves ?? 0} max={40}
                onChange={handleNumberChange} disabled={disableOptions}
              />
            </div>
          )}
        </div>
        <div className={`${styles?.customize_panel_content} ${styles?.overflow}`}>
          <div className={styles?.player_customize_options}>
            {!('compact' in playerOptions) && (
              <>
                <PlayerOption type="checkbox" id="hide_progress"
                  name="hideProgress" value={'hideProgress' in playerOptions}
                  onChange={handleCheckboxChange} disabled={disableOptions}>
                  <span className={styles?.player_customize_option_name}>Hide Music Times Progress</span>
                </PlayerOption>
                {"hideProgress" in playerOptions ? (<></>) : (
                  <PlayerOption type="radio" id="time_mode" name="remainingTime"
                    value={'remainingTime' in playerOptions ? 'on' : 'off'}
                    options={['Show Remaining Music Time', 'Show Duration Music Time']}
                    onChange={handleRadioBooleanChange} disabled={disableOptions} />
                )}
                <PlayerOption type="checkbox" id="album_art"
                  name="hideAlbum"
                  checked={playerOptions?.hideAlbum !== undefined}
                  onChange={handleRadioBooleanChange} disabled={disableOptions}>
                  <span className={styles?.player_customize_option_name}>Remove Music Album Art</span>
                </PlayerOption>
              </>
            )}
            {'compact' in playerOptions && (
              <PlayerOption type="checkbox" id="text_centered"
                className={styles?.player_customize_option}
                name="textCentered"
                checked={playerOptions?.textCentered !== undefined}
                onChange={handleCheckboxChange}>
                <span className={styles?.player_customize_option_name}>Align Center Music Infos</span>
              </PlayerOption>)}
            <PlayerOption type="checkbox" id="square"
              name="squareLayout"
              checked={playerOptions?.squareLayout !== undefined}
              onChange={handleCheckboxChange} disabled={disableOptions}>
              <span className={styles?.player_customize_option_name}>Player with Square Borders</span>
            </PlayerOption>
            <PlayerOption type="checkbox" id="shadow"
              name="noShadow"
              checked={playerOptions?.noShadow !== undefined}
              onChange={handleCheckboxChange} disabled={disableOptions}>
              <span className={styles?.player_customize_option_name}>Remove Drop Shadow</span>
            </PlayerOption>
            <PlayerOption type="checkbox" id="solid_color"
              name="solidColor"
              checked={playerOptions?.solidColor !== undefined}
              onChange={handleCheckboxChange} disabled={disableOptions}>
              <span className={styles?.player_customize_option_name}>Background with Solid Color</span>
            </PlayerOption>
            <PlayerOption type="checkbox" id="hide_progressbar"
              name="hideProgressBar"
              checked={playerOptions?.hideProgressBar !== undefined}
              onChange={handleCheckboxChange} disabled={disableOptions}>
              <span className={styles?.player_customize_option_name}>Remove Music Progress Bar</span>
            </PlayerOption>
            <PlayerOption type="checkbox" id="show_platform_icon" name="showPlatform"
              checked={playerOptions?.showPlatform !== undefined}
              onChange={handleCheckboxChange} disabled={disableOptions}>
              <span className={styles?.player_customize_option_name}>Show Platform Logo</span>
            </PlayerOption>
          </div>
        </div>
        <footer className={styles?.customize_panel_footer}>
          <p>Copy this URL and use it on you streaming software:</p>
          <input type="text"
            className={`${styles?.input_text} ${styles?.full}`}
            readOnly value={finalURL}
            placeholder="Result URL"
          />
          <footer className={styles?.btns}>
            <button type="button"
              className={styles?.btn}
              onClick={() => CopyToClipboard(finalURL)}
              disabled={!finalURL}
            >
              Copy URL
            </button>
            <button type="button" className={styles?.btn} onClick={() => navigate('/')}>Back to Homepage</button>
          </footer>
        </footer>
      </aside>
      <main className={styles?.player_preview}>
        {finalURL ? (
          <iframe src={finalURL} title="Player Preview" />
        ) : (
          <code>Enter a valid player URL to preview it here.</code>
        )}
      </main>
    </div>
  )
}