import { Vector3 } from "three";
import { em } from "~/lib/cssUtil";
import { Dispatch, FC, SetStateAction } from "react";

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
      readOnly
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

const VectorForm: FC<{
  inputVector: Vector3;
  setInputVector: Dispatch<SetStateAction<Vector3>>;
}> = ({ inputVector, setInputVector }) => (
  <div>
    <Slider
      label="x"
      value={inputVector.x}
      onValue={n => setInputVector(v => v.clone().setX(n))}
    />
    <Slider
      label="y"
      value={inputVector.y}
      onValue={n => setInputVector(v => v.clone().setY(n))}
    />
    <Slider
      label="z"
      value={inputVector.z}
      onValue={n => setInputVector(v => v.clone().setZ(n))}
    />
  </div>
);

export default VectorForm;
