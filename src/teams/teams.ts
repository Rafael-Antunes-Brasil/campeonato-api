import { DataTypes, Model, Optional } from 'sequelize'
import sequelize from '../config/database';
import Championship from '../championships/championships';

interface TeamAttributes {
    id?: number,
    name?: string,
    champ_id?: Championship,
}

interface TeamCreationAttributes extends Optional<TeamAttributes, 'id'> {}

class Team extends Model<TeamAttributes, TeamCreationAttributes> implements TeamAttributes {
    public id!: number;
    public name!: string;
    public champ_id?: Championship;
}

Team.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    champ_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'teams',
  })

export default Team;