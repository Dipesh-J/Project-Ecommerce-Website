// Design tokens from the provided design system
const designTokens = {
  colors: {
    primary: "#735F32",
    primaryVariant: "#C69749",
    background: { 
      default: "#000000", 
      surface: "#282A3A" 
    },
    text: { 
      primary: "#ffffff", 
      secondary: "rgba(255, 255, 255, 0.6)" 
    },
    accents: {
      success: "#735F32",
      warning: "#C69749",
      error: "#ff4444",
      white: "#ffffff",
      light: "rgba(255, 255, 255, 0.6)"
    }
  },
  typography: {
    fontFamily: {
      body: "'Poppins', sans-serif",
      heading: "'Poppins', sans-serif"
    },
    fontSize: {
      xs: "0.7rem",
      sm: "0.95rem",
      base: "1rem",
      lg: "1.2rem",
      xl: "1.5rem",
      "2xl": "2rem",
      "3xl": "2.5rem",
      "4xl": "5rem"
    },
    fontWeight: { 
      light: 300, 
      normal: 400, 
      medium: 500, 
      semibold: 600 
    },
    lineHeight: { 
      normal: 1.7 
    }
  },
  spacing: {
    xs: "0.5rem",
    sm: "1rem",
    md: "1.5rem",
    lg: "2rem",
    xl: "2.4rem",
    "2xl": "3rem",
    "3xl": "4rem",
    "4xl": "5rem",
    "5xl": "6rem",
    "6xl": "8rem"
  },
  borderRadius: {
    sm: "0.4rem",
    md: "0.5rem",
    lg: "1rem",
    xl: "2rem",
    full: "50%"
  },
  shadows: { 
    navbar: "0px 4px 8px rgba(0, 0, 0, 0.15)" 
  },
  breakpoints: {
    sm: "600px",
    md: "768px",
    lg: "1024px",
    xl: "1200px"
  },
  container: {
    widthLg: "75%",
    widthMd: "86%",
    widthSm: "90%",
    maxWidth: "1200px"
  },
  transitions: {
    default: "all 0.3s ease-in-out",
    fast: "all 0.2s ease-out",
    color: "color 0.3s ease-in-out",
    background: "background-color 0.3s ease-in-out"
  }
};

export default designTokens;
