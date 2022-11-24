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
import { spStyle } from "~/local/emotionMixin";
import VectorForm from "~/components/VectorForm";

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

const formWrapperStyle = css(
  {
    width: percent(100),
    marginTop: em(1),
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center"
  },
  spStyle({
    flexDirection: "column"
  })
);

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

const vectorWrapperStyle = css({
  margin: em(1, 0)
});

const ConverterMock: FC = () => {
  const [cubePositionVector, setCubePositionVector] = useState(
    new Vector3(0, 0, 0)
  );
  const [cubeRotationVector, setCubeRotationVector] = useState(
    new Vector3(0, 0, 0)
  );
  const [cameraPositionVector, setCameraPositionVector] = useState(
    new Vector3(0, 1, 10)
  );
  const [cameraRotationVector, setCameraRotationVector] = useState(
    new Vector3(0, 0, 0)
  );
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
    if (!scene) {
      return () => {};
    }

    const geometry = new BoxGeometry(BOX_SIZE_X, BOX_SIZE_Y, BOX_SIZE_Z);
    const material = new MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new Mesh(geometry, material);
    scene.add(cube);
    threeCubeRef.current = cube;

    return () => {
      threeCubeRef.current = null;
    };
  }, []);

  useEffect(() => {
    const { current: cube } = threeCubeRef;
    const { current: camera } = cameraRef;

    // state => three.jsへの同期
    if (camera) {
      camera.position.copy(cameraPositionVector);
      camera.rotation.set(
        cameraRotationVector.x,
        cameraRotationVector.y,
        cameraRotationVector.z
      );
    }
    if (cube) {
      cube.position.copy(cubePositionVector);
      cube.rotation.set(
        cubeRotationVector.x,
        cubeRotationVector.y,
        cubeRotationVector.z
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
  }, [
    cubePositionVector,
    cubeRotationVector,
    cameraPositionVector,
    cameraRotationVector,
    unityIsReady
  ]);

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
      <div css={formWrapperStyle}>
        <div css={gameUnitStyle}>
          <div>cube</div>
          <div css={vectorWrapperStyle}>
            <VectorForm
              range={10}
              inputVector={cubePositionVector}
              setInputVector={setCubePositionVector}
            />
          </div>
          <div css={vectorWrapperStyle}>
            <VectorForm
              range={3.2}
              inputVector={cubeRotationVector}
              setInputVector={setCubeRotationVector}
            />
          </div>
        </div>
        <div css={gameUnitStyle}>
          <div>camera</div>
          <div css={vectorWrapperStyle}>
            <VectorForm
              range={10}
              inputVector={cameraPositionVector}
              setInputVector={setCameraPositionVector}
            />
          </div>
          <div css={vectorWrapperStyle}>
            <VectorForm
              range={3.2}
              inputVector={cameraRotationVector}
              setInputVector={setCameraRotationVector}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConverterMock;
