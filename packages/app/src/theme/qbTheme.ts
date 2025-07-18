import {
  createBaseThemeOptions,
  createUnifiedTheme,
  genPageTheme,
  shapes,
} from '@backstage/theme';

export const qbLight = createUnifiedTheme({
  ...createBaseThemeOptions({
    palette: {
      mode: 'light',
      primary: {
        main: '#db363b',
        contrastText: '#333333',
      },
      secondary: {
        main: '#f50057',
        contrastText: '#333333',
      },
      background: {
        default: '#f9f9f9',
        paper: '#f9f9f9',
      },
      text: {
        primary: '#272727',
        secondary: '#555555',
      },
      navigation: {
        background: '#f9f9f9',
        indicator: '#272727',
        color: '#272727',
        selectedColor: '#272727',
        navItem: { hoverBackground: '#ffffff' },
      },
    },
  }),
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          '&:hover': {
            backgroundColor: '#ffcccb',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid #db363b',
          boxShadow: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: '#db363b',
          color: '#f9f9f9',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#f9f9f9',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            color: '#f9f9f9',
          },
          '&:hover': {
            color: '#ffcccb',
          },
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#f9f9f9',
        },
      },
    },
  },
  defaultPageTheme: 'home',
  pageTheme: {
    home: genPageTheme({
      colors: ['#db363b'],
      shape: shapes.wave,
      options: {
        fontColor: '#f6f6f6',
      },
    }),
    documentation: genPageTheme({
      colors: ['#db363b'],
      shape: shapes.wave,
      options: {
        fontColor: '#f6f6f6',
      },
    }),
    tool: genPageTheme({
      colors: ['#db363b'],
      shape: shapes.wave,
      options: {
        fontColor: '#f6f6f6',
      },
    }),
    service: genPageTheme({
      colors: ['#db363b'],
      shape: shapes.wave,
      options: {
        fontColor: '#f6f6f6',
      },
    }),
    website: genPageTheme({
      colors: ['#db363b'],
      shape: shapes.wave,
      options: {
        fontColor: '#f6f6f6',
      },
    }),
    library: genPageTheme({
      colors: ['#db363b'],
      shape: shapes.wave,
      options: {
        fontColor: '#f6f6f6',
      },
    }),
    other: genPageTheme({
      colors: ['#db363b'],
      shape: shapes.wave,
      options: {
        fontColor: '#f6f6f6',
      },
    }),
  },
});

export const qbDark = createUnifiedTheme({
  ...createBaseThemeOptions({
    palette: {
      mode: 'dark',
      primary: {
        main: '#db363b',
        contrastText: '#333333',
      },
      secondary: {
        main: '#f50057',
        contrastText: '#333333',
      },
      background: {
        default: '#333333',
        paper: '#333333',
      },
      text: {
        primary: '#ffffff',
        secondary: '#b4b4b4',
      },
      navigation: {
        background: '#424242',
        indicator: '#b4b4b4',
        color: '#b4b4b4',
        selectedColor: '#ffffff',
        // navItem: { hoverBackground: '#ffffff' },
      },
    },
  }),
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          '&:hover': {
            backgroundColor: '#ffcccb',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid #db363b',
          boxShadow: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: '#db363b',
          color: '#333333',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#333333',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            color: '#333333',
          },
          '&:hover': {
            color: '#cccccc',
          },
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#333333',
        },
      },
    },
  },
  defaultPageTheme: 'home',
  pageTheme: {
    home: genPageTheme({
      colors: ['#db363b'],
      shape: shapes.wave,
      options: {
        fontColor: '#f6f6f6',
      },
    }),
    documentation: genPageTheme({
      colors: ['#db363b'],
      shape: shapes.wave,
      options: {
        fontColor: '#f6f6f6',
      },
    }),
    tool: genPageTheme({
      colors: ['#db363b'],
      shape: shapes.wave,
      options: {
        fontColor: '#f6f6f6',
      },
    }),
    service: genPageTheme({
      colors: ['#db363b'],
      shape: shapes.wave,
      options: {
        fontColor: '#f6f6f6',
      },
    }),
    website: genPageTheme({
      colors: ['#db363b'],
      shape: shapes.wave,
      options: {
        fontColor: '#f6f6f6',
      },
    }),
    library: genPageTheme({
      colors: ['#db363b'],
      shape: shapes.wave,
      options: {
        fontColor: '#f6f6f6',
      },
    }),
    other: genPageTheme({
      colors: ['#db363b'],
      shape: shapes.wave,
      options: {
        fontColor: '#f6f6f6',
      },
    }),
  },
});
