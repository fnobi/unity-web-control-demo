import { NextPage } from "next";
import { css } from "@emotion/react";
import { percent } from "~/lib/cssUtil";
import { useState } from "react";
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

const PageIndex: NextPage = () => {
  const [game, setGame] = useState<1 | 2>(1);
  return (
    <div css={wrapperStyle}>
      <div>
        {game === 1 ? (
          <UnityEmbed
            buildName="karting-microgame"
            unityBuildRoot={`${BASE_PATH}unity-webgl`}
          />
        ) : null}
        {game === 2 ? (
          <UnityEmbed
            buildName="demo"
            unityBuildRoot={`${BASE_PATH}demo/Build`}
          />
        ) : null}
        <p>
          <label>
            <input
              type="radio"
              checked={game === 1}
              onChange={() => setGame(1)}
            />
            &nbsp;karting microgame
          </label>
        </p>
        <p>
          <label>
            <input
              type="radio"
              checked={game === 2}
              onChange={() => setGame(2)}
            />
            &nbsp;demo
          </label>
        </p>
      </div>
    </div>
  );
};

export default PageIndex;
