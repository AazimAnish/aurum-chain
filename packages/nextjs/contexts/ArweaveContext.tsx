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

  // Load wallet from localStorage on component mount
  useEffect(() => {
    loadWalletFromStorage();
  }, []);

  const generateNewWallet = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Generate a new wallet
      const newWallet = await generateWallet();
      
      // Get the wallet address
      const address = await getWalletAddress(newWallet);
      
      // Save wallet to localStorage
      localStorage.setItem('arweaveWallet', JSON.stringify(newWallet));
      
      setWallet(newWallet);
      setWalletAddress(address);
    } catch (err) {
      setError('Failed to generate wallet');
      console.error('Error generating wallet:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadWalletFromStorage = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get wallet from localStorage
      const storedWallet = localStorage.getItem('arweaveWallet');
      
      if (storedWallet) {
        const parsedWallet = JSON.parse(storedWallet);
        
        // Get the wallet address
        const address = await getWalletAddress(parsedWallet);
        
        setWallet(parsedWallet);
        setWalletAddress(address);
      }
    } catch (err) {
      setError('Failed to load wallet');
      console.error('Error loading wallet:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearWallet = (): void => {
    localStorage.removeItem('arweaveWallet');
    setWallet(null);
    setWalletAddress(null);
  };

  const value = {
    wallet,
    walletAddress,
    isLoading,
    error,
    generateNewWallet,
    loadWalletFromStorage,
    clearWallet,
  };

  return (
    <ArweaveContext.Provider value={value}>
      {children}
    </ArweaveContext.Provider>
  );
}; 