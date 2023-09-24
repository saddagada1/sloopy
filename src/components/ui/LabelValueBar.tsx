import { type DetailedHTMLProps, type HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

interface LabelValueBarProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  label: string;
  value: string | JSX.Element;
}

const LabelValueBar: React.FC<LabelValueBarProps> = ({
  label,
  value,
  ...DetailedHTMLProps
}) => {
  const { className, ...props } = DetailedHTMLProps;
  return (
    <div
      className={twMerge(
        "flex flex-1 items-center justify-between gap-2 rounded-md px-2 py-1 font-semibold",
        className
      )}
      {...props}
    >
      <p className="font-display text-base capitalize sm:text-lg">{label}</p>
      <p className="flex text-sm capitalize sm:text-base">{value}</p>
    </div>
  );
};
export default LabelValueBar;
