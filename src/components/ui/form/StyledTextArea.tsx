import { Field } from "formik";

interface StyledTextAreaProps {
  id: string;
  name: string;
  placeholder?: string;
  type?: string;
  style?: React.CSSProperties;
}

const StyledTextArea: React.FC<StyledTextAreaProps> = ({
  id,
  name,
  placeholder,
  type,
  style,
}) => {
  return (
    <Field
      className="mb-4 h-24 w-full resize-none rounded-md border border-gray-300 bg-gray-200 p-3 text-sm font-medium sm:text-base"
      style={style}
      id={id}
      name={name}
      placeholder={placeholder}
      type={type}
      as="textarea"
      autoComplete="off"
      autoCorrect="off"
    />
  );
};
export default StyledTextArea;
