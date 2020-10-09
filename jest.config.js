module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ["ts", "js"],
  collectCoverage: true,
  collectCoverageFrom: [
      './src/*(?<!.d).ts'
  ],
  testPathIgnorePatterns: [
      "./__tests__/xml.test.ts",
      "./__tests__/data.ts",
  ]
};
