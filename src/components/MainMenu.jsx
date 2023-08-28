import { useEffect, useRef, useState, useContext } from "react";
import { app, meeting } from "@microsoft/teams-js";
import { UserMeetingRole } from "@microsoft/live-share";
import {
  DefaultButton,
  Dialog,
  FontIcon,
  PrimaryButton,
  TextField,
} from "@fluentui/react";
import { initializeIcons } from "@fluentui/font-icons-mdl2";
import GameCard from "./GameCard.jsx";
import games from "../model/Games.js";
import GameIcon from "./GameIcon.jsx";
import "./MainMenu.css";

export const MainMenu = () => {
  const [menuVisible, setMenuVisible] = useState(true);
  const [gameSettingsVisible, setGameSettingsVisible] = useState(false);
  const [selectGame, setSelectGame] = useState("");

  const currentGame = games.filter((game) => game.Title === selectGame)[0];

  const showMenu = () => {
    setMenuVisible(false);
    setGameSettingsVisible(true);
  };

  const showGame = () => {
    setMenuVisible(true);
    setGameSettingsVisible(false);
  };

  return (
    <div>
      <div className="bg"></div>
      <div className="wrapper">
        <div className="container">
          <div className="logo"></div>
          <hr className="line"></hr>
          <br />
          <div>
            {menuVisible && (
              <div className="gameCard">
                {games.map((game) => {
                  return (
                    <GameIcon
                      props={showMenu}
                      game={game}
                      selectGame={setSelectGame}
                    />
                  );
                })}
              </div>
            )}
            {gameSettingsVisible && (
              <>
                <GameCard games={currentGame} showGame={showGame} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
