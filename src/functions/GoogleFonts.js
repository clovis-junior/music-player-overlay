export const fontList = (await getGoogleFonts()) || [];
export const defaultFont = 'Noto Sans Display';
export const fontOptions = fontList.map(font => ({
  default: font === defaultFont,
  name: font,
  value: font
}));

if (fontOptions.length === 0) {
  fontOptions.push({
    default: true,
    name: defaultFont,
    value: defaultFont
  })
}

async function getGoogleFonts(sort = 'popularity') {
  const params = new URLSearchParams({
    key: import.meta.env.VITE_GOOGLE_API_KEY,
    sort
  });

  try {
    const response = await fetch(
      `https://www.googleapis.com/webfonts/v1/webfonts?${params}`
    );

    if (!response.ok) return null;

    const data = await response.json();
    const items = data?.items?.map(font => font?.family);

    return items && items?.length > 0 ? items : null
  } catch {
    return null
  }
}