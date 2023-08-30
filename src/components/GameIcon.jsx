import React from "react";
import TabDisplayContext from "./TabDisplayContext";

export default function GameIcon({ props, selectGame, game }) {
  const { setTabDisplay } = React.useContext(TabDisplayContext);
  return (
    <div>
      <button
        key={game.Title}
        className="gameSelect"
        onClick={() => {
          props();
          selectGame(game.Title);
          setTabDisplay(game.Title);
        }}
      >
        <img alt="game icon" src={game.Icon} />
      </button>
      <p>{game.Title}</p>
    </div>
  );
}
