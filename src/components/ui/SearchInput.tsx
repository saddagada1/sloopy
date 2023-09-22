import { Field, Form, Formik } from "formik";
import { useRouter } from "next/router";
import { PiMagnifyingGlass } from "react-icons/pi";

interface SearchInputProps {
  defaultValue?: string;
  tab?: string;
  onSearch?: () => void;
}

const SearchInput: React.FC<SearchInputProps> = ({
  defaultValue,
  tab,
  onSearch,
}) => {
  const router = useRouter();
  return (
    <Formik
      initialValues={{
        query: defaultValue ?? "",
      }}
      onSubmit={(values: { query: string }) => {
        void router.push(`/search?q=${values.query}&tab=${tab ?? "sloopy"}`);
        onSearch && onSearch();
      }}
    >
      {() => (
        <Form className="mb-4 w-full">
          <div className="flex items-center rounded-md border border-gray-300 bg-gray-200 p-2">
            <PiMagnifyingGlass className="text-2xl text-gray-400" />
            <Field
              className="ml-2 w-full bg-transparent text-sm font-medium focus:outline-none sm:text-base"
              id="query"
              name="query"
              placeholder="Search for tracks, artists, albums..."
              autoComplete="off"
              autoCorrect="off"
            />
          </div>
        </Form>
      )}
    </Formik>
  );
};
export default SearchInput;
