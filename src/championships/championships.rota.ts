import { Router } from 'express';
import { createChampionship, getAllChampionships } from './championships.controller';

const routerChampionship = Router();

routerChampionship.post('/new-championship', createChampionship);
routerChampionship.get('/previous-championships', getAllChampionships);

export default routerChampionship;