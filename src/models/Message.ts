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

@Table
export default class Message extends Model<Message> {
  @Column({
    type: DataType.TEXT,
    allowNull: false
  })
  value!: string

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
