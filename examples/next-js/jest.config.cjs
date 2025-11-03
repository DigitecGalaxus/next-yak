const nextJest = require('next/jest')
 
// Providing the path to your Next.js app which will enable loading next.config.js and .env files
const createJestConfig = nextJest({ dir: './' })
 
// Any custom config you want to pass to Jest
const customJestConfig = {
  setupFilesAfterEnv: [],
  testEnvironment: 'jsdom',

  // Clock.tsx would render always a different snapshot without a fixed time
  fakeTimers: {
    enableGlobally: true,
    now: new Date('2024-05-05 15:00:00').getTime(),
  },
}
 
// createJestConfig is exported in this way to ensure that next/jest can load the Next.js configuration, which is async
module.exports = createJestConfig(customJestConfig)