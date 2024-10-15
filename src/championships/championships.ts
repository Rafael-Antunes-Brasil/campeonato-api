import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface ChampionshipAttributes {
    id?: number,
    date?: Date,
    name?: string,
}

interface ChampionshipCreationAttributes extends Optional<ChampionshipAttributes, 'id'> {}

class Championship extends Model<ChampionshipAttributes, ChampionshipCreationAttributes> implements ChampionshipAttributes {
    public id?: number;
    public date?: Date;
    public name?: string;
}

Championship.init({
    date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    sequelize,
    tableName: 'championships'
})

export default Championship;