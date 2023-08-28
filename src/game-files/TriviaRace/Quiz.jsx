import React, { Fragment, useState, useCallback, useEffect } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import { app } from "@microsoft/teams-js";
import FluidService from "./fluidLiveShare";

export default function Quiz({ user }) {
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("");
  const [board, setBoard] = useState([]);
  const [fluidWorks, setFluidWorks] = useState(null);

  const { unityProvider, addEventListener, removeEventListener, sendMessage } =
    useUnityContext({
      loaderUrl: "build/TriviaRace/build.loader.js",
      dataUrl: "build/TriviaRace/build.data",
      frameworkUrl: "build/TriviaRace/build.framework.js",
      codeUrl: "build/TriviaRace/build.wasm",
    });

  const receiveScore = useCallback(
    (newScore) => {
      setScore(newScore);
      const updatedBoard = [...board];
      const index = updatedBoard.findIndex((obj) => obj.hasOwnProperty(user));

      if (index !== -1) {
        updatedBoard[index][user] = newScore;
      } else {
        updatedBoard.push({ [user]: newScore });
      }

      FluidService.updateValues(updatedBoard);
    },
    [board, user, setBoard]
  );

  useEffect(() => {
    addEventListener("SendScore", receiveScore);
    return () => {
      removeEventListener("SendScore", receiveScore);
    };
  }, [addEventListener, removeEventListener, receiveScore]);

  /////////////////////////////////////FLUID///////////////////////////////////////////
  useEffect(() => {
    app.initialize().then(async () => {
      try {
        await FluidService.connect();
        const startingBoard = await FluidService.getValues();
        setBoard(startingBoard);

        FluidService.onNewData((array) => {
          console.log("LOGGING ARRAY");
          console.log(array);

          setBoard(array);

          if (array[array.length - 1] === -1) {
            console.log("YEP");
            sendMessage("ReactMessenger", "GameOver");
          }
        });

        setFluidWorks(true);
      } catch (error) {
        setFluidWorks(false);
      }
    });
  }, [sendMessage]);

  ////////////////////////////////////////////////////////////////

  const textStyle = {
    fontSize: "20px",
    fontWeight: "bold",
    color: "lightblue",
    textAlign: "center",
  };

  return (
    <Fragment>
      {fluidWorks === null && <p style={textStyle}>Loading...</p>}
      {fluidWorks === false && (
        <p style={textStyle}>
          There is an issue with your connection. Inform the other players and
          restart the application.
        </p>
      )}
      {fluidWorks === true && (
        <Unity unityProvider={unityProvider} style={{ width: "100%" }} />
      )}
    </Fragment>
  );
}
