interface StyledTitleProps {
  title: string;
}

const StyledTitle: React.FC<StyledTitleProps> = ({ title }) => {
  return (
    <h1 className="mb-4 border-b border-gray-300 pb-2 font-display text-xl font-semibold capitalize sm:text-2xl">
      {title}
    </h1>
  );
};
export default StyledTitle;
