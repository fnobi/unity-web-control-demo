import { css } from "@emotion/react";
import { percent, px } from "~/lib/cssUtil";
import Script from "next/script";
import { FC, useEffect, useRef, useState } from "react";

const handleCompatibilityCheck = (
  gameInstance: UnityLoader.Game,
  onSuccess: () => void,
  onError: () => void
) => {
  if (!UnityLoader.SystemInfo.hasWebGL) {
    gameInstance.popup("Your browser does not support WebGL", [
      { text: "OK", callback: onError }
    ]);
  } else if (UnityLoader.SystemInfo.mobile) {
    gameInstance.popup(
      "Please note that Unity WebGL is not currently supported on mobiles. Press OK if you wish to continue anyway.",
      [{ text: "OK", callback: onSuccess }]
    );
  } else if (
    ["Edge", "Firefox", "Chrome", "Safari"].indexOf(
      UnityLoader.SystemInfo.browser
    ) === -1
  ) {
    gameInstance.popup(
      "Please note that your browser is not currently supported for this Unity WebGL content. Press OK if you wish to continue anyway.",
      [{ text: "OK", callback: onSuccess }]
    );
  } else {
    onSuccess();
  }
};

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

const UnityEmbed: FC<{
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
  const [progress, setProgress] = useState(0);
  const unityContainerRef = useRef<HTMLDivElement | null>(null);
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
    const { current: unityContainer } = unityContainerRef;
    if (!unityContainer) {
      return;
    }
    const unityInstance = UnityLoader.instantiate(
      unityContainer,
      `${unityBuildRoot}/${buildName}.json`,
      {
        compatibilityCheck: handleCompatibilityCheck,
        onProgress: (u, p) => setProgress(p)
      }
    );
    gameInstanceRef.current = unityInstance;
    setIsLoading(true);
  };

  return (
    <div css={mainStyle}>
      <Script src={`${unityBuildRoot}/UnityLoader.js`} />
      <div ref={unityContainerRef} css={unityContainerStyle} />
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

export default UnityEmbed;
