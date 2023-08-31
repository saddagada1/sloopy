import * as Slider from "@radix-ui/react-slider";
import clsx from "clsx";

interface InputSliderProps {
  vertical?: boolean;
  defaultValue?: number;
  maxValue?: number;
  minValue?: number;
  step?: number;
  onSlideEnd?: (value: number[]) => void;
}

const InputSlider: React.FC<InputSliderProps> = ({
  vertical,
  defaultValue,
  maxValue,
  minValue,
  step,
  onSlideEnd,
}) => {
  return (
    <Slider.Root
      orientation={vertical ? "vertical" : "horizontal"}
      defaultValue={[defaultValue ?? 0.5]}
      max={maxValue ?? 1}
      min={minValue ?? 0}
      step={step ?? 0.1}
      onValueCommit={(value) => onSlideEnd && onSlideEnd(value)}
      className={clsx(
        "relative flex items-center",
        vertical ? "h-full w-5 flex-col" : "h-5 w-full"
      )}
    >
      <Slider.Track
        className={clsx(
          "relative flex-grow rounded-sm border border-gray-300 bg-gray-200",
          vertical ? "w-1" : "h-1"
        )}
      >
        <Slider.Range
          className={clsx(
            "absolute rounded-sm bg-secondary",
            vertical ? "left-0 w-full" : "h-full"
          )}
        />
      </Slider.Track>
      <Slider.Thumb className="block aspect-square h-4 rounded-full bg-secondary" />
    </Slider.Root>
  );
};
export default InputSlider;
