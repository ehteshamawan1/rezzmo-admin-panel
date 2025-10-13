/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Rezzmo Brand Colors
        primary: {
          DEFAULT: '#00879E', // Vivid Azure
          dark: '#005F73',    // Deep Blue
          light: '#94D2BD',   // Light Cyan
        },
        neutral: {
          white: '#FFFFFF',
          offWhite: '#F8F9FA',
          lightGray: '#E9ECEF',
          mediumGray: '#6C757D',
          darkGray: '#212529',
        },
        status: {
          success: '#28A745',
          warning: '#FD7E14',
          error: '#DC3545',
          energy: '#FFC107',
        },
      },
    },
  },
  plugins: [],
  // Disable Ant Design CSS conflicts
  corePlugins: {
    preflight: false,
  },
}
