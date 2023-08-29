import { LiveShareClient } from "@microsoft/live-share";
import { LiveShareHost, call } from "@microsoft/teams-js";
import { SharedMap } from "fluid-framework";

class FluidService {
  #VALUE_KEY = "value-key";

  #container;
  #values = [];
  #registeredEventHandlers = [];
  #connectPromise;

  connect = () => {
    if (!this.#connectPromise) {
      this.#connectPromise = this.#connect();
    }
    return this.#connectPromise;
  };

  #connect = async () => {
    try {
      const liveShareHost = LiveShareHost.create();

      const liveShareClient = new LiveShareClient(liveShareHost);
      const { container } = await liveShareClient.joinContainer({
        initialObjects: {
          valuesMap: SharedMap,
        },
      });
      console.log("liveShareClient.joinContainer worked");
      this.#container = container;

      //this.#values = [];

      const json =
        this.#container.initialObjects.valuesMap.get(this.#VALUE_KEY) || "[]";
      this.#values = JSON.parse(json);

      this.#container.initialObjects.valuesMap.on("valueChanged", async () => {
        const json = this.#container.initialObjects.valuesMap.get(
          this.#VALUE_KEY
        );
        this.#values = JSON.parse(json);
        for (let handler of this.#registeredEventHandlers) {
          await handler(this.#values);
        }
        ////////////////////////////////////////
        //console.log("Changes have been made!"); worked
        //////////////////////////////////////
      });
    } catch (error) {
      console.log(`Error in fluid service: ${error.message}`); //throwing after adding usersMap
      throw error;
    }
  };

  #updateFluid = async () => {
    const json = JSON.stringify(this.#values);
    this.#container.initialObjects.valuesMap.set(this.#VALUE_KEY, json);

    console.log(
      "this.#container.initialObjects.valuesMap: ",
      this.#container.initialObjects.valuesMap
    );

    this.#values.forEach((value) => {
      console.log(value);
    });
  };

  updateValues = async (number) => {
    if (typeof this.#values[0] === "string") {
      this.#values.unshift(number);
    } else {
      this.#values[0] = number;
      //now if value is not six, let's try to rearrange this.#values
      if (number !== 6) {
        const player = this.#values.splice(1, 1)[0]; //WORKED 18/08
        this.#values.push(player);
      }
      ////////////////////////////////////////////////////////
    }
    await this.#updateFluid();
  };

  updateNames = async (name) => {
    this.#values.push(name);
    await this.#updateFluid();
  }; //works great for what it does

  resetMap = async () => {
    this.#values = [];
    await this.#updateFluid();
  };

  ///////////////////////////////////////////////////////

  emptyTrigger = async () => {
    await this.#updateFluid(); //is this allowed?
  };

  ///////////////////////////////////////////////////////

  removeName = async (name) => {
    this.#values = this.#values.filter((item) => item !== name);
    await this.#updateFluid();
  };

  getValues = async () => {
    return this.#values;
  };

  onNewData = (e) => {
    this.#registeredEventHandlers.push(e);
  };
}

export default new FluidService();
