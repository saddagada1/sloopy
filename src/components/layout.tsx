import { SideNavbar, Navbar } from "./navbar";
import Head from "next/head";
import { useRouter } from "next/router";
import Script from "next/script";
import EditorProvider from "~/contexts/editor";
import PlayerProvider from "~/contexts/player";
import Header from "./header";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  return (
    <>
      <Head>
        <meta name="description" content="Sloooooooooooooopy" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex h-screen w-screen flex-col gap-2 p-2 font-sans lg:flex-row">
        {router.pathname.includes("editor") ? (
          <EditorProvider>{children}</EditorProvider>
        ) : router.pathname.includes("player") ? (
          <PlayerProvider>{children}</PlayerProvider>
        ) : (
          <>
            <SideNavbar />
            <Navbar />
            <div className="flex flex-1 flex-col gap-2 overflow-hidden">
              <Header />
              {children}
            </div>
          </>
        )}
      </div>
      <Script async src="https://sdk.scdn.co/spotify-player.js" />
    </>
  );
};

export default Layout;
