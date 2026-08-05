
import { useEffect } from 'react'
import Player from '../components/Player'
import playerSchema from '../player.schema'
import { GetURLParams } from '../functions/Utils'
import { defaultFont } from '../functions/GoogleFonts'
import style from '../assets/scss/player.module.scss'

const params = GetURLParams();

const rawOptions = new URLSearchParams(
  atob(params.get('options') || '')
);

const options = Object.fromEntries(
  Object.entries(playerSchema).map(([key, option]) => {
    const rawValue = rawOptions.get(key);

    if (rawValue === null)
      return [key, option.default];

    let value;

    switch (option.type) {
      case 'boolean':
        value = rawValue === 'true' || rawValue === '1';
        break;
      case 'number': {
        const parsedNumber = Number(rawValue);
        value = isNaN(parsedNumber) ? option.default : parsedNumber;
        break;
      }
      case 'select':
      case 'text':
      default:
        value = rawValue;
        break;
    }

    return [key, value];
  })
);

export default function Plugin() {
  const theme = options?.css;
  const selectedFont = options?.fontName?.trim() || defaultFont;

  useEffect(() => {
    if (!selectedFont) return;

    const formattedFont = selectedFont.replace(/\s+/g, '+');
    const fontUrl = `https://fonts.googleapis.com/css2?family=${formattedFont}:wght@100..900&display=swap`;

    let link = document.querySelector(`link[href="${fontUrl}"]`);

    if (!link) {
      link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = fontUrl;
      document.head.appendChild(link);
    }

    return () => {
      if (link && link.parentNode)
        link.parentNode.removeChild(link);
    }
  }, [selectedFont]);

  useEffect(() => {
    if (!theme) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = decodeURIComponent(theme);
    link.crossOrigin = 'anonymous';

    document.head.appendChild(link);

    return () => {
      if (link.parentNode)
        link.parentNode.removeChild(link);
    }
  }, [theme]);

  return (
    <div className={style?.music_player_page}>
      <Player options={options} />
    </div>
  )
}
