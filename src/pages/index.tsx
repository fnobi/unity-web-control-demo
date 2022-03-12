import { NextPage } from "next";
import { css } from "@emotion/react";
import { percent } from "~/lib/cssUtil";
import { BASE_PATH } from "~/local/constants";
import UnityEmbed from "~/components/UnityEmbed";

const wrapperStyle = css({
  position: "fixed",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  top: percent(0),
  left: percent(0),
  width: percent(100),
  height: percent(100)
});

const PageIndex: NextPage = () => (
  <div css={wrapperStyle}>
    <UnityEmbed
      buildName="webgl-build"
      unityBuildRoot={`${BASE_PATH}webgl-build/Build`}
    />
  </div>
);

export default PageIndex;
