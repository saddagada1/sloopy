import { Field } from "formik";

interface StyledFieldProps {
  id: string;
  name: string;
  placeholder?: string;
  type?: string;
  style?: React.CSSProperties;
}

const StyledField: React.FC<StyledFieldProps> = ({
  id,
  name,
  placeholder,
  type,
  style,
}) => {
  return (
    <Field
      className="mb-4 w-full rounded-md border border-gray-300 bg-gray-200 p-2 text-sm sm:text-base"
      style={style}
      id={id}
      name={name}
      placeholder={placeholder}
      type={type}
    />
  );
};
export default StyledField;
