import playerSchema, { defaultPlayerOptions } from '../player.schema';
import { GetURLParams, IsEmpty, SafeBase64Decode, SafeBase64Encode, URLValidade } from '../functions/Utils';

export function buildPlayerURL(rawURL, platformData, options) {
  if (!URLValidade(rawURL))
    return '';

  const parsedURL = URL.parse(rawURL);

  if (parsedURL?.hostname !== window.location.hostname || parsedURL?.pathname !== '/player')
    return '';

  const params = new URLSearchParams(platformData || parsedURL.searchParams);

  params.delete('options');

  if (!params.has('platform'))
    params.set('platform', 'system');

  const playerOptions = new URLSearchParams();

  Object.entries(playerSchema).forEach(([key, schema]) => {
    const value = options[key];

    if (value === schema.default)
      return;

    playerOptions.set(key, value)
  });

  if ([...playerOptions].length > 0)
    params.set(
      'options',
      SafeBase64Encode(playerOptions.toString())
    );

  const result = import.meta.env.DEV ? `${parsedURL?.hostname}:${parsedURL?.port}` : parsedURL?.hostname;

  return `${parsedURL?.protocol}//${ result}${parsedURL?.pathname}?${params.toString()}`
}

export function getChangedOptions(options) {
  return Object.fromEntries(
    Object.entries(options).filter(([key, value]) =>
      value !== defaultPlayerOptions[key]
    )
  )
}

export function encodeOptions(options) {
  const changed = getChangedOptions(options);

  if (!Object.keys(changed).length)
    return '';

  return SafeBase64Encode(JSON.stringify(changed))
}

export function decodeOptions(value = '') {
  if (!value)
    return { ...defaultPlayerOptions };

  try {
    const params = new URLSearchParams(SafeBase64Decode(value));

    const options = { ...defaultPlayerOptions };

    Object.entries(playerSchema).forEach(([key, schema]) => {
      if (!params.has(key))
        return;

      let parsed = params.get(key);

      switch (schema.type) {
        case 'boolean':
          parsed = parsed === 'true';
          break;

        case 'number':
        case 'equalizer-input':
          parsed = Number(parsed);
          break;
        default:
          parsed = String(parsed);
      }

      options[key] = parsed
    });

    return options
  } catch {
    return { ...defaultPlayerOptions }
  }
}