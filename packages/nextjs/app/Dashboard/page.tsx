"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useArweave } from "~~/contexts/ArweaveContext";
import { getUserGoldHoldings, GoldRegistrationData } from "~~/services/arweave";

const GoldHoldings = () => {
  const { address } = useAccount();
  const { wallet, walletAddress } = useArweave();
  const [holdings, setHoldings] = useState<GoldRegistrationData[]>([]);
  const [totalTokens, setTotalTokens] = useState<string>("0");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Contract read removed - function not recognized by scaffold  
  // We'll use Arweave data instead

  // Fetch gold holdings from Arweave
  useEffect(() => {
    const fetchHoldings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        let allRegistrations: GoldRegistrationData[] = [];
        let tokenSum = 0;
        
        // Check if we're in development mode
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        // 1. Try to get data from Arweave if wallet is available
        if (walletAddress) {
          try {
            const userHoldings = await getUserGoldHoldings(walletAddress);
            allRegistrations = [...allRegistrations, ...userHoldings.registrations];
            tokenSum += parseInt(userHoldings.totalTokens || '0', 10);
          } catch (err) {
            console.warn("Could not fetch from Arweave:", err);
          }
        }
        
        // 2. Check localStorage for simulated data (using both addresses)
        if (isLocalhost) {
          try {
            const storedData = JSON.parse(localStorage.getItem('arweaveSimulation') || '{}');
            const goldItems: GoldRegistrationData[] = Object.values(storedData);
            
            // Filter items by either Arweave address or blockchain address
            const myItems = goldItems.filter(item => 
              (walletAddress && item.owner === walletAddress) || 
              (address && item.owner === address)
            );
            
            // Add to our holdings
            allRegistrations = [...allRegistrations, ...myItems];
            
            // Sum up token amounts
            myItems.forEach(item => {
              if (item.tokenAmount) {
                tokenSum += parseInt(item.tokenAmount, 10);
              }
            });
            
            console.log("Found", myItems.length, "items in simulated storage");
          } catch (error) {
            console.error("Error loading simulated gold data:", error);
          }
        }
        
        // Remove duplicates (using uniqueIdentifier as key)
        const uniqueMap = new Map();
        allRegistrations.forEach(item => {
          if (item.uniqueIdentifier) {
            uniqueMap.set(item.uniqueIdentifier, item);
          }
        });
        
        const uniqueRegistrations = Array.from(uniqueMap.values());
        
        setHoldings(uniqueRegistrations);
        setTotalTokens(tokenSum.toString());
      } catch (err) {
        console.error("Error fetching holdings:", err);
        setError("Failed to fetch gold holdings");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHoldings();
  }, [walletAddress, address]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6 pb-4 border-b border-gray-100">
            <h1 className="text-3xl font-bold text-center goldman-font text-gray-900">Gold Holdings</h1>
            <p className="text-center text-gray-600 mt-2">View your registered gold and token balance</p>
          </div>
          
          <div className="p-6">
            {/* Token Balance Card */}
            <div className="bg-gradient-to-r from-amber-100 to-yellow-100 rounded-lg p-6 mb-8 shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Gold Token Balance</h2>
                  <p className="text-gray-600 text-sm mt-1">Tokenized representation of your gold</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-amber-700">
                    {totalTokens} <span className="text-xl">GOLD</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Gold Holdings List */}
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Registered Gold Items</h2>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700"></div>
                <p className="mt-2 text-gray-600">Loading your gold holdings...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg text-center">
                {error}
              </div>
            ) : holdings.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <p className="text-gray-600">You don't have any registered gold yet.</p>
                <a href="/Registration" className="mt-4 inline-block px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700">
                  Register Gold
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {holdings.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{item.description || "Gold Item"}</h3>
                        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                          <div>
                            <span className="text-gray-500">Weight:</span> {item.weight}
                          </div>
                          <div>
                            <span className="text-gray-500">Purity:</span> {item.purity}
                          </div>
                          <div>
                            <span className="text-gray-500">Certification Date:</span> {item.certificationDate}
                          </div>
                          <div>
                            <span className="text-gray-500">Mine Location:</span> {item.mineLocation}
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          <span>ID: {item.uniqueIdentifier}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="bg-amber-50 px-3 py-1 rounded-full text-amber-800 font-medium">
                          {item.tokenAmount || "0"} GOLD
                        </div>
                        <a 
                          href={`/Taxation?id=${encodeURIComponent(item.uniqueIdentifier)}`}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm font-medium transition"
                        >
                          Calculate Tax
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoldHoldings; 