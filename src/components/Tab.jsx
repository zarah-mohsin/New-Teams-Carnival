import { useState, useEffect } from "react";
import { FrameContexts, app } from "@microsoft/teams-js";
import { MainMenu } from "./MainMenu";
import "./MainMenu.css";

export default function Tab() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function getContext() {
      try {
        const context = await app.getContext();
        if (
          context.page.frameContext == FrameContexts.sidePanel ||
          context.page.frameContext == FrameContexts.meetingStage
        ) {
          setReady(true);
        }
      } catch (error) {
        console.error(error);
      }
    }
    getContext();
  }, []);

  if (!ready) {
    return (
      <div>
        <div className="bg"></div>
        <div className="wrapper" style={{ justifyContent: "center" }}>
          <div className="container">
            <div className="logo"></div>
            <hr className="line"></hr>
            <br />
            <h2>This app only works in Teams meetings!</h2>
            <br />
            <h2>Click join to let the fun begin!</h2>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div>
        <MainMenu />
      </div>
    );
  }
}
