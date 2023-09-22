import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import Layout from "~/components/Layout";
import SpotifyProvider from "~/contexts/Spotify";
import { Toaster } from "react-hot-toast";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider refetchOnWindowFocus={false} session={session}>
      <SpotifyProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            className: "font-mono font-medium text-center",
            style: {
              border: "1px",
              borderStyle: "solid",
              borderColor: "#eab308",
              borderRadius: "6px",
              backgroundColor: "#fef9c3",
              color: "#eab308",
              minWidth: "fit-content",
            },
            iconTheme: {
              primary: "#eab308",
              secondary: "#fef9c3",
            },
            error: {
              style: {
                border: "1px",
                borderStyle: "solid",
                borderColor: "#ef4444",
                borderRadius: "6px",
                backgroundColor: "#fee2e2",
                color: "#ef4444",
                minWidth: "fit-content",
              },
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fee2e2",
              },
            },
            success: {
              style: {
                border: "1px",
                borderStyle: "solid",
                borderColor: "#22c55e",
                borderRadius: "6px",
                backgroundColor: "#ecfccb",
                color: "#22c55e",
                minWidth: "fit-content",
              },
              iconTheme: {
                primary: "#22c55e",
                secondary: "#ecfccb",
              },
            },
          }}
        />
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </SpotifyProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
