import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table
} from 'sequelize-typescript'

import User from './User'

export type ProviderOAuth = 'google' | 'github' | 'discord' | 'twitter'

export type AuthenticationStrategy = 'local' | ProviderOAuth

@Table
export default class OAuth extends Model<OAuth> {
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

  @BelongsTo(() => User, { onDelete: 'CASCADE' })
  user!: User
}
