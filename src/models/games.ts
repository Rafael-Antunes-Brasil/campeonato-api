import { DataTypes, Model, Optional } from "sequelize";
import Team from "./teams";
import sequelize from "../config/database";
import Championship from "./championships";

interface GameAttributes {
    id?: number,
    date?: Date,
    teamA_id?: Team,
    teamA_goals?: number,
    teamB_id?: Team,
    teamB_goals?: number,
    championship_id?: Championship,
    step?: number,
    index?: number,
}

interface GameCreationAttributes extends Optional<GameAttributes, 'id'> {}

class Game extends Model<GameAttributes, GameCreationAttributes> implements GameAttributes {
    public id?: number;
    public date?: Date;
    public teamA_id?: Team;
    public teamA_goals?: number;
    public teamB_id?: Team;
    public teamB_goals?: number;
    public championship_id?: Championship;
    public step?: number;
    public index?: number;
}

Game.init({
    date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    teamA_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    teamA_goals: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    teamB_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    teamB_goals: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    championship_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    step: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    index: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    sequelize,
    timestamps: false,
    tableName: 'games',
    indexes: [
        {
            unique: true,
            fields: ['championship_id', 'index']
        }
    ]
})

export default Game;