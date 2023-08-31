import clsx from "clsx";

interface LabelValueBarProps {
  label: string;
  value: string | JSX.Element;
  style?: string;
}

const LabelValueBar: React.FC<LabelValueBarProps> = ({
  label,
  value,
  style,
}) => {
  return (
    <div
      className={clsx(
        "flex flex-1 items-center justify-between rounded-md px-2 py-1 font-semibold",
        style ?? ""
      )}
    >
      <p className="flex flex-1 text-sm sm:text-base">{value}</p>
      <label htmlFor="label" className="font-display text-base sm:text-lg">
        {label}
      </label>
    </div>
  );
};
export default LabelValueBar;
