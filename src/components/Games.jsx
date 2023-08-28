import React from "react";
import TabDisplayContext from "./TabDisplayContext";

export default function Games() {
  const { tabDisplay, setTabDisplay } = React.useContext(TabDisplayContext);
  return (
    <div>
      {/* {tabDisplay === "Snakes and Ladders" && <Game />} */}
      {/* {tabDisplay === "Might & Malice" && <TurnBasedCombat />} */}
    </div>
  );
}
