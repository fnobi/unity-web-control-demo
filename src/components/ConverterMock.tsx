import {
  BoxGeometry,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Quaternion,
  Vector3
} from "three";
import { css } from "@emotion/react";
import { em, percent, px, vw } from "~/lib/cssUtil";
import { FC, useEffect, useRef, useState } from "react";
import useUnity from "~/lib/useUnity";
import Script from "next/script";
import useThree from "~/lib/useThree";
import { BASE_PATH } from "~/local/constants";

const DEFAULT_CAMERA_POSITION = new Vector3(0, 1, -10);

// NOTE: 以下は今回コードで同期していないので、Unity側と予め設定をそろえておく必要がある
const CAMERA_FOV = 60;
const CAMERA_CLIPPING_NEAR = 0.3;
const CAMERA_CLIPPING_FAR = 1000;

const BOX_SIZE_X = 2;
const BOX_SIZE_Y = 1;
const BOX_SIZE_Z = 3;

const UNITY_OBJECT_CUBE = "Cube";
const UNITY_OBJECT_CAMERA = "Main Camera";

const wrapperStyle = css({
  position: "absolute",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  top: percent(0),
  left: percent(0),
  width: percent(100),
  minHeight: percent(100)
});

const gameWrapperStyle = css({
  width: percent(100),
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center"
});

const gameUnitStyle = css({
  width: percent(100)
});

const gameContainerStyle = css({
  position: "relative",
  width: percent(100),
  height: vw(100),
  maxHeight: px(500),
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

const ConverterMock: FC = () => {
  const [inputX, setInputX] = useState(0);
  const [inputY, setInputY] = useState(0);
  const [inputZ, setInputZ] = useState(0);
  const [isCamera, setIsCamera] = useState(false);
  const [isPos, setIsPos] = useState(false);
  const threeCubeRef = useRef<Mesh | null>(null);

  const {
    instanceRef: unityInstanceRef,
    containerRef: unityContainerRef,
    statusCode: unityStatusCode,
    scriptSrc: unityScriptSrc
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

  const unityIsReady = unityStatusCode >= 1;

  const syncObject = (srcObject: Object3D, name: string) => {
    const { current: unityInstance } = unityInstanceRef;
    if (!unityInstance) {
      return;
    }
    const q = new Quaternion();
    q.setFromEuler(srcObject.rotation);
    const rotater = new Quaternion();
    rotater.setFromAxisAngle(new Vector3(0, 1, 0).normalize(), Math.PI);
    q.multiply(rotater);
    unityInstance.SendMessage(name, "SetQuaternionX", q.x);
    unityInstance.SendMessage(name, "SetQuaternionY", -q.y);
    unityInstance.SendMessage(name, "SetQuaternionZ", -q.z);
    unityInstance.SendMessage(name, "SetQuaternionW", q.w);
    unityInstance.SendMessage(name, "ApplyQuaternion");
    unityInstance.SendMessage(name, "SetPositionX", -srcObject.position.x);
    unityInstance.SendMessage(name, "SetPositionY", srcObject.position.y);
    unityInstance.SendMessage(name, "SetPositionZ", srcObject.position.z);
  };

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

    camera.position.copy(DEFAULT_CAMERA_POSITION);

    return () => {
      threeCubeRef.current = null;
    };
  }, []);

  useEffect(() => {
    const { current: cube } = threeCubeRef;
    const { current: camera } = cameraRef;

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
    if (unityIsReady) {
      if (camera) {
        syncObject(camera, UNITY_OBJECT_CAMERA);
      }
      if (cube) {
        syncObject(cube, UNITY_OBJECT_CUBE);
      }
    }
  }, [inputX, inputY, inputZ, isCamera, isPos, unityIsReady]);

  return (
    <div css={wrapperStyle}>
      <Script src={unityScriptSrc} />
      <div css={gameWrapperStyle}>
        <div css={gameUnitStyle}>
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

export default ConverterMock;
