import request from 'supertest';
import express, { Express } from 'express';
import Championship from '../../models/championships';
import Team from '../../models/teams';
import sequelize from '../../config/database';
import routerChampionship from '../championships.rota';

const app: Express = express();
app.use(express.json());
app.use(routerChampionship);

beforeAll(async () => {
  await sequelize.sync();
});

jest.mock('../../models/championships', () => ({
  create: jest.fn(),
}));

jest.mock('../../models/teams', () => ({
  findAll: jest.fn(),
}));

describe('GET /previous-championships', () => {
  it('should return an array of championships', async () => {
      const response = await request(app)
      .get('/previous-championships')
      .send({ championshipId: 1 });
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
  });
});
