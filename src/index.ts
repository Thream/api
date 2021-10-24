import { application } from './application.js'
import { HOST, PORT } from './tools/configurations/index.js'

const main = async (): Promise<void> => {
  const address = await application.listen(PORT, HOST)
  console.log('\x1b[36m%s\x1b[0m', `🚀  Server listening at ${address}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
