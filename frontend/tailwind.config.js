/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: "#090a0f",
          surface: "#11141f",
          hover: "#161a28",
          subtle: "#0e1018",
          border: "#1e2230",
          borderLight: "#2d3448",
        },
        telemetry: {
          green: "#10b981",
          emerald: "#059669",
          amber: "#f59e0b",
          rose: "#ef4444",
          cyan: "#06b6d4",
          violet: "#8b5cf6",
          blue: "#3b82f6",
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
