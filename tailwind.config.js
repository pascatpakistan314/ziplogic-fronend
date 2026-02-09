/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #3b82f6, 0 0 10px #3b82f6' },
          '100%': { boxShadow: '0 0 20px #3b82f6, 0 0 30px #3b82f6' },
        }
      }
    },
  },
  plugins: [],
}










// export default {
//   content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
//   theme: {
//     extend: {
//       keyframes: {
//         nebPulse: { "0%,100%": { transform: "scale(1)", opacity: "1" }, "50%": { transform: "scale(1.3)", opacity: "0.5" } },
//         shoot: { "0%": { opacity: "0", transform: "translateX(0) rotate(-30deg)" }, "3%": { opacity: "1" }, "12%": { opacity: "0", transform: "translateX(400px) rotate(-30deg)" }, "100%": { opacity: "0" } },
//         flyL: { "0%": { left: "108%" }, "100%": { left: "-18%" } },
//         flyR: { "0%": { left: "-18%" }, "100%": { left: "108%" } },
//         planetFloat: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-20px)" } },
//         float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-16px)" } },
//         wave: { "0%,100%": { transform: "rotate(-10deg)" }, "50%": { transform: "rotate(10deg)" } },
//         ping: { "75%,100%": { transform: "scale(1.6)", opacity: "0" } },
//         blink: { "50%": { opacity: "0.3" } },
//       },
//       animation: {
//         nebPulse12: "nebPulse 12s ease-in-out infinite",
//         nebPulse16: "nebPulse 16s ease-in-out infinite",
//         nebPulse20: "nebPulse 20s ease-in-out infinite",
//         shoot5: "shoot 5s linear infinite",
//         shoot55: "shoot 5.5s linear infinite",
//         shoot6: "shoot 6s linear infinite",
//         shoot7: "shoot 7s linear infinite",
//         flyL22: "flyL 22s linear infinite",
//         flyR30: "flyR 30s linear infinite",
//         flyL38: "flyL 38s linear infinite",
//         flyR26: "flyR 26s linear infinite",
//         planetFloat20: "planetFloat 20s ease-in-out infinite",
//         planetFloat25: "planetFloat 25s ease-in-out infinite",
//         planetFloat18: "planetFloat 18s ease-in-out infinite",
//         float6: "float 6s ease-in-out infinite",
//         float7: "float 7s ease-in-out infinite",
//         wave2: "wave 2s ease-in-out infinite",
//         ping2: "ping 2s cubic-bezier(0,0,0.2,1) infinite",
//         blink15: "blink 1.5s infinite",
//       },
//     },
//   },
//   plugins: [],
// };
