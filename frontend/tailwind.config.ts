import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#09090B',
        sidebar: '#0C0C0F',
        card: '#111114',
        cardHover: '#18181B',
        borderSubtle: 'rgba(255,255,255,0.08)',
        primary: '#8B5CF6',
        primaryHover: '#7C3AED',
        textMain: '#FAFAFA',
        secondary: '#A1A1AA',
        muted: '#71717A',
        success: '#22C55E',
        error: '#EF4444'
      },
    },
  },
  plugins: [],
};
export default config;