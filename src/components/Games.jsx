import React, { useEffect } from "react";
import { app, FrameContexts } from "@microsoft/teams-js";
import { useNavigate } from "react-router-dom";
import TabDisplayContext from "./TabDisplayContext";
import SnakesGame from "../game-files/SnakesAndLadders/SnakesGame";
import Game from "../game-files/TriviaRace/Game";
import Pacman from "../game-files/Pacman/Pacman";
import TurnBasedCombat from "../game-files/MightAndMalice/TurnBasedCombat";
import { PrimaryButton } from "@fluentui/react";

export default function Games() {
  const { tabDisplay } = React.useContext(TabDisplayContext);
  const [frame, setFrame] = React.useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    async function getContext() {
      try {
        const context = await app.getContext();
        setFrame(context.page.frameContext);
      } catch (error) {
        console.error(error);
      }
    }
    getContext();
  }, []);
  return (
    <div>
      {tabDisplay === "Snakes and Ladders" && <SnakesGame />}
      {tabDisplay === "Trivia Race" && <Game />}
      {tabDisplay === "Pacman" && <Pacman />}
      {tabDisplay === "Might and Malice" && <TurnBasedCombat />}
      {frame === FrameContexts.sidePanel && (
        <PrimaryButton
          className="main-menu-button"
          text="Main Menu"
          onClick={() => navigate("/tab")}
        />
      )}
    </div>
  );
}
