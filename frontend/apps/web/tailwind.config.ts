import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        secondary: 'var(--secondary)',
        'muted-foreground': 'var(--muted-foreground)',
        border: 'var(--border)',
        accent: '#C9A84C',
        'accent-dark': '#dbc06a',
      },
      borderRadius: { none: '0', sm: '0', DEFAULT: '0', md: '0', lg: '0', xl: '0', '2xl': '0', '3xl': '0', full: '9999px' },
    },
  },
  plugins: [],
};
export default config;