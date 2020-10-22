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
import Permission from './Permission'

@Table
export default class Role extends Model<Role> {
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  name!: string

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  color!: string

  @HasMany(() => Permission)
  permissions!: Permission[]

  @ForeignKey(() => Guild)
  @Column
  guildId!: number

  @BelongsTo(() => Guild, { onDelete: 'CASCADE' })
  guild!: Guild
}
