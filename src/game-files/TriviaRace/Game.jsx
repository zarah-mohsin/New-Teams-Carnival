import React, { useState, useEffect } from 'react';
import {SidePanel} from './SidePanel';
import Quiz from './Quiz';
import { app } from "@microsoft/teams-js";

const Game = () => {

const [frameContext, setFrameContext] = useState("");
const [myName, setMyName] = useState("");

  useEffect(() => {
    async function getContext() {
      try {
        const context = await app.getContext();
        setFrameContext(context.page.frameContext);

        const username = context?.user?.userPrincipalName.split("@")[0];
        setMyName(username);

      } catch (error) {
        //
      }
    }

    getContext();
  }, []);


  return (
    <div>
      {frameContext == "sidePanel" && <SidePanel />}
      {frameContext == "meetingStage" && <Quiz user={myName} />}
    </div>
  );
};

export default Game;
