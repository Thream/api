import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table
} from 'sequelize-typescript'

import User from './User'

export const languages = ['fr', 'en'] as const
export type Language = typeof languages[number]

export const themes = ['light', 'dark'] as const
export type Theme = typeof themes[number]

@Table
export default class UserSetting extends Model<UserSetting> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'en'
  })
  language!: Language

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'dark'
  })
  theme!: Theme

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false
  })
  isPublicEmail!: boolean

  @ForeignKey(() => User)
  @Column
  userId!: number

  @BelongsTo(() => User, { onDelete: 'CASCADE' })
  user!: User
}
