import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table
} from 'sequelize-typescript'

import Guild from './Guild'

@Table
export default class Invitation extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  value!: string

  @Column({
    type: DataType.BIGINT,
    allowNull: false
  })
  /** expiresIn is how long, in milliseconds, until the invitation expires. Note: 0 = never expires */
  expiresIn!: number

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false
  })
  isPublic!: boolean

  @ForeignKey(() => Guild)
  @Column
  guildId!: number

  @BelongsTo(() => Guild, { onDelete: 'CASCADE' })
  guild!: Guild
}
