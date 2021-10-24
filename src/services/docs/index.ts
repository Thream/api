import { Router } from 'express'
import swaggerUi from 'swagger-ui-express'

import { swaggerSpecification } from '../../tools/configurations/swaggerSpecification'

export const documentationRouter = Router()

documentationRouter.use('/documentation', swaggerUi.serve, swaggerUi.setup(swaggerSpecification))
