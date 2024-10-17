import request from 'supertest';
import express from 'express';
import sequelize from '../../config/database';
import routerGames from '../games.rota';
import Game from '../../models/games';
import { GamesRepositorio } from '../../games/games.repositorio';


const app = express();
app.use(express.json());
app.use(routerGames);

beforeAll(async () => {
    await sequelize.sync();
});

afterEach(async () => {
    await Game.destroy({ where: {} });
});

describe('POST /new-game', () => {
    it('should create a game successfully', async () => {
        const gameData = { name: 'Game 1' };

        jest.spyOn(Game, 'create').mockResolvedValue({ id: 1, ...gameData });

        const response = await request(app)
            .post('/new-game')
            .send(gameData);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toBe(gameData.name);
    });

    it('should handle errors gracefully', async () => {
        jest.spyOn(Game, 'create').mockImplementationOnce(() => {
            throw new Error('Database error');
        });

        const gameData = { name: 'Game 2' };

        const response = await request(app)
            .post('/new-game')
            .send(gameData);

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error', 'Database error');
    });
});
