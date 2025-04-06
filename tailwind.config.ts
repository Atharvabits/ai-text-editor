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
            maxWidth: '100%',
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
