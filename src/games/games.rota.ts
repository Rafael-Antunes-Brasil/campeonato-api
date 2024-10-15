import { Router } from 'express';
import { createGame, getAllGames } from './games.controller';

const routerGames = Router();

routerGames.post('/new-game', createGame);
routerGames.get('/previous-games', getAllGames);

export default routerGames;