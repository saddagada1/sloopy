import { Inter, Syne } from "next/font/google";
import Navbar from "./Navbar";
import Head from "next/head";
import { useSession } from "next-auth/react";
import Loading from "./utils/Loading";
import { useRouter } from "next/router";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
});

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { status: sessionStatus } = useSession();
  const router = useRouter();

  return (
    <>
      <Head>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div
        className={`${syne.variable} ${inter.variable} flex min-h-screen flex-col font-sans text-secondary`}
      >
        {!router.pathname.includes("editor/[id]") ? (
          <>
            <Navbar />
            <main className="mt-16 flex flex-1 flex-col">
              {sessionStatus === "loading" ? <Loading /> : children}
            </main>
          </>
        ) : (
          <>{sessionStatus === "loading" ? <Loading /> : children}</>
        )}
      </div>
      <Script async src="https://sdk.scdn.co/spotify-player.js" />
    </>
  );
};

export default Layout;