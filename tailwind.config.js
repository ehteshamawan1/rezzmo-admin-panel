/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Rezzmo Brand Colors (Updated: October 26, 2025 - Lavender/Purple Theme)
        primary: {
          DEFAULT: '#7B68A6', // Purple accent
          lavender: {
            light: '#ebdff3',  // Light lavender
            DEFAULT: '#ede1eb', // Very light lavender-pink
            purple: '#ece0ee',  // Light lavender-purple
            blue: '#e7ddf6',    // Light lavender-blue
          },
          medium: {
            DEFAULT: '#d3cdd9', // Medium lavender-gray
            warm: '#d1cbd7',    // Medium warm lavender
          },
        },
        accent: {
          gold: '#e7b85c',    // Golden yellow (stats, highlights)
          rose: '#d9bbc5',    // Soft rose-pink (secondary)
        },
        surface: {
          cream: '#f5e9d9',   // Warm cream (cards)
          cream2: '#f0e5e1',  // Soft cream (alternate)
        },
        neutral: {
          gray: {
            light: '#cbc5d1', // Cool lavender-gray
            DEFAULT: '#cfc9d5', // Medium lavender-gray
            dark: '#cec8d4',  // Soft lavender-gray
          },
        },
        text: {
          primary: '#2D2D2D',   // Almost black
          secondary: '#5A5A5A', // Dark gray
          tertiary: '#8B8B8B',  // Medium gray
          emphasis: '#7B68A6',  // Purple accent (links)
        },
        status: {
          success: '#10b981',   // Emerald (Success states)
          warning: '#f59e0b',   // Amber (Warnings)
          error: '#ef4444',     // Bright Red (Errors)
          energy: '#e7b85c',    // Golden yellow (Energy bars)
        },
      },
      backgroundImage: {
        'gradient-main': 'linear-gradient(135deg, #ebdff3 0%, #ede1eb 100%)',
        'gradient-card': 'linear-gradient(135deg, #ece0ee 0%, #e7ddf6 100%)',
        'gradient-accent': 'linear-gradient(135deg, #e7b85c 0%, #f5e9d9 100%)',
        'gradient-rose': 'linear-gradient(135deg, #d9bbc5 0%, #ede1eb 100%)',
        'gradient-purple': 'linear-gradient(135deg, #7B68A6 0%, #d2ccd8 100%)',
        'gradient-success': 'linear-gradient(135deg, #10b981 0%, #d9bbc5 100%)',
      },
    },
  },
  plugins: [],
  // Disable Ant Design CSS conflicts
  corePlugins: {
    preflight: false,
  },
}
