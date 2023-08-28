import { useContext } from "react";
import { MainMenu } from "./MainMenu";
import { TeamsFxContext } from "./Context";
import "./MainMenu.css";

export default function Tab() {
  const { themeString } = useContext(TeamsFxContext);
  return (
    <div
      className={
        themeString === "default"
          ? "light"
          : themeString === "dark"
          ? "dark"
          : "contrast"
      }
    >
      <MainMenu />
    </div>
  );
}
