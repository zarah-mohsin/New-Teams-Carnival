import { useState, useEffect } from "react";
import { app, meeting } from "@microsoft/teams-js";
import FluidService from "./fluidLiveShare.js";
import titleCard from "./title.png";

export const SidePanel = () => {
  const speedOptions = ["Tortoise", "Falcon", "Cheetah"];
  const [selectedSpeedIndex, setSelectedSpeedIndex] = useState(null);
  const [fluidWorks, setFluidWorks] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [timerValue, setTimerValue] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [scoreboard, setScoreboard] = useState([]);

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const endGame = () => {
    FluidService.signalEnd();
  };

  /////////////////////////////////////FLUID///////////////////////////////////////////
  useEffect(() => {
    app.initialize().then(async () => {
      try {
        await FluidService.connect();
        FluidService.resetMap();

        FluidService.onNewData((array) => {
          if (array.length === 1) {
            setSelectedSpeedIndex(array[0]);

            setTimeout(() => {
              setGameStarted(true);

              if (array[0] === 0) {
                setTimerValue(300);
              } else if (array[0] === 1) {
                setTimerValue(180);
              } else {
                setTimerValue(90);
              }
              setIsTimerRunning(true);

              const timerInterval = setInterval(() => {
                setTimerValue((prevValue) => {
                  if (prevValue > 0) {
                    return prevValue - 1;
                  } else {
                    clearInterval(timerInterval);
                    setIsTimerRunning(false);
                    endGame();
                    return 0;
                  }
                });
              }, 1000);
              return () => {
                clearInterval(timerInterval);
                setIsTimerRunning(false);
                setTimerValue(0);
              };
            }, 5000);
          }

          setScoreboard(array);
        });

        setFluidWorks(true);
      } catch (error) {
        setFluidWorks(false);
      }
    });
  }, []);

  ////////////////////////////////////////////////////////////////

  const panelStyle = {
    color: "lightblue",
    height: "100vh",
    width: "100vw",
    fontSize: "20px",
    fontWeight: "bold",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  };

  const scoreStyle = {
    color: "lightblue",
    font: "24px",
    fontWeight: "bold",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    border: "2px solid lightblue",
    padding: "10px",
    width: "80vw",
  };

  const buttonStyle = {
    marginBottom: "5px",
    padding: "10px",
    backgroundColor: "lightblue",
    color: "black",
    border: "none",
    cursor: "pointer",
    height: "60px",
    fontSize: "18px",
    width: "90vw",
  };

  const activeButtonStyle = {
    ...buttonStyle,
    backgroundColor: "grey",
  };

  const verticalButtons = {
    display: "flex",
    flexDirection: "column",
    height: "300px",
    justifyContent: "space-between",
  };

  const timerStyle = {
    fontSize: "40px",
    fontWeight: "bold",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: "20px",
  };

  const shareToStage = () => {
    meeting.shareAppContentToStage((error, result) => {
      if (!error) {
        console.log("Started sharing to stage");
      } else {
        console.warn("shareAppContentToStage failed", error);
      }
    }, window.location.origin + "?inTeams=1&view=stage");
  };

  const startGame = (index) => {
    setSelectedSpeedIndex(index);
    FluidService.setSpeed(index);
    shareToStage();
  };

  return (
    <div style={panelStyle}>
      <img src={titleCard} style={{ width: "100%" }} alt="Trivia Race" />
      {fluidWorks === null && <p>Loading...</p>}
      {fluidWorks === false && (
        <p>
          There is an issue with your connection. Please restart the
          application.
        </p>
      )}
      {fluidWorks === true && !gameStarted && (
        <div>
          <p>Play against the other participants and race against time!</p>

          {!gameStarted && (
            <div style={verticalButtons}>
              <p>Choose your speed: </p>
              {speedOptions.map((speedOption, index) => (
                <button
                  key={index}
                  style={
                    selectedSpeedIndex === index
                      ? activeButtonStyle
                      : buttonStyle
                  }
                  onClick={() => startGame(index)}
                >
                  {speedOption}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {gameStarted && isTimerRunning && (
        <div>
          <p>You better hurry!</p>
          <p style={timerStyle}>{formatTime(timerValue)}</p>
        </div>
      )}

      {gameStarted && !isTimerRunning && (
        <p>You've reached the finish line! Here are your final scores: </p>
      )}

      {scoreboard.length > 1 && gameStarted && (
        <div style={scoreStyle}>
          {scoreboard.map((item, index) => (
            <div key={index}>
              {typeof item === "object" ? (
                <div>
                  {Object.entries(item).map(([key, value]) => (
                    <p key={key}>
                      {key}: {value}
                    </p>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
