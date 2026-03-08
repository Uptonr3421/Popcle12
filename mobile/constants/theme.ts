/**
 * Pop Culture CLE Brand Theme
 * Colors sourced from https://popculture-cle-project.vercel.app/
 */

export const Colors = {
  // Primary brand colors
  pink: '#ff3b8d',
  orange: '#ff7b32',
  yellow: '#ffcc33',
  cyan: '#46bbff',
  green: '#39ff14',
  ink: '#1f1715',
  beige: '#f5f0ea',
  white: '#ffffff',

  // Semantic
  primary: '#ff3b8d',
  secondary: '#ff7b32',
  accent: '#ffcc33',
  background: '#fff9f5',    // warm near-white
  card: '#ffffff',
  text: '#1f1715',
  textMuted: 'rgba(31,23,21,0.55)',
  border: 'rgba(31,23,21,0.12)',
  error: '#e02020',
  success: '#25d59a',

  // Dark mode variants
  dark: {
    background: '#1a0d0a',
    card: '#2a1510',
    text: '#fff5ee',
    textMuted: 'rgba(255,245,238,0.6)',
    border: 'rgba(255,255,255,0.12)',
  },
} as const;

export const Gradients = {
  primary: ['#ff3b8d', '#ff7b32'] as [string, string],
  yellow: ['#ffcc33', '#ff7b32'] as [string, string],
  cool: ['#46bbff', '#39ff14'] as [string, string],
  full: ['#ff3b8d', '#ff7b32', '#ffcc33', '#46bbff'] as string[],
  pinkOnly: ['#ff3b8d', '#ff69b4'] as [string, string],
} as const;

export const Typography = {
  // Font weights
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,

  // Font sizes
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  '2xl': 30,
  '3xl': 36,
  '4xl': 44,
  display: 52,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const Shadow = {
  sm: {
    shadowColor: '#1f1715',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#ff3b8d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  lg: {
    shadowColor: '#ff3b8d',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 12,
  },
} as const;
