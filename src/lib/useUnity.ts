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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<UnityInstance | null>(null);

  const handleStart = () => {
    const { current: container } = containerRef;
    if (!container) {
      return;
    }

    container.innerHTML = "";

    const canvas = document.createElement("canvas");
    canvas.setAttribute("id", `unity-canvas-${buildName}`);
    container.appendChild(canvas);

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
      .then(instance => {
        instanceRef.current = instance;
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
      setLoadingProgress(0);
      setStatusCode(-1);
      const { current: instance } = instanceRef;
      if (instance) {
        instance.Quit();
      }
    };
  }, [isActive, retryCount]);

  const scriptSrc = `${unityBuildRoot}/${buildName}.loader.js`;

  return {
    containerRef,
    instanceRef,
    statusCode,
    loadingProgress,
    scriptSrc
  };
};

export default useUnity;
