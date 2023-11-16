import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import Layout from "~/components/layout";
import SpotifyProvider from "~/contexts/spotify";
import { Toaster } from "sonner";
import { ErrorBoundary } from "react-error-boundary";
import { useRouter } from "next/router";
import { Theme } from "~/components/theme";
import { Inter, Syne, JetBrains_Mono } from "next/font/google";
const display = Syne({
  subsets: ["latin"],
  variable: "--font-display",
});
const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const router = useRouter();
  return (
    <>
      <style
        jsx
        global
      >{`:root {--font-display: ${display.style.fontFamily}; --font-sans: ${sans.style.fontFamily}; --font-mono: ${mono.style.fontFamily}}}`}</style>
      <SessionProvider refetchOnWindowFocus={false} session={session}>
        <ErrorBoundary
          fallback={null}
          onError={() => {
            void router.replace("/500");
          }}
        >
          <Toaster
            richColors
            toastOptions={{
              className: "mono",
            }}
            position="top-center"
          />
          <SpotifyProvider>
            <Theme
              attribute="class"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange
            >
              <Layout>
                <Component {...pageProps} />
              </Layout>
            </Theme>
          </SpotifyProvider>
        </ErrorBoundary>
      </SessionProvider>
    </>
  );
};

export default api.withTRPC(MyApp);
