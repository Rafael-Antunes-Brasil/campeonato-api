import { QueryTypes } from "sequelize";
import sequelize from "../config/database";
import { spawn } from 'child_process';
const path = require('path');

export interface goalBalance {
    score: string
}

export class GamesRepositorio {
    public async goalBalanceQuery(teamId: number, championshipId: number) {
        const score: goalBalance[] = await sequelize.query(`
            SELECT 
            (((SELECT COALESCE (SUM(g."teamA_goals"), 0)
            FROM games g
            WHERE g."teamA_id" = ${teamId})
            +
            (SELECT COALESCE(SUM(g."teamB_goals"), 0)
            FROM games g
            WHERE g."teamB_id" = ${teamId}))
            - 
            ((SELECT COALESCE(SUM(g."teamB_goals"), 0)
            FROM games g
            WHERE g."teamA_id" = ${teamId}) 
            +
            (SELECT COALESCE (SUM(g."teamA_goals"), 0)
            FROM games g
            WHERE g."teamB_id" = ${teamId}))) as "score"
            FROM games g
            WHERE championship_id = ${championshipId}
            AND "teamA_id" = ${teamId} OR "teamB_id" = ${teamId}
            GROUP BY championship_id
            `, {
            type: QueryTypes.SELECT
        });

        return score[0];
    }

    public async runPythonScript(): Promise<number[]> {
        return new Promise((resolve, reject) => {
            const scriptPath = path.resolve(__dirname, '../teste.py');
            const pythonProcess = spawn('python', [scriptPath]);
            let scriptOutput = '';

            pythonProcess.stdout.on('data', async (data) => {
                scriptOutput += data.toString();
            });

            pythonProcess.stderr.on('data', async (data) => {
                reject(`Erro no script Python: ${data.toString()}`);
            });

            pythonProcess.on('close', async (code) => {
                if (code === 0) {
                    const [valor1, valor2] = scriptOutput.trim().split('\n').map(Number);
                    resolve([valor1, valor2]);
                } else {
                    reject(`Erro ao finalizar o script Python com código ${code}`);
                }
            });
        });
    }
}