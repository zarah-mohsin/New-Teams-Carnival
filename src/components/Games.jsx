import React from "react";
import { useNavigate } from "react-router-dom";
import TabDisplayContext from "./TabDisplayContext";
import SnakesGame from "../game-files/SnakesAndLadders/SnakesGame";
import Game from "../game-files/TriviaRace/Game";
import Pacman from "../game-files/Pacman/Pacman";
import { PrimaryButton } from "@fluentui/react";

export default function Games() {
  const { tabDisplay } = React.useContext(TabDisplayContext);
  const navigate = useNavigate();
  return (
    <div>
      {tabDisplay === "Snakes and Ladders" && <SnakesGame />}
      {tabDisplay === "Trivia Race" && <Game />}
      {tabDisplay === "Pacman" && <Pacman />}
      {/* {tabDisplay === "Might & Malice" && <TurnBasedCombat />} */}
      <PrimaryButton
        className="main-menu-button"
        text="Main Menu"
        onClick={() => navigate("/tab")}
      />
    </div>
  );
}
