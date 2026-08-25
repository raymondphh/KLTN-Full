/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  // AntD ships its own CSS reset (via its CSS-in-JS engine). If Tailwind's
  // preflight is left on, it silently overrides AntD's button/input/table
  // base styles (border-radius, font, focus rings, etc). Disabling it keeps
  // AntD components pixel-perfect while Tailwind utility classes
  // (spacing, layout, flex/grid, colors) still work everywhere else.
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        // Keep in sync with the `token` passed to AntD's <ConfigProvider>
        // in src/App.js, so `bg-brand-500` and AntD's primary color match.
        brand: {
          50: "#eef4ff",
          100: "#d9e6ff",
          500: "#1677ff",
          600: "#0958d9",
          700: "#0642a6",
        },
      },
    },
  },
  plugins: [],
};
