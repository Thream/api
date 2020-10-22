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
import User from './User'

@Table
export default class Member extends Model<Member> {
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false
  })
  isOwner!: boolean

  @ForeignKey(() => User)
  @Column
  userId!: number

  @BelongsTo(() => User, { onDelete: 'CASCADE' })
  user!: User

  @ForeignKey(() => Guild)
  @Column
  guildId!: number

  @BelongsTo(() => Guild, { onDelete: 'CASCADE' })
  guild!: Guild

  @HasMany(() => Message)
  messages!: Message[]
}
