import { SideNavbar, Navbar } from "./navbar";
import Head from "next/head";
import { useRouter } from "next/router";
import Script from "next/script";
import EditorProvider from "~/contexts/editor";
import { useEffect, useState } from "react";
import { api } from "~/utils/api";
import { type UpdateSloopInput } from "~/utils/types";
import PlayerProvider from "~/contexts/player";
import Header from "./header";
import UnsavedChangesModal from "./sloops/unsavedChangesModal";

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
        {unsavedData && unsavedSloop && (
          <UnsavedChangesModal
            message={`Your sloop (${unsavedSloop.name}) has unsaved changes. Would you like to
                continue editing the sloop or discard the changes.`}
            onExit={() => handleUnsavedSloop(true)}
            onSave={() => {
              handleUnsavedSloop(false);
              void router.push(
                `/editor/${unsavedSloop.id}?private=${unsavedSloop.isPrivate}&unsaved=true`
              );
            }}
            exitLabel="Discard"
            saveLabel="Edit Sloop"
          />
        )}
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
