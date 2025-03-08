import { useEffect, useState } from "react";
import { ConnectButton } from "thirdweb/react";
import { useActiveAccount } from "thirdweb/react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { accountAbstraction, client } from "~~/app/constants";
import { FaucetButton } from "~~/components/scaffold-eth/FaucetButton";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth/RainbowKitCustomConnectButton";
import { useThirdwebWalletIntegration } from "~~/services/web3/thirdwebIntegration";

/**
 * Component that integrates Thirdweb's ConnectButton with Scaffold-ETH's wallet system.
 * When a Thirdweb wallet connects, it passes the address to Scaffold-ETH.
 */
export const ThirdwebScaffoldConnector = () => {
  const [connectingToScaffold, setConnectingToScaffold] = useState(false);
  const [showFallbackButton, setShowFallbackButton] = useState(false);
  
  // Get Thirdweb account
  const thirdwebAccount = useActiveAccount();
  
  // Get wagmi (Scaffold-ETH) connection status
  const { address: wagmiAddress, isConnected: isWagmiConnected } = useAccount();
  const { connect: wagmiConnect, connectors } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  
  // Integration status from our hook
  const { isInSync } = useThirdwebWalletIntegration();

  // If Thirdweb connected but Scaffold-ETH isn't, try to sync them
  useEffect(() => {
    const syncToScaffold = async () => {
      if (thirdwebAccount?.address && !isWagmiConnected && !connectingToScaffold) {
        try {
          setConnectingToScaffold(true);
          // Find the injected connector (usually the first one)
          const injectedConnector = connectors[0];
          if (injectedConnector) {
            console.log("🔄 Synchronizing Thirdweb account to Scaffold-ETH:", thirdwebAccount.address);
            await wagmiConnect({ connector: injectedConnector });
          }
        } catch (error) {
          console.error("Failed to sync Thirdweb account with Scaffold-ETH:", error);
          // If we can't connect via injected, show the normal RainbowKit button as fallback
          setShowFallbackButton(true);
        } finally {
          setConnectingToScaffold(false);
        }
      }
    };

    syncToScaffold();
  }, [thirdwebAccount, isWagmiConnected, wagmiConnect, connectors, connectingToScaffold]);

  // If Scaffold-ETH connected but Thirdweb isn't, or addresses don't match, disconnect Scaffold-ETH
  useEffect(() => {
    const handleMismatch = async () => {
      if (isWagmiConnected && wagmiAddress && 
          (!thirdwebAccount?.address || 
           wagmiAddress.toLowerCase() !== thirdwebAccount.address.toLowerCase())) {
        console.log("⚠️ Wallet mismatch detected, disconnecting Scaffold-ETH wallet");
        await wagmiDisconnect();
      }
    };

    handleMismatch();
  }, [thirdwebAccount, isWagmiConnected, wagmiAddress, wagmiDisconnect]);

  return (
    <div className="flex items-center gap-2">
      {/* Thirdweb ConnectButton for account abstraction */}
      <ConnectButton 
        client={client}
        accountAbstraction={accountAbstraction}
      />
      
      {/* Show Scaffold-ETH connect button as fallback if needed */}
      {showFallbackButton && !isInSync && (
        <div className="ml-2">
          <RainbowKitCustomConnectButton />
        </div>
      )}
      
      {/* Always show FaucetButton for funding the wallet */}
      <FaucetButton />
    </div>
  );
}; 