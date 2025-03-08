"use client";

import { useState } from "react";
import { createWalletClient, http, parseEther } from "viem";
import { hardhat } from "viem/chains";
import { useAccount, useBalance } from "wagmi";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import { useTransactor } from "~~/hooks/scaffold-eth";

// Number of ETH faucet sends to an address
const NUM_OF_ETH = "1";
const FAUCET_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

const localWalletClient = createWalletClient({
  chain: hardhat,
  transport: http(),
});

/**
 * FaucetButton button which lets you grab eth.
 * Only visible when an account is connected and on a local chain.
 */
export const FaucetButton = () => {
  const { address, chain: ConnectedChain, isConnected } = useAccount();

  // Use useBalance directly with watch: false to avoid provider.on errors
  useBalance({
    address,
    chainId: ConnectedChain?.id,
  });

  const [loading, setLoading] = useState(false);

  const faucetTxn = useTransactor(localWalletClient);

  const sendETH = async () => {
    if (!address) return;
    try {
      setLoading(true);
      await faucetTxn({
        account: FAUCET_ADDRESS,
        to: address,
        value: parseEther(NUM_OF_ETH),
      });
      setLoading(false);
    } catch (error) {
      console.error("⚡️ ~ file: FaucetButton.tsx:sendETH ~ error", error);
      setLoading(false);
    }
  };

  // Only render when:
  // 1. User is connected (has an address)
  // 2. We're on the local hardhat chain
  if (!isConnected || !address || ConnectedChain?.id !== hardhat.id) {
    return null;
  }

  return (
    <div className="flex flex-col gap-1 items-center">
      <button
        className={`btn btn-primary btn-sm px-2 rounded-full ${loading ? "loading" : ""}`}
        onClick={sendETH}
        disabled={loading}
      >
        {!loading && <BanknotesIcon className="h-4 w-4" />}
        <span>Faucet</span>
      </button>
    </div>
  );
};
