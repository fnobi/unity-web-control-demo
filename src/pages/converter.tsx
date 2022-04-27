import { NextPage } from "next";
import {
  BoxGeometry,
  Euler,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
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
  const threeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const threeCubeRef = useRef<Mesh | null>(null);

  const { gameInstanceRef, unityCanvasRef, scriptSrc } = useUnity({
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

    let t = -1;

    function animate() {
      t = window.requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }

    animate();

    return () => {
      threeCubeRef.current = null;
      window.cancelAnimationFrame(t);
    };
  }, []);

  useEffect(() => {
    const { current: cube } = threeCubeRef;
    const { current: game } = gameInstanceRef;
    if (cube) {
      cube.rotation.set(rotateX, rotateY, rotateZ);
    }
    if (game) {
      game.SendMessage("Cube", "SetRotationX", (180 / Math.PI) * -rotateX);
      game.SendMessage("Cube", "SetRotationY", (180 / Math.PI) * rotateY + 180);
      game.SendMessage("Cube", "SetRotationZ", (180 / Math.PI) * rotateZ * -1);
      game.SendMessage("Cube", "ApplyRotation");
    }
  }, [rotateX, rotateY, rotateZ]);

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
        <Slider label="x" value={rotateX} onValue={setRotateX} />
        <Slider label="y" value={rotateY} onValue={setRotateY} />
        <Slider label="z" value={rotateZ} onValue={setRotateZ} />
      </div>
    </div>
  );
};

export default PageConverter;