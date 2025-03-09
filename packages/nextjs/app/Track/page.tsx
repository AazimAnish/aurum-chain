"use client";

import { useEffect, useState } from "react";
import { Button } from "~~/~/components/ui/button";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { GoldRegistrationData } from "~~/services/arweave";

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
}

const GoldSearch = () => {
  const [searchId, setSearchId] = useState<string>("");
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [matchedGoldDetails, setMatchedGoldDetails] = useState<GoldDetails | null>(null);
  const [localStorageGold, setLocalStorageGold] = useState<GoldRegistrationData[]>([]);

  const {
    data: allGoldDetails,
    isLoading,
    error,
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
      setSearchId(idFromUrl);
      setSearchPerformed(true);
    }
  }, []);

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
          };
          
          setMatchedGoldDetails(localGoldDetails);
          return;
        }
      }
      
      // No match found in either source
      setMatchedGoldDetails(null);
    }
  }, [allGoldDetails, localStorageGold, searchId, searchPerformed]);

  const handleSearch = () => {
    if (searchId) {
      setSearchPerformed(true);
    }
  };

  const renderGoldDetails = (details: GoldDetails) => (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-gray-100 mt-6 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-xl font-bold goldman-font">Gold Details</h3>
      </div>
      <div className="p-6">
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
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto pt-8 pb-20">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h1 className="text-3xl font-bold text-center goldman-font">Gold Tracking</h1>
            <p className="text-center text-gray-600 mb-4">Search for gold details using the unique identifier</p>
          </div>
          
          <div className="p-6">
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
                Search
              </Button>
            </div>

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
    </div>
  );
};

export default GoldSearch;
