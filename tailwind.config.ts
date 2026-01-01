import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0E0E12',
        'dark-sidebar': '#111216',
        'dark-hover': '#1A1B21',
        'dark-node': '#1A1C22',
        'dark-border': '#2A2D35',
        'text-primary': '#F4F4F5',
        'text-secondary': '#B0B3C0',
        'grid-dot': '#2A2B33',
        'accent-yellow': '#F5D90A',
        'accent-mint': '#A5F3FC',
        'error': '#FF6B6B',
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;

