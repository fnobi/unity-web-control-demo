declare function createUnityInstance(
  el: HTMLCanvasElement,
  options: {
    dataUrl: string;
    frameworkUrl: string;
    codeUrl: string;
    streamingAssetsUrl: string;
    companyName: string;
    productName: string;
    productVersion: string;
    matchWebGLToCanvasSize?: boolean;
    devicePixelRatio?: number;
  }
): Promise<UnityLoader.Game>;
