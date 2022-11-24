import { Vector3 } from "three";
import { em } from "~/lib/cssUtil";
import { Dispatch, FC, SetStateAction } from "react";

const Slider: FC<{
  label: string;
  value: number;
  range: number;
  onValue: (n: number) => void;
}> = ({ label, value, range, onValue }) => (
  <p>
    {label}:&nbsp;
    <input
      type="number"
      step={0.01}
      style={{ width: em(3) }}
      value={value}
      readOnly
    />
    &nbsp;
    <input
      type="range"
      value={value}
      min={-range}
      max={range}
      step={0.01}
      onChange={e => onValue(Number(e.target.value))}
      style={{ width: em(12) }}
    />
  </p>
);

const VectorForm: FC<{
  inputVector: Vector3;
  setInputVector: Dispatch<SetStateAction<Vector3>>;
  range: number;
}> = ({ inputVector, setInputVector, range }) => (
  <div>
    <Slider
      label="x"
      range={range}
      value={inputVector.x}
      onValue={n => setInputVector(v => v.clone().setX(n))}
    />
    <Slider
      label="y"
      range={range}
      value={inputVector.y}
      onValue={n => setInputVector(v => v.clone().setY(n))}
    />
    <Slider
      label="z"
      range={range}
      value={inputVector.z}
      onValue={n => setInputVector(v => v.clone().setZ(n))}
    />
  </div>
);

export default VectorForm;
