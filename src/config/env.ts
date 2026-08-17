// @env is injected by react-native-dotenv from .env file at build time
import { API_URL, GOOGLE_WEB_CLIENT_ID, NODE_ENV } from '@env';

/**
 * Mobile App Environment & API Configuration
 * ─────────────────────────────────────────────
 * To change the backend URL: edit .env file only — no code changes needed!
 *
 * .env               → used by default (dev + production)
 * .env.production    → used when building a release APK/AAB
 */
export const ENV = {
  API_URL: API_URL || 'https://arihant-gold-app-backend-production.up.railway.app/api/v1',
  GOOGLE_WEB_CLIENT_ID: GOOGLE_WEB_CLIENT_ID || '616920380028-qri8ec2mnb13c9vshsmeemmuh2r3inub.apps.googleusercontent.com',
  APP_ENV: NODE_ENV || 'production',
  APP_VERSION: '1.0.0',
};
