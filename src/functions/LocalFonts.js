import { defaultFont } from './GoogleFonts';

export const fontOptions = [];

const loadedFonts = new Map();

const LOCAL_FONT_EXTENSIONS = [
  '.ttf',
  '.otf',
  '.woff',
  '.woff2'
];

const LOCAL_FONT_MIME_TYPES = {
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

function isLocalFontAccessSupported() {
  return (
    typeof window !== 'undefined' &&
    typeof window.queryLocalFonts === 'function'
  );
}

function isFontLoadingSupported() {
  return (
    typeof window !== 'undefined' &&
    typeof window.FontFace === 'function' &&
    document?.fonts
  );
}

function getFileExtension(fileName = '') {
  const lastDot = fileName.lastIndexOf('.');

  if (lastDot < 0)
    return '';

  return fileName.slice(lastDot).toLowerCase();
}

function isSupportedFontFile(file) {
  if (!file)
    return false;

  const extension = getFileExtension(file.name);

  return LOCAL_FONT_EXTENSIONS.includes(extension);
}

function addFontOption(name) {
  if (!name || fontOptions.some(font => font.value === name))
    return;

  fontOptions.push({
    default: name === defaultFont,
    name,
    value: name
  });
}

function sortFontOptions() {
  fontOptions.sort((a, b) => {
    if (a.default !== b.default)
      return a.default ? -1 : 1;

    return a.name.localeCompare(b.name);
  });
}

function updateFontOptions(fonts = []) {
  fontOptions.length = 0;

  fonts
    .filter(Boolean)
    .forEach(addFontOption);

  sortFontOptions();
}

export async function checkAndLoadLocalFonts() {
  if (!isLocalFontAccessSupported())
    return false;

  try {
    if (navigator.permissions?.query) {
      const permission = await navigator.permissions.query({
        name: 'local-fonts'
      });

      if (permission.state === 'denied')
        return false;
    }

    const data = await window.queryLocalFonts();

    const families = [
      ...new Set(
        data
          ?.map(font => font?.family)
          .filter(Boolean)
      )
    ];

    if (families.length === 0)
      return false;

    updateFontOptions(families);

    return true;
  } catch (error) {
    console.warn(
      '[LocalFonts] Unable to access installed fonts:',
      error
    );

    return false;
  }
}

export async function loadLocalFont(file) {
  if (!isFontLoadingSupported())
    throw new Error('Font loading is not supported by this browser.');

  if (!isSupportedFontFile(file))
    throw new Error(
      'Unsupported font format. Use TTF, OTF, WOFF or WOFF2.'
    );

  const extension = getFileExtension(file.name);
  const fontName = file.name.slice(0, -extension.length).trim();

  if (!fontName)
    throw new Error('Unable to determine the font name.');

  unloadLocalFont(fontName);

  const objectURL = URL.createObjectURL(
    new Blob([await file.arrayBuffer()], {
      type: LOCAL_FONT_MIME_TYPES[extension]
    })
  );

  try {
    const font = new FontFace(fontName, `url("${objectURL}")`);

    await font.load();

    document.fonts.add(font);

    loadedFonts.set(fontName, {
      font,
      objectURL
    });

    addFontOption(fontName);
    sortFontOptions();

    dispatchFontsUpdated();

    return fontName;
  } catch (error) {
    URL.revokeObjectURL(objectURL);

    console.error(error);

    throw new Error(
      `Unable to load font "${fontName}".`
    );
  }
}


export function unloadLocalFont(fontName) {
  if (!fontName)
    return false;

  const loaded = loadedFonts.get(fontName);

  if (!loaded)
    return false;

  document.fonts.delete(loaded.font);
  URL.revokeObjectURL(loaded.objectURL);

  loadedFonts.delete(fontName);

  const index = fontOptions.findIndex(
    font => font.value === fontName
  );

  if (index !== -1)
    fontOptions.splice(index, 1);

  dispatchFontsUpdated();

  return true;
}

export function isLocalFontLoaded(fontName) {
  return loadedFonts.has(fontName);
}

export function getLoadedLocalFonts() {
  return [...loadedFonts.keys()];
}

function dispatchFontsUpdated() {
  if (typeof window === 'undefined')
    return;

  window.dispatchEvent(
    new Event('local-fonts-updated')
  );
}


if (typeof window !== 'undefined') {
  window.handleLoadLocalFonts = async () => {
    const success = await checkAndLoadLocalFonts();

    if (success)
      dispatchFontsUpdated();

    return success;
  };
}