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

export const channelTypes = ['text', 'voice'] as const
export type ChannelType = typeof channelTypes[number]

@Table
export default class Channel extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  name!: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'text'
  })
  type!: ChannelType

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

  @BelongsTo(() => Guild)
  guild!: Guild

  @HasMany(() => Message)
  messages!: Message[]
}
