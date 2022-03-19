import { application } from './application.js'
import { HOST, PORT } from './tools/configurations/index.js'

const address = await application.listen(PORT, HOST)
console.log('\u001B[36m%s\u001B[0m', `🚀  Server listening at ${address}`)
