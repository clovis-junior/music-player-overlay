import { useMemo, useState } from 'react'
import { GetURLParams, IsEmpty, URLValidade, CopyToClipboard, GenerateRandomString } from '../functions/Utils'
import styles from '../assets/scss/customize.module.scss'
import Alert from '../components/Alert'
import playerSchema, { defaultPlayerOptions } from '../player.schema'
import Player from '../components/Player'
import { buildPlayerURL, decodeOptions } from '../functions/PlayerOptions'
import { useNavigate } from 'react-router-dom'

function WaveInput({
  min = 0,
  max = 40,
  step = 1,
  value = 0,
  onChange
}) {
  function normalizeWaveValue(value) {
    if (value === 0) return 0;
    if (value < 2) return 0;
    if (value < 4) return 4;

    return value
  }

  function handleChange(e) {
    if (e.target.value === '')
      return onChange('');

    const value = Number(e.target.value);

    if (value < min || value > max)
      return;

    onChange(value)
  }

  function handleBlur() {
    if (value === '')
      return onChange(0);

    const normalized = normalizeWaveValue(value);

    if (normalized !== value)
      onChange(normalized);
  }

  return (
    <input
      type="number"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={handleChange}
      onBlur={handleBlur} />
  )
}

function Switch(props) {
  const { id, checked, onChange, ...inline } = props;
  if (!id) return null;

  return (
    <label htmlFor={id} className={styles?.switch}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        {...inline} />
      <span className={styles?.slider} />
    </label>
  )
}

function Settings(props) {
  const { name = null, children } = props;

  return (
    <div className={styles?.widget_settings_group}>
      {name && (<h2 className={styles?.name}>{name}</h2>)}
      {children}
    </div>
  )
}

function Setting(props) {
  const { name = '', disclaimer = '', disabled = false, children } = props;

  if (!name) return null;

  const classes = [
    styles?.widget_setting_item,
    disabled ? styles?.disabled : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <aside className={styles?.infos}>
        <span className={styles?.label}>{name}</span>
        {disclaimer && (<span className={styles?.disclaimer}>{disclaimer}</span>)}
      </aside>
      <div className={styles?.content}>
        {children}
      </div>
    </div>
  )
}

function Select({ id, value, options = [], onChange }) {
  if (!id || options.length <= 0)
    return null;

  return (
    <select
      id={id}
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}>
      {options.map((option, index) => (
        <option key={index} value={option.value} checked={option.default}>
          {option.name}
        </option>
      ))}
    </select>
  )
}

function Field({ option, value, onChange }) {
  const safeValue = value ?? option?.default ?? '';

  switch (option?.type) {
    case 'boolean':
      return (
        <Switch
          id={option?.key}
          checked={Boolean(value ?? option?.default ?? false)}
          onChange={onChange}
        />
      );
    case 'equalizer-input':
      return (
        <WaveInput
          min={option?.min}
          max={option?.max}
          value={value ?? option?.default ?? 0}
          onChange={onChange}
        />
      );
    case 'number':
      return (
        <input
          type="number"
          value={value}
          min={option?.min}
          max={option?.max}
          onChange={e => onChange(Number(e.target.value))} />
      );
    case 'text':
      return (
        <input
          type="text"
          value={safeValue}
          onChange={e => onChange(e.target.value)} />
      );
    case 'select':
      return (
        <Select
          id={option?.key}
          value={safeValue}
          options={option?.values}
          onChange={onChange} />
      );
    default:
      return null;
  }
}

function parsePlayerURL(value = '') {
  if (IsEmpty(value) || !URLValidade(value)) {
    return {
      isValid: false,
      data: {},
      options: { ...defaultPlayerOptions }
    };
  }

  const params = GetURLParams(value);
  const rawOptions = params?.get('options');
  const decoded = decodeOptions(rawOptions);

  const data = params?.list ? params.list() : {};

  return {
    isValid: true,
    data,
    options: {
      ...defaultPlayerOptions,
      ...(decoded || {})
    }
  }
}

export default function Customize() {
  const navigate = useNavigate();
  const params = GetURLParams();

  const [alerts, setAlerts] = useState([]);

  const initialURL = params?.has('url')
    ? decodeURIComponent(params?.get('url'))
    : '';

  const [playerURL, setPlayerURL] = useState(initialURL);

  const parsed = useMemo(
    () => parsePlayerURL(playerURL),
    [playerURL]
  );

  const [platformData, setPlatformData] = useState(parsed?.data);
  const [options, setOptions] = useState(() => {
    return {
      ...defaultPlayerOptions,
      ...(parsed?.options || {})
    }
  });

  const finalURL = useMemo(() => {
    return buildPlayerURL(playerURL, platformData, options);
  }, [playerURL, platformData, options]);

  const disabled = useMemo(() => {
    return IsEmpty(playerURL) || !URLValidade(playerURL);
  }, [playerURL]);

  const groups = useMemo(() => {
    return Object.entries(playerSchema).reduce((result, [key, option]) => {
      const category = option.ui.category;

      if (!result[category])
        result[category] = [];

      result[category].push({
        key,
        ...option
      });

      return result
    }, {})
  }, []);

  function handleURLChange(event) {
    const nextURL = event.target.value;
    setPlayerURL(nextURL);

    if (IsEmpty(nextURL) || !URLValidade(nextURL)) {
      setPlatformData({});
      setOptions({ ...defaultPlayerOptions });
      return
    }

    const parsed = parsePlayerURL(nextURL);

    setPlatformData(parsed.data);
    setOptions({ ...defaultPlayerOptions, ...parsed.options });
  }

  function resetOptions() {
    setOptions({ ...defaultPlayerOptions });
  }

  function openPlayer() {
    if (!finalURL)
      return;

    window.open(finalURL, '_blank', 'noopener,noreferrer');
  }

  function showAlert(type, message, timeout = 3000) {
    const id = GenerateRandomString();

    setAlerts(current => [
      ...current,
      { id, type, message }
    ]);

    setTimeout(() => {
      setAlerts(current =>
        current.filter(alert => alert.id !== id)
      );
    }, timeout)
  }

  return (
    <div className={styles?.widget_page}>
      <header className={styles?.widget_header}>
        <input id="url" type="text"
          className={`${styles?.input_text} ${styles?.full}`}
          value={playerURL}
          onChange={handleURLChange}
          readOnly={params?.has('url')}
          placeholder="Paste your URL Player here"
        />
        <aside className={styles?.buttons}>
          <button className={styles?.button} onClick={() => {
            if (!finalURL)
              return false;

            resetOptions();

            showAlert('success', 'Default settings has loaded!')
          }} disabled={disabled}>
            Set Default Settings
          </button>
          <button className={styles?.button} onClick={() => navigate('/')}>
            Back to Homepage
          </button>
        </aside>
      </header>
      <main className={styles?.widget_content}>
        <aside className={styles?.widget_settings}>
          {Object.entries(groups).map(([group, fields]) => (
            <Settings key={group} name={group}>
              {fields?.map(field => (
                <Setting
                  key={field?.key}
                  name={field?.ui?.label}
                  disclaimer={field?.ui?.disclaimer}
                  disabled={disabled || field?.ui?.disabled}>
                  <Field
                    id={options[field.key]}
                    option={field}
                    value={options[field.key]}
                    onChange={(value) =>
                      setOptions(prev => ({
                        ...prev,
                        [field.key]: value
                      }))
                    } />
                </Setting>
              ))}
            </Settings>
          ))}
        </aside>
        <div className={styles?.widget_preview}>
          {!IsEmpty(finalURL) && (<iframe src={finalURL} title="Player Preview" />)}
          <div className={styles?.alerts}>
            {alerts.map(alert => (
              <Alert key={alert.id} type={alert.type}>
                {alert.message}
              </Alert>
            ))}
          </div>
        </div>
      </main>
      <footer className={styles?.widget_footer}>
        <div className={styles?.widget_url_result}
          onClick={() => {
            if (!finalURL)
              return false;

            const copy = CopyToClipboard(finalURL);

            showAlert(
              copy ? 'success' : 'error',
              copy
                ? 'URL copied successfully!'
                : 'Failed to copy URL.'
            );
          }}>
          <span className={styles?.label}>Click to copy this URL and use it on you streaming software</span>
          <input type="text" readOnly={true} value={finalURL} />
        </div>
        <aside className={styles?.buttons} onClick={openPlayer}>
          <button className={styles?.button} disabled={!finalURL}>
            Open on new Window
          </button>
        </aside>
      </footer>
    </div>
  )
}