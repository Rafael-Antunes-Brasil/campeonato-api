import { Request, Response } from 'express';
import Game from '../models/games';
import sequelize from '../config/database';
import { QueryTypes } from 'sequelize';
import { spawn } from 'child_process';
const path = require('path');

interface games {
  game_id: number,
  date_game: Date,
  index_game: number,
  teamA_id: number,
  teamAName: string,
  goalsA: number,
  teamB_id: number,
  teamBName: string,
  goalsB: number,
  champ_name: string,
  champ_year: number
}

export const getAllGames = async (req: Request, res: Response): Promise<void> => {
  try {
    const games = await Game.findAll();
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}

export const createGame = async (req: Request, res: Response): Promise<void> => {
  try {
    const game = await Game.create(req.body);
    res.status(201).json(game);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}

export const quarterFinals = async (req: Request, res: Response): Promise<void> => {
  try {
    const championshipId = req.body.championshipId;

    const openGamesQuarter: games[] = await sequelize.query(`
      SELECT 
      g.id as "game_id",
      g."date" as "date_game",
      g.index as "index_game",
      t.id as "teamA_id",
      t.name as "teamAName",
      g."teamA_goals" as "goalsA",
      t2.id as "teamB_id",
      t2.name as "teamBName",
      g."teamB_goals" as "goalsB",
      c.name as "champ_name",
      c.year as "champ_year"
      FROM games g
      LEFT JOIN championships c ON g.championship_id = c.id
      LEFT JOIN teams t ON t.id = g."teamA_id"
      LEFT JOIN teams t2 ON t2.id = g."teamB_id"
      WHERE g.championship_id = :championshipId
      AND g."teamA_goals" is NULL
      AND g."teamB_goals" is NULL
      AND g.step = 1
      ORDER BY g.id 
      `, {
      replacements: { championshipId },
      type: QueryTypes.SELECT
    })

    if (openGamesQuarter.length == 0) {
      res.status(500).json({ error: "Jogos das quartas de final já gerados!" });
      return;
    }

    const gameInProgress = openGamesQuarter[0];

    const openGamesSemi: games[] = await sequelize.query(`
      SELECT 
      g.id as "game_id",
      g."date" as "date_game",
      g.index as "index_game",
      t.id as "teamA_id",
      t.name as "teamAName",
      g."teamA_goals" as "goalsA",
      t2.id as "teamB_id",
      t2.name as "teamBName",
      g."teamB_goals" as "goalsB",
      c.name as "champ_name",
      c.year as "champ_year"
      FROM games g
      LEFT JOIN championships c ON g.championship_id = c.id
      LEFT JOIN teams t ON t.id = g."teamA_id"
      LEFT JOIN teams t2 ON t2.id = g."teamB_id"
      WHERE g.championship_id = :championshipId
      AND g.step = 2
      ORDER BY g.id 
      `, {
      replacements: { championshipId },
      type: QueryTypes.SELECT
    })

    const runPythonScript = (): Promise<number[]> => {
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

    const [goalsTeamA, goalsTeamB] = await runPythonScript();

    //Preencher jogo em andamento
    gameInProgress.date_game = new Date();
    gameInProgress.goalsA = goalsTeamA;
    gameInProgress.goalsB = goalsTeamB;

    await sequelize.query(`UPDATE games 
      SET "teamA_goals" = :goalsTeamA,
          "teamB_goals" = :goalsTeamB,
          "date" = :date
      WHERE id = :gameId
      `, {
      replacements: {
        goalsTeamA,
        goalsTeamB,
        date: gameInProgress.date_game,
        gameId: gameInProgress.game_id
      },
      type: QueryTypes.UPDATE
    });

    //criar logica para adicionar o semifinalista
    let winningTeam_id: number = 0;

    //vencedor
    if (goalsTeamA > goalsTeamB) {
      winningTeam_id = gameInProgress.teamA_id;
    } else if (goalsTeamB > goalsTeamA) {
      winningTeam_id = gameInProgress.teamB_id;
    } else if (goalsTeamA == goalsTeamB) {
      //desempate por penalti nas quartas
      while (true) {
        const [penaltiesTeamA, penaltiesTeamB] = await runPythonScript();

        if (penaltiesTeamA > penaltiesTeamB) {
          winningTeam_id = gameInProgress.teamA_id;
          break;
        } else if (penaltiesTeamB > penaltiesTeamA) {
          winningTeam_id = gameInProgress.teamB_id;
          break;
        }
      }
    } else {
      res.status(500).json('Erro ao gerar resultado!');
    }

    //vencedor passa para a semifinal
    switch (gameInProgress.index_game) {
      case 0:
        const semiGame1 = openGamesSemi[0];
        await sequelize.query(`UPDATE games 
          SET "teamA_id" = :teamA_id
          WHERE id = :gameId
          `, {
          replacements: {
            teamA_id: winningTeam_id,
            gameId: semiGame1.game_id
          },
          type: QueryTypes.UPDATE
        });

        break;
      case 1:
        const semiGame2 = openGamesSemi[0];
        await sequelize.query(`UPDATE games 
          SET "teamB_id" = :teamB_id
          WHERE id = :gameId
          `, {
          replacements: {
            teamB_id: winningTeam_id,
            gameId: semiGame2.game_id
          },
          type: QueryTypes.UPDATE
        });

        break;
      case 2:
        const semiGame3 = openGamesSemi[1];
        await sequelize.query(`UPDATE games 
          SET "teamA_id" = :teamA_id
          WHERE id = :gameId
          `, {
          replacements: {
            teamA_id: winningTeam_id,
            gameId: semiGame3.game_id
          },
          type: QueryTypes.UPDATE
        });

        break;

      case 3:
        const semiGame4 = openGamesSemi[1];
        await sequelize.query(`UPDATE games 
          SET "teamB_id" = :teamB_id
          WHERE id = :gameId
          `, {
          replacements: {
            teamB_id: winningTeam_id,
            gameId: semiGame4.game_id
          },
          type: QueryTypes.UPDATE
        });

        break;
      default:
        res.status(500).json('Quartas de final inválida!');
        break;
    }
    res.status(201).json(`Resultado entre ${gameInProgress.teamAName}: ${gameInProgress.goalsA} X ${gameInProgress.teamBName}: ${gameInProgress.goalsB},\n jogo válido pelas quartas de final do campeonato ${gameInProgress.champ_name} ${gameInProgress.champ_year}`);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}

export const semiFinals = async (req: Request, res: Response): Promise<void> => {
  try {
    const championshipId = req.body.championshipId;

    const openGamesSemi: games[] = await sequelize.query(`
      SELECT 
      g.id as "game_id",
      g."date" as "date_game",
      g.index as "index_game",
      t.id as "teamA_id",
      t.name as "teamAName",
      g."teamA_goals" as "goalsA",
      t2.id as "teamB_id",
      t2.name as "teamBName",
      g."teamB_goals" as "goalsB",
      c.name as "champ_name",
      c.year as "champ_year"
      FROM games g
      LEFT JOIN championships c ON g.championship_id = c.id
      LEFT JOIN teams t ON t.id = g."teamA_id"
      LEFT JOIN teams t2 ON t2.id = g."teamB_id"
      WHERE g.championship_id = :championshipId
      AND g."teamA_goals" is NULL
      AND g."teamB_goals" is NULL
      AND g.step = 2
      ORDER BY g.id 
      `, {
      replacements: { championshipId },
      type: QueryTypes.SELECT
    });

    if (openGamesSemi.length == 0) {
      res.status(500).json({ error: "Jogos das semi finais já gerados!" });
      return;
    }

    const gameInProgress = openGamesSemi[0];

    const runPythonScript = (): Promise<number[]> => {
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

    const [goalsTeamA, goalsTeamB] = await runPythonScript();

    //Preencher jogo em andamento
    gameInProgress.date_game = new Date();
    gameInProgress.goalsA = goalsTeamA;
    gameInProgress.goalsB = goalsTeamB;

    await sequelize.query(`UPDATE games 
      SET "teamA_goals" = :goalsTeamA,
          "teamB_goals" = :goalsTeamB,
          "date" = :date
      WHERE id = :gameId
      `, {
      replacements: {
        goalsTeamA,
        goalsTeamB,
        date: gameInProgress.date_game,
        gameId: gameInProgress.game_id
      },
      type: QueryTypes.UPDATE
    });

    //criar logica para adicionar o terceiro e finalista
    let winningTeam_id: number = 0;
    let teamLoser_id: number = 0;

    //vencedor
    if (goalsTeamA > goalsTeamB) {
      winningTeam_id = gameInProgress.teamA_id;
      teamLoser_id = gameInProgress.teamB_id;
    } else if (goalsTeamB > goalsTeamA) {
      winningTeam_id = gameInProgress.teamB_id;
      teamLoser_id = gameInProgress.teamA_id;
    } else if (goalsTeamA == goalsTeamB) {
      //criar desempate de acordo com o pedido no chamado


      //desempate por penalti na semi
      while (true) {
        const [penaltiesTeamA, penaltiesTeamB] = await runPythonScript();

        if (penaltiesTeamA > penaltiesTeamB) {
          winningTeam_id = gameInProgress.teamA_id;
          teamLoser_id = gameInProgress.teamB_id;
          break;
        } else if (penaltiesTeamB > penaltiesTeamA) {
          winningTeam_id = gameInProgress.teamB_id;
          teamLoser_id = gameInProgress.teamA_id;
          break;
        }
      }
    } else {
      res.status(500).json('Erro ao gerar resultado!');
    }

    switch (gameInProgress.index_game) {
      case 4:
        //Final 7
        await sequelize.query(`UPDATE games 
          SET "teamA_id" = :teamA_id
          WHERE index = 7
          `, {
          replacements: {
            teamA_id: winningTeam_id
          },
          type: QueryTypes.UPDATE
        });

        //Terceiro Lugar 6
        await sequelize.query(`UPDATE games 
          SET "teamA_id" = :teamA_id
          WHERE index = 6
          `, {
          replacements: {
            teamA_id: teamLoser_id
          },
          type: QueryTypes.UPDATE
        });

        break;
      case 5:
        //Final
        await sequelize.query(`UPDATE games 
          SET "teamB_id" = :teamB_id
          WHERE index = 7
          `, {
          replacements: {
            teamB_id: winningTeam_id,
          },
          type: QueryTypes.UPDATE
        });

        //Terceiro Lugar
        await sequelize.query(`UPDATE games 
          SET "teamB_id" = :teamB_id
          WHERE index = 6
          `, {
          replacements: {
            teamB_id: teamLoser_id
          },
          type: QueryTypes.UPDATE
        });

        break;
      default:
        res.status(500).json('Quartas de final inválida!');
        break;
    }

    res.status(201).json(`Resultado entre ${gameInProgress.teamAName}: ${gameInProgress.goalsA} X ${gameInProgress.teamBName}: ${gameInProgress.goalsB},\n jogo válido pela semi final do campeonato ${gameInProgress.champ_name} ${gameInProgress.champ_year}`);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}

export const thirdPlaceGame = async (req: Request, res: Response): Promise<void> => {
  try {
    const championshipId = req.body.championshipId;

    const openGamesThird: games[] = await sequelize.query(`
      SELECT 
      g.id as "game_id",
      g."date" as "date_game",
      g.index as "index_game",
      t.id as "teamA_id",
      t.name as "teamAName",
      g."teamA_goals" as "goalsA",
      t2.id as "teamB_id",
      t2.name as "teamBName",
      g."teamB_goals" as "goalsB",
      c.name as "champ_name",
      c.year as "champ_year"
      FROM games g
      LEFT JOIN championships c ON g.championship_id = c.id
      LEFT JOIN teams t ON t.id = g."teamA_id"
      LEFT JOIN teams t2 ON t2.id = g."teamB_id"
      WHERE g.championship_id = :championshipId
      AND g."teamA_goals" is NULL
      AND g."teamB_goals" is NULL
      AND g.step = 3
      ORDER BY g.id 
      `, {
      replacements: { championshipId },
      type: QueryTypes.SELECT
    });

    if (openGamesThird.length == 0) {
      res.status(500).json({ error: "Jogo do terceiro lugar já gerado!" });
      return;
    }

    const gameInProgress = openGamesThird[0];

    const runPythonScript = (): Promise<number[]> => {
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

    const [goalsTeamA, goalsTeamB] = await runPythonScript();

    //Preencher jogo em andamento
    gameInProgress.date_game = new Date();
    gameInProgress.goalsA = goalsTeamA;
    gameInProgress.goalsB = goalsTeamB;

    await sequelize.query(`UPDATE games 
      SET "teamA_goals" = :goalsTeamA,
          "teamB_goals" = :goalsTeamB,
          "date" = :date
      WHERE id = :gameId
      `, {
      replacements: {
        goalsTeamA,
        goalsTeamB,
        date: gameInProgress.date_game,
        gameId: gameInProgress.game_id
      },
      type: QueryTypes.UPDATE
    });

    //criar logica para adicionar o semifinalista
    let winningTeam_id: number = 0;

    //vencedor
    if (goalsTeamA > goalsTeamB) {
      winningTeam_id = gameInProgress.teamA_id;
    } else if (goalsTeamB > goalsTeamA) {
      winningTeam_id = gameInProgress.teamB_id;
    } else if (goalsTeamA == goalsTeamB) {
      //criar desempate de acordo com o pedido no chamado


      //desempate por penalti na semi
      while (true) {
        const [penaltiesTeamA, penaltiesTeamB] = await runPythonScript();

        if (penaltiesTeamA > penaltiesTeamB) {
          winningTeam_id = gameInProgress.teamA_id;
          break;
        } else if (penaltiesTeamB > penaltiesTeamA) {
          winningTeam_id = gameInProgress.teamB_id;
          break;
        }
      }
    } else {
      res.status(500).json('Erro ao gerar resultado!');
    }




    res.status(201).json(`Resultado entre ${gameInProgress.teamAName}: ${gameInProgress.goalsA} X ${gameInProgress.teamBName}: ${gameInProgress.goalsB},\n jogo válido pelo terceiro lugar no campeonato ${gameInProgress.champ_name} ${gameInProgress.champ_year}`);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}

export const grandFinalGame = async (req: Request, res: Response): Promise<void> => {
  try {
    const championshipId = req.body.championshipId;

    const openGamesFinal: games[] = await sequelize.query(`
      SELECT 
      g.id as "game_id",
      g."date" as "date_game",
      g.index as "index_game",
      t.id as "teamA_id",
      t.name as "teamAName",
      g."teamA_goals" as "goalsA",
      t2.id as "teamB_id",
      t2.name as "teamBName",
      g."teamB_goals" as "goalsB",
      c.name as "champ_name",
      c.year as "champ_year"
      FROM games g
      LEFT JOIN championships c ON g.championship_id = c.id
      LEFT JOIN teams t ON t.id = g."teamA_id"
      LEFT JOIN teams t2 ON t2.id = g."teamB_id"
      WHERE g.championship_id = :championshipId
      AND g."teamA_goals" is NULL
      AND g."teamB_goals" is NULL
      AND g.step = 4
      ORDER BY g.id 
      `, {
      replacements: { championshipId },
      type: QueryTypes.SELECT
    });

    if (openGamesFinal.length == 0) {
      res.status(500).json({ error: "Final da gerada!" });
      return;
    }

    const gameInProgress = openGamesFinal[0];

    const runPythonScript = (): Promise<number[]> => {
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

    const [goalsTeamA, goalsTeamB] = await runPythonScript();

    //Preencher jogo em andamento
    gameInProgress.date_game = new Date();
    gameInProgress.goalsA = goalsTeamA;
    gameInProgress.goalsB = goalsTeamB;

    await sequelize.query(`UPDATE games 
      SET "teamA_goals" = :goalsTeamA,
          "teamB_goals" = :goalsTeamB,
          "date" = :date
      WHERE id = :gameId
      `, {
      replacements: {
        goalsTeamA,
        goalsTeamB,
        date: gameInProgress.date_game,
        gameId: gameInProgress.game_id
      },
      type: QueryTypes.UPDATE
    });

    //criar logica para adicionar o semifinalista
    let winningTeam_id: number = 0;

    //vencedor
    if (goalsTeamA > goalsTeamB) {
      winningTeam_id = gameInProgress.teamA_id;
    } else if (goalsTeamB > goalsTeamA) {
      winningTeam_id = gameInProgress.teamB_id;
    } else if (goalsTeamA == goalsTeamB) {
      //criar desempate de acordo com o pedido no chamado


      //desempate por penalti na semi
      while (true) {
        const [penaltiesTeamA, penaltiesTeamB] = await runPythonScript();

        if (penaltiesTeamA > penaltiesTeamB) {
          winningTeam_id = gameInProgress.teamA_id;
          break;
        } else if (penaltiesTeamB > penaltiesTeamA) {
          winningTeam_id = gameInProgress.teamB_id;
          break;
        }
      }
    } else {
      res.status(500).json('Erro ao gerar resultado!');
    }

    res.status(201).json(`Resultado entre ${gameInProgress.teamAName}: ${gameInProgress.goalsA} X ${gameInProgress.teamBName}: ${gameInProgress.goalsB},\n jogo válido pela final do campeonato ${gameInProgress.champ_name} ${gameInProgress.champ_year}`);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}