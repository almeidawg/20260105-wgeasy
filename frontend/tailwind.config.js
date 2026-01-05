/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        wg: {
          primary: "#F25C26",
          secondary: "#8B5CF6",
          neutral: "#2E2E2E",
          bg: "#F3F3F3",
          card: "#FFFFFF",
        },
        // shadcn/ui colors
        popover: "#FFFFFF",
        "popover-foreground": "#0a0a0a",
        accent: "#f4f4f5",
        "accent-foreground": "#18181b",
        muted: "#f4f4f5",
        "muted-foreground": "#71717a",
      },
      fontFamily: {
        oswald: ["Oswald", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
        roboto: ["Roboto", "sans-serif"],
      },
      // Design System WG - Tipografia Compacta (reduzida ~15%)
      fontSize: {
        // Títulos (antes: 20px -> 17px, 18px -> 15px, etc)
        'h1': ['1.0625rem', { lineHeight: '1.3', fontWeight: '700' }], // 17px
        'h2': ['0.9375rem', { lineHeight: '1.35', fontWeight: '600' }], // 15px
        'h3': ['0.8125rem', { lineHeight: '1.4', fontWeight: '600' }], // 13px
        // Texto corpo (antes: 14px -> 12px)
        'body': ['0.75rem', { lineHeight: '1.5' }], // 12px
        'body-sm': ['0.6875rem', { lineHeight: '1.45' }], // 11px
        // Labels e tags (antes: 12px -> 10px)
        'label': ['0.625rem', { lineHeight: '1.4', fontWeight: '500' }], // 10px
        'tag': ['0.5625rem', { lineHeight: '1.3', fontWeight: '600' }], // 9px
      },
      // Espaçamentos compactos
      spacing: {
        'compact-1': '0.125rem', // 2px
        'compact-2': '0.25rem',  // 4px
        'compact-3': '0.375rem', // 6px
        'compact-4': '0.5rem',   // 8px
        'compact-5': '0.625rem', // 10px
        'compact-6': '0.75rem',  // 12px
      },
      borderRadius: {
        xl: "14px",
      },
      // Safe area para bottom nav mobile
      padding: {
        'safe-bottom': 'env(safe-area-inset-bottom, 0px)',
      },
    },
  },
  plugins: [],
};
