import { Router } from 'express';
import { createChampionship, getPreviousChampionships, switching } from './championships.controller';

const routerChampionship = Router();

routerChampionship.post('/new-championship', createChampionship);
routerChampionship.post('/switching', switching)
routerChampionship.get('/previous-championships/:championshipId', getPreviousChampionships);

export default routerChampionship;