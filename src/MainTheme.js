const midnightBlack = '#0E131D';
const deepGrey = '#1a1f28';
const powderBlue = '#A9B7C1';
const cyan = '#6ae8fa';
const darkslateGray = '#262b34';
const white5 = 'rgba(255, 255, 255, 0.05)';
const white10 = 'rgba(255, 255, 255, 0.10)';
const white20 = 'rgba(255, 255, 255, 0.20)';

const darkModeComponents = {
  components: {
    MuiAvatar: {
      styleOverrides: {
        root: {
          background: deepGrey,
          color: powderBlue,
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          background: deepGrey,
        },
        outlined: {
          background: midnightBlack,
          color: 'white',
        }
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: midnightBlack,
        }
      }
    }
  }
}

const getDesignTokens = mode => ({
  typography: {
    fontFamily: '"Montserrat", Roboto, Arial, sans-serif',
  },
  palette: mode === 'dark' ? {
    mode: 'dark',
    primary: {
      main: cyan,
    },
    secondary: {
      main: darkslateGray,
    },
    background: {
      default: midnightBlack,
      userInputBackground: white5,
      activeBG: '#26323D',
      tabButton: {
        active: white20,
        default: white5,
      },
      icon: {
        default: white10
      }
    },
    border: {
      lines: '#3B3E46',
      activeBG: '#26323D',
    },
    text: {
      primary: powderBlue,
      secondary: '#FFF',
      button: {
        primary: '#0E131D'
      }
    },
    icon: {
      fill: {
        default: 'white'
      }
    }
  } : {
    mode: 'light',
  },
  ...(mode === 'dark' ? darkModeComponents : {}),
});

export default getDesignTokens;