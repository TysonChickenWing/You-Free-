import type { Config } from 'tailwindcss';

// Mirrors the color/spacing tokens from the original design so the web
// version reads as the same product, not a reskin.
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#F7F8FA',
        surface: '#FFFFFF',
        border: '#E4E7EC',
        'text-primary': '#14171F',
        'text-secondary': '#5B6472',
        'text-muted': '#9AA2AF',
        primary: '#FF7A45',
        'primary-muted': '#FFE7DB',
        'on-primary': '#FFFFFF',
        golf: '#2E7D5B',
        'golf-muted': '#DFF3E8',
        'on-golf': '#FFFFFF',
        success: '#2E7D5B',
        danger: '#D6483F',
        'danger-muted': '#FBE4E2',
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '20px',
      },
    },
  },
  plugins: [],
};

export default config;
