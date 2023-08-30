// The main app which handles the initialization and routing of the app
// React
import React from "react";
import { useEffect, useState } from "react";
// LiveShare
import FluidService from "../services/fluidLiveShare.js";
// Teams
import { FrameContexts, app } from "@microsoft/teams-js";
// JSX File
import { SidePanel } from "./SidePanel.jsx";
import { GamePage } from "./GamePage.jsx";
// CSS File
// import "./css/App.css";

export default function RexGame() {
  const [presence, setPresence] = useState(null);
  const [frame, setFrame] = React.useState("");

  const initialize = async () => {
    await app.initialize();

    app.notifyAppLoaded();
    app.notifySuccess();

    const context = await app.getContext();
    setFrame(context.page.frameContext);

    if (
      context.page.frameContext === FrameContexts.sidePanel ||
      context.page.frameContext === FrameContexts.meetingStage
    ) {
      await FluidService.connect();
      const presence = await FluidService.getPresence();
      setPresence(presence);
    } else {
      setPresence(null);
    }
  };

  useEffect(() => {
    initialize();
  }, []);

  return (
    <div>
      {frame == FrameContexts.sidePanel && <SidePanel presence={presence} />}
      {frame == FrameContexts.meetingStage && <GamePage presence={presence} />}
    </div>
  );
}
