import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table
} from 'sequelize-typescript'

import User from './User'

@Table
export default class RefreshToken extends Model {
  @Column({
    type: DataType.TEXT,
    allowNull: false
  })
  token!: string

  @ForeignKey(() => User)
  @Column
  userId!: number

  @BelongsTo(() => User)
  user!: User
}
