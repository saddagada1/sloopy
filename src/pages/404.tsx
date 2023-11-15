import type { NextPage } from "next";
import Head from "next/head";
import ErrorView from "~/components/utils/errorView";

const NotFound: NextPage = ({}) => {
  return (
    <>
      <Head>
        <title>Sloopy - 404 Not Found</title>
      </Head>
      <ErrorView />
    </>
  );
};

export default NotFound;
