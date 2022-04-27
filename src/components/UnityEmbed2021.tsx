import { css } from "@emotion/react";
import { percent, px } from "~/lib/cssUtil";
import Script from "next/script";
import { FC, useEffect, useRef, useState } from "react";

const mainStyle = css({
  position: "relative"
});

const startViewStyle = css({
  position: "absolute",
  top: percent(0),
  left: percent(0),
  width: percent(100),
  height: percent(100),
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
});

const progressViewStyle = css({
  position: "absolute",
  top: percent(0),
  left: percent(0),
  width: percent(100),
  height: percent(100),
  backgroundColor: "#000"
});

const progressBarStyle = css({
  position: "absolute",
  top: percent(50),
  marginTop: px(-5),
  height: px(10),
  backgroundColor: "#f00"
});

const unityContainerStyle = css({
  width: px(960),
  height: px(600),
  backgroundColor: "#888"
});

const UnityEmbed2021: FC<{
  buildName: string;
  unityBuildRoot: string;
  sliderOption?: {
    gameObject: string;
    methodName: string;
    min: number;
    max: number;
  };
}> = ({ buildName, unityBuildRoot, sliderOption }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress] = useState(1);
  const unityCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameInstanceRef = useRef<UnityLoader.Game | null>(null);

  const [slider, setSlider] = useState(0);

  useEffect(() => {
    const { current: gameInstance } = gameInstanceRef;
    if (!gameInstance || !sliderOption) {
      return;
    }
    gameInstance.SendMessage(
      sliderOption.gameObject,
      sliderOption.methodName,
      slider
    );
  }, [slider, sliderOption]);

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
      productVersion: "0.1"
    }).then(unityInstance => {
      gameInstanceRef.current = unityInstance;
      setIsLoading(true);
    });
  };

  return (
    <div css={mainStyle}>
      <Script src={`${unityBuildRoot}/${buildName}.loader.js`} />
      <div css={unityContainerStyle}>
        <canvas
          ref={unityCanvasRef}
          id={`unity-canvas-${buildName}`}
          width={960}
          height={600}
          style={{ width: "960px", height: "600px", background: "#231F20" }}
        />
      </div>
      {!isLoading ? (
        <div css={startViewStyle}>
          <button type="button" onClick={handleStart}>
            start
          </button>
        </div>
      ) : null}
      {isLoading && progress < 1 ? (
        <div css={progressViewStyle}>
          <div
            style={{ width: percent(100 * progress) }}
            css={progressBarStyle}
          />
        </div>
      ) : null}
      {isLoading && progress >= 1 && sliderOption ? (
        <div>
          <input
            type="range"
            min={sliderOption.min}
            max={sliderOption.max}
            value={slider}
            onChange={e => setSlider(Number(e.target.value))}
          />
          &nbsp;
          {slider}
        </div>
      ) : null}
    </div>
  );
};

export default UnityEmbed2021;
