/** @type {import('tailwindcss').Config} */
        module.exports = {
          content: [
            "./src/**/*.{html,ts}",
          ],
          theme: {
            extend: {
              colors: {
                'primary': '#1ba94c',
                'primary-dark': '#f8f9fa',
                'primary-light': '#c8e6c9',
                'secondary': '#39424e',
                'neutral': {
                  100: '#f8f9fa',
                  200: '#eaecef',
                  300: '#d0d7de',
                  600: '#57606a',
                  800: '#39424e',
                  900: '#121c24',
                },
                'warning': '#ffad0a',
                'error': '#e03434',
                'info': '#0088cc',
                'dark-bg': '#141c24',
                'dark-surface': '#1c2632',
                'dark-text': '#e6e6e6',
                'dark-border': '#2d3846',
              },
              fontFamily: {
                'sans': ['Open Sans', 'Helvetica', 'Arial', 'sans-serif'],
                'mono': ['Source Code Pro', 'Consolas', 'Monaco', 'monospace'],
              },
              boxShadow: {
                'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                'dropdown': '0 2px 5px 0 rgba(0, 0, 0, 0.15)',
              },
            },
          },
          darkMode: 'class',
          plugins: [],
        }
