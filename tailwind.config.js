/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background) / <alpha-value>)',
        foreground: 'hsl(var(--foreground) / <alpha-value>)',
        primary: 'hsl(var(--primary) / <alpha-value>)',
        secondary: 'hsl(var(--secondary) / <alpha-value>)',
        muted: 'hsl(var(--muted) / <alpha-value>)',
        accent: 'hsl(var(--accent) / <alpha-value>)',
        destructive: 'hsl(var(--destructive) / <alpha-value>)',
        success: 'hsl(var(--success) / <alpha-value>)',
        warning: 'hsl(var(--warning) / <alpha-value>)',
        info: 'hsl(var(--info) / <alpha-value>)',
        border: 'hsl(var(--border) / <alpha-value>)',
        card: 'hsl(var(--card) / <alpha-value>)',
        'muted-foreground': 'hsl(var(--muted-foreground) / <alpha-value>)',
        burgundy: 'hsl(var(--burgundy) / <alpha-value>)',
        sage: 'hsl(var(--sage) / <alpha-value>)',
        mustard: 'hsl(var(--mustard) / <alpha-value>)',
        terracotta: 'hsl(var(--terracotta) / <alpha-value>)',
        navy: 'hsl(var(--navy) / <alpha-value>)',
        cream: 'hsl(var(--cream) / <alpha-value>)',
        gold: 'hsl(var(--gold) / <alpha-value>)',
        slate: 'hsl(var(--slate) / <alpha-value>)',
        olive: 'hsl(var(--olive) / <alpha-value>)',
        rust: 'hsl(var(--rust) / <alpha-value>)',
      },
      fontFamily: {
        heading: ['var(--font-heading)'],
        body: ['var(--font-body)'],
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        vintage: 'var(--radius)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
      },
      backgroundImage: {
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-card': 'var(--gradient-card)',
        'gradient-balance': 'var(--gradient-balance)',
        'texture-paper': 'var(--texture-paper)',
      },
      animation: {
        'fade-in': 'fade-in 400ms ease-out both',
        'slide-up': 'slide-up 500ms ease-out both',
      },
    },
  },
  plugins: [],
};

