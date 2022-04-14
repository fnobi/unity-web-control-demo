import { NextPage } from "next";
import { css } from "@emotion/react";
import { em, percent } from "~/lib/cssUtil";
import { useState } from "react";
import { BASE_PATH } from "~/local/constants";
import UnityEmbed from "~/components/UnityEmbed";
import UnityEmbed2021 from "~/components/UnityEmbed2021";

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

const headerStyle = css({
  marginBottom: em(0.5)
});

const PageIndex: NextPage = () => {
  const [game, setGame] = useState<1 | 2 | 3>(3);
  return (
    <div css={wrapperStyle}>
      <div css={headerStyle}>
        <button type="button" disabled={game === 1} onClick={() => setGame(1)}>
          karting microgame
        </button>
        &nbsp;
        <button type="button" disabled={game === 2} onClick={() => setGame(2)}>
          demo
        </button>
        &nbsp;
        <button type="button" disabled={game === 3} onClick={() => setGame(3)}>
          sample2021
        </button>
      </div>
      {game === 1 ? (
        <UnityEmbed
          buildName="karting-microgame"
          unityBuildRoot={`${BASE_PATH}unity-webgl/karting-microgame/Build`}
        />
      ) : null}
      {game === 2 ? (
        <UnityEmbed
          buildName="demo"
          unityBuildRoot={`${BASE_PATH}unity-webgl/demo/Build`}
          sliderOption={{
            gameObject: "Main Camera",
            methodName: "SetAngle",
            min: 0,
            max: 360
          }}
        />
      ) : null}
      {game === 3 ? (
        <UnityEmbed2021
          buildName="sample2021"
          unityBuildRoot={`${BASE_PATH}unity-webgl/sample2021/Build`}
        />
      ) : null}
    </div>
  );
};

export default PageIndex;
