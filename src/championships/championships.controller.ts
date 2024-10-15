import { Request, Response } from 'express';
import Championship from './championships';

// Obtém todos os itens
export const getAllChampionships = async (req: Request, res: Response): Promise<void> => {
    try {
      const championships = await Championship.findAll();
      res.json(championships);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
  
  // Cria um novo item
  export const createChampionship = async (req: Request, res: Response): Promise<void> => {
    try {
      const championship = await Championship.create(req.body);
      res.status(201).json(championship);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }