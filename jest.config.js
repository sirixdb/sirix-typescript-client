module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ["ts", "js"],
  collectCoverage: true,
  collectCoverageFrom: [
      './src/client.ts',
      './src/auth.ts'
  ]
};