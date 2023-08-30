// - - - - - - - - - - Package Import - - - - - - - - - -

// React
import React from "react";
import { useEffect, useState, useCallback, useRef, Fragment } from "react";
// React Unity WebGL API
import { Unity, useUnityContext } from "react-unity-webgl";
// LiveShare SDK
import FluidService from "../services/fluidLiveShare.js";
import * as liveShareHooks from "../live-share-hooks";
// Microsoft Teams
import { app } from "@microsoft/teams-js";
import { UserMeetingRole } from "@microsoft/live-share";
import { LiveNotifications } from "./function/LiveNotifications.jsx";
// JSX File
import "./RexGame.jsx";
// CSS File
import "./css/GamePage.css";
import "./css/SidePanel.css";
// Image
import heart01 from "./image/heart01.png";
import heart02 from "./image/heart02.png";
import heart03 from "./image/heart03.png";

// - - - - - - - - - - Game Page Constant - - - - - - - - - -

export const GamePage = (presence) => {
  // - - - - - - - - - -
  //  00.Variables
  //  - - - - - - - - - -

  const [people, setPeople] = useState([]);
  const [username, setUsername] = useState("");
  const [addedName, setAddedName] = useState("");

  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("Connecting to Fluid service...");

  // Use in Live Notification
  const [notificationEvent, setNotificationEvent] = useState(null);
  const [context, setContext] = useState(null);

  const ALLOWED_ROLES = [UserMeetingRole.organizer];

  // Use in Initialize function
  const { users } = liveShareHooks.usePresence(presence, ALLOWED_ROLES);

  // - - - - - - - - - - End

  // - - - - - - - - - -
  // 01.Destruction & Load Unity App
  // - - - - - - - - - -

  const {
    unityProvider,
    isLoaded,
    loadingProgression,
    addEventListener,
    removeEventListener,
    sendMessage,
  } = useUnityContext({
    loaderUrl: "/teamsRexBuild/trex.loader.js", // Unity Engine bootstrapping code (Unity 引擎引导代码)
    dataUrl: "/teamsRexBuild/trex.data", // Execute Unity game (负责运行实际的 Unity 应用程序)
    frameworkUrl: "/teamsRexBuild/trex.framework.js", // Game resource (游戏资源)
    codeUrl: "/teamsRexBuild/trex.wasm",
  });

  // - - - - - - - - - - End

  // - - - - - - - - - -
  // 02.Initialize function
  // - - - - - - - - - -

  useEffect(() => {
    const initialize = async () => {
      app.initialize().then(async () => {
        try {
          await app.initialize();
          app.notifySuccess();

          const context = await app.getContext(); // Assign (empty) value to 'context'
          const username = context?.user?.userPlayerName;

          await FluidService.connect(); // Connect to the Fluid relay service

          const people = await FluidService.getPersonList(); // Assign person list to 'people'
          const notify = FluidService.getLiveEvent(); // Assign value to 'notify'

          setReady(true);
          setMessage("");
          setPeople(people.people);
          setUsername(username);

          setContext(context); // Set 'context' (use is Live Notification)
          setNotificationEvent(notify); // Set 'notify' (use in Live Notification)

          // Register an event handler to update state when fluid data changes
          // - - - - - - - - - -
          FluidService.onNewData((people) => {
            setReady(true);
            setPeople(null); // Clear the existing people data in preparation for the updated data
            setPeople(people.people); // Updated people data received in the event handle
            setMessage("");
          });
        } catch (error) {
          setReady(false);
          setMessage(`ERROR: ${error.message}`);
        }
      });
    };
    initialize();
  }, [sendMessage]);

  // - - - - - - - - - - End

  // - - - - - - - - - -
  // 03.Player name receive (from Unity) and send (to SidePanel.jsx)
  // - - - - - - - - - -

  const [playerName, SetPlayerName] = useState();
  const handleSetPlayerName = useCallback((playerName) => {
    SetPlayerName(playerName);
    localStorage.setItem("playerName", playerName);
  });

  // Listen for subsequent Player name changes (监听后续 Player name 更改)
  useEffect(() => {
    addEventListener("PlayerNameEvent", handleSetPlayerName);
    return () => {
      removeEventListener("PlayerNameEvent", handleSetPlayerName);
    };
  }, [addEventListener, removeEventListener, handleSetPlayerName]);

  sessionStorage.setItem("playerName", playerName);

  // - - - - - - - - - - End

  // - - - - - - - - - -
  // 04.Ready state receive and send
  // - - - - - - - - - -

  const [isReady, SetIsReady] = useState();
  const handleSetIsReady = useCallback((isReady) => {
    SetIsReady(isReady);
    localStorage.setItem("isReady", isReady);
  });

  useEffect(() => {
    addEventListener("IsReadyEvent", handleSetIsReady);
    return () => {
      removeEventListener("IsReadyEvent", handleSetIsReady);
    };
  }, [addEventListener, removeEventListener, handleSetIsReady]);

  sessionStorage.setItem("isReady", isReady);

  // - - - - - - - - - - End

  // - - - - - - - - - -
  // 05.Final score receive and send
  // - - - - - - - - - -

  const [fScore, SetFScore] = useState();
  const handleSetFScore = useCallback((fScore) => {
    SetFScore(Number(fScore)); // Set to number (Get the final score from jslib)
    localStorage.setItem("fScore", fScore);
  }, []);

  useEffect(() => {
    addEventListener("FinalScoreEvent", handleSetFScore);
    // Tips: the name in "" should be same as the name in .jslib file
    return () => {
      removeEventListener("FinalScoreEvent", handleSetFScore);
    };
  }, [addEventListener, removeEventListener, handleSetFScore]);

  sessionStorage.setItem("fScore", fScore); // Storage 'fScore' value in session/local

  // - - - - - - - - - - End

  // - - - - - - - - - -
  // 06.Heart number receive from Unity
  // - - - - - - - - - -

  const [heartNumber, SetHeartNumber] = useState();
  const handleSetHeartNumber = useCallback((heartNumber) => {
    SetHeartNumber(Number(heartNumber));
  }, []);

  useEffect(() => {
    addEventListener("HeartEvent", handleSetHeartNumber);
    return () => {
      removeEventListener("HeartEvent", handleSetHeartNumber);
    };
  }, [addEventListener, removeEventListener, handleSetHeartNumber]);

  // Render heart image as heart number changes
  // - - - - - - - - - -
  const renderHeartImage = () => {
    if (heartNumber === 3) {
      return <img src={heart03} alt="Heart 3" />;
    } else if (heartNumber === 2) {
      return <img src={heart02} alt="Heart 2" />;
    } else if (heartNumber === 1) {
      return <img src={heart01} alt="Heart 1" />;
    } else {
      return null; // Return null to render nothing
    }
  };

  // - - - - - - - - - - End

  // - - - - - - - - - -
  // 06.Space clicked receive from Unity (Use for health data collection)
  // - - - - - - - - - -

  const [spaceClicked, SetSpaceClicked] = useState(0);
  const handelSetSpaceClicked = useCallback((spaceClicked) => {
    SetSpaceClicked(Number(spaceClicked));
    localStorage.setItem("spaceClicked", spaceClicked);
  }, []);

  useEffect(() => {
    addEventListener("Space", handelSetSpaceClicked);
    return () => {
      removeEventListener("Space", handelSetSpaceClicked);
    };
  }, [addEventListener, removeEventListener, handelSetSpaceClicked]);

  sessionStorage.setItem("spaceClicked", spaceClicked);

  // - - - - - - - - - - End

  // - - - - - - - - - -
  // 07.Receive players number (from SidePanel.jsx)
  // - - - - - - - - - -

  // Total players number
  // - - - - - - - - - -
  const [rAllPlayersNo, setAllPlayersNoReceived] = useState(
    sessionStorage.getItem("allPlayersNo")
  );

  useEffect(() => {
    const handleAllPlayers = (e) => {
      if (e.key === "allPlayersNo") {
        setAllPlayersNoReceived(e.newValue);
      }
    };
    window.addEventListener("storage", handleAllPlayers);
    return () => {
      window.removeEventListener("storage", handleAllPlayers);
    };
  });

  // Ready players number
  // - - - - - - - - - -
  const [rReadyPlayersNo, setReadyPlayersNoReceived] = useState(
    sessionStorage.getItem("readyPlayersNo")
  );

  useEffect(() => {
    const handleReadyPlayers = (e) => {
      if (e.key === "readyPlayersNo") {
        setReadyPlayersNoReceived(e.newValue);
      }
    };
    window.addEventListener("storage", handleReadyPlayers);
    return () => {
      window.removeEventListener("storage", handleReadyPlayers);
    };
  });

  // Completed players number
  // - - - - - - - - - -
  const [rCompletedPlayersNo, setCompletedPlayersNoReceived] = useState(
    sessionStorage.getItem("completedPlayersNo")
  );

  useEffect(() => {
    const handleCompletedPlayers = (e) => {
      if (e.key === "completedPlayersNo") {
        setCompletedPlayersNoReceived(e.newValue);
      }
    };
    window.addEventListener("storage", handleCompletedPlayers);
    return () => {
      window.removeEventListener("storage", handleCompletedPlayers);
    };
  });

  // Champion player name
  // - - - - - - - - - -
  const [rChampionName, setChampionNameReceived] = useState(
    sessionStorage.getItem("championName")
  );

  useEffect(() => {
    const handleChampionName = (e) => {
      if (e.key === "championName") {
        setChampionNameReceived(e.newValue);
      }
    };
    window.addEventListener("storage", handleChampionName);
    return () => {
      window.removeEventListener("storage", handleChampionName);
    };
  });

  // - - - - - - - - - - End

  // - - - - - - - - - -
  // 08.Send message to Unity
  // - - - - - - - - - -

  const [isClicked, setClicked] = useState(false);

  // Function send number value 1 to Unity function "readyStateReceive"
  // - - - - - - - - - -
  function readyStateSend() {
    sendMessage("LoadingCanvas", "readyStateReceive", 1); // Go to next Unity scence
    setClicked(true); // When clicked make "Start" button disabled
  }

  // - - - - - - - - - - End

  // - - - - - - - - - -
  // 09.Send notification
  // - - - - - - - - - -

  const {
    notificationToDisplay, // Most recent notification that was sent through notificationEvent
    sendNotification, // Callback method to send a notification through notificationEvent
  } = liveShareHooks.useNotifications(notificationEvent, context);

  // Receive the champion player score (Do not use anymore)
  // - - - - - - - - - -
  // const [rChampionScore, setChampionScoreReceived] = useState(
  //   sessionStorage.getItem("championScore")
  // );

  // useEffect(() => {
  //   const handleChampionScore = (e) => {
  //     if (e.key === "championScore") {
  //       setChampionScoreReceived(e.newValue);
  //     }
  //   };
  //   window.addEventListener("storage", handleChampionScore);
  //   return () => {
  //     window.removeEventListener("storage", handleChampionScore);
  //   };
  // });

  // Send notification
  // - - - - - - - - - -
  useEffect(() => {
    sendNotification(`🏆 ${rChampionName} win this turn 🏆`);
  }, [rChampionName]);

  // Use fluid liveshare to send the notification (Do not use anymore)
  // - - - - - - - - - -
  // useEffect(() => {
  //   if (
  //     Number(rAllPlayersNo) == Number(rCompletedPlayersNo) &&
  //     Number(rAllPlayersNo) !== 0
  //   ) {
  //     try {
  //       const NotiText = FluidService.getHighest();
  //       sendNotification(NotiText);
  //     } catch (error) {
  //       console.error("Sorry, cannot find the ranking.");
  //     }
  //   }
  // }, [rCompletedPlayersNo]);

  // Bug:
  // one player: no notification

  // two players (participant first):
  // organiser higher score, notification twice
  // participant higher socre, work well

  // two players (organiser first):
  // organiser higher score, work well
  // particiant higher score, notification twice

  // - - - - - - - - - - End

  // - - - - - - - - - -
  // 10.A delay to count player number (to avoid game error)
  // - - - - - - - - - -

  const [checkAfterDelay, setCheckAfterDelay] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCheckAfterDelay(true);
    }, 10000); // wait 10s
    return () => clearTimeout(timer);
  }, []);

  // - - - - - - - - - - End

  // Return
  // - - - - - - - - - -
  return (
    <Fragment>
      <div className="outside">
        {/* Display Notifications */}
        <LiveNotifications notificationToDisplay={notificationToDisplay} />
        {/* The main container */}
        <div className="rex-container">
          {/* - - - - - - - - - - Begin */}
          {/* The game container */}
          {/* <button onClick={send}>Test Button</button> */}
          <div className="game-container">
            {/* Display Unity game */}
            <div className="game-window">
              <Unity
                className="unity"
                style={{ visibility: isLoaded ? "visible" : "hidden" }}
                unityProvider={unityProvider}
                tabIndex={1}
                devicePixelRatio={window.devicePixelRatio}
              />
            </div>
          </div>
          {/* - - - - - - - - - - End */}
          <br />
          {/* - - - - - - - - - - Begin */}
          {/* The control panel container */}
          <div className="control-container">
            {/*  */}
            {/* - - - - - - - - - - Begin */}
            {/* The player container (children of control panel container) */}
            <div className="player-container">
              {/* Display player number (Not use anymore) */}
              <div className="player-number-container">
                <div className="player-text-container">
                  <div className="player-text">Ready Player:</div>
                </div>
                <br />
                <div className="players-number">
                  {rReadyPlayersNo}/{rAllPlayersNo}
                </div>
              </div>
              {/* When all player ready can be clicked to start */}
              <div className="btn-container">
                <button
                  onClick={readyStateSend}
                  className={`start-btn ${
                    checkAfterDelay &&
                    Number(rReadyPlayersNo) === Number(rAllPlayersNo) &&
                    Number(rAllPlayersNo) !== 0
                      ? "active"
                      : ""
                  }`}
                  // Disable the button when not satisfy the requirement

                  disabled={
                    !checkAfterDelay ||
                    Number(rReadyPlayersNo) !== Number(rAllPlayersNo) ||
                    Number(rAllPlayersNo) === 0
                  }
                >
                  Start Teams Rex
                </button>
              </div>
            </div>
            {/* - - - - - - - - - - End */}
            {/*  */}
            {/* - - - - - - - - - - Begin */}
            <div className="info-container">
              <div className="chance-container">
                <div className="chance-text">
                  <p>Remaining Chance:</p>
                </div>
                <br />
                {/* Display heart number image (as heart number changes) */}
                <div className="img-container">{renderHeartImage()}</div>
              </div>
              <div className="score-container">
                <div className="score-text-1">Your Final Score:</div>
                <br />
                {/* Display final score */}
                <div className="score-text-2">{fScore}</div>
              </div>
            </div>
            {/* - - - - - - - - - - End */}
            <br />
          </div>
          {/* - - - - - - - - - - End */}
        </div>
      </div>
    </Fragment>
  );
};

export default GamePage;
