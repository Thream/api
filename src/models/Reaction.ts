import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table
} from 'sequelize-typescript'

import Member from './Member'
import Message from './Message'

@Table
export default class Reaction extends Model<Reaction> {
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  emoji!: string

  @ForeignKey(() => Member)
  @Column
  memberId!: number

  @BelongsTo(() => Member, { onDelete: 'CASCADE' })
  member!: Member

  @ForeignKey(() => Message)
  @Column
  messageId!: number

  @BelongsTo(() => Message, { onDelete: 'CASCADE' })
  message!: Message
}
