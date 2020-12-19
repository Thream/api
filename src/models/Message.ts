import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table
} from 'sequelize-typescript'

import Channel from './Channel'
import Member from './Member'

export const messageTypes = ['text', 'file'] as const
export type MessageType = typeof messageTypes[number]

@Table
export default class Message extends Model<Message> {
  @Column({
    type: DataType.TEXT,
    allowNull: false
  })
  value!: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'text'
  })
  type!: MessageType

  @ForeignKey(() => Member)
  @Column
  memberId!: number

  @BelongsTo(() => Member, { onDelete: 'CASCADE' })
  member!: Member

  @ForeignKey(() => Channel)
  @Column
  channelId!: number

  @BelongsTo(() => Channel, { onDelete: 'CASCADE' })
  channel!: Channel
}
