// Tailwind config for the landing page (tokens copied from the Stitch design).
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/container-queries')],
  ...{
      darkMode: "class",
      theme: {
        extend: {
          colors: {
            primary: "#0B6E4F",
            "primary-pressed": "#08573F",
            "primary-soft": "#E8F5EF",
            "primary-container": "#0b6e4f",
            "on-primary": "#ffffff",
            "on-primary-container": "#98edc6",
            secondary: "#845400",
            "secondary-container": "#F5A000",
            "on-secondary-container": "#3A2100",
            "accent-saffron": "#F5A000",
            "accent-soft": "#FFF4DC",
            background: "#FAF8F5",
            surface: "#FAF8F5",
            "surface-card": "#FFFFFF",
            "surface-container": "#F3EDE7",
            "surface-container-low": "#F9F5F0",
            "surface-container-high": "#EDE7E0",
            "on-surface": "#1B1C1A",
            "on-surface-variant": "#4E524D",
            "text-muted": "#6F756E",
            "border-hairline": "#E6E1D9",
            "success-green": "#1E8E4E",
            "success-soft": "#DDF4E6",
            "danger-red": "#D93F3F",
            "danger-soft": "#FDE7E7",
            "info-blue": "#2F6FEB",
            "info-soft": "#E8F0FE",
            "warning-amber": "#B36B00",
            "warning-soft": "#FFF1D6"
          },
          fontFamily: {
            // Urdu glyphs aren't in Plus Jakarta Sans, so they fall through to Nastaliq automatically.
            sans: ['var(--font-jakarta)', 'var(--font-urdu-lite)', 'system-ui', 'sans-serif'],
          }
        }
      }
    },
};
