import { Request, Response } from 'express';
import Team from '../models/teams';

export const getAllTeams = async (req: Request, res: Response): Promise<void> => {
  try {
    const teams = await Team.findAll();
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}

export const createTeams = async (req: Request, res: Response): Promise<void> => {
  try {
    const teams: Team[] = req.body;

    for (let team of teams) {
      await Team.create(team);
    }

    res.status(201).json(teams);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}