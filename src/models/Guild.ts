import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript'

import Channel from './Channel'
import Invitation from './Invitation'
import Member from './Member'

@Table
export default class Guild extends Model<Guild> {
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  name!: string

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  description!: string

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    defaultValue: '/images/guilds/default.png'
  })
  icon!: string

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false
  })
  isPublic!: boolean

  @HasMany(() => Member)
  members!: Member[]

  @HasMany(() => Invitation)
  invitations!: Invitation[]

  @HasMany(() => Channel)
  channels!: Channel[]
}
