const androidKey = process.env.GOOGLE_MAPS_ANDROID_API_KEY?.trim();
const iosKey = process.env.GOOGLE_MAPS_IOS_API_KEY?.trim();

module.exports = {
  expo: {
    name: "expo-sdk",
    slug: "expo-sdk",
    version: "1.0.0",
    orientation: "default",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    ios: { supportsTablet: true, requireFullScreen: true, bundleIdentifier: "com.example.exposdk" },
    android: { package: "com.example.exposdk" },
    plugins: [["react-native-maps", {
      ...(androidKey ? { androidGoogleMapsApiKey: androidKey } : {}),
      ...(iosKey ? { iosGoogleMapsApiKey: iosKey } : {}),
    }], ["expo-image-picker", {
      photosPermission: "L’application utilise vos photos pour les afficher sur la carte.",
      cameraPermission: "L’application utilise la caméra pour placer vos photos sur la carte.",
      microphonePermission: false,
    }], ["expo-location", {
      locationWhenInUsePermission: "L’application utilise votre position pour recentrer la carte.",
      isIosBackgroundLocationEnabled: false,
      isAndroidBackgroundLocationEnabled: false,
      isAndroidForegroundServiceEnabled: false,
    }], ["expo-media-library", {
      savePhotosPermission: "L’application enregistre les photos prises dans votre galerie.",
      granularPermissions: ["photo"],
      isAccessMediaLocationEnabled: false,
    }], ["expo-screen-orientation", { initialOrientation: "PORTRAIT_UP" }]],
  },
};
