# campeonato-api
API para simular campeonato de futebol

# Football Championship API
# Descrição
A Football Championship API permite gerenciar campeonatos de futebol, times e jogos. 
Com essa API, você pode criar campeonatos, associar times a campeonatos, 
e gerenciar jogos com suas pontuações. 
Esta API foi desenvolvida utilizando Node.js, TypeScript e PostgreSQL, 
com a biblioteca Sequelize para o ORM e gerenciamento de banco de dados.

# Funcionalidades
1. Gerenciar Campeonatos:
    - Criar, atualizar e listar campeonatos.
    - Associar times a campeonatos.
2. Gerenciar Times:
    - Criar e listar times.
    - Vincular times a campeonatos.
3. Gerenciar Jogos:
    - Criar jogos entre os times de um campeonato.
    - Atualizar pontuações de jogos.

# Tecnologias Utilizadas
1. Node.js: Plataforma para o desenvolvimento do servidor.
2. TypeScript: Superset do JavaScript para tipagem estática.
3. Express.js: Framework para construção de APIs com Node.js.
4. PostgreSQL: Banco de dados relacional para persistência dos dados.
5. Sequelize: ORM para o gerenciamento do banco de dados.
6. Jest: Framework para testes unitários.

# Pré-requisitos
Antes de começar, certifique-se de ter o seguinte instalado:
1. Node.js (versão 16 ou superior)
2. PostgreSQL (versão 12 ou superior)

# Instalação
Clone o repositório:
git clone https://github.com/Rafael-Antunes-Brasil/campeonato-api

# Acesse a pasta do projeto:
cd campeonato_futebol

# Instale as dependências:
npm install

# Configure o banco de dados PostgreSQL:
1. Crie um banco de dados no PostgreSQL para a API.
2. A configuração do banco de dados é feita no arquivo config/database.ts.
3. Atualize a configuração conforme o seu ambiente local.

Exemplo de database.ts:

const sequelize = new Sequelize(
  <nome_do_banco>,
  <usuario>,
  <senha>,
  {
    host: 'localhost',
    dialect: 'postgres',
});

# Inicie o servidor:
npm start

# O servidor estará rodando em http://localhost:3000.

# Endpoints
1. Campeonatos
  - GET /previous-championships: Retorna campeonatos anteriores.
  - POST /new-championship: Cria um novo campeonato.
  - POST /switching: Cria o chaveamento do campeonato.
2. Times
  - GET /previous-teams: Retorna a lista de times.
  - POST /new-teams: Cria um ou mais times.
3. Jogos
  - GET /previous-games: Retorna a lista de jogos.
  - POST /quarter-finals: Simula os jogos das quartas de finais.
  - POST /semi-final: Simula os jogos das semi finais.
  - POST /third-place: Simula o jogo da disputa pelo terceiro lugar.
  - POST /grand-final: Simula o jogo da final.

# Exemplo de Uso

# Inserir times
Invoke-RestMethod -Uri http://localhost:3000/new-teams -Method Post `
  -Headers @{ "Content-Type" = "application/json" } `
  -Body '[
    { "name": "Francana" },
    { "name": "Palmeiras" },
    { "name": "Corinthians" },
    { "name": "Santos" },
    { "name": "São Paulo" },
    { "name": "Fluminense" },
    { "name": "Vasco da Gama" },
    { "name": "Flamengo" }
  ]'

# Listar Times
Invoke-RestMethod -Uri http://localhost:3000/previous-teams

# Criar um Campeonato
Invoke-RestMethod -Uri http://localhost:3000/new-championship `
  -Method Post `
  -Headers @{ "Content-Type" = "application/json" } `
  -Body '{"name": "Copa do Brasil", "year": 2099, "teamsIds": [39, 40, 41, 42, 43, 44, 45, 46]}'

# Gerar chaveamento do campeonato
Invoke-RestMethod -Uri http://localhost:3000/switching `
  -Method Post `
  -Headers @{ "Content-Type" = "application/json" } `
  -Body '{"championshipId": 7}'

# Gerar jogos das quartas de final
Invoke-RestMethod -Uri http://localhost:3000/quarter-finals `
    -Method post -ContentType "application/json" `
    -Body '{"championshipId": 7}'`

# Gerar jogos das semi finais
Invoke-RestMethod -Uri http://localhost:3000/semi-final `
    -Method post -ContentType "application/json" `
    -Body '{"championshipId": 7}'`

# Gerar jogo do terceiro lugar
Invoke-RestMethod -Uri http://localhost:3000/third-place `
    -Method post -ContentType "application/json" `
    -Body '{"championshipId": 7}'`

# Gerar jogo final
Invoke-RestMethod -Uri http://localhost:3000/grand-final `
    -Method post -ContentType "application/json" `
    -Body '{"championshipId": 7}'`

# Buscar pelo campeonato
Invoke-RestMethod -Uri http://localhost:3000/previous-championships `
    -Method get -ContentType "application/json" `
    -Body '{"championshipId": 7}'`

# Estrutura de Diretórios
/src
  /championships
    /rota              # Definição das rotas da API
    /controller         # Lógica dos endpoints
    /repositorio        # Lógica de consultas e manipulação de dados no banco
  /config               # Configuração do banco de dados e Sequelize
  /games
    /rota              # Definição das rotas da API
    /controller         # Lógica dos endpoints
    /repositorio        # Lógica de consultas e manipulação de dados no banco
  /models               # Definições dos modelos Sequelize
  /teams
    /rota              # Definição das rotas da API
    /controller         # Lógica dos endpoints
    /repositorio        # Lógica de consultas e manipulação de dados no banco

# Contribuições
# Contribuições são bem-vindas! Para contribuir, siga os passos abaixo:
1. Faça um fork do projeto.
2. Crie uma nova branch (git checkout -b feature/nova-feature).
3. Commit suas mudanças (git commit -am 'Adiciona nova feature').
4. Envie para o branch (git push origin feature/nova-feature).
5. Crie um Pull Request.

# Licença
Este projeto está licenciado sob a licença MIT.