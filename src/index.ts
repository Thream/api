import { application } from './application.js'
import { HOST, PORT } from './tools/configurations.js'

const address = await application.listen({
  port: PORT,
  host: HOST
})
console.log('\u001B[36m%s\u001B[0m', `🚀  Server listening at ${address}`)
