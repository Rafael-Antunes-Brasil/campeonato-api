import { Router } from 'express';
import { teams, allTeams } from './teams.controller';

const routerTeams = Router();

routerTeams.post('/teams', teams);
routerTeams.get('/previous-teams', allTeams);

export default routerTeams;