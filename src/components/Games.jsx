import React from "react";
import TabDisplayContext from "./TabDisplayContext";
import SnakesGame from "../game-files/SnakesAndLadders/SnakesGame";
import Game from "../game-files/TriviaRace/Game";

export default function Games() {
  const { tabDisplay } = React.useContext(TabDisplayContext);
  return (
    <div>
      {tabDisplay === "Snakes and Ladders" && <SnakesGame />}
      {tabDisplay === "Trivia Race" && <Game />}
      {/* {tabDisplay === "Might & Malice" && <TurnBasedCombat />} */}
    </div>
  );
}
