import LoadingButton, {
  type LoadingButtonProps,
} from "../../utils/LoadingButton";

interface StyledLoadingButtonProps extends LoadingButtonProps {
  label: string;
}

const StyledLoadingButton: React.FC<StyledLoadingButtonProps> = ({
  loading,
  disabled,
  label,
  ...LoadingButtonProps
}) => {
  return (
    <LoadingButton
      className="flex h-14 w-full items-center justify-center rounded-md bg-secondary font-display text-base font-bold capitalize text-primary sm:text-lg"
      dark
      loading={loading}
      disabled={disabled}
      {...LoadingButtonProps}
    >
      {label}
    </LoadingButton>
  );
};
export default StyledLoadingButton;
