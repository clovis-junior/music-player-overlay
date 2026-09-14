export function CreateSettings(options = {}) {
  const data = { options };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], {
    type: 'application/json'
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');

  link.href = url;
  link.download = 'music-overlay-settings.json';

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url)
}

export function LoadSettings(file) {
  return new Promise((resolve, reject) => {
    if (!(file instanceof File))
      return reject(new Error('Invalid settings file.'));

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);

        if (!data || typeof data !== 'object')
          throw new Error('Invalid settings format.');

        if (!data.options || typeof data.options !== 'object')
          throw new Error('Settings options not found.');

        resolve(data.options)
      } catch {
        reject(new Error('Failed to load settings.'))
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read settings file.'))
    };

    reader.readAsText(file)
  })
}