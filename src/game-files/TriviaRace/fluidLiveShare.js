import { LiveShareClient} from "@microsoft/live-share";
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
        return this.#connectPromise
    }

    #connect = async () => {
        try {
            const liveShareHost = LiveShareHost.create();

            const liveShareClient = new LiveShareClient(liveShareHost);
            const { container } = await liveShareClient.joinContainer(
                {
                    initialObjects: { 
                        valuesMap: SharedMap, 
                    } 
                });
            console.log("liveShareClient.joinContainer worked");
            this.#container = container;

            const json = this.#container.initialObjects.valuesMap.get(this.#VALUE_KEY) || "[]";
            this.#values = JSON.parse(json); 

            this.#container.initialObjects.valuesMap.on("valueChanged", async () => { 
                const json = this.#container.initialObjects.valuesMap.get(this.#VALUE_KEY);
                this.#values = JSON.parse(json);
                for (let handler of this.#registeredEventHandlers) {
                    await handler(this.#values);
                }
                
            });

        }
        catch (error) {
            console.log(`Error in fluid service: ${error.message}`); 
            throw (error);
        }
    }

    #updateFluid = async () => {
        const json = JSON.stringify(this.#values);
        this.#container.initialObjects.valuesMap.set(this.#VALUE_KEY, json); 

        console.log("this.#container.initialObjects.valuesMap: ",this.#container.initialObjects.valuesMap);

        this.#values.forEach((value) => {
            console.log(value);
          });
        
    }

    updateValues = async(arr) => {
        this.#values = arr;
        await this.#updateFluid(); 
    }

    setSpeed = async (speed) => {
        this.#values[0] = speed;
        await this.#updateFluid();
    }

    signalEnd = async() => {
        this.#values.push(-1);
        await this.#updateFluid(); 
    }

    resetMap = async() => {
        this.#values = [];
        await this.#updateFluid();
    }


    getValues = async () => {
        return this.#values;
    }

    onNewData = (e) => {
        this.#registeredEventHandlers.push(e);
    }

}

export default new FluidService();