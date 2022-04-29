import { css } from "@emotion/react";
import { percent, px } from "~/lib/cssUtil";
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

const unityContainerStyle = css({
  width: px(960),
  height: px(600),
  backgroundColor: "#888"
});

const UnityEmbed2021: FC<{
  buildName: string;
  unityBuildRoot: string;
}> = ({ buildName, unityBuildRoot }) => {
  const [isStarted, setIsStarted] = useState(false);
  const { unityCanvasRef } = useUnity({
    isActive: isStarted,
    buildName,
    unityBuildRoot
  });

  const handleStart = () => {
    setIsStarted(true);
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
      {!isStarted ? (
        <div css={startViewStyle}>
          <button type="button" onClick={handleStart}>
            start
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default UnityEmbed2021;
