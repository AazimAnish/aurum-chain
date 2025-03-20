"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useAccount } from "wagmi";
import { useArweave } from "~~/contexts/ArweaveContext";
import { getUserGoldHoldings, GoldRegistrationData } from "~~/services/arweave";

// Create a cache to store fetched data
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds
interface CachedData {
  data: GoldRegistrationData[];
  tokens: string;
  timestamp: number;
}

const GoldHoldings = () => {
  const { address } = useAccount();
  const { wallet, walletAddress, reconnectWallet } = useArweave();
  const [holdings, setHoldings] = useState<GoldRegistrationData[]>([]);
  const [totalTokens, setTotalTokens] = useState<string>("0");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<number>(0);
  const [retryCount, setRetryCount] = useState<number>(0);
  const MAX_RETRIES = 3;
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  // Cache key based on addresses
  const cacheKey = useMemo(() => 
    `goldHoldings_${address || ''}_${walletAddress || ''}`,
    [address, walletAddress]
  );

  // Check if cached data exists and is valid
  const getValidCachedData = useCallback((): CachedData | null => {
    try {
      const cachedData = localStorage.getItem(cacheKey);
      if (!cachedData) return null;
      
      const parsedData = JSON.parse(cachedData) as CachedData;
      const now = Date.now();
      
      // Check if cache is still valid
      if (now - parsedData.timestamp < CACHE_EXPIRY) {
        return parsedData;
      }
      
      return null;
    } catch (err) {
      console.warn('Error reading from cache:', err);
      return null;
    }
  }, [cacheKey]);

  // Cache the fetched data
  const cacheData = useCallback((data: GoldRegistrationData[], tokens: string) => {
    try {
      const cacheData: CachedData = {
        data,
        tokens,
        timestamp: Date.now()
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (err) {
      console.warn('Error caching data:', err);
    }
  }, [cacheKey]);

  // Log debug information for the user
  const addDebugInfo = useCallback((message: string) => {
    console.log(message);
    setDebugInfo(prev => `${prev ? prev + '\n' : ''}${message}`);
  }, []);

  // Clear debug info
  const clearDebugInfo = useCallback(() => {
    setDebugInfo(null);
  }, []);

  // Improved fetch function with better error handling
  const fetchHoldings = useCallback(async (forceRefresh = false) => {
    // If not forcing refresh, try to use cached data first
    if (!forceRefresh) {
      const cachedData = getValidCachedData();
      if (cachedData) {
        console.log("Using cached gold holdings data");
        setHoldings(cachedData.data);
        setTotalTokens(cachedData.tokens);
        setIsLoading(false);
        setLastRefreshed(cachedData.timestamp);
        return;
      }
    }
    
      try {
        setIsLoading(true);
        setError(null);
      clearDebugInfo();
        
        let allRegistrations: GoldRegistrationData[] = [];
        let tokenSum = 0;
      let fetchSuccessful = false;
        
        // Check if we're in development mode
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      addDebugInfo(`Starting fetch. Wallet address: ${walletAddress ? 'Available' : 'Unavailable'}, Blockchain address: ${address ? 'Available' : 'Unavailable'}`);
        
        // 1. Try to get data from Arweave if wallet is available
        if (walletAddress) {
          try {
          addDebugInfo("Attempting to fetch from Arweave...");
            const userHoldings = await getUserGoldHoldings(walletAddress);
          addDebugInfo(`Found ${userHoldings.registrations.length} item(s) in Arweave with ${userHoldings.totalTokens} tokens`);
          
            allRegistrations = [...allRegistrations, ...userHoldings.registrations];
            tokenSum += parseInt(userHoldings.totalTokens || '0', 10);
          fetchSuccessful = true;
          } catch (err) {
            console.warn("Could not fetch from Arweave:", err);
          addDebugInfo(`Arweave fetch error: ${err instanceof Error ? err.message : 'Unknown error'}`);
          
          // Try to reconnect wallet if fetch failed
          if (retryCount < MAX_RETRIES) {
            addDebugInfo(`Attempting wallet reconnection (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
            setRetryCount(prevCount => prevCount + 1);
            await reconnectWallet();
            // Don't throw error yet, try local storage first
          }
        }
      } else {
        addDebugInfo("No Arweave wallet address available. Skipping Arweave fetch.");
        }
        
        // 2. Check localStorage for simulated data (using both addresses)
        if (isLocalhost) {
          try {
          addDebugInfo("Checking localStorage for simulated data...");
            const storedData = JSON.parse(localStorage.getItem('arweaveSimulation') || '{}');
            const goldItems: GoldRegistrationData[] = Object.values(storedData);
            
          addDebugInfo(`Found ${goldItems.length} total items in simulated storage`);
          
          // Filter items by either Arweave address or blockchain address (more inclusive)
          // IMPORTANT: This is a more inclusive approach to make sure we don't miss items
            const myItems = goldItems.filter(item => 
              (walletAddress && item.owner === walletAddress) || 
            (address && item.owner === address) ||
            // Include items with no specific owner for testing
            (!item.owner || item.owner === "") ||
            // Also include items where owner is a case-insensitive match
            (walletAddress && typeof item.owner === 'string' && item.owner.toLowerCase() === walletAddress.toLowerCase()) ||
            (address && typeof item.owner === 'string' && item.owner.toLowerCase() === address.toLowerCase())
          );
          
          addDebugInfo(`Filtered to ${myItems.length} item(s) in simulated storage that match current addresses`);
          
          // Calculate token sum with proper error handling
          let localTokenSum = 0;
            myItems.forEach(item => {
              if (item.tokenAmount) {
              try {
                const tokens = parseInt(item.tokenAmount, 10);
                if (!isNaN(tokens)) {
                  localTokenSum += tokens;
                  addDebugInfo(`Item ${item.uniqueIdentifier}: ${tokens} tokens`);
                } else {
                  // Log invalid token amounts for debugging
                  addDebugInfo(`Item ${item.uniqueIdentifier} has invalid token amount: ${item.tokenAmount}`);
                }
              } catch (e) {
                console.warn("Invalid token amount:", item.tokenAmount);
                addDebugInfo(`Error parsing token amount for ${item.uniqueIdentifier}: ${e instanceof Error ? e.message : 'Unknown error'}`);
              }
            } else {
              // If no token amount is specified, try to estimate from weight
              if (item.weight) {
                try {
                  const weight = parseFloat(item.weight);
                  if (!isNaN(weight)) {
                    // Use the same calculation logic as in registration
                    const estimatedTokens = Math.floor(weight);
                    localTokenSum += estimatedTokens;
                    // Update the item with estimated tokens
                    item.tokenAmount = estimatedTokens.toString();
                    addDebugInfo(`Item ${item.uniqueIdentifier}: Estimated ${estimatedTokens} tokens from weight ${item.weight}`);
                  }
                } catch (e) {
                  console.warn("Error estimating tokens from weight:", e);
                }
              }
            }
          });
          
          addDebugInfo(`Total tokens from simulated storage: ${localTokenSum}`);
          
          // Add to our holdings
          allRegistrations = [...allRegistrations, ...myItems];
          tokenSum += localTokenSum;
          
          fetchSuccessful = fetchSuccessful || myItems.length > 0;
          } catch (error) {
            console.error("Error loading simulated gold data:", error);
          addDebugInfo(`Error loading simulated data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        }
        
        // Remove duplicates (using uniqueIdentifier as key)
        const uniqueMap = new Map();
      let duplicateCount = 0;
      
        allRegistrations.forEach(item => {
          if (item.uniqueIdentifier) {
          if (uniqueMap.has(item.uniqueIdentifier)) {
            duplicateCount++;
            // For duplicates, take the one with more information (prefer one with tokenAmount)
            const existingItem = uniqueMap.get(item.uniqueIdentifier);
            if ((!existingItem.tokenAmount || existingItem.tokenAmount === '0') && item.tokenAmount) {
              uniqueMap.set(item.uniqueIdentifier, item);
              addDebugInfo(`Replaced duplicate item ${item.uniqueIdentifier} with version containing token amount`);
            }
          } else {
            uniqueMap.set(item.uniqueIdentifier, item);
          }
        } else {
          // If no uniqueIdentifier, use a timestamp or other unique property as fallback
          const fallbackId = item.timestamp ? `fallback-${item.timestamp}-${Math.random()}` : `fallback-${Math.random()}`;
          uniqueMap.set(fallbackId, item);
          addDebugInfo(`Item without uniqueIdentifier assigned fallback ID: ${fallbackId}`);
          }
        });
        
        const uniqueRegistrations = Array.from(uniqueMap.values());
      addDebugInfo(`Removed ${duplicateCount} duplicate items. Final count: ${uniqueRegistrations.length} items`);
      
      // Ensure all items have a tokenAmount, and recalculate total
      let recalculatedTokenSum = 0;
      uniqueRegistrations.forEach(item => {
        if (item.tokenAmount) {
          try {
            const tokens = parseInt(item.tokenAmount, 10);
            if (!isNaN(tokens)) {
              recalculatedTokenSum += tokens;
            } else {
              addDebugInfo(`Skipping invalid token amount "${item.tokenAmount}" for item ${item.uniqueIdentifier}`);
            }
          } catch (e) {
            // Skip invalid token amounts
            addDebugInfo(`Error parsing token amount: ${e instanceof Error ? e.message : 'Unknown error'}`);
          }
        } else if (item.weight) {
          // If token amount is missing but weight is available, estimate tokens
          try {
            const weight = parseFloat(item.weight);
            if (!isNaN(weight)) {
              const estimatedTokens = Math.floor(weight);
              item.tokenAmount = estimatedTokens.toString();
              recalculatedTokenSum += estimatedTokens;
              addDebugInfo(`Added estimated ${estimatedTokens} tokens for item ${item.uniqueIdentifier} based on weight ${weight}`);
            }
          } catch (e) {
            addDebugInfo(`Error estimating tokens from weight: ${e instanceof Error ? e.message : 'Unknown error'}`);
          }
        }
      });
      
      // Use recalculated sum if it's different (more accurate)
      if (recalculatedTokenSum !== tokenSum) {
        addDebugInfo(`Token sum adjusted from ${tokenSum} to ${recalculatedTokenSum} after duplicate removal and estimation`);
        tokenSum = recalculatedTokenSum;
      }
      
      // Ensure we sort items by timestamp (newest first) to show recent registrations at the top
      uniqueRegistrations.sort((a, b) => {
        const timeA = a.timestamp || 0;
        const timeB = b.timestamp || 0;
        return timeB - timeA;
      });
        
        setHoldings(uniqueRegistrations);
        setTotalTokens(tokenSum.toString());
      
      // Cache the data if fetch was successful
      if (fetchSuccessful) {
        cacheData(uniqueRegistrations, tokenSum.toString());
        setRetryCount(0); // Reset retry counter on success
      }
      
      setLastRefreshed(Date.now());
      } catch (err) {
        console.error("Error fetching holdings:", err);
        setError("Failed to fetch gold holdings");
      addDebugInfo(`Fatal error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      
      // Try to use cached data as fallback
      const cachedData = getValidCachedData();
      if (cachedData) {
        console.log("Using cached data as fallback after error");
        setHoldings(cachedData.data);
        setTotalTokens(cachedData.tokens);
        setLastRefreshed(cachedData.timestamp);
      }
      } finally {
        setIsLoading(false);
      }
  }, [walletAddress, address, reconnectWallet, retryCount, getValidCachedData, cacheData, addDebugInfo, clearDebugInfo]);
    
  // Fetch gold holdings from Arweave
  const initialFetchRef = useRef(false);
  
  useEffect(() => {
    // Always fetch data on component mount
    fetchHoldings();
    
    // Set up refresh interval (every 2 minutes)
    const refreshInterval = setInterval(() => {
      fetchHoldings(true); // Force refresh
    }, 2 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, []); // Empty dependency array ensures this only runs once on mount

  // Function to manually refresh data
  const handleRefresh = () => {
    fetchHoldings(true);
  };

  // Function to clear local storage data (for testing)
  const handleClearLocalData = () => {
    try {
      localStorage.removeItem('arweaveSimulation');
      localStorage.removeItem(cacheKey);
      addDebugInfo("Local data cleared. Refreshing...");
      setTimeout(() => fetchHoldings(true), 500);
    } catch (e) {
      addDebugInfo(`Error clearing data: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  };

  // Format timestamp to readable format
  const formatLastRefreshed = () => {
    if (!lastRefreshed) return "Never";
    const date = new Date(lastRefreshed);
    return date.toLocaleTimeString();
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6 pb-4 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold goldman-font text-gray-900">Gold Holdings</h1>
              <div className="flex gap-2">
                <button 
                  onClick={handleRefresh} 
                  disabled={isLoading}
                  className="px-3 py-1 bg-amber-100 text-amber-800 rounded text-sm hover:bg-amber-200 transition flex items-center gap-1"
                >
                  {isLoading ? (
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-amber-700"></span>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                  {isLoading ? "Refreshing..." : "Refresh"}
                </button>
                <button 
                  onClick={handleClearLocalData}
                  disabled={isLoading}
                  className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200 transition"
                >
                  Clear Cache
                </button>
              </div>
            </div>
            <p className="text-center text-gray-600 mt-2">View your registered gold and token balance</p>
            <p className="text-xs text-gray-500 text-center mt-1">Last updated: {formatLastRefreshed()}</p>
          </div>
          
          <div className="p-6 dashboard-content">
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
            
            {/* Debug Info (if available) */}
            {debugInfo && (
              <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-6 overflow-auto max-h-40">
                <div className="flex justify-between">
                  <h3 className="text-sm font-medium text-gray-700">Debug Information</h3>
                  <button 
                    onClick={clearDebugInfo}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Clear
                  </button>
                </div>
                <pre className="text-xs text-gray-600 mt-2 whitespace-pre-wrap">{debugInfo}</pre>
              </div>
            )}
            
            {/* Gold Holdings List */}
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Registered Gold Items</h2>
            
            {isLoading && !holdings.length ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700"></div>
                <p className="mt-2 text-gray-600">Loading your gold holdings...</p>
              </div>
            ) : error && !holdings.length ? (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg text-center">
                <p>{error}</p>
                <button 
                  onClick={handleRefresh}
                  className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200 transition"
                >
                  Try Again
                </button>
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
                      <div className="flex gap-4">
                        {/* Image display */}
                        {item.imageDataUrl ? (
                          <div className="w-24 h-24 flex-shrink-0 rounded-md overflow-hidden border border-gray-200">
                            <img 
                              src={item.imageDataUrl} 
                              alt={item.description || "Gold item"} 
                              className="w-full h-full object-cover"
                              loading="lazy" // Add lazy loading
                            />
                          </div>
                        ) : (
                          <div className="w-24 h-24 flex-shrink-0 bg-amber-50 rounded-md flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </div>
                        )}
                        
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
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="bg-amber-50 px-3 py-1 rounded-full text-amber-800 font-medium">
                          {item.tokenAmount || "0"} GOLD
                        </div>
                        <a 
                          href={`/Taxation?id=${encodeURIComponent(item.uniqueIdentifier || '')}`}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm font-medium transition"
                          onClick={(e) => {
                            // Make sure the ID is valid before navigating
                            if (!item.uniqueIdentifier) {
                              e.preventDefault();
                              alert("This gold item doesn't have a valid ID for taxation calculation.");
                            } else {
                              // Log that we're navigating to taxation
                              console.log("Navigating to taxation page with ID:", item.uniqueIdentifier);
                            }
                          }}
                        >
                          Calculate Tax
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Show a loading indicator if refreshing with existing data */}
            {isLoading && holdings.length > 0 && (
              <div className="mt-4 text-center text-sm text-gray-600">
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-amber-700 mr-2"></span>
                Refreshing data...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoldHoldings; 