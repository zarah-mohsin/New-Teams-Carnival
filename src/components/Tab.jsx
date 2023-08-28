import { useState, useEffect } from "react";
import { FrameContexts, app } from "@microsoft/teams-js";
import { MainMenu } from "./MainMenu";
import "./MainMenu.css";

export default function Tab() {
  const [ready, setReady] = useState(false);
  const [frameContext, setFrameContext] = useState("");

  useEffect(() => {
    async function getContext() {
      try {
        const context = await app.getContext();
        setFrameContext(context.page.frameContext);

        if (
          context.page.frameContext == FrameContexts.sidePanel ||
          context.page.frameContext == FrameContexts.meetingStage
        ) {
          setReady(true);
        }
      } catch (error) {
        // Handle error if any
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
            <p>This app only works in Teams meetings!</p>
            <p>Click join to let the fun begin!</p>
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
