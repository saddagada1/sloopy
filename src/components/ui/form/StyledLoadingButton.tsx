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
      className="flex h-12 w-full items-center justify-center rounded-md bg-secondary font-display text-lg font-bold text-primary sm:text-xl"
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
