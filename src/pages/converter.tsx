import { NextPage } from "next";
import {
  BoxGeometry,
  Mesh,
  MeshBasicMaterial,
  Quaternion,
  Vector3
} from "three";
import { css } from "@emotion/react";
import { em, percent, px } from "~/lib/cssUtil";
import { FC, useEffect, useRef, useState } from "react";
import useUnity from "~/lib/useUnity";
import Script from "next/script";
import useThree from "~/lib/useThree";
import { BASE_PATH } from "~/local/constants";

const WIDTH = 500;
const HEIGHT = 500;

// NOTE: 以下は今回コードで同期していないので、Unity側と予め設定をそろえておく必要がある
const CAMERA_FOV = 60;
const CAMERA_CLIPPING_NEAR = 0.3;
const CAMERA_CLIPPING_FAR = 1000;
const CAMERA_POSITION = new Vector3(0, 1, -10);

const BOX_SIZE_X = 2;
const BOX_SIZE_Y = 1;
const BOX_SIZE_Z = 3;

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

const gameWrapperStyle = css({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center"
});

const gameUnitStyle = css({
  margin: em(0, 1)
});

const gameContainerStyle = css({
  position: "relative",
  width: px(WIDTH),
  height: px(HEIGHT),
  canvas: {
    position: "absolute",
    left: percent(0),
    top: percent(0),
    width: percent(100),
    height: percent(100)
  }
});

const Slider: FC<{
  label: string;
  value: number;
  onValue: (n: number) => void;
}> = ({ label, value, onValue }) => (
  <p>
    {label}:&nbsp;
    <input
      type="number"
      step={0.01}
      style={{ width: em(5) }}
      value={value}
      onChange={e => onValue(Number(e.target.value))}
    />
    &nbsp;
    <input
      type="range"
      value={value}
      min={-3.2}
      max={3.2}
      step={0.01}
      onChange={e => onValue(Number(e.target.value))}
    />
  </p>
);

const PageConverter: NextPage = () => {
  const [inputX, setInputX] = useState(0);
  const [inputY, setInputY] = useState(0);
  const [inputZ, setInputZ] = useState(0);
  const [isCamera, setIsCamera] = useState(false);
  const [isPos, setIsPos] = useState(false);
  const threeCubeRef = useRef<Mesh | null>(null);

  const {
    instanceRef: unityInstanceRef,
    containerRef: unityContainerRef,
    scriptSrc
  } = useUnity({
    isActive: true,
    buildName: "sample2021",
    unityBuildRoot: `${BASE_PATH}/unity-webgl/sample2021/Build`,
    buildMeta: {
      companyName: "DefaultCompany",
      productName: "sample2021",
      productVersion: "0.1"
    }
  });

  const {
    containerRef: threeContainerRef,
    sceneRef,
    cameraRef
  } = useThree({
    clearColor: [0x000000, 1],
    cameraOption: [CAMERA_FOV, 1, CAMERA_CLIPPING_NEAR, CAMERA_CLIPPING_FAR]
  });

  useEffect(() => {
    const { current: scene } = sceneRef;
    const { current: camera } = cameraRef;
    if (!scene || !camera) {
      return () => {};
    }

    const geometry = new BoxGeometry(BOX_SIZE_X, BOX_SIZE_Y, BOX_SIZE_Z);
    const material = new MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new Mesh(geometry, material);
    scene.add(cube);
    threeCubeRef.current = cube;

    camera.position.copy(CAMERA_POSITION);

    return () => {
      threeCubeRef.current = null;
    };
  }, []);

  useEffect(() => {
    const { current: cube } = threeCubeRef;
    const { current: camera } = cameraRef;
    const { current: unityInstance } = unityInstanceRef;

    // state => three.jsへの同期
    if (camera) {
      camera.rotation.set(
        isCamera ? inputX : 0,
        isCamera ? inputY : Math.PI,
        isCamera ? inputZ : 0
      );
    }
    if (cube) {
      cube.position.set(
        !isCamera && isPos ? inputX : 0,
        !isCamera && isPos ? inputY : 0,
        !isCamera && isPos ? inputZ : 0
      );
      cube.rotation.set(
        isCamera || isPos ? 0 : inputX,
        isCamera || isPos ? 0 : inputY,
        isCamera || isPos ? 0 : inputZ
      );
    }

    // three.js => Unityへの同期
    if (camera && unityInstance) {
      const q = new Quaternion();
      q.setFromEuler(camera.rotation);
      const rotater = new Quaternion();
      rotater.setFromAxisAngle(new Vector3(0, 1, 0).normalize(), Math.PI);
      q.multiply(rotater);
      unityInstance.SendMessage("Main Camera", "SetQuaternionX", q.x);
      unityInstance.SendMessage("Main Camera", "SetQuaternionY", -q.y);
      unityInstance.SendMessage("Main Camera", "SetQuaternionZ", -q.z);
      unityInstance.SendMessage("Main Camera", "SetQuaternionW", q.w);
      unityInstance.SendMessage("Main Camera", "ApplyQuaternion");
      unityInstance.SendMessage("Main Camera", "SetFOV", camera.fov);
    }
    if (cube && unityInstance) {
      const q = new Quaternion();
      q.setFromEuler(cube.rotation);
      unityInstance.SendMessage("Cube", "SetQuaternionX", q.x);
      unityInstance.SendMessage("Cube", "SetQuaternionY", -q.y);
      unityInstance.SendMessage("Cube", "SetQuaternionZ", -q.z);
      unityInstance.SendMessage("Cube", "SetQuaternionW", q.w);
      unityInstance.SendMessage("Cube", "ApplyQuaternion");
      unityInstance.SendMessage("Cube", "SetPositionX", -cube.position.x);
      unityInstance.SendMessage("Cube", "SetPositionY", cube.position.y);
      unityInstance.SendMessage("Cube", "SetPositionZ", cube.position.z);
    }
  }, [inputX, inputY, inputZ, isCamera, isPos]);

  return (
    <div css={wrapperStyle}>
      <Script src={scriptSrc} />
      <div css={gameWrapperStyle}>
        <div>
          <p>unity</p>
          <div ref={unityContainerRef} css={gameContainerStyle} />
        </div>
        <div css={gameUnitStyle}>
          <p>three.js</p>
          <div css={gameContainerStyle} ref={threeContainerRef} />
        </div>
      </div>
      <div>
        <p>
          <label>
            <input
              type="radio"
              checked={!isCamera}
              onChange={e => setIsCamera(!e.target.checked)}
            />
            box
          </label>
          &nbsp;
          <label>
            <input
              type="radio"
              checked={isCamera}
              onChange={e => setIsCamera(e.target.checked)}
            />
            camera
          </label>
        </p>
        <p>
          <label>
            <input
              type="radio"
              checked={!isPos}
              onChange={e => setIsPos(!e.target.checked)}
            />
            rotate
          </label>
          &nbsp;
          <label>
            <input
              type="radio"
              checked={isPos}
              onChange={e => setIsPos(e.target.checked)}
            />
            pos
          </label>
        </p>
        <Slider label="x" value={inputX} onValue={setInputX} />
        <Slider label="y" value={inputY} onValue={setInputY} />
        <Slider label="z" value={inputZ} onValue={setInputZ} />
      </div>
    </div>
  );
};

export default PageConverter;
