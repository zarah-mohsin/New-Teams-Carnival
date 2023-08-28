import React, {
  Fragment,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { Unity } from "react-unity-webgl";
import { app } from "@microsoft/teams-js";
import { useUnity } from "./unityweb";
import PacmanService from "./fluidService";
// import { inTeams } from "../utils/inTeams.js";

function Pacman() {
  const [gameLoaded, setGameLoaded] = useState(false);
  const [unityLoaded, setUnityLoaded] = useState(false);
  const [isUnityInitialized, setIsUnityInitialized] = useState(false);
  const [fluidConnected, setFluidConnected] = useState(false);
  const [message, setMessage] = useState("");
  const [scores, setScores] = useState([]);
  const usernameRef = useRef();
  const [username, setUsername] = useState("Player");
  const [unityWidth, setUnityWidth] = useState(400); // default width
  const [unityHeight, setUnityHeight] = useState(450); // default height
  const [healthData, setHealthData] = useState({});

  const {
    unityProvider,
    isLoaded,
    sendMessage,
    addEventListener,
    removeEventListener,
  } = useUnity();

  const fetchTeamsUserName = useCallback(async () => {
    const context = await app.getContext();
    const upn = context.user.userPrincipalName || "Player";
    console.log("USER EMAIL: ", upn);

    // Extract everything before the '@' symbol
    const usernameBeforeAt = upn.split("@")[0];
    setUsername(usernameBeforeAt);
    usernameRef.current = usernameBeforeAt;
    console.log("Username22:", username);

    if (isLoaded) {
      // Only send the message if Unity is ready
      sendMessage("ScoreManager", "SetPlayerName", usernameBeforeAt);
      console.log("being sent to unity!:", usernameBeforeAt);
    }
  }, [isLoaded, sendMessage]);

  useEffect(() => {
    const handleHealthUpdate = (playerName, updatedHealthData) => {
      console.log(
        `Received health update for ${playerName}: `,
        updatedHealthData
      );
      setHealthData((prevData) => ({
        ...prevData,
        [playerName]: updatedHealthData,
      }));
    };

    // Registering the event handler
    PacmanService.onHealthUpdate(handleHealthUpdate);

    return () => {
      // Cleanup, if PacmanService provides a way to unregister the event.
    };
  }, []);

  useEffect(() => {
    PacmanService.onHealthUpdate((playerName, updatedHealthData) => {
      // Update React's state
      setHealthData((prevData) => ({
        ...prevData,
        [playerName]: updatedHealthData,
      }));

      // Send updated health data to Unity
      sendMessage(
        "Dataexporter",
        "ReceiveHealthData",
        JSON.stringify(updatedHealthData)
      );
    });
  }, []);

  useEffect(() => {
    // The handler for the score report
    const handleScoreReport = (score) => {
      // Process the updated score
      processReportedScore(score);
    };

    // Add the event listener
    addEventListener("ReportScore", handleScoreReport);

    return () => {
      // Cleanup
      removeEventListener("ReportScore", handleScoreReport);
    };
  }, [addEventListener, removeEventListener]);

  const processReportedScore = useCallback(async (scoreData) => {
    const [playerName, playerScore] = scoreData.split(":");
    // Update Fluid's SharedMap with the updated score received from Unity
    await PacmanService.updateScoresFromUnity({
      [playerName]: parseInt(playerScore),
    });
  }, []);

  useEffect(() => {
    const checkTeamsContext = async () => {
      const context = await app.getContext();
      const frameContextValue = context.page.frameContext;
      console.log("Teams frame context:", frameContextValue);

      // if (inTeams()) {
      if (frameContextValue === "meetingStage") {
        // Set dimensions for meeting stage
        setUnityWidth(900); // example value, adjust as needed
        setUnityHeight(450); // example value, adjust as needed
      } else {
        // Set dimensions for side panel
        setUnityWidth(280); // example value, adjust as needed
        setUnityHeight(400); // example value, adjust as needed
      }
      // }
    };

    checkTeamsContext();
  }, []);
  useEffect(() => {
    const handleUpdateReactWithHealthData = async (healthDataJson) => {
      console.log("Received health data from Unity: ", healthDataJson);

      const healthData = JSON.parse(healthDataJson);
      await PacmanService.updateHealthDataFromUnity(healthData);
    };

    addEventListener("UpdateHealthData", handleUpdateReactWithHealthData);
    return () => {
      removeEventListener("UpdateHealthData", handleUpdateReactWithHealthData);
    };
  }, [addEventListener, removeEventListener]);

  useEffect(() => {
    const handleDownloadHealthData = async () => {
      try {
        // Connect to the PacmanService if not already
        await PacmanService.connect();

        // Fetch the health data
        const healthDataArray = await PacmanService.getHealthData();

        // Convert the array of health data into a JSON string
        const healthDataJson = JSON.stringify(healthDataArray);

        console.log("Received DOWNLOAD data from Unity: ", healthDataJson);

        // Trigger the download with the fetched health data
        triggerDownload(healthDataJson);
      } catch (error) {
        console.error("Error fetching health data:", error);
      }
    };

    // Add the event listener
    addEventListener("DownloadHealthData", handleDownloadHealthData);

    return () => {
      // Cleanup
      removeEventListener("DownloadHealthData", handleDownloadHealthData);
    };
  }, [addEventListener, removeEventListener]);

  const triggerDownload = (jsonData) => {
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = "healthData.json"; // Name of the downloaded file

    document.body.appendChild(a);
    a.click();

    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  useEffect(() => {
    const handleScoreUpdate = (playerName, newScore) => {
      // Your logic here to update Unity and/or state.
      sendMessage(
        "ScoreManager",
        "NewDataReceivedFromReact",
        JSON.stringify({ type: "ScoreUpdate", playerName, newScore })
      );
      console.log("being sent to unity scoredate2!");
    };

    // Register the score update handler
    PacmanService.onScoreUpdate(handleScoreUpdate);

    const initializeAppAndFetchData = async () => {
      try {
        // Initialize Microsoft Teams
        await app.initialize();
        await fetchTeamsUserName();

        // Connect to Fluid and get initial scores
        await PacmanService.connect();

        // Only proceed if Fluid has content
        if (await PacmanService.hasContent()) {
          setFluidConnected(true);

          const initialScores = await PacmanService.getScores();
          setScores(initialScores);

          // Send the initial high scores list to Unity wrapped in 'scores' property
          if (isLoaded) {
            const wrappedScores = {
              type: "ScoreContainer",
              scores: initialScores,
            };
            console.log(
              "being sent to unity from fluid!:",
              JSON.stringify(initialScores)
            );
            sendMessage(
              "ScoreManager",
              "NewDataReceivedFromReact",
              JSON.stringify(wrappedScores)
            );
          }

          // Fetch initial health data
          const initialHealthData = await PacmanService.getHealthData();
          setHealthData(initialHealthData);

          // Extract the inner health data object
          const innerHealthData = initialHealthData[0]?.data;
          if (innerHealthData) {
            // Send the inner health data object to Unity as a string
            if (isLoaded) {
              const healthDataJson = JSON.stringify(innerHealthData);
              console.log("being sent to unity from fluid!:", healthDataJson);
              sendMessage("Dataexporter", "ReceiveHealthData", healthDataJson);
            }
          }
        } else {
          console.log("Fluid has no content");
          // Handle case where Fluid does not have content if needed
        }
      } catch (error) {
        console.error("ERROR: ", error);
        setMessage(`ERROR: ${error.message}`);
      }
    };

    // Execute the initialization function
    initializeAppAndFetchData();
  }, [fetchTeamsUserName, isLoaded, sendMessage]);

  return (
    <Fragment>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          height: "100vh",
          overflow: "hidden",
          width: unityWidth,
        }}
      >
        <Unity
          unityProvider={unityProvider}
          style={{
            width: unityWidth + 40,
            height: unityHeight,
            marginLeft: "-20px",
          }}
        />
      </div>
    </Fragment>
  );
}

export default Pacman;
