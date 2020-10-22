import { Table, Model, Column, DataType } from 'sequelize-typescript'

@Table
export default class PostTest extends Model<PostTest> {
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  title!: string
}
