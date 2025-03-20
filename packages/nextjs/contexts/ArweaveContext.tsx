"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { generateWallet, getWalletAddress } from '../services/arweave';

interface ArweaveContextType {
  wallet: any | null;
  walletAddress: string | null;
  isLoading: boolean;
  error: string | null;
  generateNewWallet: () => Promise<void>;
  loadWalletFromStorage: () => Promise<void>;
  clearWallet: () => void;
  reconnectWallet: () => Promise<void>;
}

const ArweaveContext = createContext<ArweaveContextType | undefined>(undefined);

export const useArweave = (): ArweaveContextType => {
  const context = useContext(ArweaveContext);
  if (!context) {
    throw new Error('useArweave must be used within an ArweaveProvider');
  }
  return context;
};

interface ArweaveProviderProps {
  children: ReactNode;
}

export const ArweaveProvider: React.FC<ArweaveProviderProps> = ({ children }) => {
  const [wallet, setWallet] = useState<any | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState<number>(0);
  const maxReconnectAttempts = 3;

  // Load wallet from localStorage on component mount
  useEffect(() => {
    const initialLoad = async () => {
      await loadWalletFromStorage();
    };
    
    initialLoad();
    
    // Set up periodic wallet check - only do this once the component is mounted
    const checkInterval = setInterval(() => {
      if (wallet && !walletAddress) {
        console.log("Wallet exists but address is missing, attempting reconnection...");
        reconnectWallet();
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(checkInterval);
  }, []); // Empty dependency array - only run on mount and unmount

  const generateNewWallet = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Generate a new wallet
      const newWallet = await generateWallet();
      
      // Get the wallet address
      const address = await getWalletAddress(newWallet);
      
      // Save wallet to localStorage with timestamp
      const walletData = {
        wallet: newWallet,
        timestamp: Date.now()
      };
      localStorage.setItem('arweaveWallet', JSON.stringify(walletData));
      
      setWallet(newWallet);
      setWalletAddress(address);
      setReconnectAttempts(0); // Reset reconnect attempts
    } catch (err) {
      console.error("Error generating wallet:", err);
      setError('Failed to generate wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const loadWalletFromStorage = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get wallet from localStorage
      const storedWalletData = localStorage.getItem('arweaveWallet');
      
      if (storedWalletData) {
        const parsedData = JSON.parse(storedWalletData);
        const parsedWallet = parsedData.wallet;
        
        if (!parsedWallet) {
          console.warn("Invalid wallet data in localStorage");
          setError("Invalid wallet data");
          return;
        }
        
        // Check if wallet data is expired (older than 24 hours)
        const timestamp = parsedData.timestamp || 0;
        const now = Date.now();
        const isExpired = now - timestamp > 24 * 60 * 60 * 1000; // 24 hours
        
        if (isExpired) {
          console.log("Wallet data expired, generating new wallet");
          await generateNewWallet();
          return;
        }
        
        try {
          // Get the wallet address
          const address = await getWalletAddress(parsedWallet);
          
          setWallet(parsedWallet);
          setWalletAddress(address);
          setReconnectAttempts(0); // Reset reconnect attempts
        } catch (addressError) {
          console.error("Error getting wallet address:", addressError);
          setError('Failed to load wallet address');
          
          // If address retrieval fails, try to regenerate
          if (reconnectAttempts < maxReconnectAttempts) {
            console.log("Attempting to regenerate wallet");
            await generateNewWallet();
          }
        }
      } else {
        console.log("No wallet found in localStorage");
      }
    } catch (err) {
      console.error('Error loading wallet:', err);
      setError('Failed to load wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const reconnectWallet = async (): Promise<void> => {
    if (reconnectAttempts >= maxReconnectAttempts) {
      console.log("Max reconnect attempts reached, clearing wallet");
      clearWallet();
      return;
    }
    
    setReconnectAttempts(prev => prev + 1);
    console.log(`Reconnect attempt ${reconnectAttempts + 1}/${maxReconnectAttempts}`);
    
    try {
      setIsLoading(true);
      
      // Try to get the address from the current wallet
      if (wallet) {
        try {
          // First try to get address directly
          const address = await getWalletAddress(wallet);
          setWalletAddress(address);
          console.log("Wallet reconnected successfully");
          
          // Update wallet data timestamp to avoid expiration issues
          const walletData = {
            wallet: wallet,
            timestamp: Date.now()
          };
          localStorage.setItem('arweaveWallet', JSON.stringify(walletData));
          
          return;
        } catch (e) {
          console.error("Failed to reconnect with current wallet, attempting recovery:", e);
          
          // Try loading from localStorage directly as a recovery method
          try {
            const storedWalletData = localStorage.getItem('arweaveWallet');
            
            if (storedWalletData) {
              const parsedData = JSON.parse(storedWalletData);
              const parsedWallet = parsedData.wallet;
              
              if (parsedWallet) {
                const address = await getWalletAddress(parsedWallet);
                setWallet(parsedWallet);
                setWalletAddress(address);
                console.log("Wallet recovered from storage successfully");
                
                // Update timestamp
                const updatedWalletData = {
                  wallet: parsedWallet,
                  timestamp: Date.now()
                };
                localStorage.setItem('arweaveWallet', JSON.stringify(updatedWalletData));
                
                return;
              }
            }
          } catch (loadError) {
            console.error("Failed to recover wallet from storage:", loadError);
          }
        }
      }
      
      // If everything else fails, generate a new wallet
      console.log("Creating new wallet as reconnection failed");
      await generateNewWallet();
      
    } catch (err) {
      console.error("Reconnection failed:", err);
      setError('Failed to reconnect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const clearWallet = (): void => {
    localStorage.removeItem('arweaveWallet');
    setWallet(null);
    setWalletAddress(null);
    setReconnectAttempts(0);
  };

  const value = {
    wallet,
    walletAddress,
    isLoading,
    error,
    generateNewWallet,
    loadWalletFromStorage,
    clearWallet,
    reconnectWallet,
  };

  return (
    <ArweaveContext.Provider value={value}>
      {children}
    </ArweaveContext.Provider>
  );
}; 