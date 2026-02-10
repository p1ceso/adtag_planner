/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      fontSize: {
        // Standardized Type Scale (Pro Max)
        'xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '-0.01em' }],     // 12px
        'sm': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '-0.01em' }], // 14px
        'base': ['1rem', { lineHeight: '1.5rem', letterSpacing: '-0.01em' }],     // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.015em' }],// 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.015em' }], // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.02em' }],      // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.02em' }], // 30px
      },
      colors: {
        // DESIGN SYSTEM "Clean & Corporate" - Base
        // Background Global (Ice Blue Suave)
        "page-bg": "#F8FAFC", // Slate-50 tweaked for cleaner look

        // Superfícies (Cards)
        "surface-white": "#FFFFFF",
        "surface-subtle": "#F9FAFB",

        // Tipografia / Contraste
        "text-primary": "#0F172A",   // Slate-900 (High contrast)
        "text-secondary": "#475569", // Slate-600 (Good readability)
        "text-muted": "#94A3B8",     // Slate-400 (De-emphasized)
        "border-light": "#E2E8F0",   // Slate-200 (Subtle borders)

        // Cores da Marca (Refinadas para Fundo Claro)
        "brand": {
          blue: "#2563EB",    // Blue-600 (Modern, compliant)
          orange: "#EA580C",  // Orange-600 (Vibrant)
          green: "#16A34A",   // Green-600
          red: "#DC2626",     // Red-600
          yellow: "#CA8A04",  // Yellow-600
          purple: "#9333EA",  // Purple-600
        },

        // Cor de Ação Principal
        "primary": "#EA580C",
        "primary-hover": "#C2410C",
      },
      boxShadow: {
        'card': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
        'modal': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 20px -5px rgba(234, 88, 12, 0.3)', // Discrete glow for primary actions
      },
      borderRadius: {
        'card': '12px', // Slightly tighter radius for modern look
        'input': '10px',
      }
    },
  },
  plugins: [],
}
