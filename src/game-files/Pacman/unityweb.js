import React from "react";
import { useUnityContext } from "react-unity-webgl";

const unityConfig = {
  loaderUrl: "build/build.loader.js",
  dataUrl: "build/build.data",
  frameworkUrl: "build/build.framework.js",
  codeUrl: "build/build.wasm",
};

const UnityContext = React.createContext();

export function useUnity() {
  const {
    unityContext,
    unityProvider,
    isLoaded,
    unityInstance,
    loadingProgression,
    unload,
    sendMessage,
    addEventListener,
    removeEventListener,
  } = useUnityContext(unityConfig);
  
  // Return all the necessary methods and properties
  return {
    unityContext,
    unityProvider,
    isLoaded,
    unityInstance,
    loadingProgression,
    unload,
    sendMessage,
    addEventListener,
    removeEventListener,
  };
}


export default UnityContext;



