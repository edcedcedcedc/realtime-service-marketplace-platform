import "dotenv/config";

export default () => ({
  expo: {
    name: "yyourappname",
    slug: "your-app",
    sdkVersion: "53.0.0",
    android: {
      package: "com.mycompany.myapp",
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY,
        },
      },
    },
    ios: {
      bundleIdentifier: "com.mycompany.myapp",
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      },
    },
  },
});
