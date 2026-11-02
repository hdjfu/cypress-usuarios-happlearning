const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://lms.experimente5.happlearning.com.br',
    viewportWidth: 1366,
    viewportHeight: 768,
    defaultCommandTimeout: 10000,
  },
})
