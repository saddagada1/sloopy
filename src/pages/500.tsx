import type { NextPage } from "next";
import Head from "next/head";
import ErrorView from "~/components/utils/ErrorView";

const ServerError: NextPage = ({}) => {
  return (
    <>
      <Head>
        <title>Sloopy - 500 Server Error</title>
      </Head>
      <ErrorView
        code="500"
        message="Something went wrong on our end. Please refresh the page and try again. If the problem persists please let us know through one of our contact links. Sorry for any inconvenience."
      />
    </>
  );
};

export default ServerError;
