import { Router } from 'express';
import { createGame, getAllGames, grandFinalGame, quarterFinals, semiFinals, thirdPlaceGame } from './games.controller';

const routerGames = Router();

routerGames.post('/new-game', createGame);
routerGames.post('/quarter-finals', quarterFinals);
routerGames.post('/semi-final', semiFinals);
routerGames.post('/third-place', thirdPlaceGame);
routerGames.post('/grand-final', grandFinalGame);
routerGames.get('/previous-games', getAllGames);

export default routerGames;