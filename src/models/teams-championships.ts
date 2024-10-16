import { DataTypes, Model, Optional } from "sequelize";
import Championship from "./championships";
import Team from "./teams";
import sequelize from "../config/database";

interface TeamsChampionshipsAttributes {
    id?: number,
    championship_id?: Championship,
    team_id?: Team
}

interface TeamsChampionshipsCreationAttributes extends Optional<TeamsChampionshipsAttributes, 'id'> { }

class TeamsChampionships extends Model<TeamsChampionshipsAttributes, TeamsChampionshipsCreationAttributes> implements TeamsChampionshipsAttributes {
    public id?: number;
    public championship_id?: Championship;
    public team_id?: Team;
}

TeamsChampionships.init({
    championship_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    team_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    sequelize,
    tableName: 'team_championship',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['championship_id', 'team_id']
        }
    ]
})

export default TeamsChampionships