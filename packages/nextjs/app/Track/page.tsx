"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "~~/~/components/ui/button";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { GoldRegistrationData } from "~~/services/arweave";
import { useArweave } from "~~/contexts/ArweaveContext";
import { useRouter } from "next/navigation";

// Define owner interface
interface OwnershipRecord {
  address: string;
  date: string;
}

interface GoldDetails {
  uniqueIdentifier: string;
  weight: string;
  purity: string;
  description: string;
  certificationDetails: string;
  certificationDate: string;
  mineLocation: string;
  parentGoldId: string;
  hasParentGoldId: boolean;
  imageDataUrl?: string;
  owner?: string;
  owners?: OwnershipRecord[]; // Add owners array to track ownership history
}

const GoldSearch = () => {
  const [searchId, setSearchId] = useState<string>("");
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [matchedGoldDetails, setMatchedGoldDetails] = useState<GoldDetails | null>(null);
  const [localStorageGold, setLocalStorageGold] = useState<GoldRegistrationData[]>([]);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [newOwnerAddress, setNewOwnerAddress] = useState("");
  const [transferDate, setTransferDate] = useState("");
  const [showOwnerHistory, setShowOwnerHistory] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [transferSuccess, setTransferSuccess] = useState<string | null>(null);
  
  const { walletAddress } = useArweave();
  const router = useRouter();

  const {
    data: allGoldDetails,
    isLoading,
    error,
    refetch
  } = useScaffoldReadContract({
    contractName: "GoldLedger",
    functionName: "getAllGoldDetails",
  });

  // Load simulated storage data
  useEffect(() => {
    // Check if we're in development mode
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocalhost) {
      try {
        const storedData = JSON.parse(localStorage.getItem('arweaveSimulation') || '{}');
        const goldItems: GoldRegistrationData[] = Object.values(storedData);
        setLocalStorageGold(goldItems);
        console.log("Loaded simulated gold data:", goldItems.length, "items");
      } catch (error) {
        console.error("Error loading simulated gold data:", error);
      }
    }
  }, []);

  useEffect(() => {
    // Extract gold ID from URL if present
    const urlParams = new URLSearchParams(window.location.search);
    const idFromUrl = urlParams.get("id");
    if (idFromUrl) {
      console.log("Loading gold data for ID from URL:", idFromUrl);
      setSearchId(idFromUrl);
      setSearchPerformed(true);
    }
  }, []);

  // Load fresh data when search is performed
  const performSearch = useCallback(() => {
    if (!searchId) return;
    
    console.log("Performing search for ID:", searchId);
    
    // Force refresh from localStorage first to ensure we have the latest data
    try {
      const storedData = JSON.parse(localStorage.getItem('arweaveSimulation') || '{}');
      const goldItems: GoldRegistrationData[] = Object.values(storedData);
      console.log("Reloaded simulated gold data for search:", goldItems.length, "items");
      setLocalStorageGold(goldItems);
    } catch (error) {
      console.error("Error refreshing gold data from localStorage:", error);
    }
    
    setSearchPerformed(true);
  }, [searchId]);

  const handleSearch = () => {
    if (searchId) {
      performSearch();
    }
  };

  // Update when search parameters change
  useEffect(() => {
    if (searchPerformed) {
      performSearch();
    }
  }, [searchPerformed, performSearch]);

  useEffect(() => {
    if (searchPerformed) {
      // First, search in blockchain data
      if (allGoldDetails) {
        const foundGold = allGoldDetails.find((gold: GoldDetails) => 
          gold.uniqueIdentifier === searchId || 
          gold.uniqueIdentifier.toLowerCase() === searchId.toLowerCase()
        );
        
        if (foundGold) {
          setMatchedGoldDetails(foundGold);
          return;
        }
      }
      
      // If not found and we have local storage data, search there
      if (localStorageGold.length > 0) {
        const foundLocalGold = localStorageGold.find(gold => 
          gold.uniqueIdentifier === searchId || 
          (typeof gold.uniqueIdentifier === 'string' && 
           gold.uniqueIdentifier.toLowerCase() === searchId.toLowerCase())
        );
        
        if (foundLocalGold) {
          console.log("Found local gold item:", foundLocalGold);
          
          // Convert to GoldDetails format
          const localGoldDetails: GoldDetails = {
            uniqueIdentifier: foundLocalGold.uniqueIdentifier,
            weight: foundLocalGold.weight,
            purity: foundLocalGold.purity,
            description: foundLocalGold.description,
            certificationDetails: foundLocalGold.certificationDetails,
            certificationDate: foundLocalGold.certificationDate,
            mineLocation: foundLocalGold.mineLocation,
            parentGoldId: foundLocalGold.parentGoldId || "",
            hasParentGoldId: !!foundLocalGold.parentGoldId,
            imageDataUrl: foundLocalGold.imageDataUrl,
            owner: foundLocalGold.owner,
            owners: foundLocalGold.owners || []
          };
          
          // If no owners array exists, create one with the current owner if available
          if (!localGoldDetails.owners || localGoldDetails.owners.length === 0) {
            console.log("Creating owners array with burner wallet address:", walletAddress);
            localGoldDetails.owners = [{
              address: walletAddress || "Unknown",
              date: foundLocalGold.certificationDate || new Date().toISOString().split('T')[0]
            }];
            localGoldDetails.owner = walletAddress;
          } else {
            console.log("Using existing owners array:", localGoldDetails.owners);
            // Make sure owner field is consistent with latest owner in owners array
            if (localGoldDetails.owners.length > 0) {
              localGoldDetails.owner = localGoldDetails.owners[localGoldDetails.owners.length - 1].address;
            }
          }
          
          console.log("Setting matched gold details:", localGoldDetails);
          setMatchedGoldDetails(localGoldDetails);
          return;
        }
      }
      
      // No match found in either source
      setMatchedGoldDetails(null);
    }
  }, [allGoldDetails, localStorageGold, searchId, searchPerformed, walletAddress]);

  const handleTransferOwnership = async () => {
    if (!matchedGoldDetails || !newOwnerAddress || !transferDate) {
      setTransferError("All fields are required");
      return;
    }
    
    setIsTransferring(true);
    setTransferError(null);
    setTransferSuccess(null);
    
    try {
      // Get the current data from localStorage
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (isLocalhost) {
        const storedData = JSON.parse(localStorage.getItem('arweaveSimulation') || '{}');
        
        // Find the gold item to update (search by ID across all items instead of direct key access)
        const goldId = matchedGoldDetails.uniqueIdentifier;
        let storageKey = null;
        let goldToUpdate = null;
        
        // First find the correct storage key
        for (const key in storedData) {
          if (storedData[key].uniqueIdentifier === goldId) {
            storageKey = key;
            goldToUpdate = storedData[key];
            break;
          }
        }
        
        if (goldToUpdate) {
          console.log("Found gold to update:", goldToUpdate);
          console.log("Original certification date:", goldToUpdate.certificationDate);
          
          // Initialize owners array if it doesn't exist
          if (!goldToUpdate.owners) {
            goldToUpdate.owners = [];
            
            // Use the burner wallet address instead of goldToUpdate.owner
            console.log("Initializing owners array with burner wallet address:", walletAddress);
            goldToUpdate.owners.push({
              address: walletAddress || "Unknown",
              date: goldToUpdate.certificationDate || new Date().toISOString().split('T')[0]
            });
            
            // Also update the owner field to be consistent
            goldToUpdate.owner = walletAddress;
          }
          
          // Add new owner to the owners history
          goldToUpdate.owners.push({
            address: newOwnerAddress,
            date: transferDate
          });
          
          // Update the current owner
          goldToUpdate.owner = newOwnerAddress;
          
          // Update certification date to the transfer date
          goldToUpdate.certificationDate = transferDate;
          console.log("New certification date set to:", transferDate);
          
          // Save back to localStorage
          localStorage.setItem('arweaveSimulation', JSON.stringify(storedData));
          console.log("Updated localStorage with new certification date");
          
          // Force reload the data from localStorage to ensure it's freshly loaded
          try {
            const refreshedData = JSON.parse(localStorage.getItem('arweaveSimulation') || '{}');
            const refreshedGoldItems: GoldRegistrationData[] = Object.values(refreshedData);
            
            // Find the updated item to verify changes
            const updatedItem = refreshedGoldItems.find(item => item.uniqueIdentifier === goldId);
            if (updatedItem) {
              console.log("Verified updated item after storage:", updatedItem);
              console.log("Verified certification date is now:", updatedItem.certificationDate);
            }
            
            // Update local state
            setLocalStorageGold(refreshedGoldItems);
          } catch (refreshError) {
            console.error("Error refreshing data from localStorage:", refreshError);
          }
          
          // Create a fresh copy of matchedGoldDetails with the updated values
          const updatedDetails: GoldDetails = {
            ...matchedGoldDetails,
            owner: newOwnerAddress,
            certificationDate: transferDate,
            owners: goldToUpdate.owners
          };
          
          console.log("Setting updated matched gold details:", updatedDetails);
          setMatchedGoldDetails(updatedDetails);
          
          setTransferSuccess("Ownership successfully transferred!");
          setShowTransferModal(false);
          setNewOwnerAddress("");
          setTransferDate("");
          
          // Force a reload of the page to ensure all data is fresh
          setTimeout(() => {
            window.location.reload();
          }, 1500); // Delay slightly to allow the success message to be seen
          
          // Refetch contract data
          refetch();
        } else {
          console.error("Gold item not found in storage with ID:", goldId);
          setTransferError("Gold item not found in storage. ID: " + goldId);
        }
      } else {
        // In production, this would call the Arweave transaction to update ownership
        setTransferError("Ownership transfer via Arweave is not implemented in this demo");
      }
    } catch (error) {
      console.error("Error transferring ownership:", error);
      setTransferError("Error updating ownership: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsTransferring(false);
    }
  };
  
  const getCurrentOwner = () => {
    if (!matchedGoldDetails) return "Unknown";
    
    // Add debug logging
    console.log("Getting current owner from:", matchedGoldDetails);
    
    // If owners array exists and has entries, use the last one
    if (matchedGoldDetails.owners && matchedGoldDetails.owners.length > 0) {
      const currentOwner = matchedGoldDetails.owners[matchedGoldDetails.owners.length - 1].address;
      console.log("Current owner from owners array:", currentOwner);
      return currentOwner;
    }
    
    // Fallback to owner field if available
    console.log("Falling back to owner field:", matchedGoldDetails.owner);
    return matchedGoldDetails.owner || "Unknown";
  };
  
  // Initialize transferDate with today's date
  useEffect(() => {
    if (showTransferModal) {
      const today = new Date().toISOString().split('T')[0];
      setTransferDate(today);
    }
  }, [showTransferModal]);

  // Handle redirect to login for transfer
  const handleTransferClick = (goldId: string) => {
    // Save the current gold ID to session storage to retrieve after login
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('transferGoldId', goldId);
      console.log("Saving gold ID for transfer:", goldId);
      // Redirect to login with return URL parameter
      router.push(`/Login?returnUrl=${encodeURIComponent(`/Track?id=${goldId}&action=transfer`)}`);
    }
  };

  const renderGoldDetails = (details: GoldDetails) => (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-gray-100 mt-6 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-xl font-bold goldman-font">Gold Details</h3>
      </div>
      <div className="p-6">
        {details.imageDataUrl && (
          <div className="mb-6 flex justify-center">
            <div className="w-48 h-48 rounded-lg border border-gray-200 overflow-hidden">
              <img 
                src={details.imageDataUrl} 
                alt={details.description || "Gold item"} 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label className="form-label">Weight</label>
            <p className="text-gray-900">{details.weight}</p>
          </div>
          <div className="form-group">
            <label className="form-label">Purity</label>
            <p className="text-gray-900">{details.purity}</p>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <p className="text-gray-900">{details.description}</p>
          </div>
          <div className="form-group">
            <label className="form-label">Certification Details</label>
            <p className="text-gray-900">{details.certificationDetails}</p>
          </div>
          <div className="form-group">
            <label className="form-label">Certification Date</label>
            <p className="text-gray-900">{details.certificationDate}</p>
            {details.owners && details.owners.length > 1 && (
              <p className="text-xs text-gray-500 mt-1">
                (Updated to latest transfer date)
              </p>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Mine Location</label>
            <p className="text-gray-900">{details.mineLocation}</p>
          </div>
          <div className="form-group">
            <label className="form-label">Parent Gold ID</label>
            <p className="text-gray-900">{details.parentGoldId || "None"}</p>
          </div>
          <div className="form-group">
            <label className="form-label">Unique Identifier</label>
            <p className="text-gray-900 font-mono">{details.uniqueIdentifier}</p>
          </div>
          
          {/* Ownership Information */}
          <div className="form-group md:col-span-2">
            <div className="bg-amber-50 rounded-lg p-4 mt-2">
              <div className="flex justify-between items-center">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ownership Management</label>
                  {details.owners && details.owners.length > 0 && (
                    <p className="text-xs text-gray-500">
                      Last Transfer: {details.owners[details.owners.length - 1].date}
                    </p>
                  )}
                </div>
                <Button 
                  onClick={() => handleTransferClick(details.uniqueIdentifier)}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                  size="sm"
                >
                  Transfer Ownership
                </Button>
              </div>
              
              {details.owners && details.owners.length > 1 && (
                <div className="mt-4">
                  <button 
                    onClick={() => setShowOwnerHistory(!showOwnerHistory)}
                    className="text-amber-700 text-sm flex items-center gap-1"
                  >
                    {showOwnerHistory ? 'Hide' : 'Show'} Ownership History
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${showOwnerHistory ? 'rotate-180' : ''}`}>
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </button>
                  
                  {showOwnerHistory && (
                    <div className="mt-2 text-sm">
                      <ul className="space-y-2">
                        {details.owners.slice(1).map((owner, index) => (
                          <li key={index} className="flex justify-between">
                            <span className="font-mono">{owner.address}</span>
                            <span className="text-gray-500">{owner.date}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Ownership Transfer Modal
  const renderTransferModal = () => (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${showTransferModal ? 'block' : 'hidden'}`}>
      <div className="absolute inset-0 bg-black opacity-50" onClick={() => setShowTransferModal(false)}></div>
      <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-xl font-bold mb-4">Transfer Ownership</h3>
        
        {transferError && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
            {transferError}
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">New Owner Wallet Address</label>
          <input
            type="text"
            value={newOwnerAddress}
            onChange={(e) => setNewOwnerAddress(e.target.value)}
            placeholder="Wallet address"
            className="w-full p-2 border border-gray-300 rounded-md bg-white text-black"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Transfer Date</label>
          <input
            type="date"
            value={transferDate}
            onChange={(e) => setTransferDate(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md bg-white text-black"
          />
        </div>
        
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setShowTransferModal(false)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleTransferOwnership}
            disabled={isTransferring || !newOwnerAddress || !transferDate}
            className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTransferring ? (
              <span className="flex items-center gap-2">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></span>
                Processing...
              </span>
            ) : (
              "Transfer"
            )}
          </button>
        </div>
      </div>
    </div>
  );

  // Check for redirect from login with transfer action
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const action = urlParams.get("action");
      
      if (action === "transfer" && searchId) {
        // This means we're coming back from login to do a transfer
        console.log("Redirected back from login for transfer action");
        
        // Initialize the transfer date with today's date
        const today = new Date().toISOString().split('T')[0];
        setTransferDate(today);
        
        // Show the transfer modal
        setShowTransferModal(true);
        
        // Remove the action parameter from URL to prevent showing the modal again on page refresh
        // This uses the browser's History API to modify the URL without triggering a page reload
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('action');
        window.history.replaceState({}, '', newUrl.toString());
      }
    }
  }, [searchId]);

  return (
    <div className="container mx-auto pt-8 pb-20">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h1 className="text-3xl font-bold text-center goldman-font">Gold Tracking</h1>
            <p className="text-center text-gray-600 mb-4">Search for gold details using the unique identifier</p>
          </div>
          
          <div className="p-6 track-content">
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <input
                type="text"
                id="searchId"
                placeholder="Enter Gold ID"
                value={searchId}
                onChange={e => setSearchId(e.target.value)}
                className="w-full p-3 rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-400"
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />
              <Button 
                onClick={handleSearch}
                variant="default"
                size="lg"
                className="bg-[#ECBD45] text-black hover:bg-[#D9AD3C] sm:flex-shrink-0"
              >
                {isLoading ? (
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></span>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
                Search
              </Button>
            </div>

            {transferSuccess && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md">
                {transferSuccess}
              </div>
            )}

            {isLoading && (
              <div className="text-center p-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#ECBD45] border-r-transparent align-[-0.125em]"></div>
                <p className="mt-2 text-gray-600">Loading...</p>
              </div>
            )}

            {error && (
              <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">Error loading data. Please try again.</p>
              </div>
            )}
          </div>
        </div>
        
        {searchPerformed && !isLoading && !error && (
          <div>
            {matchedGoldDetails ? (
              renderGoldDetails(matchedGoldDetails)
            ) : (
              <div className="text-center p-6 bg-yellow-50 border border-yellow-200 rounded-lg mt-6">
                <p className="text-yellow-700">No gold found with this ID. Please try another identifier.</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Render the ownership transfer modal */}
      {renderTransferModal()}
    </div>
  );
};

export default GoldSearch;
