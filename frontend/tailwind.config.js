/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f0f1a',
        primary: '#7c3aed',
        secondary: '#06b6d4',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        surface: 'rgba(255, 255, 255, 0.05)',
        textPrimary: '#f1f5f9',
        textMuted: '#94a3b8',
        borderGlass: 'rgba(255, 255, 255, 0.08)'
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'auth-gradient': 'linear-gradient(135deg, #0f0f1a, #1a1a2e)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography')
  ],
}
