import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.pragyanamclasses',
  appName: 'Pragyanam Classes',
  webDir: 'dist',
  server: {
    url: 'https://6df64e87-35e9-4ae7-a7b2-d5dad9bce267.lovableproject.com?forceHideBadge=true',
    cleartext: true
  }
};

export default config;
