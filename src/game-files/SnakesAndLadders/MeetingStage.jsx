import React, { Fragment, useState, useCallback, useEffect } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import FluidService from "./fluidLiveShare";
import { app } from "@microsoft/teams-js";
import "./snakes.css";

export default function MeetingStage({ user }) {
  const myName = user;
  const [fluidWorks, setFluidWorks] = useState(null);
  const [gameOver, setGameOver] = useState(false);

  const {
    unityProvider,
    addEventListener,
    removeEventListener,
    sendMessage,
    isLoaded,
  } = useUnityContext({
    loaderUrl: "build/build.loader.js",
    dataUrl: "build/build.data",
    frameworkUrl: "build/build.framework.js",
    codeUrl: "build/build.wasm",
  });

  //////////////LETS ROLL BUTTON TRIGGER///////////////////////

  const handlePlayers = useCallback((number) => {
    FluidService.emptyTrigger();
  }, []);

  useEffect(() => {
    addEventListener("SetPlayersNumber", handlePlayers);
    return () => {
      removeEventListener("SetPlayersNumber", handlePlayers);
    };
  }, [addEventListener, removeEventListener, handlePlayers]);

  /////////////////PASSING DICE VALUE////////////////////////////////

  const passDiceValue = useCallback(async (number) => {
    //add the the movementCount
    //setMovementCount(prevCount => prevCount + 1);

    const fluidArray = await FluidService.getValues();
    if (fluidArray[1] === myName) {
      //If this condition is true, it means it is our turn to move so we will allow for the dice to be rolled.
      //setDice(number);
      FluidService.updateValues(number); //works
    }
  }, []);

  useEffect(() => {
    addEventListener("PassDiceValue", passDiceValue);
    return () => {
      removeEventListener("PassDiceValue", passDiceValue);
    };
  }, [addEventListener, removeEventListener, passDiceValue]);

  /////////////////////////////////////FLUID///////////////////////////////////////////
  useEffect(() => {
    app.initialize().then(async () => {
      try {
        await FluidService.connect();

        FluidService.onNewData((array) => {
          if (array[0] === -1) {
            setTimeout(() => {
              setGameOver(true);
            }, 5000);
          } else {
            sendMessage("Dummy", "LoadGame", array[0]);

            sendMessage("Dice", "RollFromReact", array[0]);
          }
        });

        setFluidWorks(true);
      } catch (error) {
        setFluidWorks(false);
      }
    });
  }, [sendMessage]);

  return (
    <div>
      {fluidWorks === null && <p>Loading...</p>}
      {fluidWorks === false && (
        <p>
          There is an issue with your connection. Please restart the
          application.
        </p>
      )}
      {fluidWorks === true && !gameOver && (
        <Fragment>
          <div className="unity-container">
            <Unity unityProvider={unityProvider} style={{ width: "90vw" }} />
          </div>
        </Fragment>
      )}
    </div>
  );
}
