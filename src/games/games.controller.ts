import { Request, Response } from 'express';
import Game from './games';

// Obtém todos os itens
export const getAllGames = async (req: Request, res: Response): Promise<void> => {
    try {
      const games = await Game.findAll();
      res.json(games);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
  
  // Cria um novo item
  export const createGame = async (req: Request, res: Response): Promise<void> => {
    try {
      const game = await Game.create(req.body);
      res.status(201).json(game);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }