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
export default class Invitation extends Model<Invitation> {
  @Column({
    type: DataType.TEXT,
    allowNull: false
  })
  value!: string

  // 0 = never expires
  @Column({
    type: DataType.BIGINT,
    allowNull: false
  })
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
