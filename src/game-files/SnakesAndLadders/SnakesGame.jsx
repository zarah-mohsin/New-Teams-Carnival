import React, { useState, useEffect } from "react";
import { SidePanel } from "./SidePanel";
import { app } from "@microsoft/teams-js";
import MeetingStage from "./MeetingStage";

const SnakesGame = () => {
  const [myName, setMyName] = useState("");
  const [frameContext, setFrameContext] = useState("");

  useEffect(() => {
    async function getContext() {
      try {
        const context = await app.getContext();
        setFrameContext(context.page.frameContext);

        const username = context?.user?.userPrincipalName.split("@")[0];
        setMyName(username);
      } catch (error) {
        // Handle error if any
      }
    }

    getContext();
  }, []);

  return (
    <div>
      {frameContext == "sidePanel" && <SidePanel user={myName} />}
      {frameContext == "meetingStage" && <MeetingStage user={myName} />}
    </div>
  );
};

export default SnakesGame;
