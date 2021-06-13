import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table
} from 'sequelize-typescript'

import Channel from './Channel'
import Guild from './Guild'
import Message from './Message'
import User from './User'

@Table
export default class Member extends Model {
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false
  })
  isOwner!: boolean

  @ForeignKey(() => Channel)
  @Column
  lastVisitedChannelId!: number

  @BelongsTo(() => Channel)
  channel!: Channel

  @ForeignKey(() => User)
  @Column
  userId!: number

  @BelongsTo(() => User)
  user!: User

  @ForeignKey(() => Guild)
  @Column
  guildId!: number

  @BelongsTo(() => Guild)
  guild!: Guild

  @HasMany(() => Message, { onDelete: 'CASCADE' })
  messages!: Message[]
}
