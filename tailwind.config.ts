import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      spacing: {
        '2': '0.5rem',
        '4': '1rem',
      },
      backgroundColor: {
        'blue-50': 'rgb(239 246 255)',
        'green-50': 'rgb(240 253 244)',
        'yellow-50': 'rgb(254 252 232)',
        'red-50': 'rgb(254 242 242)',
      },
      borderColor: {
        'blue-200': 'rgb(191 219 254)',
        'green-200': 'rgb(187 247 208)',
        'yellow-200': 'rgb(254 240 138)',
        'red-200': 'rgb(254 202 202)',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#f3f4f6',
            a: {
              color: '#8b5cf6',
              '&:hover': {
                color: '#7c3aed',
              },
            },
            p: {
              color: '#f3f4f6',
            },
            h1: {
              color: '#f3f4f6',
            },
            h2: {
              color: '#f3f4f6',
            },
            h3: {
              color: '#f3f4f6',
            },
            h4: {
              color: '#f3f4f6',
            },
            strong: {
              color: '#f3f4f6',
            },
            code: {
              color: '#e5e7eb',
              backgroundColor: '#374151',
              borderRadius: '0.375rem',
              padding: '0.25rem 0.375rem',
            },
            pre: {
              backgroundColor: '#1f2937',
              color: '#e5e7eb',
              borderRadius: '0.5rem',
            },
            blockquote: {
              color: '#d1d5db',
              borderLeftColor: '#4b5563',
              backgroundColor: '#1f2937',
              borderRadius: '0.375rem',
              padding: '1rem',
            },
            ul: {
              color: '#f3f4f6',
            },
            ol: {
              color: '#f3f4f6',
            },
            li: {
              color: '#f3f4f6',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

export default config
