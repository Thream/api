import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript'

import Member from './Member'
import OAuth, { AuthenticationStrategy } from './OAuth'
import RefreshToken from './RefreshToken'

export interface UserToJSON
  extends Omit<User, 'password' | 'tempToken' | 'tempExpirationToken'> {}

export interface UserJWT {
  id: number
  strategy: AuthenticationStrategy
}

export interface UserRequest {
  current: User
  strategy: AuthenticationStrategy
}

@Table
export default class User extends Model<User> {
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
    defaultValue: '/images/users/default.png'
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

  @HasMany(() => RefreshToken)
  refreshTokens!: RefreshToken[]

  @HasMany(() => OAuth)
  OAuths!: OAuth[]

  @HasMany(() => Member)
  members!: Member[]

  toJSON (): UserToJSON {
    const attributes = Object.assign({}, this.get()) as User
    delete attributes.password
    delete attributes.tempToken
    delete attributes.tempExpirationToken
    return attributes
  }
}
