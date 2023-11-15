import { SideNavbar, Navbar } from "./navbar";
import Head from "next/head";
import { useRouter } from "next/router";
import Script from "next/script";
import EditorProvider from "~/contexts/editor";
import { useEffect, useState } from "react";
import { api } from "~/utils/api";
import { type UpdateSloopInput } from "~/utils/types";
import Link from "next/link";
import PlayerProvider from "~/contexts/player";
import { AnimatePresence } from "framer-motion";
import { useEffectOnce } from "usehooks-ts";
import { toast } from "sonner";
import Header from "./header";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [unsavedData, setUnsavedData] = useState(false);
  const [unsavedSloop, setUnsavedSloop] = useState<UpdateSloopInput | null>(
    null
  );
  const { mutateAsync: saveSloop } = api.sloops.update.useMutation();
  const router = useRouter();

  const handleUnsavedSloop = (discard: boolean) => {
    if (discard) {
      localStorage.removeItem("sloop");
    }
    setUnsavedData(false);
    setUnsavedSloop(null);
  };

  useEffect(() => {
    const sloop = localStorage.getItem("sloop");
    if (sloop) {
      setUnsavedData(true);
      setUnsavedSloop(JSON.parse(sloop) as UpdateSloopInput);
    }
  }, [saveSloop]);

  return (
    <>
      <Head>
        <meta name="description" content="Sloooooooooooooopy" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex h-screen w-screen flex-col gap-2 p-2 font-sans lg:flex-row">
        {/* <AnimatePresence>
          {unsavedData && unsavedSloop && (
            <Modal disabled={true} setVisible={setUnsavedData}>
              <StyledTitle title="Unsaved Changes" />
              <p className="mb-6 font-sans text-sm font-medium sm:text-base">
                There is a sloop with unsaved changes. Would you like to
                continue editing the sloop or discard the changes.
              </p>
              <div className="flex h-14 gap-2 font-display text-base font-bold sm:text-lg">
                <button
                  className="w-full rounded-md border border-red-500 bg-red-100 text-red-500"
                  onClick={() => handleUnsavedSloop(true)}
                >
                  Discard
                </button>
                <Link
                  onClick={() => handleUnsavedSloop(false)}
                  className="flex w-full items-center justify-center rounded-md bg-secondary text-primary"
                  href={`/editor/${unsavedSloop.id}?private=${unsavedSloop.isPrivate}&unsaved=true`}
                >
                  Edit Sloop
                </Link>
              </div>
            </Modal>
          )}
        </AnimatePresence> */}
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
