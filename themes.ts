export interface ThemeColors {
  'brand-primary': string;
  'brand-secondary': string;
  'brand-accent': string;
  'brand-light': string;
  'brand-muted': string;
}

export interface Theme {
  name: string;
  displayName: string;
  colors: ThemeColors;
}

export const themes: Theme[] = [
  {
    name: 'default',
    displayName: 'Deep Blue',
    colors: {
      'brand-primary': '#0D0D2B',
      'brand-secondary': '#1E1E48',
      'brand-accent': '#3D52D5',
      'brand-light': '#FFFFFF',
      'brand-muted': '#A9A9A9',
    },
  },
  {
    name: 'graphite',
    displayName: 'Graphite',
    colors: {
      'brand-primary': '#1A202C',
      'brand-secondary': '#2D3748',
      'brand-accent': '#4299E1',
      'brand-light': '#F7FAFC',
      'brand-muted': '#A0AEC0',
    },
  },
  {
    name: 'forest',
    displayName: 'Forest Green',
    colors: {
      'brand-primary': '#1A2E29',
      'brand-secondary': '#2E4B43',
      'brand-accent': '#38A169',
      'brand-light': '#F7FAFC',
      'brand-muted': '#A0AEC0',
    },
  },
  {
    name: 'crimson',
    displayName: 'Crimson Red',
    colors: {
      'brand-primary': '#2D131A',
      'brand-secondary': '#4A212A',
      'brand-accent': '#E53E3E',
      'brand-light': '#F7FAFC',
      'brand-muted': '#A0AEC0',
    },
  },
    {
    name: 'royal',
    displayName: 'Royal Purple',
    colors: {
      'brand-primary': '#2C1D3D',
      'brand-secondary': '#442B5A',
      'brand-accent': '#805AD5',
      'brand-light': '#F7FAFC',
      'brand-muted': '#A0AEC0',
    },
  },
];
