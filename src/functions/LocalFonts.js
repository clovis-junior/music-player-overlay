import { defaultFont } from './GoogleFonts';

export let fontOptions = [];

export async function checkAndLoadLocalFonts() {
  if (typeof window === 'undefined' || !('queryLocalFonts' in window))
    return false;

  try {
    if (navigator.permissions && navigator.permissions.query) {
      const permissionStatus = await navigator.permissions.query({ name: 'local-fonts' });
      
      if (permissionStatus.state === 'denied')
        return false;
      
    }
    const data = await window.queryLocalFonts();
    const items = Array.from(new Set(data?.map(font => font.family))).sort();

    if (items.length > 0) {
      fontOptions.length = 0;

      fontOptions.push(...items.map(font => ({
        default: font === defaultFont,
        name: font,
        value: font
      })));
      
      return true
    }
  } catch (error) {
    console.warn('Local fonts has not working: ', error);
  }

  return false
}

if (typeof window !== 'undefined') {
  window.handleLoadLocalFonts = async function () {
    const success = await checkAndLoadLocalFonts();

    if (success)
      window.dispatchEvent(new Event('local-fonts-updated'));
  }
}