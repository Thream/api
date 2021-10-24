import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table
} from 'sequelize-typescript'

import User from './User'

export const providers = ['google', 'github', 'discord'] as const
export const strategies = [...providers, 'local'] as const

export type ProviderOAuth = typeof providers[number]
export type AuthenticationStrategy = typeof strategies[number]

@Table
export default class OAuth extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  provider!: ProviderOAuth

  @Column({
    type: DataType.TEXT,
    allowNull: false
  })
  providerId!: string

  @ForeignKey(() => User)
  @Column
  userId!: number

  @BelongsTo(() => User)
  user!: User
}
