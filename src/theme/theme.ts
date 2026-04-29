import { ColorSchemeName } from 'react-native';

export type AppTheme = {
  mode: 'light' | 'dark';
  colors: {
    background: string;
    surface: string;
    elevated: string;
    text: string;
    muted: string;
    border: string;
    accent: string;
    accentText: string;
    danger: string;
    chip: string;
    input: string;
  };
};

export function getTheme(scheme: ColorSchemeName): AppTheme {
  const isDark = scheme === 'dark';

  return {
    mode: isDark ? 'dark' : 'light',
    colors: isDark
      ? {
          background: '#111315',
          surface: '#191C1F',
          elevated: '#22262A',
          text: '#F3F4F4',
          muted: '#A9B0B7',
          border: '#30363C',
          accent: '#F7C948',
          accentText: '#1E1B10',
          danger: '#FF6B6B',
          chip: '#2B3136',
          input: '#171A1D',
        }
      : {
          background: '#FAF8F3',
          surface: '#FFFFFF',
          elevated: '#F0ECE3',
          text: '#202124',
          muted: '#686C73',
          border: '#E1DED7',
          accent: '#F2B705',
          accentText: '#25200A',
          danger: '#D93025',
          chip: '#EEE8DA',
          input: '#FFFFFF',
        },
  };
}
