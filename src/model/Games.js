const games = [
  {
    Title: "Snakes and Ladders",
    Description:
      "Roll the dice, climb ladders, and avoid snakes in this classic board game of chance and strategy",
    MaxPlayers: 4,
    MinPlayers: 1,
    Icon: require("../game-files/SnakesAndLadders/icon.png"),
  },
  {
    Title: "Teams-Rex",
    Description: "T-rex game for teams",
    MaxPlayers: "None",
    MinPlayers: 1,
    Icon: require("../game-files/Teams-Rex/icon.png"),
  },
  {
    Title: "Jenga",
    Description: "Play Jenga with your friends",
    MaxPlayers: "None",
    MinPlayers: 1,
    Icon: require("../game-files/Jenga/icon.png"),
  },
  {
    Title: "Balloon Bomb",
    Description:
      "Experience the excitement of Balloon Bomb! Inflate a virtual balloon to the brink of an explosion in this game. Play, pump to the limits, and enjoy an immersive experience!",
    MaxPlayers: "None",
    MinPlayers: 1,
    Icon: require("../game-files/BalloonBomb/icon.png"),
  },
  {
    Title: "Trivia Race",
    Description:
      "Compete against other participants in a fast-paced quiz challenge to test your knowledge and climb the rankings.",
    MaxPlayers: "None",
    MinPlayers: 1,
    Icon: require("../game-files/TriviaRace/icon.png"),
  },
  {
    Title: "Might & Malice",
    Description: "Fight for glory in this turn-based combat game!",
    MaxPlayers: "None",
    MinPlayers: 2,
    Icon: require("../game-files/MightAndMalice/icon.png"),
  },
];

export default games;
