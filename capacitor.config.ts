import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tictactoe.game',
  appName: 'Tic Tac Toe',
  webDir: 'out',
  server: {
    // No live-reload URL — use bundled static files
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: '#0a0a0a',
      showSpinner: false,
    },
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
