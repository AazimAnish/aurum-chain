import "@rainbow-me/rainbowkit/styles.css";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { DotPattern } from "~~/components/ui/DotPattern";
import "~~/styles/globals.css";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "Aurum-Chain - Gold Tracking Platform",
  description: "Blockchain-powered gold tracking and tax management",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white">
        <div className="relative min-h-screen overflow-hidden">
          <DotPattern
            width={24}
            height={24}
            cx={1.5}
            cy={1.5}
            cr={1.25}
            className="text-gray-200/50 z-0"
          />
          <ScaffoldEthAppWithProviders>{children}</ScaffoldEthAppWithProviders>
        </div>
      </body>
    </html>
  );
} 
