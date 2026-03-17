/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // ゲーム用カスタムカラー
        'game-dark': '#0d0d1a',
        'game-darker': '#111',
        'game-border': '#1a1a3a',
        'game-border-light': '#333',
        'game-purple': '#7c3aed',
        'game-purple-light': '#c084fc',
        'game-purple-dark': '#1a0a30',
        'game-text': '#e8e8f0',
        'game-text-muted': '#8888cc',
      },
      fontFamily: {
        mono: ['monospace'],
      },
    },
  },
  plugins: [],
}
