import { DataTypes, Model, Optional } from "sequelize";
import Championship from "./championships";
import Team from "./teams";
import sequelize from "../config/database";

interface TeamsChampionshipsAttributes {
    id?: number,
    championship_id?: Championship,
    team_id?: Team,
    position?: number
}

interface TeamsChampionshipsCreationAttributes extends Optional<TeamsChampionshipsAttributes, 'id'> { }

class TeamsChampionships extends Model<TeamsChampionshipsAttributes, TeamsChampionshipsCreationAttributes> implements TeamsChampionshipsAttributes {
    public id?: number;
    public championship_id?: Championship;
    public team_id?: Team;
    public position?: number;
}

TeamsChampionships.init({
    championship_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    team_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    position: {
        type: DataTypes.INTEGER,
        allowNull: true
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