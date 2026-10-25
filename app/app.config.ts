import type { ConfigContext, ExpoConfig } from 'expo/config';
import brand from './brand.json';

/**
 * Single source of native config. Rename the product by editing brand.json.
 * Secrets never live here — only EXPO_PUBLIC_* values that are safe to ship.
 */
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: brand.name,
  slug: brand.slug,
  scheme: brand.scheme,
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  ios: {
    bundleIdentifier: brand.iosBundleId,
    supportsTablet: false,
    associatedDomains: [`applinks:${brand.webDomain}`],
    infoPlist: {
      NSCameraUsageDescription: 'Scan a shop QR code to open the shop and see its payment details.',
      NSLocationWhenInUseUsageDescription: 'Show shops near you and set your shop location.',
      NSPhotoLibraryUsageDescription: 'Choose photos for your profile, shop and products.',
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: brand.androidPackage,
    versionCode: 1,
    adaptiveIcon: {
      backgroundColor: brand.primaryColor,
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
    // Least-privilege: only what features need. No background location, no contacts, no SMS.
    permissions: [
      'android.permission.CAMERA',
      'android.permission.ACCESS_COARSE_LOCATION',
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.POST_NOTIFICATIONS',
    ],
    blockedPermissions: [
      'android.permission.RECORD_AUDIO',
      'android.permission.ACCESS_BACKGROUND_LOCATION',
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.READ_MEDIA_IMAGES',
      'android.permission.READ_MEDIA_VIDEO',
      'android.permission.SYSTEM_ALERT_WINDOW',
    ],
    // Android App Links: https://dukaan.app/s/<slug> opens the app when installed.
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: [{ scheme: 'https', host: brand.webDomain, pathPrefix: '/s/' }],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
  },
  web: { favicon: './assets/favicon.png', bundler: 'metro' },
  plugins: [
    'expo-router',
    'expo-sqlite',
    'expo-localization',
    [
      'expo-splash-screen',
      {
        image: './assets/splash-icon.png',
        imageWidth: 160,
        resizeMode: 'contain',
        backgroundColor: brand.splashBackground,
      },
    ],
    [
      'expo-camera',
      {
        cameraPermission: 'Scan a shop QR code to open the shop and see its payment details.',
        recordAudioAndroid: false,
      },
    ],
    [
      'expo-location',
      {
        locationWhenInUsePermission: 'Show shops near you and set your shop location.',
        isAndroidBackgroundLocationEnabled: false,
        isIosBackgroundLocationEnabled: false,
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission: 'Choose photos for your profile, shop and products.',
        cameraPermission: 'Take photos for your shop and products.',
        microphonePermission: false,
      },
    ],
    ['expo-notifications', { color: brand.primaryColor }],
  ],
  experiments: { typedRoutes: true },
  extra: {
    brand,
    router: {},
    eas: { projectId: process.env.EAS_PROJECT_ID || '7ac6c758-c27d-4941-b61e-f274411b3161' },
  },
});
