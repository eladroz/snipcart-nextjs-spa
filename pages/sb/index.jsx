/* eslint-disable @next/next/no-img-element */
import Head from "next/head";
import { withHotContentReload } from "@stackbit/nextjs-hot-content-reload/hotContentReload";

function Home({}) {
  return (
    <>
      <Head>
        <title>Stackbit Demo Page</title>
      </Head>
    </>
  );
}
export default withHotContentReload(Home);

export const getStaticProps = async (context) => {
  return {
    props: {},
  };
};

