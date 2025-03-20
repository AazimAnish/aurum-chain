"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from 'next/navigation';
import { Button } from "../../~/components/ui/button";
import { Input } from "../../~/components/ui/input";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { getGoldPrice, calculateGoldValue } from "../../constants/goldPrices";
import { getUserGoldHoldings, GoldRegistrationData } from "~~/services/arweave";
import { useArweave } from "~~/contexts/ArweaveContext";

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
}

interface TaxCalculation {
  holdingPeriod: number;
  taxType: string;
  taxRate: number;
  taxAmount: number;
  purchaseValue: number;
  currentValue: number;
  capitalGains: number;
  details: string;
}

const TaxationPage = () => {
  const searchParams = useSearchParams();
  const [hallmarkId, setHallmarkId] = useState<string>("");
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [goldDetails, setGoldDetails] = useState<GoldDetails | null>(null);
  const [taxInfo, setTaxInfo] = useState<TaxCalculation | null>(null);
  const [localStorageGold, setLocalStorageGold] = useState<GoldRegistrationData[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const { wallet, walletAddress, reconnectWallet } = useArweave();

  const { 
    data: allGoldDetails, 
    isLoading, 
    error: contractError, 
    refetch 
  } = useScaffoldReadContract({
    contractName: "GoldLedger",
    functionName: "getAllGoldDetails",
  });

  // Fetch gold data from localStorage for development
  useEffect(() => {
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

  // Handle ID from URL - only run once on initial load
  useEffect(() => {
    const idFromUrl = searchParams.get('id');
    if (idFromUrl) {
      console.log("Found ID in URL parameters:", idFromUrl);
      setHallmarkId(idFromUrl);
      // Delay slightly to ensure state is updated
      setTimeout(() => {
        handleSearch(idFromUrl);
      }, 100);
    }
  }, []); // Empty dependency array - only run once on mount

  // Safe date parsing function
  const parseDate = (dateString: string): Date | null => {
    try {
      // Try to parse YYYY-MM-DD format
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
          // Check if date is reasonable (not too far in the past or future)
          const currentYear = new Date().getFullYear();
          if (date.getFullYear() < 2000 || date.getFullYear() > currentYear + 1) {
            console.warn(`Date ${dateString} has unreasonable year ${date.getFullYear()}, using current date as fallback`);
            return new Date(); // Return current date as fallback
          }
          return date;
        }
      }
      
      // Try to parse other formats
      const timestamp = Date.parse(dateString);
      if (!isNaN(timestamp)) {
        const date = new Date(timestamp);
        // Check if date is reasonable (not too far in the past or future)
        const currentYear = new Date().getFullYear();
        if (date.getFullYear() < 2000 || date.getFullYear() > currentYear + 1) {
          console.warn(`Date ${dateString} has unreasonable year ${date.getFullYear()}, using current date as fallback`);
          return new Date(); // Return current date as fallback
        }
        return date;
      }
      
      console.warn(`Could not parse date: ${dateString}, using current date as fallback`);
      return new Date(); // Return current date as fallback if parsing fails
    } catch (e) {
      console.error("Error parsing date:", e);
      return new Date(); // Return current date as fallback
    }
  };

  const calculateHoldingPeriod = useCallback((certificationDate: string): number => {
    const certDate = parseDate(certificationDate);
    if (!certDate) {
      console.error("Invalid certification date:", certificationDate);
      return 0;
    }
    
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - certDate.getTime());
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    return diffMonths;
  }, []);

  const getCurrentMonth = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  };

  const calculateTax = useCallback((details: GoldDetails): TaxCalculation | null => {
    try {
      // Clear any previous info message
      setInfoMessage(null);
      
      // Validate the certification date
      if (!details.certificationDate) {
        console.error("Missing certification date");
        setErrorMessage("Unable to calculate tax: Missing certification date");
        return null;
      }
      
      const holdingPeriod = calculateHoldingPeriod(details.certificationDate);
      
      // Parse weight safely
      const weight = parseFloat(details.weight);
      if (isNaN(weight) || weight <= 0) {
        console.error("Invalid weight:", details.weight);
        setErrorMessage("Unable to calculate tax: Invalid weight");
        return null;
      }
      
      // Extract purchase date from certification date (YYYY-MM)
      let purchaseDate: string;
      const originalCertDate = details.certificationDate;
      const certDate = parseDate(details.certificationDate);
      
      // Check if date was adjusted
      const wasDateAdjusted = certDate && 
        (certDate.getFullYear().toString() !== originalCertDate.substring(0, 4) || 
         (certDate.getMonth() + 1).toString().padStart(2, '0') !== originalCertDate.substring(5, 7));
      
      if (certDate) {
        const year = certDate.getFullYear();
        const month = (certDate.getMonth() + 1).toString().padStart(2, '0');
        purchaseDate = `${year}-${month}`;
        
        if (wasDateAdjusted) {
          setInfoMessage(`Note: The certification date was adjusted from ${originalCertDate} to ${purchaseDate} for tax calculation purposes.`);
        }
      } else {
        // Use current date if parsing fails
        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        purchaseDate = `${year}-${month}`;
        setInfoMessage(`Note: Using current date (${purchaseDate}) for calculation as the certification date "${details.certificationDate}" is invalid.`);
        console.warn(`Using current date (${purchaseDate}) as fallback for invalid certification date: ${details.certificationDate}`);
      }
      
      // Get current date
      const currentDate = getCurrentMonth();
      
      console.log("Calculating tax with dates:", { purchaseDate, currentDate });
      
      let purchasePriceData = getGoldPrice(purchaseDate);
      let usedFallbackPrice = false;
      
      // If no price data for the given date, try to use a more recent date
      if (!purchasePriceData) {
        console.warn(`No price data for ${purchaseDate}, trying to find the earliest available price data`);
        // Here we could implement logic to find the earliest available price data
        // For now, we'll use current date as fallback
        purchaseDate = currentDate;
        purchasePriceData = getGoldPrice(currentDate);
        usedFallbackPrice = true;
        if (purchasePriceData) {
          const infoText = `Note: No price data available for the purchase date. Using current price for both purchase and sale value.`;
          setInfoMessage(infoText);
          console.log(`Using current date (${currentDate}) price data as fallback`);
        }
      }
      
      const currentPriceData = getGoldPrice(currentDate);
      
      // Validate price data
      if (!purchasePriceData) {
        console.error("Missing purchase price data for date:", purchaseDate);
        setErrorMessage(`No price data available for purchase date: ${purchaseDate}. Please contact support.`);
        return null;
      }
      
      if (!currentPriceData) {
        console.error("Missing current price data for date:", currentDate);
        setErrorMessage(`No price data available for current date: ${currentDate}. Please contact support.`);
        return null;
      }

      const purchaseValue = calculateGoldValue(weight, purchasePriceData.purchasePrice);
      const currentValue = calculateGoldValue(weight, currentPriceData.marketPrice);
      const capitalGains = currentValue - purchaseValue;

      if (holdingPeriod >= 36) {
        // Long-term Capital Gains Tax (LTCG)
        const taxAmount = capitalGains * 0.208; // 20.8%
        return {
          holdingPeriod,
          taxType: "Long-term Capital Gains Tax (LTCG)",
          taxRate: 20.8,
          taxAmount,
          purchaseValue,
          currentValue,
          capitalGains,
          details: "20.8% tax rate applies (including inflation indexation)"
        };
      } else {
        // For STCG, we'll show the maximum rate scenario
        const taxAmount = capitalGains * 0.30; // Maximum tax slab rate
        return {
          holdingPeriod,
          taxType: "Short-term Capital Gains Tax (STCG)",
          taxRate: 30,
          taxAmount,
          purchaseValue,
          currentValue,
          capitalGains,
          details: "Tax rate depends on your income slab (showing maximum rate of 30%)"
        };
      }
    } catch (error) {
      console.error("Error calculating tax:", error);
      setErrorMessage("An error occurred while calculating taxes. Please try again.");
      return null;
    }
  }, [calculateHoldingPeriod]);

  const findGoldFromBlockchain = useCallback((id: string) => {
    if (!allGoldDetails || !Array.isArray(allGoldDetails)) {
      console.error("Invalid gold details from blockchain:", allGoldDetails);
      return null;
    }
    
    try {
      return (allGoldDetails as any[]).find(
        details => details.uniqueIdentifier === id
      );
    } catch (error) {
      console.error("Error finding gold in blockchain data:", error);
      return null;
    }
  }, [allGoldDetails]);

  const findGoldFromLocalStorage = useCallback((id: string) => {
    if (!localStorageGold || localStorageGold.length === 0) {
      return null;
    }
    
    try {
      return localStorageGold.find(gold => 
        (typeof gold.uniqueIdentifier === 'string' && gold.uniqueIdentifier === id) || 
        (typeof gold.uniqueIdentifier === 'string' && 
         gold.uniqueIdentifier.toLowerCase() === id.toLowerCase())
      );
    } catch (error) {
      console.error("Error finding gold in local storage:", error);
      return null;
    }
  }, [localStorageGold]);

  const handleSearch = useCallback(async (searchId = hallmarkId) => {
    if (!searchId) return;
    
    // Clear old error message and set calculating state
    setErrorMessage(null);
    setIsCalculating(true);
    setSearchPerformed(true);
    console.log("Starting tax calculation for ID:", searchId);
    
    try {
      // Try to reconnect wallet if needed
      if (wallet && !walletAddress) {
        console.log("Wallet exists but not connected, attempting to reconnect...");
        await reconnectWallet();
      }
      
      // First try to refetch data from blockchain
      await refetch();
      console.log("Blockchain data fetched, looking for gold ID");
      
      // Look for gold in blockchain data
      const blockchainGold = findGoldFromBlockchain(searchId);
      if (blockchainGold) {
        console.log("Found gold in blockchain data:", blockchainGold);
        setGoldDetails(blockchainGold);
        const taxCalculation = calculateTax(blockchainGold);
        setTaxInfo(taxCalculation);
        setIsCalculating(false);
        return;
      }
      
      // If not found in blockchain, look in localStorage
      console.log("Gold not found in blockchain, checking localStorage");
      const localGold = findGoldFromLocalStorage(searchId);
      if (localGold) {
        console.log("Found gold in local storage:", localGold);
        const localGoldDetails: GoldDetails = {
          uniqueIdentifier: localGold.uniqueIdentifier,
          weight: localGold.weight,
          purity: localGold.purity,
          description: localGold.description,
          certificationDetails: localGold.certificationDetails,
          certificationDate: localGold.certificationDate,
          mineLocation: localGold.mineLocation,
          parentGoldId: localGold.parentGoldId || "",
          hasParentGoldId: !!localGold.parentGoldId,
          imageDataUrl: localGold.imageDataUrl,
        };
        
        setGoldDetails(localGoldDetails);
        const taxCalculation = calculateTax(localGoldDetails);
        setTaxInfo(taxCalculation);
        setIsCalculating(false);
        return;
      }
      
      // If gold not found in either source
      console.log("Gold not found with ID:", searchId);
      setGoldDetails(null);
      setTaxInfo(null);
      setErrorMessage(`No gold found with ID: ${searchId}`);
    } catch (error) {
      console.error("Error searching for gold:", error);
      setErrorMessage("An error occurred while searching for gold. Please try again.");
    } finally {
      setIsCalculating(false);
    }
  }, [hallmarkId, refetch, findGoldFromBlockchain, findGoldFromLocalStorage, calculateTax, wallet, walletAddress, reconnectWallet]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Add a direct button click handler to ensure the Calculate button works
  const handleCalculateButtonClick = () => {
    console.log("Calculate button clicked for ID:", hallmarkId);
    handleSearch(hallmarkId);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6 pb-4 border-b border-gray-100">
            <h1 className="text-3xl font-bold text-center goldman-font text-gray-900">Gold Tax Calculator</h1>
            <p className="text-center text-gray-600 mt-2">Enter your Gold Hallmark ID to calculate applicable taxes</p>
          </div>
          
          <div className="p-6 tax-content">
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Input
                placeholder="Enter Hallmark ID"
                value={hallmarkId}
                onChange={e => setHallmarkId(e.target.value)}
                className="w-full p-3 rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-400"
                disabled={isCalculating}
              />
              <Button 
                onClick={handleCalculateButtonClick}
                variant="default"
                size="lg" 
                className="bg-[#ECBD45] text-black hover:bg-[#D9AD3C] sm:flex-shrink-0"
                disabled={isCalculating || !hallmarkId}
              >
                {isCalculating ? (
                  <>
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></span>
                    Calculating...
                  </>
                ) : (
                  "Calculate"
                )}
              </Button>
            </div>

            {(isLoading || isCalculating) && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700"></div>
                <p className="mt-2 text-gray-600">Loading...</p>
              </div>
            )}
            
            {(contractError || errorMessage) && !goldDetails && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg text-center">
                <p>{errorMessage || (contractError && contractError.message) || "An error occurred. Please try again."}</p>
                <Button
                  onClick={handleCalculateButtonClick}
                  variant="outline"
                  size="sm"
                  className="mt-3 border-red-200 text-red-700 hover:bg-red-100"
                >
                  Try Again
                </Button>
              </div>
            )}
            
            {/* Information message */}
            {infoMessage && (
              <div className="bg-blue-50 text-blue-700 p-4 rounded-lg text-center mt-3 mb-3">
                <p>{infoMessage}</p>
              </div>
            )}

            {goldDetails && taxInfo && (
              <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-gray-100 overflow-hidden mt-6">
                <div className="p-6 pb-4 border-b border-gray-100">
                  <h2 className="text-xl font-bold goldman-font text-gray-900">Tax Information</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gold Details</label>
                      <p className="text-gray-900">Weight: {goldDetails.weight}</p>
                      <p className="text-gray-900">Certification Date: {goldDetails.certificationDate}</p>
                    </div>
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Holding Period</label>
                      <p className="text-gray-900">{taxInfo.holdingPeriod} months</p>
                    </div>
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tax Type</label>
                      <p className="text-gray-900">{taxInfo.taxType}</p>
                    </div>
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tax Details</label>
                      <p className="text-gray-900">{taxInfo.details}</p>
                    </div>
                  </div>
                  
                  <div className="bg-amber-50 rounded-lg p-4 my-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Value</label>
                        <p className="text-gray-900 font-semibold">{formatCurrency(taxInfo.purchaseValue)}</p>
                      </div>
                      <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Value</label>
                        <p className="text-gray-900 font-semibold">{formatCurrency(taxInfo.currentValue)}</p>
                      </div>
                      <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Capital Gains</label>
                        <p className="text-gray-900 font-semibold">{formatCurrency(taxInfo.capitalGains)}</p>
                      </div>
                      <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tax Amount</label>
                        <p className="text-gray-900 font-bold text-xl">{formatCurrency(taxInfo.taxAmount)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center mt-6">
                    <p className="text-sm text-gray-500">
                      Disclaimer: This is an estimated tax calculation. Actual tax liability may vary based on your individual circumstances and applicable tax laws.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {searchPerformed && !isLoading && !isCalculating && !goldDetails && !errorMessage && (
              <div className="text-center p-6 bg-yellow-50 border border-yellow-200 rounded-lg mt-6">
                <p className="text-yellow-700">No gold found with this ID. Please verify the ID and try again.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxationPage;