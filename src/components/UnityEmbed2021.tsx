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

const unityContainerStyle = css({
  backgroundColor: "#888",
  canvas: {
    position: "absolute",
    left: percent(0),
    top: percent(0),
    width: percent(100),
    height: percent(100)
  }
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
  const [isActive, setIsActive] = useState(false);
  const {
    containerRef: unityContainerRef,
    scriptSrc,
    statusCode,
    loadingProgress
  } = useUnity({
    isActive,
    buildName,
    unityBuildRoot,
    width,
    height
  });
  return (
    <div css={mainStyle}>
      <Script src={scriptSrc} />
      <div
        ref={unityContainerRef}
        css={css(unityContainerStyle, { width: px(width), height: px(height) })}
      />
      {statusCode === -1 ? (
        <div css={startViewStyle}>
          <button type="button" onClick={() => setIsActive(true)}>
            start
          </button>
        </div>
      ) : null}
      {statusCode === 0 ? (
        <div css={progressViewStyle}>
          <div
            style={{ width: percent(100 * loadingProgress) }}
            css={progressBarStyle}
          />
        </div>
      ) : null}
      {statusCode === 1 ? (
        <div css={pauseViewStyle}>
          <button type="button" onClick={() => setIsActive(false)}>
            pause
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default UnityEmbed2021;
