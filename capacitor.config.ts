import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dotwisp.game',
  appName: 'Dotwisp',
  webDir: 'dist',
  backgroundColor: '#1c1c1c',
  ios: {
    contentInset: 'always',
    allowsLinkPreview: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      backgroundColor: '#1c1c1c',
    },
    StatusBar: {
      style: 'dark',
    },
  },
};

export default config;
