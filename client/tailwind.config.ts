import type { Config } from "tailwindcss";

/**
 * Tailwind CSS Configuration
 * This file defines the theme, plugins, and custom animations used throughout the dApp.
 */
const config: Config = {
  // Define the paths to all of your template files
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      
      // --- CUSTOM ANIMATION CONFIGURATION ---
      
      /**
       * 1. Keyframes
       * Defines the specific movements and opacity changes for CSS animations.
       */
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          // Starts invisible and 20px below its final position
          '0%': { opacity: '0', transform: 'translateY(20px)' }, 
          // Ends fully visible at its natural position
          '100%': { opacity: '1', transform: 'translateY(0)' },   
        },
      },
      
      /**
       * 2. Animation Classes
       * Combines keyframes with duration and easing to create reusable utility classes.
       */
      animation: {
        // Usage: className="animate-fade-in"
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        // Usage: className="animate-fade-in-up"
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards', 
      },

      // --- VISUAL DESIGN EXTENSIONS ---
      
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};

export default config;