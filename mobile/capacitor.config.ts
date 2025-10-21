import { defineConfig } from '@capacitor/cli';

// IMPORTANT: Update server.url to point to your running FastAPI server.
// - Android emulator: use http://10.0.2.2:8000
// - iOS simulator: use http://localhost:8000
// - Physical device: use http://<your-computer-LAN-IP>:8000

export default defineConfig({
  appId: 'com.fakejobs.app',
  appName: 'Fake Job Detector',
  webDir: 'www',
  server: {
    url: 'http://localhost:8000',
    cleartext: true
  },
});
