import { useEffect, useRef, useState } from "react";

const useUnity = (opts: { buildName: string; unityBuildRoot: string }) => {
  const { buildName, unityBuildRoot } = opts;
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const unityCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameInstanceRef = useRef<UnityLoader.Game | null>(null);

  const handleStart = () => {
    const { current: unityContainer } = unityCanvasRef;
    if (!unityContainer) {
      return;
    }
    createUnityInstance(unityContainer, {
      dataUrl: `${unityBuildRoot}/${buildName}.data`,
      frameworkUrl: `${unityBuildRoot}/${buildName}.framework.js`,
      codeUrl: `${unityBuildRoot}/${buildName}.wasm`,
      streamingAssetsUrl: "StreamingAssets",
      companyName: "DefaultCompany",
      productName: buildName,
      productVersion: "0.1",
      matchWebGLToCanvasSize: false
    }).then(unityInstance => {
      gameInstanceRef.current = unityInstance;
      setIsLoading(true);
    });
  };

  const scriptSrc = `${unityBuildRoot}/${buildName}.loader.js`;

  useEffect(() => {
    if (!window.createUnityInstance) {
      const t = window.setTimeout(() => {
        setRetryCount(c => c + 1);
      }, 1000);
      return () => {
        window.clearTimeout(t);
      };
    }

    handleStart();
    return () => {};
  }, [retryCount]);

  return {
    unityCanvasRef,
    gameInstanceRef,
    isLoading,
    scriptSrc
  };
};

export default useUnity;