const { serviceGenerator } = require('./generators/service/index.js')

module.exports = (
  /** @type {import('plop').NodePlopAPI} */
  plop
) => {
  plop.setGenerator('service', serviceGenerator)
}
