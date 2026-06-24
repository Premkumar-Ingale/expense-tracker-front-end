/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Premium light theme palette
        background: '#f8fafc',
        surface: '#ffffff',
        border: '#e2e8f0',
        text: {
          main: '#0f172a',
          muted: '#64748b',
        },
        primary: {
          DEFAULT: '#6366f1', // Indigo 500
          hover: '#4f46e5', // Indigo 600
          light: '#e0e7ff', // Indigo 100
        },
        success: {
          DEFAULT: '#10b981', // Emerald 500
          light: '#d1fae5', // Emerald 100
        },
        danger: {
          DEFAULT: '#ef4444', // Red 500
          light: '#fee2e2', // Red 100
        }
      },
      boxShadow: {
        'glass': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'premium': '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
      }
    },
  },
  plugins: [],
}
