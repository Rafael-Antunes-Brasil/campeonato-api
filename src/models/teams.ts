import { DataTypes, Model, Optional } from 'sequelize'
import sequelize from '../config/database';
import Championship from './championships';

interface TeamAttributes {
  id?: number,
  name?: string,
}

interface TeamCreationAttributes extends Optional<TeamAttributes, 'id'> { }

class Team extends Model<TeamAttributes, TeamCreationAttributes> implements TeamAttributes {
  public id!: number;
  public name!: string;
}

Team.init({
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
}, {
  sequelize,
  timestamps: false,
  tableName: 'teams',
})

export default Team;