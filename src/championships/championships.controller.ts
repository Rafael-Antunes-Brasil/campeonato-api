import { Request, Response } from 'express';
import Championship from '../models/championships';
import Team from '../models/teams';
import TeamsChampionships from '../models/teams-championships';
import sequelize from '../config/database';
import { QueryTypes } from 'sequelize';

interface quarterFinal {
  team_id: number,
  gamePosition: number,
}

interface teamGame {
  year_champ: number,
  name_champ: string,
  team_name: string,
  team_id: number
}

interface championship {
  champ_name: string,
  champ_year: number,
  team_name: string,
  team_position: number
}

export const getPreviousChampionships = async (req: Request, res: Response): Promise<void> => {
  try {
    // const championshipId = req.body.championshipId;
    const championshipId = req.params.championshipId;
    const championship: championship[] = await sequelize.query(`
      SELECT
      c."name" as "champ_name",
      c."year" as "champ_year",
      t."name" as "team_name",
      CASE
        WHEN tc.position = 0 THEN 'Eliminado nas Quartas'
        WHEN tc.position = 1 THEN 'Quarto Lugar'
        WHEN tc.position = 2 THEN 'Terceiro Lugar'
        WHEN tc.position = 3 THEN 'Segundo Lugar'
        WHEN tc.position = 4 THEN 'Campeão'
        ELSE 'Posição desconhecida'
      END AS "team_position",
      (((
        SELECT
          COALESCE (SUM (g."teamA_goals"), 0)
        FROM
          games g
        WHERE
          g."teamA_id" = t.id) +
      (
        SELECT
          COALESCE (SUM (g."teamB_goals"), 0)
        FROM
          games g
        WHERE
          g."teamB_id" = t.id)) 
      - 
      ((
        SELECT
          COALESCE (SUM (g."teamB_goals"), 0)
        FROM
          games g
        WHERE
          g."teamA_id" = t.id) +
      (
        SELECT
          COALESCE (SUM (g."teamA_goals"), 0)
        FROM
          games g
        WHERE
          g."teamB_id" = t.id))) as "pontuação"
      FROM team_championship tc 
      LEFT JOIN teams t ON tc.team_id = t.id
      LEFT JOIN championships c ON c.id = tc.championship_id
      WHERE championship_id = :championshipId
      ORDER BY tc.position DESC
      `, {
      replacements: { championshipId },
      type: QueryTypes.SELECT
    });

    res.status(200).json(championship);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}

export const createChampionship = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, year, teamsIds } = req.body;

    if (teamsIds.length != 8) {
      res.status(500).json({ error: "Necessário 8 times para criar o campeonato" });
      return;
    }

    const championship = await Championship.create({ name, year });
    const plainChampionship = championship.get({ plain: true });

    const teams = await Team.findAll({
      raw: true,
      where: {
        id: teamsIds
      }
    });

    if (teams.length != 8) {
      res.status(500).json({ error: "Ids dos times invalidos, necessário 8 ids validos para criar o campeonato!" });
      return;
    }

    for (const team of teams) {
      await sequelize.query(`INSERT INTO team_championship (team_id, championship_id) 
        VALUES (:teamId, :championshipId)`, {
        replacements: {
          teamId: team.id,
          championshipId: plainChampionship.id,
        },
        type: QueryTypes.INSERT
      });
    }

    res.status(201).json({
      message: 'Campeonato criado e times associados com sucesso',
      championship
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Erro ao criar o campeonato',
      error: error
    });
  }
}

export const switching = async (req: Request, res: Response): Promise<void> => {
  try {
    const championshipId = req.body.championshipId;

    const gamesFromChampionship = await sequelize.query(`
      SELECT * FROM games WHERE championship_id = :championshipId`,
      {
        replacements: { championshipId },
        type: QueryTypes.SELECT
      }
    )

    if (gamesFromChampionship.length > 0) {
      res.status(500).json({ error: "Chaveamento do campeonato ja gerado!" });
      return;
    }

    const results: teamGame[] = await sequelize.query(`
      SELECT 
      c."year" as "year_champ",
      c."name" as "name_champ",
      t."name" as "team_name",
      t."id" as "team_id"
      FROM team_championship tc
      LEFT JOIN championships c ON c.id = tc.championship_id
      LEFT JOIN teams t ON tc.team_id = t.id
      WHERE c.id = :championshipId
      `, {
      replacements: { championshipId },
      type: QueryTypes.SELECT
    });

    const quarterFinalList: quarterFinal[] = [];

    for (let team of results) {
      while (true) {
        const random = randomPosition()

        const foundItem = quarterFinalList.find(item => {
          return item.gamePosition === random;
        });

        if (foundItem) {
        } else {
          let item: quarterFinal = {
            team_id: team.team_id,
            gamePosition: random
          }
          quarterFinalList.push(item)
          break;
        }
      }
    }

    const gamesList = [1, 1, 1, 1, 2, 2, 3, 4];
    let indexA = 1;
    let indexB = 2;

    for (let i = 0; i < gamesList.length; i++) {
      if (gamesList[i] == 1) {
        let teamA = quarterFinalList.filter(item => {
          return item.gamePosition == indexA;
        });
        let teamB = quarterFinalList.filter(item => {
          return item.gamePosition == indexB;
        });

        console.log(teamA[0])
        console.log(teamB[0])

        await sequelize.query(`INSERT INTO games 
          ("teamA_id", "teamB_id", championship_id, step, index)
          VALUES (:teamA_id, :teamB_id, :championshipId, :step, :index)`,
          {
            replacements: {
              teamA_id: teamA[0].team_id,
              teamB_id: teamB[0].team_id,
              championshipId,
              step: gamesList[i],
              index: i
            }, type: QueryTypes.INSERT
          });

        indexA += 2;
        indexB += 2;
      } else {
        await sequelize.query(`INSERT INTO games 
          (championship_id, step, index)
          VALUES (:championshipId, :step, :index)`,
          {
            replacements: {
              championshipId,
              step: gamesList[i],
              index: i
            }, type: QueryTypes.INSERT
          })
      }
    }

    res.status(201).json({
      message: 'Chaveamento do campeonato gerado com sucesso'
    });

  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Erro ao gerar chaveamento',
      error: error
    });
  }

  function randomPosition() {
    return Math.floor(Math.random() * (8 - 1 + 1)) + 1;
  }
}