import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table
} from 'sequelize-typescript'

import Guild from './Guild'
import Message from './Message'

@Table
export default class Channel extends Model<Channel> {
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  name!: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: ''
  })
  description!: string

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false
  })
  isDefault!: boolean

  @ForeignKey(() => Guild)
  @Column
  guildId!: number

  @BelongsTo(() => Guild, { onDelete: 'CASCADE' })
  guild!: Guild

  @HasMany(() => Message)
  messages!: Message[]
}
