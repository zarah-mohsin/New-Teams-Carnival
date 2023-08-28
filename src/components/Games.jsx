import React from "react";
import TabDisplayContext from "./TabDisplayContext";
import SnakesGame from "../game-files/SnakesAndLadders/SnakesGame";
import Game from "../game-files/TriviaRace/Game";
import Pacman from "../game-files/Pacman/Pacman";

export default function Games() {
  const { tabDisplay } = React.useContext(TabDisplayContext);
  return (
    <div>
      <p>{tabDisplay}</p>
      {tabDisplay === "Snakes and Ladders" && <SnakesGame />}
      {tabDisplay === "Trivia Race" && <Game />}
      {tabDisplay === "Pacman" && <Pacman />}
      {/* {tabDisplay === "Might & Malice" && <TurnBasedCombat />} */}
    </div>
  );
}
