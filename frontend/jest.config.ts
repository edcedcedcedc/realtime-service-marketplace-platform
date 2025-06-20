/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  moduleNameMapper: {
    "^@react-native-async-storage/async-storage$": "<rootDir>/__mocks__/async-storage.js"
  },
  moduleFileExtensions: ["ts", "tsx", "js"],
};
