import express from 'express';
import sequelize from './config/database';
import routerChampionship from './championships/championships.rota';
import routerGames from './games/games.rota';
import routerTeams from './teams/teams.rota';
import './associations';

const app = express();

app.use(express.json());

app.use(routerChampionship);
app.use(routerGames);
app.use(routerTeams)

// sequelize.sync({ force: true }) // Em produção, remova o "force: true"
sequelize.sync()
  .then(() => {
    console.log('Banco de dados ok')
  })
  .catch((err) => {
    console.log('Erro ao sincronizar', err);
  })

app.listen(3000, () => {
  console.log('Servidor executando!');
})
