/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        background: 'hsl(220, 17%, 97%)',
        surface: 'hsl(0, 0%, 100%)',

        // Funcionales
        primary: {
          DEFAULT: 'hsl(221, 83%, 53%)',
          light: 'hsl(221, 83%, 65%)',
          dark: 'hsl(221, 83%, 40%)',
        },
        success: {
          DEFAULT: 'hsl(142, 76%, 36%)',
          light: 'hsl(142, 76%, 90%)',
          dark: 'hsl(142, 76%, 25%)',
        },
        danger: {
          DEFAULT: 'hsl(0, 72%, 51%)',
          light: 'hsl(0, 72%, 95%)',
          dark: 'hsl(0, 72%, 40%)',
        },
        warning: {
          DEFAULT: 'hsl(38, 92%, 50%)',
          light: 'hsl(38, 92%, 95%)',
          dark: 'hsl(38, 92%, 40%)',
        },
        info: {
          DEFAULT: 'hsl(199, 89%, 48%)',
          light: 'hsl(199, 89%, 95%)',
        },
        secondary: 'hsl(210, 40%, 98%)',
        accent: 'hsl(271, 81%, 56%)',
        destructive: 'hsl(0, 72%, 51%)',

        // Categorias (10 colores distintos)
        category: {
          food: 'hsl(142, 71%, 45%)',
          transport: 'hsl(221, 83%, 53%)',
          health: 'hsl(0, 72%, 51%)',
          education: 'hsl(271, 81%, 56%)',
          entertainment: 'hsl(340, 82%, 52%)',
          services: 'hsl(38, 92%, 50%)',
          shopping: 'hsl(199, 89%, 48%)',
          home: 'hsl(25, 75%, 47%)',
          tech: 'hsl(262, 52%, 47%)',
          other: 'hsl(218, 17%, 46%)',
        },

        // UI Base
        border: 'hsl(214, 32%, 91%)',
        muted: 'hsl(210, 40%, 96%)',
        foreground: 'hsl(222, 47%, 11%)',
        'foreground-muted': 'hsl(215, 16%, 47%)',
        'muted-foreground': 'hsl(215, 16%, 47%)',
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        hero: ['4rem', { lineHeight: '1', fontWeight: '700' }],
        stat: ['3rem', { lineHeight: '1.1', fontWeight: '700' }],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
        'card-hover':
          '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      },
      animation: {
        shimmer: 'shimmer 2s linear infinite',
        float: 'float 3s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
