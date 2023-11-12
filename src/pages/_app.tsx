import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import Layout from "~/components/layout";
import SpotifyProvider from "~/contexts/Spotify";
import { Toaster } from "sonner";
import { ErrorBoundary } from "react-error-boundary";
import { useRouter } from "next/router";
import { Theme } from "~/components/theme";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const router = useRouter();
  return (
    <SessionProvider refetchOnWindowFocus={false} session={session}>
      <ErrorBoundary
        fallback={null}
        onError={() => {
          void router.replace("/500");
        }}
      >
        <SpotifyProvider>
          <Theme
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <Toaster
              richColors
              toastOptions={{
                className: "font-mono",
              }}
              position="top-center"
            />
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </Theme>
        </SpotifyProvider>
      </ErrorBoundary>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
