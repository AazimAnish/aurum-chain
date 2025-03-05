import "@rainbow-me/rainbowkit/styles.css";
import "~~/styles/globals.css";
import { ThemeProvider } from "~~/components/ThemeProvider";
import { Toaster } from 'react-hot-toast';

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <main className="min-h-screen bg-black">
            {children}
          </main>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
} 
  