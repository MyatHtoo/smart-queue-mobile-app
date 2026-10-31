const appJson = require("./app.json");

module.exports = {
  ...appJson.expo,
  extra: {
    ...appJson.expo.extra,
    eas: {
      ...appJson.expo.extra?.eas,
      projectId: "1e0cfd66-2569-4c30-a5ea-e2cd5c1b3dad",
    },
  },
  android: {
    ...appJson.expo.android,
    googleServicesFile:
      process.env.GOOGLE_SERVICES_JSON || appJson.expo.android.googleServicesFile,
  },
};
