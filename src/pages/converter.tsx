import { NextPage } from "next";
import {
  BoxGeometry,
  Euler,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Quaternion,
  Scene,
  Vector3,
  WebGLRenderer
} from "three";
import { css } from "@emotion/react";
import { em, percent } from "~/lib/cssUtil";
import { FC, useEffect, useRef, useState } from "react";
import useUnity from "~/lib/useUnity";
import Script from "next/script";
import { BASE_PATH } from "~/local/constants";

// このへんはunity側と前提を揃える必要があるところ
const WIDTH = 960;
const HEIGHT = 600;

const CAMERA_FOV = 60;
const CAMERA_CLIPPING_NEAR = 0.3;
const CAMERA_CLIPPING_FAR = 1000;
const CAMERA_POSITION = new Vector3(0, 1, -10);
const CAMERA_ROTATION = new Euler(0, Math.PI, 0);

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

const columnStyle = css({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center"
});

const threeCanvasStyle = css({
  marginLeft: em(1),
  canvas: {
    backgroundColor: "#ccc"
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
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [rotateZ, setRotateZ] = useState(0);
  const [isCamera, setIsCamera] = useState(false);
  const threeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const threeCubeRef = useRef<Mesh | null>(null);
  const threeCameraRef = useRef<PerspectiveCamera | null>(null);

  const { gameInstanceRef, unityCanvasRef, scriptSrc } = useUnity({
    isActive: true,
    buildName: "sample2021",
    unityBuildRoot: `${BASE_PATH}/unity-webgl/sample2021/Build`
  });

  useEffect(() => {
    const { current: canvas } = threeCanvasRef;
    if (!canvas) {
      return () => {};
    }

    const scene = new Scene();
    const camera = new PerspectiveCamera(
      CAMERA_FOV,
      WIDTH / HEIGHT,
      CAMERA_CLIPPING_NEAR,
      CAMERA_CLIPPING_FAR
    );

    const renderer = new WebGLRenderer({ canvas });

    const geometry = new BoxGeometry(BOX_SIZE_X, BOX_SIZE_Y, BOX_SIZE_Z);
    const material = new MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new Mesh(geometry, material);
    scene.add(cube);
    threeCubeRef.current = cube;

    camera.position.copy(CAMERA_POSITION);
    camera.rotation.copy(CAMERA_ROTATION);
    threeCameraRef.current = camera;

    let t = -1;

    function animate() {
      t = window.requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }

    animate();

    return () => {
      threeCubeRef.current = null;
      threeCameraRef.current = null;
      window.cancelAnimationFrame(t);
    };
  }, []);

  useEffect(() => {
    const { current: cube } = threeCubeRef;
    const { current: camera } = threeCameraRef;
    const { current: game } = gameInstanceRef;
    if (camera) {
      camera.rotation.set(
        isCamera ? rotateX : 0,
        isCamera ? rotateY : Math.PI,
        isCamera ? rotateZ : 0
      );
    }
    if (cube) {
      cube.rotation.set(
        isCamera ? 0 : rotateX,
        isCamera ? 0 : rotateY,
        isCamera ? 0 : rotateZ
      );
    }
    if (camera && game) {
      const q = new Quaternion();
      q.setFromEuler(camera.rotation);
      const rotater = new Quaternion();
      rotater.setFromAxisAngle(new Vector3(0, 1, 0).normalize(), Math.PI);
      q.multiply(rotater);
      game.SendMessage("Main Camera", "SetQuaternionX", q.x);
      game.SendMessage("Main Camera", "SetQuaternionY", -q.y);
      game.SendMessage("Main Camera", "SetQuaternionZ", -q.z);
      game.SendMessage("Main Camera", "SetQuaternionW", q.w);
      game.SendMessage("Main Camera", "ApplyQuaternion");
    }
    if (cube && game) {
      const q = new Quaternion();
      q.setFromEuler(cube.rotation);
      game.SendMessage("Cube", "SetQuaternionX", q.x);
      game.SendMessage("Cube", "SetQuaternionY", -q.y);
      game.SendMessage("Cube", "SetQuaternionZ", -q.z);
      game.SendMessage("Cube", "SetQuaternionW", q.w);
      game.SendMessage("Cube", "ApplyQuaternion");
    }
  }, [rotateX, rotateY, rotateZ, isCamera]);

  return (
    <div css={wrapperStyle}>
      <Script src={scriptSrc} />
      <div css={columnStyle}>
        <div>
          <p>unity</p>
          <canvas
            ref={unityCanvasRef}
            id="unity-canvas"
            width={WIDTH}
            height={HEIGHT}
          />
        </div>
        <div css={threeCanvasStyle}>
          <p>three.js</p>
          <canvas width={WIDTH} height={HEIGHT} ref={threeCanvasRef} />
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
        <Slider label="x" value={rotateX} onValue={setRotateX} />
        <Slider label="y" value={rotateY} onValue={setRotateY} />
        <Slider label="z" value={rotateZ} onValue={setRotateZ} />
      </div>
    </div>
  );
};

export default PageConverter;
