import { useState, useEffect } from "react";
import { useActiveAccount } from "thirdweb/react";
import { useAccount } from "wagmi";

/**
 * Hook to check if Thirdweb wallet is in sync with Scaffold-ETH wallet
 */
export const useThirdwebWalletIntegration = () => {
  const [isInSync, setIsInSync] = useState(false);
  
  // Get Thirdweb account
  const thirdwebAccount = useActiveAccount();
  
  // Get wagmi (Scaffold-ETH) connection status
  const { address: wagmiAddress, isConnected: isWagmiConnected } = useAccount();
  
  useEffect(() => {
    // Check if both wallets are connected and have the same address
    if (thirdwebAccount?.address && isWagmiConnected && wagmiAddress) {
      setIsInSync(
        thirdwebAccount.address.toLowerCase() === wagmiAddress.toLowerCase()
      );
    } else {
      setIsInSync(false);
    }
  }, [thirdwebAccount, isWagmiConnected, wagmiAddress]);
  
  return {
    isInSync,
    isConnected: !!thirdwebAccount?.address
  };
}; 