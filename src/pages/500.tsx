import type { NextPage } from "next";
import Head from "next/head";
import ErrorView from "~/components/utils/errorView";

const ServerError: NextPage = ({}) => {
  return (
    <>
      <Head>
        <title>Sloopy - 500 Server Error</title>
      </Head>
      <ErrorView
        code="500"
        message="Something went wrong on our end. Please refresh the page and try again. Sorry for any inconvenience."
      />
    </>
  );
};

export default ServerError;
