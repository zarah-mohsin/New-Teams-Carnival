import React from "react";
import TabDisplayContext from "./TabDisplayContext";
import { useNavigate } from "react-router-dom";
import { DefaultButton, PrimaryButton, Stack } from "@fluentui/react";

export default function GameCard({ games, showGame }) {
  const { tabDisplay, setTabDisplay } = React.useContext(TabDisplayContext);
  const navigate = useNavigate();
  return (
    <div>
      <div className="wrapper">
        <div className="iconColumn">
          <img alt="game icon" className="gameIcon" src={games.Icon} />
        </div>
        <div className="detailsColumn">
          <h6 style={{ textAlign: "center" }}>{games.Title}</h6>
          <p>{games.Description}</p>
          {games.MaxPlayers == "None" ? (
            <h6>Players: {games.MinPlayers}+</h6>
          ) : (
            <h6>
              Players: {games.MinPlayers}-{games.MaxPlayers}
            </h6>
          )}
        </div>
        <br />
        <Stack horizontal tokens={{ childrenGap: "40" }}>
          <DefaultButton text="Back" onClick={showGame} />
          <PrimaryButton
            text="Play"
            className="main-menu-button"
            onClick={() => (setTabDisplay(games.Title), navigate("/game"))}
          />
        </Stack>
      </div>
    </div>
  );
}
