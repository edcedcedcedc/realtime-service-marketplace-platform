/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom", // <-- allows some RN-like globals
  transform: {
    "^.+\\.(ts|tsx|js|jsx)$": "babel-jest", // <-- use Babel instead of ts-jest
  },
  transformIgnorePatterns: [
    "node_modules/(?!(react-native|@react-native|@react-navigation|react-clone-referenced-element)/)"
  ],
  moduleNameMapper: {
    "^@react-native-async-storage/async-storage$": "<rootDir>/__mocks__/async-storage.js",
    "^react-native$": "react-native", // optional — could point to a mock
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
};
