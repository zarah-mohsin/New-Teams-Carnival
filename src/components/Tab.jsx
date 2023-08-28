import { useContext } from "react";
import { MainMenu } from "./MainMenu";
import { TeamsFxContext } from "./Context";
import config from "./sample/lib/config";

const showFunction = Boolean(config.apiName);

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
