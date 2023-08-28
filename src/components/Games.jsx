import React from "react";
import TabDisplayContext from "./TabDisplayContext";
import SnakesGame from "../game-files/SnakesAndLadders/SnakesGame";

export default function Games() {
  const { tabDisplay } = React.useContext(TabDisplayContext);
  return (
    <div>
      {tabDisplay === "Snakes and Ladders" && <SnakesGame />}
      {/* {tabDisplay === "Might & Malice" && <TurnBasedCombat />} */}
    </div>
  );
}
