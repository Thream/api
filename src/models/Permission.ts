import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table
} from 'sequelize-typescript'

import Role from './Role'

export const permissions = [
  'ADMIN',
  'MEMBER',
  'READ_MESSAGES',
  'WRITE_MESSAGES'
] as const
export type PermissionValue = typeof permissions[number]

@Table
export default class Permission extends Model<Permission> {
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  value!: PermissionValue

  @ForeignKey(() => Role)
  @Column
  roleId!: number

  @BelongsTo(() => Role, { onDelete: 'CASCADE' })
  role!: Role
}
