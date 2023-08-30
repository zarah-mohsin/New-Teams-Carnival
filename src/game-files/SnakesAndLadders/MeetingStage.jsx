import React, { Fragment, useState, useCallback, useEffect } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import FluidServiceSnakes from "./snakesFluidLiveShare";
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
    loaderUrl: "build/SnakesAndLadders/build.loader.js",
    dataUrl: "build/SnakesAndLadders/build.data",
    frameworkUrl: "build/SnakesAndLadders/build.framework.js",
    codeUrl: "build/SnakesAndLadders/build.wasm",
  });

  //////////////LETS ROLL BUTTON TRIGGER///////////////////////

  const handlePlayers = useCallback((number) => {
    FluidServiceSnakes.emptyTrigger();
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

    const fluidArray = await FluidServiceSnakes.getValues();
    if (fluidArray[1] === myName) {
      //If this condition is true, it means it is our turn to move so we will allow for the dice to be rolled.
      //setDice(number);
      FluidServiceSnakes.updateValues(number); //works
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
        await FluidServiceSnakes.connect();

        FluidServiceSnakes.onNewData((array) => {
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
