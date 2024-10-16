import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface ChampionshipAttributes {
    id?: number,
    year?: number,
    name?: string,
}

interface ChampionshipCreationAttributes extends Optional<ChampionshipAttributes, 'id'> { }

class Championship extends Model<ChampionshipAttributes, ChampionshipCreationAttributes> implements ChampionshipAttributes {
    public id?: number;
    public year?: number;
    public name?: string;
}

Championship.init({
    year: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    sequelize,
    timestamps: false,
    tableName: 'championships',
    indexes: [
        {
            unique: true,
            fields: ['name', 'year']
        }
    ]
})

export default Championship;