"use client";

import React from "react";
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
import { useInitializeNativeCurrencyPrice } from "~~/hooks/scaffold-eth";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  useInitializeNativeCurrencyPrice();

  return (
    <>
      <div className="flex flex-col min-h-screen relative z-10">
        <Header />
        <main className="relative flex flex-col flex-1">{children}</main>
        <Footer />
      </div>
      <Toaster />
    </>
  );
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export const ScaffoldEthAppWithProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AnonAadhaarProvider
          _useTestAadhaar={false}
          _appName="Aurum Chain"
        >
          <ProgressBar height="3px" color="#ECBD45" />
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
