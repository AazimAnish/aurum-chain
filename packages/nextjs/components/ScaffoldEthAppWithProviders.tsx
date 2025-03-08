"use client";

import React, { useMemo } from "react";
import { AnonAadhaarProvider } from "@anon-aadhaar/react";
import { RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import { Toaster } from "react-hot-toast";
import { ThirdwebProvider } from "thirdweb/react";
import { WagmiProvider } from "wagmi";
import { Footer } from "~~/components/Footer";
import { Header } from "~~/components/Header";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import ChatWidget from "~~/components/ChatWidget";
import { useInitializeNativeCurrencyPrice } from "~~/hooks/scaffold-eth";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";

// Separate the app component to reduce re-renders
const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  useInitializeNativeCurrencyPrice();

  return (
    <>
      <div className="flex flex-col min-h-screen relative z-10">
        <Header />
        <main className="relative flex flex-col flex-1">{children}</main>
        <Footer />
      </div>
      <ChatWidget />
      <Toaster 
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#ffffff',
            color: '#333333',
          },
        }}
      />
    </>
  );
};

// Configure query client with optimized settings
export const ScaffoldEthAppWithProviders = ({ children }: { children: React.ReactNode }) => {
  // Create a new QueryClient instance for each session
  const queryClient = useMemo(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: 60000, // 1 minute
        gcTime: 300000, // 5 minutes (newer name for cacheTime in React Query v5)
        retry: 1, // Only retry once
      },
    },
  }), []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AnonAadhaarProvider
          _useTestAadhaar={false}
          _appName="Aurum Chain"
        >
          <ProgressBar 
            height="3px" 
            color="#ECBD45" 
            options={{ 
              showSpinner: false,
              minimum: 0.25, // Start showing progress at 25%
            }} 
            shallowRouting // Better performance with shallow routing
          />
          <RainbowKitProvider
            avatar={BlockieAvatar}
            theme={lightTheme()}
          >
            <ThirdwebProvider>
              <ScaffoldEthApp>{children}</ScaffoldEthApp>
            </ThirdwebProvider>
          </RainbowKitProvider>
        </AnonAadhaarProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
