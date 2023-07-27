interface StyledLabelProps {
  label: string;
  error?: string;
  touched?: boolean;
}

const StyledLabel: React.FC<StyledLabelProps> = ({ label, error, touched }) => {
  return (
    <div className="text-md mb-2 flex items-center justify-between font-medium sm:text-lg">
      <label htmlFor="label">{label}</label>
      {error && touched && (
        <div className="rounded-md border border-solid border-red-500 bg-red-100 px-2 py-0.5 text-xs text-red-500 sm:text-sm">
          {error}
        </div>
      )}
    </div>
  );
};
export default StyledLabel;
