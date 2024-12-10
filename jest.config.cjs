module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.cjs$": "babel-jest",
  },
  moduleFileExtensions: ["js", "json", "cjs"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};
