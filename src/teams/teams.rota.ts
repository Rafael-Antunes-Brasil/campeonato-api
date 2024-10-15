import { Router } from 'express';
import { createTeam, getAllTeams } from './teams.controller';

const routerTeams = Router();

routerTeams.post('/new-team', createTeam);
routerTeams.get('/previous-teams', getAllTeams);

export default routerTeams;