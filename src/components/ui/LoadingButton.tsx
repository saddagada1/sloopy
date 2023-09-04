import { type ButtonHTMLAttributes, type DetailedHTMLProps } from "react";
import { WaveSpinner } from "react-spinners-kit";
import { primaryColour, secondaryColour } from "~/utils/constants";

export interface LoadingButtonProps
  extends DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  children?: React.ReactNode;
  dark?: boolean;
  loading: boolean;
  disabled: boolean;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  children,
  dark,
  loading,
  disabled,
  ...DetailedHTMLProps
}) => {
  return (
    <button {...DetailedHTMLProps} type="submit" disabled={disabled}>
      {loading ? (
        <WaveSpinner
          size={2}
          color={dark ? primaryColour : secondaryColour}
          loading={loading}
          sizeUnit="vmax"
        />
      ) : (
        <>{children}</>
      )}
    </button>
  );
};
export default LoadingButton;
