import { Router } from 'express';
import { createChampionship, getAllChampionships, switching } from './championships.controller';

const routerChampionship = Router();

routerChampionship.post('/new-championship', createChampionship);
routerChampionship.post('/switching', switching)
routerChampionship.get('/previous-championships', getAllChampionships);

export default routerChampionship;