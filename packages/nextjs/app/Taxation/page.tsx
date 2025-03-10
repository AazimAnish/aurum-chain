"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from 'next/navigation';
import { Button } from "../../~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../~/components/ui/card";
import { Input } from "../../~/components/ui/input";
import { Label } from "../../~/components/ui/label";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { getGoldPrice, calculateGoldValue } from "../../constants/goldPrices";
import { getUserGoldHoldings, GoldRegistrationData } from "~~/services/arweave";

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

  const { data: allGoldDetails, isLoading, error, refetch } = useScaffoldReadContract({
    contractName: "GoldLedger",
    functionName: "getAllGoldDetails",
  });

  useEffect(() => {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocalhost) {
      try {
        const storedData = JSON.parse(localStorage.getItem('arweaveSimulation') || '{}');
        const goldItems: GoldRegistrationData[] = Object.values(storedData);
        setLocalStorageGold(goldItems);
      } catch (error) {
        console.error("Error loading simulated gold data:", error);
      }
    }
  }, []);

  useEffect(() => {
    const idFromUrl = searchParams.get('id');
    if (idFromUrl) {
      setHallmarkId(idFromUrl);
      setSearchPerformed(true);
    }
  }, [searchParams]);

  const calculateHoldingPeriod = (certificationDate: string) => {
    const certDate = new Date(certificationDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - certDate.getTime());
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    return diffMonths;
  };

  const calculateTax = (details: GoldDetails) => {
    const holdingPeriod = calculateHoldingPeriod(details.certificationDate);
    const weight = parseFloat(details.weight);
    
    // Get purchase price from certification date
    const purchaseDate = details.certificationDate.substring(0, 7); // YYYY-MM
    const currentDate = new Date().toISOString().substring(0, 7); // Current YYYY-MM
    
    const purchasePriceData = getGoldPrice(purchaseDate);
    const currentPriceData = getGoldPrice(currentDate);
    
    if (!purchasePriceData || !currentPriceData) {
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
  };

  useEffect(() => {
    if (searchPerformed && hallmarkId !== "") {
      refetch();
    }
  }, [searchPerformed, hallmarkId, refetch]);

  useEffect(() => {
    if (searchPerformed && hallmarkId) {
      if (allGoldDetails) {
        const matchedDetails = (allGoldDetails as unknown as GoldDetails[]).find(
          details => details.uniqueIdentifier === hallmarkId
        );
        
        if (matchedDetails) {
          setGoldDetails(matchedDetails);
          const taxCalculation = calculateTax(matchedDetails);
          setTaxInfo(taxCalculation);
          return;
        }
      }
      
      if (localStorageGold.length > 0) {
        const matchedLocalGold = localStorageGold.find(gold => 
          (typeof gold.uniqueIdentifier === 'string' && gold.uniqueIdentifier === hallmarkId) || 
          (typeof gold.uniqueIdentifier === 'string' && 
           gold.uniqueIdentifier.toLowerCase() === hallmarkId.toLowerCase())
        );
        
        if (matchedLocalGold) {
          const localGoldDetails: GoldDetails = {
            uniqueIdentifier: matchedLocalGold.uniqueIdentifier,
            weight: matchedLocalGold.weight,
            purity: matchedLocalGold.purity,
            description: matchedLocalGold.description,
            certificationDetails: matchedLocalGold.certificationDetails,
            certificationDate: matchedLocalGold.certificationDate,
            mineLocation: matchedLocalGold.mineLocation,
            parentGoldId: matchedLocalGold.parentGoldId || "",
            hasParentGoldId: !!matchedLocalGold.parentGoldId,
          };
          
          setGoldDetails(localGoldDetails);
          const taxCalculation = calculateTax(localGoldDetails);
          setTaxInfo(taxCalculation);
          return;
        }
      }
      
      setGoldDetails(null);
      setTaxInfo(null);
    }
  }, [allGoldDetails, localStorageGold, hallmarkId, searchPerformed]);

  const handleSearch = () => {
    if (hallmarkId) {
      setSearchPerformed(true);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6 pb-4 border-b border-gray-100">
            <h1 className="text-3xl font-bold text-center goldman-font text-gray-900">Gold Tax Calculator</h1>
            <p className="text-center text-gray-600 mt-2">Enter your Gold Hallmark ID to calculate applicable taxes</p>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Input
                placeholder="Enter Hallmark ID"
                value={hallmarkId}
                onChange={e => setHallmarkId(e.target.value)}
                className="w-full p-3 rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-400"
              />
              <Button 
                onClick={handleSearch}
                variant="default"
                size="lg" 
                className="bg-[#ECBD45] text-black hover:bg-[#D9AD3C] sm:flex-shrink-0"
              >
                Calculate
              </Button>
            </div>

            {isLoading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700"></div>
                <p className="mt-2 text-gray-600">Loading...</p>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg text-center">
                Error: {error.message}
              </div>
            )}

            {goldDetails && taxInfo && (
              <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-gray-100 overflow-hidden mt-6">
                <div className="p-6 pb-4 border-b border-gray-100">
                  <h2 className="text-xl font-bold goldman-font text-gray-900">Tax Information</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Value</label>
                      <p className="text-gray-900">₹{taxInfo.purchaseValue.toFixed(2)}</p>
                    </div>
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Value</label>
                      <p className="text-gray-900">₹{taxInfo.currentValue.toFixed(2)}</p>
                    </div>
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Capital Gains</label>
                      <p className="text-gray-900">₹{taxInfo.capitalGains.toFixed(2)}</p>
                    </div>
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Tax Amount</label>
                      <p className="text-gray-900">₹{taxInfo.taxAmount.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-100">
                    <p className="text-amber-800 font-medium">
                      Note: For accurate tax calculations, please consult with a tax advisor and provide:
                    </p>
                    <ul className="list-disc ml-6 mt-2 text-amber-700">
                      <li>Purchase value of gold</li>
                      <li>Current market value</li>
                      <li>Your income slab (for STCG)</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {searchPerformed && !isLoading && !error && !goldDetails && (
              <div className="text-center p-6 bg-yellow-50 border border-yellow-200 rounded-lg mt-6">
                <p className="text-yellow-700">No gold details found for the given Hallmark ID.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxationPage;