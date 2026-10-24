const path = require("path");

module.exports = {
  preset: "jest-expo",
  transform: {
    // ODD 006 T5: scoped babel config without the nativewind plugin, which
    // breaks babel-core 7.28 repo-wide (see babel.jest.js). Metro builds are
    // unaffected (they use babel.config.js).
    "^.+\\.(js|jsx|ts|tsx)$": [
      "babel-jest",
      { configFile: path.join(__dirname, "babel.jest.js") },
    ],
  },
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@ordo-todo/.*)",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect"],
  setupFiles: ["<rootDir>/jest.setup.js"],
  moduleDirectories: [
    "node_modules",
    path.resolve(__dirname, "../../node_modules"),
  ],
};
