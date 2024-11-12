import { Router } from 'express';
import { game, allGames, grandFinalGame, quarterFinals, semiFinals, thirdPlaceGame } from './games.controller';

const routerGames = Router();

routerGames.post('/game', game);
routerGames.post('/quarter-finals', quarterFinals);
routerGames.post('/semi-final', semiFinals);
routerGames.post('/third-place', thirdPlaceGame);
routerGames.post('/grand-final', grandFinalGame);
routerGames.get('/previous-games', allGames);

export default routerGames;