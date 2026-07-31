import { useState, useEffect, useRef } from 'react'
import { Vibrant } from 'node-vibrant/browser'
import { GetURLParams, ConvertTime } from '../functions/Utils'
import { useMusicPlatform } from '../hooks/MusicPlatform.js'

import { AlbumArtCardSkin, AlternativeSkin, CompactSkin, DefaultSkin, VerticalSkin } from './PlayerSkins'
import { getThemeFromPalette } from '../functions/ThemeFromPallete.js'

const params = GetURLParams();

export default function Player({ options = {} }) {
  const platform = params.get('platform') || 'user';

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
        '--background-pallete-2nd',
        '--text-color',
        '--text-pallete-2nd',
        '--accent-color'
      ].forEach(property =>
        player.current?.style.removeProperty(property)
      )
    };

    if (!options?.theme?.includes('vibrant') || !music?.albumCover) {
      clearTheme();
      return
    }

    Vibrant.from(music.albumCover)
      .getPalette()
      .then(palette => {
        if (cancelled) return;

        const theme = getThemeFromPalette(palette, options?.theme?.includes('dark'));

        if (!theme) {
          clearTheme();
          return
        }

        const variables = {
          '--background-color': theme.background,
          '--background-pallete-2nd': theme.backgroundSecondary,
          '--text-color': theme.text,
          '--text-pallete-2nd': theme.textSecondary,
          '--accent-color': theme.accent
        };

        Object.entries(variables).forEach(([property, value]) =>
          player.current.style.setProperty(property, value.join(','))
        )
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

  if (!isConnected)
    return null;

  if (!hasReceivedData) {
    console.log('Waiting to receive data....');
    return null
  }

  if (music?.isPlaying && sleeping)
    setSleeping(false);

  const skins = {
    'default': DefaultSkin,
    'compact': CompactSkin,
    'compact-ultra': CompactSkin,
    'card': AlbumArtCardSkin,
    'vertical': VerticalSkin,
    'alternative': AlternativeSkin
  };

  const attrs = {
    ref: player,
    music: music || {},
    sleeping: sleeping,
    ultraMode: options?.skin?.includes('ultra') || false,
    options: options,
    platformIcon
  };

  const Skin = skins[options?.skin] || skins['default'];

  return <Skin {...attrs} />
}
