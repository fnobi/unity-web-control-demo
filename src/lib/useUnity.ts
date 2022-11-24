import { useEffect, useRef, useState } from "react";

const useUnity = (opts: {
  isActive: boolean;
  buildName: string;
  unityBuildRoot: string;
  postfix?: string; // NOTE: ビルド方式によって、 `.unityweb` を入れる必要があるケースがある
  buildMeta: {
    companyName: string;
    productName: string;
    productVersion: string;
  };
}) => {
  const { isActive, buildName, unityBuildRoot, postfix = "", buildMeta } = opts;
  const [statusCode, setStatusCode] = useState<-1 | 0 | 1>(-1);
  const [retryCount, setRetryCount] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const unityContainerRef = useRef<HTMLDivElement | null>(null);
  const unityInstanceRef = useRef<UnityInstance | null>(null);

  const cleanContainer = () => {
    const { current: unityContainer } = unityContainerRef;
    if (!unityContainer) {
      return;
    }
    unityContainer.innerHTML = "";
  };

  const handleStart = () => {
    const { current: unityContainer } = unityContainerRef;
    if (!unityContainer) {
      return;
    }
    cleanContainer();
    const canvas = document.createElement("canvas");
    canvas.setAttribute("id", `unity-canvas-${buildName}`);
    unityContainer.appendChild(canvas);

    setStatusCode(0);
    createUnityInstance(
      canvas,
      {
        ...buildMeta,
        dataUrl: `${unityBuildRoot}/${buildName}.data${postfix}`,
        frameworkUrl: `${unityBuildRoot}/${buildName}.framework.js${postfix}`,
        codeUrl: `${unityBuildRoot}/${buildName}.wasm${postfix}`,
        streamingAssetsUrl: "StreamingAssets",
        matchWebGLToCanvasSize: true
      },
      setLoadingProgress
    )
      .then(unityInstance => {
        unityInstanceRef.current = unityInstance;
        setStatusCode(1);
      })
      .catch(msg => {
        // eslint-disable-next-line no-console
        console.error(msg);
      });
  };

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
      const { current: unityInstance } = unityInstanceRef;
      setLoadingProgress(0);
      setStatusCode(-1);
      if (unityInstance) {
        unityInstance.Quit().then(() => cleanContainer());
      }
    };
  }, [isActive, retryCount]);

  const scriptSrc = `${unityBuildRoot}/${buildName}.loader.js`;

  return {
    unityContainerRef,
    unityInstanceRef,
    statusCode,
    loadingProgress,
    scriptSrc
  };
};

export default useUnity;
