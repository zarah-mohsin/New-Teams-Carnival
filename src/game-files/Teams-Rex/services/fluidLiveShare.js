// - - - - - - - - - - Package Import - - - - - - - - - -

import {
  LiveShareClient,
  LivePresence,
  LiveEvent,
} from "@microsoft/live-share";
import { LiveShareHost } from "@microsoft/teams-js";
import { SharedMap } from "fluid-framework";
import { LiveCanvas } from "@microsoft/live-share-canvas";

class FluidService {
  // - - - - - - - - - -
  // 00. Constant
  // - - - - - - - - - -

  #container; // Fluid container

  #PERSON_VALUE_KEY = "person-value-key";
  #peopleMap = { people: [] };

  #registeredEventHandlers = []; // Array of event handlers to call when contents change
  #sumEventHandlers = [];

  #connectPromise; // Singleton promise so we only connect once

  // - - - - - - - - - - End

  // - - - - - - - - - -
  // 01. Connection
  // - - - - - - - - - -

  connect = () => {
    if (!this.#connectPromise) {
      this.#connectPromise = this.#connect(); // 连接 (初始化)
    }
    return this.#connectPromise;
  };

  // Private function connects to the Fluid Relay service
  // - - - - - - - - - -
  #connect = async () => {
    try {
      const liveShareHost = LiveShareHost.create(); // 创建 LiveShareHost 实例
      const liveShareClient = new LiveShareClient(liveShareHost); // 初始化一个新的 LiveShareClient 实例

      const { container } = await liveShareClient.joinContainer({
        initialObjects: {
          personMap: SharedMap, // Shared map
          notificationEvent: LiveEvent, // To achieve live notification
          presence: LivePresence, // (Not use anymore)
          liveCanvas: LiveCanvas, // If delete, the SidePanel cannot present
        },
      });

      this.#container = container;

      const json =
        this.#container.initialObjects.personMap.get(this.#PERSON_VALUE_KEY) ||
        `{ "people": [] }`;
      this.#peopleMap = JSON.parse(json);

      // Register a function to update the app when data in the Fluid Relay changes
      // - - - - - - - - - -
      this.#container.initialObjects.personMap.on("valueChanged", async () => {
        const json = this.#container.initialObjects.personMap.get(
          this.#PERSON_VALUE_KEY
        );
        this.#peopleMap = JSON.parse(json);
        for (let handler of this.#registeredEventHandlers) {
          await handler(this.#peopleMap);
        }
      });
    } catch (error) {
      console.log(`Error in fluid service: ${error.message}`);
      throw error;
    }
  };

  getLiveEvent = () => {
    return this.#container.initialObjects.notificationEvent;
  };

  returnSharedMap = () => {
    return this.#peopleMap;
  };

  // - - - - - - - - - - End

  // - - - - - - - - - -
  // 02.Fluid Framework (Update the Fluid relay from the local arrays)
  // - - - - - - - - - -

  #updateFluid = async () => {
    const json = JSON.stringify(this.#peopleMap);
    this.#container.initialObjects.personMap.set(this.#PERSON_VALUE_KEY, json);
  };

  // - - - - - - - - - - End

  // - - - - - - - - - -
  // 03.Function for shared map
  // - - - - - - - - - -

  //Add player into the ranking
  // - - - - - - - - - -
  addPerson = async (name, readystate, finalscore, clickedtimes) => {
    // name 是否存在或不为空
    if (!name) {
      return;
    }
    // name 是否存在,不为空,不包含 "undefined"
    if (!name || name.includes("undefined")) {
      return; // When the score is undefined, cannot submit
    }
    // 如果 people 数组不存在, 则初始化为一个空数组
    if (!this.#peopleMap.people) {
      this.#peopleMap.people = [];
    }
    // 查找 people 数组中是否有相同的 (name)
    let player = this.#peopleMap.people.filter((item) => item.name === name);
    if (player && player.length > 0) {
      return;
    }
    // 将一个新对象添加到 people 数组中
    this.#peopleMap.people.push({
      name: name,
      readystate: readystate,
      finalscore: finalscore, // Set to empty
      clickedtimes: clickedtimes,
    });

    await this.#updateFluid(); // 更新 Fluid relay
  };

  // Change the player ready state
  // - - - - - - - - - -
  setReady = async (name, readystate, finalscore, clickedtimes) => {
    // Find the index of the person by name
    let playerIndex = this.#peopleMap.people.findIndex(
      (item) => item.name === name
    );
    if (playerIndex !== -1) {
      // Remove the person from that position
      this.#peopleMap.people.splice(playerIndex, 1);

      // Add the new person infomation
      this.#peopleMap.people.splice(playerIndex, 0, {
        name: name,
        readystate: readystate,
        finalscore: finalscore,
      });
    } else {
      this.#peopleMap[playerIndex].people.push({
        name: name,
        readystate: readystate,
        finalscore: finalscore,
        clickedtimes: clickedtimes,
      });
    }
    await this.#updateFluid();
  };

  // Set score
  // - - - - - - - - - -
  setScore = async (name, readystate, finalscore, clickedtimes) => {
    let playerIndex = this.#peopleMap.people.findIndex(
      (item) => item.name === name
    );

    const playerData = {
      name: name,
      readystate: readystate,
      finalscore: finalscore,
      clickedtimes: clickedtimes,
    };

    if (playerIndex !== -1) {
      this.#peopleMap.people[playerIndex] = playerData;
    } else {
      this.#peopleMap.people.push(playerData);
    }
    await this.#updateFluid();
  };

  setClickedTimes = async (name, readystate, finalscore, clickedtimes) => {
    let playerIndex = this.#peopleMap.people.findIndex(
      (item) => item.name === name
    );

    const playerData = {
      name: name,
      readystate: readystate,
      finalscore: finalscore,
      clickedtimes: clickedtimes,
    };

    if (playerIndex !== -1) {
      this.#peopleMap.people[playerIndex] = playerData;
    } else {
      this.#peopleMap.people.push(playerData);
    }

    console.log("test321", this.#peopleMap);
    await this.#updateFluid();
  };

  // Get Top Three Scores
  // - - - - - - - - - -

  getHighest = () => {
    this.getCompletedNo(); // Execute once again to make sure the complete number is right
    const json = this.#container.initialObjects.personMap.get(
      this.#PERSON_VALUE_KEY
    );
    this.#peopleMap = JSON.parse(json);

    let scoreRanking = [...this.#peopleMap.people].filter(
      (item) => item.finalscore !== undefined && !isNaN(item.finalscore)
    );
    const sortedRanking = scoreRanking.sort(
      (a, b) => Number(b.finalscore) - Number(a.finalscore)
    );
    const topScorer = sortedRanking[0];
    if (topScorer) {
      return `🏆 ${topScorer.name} win this turn 🏆`;
    } else {
      return null;
    }
  };

  // Clean the ready list
  // - - - - - - - - - -
  cleanList = async (name, readystate) => {
    this.#peopleMap.people = [];
    // this.#dataMap.data = [];
    await this.#updateFluid();
  };

  // - - - - - - - - - - End

  // - - - - - - - - - -
  // 04.Get number of players
  // - - - - - - - - - -

  getReadyNo = () => {
    return this.#peopleMap.people.filter((item) => item.readystate === "Ready")
      .length;
  };
  getCompletedNo = () => {
    return this.#peopleMap.people.filter(
      (item) => !isNaN(item.finalscore) && item.finalscore !== "undefined"
    ).length;
  };
  getAllNo = () => {
    return this.#peopleMap.people.length;
  };
  getNotReadyPlayers = () => {
    return this.#peopleMap.people.filter(
      (item) => item.readystate === "Not Ready"
    );
  };

  // - - - - - - - - - - End

  // - - - - - - - - - -
  // 05.Health data export
  // - - - - - - - - - -

  exportHealthData = () => {
    const healthData = [...this.#peopleMap.people];

    this.#peopleMap.people.forEach((person) => {
      const existingEntry = healthData.find(
        (entry) => entry[person.name] !== undefined
      );
      if (existingEntry) {
        existingEntry[person.name] += person.data;
      } else {
        healthData.push({ [person.name]: person.data });
      }
    });

    return JSON.stringify(healthData);
  };

  // - - - - - - - - - - End

  shuffle = async () => {
    // Use the Fischer-Yates algorithm
    for (let i = this.#peopleMap.people.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * i);
      [this.#peopleMap.people[i], this.#peopleMap.people[j]] = [
        this.#peopleMap.people[j],
        this.#peopleMap.people[i],
      ];
    }
    await this.#updateFluid();
  };

  getPersonList = async () => {
    console.log(this.#peopleMap);
    return this.#peopleMap;
  };

  getCanvas = async () => {
    return this.#container.initialObjects.liveCanvas;
  };

  getPresence = async () => {
    return this.#container.initialObjects.presence;
  };

  onNewData = (e) => {
    this.#registeredEventHandlers.push(e);
  };
}

export default new FluidService();
