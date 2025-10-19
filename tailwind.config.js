/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Rezzmo Brand Colors (Updated: October 17, 2025)
        primary: {
          DEFAULT: '#00ffff', // Electric Cyan (Main brand color)
          sky: '#04d9ff',     // Sky Blue (Secondary)
          turquoise: '#2dd4bf', // Turquoise (Accent)
        },
        depth: {
          cyan: '#0891b2',    // Deep Cyan (Important buttons)
          teal: '#0e7490',    // Dark Teal (Primary text, emphasis)
          midnight: '#164e63', // Midnight Blue (Headers, dark text)
        },
        neutral: {
          white: '#FFFFFF',
          ice: '#F0FDFF',     // Ice White (Secondary backgrounds)
          cool: '#E0F2F1',    // Cool Gray (Borders, dividers)
          medium: '#78909C',  // Medium Gray (Secondary text)
          charcoal: '#1E293B', // Charcoal (Primary text on white)
        },
        status: {
          success: '#10b981', // Emerald (Success states)
          warning: '#f59e0b', // Amber (Warnings)
          error: '#ef4444',   // Bright Red (Errors)
          energy: '#06b6d4',  // Energy Cyan (Streaks, power-ups)
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #00ffff 0%, #04d9ff 50%, #2dd4bf 100%)',
        'gradient-energy': 'linear-gradient(135deg, #06b6d4 0%, #00ffff 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0e7490 0%, #164e63 100%)',
      },
    },
  },
  plugins: [],
  // Disable Ant Design CSS conflicts
  corePlugins: {
    preflight: false,
  },
}
