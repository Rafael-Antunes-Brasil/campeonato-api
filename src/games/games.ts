import { DataTypes, Model, Optional } from "sequelize";
import Team from "../teams/teams";
import sequelize from "../config/database";
import Championship from "../championships/championships";

interface GameAttributes {
    id?: number,
    date?: Date,
    teamA_id?: Team,
    teamA_goals?: number,
    teamB_id?: Team,
    teamB_goals?: number,
    champ_id?: Championship,
    step?: number
}

interface GameCreationAttributes extends Optional<GameAttributes, 'id'> {}

class Game extends Model<GameAttributes, GameCreationAttributes> implements GameAttributes {
    public id?: number;
    public date?: Date;
    public teamA_id?: Team;
    public teamA_goals?: number;
    public teamB_id?: Team;
    public teamB_goals?: number;
    public champ_id?: Championship;
    public step?: number;
}

Game.init({
    date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    teamA_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    teamA_goals: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    teamB_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    teamB_goals: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    champ_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    step: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    sequelize,
    tableName: 'games',
})

export default Game;