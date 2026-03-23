export function AddZero(number = 0) {
    return String(number).padStart(2, '0');
}

export function IsEmpty(variable) {
    return (typeof variable === 'undefined' || variable === null ||
        (typeof variable === 'string' && variable.trim().length <= 0) ||
        (Array.isArray(variable) && variable.length <= 0) ||
        (variable instanceof Object && Object.keys(variable).length <= 0))
}

export function GenerateRandomString(length = 8, uppercase = true, numbers = true, special = false) {
    let chars = 'abcdefghijklmnopqrstuvwxyz';
    if (uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (numbers) chars += '0123456789';
    if (special) chars += '!@#$%&*';

    if (!chars.length || length <= 0) return '';

    const array = new Uint32Array(length);
    crypto.getRandomValues(array);

    return Array.from(array, n => chars[n % chars.length]).join('');
}

export function URLValidade(value) {
    const filter = /^(https?):\/\/(?:www\.)?([a-zA-Z0-9-:]{1,256})\.([a-zA-Z0-9.]{2,})\b([a-zA-Z0-9-_()@:%+.~#?&/=]*)$/is;
    return (filter.test(value)) ? true : false;
}

export function ConvertTime(time = 0) {
    time = Number(time);

    if (!Number.isFinite(time) || time < 0)
        time = 0;

    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    return (hours > 0) ? `${AddZero(hours)}:${AddZero(minutes)}:${AddZero(seconds)}` : `${AddZero(minutes)}:${AddZero(seconds)}`;
}

export function GetURLParams(path = window.location.href) {
  const queryIndex = path.indexOf('?');
  const queryString = queryIndex >= 0 ? path.slice(queryIndex + 1).replace(/#/g, '&') : '';
  const searchParams = new URLSearchParams(queryString);

  return {
    data: Object.fromEntries(searchParams.entries()),

    list() {
      return Object.fromEntries(searchParams.entries());
    },

    set(param, value) {
      return searchParams[param] = value;
    },

    get(param) {
      return searchParams.get(param) ?? null;
    },

    has(param) {
      return searchParams.has(param);
    },

    delete(param) {
      searchParams.delete(param);
    }
  };
}

export async function CopyToClipboard(text) {
  if (IsEmpty(text)) {
    window.alert('Could not copy the URL.');
    return false;
  }

  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      window.alert('URL copied!');
      return true;
    } catch (error) {
      console.error('Clipboard API failed:', error);
    }
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.setAttribute('readonly', '');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = 0;
    textarea.style.top = 0;

    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    const success = document?.execCommand('copy');

    document.body.removeChild(textarea);

    if (success) {
      window.alert('URL copied!');
      return true;
    }

    window.alert('Could not copy the URL.');
    return false;
  } catch (error) {
    console.error('Fallback copy failed:', error);
    window.alert('Could not copy the URL.');
    return false;
  }
}