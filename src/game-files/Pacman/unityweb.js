import React from "react";
import { useUnityContext } from "react-unity-webgl";

const unityConfig = {
  loaderUrl: "build/Pacman/build.loader.js",
  dataUrl: "build/Pacman/build.data",
  frameworkUrl: "build/Pacman/build.framework.js",
  codeUrl: "build/Pacman/build.wasm",
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
