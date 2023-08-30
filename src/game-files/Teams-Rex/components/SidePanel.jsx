// - - - - - - - - - - Package Import - - - - - - - - - -

// React
import React from "react";
import { useEffect, useState, useRef, useCallback, Fragment } from "react";
// Teams
import { app, FrameContexts } from "@microsoft/teams-js";
import { meeting } from "@microsoft/teams-js";
// LiveShare
import { UserMeetingRole } from "@microsoft/live-share";
import FluidService from "../services/fluidLiveShare.js";
import * as liveShareHooks from "../live-share-hooks";
// Other package
import { saveAs } from "file-saver";
// JSX File
import "./GamePage.jsx";
import { readyStateSend } from "./GamePage";
// CSS File
import "./css/SidePanel.css";
import "./css/GamePage.css";
import "./css/App.css";

// - - - - - - - - - - Game Page Constant - - - - - - - - - -

export const SidePanel = (presence) => {
  // - - - - - - - - - -
  // 00.Constant
  // - - - - - - - - - -

  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("Connecting to Fluid service...");
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");

  const [addedName, setAddedName] = useState("");
  const [people, setPeople] = useState([]);

  const ALLOWED_ROLES = [UserMeetingRole.organizer];

  // - - - - - - - - - - End

  // - - - - - - - - - -
  // 01.Initialize (Asynchronous initialize function)
  // - - - - - - - - - -

  const initialize = async () => {
    app.initialize().then(async () => {
      try {
        await app.initialize();

        const context = await app.getContext(); // 将 context 赋值 (Promise)
        const username = context?.user?.userPlayerName; // Get username

        // Ensure running in a side panel
        if (context.page.frameContext !== FrameContexts.sidePanel) {
          setReady(false);
          setMessage(
            "Teams Rex only runs in a Teams meeting. Please join the meeting to use it."
          );
          return;
        }

        await FluidService.connect(); // Connect to the Fluid relay service (使用 Promise 建立与服务的连接)

        const people = await FluidService.getPersonList(); // Call 'getPersonList()' in fluidLiveShare.js (get person data)

        setReady(true);
        setMessage(""); // Send message
        setUsername(username); // Update the state with the current user's username

        setPeople(people.people); // Update the state with the list of people data

        // Register an event handler to update state when fluid data changes
        FluidService.onNewData((people) => {
          // Microsoft provided functions
          setReady(true);
          setPeople(null); // Clear the existing people data in preparation for the updated data
          setPeople(people.people); // Updated people data received in the event handle
          setMessage("");
          // Added function
          updatePlayersNo(); // When SharedMap changed, call this function
        });
      } catch (error) {
        setReady(false);
        // setMessage(`ERROR: ${error.message}`);
        setMessage("Loading...");
      }
    });
  };

  // - - - - - - - - - -
  // 02.Receive the game data from GamePage.jsx
  // - - - - - - - - - -

  // Player name received
  // - - - - - - - - - -
  const [rPlayerName, setPlayerNameReceived] = useState(
    sessionStorage.getItem("playerName") || ""
  );

  useEffect(() => {
    const handlePlayerNameUpdate = (e) => {
      if (e.key === "playerName") {
        setPlayerNameReceived(e.newValue);
      }
    };
    window.addEventListener("storage", handlePlayerNameUpdate);
    return () => {
      window.removeEventListener("storage", handlePlayerNameUpdate);
    };
  });

  // Ready state received
  // - - - - - - - - - -
  const [rIsReady, setIsReadyReceived] = useState(
    sessionStorage.getItem("isReady") || ""
  );

  useEffect(() => {
    const handleReadyStateUpdate = (e) => {
      if (e.key === "isReady") {
        setIsReadyReceived(e.newValue);
      }
    };
    window.addEventListener("storage", handleReadyStateUpdate);
    return () => {
      window.removeEventListener("storage", handleReadyStateUpdate);
    };
  });

  // Final score received
  // - - - - - - - - - -
  const [rFScore, setFScoreReceived] = useState(
    sessionStorage.getItem("fScore") || 0
  );

  useEffect(() => {
    const handleFScoreChange = (e) => {
      if (e.key === "fScore") {
        setFScoreReceived(e.newValue);
      }
    };
    window.addEventListener("storage", handleFScoreChange); // 变量默认 (固定) 名为 'storage'
    return () => {
      window.removeEventListener("storage", handleFScoreChange);
    };
  }, []);

  // Clicked time received
  // - - - - - - - - - -
  const [rClickedTimes, setClickedTimesReceived] = useState(
    sessionStorage.getItem("spaceClicked") || 0
  );

  useEffect(() => {
    const handleClickedTimesReceived = (e) => {
      if (e.key === "spaceClicked") {
        setClickedTimesReceived(e.newValue);
      }
    };
    window.addEventListener("storage", handleClickedTimesReceived);
    return () => {
      window.removeEventListener("storage", handleClickedTimesReceived);
    };
  }, []);

  // - - - - - - - - - - End

  // - - - - - - - - - -
  // 03.LiveShare functions
  // - - - - - - - - - -

  // Run only once after the initial render of the component
  useEffect(() => {
    initialize();
  }, []);

  const { localUserHasRoles } = liveShareHooks.usePresence(
    presence,
    ALLOWED_ROLES
  );

  const updateGame = (e, rIsReady, rFScore, rClickedTimes) => {
    setAddedName(e.target.value, rIsReady, rFScore, rClickedTimes);
  };

  // - - - - - - - - - - End

  // - - - - - - - - - -
  // 04.Update the player info into Ranking
  // - - - - - - - - - -

  // Use fluid liveshare to send the notification (Do not use anymore)
  // - - - - - - - - - -
  const updateFluidService = async (e, rIsReady, rFScore, rClickedTimes) => {
    // i.Check if the player name is set
    if (rPlayerName !== "undefined") {
      // ii.Check the player has or not the final score
      if (rFScore === "undefined") {
        // iii.Check the player is ready or not
        if (rIsReady === "Ready") {
          try {
            await FluidService.setReady(
              rPlayerName,
              rIsReady,
              rFScore,
              rClickedTimes
            );
            setAddedName("");
            setMessage("");
          } catch (error) {
            setMessage(error.message);
          }
        } else {
          try {
            await FluidService.addPerson(
              e.target.value,
              rIsReady,
              rFScore,
              rClickedTimes
            );
            setAddedName("");
            setMessage("");
          } catch (error) {
            setMessage(error.message);
          }
        }
        // vi.Check the player has or not the clicked times
      } else {
        if (rClickedTimes === "undefined") {
          try {
            await FluidService.setScore(
              rPlayerName,
              rIsReady,
              rFScore,
              rClickedTimes
            );
            setAddedName("");
            setMessage("");
          } catch (error) {
            setMessage(error.message);
          }
        } else {
          try {
            await FluidService.setClickedTimes(
              rPlayerName,
              rIsReady,
              rFScore,
              rClickedTimes
            );
            setAddedName("");
            setMessage("");
          } catch (error) {
            setMessage(error.message);
          }
        }
      }
    }
  };

  // - - - - - - - - - - End

  // - - - - - - - - - -
  // 05.Re-render
  // - - - - - - - - - -

  useEffect(() => {
    updateFluidService(rPlayerName, rIsReady, rFScore, rClickedTimes);
  }, [rIsReady, rFScore, rClickedTimes]);

  // - - - - - - - - - - End

  // - - - - - - - - - -
  // 06.Display the GamePage
  // - - - - - - - - - -

  const shareToStage = () => {
    meeting.shareAppContentToStage((error, result) => {
      if (!error) {
        console.log("Started sharing to stage");
      } else {
        console.warn("shareAppContentToStage failed", error);
      }
    }, window.location.origin + "?inTeams=1&view=stage");
  };

  // - - - - - - - - - - End

  // - - - - - - - - - -
  // 07.Player list (After enter the player name in Unity)
  // - - - - - - - - - -

  const PlayerList = useCallback(() => {
    // 检查 'people' 变量是否已定义且不为空
    if (people && people.length) {
      return (
        <div>
          {people.map((item, index) => {
            return (
              <span className="score-rank" key={index}>
                {/* 将'name'列表中每个人的属性呈现为<span>元素的内容 */}
                {item.name}:
                {item.finalscore === "undefined"
                  ? item.readystate
                  : item.finalscore}
              </span>
            );
          })}
        </div>
      );
    }
    return null;
  }, [people, localUserHasRoles]);

  // - - - - - - - - - - End

  // - - - - - - - - - -
  // 08.Automatically submit the score to the score rank
  // - - - - - - - - - -

  useEffect(() => {
    setPlayerNameReceived(rPlayerName);
    setIsReadyReceived(rIsReady);

    const submitInfo = async () => {
      if (rPlayerName == null) {
        return;
      } else {
        if (!rPlayerName.includes("undefined" && "null")) {
          try {
            await FluidService.addPerson(
              rPlayerName,
              rIsReady,
              rFScore,
              rClickedTimes
            );
            setAddedName("");
            setMessage("");
          } catch (error) {
            setMessage(error.message);
          }
        } else {
          return;
        }
      }
    };
    submitInfo();
  }, [rPlayerName, rIsReady, rFScore, rClickedTimes, username]);

  // - - - - - - - - - - End

  // - - - - - - - - - -
  // 09.Set player number
  // - - - - - - - - - -

  const [allPlayersNo, setAllPlayersNo] = useState(0);
  const [readyPlayersNo, setReadyPlayersNo] = useState(0);
  const [completedPlayersNo, setCompletedPlayersNo] = useState(0);

  const updatePlayersNo = () => {
    setAllPlayersNo(FluidService.getAllNo());
    setReadyPlayersNo(FluidService.getReadyNo());
    setCompletedPlayersNo(FluidService.getCompletedNo());
  };

  // Re-render function (save the number in local), when player number changes
  useEffect(() => {
    sessionStorage.setItem("allPlayersNo", allPlayersNo);
    sessionStorage.setItem("readyPlayersNo", readyPlayersNo);
    sessionStorage.setItem("completedPlayersNo", completedPlayersNo);
  }, [allPlayersNo, readyPlayersNo, completedPlayersNo]);

  // - - - - - - - - - - End

  // - - - - - - - - - -
  // 10.Set champion
  // - - - - - - - - - -

  const [champion, setChampion] = useState(null);
  const [championName, setChampionName] = useState("");
  const [championScore, setChampionScore] = useState(0);

  const [sharedMap, setSharedMap] = useState();

  // Get the share map
  // - - - - - - - - - -
  function getSharedMap() {
    const sharedMap = FluidService.returnSharedMap();
    return sharedMap ? sharedMap.people : [];
  }

  // Get the champion
  // - - - - - - - - - -
  function getChampionFromMap() {
    const testArray = getSharedMap();
    const peopleArray = getSharedMap();
    const championPlayer = peopleArray.reduce((highest, player) => {
      if (!highest || player.finalscore > highest.finalscore) {
        return player;
      }
      return highest;
    }, null);
    return championPlayer || { name: "", finalscore: 0 };
  }

  useEffect(() => {
    const championP = getChampionFromMap();
    setChampion(championP);
    setChampionName(championP.name);
    setChampionScore(championP.finalscore);
  }, [sharedMap]);

  useEffect(() => {
    if (championName && championScore) {
      sessionStorage.setItem("championName", championName);
      sessionStorage.setItem("championScore", championScore);
    }
  }, [championName, championScore]);

  useEffect(() => {
    if (completedPlayersNo === allPlayersNo && allPlayersNo !== 0) {
      const championP = getChampionFromMap();
      setChampion(championP);
      setChampionName(championP.name);
      setChampionScore(championP.finalscore);

      // Wait for 5 seconds before saving to sessionStorage
      setTimeout(() => {
        sessionStorage.setItem("championName", championName);
        sessionStorage.setItem("championScore", championScore);
      }, 1000);
    }
  }, [completedPlayersNo, allPlayersNo]);

  const exportHealthData = async () => {
    const data = FluidService.exportHealthData(); // =>  This is the function that returns the data you want to export as json
    const blob = new Blob([data], { type: "application/json;charset=utf-8" });
    saveAs(blob, "healthdata.json");
  };

  // - - - - - - - - - - End

  // Return
  // - - - - - - - - - -
  if (!ready) {
    return (
      <Fragment>
        <div>
          <div className="message">Welcome to Teams Rex.</div>
          <br />
          <div className="message">
            Make sure open the side panel, to run the game.
          </div>
          <br />
          <div className="message">Enjoy the game.</div>
        </div>
      </Fragment>
    );
  } else {
    return (
      <Fragment>
        <div>
          {/* Title */}
          <div className="title">Teams-Rex</div>
          <br />
          {/* - - - - - - - - - - Begin */}
          {/* Only host can see this part */}
          {localUserHasRoles && (
            <div>
              {/* Share & Play btn */}
              <button
                // When click btn, share screen and reset the score rank
                onClick={() => {
                  FluidService.cleanList(); // Reset the game
                  shareToStage(); // Display game page
                }}
                className="sp-btn"
              >
                Go Teams-Rex Championship
              </button>
              <button onClick={exportHealthData} className="sp-btn">
                Export Health Data
              </button>
              <br />
            </div>
          )}
          {/* - - - - - - - - - - End */}
          {/*  */}
          {/* - - - - - - - - - - Begin */}
          {/* Only for playername and the ready state submit */}
          <div className="add-name">
            <div>
              <div
                type="text"
                className="score"
                onChange={(e) =>
                  updateGame(e, rIsReady, rFScore, rClickedTimes)
                }
                onSubmit={(e) =>
                  updateFluidService(e, rIsReady, rFScore, rClickedTimes)
                } // Submit to rank
                value={(`${rPlayerName}`, `${rIsReady}`, `${rFScore}`)}
              />
            </div>
            <div className="message">{message}</div>
          </div>
          {/* - - - - - - - - - - End */}
          <br />
          {/* - - - - - - - - - - Begin */}
          <div>
            <div>
              {/* List heading */}
              <div className="title">Ranking</div>
              <br />
              {/* Player information */}
              <div>
                <PlayerList />
              </div>
            </div>
          </div>
          {/* - - - - - - - - - - End */}
        </div>
      </Fragment>
    );
  }
};

export default SidePanel;
