import { LiveShareClient } from "@microsoft/live-share";
import { LiveShareHost } from "@microsoft/teams-js";
import { SharedMap } from "fluid-framework";


class PacmanService {

  #container;
  #registeredScoreUpdateEventHandlers = [];
  #registeredHealthUpdateEventHandlers = [];

  #connectPromise;

  connect = () => {
    if (!this.#connectPromise) {
      this.#connectPromise = this.#connect();
    }

    return this.#connectPromise
  }

  #connect = async () => {
    try {
      const liveShareHost = LiveShareHost.create();
      const liveShareClient = new LiveShareClient(liveShareHost);
      const { container } = await liveShareClient.joinContainer({
        initialObjects: { 
            scoreMap: SharedMap,
            healthDataMap: SharedMap
        }
    });
    
    this.#container = container;
    console.log("Assigned container:", this.#container);
    console.log("Container initial objects:", this.#container.initialObjects);
    
      // Log the contents of the shared map
      const scoreMapContents = {};
      for (let [key, value] of this.#container.initialObjects.scoreMap.entries()) {
          scoreMapContents[key] = value;
      }
      console.log("scoreMap contents: ", scoreMapContents);


      // Log the contents of the healthDataMap
      const healthDataMapContents = {};
      for (let [key, value] of this.#container.initialObjects.healthDataMap.entries()) {
          healthDataMapContents[key] = value;
      }
      console.log("healthDataMap contents: ", healthDataMapContents);




      if (this.#container && this.#container.initialObjects.scoreMap) {
        this.#container.initialObjects.scoreMap.on("valueChanged", async (changed) => {
          const playerName = changed.key;
          const score = this.#container.initialObjects.scoreMap.get(playerName);
          console.log("container.playernames: ", playerName);
  
          for (let handler of this.#registeredScoreUpdateEventHandlers) {
            await handler(playerName, score);
          }
        });
      
    } else {
        console.error("Score map is not initialized!");
    }

    if (this.#container && this.#container.initialObjects.healthDataMap) {
      this.#container.initialObjects.healthDataMap.on("valueChanged", async (changed) => {
              // Listener for health data changes
              this.#container.initialObjects.healthDataMap.on("valueChanged", async (changed) => {
                const playerName = changed.key;
                const healthData = this.#container.initialObjects.healthDataMap.get(playerName);
                console.log("Player's health data updated:", playerName, healthData);
                
                for (let handler of this.#registeredHealthUpdateEventHandlers) {
                    await handler(playerName, healthData);
                }
            });
            
      });
  } else {
      console.error("Health data map is not initialized!");
  }






      return this.#container; // Return the container for external use if required

    } catch (error) {
      console.log(`Error in pacman service: ${error.message}`); 
      throw error;
    }
  }

  getScores = () => {
    return new Promise((resolve, reject) => {
      if (!this.#container || !this.#container.initialObjects.scoreMap) {
        reject(new Error("Container or scoreMap is undefined!"));
        return;
      }
      
      const scores = [];
      for (let [playerName, score] of this.#container.initialObjects.scoreMap.entries()) {
        scores.push({
          name: playerName,
          score: score
        });
      }
      resolve(scores);
    });
}
hasContent = () => {
  return new Promise((resolve, reject) => {
    if (!this.#container || !this.#container.initialObjects.scoreMap) {
      reject(new Error("Container or scoreMap is undefined!"));
      return;
    }

    const hasContent = this.#container.initialObjects.scoreMap.size > 0;
    resolve(hasContent);
  });
}



  updateScoresFromUnity = (updatedScores) => {
    return new Promise((resolve, reject) => {
      if (!this.#container || !this.#container.initialObjects.scoreMap) {
        reject(new Error("Container or scoreMap is undefined!"));
        return;
      }
      for (let [playerName, score] of Object.entries(updatedScores)) {
        this.#container.initialObjects.scoreMap.set(playerName, score);
      }
      resolve(true);
      console.log("score  map updated at:", new Date().toISOString());
      console.log("update is:", updatedScores);
    });
    
  }


  getHealthData = () => {
    return new Promise((resolve, reject) => {
      if (!this.#container || !this.#container.initialObjects.healthDataMap) {
        reject(new Error("Container or healthDataMap is undefined!"));
        return;
      }
      const healthData = [];
      for (let [playerName, data] of this.#container.initialObjects.healthDataMap.entries()) {
        healthData.push({
          name: playerName,
          data: data
        });
      }
      resolve(healthData);
    });
  }

  updateHealthDataFromUnity = (updatedHealthData) => {
    return new Promise((resolve, reject) => {
      if (!this.#container || !this.#container.initialObjects.healthDataMap) {
        reject(new Error("Container or healthDataMap is undefined!"));
        return;
      }
  
      console.log("Attempting to update health data map with:", updatedHealthData);
  
      // Create a unique key by appending a timestamp to the username
      const uniqueKey = `${updatedHealthData.username}_${Date.now()}`;
  
      // Encapsulate the user data within an object with the unique key
      const dataToStore = {
        [uniqueKey]: updatedHealthData
      };
  
      // Set the encapsulated data in the Fluid Framework's SharedMap
      this.#container.initialObjects.healthDataMap.set(uniqueKey, dataToStore);
  
      // Log the current contents of the healthDataMap for debugging
      const healthDataContents = {};
      for (let [key, value] of this.#container.initialObjects.healthDataMap.entries()) {
        healthDataContents[key] = value;
      }
  
      console.log("Current healthDataMap contents:", healthDataContents);
      console.log("Health data map updated at:", new Date().toISOString());
      console.log("Update is:", updatedHealthData);
      
      resolve(true);
    });
  }
  

  onScoreUpdate = (handler) => {
    this.#registeredScoreUpdateEventHandlers.push(handler);
  }


  onHealthUpdate = (handler) => {
    this.#registeredHealthUpdateEventHandlers.push(handler);
}

}
export default new PacmanService();
