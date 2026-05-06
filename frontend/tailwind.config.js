/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0e141b",
        mist: "#f2f4f7",
        teal: "#1f7a6d",
        sand: "#f7efe5",
        ember: "#d9742c"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(31,122,109,0.18), 0 20px 60px rgba(14,20,27,0.14)"
      }
    }
  },
  plugins: []
};
