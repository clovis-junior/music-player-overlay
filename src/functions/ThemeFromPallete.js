const WHITE = [245, 245, 245];
const BLACK = [30, 30, 30];

const clamp = value =>
  Math.max(0, Math.min(255, Math.round(value)));

const mix = (from, to, amount) =>
  from.map((value, i) =>
    clamp(value + (to[i] - value) * amount)
  );

const adjust = (rgb, amount) =>
  mix(
    rgb,
    amount > 0 ? [255, 255, 255] : [0, 0, 0],
    Math.abs(amount)
  );

const luminance = ([r, g, b]) =>
  (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

const contrast = (a, b) => {
  const la = luminance(a) + .05;
  const lb = luminance(b) + .05;

  return la > lb
    ? la / lb
    : lb / la;
};

const pick = (...colors) =>
  colors.find(Boolean);

const scoreAccent = (color, background) =>
  contrast(color.rgb, background);

export function getThemeFromPalette(palette, darkMode = true) {

  const {
    DarkVibrant,
    DarkMuted,
    Vibrant,
    Muted,
    LightVibrant,
    LightMuted
  } = palette;

  const backgroundSwatch = pick(
    ...(darkMode
      ? [
        DarkVibrant,
        DarkMuted,
        Muted,
        Vibrant,
        LightMuted,
        LightVibrant
      ]
      : [
        LightVibrant,
        LightMuted,
        Vibrant,
        Muted,
        DarkMuted,
        DarkVibrant
      ])
  );

  const secondarySwatch = pick(
    ...(darkMode
      ? [
        DarkMuted,
        Muted,
        Vibrant,
        LightMuted,
        LightVibrant
      ]
      : [
        LightMuted,
        Muted,
        Vibrant,
        DarkMuted,
        DarkVibrant
      ]),
    backgroundSwatch
  );

  const background = adjust(
    backgroundSwatch.rgb,
    darkMode ? -.18 : .12
  );

  const backgroundSecondary = adjust(
    secondarySwatch.rgb,
    darkMode ? -.10 : .06
  );

  const accentSwatch = [
    Vibrant,
    LightVibrant,
    DarkVibrant,
    Muted,
    LightMuted,
    DarkMuted
  ]
    .filter(Boolean)
    .sort(
      (a, b) =>
        scoreAccent(b, background) -
        scoreAccent(a, background)
    )[0] ?? secondarySwatch;

  let accent = adjust(
    accentSwatch.rgb,
    darkMode ? .08 : -.08
  );

  if (contrast(accent, background) < 2) {
    accent = adjust(
      accent,
      darkMode ? .25 : -.25
    );
  }

  const text =
    contrast(background, WHITE) >
      contrast(background, BLACK)
      ? WHITE
      : BLACK;

  const textSecondary = mix(
    text,
    text === WHITE
      ? [160, 160, 160]
      : [120, 120, 120],
    .35
  );

  return {
    background,
    backgroundSecondary,
    accent,
    text,
    textSecondary
  };
}