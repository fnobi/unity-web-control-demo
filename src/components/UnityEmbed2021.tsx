import { css } from "@emotion/react";
import { em, percent, px } from "~/lib/cssUtil";
import Script from "next/script";
import { FC, useState } from "react";
import useUnity from "~/lib/useUnity";

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

const pauseViewStyle = css({
  position: "absolute",
  top: em(1),
  left: em(1)
});

const unityCanvasStyle = css({
  backgroundColor: "#888"
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

const UnityEmbed2021: FC<{
  buildName: string;
  unityBuildRoot: string;
  width?: number;
  height?: number;
}> = ({ buildName, unityBuildRoot, width = 960, height = 600 }) => {
  const [isStarted, setIsStarted] = useState(false);
  const { unityCanvasRef, scriptSrc, loadingProgress } = useUnity({
    isActive: isStarted,
    buildName,
    unityBuildRoot
  });
  return (
    <div css={mainStyle}>
      <Script src={scriptSrc} />
      <canvas
        ref={unityCanvasRef}
        id={`unity-canvas-${buildName}`}
        css={css(unityCanvasStyle, { width: px(width), height: px(height) })}
        width={width}
        height={height}
      />
      {isStarted && loadingProgress < 1 ? (
        <div css={progressViewStyle}>
          <div
            style={{ width: percent(100 * loadingProgress) }}
            css={progressBarStyle}
          />
        </div>
      ) : null}
      {isStarted ? (
        <div css={pauseViewStyle}>
          <button type="button" onClick={() => setIsStarted(false)}>
            pause
          </button>
        </div>
      ) : (
        <div css={startViewStyle}>
          <button type="button" onClick={() => setIsStarted(true)}>
            start
          </button>
        </div>
      )}
    </div>
  );
};

export default UnityEmbed2021;
