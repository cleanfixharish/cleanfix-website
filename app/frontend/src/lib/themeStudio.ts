export type HarmonyRule = 'complementary' | 'analogous' | 'triadic';

export type ThemeColors = {
  primary_color: string;
  accent_color: string;
  surface_color: string;
};

export type ThemePreset = {
  id: string;
  name: string;
  createdAt: string;
  baseColor: string;
  harmony: HarmonyRule;
  colors: ThemeColors;
};

export const THEME_PRESETS_KEY = 'cleanfix-theme-presets-v1';

export function normalizeHex(value: string, fallback = '#102E38') {
  const normalized = value.trim().toUpperCase();
  return /^#[0-9A-F]{6}$/.test(normalized) ? normalized : fallback;
}

function hexToRgb(hex: string) {
  const value = normalizeHex(hex).slice(1);
  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  };
}

function rgbToHsl({ r, g, b }: ReturnType<typeof hexToRgb>) {
  const channels = [r / 255, g / 255, b / 255];
  const max = Math.max(...channels);
  const min = Math.min(...channels);
  const delta = max - min;
  let hue = 0;
  if (delta) {
    if (max === channels[0]) hue = 60 * (((channels[1] - channels[2]) / delta) % 6);
    else if (max === channels[1]) hue = 60 * ((channels[2] - channels[0]) / delta + 2);
    else hue = 60 * ((channels[0] - channels[1]) / delta + 4);
  }
  if (hue < 0) hue += 360;
  const lightness = (max + min) / 2;
  const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));
  return { h: hue, s: saturation * 100, l: lightness * 100 };
}

function hslToHex(h: number, s: number, l: number) {
  const saturation = s / 100;
  const lightness = l / 100;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const segment = (((h % 360) + 360) % 360) / 60;
  const x = chroma * (1 - Math.abs((segment % 2) - 1));
  const values = segment < 1 ? [chroma, x, 0] : segment < 2 ? [x, chroma, 0] : segment < 3 ? [0, chroma, x] : segment < 4 ? [0, x, chroma] : segment < 5 ? [x, 0, chroma] : [chroma, 0, x];
  const match = lightness - chroma / 2;
  return `#${values.map((channel) => Math.round((channel + match) * 255).toString(16).padStart(2, '0')).join('')}`.toUpperCase();
}

export function hexToHslToken(hex: string) {
  const { h, s, l } = rgbToHsl(hexToRgb(hex));
  return `${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%`;
}

export function readableForeground(background: string) {
  const { r, g, b } = hexToRgb(background);
  const luminance = [r, g, b]
    .map((value) => value / 255)
    .map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4))
    .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
  return (luminance + 0.05) / 0.063 >= 1.05 / (luminance + 0.05) ? '#081F28' : '#FFFFFF';
}

function mixWithWhite(hex: string, ratio: number) {
  const { r, g, b } = hexToRgb(hex);
  const mix = (channel: number) => Math.round(channel + (255 - channel) * ratio);
  return `#${[mix(r), mix(g), mix(b)].map((value) => value.toString(16).padStart(2, '0')).join('')}`.toUpperCase();
}

export function generateLocalHarmony(baseColor: string, harmony: HarmonyRule) {
  const base = normalizeHex(baseColor);
  const { h, s, l } = rgbToHsl(hexToRgb(base));
  const offsets = harmony === 'complementary' ? [0, 180] : harmony === 'analogous' ? [0, -30, 30] : [0, 120, 240];
  return offsets.map((offset) => hslToHex(h + offset, Math.max(s, 42), Math.min(Math.max(l, 35), 62)));
}

export function paletteToTheme(baseColor: string, palette: string[]): ThemeColors {
  const base = normalizeHex(baseColor);
  const valid = palette.map((color) => normalizeHex(color, '')).filter(Boolean);
  return {
    primary_color: base,
    accent_color: valid.find((color) => color !== base) || valid[1] || '#B8842F',
    surface_color: mixWithWhite(base, 0.93),
  };
}

export function applyThemeVariables(colors: ThemeColors, root: HTMLElement = document.documentElement) {
  const primary = normalizeHex(colors.primary_color);
  const accent = normalizeHex(colors.accent_color, '#B8842F');
  const surface = normalizeHex(colors.surface_color, '#F7F2EA');
  const primaryForeground = readableForeground(primary);
  const accentForeground = readableForeground(accent);
  const variables: Record<string, string> = {
    '--cf-primary': primary,
    '--cf-accent': accent,
    '--cf-surface': surface,
    '--cf-primary-foreground': primaryForeground,
    '--cf-accent-foreground': accentForeground,
    '--primary': hexToHslToken(primary),
    '--primary-foreground': hexToHslToken(primaryForeground),
    '--accent': hexToHslToken(accent),
    '--accent-foreground': hexToHslToken(accentForeground),
    '--background': hexToHslToken(surface),
    '--ring': hexToHslToken(accent),
  };
  Object.entries(variables).forEach(([name, value]) => root.style.setProperty(name, value));
}

export function themeCssExport(colors: ThemeColors) {
  const primary = normalizeHex(colors.primary_color);
  const accent = normalizeHex(colors.accent_color, '#B8842F');
  const surface = normalizeHex(colors.surface_color, '#F7F2EA');
  return `:root {\n  --cf-primary: ${primary};\n  --cf-primary-foreground: ${readableForeground(primary)};\n  --cf-accent: ${accent};\n  --cf-accent-foreground: ${readableForeground(accent)};\n  --cf-surface: ${surface};\n}`;
}

export function themeTailwindExport(colors: ThemeColors) {
  return `// tailwind.config.js\nexport default {\n  theme: {\n    extend: {\n      colors: {\n        cleanfix: {\n          primary: '${normalizeHex(colors.primary_color)}',\n          accent: '${normalizeHex(colors.accent_color, '#B8842F')}',\n          surface: '${normalizeHex(colors.surface_color, '#F7F2EA')}',\n        },\n      },\n    },\n  },\n};`;
}
