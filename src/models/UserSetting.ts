import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table
} from 'sequelize-typescript'

import User from './User'
import { deleteObjectAttributes } from '../tools/utils/deleteObjectAttributes'

export const userSettingHiddenAttributes = [
  'createdAt',
  'updatedAt',
  'userId',
  'id'
] as const
export type UserSettingHiddenAttributes = typeof userSettingHiddenAttributes[number]
export interface UserSettingToJSON
  extends Omit<UserSetting, UserSettingHiddenAttributes> {}

export const languages = ['fr', 'en'] as const
export type Language = typeof languages[number]

export const themes = ['light', 'dark'] as const
export type Theme = typeof themes[number]

@Table
export default class UserSetting extends Model {
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
  userId?: number

  @BelongsTo(() => User)
  user!: User

  toJSON (): UserSettingToJSON {
    const attributes = Object.assign({}, this.get())
    return deleteObjectAttributes(
      attributes,
      userSettingHiddenAttributes
    ) as UserSettingToJSON
  }
}
