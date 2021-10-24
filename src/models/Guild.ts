import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript'
import { guildsIconPath } from '../tools/configurations/constants'

import Channel from './Channel'
import Invitation from './Invitation'
import Member from './Member'

@Table
export default class Guild extends Model {
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
    type: DataType.TEXT,
    allowNull: false,
    defaultValue: `${guildsIconPath.name}/default.png`
  })
  icon!: string

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false
  })
  isPublic!: boolean

  @HasMany(() => Member, { onDelete: 'CASCADE' })
  members!: Member[]

  @HasMany(() => Invitation, { onDelete: 'CASCADE' })
  invitations!: Invitation[]

  @HasMany(() => Channel)
  channels!: Channel[]
}
