module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['./__test__/setEnvsVars.ts'],
  setupFilesAfterEnv: ['./__test__/setup.ts'],
  rootDir: './src',
  collectCoverage: true,
  coverageDirectory: '../coverage/',
  coverageReporters: ['text', 'cobertura']
}
