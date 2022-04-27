import { NextPage } from "next";
import { css } from "@emotion/react";
import { em, percent } from "~/lib/cssUtil";
import { useRef } from "react";
import { BASE_PATH } from "~/local/constants";
import UnityEmbed2021 from "~/components/UnityEmbed2021";

const wrapperStyle = css({
  position: "fixed",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  top: percent(0),
  left: percent(0),
  width: percent(100),
  height: percent(100)
});

const columnStyle = css({
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
});

const threeCanvasStyle = css({
  backgroundColor: "#ccc",
  marginLeft: em(1)
});

const PageConverter: NextPage = () => {
  const threeCanvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <div css={wrapperStyle}>
      <div css={columnStyle}>
        <UnityEmbed2021
          buildName="sample2021"
          unityBuildRoot={`${BASE_PATH}/unity-webgl/sample2021/Build`}
        />
        <canvas
          width={960}
          height={600}
          ref={threeCanvasRef}
          css={threeCanvasStyle}
        />
      </div>
    </div>
  );
};

export default PageConverter;
