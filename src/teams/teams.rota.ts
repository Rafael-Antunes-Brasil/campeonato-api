import { Router } from 'express';
import { createTeams, getAllTeams } from './teams.controller';

const routerTeams = Router();

routerTeams.post('/new-teams', createTeams);
routerTeams.get('/previous-teams', getAllTeams);

export default routerTeams;