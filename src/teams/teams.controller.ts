import { Request, Response } from 'express';
import Team from './teams';

// Obtém todos os itens
export const getAllTeams = async (req: Request, res: Response): Promise<void> => {
    try {
      const teams = await Team.findAll();
      res.json(teams);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
  
  // Cria um novo item
  export const createTeam = async (req: Request, res: Response): Promise<void> => {
    try {
      const team = await Team.create(req.body);
      res.status(201).json(team);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }