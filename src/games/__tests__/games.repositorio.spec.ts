import routerGames from '../games.rota'
import express, { Express } from 'express';
import sequelize from '../../config/database';
import { QueryTypes } from 'sequelize';
import { GamesRepositorio } from '../games.repositorio';
import { goalBalance } from '../games.repositorio';
import { spawn } from 'child_process';

const app: Express = express();
app.use(express.json());
app.use(routerGames);

jest.mock('child_process');

describe('goalBalanceQuery', () => {
    let instance: GamesRepositorio;

    beforeEach(() => {
        instance = new GamesRepositorio();
    });

    it('should return the correct goal balance for a team', async () => {
        // Mock da consulta ao banco de dados
        const mockScore: [goalBalance[], unknown[]] = [[{ score: '3' }], []];

        jest.spyOn(sequelize, 'query').mockResolvedValue(mockScore);

        const teamId = 1; // ID do time a ser testado
        const championshipId = 2; // ID do campeonato a ser testado

        const result = await instance.goalBalanceQuery(teamId, championshipId);

        expect(sequelize.query).toHaveBeenCalledWith(expect.stringContaining(`WHERE championship_id = ${championshipId}`), { type: QueryTypes.SELECT });
        expect(result).toEqual(mockScore[0]); // Verifica se o resultado é o esperado
    });

    it('should return undefined if there are no results', async () => {
        const mockScore: [goalBalance[], unknown[]] = [[], []];

        jest.spyOn(sequelize, 'query').mockResolvedValue(mockScore);

        const teamId = 1;
        const championshipId = 2;

        const result = await instance.goalBalanceQuery(teamId, championshipId);

        expect(result).toEqual([]);
    });

    it('should handle errors gracefully', async () => {
        const teamId = 1;
        const championshipId = 2;

        jest.spyOn(sequelize, 'query').mockRejectedValue(new Error('Database error'));

        await expect(instance.goalBalanceQuery(teamId, championshipId)).rejects.toThrow('Database error');
    });
});

describe('runPythonScript', () => {
    let instance: GamesRepositorio;

    beforeEach(() => {
        instance = new GamesRepositorio();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should resolve with the correct output when the script runs successfully', async () => {
        const mockOutput = '5\n10\n';
        const mockSpawn = spawn as jest.Mock;

        mockSpawn.mockReturnValue({
            stdout: {
                on: (event: string, callback: (data: Buffer) => void) => {
                    if (event === 'data') {
                        callback(Buffer.from(mockOutput));
                    }
                },
            },
            stderr: {
                on: jest.fn(),
            },
            on: (event: string, callback: (code: number) => void) => {
                if (event === 'close') {
                    callback(0);
                }
            },
        });

        const result = await instance.runPythonScript();
        expect(result).toEqual([5, 10]);
    });

    it('should reject with an error message when the script fails', async () => {
        const mockSpawn = spawn as jest.Mock;

        mockSpawn.mockReturnValue({
            stdout: {
                on: jest.fn(),
            },
            stderr: {
                on: (event: string, callback: (data: Buffer) => void) => {
                    if (event === 'data') {
                        callback(Buffer.from('Error occurred')); // Simulando erro
                    }
                },
            },
            on: (event: string, callback: (code: number) => void) => {
                if (event === 'close') {
                    callback(1); // Simulando finalização com erro
                }
            },
        });

        await expect(instance.runPythonScript()).rejects.toMatch(/Erro no script Python: Error occurred/);
    });

    it('should reject with an error message if the Python process outputs an error', async () => {
        const mockSpawn = spawn as jest.Mock;

        mockSpawn.mockReturnValue({
            stdout: {
                on: jest.fn(),
            },
            stderr: {
                on: (event: string, callback: (data: Buffer) => void) => {
                    if (event === 'data') {
                        callback(Buffer.from('Some error in Python script'));
                    }
                },
            },
            on: (event: string, callback: (code: number) => void) => {
                if (event === 'close') {
                    callback(0);
                }
            },
        });

        await expect(instance.runPythonScript()).rejects.toMatch(/Erro no script Python: Some error in Python script/);
    });
});