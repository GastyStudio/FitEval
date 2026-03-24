import "./globals.css";
import { Inter, Space_Grotesk } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-primary",
});

export const metadata = {
  title: "FitEval",
  description: "No hay excusas, hay datos.",
  manifest: "/manifest.webmanifest",
  themeColor: "#FF6B1A",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FitEval",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={spaceGrotesk.variable}>
      <head>
        <link rel="apple-touch-icon" href="/icons/fiteval-logo192.png" />
      </head>
      <body style={{ margin: 0, background: "#0A0A0A" }}>
        {children}
      </body>
    </html>
  );
}