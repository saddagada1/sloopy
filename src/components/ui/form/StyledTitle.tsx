interface StyledTitleProps {
  title: string;
}

const StyledTitle: React.FC<StyledTitleProps> = ({ title }) => {
  return (
    <h1 className="mb-4 border-b border-gray-300 pb-2 font-display text-2xl font-bold sm:text-3xl">
      {title}
    </h1>
  );
};
export default StyledTitle;
