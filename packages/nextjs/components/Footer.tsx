import React from "react";
import Link from "next/link";
import { hardhat } from "viem/chains";
import { CurrencyDollarIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Faucet } from "~~/components/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { useGlobalState } from "~~/services/store/store";

/**
 * Site footer
 */
export const Footer = () => {
  const nativeCurrencyPrice = useGlobalState(state => state.nativeCurrency.price);
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;

  return (
    <footer className="bg-white border-t border-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-600 text-sm">© 2024 Aurum-Chain. All rights reserved.</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 md:gap-8">
            <div className="flex items-center gap-2 pointer-events-auto">
              {nativeCurrencyPrice > 0 && (
                <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-md text-sm font-medium flex items-center gap-1">
                  <CurrencyDollarIcon className="h-4 w-4" />
                  <span>{nativeCurrencyPrice.toFixed(2)}</span>
                </div>
              )}
              {isLocalNetwork && (
                <>
                  <Faucet />
                  <Link href="/blockexplorer" passHref className="bg-gray-100 text-gray-800 px-3 py-1 rounded-md text-sm font-medium flex items-center gap-1 hover:bg-gray-200 transition-colors">
                    <MagnifyingGlassIcon className="h-4 w-4" />
                    <span>Block Explorer</span>
                  </Link>
                </>
              )}
            </div>
          </div>
          
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-gray-600 hover:text-gray-900 text-sm">Privacy Policy</Link>
            <Link href="/terms" className="text-gray-600 hover:text-gray-900 text-sm">Terms of Service</Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-900 text-sm">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
