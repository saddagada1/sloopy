import { twMerge } from "tailwind-merge";
import LoadingButton, { type LoadingButtonProps } from "../LoadingButton";

interface StyledLoadingButtonProps extends LoadingButtonProps {
  label: string;
}

const StyledLoadingButton: React.FC<StyledLoadingButtonProps> = ({
  loading,
  disabled,
  label,
  ...LoadingButtonProps
}) => {
  const { className, ...props } = LoadingButtonProps;
  return (
    <LoadingButton
      className={twMerge(
        "flex h-14 w-full items-center justify-center rounded-md bg-secondary font-display text-base font-bold capitalize text-primary sm:text-lg",
        className
      )}
      dark
      loading={loading}
      disabled={disabled}
      {...props}
    >
      {label}
    </LoadingButton>
  );
};
export default StyledLoadingButton;
