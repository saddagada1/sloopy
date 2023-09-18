interface ErrorViewProps {
  message?: string;
}

const ErrorView: React.FC<ErrorViewProps> = ({ message }) => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 font-display">
      <h1 className="text-3xl font-extrabold sm:text-4xl">404</h1>
      <p className="mx-12 text-center font-display text-base text-gray-400 sm:text-lg">
        {message ??
          "We couldn't find what you were looking for. If you are sure it exists please refresh the page and try again or check that the url is valid."}
      </p>
    </div>
  );
};

export default ErrorView;
