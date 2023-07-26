const express = require("express");
const app = express();
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbPath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(e.message);
  }
};

initializeDBAndServer();

//Get Players API-1
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT 
        player_id AS playerId,
        player_name AS playerName
    FROM 
        player_details; `;
  const playersArray = await db.all(getPlayersQuery);
  response.send(playersArray);
});

//GET Player API-2

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT 
        player_id AS playerId,
        player_name AS playerName
    FROM 
        player_details
    WHERE 
        player_id = ${playerId};`;
  const player = await db.get(getPlayerQuery);
  response.send(player);
});

// PUT Player API-3
app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName } = playerDetails;
  const putPlayerDetails = `
UPDATE
     player_details
SET
    player_name = '${playerName}'

WHERE 
    player_id = ${playerId};`;

  await db.run(putPlayerDetails);
  response.send("Player Details Updated");
});

// GET Match API-4
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchDetails = `
    SELECT 
        match_id AS matchId,
        match,
        year
    FROM match_details
    WHERE match_id = ${matchId}; `;
  const match = await db.get(getMatchDetails);
  response.send(match);
});

// GET Player matches API-5
app.get("/players/:playerId/matches/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerMatchesQuery = `
    SELECT 
        match_id AS matchId,
        match,
        year
    FROM player_match_score NATURAL JOIN match_details
    WHERE player_id = ${playerId};`;
  const matchesArray = await db.all(getPlayerMatchesQuery);
  response.send(matchesArray);
});

// GET player list of specific match API_6
app.get("/matches/:matchId/players/", async (request, response) => {
  const { matchId } = request.params;
  const getPlayersQuery = `
    SELECT 
        player_match_score.player_id AS playerId,
        player_name AS playerName
    FROM player_details INNER JOIN player_match_score ON player_details.player_id = player_match_score.player_id
    WHERE match_id = ${matchId}; `;
  const player = await db.all(getPlayersQuery);
  response.send(player);
});

// GET statistics of player API_7
app.get("/players/:playerId/playerScores/", async (request, response) => {
  const { playerId } = request.params;
  const getStats = `
    SELECT 
        player_details.player_id AS playerId,
        player_details.player_name AS playerName,
        SUM(player_match_score.score) AS totalScore,
        SUM(fours) AS totalFours,
        SUM(sixes) AS totalSixes
    FROM player_Details INNER JOIN player_match_score ON player_details.player_id = player_match_score.player_id
    WHERE player_details.player_id = ${playerId}; `;
  const playerScores = await db.get(getStats);
  response.send(playerScores);
});

module.exports = app;
