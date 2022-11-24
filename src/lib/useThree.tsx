import { useEffect, useRef } from "react";
import {
  ColorRepresentation,
  PerspectiveCamera,
  Scene,
  TextureEncoding,
  WebGLRenderer
} from "three";

const useThree = (opts: {
  cameraOption?: (number | undefined)[];
  clearColor?: [ColorRepresentation, number];
  outputEncoding?: TextureEncoding;
  shadowMap?: boolean;
  onUpdate?: (time: number) => void;
}) => {
  const {
    cameraOption = [],
    clearColor = [0xffffff, 1],
    outputEncoding,
    shadowMap = false,
    onUpdate = () => {}
  } = opts;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const cameraRef = useRef<PerspectiveCamera | null>(null);

  useEffect(() => {
    const { current: container } = containerRef;
    if (!container) {
      return () => {};
    }
    const canvas = document.createElement("canvas");
    container.appendChild(canvas);

    const renderer = new WebGLRenderer({
      canvas
    });

    rendererRef.current = renderer;

    return () => {
      container.removeChild(canvas);
      rendererRef.current = null;
    };
  }, []);

  useEffect(() => {
    const scene = new Scene();
    sceneRef.current = scene;
    return () => {
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    const camera = new PerspectiveCamera(...cameraOption);
    cameraRef.current = camera;
    return () => {
      cameraRef.current = null;
    };
  }, []);

  useEffect(() => {
    const { current: renderer } = rendererRef;
    if (renderer) {
      renderer.setClearColor(...clearColor);
    }
  }, [clearColor]);

  useEffect(() => {
    const { current: renderer } = rendererRef;
    if (renderer && outputEncoding) {
      renderer.outputEncoding = outputEncoding;
    }
  }, [outputEncoding]);

  useEffect(() => {
    const { current: renderer } = rendererRef;
    if (renderer) {
      renderer.shadowMap.enabled = shadowMap;
    }
  }, [shadowMap]);

  useEffect(() => {
    const { current: container } = containerRef;
    const { current: renderer } = rendererRef;
    const { current: camera } = cameraRef;
    if (!container || !renderer || !camera) {
      return () => {};
    }

    const onResize = () => {
      const width = container.offsetWidth;
      const height = container.offsetHeight;

      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(width, height);

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    onResize();
    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const { current: renderer } = rendererRef;
    const { current: camera } = cameraRef;
    const { current: scene } = sceneRef;
    if (!renderer || !camera || !scene) {
      return () => {};
    }

    let t = -1;
    const render = (time: number) => {
      t = window.requestAnimationFrame(render);
      onUpdate(time);
      renderer.render(scene, camera);
    };
    t = window.requestAnimationFrame(render);
    return () => window.cancelAnimationFrame(t);
  }, [onUpdate]);

  return { containerRef, sceneRef, cameraRef, rendererRef };
};

export default useThree;
