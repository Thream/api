import { serviceGenerator } from './generators/service/index.js'

export default (
  /** @type {import('plop').NodePlopAPI} */
  plop
) => {
  plop.setGenerator('service', serviceGenerator)
}
