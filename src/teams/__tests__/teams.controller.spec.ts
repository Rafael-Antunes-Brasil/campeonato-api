import Team from '../../models/teams';
import routerTeams from '../teams.rota'
import request from 'supertest';
import express, { Express } from 'express';

const app: Express = express();
app.use(express.json());
app.use(routerTeams);

describe('GET /previous-teams', () => {
    beforeEach(async () => {
        // Limpar a tabela de times antes de cada teste
        await Team.destroy({ where: {} });
    });

    it('should return all teams', async () => {
        await Team.bulkCreate([
            { name: 'Time A' },
            { name: 'Time B' },
        ]);

        const response = await request(app).get('/previous-teams');

        expect(response.status).toBe(200);
        expect(response.body).toEqual([
            { id: expect.any(Number), name: 'Time A' },
            { id: expect.any(Number), name: 'Time B' },
        ]);
    });

    it('should return 500 if there is an error', async () => {
        // Simular um erro ao acessar a base de dados
        jest.spyOn(Team, 'findAll').mockImplementationOnce(() => {
            throw new Error('Database error');
        });

        const response = await request(app).get('/previous-teams');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Database error' });
    });
});

describe('POST /new-teams', () => {
    beforeEach(async () => {
        // Limpar a tabela de times antes de cada teste
        await Team.destroy({ where: {} });
    });

    it('should create teams successfully', async () => {
        const newTeams = [
            { name: 'Time A' },
            { name: 'Time B' },
        ];

        const response = await request(app)
            .post('/new-teams')
            .send(newTeams);

        expect(response.status).toBe(201);
        expect(response.body).toEqual(newTeams);

        // Verificar se os times foram realmente criados no banco de dados
        const teamsInDb = await Team.findAll();
        expect(teamsInDb).toHaveLength(2);
        expect(teamsInDb).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ name: 'Time A' }),
                expect.objectContaining({ name: 'Time B' }),
            ])
        );
    });

    it('should return 500 if there is an error', async () => {
        // Simular um erro ao tentar criar um time
        jest.spyOn(Team, 'create').mockImplementationOnce(() => {
            throw new Error('Database error');
        });

        const newTeams = [{ name: 'Time C' }];

        const response = await request(app)
            .post('/new-teams')
            .send(newTeams);

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Database error' });
    });
});