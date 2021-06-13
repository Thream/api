import { Prisma } from '@prisma/client'
import { Static, Type } from '@sinclair/typebox'

export const queryPaginationSchema = Type.Object({
  /** Maximum number of items to return */
  limit: Type.Integer({ default: 20, minimum: 1, maximum: 100 }),

  /** The before and after are mutually exclusive, only one may be passed at a time. */
  before: Type.Optional(
    Type.Integer({ minimum: 1, description: 'Get items before this id' })
  ),
  after: Type.Optional(
    Type.Integer({ minimum: 1, description: 'Get items after this id' })
  )
})

export type QueryPaginationSchemaType = Static<typeof queryPaginationSchema>

export const getPaginationOptions = (
  query: QueryPaginationSchemaType
): Prisma.SelectSubset<unknown, unknown> => {
  return {
    take: query.before != null ? query.limit * -1 : query.limit,
    skip: query.after != null || query.before != null ? 1 : undefined,
    ...(query.after != null && {
      cursor: {
        id: query.after
      }
    }),
    ...(query.before != null && {
      cursor: {
        id: query.before
      }
    })
  }
}
