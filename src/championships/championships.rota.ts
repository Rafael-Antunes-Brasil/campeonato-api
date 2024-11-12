import { Router } from 'express';
import { championship, previousChampionships, switching } from './championships.controller';

const routerChampionship = Router();

routerChampionship.post('/championship', championship);
routerChampionship.post('/switching', switching)
routerChampionship.get('/previous-championships/:championshipId', previousChampionships);

export default routerChampionship;