const playerSchema = {
  skin: {
    type: 'select',
    default: 'default',
    values: [{
      default: true,
      name: 'Default',
      value: 'default'
    }, {
      default: false,
      name: 'Alternative',
      value: 'alternative'
    }, {
      default: false,
      name: 'Card (Vertical)',
      value: 'vertical'
    }, {
      default: false,
      name: 'Compact',
      value: 'compact'
    }],
    ui: {
      label: 'Player Skin',
      category: 'Appearance'
    }
  },
  musicTimesAlign: {
    type: 'select',
    default: 'default',
    values: [{
      default: true,
      name: 'Between (default)',
      value: 'default'
    }, {
      default: false,
      name: 'Align Left',
      value: 'left'
    }, {
      default: false,
      name: 'Align Center',
      value: 'center'
    }, {
      default: false,
      name: 'Align Right',
      value: 'right'
    }],
    ui: {
      label: 'Music times align',
      category: 'Appearance'
    }
  },
  equalizer: {
    type: 'number',
    default: 0,
    max: 40,
    min: 0,
    ui: {
      label: 'Show Waves',
      disclaimer: 'Not compatible with compact skin',
      category: 'Appearance'
    }
  },
  showVinyl: {
    type: 'boolean',
    default: false,
    ui: {
      label: 'Replace album art with vinyl',
      disclaimer: 'Only compatible with compact skin',
      category: 'Appearance'
    }
  },
  reverse: {
    type: 'boolean',
    default: false,
    ui: {
      label: 'Swap album art (or vinyl) position',
      disclaimer: 'Not compatible with compact skin',
      category: 'Appearance'
    }
  },
  ultraMode: {
    type: 'boolean',
    default: false,
    ui: {
      label: 'Ultra Compact',
      disclaimer: 'Only compatible with compact skin',
      category: 'Appearance'
    }
  },
  squareBorder: {
    type: 'boolean',
    default: false,
    ui: {
      label: 'Square Layout',
      category: 'Appearance'
    }
  },
  showBarPointer: {
    type: 'boolean',
    default: false,
    ui: {
      label: 'Show pointer on progress bar',
      disclaimer: 'Not compatible with compact skin',
      category: 'Appearance'
    }
  },
  hideProgressBar: {
    type: 'boolean',
    default: false,
    ui: {
      label: 'Hide progress bar',
      category: 'Appearance'
    }
  },
  removeMusicTimes: {
    type: 'boolean',
    default: false,
    ui: {
      label: 'Remove music times',
      category: 'Appearance'
    }
  },
  removeDropShadow: {
    type: 'boolean',
    default: false,
    ui: {
      label: 'Remove drop shadow',
      disclaimer: 'Not compatible with transparent theme',
      category: 'Appearance'
    }
  },
  removeAlbumArt: {
    type: 'boolean',
    default: false,
    ui: {
      label: 'Remove musica album art',
      disclaimer: 'Not compatible with compact skin',
      category: 'Appearance'
    }
  },
  theme: {
    type: 'select',
    default: 'default',
    values: [{
      default: true,
      name: 'Default',
      value: 'default'
    }, {
      default: false,
      name: 'Dark Theme',
      value: 'dark'
    }, {
      default: false,
      name: 'Light Theme',
      value: 'light'
    }, {
      default: false,
      name: 'Vibrant (Light)',
      value: 'vibrant-light'
    }, {
      default: false,
      name: 'Vibrant (Dark)',
      value: 'vibrant-dark'
    }, {
      default: false,
      name: 'Transparent',
      value: 'transparent'
    }],
    ui: {
      label: 'Player Theme',
      category: 'Theme'
    }
  },
  textColor: {
    type: 'select',
    default: 'default',
    values: [{
      default: true,
      name: 'Light (default)',
      value: 'default'
    }, {
      default: false,
      name: 'Dark',
      value: 'dark'
    }],
    ui: {
      label: 'Text color',
      disclaimer: 'Only compatible with transparent theme',
      category: 'Theme'
    }
  },
  timeMode: {
    type: 'select',
    default: 'default',
    values: [{
      default: true,
      name: 'Total (default)',
      value: 'default'
    }, {
      default: false,
      name: 'Remaining',
      value: 'remaining'
    }],
    ui: {
      label: 'Music time mode',
      disclaimer: 'Not compatible with compact skin',
      category: 'Theme'
    }
  },
  removeContent: {
    type: 'boolean',
    default: false,
    ui: {
      label: 'Remove all content',
      disclaimer: 'Except album art/vinyl;\nNot compatible with compact skin',
      category: 'Theme'
    }
  },
  swapProgressBar: {
    type: 'boolean',
    default: false,
    ui: {
      label: 'Swap Progress bar and wave positions',
      disclaimer: 'Progress bar aside/between with music times',
      category: 'Theme'
    }
  },
  textAlignCenter: {
    type: 'boolean',
    default: false,
    ui: {
      label: 'Music infos align center',
      category: 'Theme'
    }
  },
  invertInfos: {
    type: 'boolean',
    default: false,
    ui: {
      label: 'Swap music infos',
      category: 'Theme'
    }
  },
  invertContent: {
    type: 'boolean',
    default: false,
    ui: {
      label: 'Invert content',
      disclaimer: 'This invert content order (not include album art);\nNot compatible with compact skin',
      category: 'Theme'
    }
  },
  invertFooterContent: {
    type: 'boolean',
    default: false,
    ui: {
      label: 'Invert features order',
      disclaimer: 'This invert progress bar, waves and music times order',
      category: 'Theme'
    }
  },
  showPlatformIcon: {
    type: 'boolean',
    default: false,
    ui: {
      label: 'Show platform logo',
      category: 'Theme'
    }
  },
  sleepAfter: {
    type: 'number',
    default: 10,
    max: 60,
    min: 6,
    ui: {
      label: 'Hide after (Sleep)',
      category: 'General'
    }
  },
  css: {
    type: 'text',
    default: '',
    ui: {
      label: 'Custom CSS',
      category: 'Advanced'
    }
  },
  // host: {
  //   type: 'text',
  //   default: 'localhost',
  //   ui: {
  //     label: 'Address',
  //     disabled: true,
  //     disclaimer: 'Bridge websocket server address',
  //     category: 'Advanced'
  //   }
  // },
  // port: {
  //   type: 'text',
  //   default: '1997',
  //   values: '1997',
  //   ui: {
  //     label: 'Host',
  //     disabled: true,
  //     disclaimer: 'Bridge websocket server port',
  //     category: 'Advanced'
  //   }
  // }
};

export const defaultPlayerOptions = Object.fromEntries(
  Object.entries(playerSchema).map(([key, option]) => [
    key,
    option.default
  ])
);

export default playerSchema;