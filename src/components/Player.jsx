import { useState, useEffect, useRef } from 'react'
import { Vibrant } from 'node-vibrant/browser'
import { GetURLParams, ConvertTime } from '../functions/Utils'
import { useMusicPlatform } from '../hooks/MusicPlatform.js'

import { AlternativeSkin, CompactSkin, DefaultSkin, VerticalSkin } from './PlayerSkins'

const params = GetURLParams();

function getThemeFromPalette(palette) {
  const swatches = Object.values(palette)
    .filter(Boolean);

  if (!swatches.length)
    return null;

  function rgbToHsl([r, g, b]) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    let h, s;
    const l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;

      s = l > .5
        ? d / (2 - max - min)
        : d / (max + min);

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;

        case g:
          h = (b - r) / d + 2;
          break;

        default:
          h = (r - g) / d + 4;
      }

      h /= 6
    }

    return [h, s, l]
  }

  function scoreBackground(swatch) {
    const [, saturation, lightness] = rgbToHsl(swatch.rgb);

    const darkness = 1 - lightness;

    return (
      swatch.population * 2 +
      saturation * 120 +
      darkness * 180
    )
  }

  const background = swatches
    .sort((a, b) => scoreBackground(b) - scoreBackground(a))[0];

  const secondary = swatches
    .filter(s => s !== background)
    .sort((a, b) => b.population - a.population)[0] ?? background;

  const [r, g, b] = background.rgb;

  const luminance =
    (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

  return {
    background: background.rgb,
    backgroundSecondary: secondary.rgb,

    text:
      luminance > .55
        ? [32, 32, 32]
        : [245, 245, 245],

    textSecondary:
      luminance > .55
        ? [80, 80, 80]
        : [200, 200, 200],

    accent: secondary.rgb
  }
}

export default function Player({ options = {} }) {

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
    if (!player.current)
      return;

    let cancelled = false;

    const clearTheme = () => {
      [
        '--background-color',
        '--background-secondary-color',
        '--text-color',
        '--text-secondary-color',
        '--accent-color'
      ].forEach(property =>
        player.current?.style.removeProperty(property)
      )
    };

    if (options?.theme !== 'vibrant' || !music?.albumCover) {
      clearTheme();
      return
    }

    Vibrant.from(music.albumCover)
      .getPalette()
      .then(palette => {
        if (cancelled) return;

        const theme = getThemeFromPalette(palette);

        if (!theme) {
          clearTheme();
          return
        }

        player.current.style.setProperty(
          '--background-color',
          theme.background.join(',')
        );

        player.current.style.setProperty(
          '--background-secondary-color',
          theme.backgroundSecondary.join(',')
        );

        player.current.style.setProperty(
          '--text-color',
          theme.text.join(',')
        );

        player.current.style.setProperty(
          '--text-secondary-color',
          theme.textSecondary.join(',')
        );

        player.current.style.setProperty(
          '--accent-color',
          theme.accent.join(',')
        );
      })
      .catch(console.error);

    return () => cancelled = true;
  }, [music?.albumCover, options?.theme]);

  useEffect(() => {
    if (music?.isPlaying) return;

    const timer = setTimeout(() => {
      console.log('Sleeping...');
      setSleeping(true);
    }, ((options?.sleepAfter ?? 10) * 1000));

    return () => clearTimeout(timer);
  }, [music?.isPlaying, options?.sleepAfter]);

  if (!isConnected && !hasReceivedData)
    return null;

  if (!hasReceivedData)
    console.log('Waiting to receive data....');

  if (music?.isPlaying && sleeping)
    setSleeping(false);

  const attrs = {
    ref: player,
    music: music || {},
    sleeping: sleeping,
    ultraMode: options?.ultraMode,
    options: options,
    platformIcon
  };

  switch (options?.skin) {
    case 'compact':
      return (<CompactSkin {...attrs} />);
    case 'vertical':
    case 'card':
      return (<VerticalSkin {...attrs} />);
    case 'alternative':
    case 'alternate':
      return (<AlternativeSkin {...attrs} />);
    default:
      return (<DefaultSkin {...attrs} />);
  }
}
