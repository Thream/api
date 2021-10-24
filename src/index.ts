import { authorize } from '@thream/socketio-jwt'

import application from './application'
import { socket } from './tools/socket'
import { sequelize } from './tools/database/sequelize'

const PORT = parseInt(process.env.PORT ?? '8080', 10)

sequelize
  .sync()
  .then(() => {
    const server = application.listen(PORT, () => {
      console.log('\x1b[36m%s\x1b[0m', `🚀  Server listening on port ${PORT}.`)
    })
    socket.init(server)
    socket.io?.use(
      authorize({
        secret: process.env.JWT_ACCESS_SECRET
      })
    )
  })
  .catch((error) => console.error(error))
