import { useEffect, useRef, useState } from "react";

const useUnity = (opts: {
  isActive: boolean;
  buildName: string;
  unityBuildRoot: string;
}) => {
  const { isActive, buildName, unityBuildRoot } = opts;
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const unityCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameInstanceRef = useRef<UnityInstance | null>(null);

  const handleStart = () => {
    const { current: unityContainer } = unityCanvasRef;
    if (!unityContainer) {
      return;
    }
    createUnityInstance(
      unityContainer,
      {
        dataUrl: `${unityBuildRoot}/${buildName}.data`,
        frameworkUrl: `${unityBuildRoot}/${buildName}.framework.js`,
        codeUrl: `${unityBuildRoot}/${buildName}.wasm`,
        streamingAssetsUrl: "StreamingAssets",
        companyName: "DefaultCompany",
        productName: buildName,
        productVersion: "0.1",
        matchWebGLToCanvasSize: false
      },
      setLoadingProgress
    ).then(unityInstance => {
      gameInstanceRef.current = unityInstance;
      setIsLoading(true);
    });
  };

  const scriptSrc = `${unityBuildRoot}/${buildName}.loader.js`;

  useEffect(() => {
    if (!isActive) {
      return () => {};
    }
    if (!window.createUnityInstance) {
      const t = window.setTimeout(() => {
        setRetryCount(c => c + 1);
      }, 100);
      return () => {
        window.clearTimeout(t);
      };
    }

    handleStart();
    return () => {
      const { current: gameInstance } = gameInstanceRef;
      setLoadingProgress(0);
      if (gameInstance) {
        gameInstance.Quit();
      }
    };
  }, [isActive, retryCount]);

  return {
    unityCanvasRef,
    gameInstanceRef,
    isLoading,
    loadingProgress,
    scriptSrc
  };
};

export default useUnity;
