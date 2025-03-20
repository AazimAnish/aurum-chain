import "@rainbow-me/rainbowkit/styles.css";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { DotPattern } from "~~/components/ui/DotPattern";
import "~~/styles/globals.css";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";
import { ThemeProvider } from "~~/components/ThemeProvider";

// Default metadata for all routes
export const metadata = getMetadata({
  title: "Aurum-Chain - Gold Tracking Platform",
  description: "Blockchain-powered gold tracking and tax management",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="goldman-font-enabled">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Goldman:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=GFS+Didot&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-white font-sans">
        <ThemeProvider enableSystem>
          <div className="relative min-h-screen overflow-hidden">
            <DotPattern
              width={36}
              height={36}
              cx={1.5}
              cy={1.5}
              cr={1.25}
              className="text-gray-200/50 z-0"
              densityFactor={2.5}
            />
            <ScaffoldEthAppWithProviders>{children}</ScaffoldEthAppWithProviders>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
} 
