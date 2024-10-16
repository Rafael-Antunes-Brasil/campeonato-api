import Championship from "./models/championships";
import Game from "./models/games";
import Team from "./models/teams";
import TeamsChampionships from "./models/teams-championships";

//Um campeonato pode ter muitos times
Championship.belongsToMany(Team, {
    through: TeamsChampionships,
    foreignKey: 'championship_id',
    otherKey: 'team_id',
    as: 'teams'
})

//Um time pode participar de vários campeonatos
Team.belongsToMany(Championship, {
    through: TeamsChampionships,
    foreignKey: 'team_id',
    otherKey: 'championship_id',
    as: 'championships'
})

// Um campeonato pode ter muitos jogos
Championship.hasMany(Game, {
    foreignKey: 'championship_id',
    as: 'games'
});

// Um jogo pertence a um campeonato
Game.belongsTo(Championship, {
    foreignKey: 'championship_id',
    as: 'championship'
});

// Um jogo tem um time da casa
Game.belongsTo(Team, {
    foreignKey: 'teamA_id',
    as: 'homeTeam'
});

// Um time pode jogar muitos jogos como time da casa
Team.hasMany(Game, {
    foreignKey: 'teamA_id',
    as: 'homeGames'
});

// Um jogo tem um time visitante
Game.belongsTo(Team, {
    foreignKey: 'teamB_id',
    as: 'awayTeam'
});

// Um time pode jogar muitos jogos como time visitante
Team.hasMany(Game, {
    foreignKey: 'teamB_id',
    as: 'awayGames'
});