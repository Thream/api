import {
  Column,
  DataType,
  HasMany,
  HasOne,
  Model,
  Table
} from 'sequelize-typescript'

import Member from './Member'
import OAuth, { AuthenticationStrategy } from './OAuth'
import RefreshToken from './RefreshToken'
import UserSetting from './UserSetting'
import { deleteObjectAttributes } from '../tools/utils/deleteObjectAttributes'
import { usersLogoPath } from '../tools/configurations/constants'

export const userHiddenAttributes = [
  'password',
  'tempToken',
  'tempExpirationToken'
] as const
export type UserHiddenAttributes = typeof userHiddenAttributes[number]
export interface UserToJSON extends Omit<User, UserHiddenAttributes> {}

export interface UserJWT {
  id: number
  currentStrategy: AuthenticationStrategy
}

export interface UserRequest {
  current: User
  currentStrategy: AuthenticationStrategy
  accessToken: string
}

@Table
export default class User extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  name!: string

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  email?: string

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  password?: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: ''
  })
  status!: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: ''
  })
  biography!: string

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    defaultValue: `${usersLogoPath.name}/default.png`
  })
  logo!: string

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false
  })
  isConfirmed!: boolean

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  tempToken?: string | null

  @Column({
    type: DataType.BIGINT,
    allowNull: true
  })
  tempExpirationToken?: number | null

  @HasMany(() => RefreshToken, { onDelete: 'CASCADE' })
  refreshTokens!: RefreshToken[]

  @HasMany(() => OAuth, { onDelete: 'CASCADE' })
  OAuths!: OAuth[]

  @HasMany(() => Member, { onDelete: 'CASCADE' })
  members!: Member[]

  @HasOne(() => UserSetting, { onDelete: 'CASCADE' })
  settings!: UserSetting

  toJSON (): UserToJSON {
    const attributes = Object.assign({}, this.get())
    return deleteObjectAttributes(attributes, userHiddenAttributes) as UserToJSON
  }
}
