import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
  'campeonato_futebol',
  'postgres',
  '123456',
  {
    host: 'localhost',
    dialect: 'postgres',
  });

export default sequelize;